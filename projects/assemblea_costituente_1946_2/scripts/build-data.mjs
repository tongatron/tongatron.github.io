#!/usr/bin/env node

import { execFile } from "node:child_process";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const ROOT_DIR = process.cwd();
const CACHE_DIR = path.join(ROOT_DIR, ".cache");
const DATA_DIR = path.join(ROOT_DIR, "data");
const CATALOG_URL = "https://elezionistorico.interno.gov.it/eligendo/opendata.php";
const DOWNLOAD_BASE_URL =
  "https://elezionistorico.interno.gov.it/daithome/documenti/opendata";

const TYPE_META = {
  assemblea_costituente: {
    label: "Assemblea Costituente",
    order: 0,
  },
  camera: {
    label: "Camera dei deputati",
    order: 1,
  },
  senato: {
    label: "Senato della Repubblica",
    order: 2,
  },
  referendum: {
    label: "Referendum",
    order: 3,
  },
  provinciali: {
    label: "Elezioni provinciali",
    order: 4,
  },
  comunali: {
    label: "Elezioni comunali",
    order: 5,
  },
};

const TERRITORY_COLUMNS = [
  "CIRCOSCRIZIONE",
  "REGIONE",
  "CIRC-REG",
  "COLLEGIO",
  "COLLEGIOPLURINOMINALE",
  "COLLEGIOUNINOMINALE",
  "COLLPLURI",
  "COLLUNINOM",
  "PROVINCIA",
  "COMUNE",
];

const ELECTOR_COLUMNS = [
  "ELETTORI",
  "ELETTORITOT",
  "ELETTORI_TOTALI",
  "NUMELETTORITOTALI",
];

const VOTER_COLUMNS = [
  "VOTANTI",
  "VOTANTITOT",
  "VOTANTI_TOTALI",
  "NUMVOTANTITOTALI",
];

const BLANK_COLUMNS = [
  "SCHEDE_BIANCHE",
  "SKBIANCHE",
];
const REFERENDUM_NUMBER_COLUMNS = [
  "NUM_REFERENDUM",
  "NUMREFERENDUM",
  "NUMEROREFERENDUM",
];
const REFERENDUM_QUESTION_COLUMNS = [
  "QUESITO",
  "DESCRIZIONE_QUESITO",
  "DESCR_REFERENDUM",
  "DESCRIZIONE REFERENDUM",
];
const REFERENDUM_YES_COLUMNS = [
  "NUMVOTISI",
  "VOTI_SI",
  "VOTI SI",
  "VOTISI",
];
const REFERENDUM_NO_COLUMNS = [
  "NUMVOTINO",
  "VOTI_NO",
  "VOTI NO",
  "VOTINO",
];
const REFERENDUM_FALLBACK_HEADERS = [
  "REGIONE",
  "PROVINCIA",
  "COMUNE",
  "NUM_REFERENDUM",
  "QUESITO",
  "ELETTORI",
  "ELETTORI_MASCHI",
  "VOTANTI",
  "VOTANTI_MASCHI",
  "NUMVOTISI",
  "NUMVOTINO",
  "SCHEDE_BIANCHE",
];

async function main() {
  await mkdir(CACHE_DIR, { recursive: true });
  await mkdir(DATA_DIR, { recursive: true });

  console.log("[catalog] download");
  const catalogHtml = await fetchText(CATALOG_URL);
  const catalogEntries = extractCatalogEntries(catalogHtml);
  const elections = [];

  for (const entry of catalogEntries) {
    console.log(`[zip] ${entry.fileName}`);
    const zipPath = path.join(CACHE_DIR, entry.fileName);
    await downloadFile(entry.sourceUrl, zipPath);

    const zipFiles = await listZipFiles(zipPath);
    const sourceFiles = selectSourceFiles(zipFiles, entry.type);
    if (!sourceFiles.length) {
      console.log(`  [skip] no parsable txt/csv files (${entry.fileName})`);
      continue;
    }

    if (entry.type === "referendum") {
      const referendumElections = await buildReferendumElections(entry, zipPath, sourceFiles);
      if (!referendumElections.length) {
        console.log(`  [skip] no referendum rows parsed (${entry.fileName})`);
        continue;
      }

      elections.push(...referendumElections);
      continue;
    }

    const aggregate = {
      electors: 0,
      voters: 0,
      blankBallots: 0,
      territorySeen: new Set(),
      listVotes: new Map(),
      sourceFiles: [],
    };

    for (const sourceFile of sourceFiles) {
      console.log(`  [parse] ${sourceFile}`);
      const content = await readZipFile(zipPath, sourceFile);
      aggregateElectionContent(content, aggregate, sourceFile);
    }

    const results = Array.from(aggregate.listVotes.entries())
      .map(([name, votes]) => ({ name, votes }))
      .sort((left, right) => {
        if (right.votes !== left.votes) {
          return right.votes - left.votes;
        }
        return left.name.localeCompare(right.name, "it");
      });

    const validVotes = results.reduce((sum, item) => sum + item.votes, 0);
    const topResult = results[0] ?? { name: "N/D", votes: 0 };

    elections.push({
      id: `${entry.type}-${entry.date}`,
      type: entry.type,
      typeLabel: TYPE_META[entry.type].label,
      year: Number(entry.date.slice(0, 4)),
      date: entry.date,
      title: `${TYPE_META[entry.type].label} ${entry.date.slice(0, 4)}`,
      sourceUrl: entry.sourceUrl,
      sourceFiles: aggregate.sourceFiles,
      totals: {
        electors: aggregate.electors,
        voters: aggregate.voters,
        blankBallots: aggregate.blankBallots,
        validVotes,
        turnoutPct: aggregate.electors
          ? Number(((aggregate.voters / aggregate.electors) * 100).toFixed(2))
          : 0,
        blankPct: aggregate.voters
          ? Number(((aggregate.blankBallots / aggregate.voters) * 100).toFixed(2))
          : 0,
      },
      winner: {
        name: topResult.name,
        votes: topResult.votes,
        share: validVotes
          ? Number(((topResult.votes / validVotes) * 100).toFixed(2))
          : 0,
      },
      results: results.map((item) => ({
        ...item,
        share: validVotes
          ? Number(((item.votes / validVotes) * 100).toFixed(2))
          : 0,
      })),
    });
  }

  elections.sort((left, right) => {
    const leftOrder = TYPE_META[left.type].order;
    const rightOrder = TYPE_META[right.type].order;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }
    return left.date.localeCompare(right.date);
  });

  const output = {
    generatedAt: new Date().toISOString(),
    sourceCatalogUrl: CATALOG_URL,
    coverageNote:
      "La pagina usa i file territoriali testuali/csv disponibili nel catalogo open data per Assemblea Costituente, Camera, Senato, Referendum, Provinciali e Comunali. Restano esclusi i pacchetti pubblicati solo in formato XLSX e alcune sezioni speciali/estero non confrontabili in modo uniforme.",
    elections,
  };

  const outputPath = path.join(DATA_DIR, "elections.json");
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`[done] wrote ${path.relative(ROOT_DIR, outputPath)}`);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (Codex build-data)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

async function downloadFile(url, destinationPath) {
  if (await fileExists(destinationPath)) {
    return;
  }

  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (Codex build-data)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(destinationPath, buffer);
}

function extractCatalogEntries(html) {
  const match = html.match(/var dataSet = (\[\[.*?\]);/s);
  if (!match) {
    throw new Error("Unable to locate dataSet in catalog page");
  }

  const rawData = Function(`"use strict"; return (${match[1]});`)();
  return rawData
    .filter((entry) => TYPE_META[entry[0]] && String(entry[2]).endsWith(".zip"))
    .map((entry) => {
      const relativePath = entry[2];
      const fileName = entry[3];
      const date = normalizeDate(entry[4], fileName);
      return {
        type: entry[0],
        fileName,
        date,
        sourceUrl: `${DOWNLOAD_BASE_URL}/${relativePath}`,
      };
    })
    .sort((left, right) => {
      const leftOrder = TYPE_META[left.type].order;
      const rightOrder = TYPE_META[right.type].order;
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }
      return left.date.localeCompare(right.date);
    });
}

function normalizeDate(rawValue, fallbackFileName) {
  const dayFirstMatch = String(rawValue).match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (dayFirstMatch) {
    return `${dayFirstMatch[3]}-${dayFirstMatch[2]}-${dayFirstMatch[1]}`;
  }

  const digitsMatch = String(fallbackFileName).match(/(\d{4})(\d{2})(\d{2})/);
  if (digitsMatch) {
    return `${digitsMatch[1]}-${digitsMatch[2]}-${digitsMatch[3]}`;
  }

  throw new Error(`Unable to infer date from ${rawValue} / ${fallbackFileName}`);
}

function selectSourceFiles(fileNames, type) {
  const selected = fileNames.filter((fileName) => {
    const lower = fileName.toLowerCase();

    if (!lower.endsWith(".txt") && !lower.endsWith(".csv")) {
      return false;
    }

    if (lower.includes("estero") || lower.includes("prefer")) {
      return false;
    }

    if (type === "assemblea_costituente") {
      return /^assemblea_costituente-\d{8}\.txt$/i.test(fileName);
    }

    if (type === "camera") {
      return (
        (!/(vaosta|trentino|scrutini)/.test(lower) && lower.includes("livcomune")) ||
        /^camera-\d{8}\.txt$/i.test(fileName) ||
        /^camera-\d{8}_proporzionale\.txt$/i.test(fileName) ||
        /^camera_italia-\d{8}\.txt$/i.test(fileName) ||
        /^camera_vaosta-\d{8}\.txt$/i.test(fileName)
      );
    }

    if (type === "senato") {
      return (
        (!/(vaosta|trentino|scrutini)/.test(lower) && lower.includes("livcomune")) ||
        /^senato-\d{8}\.txt$/i.test(fileName) ||
        /^senato_italia-\d{8}\.txt$/i.test(fileName) ||
        /^senato_vaosta_trentino-\d{8}\.txt$/i.test(fileName)
      );
    }

    if (type === "provinciali") {
      return /^provinciali-\d{8}\.txt$/i.test(fileName);
    }

    if (type === "comunali") {
      return (
        /^comunali-\d{8}\.txt$/i.test(fileName) ||
        /^liste&candidati\.csv$/i.test(fileName) ||
        /^scrutini\.csv$/i.test(fileName)
      );
    }

    if (type === "referendum") {
      return (
        /^referendum-\d{8}\.txt$/i.test(fileName) ||
        /scrutini_quesito\d+\.csv$/i.test(lower)
      );
    }

    return false;
  });

  return Array.from(new Set(selected));
}

async function listZipFiles(zipPath) {
  const { stdout } = await execFileAsync("unzip", ["-Z1", zipPath], {
    maxBuffer: 8 * 1024 * 1024,
  });
  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

async function readZipFile(zipPath, fileName) {
  const { stdout } = await execFileAsync("unzip", ["-p", zipPath, fileName], {
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
  });
  return stdout;
}

function aggregateElectionContent(content, aggregate, sourceFile) {
  const normalizedContent = content.replace(/^\uFEFF/, "");
  const lines = normalizedContent.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) {
    return;
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitDelimitedLine(lines[0], delimiter).map((header) => header.trim());
  const indexByHeader = Object.fromEntries(headers.map((header, index) => [header, index]));

  const listHeader = pickHeader(indexByHeader, ["DESCRLISTA", "LISTA"]);
  const voteHeader = pickHeader(indexByHeader, ["VOTI_LISTA", "VOTILISTA"]);
  const territoryHeaders = TERRITORY_COLUMNS.filter(
    (header) => indexByHeader[header] !== undefined,
  );
  const electorHeader = pickHeader(indexByHeader, ELECTOR_COLUMNS);
  const voterHeader = pickHeader(indexByHeader, VOTER_COLUMNS);
  const blankHeader = pickHeader(indexByHeader, BLANK_COLUMNS);

  const hasListData = Boolean(listHeader && voteHeader);
  const hasTotalsData = Boolean(
    territoryHeaders.length && (electorHeader || voterHeader || blankHeader),
  );

  if (!hasListData && !hasTotalsData) {
    return;
  }

  let contributed = false;

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const row = splitDelimitedLine(lines[lineIndex], delimiter);
    if (!row.length) {
      continue;
    }

    if (hasListData) {
      const listName = (row[indexByHeader[listHeader]] ?? "").trim();
      if (listName) {
        const votes = parseNumber(row[indexByHeader[voteHeader]]);
        aggregate.listVotes.set(listName, (aggregate.listVotes.get(listName) ?? 0) + votes);
        contributed = true;
      }
    }

    if (hasTotalsData) {
      const territoryKey = territoryHeaders
        .map((header) => (row[indexByHeader[header]] ?? "").trim())
        .join("||");
      if (!territoryKey) {
        continue;
      }

      if (!aggregate.territorySeen.has(territoryKey)) {
        aggregate.territorySeen.add(territoryKey);
        aggregate.electors += electorHeader
          ? parseNumber(row[indexByHeader[electorHeader]])
          : 0;
        aggregate.voters += voterHeader ? parseNumber(row[indexByHeader[voterHeader]]) : 0;
        aggregate.blankBallots += blankHeader
          ? parseNumber(row[indexByHeader[blankHeader]])
          : 0;
        contributed = true;
      }
    }
  }

  if (contributed) {
    aggregate.sourceFiles.push(sourceFile);
  }
}

async function buildReferendumElections(entry, zipPath, sourceFiles) {
  const byQuestion = new Map();

  for (const sourceFile of sourceFiles) {
    console.log(`  [parse] ${sourceFile}`);
    const content = await readZipFile(zipPath, sourceFile);
    aggregateReferendumContent(content, byQuestion, sourceFile);
  }

  const questionIds = Array.from(byQuestion.keys()).sort((left, right) => left - right);
  if (!questionIds.length) {
    return [];
  }

  const multipleQuestions = questionIds.length > 1;
  return questionIds.map((questionNumber) => {
    const aggregate = byQuestion.get(questionNumber);
    const yesVotes = aggregate.yesVotes;
    const noVotes = aggregate.noVotes;
    const validVotes = yesVotes + noVotes;
    const results = [
      { name: "SI", votes: yesVotes },
      { name: "NO", votes: noVotes },
    ].map((item) => ({
      ...item,
      share: validVotes ? Number(((item.votes / validVotes) * 100).toFixed(2)) : 0,
    }));

    const winner = results.reduce((best, item) => (item.votes > best.votes ? item : best), results[0]);
    const questionSuffix = multipleQuestions ? ` · Quesito ${questionNumber}` : "";
    const questionText = aggregate.question?.trim() || `Quesito ${questionNumber}`;

    return {
      id: multipleQuestions
        ? `${entry.type}-${entry.date}-q${questionNumber}`
        : `${entry.type}-${entry.date}`,
      type: entry.type,
      typeLabel: TYPE_META[entry.type].label,
      year: Number(entry.date.slice(0, 4)),
      date: entry.date,
      title: `${TYPE_META[entry.type].label} ${entry.date.slice(0, 4)}${questionSuffix}`,
      referendumQuestion: questionText,
      sourceUrl: entry.sourceUrl,
      sourceFiles: Array.from(aggregate.sourceFiles),
      totals: {
        electors: aggregate.electors,
        voters: aggregate.voters,
        blankBallots: aggregate.blankBallots,
        validVotes,
        turnoutPct: aggregate.electors
          ? Number(((aggregate.voters / aggregate.electors) * 100).toFixed(2))
          : 0,
        blankPct: aggregate.voters
          ? Number(((aggregate.blankBallots / aggregate.voters) * 100).toFixed(2))
          : 0,
      },
      winner: {
        name: winner.name,
        votes: winner.votes,
        share: winner.share,
      },
      results,
    };
  });
}

function aggregateReferendumContent(content, byQuestion, sourceFile) {
  const normalizedContent = content.replace(/^\uFEFF/, "");
  const lines = normalizedContent.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) {
    return;
  }

  const delimiter = detectDelimiter(lines[0]);
  const firstRow = splitDelimitedLine(lines[0], delimiter).map((header) => header.trim());
  const hasHeaderRow = looksLikeReferendumHeader(firstRow);
  const headers = hasHeaderRow ? firstRow : REFERENDUM_FALLBACK_HEADERS;
  const startLineIndex = hasHeaderRow ? 1 : 0;
  const indexByHeader = Object.fromEntries(headers.map((header, index) => [header, index]));

  const questionNumberHeader = pickHeader(indexByHeader, REFERENDUM_NUMBER_COLUMNS);
  const questionTextHeader = pickHeader(indexByHeader, REFERENDUM_QUESTION_COLUMNS);
  const yesHeader = pickHeader(indexByHeader, REFERENDUM_YES_COLUMNS);
  const noHeader = pickHeader(indexByHeader, REFERENDUM_NO_COLUMNS);
  const territoryHeaders = TERRITORY_COLUMNS.filter(
    (header) => indexByHeader[header] !== undefined,
  );
  const electorHeader = pickHeader(indexByHeader, ELECTOR_COLUMNS);
  const voterHeader = pickHeader(indexByHeader, VOTER_COLUMNS);
  const blankHeader = pickHeader(indexByHeader, BLANK_COLUMNS);

  if (!yesHeader || !noHeader || !territoryHeaders.length) {
    return;
  }

  for (let lineIndex = startLineIndex; lineIndex < lines.length; lineIndex += 1) {
    const row = splitDelimitedLine(lines[lineIndex], delimiter);
    if (!row.length) {
      continue;
    }

    const rawQuestionNumber = questionNumberHeader
      ? parseNumber(row[indexByHeader[questionNumberHeader]])
      : 1;
    const questionNumber = Number.isFinite(rawQuestionNumber) && rawQuestionNumber > 0
      ? Math.round(rawQuestionNumber)
      : 1;

    if (!byQuestion.has(questionNumber)) {
      byQuestion.set(questionNumber, {
        question: null,
        yesVotes: 0,
        noVotes: 0,
        electors: 0,
        voters: 0,
        blankBallots: 0,
        territorySeen: new Set(),
        sourceFiles: new Set(),
      });
    }

    const aggregate = byQuestion.get(questionNumber);
    const yesVotes = parseNumber(row[indexByHeader[yesHeader]]);
    const noVotes = parseNumber(row[indexByHeader[noHeader]]);
    aggregate.yesVotes += yesVotes;
    aggregate.noVotes += noVotes;

    const questionText = questionTextHeader
      ? (row[indexByHeader[questionTextHeader]] ?? "").trim()
      : "";
    if (questionText && !aggregate.question) {
      aggregate.question = questionText;
    }

    const territoryKey = territoryHeaders
      .map((header) => (row[indexByHeader[header]] ?? "").trim())
      .join("||");

    if (territoryKey && !aggregate.territorySeen.has(territoryKey)) {
      aggregate.territorySeen.add(territoryKey);
      aggregate.electors += electorHeader ? parseNumber(row[indexByHeader[electorHeader]]) : 0;
      aggregate.voters += voterHeader ? parseNumber(row[indexByHeader[voterHeader]]) : 0;
      aggregate.blankBallots += blankHeader ? parseNumber(row[indexByHeader[blankHeader]]) : 0;
    }

    aggregate.sourceFiles.add(sourceFile);
  }
}

function looksLikeReferendumHeader(headers) {
  const normalizedHeaders = new Set(headers.map((header) => normalizeHeaderToken(header)));
  return (
    normalizedHeaders.has("QUESITO") ||
    normalizedHeaders.has("NUM_REFERENDUM") ||
    normalizedHeaders.has("NUMREFERENDUM") ||
    normalizedHeaders.has("NUMVOTISI") ||
    normalizedHeaders.has("VOTI_SI")
  );
}

function normalizeHeaderToken(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}

function detectDelimiter(line) {
  const semicolonCount = (line.match(/;/g) ?? []).length;
  const commaCount = (line.match(/,/g) ?? []).length;
  return semicolonCount >= commaCount ? ";" : ",";
}

function pickHeader(indexByHeader, candidates) {
  return candidates.find((candidate) => indexByHeader[candidate] !== undefined) ?? null;
}

function splitDelimitedLine(line, delimiter = ";") {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

function parseNumber(value) {
  if (value === undefined || value === null) {
    return 0;
  }

  const trimmed = String(value).trim();
  if (!trimmed) {
    return 0;
  }

  const numeric = trimmed.replace(/\./g, "").replace(",", ".");
  const parsed = Number(numeric);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
