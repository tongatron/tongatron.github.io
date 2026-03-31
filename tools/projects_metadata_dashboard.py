#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import re
import sys
from dataclasses import dataclass
from datetime import date
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parents[1]
PROJECTS_DIR = ROOT / "_projects"
HOST = "127.0.0.1"
PORT = 8765

LIST_FIELDS = {"tags", "stack", "platforms"}
BOOL_FIELDS = {"featured", "draft", "private", "client_work", "open_source"}
DATE_FIELDS = {"published_at", "updated_at"}
PRIMARY_FIELDS = [
    "title",
    "slug",
    "published_at",
    "updated_at",
    "status",
    "category",
    "tags",
    "stack",
    "platforms",
    "live_url",
    "icon",
    "cover_image",
    "featured",
    "draft",
    "private",
    "client_work",
    "open_source",
    "role",
    "seo_title",
    "seo_description",
]

HTML = r'''<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Projects Metadata Dashboard</title>
  <style>
    :root {
      --bg: #0f1114;
      --panel: #171a1f;
      --panel-2: #1d2128;
      --line: #2a2f39;
      --text: #f3f5f8;
      --muted: #9aa3b2;
      --accent: #65c7ff;
      --accent-2: #d8f1ff;
      --danger: #ff7d7d;
      --ok: #8cd17d;
      --warn: #ffd166;
      --shadow: 0 12px 30px rgba(0,0,0,.28);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: linear-gradient(180deg, #0e1013 0%, #11141a 100%);
      color: var(--text);
    }
    .shell {
      display: grid;
      grid-template-columns: 340px 1fr;
      min-height: 100vh;
    }
    .sidebar, .main { min-width: 0; }
    .sidebar {
      border-right: 1px solid var(--line);
      background: rgba(10,12,16,.62);
      backdrop-filter: blur(12px);
      padding: 20px;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow: auto;
    }
    .main {
      padding: 20px;
    }
    .eyebrow {
      color: var(--accent);
      font-size: 12px;
      letter-spacing: .22em;
      text-transform: uppercase;
      margin: 0 0 10px;
      font-weight: 700;
    }
    h1 {
      font-size: 34px;
      line-height: 1.05;
      margin: 0 0 12px;
    }
    .intro {
      color: var(--muted);
      line-height: 1.55;
      margin-bottom: 22px;
    }
    .card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 18px;
      box-shadow: var(--shadow);
      padding: 16px;
    }
    .card + .card { margin-top: 16px; }
    .row { display: flex; gap: 10px; flex-wrap: wrap; }
    .field { display: grid; gap: 6px; margin-bottom: 12px; }
    label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .08em;
      color: var(--muted);
      font-weight: 700;
    }
    input, select, textarea {
      width: 100%;
      background: var(--panel-2);
      color: var(--text);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 10px 12px;
      font: inherit;
    }
    textarea { min-height: 84px; resize: vertical; }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid rgba(101,199,255,.28);
      background: rgba(101,199,255,.10);
      color: var(--accent-2);
      border-radius: 999px;
      padding: 5px 10px;
      font-size: 13px;
    }
    .chip button {
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      font-size: 15px;
    }
    .btn {
      border: 1px solid rgba(255,255,255,.18);
      background: rgba(255,255,255,.03);
      color: var(--text);
      border-radius: 12px;
      padding: 10px 14px;
      cursor: pointer;
      font-weight: 600;
      transition: .18s ease;
    }
    .btn:hover { transform: translateY(-1px); border-color: rgba(101,199,255,.35); }
    .btn.primary {
      background: rgba(101,199,255,.18);
      border-color: rgba(101,199,255,.45);
      color: white;
    }
    .btn.ghost { background: transparent; }
    .btn.warn { border-color: rgba(255,209,102,.4); color: var(--warn); }
    .btn.danger { border-color: rgba(255,125,125,.4); color: var(--danger); }
    .meta {
      display: grid;
      grid-template-columns: repeat(3, minmax(0,1fr));
      gap: 12px;
      margin-bottom: 18px;
    }
    .stat {
      padding: 14px;
      border-radius: 14px;
      background: var(--panel);
      border: 1px solid var(--line);
    }
    .stat .k { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
    .stat .v { font-size: 24px; font-weight: 700; margin-top: 8px; }
    .split {
      display: grid;
      grid-template-columns: 1.2fr .95fr;
      gap: 18px;
      align-items: start;
    }
    .project-list {
      display: grid;
      gap: 10px;
      max-height: 40vh;
      overflow: auto;
    }
    .project-item {
      border: 1px solid var(--line);
      background: var(--panel);
      border-radius: 14px;
      padding: 12px;
      cursor: pointer;
    }
    .project-item.active { border-color: rgba(101,199,255,.55); box-shadow: inset 0 0 0 1px rgba(101,199,255,.35); }
    .project-item h3 { margin: 0 0 6px; font-size: 18px; }
    .project-item p { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.45; }
    .token-list {
      display: grid;
      gap: 8px;
      max-height: 320px;
      overflow: auto;
      margin-top: 10px;
    }
    .token-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      padding: 10px 12px;
      border-radius: 12px;
      background: var(--panel-2);
      border: 1px solid var(--line);
      font-size: 14px;
    }
    .token-row .count { color: var(--muted); }
    .toolbar {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }
    .hidden { display: none !important; }
    .notice {
      padding: 12px 14px;
      border-radius: 12px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,.03);
      color: var(--muted);
      margin-bottom: 16px;
    }
    .notice.ok { border-color: rgba(140,209,125,.35); color: #dff5d8; background: rgba(140,209,125,.08); }
    .notice.error { border-color: rgba(255,125,125,.35); color: #ffd8d8; background: rgba(255,125,125,.08); }
    .two { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
    .three { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; }
    .hr { height: 1px; background: var(--line); margin: 16px 0; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    @media (max-width: 1100px) {
      .shell, .split { grid-template-columns: 1fr; }
      .sidebar { position: static; height: auto; }
      .meta, .three { grid-template-columns: 1fr; }
      .two { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <aside class="sidebar">
      <p class="eyebrow">Projects metadata</p>
      <h1>Dashboard</h1>
      <p class="intro">Gestione orizzontale di tag, stack, platforms e date per i file in <span class="mono">_projects</span>.</p>

      <div class="card">
        <div class="field">
          <label for="search">Cerca progetto</label>
          <input id="search" placeholder="Titolo, slug, tag...">
        </div>
        <div class="field">
          <label for="filter-category">Categoria</label>
          <select id="filter-category"><option value="">Tutte</option></select>
        </div>
        <div class="field">
          <label for="filter-status">Stato</label>
          <select id="filter-status"><option value="">Tutti</option></select>
        </div>
        <div class="field">
          <label for="filter-platform">Platform</label>
          <select id="filter-platform"><option value="">Tutte</option></select>
        </div>
      </div>

      <div class="card">
        <p class="eyebrow" style="margin-bottom:8px">Progetti</p>
        <div id="project-list" class="project-list"></div>
      </div>
    </aside>

    <main class="main">
      <div class="meta">
        <div class="stat"><div class="k">Progetti</div><div class="v" id="stat-projects">0</div></div>
        <div class="stat"><div class="k">Tag unici</div><div class="v" id="stat-tags">0</div></div>
        <div class="stat"><div class="k">Stack unici</div><div class="v" id="stat-stack">0</div></div>
      </div>

      <div id="flash" class="hidden notice"></div>

      <div class="split">
        <section class="card">
          <div class="toolbar">
            <button class="btn ghost" id="reload-btn">Ricarica</button>
            <button class="btn warn" id="today-btn">Updated_at = oggi</button>
            <button class="btn primary" id="save-btn">Salva progetto</button>
          </div>
          <div id="editor-empty" class="notice">Seleziona un progetto dalla colonna sinistra.</div>
          <div id="editor" class="hidden">
            <div class="two">
              <div class="field"><label>Titolo</label><input id="f-title"></div>
              <div class="field"><label>Slug</label><input id="f-slug"></div>
            </div>
            <div class="three">
              <div class="field"><label>Published_at</label><input id="f-published" type="date"></div>
              <div class="field"><label>Updated_at</label><input id="f-updated" type="date"></div>
              <div class="field"><label>Status</label><input id="f-status"></div>
            </div>
            <div class="three">
              <div class="field"><label>Category</label><input id="f-category"></div>
              <div class="field"><label>Featured</label><select id="f-featured"><option value="false">false</option><option value="true">true</option></select></div>
              <div class="field"><label>Private</label><select id="f-private"><option value="false">false</option><option value="true">true</option></select></div>
            </div>
            <div class="field"><label>Excerpt</label><textarea id="f-excerpt"></textarea></div>
            <div class="two">
              <div>
                <div class="field"><label>Tag</label><div class="row"><input id="tag-input" placeholder="Aggiungi tag"><button class="btn" id="tag-add" type="button">Aggiungi</button></div><div id="tags" class="chips"></div></div>
              </div>
              <div>
                <div class="field"><label>Stack</label><div class="row"><input id="stack-input" placeholder="Aggiungi tecnologia"><button class="btn" id="stack-add" type="button">Aggiungi</button></div><div id="stack" class="chips"></div></div>
              </div>
            </div>
            <div class="field"><label>Platforms</label><div class="row"><input id="platform-input" placeholder="Aggiungi piattaforma"><button class="btn" id="platform-add" type="button">Aggiungi</button></div><div id="platforms" class="chips"></div></div>
          </div>
        </section>

        <section>
          <div class="card">
            <p class="eyebrow" style="margin-bottom:8px">Bulk tools</p>
            <div class="field">
              <label for="bulk-field">Campo</label>
              <select id="bulk-field">
                <option value="tags">tags</option>
                <option value="stack">stack</option>
                <option value="platforms">platforms</option>
              </select>
            </div>
            <div class="two">
              <div class="field"><label>Trova token</label><input id="bulk-find" placeholder="es. web"></div>
              <div class="field"><label>Sostituisci con</label><input id="bulk-replace" placeholder="es. browser"></div>
            </div>
            <div class="toolbar">
              <button class="btn primary" id="bulk-replace-btn">Sostituisci in tutti i file</button>
              <button class="btn" id="bulk-today-btn">Aggiorna oggi i filtrati</button>
            </div>
            <div class="notice">La sostituzione bulk agisce su tutti i file in <span class="mono">_projects</span>. Le date bulk agiscono solo sui progetti attualmente filtrati.</div>
          </div>

          <div class="card">
            <div class="toolbar" style="justify-content:space-between">
              <p class="eyebrow" style="margin:0">Vocabolario</p>
              <select id="tokens-field">
                <option value="tags">tags</option>
                <option value="stack">stack</option>
                <option value="platforms">platforms</option>
                <option value="category">category</option>
                <option value="status">status</option>
              </select>
            </div>
            <div id="tokens" class="token-list"></div>
          </div>
        </section>
      </div>
    </main>
  </div>
<script>
const state = {
  projects: [],
  filtered: [],
  selectedPath: null,
  selected: null,
};

const el = {
  flash: document.getElementById('flash'),
  projectList: document.getElementById('project-list'),
  search: document.getElementById('search'),
  filterCategory: document.getElementById('filter-category'),
  filterStatus: document.getElementById('filter-status'),
  filterPlatform: document.getElementById('filter-platform'),
  statProjects: document.getElementById('stat-projects'),
  statTags: document.getElementById('stat-tags'),
  statStack: document.getElementById('stat-stack'),
  editor: document.getElementById('editor'),
  editorEmpty: document.getElementById('editor-empty'),
  saveBtn: document.getElementById('save-btn'),
  reloadBtn: document.getElementById('reload-btn'),
  todayBtn: document.getElementById('today-btn'),
  bulkField: document.getElementById('bulk-field'),
  bulkFind: document.getElementById('bulk-find'),
  bulkReplace: document.getElementById('bulk-replace'),
  bulkReplaceBtn: document.getElementById('bulk-replace-btn'),
  bulkTodayBtn: document.getElementById('bulk-today-btn'),
  tokensField: document.getElementById('tokens-field'),
  tokens: document.getElementById('tokens'),
  title: document.getElementById('f-title'),
  slug: document.getElementById('f-slug'),
  published: document.getElementById('f-published'),
  updated: document.getElementById('f-updated'),
  status: document.getElementById('f-status'),
  category: document.getElementById('f-category'),
  featured: document.getElementById('f-featured'),
  private: document.getElementById('f-private'),
  excerpt: document.getElementById('f-excerpt'),
  tags: document.getElementById('tags'),
  stack: document.getElementById('stack'),
  platforms: document.getElementById('platforms'),
  tagInput: document.getElementById('tag-input'),
  stackInput: document.getElementById('stack-input'),
  platformInput: document.getElementById('platform-input'),
  tagAdd: document.getElementById('tag-add'),
  stackAdd: document.getElementById('stack-add'),
  platformAdd: document.getElementById('platform-add'),
};

function flash(message, kind='ok') {
  el.flash.textContent = message;
  el.flash.className = `notice ${kind}`;
  setTimeout(() => { el.flash.className = 'hidden notice'; }, 2600);
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))].sort((a,b) => a.localeCompare(b));
}

function refreshStats() {
  el.statProjects.textContent = String(state.projects.length);
  el.statTags.textContent = String(uniq(state.projects.flatMap(p => p.tags || [])).length);
  el.statStack.textContent = String(uniq(state.projects.flatMap(p => p.stack || [])).length);
}

function populateFilters() {
  const categories = uniq(state.projects.map(p => p.category || ''));
  const statuses = uniq(state.projects.map(p => p.status || ''));
  const platforms = uniq(state.projects.flatMap(p => p.platforms || []));
  const fill = (node, values) => {
    const current = node.value;
    node.innerHTML = '<option value="">Tutte</option>';
    values.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      node.appendChild(opt);
    });
    node.value = current;
  };
  fill(el.filterCategory, categories);
  fill(el.filterStatus, statuses);
  fill(el.filterPlatform, platforms);
}

function applyFilters() {
  const q = el.search.value.trim().toLowerCase();
  const category = el.filterCategory.value;
  const status = el.filterStatus.value;
  const platform = el.filterPlatform.value;
  state.filtered = state.projects.filter(project => {
    const hay = [project.title, project.slug, project.category, project.status, ...(project.tags||[]), ...(project.stack||[]), ...(project.platforms||[])].join(' ').toLowerCase();
    if (q && !hay.includes(q)) return false;
    if (category && project.category !== category) return false;
    if (status && project.status !== status) return false;
    if (platform && !(project.platforms || []).includes(platform)) return false;
    return true;
  });
  renderProjectList();
  renderTokenList();
}

function renderProjectList() {
  el.projectList.innerHTML = '';
  state.filtered.forEach(project => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `project-item ${project.path === state.selectedPath ? 'active' : ''}`;
    item.innerHTML = `<h3>${project.title}</h3><p>${project.slug} · agg. ${project.updated_at || '—'} · ${(project.tags || []).join(', ')}</p>`;
    item.addEventListener('click', () => selectProject(project.path));
    el.projectList.appendChild(item);
  });
  if (!state.filtered.length) {
    el.projectList.innerHTML = '<div class="notice">Nessun progetto con i filtri correnti.</div>';
  }
}

function renderChips(container, values, field) {
  container.innerHTML = '';
  (values || []).forEach((value, index) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.innerHTML = `<span>${value}</span>`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '×';
    btn.addEventListener('click', () => {
      state.selected[field].splice(index, 1);
      renderEditor();
    });
    chip.appendChild(btn);
    container.appendChild(chip);
  });
}

function renderEditor() {
  if (!state.selected) {
    el.editor.classList.add('hidden');
    el.editorEmpty.classList.remove('hidden');
    return;
  }
  el.editor.classList.remove('hidden');
  el.editorEmpty.classList.add('hidden');
  const p = state.selected;
  el.title.value = p.title || '';
  el.slug.value = p.slug || '';
  el.published.value = p.published_at || '';
  el.updated.value = p.updated_at || '';
  el.status.value = p.status || '';
  el.category.value = p.category || '';
  el.featured.value = String(Boolean(p.featured));
  el.private.value = String(Boolean(p.private));
  el.excerpt.value = p.excerpt || '';
  renderChips(el.tags, p.tags, 'tags');
  renderChips(el.stack, p.stack, 'stack');
  renderChips(el.platforms, p.platforms, 'platforms');
}

function selectProject(path) {
  state.selectedPath = path;
  const project = state.projects.find(item => item.path === path);
  state.selected = project ? JSON.parse(JSON.stringify(project)) : null;
  renderProjectList();
  renderEditor();
}

function collectEditor() {
  if (!state.selected) return null;
  state.selected.title = el.title.value.trim();
  state.selected.slug = el.slug.value.trim();
  state.selected.published_at = el.published.value;
  state.selected.updated_at = el.updated.value;
  state.selected.status = el.status.value.trim();
  state.selected.category = el.category.value.trim();
  state.selected.featured = el.featured.value === 'true';
  state.selected.private = el.private.value === 'true';
  state.selected.excerpt = el.excerpt.value.trim();
  return state.selected;
}

async function saveProject() {
  const project = collectEditor();
  if (!project) return;
  const response = await fetch('/api/project', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  const data = await response.json();
  if (!response.ok) {
    flash(data.error || 'Salvataggio non riuscito', 'error');
    return;
  }
  flash('Progetto salvato');
  await loadProjects(project.path);
}

function addChip(input, field) {
  if (!state.selected) return;
  const value = input.value.trim();
  if (!value) return;
  const list = state.selected[field] || [];
  if (!list.includes(value)) list.push(value);
  input.value = '';
  renderEditor();
}

function renderTokenList() {
  const field = el.tokensField.value;
  const counts = new Map();
  state.filtered.forEach(project => {
    let values = [];
    if ([ 'category', 'status' ].includes(field)) {
      values = [project[field]].filter(Boolean);
    } else {
      values = project[field] || [];
    }
    values.forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
  });
  const rows = [...counts.entries()].sort((a,b) => a[0].localeCompare(b[0]));
  el.tokens.innerHTML = rows.map(([value, count]) => `<div class="token-row"><span>${value}</span><span class="count">${count}</span></div>`).join('');
  if (!rows.length) el.tokens.innerHTML = '<div class="notice">Nessun valore disponibile per i filtri correnti.</div>';
}

async function bulkReplace() {
  const field = el.bulkField.value;
  const find = el.bulkFind.value.trim();
  const replace = el.bulkReplace.value.trim();
  if (!find || !replace) {
    flash('Inserisci sia il valore da trovare sia quello di sostituzione.', 'error');
    return;
  }
  const response = await fetch('/api/bulk-replace', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field, find, replace }),
  });
  const data = await response.json();
  if (!response.ok) {
    flash(data.error || 'Operazione bulk fallita', 'error');
    return;
  }
  flash(`Aggiornati ${data.changed} file`);
  await loadProjects(state.selectedPath);
}

async function bulkToday() {
  const paths = state.filtered.map(item => item.path);
  if (!paths.length) {
    flash('Nessun progetto filtrato.', 'error');
    return;
  }
  const response = await fetch('/api/bulk-update-date', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paths, updated_at: new Date().toISOString().slice(0,10) }),
  });
  const data = await response.json();
  if (!response.ok) {
    flash(data.error || 'Aggiornamento date fallito', 'error');
    return;
  }
  flash(`Updated_at aggiornato su ${data.changed} file`);
  await loadProjects(state.selectedPath);
}

async function loadProjects(preferredPath = null) {
  const response = await fetch('/api/projects');
  const data = await response.json();
  state.projects = data.projects;
  refreshStats();
  populateFilters();
  applyFilters();
  const nextPath = preferredPath && state.projects.some(item => item.path === preferredPath)
    ? preferredPath
    : state.filtered[0]?.path;
  selectProject(nextPath || null);
}

el.reloadBtn.addEventListener('click', () => loadProjects(state.selectedPath));
el.saveBtn.addEventListener('click', saveProject);
el.todayBtn.addEventListener('click', () => {
  el.updated.value = new Date().toISOString().slice(0,10);
});
el.bulkReplaceBtn.addEventListener('click', bulkReplace);
el.bulkTodayBtn.addEventListener('click', bulkToday);
el.tokensField.addEventListener('change', renderTokenList);
el.search.addEventListener('input', applyFilters);
el.filterCategory.addEventListener('change', applyFilters);
el.filterStatus.addEventListener('change', applyFilters);
el.filterPlatform.addEventListener('change', applyFilters);
el.tagAdd.addEventListener('click', () => addChip(el.tagInput, 'tags'));
el.stackAdd.addEventListener('click', () => addChip(el.stackInput, 'stack'));
el.platformAdd.addEventListener('click', () => addChip(el.platformInput, 'platforms'));
['tagInput','stackInput','platformInput'].forEach((id) => {
  el[id].addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const field = id === 'tagInput' ? 'tags' : id === 'stackInput' ? 'stack' : 'platforms';
      addChip(el[id], field);
    }
  });
});

loadProjects();
</script>
</body>
</html>
'''


def parse_bool(value: str) -> bool:
    return value.strip().lower() == "true"


def parse_front_matter(text: str) -> tuple[dict[str, Any], str]:
    if not text.startswith("---\n"):
        raise ValueError("Missing front matter")
    parts = text.split("\n---\n", 1)
    if len(parts) != 2:
        raise ValueError("Front matter terminator not found")
    raw = parts[0][4:]
    body = parts[1]
    lines = raw.splitlines()
    data: dict[str, Any] = {}
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        if re.match(r"^[A-Za-z0-9_]+:\s*$", line):
            key = line.split(":", 1)[0]
            items: list[str] = []
            i += 1
            while i < len(lines) and re.match(r"^\s*-\s+", lines[i]):
                items.append(re.sub(r"^\s*-\s+", "", lines[i]).strip())
                i += 1
            data[key] = items
            continue
        if ":" in line:
            key, raw_value = line.split(":", 1)
            key = key.strip()
            value = raw_value.strip()
            if value.startswith('"') and value.endswith('"') and len(value) >= 2:
                value = value[1:-1]
            elif key in BOOL_FIELDS:
                value = parse_bool(value)
            data[key] = value
        i += 1
    return data, body


def serialize_scalar(key: str, value: Any) -> str:
    if value is None:
        return f"{key}:"
    if key in BOOL_FIELDS:
        return f"{key}: {'true' if bool(value) else 'false'}"
    text = str(value)
    if text == "":
        return f"{key}:"
    if key in DATE_FIELDS:
        return f"{key}: {text}"
    if any(ch in text for ch in [":", '"']) or text.startswith("/") or text.startswith("#") or text != text.strip():
        escaped = text.replace('"', '\\"')
        return f'{key}: "{escaped}"'
    return f"{key}: {text}"


def dump_front_matter(data: dict[str, Any], body: str) -> str:
    keys = [k for k in PRIMARY_FIELDS if k in data] + [k for k in data.keys() if k not in PRIMARY_FIELDS]
    seen: set[str] = set()
    lines = ["---"]
    for key in keys:
        if key in seen:
            continue
        seen.add(key)
        value = data.get(key)
        if key in LIST_FIELDS:
            lines.append(f"{key}:")
            for item in value or []:
                lines.append(f"  - {item}")
        else:
            lines.append(serialize_scalar(key, value))
    lines.append("---")
    body_text = body if body.startswith("\n") else f"\n{body}" if body else "\n"
    return "\n".join(lines) + body_text


@dataclass
class ProjectFile:
    path: Path
    data: dict[str, Any]
    body: str

    def api_dict(self) -> dict[str, Any]:
        result = {k: self.data.get(k) for k in PRIMARY_FIELDS if k in self.data}
        for field in LIST_FIELDS:
            result[field] = list(self.data.get(field) or [])
        for field in BOOL_FIELDS:
            result[field] = bool(self.data.get(field, False))
        result["path"] = self.path.name
        result["filename"] = self.path.name
        return result


def load_project(path: Path) -> ProjectFile:
    data, body = parse_front_matter(path.read_text())
    for field in LIST_FIELDS:
        data.setdefault(field, [])
    for field in BOOL_FIELDS:
        data[field] = bool(data.get(field, False))
    return ProjectFile(path=path, data=data, body=body)


def load_projects() -> list[ProjectFile]:
    items = [load_project(path) for path in sorted(PROJECTS_DIR.glob("*.md"))]
    items.sort(key=lambda p: (str(p.data.get("title", "")).lower(), p.path.name.lower()))
    return items


def write_project(filename: str, payload: dict[str, Any]) -> None:
    path = PROJECTS_DIR / filename
    project = load_project(path)
    for field in PRIMARY_FIELDS:
        if field in payload:
            project.data[field] = payload[field]
    project.data["tags"] = list(dict.fromkeys((payload.get("tags") or [])))
    project.data["stack"] = list(dict.fromkeys((payload.get("stack") or [])))
    project.data["platforms"] = list(dict.fromkeys((payload.get("platforms") or [])))
    path.write_text(dump_front_matter(project.data, project.body))


class Handler(BaseHTTPRequestHandler):
    def _json(self, payload: Any, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _html(self, body: str, status: int = 200) -> None:
        encoded = body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/":
            self._html(HTML)
            return
        if parsed.path == "/api/projects":
            projects = [project.api_dict() for project in load_projects()]
            self._json({"projects": projects})
            return
        self._json({"error": "Not found"}, status=404)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length) or b"{}")
        except Exception:
            self._json({"error": "Invalid JSON"}, status=400)
            return

        if parsed.path == "/api/project":
            try:
                filename = payload.get("path") or payload.get("filename")
                if not filename:
                    raise ValueError("Missing project path")
                write_project(filename, payload)
                self._json({"ok": True})
            except Exception as exc:
                self._json({"error": str(exc)}, status=400)
            return

        if parsed.path == "/api/bulk-replace":
            field = payload.get("field")
            find = str(payload.get("find", "")).strip()
            replace = str(payload.get("replace", "")).strip()
            if field not in LIST_FIELDS:
                self._json({"error": "Campo non supportato"}, status=400)
                return
            if not find or not replace:
                self._json({"error": "Valori mancanti"}, status=400)
                return
            changed = 0
            for project in load_projects():
                values = project.data.get(field) or []
                if find not in values:
                    continue
                project.data[field] = [replace if item == find else item for item in values]
                project.data[field] = list(dict.fromkeys(project.data[field]))
                project.path.write_text(dump_front_matter(project.data, project.body))
                changed += 1
            self._json({"ok": True, "changed": changed})
            return

        if parsed.path == "/api/bulk-update-date":
            updated_at = str(payload.get("updated_at", "")).strip()
            paths = set(payload.get("paths") or [])
            if not re.match(r"^\d{4}-\d{2}-\d{2}$", updated_at):
                self._json({"error": "Data non valida"}, status=400)
                return
            changed = 0
            for project in load_projects():
                if project.path.name not in paths:
                    continue
                project.data["updated_at"] = updated_at
                project.path.write_text(dump_front_matter(project.data, project.body))
                changed += 1
            self._json({"ok": True, "changed": changed})
            return

        self._json({"error": "Not found"}, status=404)

    def log_message(self, format: str, *args: Any) -> None:
        return


if __name__ == "__main__":
    if not PROJECTS_DIR.exists():
        print(f"Missing directory: {PROJECTS_DIR}", file=sys.stderr)
        sys.exit(1)
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Projects Metadata Dashboard: http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping dashboard")
