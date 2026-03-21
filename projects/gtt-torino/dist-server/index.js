import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { unzipSync, strFromU8 } from 'fflate';
import { parse } from 'csv-parse/sync';
import protobuf from 'protobufjs';
const PORT = Number(process.env.PORT ?? 3210);
const TRIP_UPDATE_FEED_URL = 'https://percorsieorari.gtt.to.it/das_gtfsrt/trip_update.aspx';
const VEHICLE_POSITION_FEED_URL = 'https://percorsieorari.gtt.to.it/das_gtfsrt/vehicle_position.aspx';
const STATIC_GTFS_URL = 'https://www.gtt.to.it/open_data/gtt_gtfs.zip';
const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
const REALTIME_CACHE_TTL_MS = 10_000;
const STATIC_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const GEOCODE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const UPCOMING_WINDOW_MS = 2 * 60 * 60 * 1000;
const PAST_GRACE_MS = 2 * 60 * 1000;
const DEFAULT_NEARBY_RADIUS_METERS = 700;
const DEFAULT_NEARBY_LIMIT = 12;
const RELATED_STOP_RADIUS_METERS = 400;
const RELATED_STOP_LIMIT = 6;
const TORINO_VIEWBOX = '7.52,45.16,7.83,44.97';
const TORINO_QUERY_SUFFIX = 'Torino, Piemonte, Italia';
const SUPPORTED_SURFACE_MODES = new Set([
    'bus',
    'trolleybus',
    'tram',
    'metro',
    'rail',
]);
const MODE_SORT_ORDER = {
    tram: 0,
    bus: 1,
    trolleybus: 2,
    metro: 3,
    rail: 4,
    other: 5,
};
const serverDir = path.dirname(fileURLToPath(import.meta.url));
const staticDistDir = path.resolve(serverDir, '../dist');
const staticCache = {
    data: {
        routesById: new Map(),
        tripsById: new Map(),
        stopsById: new Map(),
        stopsByCode: new Map(),
        shapesById: new Map(),
        tripStopPointsByTripId: new Map(),
        stopSchedulesByStopId: new Map(),
        calendarsByServiceId: new Map(),
        calendarDateExceptionsByServiceId: new Map(),
    },
    expiresAt: 0,
    promise: null,
};
const staticRoutesTripsCache = {
    data: {
        routesById: new Map(),
        tripsById: new Map(),
    },
    expiresAt: 0,
    promise: null,
};
const realtimeCache = {
    data: null,
    expiresAt: 0,
    promise: null,
};
const vehiclePositionCache = {
    data: null,
    expiresAt: 0,
    promise: null,
};
const geocodeCache = new Map();
let feedMessageTypePromise = null;
function normalizeColor(value) {
    if (!value || value.trim().length === 0) {
        return null;
    }
    return `#${value.trim().replace(/^#/, '')}`;
}
function toIsoString(value) {
    const numeric = typeof value === 'string' ? Number.parseInt(value, 10) : value ?? null;
    if (!numeric || Number.isNaN(numeric)) {
        return null;
    }
    return new Date(numeric * 1000).toISOString();
}
function resolveRouteMode(routeTypeRaw) {
    switch (routeTypeRaw) {
        case '0':
            return { mode: 'tram', label: 'Tram' };
        case '1':
            return { mode: 'metro', label: 'Metro' };
        case '2':
            return { mode: 'rail', label: 'Treno' };
        case '3':
            return { mode: 'bus', label: 'Bus' };
        case '11':
            return { mode: 'trolleybus', label: 'Filobus' };
        default:
            return { mode: 'other', label: 'Servizio' };
    }
}
function compareLineCodes(left, right) {
    return left.localeCompare(right, 'it', {
        numeric: true,
        sensitivity: 'base',
    });
}
function buildStopServiceKey(lineCode, mode) {
    return `${mode}:${lineCode}`;
}
function compareStopServices(left, right) {
    const modeOrderDifference = MODE_SORT_ORDER[left.mode] - MODE_SORT_ORDER[right.mode];
    if (modeOrderDifference !== 0) {
        return modeOrderDifference;
    }
    return compareLineCodes(left.lineCode, right.lineCode);
}
function buildLineCatalog(staticData) {
    const linesByKey = new Map();
    for (const routeRecord of staticData.routesById.values()) {
        const { mode, label } = resolveRouteMode(routeRecord.routeTypeRaw);
        if (!SUPPORTED_SURFACE_MODES.has(mode)) {
            continue;
        }
        const lineCode = routeRecord.routeShortName.trim();
        if (!lineCode) {
            continue;
        }
        const catalogKey = buildStopServiceKey(lineCode, mode);
        if (linesByKey.has(catalogKey)) {
            continue;
        }
        linesByKey.set(catalogKey, {
            lineCode,
            mode,
            modeLabel: label,
            routeColor: routeRecord.routeColor,
            routeTextColor: routeRecord.routeTextColor,
        });
    }
    return Array.from(linesByKey.values()).sort((left, right) => {
        const modeOrderDifference = MODE_SORT_ORDER[left.mode] - MODE_SORT_ORDER[right.mode];
        if (modeOrderDifference !== 0) {
            return modeOrderDifference;
        }
        return compareLineCodes(left.lineCode, right.lineCode);
    });
}
function metersBetween(latitudeA, longitudeA, latitudeB, longitudeB) {
    const earthRadiusMeters = 6_371_000;
    const latitudeDelta = ((latitudeB - latitudeA) * Math.PI) / 180;
    const longitudeDelta = ((longitudeB - longitudeA) * Math.PI) / 180;
    const latitudeARadians = (latitudeA * Math.PI) / 180;
    const latitudeBRadians = (latitudeB * Math.PI) / 180;
    const haversine = Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(latitudeARadians) *
            Math.cos(latitudeBRadians) *
            Math.sin(longitudeDelta / 2) ** 2;
    return Math.round(2 * earthRadiusMeters * Math.asin(Math.sqrt(haversine)));
}
function parseGtfsDateTime(serviceDate, gtfsTime) {
    if (!serviceDate || !gtfsTime) {
        return null;
    }
    const dateMatch = /^(\d{4})(\d{2})(\d{2})$/.exec(serviceDate);
    const timeMatch = /^(\d{1,2}):(\d{2}):(\d{2})$/.exec(gtfsTime);
    if (!dateMatch || !timeMatch) {
        return null;
    }
    const year = Number.parseInt(dateMatch[1], 10);
    const monthIndex = Number.parseInt(dateMatch[2], 10) - 1;
    const day = Number.parseInt(dateMatch[3], 10);
    const rawHours = Number.parseInt(timeMatch[1], 10);
    const minutes = Number.parseInt(timeMatch[2], 10);
    const seconds = Number.parseInt(timeMatch[3], 10);
    const dayOffset = Math.floor(rawHours / 24);
    const hours = rawHours % 24;
    return new Date(year, monthIndex, day + dayOffset, hours, minutes, seconds).toISOString();
}
function formatLocalServiceDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}
function getCandidateServiceDates(nowMs) {
    return [-1, 0, 1].map((offsetDays) => {
        const candidateDate = new Date(nowMs);
        candidateDate.setDate(candidateDate.getDate() + offsetDays);
        return formatLocalServiceDate(candidateDate);
    });
}
function getWeekdayIndexFromServiceDate(serviceDate) {
    const dateMatch = /^(\d{4})(\d{2})(\d{2})$/.exec(serviceDate);
    if (!dateMatch) {
        return null;
    }
    const year = Number.parseInt(dateMatch[1], 10);
    const monthIndex = Number.parseInt(dateMatch[2], 10) - 1;
    const day = Number.parseInt(dateMatch[3], 10);
    const jsDay = new Date(year, monthIndex, day).getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
}
function isServiceActiveOnDate(serviceId, serviceDate, staticData) {
    const exceptions = staticData.calendarDateExceptionsByServiceId.get(serviceId);
    const exception = exceptions?.get(serviceDate);
    if (typeof exception === 'boolean') {
        return exception;
    }
    const calendarRecord = staticData.calendarsByServiceId.get(serviceId);
    if (!calendarRecord) {
        return false;
    }
    if (serviceDate < calendarRecord.startDate ||
        serviceDate > calendarRecord.endDate) {
        return false;
    }
    const weekdayIndex = getWeekdayIndexFromServiceDate(serviceDate);
    return weekdayIndex === null ? false : calendarRecord.weekdays[weekdayIndex] ?? false;
}
function normalizeAddressQuery(query) {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
        return '';
    }
    const lowerCaseQuery = trimmedQuery.toLowerCase();
    if (lowerCaseQuery.includes('torino') ||
        lowerCaseQuery.includes('turin') ||
        lowerCaseQuery.includes('piemonte')) {
        return trimmedQuery;
    }
    return `${trimmedQuery}, ${TORINO_QUERY_SUFFIX}`;
}
async function geocodeAddress(query) {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
        throw new Error('address is required.');
    }
    const cacheKey = trimmedQuery.toLowerCase();
    const cachedEntry = geocodeCache.get(cacheKey);
    if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
        return cachedEntry.result;
    }
    const requestUrl = new URL(NOMINATIM_SEARCH_URL);
    requestUrl.searchParams.set('q', normalizeAddressQuery(trimmedQuery));
    requestUrl.searchParams.set('format', 'jsonv2');
    requestUrl.searchParams.set('limit', '1');
    requestUrl.searchParams.set('countrycodes', 'it');
    requestUrl.searchParams.set('viewbox', TORINO_VIEWBOX);
    requestUrl.searchParams.set('bounded', '1');
    const response = await fetch(requestUrl, {
        signal: AbortSignal.timeout(10_000),
        headers: {
            'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
            'User-Agent': 'gtt-torino-local/1.0 (Codex local app)',
        },
    });
    if (!response.ok) {
        throw new Error(`Geocoding request failed with ${response.status}`);
    }
    const results = (await response.json());
    const firstResult = results[0];
    if (!firstResult?.display_name || !firstResult.lat || !firstResult.lon) {
        throw new Error('Indirizzo non trovato nell’area di Torino.');
    }
    const latitude = Number.parseFloat(firstResult.lat);
    const longitude = Number.parseFloat(firstResult.lon);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        throw new Error('Coordinate indirizzo non valide.');
    }
    const result = {
        query: trimmedQuery,
        displayName: firstResult.display_name,
        latitude,
        longitude,
    };
    geocodeCache.set(cacheKey, {
        expiresAt: Date.now() + GEOCODE_CACHE_TTL_MS,
        result,
    });
    return result;
}
function stopToApiRecord(stop, distanceMeters) {
    return {
        stopId: stop.stopId,
        stopCode: stop.stopCode,
        stopName: stop.stopName,
        stopDescription: stop.stopDescription,
        latitude: stop.latitude,
        longitude: stop.longitude,
        url: stop.url,
        wheelchairBoarding: stop.wheelchairBoarding,
        modes: Array.from(stop.modes).sort(),
        lines: Array.from(stop.lines).sort(compareLineCodes),
        services: Array.from(stop.services.values()).sort(compareStopServices),
        ...(typeof distanceMeters === 'number' ? { distanceMeters } : {}),
    };
}
function normalizePathPoints(points) {
    const normalized = [];
    for (const point of [...points].sort((left, right) => left.sequence - right.sequence)) {
        if (!Number.isFinite(point.latitude) || !Number.isFinite(point.longitude)) {
            continue;
        }
        const lastPoint = normalized.at(-1);
        if (lastPoint &&
            lastPoint.latitude === point.latitude &&
            lastPoint.longitude === point.longitude) {
            continue;
        }
        normalized.push({
            latitude: point.latitude,
            longitude: point.longitude,
        });
    }
    return normalized;
}
function buildFallbackPathKey(routeId, directionId, headsign, points) {
    const firstPoint = points[0];
    const lastPoint = points.at(-1);
    return [
        routeId,
        directionId ?? 'na',
        headsign ?? 'na',
        points.length,
        firstPoint ? `${firstPoint.latitude.toFixed(5)}:${firstPoint.longitude.toFixed(5)}` : 'none',
        lastPoint ? `${lastPoint.latitude.toFixed(5)}:${lastPoint.longitude.toFixed(5)}` : 'none',
    ].join('|');
}
function getLinePathPointsForTrip(tripRecord, staticData) {
    if (tripRecord.shapeId) {
        const shapePoints = staticData.shapesById.get(tripRecord.shapeId);
        if (shapePoints && shapePoints.length >= 2) {
            return normalizePathPoints(shapePoints);
        }
    }
    const stopPoints = staticData.tripStopPointsByTripId?.get(tripRecord.tripId);
    if (stopPoints && stopPoints.length >= 2) {
        return normalizePathPoints(stopPoints);
    }
    return [];
}
function buildLinePaths(normalizedLine, staticData) {
    const pathsByKey = new Map();
    for (const tripRecord of staticData.tripsById.values()) {
        const routeRecord = staticData.routesById.get(tripRecord.routeId);
        if (!routeRecord) {
            continue;
        }
        const { mode, label } = resolveRouteMode(routeRecord.routeTypeRaw);
        if (!SUPPORTED_SURFACE_MODES.has(mode)) {
            continue;
        }
        if (routeRecord.routeShortName.toUpperCase() !== normalizedLine) {
            continue;
        }
        const points = getLinePathPointsForTrip(tripRecord, staticData);
        if (points.length < 2) {
            continue;
        }
        const pathKey = tripRecord.shapeId
            ? `shape:${tripRecord.shapeId}`
            : buildFallbackPathKey(routeRecord.routeId, tripRecord.directionId, tripRecord.headsign, points);
        const candidatePath = {
            pathId: pathKey,
            lineCode: routeRecord.routeShortName,
            headsign: tripRecord.headsign,
            directionId: tripRecord.directionId,
            mode,
            modeLabel: label,
            routeColor: routeRecord.routeColor,
            routeTextColor: routeRecord.routeTextColor,
            points,
        };
        const currentPath = pathsByKey.get(pathKey);
        if (!currentPath || candidatePath.points.length > currentPath.points.length) {
            pathsByKey.set(pathKey, candidatePath);
        }
    }
    return Array.from(pathsByKey.values())
        .sort((left, right) => {
        const directionDifference = (left.directionId ?? 9) - (right.directionId ?? 9);
        if (directionDifference !== 0) {
            return directionDifference;
        }
        const headsignComparison = (left.headsign ?? '').localeCompare(right.headsign ?? '', 'it');
        if (headsignComparison !== 0) {
            return headsignComparison;
        }
        return right.points.length - left.points.length;
    })
        .slice(0, 8);
}
function getRelatedStops(stop, staticData) {
    return Array.from(staticData.stopsById.values())
        .filter((candidate) => candidate.stopId !== stop.stopId &&
        candidate.stopName === stop.stopName &&
        candidate.services.size > 0)
        .map((candidate) => ({
        stop: candidate,
        distanceMeters: metersBetween(stop.latitude, stop.longitude, candidate.latitude, candidate.longitude),
    }))
        .filter((candidate) => candidate.distanceMeters <= RELATED_STOP_RADIUS_METERS)
        .sort((left, right) => left.distanceMeters - right.distanceMeters)
        .slice(0, RELATED_STOP_LIMIT)
        .map((candidate) => stopToApiRecord(candidate.stop, Math.round(candidate.distanceMeters)));
}
async function getFeedMessageType() {
    if (!feedMessageTypePromise) {
        feedMessageTypePromise = (async () => {
            const protoCandidates = [
                path.join(serverDir, 'gtfs-realtime.proto'),
                path.resolve(serverDir, '../server/gtfs-realtime.proto'),
            ];
            const protoPath = protoCandidates.find((candidate) => existsSync(candidate));
            if (!protoPath) {
                throw new Error('Missing GTFS Realtime proto schema.');
            }
            const root = await protobuf.load(protoPath);
            return root.lookupType('transit_realtime.FeedMessage');
        })();
    }
    return feedMessageTypePromise;
}
async function fetchStaticGtfsArchive() {
    const response = await fetch(STATIC_GTFS_URL, {
        signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
        throw new Error(`Static GTFS request failed with ${response.status}`);
    }
    return unzipSync(new Uint8Array(await response.arrayBuffer()));
}
function parseCsvRows(file) {
    return parse(strFromU8(file), {
        bom: true,
        columns: true,
        skip_empty_lines: true,
    });
}
function stripCsvCell(value) {
    return (value ?? '').trim().replace(/^"(.*)"$/, '$1');
}
function buildRoutesById(rows) {
    const routesById = new Map();
    for (const row of rows) {
        const routeId = row.route_id?.trim();
        if (!routeId) {
            continue;
        }
        routesById.set(routeId, {
            routeId,
            routeShortName: row.route_short_name?.trim() || routeId,
            routeLongName: row.route_long_name?.trim() || routeId,
            routeTypeRaw: row.route_type?.trim() || '',
            routeColor: normalizeColor(row.route_color),
            routeTextColor: normalizeColor(row.route_text_color),
        });
    }
    return routesById;
}
function buildTripsById(rows) {
    const tripsById = new Map();
    for (const row of rows) {
        const tripId = row.trip_id?.trim();
        const routeId = row.route_id?.trim();
        const serviceId = row.service_id?.trim();
        if (!tripId || !routeId || !serviceId) {
            continue;
        }
        const directionIdRaw = row.direction_id?.trim();
        const shapeId = row.shape_id?.trim() || null;
        tripsById.set(tripId, {
            tripId,
            routeId,
            serviceId,
            headsign: row.trip_headsign?.trim() || null,
            directionId: directionIdRaw && directionIdRaw.length > 0
                ? Number.parseInt(directionIdRaw, 10)
                : null,
            shapeId,
        });
    }
    return tripsById;
}
function parseRelevantShapePoints(shapesFile, relevantShapeIds) {
    const shapesById = new Map();
    if (!shapesFile || relevantShapeIds.size === 0) {
        return shapesById;
    }
    const text = strFromU8(shapesFile);
    const firstNewlineIndex = text.indexOf('\n');
    const headerLine = (firstNewlineIndex === -1 ? text : text.slice(0, firstNewlineIndex))
        .replace(/^\uFEFF/, '')
        .replace(/\r$/, '');
    const headers = headerLine.split(',').map(stripCsvCell);
    const shapeIdIndex = headers.indexOf('shape_id');
    const latitudeIndex = headers.indexOf('shape_pt_lat');
    const longitudeIndex = headers.indexOf('shape_pt_lon');
    const sequenceIndex = headers.indexOf('shape_pt_sequence');
    if (shapeIdIndex === -1 ||
        latitudeIndex === -1 ||
        longitudeIndex === -1 ||
        sequenceIndex === -1) {
        return shapesById;
    }
    let lineStart = firstNewlineIndex === -1 ? text.length : firstNewlineIndex + 1;
    while (lineStart < text.length) {
        let lineEnd = text.indexOf('\n', lineStart);
        if (lineEnd === -1) {
            lineEnd = text.length;
        }
        const row = text.slice(lineStart, lineEnd).replace(/\r$/, '');
        lineStart = lineEnd + 1;
        if (!row) {
            continue;
        }
        const columns = row.split(',').map(stripCsvCell);
        const shapeId = columns[shapeIdIndex];
        if (!shapeId || !relevantShapeIds.has(shapeId)) {
            continue;
        }
        const latitude = Number.parseFloat(columns[latitudeIndex] ?? '');
        const longitude = Number.parseFloat(columns[longitudeIndex] ?? '');
        const sequence = Number.parseInt(columns[sequenceIndex] ?? '', 10);
        if (Number.isNaN(latitude) ||
            Number.isNaN(longitude) ||
            Number.isNaN(sequence)) {
            continue;
        }
        const points = shapesById.get(shapeId) ?? [];
        points.push({
            sequence,
            latitude,
            longitude,
        });
        shapesById.set(shapeId, points);
    }
    for (const points of shapesById.values()) {
        points.sort((left, right) => left.sequence - right.sequence);
    }
    return shapesById;
}
async function getStaticRoutesTripsData() {
    if (Date.now() < staticRoutesTripsCache.expiresAt) {
        return staticRoutesTripsCache.data;
    }
    if (staticRoutesTripsCache.promise) {
        return staticRoutesTripsCache.promise;
    }
    staticRoutesTripsCache.promise = (async () => {
        const archive = await fetchStaticGtfsArchive();
        const routesText = archive['routes.txt'];
        const tripsText = archive['trips.txt'];
        if (!routesText || !tripsText) {
            throw new Error('Static GTFS archive is missing route metadata files.');
        }
        const data = {
            routesById: buildRoutesById(parseCsvRows(routesText)),
            tripsById: buildTripsById(parseCsvRows(tripsText)),
        };
        staticRoutesTripsCache.data = data;
        staticRoutesTripsCache.expiresAt = Date.now() + STATIC_CACHE_TTL_MS;
        return data;
    })();
    try {
        return await staticRoutesTripsCache.promise;
    }
    finally {
        staticRoutesTripsCache.promise = null;
    }
}
async function getLinePathsStaticData(normalizedLine) {
    const metadata = await getStaticRoutesTripsData();
    const relevantShapeIds = new Set();
    for (const tripRecord of metadata.tripsById.values()) {
        const routeRecord = metadata.routesById.get(tripRecord.routeId);
        if (!routeRecord) {
            continue;
        }
        const { mode } = resolveRouteMode(routeRecord.routeTypeRaw);
        if (!SUPPORTED_SURFACE_MODES.has(mode)) {
            continue;
        }
        if (routeRecord.routeShortName.toUpperCase() === normalizedLine &&
            tripRecord.shapeId) {
            relevantShapeIds.add(tripRecord.shapeId);
        }
    }
    const archive = await fetchStaticGtfsArchive();
    return {
        routesById: metadata.routesById,
        tripsById: metadata.tripsById,
        shapesById: parseRelevantShapePoints(archive['shapes.txt'], relevantShapeIds),
    };
}
async function getStaticGtfsData() {
    if (Date.now() < staticCache.expiresAt) {
        return staticCache.data;
    }
    if (staticCache.promise) {
        return staticCache.promise;
    }
    staticCache.promise = (async () => {
        const archive = await fetchStaticGtfsArchive();
        const routesText = archive['routes.txt'];
        const tripsText = archive['trips.txt'];
        const stopsText = archive['stops.txt'];
        const stopTimesText = archive['stop_times.txt'];
        const shapesText = archive['shapes.txt'];
        const calendarText = archive['calendar.txt'];
        const calendarDatesText = archive['calendar_dates.txt'];
        if (!routesText || !tripsText || !stopsText || !stopTimesText || !calendarText) {
            throw new Error('Static GTFS archive is missing required GTFS files.');
        }
        const stopsRows = parseCsvRows(stopsText);
        const stopTimesRows = parseCsvRows(stopTimesText);
        const shapesRows = shapesText ? parseCsvRows(shapesText) : [];
        const calendarRows = parseCsvRows(calendarText);
        const calendarDatesRows = calendarDatesText
            ? parseCsvRows(calendarDatesText)
            : [];
        const routesById = buildRoutesById(parseCsvRows(routesText));
        const tripsById = buildTripsById(parseCsvRows(tripsText));
        const stopsById = new Map();
        const stopsByCode = new Map();
        const shapesById = new Map();
        const tripStopPointsByTripId = new Map();
        const stopSchedulesByStopId = new Map();
        const calendarsByServiceId = new Map();
        const calendarDateExceptionsByServiceId = new Map();
        for (const row of shapesRows) {
            const shapeId = row.shape_id?.trim();
            const sequenceRaw = row.shape_pt_sequence?.trim();
            const latitude = row.shape_pt_lat ? Number.parseFloat(row.shape_pt_lat) : Number.NaN;
            const longitude = row.shape_pt_lon ? Number.parseFloat(row.shape_pt_lon) : Number.NaN;
            if (!shapeId || !sequenceRaw || Number.isNaN(latitude) || Number.isNaN(longitude)) {
                continue;
            }
            const sequence = Number.parseInt(sequenceRaw, 10);
            if (Number.isNaN(sequence)) {
                continue;
            }
            const points = shapesById.get(shapeId) ?? [];
            points.push({
                sequence,
                latitude,
                longitude,
            });
            shapesById.set(shapeId, points);
        }
        for (const row of calendarRows) {
            const serviceId = row.service_id?.trim();
            const startDate = row.start_date?.trim();
            const endDate = row.end_date?.trim();
            if (!serviceId || !startDate || !endDate) {
                continue;
            }
            calendarsByServiceId.set(serviceId, {
                startDate,
                endDate,
                weekdays: [
                    row.monday?.trim() === '1',
                    row.tuesday?.trim() === '1',
                    row.wednesday?.trim() === '1',
                    row.thursday?.trim() === '1',
                    row.friday?.trim() === '1',
                    row.saturday?.trim() === '1',
                    row.sunday?.trim() === '1',
                ],
            });
        }
        for (const row of calendarDatesRows) {
            const serviceId = row.service_id?.trim();
            const date = row.date?.trim();
            const exceptionType = row.exception_type?.trim();
            if (!serviceId || !date || !exceptionType) {
                continue;
            }
            const serviceExceptions = calendarDateExceptionsByServiceId.get(serviceId) ?? new Map();
            if (exceptionType === '1') {
                serviceExceptions.set(date, true);
            }
            else if (exceptionType === '2') {
                serviceExceptions.set(date, false);
            }
            calendarDateExceptionsByServiceId.set(serviceId, serviceExceptions);
        }
        for (const row of stopsRows) {
            const stopId = row.stop_id?.trim();
            const stopCode = row.stop_code?.trim();
            const latitude = row.stop_lat ? Number.parseFloat(row.stop_lat) : Number.NaN;
            const longitude = row.stop_lon ? Number.parseFloat(row.stop_lon) : Number.NaN;
            if (!stopId || !stopCode || Number.isNaN(latitude) || Number.isNaN(longitude)) {
                continue;
            }
            const stopRecord = {
                stopId,
                stopCode,
                stopName: row.stop_name?.replace(/^Fermata\s+\d+\s+-\s+/i, '').trim() || stopCode,
                stopDescription: row.stop_desc?.trim() || null,
                latitude,
                longitude,
                url: row.stop_url?.trim() || null,
                wheelchairBoarding: row.wheelchair_boarding?.trim() || null,
                modes: new Set(),
                lines: new Set(),
                services: new Map(),
            };
            stopsById.set(stopId, stopRecord);
            stopsByCode.set(stopCode, stopRecord);
        }
        for (const row of stopTimesRows) {
            const tripId = row.trip_id?.trim();
            const stopId = row.stop_id?.trim();
            const arrivalTime = row.arrival_time?.trim();
            const stopSequenceRaw = row.stop_sequence?.trim();
            if (!tripId || !stopId || !arrivalTime || !stopSequenceRaw) {
                continue;
            }
            const tripRecord = tripsById.get(tripId);
            if (!tripRecord) {
                continue;
            }
            const routeRecord = routesById.get(tripRecord.routeId);
            if (!routeRecord) {
                continue;
            }
            const { mode, label } = resolveRouteMode(routeRecord.routeTypeRaw);
            if (!SUPPORTED_SURFACE_MODES.has(mode)) {
                continue;
            }
            const stopSequence = Number.parseInt(stopSequenceRaw, 10);
            if (Number.isNaN(stopSequence)) {
                continue;
            }
            const schedules = stopSchedulesByStopId.get(stopId) ?? [];
            schedules.push({
                tripId,
                stopSequence,
                arrivalTime,
            });
            stopSchedulesByStopId.set(stopId, schedules);
            const stopRecord = stopsById.get(stopId);
            if (stopRecord) {
                const tripPathPoints = tripStopPointsByTripId.get(tripId) ?? [];
                tripPathPoints.push({
                    sequence: stopSequence,
                    latitude: stopRecord.latitude,
                    longitude: stopRecord.longitude,
                });
                tripStopPointsByTripId.set(tripId, tripPathPoints);
                stopRecord.modes.add(mode);
                stopRecord.lines.add(routeRecord.routeShortName);
                stopRecord.services.set(buildStopServiceKey(routeRecord.routeShortName, mode), {
                    lineCode: routeRecord.routeShortName,
                    mode,
                    modeLabel: label,
                });
            }
        }
        for (const points of shapesById.values()) {
            points.sort((left, right) => left.sequence - right.sequence);
        }
        for (const points of tripStopPointsByTripId.values()) {
            points.sort((left, right) => left.sequence - right.sequence);
        }
        const data = {
            routesById,
            tripsById,
            stopsById,
            stopsByCode,
            shapesById,
            tripStopPointsByTripId,
            stopSchedulesByStopId,
            calendarsByServiceId,
            calendarDateExceptionsByServiceId,
        };
        staticCache.data = data;
        staticCache.expiresAt = Date.now() + STATIC_CACHE_TTL_MS;
        return data;
    })();
    try {
        return await staticCache.promise;
    }
    finally {
        staticCache.promise = null;
    }
}
async function fetchRealtimeSnapshot() {
    const [feedMessageType, response] = await Promise.all([
        getFeedMessageType(),
        fetch(TRIP_UPDATE_FEED_URL, {
            signal: AbortSignal.timeout(15_000),
        }),
    ]);
    if (!response.ok) {
        throw new Error(`Trip updates request failed with ${response.status}`);
    }
    const buffer = new Uint8Array(await response.arrayBuffer());
    const message = feedMessageType.decode(buffer);
    const object = feedMessageType.toObject(message, {
        longs: Number,
        enums: String,
        defaults: false,
        arrays: true,
        objects: true,
    });
    const tripUpdatesByTripId = new Map();
    for (const entity of object.entity ?? []) {
        const tripUpdate = entity.tripUpdate;
        const tripId = tripUpdate?.trip?.tripId;
        if (!tripId) {
            continue;
        }
        tripUpdatesByTripId.set(tripId, {
            tripId,
            startDate: tripUpdate.trip?.startDate ?? null,
            startTime: tripUpdate.trip?.startTime ?? null,
            vehicleId: tripUpdate.vehicle?.id ?? null,
            vehicleLabel: tripUpdate.vehicle?.label ?? null,
            stopTimeUpdates: tripUpdate.stopTimeUpdate ?? [],
        });
    }
    return {
        feedTimestamp: toIsoString(object.header?.timestamp),
        tripUpdatesByTripId,
    };
}
async function fetchVehiclePositionSnapshot() {
    const [feedMessageType, response] = await Promise.all([
        getFeedMessageType(),
        fetch(VEHICLE_POSITION_FEED_URL, {
            signal: AbortSignal.timeout(15_000),
        }),
    ]);
    if (!response.ok) {
        throw new Error(`Vehicle positions request failed with ${response.status}`);
    }
    const buffer = new Uint8Array(await response.arrayBuffer());
    const message = feedMessageType.decode(buffer);
    const object = feedMessageType.toObject(message, {
        longs: Number,
        enums: String,
        defaults: false,
        arrays: true,
        objects: true,
    });
    const positionsByTripId = new Map();
    const positionsByVehicleId = new Map();
    for (const entity of object.entity ?? []) {
        const vehiclePosition = entity.vehicle;
        const position = vehiclePosition?.position;
        const latitude = position?.latitude;
        const longitude = position?.longitude;
        if (!vehiclePosition || !position || typeof latitude !== 'number' || typeof longitude !== 'number') {
            continue;
        }
        const record = {
            tripId: vehiclePosition.trip?.tripId ?? null,
            vehicleId: vehiclePosition.vehicle?.id ?? null,
            vehicleLabel: vehiclePosition.vehicle?.label ?? null,
            latitude,
            longitude,
            bearing: typeof position.bearing === 'number'
                ? position.bearing
                : null,
            speedMetersPerSecond: typeof position.speed === 'number'
                ? position.speed
                : null,
            timestamp: toIsoString(vehiclePosition.timestamp),
        };
        if (record.tripId) {
            positionsByTripId.set(record.tripId, record);
        }
        if (record.vehicleId) {
            positionsByVehicleId.set(record.vehicleId, record);
        }
    }
    return {
        feedTimestamp: toIsoString(object.header?.timestamp),
        positionsByTripId,
        positionsByVehicleId,
    };
}
async function getRealtimeSnapshot() {
    if (Date.now() < realtimeCache.expiresAt && realtimeCache.data) {
        return {
            snapshot: realtimeCache.data,
            stale: false,
            warnings: [],
        };
    }
    if (realtimeCache.promise) {
        return {
            snapshot: await realtimeCache.promise,
            stale: false,
            warnings: [],
        };
    }
    realtimeCache.promise = (async () => {
        const snapshot = await fetchRealtimeSnapshot();
        realtimeCache.data = snapshot;
        realtimeCache.expiresAt = Date.now() + REALTIME_CACHE_TTL_MS;
        return snapshot;
    })();
    try {
        const snapshot = await realtimeCache.promise;
        return {
            snapshot,
            stale: false,
            warnings: [],
        };
    }
    catch (error) {
        if (realtimeCache.data) {
            return {
                snapshot: realtimeCache.data,
                stale: true,
                warnings: [
                    error instanceof Error
                        ? `Feed realtime temporaneamente non raggiungibile: ${error.message}`
                        : 'Feed realtime temporaneamente non raggiungibile.',
                ],
            };
        }
        throw error;
    }
    finally {
        realtimeCache.promise = null;
    }
}
async function getVehiclePositionSnapshot() {
    if (Date.now() < vehiclePositionCache.expiresAt && vehiclePositionCache.data) {
        return {
            snapshot: vehiclePositionCache.data,
            stale: false,
            warnings: [],
        };
    }
    if (vehiclePositionCache.promise) {
        return {
            snapshot: await vehiclePositionCache.promise,
            stale: false,
            warnings: [],
        };
    }
    vehiclePositionCache.promise = (async () => {
        const snapshot = await fetchVehiclePositionSnapshot();
        vehiclePositionCache.data = snapshot;
        vehiclePositionCache.expiresAt = Date.now() + REALTIME_CACHE_TTL_MS;
        return snapshot;
    })();
    try {
        const snapshot = await vehiclePositionCache.promise;
        return {
            snapshot,
            stale: false,
            warnings: [],
        };
    }
    catch (error) {
        if (vehiclePositionCache.data) {
            return {
                snapshot: vehiclePositionCache.data,
                stale: true,
                warnings: [
                    error instanceof Error
                        ? `Feed posizioni veicoli temporaneamente non raggiungibile: ${error.message}`
                        : 'Feed posizioni veicoli temporaneamente non raggiungibile.',
                ],
            };
        }
        return {
            snapshot: {
                feedTimestamp: null,
                positionsByTripId: new Map(),
                positionsByVehicleId: new Map(),
            },
            stale: true,
            warnings: [
                error instanceof Error
                    ? `Feed posizioni veicoli temporaneamente non raggiungibile: ${error.message}`
                    : 'Feed posizioni veicoli temporaneamente non raggiungibile.',
            ],
        };
    }
    finally {
        vehiclePositionCache.promise = null;
    }
}
function buildArrivalRecord(schedule, stopId, staticData, nowMs, serviceDate, realtimeTrip, vehiclePosition) {
    const tripRecord = staticData.tripsById.get(schedule.tripId);
    if (!tripRecord) {
        return null;
    }
    const routeRecord = staticData.routesById.get(tripRecord.routeId);
    if (!routeRecord) {
        return null;
    }
    const { mode, label } = resolveRouteMode(routeRecord.routeTypeRaw);
    if (!SUPPORTED_SURFACE_MODES.has(mode)) {
        return null;
    }
    if (!realtimeTrip && !isServiceActiveOnDate(tripRecord.serviceId, serviceDate, staticData)) {
        return null;
    }
    const scheduledArrival = parseGtfsDateTime(serviceDate, schedule.arrivalTime);
    if (!scheduledArrival) {
        return null;
    }
    const scheduledArrivalMs = new Date(scheduledArrival).getTime();
    const matchingStopTimeUpdate = realtimeTrip?.stopTimeUpdates.find((stopTimeUpdate) => stopTimeUpdate.stopSequence === schedule.stopSequence ||
        stopTimeUpdate.stopId === stopId);
    const stopTimeEvent = matchingStopTimeUpdate?.arrival ?? matchingStopTimeUpdate?.departure ?? null;
    const hasRealtimePrediction = typeof stopTimeEvent?.time === 'number' || typeof stopTimeEvent?.delay === 'number';
    const predictedArrival = typeof stopTimeEvent?.time === 'number'
        ? new Date(stopTimeEvent.time * 1000).toISOString()
        : typeof stopTimeEvent?.delay === 'number'
            ? new Date(scheduledArrivalMs + stopTimeEvent.delay * 1000).toISOString()
            : scheduledArrival;
    const predictedArrivalMs = new Date(predictedArrival).getTime();
    if (predictedArrivalMs < nowMs - PAST_GRACE_MS ||
        predictedArrivalMs > nowMs + UPCOMING_WINDOW_MS) {
        return null;
    }
    return {
        tripId: schedule.tripId,
        lineCode: routeRecord.routeShortName,
        routeId: routeRecord.routeId,
        routeName: routeRecord.routeLongName,
        headsign: tripRecord.headsign,
        mode,
        modeLabel: label,
        routeColor: routeRecord.routeColor,
        routeTextColor: routeRecord.routeTextColor,
        scheduledArrival,
        predictedArrival,
        delaySeconds: typeof stopTimeEvent?.delay === 'number'
            ? stopTimeEvent.delay
            : hasRealtimePrediction
                ? Math.round((predictedArrivalMs - scheduledArrivalMs) / 1000)
                : null,
        minutesUntil: Math.max(0, Math.ceil((predictedArrivalMs - nowMs) / 60_000)),
        vehicleId: hasRealtimePrediction ? realtimeTrip?.vehicleId ?? null : null,
        vehicleLabel: hasRealtimePrediction ? realtimeTrip?.vehicleLabel ?? null : null,
        vehiclePosition: hasRealtimePrediction && vehiclePosition
            ? {
                latitude: vehiclePosition.latitude,
                longitude: vehiclePosition.longitude,
                bearing: vehiclePosition.bearing,
                speedMetersPerSecond: vehiclePosition.speedMetersPerSecond,
                timestamp: vehiclePosition.timestamp,
            }
            : null,
        realtime: hasRealtimePrediction,
    };
}
const app = express();
const DEFAULT_BOUNDS_LIMIT = 220;
app.get('/api/health', (_request, response) => {
    response.json({ ok: true });
});
app.get('/api/geocode', async (request, response, next) => {
    try {
        const address = String(request.query.address ?? '').trim();
        if (!address) {
            response.status(400).json({ error: 'address is required.' });
            return;
        }
        const payload = await geocodeAddress(address);
        response.setHeader('Cache-Control', 'no-store');
        response.json(payload);
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/stops/nearby', async (request, response, next) => {
    try {
        const latitude = Number.parseFloat(String(request.query.lat ?? ''));
        const longitude = Number.parseFloat(String(request.query.lon ?? ''));
        const radiusMeters = Number.parseInt(String(request.query.radius ?? DEFAULT_NEARBY_RADIUS_METERS), 10);
        const limit = Number.parseInt(String(request.query.limit ?? DEFAULT_NEARBY_LIMIT), 10);
        if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
            response.status(400).json({ error: 'Latitude and longitude are required.' });
            return;
        }
        const staticData = await getStaticGtfsData();
        const candidates = Array.from(staticData.stopsById.values())
            .filter((stop) => stop.lines.size > 0)
            .map((stop) => ({
            stop,
            distanceMeters: metersBetween(latitude, longitude, stop.latitude, stop.longitude),
        }))
            .sort((left, right) => left.distanceMeters - right.distanceMeters);
        const inRadius = candidates.filter((candidate) => candidate.distanceMeters <= radiusMeters);
        const stops = (inRadius.length > 0 ? inRadius : candidates)
            .slice(0, limit)
            .map((candidate) => stopToApiRecord(candidate.stop, candidate.distanceMeters));
        const payload = {
            fetchedAt: new Date().toISOString(),
            userLocation: {
                latitude,
                longitude,
            },
            stops,
        };
        response.setHeader('Cache-Control', 'no-store');
        response.json(payload);
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/lines', async (_request, response, next) => {
    try {
        const staticData = await getStaticRoutesTripsData();
        const payload = {
            fetchedAt: new Date().toISOString(),
            lines: buildLineCatalog(staticData),
        };
        response.setHeader('Cache-Control', 'no-store');
        response.json(payload);
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/stops/bounds', async (request, response, next) => {
    try {
        const north = Number.parseFloat(String(request.query.north ?? ''));
        const south = Number.parseFloat(String(request.query.south ?? ''));
        const east = Number.parseFloat(String(request.query.east ?? ''));
        const west = Number.parseFloat(String(request.query.west ?? ''));
        const limit = Number.parseInt(String(request.query.limit ?? DEFAULT_BOUNDS_LIMIT), 10);
        if ([north, south, east, west].some((value) => Number.isNaN(value))) {
            response
                .status(400)
                .json({ error: 'north, south, east and west are required.' });
            return;
        }
        const minLatitude = Math.min(north, south);
        const maxLatitude = Math.max(north, south);
        const minLongitude = Math.min(east, west);
        const maxLongitude = Math.max(east, west);
        const centerLatitude = (minLatitude + maxLatitude) / 2;
        const centerLongitude = (minLongitude + maxLongitude) / 2;
        const staticData = await getStaticGtfsData();
        const stops = Array.from(staticData.stopsById.values())
            .filter((stop) => stop.lines.size > 0 &&
            stop.latitude >= minLatitude &&
            stop.latitude <= maxLatitude &&
            stop.longitude >= minLongitude &&
            stop.longitude <= maxLongitude)
            .map((stop) => ({
            stop,
            distanceMeters: metersBetween(centerLatitude, centerLongitude, stop.latitude, stop.longitude),
        }))
            .sort((left, right) => left.distanceMeters - right.distanceMeters)
            .slice(0, limit)
            .map((candidate) => stopToApiRecord(candidate.stop, candidate.distanceMeters));
        const payload = {
            fetchedAt: new Date().toISOString(),
            bounds: {
                north,
                south,
                east,
                west,
            },
            stops,
        };
        response.setHeader('Cache-Control', 'no-store');
        response.json(payload);
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/arrivals', async (request, response, next) => {
    try {
        const stopCode = String(request.query.stopCode ?? '').trim();
        if (!stopCode) {
            response.status(400).json({ error: 'stopCode is required.' });
            return;
        }
        const staticData = await getStaticGtfsData();
        const stop = staticData.stopsByCode.get(stopCode);
        if (!stop) {
            response.status(404).json({ error: 'Fermata non trovata.' });
            return;
        }
        const [{ snapshot, stale: realtimeStale, warnings: realtimeWarnings }, { snapshot: vehiclePositionSnapshot, stale: vehiclePositionStale, warnings: vehiclePositionWarnings, },] = await Promise.all([getRealtimeSnapshot(), getVehiclePositionSnapshot()]);
        const nowMs = Date.now();
        const schedules = staticData.stopSchedulesByStopId.get(stop.stopId) ?? [];
        const relatedStops = getRelatedStops(stop, staticData);
        const candidateServiceDates = getCandidateServiceDates(nowMs);
        const arrivalsByTripInstance = new Map();
        for (const schedule of schedules) {
            const realtimeTrip = snapshot.tripUpdatesByTripId.get(schedule.tripId);
            const serviceDates = realtimeTrip?.startDate
                ? [realtimeTrip.startDate, ...candidateServiceDates.filter((date) => date !== realtimeTrip.startDate)]
                : candidateServiceDates;
            for (const serviceDate of serviceDates) {
                const activeRealtimeTrip = realtimeTrip?.startDate === serviceDate ? realtimeTrip : undefined;
                const vehiclePosition = activeRealtimeTrip
                    ? vehiclePositionSnapshot.positionsByTripId.get(schedule.tripId) ??
                        (activeRealtimeTrip.vehicleId
                            ? vehiclePositionSnapshot.positionsByVehicleId.get(activeRealtimeTrip.vehicleId) ?? null
                            : null)
                    : null;
                const arrival = buildArrivalRecord(schedule, stop.stopId, staticData, nowMs, serviceDate, activeRealtimeTrip, vehiclePosition);
                if (!arrival) {
                    continue;
                }
                const tripInstanceKey = `${schedule.tripId}:${serviceDate}`;
                const currentArrival = arrivalsByTripInstance.get(tripInstanceKey);
                if (!currentArrival ||
                    (!currentArrival.realtime && arrival.realtime) ||
                    new Date(arrival.predictedArrival).getTime() <
                        new Date(currentArrival.predictedArrival).getTime()) {
                    arrivalsByTripInstance.set(tripInstanceKey, arrival);
                }
            }
        }
        const arrivals = Array.from(arrivalsByTripInstance.values())
            .sort((left, right) => new Date(left.predictedArrival).getTime() -
            new Date(right.predictedArrival).getTime())
            .slice(0, 18);
        const payload = {
            fetchedAt: new Date().toISOString(),
            feedTimestamp: snapshot.feedTimestamp,
            stale: realtimeStale || vehiclePositionStale,
            warnings: [...realtimeWarnings, ...vehiclePositionWarnings],
            stop: stopToApiRecord(stop),
            relatedStops,
            arrivals,
        };
        response.setHeader('Cache-Control', 'no-store');
        response.json(payload);
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/vehicles', async (request, response, next) => {
    try {
        const rawLine = String(request.query.line ?? '').trim();
        if (!rawLine) {
            response.status(400).json({ error: 'line is required.' });
            return;
        }
        const normalizedLine = rawLine.toUpperCase();
        const staticData = await getStaticRoutesTripsData();
        const { snapshot, stale, warnings } = await getVehiclePositionSnapshot();
        const vehiclesByKey = new Map();
        for (const [tripId, position] of snapshot.positionsByTripId) {
            const tripRecord = staticData.tripsById.get(tripId);
            if (!tripRecord) {
                continue;
            }
            const routeRecord = staticData.routesById.get(tripRecord.routeId);
            if (!routeRecord) {
                continue;
            }
            const { mode, label } = resolveRouteMode(routeRecord.routeTypeRaw);
            if (!SUPPORTED_SURFACE_MODES.has(mode)) {
                continue;
            }
            if (routeRecord.routeShortName.toUpperCase() !== normalizedLine) {
                continue;
            }
            const vehicleKey = position.vehicleId ?? tripId;
            if (vehiclesByKey.has(vehicleKey)) {
                continue;
            }
            vehiclesByKey.set(vehicleKey, {
                tripId,
                vehicleId: position.vehicleId,
                vehicleLabel: position.vehicleLabel,
                lineCode: routeRecord.routeShortName,
                routeId: routeRecord.routeId,
                routeName: routeRecord.routeLongName,
                headsign: tripRecord.headsign,
                mode,
                modeLabel: label,
                routeColor: routeRecord.routeColor,
                routeTextColor: routeRecord.routeTextColor,
                latitude: position.latitude,
                longitude: position.longitude,
                bearing: position.bearing,
                speedMetersPerSecond: position.speedMetersPerSecond,
                timestamp: position.timestamp,
            });
        }
        const vehicles = Array.from(vehiclesByKey.values()).sort((left, right) => {
            const lineCodeComparison = compareLineCodes(left.lineCode, right.lineCode);
            if (lineCodeComparison !== 0) {
                return lineCodeComparison;
            }
            return (left.vehicleLabel ?? left.tripId).localeCompare(right.vehicleLabel ?? right.tripId, 'it');
        });
        const payload = {
            fetchedAt: new Date().toISOString(),
            feedTimestamp: snapshot.feedTimestamp,
            stale,
            warnings,
            line: rawLine,
            vehicles,
        };
        response.setHeader('Cache-Control', 'no-store');
        response.json(payload);
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/line-paths', async (request, response, next) => {
    try {
        const rawLine = String(request.query.line ?? '').trim();
        if (!rawLine) {
            response.status(400).json({ error: 'line is required.' });
            return;
        }
        const normalizedLine = rawLine.toUpperCase();
        const staticData = await getLinePathsStaticData(normalizedLine);
        const payload = {
            fetchedAt: new Date().toISOString(),
            line: rawLine,
            paths: buildLinePaths(normalizedLine, staticData),
        };
        response.setHeader('Cache-Control', 'no-store');
        response.json(payload);
    }
    catch (error) {
        next(error);
    }
});
if (existsSync(staticDistDir)) {
    app.use(express.static(staticDistDir));
    app.get(/^(?!\/api).*/, (_request, response) => {
        response.sendFile(path.join(staticDistDir, 'index.html'));
    });
}
app.use((error, _request, response, next) => {
    void next;
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    response.status(500).json({ error: message });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Transit server listening on http://0.0.0.0:${PORT}`);
});
//# sourceMappingURL=index.js.map