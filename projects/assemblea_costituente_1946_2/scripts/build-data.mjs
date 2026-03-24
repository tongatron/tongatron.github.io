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
      throw new Error(`No parsable files found for ${entry.fileName}`);
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
      "La pagina usa i file territoriali con voti di lista disponibili nel catalogo open data. Per alcune elezioni recenti restano fuori la circoscrizione Estero e alcuni collegi speciali pubblicati in file separati senza voti di lista confrontabili.",
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

    if (lower.includes("livcomune")) {
      return !/(vaosta|trentino|scrutini)/.test(lower);
    }

    if (type === "camera") {
      return (
        /^camera-\d{8}\.txt$/i.test(fileName) ||
        /^camera-\d{8}_proporzionale\.txt$/i.test(fileName) ||
        /^camera_italia-\d{8}\.txt$/i.test(fileName) ||
        /^camera_vaosta-\d{8}\.txt$/i.test(fileName)
      );
    }

    if (type === "senato") {
      return (
        /^senato-\d{8}\.txt$/i.test(fileName) ||
        /^senato_italia-\d{8}\.txt$/i.test(fileName) ||
        /^senato_vaosta_trentino-\d{8}\.txt$/i.test(fileName)
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

  const headers = splitDelimitedLine(lines[0]).map((header) => header.trim());
  const indexByHeader = Object.fromEntries(headers.map((header, index) => [header, index]));

  const listHeader = pickHeader(indexByHeader, ["DESCRLISTA", "LISTA"]);
  const voteHeader = pickHeader(indexByHeader, ["VOTI_LISTA", "VOTILISTA"]);
  const territoryHeaders = TERRITORY_COLUMNS.filter(
    (header) => indexByHeader[header] !== undefined,
  );
  const electorHeader = pickHeader(indexByHeader, ELECTOR_COLUMNS);
  const voterHeader = pickHeader(indexByHeader, VOTER_COLUMNS);
  const blankHeader = pickHeader(indexByHeader, BLANK_COLUMNS);

  if (!listHeader || !voteHeader || !territoryHeaders.length) {
    return;
  }

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const row = splitDelimitedLine(lines[lineIndex]);
    if (!row.length) {
      continue;
    }

    const listName = (row[indexByHeader[listHeader]] ?? "").trim();
    if (!listName) {
      continue;
    }

    const votes = parseNumber(row[indexByHeader[voteHeader]]);
    aggregate.listVotes.set(listName, (aggregate.listVotes.get(listName) ?? 0) + votes);

    const territoryKey = territoryHeaders
      .map((header) => (row[indexByHeader[header]] ?? "").trim())
      .join("||");

    if (!aggregate.territorySeen.has(territoryKey)) {
      aggregate.territorySeen.add(territoryKey);
      aggregate.electors += electorHeader
        ? parseNumber(row[indexByHeader[electorHeader]])
        : 0;
      aggregate.voters += voterHeader ? parseNumber(row[indexByHeader[voterHeader]]) : 0;
      aggregate.blankBallots += blankHeader
        ? parseNumber(row[indexByHeader[blankHeader]])
        : 0;
    }
  }

  aggregate.sourceFiles.push(sourceFile);
}

function pickHeader(indexByHeader, candidates) {
  return candidates.find((candidate) => indexByHeader[candidate] !== undefined) ?? null;
}

function splitDelimitedLine(line) {
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

    if (char === ";" && !inQuotes) {
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
