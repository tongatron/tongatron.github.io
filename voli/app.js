const CHEAPEST_PER_DAY_API = "https://www.ryanair.com/api/farfnd/3/oneWayFares";
const FIXED_AIRPORT = {
  code: "STN",
  name: "Londra (Stansted)",
};

const form = document.querySelector("#search-form");
const monthsInput = document.querySelector("#months");
const targetStayInput = document.querySelector("#target-stay");
const stayToleranceInput = document.querySelector("#stay-tolerance");
const maxTotalPriceInput = document.querySelector("#max-total-price");
const viewModeInput = document.querySelector("#view-mode");
const resultsBody = document.querySelector("#results-body");
const listViewEl = document.querySelector("#list-view");
const cardsViewEl = document.querySelector("#cards-view");
const statusEl = document.querySelector("#status");
const metaEl = document.querySelector("#meta");
const searchBtn = document.querySelector("#search-btn");

const dailyFareCache = new Map();
let currentResults = [];
const appReady = Boolean(
  form &&
    monthsInput &&
    targetStayInput &&
    stayToleranceInput &&
    maxTotalPriceInput &&
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
  form.addEventListener("submit", onSubmit);
  if (viewModeInput) {
    viewModeInput.addEventListener("change", () => {
      renderResults(currentResults);
    });
  }

  applyViewMode();
  void runSearch();
}

async function onSubmit(event) {
  event.preventDefault();
  await runSearch();
}

async function runSearch() {
  const dateFrom = localTodayIso();
  const months = Number(monthsInput?.value ?? 3);
  const targetStay = Number(targetStayInput?.value ?? 5);
  const tolerance = Number(stayToleranceInput?.value ?? 1);
  const maxTotalPrice = Number(maxTotalPriceInput?.value ?? 70);

  if (Number.isNaN(months) || months < 1 || Number.isNaN(maxTotalPrice) || maxTotalPrice <= 0) {
    setError("Parametri non validi.");
    return;
  }

  const dateTo = addDaysIso(addMonthsIso(dateFrom, months), -1);
  const outboundMonths = monthsBetween(dateFrom, dateTo);
  const returnWindowFrom = addDaysIso(dateFrom, Math.max(1, targetStay - tolerance));
  const returnWindowTo = addDaysIso(dateTo, targetStay + tolerance);
  const inboundMonths = monthsBetween(returnWindowFrom, returnWindowTo);

  setLoading(true, "Recupero prezzi giornalieri Ryanair...");
  currentResults = [];
  clearResults();

  try {
    const candidates = await buildRoundTripCandidates({
      airport: FIXED_AIRPORT,
      dateFrom,
      dateTo,
      targetStay,
      tolerance,
      outboundMonths,
      inboundMonths,
    });

    metaEl.textContent = [
      `Tratta: TRN -> ${FIXED_AIRPORT.code} (${FIXED_AIRPORT.name})`,
      `Partenza da oggi: ${formatDate(dateFrom)}`,
      `Spesa massima A/R: € ${formatPrice(maxTotalPrice)}`,
    ].join(" • ");

    const cheapestByDate = pickCheapestByOutboundDate(candidates)
      .filter((fare) => fare.totalPrice <= maxTotalPrice)
      .sort((a, b) => new Date(a.outboundDate) - new Date(b.outboundDate));

    if (cheapestByDate.length === 0) {
      statusEl.classList.remove("error");
      statusEl.textContent = `Nessun volo entro € ${formatPrice(maxTotalPrice)} trovato con i filtri scelti.`;
      return;
    }

    currentResults = cheapestByDate;
    renderResults(currentResults);
    statusEl.classList.remove("error");
    statusEl.textContent = `Trovate ${cheapestByDate.length} opzioni entro € ${formatPrice(maxTotalPrice)} (ordinate per data).`;
  } catch (error) {
    const isNetworkError = error?.message === "Failed to fetch" || error instanceof TypeError;
    if (isNetworkError) {
      setError(
        "Errore rete/API: il browser non riesce a leggere Ryanair. Controlla console DevTools (F12) per CORS o blocchi rete."
      );
    } else {
      setError(`Errore durante la ricerca: ${error.message}`);
    }
  } finally {
    setLoading(false);
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
    throw new Error(`Errore prezzi ${departureCode}→${arrivalCode} (${response.status})`);
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
      <td>${fare.tripDays} giorni</td>
      <td class="price">€ ${formatPrice(fare.totalPrice)}</td>
    `;

    const detailsRow = document.createElement("tr");
    detailsRow.className = "details-row hidden";
    detailsRow.innerHTML = `
      <td colspan="4">
        <div class="details-card">
          <strong>Dettagli voli:</strong><br />
          Andata: ${formatLegDetails(fare.outboundDate, fare.outboundArrivalDate, fare.outboundPrice)}<br />
          Ritorno: ${formatLegDetails(fare.inboundDate, fare.inboundArrivalDate, fare.inboundPrice)}<br />
          Permanenza: ${fare.tripDays} giorni
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
      <p class="card-line"><strong>Tratta:</strong> Torino (TRN) -> Londra (STN)</p>
      <p class="card-line"><strong>Andata:</strong> ${formatLegDetails(fare.outboundDate, fare.outboundArrivalDate, fare.outboundPrice)}</p>
      <p class="card-line"><strong>Ritorno:</strong> ${formatLegDetails(fare.inboundDate, fare.inboundArrivalDate, fare.inboundPrice)}</p>
      <p class="card-line"><strong>Permanenza:</strong> ${fare.tripDays} giorni</p>
      <p class="card-line price"><strong>Totale A/R:</strong> € ${formatPrice(fare.totalPrice)}</p>
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
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
  }).format(parseIsoDate(isoDate));
}

function formatDateTimeWithWeekday(value) {
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTime(value) {
  return new Intl.DateTimeFormat("it-IT", {
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

  return `${departureText} -> ${arrivalText} (€ ${formatPrice(price)})`;
}

function formatPrice(value) {
  return Number(value).toFixed(2).replace(".", ",");
}

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function getViewMode() {
  return viewModeInput?.value === "cards" ? "cards" : "list";
}
