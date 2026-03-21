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
  LineCatalogRecord,
  LinePathsResponse,
  LineVehicleRecord,
  LineVehiclesResponse,
  LinesCatalogResponse,
  NearbyStopsResponse,
  StopArrivalsResponse,
  StopRecord,
  StopServiceRecord,
  VehicleMode,
} from './types'
import './App.css'

const POLL_INTERVAL_MS = 15_000
const LAST_LINE_STORAGE_KEY = 'torino-line-radar:last-line'
const DEFAULT_STOPS_RADIUS_METERS = 1400
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
  metro: '#0057b8',
  tram: '#ffd900',
  bus: '#0057b8',
  rail: '#003b7d',
  trolleybus: '#3a7abd',
  other: '#7b8da5',
}
type VehicleModeFilter = 'all' | 'bus' | 'tram' | 'metro' | 'trolleybus' | 'rail'

const MODE_FILTER_ORDER: VehicleModeFilter[] = [
  'all',
  'bus',
  'tram',
  'metro',
  'trolleybus',
  'rail',
]
const MODE_FILTER_LABELS: Record<VehicleModeFilter, string> = {
  all: 'Tutti',
  bus: 'Bus',
  tram: 'Tram',
  metro: 'Metro',
  trolleybus: 'Filobus',
  rail: 'Treno',
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
  const routeTextColor = mode === 'tram' ? '#0057b8' : '#ffffff'
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
    return 'Destinazioni non disponibili'
  }

  return `Destinazioni: ${headsigns
    .slice(0, 4)
    .map((headsign) => formatDestinationPlace(headsign))
    .join(' | ')}`
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

function compareLineCatalogRecords(left: LineCatalogRecord, right: LineCatalogRecord): number {
  return left.lineCode.localeCompare(right.lineCode, 'it', {
    numeric: true,
    sensitivity: 'base',
  })
}

function App() {
  const [lineInput, setLineInput] = useState('')
  const [addressInput, setAddressInput] = useState('')
  const [selectedModeFilter, setSelectedModeFilter] =
    useState<VehicleModeFilter>('all')
  const [selectedLine, setSelectedLine] = useState<string | null>(null)
  const [linesCatalogResponse, setLinesCatalogResponse] =
    useState<LinesCatalogResponse | null>(null)
  const [vehiclesResponse, setVehiclesResponse] = useState<LineVehiclesResponse | null>(null)
  const [linePathsResponse, setLinePathsResponse] = useState<LinePathsResponse | null>(null)
  const [loadingLinesCatalog, setLoadingLinesCatalog] = useState(false)
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [refreshingVehicles, setRefreshingVehicles] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [simulationMode, setSimulationMode] = useState(false)
  const [focusLocation, setFocusLocation] = useState<FocusLocation | null>(null)
  const [nearbyStops, setNearbyStops] = useState<StopRecord[]>([])
  const [showStops, setShowStops] = useState(false)
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
  const [recenterUserLocationRequest, setRecenterUserLocationRequest] = useState(0)
  const hasLoadedVehiclesRef = useRef(false)
  const hasRestoredLineRef = useRef(false)

  const loadLinesCatalog = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoadingLinesCatalog(true)
      const apiResponse = await fetch('/api/lines', { signal })

      if (!apiResponse.ok) {
        const payload = (await apiResponse.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(payload?.error ?? `API responded with ${apiResponse.status}`)
      }

      const payload = (await apiResponse.json()) as LinesCatalogResponse
      startTransition(() => {
        setLinesCatalogResponse(payload)
      })

      return payload
    } catch (fetchError) {
      if ((fetchError as Error).name === 'AbortError') {
        return null
      }

      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Impossibile caricare il catalogo linee.',
      )

      return null
    } finally {
      setLoadingLinesCatalog(false)
    }
  }, [])

  const loadVehicles = useCallback(async (
    line: string,
    options?: {
      signal?: AbortSignal
      syncInput?: boolean
    },
  ) => {
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
        { signal: options?.signal },
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
        if (options?.syncInput ?? true) {
          setLineInput(payload.line.toUpperCase())
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
          : 'Impossibile caricare i mezzi della linea.',
      )

      return null
    } finally {
      setLoadingVehicles(false)
      setRefreshingVehicles(false)
      hasLoadedVehiclesRef.current = true
    }
  }, [])

  const loadLinePaths = useCallback(async (line: string, signal?: AbortSignal) => {
    const normalizedLine = line.trim().toUpperCase()
    if (!normalizedLine) {
      startTransition(() => {
        setLinePathsResponse(null)
      })
      return null
    }

    try {
      const apiResponse = await fetch(
        `/api/line-paths?line=${encodeURIComponent(normalizedLine)}`,
        { signal },
      )

      if (!apiResponse.ok) {
        const payload = (await apiResponse.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(payload?.error ?? `API responded with ${apiResponse.status}`)
      }

      const payload = (await apiResponse.json()) as LinePathsResponse
      startTransition(() => {
        setLinePathsResponse(payload)
      })

      return payload
    } catch (fetchError) {
      if ((fetchError as Error).name === 'AbortError') {
        return null
      }

      startTransition(() => {
        setLinePathsResponse(null)
      })
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Impossibile caricare il percorso della linea.',
      )

      return null
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
      setLinePathsResponse(null)
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

        setRecenterUserLocationRequest((value) => value + 1)
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
      setError(null)
      setLineInput(lineCode)
      setSelectedLine(lineCode)
      await loadVehicles(lineCode)
    },
    [loadVehicles],
  )

  const handleCatalogLineSelect = useCallback(
    async (line: LineCatalogRecord) => {
      setSelectedModeFilter(line.mode as VehicleModeFilter)
      setError(null)
      setSelectedLine(line.lineCode)
      await loadVehicles(line.lineCode, { syncInput: false })
    },
    [loadVehicles],
  )

  const handleModeFilterChange = useCallback((mode: VehicleModeFilter) => {
    setSelectedModeFilter(mode)
  }, [])

  const handleRecenterUserLocation = useCallback(() => {
    if (focusLocation?.kind !== 'user') {
      return
    }

    setRecenterUserLocationRequest((value) => value + 1)
  }, [focusLocation])

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
    const abortController = new AbortController()
    void loadLinesCatalog(abortController.signal)

    return () => {
      abortController.abort()
    }
  }, [loadLinesCatalog])

  useEffect(() => {
    if (!selectedLine) {
      return
    }

    window.localStorage.setItem(LAST_LINE_STORAGE_KEY, selectedLine)
  }, [selectedLine])

  useEffect(() => {
    if (!selectedLine || simulationMode) {
      setLinePathsResponse(null)
      return
    }

    const abortController = new AbortController()
    void loadLinePaths(selectedLine, abortController.signal)

    return () => {
      abortController.abort()
    }
  }, [loadLinePaths, selectedLine, simulationMode])

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
  const availableLines = useMemo(
    () => linesCatalogResponse?.lines ?? [],
    [linesCatalogResponse],
  )
  const availableModeFilters = useMemo(() => {
    const modes = new Set<VehicleModeFilter>(
      availableLines
        .map((line) => line.mode)
        .filter((mode): mode is Exclude<VehicleModeFilter, 'all'> => mode !== 'other'),
    )

    return MODE_FILTER_ORDER.filter((mode) => mode === 'all' || modes.has(mode))
  }, [availableLines])
  const filteredLineOptions = useMemo(() => {
    const normalizedQuery = lineInput.trim().toUpperCase()

    return availableLines
      .filter((line) => selectedModeFilter === 'all' || line.mode === selectedModeFilter)
      .filter((line) =>
        normalizedQuery.length === 0
          ? true
          : line.lineCode.toUpperCase().includes(normalizedQuery),
      )
      .sort(compareLineCatalogRecords)
  }, [availableLines, lineInput, selectedModeFilter])
  const visibleLinePaths = useMemo(
    () => linePathsResponse?.paths ?? [],
    [linePathsResponse],
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

  useEffect(() => {
    if (!selectedLine) {
      return
    }

    const matchingLine = availableLines.find(
      (line) => line.lineCode.toUpperCase() === selectedLine.toUpperCase(),
    )
    if (!matchingLine || matchingLine.mode === 'other') {
      return
    }

    setSelectedModeFilter(matchingLine.mode as VehicleModeFilter)
  }, [availableLines, selectedLine])

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
            <p className="eyebrow">Cerca mezzo</p>

            <form className="simple-search-form" onSubmit={handleSearchSubmit}>
              <div className="line-search-row">
                <input
                  className="line-search-input"
                  type="search"
                  value={lineInput}
                  aria-label="Inserisci una linea"
                  placeholder="Es. 4, 46, M1"
                  onChange={(event) => setLineInput(event.target.value.toUpperCase())}
                />

                <button className="refresh-button" type="submit">
                  {loadingVehicles || refreshingVehicles ? 'Caricamento...' : 'Mostra'}
                </button>
              </div>
            </form>
          </div>

          <div className="selection-box">
            <div className="selection-head">
              <p className="eyebrow">Tipo mezzo</p>
              {selectedModeFilter !== 'all' ? (
                <span className="mode-badge">
                  {MODE_FILTER_LABELS[selectedModeFilter]}
                </span>
              ) : null}
            </div>

            <div className="mode-filter-grid">
              {availableModeFilters.map((mode) => (
                <button
                  key={mode}
                  className={`mode-filter-button${
                    selectedModeFilter === mode ? ' is-active' : ''
                  }`}
                  type="button"
                  onClick={() => handleModeFilterChange(mode)}
                >
                  {MODE_FILTER_LABELS[mode]}
                </button>
              ))}
            </div>

            <div className="line-picker-head">
              <p className="helper-copy">
                {selectedModeFilter === 'all'
                  ? 'Tutte le linee disponibili'
                  : `Linee ${MODE_FILTER_LABELS[selectedModeFilter].toLowerCase()} disponibili`}
              </p>
              <span className="mode-badge">{filteredLineOptions.length}</span>
            </div>

            {loadingLinesCatalog ? (
              <p className="empty-state">Caricamento catalogo linee...</p>
            ) : filteredLineOptions.length > 0 ? (
              <div className="line-options-grid">
                {filteredLineOptions.map((line) => (
                  <button
                    key={`${line.mode}:${line.lineCode}`}
                    className={`line-option-button${
                      selectedLine?.toUpperCase() === line.lineCode.toUpperCase()
                        ? ' is-active'
                        : ''
                    }`}
                    type="button"
                    style={{
                      backgroundColor:
                        selectedLine?.toUpperCase() === line.lineCode.toUpperCase()
                          ? line.routeColor ?? undefined
                          : undefined,
                      color:
                        selectedLine?.toUpperCase() === line.lineCode.toUpperCase()
                          ? line.routeTextColor ?? undefined
                          : undefined,
                    }}
                    onClick={() => {
                      void handleCatalogLineSelect(line)
                    }}
                  >
                    <strong>{line.lineCode}</strong>
                    <span>{line.modeLabel}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="empty-state">
                Nessuna linea compatibile con il filtro selezionato.
              </p>
            )}
          </div>

          <div className="selection-box">
            <div className="selection-head">
              <p className="eyebrow">Localizzazione</p>
            </div>

            <div className="location-options-grid">
              <div className="option-card">
                <div className="option-card-head">
                  <p className="eyebrow">Usa localizzazione</p>
                </div>

                <div className="location-actions">
                  <button
                    className={`secondary-button location-button${
                      focusLocation?.kind === 'user' ? ' is-active' : ''
                    }`}
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

                  {focusLocation?.kind === 'user' ? (
                    <button
                      className="secondary-button compact-button"
                      type="button"
                      onClick={handleRecenterUserLocation}
                    >
                      Torna alla mia posizione
                    </button>
                  ) : null}
                </div>
              </div>

              <form className="address-form option-card" onSubmit={handleAddressSubmit}>
                <div className="option-card-head">
                  <p className="eyebrow">Ricerca indirizzo</p>
                </div>

                <label className="search-field">
                  <span>Indirizzo</span>
                  <input
                    type="search"
                    value={addressInput}
                    placeholder="Es. Via Po 17"
                    onChange={(event) => setAddressInput(event.target.value)}
                  />
                </label>

                <button
                  className="secondary-button compact-button"
                  type="submit"
                  disabled={searchingAddress}
                >
                  {searchingAddress ? 'Cerco...' : 'Cerca indirizzo'}
                </button>

                {focusLocation?.kind === 'address' ? (
                  <p className="option-caption">{focusLocation.label}</p>
                ) : null}
              </form>
            </div>

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
              {focusLocation?.kind === 'address' ? (
                <span className="mode-badge">Indirizzo attivo</span>
              ) : null}
              {nearbyStops.length > 0 ? (
                <span className="mode-badge">{nearbyStops.length} fermate caricate</span>
              ) : null}
              {isStandalone ? <span className="mode-badge">PWA installata</span> : null}
            </div>

            {installPromptEvent && !isStandalone ? (
              <button
                className="secondary-button compact-button install-button"
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
                            <strong>
                              {formatDestinationLabel(arrival.headsign ?? arrival.routeName)}
                            </strong>
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
                  ? `Linea ${selectedLine}: mezzi, fermate e percorso`
                  : 'Inserisci una linea per vedere i mezzi'}
              </h2>
            </div>
            <div className="map-legend">
              <span className="legend-dot legend-live-vehicle">Mezzi live</span>
              {selectedLine && visibleLinePaths.length > 0 ? (
                <span className="legend-dot legend-line-route">Percorso linea</span>
              ) : null}
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
              linePaths={visibleLinePaths}
              focusLocation={focusLocation}
              nearbyStops={nearbyStops}
              showStops={showStops}
              selectedStopCode={selectedStopCode}
              selectedStop={selectedStop}
              activeLine={selectedLine}
              selectedStopArrivals={selectedStopArrivals}
              loadingStopArrivals={loadingStopArrivals}
              recenterFocusRequest={recenterUserLocationRequest}
              onSelectStop={handleStopSelect}
              onSelectLine={handleStopLineSelect}
            />
          </div>
        </section>
      </section>
    </div>
  )
}

export default App
