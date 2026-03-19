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
import type { LineVehicleRecord, LineVehiclesResponse } from './types'
import './App.css'

const POLL_INTERVAL_MS = 15_000
const LAST_LINE_STORAGE_KEY = 'torino-line-radar:last-line'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
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

function App() {
  const [lineInput, setLineInput] = useState('')
  const [selectedLine, setSelectedLine] = useState<string | null>(null)
  const [vehiclesResponse, setVehiclesResponse] = useState<LineVehiclesResponse | null>(null)
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [refreshingVehicles, setRefreshingVehicles] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const handleSearchSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      await loadVehicles(lineInput)
    },
    [lineInput, loadVehicles],
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
    if (!selectedLine) {
      return
    }

    const intervalId = window.setInterval(() => {
      void loadVehicles(selectedLine)
    }, POLL_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [loadVehicles, selectedLine])

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

  return (
    <div className="app-shell">
      <header className="hero-card simple-hero">
        <div className="hero-copy">
          <p className="eyebrow">Torino Line Radar</p>
          <h1>Inserisci una linea e guarda i mezzi live sulla mappa.</h1>
          <p className="hero-text">
            Interfaccia ridotta al minimo: scrivi il numero o il codice della linea
            GTT e la mappa mostra i mezzi realtime trovati sul tracciato.
          </p>
        </div>

        <form className="simple-search-form" onSubmit={handleSearchSubmit}>
          <label className="search-field">
            <span>Numero o codice linea</span>
            <input
              type="search"
              value={lineInput}
              placeholder="Es. 4, 8, W15, M1N"
              onChange={(event) => setLineInput(event.target.value.toUpperCase())}
            />
          </label>

          <button className="refresh-button" type="submit">
            {loadingVehicles || refreshingVehicles ? 'Caricamento...' : 'Mostra mezzi'}
          </button>
        </form>

        <div className="simple-status-row">
          <span className="line-badge">
            {selectedLine ? `Linea ${selectedLine}` : 'Nessuna linea'}
          </span>
          <span className="mode-badge">{visibleVehicles.length} mezzi live</span>
          {selectedLine ? <span className="mode-badge">{selectedModesSummary}</span> : null}
          {vehiclesResponse?.feedTimestamp ? (
            <span className="mode-badge">
              Aggiornato {formatFeedAge(vehiclesResponse.feedTimestamp)}
            </span>
          ) : null}
          {isStandalone ? <span className="mode-badge">PWA installata</span> : null}
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

        {error ? <p className="error-box">{error}</p> : null}

        {vehiclesResponse?.warnings.length ? (
          <div className="warning-box">
            {vehiclesResponse.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </div>
        ) : null}
      </header>

      <section className="panel map-panel simple-map-panel">
        <div className="map-panel-header">
          <div>
            <p className="map-label">Mappa live</p>
            <h2>
              {selectedLine
                ? `Linea ${selectedLine}: mezzi in passaggio`
                : 'Inserisci una linea per vedere i mezzi'}
            </h2>
          </div>
          <div className="map-legend">
            <span className="legend-dot legend-live-vehicle">Mezzi live</span>
          </div>
        </div>

        <p className="helper-copy">
          {loadingVehicles
            ? 'Caricamento mezzi live in corso.'
            : selectedLine
              ? `${visibleVehicles.length} mezzi trovati. ${headsignSummary}. Ultimo feed: ${formatTime(
                  vehiclesResponse?.feedTimestamp ?? null,
                )}.`
              : 'Scrivi una linea GTT e la mappa mostrerà i veicoli live disponibili.'}
        </p>

        {selectedLine && !loadingVehicles && visibleVehicles.length === 0 ? (
          <p className="empty-state">
            Nessun mezzo live trovato per questa linea in questo momento.
          </p>
        ) : null}

        <div className="map-frame">
          <MapView lineLabel={selectedLine} vehicleMarkers={visibleVehicles} />
        </div>
      </section>
    </div>
  )
}

export default App
