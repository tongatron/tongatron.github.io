const AIRPORTS_API_BASE = "https://www.ryanair.com/api/views/locate/3/airports";
const CHEAPEST_PER_DAY_API = "https://www.ryanair.com/api/farfnd/3/oneWayFares";
const RYANAIR_BOOKING_BASE = "https://www.ryanair.com";
const DEFAULT_ORIGIN_COUNTRY = "IT";
const DEFAULT_ORIGIN_AIRPORT = "TRN";
const DEFAULT_DESTINATION_SELECTION = "all";
const RYANAIR_BOOKING_PATHS = {
  it: "/it/it/trip/flights/select",
  en: "/gb/en/trip/flights/select",
};
const URL_FILTER_KEYS = {
  originScope: "scope",
  origin: "from",
  destination: "dest",
  months: "months",
  stay: "stay",
  tolerance: "tol",
  maxTotalPrice: "max",
  sort: "sort",
  view: "view",
  lang: "lang",
};

const I18N = {
  it: {
    pageTitle: "Ryanair Search",
    heroEyebrow: "Trova voli Ryanair",
    heroTitle: "voli Ryanair",
    heroDescription:
      "Trova le migliori offerte Ryanair per la tua vacanza. Scegli l'aeroporto di partenza, imposta budget e durata del soggiorno e scopri tutte le destinazioni raggiungibili.",
    ticketOriginLabel: "Partenza",
    ticketOriginFallbackText: "seleziona aeroporto",
    ticketDestinationLabel: "Destinazioni",
    ticketDestinationTitle: "Aeroporti",
    ticketDestinationSubtitle: "{count} aeroporti disponibili",
    ticketDestinationSubtitleEmpty: "seleziona aeroporto di partenza",
    ticketCaption: "Imposta i filtri qui sotto per trovare le combinazioni migliori in pochi secondi.",
    selectPlaceholder: "Seleziona",
    labelOriginScope: "Partenza da",
    originScopeItaly: "Italia",
    originScopeAll: "Tutti gli aeroporti",
    labelOriginAirport: "Aeroporto di partenza",
    labelDestination: "Aeroporto destinazione",
    labelMonths: "Mesi da analizzare",
    labelTargetStay: "Durata target (giorni)",
    labelTolerance: "Tolleranza (± giorni)",
    labelMaxPrice: "Spesa massima A/R (€)",
    labelSortMode: "Ordina per",
    sortDate: "Data",
    sortPrice: "Prezzo",
    labelViewMode: "Visualizza Lista/Schede",
    viewList: "Lista",
    viewCards: "Schede",
    buttonSearch: "Cerca voli",
    resultsTitleDate: "Risultati ordinati per data",
    resultsTitlePrice: "Risultati ordinati per prezzo",
    thDeparture: "Partenza",
    thReturn: "Ritorno",
    thDestination: "Destinazione",
    thDuration: "Durata",
    thTotalPrice: "Prezzo totale",
    thBook: "Acquista",
    destinationAll: "Tutte le destinazioni",
    destinationNone: "Nessuna destinazione disponibile",
    originNone: "Nessun aeroporto disponibile",
    statusReady: "Pronto.",
    loadingAirports: "Carico aeroporti Ryanair...",
    loadingPrices: "Recupero prezzi giornalieri Ryanair...",
    loadingPricesProgress: "Recupero prezzi Ryanair... {done}/{total} aeroporti",
    errorInit: "Errore inizializzazione aeroporti: {message}",
    errorInvalidParams: "Parametri non validi.",
    errorNoAirports: "Nessun aeroporto di partenza disponibile.",
    errorNoDestinations: "Nessuna destinazione disponibile per l'aeroporto selezionato.",
    errorSelectOrigin: "Seleziona un aeroporto di partenza.",
    errorSelectDestination: "Seleziona un aeroporto di destinazione.",
    errorAirportUnavailable: "Aeroporto selezionato non disponibile.",
    errorNetwork:
      "Errore rete/API: il browser non riesce a leggere Ryanair. Controlla console DevTools (F12) per CORS o blocchi rete.",
    errorSearch: "Errore durante la ricerca: {message}",
    errorAirportsRead: "Impossibile leggere l'elenco aeroporti Ryanair ({status})",
    errorPriceRead: "Errore prezzi {departure}→{arrival} ({status})",
    metaOriginAirport: "Partenza: {airport}",
    metaDestinationAll: "Destinazioni: tutte ({count})",
    metaDestinationSingle: "Destinazione: {airport}",
    metaDepartToday: "Partenza da oggi: {date}",
    metaMaxSpend: "Spesa massima A/R: € {max}",
    metaSelectionPending: "Seleziona aeroporto di partenza e destinazione per iniziare.",
    metaSearchPending: "Aggiorna la ricerca per vedere i risultati.",
    statusNoResults: "Nessun volo entro € {max} trovato con i filtri scelti.",
    statusFound: "Trovate {count} opzioni economiche.",
    statusFoundWithFailed:
      "Trovate {count} opzioni economiche. ({failed} aeroporti non disponibili: {codes})",
    days: "{count} giorni",
    detailsTitle: "Dettagli voli:",
    detailsRoute: "Tratta: {from} -> {to}",
    detailsOutbound: "Andata: {value}",
    detailsReturn: "Ritorno: {value}",
    detailsStay: "Permanenza: {days}",
    cardRoute: "Tratta:",
    cardOutbound: "Andata:",
    cardReturn: "Ritorno:",
    cardStay: "Permanenza:",
    cardTotal: "Totale A/R:",
    listDepartureTimeLabel: "partenza",
    listReturnTimeLabel: "ritorno",
    listTotalPriceLabel: "Totale A/R",
    legTemplate: "{departure} -> {arrival} (€ {price})",
    bookOnRyanair: "acquista su Ryanair",
    bookOnRyanairShort: "acquista",
    shareResults: "condividi risultati",
    shareResultsCopied: "link copiato",
    footerCreditPrefix: "realizzato grazie al modulo open-source",
    ariaLanguageGroup: "Selezione lingua",
    ariaViewMode: "Visualizzazione risultati",
  },
  en: {
    pageTitle: "Ryanair Search",
    heroEyebrow: "Find Ryanair flights",
    heroTitle: "Ryanair flights",
    heroDescription:
      "Find the best Ryanair deals for your vacation. Choose your departure airport, set your budget and trip length, and discover all reachable destinations.",
    ticketOriginLabel: "Departure",
    ticketOriginFallbackText: "choose an airport",
    ticketDestinationLabel: "Destinations",
    ticketDestinationTitle: "Airports",
    ticketDestinationSubtitle: "{count} airports available",
    ticketDestinationSubtitleEmpty: "choose a departure airport",
    ticketCaption: "Set the filters below to find the best combinations in a few seconds.",
    selectPlaceholder: "Select",
    labelOriginScope: "Departure from",
    originScopeItaly: "Italy",
    originScopeAll: "All airports",
    labelOriginAirport: "Departure airport",
    labelDestination: "Destination airport",
    labelMonths: "Months to analyze",
    labelTargetStay: "Target stay (days)",
    labelTolerance: "Tolerance (± days)",
    labelMaxPrice: "Max round-trip budget (€)",
    labelSortMode: "Sort by",
    sortDate: "Date",
    sortPrice: "Price",
    labelViewMode: "View List/Cards",
    viewList: "List",
    viewCards: "Cards",
    buttonSearch: "Search flights",
    resultsTitleDate: "Results sorted by date",
    resultsTitlePrice: "Results sorted by price",
    thDeparture: "Departure",
    thReturn: "Return",
    thDestination: "Destination",
    thDuration: "Duration",
    thTotalPrice: "Total price",
    thBook: "Book",
    destinationAll: "All destinations",
    destinationNone: "No destinations available",
    originNone: "No airports available",
    statusReady: "Ready.",
    loadingAirports: "Loading Ryanair airports...",
    loadingPrices: "Loading daily Ryanair fares...",
    loadingPricesProgress: "Loading fares... {done}/{total} airports",
    errorInit: "Airport initialization error: {message}",
    errorInvalidParams: "Invalid parameters.",
    errorNoAirports: "No departure airports available.",
    errorNoDestinations: "No destinations available for the selected departure airport.",
    errorSelectOrigin: "Select a departure airport.",
    errorSelectDestination: "Select a destination airport.",
    errorAirportUnavailable: "Selected airport is not available.",
    errorNetwork:
      "Network/API error: the browser could not read Ryanair data. Check DevTools (F12) for CORS or network blocking.",
    errorSearch: "Search error: {message}",
    errorAirportsRead: "Unable to load the Ryanair airport list ({status})",
    errorPriceRead: "Fare error {departure}→{arrival} ({status})",
    metaOriginAirport: "Departure: {airport}",
    metaDestinationAll: "Destinations: all ({count})",
    metaDestinationSingle: "Destination: {airport}",
    metaDepartToday: "Departing from today: {date}",
    metaMaxSpend: "Max round-trip budget: € {max}",
    metaSelectionPending: "Select departure and destination airports to begin.",
    metaSearchPending: "Update the search to view results.",
    statusNoResults: "No flights under € {max} found with the selected filters.",
    statusFound: "Found {count} low-cost options.",
    statusFoundWithFailed:
      "Found {count} low-cost options. ({failed} unavailable airports: {codes})",
    days: "{count} days",
    detailsTitle: "Flight details:",
    detailsRoute: "Route: {from} -> {to}",
    detailsOutbound: "Outbound: {value}",
    detailsReturn: "Return: {value}",
    detailsStay: "Stay: {days}",
    cardRoute: "Route:",
    cardOutbound: "Outbound:",
    cardReturn: "Return:",
    cardStay: "Stay:",
    cardTotal: "Round trip:",
    listDepartureTimeLabel: "departure",
    listReturnTimeLabel: "return",
    listTotalPriceLabel: "Round trip",
    legTemplate: "{departure} -> {arrival} (€ {price})",
    bookOnRyanair: "book on Ryanair",
    bookOnRyanairShort: "book",
    shareResults: "share results",
    shareResultsCopied: "link copied",
    footerCreditPrefix: "built thanks to the open-source module",
    ariaLanguageGroup: "Language selection",
    ariaViewMode: "Results view",
  },
};

const form = document.querySelector("#search-form");
const originScopeInput = document.querySelector("#origin-scope");
const originAirportInput = document.querySelector("#origin-airport");
const airportFilterInput = document.querySelector("#airport-filter");
const monthsInput = document.querySelector("#months");
const targetStayInput = document.querySelector("#target-stay");
const stayToleranceInput = document.querySelector("#stay-tolerance");
const maxTotalPriceInput = document.querySelector("#max-total-price");
const sortResultsInput = document.querySelector("#sort-results");
const viewModeInputs = document.querySelectorAll('input[name="view-mode"]');
const langButtons = document.querySelectorAll(".lang-btn");
const langSwitcherEl = document.querySelector(".lang-switcher");
const viewModeToggleEl = document.querySelector(".view-mode-toggle");
const viewModeRowEl = document.querySelector(".view-mode-row");

const heroEyebrowEl = document.querySelector("#hero-eyebrow");
const heroTitleEl = document.querySelector("#hero-title");
const heroDescriptionEl = document.querySelector("#hero-description");
const ticketOriginCodeEl = document.querySelector("#ticket-origin-code");
const ticketOriginLabelEl = document.querySelector("#ticket-origin-label");
const ticketOriginCityEl = document.querySelector("#ticket-origin-city");
const ticketDestinationLabelEl = document.querySelector("#ticket-destination-label");
const ticketDestinationTitleEl = document.querySelector("#ticket-destination-title");
const ticketDestinationSubtitleEl = document.querySelector("#ticket-destination-subtitle");
const ticketCaptionEl = document.querySelector("#ticket-caption");
const labelOriginScopeEl = document.querySelector("#label-origin-scope");
const originScopeItalyEl = document.querySelector("#origin-scope-italy");
const originScopeAllEl = document.querySelector("#origin-scope-all");
const labelOriginAirportEl = document.querySelector("#label-origin-airport");
const labelDestinationEl = document.querySelector("#label-destination");
const labelMonthsEl = document.querySelector("#label-months");
const labelTargetStayEl = document.querySelector("#label-target-stay");
const labelToleranceEl = document.querySelector("#label-tolerance");
const labelMaxPriceEl = document.querySelector("#label-max-price");
const labelSortModeEl = document.querySelector("#label-sort-mode");
const sortOptionDateEl = document.querySelector("#sort-option-date");
const sortOptionPriceEl = document.querySelector("#sort-option-price");
const labelViewModeEl = document.querySelector("#label-view-mode");
const viewLabelListEl = document.querySelector("#view-label-list");
const viewLabelCardsEl = document.querySelector("#view-label-cards");
const resultsTitleEl = document.querySelector("#results-title");
const thDepartureEl = document.querySelector("#th-departure");
const thReturnEl = document.querySelector("#th-return");
const thDestinationEl = document.querySelector("#th-destination");
const thDurationEl = document.querySelector("#th-duration");
const thTotalPriceEl = document.querySelector("#th-total-price");
const thBookEl = document.querySelector("#th-book");

const resultsBody = document.querySelector("#results-body");
const resultsPanelEl = document.querySelector("#results-panel");
const listViewEl = document.querySelector("#list-view");
const cardsViewEl = document.querySelector("#cards-view");
const statusEl = document.querySelector("#status");
const metaEl = document.querySelector("#meta");
const searchBtn = document.querySelector("#search-btn");
const searchBtnTextEl = document.querySelector("#search-btn-text");
const shareResultsBtn = document.querySelector("#share-results-btn");
const shareResultsBtnTextEl = document.querySelector("#share-results-btn-text");
const footerCreditPrefixEl = document.querySelector("#footer-credit-prefix");

const dailyFareCache = new Map();
const airportLookup = new Map();
let allAirports = [];
let originAirports = [];
let availableAirports = [];
let currentResults = [];
let currentLang = "it";
let lastRunContext = null;
let lastSearchSelection = null;
let isSearchInFlight = false;
let shareResetTimer = null;

const appReady = Boolean(
  form &&
    originScopeInput &&
    originAirportInput &&
    airportFilterInput &&
    monthsInput &&
    targetStayInput &&
    stayToleranceInput &&
    maxTotalPriceInput &&
    sortResultsInput &&
    viewModeInputs.length > 0 &&
    resultsPanelEl &&
    resultsBody &&
    statusEl &&
    metaEl &&
    searchBtn &&
    shareResultsBtn
);

if (!appReady) {
  console.error("Markup non allineato: alcuni elementi DOM richiesti non sono presenti.");
  document.body.insertAdjacentHTML(
    "afterbegin",
    '<p style="margin:12px;font-family:sans-serif;color:#c8512c;">Errore caricamento UI: aggiorna la pagina (Ctrl/Cmd+Shift+R) e verifica che il deploy GitHub Pages sia completo.</p>'
  );
} else {
  void initializeApp();
}

async function initializeApp() {
  const initialFilters = readFiltersFromUrl();
  setLanguage(initialFilters.lang, { updateUrl: false, rerender: false });
  applyInitialFilters(initialFilters);

  form.addEventListener("submit", onSubmit);

  shareResultsBtn.addEventListener("click", copyResultsLink);

  originScopeInput.addEventListener("change", () => {
    refreshAirportControls({
      preferredOriginCode: originAirportInput?.value ?? "",
      preferredDestinationCode: airportFilterInput?.value ?? "all",
    });
    updateUrlFromCurrentFilters();
    syncResultsPanelVisibility();
  });

  originAirportInput.addEventListener("change", () => {
    refreshDestinationOptions({ preferredDestinationCode: airportFilterInput?.value ?? "all" });
    updateUrlFromCurrentFilters();
    syncResultsPanelVisibility();
  });

  airportFilterInput.addEventListener("change", () => {
    updateUrlFromCurrentFilters();
    syncResultsPanelVisibility();
  });

  sortResultsInput.addEventListener("change", () => {
    updateResultsHeading();
    renderResults(currentResults);
    updateUrlFromCurrentFilters();
  });

  for (const button of langButtons) {
    button.addEventListener("click", () => {
      const nextLang = normalizeLanguage(button.dataset.lang);
      if (nextLang === currentLang) {
        return;
      }
      setLanguage(nextLang);
    });
  }

  for (const input of viewModeInputs) {
    input.addEventListener("change", () => {
      renderResults(currentResults);
      updateUrlFromCurrentFilters();
    });
  }

  for (const input of [monthsInput, targetStayInput, stayToleranceInput, maxTotalPriceInput]) {
    input.addEventListener("change", syncResultsPanelVisibility);
  }

  setLoading(true, t("loadingAirports"));

  try {
    allAirports = await fetchAirportCatalog();
    airportLookup.clear();
    for (const airport of allAirports) {
      airportLookup.set(airport.code, airport);
    }
    refreshAirportControls({
      preferredOriginCode: initialFilters.originCode || DEFAULT_ORIGIN_AIRPORT,
      preferredDestinationCode: initialFilters.destinationCode || DEFAULT_DESTINATION_SELECTION,
    });
    updateUrlFromCurrentFilters();
    applyViewMode();
    if (hasActiveSearchSelection(initialFilters)) {
      await runSearch({ updateUrl: false });
    } else {
      renderPendingMeta();
      syncResultsPanelVisibility();
    }
  } catch (error) {
    setError(t("errorInit", { message: error.message }));
  } finally {
    setLoading(false);
  }
}

async function onSubmit(event) {
  event.preventDefault();
  await runSearch();
}

async function runSearch({ updateUrl = true } = {}) {
  const dateFrom = localTodayIso();
  const months = Number(monthsInput?.value ?? 3);
  const targetStay = Number(targetStayInput?.value ?? 5);
  const tolerance = Number(stayToleranceInput?.value ?? 1);
  const maxTotalPrice = Number(maxTotalPriceInput?.value ?? 70);
  const selectedOriginAirport = getSelectedOriginAirport();
  const selectedAirportCode = airportFilterInput?.value ?? "";

  if (
    Number.isNaN(months) ||
    months < 1 ||
    Number.isNaN(targetStay) ||
    targetStay < 1 ||
    Number.isNaN(tolerance) ||
    tolerance < 0 ||
    Number.isNaN(maxTotalPrice) ||
    maxTotalPrice <= 0
  ) {
    setError(t("errorInvalidParams"));
    return;
  }

  if (!selectedOriginAirport) {
    setError(t("errorSelectOrigin"));
    return;
  }

  if (availableAirports.length === 0) {
    setError(t("errorNoDestinations"));
    return;
  }

  if (!selectedAirportCode) {
    setError(t("errorSelectDestination"));
    return;
  }

  const airportsToSearch =
    selectedAirportCode === "all"
      ? availableAirports
      : availableAirports.filter((airport) => airport.code === selectedAirportCode);

  if (airportsToSearch.length === 0) {
    setError(t("errorAirportUnavailable"));
    return;
  }

  if (updateUrl) {
    updateUrlFromCurrentFilters();
  }

  lastSearchSelection = getCurrentSearchSelection();
  isSearchInFlight = true;
  setResultsPanelVisibility(true);

  const dateTo = addDaysIso(addMonthsIso(dateFrom, months), -1);
  const outboundMonths = monthsBetween(dateFrom, dateTo);
  const returnWindowFrom = addDaysIso(dateFrom, Math.max(1, targetStay - tolerance));
  const returnWindowTo = addDaysIso(dateTo, targetStay + tolerance);
  const inboundMonths = monthsBetween(returnWindowFrom, returnWindowTo);

  setShareButtonVisibility(false);
  setLoading(true, t("loadingPrices"));
  currentResults = [];
  clearResults();

  try {
    let completed = 0;
    const totalAirports = airportsToSearch.length;
    const concurrency = totalAirports > 12 ? 4 : Math.min(6, totalAirports);

    const perAirportResults = await mapWithConcurrency(
      airportsToSearch,
      concurrency,
      async (airport) => {
        try {
          const fares = await buildRoundTripCandidates({
            originAirport: selectedOriginAirport,
            destinationAirport: airport,
            dateFrom,
            dateTo,
            targetStay,
            tolerance,
            outboundMonths,
            inboundMonths,
          });
          return { airport, fares, error: null };
        } catch (error) {
          return { airport, fares: [], error };
        } finally {
          completed += 1;
          setLoading(true, t("loadingPricesProgress", { done: completed, total: totalAirports }));
        }
      }
    );

    const failedAirports = perAirportResults
      .filter((entry) => entry.error)
      .map((entry) => entry.airport.code);

    let merged = perAirportResults.flatMap((entry) => entry.fares);

    merged = merged
      .filter((fare) => fare.totalPrice <= maxTotalPrice)
      .sort((a, b) => {
        const dateDiff = new Date(a.outboundDate) - new Date(b.outboundDate);
        if (dateDiff !== 0) {
          return dateDiff;
        }
        return a.totalPrice - b.totalPrice;
      });

    if (selectedAirportCode !== "all") {
      merged = pickCheapestByOutboundDate(merged);
    }

    lastRunContext = {
      originAirport: selectedOriginAirport,
      selectedAirportCode,
      airportsCount: airportsToSearch.length,
      selectedAirport: airportsToSearch[0] ?? null,
      dateFrom,
      maxTotalPrice,
      resultCount: merged.length,
      failedAirports,
      empty: merged.length === 0,
    };

    renderMeta(lastRunContext);

    if (merged.length === 0) {
      renderStatus(lastRunContext);
      return;
    }

    currentResults = merged;
    renderResults(currentResults);
    renderStatus(lastRunContext);
  } catch (error) {
    lastRunContext = null;
    const isNetworkError = error?.message === "Failed to fetch" || error instanceof TypeError;
    if (isNetworkError) {
      setError(t("errorNetwork"));
    } else {
      setError(t("errorSearch", { message: error.message }));
    }
  } finally {
    isSearchInFlight = false;
    syncResultsPanelVisibility();
    setLoading(false);
  }
}

async function fetchAirportCatalog() {
  const [itResponse, enResponse] = await Promise.all([
    fetch(buildAirportsApiUrl("it")),
    fetch(buildAirportsApiUrl("en")),
  ]);

  if (!itResponse.ok || !enResponse.ok) {
    const statuses = [itResponse.status, enResponse.status].filter(Boolean).join("/");
    throw new Error(t("errorAirportsRead", { status: statuses }));
  }

  const [itAirports, enAirports] = await Promise.all([itResponse.json(), enResponse.json()]);
  const airportsMap = new Map();

  for (const airport of itAirports) {
    mergeAirportIntoCatalog(airportsMap, airport, "it");
  }

  for (const airport of enAirports) {
    mergeAirportIntoCatalog(airportsMap, airport, "en");
  }

  return [...airportsMap.values()];
}

function buildAirportsApiUrl(locale) {
  const normalizedLocale = locale === "en" ? "en" : "it";
  return `${AIRPORTS_API_BASE}/${normalizedLocale}/active`;
}

function mergeAirportIntoCatalog(airportsMap, rawAirport, locale) {
  const code = rawAirport?.iataCode?.trim().toUpperCase();
  if (!code) {
    return;
  }

  const existing = airportsMap.get(code) ?? {
    code,
    names: {},
    countryCode: "",
    cityCode: "",
    routeAirportCodes: [],
  };

  existing.names[locale] = rawAirport?.name?.trim() || code;
  existing.countryCode = (rawAirport?.countryCode ?? existing.countryCode).toUpperCase();
  existing.cityCode = rawAirport?.cityCode ?? existing.cityCode;

  const routeCodes = extractRouteAirportCodes(rawAirport?.routes ?? []);
  if (routeCodes.length > 0) {
    existing.routeAirportCodes = [...new Set([...existing.routeAirportCodes, ...routeCodes])];
  }

  airportsMap.set(code, existing);
}

function extractRouteAirportCodes(routes) {
  return routes
    .filter((route) => typeof route === "string" && route.startsWith("airport:"))
    .map((route) => route.slice("airport:".length).trim().toUpperCase())
    .filter(Boolean);
}

function refreshAirportControls({ preferredOriginCode = null, preferredDestinationCode = null } = {}) {
  syncOriginScopeWithPreferredOrigin(preferredOriginCode);
  populateOriginAirportFilter(getOriginAirportsForScope(getOriginScope()), preferredOriginCode);
  refreshDestinationOptions({ preferredDestinationCode });
}

function refreshDestinationOptions({ preferredDestinationCode = null } = {}) {
  const originAirport = getSelectedOriginAirport();
  updateOriginPreview(originAirport);
  availableAirports = getReachableDestinations(originAirport);
  populateDestinationFilter(availableAirports, preferredDestinationCode);
  updateDestinationPreview(availableAirports.length);
}

function syncOriginScopeWithPreferredOrigin(preferredOriginCode) {
  const normalizedPreferredCode = preferredOriginCode?.trim().toUpperCase() ?? "";
  if (!normalizedPreferredCode) {
    return;
  }

  const preferredAirport = getAirportByCode(normalizedPreferredCode);
  if (preferredAirport && preferredAirport.countryCode !== DEFAULT_ORIGIN_COUNTRY) {
    originScopeInput.value = "all";
  }
}

function getOriginAirportsForScope(scope) {
  return sortAirports(
    allAirports.filter((airport) => {
      if (airport.routeAirportCodes.length === 0) {
        return false;
      }
      if (scope === "all") {
        return true;
      }
      return airport.countryCode === DEFAULT_ORIGIN_COUNTRY;
    })
  );
}

function getReachableDestinations(originAirport) {
  if (!originAirport) {
    return [];
  }

  const routeCodes = new Set(originAirport.routeAirportCodes);
  return sortAirports(allAirports.filter((airport) => routeCodes.has(airport.code)));
}

function populateOriginAirportFilter(airports, preferredCode = null) {
  if (!originAirportInput) {
    return;
  }

  originAirports = airports;
  originAirportInput.innerHTML = "";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = t("selectPlaceholder");
  originAirportInput.appendChild(placeholderOption);

  if (airports.length === 0) {
    originAirportInput.disabled = true;
    originAirportInput.value = "";
    return;
  }

  originAirportInput.disabled = false;

  for (const airport of airports) {
    const option = document.createElement("option");
    option.value = airport.code;
    option.textContent = formatAirportFilterLabel(airport);
    originAirportInput.appendChild(option);
  }

  const normalizedPreferredCode = normalizeDestinationCode(preferredCode);
  const hasPreferred = airports.some((airport) => airport.code === normalizedPreferredCode);
  const hasDefaultOrigin = airports.some((airport) => airport.code === DEFAULT_ORIGIN_AIRPORT);

  if (hasPreferred) {
    originAirportInput.value = normalizedPreferredCode;
  } else if (hasDefaultOrigin) {
    originAirportInput.value = DEFAULT_ORIGIN_AIRPORT;
  } else {
    originAirportInput.value = "";
  }
}

function populateDestinationFilter(airports, preferredCode = null) {
  if (!airportFilterInput) {
    return;
  }

  airportFilterInput.innerHTML = "";
  airportFilterInput.disabled = airports.length === 0;

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = t("selectPlaceholder");
  airportFilterInput.appendChild(placeholderOption);

  if (airports.length === 0) {
    airportFilterInput.value = "";
    return;
  }

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = t("destinationAll");
  airportFilterInput.appendChild(allOption);

  for (const airport of airports) {
    const option = document.createElement("option");
    option.value = airport.code;
    option.textContent = formatAirportFilterLabel(airport);
    airportFilterInput.appendChild(option);
  }

  const normalizedPreferredCode = normalizeDestinationCode(preferredCode);
  const hasPreferred = airports.some((airport) => airport.code === normalizedPreferredCode);

  if (!normalizedPreferredCode) {
    airportFilterInput.value = DEFAULT_DESTINATION_SELECTION;
  } else if (hasPreferred) {
    airportFilterInput.value = normalizedPreferredCode;
  } else if (normalizedPreferredCode === "all") {
    airportFilterInput.value = "all";
  } else {
    airportFilterInput.value = "";
  }
}

async function buildRoundTripCandidates({
  originAirport,
  destinationAirport,
  dateFrom,
  dateTo,
  targetStay,
  tolerance,
  outboundMonths,
  inboundMonths,
}) {
  const outboundMap = await fetchDailyFaresForMonths(originAirport.code, destinationAirport.code, outboundMonths);
  const inboundMap = await fetchDailyFaresForMonths(destinationAirport.code, originAirport.code, inboundMonths);

  const minStay = Math.max(1, targetStay - tolerance);
  const maxStay = targetStay + tolerance;

  const candidates = [];

  for (const [outboundDay, outboundFare] of outboundMap.entries()) {
    if (outboundDay < dateFrom || outboundDay > dateTo) {
      continue;
    }

    let bestInbound = null;
    let bestStay = 0;

    for (let stayDays = minStay; stayDays <= maxStay; stayDays += 1) {
      const returnDay = addDaysIso(outboundDay, stayDays);
      const inboundFare = inboundMap.get(returnDay);

      if (!inboundFare) {
        continue;
      }

      if (!bestInbound || inboundFare.price < bestInbound.price) {
        bestInbound = inboundFare;
        bestStay = stayDays;
      }
    }

    if (!bestInbound) {
      continue;
    }

    candidates.push({
      outboundDate: outboundFare.departureDate,
      outboundArrivalDate: outboundFare.arrivalDate,
      inboundDate: bestInbound.departureDate,
      inboundArrivalDate: bestInbound.arrivalDate,
      tripDays: bestStay,
      originCode: originAirport.code,
      outboundPrice: outboundFare.price,
      inboundPrice: bestInbound.price,
      totalPrice: roundCurrency(outboundFare.price + bestInbound.price),
      airportCode: destinationAirport.code,
    });
  }

  return candidates;
}

async function fetchDailyFaresForMonths(departureCode, arrivalCode, monthStarts) {
  const monthlyMaps = await Promise.all(
    monthStarts.map((monthStart) =>
      fetchCheapestDailyMap({
        departureCode,
        arrivalCode,
        monthStart,
      })
    )
  );

  const merged = new Map();

  for (const monthMap of monthlyMaps) {
    for (const [day, fare] of monthMap.entries()) {
      const current = merged.get(day);
      if (!current || fare.price < current.price) {
        merged.set(day, fare);
      }
    }
  }

  return merged;
}

async function fetchCheapestDailyMap({ departureCode, arrivalCode, monthStart }) {
  const cacheKey = `${departureCode}-${arrivalCode}-${monthStart}`;
  if (dailyFareCache.has(cacheKey)) {
    return dailyFareCache.get(cacheKey);
  }

  const params = new URLSearchParams({
    outboundMonthOfDate: monthStart,
    market: "it-it",
    currency: "EUR",
  });

  const url = `${CHEAPEST_PER_DAY_API}/${departureCode}/${arrivalCode}/cheapestPerDay?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      t("errorPriceRead", {
        departure: departureCode,
        arrival: arrivalCode,
        status: response.status,
      })
    );
  }

  const data = await response.json();
  const fares = data?.outbound?.fares ?? [];

  const map = new Map();

  for (const fare of fares) {
    if (!fare || fare.unavailable || fare.soldOut || !fare.price) {
      continue;
    }

    const day = fare.day;
    const existing = map.get(day);
    const price = Number(fare.price.value);

    if (!existing || price < existing.price) {
      map.set(day, {
        day,
        departureDate: fare.departureDate,
        arrivalDate: fare.arrivalDate,
        price,
      });
    }
  }

  dailyFareCache.set(cacheKey, map);
  return map;
}

function pickCheapestByOutboundDate(fares) {
  const byDate = new Map();

  for (const fare of fares) {
    const dateKey = fare.outboundDate.slice(0, 10);
    const current = byDate.get(dateKey);

    if (!current || fare.totalPrice < current.totalPrice) {
      byDate.set(dateKey, fare);
    }
  }

  return [...byDate.values()];
}

function renderResults(fares) {
  applyViewMode();
  clearResults();
  const sortedFares = sortResults(fares);

  if (getViewMode() === "cards") {
    renderCards(sortedFares);
    return;
  }

  renderListRows(sortedFares);
}

function renderListRows(fares) {
  for (const fare of fares) {
    const bookingUrl = buildRyanairBookingUrl(fare);
    const item = document.createElement("article");
    item.className = "results-list-item";

    const row = document.createElement("div");
    row.className = "result-row-card";
    row.innerHTML = `
      <div class="result-cell result-cell-departure">
        <div class="result-section-label">${t("thDeparture")}</div>
        <div class="flight-cell">
          <span class="cell-icon icon-departure"><i class="bi bi-send-arrow-up" aria-hidden="true"></i></span>
          <div>
            <div class="fw-semibold cell-date-line">${formatDateWithWeekday(fare.outboundDate)}</div>
            <div class="cell-subline">${t("listDepartureTimeLabel")}: ${formatTime(fare.outboundDate)}</div>
            <div class="cell-caption">${formatOrigin(fare)}</div>
            <div class="cell-price-chip">
              <i class="bi bi-currency-euro" aria-hidden="true"></i>
              ${formatPrice(fare.outboundPrice)}
            </div>
          </div>
        </div>
      </div>
      <div class="result-cell result-cell-return">
        <div class="result-section-label">${t("thReturn")}</div>
        <div class="flight-cell">
          <span class="cell-icon icon-return"><i class="bi bi-send-arrow-down" aria-hidden="true"></i></span>
          <div>
            <div class="fw-semibold cell-date-line">${formatDateWithWeekday(fare.inboundDate)}</div>
            <div class="cell-subline">${t("listReturnTimeLabel")}: ${formatTime(fare.inboundDate)}</div>
            <div class="cell-caption">${formatDestination(fare)}</div>
            <div class="cell-price-chip">
              <i class="bi bi-currency-euro" aria-hidden="true"></i>
              ${formatPrice(fare.inboundPrice)}
            </div>
          </div>
        </div>
      </div>
      <div class="result-cell result-cell-destination">
        <div class="result-section-label">${t("thDestination")}</div>
        <div class="flight-cell">
          <span class="cell-icon icon-destination"><i class="bi bi-geo-alt-fill" aria-hidden="true"></i></span>
          <div class="fw-semibold">${formatDestination(fare)}</div>
        </div>
      </div>
      <div class="result-cell result-cell-controls">
        <div class="result-controls-pills">
          <span class="table-pill table-pill-duration">
            <i class="bi bi-calendar3" aria-hidden="true"></i>
            ${t("days", { count: fare.tripDays })}
          </span>
          <span class="table-price table-price-total">
            <span class="price-inline-label">${t("listTotalPriceLabel")}</span>
            <i class="bi bi-currency-euro" aria-hidden="true"></i>
            ${formatPrice(fare.totalPrice)}
          </span>
        </div>
        <div class="result-cell-book">
          <a class="book-link-btn book-link-btn-inline" href="${bookingUrl}" target="_blank" rel="noopener noreferrer">
            <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i>
            <span>${t("bookOnRyanairShort")}</span>
          </a>
        </div>
      </div>
    `;

    item.appendChild(row);
    resultsBody.appendChild(item);
  }
}

function renderCards(fares) {
  if (!cardsViewEl) {
    return;
  }

  for (const fare of fares) {
    const bookingUrl = buildRyanairBookingUrl(fare);
    const card = document.createElement("article");
    card.className = "flight-card col-12 col-xl-6";
    card.innerHTML = `
      <div class="card border-0 h-100">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
            <div>
              <span class="flight-route-badge">
                <i class="bi bi-arrow-left-right" aria-hidden="true"></i>
                ${formatOrigin(fare)} → ${formatDestination(fare)}
              </span>
              <h3 class="flight-card-title mt-3 mb-0">${formatDateTimeWithWeekday(fare.outboundDate)}</h3>
            </div>
            <div class="card-total-badge">
              <div class="card-total-label">${t("cardTotal")}</div>
              <div class="card-total-value">
                <i class="bi bi-currency-euro" aria-hidden="true"></i>
                ${formatPrice(fare.totalPrice)}
              </div>
            </div>
          </div>

          <div class="flight-timeline mb-3">
            <div class="timeline-leg">
              <span class="cell-icon icon-departure"><i class="bi bi-send-arrow-up" aria-hidden="true"></i></span>
              <div>
                <div class="detail-label">
                  <i class="bi bi-send-arrow-up" aria-hidden="true"></i>
                  <span>${t("cardOutbound")}</span>
                </div>
                <div class="detail-value">${formatLegDetails(
                  fare.outboundDate,
                  fare.outboundArrivalDate,
                  fare.outboundPrice
                )}</div>
              </div>
            </div>

            <div class="timeline-leg">
              <span class="cell-icon icon-return"><i class="bi bi-send-arrow-down" aria-hidden="true"></i></span>
              <div>
                <div class="detail-label">
                  <i class="bi bi-send-arrow-down" aria-hidden="true"></i>
                  <span>${t("cardReturn")}</span>
                </div>
                <div class="detail-value">${formatLegDetails(
                  fare.inboundDate,
                  fare.inboundArrivalDate,
                  fare.inboundPrice
                )}</div>
              </div>
            </div>
          </div>

          <div class="d-flex flex-wrap gap-2">
            <span class="table-pill">
              <i class="bi bi-calendar3" aria-hidden="true"></i>
              ${t("cardStay")} ${t("days", { count: fare.tripDays })}
            </span>
            <span class="table-pill">
              <i class="bi bi-geo-alt" aria-hidden="true"></i>
              ${formatDestination(fare)}
            </span>
          </div>

          <div class="flight-card-actions mt-4">
            <a class="book-link-btn" href="${bookingUrl}" target="_blank" rel="noopener noreferrer">
              <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i>
              <span>${t("bookOnRyanair")}</span>
            </a>
          </div>
        </div>
      </div>
    `;
    cardsViewEl.appendChild(card);
  }
}

function applyViewMode() {
  if (!listViewEl || !cardsViewEl) {
    return;
  }

  const showCards = getViewMode() === "cards";
  listViewEl.classList.toggle("hidden", showCards);
  cardsViewEl.classList.toggle("hidden", !showCards);
}

function clearResults() {
  resultsBody.innerHTML = "";
  if (cardsViewEl) {
    cardsViewEl.innerHTML = "";
  }
}

function setLoading(isLoading, text = "") {
  searchBtn.disabled = isLoading;
  searchBtn.setAttribute("aria-busy", isLoading ? "true" : "false");
  shareResultsBtn.disabled = isLoading;
  if (isLoading && text) {
    statusEl.classList.remove("error");
    statusEl.textContent = text;
  }
}

function setError(message) {
  setResultsPanelVisibility(true);
  statusEl.classList.add("error");
  statusEl.textContent = message;
  setShareButtonVisibility(false);
}

function renderMeta(context) {
  const originText = t("metaOriginAirport", {
    airport: formatAirportLabel(context.originAirport),
  });
  const destinationText =
    context.selectedAirportCode === "all"
      ? t("metaDestinationAll", { count: context.airportsCount })
      : t("metaDestinationSingle", { airport: formatAirportLabel(context.selectedAirport) });

  metaEl.textContent = [
    originText,
    destinationText,
    t("metaDepartToday", { date: formatDate(context.dateFrom) }),
    t("metaMaxSpend", { max: formatPrice(context.maxTotalPrice) }),
  ].join(" • ");
}

function renderPendingMeta() {
  const hasRequiredSelection = hasActiveSearchSelection(getCurrentSearchSelection());
  metaEl.textContent = t(hasRequiredSelection ? "metaSearchPending" : "metaSelectionPending");
  statusEl.classList.remove("error");
  statusEl.textContent = t("statusReady");
}

function renderStatus(context) {
  statusEl.classList.remove("error");
  setShareButtonVisibility(true);

  if (context.empty) {
    statusEl.textContent = t("statusNoResults", { max: formatPrice(context.maxTotalPrice) });
    return;
  }

  if (context.failedAirports.length > 0) {
    statusEl.textContent = t("statusFoundWithFailed", {
      count: context.resultCount,
      failed: context.failedAirports.length,
      codes: context.failedAirports.join(", "),
    });
    return;
  }

  statusEl.textContent = t("statusFound", { count: context.resultCount });
}

function monthsBetween(startIso, endIso) {
  const start = parseIsoDate(startIso);
  start.setUTCDate(1);

  const end = parseIsoDate(endIso);
  end.setUTCDate(1);

  const months = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    months.push(toIsoDate(cursor));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return months;
}

function parseIsoDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function addDaysIso(isoDate, days) {
  const date = parseIsoDate(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

function addMonthsIso(isoDate, months) {
  const date = parseIsoDate(isoDate);
  date.setUTCMonth(date.getUTCMonth() + months);
  return toIsoDate(date);
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function localTodayIso() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(isoDate) {
  return new Intl.DateTimeFormat(getDateLocale(), {
    dateStyle: "medium",
  }).format(parseIsoDate(isoDate));
}

function formatDateWithWeekday(value) {
  return new Intl.DateTimeFormat(getDateLocale(), {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTimeWithWeekday(value) {
  return new Intl.DateTimeFormat(getDateLocale(), {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTime(value) {
  return new Intl.DateTimeFormat(getDateLocale(), {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function isSameDay(a, b) {
  const dateA = new Date(a);
  const dateB = new Date(b);

  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function formatLegDetails(departureDateTime, arrivalDateTime, price) {
  const departureText = formatDateTimeWithWeekday(departureDateTime);
  const arrivalText = isSameDay(departureDateTime, arrivalDateTime)
    ? formatTime(arrivalDateTime)
    : formatDateTimeWithWeekday(arrivalDateTime);

  return t("legTemplate", {
    departure: departureText,
    arrival: arrivalText,
    price: formatPrice(price),
  });
}

function formatAirportLabel(airport) {
  if (!airport) {
    return "";
  }
  const airportName = getAirportName(airport);
  if (!airportName || airportName === airport.code) {
    return airport.code;
  }
  return `${airportName} · ${airport.code}`;
}

function formatAirportFilterLabel(airport) {
  return formatAirportLabel(airport);
}

function formatDestination(fare) {
  return formatAirportLabel(getAirportByCode(fare.airportCode) ?? { code: fare.airportCode, names: {} });
}

function formatOrigin(fare) {
  return formatAirportLabel(getAirportByCode(fare.originCode) ?? { code: fare.originCode, names: {} });
}

function buildRyanairBookingUrl(fare) {
  const path = RYANAIR_BOOKING_PATHS[currentLang] ?? RYANAIR_BOOKING_PATHS.it;
  const outboundDate = fare.outboundDate.slice(0, 10);
  const inboundDate = fare.inboundDate.slice(0, 10);
  const params = new URLSearchParams({
    adults: "1",
    teens: "0",
    children: "0",
    infants: "0",
    dateOut: outboundDate,
    dateIn: inboundDate,
    isConnectedFlight: "false",
    discount: "0",
    promoCode: "",
    isReturn: "true",
    originIata: fare.originCode,
    destinationIata: fare.airportCode,
    tpAdults: "1",
    tpTeens: "0",
    tpChildren: "0",
    tpInfants: "0",
    tpStartDate: outboundDate,
    tpEndDate: inboundDate,
    tpDiscount: "0",
    tpPromoCode: "",
    tpOriginIata: fare.originCode,
    tpDestinationIata: fare.airportCode,
  });

  return `${RYANAIR_BOOKING_BASE}${path}?${params.toString()}`;
}

function formatPrice(value) {
  return new Intl.NumberFormat(getNumberLocale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function getSortMode() {
  return sortResultsInput?.value === "price" ? "price" : "date";
}

function setSortMode(mode) {
  if (sortResultsInput) {
    sortResultsInput.value = mode === "price" ? "price" : "date";
  }
}

function sortResults(fares) {
  return [...fares].sort((a, b) => {
    if (getSortMode() === "price") {
      const priceDiff = a.totalPrice - b.totalPrice;
      if (priceDiff !== 0) {
        return priceDiff;
      }
    }

    const dateDiff = new Date(a.outboundDate) - new Date(b.outboundDate);
    if (dateDiff !== 0) {
      return dateDiff;
    }

    const priceDiff = a.totalPrice - b.totalPrice;
    if (priceDiff !== 0) {
      return priceDiff;
    }

    return formatDestination(a).localeCompare(formatDestination(b), currentLang === "en" ? "en" : "it", {
      sensitivity: "base",
    });
  });
}

function getViewMode() {
  const selected = document.querySelector('input[name="view-mode"]:checked');
  return selected?.value === "cards" ? "cards" : "list";
}

function setViewMode(mode) {
  const normalizedMode = mode === "cards" ? "cards" : "list";
  for (const input of viewModeInputs) {
    input.checked = input.value === normalizedMode;
  }
}

function readFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);

  return {
    originScope: normalizeOriginScope(params.get(URL_FILTER_KEYS.originScope)),
    originCode: params.get(URL_FILTER_KEYS.origin)?.trim().toUpperCase() ?? "",
    destinationCode: normalizeDestinationCode(params.get(URL_FILTER_KEYS.destination)),
    months: parseIntegerInRange(params.get(URL_FILTER_KEYS.months), 1, 12),
    stay: parseIntegerInRange(params.get(URL_FILTER_KEYS.stay), 1, 30),
    tolerance: parseIntegerInRange(params.get(URL_FILTER_KEYS.tolerance), 0, 7),
    maxTotalPrice: parseIntegerInRange(params.get(URL_FILTER_KEYS.maxTotalPrice), 1, 2000),
    sort: params.get(URL_FILTER_KEYS.sort) === "price" ? "price" : "date",
    view: params.get(URL_FILTER_KEYS.view) === "cards" ? "cards" : "list",
    lang: normalizeLanguage(params.get(URL_FILTER_KEYS.lang) ?? getBrowserLanguage()),
  };
}

function applyInitialFilters(filters) {
  originScopeInput.value = normalizeOriginScope(filters.originScope);
  if (Number.isFinite(filters.months)) {
    monthsInput.value = String(filters.months);
  }
  if (Number.isFinite(filters.stay)) {
    targetStayInput.value = String(filters.stay);
  }
  if (Number.isFinite(filters.tolerance)) {
    stayToleranceInput.value = String(filters.tolerance);
  }
  if (Number.isFinite(filters.maxTotalPrice)) {
    maxTotalPriceInput.value = String(filters.maxTotalPrice);
  }
  setSortMode(filters.sort);
  updateResultsHeading();
  setViewMode(filters.view);
}

function hasActiveSearchSelection(filters) {
  return Boolean(filters.originCode) && Boolean(filters.destinationCode);
}

function getCurrentSearchSelection() {
  return {
    originCode: originAirportInput?.value?.trim().toUpperCase() ?? "",
    destinationCode: normalizeDestinationCode(airportFilterInput?.value),
    months: monthsInput?.value ?? "",
    stay: targetStayInput?.value ?? "",
    tolerance: stayToleranceInput?.value ?? "",
    maxTotalPrice: maxTotalPriceInput?.value ?? "",
  };
}

function matchesSearchSelection(currentSelection, previousSelection) {
  if (!currentSelection || !previousSelection) {
    return false;
  }

  return (
    currentSelection.originCode === previousSelection.originCode &&
    currentSelection.destinationCode === previousSelection.destinationCode &&
    currentSelection.months === previousSelection.months &&
    currentSelection.stay === previousSelection.stay &&
    currentSelection.tolerance === previousSelection.tolerance &&
    currentSelection.maxTotalPrice === previousSelection.maxTotalPrice
  );
}

function setResultsPanelVisibility(isVisible) {
  resultsPanelEl.classList.toggle("hidden", !isVisible);
}

function syncResultsPanelVisibility() {
  const currentSelection = getCurrentSearchSelection();
  const shouldShow =
    isSearchInFlight ||
    (hasActiveSearchSelection(currentSelection) &&
      matchesSearchSelection(currentSelection, lastSearchSelection));

  setResultsPanelVisibility(shouldShow);

  if (!shouldShow) {
    setShareButtonVisibility(false);
    if (!statusEl.classList.contains("error")) {
      renderPendingMeta();
    }
  }
}

function updateUrlFromCurrentFilters() {
  const params = new URLSearchParams(window.location.search);

  params.set(URL_FILTER_KEYS.originScope, getOriginScope());
  params.set(URL_FILTER_KEYS.origin, originAirportInput?.value ?? "");
  params.set(URL_FILTER_KEYS.destination, airportFilterInput?.value ?? "all");
  params.set(URL_FILTER_KEYS.months, monthsInput?.value ?? "3");
  params.set(URL_FILTER_KEYS.stay, targetStayInput?.value ?? "5");
  params.set(URL_FILTER_KEYS.tolerance, stayToleranceInput?.value ?? "1");
  params.set(URL_FILTER_KEYS.maxTotalPrice, maxTotalPriceInput?.value ?? "70");
  params.set(URL_FILTER_KEYS.sort, getSortMode());
  params.set(URL_FILTER_KEYS.view, getViewMode());
  params.set(URL_FILTER_KEYS.lang, currentLang);

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", nextUrl);
}

function normalizeOriginScope(value) {
  return value === "all" ? "all" : "it";
}

function normalizeDestinationCode(value) {
  const normalizedValue = value?.trim() ?? "";
  if (!normalizedValue) {
    return "";
  }

  return normalizedValue.toLowerCase() === "all" ? "all" : normalizedValue.toUpperCase();
}

function getOriginScope() {
  return normalizeOriginScope(originScopeInput?.value);
}

function getSelectedOriginAirport() {
  const selectedCode = originAirportInput?.value?.trim().toUpperCase() ?? "";
  return originAirports.find((airport) => airport.code === selectedCode) ?? null;
}

function getAirportByCode(code) {
  const normalizedCode = code?.trim().toUpperCase() ?? "";
  return airportLookup.get(normalizedCode) ?? null;
}

function getAirportName(airport) {
  if (!airport) {
    return "";
  }

  return airport.names?.[currentLang] ?? airport.names?.it ?? airport.names?.en ?? airport.code;
}

function sortAirports(airports) {
  return [...airports].sort((a, b) =>
    getAirportName(a).localeCompare(getAirportName(b), currentLang === "en" ? "en" : "it", {
      sensitivity: "base",
    })
  );
}

function updateOriginPreview(originAirport) {
  setText(ticketOriginCodeEl, originAirport?.code ?? "—");
  setText(ticketOriginCityEl, originAirport ? getAirportName(originAirport) : t("ticketOriginFallbackText"));
}

function updateDestinationPreview(count) {
  setText(
    ticketDestinationSubtitleEl,
    getSelectedOriginAirport()
      ? t("ticketDestinationSubtitle", { count })
      : t("ticketDestinationSubtitleEmpty")
  );
}

function updateResultsHeading() {
  setText(resultsTitleEl, getSortMode() === "price" ? t("resultsTitlePrice") : t("resultsTitleDate"));
}

function setShareButtonVisibility(isVisible) {
  if (!shareResultsBtn) {
    return;
  }

  shareResultsBtn.classList.toggle("hidden", !isVisible);
  if (!isVisible) {
    resetShareButton();
  }
}

async function copyResultsLink() {
  const url = window.location.href;

  try {
    await copyTextToClipboard(url);
    showShareCopiedState();
  } catch (error) {
    console.error("Impossibile copiare il link dei risultati:", error);
  }
}

async function copyTextToClipboard(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "absolute";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  textArea.setSelectionRange(0, textArea.value.length);

  const success = document.execCommand("copy");
  document.body.removeChild(textArea);

  if (!success) {
    throw new Error("copy command failed");
  }
}

function showShareCopiedState() {
  if (!shareResultsBtn) {
    return;
  }

  if (shareResetTimer) {
    window.clearTimeout(shareResetTimer);
  }

  shareResultsBtn.classList.add("is-copied");
  setText(shareResultsBtnTextEl, t("shareResultsCopied"));

  shareResetTimer = window.setTimeout(() => {
    resetShareButton();
  }, 2200);
}

function resetShareButton() {
  if (!shareResultsBtn) {
    return;
  }

  if (shareResetTimer) {
    window.clearTimeout(shareResetTimer);
    shareResetTimer = null;
  }

  shareResultsBtn.classList.remove("is-copied");
  setText(shareResultsBtnTextEl, t("shareResults"));
}

function parseIntegerInRange(value, min, max) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed)) {
    return Number.NaN;
  }
  return Math.min(max, Math.max(min, parsed));
}

function setLanguage(lang, { updateUrl = true, rerender = true } = {}) {
  currentLang = normalizeLanguage(lang);

  document.documentElement.lang = currentLang;
  document.documentElement.dir = "ltr";
  document.body.dataset.lang = currentLang;

  updateLanguageButtons();
  applyStaticTranslations();

  if (allAirports.length > 0) {
    refreshAirportControls({
      preferredOriginCode: originAirportInput?.value ?? "",
      preferredDestinationCode: airportFilterInput?.value ?? "all",
    });
  }

  if (rerender) {
    renderResults(currentResults);

    if (lastRunContext) {
      renderMeta(lastRunContext);
      renderStatus(lastRunContext);
    } else if (!statusEl.classList.contains("error")) {
      statusEl.textContent = t("statusReady");
    }
  }

  if (updateUrl) {
    updateUrlFromCurrentFilters();
  }
}

function applyStaticTranslations() {
  document.title = t("pageTitle");

  setText(heroEyebrowEl, t("heroEyebrow"));
  setText(heroTitleEl, t("heroTitle"));
  setText(heroDescriptionEl, t("heroDescription"));
  setText(ticketOriginLabelEl, t("ticketOriginLabel"));
  setText(labelOriginScopeEl, t("labelOriginScope"));
  setText(originScopeItalyEl, t("originScopeItaly"));
  setText(originScopeAllEl, t("originScopeAll"));
  setText(labelOriginAirportEl, t("labelOriginAirport"));
  setText(ticketDestinationLabelEl, t("ticketDestinationLabel"));
  setText(ticketDestinationTitleEl, t("ticketDestinationTitle"));
  updateDestinationPreview(availableAirports.length);
  setText(ticketCaptionEl, t("ticketCaption"));
  setText(labelDestinationEl, t("labelDestination"));
  setText(labelMonthsEl, t("labelMonths"));
  setText(labelTargetStayEl, t("labelTargetStay"));
  setText(labelToleranceEl, t("labelTolerance"));
  setText(labelMaxPriceEl, t("labelMaxPrice"));
  setText(labelSortModeEl, t("labelSortMode"));
  setText(sortOptionDateEl, t("sortDate"));
  setText(sortOptionPriceEl, t("sortPrice"));
  setText(labelViewModeEl, t("labelViewMode"));
  setText(viewLabelListEl, t("viewList"));
  setText(viewLabelCardsEl, t("viewCards"));
  setText(searchBtnTextEl ?? searchBtn, t("buttonSearch"));
  updateResultsHeading();
  setText(thDepartureEl, t("thDeparture"));
  setText(thReturnEl, t("thReturn"));
  setText(thDestinationEl, t("thDestination"));
  setText(thDurationEl, t("thDuration"));
  setText(thTotalPriceEl, t("thTotalPrice"));
  setText(thBookEl, t("thBook"));
  setText(shareResultsBtnTextEl, t("shareResults"));
  setText(footerCreditPrefixEl, t("footerCreditPrefix"));

  if (!lastRunContext && !statusEl.classList.contains("error")) {
    renderPendingMeta();
  }

  if (langSwitcherEl) {
    langSwitcherEl.setAttribute("aria-label", t("ariaLanguageGroup"));
  }

  if (viewModeRowEl) {
    viewModeRowEl.setAttribute("aria-label", t("ariaViewMode"));
  }

  if (viewModeToggleEl) {
    viewModeToggleEl.setAttribute("aria-label", t("ariaViewMode"));
  }

  if (allAirports.length === 0) {
    updateOriginPreview(null);
  }
}

function updateLanguageButtons() {
  for (const button of langButtons) {
    const isActive = normalizeLanguage(button.dataset.lang) === currentLang;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  }
}

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function getDateLocale() {
  return currentLang === "en" ? "en-GB" : "it-IT";
}

function getNumberLocale() {
  return currentLang === "en" ? "en-GB" : "it-IT";
}

function getBrowserLanguage() {
  const locale = (navigator.language ?? "it").toLowerCase();
  if (locale.startsWith("en")) {
    return "en";
  }
  return "it";
}

function normalizeLanguage(value) {
  return value === "en" ? "en" : "it";
}

function t(key, vars = {}) {
  const dictionary = I18N[currentLang] ?? I18N.it;
  const fallback = I18N.it[key] ?? key;
  const template = dictionary[key] ?? fallback;

  return template.replace(/\{(\w+)\}/g, (_, token) => {
    if (Object.prototype.hasOwnProperty.call(vars, token)) {
      return String(vars[token]);
    }
    return `{${token}}`;
  });
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let currentIndex = 0;

  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    while (true) {
      const index = currentIndex;
      currentIndex += 1;

      if (index >= items.length) {
        return;
      }

      results[index] = await mapper(items[index], index);
    }
  });

  await Promise.all(workers);
  return results;
}
