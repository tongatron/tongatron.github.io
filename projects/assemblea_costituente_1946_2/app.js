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
const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "medium",
  timeStyle: "short",
});

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
  const requestedElection = electionsForType.find(
    (item) => item.year === requested.year,
  );
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
    const requestedElection = electionsForType.find(
      (item) => item.year === requested.year,
    );
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
  elements.partyInput.value = state.party ?? "";

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
  elements.yearChips.innerHTML = [...electionsForType]
    .reverse()
    .map(
      (election) => `
        <button
          type="button"
          class="year-chip ${election.id === state.electionId ? "is-active" : ""}"
          data-election-id="${election.id}"
        >
          ${election.year}
        </button>
      `,
    )
    .join("");
}

function renderPartyOptions(parties) {
  elements.partyOptions.innerHTML = parties
    .map((party) => `<option value="${escapeHtml(party)}"></option>`)
    .join("");
}

function renderSummary(election) {
  elements.summaryKicker.textContent = election.typeLabel;
  elements.summaryTitle.textContent = dateFormatter.format(new Date(election.date));
  elements.summaryNote.textContent = `${election.winner.name} e la prima lista con ${formatPercent(
    election.winner.share,
  )} dei voti validi.`;
  elements.sourceFiles.textContent = `File usati per l'aggregazione: ${election.sourceFiles.join(
    ", ",
  )}`;
  elements.sourceLink.href = election.sourceUrl;

  const kpis = [
    {
      title: "Lista in testa",
      value: election.winner.name,
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
      detail: `${election.results.length} liste in classifica`,
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
          <p class="kpi-value">${escapeHtml(kpi.value)}</p>
          <p class="kpi-detail">${escapeHtml(kpi.detail)}</p>
        </article>
      `,
    )
    .join("");
}

function renderWinnerCards(electionsForType) {
  elements.winnerCards.innerHTML = electionsForType
    .map(
      (election) => `
        <button
          type="button"
          class="winner-card ${election.id === state.electionId ? "is-active" : ""}"
          data-election-id="${election.id}"
        >
          <span class="winner-year">${election.year}</span>
          <span class="winner-name">${escapeHtml(election.winner.name)}</span>
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
            <span class="leaderboard-name">${escapeHtml(result.name)}</span>
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

  elements.trendCaption.textContent = `${party} compare in ${presenceCount} elezioni su ${series.length}. Picco: ${peak.election.year} con ${formatPercent(
    peak.share,
  )}.`;

  elements.trendChart.innerHTML = `
    <div class="trend-selected">
      <strong class="trend-name">${escapeHtml(party)}</strong>
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
              <span class="trend-year">${item.election.year}</span>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderTable(election) {
  elements.tableCaption.textContent = `${election.results.length} liste ordinate per voti validi.`;
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
              ${escapeHtml(result.name)}
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

  const exactMatch = parties.find((party) => party === trimmed);
  if (exactMatch) {
    return exactMatch;
  }

  const caseInsensitiveMatch = parties.find(
    (party) => party.toLowerCase() === trimmed.toLowerCase(),
  );
  return caseInsensitiveMatch ?? null;
}

function readStateFromHash() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return {
    type: params.get("type"),
    year: Number(params.get("year")),
    party: params.get("party"),
  };
}

function syncHash() {
  const currentElection = getCurrentElection();
  const params = new URLSearchParams({
    type: state.type,
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
