const numberFormatter = new Intl.NumberFormat("it-IT");
const percentFormatter = new Intl.NumberFormat("it-IT", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const shortDateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});
const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "medium",
  timeStyle: "short",
});
const COMMONS_FILE_REDIRECT = "https://commons.wikimedia.org/wiki/Special:Redirect/file/";
const TITLE_CASE_SMALL_WORDS = new Set([
  "a",
  "ad",
  "ai",
  "al",
  "alla",
  "alle",
  "con",
  "da",
  "dal",
  "dei",
  "del",
  "della",
  "delle",
  "di",
  "e",
  "ed",
  "fra",
  "gli",
  "i",
  "il",
  "in",
  "la",
  "le",
  "nel",
  "nella",
  "nelle",
  "o",
  "per",
  "su",
  "tra",
  "un",
  "una",
  "uno",
]);
const PARTY_META = {
  DC: {
    displayName: "Democrazia Cristiana",
    emblemFile: "Democrazia Cristiana.svg",
  },
  PCI: {
    displayName: "Partito Comunista Italiano",
    emblemFile: "Logo Partito Comunista Italiano.svg",
  },
  PSI: {
    displayName: "Partito Socialista Italiano",
    emblemFile: "Partito Socialista Italiano (1947-1966;1969-1971).svg",
  },
  PSIUP: {
    displayName: "Partito Socialista Italiano di Unità Proletaria",
    emblemFile: "Logo of the Italian Socialist Party of Proletarian Unity (1946).svg",
  },
  PRI: {
    displayName: "Partito Repubblicano Italiano",
    emblemFile: "Partito Repubblicano Italiano - logo colored (Italy, 1946).svg",
  },
  PLI: {
    displayName: "Partito Liberale Italiano",
    emblemFile: "Partito Liberale Italiano.svg",
  },
  PSDI: {
    displayName: "Partito Socialista Democratico Italiano",
    emblemFile: "Logo of the PSDI (1948-1966) (1969-1983).svg",
  },
  MSI: {
    displayName: "Movimento Sociale Italiano",
    emblemFile: "Movimento Sociale Italiano Logo.png",
  },
  "MSI-DN": {
    displayName: "Movimento Sociale Italiano - Destra Nazionale",
    emblemFile: "Movimento Sociale Italiano Logo.png",
  },
  PDS: {
    displayName: "Partito Democratico della Sinistra",
  },
  PSU: {
    displayName: "Partito Socialista Unificato",
  },
  PDIUM: {
    displayName: "Partito Democratico Italiano di Unità Monarchica",
  },
  PDUP: {
    displayName: "Partito di Unità Proletaria per il Comunismo",
  },
  PR: {
    displayName: "Partito Radicale",
  },
  SVP: {
    displayName: "Südtiroler Volkspartei",
  },
  UDC: {
    displayName: "Unione di Centro",
    emblemFile: "Unione di Centro-Casini Presidente.svg",
  },
  FI: {
    displayName: "Forza Italia",
    emblemFile: "Forza Italia - Electoral logo (Italy, 1994).svg",
  },
  AN: {
    displayName: "Alleanza Nazionale",
  },
  PD: {
    displayName: "Partito Democratico",
    emblemFile: "Partito Democratico Italy.svg",
  },
  M5S: {
    displayName: "Movimento 5 Stelle",
    emblemFile: "Five Star Movement.svg",
  },
  LEGA: {
    displayName: "Lega",
    emblemFile: "Simbolo di Lega per Salvini Premier.svg",
  },
  RC: {
    displayName: "Rifondazione Comunista",
    emblemFile: "Rifondazione Comunista.svg",
  },
  "FR.UOMO QUALUNQUE": {
    displayName: "Fronte dell'Uomo Qualunque",
    emblemFile: "Fronte dell'Uomo Qualunque - logo color (Italy, 1946).svg",
  },
  "UN.DEMOC.NAZIONALE": {
    displayName: "Unione Democratica Nazionale",
    emblemFile: "Logo of the National Democratic Union (Italy).svg",
  },
  "FR.DEMOCR.POPOLARE": {
    displayName: "Fronte Democratico Popolare",
  },
  "DEM.PROL": {
    displayName: "Democrazia Proletaria",
  },
  "DL.LA MARGHERITA": {
    displayName: "Democrazia e Libertà - La Margherita",
  },
  "PS D'AZ.": {
    displayName: "Partito Sardo d'Azione",
  },
  CDR: {
    displayName: "Concentrazione Democratica Repubblicana",
  },
  "PART.DEMOCR.LAVORO": {
    displayName: "Partito Democratico del Lavoro",
  },
  "MOV.INDIPEND.SIC.": {
    displayName: "Movimento per l'Indipendenza della Sicilia",
  },
  "P.CONTADINI D'ITALIA": {
    displayName: "Partito dei Contadini d'Italia",
  },
  "BLOCCO NAZ.LIBERTA'": {
    displayName: "Blocco Nazionale della Libertà",
  },
  "MOV.UNIONISTA IT.": {
    displayName: "Movimento Unionista Italiano",
  },
  "ALL.MONARC.ITALIANA": {
    displayName: "Alleanza Monarchica Italiana",
  },
  "MOV.DEM.MONARC.IT.": {
    displayName: "Movimento Democratico Monarchico Italiano",
  },
  "ALL.REPUB.IT.": {
    displayName: "Alleanza Repubblicana Italiana",
  },
  "PC.INTERNAZIONALISTA": {
    displayName: "Partito Comunista Internazionalista",
  },
  "FR.DEM.PROG.REPUB.": {
    displayName: "Fronte Democratico Progressista Repubblicano",
  },
  "PART.REDUCE IT.": {
    displayName: "Partito Reduci d'Italia",
  },
  "PART.LAB.IT.": {
    displayName: "Partito Laburista Italiano",
  },
  "P.POPOLARE ITALIANO": {
    displayName: "Partito Popolare Italiano",
  },
  "P.NAZ.MONARCHICO": {
    displayName: "Partito Nazionale Monarchico",
  },
  CCD: {
    displayName: "Centro Cristiano Democratico",
  },
  CDU: {
    displayName: "Cristiani Democratici Uniti",
  },
  UV: {
    displayName: "Union Valdôtaine",
  },
  RV: {
    displayName: "Rassemblement Valdôtain",
  },
  UVP: {
    displayName: "Union Valdôtaine Progressiste",
  },
  PATT: {
    displayName: "Partito Autonomista Trentino Tirolese",
  },
  MPA: {
    displayName: "Movimento per l'Autonomia",
  },
  "NUOVO PSI": {
    displayName: "Nuovo PSI",
  },
};
const PARTY_ALIASES = {
  "DEMOCRAZIA CRISTIANA": "DC",
  "DEM.CRIST.": "DC",
  "PARTITO COMUNISTA ITALIANO": "PCI",
  "PARTITO SOCIALISTA ITALIANO": "PSI",
  "PARTITO SOCIALISTA ITALIANO DI UNITA' PROLETARIA": "PSIUP",
  "PARTITO REPUBBLICANO ITALIANO": "PRI",
  "PARTITO LIBERALE ITALIANO": "PLI",
  "PARTITO SOCIALISTA DEMOCRATICO ITALIANO": "PSDI",
  "P.RAD": "PR",
  "P.RAD.": "PR",
  "FORZA ITALIA": "FI",
  "PARTITO DEMOCRATICO": "PD",
  "MOVIMENTO 5 STELLE": "M5S",
  "MOVIMENTO 5 STELLE BEPPEGRILLO.IT": "M5S",
  "UNIONE DI CENTRO": "UDC",
  "RIFONDAZIONE COMUNISTA": "RC",
  "LEGA": "LEGA",
  "LEGA NORD": "LEGA",
  "LEGA PER SALVINI PREMIER": "LEGA",
  "PS.D'AZ.": "PS D'AZ.",
};

const state = {
  data: null,
  type: null,
  electionId: null,
  party: null,
};

const elements = {
  generatedAt: document.querySelector("#generated-at"),
  coverageNote: document.querySelector("#coverage-note"),
  typeTabs: document.querySelector("#type-tabs"),
  seriesMeta: document.querySelector("#series-meta"),
  yearChips: document.querySelector("#year-chips"),
  partyInput: document.querySelector("#party-search"),
  partyApply: document.querySelector("#party-apply"),
  partyOptions: document.querySelector("#party-options"),
  summaryKicker: document.querySelector("#summary-kicker"),
  summaryTitle: document.querySelector("#summary-title"),
  summaryNote: document.querySelector("#summary-note"),
  sourceFiles: document.querySelector("#source-files"),
  sourceLink: document.querySelector("#source-link"),
  kpiGrid: document.querySelector("#kpi-grid"),
  winnerCards: document.querySelector("#winner-cards"),
  leaderboard: document.querySelector("#leaderboard"),
  trendCaption: document.querySelector("#trend-caption"),
  trendChart: document.querySelector("#trend-chart"),
  tableCaption: document.querySelector("#table-caption"),
  resultsBody: document.querySelector("#results-body"),
};

bootstrap().catch((error) => {
  console.error(error);
  document.querySelector(".page-shell").innerHTML = `
    <section class="panel hero">
      <p class="eyebrow">Errore di caricamento</p>
      <h1>Impossibile leggere i dati locali</h1>
      <p class="lead">
        Avvia il progetto tramite un server statico e verifica che
        <code>data/elections.json</code> sia presente.
      </p>
    </section>
  `;
});

async function bootstrap() {
  const response = await fetch("./data/elections.json");
  if (!response.ok) {
    throw new Error("Impossibile caricare data/elections.json");
  }

  const data = await response.json();
  state.data = data;

  const requested = readStateFromHash();
  const types = getAvailableTypes();
  state.type = types.includes(requested.type)
    ? requested.type
    : types.includes("camera")
      ? "camera"
      : types[0];

  const electionsForType = getElectionsByType(state.type);
  const fallbackElection = electionsForType[electionsForType.length - 1];
  const requestedElection = electionsForType.find((item) => item.id === requested.electionId)
    ?? electionsForType.find((item) => item.year === requested.year);
  state.electionId = (requestedElection ?? fallbackElection).id;

  const availableParties = getAvailableParties(state.type);
  state.party = normalizePartyInput(requested.party, availableParties);
  if (!state.party) {
    state.party = getCurrentElection().winner.name;
  }

  attachEvents();
  render();
}

function attachEvents() {
  elements.typeTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-type]");
    if (!button) {
      return;
    }

    setType(button.dataset.type);
  });

  elements.yearChips.addEventListener("click", (event) => {
    const button = event.target.closest("[data-election-id]");
    if (!button) {
      return;
    }

    setElection(button.dataset.electionId, true);
  });

  elements.winnerCards.addEventListener("click", (event) => {
    const button = event.target.closest("[data-election-id]");
    if (!button) {
      return;
    }

    setElection(button.dataset.electionId, true);
  });

  elements.leaderboard.addEventListener("click", (event) => {
    const button = event.target.closest("[data-party]");
    if (!button) {
      return;
    }

    setParty(button.dataset.party);
  });

  elements.resultsBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-party]");
    if (!button) {
      return;
    }

    setParty(button.dataset.party);
  });

  elements.trendChart.addEventListener("click", (event) => {
    const button = event.target.closest("[data-election-id]");
    if (!button) {
      return;
    }

    setElection(button.dataset.electionId, true);
  });

  elements.partyApply.addEventListener("click", applyPartyInput);
  elements.partyInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyPartyInput();
    }
  });

  window.addEventListener("hashchange", () => {
    const requested = readStateFromHash();
    const types = getAvailableTypes();
    if (requested.type && types.includes(requested.type) && requested.type !== state.type) {
      state.type = requested.type;
    }

    const electionsForType = getElectionsByType(state.type);
    const requestedElection = electionsForType.find((item) => item.id === requested.electionId)
      ?? electionsForType.find((item) => item.year === requested.year);
    if (requestedElection) {
      state.electionId = requestedElection.id;
    }

    const party = normalizePartyInput(requested.party, getAvailableParties(state.type));
    if (party) {
      state.party = party;
    }

    render();
  });
}

function applyPartyInput() {
  const availableParties = getAvailableParties(state.type);
  const normalized = normalizePartyInput(elements.partyInput.value, availableParties);
  if (normalized) {
    setParty(normalized);
  }
}

function setType(type) {
  if (type === state.type) {
    return;
  }

  state.type = type;
  const electionsForType = getElectionsByType(type);
  state.electionId = electionsForType[electionsForType.length - 1].id;

  const parties = getAvailableParties(type);
  state.party = normalizePartyInput(state.party, parties) ?? getCurrentElection().winner.name;
  render();
}

function setElection(electionId, preserveParty) {
  if (state.electionId === electionId) {
    return;
  }

  state.electionId = electionId;
  if (!preserveParty || !getAvailableParties(state.type).includes(state.party)) {
    state.party = getCurrentElection().winner.name;
  }
  render();
}

function setParty(party) {
  if (!party || state.party === party) {
    return;
  }

  state.party = party;
  render();
}

function render() {
  const currentElection = getCurrentElection();
  const electionsForType = getElectionsByType(state.type);
  const availableParties = getAvailableParties(state.type);

  elements.generatedAt.textContent = `Dataset rigenerato il ${dateTimeFormatter.format(
    new Date(state.data.generatedAt),
  )}`;
  elements.coverageNote.textContent = state.data.coverageNote;
  elements.seriesMeta.textContent = `${electionsForType.length} elezioni disponibili`;
  elements.partyInput.value = state.party ? getPartyInputLabel(state.party) : "";

  renderTypeTabs();
  renderYearChips(electionsForType);
  renderPartyOptions(availableParties);
  renderSummary(currentElection);
  renderWinnerCards(electionsForType);
  renderLeaderboard(currentElection);
  renderTrendChart(electionsForType, state.party);
  renderTable(currentElection);
  syncHash();
}

function renderTypeTabs() {
  const labels = {
    assemblea_costituente: "Assemblea Costituente",
    camera: "Camera",
    senato: "Senato",
    referendum: "Referendum",
    provinciali: "Provinciali",
    comunali: "Comunali",
  };

  elements.typeTabs.innerHTML = getAvailableTypes()
    .map(
      (type) => `
        <button
          type="button"
          class="tab ${type === state.type ? "is-active" : ""}"
          data-type="${type}"
        >
          ${labels[type]}
        </button>
      `,
    )
    .join("");
}

function renderYearChips(electionsForType) {
  const useDateLabels = hasDuplicateYears(electionsForType);
  elements.yearChips.innerHTML = [...electionsForType]
    .reverse()
    .map(
      (election) => `
        <button
          type="button"
          class="year-chip ${election.id === state.electionId ? "is-active" : ""}"
          data-election-id="${election.id}"
        >
          ${useDateLabels ? formatShortDate(election.date) : election.year}
        </button>
      `,
    )
    .join("");
}

function renderPartyOptions(parties) {
  elements.partyOptions.innerHTML = parties
    .map((party) => `<option value="${escapeHtml(getPartyInputLabel(party))}"></option>`)
    .join("");
}

function renderSummary(election) {
  elements.summaryKicker.textContent = election.typeLabel;
  elements.summaryTitle.textContent = dateFormatter.format(parseIsoDate(election.date));

  if (election.type === "referendum") {
    const questionText = election.referendumQuestion
      ? `${escapeHtml(election.referendumQuestion)}. `
      : "";
    elements.summaryNote.innerHTML = `${questionText}${renderPartyLabel(election.winner.name, {
      compact: true,
      hideRawName: true,
      inline: true,
    })} è l'opzione prevalente con ${escapeHtml(formatPercent(election.winner.share))} dei voti validi.`;
  } else {
    elements.summaryNote.innerHTML = `${renderPartyLabel(election.winner.name, {
      compact: true,
      hideRawName: true,
      inline: true,
    })} è la prima lista con ${escapeHtml(formatPercent(election.winner.share))} dei voti validi.`;
  }
  elements.sourceFiles.textContent = `File usati per l'aggregazione: ${election.sourceFiles.join(
    ", ",
  )}`;
  elements.sourceLink.href = election.sourceUrl;

  const kpis = [
    {
      title: election.type === "referendum" ? "Opzione in testa" : "Lista in testa",
      valueHtml: renderPartyLabel(election.winner.name, {
        compact: true,
        hideRawName: true,
      }),
      detail: `${formatNumber(election.winner.votes)} voti, ${formatPercent(
        election.winner.share,
      )}`,
    },
    {
      title: "Affluenza",
      value: formatPercent(election.totals.turnoutPct),
      detail: `${formatNumber(election.totals.voters)} votanti su ${formatNumber(
        election.totals.electors,
      )} elettori`,
    },
    {
      title: "Voti validi di lista",
      value: formatNumber(election.totals.validVotes),
      detail: election.type === "referendum"
        ? `${election.results.length} opzioni in classifica`
        : `${election.results.length} liste in classifica`,
    },
    {
      title: "Schede bianche",
      value: formatNumber(election.totals.blankBallots),
      detail: `${formatPercent(election.totals.blankPct)} dei votanti`,
    },
  ];

  elements.kpiGrid.innerHTML = kpis
    .map(
      (kpi) => `
        <article class="kpi">
          <p class="kpi-title">${escapeHtml(kpi.title)}</p>
          <p class="kpi-value">${kpi.valueHtml ?? escapeHtml(kpi.value)}</p>
          <p class="kpi-detail">${escapeHtml(kpi.detail)}</p>
        </article>
      `,
    )
    .join("");
}

function renderWinnerCards(electionsForType) {
  const useDateLabels = hasDuplicateYears(electionsForType);
  elements.winnerCards.innerHTML = electionsForType
    .map(
      (election) => `
        <button
          type="button"
          class="winner-card ${election.id === state.electionId ? "is-active" : ""}"
          data-election-id="${election.id}"
        >
          <span class="winner-year">${
            useDateLabels ? formatShortDate(election.date) : election.year
          }</span>
          <span class="winner-name">${renderPartyLabel(election.winner.name, {
            compact: true,
          })}</span>
          <span class="winner-meta">${formatPercent(
            election.winner.share,
          )} · affluenza ${formatPercent(election.totals.turnoutPct)}</span>
        </button>
      `,
    )
    .join("");
}

function renderLeaderboard(election) {
  const topResults = election.results.slice(0, 12);

  elements.leaderboard.innerHTML = topResults
    .map(
      (result, index) => `
        <button
          type="button"
          class="leaderboard-item ${result.name === state.party ? "is-selected" : ""}"
          data-party="${escapeAttribute(result.name)}"
        >
          <span class="leaderboard-rank">${index + 1}</span>
          <span class="leaderboard-main">
            <span class="leaderboard-name">${renderPartyLabel(result.name, {
              compact: true,
            })}</span>
            <span class="leaderboard-track">
              <span class="leaderboard-fill" style="--share: ${result.share};"></span>
            </span>
          </span>
          <span class="leaderboard-stats">
            <span class="leaderboard-share">${formatPercent(result.share)}</span>
            <span class="leaderboard-votes">${formatNumber(result.votes)} voti</span>
          </span>
        </button>
      `,
    )
    .join("");
}

function renderTrendChart(electionsForType, party) {
  const useDateLabels = hasDuplicateYears(electionsForType);
  const series = electionsForType.map((election) => {
    const result = election.results.find((item) => item.name === party);
    return {
      election,
      share: result?.share ?? 0,
      votes: result?.votes ?? 0,
      present: Boolean(result),
    };
  });

  const presenceCount = series.filter((item) => item.present).length;
  const peak = series.reduce((best, item) => (item.share > best.share ? item : best), series[0]);
  const maxShare = Math.max(...series.map((item) => item.share), 5);
  const partyDisplayName = getPartyDisplayName(party);

  elements.trendCaption.textContent = `${partyDisplayName} compare in ${presenceCount} elezioni su ${series.length}. Picco: ${peak.election.year} con ${formatPercent(
    peak.share,
  )}.`;

  elements.trendChart.innerHTML = `
    <div class="trend-selected">
      <strong class="trend-name">${renderPartyLabel(party, {
        compact: true,
        hideRawName: true,
      })}</strong>
      <span class="trend-meta">Clicca una barra per aprire quell'anno.</span>
    </div>
    <div class="trend-columns">
      ${series
        .map(
          (item) => `
            <button
              type="button"
              class="trend-column ${item.present ? "" : "is-empty"} ${
                item.election.id === state.electionId ? "is-current" : ""
              }"
              data-election-id="${item.election.id}"
            >
              <span class="trend-value">${
                item.present ? formatPercent(item.share) : "–"
              }</span>
              <span class="trend-bar-track">
                <span
                  class="trend-bar-fill"
                  style="--height: ${(item.share / maxShare) * 100};"
                ></span>
              </span>
              <span class="trend-year">${
                useDateLabels ? formatShortDate(item.election.date) : item.election.year
              }</span>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderTable(election) {
  elements.tableCaption.textContent = election.type === "referendum"
    ? `${election.results.length} opzioni ordinate per voti validi.`
    : `${election.results.length} liste ordinate per voti validi.`;
  elements.resultsBody.innerHTML = election.results
    .map(
      (result, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <button
              type="button"
              class="result-list-trigger ${result.name === state.party ? "is-selected" : ""}"
              data-party="${escapeAttribute(result.name)}"
            >
              ${renderPartyLabel(result.name, {
                compact: true,
              })}
            </button>
          </td>
          <td>${formatNumber(result.votes)}</td>
          <td class="table-share">${formatPercent(result.share)}</td>
        </tr>
      `,
    )
    .join("");
}

function getAvailableTypes() {
  return Array.from(new Set(state.data.elections.map((item) => item.type)));
}

function getElectionsByType(type) {
  return state.data.elections.filter((item) => item.type === type);
}

function getCurrentElection() {
  return state.data.elections.find((item) => item.id === state.electionId);
}

function getAvailableParties(type) {
  const totals = new Map();
  getElectionsByType(type).forEach((election) => {
    election.results.forEach((result) => {
      totals.set(result.name, (totals.get(result.name) ?? 0) + result.votes);
    });
  });

  return Array.from(totals.entries())
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }
      return left[0].localeCompare(right[0], "it");
    })
    .map(([name]) => name);
}

function normalizePartyInput(value, parties) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const normalizedValue = normalizeAlias(trimmed);
  for (const party of parties) {
    const aliases = getPartyAliases(party);
    if (aliases.some((alias) => normalizeAlias(alias) === normalizedValue)) {
      return party;
    }
  }
  return null;
}

function readStateFromHash() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return {
    type: params.get("type"),
    electionId: params.get("election"),
    year: Number(params.get("year")),
    party: params.get("party"),
  };
}

function syncHash() {
  const currentElection = getCurrentElection();
  const params = new URLSearchParams({
    type: state.type,
    election: currentElection.id,
    year: String(currentElection.year),
    party: state.party,
  });
  const nextHash = `#${params.toString()}`;
  if (window.location.hash !== nextHash) {
    history.replaceState(null, "", nextHash);
  }
}

function formatNumber(value) {
  return numberFormatter.format(Math.round(value));
}

function formatPercent(value) {
  return `${percentFormatter.format(value)}%`;
}

function getPartyAliases(name) {
  const displayName = getPartyDisplayName(name);
  const aliases = [name, displayName, getPartyInputLabel(name)];

  const canonicalKey = getCanonicalPartyKey(name);
  const meta = PARTY_META[canonicalKey];
  if (meta?.displayName) {
    aliases.push(meta.displayName);
  }

  return Array.from(new Set(aliases.filter(Boolean)));
}

function getPartyDisplayName(name) {
  const rawName = String(name ?? "").trim();
  if (!rawName) {
    return "";
  }

  const exactMeta = PARTY_META[getCanonicalPartyKey(rawName)];
  if (exactMeta && !hasPartySeparators(rawName)) {
    return exactMeta.displayName;
  }

  return splitPartyName(rawName)
    .map((part) => {
      if (isPartySeparator(part)) {
        return part.includes("/") ? " / " : " - ";
      }
      return formatPartySegment(part);
    })
    .join("")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function getPartyInputLabel(name) {
  const rawName = String(name ?? "").trim();
  const displayName = getPartyDisplayName(rawName);
  if (!displayName) {
    return "";
  }

  if (normalizeAlias(rawName) === normalizeAlias(displayName)) {
    return displayName;
  }

  return `${displayName} (${rawName})`;
}

function getPartyPresentation(name) {
  const rawName = String(name ?? "").trim();
  const displayName = getPartyDisplayName(rawName);
  return {
    rawName,
    displayName,
    showRawName:
      normalizeAlias(rawName) !== normalizeAlias(displayName) &&
      rawName.length <= 24 &&
      (rawName.includes(".") || rawName === rawName.toUpperCase()),
    marks: getPartyMarks(rawName, displayName),
  };
}

function renderPartyLabel(name, options = {}) {
  const presentation = getPartyPresentation(name);
  if (!presentation.displayName) {
    return "";
  }

  const classes = ["party-label"];
  if (options.compact) {
    classes.push("is-compact");
  }
  if (options.inline) {
    classes.push("is-inline");
  }

  return `
    <span class="${classes.join(" ")}">
      ${renderPartyMarks(presentation.marks)}
      <span class="party-copy">
        <span class="party-display">${escapeHtml(presentation.displayName)}</span>
        ${
          presentation.showRawName && !options.hideRawName
            ? `<span class="party-raw">${escapeHtml(presentation.rawName)}</span>`
            : ""
        }
      </span>
    </span>
  `.replace(/\s+/g, " ").trim();
}

function renderPartyMarks(marks) {
  const stackClass = `party-mark-stack ${marks.length > 1 ? "is-multi" : ""}`.trim();
  return `
    <span class="${stackClass}" aria-hidden="true">
      ${marks
        .map((mark) => {
          const imageHtml = mark.src
            ? `<img
                src="${escapeAttribute(mark.src)}"
                alt=""
                loading="lazy"
                referrerpolicy="no-referrer"
                onload="this.previousElementSibling.hidden = true"
                onerror="this.remove()"
              />`
            : "";

          return `
            <span class="party-mark">
              <span class="party-mark-fallback">${escapeHtml(mark.fallbackText)}</span>
              ${imageHtml}
            </span>
          `.replace(/\s+/g, " ").trim();
        })
        .join("")}
    </span>
  `.replace(/\s+/g, " ").trim();
}

function getPartyMarks(name, displayName) {
  const exactMeta = PARTY_META[getCanonicalPartyKey(name)];
  if (exactMeta?.emblemFile) {
    return [createPartyMark(exactMeta, name, displayName)];
  }

  const marks = [];
  const seen = new Set();
  splitPartyName(name).forEach((part) => {
    if (isPartySeparator(part)) {
      return;
    }

    const segment = part.trim();
    if (!segment) {
      return;
    }

    const canonicalKey = getCanonicalPartyKey(segment);
    const meta = PARTY_META[canonicalKey];
    if (!meta?.emblemFile || seen.has(canonicalKey)) {
      return;
    }

    seen.add(canonicalKey);
    marks.push(createPartyMark(meta, segment, meta.displayName));
  });

  if (marks.length) {
    return marks.slice(0, 3);
  }

  return [
    {
      src: null,
      fallbackText: getPartyBadgeText(name, displayName),
    },
  ];
}

function createPartyMark(meta, rawName, displayName) {
  return {
    src: getCommonsFileUrl(meta.emblemFile),
    fallbackText: getPartyBadgeText(rawName, displayName),
  };
}

function getPartyBadgeText(rawName, displayName) {
  const condensedRaw = String(rawName ?? "")
    .replaceAll(".", "")
    .replaceAll("'", "")
    .replaceAll("/", "")
    .replaceAll("-", "")
    .replace(/\s+/g, "")
    .trim();
  if (condensedRaw && condensedRaw.length <= 6 && condensedRaw === condensedRaw.toUpperCase()) {
    return condensedRaw;
  }

  const initials = String(displayName ?? "")
    .split(/\s+/)
    .map((word) => word.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, ""))
    .filter((word) => word && !TITLE_CASE_SMALL_WORDS.has(word.toLowerCase()))
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return initials || "LISTA";
}

function getCommonsFileUrl(fileName) {
  return `${COMMONS_FILE_REDIRECT}${encodeURIComponent(fileName)}`;
}

function getCanonicalPartyKey(name) {
  return PARTY_ALIASES[name] ?? name;
}

function formatPartySegment(segment) {
  const trimmed = segment.trim();
  if (!trimmed) {
    return "";
  }

  const meta = PARTY_META[getCanonicalPartyKey(trimmed)];
  if (meta) {
    return meta.displayName;
  }

  if (isUnexpandedPartyCode(trimmed)) {
    return trimmed;
  }

  return titleCasePartyName(trimmed);
}

function splitPartyName(value) {
  return String(value).split(/(\s*[-/]\s*)/);
}

function isPartySeparator(value) {
  return /^\s*[-/]\s*$/.test(value);
}

function hasPartySeparators(value) {
  return /[-/]/.test(value);
}

function isUnexpandedPartyCode(value) {
  if (/^[A-Z]'[A-Z]{3,}$/.test(value)) {
    return false;
  }

  return value.includes(".") || (/^[A-Z0-9'&]{2,8}$/.test(value) && !value.includes(" "));
}

function titleCasePartyName(value) {
  return value
    .split(/\s+/)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if ((lower.startsWith("d'") || lower.startsWith("l'")) && lower.length > 2) {
        const prefix = index === 0 ? `${lower[0].toUpperCase()}'` : lower.slice(0, 2);
        return `${prefix}${capitalizeWord(lower.slice(2))}`;
      }

      if (index > 0 && TITLE_CASE_SMALL_WORDS.has(lower)) {
        return restoreFinalAccent(lower);
      }

      return restoreFinalAccent(capitalizeWord(lower));
    })
    .join(" ");
}

function capitalizeWord(value) {
  if (!value) {
    return "";
  }
  return value[0].toUpperCase() + value.slice(1);
}

function restoreFinalAccent(value) {
  return value
    .replace(/a'$/i, "à")
    .replace(/e'$/i, "è")
    .replace(/i'$/i, "ì")
    .replace(/o'$/i, "ò")
    .replace(/u'$/i, "ù");
}

function normalizeAlias(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replaceAll("’", "'")
    .replaceAll("'", "")
    .replace(/[().]/g, " ")
    .replace(/\s*[-/]\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function hasDuplicateYears(elections) {
  const seenYears = new Set();
  for (const election of elections) {
    if (seenYears.has(election.year)) {
      return true;
    }
    seenYears.add(election.year);
  }
  return false;
}

function formatShortDate(isoDate) {
  return shortDateFormatter.format(parseIsoDate(isoDate));
}

function parseIsoDate(value) {
  const [year, month, day] = String(value ?? "").split("-").map((part) => Number(part));
  if (
    Number.isFinite(year) &&
    Number.isFinite(month) &&
    Number.isFinite(day) &&
    year > 0 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= 31
  ) {
    return new Date(year, month - 1, day);
  }

  return new Date(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}
