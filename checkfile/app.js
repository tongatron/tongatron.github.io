const state = {
  daVendere: null,
  venduto: null,
  outputCsv: "",
};

const els = {
  daVendereFile: document.getElementById("daVendereFile"),
  vendutoFile: document.getElementById("vendutoFile"),
  daVendereColumn: document.getElementById("daVendereColumn"),
  vendutoColumn: document.getElementById("vendutoColumn"),
  daVendereInfo: document.getElementById("daVendereInfo"),
  vendutoInfo: document.getElementById("vendutoInfo"),
  processBtn: document.getElementById("processBtn"),
  downloadBtn: document.getElementById("downloadBtn"),
  progressLabel: document.getElementById("progressLabel"),
  progressFill: document.getElementById("progressFill"),
  summary: document.getElementById("summary"),
};

els.daVendereFile.addEventListener("change", () => loadCsvFile("daVendere"));
els.vendutoFile.addEventListener("change", () => loadCsvFile("venduto"));
els.processBtn.addEventListener("click", processData);
els.downloadBtn.addEventListener("click", downloadOutput);
els.daVendereColumn.addEventListener("change", refreshActionsState);
els.vendutoColumn.addEventListener("change", refreshActionsState);

async function loadCsvFile(side) {
  const input = side === "daVendere" ? els.daVendereFile : els.vendutoFile;
  const info = side === "daVendere" ? els.daVendereInfo : els.vendutoInfo;
  const select = side === "daVendere" ? els.daVendereColumn : els.vendutoColumn;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  try {
    info.textContent = "Lettura file in corso...";
    const content = await file.text();
    const parsed = parseCsv(content);

    if (!parsed.headers.length) {
      throw new Error("CSV senza intestazioni");
    }

    state[side] = {
      fileName: file.name,
      headers: parsed.headers,
      rows: parsed.rows,
    };

    fillColumnSelect(select, parsed.headers);
    info.textContent = `${file.name} | ${parsed.rows.length} righe`;
    els.summary.textContent = "";
    resetProgress();
  } catch (error) {
    state[side] = null;
    select.innerHTML = `<option value="">Errore lettura CSV</option>`;
    select.disabled = true;
    info.textContent = `Errore: ${error.message}`;
  }

  refreshActionsState();
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") {
        i += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += ch;
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const cleanRows = rows.filter((r) => r.some((value) => String(value).trim() !== ""));
  if (!cleanRows.length) {
    return { headers: [], rows: [] };
  }

  const headers = cleanRows[0].map((h) => String(h).trim());
  const dataRows = cleanRows.slice(1).map((r) => {
    const normalized = [...r];
    while (normalized.length < headers.length) {
      normalized.push("");
    }
    return normalized.slice(0, headers.length);
  });

  return {
    headers,
    rows: dataRows,
  };
}

function fillColumnSelect(select, headers) {
  select.innerHTML = "";
  headers.forEach((h, idx) => {
    const opt = document.createElement("option");
    opt.value = String(idx);
    opt.textContent = h || `Colonna ${idx + 1}`;
    select.appendChild(opt);
  });
  select.disabled = false;
}

function refreshActionsState() {
  const canProcess =
    state.daVendere &&
    state.venduto &&
    els.daVendereColumn.value !== "" &&
    els.vendutoColumn.value !== "";

  els.processBtn.disabled = !canProcess;
  if (!canProcess) {
    els.downloadBtn.disabled = true;
  }
}

function resetProgress() {
  els.progressFill.style.width = "0%";
  els.progressLabel.textContent = "In attesa di dati...";
}

async function processData() {
  if (!state.daVendere || !state.venduto) {
    return;
  }

  els.processBtn.disabled = true;
  els.downloadBtn.disabled = true;
  els.summary.textContent = "Elaborazione in corso...";

  const daVendereIndex = Number(els.daVendereColumn.value);
  const vendutoIndex = Number(els.vendutoColumn.value);

  const vendutoValues = state.venduto.rows.map((row) => String(row[vendutoIndex] ?? ""));
  const outputHeaders = [...state.daVendere.headers, "VENDUTO_MATCH", "MATCH_PERCENT"];
  const outputRows = [];
  const usedVendutoIndexes = new Set();

  let exactCount = 0;
  let anyMatchCount = 0;

  const total = state.daVendere.rows.length;
  const chunkSize = 200;

  for (let start = 0; start < total; start += chunkSize) {
    const end = Math.min(start + chunkSize, total);

    for (let i = start; i < end; i += 1) {
      const row = state.daVendere.rows[i];
      const daVendereValue = String(row[daVendereIndex] ?? "");
      const best = findBestMatchFromLeft(daVendereValue, vendutoValues, usedVendutoIndexes);

      if (best.percent > 0) {
        anyMatchCount += 1;
      }
      if (best.percent === 100) {
        exactCount += 1;
      }

      if (best.usedIndex >= 0) {
        usedVendutoIndexes.add(best.usedIndex);
      }

      outputRows.push([...row, best.text, `${best.percent.toFixed(2)}%`]);
    }

    const pct = total ? ((end / total) * 100).toFixed(1) : "100.0";
    els.progressFill.style.width = `${pct}%`;
    els.progressLabel.textContent = `Elaborazione ${end}/${total} (${pct}%)`;

    await pause();
  }

  state.outputCsv = buildCsv([outputHeaders, ...outputRows]);
  els.downloadBtn.disabled = false;
  refreshActionsState();

  const average = outputRows.length
    ? outputRows.reduce((sum, r) => sum + Number(String(r[r.length - 1]).replace("%", "")), 0) /
      outputRows.length
    : 0;

  els.summary.innerHTML = [
    `<strong>Completato.</strong>`,
    `Righe da vendere: ${total}`,
    `Corrispondenze esatte (100%): ${exactCount}`,
    `Corrispondenze > 0%: ${anyMatchCount}`,
    `Media percentuale: ${average.toFixed(2)}%`,
  ].join("<br>");
}

function findBestMatchFromLeft(daVendereValue, vendutoValues, usedVendutoIndexes) {
  const daVendereTrimmed = daVendereValue.trim();
  if (!daVendereTrimmed) {
    return { text: "", percent: 0, usedIndex: -1 };
  }

  let bestText = "";
  let bestPercent = 0;
  let bestIndex = -1;

  for (let i = 0; i < vendutoValues.length; i += 1) {
    if (usedVendutoIndexes.has(i)) {
      continue;
    }

    const candidate = vendutoValues[i].trim();
    if (!candidate) {
      continue;
    }

    let percent = 0;
    if (candidate === daVendereTrimmed) {
      percent = 100;
    } else {
      const prefixLen = commonPrefixLength(daVendereTrimmed, candidate);
      const maxLen = Math.max(daVendereTrimmed.length, candidate.length);
      percent = maxLen ? (prefixLen / maxLen) * 100 : 0;
    }

    if (percent > bestPercent) {
      bestPercent = percent;
      bestText = candidate;
      bestIndex = i;
    }

    if (bestPercent === 100) {
      break;
    }
  }

  return {
    text: bestText,
    percent: Number(bestPercent.toFixed(2)),
    usedIndex: bestPercent > 0 ? bestIndex : -1,
  };
}

function commonPrefixLength(a, b) {
  const minLen = Math.min(a.length, b.length);
  let i = 0;
  while (i < minLen && a[i] === b[i]) {
    i += 1;
  }
  return i;
}

function buildCsv(table) {
  return table
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n");
}

function escapeCsvCell(value) {
  const str = String(value ?? "");
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadOutput() {
  if (!state.outputCsv) {
    return;
  }
  const blob = new Blob([state.outputCsv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "da_vendere_con_match.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function pause() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
