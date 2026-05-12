/**
 * app.js — Piemonte TU Exporter · Web Edition
 * Logica completa: API calls, paginazione, flatten JSON, export CSV/XLSX.
 * Nessun framework, nessun server — browser puro.
 */

'use strict';

const BASE_URL = 'https://pslp.regione.piemonte.it/pslpbff/api-public/v1/annunci-pslp';

const ID_CANDIDATES = [
  'idAnnuncioPslp','idAnnuncio','id','codiceAnnuncio',
  'idOfferta','announcementId','idPslp','idVacancy','idRichiesta',
  'numAnnuncio','codAnnuncio',
];

// ── DOM ───────────────────────────────────────────────────────────────────
const $  = (id) => document.getElementById(id);
const elBar      = $('bar');
const elPct      = $('pct');
const elStatus   = $('statusLine');
const elLog      = $('log');
const elDot      = $('statusDot');
const btnStart   = $('btnStart');
const btnStop    = $('btnStop');
const btnClear   = $('btnClear');

// ── Stato ─────────────────────────────────────────────────────────────────
let abortFlag = false;

// ── Checkbox stilizzati ───────────────────────────────────────────────────
[['flgL68Art1','lbl1'],['flgL68Art18','lbl18'],['tirocinio','lblTir']].forEach(([cbId, lblId]) => {
  const cb  = $(cbId);
  const lbl = $(lblId);
  const sync = () => lbl.classList.toggle('on', cb.checked);
  cb.addEventListener('change', sync);
  sync();
});

// ── Radio stilizzati ──────────────────────────────────────────────────────
document.querySelectorAll('input[name="fmt"]').forEach((r) => {
  r.addEventListener('change', () => {
    $('lblXlsx').classList.toggle('on', $('lblXlsx').querySelector('input').checked);
    $('lblCsv' ).classList.toggle('on', $('lblCsv' ).querySelector('input').checked);
  });
});

// ── Toggle avanzate ───────────────────────────────────────────────────────
$('advToggle').addEventListener('click', () => {
  $('advToggle').classList.toggle('open');
  $('advBody'  ).classList.toggle('open');
});

// ── Pulsanti ──────────────────────────────────────────────────────────────
btnStart.addEventListener('click', startDownload);
btnStop .addEventListener('click', () => { abortFlag = true; log('warn', 'Interruzione richiesta…'); });
btnClear.addEventListener('click', clearLog);

// ── Entry point ───────────────────────────────────────────────────────────
async function startDownload() {
  abortFlag = false;
  setRunning(true);
  clearLog();
  setProgress(0, 'avvio…');

  const params = {
    flgL68Art1:           $('flgL68Art1' ).checked ? 'S' : 'N',
    flgL68Art18:          $('flgL68Art18').checked ? 'S' : 'N',
    tirocinio:            $('tirocinio'  ).checked ? 'S' : 'N',
    idCpi:                null,
    campoTestualeRicerca: $('campoTestuale').value.trim() || null,
    idComune:             $('idComune'   ).value.trim() || null,
    idNazioneEstera:      null,
    rangeKm:              $('rangeKm'    ).value.trim() || '5',
  };
  const recForPage = parseInt($('recForPage').value, 10) || 100;
  const delay      = parseInt($('delay'     ).value, 10) || 350;
  const cookie     = $('cookie').value.trim() || null;
  const fmt        = document.querySelector('input[name="fmt"]:checked').value;
  const fileName   = $('fileName').value.trim() || 'annunci_pslp';

  try {
    // ── Fase 1: lista ID ────────────────────────────────────────────────
    const allIds = [];
    let page = 0, hasMore = true, totalPages = null;

    while (hasMore && !abortFlag) {
      log('info', `📄 Pagina lista ${page + 1}${totalPages ? '/' + totalPages : ''}…`);
      const raw = await apiPost(
        `${BASE_URL}/consulta-annunci?page=${page}&recForPage=${recForPage}`,
        params, cookie
      );
      const { records, hasMore: more, totalPages: tp } = parseList(raw, recForPage);
      if (tp) totalPages = tp;
      log('info', `  → ${records.length} annunci in pagina ${page + 1}`);
      for (const r of records) {
        const id = extractId(r);
        if (id !== null) allIds.push(id);
        else log('warn', `⚠️ ID non trovato: ${JSON.stringify(r).slice(0, 120)}`);
      }
      hasMore = more && records.length > 0;
      page++;
      if (hasMore) await sleep(delay);
    }

    if (abortFlag) { log('warn', 'Download interrotto.'); setRunning(false); return; }

    log('info', `✅ ${allIds.length} ID trovati. Scarico dettagli…`);
    setProgress(10, `${allIds.length} annunci da scaricare`);

    // ── Fase 2: dettagli ────────────────────────────────────────────────
    const details = [];
    let errors = 0;

    for (let i = 0; i < allIds.length; i++) {
      if (abortFlag) break;
      const id = allIds[i];
      const pct = 10 + Math.round((i / allIds.length) * 88);
      setProgress(pct, `${i + 1}/${allIds.length} annunci`);
      log('info', `🔍 [${i + 1}/${allIds.length}] ID ${id}`);
      try {
        const detail = await apiPost(`${BASE_URL}/get-dettaglio/${id}`, {}, cookie);
        details.push({ _sourceId: id, ...detail });
      } catch (e) {
        errors++;
        log('error', `  ❌ ID ${id}: ${e.message}`);
        details.push({ _sourceId: id, _error: e.message });
      }
      if (i < allIds.length - 1) await sleep(delay);
    }

    if (errors) log('warn', `⚠️ ${errors} errori su ${allIds.length} annunci.`);

    // ── Fase 3: export ──────────────────────────────────────────────────
    log('info', 'Esportazione in corso…');
    setProgress(99, 'esportazione…');

    const { headers, rows } = flattenRecords(details);

    if (fmt === 'xlsx') exportXlsx(headers, rows, fileName);
    else               exportCsv (headers, rows, fileName);

    setProgress(100, `✓ ${details.length} annunci esportati → ${fileName}.${fmt}`);
    log('success', `File scaricato: ${fileName}.${fmt}`);

  } catch (e) {
    log('error', `❌ Errore fatale: ${e.message}`);
    setProgress(0, `errore: ${e.message}`);
  }

  setRunning(false);
}

// ── API ───────────────────────────────────────────────────────────────────

async function apiPost(url, body, cookie, retries = 3) {
  const headers = {
    'Accept':       'application/json',
    'Content-Type': 'application/json',
    'Origin':       'https://pslp.regione.piemonte.it',
    'Referer':      'https://pslp.regione.piemonte.it/pslpwcl/pslpfcweb/consulta-annunci/profili-ricercati',
  };
  // I browser bloccano l'header Cookie via fetch per sicurezza;
  // se il cookie è necessario usare un proxy.
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return await res.json();
    } catch (e) {
      if (attempt === retries) throw e;
      await sleep(400 * attempt);
    }
  }
}

function parseList(data, recForPage) {
  // PSLP proprietario: { list: [], currentPage, esitoPositivo, totalPage? }
  if (data && Array.isArray(data.list)) {
    const tp  = data.totalPage ?? data.totalPages ?? null;
    const cur = data.currentPage ?? 0;
    return { records: data.list, hasMore: tp ? cur + 1 < tp : data.list.length >= recForPage, totalPages: tp };
  }
  // Spring Pageable: { content: [], totalPages, last }
  if (data && Array.isArray(data.content)) {
    return { records: data.content, hasMore: !data.last, totalPages: data.totalPages ?? null };
  }
  // Array diretto
  if (Array.isArray(data)) {
    return { records: data, hasMore: data.length >= recForPage, totalPages: null };
  }
  for (const key of ['data','annunci','result']) {
    if (data && Array.isArray(data[key])) {
      return { records: data[key], hasMore: data[key].length >= recForPage, totalPages: null };
    }
  }
  throw new Error(`Struttura risposta non riconosciuta: ${JSON.stringify(data).slice(0, 300)}`);
}

function extractId(record) {
  for (const f of ID_CANDIDATES) {
    if (record[f] !== undefined && record[f] !== null) return record[f];
  }
  return null;
}

// ── Flatten JSON ──────────────────────────────────────────────────────────

function flattenObject(obj, prefix = '', result = {}) {
  if (obj === null || obj === undefined) { result[prefix] = ''; return result; }
  if (typeof obj !== 'object')           { result[prefix] = obj;  return result; }

  if (Array.isArray(obj)) {
    if (obj.length === 0) { result[prefix] = ''; return result; }
    // Array di primitive → unisce con virgola
    if (obj.every((el) => typeof el !== 'object' || el === null)) {
      result[prefix] = obj.join(', ');
      return result;
    }
    // Array di oggetti → espande con [0], [1]…
    for (let i = 0; i < obj.length; i++) {
      flattenObject(obj[i], prefix ? `${prefix}[${i}]` : `[${i}]`, result);
    }
    return result;
  }

  const keys = Object.keys(obj);
  if (keys.length === 0) { result[prefix] = ''; return result; }
  for (const key of keys) {
    flattenObject(obj[key], prefix ? `${prefix}.${key}` : key, result);
  }
  return result;
}

function flattenRecords(records) {
  const flatRows = records.map((r) => flattenObject(r));
  const headerSet = new Set();
  for (const row of flatRows) for (const k of Object.keys(row)) headerSet.add(k);
  const headers = [...headerSet];
  const rows = flatRows.map((row) => {
    const out = {};
    for (const h of headers) out[h] = row[h] !== undefined ? row[h] : '';
    return out;
  });
  return { headers, rows };
}

// ── Export ────────────────────────────────────────────────────────────────

function exportXlsx(headers, rows, fileName) {
  const matrix = [headers, ...rows.map((r) => headers.map((h) => r[h] ?? ''))];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(matrix);
  ws['!cols'] = headers.map((h) => ({
    wch: Math.min(50, Math.max(h.length, ...rows.slice(0, 50).map((r) => String(r[h] ?? '').length)))
  }));
  XLSX.utils.book_append_sheet(wb, ws, 'Annunci');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

function exportCsv(headers, rows, fileName) {
  const escape = (v) => {
    const s = String(v ?? '').replace(/"/g, '""');
    return /[;"'\n\r]/.test(s) ? `"${s}"` : s;
  };
  const lines = [
    headers.map(escape).join(';'),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(';')),
  ];
  // BOM UTF-8 per Excel italiano
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${fileName}.csv`);
}

function triggerDownload(blob, name) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── UI helpers ────────────────────────────────────────────────────────────

function setRunning(running) {
  btnStart.disabled = running;
  btnStop .disabled = !running;
  elDot.className   = 'dot ' + (running ? 'dot-green dot-running' : 'dot-idle');
  document.querySelectorAll('input').forEach((el) => { el.disabled = running; });
}

function setProgress(pct, text) {
  const p = Math.max(0, Math.min(100, pct));
  elBar.style.width  = p + '%';
  elPct.textContent  = p + '%';
  elStatus.textContent = '_ ' + text;
}

function log(type, text) {
  const line = document.createElement('span');
  line.className   = `log-line ${type}`;
  line.textContent = `[${ts()}] ${text}`;
  elLog.appendChild(line);
  elLog.appendChild(document.createElement('br'));
  elLog.scrollTop = elLog.scrollHeight;
}

function clearLog() {
  elLog.innerHTML = '';
  setProgress(0, 'pronto.');
  elDot.className = 'dot dot-idle';
}

function ts() { return new Date().toLocaleTimeString('it-IT'); }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
