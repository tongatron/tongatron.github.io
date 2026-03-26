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
  candidate: null,
};

const elements = {
  generatedAt: document.querySelector("#generated-at"),
  coverageNote: document.querySelector("#coverage-note"),
  typeTabs: document.querySelector("#type-tabs"),
  seriesMeta: document.querySelector("#series-meta"),
  yearSelect: document.querySelector("#year-select"),
  partyInput: document.querySelector("#party-search"),
  partyApply: document.querySelector("#party-apply"),
  partyOptions: document.querySelector("#party-options"),
  candidateInput: document.querySelector("#candidate-search"),
  candidateApply: document.querySelector("#candidate-apply"),
  candidateOptions: document.querySelector("#candidate-options"),
  electionPrev: document.querySelector("#election-prev"),
  electionNext: document.querySelector("#election-next"),
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
  insightTitle: document.querySelector("#insight-title"),
  insightCaption: document.querySelector("#insight-caption"),
  typeInsight: document.querySelector("#type-insight"),
  candidateCaption: document.querySelector("#candidate-caption"),
  candidateChart: document.querySelector("#candidate-chart"),
  candidateHistory: document.querySelector("#candidate-history"),
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

  const availablePartiesGlobal = getAvailablePartiesAll();
  state.party = normalizePartyInput(requested.party, availablePartiesGlobal);
  if (state.party) {
    const partiesForType = getAvailableParties(state.type);
    if (!partiesForType.includes(state.party)) {
      const preferredElection = findBestElectionForParty(state.party);
      if (preferredElection) {
        state.type = preferredElection.type;
        state.electionId = preferredElection.id;
      }
    }
  } else {
    state.party = getCurrentElection().winner.name;
  }

  const availableCandidates = getAvailableCandidates(state.type);
  state.candidate = normalizeCandidateInput(requested.candidate, availableCandidates);

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

  elements.yearSelect.addEventListener("change", (event) => {
    const electionId = event.target.value;
    if (!electionId) {
      return;
    }
    setElection(electionId, true);
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

  elements.trendChart.addEventListener("click", (event) => {
    const button = event.target.closest("[data-election-id]");
    if (!button) {
      return;
    }

    setElection(button.dataset.electionId, true);
  });

  elements.candidateChart.addEventListener("click", (event) => {
    const button = event.target.closest("[data-candidate]");
    if (!button) {
      return;
    }

    setCandidate(button.dataset.candidate);
  });

  elements.candidateHistory.addEventListener("click", (event) => {
    const button = event.target.closest("[data-election-id][data-type]");
    if (!button) {
      return;
    }
    goToCandidatePresence(button.dataset.type, button.dataset.electionId);
  });

  elements.partyApply.addEventListener("click", applyPartyInput);
  elements.partyInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyPartyInput();
    }
  });
  elements.candidateApply.addEventListener("click", applyCandidateInput);
  elements.candidateInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyCandidateInput();
    }
  });

  elements.electionPrev.addEventListener("click", () => stepElection(-1));
  elements.electionNext.addEventListener("click", () => stepElection(1));

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

    const party = normalizePartyInput(requested.party, getAvailablePartiesAll());
    if (party) {
      state.party = party;
    }

    if (requested.candidate === null) {
      state.candidate = null;
    } else {
      const candidate = normalizeCandidateInput(
        requested.candidate,
        getAvailableCandidates(state.type),
      );
      state.candidate = candidate;
    }

    render();
  });

  window.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLElement) {
      const tag = event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || event.target.isContentEditable) {
        return;
      }
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepElection(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      stepElection(1);
    }
  });
}

function applyPartyInput() {
  const query = elements.partyInput.value;
  const partiesForType = getAvailableParties(state.type);
  const totalsForType = computePartyTotals(getElectionsByType(state.type));
  const localMatch = findBestPartyMatch(query, partiesForType, totalsForType);
  if (localMatch) {
    setParty(localMatch);
    return;
  }

  const resolvedGlobal = resolveGlobalPartySearch(query);
  if (resolvedGlobal) {
    state.type = resolvedGlobal.election.type;
    state.electionId = resolvedGlobal.election.id;
    state.party = resolvedGlobal.party;
    state.candidate = normalizeCandidateInput(
      state.candidate,
      getAvailableCandidates(state.type),
    );
    render();
  }
}

function applyCandidateInput() {
  const availableCandidates = getAvailableCandidates(state.type);
  const rawValue = elements.candidateInput.value.trim();
  if (!rawValue) {
    clearCandidate();
    return;
  }

  const normalized = normalizeCandidateInput(rawValue, availableCandidates);
  if (normalized) {
    setCandidate(normalized);
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
  state.candidate = normalizeCandidateInput(state.candidate, getAvailableCandidates(type));
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

function stepElection(delta) {
  const electionsForType = getElectionsByType(state.type);
  const currentIndex = electionsForType.findIndex((item) => item.id === state.electionId);
  if (currentIndex < 0) {
    return;
  }

  const nextIndex = currentIndex + delta;
  if (nextIndex < 0 || nextIndex >= electionsForType.length) {
    return;
  }

  setElection(electionsForType[nextIndex].id, true);
}

function setParty(party) {
  if (!party || state.party === party) {
    return;
  }

  state.party = party;
  render();
}

function setCandidate(candidate) {
  if (!candidate || state.candidate === candidate) {
    return;
  }

  state.candidate = candidate;

  const currentElection = getCurrentElection();
  if (!hasCandidateInElection(currentElection, candidate)) {
    const latestMatchingElection = [...getElectionsByType(state.type)]
      .reverse()
      .find((election) => hasCandidateInElection(election, candidate));
    if (latestMatchingElection) {
      state.electionId = latestMatchingElection.id;
    }
  }

  render();
}

function clearCandidate() {
  if (!state.candidate) {
    return;
  }
  state.candidate = null;
  render();
}

function render() {
  const currentElection = getCurrentElection();
  const electionsForType = getElectionsByType(state.type);
  const availableParties = getAvailablePartiesAll();
  const availableCandidates = getAvailableCandidates(state.type);

  elements.generatedAt.textContent = `Dataset rigenerato il ${dateTimeFormatter.format(
    new Date(state.data.generatedAt),
  )}`;
  elements.coverageNote.textContent = state.data.coverageNote;
  elements.seriesMeta.textContent = `${electionsForType.length} elezioni disponibili`;
  elements.partyInput.value = state.party ? getPartyInputLabel(state.party) : "";
  elements.candidateInput.value = state.candidate ?? "";

  renderTypeTabs();
  renderYearSelect(electionsForType);
  renderElectionPager(electionsForType);
  renderPartyOptions(availableParties);
  renderCandidateOptions(availableCandidates);
  renderSummary(currentElection);
  renderWinnerCards(electionsForType);
  renderLeaderboard(currentElection);
  renderTrendChart(electionsForType, state.party);
  renderTypeInsight(currentElection, electionsForType);
  renderCandidateChart(currentElection);
  renderCandidateHistory(state.candidate);
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

function renderYearSelect(electionsForType) {
  const useDateLabels = hasDuplicateYears(electionsForType);
  elements.yearSelect.innerHTML = [...electionsForType]
    .reverse()
    .map(
      (election) => `
        <option value="${election.id}" ${election.id === state.electionId ? "selected" : ""}>
          ${useDateLabels ? formatShortDate(election.date) : election.year}
        </option>
      `,
    )
    .join("");
}

function renderElectionPager(electionsForType) {
  const currentIndex = electionsForType.findIndex((item) => item.id === state.electionId);
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex === electionsForType.length - 1;

  elements.electionPrev.disabled = isFirst;
  elements.electionNext.disabled = isLast;
  elements.electionPrev.title = isFirst
    ? "Nessuna elezione precedente"
    : "Vai all'elezione precedente";
  elements.electionNext.title = isLast
    ? "Nessuna elezione successiva"
    : "Vai all'elezione successiva";
}

function renderPartyOptions(parties) {
  elements.partyOptions.innerHTML = parties
    .slice(0, 900)
    .map((party) => `<option value="${escapeHtml(getPartyInputLabel(party))}"></option>`)
    .join("");
}

function renderCandidateOptions(candidates) {
  elements.candidateOptions.innerHTML = candidates
    .slice(0, 600)
    .map((candidate) => `<option value="${escapeHtml(candidate)}"></option>`)
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
  ];

  if (election.type === "referendum") {
    const quorumReached = election.totals.turnoutPct >= 50;
    kpis.push({
      title: "Quorum (50% + 1)",
      value: quorumReached ? "Raggiunto" : "Non raggiunto",
      detail: `Affluenza al ${formatPercent(election.totals.turnoutPct)}`,
    });
  } else if (election.winnerCandidate) {
    kpis.push({
      title: "Candidato più votato",
      value: election.winnerCandidate.name,
      detail: `${formatNumber(election.winnerCandidate.votes)} voti`,
    });
  }

  kpis.push({
    title: "Schede bianche",
    value: formatNumber(election.totals.blankBallots),
    detail: `${formatPercent(election.totals.blankPct)} dei votanti`,
  });

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
  elements.winnerCards.innerHTML = [...electionsForType]
    .reverse()
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
  const fullSeries = electionsForType.map((election) => {
    const result = election.results.find((item) => item.name === party);
    return {
      election,
      share: result?.share ?? 0,
      votes: result?.votes ?? 0,
      present: Boolean(result),
    };
  });
  const series = fullSeries.filter((item) => item.present);
  const partyDisplayName = getPartyDisplayName(party) || party || "Lista selezionata";

  if (!series.length) {
    elements.trendCaption.textContent = `${partyDisplayName} non compare nella serie storica di questo tipo di elezione.`;
    elements.trendChart.innerHTML = `
      <p class="trend-empty">
        Nessun anno disponibile da mostrare per la lista selezionata.
      </p>
    `;
    return;
  }

  const peak = series.reduce((best, item) => (item.share > best.share ? item : best), series[0]);
  const maxShare = Math.max(...series.map((item) => item.share), 5);

  elements.trendCaption.textContent = `${partyDisplayName} compare in ${series.length} elezioni su ${fullSeries.length}. Picco: ${
    useDateLabels ? formatShortDate(peak.election.date) : peak.election.year
  } con ${formatPercent(peak.share)}.`;

  elements.trendChart.innerHTML = `
    <div class="trend-selected">
      <strong class="trend-name">${renderPartyLabel(party, {
        compact: true,
        hideRawName: true,
      })}</strong>
      <span class="trend-meta">Solo anni in cui la lista è presente. Clicca una barra per aprire quell'elezione.</span>
    </div>
    <div class="trend-columns">
      ${series
        .map(
          (item) => `
            <button
              type="button"
              class="trend-column ${item.election.id === state.electionId ? "is-current" : ""}"
              data-election-id="${item.election.id}"
            >
              <span class="trend-value">${formatPercent(item.share)}</span>
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

function renderTypeInsight(election, electionsForType) {
  if (election.type === "referendum") {
    renderReferendumInsight(election);
    return;
  }

  const results = Array.isArray(election.results) ? election.results : [];
  if (!results.length) {
    elements.insightTitle.textContent = "Analisi competizione";
    elements.insightCaption.textContent = "Dati liste non disponibili per questa elezione.";
    elements.typeInsight.innerHTML = `
      <p class="insight-hint">
        Il dataset non contiene risultati di lista sufficienti per calcolare indicatori comparabili.
      </p>
    `;
    return;
  }

  const topFive = results.slice(0, 5);
  const topThreeShare = topFive.slice(0, 3).reduce((sum, item) => sum + item.share, 0);
  const concentration = results.reduce((sum, item) => {
    const quota = item.share / 100;
    return sum + quota * quota;
  }, 0);
  const effectiveLists = concentration > 0 ? 1 / concentration : 0;
  const currentIndex = electionsForType.findIndex((item) => item.id === election.id);
  const previousElection = currentIndex > 0 ? electionsForType[currentIndex - 1] : null;
  const previousWinnerShare = previousElection
    ? previousElection.results.find((item) => item.name === election.winner.name)?.share ?? 0
    : null;
  const winnerDelta = previousWinnerShare === null
    ? null
    : election.winner.share - previousWinnerShare;

  elements.insightTitle.textContent = "Analisi competizione";
  elements.insightCaption.textContent = previousElection
    ? `Confronto con ${formatShortDate(previousElection.date)}.`
    : "Prima elezione disponibile della serie.";

  const deltaText = winnerDelta === null
    ? "N/D"
    : `${winnerDelta >= 0 ? "+" : ""}${formatPercent(winnerDelta)}`;

  elements.typeInsight.innerHTML = `
    <div class="insight-stats">
      <article class="insight-stat">
        <p class="insight-stat-label">Top 3 liste</p>
        <p class="insight-stat-value">${formatPercent(topThreeShare)}</p>
      </article>
      <article class="insight-stat">
        <p class="insight-stat-label">Liste effettive</p>
        <p class="insight-stat-value">${effectiveLists.toFixed(2)}</p>
      </article>
      <article class="insight-stat">
        <p class="insight-stat-label">Delta vincitore</p>
        <p class="insight-stat-value">${deltaText}</p>
      </article>
    </div>
    <div class="insight-stack">
      ${topFive
        .map(
          (result) => `
            <div class="insight-row">
              <div class="insight-row-head">
                <span>${renderPartyLabel(result.name, { compact: true, hideRawName: true })}</span>
                <strong>${formatPercent(result.share)}</strong>
              </div>
              <span class="insight-row-track">
                <span class="insight-row-fill" style="--value: ${result.share};"></span>
              </span>
            </div>
          `,
        )
        .join("")}
    </div>
    <p class="insight-hint">
      ${
        election.winnerCandidate
          ? `Candidato più votato: ${escapeHtml(election.winnerCandidate.name)} (${formatNumber(
            election.winnerCandidate.votes,
          )} voti).`
          : "Nel dataset di questa elezione non sono presenti voti candidati aggregabili."
      }
    </p>
  `;
}

function renderReferendumInsight(election) {
  const yes = election.results.find((item) => normalizeAlias(item.name) === "si")
    ?? election.results[0]
    ?? { name: "SI", share: 0, votes: 0 };
  const no = election.results.find((item) => normalizeAlias(item.name) === "no")
    ?? election.results[1]
    ?? { name: "NO", share: 0, votes: 0 };
  const gapVotes = Math.abs(yes.votes - no.votes);
  const quorumReached = election.totals.turnoutPct >= 50;

  elements.insightTitle.textContent = "Analisi quesito";
  elements.insightCaption.textContent = quorumReached
    ? "Quorum raggiunto."
    : "Quorum non raggiunto.";

  elements.typeInsight.innerHTML = `
    <div class="insight-stats">
      <article class="insight-stat">
        <p class="insight-stat-label">SI</p>
        <p class="insight-stat-value">${formatPercent(yes.share)}</p>
      </article>
      <article class="insight-stat">
        <p class="insight-stat-label">NO</p>
        <p class="insight-stat-value">${formatPercent(no.share)}</p>
      </article>
      <article class="insight-stat">
        <p class="insight-stat-label">Scarto voti</p>
        <p class="insight-stat-value">${formatNumber(gapVotes)}</p>
      </article>
    </div>
    <div class="insight-stack">
      ${[
        { label: "SI", share: yes.share, votes: yes.votes },
        { label: "NO", share: no.share, votes: no.votes },
        { label: "Affluenza", share: election.totals.turnoutPct, votes: election.totals.voters },
      ]
        .map(
          (row) => `
            <div class="insight-row">
              <div class="insight-row-head">
                <span>${escapeHtml(row.label)}</span>
                <strong>${formatPercent(row.share)}</strong>
              </div>
              <span class="insight-row-track">
                <span class="insight-row-fill" style="--value: ${row.share};"></span>
              </span>
            </div>
          `,
        )
        .join("")}
    </div>
    <p class="insight-hint">
      Voti validi: ${formatNumber(election.totals.validVotes)}.
    </p>
  `;
}

function renderCandidateChart(election) {
  const allCandidates = Array.isArray(election.candidates) ? election.candidates : [];
  const candidateLists = election.candidateLists && typeof election.candidateLists === "object"
    ? election.candidateLists
    : null;
  const scopedCandidates = state.party && candidateLists
    ? candidateLists[state.party]
    : null;
  const hasScopedCandidates = Array.isArray(scopedCandidates) && scopedCandidates.length > 0;
  const candidates = hasScopedCandidates ? scopedCandidates : allCandidates;
  const candidateCount = hasScopedCandidates
    ? scopedCandidates.length
    : Number.isFinite(election.candidateCount)
      ? election.candidateCount
      : candidates.length;
  const selectedCandidateToken = normalizeSearchToken(state.candidate);
  const selectedIndex = selectedCandidateToken
    ? candidates.findIndex(
      (candidate) => normalizeSearchToken(candidate.name) === selectedCandidateToken,
    )
    : -1;

  if (!candidates.length) {
    if (state.candidate) {
      elements.candidateCaption.textContent = "Il candidato cercato non è disponibile per questa elezione.";
    } else if (state.party && candidateLists) {
      elements.candidateCaption.textContent = `Nessun candidato collegato alla lista ${getPartyDisplayName(state.party)} in questa elezione.`;
    } else {
      elements.candidateCaption.textContent = "Nessun dato candidati disponibile.";
    }
    elements.candidateChart.innerHTML = `
      <p class="candidate-empty">
        Questo tipo di elezione non include nel dataset un tracciato candidati uniforme per tutte le serie storiche.
      </p>
    `;
    return;
  }

  const topCandidates = selectedIndex >= 0
    ? [candidates[selectedIndex], ...candidates.filter((_, index) => index !== selectedIndex).slice(0, 11)]
    : candidates.slice(0, 12);

  const hasTrimmedList = candidateCount > candidates.length;
  if (selectedIndex >= 0) {
    elements.candidateCaption.textContent = hasScopedCandidates
      ? `Top candidati della lista ${getPartyDisplayName(state.party)} · focus su ${candidates[selectedIndex].name}.`
      : `${candidateCount} candidati aggregati · focus su ${candidates[selectedIndex].name} (posizione ${selectedIndex + 1}).`;
  } else if (state.candidate) {
    elements.candidateCaption.textContent = hasScopedCandidates
      ? `${state.candidate} non è tra i candidati disponibili per la lista ${getPartyDisplayName(state.party)}.`
      : `${state.candidate} non è presente in questa elezione.`;
  } else if (hasScopedCandidates) {
    elements.candidateCaption.textContent = `Top candidati della lista ${getPartyDisplayName(state.party)} in questa elezione.`;
  } else {
    elements.candidateCaption.textContent = hasTrimmedList
      ? `${candidateCount} candidati aggregati (top ${candidates.length} nel dataset).`
      : `${candidateCount} candidati con voti aggregati.`;
  }

  elements.candidateChart.innerHTML = topCandidates
    .map(
      (candidate) => `
        <button
          type="button"
          class="candidate-item ${normalizeSearchToken(candidate.name) === selectedCandidateToken ? "is-selected" : ""}"
          data-candidate="${escapeAttribute(candidate.name)}"
        >
          <span class="candidate-rank">${
            candidates.findIndex((item) => item.name === candidate.name) + 1
          }</span>
          <span class="candidate-main">
            <span class="candidate-name">${escapeHtml(candidate.name)}</span>
            <span class="candidate-track">
              <span class="candidate-fill" style="--share: ${candidate.share};"></span>
            </span>
          </span>
          <span class="candidate-stats">
            <span class="candidate-share">${formatPercent(candidate.share)}</span>
            <span class="candidate-votes">${formatNumber(candidate.votes)} voti</span>
          </span>
        </button>
      `,
    )
    .join("");
}

function renderCandidateHistory(candidateName) {
  if (!candidateName) {
    elements.candidateHistory.innerHTML = "";
    return;
  }

  const presences = getCandidatePresences(candidateName);
  if (!presences.length) {
    elements.candidateHistory.innerHTML = `
      <div class="candidate-history-head">
        <h3>Presenze nel tempo</h3>
      </div>
      <p class="candidate-empty">Nessuna presenza storica trovata per questo candidato.</p>
    `;
    return;
  }

  const visiblePresences = presences.slice(0, 32);
  const hiddenCount = presences.length - visiblePresences.length;
  elements.candidateHistory.innerHTML = `
    <div class="candidate-history-head">
      <h3>Presenze nel tempo</h3>
      <p>${escapeHtml(candidateName)} compare in ${presences.length} elezioni.</p>
    </div>
    <div class="candidate-history-list">
      ${visiblePresences
        .map((presence) => `
          <button
            type="button"
            class="candidate-history-item ${presence.election.id === state.electionId ? "is-current" : ""}"
            data-type="${presence.election.type}"
            data-election-id="${presence.election.id}"
          >
            <span class="candidate-history-date">${formatShortDate(presence.election.date)}</span>
            <span class="candidate-history-type">${escapeHtml(presence.election.typeLabel)}</span>
            <span class="candidate-history-meta">${formatNumber(presence.votes)} voti · ${formatPercent(presence.share)}</span>
            ${
              presence.lists.length
                ? `<span class="candidate-history-lists">${escapeHtml(
                  presence.lists.map((name) => getPartyDisplayName(name)).join(" · "),
                )}</span>`
                : ""
            }
          </button>
        `)
        .join("")}
    </div>
    ${
      hiddenCount > 0
        ? `<p class="candidate-history-overflow">Altre ${hiddenCount} presenze non mostrate.</p>`
        : ""
    }
  `;
}

function getCandidatePresences(candidateName) {
  const normalizedCandidate = normalizeSearchToken(candidateName);
  return state.data.elections
    .map((election) => {
      const candidates = Array.isArray(election.candidates) ? election.candidates : [];
      const globalCandidate = candidates.find(
        (candidate) => normalizeSearchToken(candidate.name) === normalizedCandidate,
      );

      const listMatches = [];
      if (election.candidateLists && typeof election.candidateLists === "object") {
        Object.entries(election.candidateLists).forEach(([listName, listCandidates]) => {
          if (!Array.isArray(listCandidates)) {
            return;
          }
          const match = listCandidates.find(
            (candidate) => normalizeSearchToken(candidate.name) === normalizedCandidate,
          );
          if (match) {
            listMatches.push({
              listName,
              votes: match.votes,
              share: match.share,
            });
          }
        });
      }

      if (!globalCandidate && !listMatches.length) {
        return null;
      }

      listMatches.sort((left, right) => right.votes - left.votes);
      const bestListMatch = listMatches[0] ?? null;
      return {
        election,
        votes: globalCandidate?.votes ?? bestListMatch?.votes ?? 0,
        share: globalCandidate?.share ?? bestListMatch?.share ?? 0,
        lists: listMatches.map((item) => item.listName).slice(0, 3),
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      const dateCompare = right.election.date.localeCompare(left.election.date);
      if (dateCompare !== 0) {
        return dateCompare;
      }
      return right.votes - left.votes;
    });
}

function goToCandidatePresence(type, electionId) {
  const targetElection = state.data.elections.find(
    (election) => election.id === electionId && election.type === type,
  );
  if (!targetElection) {
    return;
  }

  state.type = targetElection.type;
  state.electionId = targetElection.id;
  if (!getAvailableParties(state.type).includes(state.party)) {
    state.party = targetElection.winner.name;
  }
  render();
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
  return sortEntityNamesByTotals(computePartyTotals(getElectionsByType(type)));
}

function getAvailablePartiesAll() {
  return sortEntityNamesByTotals(computePartyTotals(state.data.elections));
}

function computePartyTotals(elections) {
  const totals = new Map();
  elections.forEach((election) => {
    election.results.forEach((result) => {
      totals.set(result.name, (totals.get(result.name) ?? 0) + result.votes);
    });
  });
  return totals;
}

function sortEntityNamesByTotals(totals) {
  return Array.from(totals.entries())
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }
      return left[0].localeCompare(right[0], "it");
    })
    .map(([name]) => name);
}

function getAvailableCandidates(type) {
  const totals = new Map();
  getElectionsByType(type).forEach((election) => {
    let candidates = Array.isArray(election.candidates) ? election.candidates : [];
    if (!candidates.length && election.candidateLists && typeof election.candidateLists === "object") {
      candidates = Object.values(election.candidateLists).flat();
    }
    candidates.forEach((candidate) => {
      totals.set(candidate.name, (totals.get(candidate.name) ?? 0) + candidate.votes);
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

function findBestPartyMatch(value, parties, totals) {
  const exactMatch = normalizePartyInput(value, parties);
  if (exactMatch) {
    return exactMatch;
  }

  const token = normalizeAlias(value);
  if (!token || token.length < 2) {
    return null;
  }

  const matches = parties.filter((party) =>
    getPartyAliases(party).some((alias) => normalizeAlias(alias).includes(token)),
  );
  if (!matches.length) {
    return null;
  }

  return [...matches].sort((left, right) => {
    const leftVotes = totals.get(left) ?? 0;
    const rightVotes = totals.get(right) ?? 0;
    if (rightVotes !== leftVotes) {
      return rightVotes - leftVotes;
    }
    return left.localeCompare(right, "it");
  })[0];
}

function resolveGlobalPartySearch(value) {
  const totals = computePartyTotals(state.data.elections);
  const parties = sortEntityNamesByTotals(totals);
  const party = findBestPartyMatch(value, parties, totals);
  if (!party) {
    return null;
  }

  const election = findBestElectionForParty(party);
  if (!election) {
    return null;
  }

  return {
    party,
    election,
  };
}

function findBestElectionForParty(partyName) {
  const matches = state.data.elections
    .map((election) => {
      const result = election.results.find((item) => item.name === partyName);
      if (!result) {
        return null;
      }

      return {
        election,
        share: result.share,
        votes: result.votes,
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      const dateCompare = right.election.date.localeCompare(left.election.date);
      if (dateCompare !== 0) {
        return dateCompare;
      }
      if (right.share !== left.share) {
        return right.share - left.share;
      }
      return right.votes - left.votes;
    });

  return matches[0]?.election ?? null;
}

function normalizeCandidateInput(value, candidates) {
  if (!value) {
    return null;
  }

  const trimmed = String(value).trim();
  if (!trimmed) {
    return null;
  }

  const normalizedValue = normalizeSearchToken(trimmed);
  const exact = candidates.find(
    (candidate) => normalizeSearchToken(candidate) === normalizedValue,
  );
  if (exact) {
    return exact;
  }

  const partialMatches = candidates.filter(
    (candidate) => normalizeSearchToken(candidate).includes(normalizedValue),
  );
  if (partialMatches.length === 1) {
    return partialMatches[0];
  }

  return null;
}

function hasCandidateInElection(election, candidateName) {
  let candidates = Array.isArray(election?.candidates) ? election.candidates : [];
  if (!candidates.length && election?.candidateLists && typeof election.candidateLists === "object") {
    candidates = Object.values(election.candidateLists).flat();
  }
  const normalizedValue = normalizeSearchToken(candidateName);
  return candidates.some(
    (candidate) => normalizeSearchToken(candidate.name) === normalizedValue,
  );
}

function readStateFromHash() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return {
    type: params.get("type"),
    electionId: params.get("election"),
    year: Number(params.get("year")),
    party: params.get("party"),
    candidate: params.get("candidate"),
  };
}

function syncHash() {
  const currentElection = getCurrentElection();
  const params = new URLSearchParams({
    type: state.type,
    election: currentElection.id,
    year: String(currentElection.year),
    party: state.party,
    candidate: state.candidate ?? "",
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

function normalizeSearchToken(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replaceAll("’", "'")
    .replaceAll("'", " ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
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
