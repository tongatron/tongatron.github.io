import { useEffect, useMemo, useRef } from 'react'
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { divIcon, type DivIcon } from 'leaflet'
import type {
  ArrivalRecord,
  FocusLocation,
  StopRecord,
  StopServiceRecord,
  VehicleMode,
} from '../types'

const TURIN_CENTER: [number, number] = [45.0703, 7.6869]
const DEFAULT_ZOOM = 13
const LINE_CODE_COLLATOR = new Intl.Collator('it', {
  numeric: true,
  sensitivity: 'base',
})
const MODE_SORT_ORDER: Record<VehicleMode, number> = {
  tram: 0,
  bus: 1,
  trolleybus: 2,
  metro: 3,
  rail: 4,
  other: 5,
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function createStopIcon(stop: StopRecord, isSelected: boolean): DivIcon {
  return divIcon({
    className: 'stop-marker-shell',
    iconSize: isSelected ? [66, 34] : [58, 30],
    iconAnchor: isSelected ? [33, 17] : [29, 15],
    popupAnchor: [0, -18],
    html: `
      <div class="stop-marker ${isSelected ? 'is-selected' : ''}">
        <span>${escapeHtml(stop.stopCode)}</span>
      </div>
    `,
  })
}

function createVehicleIcon(arrival: ArrivalRecord): DivIcon {
  const backgroundColor = arrival.routeColor ?? '#d97706'
  const textColor = arrival.routeTextColor ?? '#ffffff'

  return divIcon({
    className: 'vehicle-marker-shell',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -18],
    html: `
      <div
        class="vehicle-marker"
        style="background:${escapeHtml(backgroundColor)};color:${escapeHtml(textColor)}"
      >
        <span>${escapeHtml(arrival.lineCode)}</span>
      </div>
    `,
  })
}

function formatStopServices(services: StopServiceRecord[]): string {
  const groupedServices = new Map<string, string[]>()

  const sortedServices = [...services].sort((left, right) => {
    const modeOrderDifference = MODE_SORT_ORDER[left.mode] - MODE_SORT_ORDER[right.mode]
    if (modeOrderDifference !== 0) {
      return modeOrderDifference
    }

    return LINE_CODE_COLLATOR.compare(left.lineCode, right.lineCode)
  })

  for (const service of sortedServices.slice(0, 8)) {
    const currentLineCodes = groupedServices.get(service.modeLabel) ?? []
    currentLineCodes.push(service.lineCode)
    groupedServices.set(service.modeLabel, currentLineCodes)
  }

  return Array.from(groupedServices.entries())
    .map(([modeLabel, lineCodes]) => `${modeLabel}: ${lineCodes.join(', ')}`)
    .join(' · ')
}

function FocusOnTarget({
  selectedStop,
  focusLocation,
}: {
  selectedStop: StopRecord | null
  focusLocation: FocusLocation | null
}) {
  const map = useMap()
  const lastFocusKey = useRef<string | null>(null)

  useEffect(() => {
    const focusKey = selectedStop
      ? `stop:${selectedStop.stopCode}`
      : focusLocation
        ? `${focusLocation.kind}:${focusLocation.latitude.toFixed(5)}:${focusLocation.longitude.toFixed(5)}`
        : null

    if (!focusKey || focusKey === lastFocusKey.current) {
      return
    }

    lastFocusKey.current = focusKey

    if (selectedStop) {
      map.flyTo([selectedStop.latitude, selectedStop.longitude], Math.max(map.getZoom(), 15), {
        duration: 0.65,
      })
      return
    }

    if (focusLocation) {
      map.flyTo([focusLocation.latitude, focusLocation.longitude], 15, {
        duration: 0.65,
      })
    }
  }, [focusLocation, map, selectedStop])

  return null
}

interface MapViewProps {
  selectedStop: StopRecord | null
  nearbyStops: StopRecord[]
  vehicleArrivals: ArrivalRecord[]
  focusLocation: FocusLocation | null
  onSelectStop: (stopCode: string) => void
}

export function MapView({
  selectedStop,
  nearbyStops,
  vehicleArrivals,
  focusLocation,
  onSelectStop,
}: MapViewProps) {
  const visibleStops = useMemo(() => {
    const stopsByCode = new Map<string, StopRecord>()

    for (const stop of nearbyStops) {
      stopsByCode.set(stop.stopCode, stop)
    }

    if (selectedStop) {
      stopsByCode.set(selectedStop.stopCode, selectedStop)
    }

    return Array.from(stopsByCode.values())
  }, [nearbyStops, selectedStop])

  return (
    <MapContainer
      center={TURIN_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className="transit-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      <FocusOnTarget selectedStop={selectedStop} focusLocation={focusLocation} />

      {focusLocation ? (
        <CircleMarker
          center={[focusLocation.latitude, focusLocation.longitude]}
          radius={11}
          pathOptions={{
            color: focusLocation.kind === 'user' ? '#1d4ed8' : '#c2410c',
            fillColor: focusLocation.kind === 'user' ? '#60a5fa' : '#fb923c',
            fillOpacity: 0.28,
            weight: 2,
          }}
        >
          <Popup>
            <div className="popup-content">
              <strong>
                {focusLocation.kind === 'user'
                  ? 'La tua posizione'
                  : 'Indirizzo cercato'}
              </strong>
              <span>{focusLocation.label}</span>
            </div>
          </Popup>
        </CircleMarker>
      ) : null}

      {visibleStops.map((stop) => (
        <Marker
          key={stop.stopCode}
          position={[stop.latitude, stop.longitude]}
          icon={createStopIcon(stop, stop.stopCode === selectedStop?.stopCode)}
          eventHandlers={{
            click: () => onSelectStop(stop.stopCode),
          }}
        >
          <Popup>
            <div className="popup-content">
              <strong>
                Fermata {stop.stopCode} · {stop.stopName}
              </strong>
              {stop.stopDescription ? <span>{stop.stopDescription}</span> : null}
              {stop.distanceMeters !== undefined ? (
                <span>{stop.distanceMeters} m dalla tua posizione</span>
              ) : null}
              {stop.services.length ? (
                <span>Linee: {formatStopServices(stop.services)}</span>
              ) : null}
            </div>
          </Popup>
        </Marker>
      ))}

      {vehicleArrivals.map((arrival) => {
        if (!arrival.vehiclePosition) {
          return null
        }

        return (
          <Marker
            key={`${arrival.tripId}:${arrival.predictedArrival}`}
            position={[arrival.vehiclePosition.latitude, arrival.vehiclePosition.longitude]}
            icon={createVehicleIcon(arrival)}
          >
            <Popup>
              <div className="popup-content">
                <strong>
                  {arrival.modeLabel} {arrival.lineCode}
                  {arrival.vehicleLabel ? ` · Mezzo ${arrival.vehicleLabel}` : ''}
                </strong>
                <span>{arrival.headsign ?? arrival.routeName}</span>
                <span>Passaggio previsto: {new Date(arrival.predictedArrival).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
