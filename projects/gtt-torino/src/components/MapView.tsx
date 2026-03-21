import { useEffect, useMemo, useRef } from 'react'
import { divIcon, latLng, latLngBounds, type DivIcon } from 'leaflet'
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import type {
  ArrivalRecord,
  FocusLocation,
  LinePathRecord,
  LineVehicleRecord,
  StopRecord,
  StopServiceRecord,
} from '../types'

const TURIN_CENTER: [number, number] = [45.0703, 7.6869]
const DEFAULT_ZOOM = 13
const FIT_PADDING: [number, number] = [44, 44]
const FOCUS_EMOJIS: Record<FocusLocation['kind'], string> = {
  user: '🧍',
  address: '📍',
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function normalizeBearing(value: number | null): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }

  return ((value % 360) + 360) % 360
}

function formatPopupTime(value: string | null): string {
  if (!value) {
    return 'Aggiornamento non disponibile'
  }

  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}

function formatPopupSpeed(value: number | null): string {
  if (typeof value !== 'number') {
    return 'Velocita non disponibile'
  }

  return `${Math.round(value * 3.6)} km/h`
}

function formatPopupBearing(value: number | null): string {
  const bearing = normalizeBearing(value)
  if (bearing === null) {
    return 'Direzione non disponibile'
  }

  return `Direzione ${Math.round(bearing)}°`
}

function formatDistance(value?: number): string | null {
  if (typeof value !== 'number') {
    return null
  }

  if (value < 1000) {
    return `${Math.round(value)} m`
  }

  return `${(value / 1000).toFixed(1)} km`
}

function formatMinutesUntil(value: number): string {
  if (value <= 0) {
    return 'in arrivo'
  }

  if (value === 1) {
    return '1 min'
  }

  return `${value} min`
}

function formatDestinationPlace(value: string): string {
  const normalizedValue = value.replace(/\s+/g, ' ').trim()
  const commaParts = normalizedValue.split(/\s*,\s*/).filter(Boolean)
  const hyphenParts = normalizedValue.split(/\s+-\s+/).filter(Boolean)
  let destinationValue =
    (commaParts.length > 1 ? commaParts.at(-1) : null) ??
    (hyphenParts.length > 1 ? hyphenParts.at(-1) : null) ??
    normalizedValue

  destinationValue = destinationValue
    .replace(/^\d+\s*[A-Z0-9/.-]*\s*/i, '')
    .trim()

  if (!destinationValue) {
    destinationValue = normalizedValue
  }

  return destinationValue
    .split(/(\s+|\/|-)/)
    .map((chunk) => {
      if (chunk.trim().length === 0 || chunk === '/' || chunk === '-') {
        return chunk
      }

      if (/^[IVXLCDM]+$/i.test(chunk) || /\d/.test(chunk)) {
        return chunk.toUpperCase()
      }

      return `${chunk.charAt(0).toUpperCase()}${chunk.slice(1).toLowerCase()}`
    })
    .join('')
}

function formatDestinationLabel(value: string | null | undefined): string {
  const normalizedValue = value?.trim()
  return normalizedValue
    ? `Destinazione ${formatDestinationPlace(normalizedValue)}`
    : 'Destinazione non disponibile'
}

function buildStopServicesSummary(stop: StopRecord): string {
  const lines = Array.from(new Set(stop.services.map((service) => service.lineCode)))
  if (lines.length === 0) {
    return 'Linee non disponibili'
  }

  return lines.slice(0, 10).join(', ')
}

function buildSelectableStopServices(services: StopServiceRecord[]): StopServiceRecord[] {
  const byLineCode = new Map<string, StopServiceRecord>()

  services.forEach((service) => {
    if (!byLineCode.has(service.lineCode)) {
      byLineCode.set(service.lineCode, service)
    }
  })

  return Array.from(byLineCode.values()).sort((left, right) =>
    left.lineCode.localeCompare(right.lineCode, 'it', { numeric: true }),
  )
}

function createVehicleIcon(vehicle: LineVehicleRecord): DivIcon {
  const backgroundColor = vehicle.routeColor ?? '#0057b8'
  const textColor = vehicle.routeTextColor ?? '#ffffff'
  const bearing = normalizeBearing(vehicle.bearing)
  const markerClasses = ['vehicle-marker-wrap']

  if (bearing !== null) {
    markerClasses.push('has-bearing')
  } else {
    markerClasses.push('is-static')
  }

  return divIcon({
    className: 'vehicle-marker-shell',
    iconSize: [54, 62],
    iconAnchor: [27, 31],
    popupAnchor: [0, -26],
    html: `
      <div
        class="${markerClasses.join(' ')}"
        style="--marker-accent:${escapeHtml(backgroundColor)};--bearing:${bearing ?? 0}deg;"
      >
        <span class="vehicle-pulse" aria-hidden="true"></span>
        <span class="vehicle-direction-anchor" aria-hidden="true">
          <span class="vehicle-direction-arrow"></span>
        </span>
        <div
          class="vehicle-marker"
          style="background:${escapeHtml(backgroundColor)};color:${escapeHtml(textColor)}"
        >
          <span>${escapeHtml(vehicle.lineCode)}</span>
        </div>
      </div>
    `,
  })
}

function createStopIcon(stopCode: string, isSelected: boolean): DivIcon {
  const classNames = ['stop-marker']

  if (isSelected) {
    classNames.push('is-selected')
  }

  return divIcon({
    className: 'stop-marker-shell',
    iconSize: [70, 34],
    iconAnchor: [35, 17],
    popupAnchor: [0, -10],
    html: `
      <div class="${classNames.join(' ')}">
        <span class="stop-marker-emoji" aria-hidden="true">🚏</span>
        <span>${escapeHtml(stopCode)}</span>
      </div>
    `,
  })
}

function createFocusIcon(kind: FocusLocation['kind']): DivIcon {
  const emoji = FOCUS_EMOJIS[kind]
  const label = kind === 'user' ? 'Posizione utente' : 'Indirizzo'

  return divIcon({
    className: 'focus-marker-shell',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -16],
    html: `
      <div class="focus-marker focus-marker-${kind}" aria-label="${label}">
        <span aria-hidden="true">${emoji}</span>
      </div>
    `,
  })
}

function createRouteArrowIcon(color: string, bearing: number): DivIcon {
  return divIcon({
    className: 'route-arrow-shell',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `
      <div
        class="route-arrow-marker"
        style="--route-color:${escapeHtml(color)};--route-bearing:${bearing}deg;"
      >
        <span class="route-arrow-glyph" aria-hidden="true"></span>
      </div>
    `,
  })
}

interface FitPoint {
  key: string
  latitude: number
  longitude: number
}

interface RouteArrowMarker {
  key: string
  latitude: number
  longitude: number
  bearing: number
  color: string
}

function calculatePathBearing(
  start: LinePathRecord['points'][number],
  end: LinePathRecord['points'][number],
): number {
  return ((Math.atan2(end.longitude - start.longitude, end.latitude - start.latitude) * 180) / Math.PI + 360) % 360
}

function interpolatePathPoint(
  start: LinePathRecord['points'][number],
  end: LinePathRecord['points'][number],
  ratio: number,
): { latitude: number; longitude: number } {
  return {
    latitude: start.latitude + (end.latitude - start.latitude) * ratio,
    longitude: start.longitude + (end.longitude - start.longitude) * ratio,
  }
}

function buildRouteArrowMarkers(path: LinePathRecord): RouteArrowMarker[] {
  const segments: Array<{
    start: LinePathRecord['points'][number]
    end: LinePathRecord['points'][number]
    length: number
  }> = []
  let totalLength = 0

  for (let index = 1; index < path.points.length; index += 1) {
    const start = path.points[index - 1]
    const end = path.points[index]
    if (!start || !end) {
      continue
    }

    const length = latLng(start.latitude, start.longitude).distanceTo(
      latLng(end.latitude, end.longitude),
    )

    if (length < 12) {
      continue
    }

    segments.push({ start, end, length })
    totalLength += length
  }

  if (segments.length === 0 || totalLength < 180) {
    return []
  }

  const fractions =
    totalLength < 1200 ? [0.5] : totalLength < 2800 ? [0.34, 0.68] : [0.24, 0.5, 0.76]
  const markers: RouteArrowMarker[] = []

  fractions.forEach((fraction, index) => {
    const targetLength = totalLength * fraction
    let walkedLength = 0

    for (const segment of segments) {
      const segmentEnd = walkedLength + segment.length
      if (segmentEnd < targetLength) {
        walkedLength = segmentEnd
        continue
      }

      const ratio = Math.min(
        1,
        Math.max(0, (targetLength - walkedLength) / segment.length),
      )
      const point = interpolatePathPoint(segment.start, segment.end, ratio)

      markers.push({
        key: `${path.pathId}:arrow:${index}`,
        latitude: point.latitude,
        longitude: point.longitude,
        bearing: calculatePathBearing(segment.start, segment.end),
        color: path.routeColor ?? '#17345e',
      })
      break
    }
  })

  return markers
}

function FitMapToFeatures({
  points,
}: {
  points: FitPoint[]
}) {
  const map = useMap()
  const lastBoundsKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (points.length === 0) {
      lastBoundsKeyRef.current = null
      map.setView(TURIN_CENTER, DEFAULT_ZOOM)
      return
    }

    const boundsKey = points
      .map((point) => `${point.key}:${point.latitude.toFixed(4)}:${point.longitude.toFixed(4)}`)
      .sort()
      .join('|')

    if (boundsKey === lastBoundsKeyRef.current) {
      return
    }

    lastBoundsKeyRef.current = boundsKey

    if (points.length === 1) {
      const [point] = points
      map.flyTo([point.latitude, point.longitude], 15, { duration: 0.65 })
      return
    }

    const bounds = latLngBounds(
      points.map((point) => [point.latitude, point.longitude] as [number, number]),
    )

    map.fitBounds(bounds, {
      padding: FIT_PADDING,
      maxZoom: 16,
      animate: true,
      duration: 0.65,
    })
  }, [map, points])

  return null
}

function RecenterToFocusLocation({
  focusLocation,
  requestVersion,
}: {
  focusLocation: FocusLocation | null
  requestVersion: number
}) {
  const map = useMap()
  const lastRequestRef = useRef(0)

  useEffect(() => {
    if (!focusLocation || requestVersion === 0 || requestVersion === lastRequestRef.current) {
      return
    }

    lastRequestRef.current = requestVersion
    map.flyTo([focusLocation.latitude, focusLocation.longitude], 15, {
      duration: 0.6,
    })
  }, [focusLocation, map, requestVersion])

  return null
}

interface StopPopupContentProps {
  stop: StopRecord
  isSelected: boolean
  activeLine: string | null
  selectedStopArrivals: ArrivalRecord[]
  loadingStopArrivals: boolean
  onSelectLine: (lineCode: string) => void
  onSelectStop: (stopCode: string) => void
}

function StopPopupContent({
  stop,
  isSelected,
  activeLine,
  selectedStopArrivals,
  loadingStopArrivals,
  onSelectLine,
  onSelectStop,
}: StopPopupContentProps) {
  const distanceLabel = formatDistance(stop.distanceMeters)
  const arrivalsPreview = selectedStopArrivals.slice(0, 4)
  const selectableServices = buildSelectableStopServices(stop.services)

  return (
    <div className="popup-content">
      <strong>🚏 {stop.stopName}</strong>
      <span>Palina {stop.stopCode}</span>
      {distanceLabel ? <span>Distanza {distanceLabel}</span> : null}
      <span>Linee: {buildStopServicesSummary(stop)}</span>

      {selectableServices.length > 0 ? (
        <div className="popup-line-grid">
          {selectableServices.map((service) => (
            <button
              key={`${stop.stopCode}:${service.lineCode}`}
              className={`popup-line-button${
                activeLine === service.lineCode ? ' is-active' : ''
              }`}
              type="button"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onSelectStop(stop.stopCode)
                onSelectLine(service.lineCode)
              }}
            >
              {service.lineCode}
            </button>
          ))}
        </div>
      ) : null}

      {isSelected ? (
        loadingStopArrivals ? (
          <span>Caricamento arrivi previsti...</span>
        ) : arrivalsPreview.length > 0 ? (
          <div className="popup-arrival-preview">
            {arrivalsPreview.map((arrival) => (
              <div
                key={`${arrival.tripId}:${arrival.predictedArrival}`}
                className="popup-arrival-row"
              >
                <span className="popup-arrival-copy">
                  <strong>{arrival.lineCode}</strong>
                  <span>{formatDestinationLabel(arrival.headsign ?? arrival.routeName)}</span>
                </span>
                <span>{formatMinutesUntil(arrival.minutesUntil)}</span>
              </div>
            ))}
          </div>
        ) : (
          <span>Nessun arrivo previsto disponibile per questa fermata.</span>
        )
      ) : (
        <span>Clicca la fermata per caricare gli arrivi previsti.</span>
      )}
    </div>
  )
}

interface MapViewProps {
  lineLabel: string | null
  vehicleMarkers: LineVehicleRecord[]
  linePaths: LinePathRecord[]
  focusLocation: FocusLocation | null
  nearbyStops: StopRecord[]
  showStops: boolean
  selectedStopCode: string | null
  selectedStop: StopRecord | null
  activeLine: string | null
  selectedStopArrivals: ArrivalRecord[]
  loadingStopArrivals: boolean
  recenterFocusRequest: number
  onSelectStop: (stopCode: string) => void
  onSelectLine: (lineCode: string) => void
}

export function MapView({
  lineLabel,
  vehicleMarkers,
  linePaths,
  focusLocation,
  nearbyStops,
  showStops,
  selectedStopCode,
  selectedStop,
  activeLine,
  selectedStopArrivals,
  loadingStopArrivals,
  recenterFocusRequest,
  onSelectStop,
  onSelectLine,
}: MapViewProps) {
  const sortedVehicles = useMemo(() => {
    return [...vehicleMarkers].sort((left, right) => {
      return (left.vehicleLabel ?? left.tripId).localeCompare(
        right.vehicleLabel ?? right.tripId,
        'it',
      )
    })
  }, [vehicleMarkers])

  const renderedLinePaths = useMemo(
    () =>
      linePaths
        .map((path) => ({
          path,
          positions: path.points.map(
            (point) => [point.latitude, point.longitude] as [number, number],
          ),
          arrows: buildRouteArrowMarkers(path),
        }))
        .filter((path) => path.positions.length >= 2),
    [linePaths],
  )

  const visibleStops = useMemo(() => {
    const selectedStops = selectedStop ? [selectedStop] : []

    if (showStops) {
      const allStops = [...nearbyStops, ...selectedStops]
      const seenStopCodes = new Set<string>()

      return allStops.filter((stop) => {
        if (seenStopCodes.has(stop.stopCode)) {
          return false
        }

        seenStopCodes.add(stop.stopCode)
        return true
      })
    }

    if (!selectedStop) {
      return []
    }

    return [selectedStop]
  }, [nearbyStops, selectedStop, showStops])

  const fitPoints = useMemo<FitPoint[]>(() => {
    const points: FitPoint[] = []

    renderedLinePaths.forEach(({ path }) => {
      if (path.points.length === 0) {
        return
      }

      let minLatitude = path.points[0]!.latitude
      let maxLatitude = path.points[0]!.latitude
      let minLongitude = path.points[0]!.longitude
      let maxLongitude = path.points[0]!.longitude

      path.points.forEach((point) => {
        minLatitude = Math.min(minLatitude, point.latitude)
        maxLatitude = Math.max(maxLatitude, point.latitude)
        minLongitude = Math.min(minLongitude, point.longitude)
        maxLongitude = Math.max(maxLongitude, point.longitude)
      })

      points.push(
        {
          key: `${path.pathId}:nw`,
          latitude: maxLatitude,
          longitude: minLongitude,
        },
        {
          key: `${path.pathId}:se`,
          latitude: minLatitude,
          longitude: maxLongitude,
        },
      )
    })

    points.push(
      ...sortedVehicles.map((vehicle) => ({
        key: `vehicle:${vehicle.vehicleId ?? vehicle.tripId}`,
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
      })),
    )

    if (focusLocation) {
      points.push({
        key: `focus:${focusLocation.kind}`,
        latitude: focusLocation.latitude,
        longitude: focusLocation.longitude,
      })
    }

    if (points.length === 0 && selectedStop) {
      points.push({
        key: `selected-stop:${selectedStop.stopCode}`,
        latitude: selectedStop.latitude,
        longitude: selectedStop.longitude,
      })
    }

    return points
  }, [focusLocation, renderedLinePaths, selectedStop, sortedVehicles])

  return (
    <MapContainer
      center={TURIN_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className="transit-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <FitMapToFeatures points={fitPoints} />
      <RecenterToFocusLocation
        focusLocation={focusLocation?.kind === 'user' ? focusLocation : null}
        requestVersion={recenterFocusRequest}
      />

      {renderedLinePaths.map(({ path, positions }) => (
        <Polyline
          key={path.pathId}
          positions={positions}
          pathOptions={{
            color: path.routeColor ?? '#0057b8',
            weight: 5,
            opacity: 0.44,
            dashArray: path.directionId === 1 ? '12 10' : undefined,
          }}
        />
      ))}

      {renderedLinePaths.flatMap(({ arrows }) =>
        arrows.map((arrow) => (
          <Marker
            key={arrow.key}
            position={[arrow.latitude, arrow.longitude]}
            icon={createRouteArrowIcon(arrow.color, arrow.bearing)}
            zIndexOffset={360}
            interactive={false}
          />
        )),
      )}

      {focusLocation ? (
        <Marker
          position={[focusLocation.latitude, focusLocation.longitude]}
          icon={createFocusIcon(focusLocation.kind)}
          zIndexOffset={760}
        >
          <Popup>
            <div className="popup-content">
              <strong>
                {focusLocation.kind === 'user' ? '🧍 La tua posizione' : '📍 Indirizzo cercato'}
              </strong>
              <span>{focusLocation.label}</span>
            </div>
          </Popup>
        </Marker>
      ) : null}

      {visibleStops.map((stop) => {
        const isSelected = stop.stopCode === selectedStopCode

        return (
          <Marker
            key={stop.stopCode}
            position={[stop.latitude, stop.longitude]}
            icon={createStopIcon(stop.stopCode, isSelected)}
            zIndexOffset={isSelected ? 520 : 320}
            eventHandlers={{
              click: () => {
                onSelectStop(stop.stopCode)
              },
            }}
          >
            <Popup>
              <StopPopupContent
                stop={stop}
                isSelected={isSelected}
                activeLine={activeLine}
                selectedStopArrivals={isSelected ? selectedStopArrivals : []}
                loadingStopArrivals={isSelected && loadingStopArrivals}
                onSelectLine={onSelectLine}
                onSelectStop={onSelectStop}
              />
            </Popup>
          </Marker>
        )
      })}

      {sortedVehicles.map((vehicle) => (
        <Marker
          key={vehicle.vehicleId ?? vehicle.tripId}
          position={[vehicle.latitude, vehicle.longitude]}
          icon={createVehicleIcon(vehicle)}
          zIndexOffset={700}
        >
          <Popup>
            <div className="popup-content">
              <strong>{vehicle.modeLabel} {vehicle.lineCode}</strong>
              <span>{formatDestinationLabel(vehicle.headsign ?? vehicle.routeName)}</span>
              <span>
                {vehicle.vehicleLabel ? `Mezzo ${vehicle.vehicleLabel}` : 'Veicolo GTT'}
              </span>
              <span>{formatPopupSpeed(vehicle.speedMetersPerSecond)}</span>
              <span>{formatPopupBearing(vehicle.bearing)}</span>
              <span>{formatPopupTime(vehicle.timestamp)}</span>
              {lineLabel ? <span>Linea richiesta: {lineLabel}</span> : null}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
