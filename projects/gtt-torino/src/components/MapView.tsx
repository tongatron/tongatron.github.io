import { useEffect, useMemo, useRef } from 'react'
import { divIcon, latLngBounds, type DivIcon } from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import type { LineVehicleRecord } from '../types'

const TURIN_CENTER: [number, number] = [45.0703, 7.6869]
const DEFAULT_ZOOM = 13
const FIT_PADDING: [number, number] = [44, 44]

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

function createVehicleIcon(vehicle: LineVehicleRecord): DivIcon {
  const backgroundColor = vehicle.routeColor ?? '#d97706'
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

function FitMapToVehicles({
  vehicleMarkers,
}: {
  vehicleMarkers: LineVehicleRecord[]
}) {
  const map = useMap()
  const lastBoundsKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (vehicleMarkers.length === 0) {
      lastBoundsKeyRef.current = null
      map.setView(TURIN_CENTER, DEFAULT_ZOOM)
      return
    }

    const boundsKey = vehicleMarkers
      .map((vehicle) => {
        return `${vehicle.vehicleId ?? vehicle.tripId}:${vehicle.latitude.toFixed(4)}:${vehicle.longitude.toFixed(4)}`
      })
      .sort()
      .join('|')

    if (boundsKey === lastBoundsKeyRef.current) {
      return
    }

    lastBoundsKeyRef.current = boundsKey

    if (vehicleMarkers.length === 1) {
      const [vehicle] = vehicleMarkers
      map.flyTo([vehicle.latitude, vehicle.longitude], 14, { duration: 0.65 })
      return
    }

    const bounds = latLngBounds(
      vehicleMarkers.map((vehicle) => [vehicle.latitude, vehicle.longitude] as [number, number]),
    )

    map.fitBounds(bounds, {
      padding: FIT_PADDING,
      maxZoom: 15,
      animate: true,
      duration: 0.65,
    })
  }, [map, vehicleMarkers])

  return null
}

interface MapViewProps {
  lineLabel: string | null
  vehicleMarkers: LineVehicleRecord[]
}

export function MapView({ lineLabel, vehicleMarkers }: MapViewProps) {
  const sortedVehicles = useMemo(() => {
    return [...vehicleMarkers].sort((left, right) => {
      return (left.vehicleLabel ?? left.tripId).localeCompare(
        right.vehicleLabel ?? right.tripId,
        'it',
      )
    })
  }, [vehicleMarkers])

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

      <FitMapToVehicles vehicleMarkers={sortedVehicles} />

      {sortedVehicles.map((vehicle) => (
        <Marker
          key={vehicle.vehicleId ?? vehicle.tripId}
          position={[vehicle.latitude, vehicle.longitude]}
          icon={createVehicleIcon(vehicle)}
          zIndexOffset={700}
        >
          <Popup>
            <div className="popup-content">
              <strong>
                {vehicle.modeLabel} {vehicle.lineCode}
              </strong>
              <span>{vehicle.headsign ?? vehicle.routeName}</span>
              <span>
                {vehicle.vehicleLabel
                  ? `Mezzo ${vehicle.vehicleLabel}`
                  : 'Veicolo GTT'}
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
