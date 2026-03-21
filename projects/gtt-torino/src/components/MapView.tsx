import { useEffect, useMemo, useRef } from 'react'
import { divIcon, latLngBounds, type DivIcon } from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import type {
  ArrivalRecord,
  FocusLocation,
  LineVehicleRecord,
  StopRecord,
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

function buildStopServicesSummary(stop: StopRecord): string {
  const lines = Array.from(new Set(stop.services.map((service) => service.lineCode)))
  if (lines.length === 0) {
    return 'Linee non disponibili'
  }

  return lines.slice(0, 10).join(', ')
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

interface FitPoint {
  key: string
  latitude: number
  longitude: number
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

interface StopPopupContentProps {
  stop: StopRecord
  isSelected: boolean
  selectedStopArrivals: ArrivalRecord[]
  loadingStopArrivals: boolean
}

function StopPopupContent({
  stop,
  isSelected,
  selectedStopArrivals,
  loadingStopArrivals,
}: StopPopupContentProps) {
  const distanceLabel = formatDistance(stop.distanceMeters)
  const arrivalsPreview = selectedStopArrivals.slice(0, 4)

  return (
    <div className="popup-content">
      <strong>🚏 {stop.stopName}</strong>
      <span>Palina {stop.stopCode}</span>
      {distanceLabel ? <span>Distanza {distanceLabel}</span> : null}
      <span>Linee: {buildStopServicesSummary(stop)}</span>

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
                <strong>{arrival.lineCode}</strong>
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
  focusLocation: FocusLocation | null
  nearbyStops: StopRecord[]
  showStops: boolean
  selectedStopCode: string | null
  selectedStopArrivals: ArrivalRecord[]
  loadingStopArrivals: boolean
  onSelectStop: (stopCode: string) => void
}

export function MapView({
  lineLabel,
  vehicleMarkers,
  focusLocation,
  nearbyStops,
  showStops,
  selectedStopCode,
  selectedStopArrivals,
  loadingStopArrivals,
  onSelectStop,
}: MapViewProps) {
  const sortedVehicles = useMemo(() => {
    return [...vehicleMarkers].sort((left, right) => {
      return (left.vehicleLabel ?? left.tripId).localeCompare(
        right.vehicleLabel ?? right.tripId,
        'it',
      )
    })
  }, [vehicleMarkers])

  const visibleStops = useMemo(() => {
    if (showStops) {
      return nearbyStops
    }

    if (!selectedStopCode) {
      return []
    }

    return nearbyStops.filter((stop) => stop.stopCode === selectedStopCode)
  }, [nearbyStops, selectedStopCode, showStops])

  const fitPoints = useMemo<FitPoint[]>(() => {
    const points: FitPoint[] = sortedVehicles.map((vehicle) => ({
      key: `vehicle:${vehicle.vehicleId ?? vehicle.tripId}`,
      latitude: vehicle.latitude,
      longitude: vehicle.longitude,
    }))

    if (focusLocation) {
      points.push({
        key: `focus:${focusLocation.kind}`,
        latitude: focusLocation.latitude,
        longitude: focusLocation.longitude,
      })
    }

    visibleStops.forEach((stop) => {
      points.push({
        key: `stop:${stop.stopCode}`,
        latitude: stop.latitude,
        longitude: stop.longitude,
      })
    })

    return points
  }, [focusLocation, sortedVehicles, visibleStops])

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
                selectedStopArrivals={isSelected ? selectedStopArrivals : []}
                loadingStopArrivals={isSelected && loadingStopArrivals}
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
              <span>{vehicle.headsign ?? vehicle.routeName}</span>
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
