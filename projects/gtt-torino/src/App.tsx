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
  FocusLocation,
  NearbyStopsResponse,
  StopServiceRecord,
  StopArrivalsResponse,
  StopRecord,
  VehicleMode,
} from './types'
import './App.css'

const POLL_INTERVAL_MS = 15_000
const EMPTY_STOPS: StopRecord[] = []
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

function formatTime(value: string | null): string {
  if (!value) {
    return 'n/d'
  }

  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
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

function formatCountdown(minutesUntil: number): string {
  return minutesUntil <= 0 ? 'ora' : `${minutesUntil} min`
}

function formatDelay(delaySeconds: number | null): string {
  if (delaySeconds === null) {
    return 'tempo previsto'
  }

  const delayMinutes = Math.round(delaySeconds / 60)
  if (delayMinutes === 0) {
    return 'in orario'
  }

  return `${delayMinutes > 0 ? '+' : ''}${delayMinutes} min`
}

function formatDistance(distanceMeters: number | undefined): string {
  if (typeof distanceMeters !== 'number') {
    return 'distanza n/d'
  }

  if (distanceMeters < 1000) {
    return `${distanceMeters} m`
  }

  return `${(distanceMeters / 1000).toFixed(1)} km`
}

function buildServiceKey(lineCode: string, mode: VehicleMode): string {
  return `${mode}:${lineCode}`
}

function sortServices(services: StopServiceRecord[]): StopServiceRecord[] {
  return [...services].sort((left, right) => {
    const modeOrderDifference = MODE_SORT_ORDER[left.mode] - MODE_SORT_ORDER[right.mode]
    if (modeOrderDifference !== 0) {
      return modeOrderDifference
    }

    return LINE_CODE_COLLATOR.compare(left.lineCode, right.lineCode)
  })
}

function groupServicesByMode(services: StopServiceRecord[]) {
  const groups = new Map<
    VehicleMode,
    { mode: VehicleMode; modeLabel: string; services: StopServiceRecord[] }
  >()

  for (const service of sortServices(services)) {
    const currentGroup = groups.get(service.mode)
    if (currentGroup) {
      currentGroup.services.push(service)
      continue
    }

    groups.set(service.mode, {
      mode: service.mode,
      modeLabel: service.modeLabel,
      services: [service],
    })
  }

  return Array.from(groups.values())
}

function formatServiceLabel(service: Pick<StopServiceRecord, 'lineCode' | 'modeLabel'>): string {
  return `${service.modeLabel} ${service.lineCode}`
}

function formatGroupedServiceSummary(services: StopServiceRecord[], limit = 8): string {
  const visibleServices = sortServices(services).slice(0, limit)
  if (visibleServices.length === 0) {
    return 'n/d'
  }

  return groupServicesByMode(visibleServices)
    .map((group) => `${group.modeLabel}: ${group.services.map((service) => service.lineCode).join(', ')}`)
    .join(' | ')
}

function buildGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Permesso di geolocalizzazione negato.'
    case error.POSITION_UNAVAILABLE:
      return 'Posizione non disponibile.'
    case error.TIMEOUT:
      return 'Geolocalizzazione scaduta.'
    default:
      return 'Impossibile recuperare la posizione.'
  }
}

function App() {
  const [addressInput, setAddressInput] = useState('')
  const [stopCodeInput, setStopCodeInput] = useState('')
  const [selectedStopCode, setSelectedStopCode] = useState<string | null>(null)
  const [selectedServiceKey, setSelectedServiceKey] = useState<string | null>(null)
  const [arrivalsResponse, setArrivalsResponse] = useState<StopArrivalsResponse | null>(
    null,
  )
  const [nearbyResponse, setNearbyResponse] = useState<NearbyStopsResponse | null>(null)
  const [focusLocation, setFocusLocation] = useState<FocusLocation | null>(null)
  const [searchedAddress, setSearchedAddress] = useState<AddressSearchResponse | null>(null)
  const [loadingArrivals, setLoadingArrivals] = useState(false)
  const [refreshingArrivals, setRefreshingArrivals] = useState(false)
  const [loadingNearby, setLoadingNearby] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [addressError, setAddressError] = useState<string | null>(null)
  const hasLoadedArrivalsRef = useRef(false)
  const lastStopCodeRef = useRef<string | null>(null)

  const loadArrivals = useCallback(async (stopCode: string, signal?: AbortSignal) => {
    const normalizedStopCode = stopCode.trim()
    if (!normalizedStopCode) {
      setError('Inserisci un numero fermata.')
      return
    }

    try {
      setError(null)
      if (hasLoadedArrivalsRef.current) {
        setRefreshingArrivals(true)
      } else {
        setLoadingArrivals(true)
      }

      const apiResponse = await fetch(
        `/api/arrivals?stopCode=${encodeURIComponent(normalizedStopCode)}`,
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
        setArrivalsResponse(payload)
        setSelectedStopCode(payload.stop.stopCode)
        setStopCodeInput(payload.stop.stopCode)
      })
    } catch (fetchError) {
      if ((fetchError as Error).name === 'AbortError') {
        return
      }

      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Impossibile caricare gli arrivi della fermata.',
      )
    } finally {
      setLoadingArrivals(false)
      setRefreshingArrivals(false)
      hasLoadedArrivalsRef.current = true
    }
  }, [])

  const loadNearbyStops = useCallback(async (latitude: number, longitude: number) => {
    const apiResponse = await fetch(
      `/api/stops/nearby?lat=${latitude}&lon=${longitude}&radius=800&limit=10`,
    )

    if (!apiResponse.ok) {
      const payload = (await apiResponse.json().catch(() => null)) as
        | { error?: string }
        | null
      throw new Error(payload?.error ?? `API responded with ${apiResponse.status}`)
    }

    const payload = (await apiResponse.json()) as NearbyStopsResponse
    startTransition(() => {
      setNearbyResponse(payload)
    })

    return payload
  }, [])

  const handleSearchSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      await loadArrivals(stopCodeInput)
    },
    [loadArrivals, stopCodeInput],
  )

  const handleAddressSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const normalizedAddress = addressInput.trim()

      if (normalizedAddress.length === 0) {
        setAddressError('Inserisci un indirizzo a Torino.')
        return
      }

      try {
        setAddressError(null)
        setLoadingNearby(true)

        const geocodeResponse = await fetch(
          `/api/geocode?address=${encodeURIComponent(normalizedAddress)}`,
        )

        if (!geocodeResponse.ok) {
          const payload = (await geocodeResponse.json().catch(() => null)) as
            | { error?: string }
            | null
          throw new Error(payload?.error ?? `API responded with ${geocodeResponse.status}`)
        }

        const geocodePayload = (await geocodeResponse.json()) as AddressSearchResponse
        startTransition(() => {
          setSearchedAddress(geocodePayload)
          setFocusLocation({
            latitude: geocodePayload.latitude,
            longitude: geocodePayload.longitude,
            label: geocodePayload.displayName,
            kind: 'address',
          })
        })

        const nearbyPayload = await loadNearbyStops(
          geocodePayload.latitude,
          geocodePayload.longitude,
        )

        if (nearbyPayload.stops[0]) {
          await loadArrivals(nearbyPayload.stops[0].stopCode)
        }
      } catch (addressFailure) {
        setAddressError(
          addressFailure instanceof Error
            ? addressFailure.message
            : 'Impossibile cercare l’indirizzo.',
        )
      } finally {
        setLoadingNearby(false)
      }
    },
    [addressInput, loadArrivals, loadNearbyStops],
  )

  const handleUseLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setGeoError('Il browser non supporta la geolocalizzazione.')
      return
    }

    setGeoError(null)
    setLoadingNearby(true)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12_000,
          maximumAge: 60_000,
        })
      })

      const payload = await loadNearbyStops(
        position.coords.latitude,
        position.coords.longitude,
      )

      startTransition(() => {
        setSearchedAddress(null)
        setFocusLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: 'Posizione attuale',
          kind: 'user',
        })
      })

      if (payload.stops[0]) {
        await loadArrivals(payload.stops[0].stopCode)
      }
    } catch (geoFailure) {
      setGeoError(
        typeof geoFailure === 'object' &&
        geoFailure !== null &&
        'code' in geoFailure &&
        typeof geoFailure.code === 'number'
          ? buildGeolocationErrorMessage(
              geoFailure as GeolocationPositionError,
            )
          : geoFailure instanceof Error
            ? geoFailure.message
            : 'Impossibile recuperare le fermate vicine.',
      )
    } finally {
      setLoadingNearby(false)
    }
  }, [loadArrivals, loadNearbyStops])

  useEffect(() => {
    if (!selectedStopCode) {
      return
    }

    const intervalId = window.setInterval(() => {
      void loadArrivals(selectedStopCode)
    }, POLL_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [loadArrivals, selectedStopCode])

  const selectedStop =
    arrivalsResponse?.stop ??
    nearbyResponse?.stops.find((stop) => stop.stopCode === selectedStopCode) ??
    null

  const nearbyStops = nearbyResponse?.stops ?? EMPTY_STOPS
  const relatedStops = arrivalsResponse?.relatedStops ?? EMPTY_STOPS
  const availableServices = useMemo(
    () => sortServices(selectedStop?.services ?? []),
    [selectedStop],
  )
  const groupedAvailableServices = useMemo(
    () => groupServicesByMode(availableServices),
    [availableServices],
  )
  const selectedService = useMemo(
    () =>
      availableServices.find(
        (service) => buildServiceKey(service.lineCode, service.mode) === selectedServiceKey,
      ) ?? null,
    [availableServices, selectedServiceKey],
  )
  const extraRelatedServices = useMemo(() => {
    const currentServiceKeys = new Set(
      availableServices.map((service) => buildServiceKey(service.lineCode, service.mode)),
    )
    const relatedServiceMap = new Map<string, StopServiceRecord>()

    for (const stop of relatedStops) {
      for (const service of stop.services) {
        const serviceKey = buildServiceKey(service.lineCode, service.mode)
        if (!currentServiceKeys.has(serviceKey)) {
          relatedServiceMap.set(serviceKey, service)
        }
      }
    }

    return sortServices(Array.from(relatedServiceMap.values()))
  }, [availableServices, relatedStops])
  const filteredArrivals = useMemo(() => {
    const arrivals = arrivalsResponse?.arrivals ?? []

    if (!selectedServiceKey) {
      return arrivals
    }

    return arrivals.filter(
      (arrival) => buildServiceKey(arrival.lineCode, arrival.mode) === selectedServiceKey,
    )
  }, [arrivalsResponse?.arrivals, selectedServiceKey])
  const visibleVehicleArrivals = useMemo(
    () => filteredArrivals.filter((arrival) => arrival.realtime && arrival.vehiclePosition),
    [filteredArrivals],
  )
  const derivedFocusLocation =
    focusLocation ??
    (nearbyResponse?.userLocation
      ? {
          latitude: nearbyResponse.userLocation.latitude,
          longitude: nearbyResponse.userLocation.longitude,
          label: 'Posizione di ricerca',
          kind: 'user' as const,
        }
      : null)

  const selectableStops = useMemo(() => {
    const stopsByCode = new Map<string, StopRecord>()

    for (const stop of nearbyStops) {
      stopsByCode.set(stop.stopCode, stop)
    }

    if (selectedStop) {
      stopsByCode.set(selectedStop.stopCode, selectedStop)
    }

    return Array.from(stopsByCode.values())
  }, [nearbyStops, selectedStop])

  useEffect(() => {
    if (!selectedStop) {
      lastStopCodeRef.current = null
      if (selectedServiceKey !== null) {
        setSelectedServiceKey(null)
      }
      return
    }

    const servicesWithRealtime = sortServices(
      Array.from(
        new Map(
          (arrivalsResponse?.arrivals ?? []).map((arrival) => [
            buildServiceKey(arrival.lineCode, arrival.mode),
            {
              lineCode: arrival.lineCode,
              mode: arrival.mode,
              modeLabel: arrival.modeLabel,
            },
          ]),
        ).values(),
      ),
    )

    const preferredServiceKey = servicesWithRealtime[0]
      ? buildServiceKey(servicesWithRealtime[0].lineCode, servicesWithRealtime[0].mode)
      : availableServices[0]
        ? buildServiceKey(availableServices[0].lineCode, availableServices[0].mode)
        : null

    if (lastStopCodeRef.current !== selectedStop.stopCode) {
      lastStopCodeRef.current = selectedStop.stopCode
      setSelectedServiceKey(preferredServiceKey)
      return
    }

    if (!selectedServiceKey) {
      setSelectedServiceKey(preferredServiceKey)
      return
    }

    if (
      selectedServiceKey !== null &&
      !availableServices.some(
        (service) => buildServiceKey(service.lineCode, service.mode) === selectedServiceKey,
      )
    ) {
      setSelectedServiceKey(preferredServiceKey)
    }
  }, [arrivalsResponse?.arrivals, availableServices, selectedServiceKey, selectedStop])

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Torino Stop Radar</p>
          <h1>Mezzi in arrivo a una fermata GTT scelta dall’utente</h1>
          <p className="hero-text">
            Digita il numero fermata oppure usa la geolocalizzazione per vedere le
            fermate vicine sulla mappa e aprire subito gli arrivi realtime.
          </p>
        </div>

        <div className="stats-grid">
          <article className="stat-card">
            <span className="stat-label">Fermata selezionata</span>
            <strong className="stat-value">{selectedStop?.stopCode ?? 'Nessuna'}</strong>
            <span className="stat-note">
              {selectedStop ? selectedStop.stopName : 'Inserisci un numero fermata'}
            </span>
          </article>

          <article className="stat-card">
            <span className="stat-label">Arrivi realtime</span>
            <strong className="stat-value">{filteredArrivals.length}</strong>
            <span className="stat-note">
              {formatFeedAge(arrivalsResponse?.feedTimestamp ?? null)}
            </span>
          </article>

          <article className="stat-card">
            <span className="stat-label">Ricerca mappa</span>
            <strong className="stat-value">{nearbyStops.length}</strong>
            <span className="stat-note">
              {focusLocation?.kind === 'address'
                ? 'indirizzo geocodificato'
                : focusLocation?.kind === 'user'
                  ? 'geolocalizzazione attiva'
                  : 'indirizzo o posizione'}
            </span>
          </article>
        </div>
      </header>

      <section className="dashboard-grid">
        <aside className="sidebar-column">
          <div className="panel controls-panel">
            <div className="panel-header">
              <h2>Ricerca fermata</h2>
              <button
                className="refresh-button"
                type="button"
                disabled={!selectedStopCode || refreshingArrivals}
                onClick={() => {
                  if (selectedStopCode) {
                    void loadArrivals(selectedStopCode)
                  }
                }}
              >
                {refreshingArrivals ? 'Aggiornamento...' : 'Aggiorna arrivi'}
              </button>
            </div>

            <form className="search-form" onSubmit={handleSearchSubmit}>
              <label className="search-field">
                <span>Numero fermata</span>
                <input
                  inputMode="numeric"
                  type="search"
                  value={stopCodeInput}
                  placeholder="Es. 10, 100, 1354"
                  onChange={(event) => setStopCodeInput(event.target.value)}
                />
              </label>

              <div className="action-row">
                <button className="refresh-button" type="submit">
                  Cerca fermata
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={loadingNearby}
                  onClick={() => void handleUseLocation()}
                >
                  {loadingNearby ? 'Cerco fermate vicine...' : 'Usa la mia posizione'}
                </button>
              </div>
            </form>

            <form className="search-form search-form-address" onSubmit={handleAddressSubmit}>
              <label className="search-field">
                <span>Indirizzo a Torino</span>
                <input
                  type="search"
                  value={addressInput}
                  placeholder="Es. Via Po 17, Piazza Castello"
                  onChange={(event) => setAddressInput(event.target.value)}
                />
              </label>

              <button className="secondary-button" type="submit" disabled={loadingNearby}>
                Cerca per indirizzo
              </button>
            </form>

            <p className="helper-copy">
              Clicca una fermata vicina nella lista o sulla mappa per caricare gli
              arrivi realtime.
            </p>

            {selectedStop ? (
              <div className="line-selector-block">
                <label className="search-field">
                  <span>Linea alla fermata selezionata</span>
                  <select
                    className="line-select"
                    value={selectedServiceKey ?? ''}
                    onChange={(event) =>
                      setSelectedServiceKey(
                        event.target.value.length > 0 ? event.target.value : null,
                      )
                    }
                  >
                    {groupedAvailableServices.map((group) => (
                      <optgroup key={group.mode} label={group.modeLabel}>
                        {group.services.map((service) => (
                          <option
                            key={buildServiceKey(service.lineCode, service.mode)}
                            value={buildServiceKey(service.lineCode, service.mode)}
                          >
                            Linea {service.lineCode}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>

                <p className="helper-copy">
                  Le linee sono raggruppate per modalita e i passaggi sotto sono filtrati
                  sul servizio scelto.
                </p>
                {extraRelatedServices.length > 0 ? (
                  <p className="helper-copy">
                    Su paline collegate con lo stesso nome fermata risultano anche:{' '}
                    <strong>{formatGroupedServiceSummary(extraRelatedServices, 12)}</strong>
                  </p>
                ) : null}
              </div>
            ) : null}

            {arrivalsResponse?.warnings.length ? (
              <div className="warning-box">
                {arrivalsResponse.warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            ) : null}

            {error ? <p className="error-box">{error}</p> : null}
            {geoError ? <p className="error-box">{geoError}</p> : null}
            {addressError ? <p className="error-box">{addressError}</p> : null}
          </div>

          <div className="panel details-panel">
            <div className="panel-header">
              <h2>Dettaglio fermata</h2>
              <span className="muted-label">
                {selectedStop ? `Palina ${selectedStop.stopCode}` : 'Nessuna palina'}
              </span>
            </div>

            {selectedStop ? (
              <div className="vehicle-spotlight">
                <div className="line-badge-row">
                  <span className="line-badge">Fermata {selectedStop.stopCode}</span>
                  {selectedStop.distanceMeters !== undefined ? (
                    <span className="mode-badge">
                      {formatDistance(selectedStop.distanceMeters)}
                    </span>
                  ) : null}
                </div>

                <h3>{selectedStop.stopName}</h3>
                <p className="spotlight-copy">
                  {selectedStop.stopDescription ?? 'Descrizione fermata non disponibile'}
                </p>

                {searchedAddress ? (
                  <p className="helper-copy">
                    Indirizzo cercato: <strong>{searchedAddress.displayName}</strong>
                  </p>
                ) : null}

                <dl className="detail-grid">
                  <div>
                    <dt>Servizio selezionato</dt>
                    <dd>{selectedService ? formatServiceLabel(selectedService) : 'n/d'}</dd>
                  </div>
                  <div>
                    <dt>Feed realtime</dt>
                    <dd>{formatTime(arrivalsResponse?.feedTimestamp ?? null)}</dd>
                  </div>
                  <div>
                    <dt>Accessibilita</dt>
                    <dd>
                      {selectedStop.wheelchairBoarding === '1'
                        ? 'Accessibile'
                        : selectedStop.wheelchairBoarding === '2'
                          ? 'Accesso limitato'
                          : 'n/d'}
                    </dd>
                  </div>
                  <div>
                    <dt>Link GTT</dt>
                    <dd>
                      {selectedStop.url ? (
                        <a href={selectedStop.url} target="_blank" rel="noreferrer">
                          Apri fermata
                        </a>
                      ) : (
                        'n/d'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Linee in fermata</dt>
                    <dd>{formatGroupedServiceSummary(availableServices, 10)}</dd>
                  </div>
                </dl>

                {selectableStops.length > 0 ? (
                  <div className="nearby-list-block">
                    <div className="panel-header compact">
                      <h2>Fermate vicine</h2>
                      <span className="muted-label">{selectableStops.length} visibili</span>
                    </div>

                    <ul className="nearby-stop-list">
                      {selectableStops.map((stop) => (
                        <li key={stop.stopCode}>
                          <button
                            type="button"
                            className={
                              stop.stopCode === selectedStopCode
                                ? 'nearby-stop-row active'
                                : 'nearby-stop-row'
                            }
                            onClick={() => {
                              setStopCodeInput(stop.stopCode)
                              void loadArrivals(stop.stopCode)
                            }}
                          >
                            <span className="vehicle-line-pill">{stop.stopCode}</span>
                            <span className="vehicle-row-copy">
                              <strong>{stop.stopName}</strong>
                              <span>{formatDistance(stop.distanceMeters)}</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {relatedStops.length > 0 ? (
                  <div className="nearby-list-block">
                    <div className="panel-header compact">
                      <h2>Paline collegate</h2>
                      <span className="muted-label">stesso nome fermata</span>
                    </div>

                    <p className="helper-copy">
                      Alcune linee passano su paline vicine dello stesso nodo fermata.
                      Apri una delle paline collegate qui sotto per vedere anche quei
                      passaggi realtime.
                    </p>

                    <ul className="nearby-stop-list">
                      {relatedStops.map((stop) => (
                        <li key={stop.stopCode}>
                          <button
                            type="button"
                            className="nearby-stop-row"
                            onClick={() => {
                              setStopCodeInput(stop.stopCode)
                              void loadArrivals(stop.stopCode)
                            }}
                          >
                            <span className="vehicle-line-pill">{stop.stopCode}</span>
                            <span className="vehicle-row-copy">
                              <strong>{stop.stopName}</strong>
                              <span>
                                {formatGroupedServiceSummary(stop.services, 10)} ·{' '}
                                {formatDistance(stop.distanceMeters)}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="empty-state">
                Inserisci una fermata oppure attiva la geolocalizzazione per vedere
                le fermate vicine.
              </p>
            )}
          </div>

          <div className="panel list-panel">
            <div className="panel-header">
              <h2>
                {selectedService
                  ? `Arrivi ${formatServiceLabel(selectedService)}`
                  : 'Mezzi in arrivo'}
              </h2>
              <span className="muted-label">
                {filteredArrivals.length} passaggi
              </span>
            </div>

            {loadingArrivals ? (
              <p className="empty-state">Caricamento arrivi realtime...</p>
            ) : !selectedStop ? (
              <p className="empty-state">
                Nessuna fermata selezionata.
              </p>
            ) : filteredArrivals.length === 0 ? (
              <p className="empty-state">
                Nessun passaggio disponibile per il servizio selezionato in questa
                fermata nel prossimo intervallo.
              </p>
            ) : (
              <ul className="arrival-list">
                {filteredArrivals.map((arrival) => (
                  <li key={`${arrival.tripId}-${arrival.predictedArrival}`}>
                    <article className="arrival-row">
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
                          {arrival.realtime
                            ? `${arrival.vehicleLabel ? `Mezzo ${arrival.vehicleLabel}` : 'Veicolo GTT'} · ${formatTime(arrival.predictedArrival)}`
                            : `Passaggio programmato · ${formatTime(arrival.predictedArrival)}`}
                        </span>
                      </span>

                      <span className="arrival-meta">
                        <strong>{formatCountdown(arrival.minutesUntil)}</strong>
                        <span
                          className={
                            arrival.delaySeconds !== null && arrival.delaySeconds > 0
                              ? 'delay-badge is-late'
                              : arrival.delaySeconds !== null && arrival.delaySeconds < 0
                                ? 'delay-badge is-early'
                                : 'delay-badge'
                          }
                        >
                          {arrival.realtime ? formatDelay(arrival.delaySeconds) : 'programmato'}
                        </span>
                      </span>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <main className="map-column">
          <div className="panel map-panel">
            <div className="map-panel-header">
              <div>
                <p className="map-label">Layer</p>
                <h2>Fermate vicine e fermata selezionata</h2>
              </div>
              <div className="map-legend">
                <span className="legend-dot legend-selected-stop">Fermata selezionata</span>
                <span className="legend-dot legend-nearby-stop">Fermate vicine</span>
                <span className="legend-dot legend-live-vehicle">Mezzi live</span>
                <span className="legend-dot legend-address-location">Indirizzo cercato</span>
                <span className="legend-dot legend-user-location">La tua posizione</span>
              </div>
            </div>

            <div className="map-frame">
              <MapView
                selectedStop={selectedStop}
                nearbyStops={nearbyStops}
                vehicleArrivals={visibleVehicleArrivals}
                focusLocation={derivedFocusLocation}
                onSelectStop={(stopCode) => {
                  setStopCodeInput(stopCode)
                  void loadArrivals(stopCode)
                }}
              />
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

export default App
