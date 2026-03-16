#!/usr/bin/env node

const fs = require("node:fs/promises");
const path = require("node:path");
const { TextDecoder } = require("node:util");

const OUTPUT_PATH = path.join(__dirname, "..", "data", "live-torino.json");
const TIMEZONE = "Europe/Rome";
const USER_AGENT = "ps-torino-snapshot/0.2 (+https://tongatron.github.io/projects/PS-Torino/)";
const LATIN1_DECODER = new TextDecoder("latin1");

const CITTADELLA_SOURCES = [
  {
    id: "molinette",
    remoteId: "01090101",
    name: "AOU Citta della Salute e della Scienza - Molinette",
    address: "Corso Bramante 88, Torino"
  },
  {
    id: "cto",
    remoteId: "01090201",
    name: "CTO Torino",
    address: "Via Zuretti 29, Torino"
  },
  {
    id: "sant-anna",
    remoteId: "01090301",
    name: "Ospedale Sant'Anna",
    address: "Corso Spezia 60, Torino"
  },
  {
    id: "regina-margherita",
    remoteId: "01090302",
    name: "Ospedale Regina Margherita",
    address: "Piazza Polonia 94, Torino"
  }
];

const MAURIZIANO_SOURCE = {
  id: "mauriziano",
  name: "Ospedale Mauriziano Umberto I",
  address: "Largo Filippo Turati 62, Torino",
  url: "https://www.mauriziano.it/i-nostri-servizi/pazienti-in-attesa-presso-pronto-soccorso"
};

function buildMapUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function createTimeoutSignal(timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    dispose() {
      clearTimeout(timeoutId);
    }
  };
}

async function fetchJson(url) {
  const timeout = createTimeoutSignal(15000);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT
      },
      signal: timeout.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  } finally {
    timeout.dispose();
  }
}

async function fetchHtml(url) {
  const timeout = createTimeoutSignal(15000);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": USER_AGENT
      },
      signal: timeout.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return LATIN1_DECODER.decode(buffer);
  } finally {
    timeout.dispose();
  }
}

function toNumber(value) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function stripTags(value) {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseItalianLocalTimestamp(value) {
  const match = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);

  if (!match) {
    return value;
  }

  const [, day, month, year, hour, minute, second] = match;
  const localTarget = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

  for (const offsetHours of [1, 2]) {
    const candidateDate = new Date(Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour) - offsetHours,
      Number(minute),
      Number(second)
    ));

    const parts = new Intl.DateTimeFormat("sv-SE", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).format(candidateDate).replace(",", "");

    if (parts === localTarget) {
      const offsetLabel = `${offsetHours < 10 ? "0" : ""}${offsetHours}:00`;
      return `${year}-${month}-${day}T${hour}:${minute}:${second}+${offsetLabel}`;
    }
  }

  return value;
}

function buildHospitalRecord(baseRecord, counts, updatedAt, metadata) {
  const red = toNumber(counts.rosso);
  const yellow = toNumber(counts.giallo) + toNumber(counts.arancione);
  const green = toNumber(counts.verde) + toNumber(counts.azzurro);
  const white = toNumber(counts.bianco);

  return {
    id: baseRecord.id,
    name: baseRecord.name,
    address: baseRecord.address,
    mapUrl: buildMapUrl(baseRecord.address),
    rosso: red,
    giallo: toNumber(counts.giallo),
    arancione: toNumber(counts.arancione),
    verde: toNumber(counts.verde),
    azzurro: toNumber(counts.azzurro),
    bianco: white,
    total: red + yellow + green + white,
    updatedAt,
    hasData: true,
    meta: metadata
  };
}

async function scrapeCittadellaSource(source, fetchedAt) {
  const url = `https://listeps.cittadellasalute.to.it/gtotal.php?id=${source.remoteId}`;
  const payload = await fetchJson(url);
  const counts = {
    rosso: 0,
    giallo: 0,
    arancione: 0,
    verde: 0,
    azzurro: 0,
    bianco: 0
  };
  const inVisit = {
    rosso: 0,
    giallo: 0,
    arancione: 0,
    verde: 0,
    azzurro: 0,
    bianco: 0
  };

  for (const colorRow of payload.colors || []) {
    if (!colorRow || !colorRow.colore || !(colorRow.colore in counts)) {
      continue;
    }

    counts[colorRow.colore] = toNumber(colorRow.attesa);
    inVisit[colorRow.colore] = toNumber(colorRow.visita);
  }

  return buildHospitalRecord(source, counts, fetchedAt, {
    fetchedFrom: url,
    inVisit
  });
}

function extractMaurizianoRows(html) {
  const tableMatch = html.match(/<table id="TableTempiAttesaProntoSoccorso"[\s\S]*?<\/table>/i);

  if (!tableMatch) {
    throw new Error("Tabella Mauriziano non trovata");
  }

  const rowMatches = tableMatch[0].match(/<tr class="bgPS">[\s\S]*?<\/tr>/gi) || [];
  const counts = {
    rosso: 0,
    giallo: 0,
    arancione: 0,
    verde: 0,
    azzurro: 0,
    bianco: 0
  };
  const inVisit = {
    rosso: 0,
    giallo: 0,
    arancione: 0,
    verde: 0,
    azzurro: 0,
    bianco: 0
  };

  for (const rowHtml of rowMatches) {
    const cellMatches = rowHtml.match(/<td[\s\S]*?<\/td>/gi) || [];

    if (cellMatches.length < 3) {
      continue;
    }

    const colorLabel = stripTags(cellMatches[0]).toLowerCase();
    const attesa = toNumber(stripTags(cellMatches[1]));
    const visita = toNumber(stripTags(cellMatches[2]));
    const normalizedColor = colorLabel.includes("arancione")
      ? "arancione"
      : colorLabel.includes("azzurro")
        ? "azzurro"
        : colorLabel.includes("verde")
          ? "verde"
          : colorLabel.includes("bianco")
            ? "bianco"
            : colorLabel.includes("giallo")
              ? "giallo"
              : "rosso";

    counts[normalizedColor] = attesa;
    inVisit[normalizedColor] = visita;
  }

  return { counts, inVisit };
}

function extractMaurizianoUpdatedAt(html) {
  const match = html.match(/Ultimo aggiornamento:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4} [0-9]{2}:[0-9]{2}:[0-9]{2})/i);
  return match ? parseItalianLocalTimestamp(match[1]) : null;
}

async function scrapeMaurizianoSource() {
  const html = await fetchHtml(MAURIZIANO_SOURCE.url);
  const { counts, inVisit } = extractMaurizianoRows(html);

  return buildHospitalRecord(
    MAURIZIANO_SOURCE,
    counts,
    extractMaurizianoUpdatedAt(html),
    {
      fetchedFrom: MAURIZIANO_SOURCE.url,
      inVisit
    }
  );
}

async function main() {
  const fetchedAt = new Date().toISOString();
  const hospitals = [];
  const failures = [];

  const scrapingTasks = [
    ...CITTADELLA_SOURCES.map((source) =>
      scrapeCittadellaSource(source, fetchedAt)
        .then((hospital) => ({ hospital }))
        .catch((error) => ({
          failure: {
            id: source.id,
            source: `https://listeps.cittadellasalute.to.it/gtotal.php?id=${source.remoteId}`,
            message: error.message
          }
        }))
    ),
    scrapeMaurizianoSource()
      .then((hospital) => ({ hospital }))
      .catch((error) => ({
        failure: {
          id: MAURIZIANO_SOURCE.id,
          source: MAURIZIANO_SOURCE.url,
          message: error.message
        }
      }))
  ];

  const scrapingResults = await Promise.all(scrapingTasks);

  for (const result of scrapingResults) {
    if (result.hospital) {
      hospitals.push(result.hospital);
      continue;
    }

    failures.push(result.failure);
  }

  if (!hospitals.length) {
    throw new Error("Nessuna sorgente live disponibile");
  }

  const snapshot = {
    source: "github-actions",
    sourceLabel: "Snapshot live (GitHub Actions)",
    fetchedAt,
    hospitals,
    failures
  };

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);

  process.stdout.write(`Salvato ${OUTPUT_PATH} con ${hospitals.length} strutture live.\n`);

  if (failures.length) {
    process.stdout.write(`Sorgenti con errore: ${failures.map((failure) => failure.id).join(", ")}\n`);
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
