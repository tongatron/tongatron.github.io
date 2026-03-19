#!/usr/bin/env node

const fs = require("node:fs/promises");
const https = require("node:https");
const path = require("node:path");
const { TextDecoder } = require("node:util");

const OUTPUT_PATH = path.join(__dirname, "..", "data", "live-torino.json");
const DIAGNOSTICS_DIR = path.join(__dirname, "..", "test-results");
const DIAGNOSTICS_PATH = path.join(DIAGNOSTICS_DIR, "snapshot-diagnostics.json");
const TIMEZONE = "Europe/Rome";
const REQUEST_TIMEOUT_MS = 30000;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;
const ASL_REQUEST_TIMEOUT_MS = 45000;
const ASL_RETRY_ATTEMPTS = 5;
const ASL_RETRY_DELAY_MS = 3000;
const ASL_SECOND_PASS_TIMEOUT_MS = 60000;
const ASL_SECOND_PASS_ATTEMPTS = 2;
const ASL_SECOND_PASS_DELAY_MS = 8000;
const ASL_BROWSER_TIMEOUT_MS = 75000;
const ASL_BROWSER_RETRY_ATTEMPTS = 2;
const ASL_BROWSER_RETRY_DELAY_MS = 5000;
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
const LATIN1_DECODER = new TextDecoder("latin1");
const COMMON_HEADERS = {
  "Accept-Language": "it-IT,it;q=0.9,en;q=0.8",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "User-Agent": USER_AGENT
};

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

const ASL_CITTA_SOURCE = {
  baseUrl: process.env.PS_TORINO_ASL_CITTA_BASE_URL || "https://prontosoccorso.aslcittaditorino.it",
  clientId: process.env.PS_TORINO_ASL_CITTA_CLIENT_ID || "jhisps",
  clientPassword: process.env.PS_TORINO_ASL_CITTA_CLIENT_PASSWORD || "Sincos38",
  username: process.env.PS_TORINO_ASL_CITTA_USERNAME || "aziendaact",
  password: process.env.PS_TORINO_ASL_CITTA_PASSWORD || "jh!sPsClient"
};
const FORCE_ASL_BROWSER_FALLBACK = process.env.PS_TORINO_ASL_CITTA_FORCE_BROWSER_FALLBACK === "1";

const ASL_CITTA_HOSPITALS = [
  {
    id: "maria-vittoria",
    code: "01000300",
    name: "Ospedale Maria Vittoria",
    address: "Via Cibrario 72, Torino"
  },
  {
    id: "martini",
    code: "01000700",
    name: "Ospedale Martini",
    address: "Via Tofane 71, Torino"
  },
  {
    id: "oftalmico",
    code: "01001000",
    name: "Ospedale Oftalmico",
    address: "Via Filippo Juvarra 19, Torino"
  },
  {
    id: "san-giovanni-bosco",
    code: "01001100",
    name: "Ospedale San Giovanni Bosco",
    address: "Piazza del Donatore di Sangue 3, Torino"
  }
];

const SAN_LUIGI_SOURCE = {
  id: "san-luigi-orbassano",
  name: "AOU San Luigi Gonzaga di Orbassano",
  address: "Regione Gonzole 10, Orbassano",
  url: "https://www.sanluigi.piemonte.it/dea-status/ajax-callback?url=api/deaStatus"
};

const HOSPITAL_ORDER = [
  "molinette",
  "cto",
  "sant-anna",
  "regina-margherita",
  "mauriziano",
  "maria-vittoria",
  "martini",
  "oftalmico",
  "san-giovanni-bosco",
  "san-luigi-orbassano"
];

const ASL_CITTA_HOSPITALS_BY_CODE = new Map(
  ASL_CITTA_HOSPITALS.map((hospital) => [hospital.code, hospital])
);
const FAILURE_FALLBACK_IDS = {
  mauriziano: ["mauriziano"],
  "asl-citta-di-torino": ["maria-vittoria", "martini", "oftalmico", "san-giovanni-bosco"],
  "san-luigi-orbassano": ["san-luigi-orbassano"]
};
const RUN_CONTEXT = {
  startedAt: new Date().toISOString(),
  stage: "bootstrap",
  stages: [],
  previousSnapshotFetchedAt: null,
  failures: [],
  hospitalIds: [],
  outputPath: OUTPUT_PATH,
  diagnosticsPath: DIAGNOSTICS_PATH,
  runtime: {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    cwd: process.cwd(),
    ci: Boolean(process.env.CI),
    githubRunId: process.env.GITHUB_RUN_ID || null,
    githubRunNumber: process.env.GITHUB_RUN_NUMBER || null,
    githubWorkflow: process.env.GITHUB_WORKFLOW || null
  }
};

function setRunStage(stage, details) {
  RUN_CONTEXT.stage = stage;
  RUN_CONTEXT.stages.push({
    stage,
    at: new Date().toISOString(),
    details: details || null
  });
}

function serializeError(error) {
  if (!error) {
    return null;
  }

  return {
    name: error.name || "Error",
    message: error.message || String(error),
    stack: error.stack || null,
    cause: error.cause ? serializeError(error.cause) : null
  };
}

async function writeDiagnostics(status, error) {
  const payload = {
    status,
    startedAt: RUN_CONTEXT.startedAt,
    completedAt: new Date().toISOString(),
    stage: RUN_CONTEXT.stage,
    stages: RUN_CONTEXT.stages,
    previousSnapshotFetchedAt: RUN_CONTEXT.previousSnapshotFetchedAt,
    failures: RUN_CONTEXT.failures,
    hospitalIds: RUN_CONTEXT.hospitalIds,
    outputPath: RUN_CONTEXT.outputPath,
    runtime: RUN_CONTEXT.runtime,
    error: serializeError(error)
  };

  await fs.mkdir(DIAGNOSTICS_DIR, { recursive: true });
  await fs.writeFile(DIAGNOSTICS_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  return payload;
}

function buildMapUrl(address, name) {
  const query = [name, address].filter(Boolean).join(", ") || address || name || "Pronto Soccorso Torino";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
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
  const timeout = createTimeoutSignal(REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...COMMON_HEADERS
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
  const timeout = createTimeoutSignal(REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        ...COMMON_HEADERS
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

function sleep(delayMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

async function withRetry(label, task, options = {}) {
  const attempts = typeof options === "number"
    ? options
    : options && Number.isFinite(options.attempts)
      ? options.attempts
      : RETRY_ATTEMPTS;
  const baseDelayMs = options && Number.isFinite(options.baseDelayMs)
    ? options.baseDelayMs
    : RETRY_DELAY_MS;
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;

      if (attempt >= attempts) {
        break;
      }

      await sleep(baseDelayMs * attempt);
    }
  }

  throw new Error(`${label}: ${lastError && lastError.message ? lastError.message : "errore sconosciuto"}`);
}

function requestWithHttps(url, options) {
  const timeoutMs = options && Number.isFinite(options.timeoutMs)
    ? options.timeoutMs
    : REQUEST_TIMEOUT_MS;

  return new Promise((resolve, reject) => {
    const targetUrl = new URL(url);
    const request = https.request({
      protocol: targetUrl.protocol,
      hostname: targetUrl.hostname,
      port: targetUrl.port || undefined,
      path: `${targetUrl.pathname}${targetUrl.search}`,
      method: options && options.method ? options.method : "GET",
      headers: {
        ...COMMON_HEADERS,
        ...(options && options.headers ? options.headers : {})
      },
      rejectUnauthorized: options && options.rejectUnauthorized === false ? false : true
    }, (response) => {
      const chunks = [];

      response.on("data", (chunk) => {
        chunks.push(chunk);
      });

      response.on("end", () => {
        const body = Buffer.concat(chunks);
        const statusCode = response.statusCode || 0;

        if (statusCode < 200 || statusCode >= 300) {
          const bodyPreview = body.toString("utf8").slice(0, 200).trim();
          reject(new Error(`HTTP ${statusCode}${bodyPreview ? `: ${bodyPreview}` : ""}`));
          return;
        }

        resolve(body);
      });
    });

    request.on("error", reject);
    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error("Timeout"));
    });

    if (options && options.body) {
      request.write(options.body);
    }

    request.end();
  });
}

async function requestJsonWithHttps(url, options) {
  const responseBody = await requestWithHttps(url, options);
  return JSON.parse(responseBody.toString("utf8"));
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

function normalizeIsoOffset(value) {
  if (!value) {
    return null;
  }

  return String(value).replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
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

function buildUnavailableRecord(baseRecord, updatedAt, metadata) {
  return {
    id: baseRecord.id,
    name: baseRecord.name,
    address: baseRecord.address,
    mapUrl: buildMapUrl(baseRecord.address, baseRecord.name),
    updatedAt: updatedAt || null,
    hasData: false,
    meta: metadata || {}
  };
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
    mapUrl: buildMapUrl(baseRecord.address, baseRecord.name),
    rosso: red,
    giallo: toNumber(counts.giallo),
    arancione: toNumber(counts.arancione),
    verde: toNumber(counts.verde),
    azzurro: toNumber(counts.azzurro),
    bianco: white,
    total: red + yellow + green + white,
    updatedAt,
    hasData: true,
    meta: metadata || {}
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

async function fetchAslCittaAccessToken(timeoutMs = ASL_REQUEST_TIMEOUT_MS) {
  const authHeader = `Basic ${Buffer.from(`${ASL_CITTA_SOURCE.clientId}:${ASL_CITTA_SOURCE.clientPassword}`).toString("base64")}`;
  const body = new URLSearchParams({
    username: ASL_CITTA_SOURCE.username,
    password: ASL_CITTA_SOURCE.password,
    grant_type: "password"
  }).toString();

  const payload = await requestJsonWithHttps(`${ASL_CITTA_SOURCE.baseUrl}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body,
    rejectUnauthorized: false,
    timeoutMs
  });

  if (!payload || !payload.access_token) {
    throw new Error("Token ASL Citta di Torino non disponibile");
  }

  return payload.access_token;
}

function normalizeAslCittaStructure(structure, sourceUrl) {
  const knownHospital = ASL_CITTA_HOSPITALS_BY_CODE.get(String(structure.codice || ""));
  const baseRecord = knownHospital || {
    id: String(structure.nome || structure.descrizione || structure.codice || "asl-citta"),
    name: structure.descrizione || structure.nome || "Struttura ASL Citta di Torino",
    address: structure.indirizzo || "Torino"
  };
  const rilevazione = structure.rilevazione || {};
  const countRows = Array.isArray(rilevazione.rilevazioni) ? rilevazione.rilevazioni : [];
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
  const meanWaitMinutes = {
    rosso: 0,
    giallo: 0,
    arancione: 0,
    verde: 0,
    azzurro: 0,
    bianco: 0
  };
  const codeMap = {
    1: "rosso",
    2: "arancione",
    3: "azzurro",
    4: "verde",
    5: "bianco"
  };

  for (const row of countRows) {
    const priorityCode = Number(row && row.codicePriorita ? row.codicePriorita.codice : null);
    const colorKey = codeMap[priorityCode];

    if (!colorKey) {
      continue;
    }

    counts[colorKey] = toNumber(row.pazientiInLista);
    inVisit[colorKey] = toNumber(row.pazientiInVisita);
    meanWaitMinutes[colorKey] = toNumber(row.tempoMedioAttesa);
  }

  if (!countRows.length) {
    return buildUnavailableRecord(baseRecord, normalizeIsoOffset(rilevazione.dataOra), {
      fetchedFrom: sourceUrl,
      reason: "Rilevazione assente"
    });
  }

  return buildHospitalRecord(baseRecord, counts, normalizeIsoOffset(rilevazione.dataOra), {
    fetchedFrom: sourceUrl,
    ambulanzeInArrivo: toNumber(rilevazione.ambulanzeInArrivo),
    inVisit,
    meanWaitMinutes
  });
}

function normalizeAslCittaPayload(payload, sourceUrl) {
  if (!Array.isArray(payload)) {
    throw new Error("Payload ASL Citta di Torino non valido");
  }

  return payload
    .filter((structure) => (
      structure &&
      structure.attivo !== false &&
      ASL_CITTA_HOSPITALS_BY_CODE.has(String(structure.codice || ""))
    ))
    .map((structure) => normalizeAslCittaStructure(structure, sourceUrl));
}

async function scrapeAslCittaSources(timeoutMs = ASL_REQUEST_TIMEOUT_MS) {
  const accessToken = await fetchAslCittaAccessToken(timeoutMs);
  const payload = await requestJsonWithHttps(`${ASL_CITTA_SOURCE.baseUrl}/api/strutture/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json"
    },
    rejectUnauthorized: false,
    timeoutMs
  });

  return normalizeAslCittaPayload(payload, `${ASL_CITTA_SOURCE.baseUrl}/api/strutture/`);
}

function isAslSituazioneResponse(url) {
  try {
    const parsedUrl = new URL(url);
    return /\/strutture\/?$/.test(parsedUrl.pathname);
  } catch (error) {
    return false;
  }
}

function loadPlaywright() {
  try {
    return require("playwright");
  } catch (error) {
    throw new Error("Fallback browser non disponibile: installa le dipendenze Playwright prima di eseguire lo scraper");
  }
}

async function scrapeAslCittaSourcesFromSituazioneBrowser(timeoutMs = ASL_BROWSER_TIMEOUT_MS) {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({
    headless: true
  });

  try {
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      locale: "it-IT",
      timezoneId: TIMEZONE,
      userAgent: USER_AGENT,
      extraHTTPHeaders: {
        "Accept-Language": COMMON_HEADERS["Accept-Language"],
        "Cache-Control": "no-cache",
        Pragma: "no-cache"
      }
    });
    const page = await context.newPage();

    await page.route("**/*", async (route) => {
      const resourceType = route.request().resourceType();

      if (resourceType === "image" || resourceType === "media" || resourceType === "font") {
        await route.abort();
        return;
      }

      await route.continue();
    });

    const responsePromise = page.waitForResponse((response) => (
      response.request().method() === "GET" &&
      isAslSituazioneResponse(response.url())
    ), {
      timeout: timeoutMs
    });

    await page.goto(`${ASL_CITTA_SOURCE.baseUrl}/situazione`, {
      waitUntil: "domcontentloaded",
      timeout: timeoutMs
    });

    const response = await responsePromise;

    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()} su ${response.url()}`);
    }

    const payload = await response.json();
    return normalizeAslCittaPayload(payload, `${ASL_CITTA_SOURCE.baseUrl}/situazione -> ${response.url()}`);
  } finally {
    await browser.close();
  }
}

async function scrapeAslCittaSourcesWithRecovery() {
  if (FORCE_ASL_BROWSER_FALLBACK) {
    process.stdout.write("ASL Citta di Torino: fallback browser forzato tramite variabile d'ambiente.\n");
    return withRetry(
      "ASL Citta di Torino browser",
      () => scrapeAslCittaSourcesFromSituazioneBrowser(ASL_BROWSER_TIMEOUT_MS),
      {
        attempts: ASL_BROWSER_RETRY_ATTEMPTS,
        baseDelayMs: ASL_BROWSER_RETRY_DELAY_MS
      }
    );
  }

  let apiError = null;

  try {
    return await withRetry("ASL Citta di Torino", () => scrapeAslCittaSources(ASL_REQUEST_TIMEOUT_MS), {
      attempts: ASL_RETRY_ATTEMPTS,
      baseDelayMs: ASL_RETRY_DELAY_MS
    });
  } catch (firstError) {
    apiError = firstError;
    process.stdout.write("ASL Citta di Torino: primo ciclo di tentativi fallito, avvio un secondo pass dedicato.\n");
    await sleep(ASL_SECOND_PASS_DELAY_MS);
  }

  try {
    return await withRetry("ASL Citta di Torino", () => scrapeAslCittaSources(ASL_SECOND_PASS_TIMEOUT_MS), {
      attempts: ASL_SECOND_PASS_ATTEMPTS,
      baseDelayMs: ASL_SECOND_PASS_DELAY_MS
    });
  } catch (secondError) {
    apiError = secondError && secondError.message ? secondError : apiError;
    process.stdout.write("ASL Citta di Torino: API non disponibile, provo il fallback browser su /situazione.\n");
  }

  return withRetry(
    "ASL Citta di Torino browser",
    () => scrapeAslCittaSourcesFromSituazioneBrowser(ASL_BROWSER_TIMEOUT_MS),
    {
      attempts: ASL_BROWSER_RETRY_ATTEMPTS,
      baseDelayMs: ASL_BROWSER_RETRY_DELAY_MS
    }
  ).catch((browserError) => {
    const apiMessage = apiError && apiError.message ? apiError.message : "errore API sconosciuto";
    const browserMessage = browserError && browserError.message ? browserError.message : "errore browser sconosciuto";
    throw new Error(`API: ${apiMessage}; browser: ${browserMessage}`);
  }
  );
}

function extractSanLuigiRows(html) {
  const rowMatches = html.match(/<tr class="(rosso|arancione|azzurro|verde|bianco)"[\s\S]*?<\/tr>/gi) || [];
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
    const colorMatch = rowHtml.match(/<tr class="([^"]+)"/i);
    const attesaMatch = rowHtml.match(/<td class="attesa">[\s\S]*?<span>([^<]*)<\/span>/i);
    const visitaMatch = rowHtml.match(/<td class="visita">[\s\S]*?<span>([^<]*)<\/span>/i);
    const colorKey = colorMatch ? colorMatch[1].trim().toLowerCase() : null;

    if (!colorKey || !(colorKey in counts)) {
      continue;
    }

    counts[colorKey] = toNumber(attesaMatch ? stripTags(attesaMatch[1]) : 0);
    inVisit[colorKey] = toNumber(visitaMatch ? stripTags(visitaMatch[1]) : 0);
  }

  return { counts, inVisit };
}

async function scrapeSanLuigiSource(fetchedAt) {
  const html = await fetchHtml(SAN_LUIGI_SOURCE.url);
  const { counts, inVisit } = extractSanLuigiRows(html);

  return buildHospitalRecord(SAN_LUIGI_SOURCE, counts, fetchedAt, {
    fetchedFrom: SAN_LUIGI_SOURCE.url,
    inVisit
  });
}

function sortHospitals(hospitals) {
  const orderIndex = new Map(HOSPITAL_ORDER.map((id, index) => [id, index]));

  return [...hospitals].sort((left, right) => {
    const leftOrder = orderIndex.has(left.id) ? orderIndex.get(left.id) : Number.MAX_SAFE_INTEGER;
    const rightOrder = orderIndex.has(right.id) ? orderIndex.get(right.id) : Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.name.localeCompare(right.name, "it");
  });
}

async function loadExistingSnapshot() {
  try {
    const rawSnapshot = await fs.readFile(OUTPUT_PATH, "utf8");
    const snapshot = JSON.parse(rawSnapshot);

    if (!snapshot || !Array.isArray(snapshot.hospitals)) {
      return null;
    }

    return snapshot;
  } catch (error) {
    return null;
  }
}

function buildStaleHospitalRecord(hospital, failure, snapshotTimestamp) {
  const nextMeta = {
    ...(hospital.meta || {}),
    stale: true,
    staleReason: failure.message,
    staleSource: failure.source,
    carriedForwardFromSnapshot: snapshotTimestamp || null
  };

  return {
    ...hospital,
    meta: nextMeta
  };
}

async function main() {
  setRunStage("load-previous-snapshot");
  const fetchedAt = new Date().toISOString();
  const previousSnapshot = await loadExistingSnapshot();
  RUN_CONTEXT.previousSnapshotFetchedAt = previousSnapshot && previousSnapshot.fetchedAt
    ? previousSnapshot.fetchedAt
    : null;
  const previousHospitalsById = new Map(
    previousSnapshot && Array.isArray(previousSnapshot.hospitals)
      ? previousSnapshot.hospitals.map((hospital) => [hospital.id, hospital])
      : []
  );
  const hospitalsById = new Map();
  const failures = [];
  setRunStage("start-scraping", {
    previousSnapshotHospitals: previousHospitalsById.size
  });
  const scrapingTasks = [
    ...CITTADELLA_SOURCES.map((source) =>
      withRetry(`Cittadella ${source.id}`, () => scrapeCittadellaSource(source, fetchedAt))
        .then((hospital) => ({ hospitals: [hospital] }))
        .catch((error) => ({
          failure: {
            id: source.id,
            source: `https://listeps.cittadellasalute.to.it/gtotal.php?id=${source.remoteId}`,
            message: error.message
          }
        }))
    ),
    withRetry("Mauriziano", () => scrapeMaurizianoSource())
      .then((hospital) => ({ hospitals: [hospital] }))
      .catch((error) => ({
        failure: {
          id: MAURIZIANO_SOURCE.id,
          source: MAURIZIANO_SOURCE.url,
          message: error.message
        }
      })),
    scrapeAslCittaSourcesWithRecovery()
      .then((hospitals) => ({ hospitals }))
      .catch((error) => ({
        failure: {
          id: "asl-citta-di-torino",
          source: `${ASL_CITTA_SOURCE.baseUrl}/api/strutture/ ; fallback ${ASL_CITTA_SOURCE.baseUrl}/situazione`,
          message: error.message
        }
      })),
    withRetry("San Luigi", () => scrapeSanLuigiSource(fetchedAt))
      .then((hospital) => ({ hospitals: [hospital] }))
      .catch((error) => ({
        failure: {
          id: SAN_LUIGI_SOURCE.id,
          source: SAN_LUIGI_SOURCE.url,
          message: error.message
        }
      }))
  ];

  const scrapingResults = await Promise.all(scrapingTasks);
  setRunStage("collect-results");

  for (const result of scrapingResults) {
    if (result.hospitals) {
      for (const hospital of result.hospitals) {
        hospitalsById.set(hospital.id, hospital);
      }

      continue;
    }

    failures.push(result.failure);
  }

  RUN_CONTEXT.failures = failures;
  setRunStage("merge-fallbacks", {
    failureCount: failures.length
  });

  for (const failure of failures) {
    const fallbackIds = FAILURE_FALLBACK_IDS[failure.id] || [failure.id];

    for (const hospitalId of fallbackIds) {
      if (hospitalsById.has(hospitalId)) {
        continue;
      }

      const previousHospital = previousHospitalsById.get(hospitalId);

      if (!previousHospital) {
        continue;
      }

      hospitalsById.set(
        hospitalId,
        buildStaleHospitalRecord(previousHospital, failure, previousSnapshot ? previousSnapshot.fetchedAt : null)
      );
    }
  }

  const hospitals = sortHospitals(Array.from(hospitalsById.values()));
  RUN_CONTEXT.hospitalIds = hospitals.map((hospital) => hospital.id);

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

  setRunStage("write-output", {
    hospitalCount: hospitals.length,
    failureCount: failures.length
  });
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
  setRunStage("completed");
  await writeDiagnostics("success", null);

  process.stdout.write(`Salvato ${OUTPUT_PATH} con ${hospitals.length} strutture live.\n`);

  if (failures.length) {
    process.stdout.write(`Sorgenti con errore: ${failures.map((failure) => failure.id).join(", ")}\n`);
  }
}

main().catch(async (error) => {
  try {
    await writeDiagnostics("failure", error);
    process.stderr.write(`Diagnostica salvata in ${DIAGNOSTICS_PATH}\n`);
  } catch (diagnosticsError) {
    process.stderr.write(`Impossibile salvare la diagnostica: ${diagnosticsError.stack || diagnosticsError.message}\n`);
  }

  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
