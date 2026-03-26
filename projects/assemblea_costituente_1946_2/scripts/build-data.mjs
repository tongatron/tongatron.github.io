#!/usr/bin/env node

import { execFile } from "node:child_process";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import XLSX from "xlsx";

const execFileAsync = promisify(execFile);

const ROOT_DIR = process.cwd();
const CACHE_DIR = path.join(ROOT_DIR, ".cache");
const DATA_DIR = path.join(ROOT_DIR, "data");
const CATALOG_URL = "https://elezionistorico.interno.gov.it/eligendo/opendata.php";
const DOWNLOAD_BASE_URL =
  "https://elezionistorico.interno.gov.it/daithome/documenti/opendata";
const MAX_CANDIDATES_PER_ELECTION = 400;
const MAX_CANDIDATE_LISTS_PER_ELECTION = 30;
const MAX_CANDIDATES_PER_LIST = 12;

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
  "SEZIONE",
  "NUMSEZIONE",
];

const LIST_NAME_COLUMNS = [
  "DESCRLISTA",
  "DESCR_LISTA",
  "DESCRIZIONE_LISTA",
  "DESCRIZIONELISTA",
  "LISTA",
  "CONTRASSEGNO",
];

const LIST_VOTE_COLUMNS = [
  "VOTI_LISTA",
  "VOTILISTA",
  "VOTI",
  "TOTVOTI",
];

const ELECTOR_COLUMNS = [
  "ELETTORI",
  "ELETTORITOT",
  "ELETTORITOTALI",
  "ELETTORI_TOTALI",
  "NUMELETTORITOTALI",
];

const VOTER_COLUMNS = [
  "VOTANTI",
  "VOTANTITOT",
  "VOTANTITOTALI",
  "VOTANTI_TOTALI",
  "NUMVOTANTITOTALI",
];

const BLANK_COLUMNS = [
  "SCHEDE_BIANCHE",
  "SCHEDEBIANCHE",
  "SKBIANCHE",
];

const TURN_COLUMNS = [
  "TURNO",
];

const CANDIDATE_LASTNAME_COLUMNS = [
  "COGNOME",
];

const CANDIDATE_FIRSTNAME_COLUMNS = [
  "NOME",
];

const CANDIDATE_ALTNAME_COLUMNS = [
  "ALTRO_NOME",
];

const CANDIDATE_VOTE_COLUMNS = [
  "VOTICAND",
  "VOTICANDLEADER",
  "VOTICANDIDATO",
  "VOTI_CANDIDATO",
  "VOTI_CANDIDDATO",
  "TOTVOTI",
];

const REFERENDUM_NUMBER_COLUMNS = [
  "NUM_REFERENDUM",
  "NUMREFERENDUM",
  "NUMEROREFERENDUM",
  "NUMQUESITO",
];
const REFERENDUM_QUESTION_COLUMNS = [
  "QUESITO",
  "QUESITOREFERENDUM",
  "DESCRIZIONE_QUESITO",
  "DESCR_REFERENDUM",
  "DESCRIZIONE REFERENDUM",
];
const REFERENDUM_YES_COLUMNS = [
  "NUMVOTISI",
  "VOTI_SI",
  "VOTI SI",
  "VOTISI",
  "VOTIVALIDI_SI",
];
const REFERENDUM_NO_COLUMNS = [
  "NUMVOTINO",
  "VOTI_NO",
  "VOTI NO",
  "VOTINO",
  "VOTIVALIDI_NO",
];
const REFERENDUM_VALID_COLUMNS = [
  "VOTIVALIDI",
  "VOTI_VALIDI",
  "NUMVOTIVALIDI",
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
      console.log(`  [skip] no parsable txt/csv/xlsx files (${entry.fileName})`);
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
      candidateVotes: new Map(),
      candidateTerritorySeen: new Set(),
      candidateVotesByList: new Map(),
      candidateListTerritorySeen: new Set(),
      sourceFiles: [],
    };

    for (const sourceFile of sourceFiles) {
      const sourceContents = await readZipSourceContents(zipPath, sourceFile);
      for (const sourceContent of sourceContents) {
        console.log(`  [parse] ${sourceContent.sourceName}`);
        aggregateElectionContent(sourceContent.content, aggregate, sourceContent.sourceName);
      }
    }

    const results = Array.from(aggregate.listVotes.entries())
      .map(([name, votes]) => ({ name, votes }))
      .sort((left, right) => {
        if (right.votes !== left.votes) {
          return right.votes - left.votes;
        }
        return left.name.localeCompare(right.name, "it");
      });

    const candidates = Array.from(aggregate.candidateVotes.entries())
      .map(([name, votes]) => ({ name, votes }))
      .sort((left, right) => {
        if (right.votes !== left.votes) {
          return right.votes - left.votes;
        }
        return left.name.localeCompare(right.name, "it");
      });

    const validVotes = results.reduce((sum, item) => sum + item.votes, 0);
    const topResult = results[0] ?? { name: "N/D", votes: 0 };
    const candidateValidVotes = candidates.reduce((sum, item) => sum + item.votes, 0);
    const topCandidate = candidates[0] ?? null;
    const candidatesForOutput = candidates.slice(0, MAX_CANDIDATES_PER_ELECTION);
    const candidateLists = buildCandidateListsByResultOrder(
      aggregate.candidateVotesByList,
      results,
    );

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
      winnerCandidate: topCandidate
        ? {
          name: topCandidate.name,
          votes: topCandidate.votes,
          share: candidateValidVotes
            ? Number(((topCandidate.votes / candidateValidVotes) * 100).toFixed(2))
            : 0,
        }
        : null,
      results: results.map((item) => ({
        ...item,
        share: validVotes
          ? Number(((item.votes / validVotes) * 100).toFixed(2))
          : 0,
      })),
      candidateCount: candidates.length,
      candidates: candidatesForOutput.map((item) => ({
        ...item,
        share: candidateValidVotes
          ? Number(((item.votes / candidateValidVotes) * 100).toFixed(2))
          : 0,
      })),
      candidateLists,
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
      "La pagina usa i file territoriali disponibili nel catalogo open data (txt/csv/xlsx) per Assemblea Costituente, Camera, Senato, Referendum, Provinciali e Comunali, includendo dove disponibili anche aggregazioni candidati (top 400 per elezione e top 12 per lista per contenere il peso del dataset). Restano escluse alcune sezioni speciali/estero non confrontabili in modo uniforme.",
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
  const sourceCandidates = fileNames.filter((fileName) => {
    const lower = fileName.toLowerCase();
    const extension = path.extname(lower);

    if (![".txt", ".csv", ".xlsx"].includes(extension)) {
      return false;
    }

    if (lower.includes("__macosx")) {
      return false;
    }

    if (lower.includes("estero") || lower.includes("prefer")) {
      return false;
    }

    return true;
  });

  if (type === "assemblea_costituente") {
    return uniqueSourceFiles(
      sourceCandidates.filter((fileName) => {
        const baseName = path.basename(fileName);
        return /^assemblea_costituente-\d{8}\.txt$/i.test(baseName);
      }),
    );
  }

  if (type === "camera") {
    return uniqueSourceFiles(
      sourceCandidates.filter((fileName) => {
        const lower = fileName.toLowerCase();
        const baseName = path.basename(fileName);
        return (
          (!/scrutini/.test(lower) &&
            lower.includes("livcomune") &&
            (lower.endsWith(".txt") || lower.endsWith(".csv"))) ||
          /^camera-\d{8}\.txt$/i.test(baseName) ||
          /^camera-\d{8}_proporzionale\.txt$/i.test(baseName) ||
          /^camera_italia-\d{8}\.txt$/i.test(baseName) ||
          /^camera_vaosta-\d{8}\.txt$/i.test(baseName) ||
          /^camera_italia_livcomune\.csv$/i.test(baseName) ||
          /^camera_vaosta_livcomune\.csv$/i.test(baseName)
        );
      }),
    );
  }

  if (type === "senato") {
    return uniqueSourceFiles(
      sourceCandidates.filter((fileName) => {
        const lower = fileName.toLowerCase();
        const baseName = path.basename(fileName);
        return (
          (!/scrutini/.test(lower) &&
            lower.includes("livcomune") &&
            (lower.endsWith(".txt") || lower.endsWith(".csv"))) ||
          /^senato-\d{8}\.txt$/i.test(baseName) ||
          /^senato_italia-\d{8}\.txt$/i.test(baseName) ||
          /^senato_vaosta_trentino-\d{8}\.txt$/i.test(baseName) ||
          /^senato_italia_livcomune\.csv$/i.test(baseName) ||
          /^senato_vaosta&trentino_livcomune\.csv$/i.test(baseName)
        );
      }),
    );
  }

  if (type === "provinciali") {
    const textSources = sourceCandidates.filter((fileName) => {
      const baseName = path.basename(fileName);
      return /^provinciali-\d{8}\.txt$/i.test(baseName);
    });

    if (textSources.length) {
      return uniqueSourceFiles(textSources);
    }

    return uniqueSourceFiles(
      sourceCandidates.filter((fileName) => {
        const lower = fileName.toLowerCase();
        const baseName = path.basename(fileName);
        if (!lower.endsWith(".xlsx")) {
          return false;
        }
        return (
          /candidcollegio\.xlsx$/i.test(baseName) ||
          /^provinciali-\d{8}\.xlsx$/i.test(baseName) ||
          /^opendata_.*(liste|scrutini).*\.(xlsx)$/i.test(baseName)
        );
      }),
    );
  }

  if (type === "comunali") {
    const delimitedSources = excludeSecondTurnFiles(sourceCandidates.filter((fileName) => {
      const lower = fileName.toLowerCase();
      const baseName = path.basename(fileName);
      if (!lower.endsWith(".txt") && !lower.endsWith(".csv")) {
        return false;
      }

      if (/_sez\.csv$/i.test(baseName)) {
        return false;
      }

      return (
        /^comunali-\d{8}\.txt$/i.test(baseName) ||
        /^opendata\.txt$/i.test(baseName) ||
        /^liste&candidati\.csv$/i.test(baseName) ||
        /^scrutini\.csv$/i.test(baseName) ||
        /^comunali-\d{8}\.csv$/i.test(baseName) ||
        /_comunali_scrutini\.csv$/i.test(baseName) ||
        /_comunali_candidati_sindaco\.csv$/i.test(baseName) ||
        /scrutini.*\.csv$/i.test(baseName) ||
        /(liste|candidati).*\.csv$/i.test(baseName)
      );
    }));

    if (delimitedSources.length) {
      return uniqueSourceFiles(delimitedSources);
    }

    return uniqueSourceFiles(excludeSecondTurnFiles(
      sourceCandidates.filter((fileName) => {
        const lower = fileName.toLowerCase();
        const baseName = path.basename(fileName);
        if (!lower.endsWith(".xlsx")) {
          return false;
        }

        if (lower.includes("votanti")) {
          return false;
        }

        if (lower.includes("secondo turno")) {
          return false;
        }

        return (
          /^comunali-\d{8}.*\.xlsx$/i.test(baseName) ||
          /^_?opendata_.*(liste|scrutini).*\.(xlsx)$/i.test(baseName) ||
          /(liste|scrutini).*\.(xlsx)$/i.test(baseName)
        );
      }),
    ));
  }

  if (type === "referendum") {
    const textSources = sourceCandidates.filter((fileName) => {
      const baseName = path.basename(fileName);
      return /^referendum-\d{8}\.txt$/i.test(baseName);
    });
    if (textSources.length) {
      return uniqueSourceFiles(textSources);
    }

    const questionCsvSources = sourceCandidates.filter((fileName) => {
      const lower = fileName.toLowerCase();
      return lower.endsWith(".csv") && /scrutini_quesito\d+\.csv$/i.test(lower);
    });
    if (questionCsvSources.length) {
      return uniqueSourceFiles(questionCsvSources);
    }

    const livComuneXlsxSources = sourceCandidates.filter((fileName) => {
      const lower = fileName.toLowerCase();
      const baseName = path.basename(fileName);
      return (
        lower.endsWith(".xlsx") &&
        (/^opendata_livcomune\.xlsx$/i.test(baseName) || lower.includes("livcomune"))
      );
    });
    if (livComuneXlsxSources.length) {
      return uniqueSourceFiles(livComuneXlsxSources);
    }

    const livSezioneXlsxSources = sourceCandidates.filter((fileName) => {
      const lower = fileName.toLowerCase();
      return lower.endsWith(".xlsx") && lower.includes("livsez");
    });
    if (livSezioneXlsxSources.length) {
      return uniqueSourceFiles(livSezioneXlsxSources);
    }

    return uniqueSourceFiles(
      sourceCandidates.filter((fileName) => {
        const lower = fileName.toLowerCase();
        const baseName = path.basename(fileName);
        return (
          /scrutini/.test(lower) &&
          (baseName.endsWith(".csv") || baseName.endsWith(".xlsx"))
        );
      }),
    );
  }

  return [];
}

function uniqueSourceFiles(fileNames) {
  return Array.from(new Set(fileNames)).sort((left, right) =>
    left.localeCompare(right, "it"),
  );
}

function excludeSecondTurnFiles(fileNames) {
  const hasFirstTurnSource = fileNames.some((fileName) => {
    const lower = path.basename(fileName).toLowerCase();
    return lower.includes("primo turno") || /(?:^|[^0-9])1turno/.test(lower);
  });

  if (!hasFirstTurnSource) {
    return fileNames;
  }

  return fileNames.filter((fileName) => {
    const lower = path.basename(fileName).toLowerCase();
    return !lower.includes("secondo turno") && !/2turno/.test(lower);
  });
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

async function readZipSourceContents(zipPath, fileName) {
  if (!fileName.toLowerCase().endsWith(".xlsx")) {
    const content = await readZipTextFile(zipPath, fileName);
    return [{ sourceName: fileName, content }];
  }

  const workbookBuffer = await readZipBinaryFile(zipPath, fileName);
  const workbook = XLSX.read(workbookBuffer, { type: "buffer" });
  const hasMultipleSheets = workbook.SheetNames.length > 1;
  const parsedSources = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      continue;
    }

    const content = XLSX.utils.sheet_to_csv(worksheet, {
      FS: ";",
      RS: "\n",
      blankrows: false,
    });

    if (!content.trim()) {
      continue;
    }

    parsedSources.push({
      sourceName: hasMultipleSheets ? `${fileName}#${sheetName}` : fileName,
      content,
    });
  }

  return parsedSources;
}

async function readZipTextFile(zipPath, fileName) {
  const { stdout } = await execFileAsync("unzip", ["-p", zipPath, fileName], {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  return stdout;
}

async function readZipBinaryFile(zipPath, fileName) {
  const { stdout } = await execFileAsync("unzip", ["-p", zipPath, fileName], {
    encoding: "buffer",
    maxBuffer: 512 * 1024 * 1024,
  });

  if (Buffer.isBuffer(stdout)) {
    return stdout;
  }

  return Buffer.from(stdout);
}

function aggregateElectionContent(content, aggregate, sourceFile) {
  const normalizedContent = content.replace(/^\uFEFF/, "");
  const lines = normalizedContent.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) {
    return;
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitDelimitedLine(lines[0], delimiter).map((header) => String(header).trim());
  const indexByHeader = createHeaderIndex(headers);

  const listHeader = pickHeader(indexByHeader, LIST_NAME_COLUMNS);
  const voteHeader = pickHeader(indexByHeader, LIST_VOTE_COLUMNS);
  const territoryHeaders = pickHeaders(indexByHeader, TERRITORY_COLUMNS);
  const electorHeader = pickHeader(indexByHeader, ELECTOR_COLUMNS);
  const voterHeader = pickHeader(indexByHeader, VOTER_COLUMNS);
  const blankHeader = pickHeader(indexByHeader, BLANK_COLUMNS);
  const turnHeader = pickHeader(indexByHeader, TURN_COLUMNS);
  const candidateLastNameHeader = pickHeader(indexByHeader, CANDIDATE_LASTNAME_COLUMNS);
  const candidateFirstNameHeader = pickHeader(indexByHeader, CANDIDATE_FIRSTNAME_COLUMNS);
  const candidateAltNameHeader = pickHeader(indexByHeader, CANDIDATE_ALTNAME_COLUMNS);
  const candidateVoteHeader = pickHeader(indexByHeader, CANDIDATE_VOTE_COLUMNS);

  const hasListData = Boolean(listHeader && voteHeader);
  const hasTotalsData = Boolean(
    territoryHeaders.length && (electorHeader || voterHeader || blankHeader),
  );
  const hasCandidateData = Boolean(
    candidateVoteHeader && (candidateLastNameHeader || candidateFirstNameHeader),
  );

  if (!hasListData && !hasTotalsData && !hasCandidateData) {
    return;
  }

  let contributed = false;
  const preferTurnOne = turnHeader
    ? lines.slice(1).some((line) => {
      const row = splitDelimitedLine(line, delimiter);
      return parseNumber(row[indexByHeader[turnHeader]]) === 1;
    })
    : false;

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const row = splitDelimitedLine(lines[lineIndex], delimiter);
    if (!row.length) {
      continue;
    }

    if (preferTurnOne && turnHeader) {
      const turnValue = parseNumber(row[indexByHeader[turnHeader]]);
      if (Number.isFinite(turnValue) && turnValue > 1) {
        continue;
      }
    }

    if (hasListData) {
      const listName = (row[indexByHeader[listHeader]] ?? "").trim();
      if (listName) {
        const votes = parseNumber(row[indexByHeader[voteHeader]]);
        aggregate.listVotes.set(listName, (aggregate.listVotes.get(listName) ?? 0) + votes);
        contributed = true;
      }
    }

    if (hasCandidateData) {
      const listNameForCandidate = listHeader
        ? (row[indexByHeader[listHeader]] ?? "").trim()
        : "";
      const candidateName = composeCandidateName({
        lastName: candidateLastNameHeader
          ? row[indexByHeader[candidateLastNameHeader]]
          : "",
        firstName: candidateFirstNameHeader
          ? row[indexByHeader[candidateFirstNameHeader]]
          : "",
        altName: candidateAltNameHeader
          ? row[indexByHeader[candidateAltNameHeader]]
          : "",
      });
      const candidateVotes = parseNumber(row[indexByHeader[candidateVoteHeader]]);
      if (candidateName && candidateVotes > 0) {
        const candidateTerritory = territoryHeaders
          .map((header) => (row[indexByHeader[header]] ?? "").trim())
          .join("||");
        const territoryToken = candidateTerritory || `__line_${lineIndex}`;
        const dedupeKey = `${normalizeKeyToken(candidateName)}||${territoryToken}`;
        if (!aggregate.candidateTerritorySeen.has(dedupeKey)) {
          aggregate.candidateTerritorySeen.add(dedupeKey);
          aggregate.candidateVotes.set(
            candidateName,
            (aggregate.candidateVotes.get(candidateName) ?? 0) + candidateVotes,
          );
          contributed = true;
        }

        if (listNameForCandidate) {
          const listDedupeKey = `${normalizeKeyToken(listNameForCandidate)}||${normalizeKeyToken(candidateName)}||${territoryToken}`;
          if (!aggregate.candidateListTerritorySeen.has(listDedupeKey)) {
            aggregate.candidateListTerritorySeen.add(listDedupeKey);
            if (!aggregate.candidateVotesByList.has(listNameForCandidate)) {
              aggregate.candidateVotesByList.set(listNameForCandidate, new Map());
            }
            const listCandidates = aggregate.candidateVotesByList.get(listNameForCandidate);
            listCandidates.set(
              candidateName,
              (listCandidates.get(candidateName) ?? 0) + candidateVotes,
            );
          }
        }
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
    const sourceContents = await readZipSourceContents(zipPath, sourceFile);
    for (const sourceContent of sourceContents) {
      console.log(`  [parse] ${sourceContent.sourceName}`);
      aggregateReferendumContent(sourceContent.content, byQuestion, sourceContent.sourceName);
    }
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
  const firstRow = splitDelimitedLine(lines[0], delimiter).map((header) => String(header).trim());
  const hasHeaderRow = looksLikeReferendumHeader(firstRow);
  const headers = hasHeaderRow ? firstRow : REFERENDUM_FALLBACK_HEADERS;
  const startLineIndex = hasHeaderRow ? 1 : 0;
  const indexByHeader = createHeaderIndex(headers);

  const questionNumberHeader = pickHeader(indexByHeader, REFERENDUM_NUMBER_COLUMNS);
  const questionTextHeader = pickHeader(indexByHeader, REFERENDUM_QUESTION_COLUMNS);
  const yesHeader = pickHeader(indexByHeader, REFERENDUM_YES_COLUMNS);
  const noHeader = pickHeader(indexByHeader, REFERENDUM_NO_COLUMNS);
  const validVotesHeader = pickHeader(indexByHeader, REFERENDUM_VALID_COLUMNS);
  const territoryHeaders = pickHeaders(indexByHeader, TERRITORY_COLUMNS);
  const electorHeader = pickHeader(indexByHeader, ELECTOR_COLUMNS);
  const voterHeader = pickHeader(indexByHeader, VOTER_COLUMNS);
  const blankHeader = pickHeader(indexByHeader, BLANK_COLUMNS);

  if (!yesHeader || (!noHeader && !validVotesHeader) || !territoryHeaders.length) {
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
    const noVotes = noHeader
      ? parseNumber(row[indexByHeader[noHeader]])
      : Math.max(0, parseNumber(row[indexByHeader[validVotesHeader]]) - yesVotes);
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
    normalizedHeaders.has("QUESITOREFERENDUM") ||
    normalizedHeaders.has("NUM_REFERENDUM") ||
    normalizedHeaders.has("NUMREFERENDUM") ||
    normalizedHeaders.has("NUMQUESITO") ||
    normalizedHeaders.has("NUMVOTISI") ||
    normalizedHeaders.has("VOTI_SI") ||
    normalizedHeaders.has("VOTIVALIDI_SI")
  );
}

function normalizeHeaderToken(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function detectDelimiter(line) {
  const semicolonCount = (line.match(/;/g) ?? []).length;
  const commaCount = (line.match(/,/g) ?? []).length;
  return semicolonCount >= commaCount ? ";" : ",";
}

function pickHeader(indexByHeader, candidates) {
  for (const candidate of candidates) {
    const normalized = normalizeHeaderToken(candidate);
    if (normalized && indexByHeader[normalized] !== undefined) {
      return normalized;
    }
  }
  return null;
}

function pickHeaders(indexByHeader, candidates) {
  return candidates
    .map((candidate) => pickHeader(indexByHeader, [candidate]))
    .filter(Boolean);
}

function createHeaderIndex(headers) {
  const indexByHeader = {};
  headers.forEach((header, index) => {
    const normalized = normalizeHeaderToken(header);
    if (normalized && indexByHeader[normalized] === undefined) {
      indexByHeader[normalized] = index;
    }
  });
  return indexByHeader;
}

function composeCandidateName(parts) {
  const firstName = String(parts.firstName ?? "").trim();
  const lastName = String(parts.lastName ?? "").trim();
  const altName = String(parts.altName ?? "").trim();

  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const normalizedAlt = altName && altName !== "-" ? altName : "";
  if (normalizedAlt) {
    return `${fullName || lastName || firstName} (${normalizedAlt})`.trim();
  }

  return fullName || lastName || firstName;
}

function normalizeKeyToken(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .toUpperCase();
}

function buildCandidateListsByResultOrder(candidateVotesByList, orderedResults) {
  if (!(candidateVotesByList instanceof Map) || !candidateVotesByList.size) {
    return {};
  }

  const listOrder = orderedResults
    .slice(0, MAX_CANDIDATE_LISTS_PER_ELECTION)
    .map((result) => result.name);
  const output = {};

  for (const listName of listOrder) {
    const listCandidatesMap = candidateVotesByList.get(listName);
    if (!listCandidatesMap || !listCandidatesMap.size) {
      continue;
    }

    const listCandidates = Array.from(listCandidatesMap.entries())
      .map(([name, votes]) => ({ name, votes }))
      .sort((left, right) => {
        if (right.votes !== left.votes) {
          return right.votes - left.votes;
        }
        return left.name.localeCompare(right.name, "it");
      })
      .slice(0, MAX_CANDIDATES_PER_LIST);

    const totalVotes = listCandidates.reduce((sum, item) => sum + item.votes, 0);
    output[listName] = listCandidates.map((item) => ({
      ...item,
      share: totalVotes ? Number(((item.votes / totalVotes) * 100).toFixed(2)) : 0,
    }));
  }

  return output;
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
