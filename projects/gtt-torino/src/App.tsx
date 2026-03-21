import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { MapView } from './components/MapView'
import type {
  AddressSearchResponse,
  ArrivalRecord,
  FocusLocation,
  LineVehicleRecord,
  LineVehiclesResponse,
  NearbyStopsResponse,
  StopArrivalsResponse,
  StopRecord,
  StopServiceRecord,
  VehicleMode,
} from './types'
import './App.css'

const POLL_INTERVAL_MS = 15_000
const LAST_LINE_STORAGE_KEY = 'torino-line-radar:last-line'
const DEFAULT_STOPS_RADIUS_METERS = 1200
const DEFAULT_STOPS_LIMIT = 20
const TURIN_CENTER = {
  latitude: 45.0703,
  longitude: 7.6869,
}
const SIMULATION_DESTINATIONS = [
  'Porta Nuova',
  'Lingotto',
  'Falchera',
  'Stura',
  'Rivoli',
  'Mirafiori',
  'Centro',
  'Parco Dora',
]
const MODE_LABELS: Record<VehicleMode, string> = {
  metro: 'Metro',
  tram: 'Tram',
  bus: 'Bus',
  rail: 'Treno',
  trolleybus: 'Filobus',
  other: 'Altro',
}
const MODE_ROUTE_COLORS: Record<VehicleMode, string> = {
  metro: '#0f766e',
  tram: '#d97706',
  bus: '#17345e',
  rail: '#7c3aed',
  trolleybus: '#2563eb',
  other: '#475569',
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1))
}

function pickRandomDestination(exclude?: string): string {
  const candidates = SIMULATION_DESTINATIONS.filter(
    (destination) => destination !== exclude,
  )

  return candidates[randomInt(0, candidates.length - 1)] ?? 'Centro'
}

function inferSimulationMode(line: string): VehicleMode {
  if (/^M/i.test(line)) {
    return 'metro'
  }

  if (/^T/i.test(line)) {
    return 'tram'
  }

  if (/^\d+$/.test(line)) {
    const lineNumber = Number.parseInt(line, 10)
    if ([3, 4, 7, 9, 10, 13, 15, 16].includes(lineNumber)) {
      return 'tram'
    }
  }

  return 'bus'
}

function createSimulatedVehicles(line: string): LineVehicleRecord[] {
  const mode = inferSimulationMode(line)
  const modeLabel = MODE_LABELS[mode]
  const routeColor = MODE_ROUTE_COLORS[mode]
  const routeTextColor = '#fffaf2'
  const vehicleCount = randomInt(6, 12)
  const directionAngle = randomBetween(0, Math.PI * 2)
  const directionLatitude = Math.sin(directionAngle) * 0.034
  const directionLongitude = Math.cos(directionAngle) * 0.055
  const lateralLatitude = Math.sin(directionAngle + Math.PI / 2) * 0.005
  const lateralLongitude = Math.cos(directionAngle + Math.PI / 2) * 0.009
  const baseBearing =
    ((Math.atan2(directionLongitude, directionLatitude) * 180) / Math.PI + 360) % 360
  const outboundHeadsign = pickRandomDestination()
  const inboundHeadsign = pickRandomDestination(outboundHeadsign)
  const now = Date.now()

  return Array.from({ length: vehicleCount }, (_, index) => {
    const normalizedProgress =
      vehicleCount === 1 ? 0 : -1 + (2 * index) / (vehicleCount - 1)
    const progress = normalizedProgress + randomBetween(-0.12, 0.12)
    const lateralOffset = randomBetween(-1, 1)
    const forwardDirection = index % 2 === 0
    const bearing = forwardDirection ? baseBearing : (baseBearing + 180) % 360

    return {
      tripId: `test:${line}:${now}:${index}`,
      vehicleId: `sim-${line}-${now}-${index}`,
      vehicleLabel: String(randomInt(1000, 9999)),
      lineCode: line,
      routeId: `sim:${line}`,
      routeName: `Simulazione linea ${line}`,
      headsign: forwardDirection ? outboundHeadsign : inboundHeadsign,
      mode,
      modeLabel,
      routeColor,
      routeTextColor,
      latitude:
        TURIN_CENTER.latitude +
        progress * directionLatitude +
        lateralOffset * lateralLatitude,
      longitude:
        TURIN_CENTER.longitude +
        progress * directionLongitude +
        lateralOffset * lateralLongitude,
      bearing,
      speedMetersPerSecond: randomBetween(4, 13),
      timestamp: new Date(now - randomInt(5_000, 95_000)).toISOString(),
    }
  })
}

function createSimulatedResponse(line: string): LineVehiclesResponse {
  const timestamp = new Date().toISOString()

  return {
    fetchedAt: timestamp,
    feedTimestamp: timestamp,
    stale: false,
    warnings: ['TEST simulazione traffico attiva: mezzi generati casualmente.'],
    line,
    vehicles: createSimulatedVehicles(line),
  }
}

function formatFeedAge(value: string | null): string {
  if (!value) {
    return 'timestamp non disponibile'
  }

  const diffInSeconds = Math.max(
    0,
    Math.round((Date.now() - new Date(value).getTime()) / 1000),
  )

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s fa`
  }

  return `${Math.round(diffInSeconds / 60)} min fa`
}

function formatTime(value: string | null): string {
  if (!value) {
    return 'n/d'
  }

  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
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

function formatDistance(value?: number): string {
  if (typeof value !== 'number') {
    return 'distanza n/d'
  }

  if (value < 1000) {
    return `${Math.round(value)} m`
  }

  return `${(value / 1000).toFixed(1)} km`
}

function buildModesSummary(vehicles: LineVehicleRecord[]): string {
  const labels = Array.from(new Set(vehicles.map((vehicle) => vehicle.modeLabel)))
  return labels.length > 0 ? labels.join(' · ') : 'n/d'
}

function buildHeadsignSummary(vehicles: LineVehicleRecord[]): string {
  const headsigns = Array.from(
    new Set(
      vehicles
        .map((vehicle) => vehicle.headsign?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  )

  if (headsigns.length === 0) {
    return 'Direzione non disponibile'
  }

  return headsigns.slice(0, 4).join(' | ')
}

function buildStopServicesSummary(services: StopServiceRecord[]): string {
  const lines = Array.from(new Set(services.map((service) => service.lineCode)))
  if (lines.length === 0) {
    return 'Linee non disponibili'
  }

  return lines.slice(0, 8).join(', ')
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

function mergeWarnings(...lists: Array<string[] | undefined>): string[] {
  return Array.from(
    new Set(
      lists.flatMap((items) => items ?? []),
    ),
  )
}

function App() {
  const [lineInput, setLineInput] = useState('')
  const [addressInput, setAddressInput] = useState('')
  const [selectedLine, setSelectedLine] = useState<string | null>(null)
  const [vehiclesResponse, setVehiclesResponse] = useState<LineVehiclesResponse | null>(null)
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [refreshingVehicles, setRefreshingVehicles] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [simulationMode, setSimulationMode] = useState(false)
  const [focusLocation, setFocusLocation] = useState<FocusLocation | null>(null)
  const [nearbyStops, setNearbyStops] = useState<StopRecord[]>([])
  const [showStops, setShowStops] = useState(true)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [searchingAddress, setSearchingAddress] = useState(false)
  const [selectedStopCode, setSelectedStopCode] = useState<string | null>(null)
  const [selectedStopResponse, setSelectedStopResponse] =
    useState<StopArrivalsResponse | null>(null)
  const [loadingStopArrivals, setLoadingStopArrivals] = useState(false)
  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [installingApp, setInstallingApp] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const hasLoadedVehiclesRef = useRef(false)
  const hasRestoredLineRef = useRef(false)

  const loadVehicles = useCallback(async (line: string, signal?: AbortSignal) => {
    const normalizedLine = line.trim().toUpperCase()
    if (!normalizedLine) {
      setError('Inserisci una linea.')
      return null
    }

    try {
      setError(null)
      if (hasLoadedVehiclesRef.current) {
        setRefreshingVehicles(true)
      } else {
        setLoadingVehicles(true)
      }

      const apiResponse = await fetch(
        `/api/vehicles?line=${encodeURIComponent(normalizedLine)}`,
        { signal },
      )

      if (!apiResponse.ok) {
        const payload = (await apiResponse.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(payload?.error ?? `API responded with ${apiResponse.status}`)
      }

      const payload = (await apiResponse.json()) as LineVehiclesResponse
      startTransition(() => {
        setSimulationMode(false)
        setVehiclesResponse(payload)
        setSelectedLine(payload.line.toUpperCase())
        setLineInput(payload.line.toUpperCase())
      })

      return payload
    } catch (fetchError) {
      if ((fetchError as Error).name === 'AbortError') {
        return null
      }

      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Impossibile caricare i mezzi della linea.',
      )

      return null
    } finally {
      setLoadingVehicles(false)
      setRefreshingVehicles(false)
      hasLoadedVehiclesRef.current = true
    }
  }, [])

  const loadNearbyStops = useCallback(
    async (location: FocusLocation, signal?: AbortSignal) => {
      try {
        setError(null)

        const apiResponse = await fetch(
          `/api/stops/nearby?lat=${location.latitude}&lon=${location.longitude}&radius=${DEFAULT_STOPS_RADIUS_METERS}&limit=${DEFAULT_STOPS_LIMIT}`,
          { signal },
        )

        if (!apiResponse.ok) {
          const payload = (await apiResponse.json().catch(() => null)) as
            | { error?: string }
            | null
          throw new Error(payload?.error ?? `API responded with ${apiResponse.status}`)
        }

        const payload = (await apiResponse.json()) as NearbyStopsResponse

        startTransition(() => {
          setFocusLocation(location)
          setNearbyStops(payload.stops)
          setShowStops(true)

          if (
            selectedStopCode &&
            !payload.stops.some((stop) => stop.stopCode === selectedStopCode)
          ) {
            setSelectedStopCode(null)
            setSelectedStopResponse(null)
          }
        })

        return payload
      } catch (fetchError) {
        if ((fetchError as Error).name === 'AbortError') {
          return null
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Impossibile caricare le fermate vicine.',
        )

        return null
      }
    },
    [selectedStopCode],
  )

  const loadStopArrivals = useCallback(async (stopCode: string, signal?: AbortSignal) => {
    try {
      setError(null)
      setSelectedStopCode(stopCode)
      setLoadingStopArrivals(true)

      const apiResponse = await fetch(
        `/api/arrivals?stopCode=${encodeURIComponent(stopCode)}`,
        { signal },
      )

      if (!apiResponse.ok) {
        const payload = (await apiResponse.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(payload?.error ?? `API responded with ${apiResponse.status}`)
      }

      const payload = (await apiResponse.json()) as StopArrivalsResponse
      startTransition(() => {
        setSelectedStopResponse(payload)
      })

      return payload
    } catch (fetchError) {
      if ((fetchError as Error).name === 'AbortError') {
        return null
      }

      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Impossibile caricare gli arrivi della fermata.',
      )

      return null
    } finally {
      setLoadingStopArrivals(false)
    }
  }, [])

  const handleSearchSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      await loadVehicles(lineInput)
    },
    [lineInput, loadVehicles],
  )

  const handleSimulationTraffic = useCallback(() => {
    const normalizedLine = lineInput.trim().toUpperCase() || 'TEST'
    const simulatedPayload = createSimulatedResponse(normalizedLine)

    setError(null)
    setLoadingVehicles(false)
    setRefreshingVehicles(false)
    hasLoadedVehiclesRef.current = true

    startTransition(() => {
      setSimulationMode(true)
      setVehiclesResponse(simulatedPayload)
      setSelectedLine(simulatedPayload.line)
      setLineInput(simulatedPayload.line)
    })
  }, [lineInput])

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocalizzazione non disponibile su questo browser.')
      return
    }

    setLoadingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: FocusLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: 'La tua posizione',
          kind: 'user',
        }

        void loadNearbyStops(location).finally(() => {
          setLoadingLocation(false)
        })
      },
      (geoError) => {
        setLoadingLocation(false)
        setError(`Geolocalizzazione non riuscita: ${geoError.message}`)
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 60_000,
      },
    )
  }, [loadNearbyStops])

  const handleAddressSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const normalizedAddress = addressInput.trim()
      if (!normalizedAddress) {
        setError('Inserisci un indirizzo.')
        return
      }

      try {
        setSearchingAddress(true)
        setError(null)

        const apiResponse = await fetch(
          `/api/geocode?address=${encodeURIComponent(normalizedAddress)}`,
        )

        if (!apiResponse.ok) {
          const payload = (await apiResponse.json().catch(() => null)) as
            | { error?: string }
            | null
          throw new Error(payload?.error ?? `API responded with ${apiResponse.status}`)
        }

        const payload = (await apiResponse.json()) as AddressSearchResponse
        const location: FocusLocation = {
          latitude: payload.latitude,
          longitude: payload.longitude,
          label: payload.displayName,
          kind: 'address',
        }

        await loadNearbyStops(location)
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Impossibile geocodificare l’indirizzo.',
        )
      } finally {
        setSearchingAddress(false)
      }
    },
    [addressInput, loadNearbyStops],
  )

  const handleStopSelect = useCallback(
    (stopCode: string) => {
      void loadStopArrivals(stopCode)
    },
    [loadStopArrivals],
  )

  const handleStopLineSelect = useCallback(
    async (lineCode: string) => {
      setLineInput(lineCode)
      await loadVehicles(lineCode)
    },
    [loadVehicles],
  )

  useEffect(() => {
    if (hasRestoredLineRef.current) {
      return
    }

    hasRestoredLineRef.current = true
    const storedLine = window.localStorage.getItem(LAST_LINE_STORAGE_KEY)?.trim()
    if (!storedLine) {
      return
    }

    setLineInput(storedLine)
    void loadVehicles(storedLine)
  }, [loadVehicles])

  useEffect(() => {
    if (!selectedLine) {
      return
    }

    window.localStorage.setItem(LAST_LINE_STORAGE_KEY, selectedLine)
  }, [selectedLine])

  useEffect(() => {
    if (!selectedLine || simulationMode) {
      return
    }

    const intervalId = window.setInterval(() => {
      void loadVehicles(selectedLine)
    }, POLL_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [loadVehicles, selectedLine, simulationMode])

  useEffect(() => {
    const displayModeQuery = window.matchMedia('(display-mode: standalone)')

    const handleDisplayModeChange = (event: MediaQueryListEvent) => {
      setIsStandalone(event.matches)
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent
      installEvent.preventDefault()
      setInstallPromptEvent(installEvent)
    }

    const handleAppInstalled = () => {
      setInstallPromptEvent(null)
      setInstallingApp(false)
      setIsStandalone(true)
    }

    setIsStandalone(displayModeQuery.matches)

    displayModeQuery.addEventListener('change', handleDisplayModeChange)
    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt as EventListener,
    )
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      displayModeQuery.removeEventListener('change', handleDisplayModeChange)
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt as EventListener,
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallApp = useCallback(async () => {
    if (!installPromptEvent) {
      return
    }

    try {
      setInstallingApp(true)
      await installPromptEvent.prompt()
      await installPromptEvent.userChoice
    } finally {
      setInstallingApp(false)
      setInstallPromptEvent(null)
    }
  }, [installPromptEvent])

  const visibleVehicles = useMemo(
    () => vehiclesResponse?.vehicles ?? [],
    [vehiclesResponse],
  )
  const selectedModesSummary = useMemo(
    () => buildModesSummary(visibleVehicles),
    [visibleVehicles],
  )
  const headsignSummary = useMemo(
    () => buildHeadsignSummary(visibleVehicles),
    [visibleVehicles],
  )
  const selectedStop = useMemo(() => {
    if (selectedStopResponse) {
      return selectedStopResponse.stop
    }

    if (!selectedStopCode) {
      return null
    }

    return nearbyStops.find((stop) => stop.stopCode === selectedStopCode) ?? null
  }, [nearbyStops, selectedStopCode, selectedStopResponse])
  const selectedStopArrivals = useMemo(
    () => selectedStopResponse?.arrivals.slice(0, 6) ?? [],
    [selectedStopResponse],
  )
  const selectedStopServicesSummary = useMemo(
    () => buildStopServicesSummary(selectedStop?.services ?? []),
    [selectedStop],
  )
  const selectedStopServiceLinks = useMemo(
    () => buildSelectableStopServices(selectedStop?.services ?? []),
    [selectedStop],
  )
  const activeWarnings = useMemo(
    () => mergeWarnings(vehiclesResponse?.warnings, selectedStopResponse?.warnings),
    [selectedStopResponse?.warnings, vehiclesResponse?.warnings],
  )

  return (
    <div className="app-shell">
      <section className="primary-stage">
        <header className="hero-card control-card">
          <div className="hero-copy">
            <p className="eyebrow">Torino Line Radar</p>
            <h1>Linea, posizione e fermate in una sola vista.</h1>
            <p className="hero-text">
              Cerca una linea GTT, localizzati o trova un indirizzo, poi clicca una
              fermata per vedere gli arrivi previsti.
            </p>
          </div>

          <div className="control-section">
            <p className="eyebrow">Linea</p>

            <form className="simple-search-form" onSubmit={handleSearchSubmit}>
              <div className="line-search-row">
                <label className="search-field compact-search-field">
                  <span>Linea</span>
                  <input
                    type="search"
                    value={lineInput}
                    placeholder="Es. 4, 8, W15, M1N"
                    onChange={(event) => setLineInput(event.target.value.toUpperCase())}
                  />
                </label>

                <button className="refresh-button" type="submit">
                  {loadingVehicles || refreshingVehicles ? 'Caricamento...' : 'Mostra'}
                </button>
              </div>
            </form>
          </div>

          <div className="selection-box">
            <div className="selection-head">
              <p className="eyebrow">Localizzazione</p>
              {focusLocation?.kind === 'user' ? (
                <span className="mode-badge">Posizione attiva</span>
              ) : null}
            </div>

            <button
              className="secondary-button location-button"
              type="button"
              onClick={handleUseMyLocation}
              disabled={loadingLocation}
            >
              <span
                className={`location-signal${
                  focusLocation?.kind === 'user' ? ' is-active' : ''
                }${loadingLocation ? ' is-loading' : ''}`}
                aria-hidden="true"
              ></span>
              {loadingLocation ? 'Localizzo...' : 'Usa la mia posizione'}
            </button>

            <form className="address-form" onSubmit={handleAddressSubmit}>
              <label className="search-field">
                <span>Ricerca indirizzo</span>
                <input
                  type="search"
                  value={addressInput}
                  placeholder="Es. Via Po 17"
                  onChange={(event) => setAddressInput(event.target.value)}
                />
              </label>

              <div className="simple-search-actions">
                <button
                  className="secondary-button"
                  type="submit"
                  disabled={searchingAddress}
                >
                  {searchingAddress ? 'Cerco...' : 'Cerca indirizzo'}
                </button>
              </div>
            </form>

            <label className="switch-row">
              <span className="switch-copy">
                <strong>Mostra fermate</strong>
                <span>{showStops ? 'Attivo' : 'Disattivato'}</span>
              </span>
              <input
                className="switch-input"
                type="checkbox"
                checked={showStops}
                onChange={(event) => setShowStops(event.target.checked)}
              />
              <span className="switch-track" aria-hidden="true">
                <span className="switch-thumb"></span>
              </span>
            </label>

            <div className="simple-status-row">
              <span className="line-badge">
                {selectedLine ? `Linea ${selectedLine}` : 'Nessuna linea'}
              </span>
              <span className="mode-badge">{visibleVehicles.length} mezzi live</span>
              {selectedLine ? <span className="mode-badge">{selectedModesSummary}</span> : null}
              {simulationMode ? <span className="mode-badge">Test traffico</span> : null}
              {focusLocation ? (
                <span className="mode-badge">
                  {focusLocation.kind === 'user' ? 'Posizione attiva' : 'Indirizzo attivo'}
                </span>
              ) : null}
              {nearbyStops.length > 0 ? (
                <span className="mode-badge">{nearbyStops.length} fermate caricate</span>
              ) : null}
              {isStandalone ? <span className="mode-badge">PWA installata</span> : null}
            </div>

            <p className="helper-copy location-caption">
              {focusLocation
                ? focusLocation.label
                : 'Usa la posizione o cerca un indirizzo per caricare le fermate vicine.'}
            </p>

            {installPromptEvent && !isStandalone ? (
              <button
                className="secondary-button install-button"
                type="button"
                onClick={() => {
                  void handleInstallApp()
                }}
                disabled={installingApp}
              >
                {installingApp ? 'Installazione...' : 'Installa app'}
              </button>
            ) : null}
          </div>

          <div className="selection-box stop-detail-box">
            <div className="selection-head">
              <p className="eyebrow">Fermata selezionata</p>
              {selectedStop ? (
                <span className="mode-badge">Palina {selectedStop.stopCode}</span>
              ) : null}
            </div>

            {selectedStop ? (
              <>
                <h3 className="stop-title">{selectedStop.stopName}</h3>
                <p className="helper-copy">
                  {selectedStopServicesSummary} · {formatDistance(selectedStop.distanceMeters)}
                </p>

                {selectedStopServiceLinks.length > 0 ? (
                  <div className="stop-service-grid">
                    {selectedStopServiceLinks.map((service) => (
                      <button
                        key={`${selectedStop.stopCode}:${service.lineCode}`}
                        className={`stop-service-button${
                          selectedLine === service.lineCode ? ' is-active' : ''
                        }`}
                        type="button"
                        onClick={() => {
                          void handleStopLineSelect(service.lineCode)
                        }}
                      >
                        <strong>{service.lineCode}</strong>
                        <span>{service.modeLabel}</span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {loadingStopArrivals ? (
                  <p className="empty-state">Caricamento arrivi previsti...</p>
                ) : selectedStopArrivals.length > 0 ? (
                  <ul className="arrival-list compact-arrival-list">
                    {selectedStopArrivals.map((arrival: ArrivalRecord) => (
                      <li key={`${arrival.tripId}:${arrival.predictedArrival}`}>
                        <article className="arrival-row compact-arrival-row">
                          <span
                            className="vehicle-line-pill"
                            style={{
                              backgroundColor: arrival.routeColor ?? undefined,
                              color: arrival.routeTextColor ?? undefined,
                            }}
                          >
                            {arrival.lineCode}
                          </span>

                          <span className="vehicle-row-copy">
                            <strong>{arrival.headsign ?? arrival.routeName}</strong>
                            <span>
                              {arrival.modeLabel} ·{' '}
                              {arrival.realtime ? 'realtime' : 'orario programmato'}
                            </span>
                          </span>

                          <span className="arrival-meta">
                            <strong>{formatMinutesUntil(arrival.minutesUntil)}</strong>
                            <span className="delay-badge">
                              {formatTime(arrival.predictedArrival)}
                            </span>
                          </span>
                        </article>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-state">
                    Nessun arrivo previsto disponibile per questa fermata.
                  </p>
                )}
              </>
            ) : (
              <p className="empty-state">
                Attiva posizione o indirizzo, poi clicca una fermata sulla mappa per vedere
                i mezzi previsti.
              </p>
            )}
          </div>

          <p className="helper-copy">
            {loadingVehicles
              ? 'Caricamento mezzi live in corso.'
              : simulationMode
                ? `${visibleVehicles.length} mezzi simulati. Premi di nuovo TEST simulazione per rigenerare il traffico casuale.`
              : selectedLine
                ? `${visibleVehicles.length} mezzi trovati. ${headsignSummary}. Ultimo feed: ${formatTime(
                    vehiclesResponse?.feedTimestamp ?? null,
                  )}.`
                : 'Scrivi una linea GTT per visualizzare i mezzi attivi sulla mappa.'}
          </p>

          <div className="simulation-zone">
            <button
              className="secondary-button simulation-button"
              type="button"
              onClick={handleSimulationTraffic}
            >
              Test simulazione
            </button>
          </div>

          {error ? <p className="error-box">{error}</p> : null}

          {activeWarnings.length ? (
            <div className="warning-box">
              {activeWarnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          ) : null}
        </header>

        <section className="panel map-panel square-map-panel">
          <div className="map-panel-header compact-map-header">
            <div>
              <p className="map-label">Mappa live</p>
              <h2>
                {selectedLine
                  ? `Linea ${selectedLine}: mezzi e fermate`
                  : 'Inserisci una linea per vedere i mezzi'}
              </h2>
            </div>
            <div className="map-legend">
              <span className="legend-dot legend-live-vehicle">Mezzi live</span>
              {showStops ? <span className="legend-dot legend-nearby-stop">Fermate</span> : null}
              {selectedStopCode ? (
                <span className="legend-dot legend-selected-stop">Fermata attiva</span>
              ) : null}
              {focusLocation?.kind === 'address' ? (
                <span className="legend-dot legend-address-location">Indirizzo</span>
              ) : null}
              {focusLocation?.kind === 'user' ? (
                <span className="legend-dot legend-user-location">Posizione</span>
              ) : null}
            </div>
          </div>

          <div className="map-frame square-map-frame">
            <MapView
              lineLabel={selectedLine}
              vehicleMarkers={visibleVehicles}
              focusLocation={focusLocation}
              nearbyStops={nearbyStops}
              showStops={showStops}
              selectedStopCode={selectedStopCode}
              selectedStopArrivals={selectedStopArrivals}
              loadingStopArrivals={loadingStopArrivals}
              onSelectStop={handleStopSelect}
            />
          </div>
        </section>
      </section>
    </div>
  )
}

export default App
