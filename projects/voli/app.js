const ROUTES_API = "https://www.ryanair.com/api/views/locate/searchWidget/routes/it/airport/TRN";
const CHEAPEST_PER_DAY_API = "https://www.ryanair.com/api/farfnd/3/oneWayFares";
const URL_FILTER_KEYS = {
  destination: "dest",
  months: "months",
  stay: "stay",
  tolerance: "tol",
  maxTotalPrice: "max",
  view: "view",
  lang: "lang",
};

const I18N = {
  it: {
    pageTitle: "voli da Torino",
    heroEyebrow: "Ryanair Fare Finder",
    heroTitle: "voli da Torino",
    heroDescription:
      "La ricerca usa le API pubbliche Ryanair e mostra il prezzo totale andata+ritorno dalle rotte Ryanair disponibili in partenza da Torino.",
    labelDestination: "Aeroporto destinazione",
    labelMonths: "Mesi da analizzare",
    labelTargetStay: "Durata target (giorni)",
    labelTolerance: "Tolleranza (± giorni)",
    labelMaxPrice: "Spesa massima A/R (€)",
    labelViewMode: "Visualizza Lista/Schede",
    viewList: "Lista",
    viewCards: "Schede",
    buttonSearch: "Cerca voli",
    resultsTitle: "Risultati ordinati per data",
    thDeparture: "Partenza",
    thReturn: "Ritorno",
    thDestination: "Destinazione",
    thDuration: "Durata",
    thTotalPrice: "Prezzo totale",
    destinationAll: "Tutti gli aeroporti raggiungibili",
    statusReady: "Pronto.",
    loadingAirports: "Carico aeroporti raggiungibili da Torino...",
    loadingPrices: "Recupero prezzi giornalieri Ryanair...",
    loadingPricesProgress: "Recupero prezzi Ryanair... {done}/{total} aeroporti",
    errorInit: "Errore inizializzazione aeroporti: {message}",
    errorInvalidParams: "Parametri non validi.",
    errorNoAirports: "Nessun aeroporto disponibile da Torino.",
    errorAirportUnavailable: "Aeroporto selezionato non disponibile.",
    errorNetwork:
      "Errore rete/API: il browser non riesce a leggere Ryanair. Controlla console DevTools (F12) per CORS o blocchi rete.",
    errorSearch: "Errore durante la ricerca: {message}",
    errorRoutesRead: "Impossibile leggere le rotte da Torino ({status})",
    errorPriceRead: "Errore prezzi {departure}→{arrival} ({status})",
    metaAllAirports: "Aeroporti: tutti ({count})",
    metaSingleAirport: "Aeroporto: {airport}",
    metaDepartToday: "Partenza da oggi: {date}",
    metaMaxSpend: "Spesa massima A/R: € {max}",
    statusNoResults: "Nessun volo entro € {max} trovato con i filtri scelti.",
    statusFound: "Trovate {count} opzioni economiche in ordine di data.",
    statusFoundWithFailed:
      "Trovate {count} opzioni economiche in ordine di data. ({failed} aeroporti non disponibili: {codes})",
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
    fromTurin: "Torino (TRN)",
    legTemplate: "{departure} -> {arrival} (€ {price})",
    ariaLanguageGroup: "Selezione lingua",
    ariaViewMode: "Visualizzazione risultati",
  },
  sc: {
    pageTitle: "bolos dae Turinu",
    heroEyebrow: "Chirca tarifas Ryanair",
    heroTitle: "bolos dae Turinu",
    heroDescription:
      "Sa chirca impreat sas API pùblicas de Ryanair e mustrat su prètziu totale de andada e torrada pro sas tratas disponìbiles dae Turinu.",
    labelDestination: "Aeroportu de destinatzione",
    labelMonths: "Meses de analisare",
    labelTargetStay: "Durada obietivu (dies)",
    labelTolerance: "Tolleràntzia (± dies)",
    labelMaxPrice: "Ispesa massima A/R (€)",
    labelViewMode: "Visualizatzione Lista/Schedas",
    viewList: "Lista",
    viewCards: "Schedas",
    buttonSearch: "Chirca bolos",
    resultsTitle: "Resurtados ordinados pro data",
    thDeparture: "Partèntzia",
    thReturn: "Torrada",
    thDestination: "Destinatzione",
    thDuration: "Durada",
    thTotalPrice: "Prètziu totale",
    destinationAll: "Totus sos aeroportos chi si podent raggiànghere",
    statusReady: "Prontu.",
    loadingAirports: "Carrighende sos aeroportos disponìbiles dae Turinu...",
    loadingPrices: "Recuperende sos prètzios diarios Ryanair...",
    loadingPricesProgress: "Recuperende sos prètzios... {done}/{total} aeroportos",
    errorInit: "Faddina in s'inizializatzione de sos aeroportos: {message}",
    errorInvalidParams: "Paràmetros non vàlidos.",
    errorNoAirports: "Perunu aeroportu disponìbile dae Turinu.",
    errorAirportUnavailable: "S'aeroportu seberadu non est disponìbile.",
    errorNetwork:
      "Faddina de rete/API: su browser non podet leggere Ryanair. Controlla sa console DevTools (F12) pro CORS o bloccos de rete.",
    errorSearch: "Faddina durante sa chirca: {message}",
    errorRoutesRead: "Impossìbile leggere sas rotas dae Turinu ({status})",
    errorPriceRead: "Faddina prètzios {departure}→{arrival} ({status})",
    metaAllAirports: "Aeroportos: totus ({count})",
    metaSingleAirport: "Aeroportu: {airport}",
    metaDepartToday: "Partèntzia dae oe: {date}",
    metaMaxSpend: "Ispesa massima A/R: € {max}",
    statusNoResults: "Perunu bolu intro € {max} cun sos filtros seberados.",
    statusFound: "Trovadas {count} optziones econòmicas in òrdine de data.",
    statusFoundWithFailed:
      "Trovadas {count} optziones econòmicas in òrdine de data. ({failed} aeroportos non disponìbiles: {codes})",
    days: "{count} dies",
    detailsTitle: "Detàllios bolos:",
    detailsRoute: "Trata: {from} -> {to}",
    detailsOutbound: "Andada: {value}",
    detailsReturn: "Torrada: {value}",
    detailsStay: "Permanèntzia: {days}",
    cardRoute: "Trata:",
    cardOutbound: "Andada:",
    cardReturn: "Torrada:",
    cardStay: "Permanèntzia:",
    cardTotal: "Totale A/R:",
    fromTurin: "Turinu (TRN)",
    legTemplate: "{departure} -> {arrival} (€ {price})",
    ariaLanguageGroup: "Seletzione limba",
    ariaViewMode: "Visualizatzione resurtados",
  },
  fa: {
    pageTitle: "پروازها از تورین",
    heroEyebrow: "جستجوی قیمت رایان‌ایر",
    heroTitle: "پروازها از تورین",
    heroDescription:
      "این جستجو از API عمومی Ryanair استفاده می‌کند و مجموع قیمت رفت‌وبرگشت مسیرهای قابل دسترس از تورین را نمایش می‌دهد.",
    labelDestination: "فرودگاه مقصد",
    labelMonths: "ماه‌های بررسی",
    labelTargetStay: "مدت اقامت هدف (روز)",
    labelTolerance: "بازه خطا (± روز)",
    labelMaxPrice: "حداکثر هزینه رفت‌وبرگشت (€)",
    labelViewMode: "نمایش لیست/کارت",
    viewList: "لیست",
    viewCards: "کارت",
    buttonSearch: "جستجوی پرواز",
    resultsTitle: "نتایج مرتب‌شده بر اساس تاریخ",
    thDeparture: "رفت",
    thReturn: "برگشت",
    thDestination: "مقصد",
    thDuration: "مدت",
    thTotalPrice: "قیمت کل",
    destinationAll: "همه فرودگاه‌های قابل دسترس",
    statusReady: "آماده.",
    loadingAirports: "در حال بارگذاری فرودگاه‌های قابل دسترس از تورین...",
    loadingPrices: "در حال دریافت قیمت‌های روزانه Ryanair...",
    loadingPricesProgress: "در حال دریافت قیمت‌ها... {done}/{total} فرودگاه",
    errorInit: "خطا در مقداردهی اولیه فرودگاه‌ها: {message}",
    errorInvalidParams: "پارامترها معتبر نیستند.",
    errorNoAirports: "هیچ فرودگاهی از تورین در دسترس نیست.",
    errorAirportUnavailable: "فرودگاه انتخاب‌شده در دسترس نیست.",
    errorNetwork:
      "خطای شبکه/API: مرورگر نتوانست به Ryanair دسترسی پیدا کند. کنسول DevTools (F12) را برای CORS یا محدودیت شبکه بررسی کنید.",
    errorSearch: "خطا هنگام جستجو: {message}",
    errorRoutesRead: "خواندن مسیرهای تورین ممکن نیست ({status})",
    errorPriceRead: "خطای قیمت {departure}→{arrival} ({status})",
    metaAllAirports: "فرودگاه‌ها: همه ({count})",
    metaSingleAirport: "فرودگاه: {airport}",
    metaDepartToday: "شروع از امروز: {date}",
    metaMaxSpend: "حداکثر هزینه رفت‌وبرگشت: € {max}",
    statusNoResults: "هیچ پروازی تا € {max} با فیلترهای انتخاب‌شده پیدا نشد.",
    statusFound: "{count} گزینه ارزان بر اساس تاریخ پیدا شد.",
    statusFoundWithFailed:
      "{count} گزینه ارزان بر اساس تاریخ پیدا شد. ({failed} فرودگاه در دسترس نبود: {codes})",
    days: "{count} روز",
    detailsTitle: "جزئیات پرواز:",
    detailsRoute: "مسیر: {from} -> {to}",
    detailsOutbound: "رفت: {value}",
    detailsReturn: "برگشت: {value}",
    detailsStay: "مدت اقامت: {days}",
    cardRoute: "مسیر:",
    cardOutbound: "رفت:",
    cardReturn: "برگشت:",
    cardStay: "مدت اقامت:",
    cardTotal: "جمع رفت‌وبرگشت:",
    fromTurin: "تورین (TRN)",
    legTemplate: "{departure} -> {arrival} (€ {price})",
    ariaLanguageGroup: "انتخاب زبان",
    ariaViewMode: "حالت نمایش نتایج",
  },
};

const form = document.querySelector("#search-form");
const airportFilterInput = document.querySelector("#airport-filter");
const monthsInput = document.querySelector("#months");
const targetStayInput = document.querySelector("#target-stay");
const stayToleranceInput = document.querySelector("#stay-tolerance");
const maxTotalPriceInput = document.querySelector("#max-total-price");
const viewModeInputs = document.querySelectorAll('input[name="view-mode"]');
const langButtons = document.querySelectorAll(".lang-btn");
const langSwitcherEl = document.querySelector(".lang-switcher");
const viewModeToggleEl = document.querySelector(".view-mode-toggle");
const viewModeRowEl = document.querySelector(".view-mode-row");

const heroEyebrowEl = document.querySelector("#hero-eyebrow");
const heroTitleEl = document.querySelector("#hero-title");
const heroDescriptionEl = document.querySelector("#hero-description");
const labelDestinationEl = document.querySelector("#label-destination");
const labelMonthsEl = document.querySelector("#label-months");
const labelTargetStayEl = document.querySelector("#label-target-stay");
const labelToleranceEl = document.querySelector("#label-tolerance");
const labelMaxPriceEl = document.querySelector("#label-max-price");
const labelViewModeEl = document.querySelector("#label-view-mode");
const viewLabelListEl = document.querySelector("#view-label-list");
const viewLabelCardsEl = document.querySelector("#view-label-cards");
const resultsTitleEl = document.querySelector("#results-title");
const thDepartureEl = document.querySelector("#th-departure");
const thReturnEl = document.querySelector("#th-return");
const thDestinationEl = document.querySelector("#th-destination");
const thDurationEl = document.querySelector("#th-duration");
const thTotalPriceEl = document.querySelector("#th-total-price");

const resultsBody = document.querySelector("#results-body");
const listViewEl = document.querySelector("#list-view");
const cardsViewEl = document.querySelector("#cards-view");
const statusEl = document.querySelector("#status");
const metaEl = document.querySelector("#meta");
const searchBtn = document.querySelector("#search-btn");

const dailyFareCache = new Map();
let availableAirports = [];
let currentResults = [];
let currentLang = "it";
let lastRunContext = null;

const appReady = Boolean(
  form &&
    airportFilterInput &&
    monthsInput &&
    targetStayInput &&
    stayToleranceInput &&
    maxTotalPriceInput &&
    viewModeInputs.length > 0 &&
    langButtons.length >= 2 &&
    resultsBody &&
    statusEl &&
    metaEl &&
    searchBtn
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

  for (const input of viewModeInputs) {
    input.addEventListener("change", () => {
      renderResults(currentResults);
      updateUrlFromCurrentFilters();
    });
  }

  for (const button of langButtons) {
    button.addEventListener("click", () => {
      const selectedLang = normalizeLanguage(button.dataset.lang);
      if (selectedLang === currentLang) {
        return;
      }
      setLanguage(selectedLang, { updateUrl: true, rerender: true });
    });
  }

  setLoading(true, t("loadingAirports"));

  try {
    availableAirports = await fetchReachableAirportsFromTurin();
    populateAirportFilter(availableAirports, initialFilters.destinationCode);
    applyViewMode();
    await runSearch({ updateUrl: false });
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

  if (availableAirports.length === 0) {
    setError(t("errorNoAirports"));
    return;
  }

  const selectedAirportCode = airportFilterInput?.value ?? "all";
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

  const dateTo = addDaysIso(addMonthsIso(dateFrom, months), -1);
  const outboundMonths = monthsBetween(dateFrom, dateTo);
  const returnWindowFrom = addDaysIso(dateFrom, Math.max(1, targetStay - tolerance));
  const returnWindowTo = addDaysIso(dateTo, targetStay + tolerance);
  const inboundMonths = monthsBetween(returnWindowFrom, returnWindowTo);

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
            airport,
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
    setLoading(false);
  }
}

async function fetchReachableAirportsFromTurin() {
  const response = await fetch(ROUTES_API);

  if (!response.ok) {
    throw new Error(t("errorRoutesRead", { status: response.status }));
  }

  const routes = await response.json();
  const airportsMap = new Map();

  for (const route of routes) {
    const airport = route?.arrivalAirport;
    if (!airport?.code || !airport?.name) {
      continue;
    }

    const cityName = airport?.city?.name ?? "";
    const countryName = airport?.country?.name ?? "";

    airportsMap.set(airport.code, {
      code: airport.code,
      name: airport.name,
      cityName,
      countryName,
    });
  }

  return [...airportsMap.values()].sort((a, b) => {
    const cityCompare = a.cityName.localeCompare(b.cityName, "it", { sensitivity: "base" });
    if (cityCompare !== 0) {
      return cityCompare;
    }
    return a.name.localeCompare(b.name, "it", { sensitivity: "base" });
  });
}

function populateAirportFilter(airports, preferredCode = null) {
  if (!airportFilterInput) {
    return;
  }

  airportFilterInput.innerHTML = "";

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

  const normalizedPreferredCode = preferredCode?.toUpperCase() ?? "";
  const hasPreferred = airports.some((airport) => airport.code === normalizedPreferredCode);
  const hasStansted = airports.some((airport) => airport.code === "STN");

  if (normalizedPreferredCode === "all") {
    airportFilterInput.value = "all";
  } else if (hasPreferred) {
    airportFilterInput.value = normalizedPreferredCode;
  } else {
    airportFilterInput.value = hasStansted ? "STN" : "all";
  }
}

async function buildRoundTripCandidates({
  airport,
  dateFrom,
  dateTo,
  targetStay,
  tolerance,
  outboundMonths,
  inboundMonths,
}) {
  const outboundMap = await fetchDailyFaresForMonths("TRN", airport.code, outboundMonths);
  const inboundMap = await fetchDailyFaresForMonths(airport.code, "TRN", inboundMonths);

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
      outboundPrice: outboundFare.price,
      inboundPrice: bestInbound.price,
      totalPrice: roundCurrency(outboundFare.price + bestInbound.price),
      airportCode: airport.code,
      airportName: airport.name,
      cityName: airport.cityName,
      countryName: airport.countryName,
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

  if (getViewMode() === "cards") {
    renderCards(fares);
    return;
  }

  renderListRows(fares);
}

function renderListRows(fares) {
  for (const fare of fares) {
    const row = document.createElement("tr");
    row.className = "result-row";
    row.tabIndex = 0;
    row.innerHTML = `
      <td>${formatDateTimeWithWeekday(fare.outboundDate)}</td>
      <td>${formatDateTimeWithWeekday(fare.inboundDate)}</td>
      <td>${formatDestination(fare)}</td>
      <td>${t("days", { count: fare.tripDays })}</td>
      <td class="price">€ ${formatPrice(fare.totalPrice)}</td>
    `;

    const detailsRow = document.createElement("tr");
    detailsRow.className = "details-row hidden";
    detailsRow.innerHTML = `
      <td colspan="5">
        <div class="details-card">
          <strong>${t("detailsTitle")}</strong><br />
          ${t("detailsRoute", { from: t("fromTurin"), to: formatDestination(fare) })}<br />
          ${t("detailsOutbound", {
            value: formatLegDetails(fare.outboundDate, fare.outboundArrivalDate, fare.outboundPrice),
          })}<br />
          ${t("detailsReturn", {
            value: formatLegDetails(fare.inboundDate, fare.inboundArrivalDate, fare.inboundPrice),
          })}<br />
          ${t("detailsStay", { days: t("days", { count: fare.tripDays }) })}
        </div>
      </td>
    `;

    const toggleDetails = () => {
      detailsRow.classList.toggle("hidden");
      row.classList.toggle("expanded");
    };

    row.addEventListener("click", toggleDetails);
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleDetails();
      }
    });

    resultsBody.appendChild(row);
    resultsBody.appendChild(detailsRow);
  }
}

function renderCards(fares) {
  if (!cardsViewEl) {
    return;
  }

  for (const fare of fares) {
    const card = document.createElement("article");
    card.className = "flight-card";
    card.innerHTML = `
      <h3>${formatDateTimeWithWeekday(fare.outboundDate)}</h3>
      <p class="card-line"><strong>${t("cardRoute")}</strong> ${t("fromTurin")} -> ${formatDestination(fare)}</p>
      <p class="card-line"><strong>${t("cardOutbound")}</strong> ${formatLegDetails(fare.outboundDate, fare.outboundArrivalDate, fare.outboundPrice)}</p>
      <p class="card-line"><strong>${t("cardReturn")}</strong> ${formatLegDetails(fare.inboundDate, fare.inboundArrivalDate, fare.inboundPrice)}</p>
      <p class="card-line"><strong>${t("cardStay")}</strong> ${t("days", { count: fare.tripDays })}</p>
      <p class="card-line price"><strong>${t("cardTotal")}</strong> € ${formatPrice(fare.totalPrice)}</p>
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
  if (isLoading && text) {
    statusEl.classList.remove("error");
    statusEl.textContent = text;
  }
}

function setError(message) {
  statusEl.classList.add("error");
  statusEl.textContent = message;
}

function renderMeta(context) {
  const airportText =
    context.selectedAirportCode === "all"
      ? t("metaAllAirports", { count: context.airportsCount })
      : t("metaSingleAirport", { airport: formatAirportLabel(context.selectedAirport) });

  metaEl.textContent = [
    airportText,
    t("metaDepartToday", { date: formatDate(context.dateFrom) }),
    t("metaMaxSpend", { max: formatPrice(context.maxTotalPrice) }),
  ].join(" • ");
}

function renderStatus(context) {
  statusEl.classList.remove("error");

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
  const city = airport?.cityName ? `${airport.cityName}` : airport?.name ?? "";
  return `${airport?.code ?? ""} · ${city}`;
}

function formatAirportFilterLabel(airport) {
  const city = airport.cityName ? `${airport.cityName}` : airport.name;
  return `${city} · ${airport.code}`;
}

function formatDestination(fare) {
  if (fare.cityName && fare.cityName.trim()) {
    return `${fare.airportCode} · ${fare.cityName}`;
  }
  return `${fare.airportCode} · ${fare.airportName}`;
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
    destinationCode: params.get(URL_FILTER_KEYS.destination)?.trim().toUpperCase() ?? "",
    months: parseIntegerInRange(params.get(URL_FILTER_KEYS.months), 1, 12),
    stay: parseIntegerInRange(params.get(URL_FILTER_KEYS.stay), 1, 30),
    tolerance: parseIntegerInRange(params.get(URL_FILTER_KEYS.tolerance), 0, 7),
    maxTotalPrice: parseIntegerInRange(params.get(URL_FILTER_KEYS.maxTotalPrice), 1, 2000),
    view: params.get(URL_FILTER_KEYS.view) === "cards" ? "cards" : "list",
    lang: normalizeLanguage(params.get(URL_FILTER_KEYS.lang) ?? getBrowserLanguage()),
  };
}

function applyInitialFilters(filters) {
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
  setViewMode(filters.view);
}

function updateUrlFromCurrentFilters() {
  const params = new URLSearchParams(window.location.search);

  params.set(URL_FILTER_KEYS.destination, airportFilterInput?.value ?? "all");
  params.set(URL_FILTER_KEYS.months, monthsInput?.value ?? "3");
  params.set(URL_FILTER_KEYS.stay, targetStayInput?.value ?? "5");
  params.set(URL_FILTER_KEYS.tolerance, stayToleranceInput?.value ?? "1");
  params.set(URL_FILTER_KEYS.maxTotalPrice, maxTotalPriceInput?.value ?? "70");
  params.set(URL_FILTER_KEYS.view, getViewMode());
  params.set(URL_FILTER_KEYS.lang, currentLang);

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", nextUrl);
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
  document.documentElement.dir = currentLang === "fa" ? "rtl" : "ltr";
  document.body.dataset.lang = currentLang;

  updateLanguageButtons();
  applyStaticTranslations();

  if (availableAirports.length > 0) {
    const selectedCode = airportFilterInput?.value ?? "all";
    populateAirportFilter(availableAirports, selectedCode);
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
  setText(labelDestinationEl, t("labelDestination"));
  setText(labelMonthsEl, t("labelMonths"));
  setText(labelTargetStayEl, t("labelTargetStay"));
  setText(labelToleranceEl, t("labelTolerance"));
  setText(labelMaxPriceEl, t("labelMaxPrice"));
  setText(labelViewModeEl, t("labelViewMode"));
  setText(viewLabelListEl, t("viewList"));
  setText(viewLabelCardsEl, t("viewCards"));
  setText(searchBtn, t("buttonSearch"));
  setText(resultsTitleEl, t("resultsTitle"));
  setText(thDepartureEl, t("thDeparture"));
  setText(thReturnEl, t("thReturn"));
  setText(thDestinationEl, t("thDestination"));
  setText(thDurationEl, t("thDuration"));
  setText(thTotalPriceEl, t("thTotalPrice"));

  if (!lastRunContext && !statusEl.classList.contains("error")) {
    statusEl.textContent = t("statusReady");
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
  if (currentLang === "fa") {
    return "fa-IR-u-ca-gregory";
  }
  return "it-IT";
}

function getNumberLocale() {
  if (currentLang === "fa") {
    return "fa-IR";
  }
  return "it-IT";
}

function getBrowserLanguage() {
  const locale = (navigator.language ?? "it").toLowerCase();
  if (locale.startsWith("fa")) {
    return "fa";
  }
  if (locale.startsWith("sc")) {
    return "sc";
  }
  return "it";
}

function normalizeLanguage(value) {
  if (value === "fa" || value === "sc") {
    return value;
  }
  return "it";
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
