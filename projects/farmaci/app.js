const DEFAULT_STORAGE_KEY = "farmaci_app_data_v2";
const STORAGE_KEY = resolveStorageKey(DEFAULT_STORAGE_KEY);
const BLOCK_ORDER = ["Mattina", "Pranzo", "Pomeriggio", "Sera", "Notte"];
const CATEGORY_VALUES = ["psicofarmaci", "pressione", "colesterolo", "altro"];
const ARCHIVE_RETENTION_DAYS = 180;
const IMPORT_KEY = `${STORAGE_KEY}_import_armadietto_2026_02_27`;
const PRE_IMPORT_BACKUP_KEY = `${STORAGE_KEY}_pre_import_backup_v1`;
const DIARY_PREVIOUS_DAY_UNTIL_HOUR = 5;
const DIARY_VIEW_MODE_KEY = `${STORAGE_KEY}_diary_view_mode`;
const THERAPY_VIEW_MODE_KEY = `${STORAGE_KEY}_therapy_view_mode`;
const CABINET_LAYOUT_MODE_KEY = `${STORAGE_KEY}_cabinet_layout_mode`;
const THERAPY_LAYOUT_MODE_KEY = `${STORAGE_KEY}_therapy_layout_mode`;
const DIARY_LAYOUT_MODE_KEY = `${STORAGE_KEY}_diary_layout_mode`;
const APP_VERSION = "v2.6.3";
const IMPORT_ITEMS = [
  { name: "VENLAFAXINA", dosage: "225 mg" },
  { name: "DEPAKIN", dosage: "500 mg" },
  { name: "RAMIPRIL", dosage: "225 mg" },
  { name: "ATORVASTATINA", dosage: "20 mg" },
  { name: "ACIDO FOLICO", dosage: "5 mg" },
  { name: "FENOFIBRATO", dosage: "145 mg" },
  { name: "TAVOR", dosage: "2,5 mg" },
  { name: "TRITTICO", dosage: "150 mg" },
  { name: "XANAX", dosage: "1 mg" }
];
const PAGE = document.body.dataset.page;
const state = loadState();
const today = getLocalIsoDate();

autoArchiveOldLogs();
importCabinetItemsOnce();
activateNav();
registerPwa();
renderVersionBadge();

if (PAGE === "armadietto") {
  initCabinetPage();
}
if (PAGE === "terapia") {
  initTherapyPage();
}
if (PAGE === "diario") {
  initDiaryPage();
}
if (PAGE === "home") {
  initHomePage();
}
if (PAGE === "todo") {
  initTodoPage();
}

function renderVersionBadge() {
  if (!document.body) return;
  if (document.querySelector(".app-version-badge")) return;
  const badge = document.createElement("div");
  badge.className = "app-version-badge";
  badge.textContent = APP_VERSION;
  document.body.append(badge);
}

function initCabinetPage() {
  const form = document.getElementById("cabinet-form");
  const list = document.getElementById("cabinet-list");
  const formWrap = document.getElementById("cabinet-form-wrap");
  const openFormBtn = document.getElementById("cabinet-open-form");
  const closeFormBtn = document.getElementById("cabinet-cancel-form");
  const categorySelect = document.getElementById("cab-category");
  const categoryOtherWrap = document.getElementById("cab-category-other-wrap");
  const categoryOtherInput = document.getElementById("cab-category-other");
  const viewModeSelect = document.getElementById("cabinet-view-mode");
  if (
    !form ||
    !list ||
    !formWrap ||
    !openFormBtn ||
    !closeFormBtn ||
    !categorySelect ||
    !categoryOtherWrap ||
    !categoryOtherInput
  ) {
    return;
  }

  let layoutMode = loadLayoutMode(CABINET_LAYOUT_MODE_KEY);
  if (!viewModeSelect) {
    layoutMode = "matrix";
    saveLayoutMode(CABINET_LAYOUT_MODE_KEY, layoutMode);
  }

  const renderCabinet = () => {
    renderCabinetList(list, layoutMode);
  };

  const setFormOpen = (isOpen) => {
    formWrap.classList.toggle("hidden", !isOpen);
    openFormBtn.textContent = isOpen ? "Chiudi nuovo medicinale" : "Nuovo Medicinale";
    if (!isOpen) {
      form.reset();
      toggleOtherCategoryField(categorySelect, categoryOtherWrap, categoryOtherInput);
    }
  };

  const setLayoutMode = (mode) => {
    layoutMode = normalizeLayoutMode(mode);
    saveLayoutMode(CABINET_LAYOUT_MODE_KEY, layoutMode);
    updateLayoutSelect(viewModeSelect, layoutMode);
    renderCabinet();
  };

  openFormBtn.addEventListener("click", () => {
    setFormOpen(formWrap.classList.contains("hidden"));
  });
  closeFormBtn.addEventListener("click", () => {
    setFormOpen(false);
  });

  if (viewModeSelect) {
    viewModeSelect.addEventListener("change", () => {
      setLayoutMode(viewModeSelect.value);
    });
  }

  categorySelect.addEventListener("change", () => {
    toggleOtherCategoryField(categorySelect, categoryOtherWrap, categoryOtherInput);
  });
  toggleOtherCategoryField(categorySelect, categoryOtherWrap, categoryOtherInput);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("cab-name").value.trim();
    const dosage = document.getElementById("cab-dose").value.trim();
    const quantity = Number(document.getElementById("cab-qty").value);
    const category = normalizeCategory(categorySelect.value);
    const categoryOther =
      category === "altro" ? categoryOtherInput.value.replace(/\s+/g, " ").trim() : "";

    if (
      !name ||
      !dosage ||
      !Number.isFinite(quantity) ||
      quantity < 1 ||
      (category === "altro" && !categoryOther)
    ) {
      return;
    }

    state.cabinet.push({
      id: createId(),
      name,
      dosage,
      quantity,
      category,
      categoryOther
    });

    form.reset();
    toggleOtherCategoryField(categorySelect, categoryOtherWrap, categoryOtherInput);
    setFormOpen(false);
    saveState();
    renderCabinet();
  });

  updateLayoutSelect(viewModeSelect, layoutMode);
  renderCabinet();
}

function renderCabinetList(listEl, layoutMode = "list") {
  const normalizedLayoutMode = normalizeLayoutMode(layoutMode);
  listEl.classList.toggle("layout-matrix", normalizedLayoutMode === "matrix");

  if (!state.cabinet.length) {
    listEl.innerHTML = '<div class="empty">Nessun medicinale inserito.</div>';
    return;
  }

  listEl.innerHTML = "";
  state.cabinet.forEach((med) => {
    const plannedCount = state.therapy.filter((entry) => entry.medId === med.id).length;
    const categoryTag = formatCategoryTag(med);
    const card = document.createElement("article");
    card.className = "item";
    card.innerHTML = `
      <div class="item-head">
        <div>
          <h3 class="item-title">${escapeHtml(med.name)}</h3>
          <p class="meta">${escapeHtml(med.dosage)}</p>
          <p class="meta">${plannedCount} voci in terapia</p>
          <div class="tag-row">
            <span class="tag tag-cat ${escapeHtml(categoryTag.className)}">${escapeHtml(categoryTag.label)}</span>
            <span class="tag">${med.quantity} disponibili</span>
          </div>
        </div>
      </div>
      <div class="actions">
        <button class="secondary btn-compact cabinet-edit-btn" type="button" data-edit="${med.id}">Modifica</button>
      </div>
      <div class="edit-area hidden" data-edit-area="${med.id}"></div>
    `;
    card.querySelector("[data-edit]").addEventListener("click", () => {
      const area = card.querySelector("[data-edit-area]");
      if (!area) return;
      if (!area.classList.contains("hidden")) {
        area.classList.add("hidden");
        area.innerHTML = "";
        return;
      }
      area.classList.remove("hidden");
      renderCabinetEditForm(area, med, listEl);
    });
    listEl.append(card);
  });
}

function initTherapyPage() {
  const form = document.getElementById("therapy-form");
  const list = document.getElementById("therapy-list");
  const filterWrap = document.getElementById("therapy-block-filters");
  const medSelect = document.getElementById("th-med");
  const formWrap = document.getElementById("therapy-form-wrap");
  const openFormBtn = document.getElementById("therapy-open-form");
  const closeFormBtn = document.getElementById("therapy-cancel-form");
  const printBtn = document.getElementById("therapy-print-btn");
  const layoutModeSelect = document.getElementById("therapy-layout-mode");
  const viewModeSelect = document.getElementById("therapy-view-mode");
  if (
    !form ||
    !list ||
    !filterWrap ||
    !medSelect ||
    !formWrap ||
    !openFormBtn ||
    !closeFormBtn
  ) {
    return;
  }

  const uiState = {
    activeBlock: "all",
    layoutMode: loadLayoutMode(THERAPY_LAYOUT_MODE_KEY),
    viewMode: loadTherapyViewMode()
  };

  if (!layoutModeSelect) {
    uiState.layoutMode = "list";
    saveLayoutMode(THERAPY_LAYOUT_MODE_KEY, uiState.layoutMode);
  }

  if (!viewModeSelect) {
    uiState.viewMode = "list";
    saveTherapyViewMode(uiState.viewMode);
  }

  const renderTherapy = () => {
    renderTherapyPage({
      listEl: list,
      filterWrapEl: filterWrap,
      medSelectEl: medSelect,
      uiState,
      onRerender: renderTherapy
    });
  };

  const setFormOpen = (isOpen) => {
    formWrap.classList.toggle("hidden", !isOpen);
    openFormBtn.textContent = isOpen ? "Chiudi aggiunta terapia" : "Aggiungi Terapia";
    if (!isOpen) form.reset();
  };

  const setLayoutMode = (mode) => {
    uiState.layoutMode = normalizeLayoutMode(mode);
    saveLayoutMode(THERAPY_LAYOUT_MODE_KEY, uiState.layoutMode);
    updateLayoutSelect(layoutModeSelect, uiState.layoutMode);
    renderTherapy();
  };

  const setViewMode = (mode) => {
    uiState.viewMode = normalizeTherapyViewMode(mode);
    saveTherapyViewMode(uiState.viewMode);
    updateTherapyViewSelect(viewModeSelect, uiState.viewMode);
    renderTherapy();
  };

  openFormBtn.addEventListener("click", () => {
    setFormOpen(formWrap.classList.contains("hidden"));
  });
  closeFormBtn.addEventListener("click", () => {
    setFormOpen(false);
  });

  if (layoutModeSelect) {
    layoutModeSelect.addEventListener("change", () => {
      setLayoutMode(layoutModeSelect.value);
    });
  }

  if (viewModeSelect) {
    viewModeSelect.addEventListener("change", () => {
      setViewMode(viewModeSelect.value);
    });
  }

  if (printBtn) {
    printBtn.addEventListener("click", () => {
      printTherapyPlanPdf();
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const medId = medSelect.value;
    const block = document.getElementById("th-block").value;
    const time = document.getElementById("th-time").value.trim();
    const quantity = Number(document.getElementById("th-dose").value);

    if (!medId || !block || !Number.isFinite(quantity) || quantity < 1) return;

    state.therapy.push({
      id: createId(),
      medId,
      block,
      time,
      quantity,
      takenLog: {}
    });

    form.reset();
    document.getElementById("th-dose").value = "1";
    setFormOpen(false);
    saveState();
    renderTherapy();
  });

  updateLayoutSelect(layoutModeSelect, uiState.layoutMode);
  updateTherapyViewSelect(viewModeSelect, uiState.viewMode);
  renderTherapy();
}

function renderTherapyPage({ listEl, filterWrapEl, medSelectEl, uiState, onRerender }) {
  const layoutMode = normalizeLayoutMode(uiState.layoutMode);
  const viewMode = normalizeTherapyViewMode(uiState.viewMode);
  listEl.classList.toggle("layout-matrix", layoutMode === "matrix");
  listEl.classList.toggle("therapy-list-mode", viewMode === "list");

  populateMedicineSelect(medSelectEl);
  if (!state.cabinet.length) {
    filterWrapEl.innerHTML = "";
    listEl.innerHTML =
      '<div class="empty">Aggiungi prima almeno un farmaco nell\'armadietto.</div>';
    return;
  }

  const sorted = getSortedTherapy()
    .map((entry) => ({
      entry,
      med: state.cabinet.find((item) => item.id === entry.medId)
    }))
    .filter((item) => item.med);

  if (!sorted.length) {
    filterWrapEl.innerHTML = "";
    listEl.innerHTML = '<div class="empty">Nessuna terapia pianificata.</div>';
    return;
  }

  const grouped = new Map();
  sorted.forEach((item) => {
    const key = item.entry.block;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  });

  const activeBlocks = [
    ...BLOCK_ORDER.filter((block) => grouped.has(block)),
    ...Array.from(grouped.keys()).filter((block) => !BLOCK_ORDER.includes(block)).sort()
  ];

  if (uiState.activeBlock !== "all" && !activeBlocks.includes(uiState.activeBlock)) {
    uiState.activeBlock = "all";
  }

  if (viewMode === "list") {
    filterWrapEl.innerHTML = "";
    uiState.activeBlock = "all";
    renderTherapyListView({ listEl, sorted, onRerender });
    return;
  }

  filterWrapEl.innerHTML = "";
  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.className = "therapy-filter-chip " + (uiState.activeBlock === "all" ? "active" : "");
  allButton.textContent = "Tutte (" + sorted.length + ")";
  allButton.addEventListener("click", () => {
    uiState.activeBlock = "all";
    onRerender();
  });
  filterWrapEl.append(allButton);

  activeBlocks.forEach((block) => {
    const blockButton = document.createElement("button");
    blockButton.type = "button";
    blockButton.className = "therapy-filter-chip " + (uiState.activeBlock === block ? "active" : "");
    blockButton.textContent = block + " (" + ((grouped.get(block) || []).length) + ")";
    blockButton.addEventListener("click", () => {
      uiState.activeBlock = block;
      onRerender();
    });
    filterWrapEl.append(blockButton);
  });

  const visibleBlocks =
    uiState.activeBlock === "all" ? activeBlocks : [uiState.activeBlock].filter(Boolean);

  listEl.innerHTML = "";
  visibleBlocks.forEach((block) => {
    const blockItems = grouped.get(block) || [];
    const card = document.createElement("article");
    card.className = "item therapy-block block-" + blockToClassName(block);
    card.innerHTML =
      '<div class="therapy-block-head">' +
      '<h3 class="item-title">' + escapeHtml(block) + '</h3>' +
      '<span class="tag">' + blockItems.length + ' attivi</span>' +
      '</div>' +
      '<div class="therapy-block-list"></div>';

    const listInside = card.querySelector(".therapy-block-list");

    blockItems.forEach(({ entry, med }) => {
      const categoryTag = formatCategoryTag(med);
      const row = document.createElement("div");
      row.className = "therapy-entry";
      row.innerHTML =
        '<div>' +
        '<h4 class="item-title">' + escapeHtml(med.name) + '</h4>' +
        '<p class="meta">' + escapeHtml(med.dosage) + ' • ' + entry.quantity + ' unità</p>' +
        (entry.time ? ('<p class="meta">' + formatTime(entry.time) + '</p>') : '') +
        '<div class="tag-row">' +
        '<span class="tag tag-cat ' + escapeHtml(categoryTag.className) + '">' + escapeHtml(categoryTag.label) + '</span>' +
        '</div>' +
        '</div>' +
        '<div class="actions therapy-actions">' +
        '<button class="secondary btn-compact" type="button" data-edit="' + entry.id + '">Modifica</button>' +
        '</div>' +
        '<div class="edit-area hidden" data-edit-area="' + entry.id + '"></div>';

      row.querySelector("[data-edit]").addEventListener("click", () => {
        const area = row.querySelector("[data-edit-area]");
        if (!area) return;
        if (!area.classList.contains("hidden")) {
          area.classList.add("hidden");
          area.innerHTML = "";
          return;
        }
        area.classList.remove("hidden");
        renderTherapyEditForm(area, entry, onRerender);
      });

      listInside.append(row);
    });

    listEl.append(card);
  });
}

function renderTherapyListView({ listEl, sorted, onRerender }) {
  listEl.innerHTML = "";

  sorted.forEach(({ entry, med }) => {
    const categoryTag = formatCategoryTag(med);
    const row = document.createElement("article");
    row.className = "item therapy-flat-item block-" + blockToClassName(entry.block);
    row.innerHTML =
      '<div class="therapy-flat-main">' +
      '<div class="therapy-flat-top">' +
      '<span class="tag">' + escapeHtml(entry.block) + '</span>' +
      (entry.time ? ('<span class="tag">' + escapeHtml(formatTime(entry.time)) + '</span>') : '') +
      '</div>' +
      '<h3 class="item-title">' + escapeHtml(med.name) + '</h3>' +
      '<p class="meta">' + escapeHtml(med.dosage) + ' • ' + entry.quantity + ' unità</p>' +
      '<div class="tag-row">' +
      '<span class="tag tag-cat ' + escapeHtml(categoryTag.className) + '">' + escapeHtml(categoryTag.label) + '</span>' +
      '</div>' +
      '</div>' +
      '<div class="actions therapy-actions">' +
      '<button class="secondary btn-compact" type="button" data-edit="' + entry.id + '">Modifica</button>' +
      '</div>' +
      '<div class="edit-area hidden" data-edit-area="' + entry.id + '"></div>';

    row.querySelector("[data-edit]").addEventListener("click", () => {
      const area = row.querySelector("[data-edit-area]");
      if (!area) return;
      if (!area.classList.contains("hidden")) {
        area.classList.add("hidden");
        area.innerHTML = "";
        return;
      }
      area.classList.remove("hidden");
      renderTherapyEditForm(area, entry, onRerender);
    });

    listEl.append(row);
  });
}

function printTherapyPlanPdf() {
  const rows = getSortedTherapy()
    .map((entry) => ({
      entry,
      med: state.cabinet.find((item) => item.id === entry.medId)
    }))
    .filter((item) => item.med);

  if (!rows.length) {
    alert("Nessuna terapia da stampare.");
    return;
  }

  const grouped = new Map();
  rows.forEach((item) => {
    const key = item.entry.block || "Altro";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  });

  const orderedBlocks = [
    ...BLOCK_ORDER.filter((blockName) => grouped.has(blockName)),
    ...Array.from(grouped.keys()).filter((blockName) => !BLOCK_ORDER.includes(blockName)).sort()
  ];

  let tableRows = "";
  orderedBlocks.forEach((blockName) => {
    const blockItems = grouped.get(blockName) || [];
    tableRows += `
      <tr class="print-block-row">
        <td colspan="5">${escapeHtml(blockName)} (${blockItems.length})</td>
      </tr>
    `;
    blockItems.forEach(({ entry, med }) => {
      const category = formatCategoryTag(med).label;
      tableRows += `
        <tr>
          <td>${escapeHtml(med.name)}</td>
          <td>${escapeHtml(med.dosage)}</td>
          <td>${entry.quantity}</td>
          <td>${entry.time ? escapeHtml(formatTime(entry.time)) : "-"}</td>
          <td>${escapeHtml(category)}</td>
        </tr>
      `;
    });
  });

  const generatedLabel = new Date().toLocaleString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const html = `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <title>Piano terapia</title>
  <style>
    @page { size: A4; margin: 11mm; }
    body { font-family: Arial, sans-serif; color: #111; margin: 0; font-size: 12px; }
    h1 { margin: 0 0 4px; font-size: 20px; }
    .meta { margin: 0 0 10px; color: #444; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td { border: 1px solid #c9c9c9; padding: 6px 7px; vertical-align: top; word-wrap: break-word; }
    th { background: #f1f1f1; text-align: left; }
    .print-block-row td { background: #e8ecef; font-weight: 700; }
    .small { font-size: 10px; color: #555; margin-top: 8px; }
  </style>
</head>
<body>
  <h1>Piano Terapia</h1>
  <p class="meta">Generato il ${escapeHtml(generatedLabel)} · Totale assunzioni giornaliere: ${rows.length}</p>
  <table>
    <thead>
      <tr>
        <th style="width:33%">Farmaco</th>
        <th style="width:16%">Dosaggio</th>
        <th style="width:12%">Unità</th>
        <th style="width:16%">Orario</th>
        <th style="width:23%">Categoria</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
  <p class="small">Per creare il PDF scegli “Salva come PDF” nella finestra di stampa.</p>
</body>
</html>`;

const printFrame = document.createElement("iframe");
printFrame.style.position = "fixed";
printFrame.style.width = "0";
printFrame.style.height = "0";
printFrame.style.opacity = "0";
printFrame.style.pointerEvents = "none";
printFrame.style.border = "0";
printFrame.setAttribute("aria-hidden", "true");
document.body.append(printFrame);

const frameDoc = printFrame.contentDocument;
const frameWin = printFrame.contentWindow;
if (!frameDoc || !frameWin) {
  printFrame.remove();
  alert("Stampa non disponibile su questo dispositivo.");
  return;
}

const cleanup = () => {
  setTimeout(() => {
    try {
      printFrame.remove();
    } catch {
      // Ignore cleanup errors.
    }
  }, 600);
};

const runPrint = () => {
  try {
    frameWin.focus();
    frameWin.print();
    setTimeout(cleanup, 1200);
  } catch {
    cleanup();
    alert("Impossibile avviare la stampa. Riprova.");
  }
};

frameDoc.open();
frameDoc.write(html);
frameDoc.close();

if (frameDoc.readyState === "complete") {
  setTimeout(runPrint, 160);
} else {
  printFrame.addEventListener("load", () => setTimeout(runPrint, 160), { once: true });
}
}


function initHomePage() {
  const versionEl = document.getElementById("home-app-version");
  const exportBtn = document.getElementById("home-export-backup-btn");
  const importBtn = document.getElementById("home-import-backup-btn");
  const importInput = document.getElementById("home-import-backup-input");
  const resetArchiveBtn = document.getElementById("home-reset-archive-btn");
  const settingsToggleBtn = document.getElementById("home-settings-toggle-btn");
  const settingsBody = document.getElementById("home-settings-body");

  if (versionEl) {
    versionEl.textContent = "Versione app: " + APP_VERSION;
  }

  if (settingsToggleBtn && settingsBody) {
    settingsToggleBtn.addEventListener("click", () => {
      const willOpen = settingsBody.classList.contains("hidden");
      settingsBody.classList.toggle("hidden", !willOpen);
      settingsToggleBtn.setAttribute("aria-expanded", String(willOpen));
      settingsToggleBtn.textContent = willOpen ? "-" : "+";
      settingsToggleBtn.title = willOpen ? "Chiudi impostazioni" : "Apri impostazioni";
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      exportBackupJson();
    });
  }

  if (importBtn && importInput) {
    importBtn.addEventListener("click", () => {
      importInput.click();
    });

    importInput.addEventListener("change", async () => {
      const file = importInput.files?.[0];
      importInput.value = "";
      if (!file) return;
      try {
        const result = await importBackupJson(file);
        if (!result.applied) return;
        alert(
          "Import completato: " +
            result.medicines +
            " farmaci, " +
            result.therapy +
            " terapie, " +
            result.notes +
            " appunti, " +
            result.archiveDays +
            " giorni archiviati."
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Import non riuscito.";
        alert(message);
      }
    });
  }

  if (resetArchiveBtn) {
    resetArchiveBtn.addEventListener("click", () => {
      const result = resetArchiveDaily();
      if (!result.changed) {
        if (result.message) alert(result.message);
        return;
      }
      alert("Archivi storici azzerati: " + result.removedDays + " giorni rimossi.");
    });
  }
}

function initTodoPage() {
  const todoForm = document.getElementById("todo-form");
  const todoTextInput = document.getElementById("todo-text");
  const todoPinModeSelect = document.getElementById("todo-pin-mode");
  const todoListEl = document.getElementById("todo-list");

  if (!todoForm || !todoTextInput || !todoPinModeSelect || !todoListEl) {
    return;
  }

  const renderTodoList = () => {
    const notes = getSortedTodoNotes();
    if (!notes.length) {
      todoListEl.innerHTML = '<div class="empty">Nessun appunto. Aggiungi il primo post-it.</div>';
      return;
    }

    todoListEl.innerHTML = "";
    notes.forEach((todo) => {
      const card = document.createElement("article");
      const updatedLabel = new Date(todo.updatedAt || todo.createdAt || Date.now()).toLocaleDateString(
        "it-IT",
        { day: "2-digit", month: "2-digit", year: "numeric" }
      );
      card.className = ["home-note", todo.pinned ? "is-pinned" : "", todo.done ? "is-done" : ""]
        .filter(Boolean)
        .join(" ");
      card.innerHTML =
        '<div class="home-note-head">' +
        '<span class="home-note-date">' +
        updatedLabel +
        "</span>" +
        (todo.pinned ? '<span class="tag">Pinnato</span>' : "") +
        "</div>" +
        '<p class="home-note-text">' +
        escapeHtml(todo.text) +
        "</p>" +
        '<div class="actions home-note-actions">' +
        '<button type="button" class="secondary btn-compact" data-pin-note="' +
        todo.id +
        '">' +
        (todo.pinned ? "Sblocca" : "Pin") +
        "</button>" +
        '<button type="button" class="secondary btn-compact" data-done-note="' +
        todo.id +
        '">' +
        (todo.done ? "Da fare" : "Fatto") +
        "</button>" +
        '<button type="button" class="delete-soft btn-compact" data-remove-note="' +
        todo.id +
        '">Rimuovi</button>' +
        "</div>";

      const pinBtn = card.querySelector("[data-pin-note]");
      if (pinBtn) {
        pinBtn.addEventListener("click", () => {
          todo.pinned = !todo.pinned;
          todo.updatedAt = Date.now();
          saveState();
          renderTodoList();
        });
      }

      const doneBtn = card.querySelector("[data-done-note]");
      if (doneBtn) {
        doneBtn.addEventListener("click", () => {
          todo.done = !todo.done;
          todo.updatedAt = Date.now();
          saveState();
          renderTodoList();
        });
      }

      const removeBtn = card.querySelector("[data-remove-note]");
      if (removeBtn) {
        removeBtn.addEventListener("click", () => {
          state.todos = state.todos.filter((item) => item.id !== todo.id);
          saveState();
          renderTodoList();
        });
      }

      todoListEl.append(card);
    });
  };

  todoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = String(todoTextInput.value || "")
      .replace(/\r\n?/g, "\n")
      .trim();
    if (!text) return;

    if (!Array.isArray(state.todos)) state.todos = [];
    const now = Date.now();
    state.todos.push({
      id: createId(),
      text,
      pinned: todoPinModeSelect.value === "pinned",
      done: false,
      createdAt: now,
      updatedAt: now
    });
    saveState();

    todoForm.reset();
    todoPinModeSelect.value = "normal";
    renderTodoList();
  });

  renderTodoList();
}

function getLastDaysStats(days, dailyStats) {
  const stats = [];
  const base = new Date();
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(base);
    date.setDate(base.getDate() - offset);
    const key = getLocalIsoDate(date);
    const day = dailyStats[key] || { yes: 0, total: 0 };
    stats.push({ date: key, yes: toNonNegativeInt(day.yes), total: toNonNegativeInt(day.total) });
  }
  return stats;
}

function renderHomeMonthCalendar({
  calendarEl,
  monthLabelEl,
  visibleYear,
  visibleMonth,
  dailyStats,
  todayDate = today
}) {
  if (!calendarEl || !monthLabelEl) {
    return { greenDays: 0, yellowDays: 0, redDays: 0, trackedDays: 0 };
  }

  const monthName = new Date(visibleYear, visibleMonth, 1).toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric"
  });
  monthLabelEl.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const firstDay = new Date(visibleYear, visibleMonth, 1);
  const daysInMonth = new Date(visibleYear, visibleMonth + 1, 0).getDate();
  const firstWeekdayMondayBased = (firstDay.getDay() + 6) % 7;

  calendarEl.innerHTML = "";

  for (let i = 0; i < firstWeekdayMondayBased; i += 1) {
    const spacer = document.createElement("div");
    spacer.className = "home-month-day empty";
    calendarEl.append(spacer);
  }

  let greenDays = 0;
  let yellowDays = 0;
  let redDays = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateIso = toIsoDate(visibleYear, visibleMonth, day);
    const stats = dailyStats[dateIso] || { yes: 0, total: 0 };

    const cell = document.createElement("div");
    cell.className = "home-month-day";

    if (dateIso === todayDate) {
      cell.classList.add("today");
    }

    if (stats.total > 0) {
      if (stats.yes === stats.total) {
        cell.classList.add("good");
        greenDays += 1;
      } else if (stats.yes > 0) {
        cell.classList.add("warn");
        yellowDays += 1;
      } else {
        cell.classList.add("bad");
        redDays += 1;
      }
    } else {
      cell.classList.add("no-data");
    }

    cell.innerHTML = `
      <span class="home-month-day-num">${day}</span>
      <span class="home-month-day-meta">${stats.total > 0 ? `${stats.yes}/${stats.total}` : "-"}</span>
    `;

    const titleText = stats.total > 0 ? `${stats.yes}/${stats.total}` : "nessun dato";
    cell.title = `${formatDateLong(dateIso)}: ${titleText}`;
    calendarEl.append(cell);
  }

  const trackedDays = greenDays + yellowDays + redDays;
  return { greenDays, yellowDays, redDays, trackedDays };
}

function initDiaryPage() {
  const list = document.getElementById("diary-list");
  const summary = document.getElementById("daily-summary");
  const calendarEl = document.getElementById("diary-calendar");
  const calendarWrap = document.getElementById("calendar-wrap");
  const monthLabelEl = document.getElementById("calendar-month-label");
  const prevBtn = document.getElementById("calendar-prev");
  const nextBtn = document.getElementById("calendar-next");
  const toggleCalendarBtn = document.getElementById("toggle-calendar-btn");
  const viewModeSelect = document.getElementById("diary-view-mode");
  const layoutModeSelect = document.getElementById("diary-layout-mode");

  if (
    !list ||
    !summary ||
    !calendarEl ||
    !calendarWrap ||
    !monthLabelEl ||
    !prevBtn ||
    !nextBtn ||
    !toggleCalendarBtn
  ) {
    return;
  }

  const diaryToday = getDiaryReferenceIsoDate();
  let selectedDate = diaryToday;
  let visibleYear = Number(diaryToday.slice(0, 4));
  let visibleMonth = Number(diaryToday.slice(5, 7)) - 1;
  let diaryViewMode = loadDiaryViewMode();
  let diaryLayoutMode = loadLayoutMode(DIARY_LAYOUT_MODE_KEY);

  if (!viewModeSelect) {
    diaryViewMode = "standard";
    saveDiaryViewMode(diaryViewMode);
  }
  if (!layoutModeSelect) {
    diaryLayoutMode = "list";
    saveLayoutMode(DIARY_LAYOUT_MODE_KEY, diaryLayoutMode);
  }

  const setCalendarOpen = (isOpen) => {
    calendarWrap.classList.toggle("hidden", !isOpen);
    toggleCalendarBtn.textContent = isOpen ? "Chiudi calendario" : "Apri calendario";
    toggleCalendarBtn.setAttribute("aria-expanded", String(isOpen));
  };

  const setDiaryViewMode = (mode) => {
    diaryViewMode = normalizeDiaryViewMode(mode);
    saveDiaryViewMode(diaryViewMode);
    updateDiaryViewSelect(viewModeSelect, diaryViewMode);
    renderAll();
  };

  const setDiaryLayoutMode = (mode) => {
    diaryLayoutMode = normalizeLayoutMode(mode);
    saveLayoutMode(DIARY_LAYOUT_MODE_KEY, diaryLayoutMode);
    updateLayoutSelect(layoutModeSelect, diaryLayoutMode);
    renderAll();
  };

  const renderAll = () => {
    const items = getDiaryItems();
    renderDiaryCalendar({
      calendarEl,
      monthLabelEl,
      selectedDate,
      visibleYear,
      visibleMonth,
      items,
      onSelectDate: (date) => {
        selectedDate = date;
        const parts = parseIsoDate(date);
        visibleYear = parts.year;
        visibleMonth = parts.month;
        renderAll();
      },
      todayDate: diaryToday
    });
    renderDiary(list, summary, {
      selectedDate,
      items,
      viewMode: diaryViewMode,
      layoutMode: diaryLayoutMode,
      onToggleTaken: renderAll
    });
  };

  toggleCalendarBtn.addEventListener("click", () => {
    setCalendarOpen(calendarWrap.classList.contains("hidden"));
  });

  prevBtn.addEventListener("click", () => {
    visibleMonth -= 1;
    if (visibleMonth < 0) {
      visibleMonth = 11;
      visibleYear -= 1;
    }
    renderAll();
  });

  nextBtn.addEventListener("click", () => {
    visibleMonth += 1;
    if (visibleMonth > 11) {
      visibleMonth = 0;
      visibleYear += 1;
    }
    renderAll();
  });

  if (viewModeSelect) {
    viewModeSelect.addEventListener("change", () => {
      setDiaryViewMode(viewModeSelect.value);
    });
  }
  if (layoutModeSelect) {
    layoutModeSelect.addEventListener("change", () => {
      setDiaryLayoutMode(layoutModeSelect.value);
    });
  }

  updateDiaryViewSelect(viewModeSelect, diaryViewMode);
  updateLayoutSelect(layoutModeSelect, diaryLayoutMode);
  setCalendarOpen(false);
  renderAll();
}

function renderDiary(listEl, summaryEl, filters) {
  const { selectedDate, items, onToggleTaken } = filters;
  const viewMode = normalizeDiaryViewMode(filters.viewMode);
  const layoutMode = normalizeLayoutMode(filters.layoutMode);
  const sorted = Array.isArray(items) ? items : getDiaryItems();

  listEl.classList.toggle("checklist-mode", viewMode === "checklist");
  listEl.classList.toggle("layout-matrix", layoutMode === "matrix");

  if (!sorted.length) {
    listEl.innerHTML = '<div class="empty">Nessuna terapia da registrare.</div>';
    summaryEl.textContent = formatDateLong(selectedDate);
    return;
  }

  if (viewMode === "checklist") {
    renderDiaryChecklist(listEl, { selectedDate, sorted, onToggleTaken });
    summaryEl.textContent = formatDateLong(selectedDate);
    return;
  }

  listEl.innerHTML = "";

  const grouped = new Map();
  sorted.forEach((item) => {
    const key = item.entry.block;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  });
  const orderedBlocks = [
    ...BLOCK_ORDER.filter((blockName) => grouped.has(blockName)),
    ...Array.from(grouped.keys()).filter((blockName) => !BLOCK_ORDER.includes(blockName)).sort()
  ];

  orderedBlocks.forEach((blockName) => {
    const blockItems = grouped.get(blockName) || [];
    const card = document.createElement("article");
    card.className = `item therapy-block block-${blockToClassName(blockName)}`;
    card.innerHTML = `
      <div class="therapy-block-head">
        <h3 class="item-title">${escapeHtml(blockName)}</h3>
        <span class="tag">${blockItems.length} voci</span>
      </div>
      <div class="therapy-block-list"></div>
    `;
    const listInside = card.querySelector(".therapy-block-list");

    blockItems.forEach(({ entry, med }) => {
      const status = entry.takenLog?.[selectedDate] || "";
      const isTaken = status === "yes";
      const summaryLine = [
        formatCategoryTag(med).label,
        entry.time ? formatTime(entry.time) : "",
        `${entry.quantity} unità`,
        med.dosage
      ]
        .filter(Boolean)
        .join(" • ");

      const row = document.createElement("div");
      row.className = `therapy-entry diary-entry ${isTaken ? "is-taken" : ""}`.trim();
      row.innerHTML = `
        <div>
          <h4 class="item-title">${escapeHtml(med.name)}</h4>
          <p class="meta diary-summary-lines">${escapeHtml(summaryLine)}</p>
        </div>
        <div class="status">
          <button
            type="button"
            data-toggle-taken="${entry.id}"
            class="diary-taken-btn ${isTaken ? "state-taken" : "state-pending"}"
            aria-pressed="${isTaken ? "true" : "false"}"
          >
            ${isTaken ? "Assunto" : "Da assumere"}
          </button>
        </div>
      `;
      row.querySelector("[data-toggle-taken]").addEventListener("click", () => {
        setTakenStatus(entry.id, selectedDate, isTaken ? "" : "yes");
        if (typeof onToggleTaken === "function") {
          onToggleTaken();
          return;
        }
        renderDiary(listEl, summaryEl, filters);
      });
      listInside.append(row);
    });
    listEl.append(card);
  });

  summaryEl.textContent = formatDateLong(selectedDate);
}

function renderDiaryChecklist(listEl, options) {
  const { selectedDate, sorted, onToggleTaken } = options;

  listEl.innerHTML = "";

  const grouped = new Map();
  sorted.forEach((item) => {
    const key = item.entry.block;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  });
  const orderedBlocks = [
    ...BLOCK_ORDER.filter((blockName) => grouped.has(blockName)),
    ...Array.from(grouped.keys()).filter((blockName) => !BLOCK_ORDER.includes(blockName)).sort()
  ];

  orderedBlocks.forEach((blockName) => {
    const blockItems = grouped.get(blockName) || [];
    const card = document.createElement("article");
    card.className = `item therapy-block checklist-card block-${blockToClassName(blockName)}`;
    card.innerHTML = `
      <div class="therapy-block-head">
        <h3 class="item-title">${escapeHtml(blockName)}</h3>
        <span class="tag">${blockItems.length}</span>
      </div>
      <div class="checklist-list"></div>
    `;

    const listInside = card.querySelector(".checklist-list");
    blockItems.forEach(({ entry, med }) => {
      const isTaken = (entry.takenLog?.[selectedDate] || "") === "yes";
      const detailLine = [med.dosage, `${entry.quantity} unità`, entry.time ? formatTime(entry.time) : ""]
        .filter(Boolean)
        .join(" • ");

      const row = document.createElement("label");
      row.className = `checklist-item ${isTaken ? "done" : ""}`;
      row.innerHTML = `
        <span class="checklist-main">
          <span class="checklist-name">${escapeHtml(med.name)}</span>
          ${isTaken ? "" : `<span class="checklist-note">${escapeHtml(detailLine)}</span>`}
        </span>
        <input
          type="checkbox"
          data-check-taken="${entry.id}"
          ${isTaken ? "checked" : ""}
          aria-label="Segna ${escapeHtml(med.name)} come assunto"
        />
      `;

      row.querySelector("[data-check-taken]").addEventListener("change", (event) => {
        const nextStatus = event.target.checked ? "yes" : "";
        setTakenStatus(entry.id, selectedDate, nextStatus);
        if (typeof onToggleTaken === "function") {
          onToggleTaken();
        }
      });

      listInside.append(row);
    });

    listEl.append(card);
  });
}

function renderDiaryCalendar({
  calendarEl,
  monthLabelEl,
  selectedDate,
  visibleYear,
  visibleMonth,
  items,
  onSelectDate,
  todayDate = today
}) {
  const monthName = new Date(visibleYear, visibleMonth, 1).toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric"
  });
  monthLabelEl.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const dailyStats = getDiaryDailyStats(items);
  const firstDay = new Date(visibleYear, visibleMonth, 1);
  const daysInMonth = new Date(visibleYear, visibleMonth + 1, 0).getDate();
  const firstWeekdayMondayBased = (firstDay.getDay() + 6) % 7;

  calendarEl.innerHTML = "";
  for (let i = 0; i < firstWeekdayMondayBased; i += 1) {
    const spacer = document.createElement("div");
    spacer.className = "calendar-day empty-day";
    calendarEl.append(spacer);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateIso = toIsoDate(visibleYear, visibleMonth, day);
    const stats = dailyStats[dateIso] || { yes: 0, total: 0 };
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    if (dateIso === selectedDate) button.classList.add("selected");
    if (dateIso === todayDate) button.classList.add("today");
    if (stats.total > 0) {
      if (stats.yes === stats.total) {
        button.classList.add("done");
      } else if (stats.yes > 0) {
        button.classList.add("partial");
      } else {
        button.classList.add("missed");
      }
    }
    button.innerHTML = `
      <span class="day-num">${day}</span>
      <span class="day-meta">${stats.total > 0 ? `${stats.yes}/${stats.total}` : "—"}</span>
    `;
    button.addEventListener("click", () => {
      onSelectDate(dateIso);
    });
    calendarEl.append(button);
  }
}

function getDiaryItems() {
  return getSortedTherapy()
    .map((entry) => ({
      entry,
      med: state.cabinet.find((item) => item.id === entry.medId)
    }))
    .filter((item) => item.med);
}

function getDiaryDailyStats(items) {
  const stats = {};
  const archiveDaily = state.archive?.daily || {};
  Object.entries(archiveDaily).forEach(([dateKey, value]) => {
    if (!isIsoDateKey(dateKey)) return;
    const yes = Number(value?.yes) > 0 ? Number(value.yes) : 0;
    const total = Number(value?.total) > 0 ? Number(value.total) : 0;
    stats[dateKey] = { yes, total };
  });

  items.forEach(({ entry }) => {
    const log = entry.takenLog && typeof entry.takenLog === "object" ? entry.takenLog : {};
    Object.entries(log).forEach(([dateKey, status]) => {
      if (!isIsoDateKey(dateKey)) return;
      if (!stats[dateKey]) stats[dateKey] = { yes: 0, total: 0 };
      if (status === "yes") {
        stats[dateKey].yes += 1;
        stats[dateKey].total += 1;
      } else if (status === "no") {
        stats[dateKey].total += 1;
      }
    });
  });

  return stats;
}

function setTakenStatus(entryId, date, nextStatus) {
  const entry = state.therapy.find((item) => item.id === entryId);
  if (!entry) return;

  const prevStatus = entry.takenLog?.[date] || "";
  if (prevStatus === nextStatus) return;

  const med = state.cabinet.find((item) => item.id === entry.medId);
  if (med) {
    if (prevStatus !== "yes" && nextStatus === "yes") {
      med.quantity = Math.max(0, med.quantity - entry.quantity);
    }
    if (prevStatus === "yes" && nextStatus !== "yes") {
      med.quantity += entry.quantity;
    }
  }

  if (!entry.takenLog || typeof entry.takenLog !== "object") {
    entry.takenLog = {};
  }

  if (nextStatus === "yes" || nextStatus === "no") {
    entry.takenLog[date] = nextStatus;
  } else {
    delete entry.takenLog[date];
  }

  saveState();
}

function populateMedicineSelect(selectEl) {
  const selected = selectEl.value;
  selectEl.innerHTML = '<option value="">Seleziona dall\'armadietto</option>';
  state.cabinet.forEach((med) => {
    const option = document.createElement("option");
    option.value = med.id;
    option.textContent = `${med.name} (${med.dosage}) - ${formatCategory(med)}`;
    selectEl.append(option);
  });
  selectEl.value = state.cabinet.some((med) => med.id === selected) ? selected : "";
}

function getSortedTherapy() {
  return [...state.therapy].sort((a, b) => {
    const blockA = BLOCK_ORDER.includes(a.block) ? BLOCK_ORDER.indexOf(a.block) : 99;
    const blockB = BLOCK_ORDER.includes(b.block) ? BLOCK_ORDER.indexOf(b.block) : 99;
    if (blockA !== blockB) return blockA - blockB;
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });
}

function getSortedTodoNotes() {
  const todos = Array.isArray(state.todos) ? state.todos : [];
  return [...todos].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    const updatedA = toEpochMillis(a.updatedAt || a.createdAt || 0);
    const updatedB = toEpochMillis(b.updatedAt || b.createdAt || 0);
    if (updatedA !== updatedB) return updatedB - updatedA;
    return String(a.id).localeCompare(String(b.id));
  });
}

function loadState() {
  try {
    const legacyRaw =
      STORAGE_KEY === DEFAULT_STORAGE_KEY ? localStorage.getItem("farmaci_app_data_v1") : "";
    const raw = localStorage.getItem(STORAGE_KEY) || legacyRaw;
    if (!raw) return createEmptyState();
    const parsed = JSON.parse(raw);
    return sanitizeState(parsed);
  } catch {
    return createEmptyState();
  }
}

function createEmptyState() {
  return { cabinet: [], therapy: [], archive: { daily: {} }, todos: [] };
}

function pickFirstArray(...values) {
  for (const value of values) {
    if (Array.isArray(value)) return value;
  }
  return [];
}

function pickFirstObject(...values) {
  for (const value of values) {
    if (value && typeof value === "object") return value;
  }
  return {};
}

function sanitizeState(raw) {
  const parsed = raw && typeof raw === "object" ? raw : {};

  const sourceCabinet = pickFirstArray(
    parsed.cabinet,
    parsed.medicines,
    parsed.armadietto,
    parsed.farmaci
  );

  const cabinet = sourceCabinet
    .map((item) => {
      const category = normalizeCategory(item?.category);
      return {
        id: item?.id || createId(),
        name: String(item?.name || item?.medicineName || item?.farmaco || "").trim(),
        dosage: String(item?.dosage || item?.dose || item?.posology || "").trim(),
        quantity: toNonNegativeInt(item?.quantity ?? item?.qty ?? item?.stock),
        category,
        categoryOther:
          category === "altro"
            ? String(item?.categoryOther || item?.categoryDetail || "").replace(/\s+/g, " ").trim()
            : ""
      };
    })
    .filter((item) => item.name && item.dosage);

  const cabinetByKey = new Map(cabinet.map((med) => [normalizeText(`${med.name}|${med.dosage}`), med.id]));

  const sourceTherapy = pickFirstArray(
    parsed.therapy,
    parsed.terapia,
    parsed.treatments,
    parsed.plan,
    parsed.pianoTerapia
  );

  const therapy = sourceTherapy
    .map((entry) => {
      const medId = resolveMedIdFromEntry(entry, cabinet, cabinetByKey);
      const block = String(entry?.block || entry?.slot || entry?.fascia || "Mattina").trim() || "Mattina";
      const timeRaw =
        typeof entry?.time === "string"
          ? entry.time.trim()
          : typeof entry?.hour === "string"
            ? entry.hour.trim()
            : typeof entry?.orario === "string"
              ? entry.orario.trim()
              : "";

      return {
        id: entry?.id || createId(),
        medId,
        block,
        time: /^\d{2}:\d{2}$/.test(timeRaw) ? timeRaw : "",
        quantity: toPositiveInt(entry?.quantity ?? entry?.doseQty ?? entry?.dose ?? entry?.qta, 1),
        takenLog: sanitizeTakenLog(
          entry?.takenLog || entry?.assunzioni || entry?.log || entry?.taken || entry?.statusLog
        )
      };
    })
    .filter((entry) => entry.medId);

  const archiveSource = pickFirstObject(
    parsed.archive?.daily,
    parsed.archiveDaily,
    parsed.archivio?.daily,
    parsed.archivioGiornaliero
  );

  const todosSource = pickFirstArray(
    parsed.todos,
    parsed.todo,
    parsed.notes,
    parsed.appunti,
    parsed.postits,
    parsed.postIt
  );

  return {
    cabinet,
    therapy,
    archive: { daily: sanitizeArchiveDaily(archiveSource) },
    todos: sanitizeTodoNotes(todosSource)
  };
}

function resolveMedIdFromEntry(entry, cabinet, cabinetByKey) {
  const directId = String(entry?.medId || entry?.medicineId || entry?.farmacoId || entry?.cabinetId || "").trim();
  if (directId) return directId;

  const name = String(entry?.medName || entry?.medicineName || entry?.name || entry?.farmaco || "").trim();
  const dosage = String(entry?.dosage || entry?.dose || entry?.posology || "").trim();

  if (name && dosage) {
    const key = normalizeText(`${name}|${dosage}`);
    if (cabinetByKey.has(key)) return cabinetByKey.get(key);
  }

  if (name) {
    const normalizedName = normalizeText(name);
    const match = cabinet.find((med) => normalizeText(med.name) === normalizedName);
    if (match) return match.id;
  }

  return "";
}

function sanitizeArchiveDaily(rawDaily) {
  const daily = rawDaily && typeof rawDaily === "object" ? rawDaily : {};
  const safeDaily = {};
  Object.entries(daily).forEach(([dateKey, value]) => {
    if (!isIsoDateKey(dateKey)) return;
    const safeValue = value && typeof value === "object" ? value : {};
    const yes = toNonNegativeInt(safeValue.yes);
    const no = toNonNegativeInt(safeValue.no);
    const totalRaw = toNonNegativeInt(safeValue.total);
    safeDaily[dateKey] = {
      yes,
      no,
      total: totalRaw > 0 ? totalRaw : yes + no
    };
  });
  return safeDaily;
}

function sanitizeTakenLog(rawTakenLog) {
  const takenLog = rawTakenLog && typeof rawTakenLog === "object" ? rawTakenLog : {};
  const safeTakenLog = {};
  Object.entries(takenLog).forEach(([dateKey, status]) => {
    if (!isIsoDateKey(dateKey)) return;
    const normalized = normalizeTakenStatus(status);
    if (normalized) safeTakenLog[dateKey] = normalized;
  });
  return safeTakenLog;
}

function sanitizeTodoNotes(rawTodos) {
  const sourceTodos = Array.isArray(rawTodos) ? rawTodos : [];
  return sourceTodos
    .map((todo) => {
      const text = String(todo?.text || todo?.note || todo?.appunto || "")
        .replace(/\r\n?/g, "\n")
        .trim();
      if (!text) return null;

      const createdAt = toEpochMillis(todo?.createdAt || todo?.created || todo?.date || Date.now());
      const updatedAt = toEpochMillis(todo?.updatedAt || todo?.updated || createdAt);

      return {
        id: todo?.id || createId(),
        text,
        pinned: toBoolean(todo?.pinned || todo?.pin || todo?.isPinned),
        done: toBoolean(todo?.done || todo?.completed || todo?.isDone),
        createdAt,
        updatedAt
      };
    })
    .filter(Boolean);
}

function toEpochMillis(value) {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) return Math.floor(numeric);

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  return Date.now();
}

function toBoolean(value) {
  if (value === true || value === 1) return true;
  const normalized = String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return ["true", "1", "yes", "si", "sì", "on", "pinned", "done", "completed"].includes(
    normalized
  );
}

function normalizeTakenStatus(status) {
  if (status === "yes" || status === true || status === 1) return "yes";
  if (status === "no" || status === false || status === 0) return "no";

  const value = String(status || "").trim().toLowerCase();
  if (["yes", "si", "sì", "true", "taken", "assunto", "ok", "1"].includes(value)) {
    return "yes";
  }
  if (["no", "false", "not_taken", "non_assunto", "saltato", "0"].includes(value)) {
    return "no";
  }

  return "";
}

function toNonNegativeInt(value) {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? Math.floor(num) : 0;
}

function toPositiveInt(value, fallback = 1) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? Math.floor(num) : fallback;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function importCabinetItemsOnce() {
  try {
    if (localStorage.getItem(IMPORT_KEY) === "done") return;

    let added = 0;
    IMPORT_ITEMS.forEach((item) => {
      const exists = state.cabinet.some(
        (med) =>
          normalizeText(med.name) === normalizeText(item.name) &&
          normalizeText(med.dosage) === normalizeText(item.dosage)
      );
      if (exists) return;
      state.cabinet.push({
        id: createId(),
        name: item.name,
        dosage: item.dosage,
        quantity: 0,
        category: "",
        categoryOther: ""
      });
      added += 1;
    });

    if (added > 0) saveState();
    localStorage.setItem(IMPORT_KEY, "done");
  } catch {
    // Ignore storage errors and continue with normal app behavior.
  }
}

function autoArchiveOldLogs() {
  if (!state.archive || typeof state.archive !== "object") {
    state.archive = { daily: {} };
  }
  if (!state.archive.daily || typeof state.archive.daily !== "object") {
    state.archive.daily = {};
  }

  const cutoffDate = getIsoDateDaysAgo(ARCHIVE_RETENTION_DAYS);
  let changed = false;

  state.therapy.forEach((entry) => {
    if (!entry.takenLog || typeof entry.takenLog !== "object") return;
    Object.keys(entry.takenLog).forEach((dateKey) => {
      if (!isIsoDateKey(dateKey)) {
        delete entry.takenLog[dateKey];
        changed = true;
        return;
      }
      if (dateKey >= cutoffDate) return;

      const status = entry.takenLog[dateKey];
      const bucket = state.archive.daily[dateKey] || { yes: 0, no: 0, total: 0 };
      if (status === "yes") {
        bucket.yes += 1;
        bucket.total += 1;
      } else if (status === "no") {
        bucket.no += 1;
        bucket.total += 1;
      }
      state.archive.daily[dateKey] = bucket;
      delete entry.takenLog[dateKey];
      changed = true;
    });
  });

  if (changed) saveState();
}

function exportBackupJson() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    storageKey: STORAGE_KEY,
    retentionDays: ARCHIVE_RETENTION_DAYS,
    data: state
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `farmaci-backup-${today}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function importBackupJson(file) {
  if (!file) {
    throw new Error("Seleziona un file JSON da importare.");
  }

  const rawText = await file.text();
  if (!rawText.trim()) {
    throw new Error("Il file selezionato è vuoto.");
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("File JSON non valido.");
  }

  const statePayload = extractImportStatePayload(parsed);
  if (!statePayload || typeof statePayload !== "object") {
    throw new Error("Struttura del backup non riconosciuta.");
  }

  const importedState = sanitizeState(statePayload);
  const archiveDays = Object.keys(importedState.archive.daily || {}).length;
  const notesCount = importedState.todos.length;
  const totalRows = importedState.cabinet.length + importedState.therapy.length + archiveDays + notesCount;

  if (totalRows === 0) {
    const confirmEmpty = window.confirm(
      "Il backup è valido ma senza dati. Vuoi sostituire i dati attuali con un archivio vuoto?"
    );
    if (!confirmEmpty) return { applied: false, medicines: 0, therapy: 0, archiveDays: 0 };
  } else {
    const confirmImport = window.confirm(
      `Importare ${importedState.cabinet.length} farmaci, ${importedState.therapy.length} terapie, ${notesCount} appunti e ${archiveDays} giorni archiviati? I dati locali attuali verranno sostituiti.`
    );
    if (!confirmImport) return { applied: false, medicines: 0, therapy: 0, archiveDays: 0 };
  }

  backupStateBeforeImport();
  state.cabinet = importedState.cabinet;
  state.therapy = importedState.therapy;
  state.archive = importedState.archive;
  state.todos = importedState.todos;
  autoArchiveOldLogs();

  try {
    saveState();
  } catch {
    throw new Error(
      "Import fallito: spazio locale insufficiente. Prova a cancellare dati del browser e ripetere."
    );
  }

  return {
    applied: true,
    medicines: state.cabinet.length,
    therapy: state.therapy.length,
    notes: state.todos.length,
    archiveDays: Object.keys(state.archive.daily || {}).length
  };
}

function extractImportStatePayload(payload) {
  if (!payload || typeof payload !== "object") return null;

  if (payload.data && typeof payload.data === "object") {
    if (payload.data.state && typeof payload.data.state === "object") return payload.data.state;
    return payload.data;
  }

  if (payload.state && typeof payload.state === "object") return payload.state;
  if (payload.backup?.data && typeof payload.backup.data === "object") return payload.backup.data;
  if (payload.payload?.data && typeof payload.payload.data === "object") return payload.payload.data;

  return payload;
}

function resetArchiveDaily() {
  const archive = state.archive && typeof state.archive === "object" ? state.archive : { daily: {} };
  const daily = archive.daily && typeof archive.daily === "object" ? archive.daily : {};
  const removedDays = Object.keys(daily).length;

  if (!removedDays) {
    return { changed: false, removedDays: 0, message: "Nessun archivio da resettare." };
  }

  const confirmReset = window.confirm(
    `Vuoi cancellare ${removedDays} giorni negli archivi storici? Questa azione non e annullabile.`
  );
  if (!confirmReset) {
    return { changed: false, removedDays: 0, message: "Reset annullato." };
  }

  state.archive = { ...archive, daily: {} };
  saveState();
  return { changed: true, removedDays, message: "" };
}

function backupStateBeforeImport() {
  try {
    localStorage.setItem(
      PRE_IMPORT_BACKUP_KEY,
      JSON.stringify({
        version: 1,
        savedAt: new Date().toISOString(),
        storageKey: STORAGE_KEY,
        data: state
      })
    );
  } catch {
    // Best effort backup: ignore storage failures and continue import.
  }
}

function registerPwa() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {
      // Ignore registration failures and keep app usable.
    });
  });
}

function activateNav() {
  const active = document.querySelector(`.nav-${PAGE}`);
  if (active) active.classList.add("active");
}

function normalizeTherapyViewMode(value) {
  return value === "blocks" ? "blocks" : "list";
}

function loadTherapyViewMode() {
  try {
    return normalizeTherapyViewMode(localStorage.getItem(THERAPY_VIEW_MODE_KEY));
  } catch {
    return "list";
  }
}

function saveTherapyViewMode(mode) {
  try {
    localStorage.setItem(THERAPY_VIEW_MODE_KEY, normalizeTherapyViewMode(mode));
  } catch {
    // Ignore storage write failures and keep the session view mode.
  }
}

function updateTherapyViewSelect(selectEl, mode) {
  if (!selectEl) return;
  selectEl.value = normalizeTherapyViewMode(mode);
}

function normalizeDiaryViewMode(value) {
  return value === "checklist" ? "checklist" : "standard";
}

function loadDiaryViewMode() {
  try {
    return normalizeDiaryViewMode(localStorage.getItem(DIARY_VIEW_MODE_KEY));
  } catch {
    return "standard";
  }
}

function saveDiaryViewMode(mode) {
  try {
    localStorage.setItem(DIARY_VIEW_MODE_KEY, normalizeDiaryViewMode(mode));
  } catch {
    // Ignore storage write failures and keep the session view mode.
  }
}

function normalizeLayoutMode(value) {
  return value === "matrix" ? "matrix" : "list";
}

function loadLayoutMode(storageKey) {
  try {
    return normalizeLayoutMode(localStorage.getItem(storageKey));
  } catch {
    return "list";
  }
}

function saveLayoutMode(storageKey, mode) {
  try {
    localStorage.setItem(storageKey, normalizeLayoutMode(mode));
  } catch {
    // Ignore storage write failures and keep the session layout mode.
  }
}

function updateLayoutSelect(selectEl, mode) {
  if (!selectEl) return;
  selectEl.value = normalizeLayoutMode(mode);
}

function updateDiaryViewButtons(standardBtn, checklistBtn, mode) {
  const normalized = normalizeDiaryViewMode(mode);
  if (standardBtn) {
    const active = normalized === "standard";
    standardBtn.classList.toggle("active", active);
    standardBtn.setAttribute("aria-pressed", String(active));
  }
  if (checklistBtn) {
    const active = normalized === "checklist";
    checklistBtn.classList.toggle("active", active);
    checklistBtn.setAttribute("aria-pressed", String(active));
  }
}

function updateDiaryViewSelect(selectEl, mode) {
  if (!selectEl) return;
  selectEl.value = normalizeDiaryViewMode(mode);
}

function formatTime(time) {
  return time || "";
}

function blockToClassName(block) {
  return String(block || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function formatDateLong(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function normalizeText(value) {
  return String(value).replace(/\s+/g, " ").trim().toUpperCase();
}

function getIsoDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return getLocalIsoDate(date);
}

function getDiaryReferenceIsoDate(now = new Date()) {
  const shifted = new Date(now);
  if (shifted.getHours() < DIARY_PREVIOUS_DAY_UNTIL_HOUR) {
    shifted.setDate(shifted.getDate() - 1);
  }
  return getLocalIsoDate(shifted);
}

function getLocalIsoDate(date = new Date()) {
  return toIsoDate(date.getFullYear(), date.getMonth(), date.getDate());
}

function resolveStorageKey(defaultKey) {
  const suffix = String(document.body?.dataset?.storageSuffix || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  return suffix ? `${defaultKey}_${suffix}` : defaultKey;
}

function isIsoDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function parseIsoDate(value) {
  const text = String(value || "");
  if (!isIsoDateKey(text)) {
    return {
      year: Number(today.slice(0, 4)),
      month: Number(today.slice(5, 7)) - 1,
      day: Number(today.slice(8, 10))
    };
  }
  return {
    year: Number(text.slice(0, 4)),
    month: Number(text.slice(5, 7)) - 1,
    day: Number(text.slice(8, 10))
  };
}

function toIsoDate(year, monthZeroBased, day) {
  return `${String(year).padStart(4, "0")}-${String(monthZeroBased + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function renderCabinetEditForm(container, med, listEl) {
  const safeName = escapeHtml(med.name);
  const safeDosage = escapeHtml(med.dosage);
  const selectedCategory = normalizeCategory(med.category);
  const safeCategoryOther = escapeHtml(med.categoryOther || "");
  container.innerHTML = `
    <form class="form-grid edit-form" data-edit-form>
      <div>
        <label>Nome medicinale</label>
        <input name="name" required value="${safeName}" />
      </div>
      <div class="row">
        <div>
          <label>Dosaggio</label>
          <input name="dosage" required value="${safeDosage}" />
        </div>
        <div>
          <label>N. disponibili</label>
          <input name="quantity" type="number" min="0" required value="${med.quantity}" />
        </div>
      </div>
      <div>
        <label>Categoria (facoltativa)</label>
        <select name="category">
          <option value="" ${selectedCategory === "" ? "selected" : ""}>Nessuna</option>
          <option value="psicofarmaci" ${selectedCategory === "psicofarmaci" ? "selected" : ""}>Psicofarmaci</option>
          <option value="pressione" ${selectedCategory === "pressione" ? "selected" : ""}>Pressione</option>
          <option value="colesterolo" ${selectedCategory === "colesterolo" ? "selected" : ""}>Colesterolo</option>
          <option value="altro" ${selectedCategory === "altro" ? "selected" : ""}>Altro (specifica)</option>
        </select>
      </div>
      <div class="${selectedCategory === "altro" ? "" : "hidden"}" data-edit-other-wrap>
        <label>Specifica categoria</label>
        <input name="categoryOther" value="${safeCategoryOther}" />
      </div>
      <div class="actions">
        <button type="submit">Salva</button>
        <button type="button" class="delete" data-delete-med-edit>Elimina</button>
        <button type="button" class="secondary" data-cancel-edit>Annulla</button>
      </div>
    </form>
  `;

  const form = container.querySelector("[data-edit-form]");
  if (!form) return;

  const categorySelect = form.elements.category;
  const otherWrap = form.querySelector("[data-edit-other-wrap]");
  const otherInput = form.elements.categoryOther;
  if (categorySelect && otherWrap && otherInput) {
    categorySelect.addEventListener("change", () => {
      toggleOtherCategoryField(categorySelect, otherWrap, otherInput);
    });
    toggleOtherCategoryField(categorySelect, otherWrap, otherInput);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = String(form.elements.name.value || "").replace(/\s+/g, " ").trim();
    const dosage = String(form.elements.dosage.value || "").replace(/\s+/g, " ").trim();
    const quantity = Number(form.elements.quantity.value);
    const category = normalizeCategory(form.elements.category.value);
    const categoryOther =
      category === "altro"
        ? String(form.elements.categoryOther.value || "").replace(/\s+/g, " ").trim()
        : "";

    if (
      !name ||
      !dosage ||
      !Number.isFinite(quantity) ||
      quantity < 0 ||
      (category === "altro" && !categoryOther)
    ) {
      return;
    }

    med.name = name;
    med.dosage = dosage;
    med.quantity = quantity;
    med.category = category;
    med.categoryOther = categoryOther;
    saveState();
    renderCabinetList(listEl, listEl.classList.contains("layout-matrix") ? "matrix" : "list");
  });

  const deleteMedBtn = container.querySelector("[data-delete-med-edit]");
  if (deleteMedBtn) {
    deleteMedBtn.addEventListener("click", () => {
      const linkedTherapyCount = state.therapy.filter((entry) => entry.medId === med.id).length;
      const confirmMessage =
        linkedTherapyCount > 0
          ? `Eliminando questo farmaco verra rimosso anche dalla terapia (${linkedTherapyCount} voce${linkedTherapyCount === 1 ? "" : "i"}). Vuoi continuare?`
          : "Confermi eliminazione del farmaco?";
      const confirmDelete = window.confirm(confirmMessage);
      if (!confirmDelete) return;

      state.cabinet = state.cabinet.filter((item) => item.id !== med.id);
      state.therapy = state.therapy.filter((entry) => entry.medId !== med.id);
      saveState();
      renderCabinetList(listEl, listEl.classList.contains("layout-matrix") ? "matrix" : "list");
    });
  }

  const cancel = container.querySelector("[data-cancel-edit]");
  if (cancel) {
    cancel.addEventListener("click", () => {
      container.classList.add("hidden");
      container.innerHTML = "";
    });
  }
}

function renderTherapyEditForm(container, entry, onRerender) {
  const currentMed = state.cabinet.find((med) => med.id === entry.medId);
  const currentCategory = normalizeCategory(currentMed?.category);
  const currentCategoryOther =
    currentCategory === "altro"
      ? String(currentMed?.categoryOther || "").replace(/\s+/g, " ").trim()
      : "";
  const optionsHtml = state.cabinet
    .map((med) => {
      const selected = med.id === entry.medId ? "selected" : "";
      return `<option value="${med.id}" ${selected}>${escapeHtml(med.name)} (${escapeHtml(med.dosage)})</option>`;
    })
    .join("");
  container.innerHTML = `
    <form class="form-grid edit-form" data-edit-therapy-form>
      <div>
        <label>Medicinale</label>
        <select name="medId" required>
          <option value="">Seleziona dall'armadietto</option>
          ${optionsHtml}
        </select>
      </div>
      <div>
        <label>Blocco orario</label>
        <select name="block" required>
          <option value="Mattina" ${entry.block === "Mattina" ? "selected" : ""}>Mattina</option>
          <option value="Pranzo" ${entry.block === "Pranzo" ? "selected" : ""}>Pranzo</option>
          <option value="Pomeriggio" ${entry.block === "Pomeriggio" ? "selected" : ""}>Pomeriggio</option>
          <option value="Sera" ${entry.block === "Sera" ? "selected" : ""}>Sera</option>
          <option value="Notte" ${entry.block === "Notte" ? "selected" : ""}>Notte</option>
        </select>
      </div>
      <div class="row">
        <div>
          <label>Orario (opzionale)</label>
          <input name="time" type="time" value="${escapeHtml(entry.time || "")}" />
        </div>
        <div>
          <label>Quantità</label>
          <input name="quantity" type="number" min="1" required value="${entry.quantity}" />
        </div>
      </div>
      <div>
        <label>Categoria farmaco (facoltativa)</label>
        <select name="category">
          <option value="" ${currentCategory === "" ? "selected" : ""}>Nessuna</option>
          <option value="psicofarmaci" ${currentCategory === "psicofarmaci" ? "selected" : ""}>Psicofarmaci</option>
          <option value="pressione" ${currentCategory === "pressione" ? "selected" : ""}>Pressione</option>
          <option value="colesterolo" ${currentCategory === "colesterolo" ? "selected" : ""}>Colesterolo</option>
          <option value="altro" ${currentCategory === "altro" ? "selected" : ""}>Altro (specifica)</option>
        </select>
      </div>
      <div class="${currentCategory === "altro" ? "" : "hidden"}" data-therapy-other-wrap>
        <label>Specifica categoria</label>
        <input name="categoryOther" value="${escapeHtml(currentCategoryOther)}" />
      </div>
      <div class="actions">
        <button type="submit">Salva</button>
        <button type="button" class="delete" data-delete-therapy-edit>Elimina</button>
        <button type="button" class="secondary" data-cancel-therapy-edit>Annulla</button>
      </div>
    </form>
  `;

  const form = container.querySelector("[data-edit-therapy-form]");
  if (!form) return;
  const medSelect = form.elements.medId;
  const categorySelect = form.elements.category;
  const otherWrap = form.querySelector("[data-therapy-other-wrap]");
  const otherInput = form.elements.categoryOther;

  const syncCategoryFromSelectedMed = () => {
    const medId = String(medSelect?.value || "");
    const selectedMed = state.cabinet.find((med) => med.id === medId);
    const category = normalizeCategory(selectedMed?.category);
    const categoryOther =
      category === "altro"
        ? String(selectedMed?.categoryOther || "").replace(/\s+/g, " ").trim()
        : "";
    if (categorySelect) categorySelect.value = category;
    if (otherInput) otherInput.value = categoryOther;
    toggleOtherCategoryField(categorySelect, otherWrap, otherInput);
  };

  if (categorySelect && otherWrap && otherInput) {
    categorySelect.addEventListener("change", () => {
      toggleOtherCategoryField(categorySelect, otherWrap, otherInput);
    });
    toggleOtherCategoryField(categorySelect, otherWrap, otherInput);
  }

  if (medSelect) {
    medSelect.addEventListener("change", () => {
      syncCategoryFromSelectedMed();
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const medId = String(form.elements.medId.value || "");
    const block = String(form.elements.block.value || "");
    const time = String(form.elements.time.value || "").trim();
    const quantity = Number(form.elements.quantity.value);
    const category = normalizeCategory(form.elements.category.value);
    const categoryOther =
      category === "altro"
        ? String(form.elements.categoryOther.value || "").replace(/\s+/g, " ").trim()
        : "";

    if (
      !medId ||
      !BLOCK_ORDER.includes(block) ||
      !Number.isFinite(quantity) ||
      quantity < 1 ||
      (category === "altro" && !categoryOther)
    ) {
      return;
    }

    entry.medId = medId;
    entry.block = block;
    entry.time = time;
    entry.quantity = quantity;
    const med = state.cabinet.find((item) => item.id === medId);
    if (med) {
      med.category = category;
      med.categoryOther = categoryOther;
    }
    saveState();
    onRerender();
  });

  const deleteTherapyBtn = container.querySelector("[data-delete-therapy-edit]");
  if (deleteTherapyBtn) {
    deleteTherapyBtn.addEventListener("click", () => {
      state.therapy = state.therapy.filter((item) => item.id !== entry.id);
      saveState();
      onRerender();
    });
  }

  const cancel = container.querySelector("[data-cancel-therapy-edit]");
  if (cancel) {
    cancel.addEventListener("click", () => {
      container.classList.add("hidden");
      container.innerHTML = "";
    });
  }
}

function normalizeCategory(value) {
  const normalized = String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return CATEGORY_VALUES.includes(normalized) ? normalized : "";
}

function formatCategory(med) {
  const category = normalizeCategory(med.category);
  if (!category) return "Categoria: non specificata";
  if (category === "psicofarmaci") return "Categoria: psicofarmaci";
  if (category === "pressione") return "Categoria: pressione";
  if (category === "colesterolo") return "Categoria: colesterolo";
  const other = String(med.categoryOther || "").replace(/\s+/g, " ").trim();
  return other ? `Categoria: ${other}` : "Categoria: altro";
}

function formatCategoryTag(med) {
  const category = normalizeCategory(med.category);
  if (!category) return { label: "Senza categoria", className: "altro" };
  if (category === "psicofarmaci") return { label: "Psicofarmaci", className: "psicofarmaci" };
  if (category === "pressione") return { label: "Pressione", className: "pressione" };
  if (category === "colesterolo") return { label: "Colesterolo", className: "colesterolo" };
  const other = String(med.categoryOther || "").replace(/\s+/g, " ").trim();
  return { label: other || "Altro", className: "altro" };
}

function toggleOtherCategoryField(selectEl, wrapEl, inputEl) {
  if (!selectEl || !wrapEl || !inputEl) return;
  const isOther = normalizeCategory(selectEl.value) === "altro";
  wrapEl.classList.toggle("hidden", !isOther);
  inputEl.required = isOther;
  if (!isOther) inputEl.value = "";
}
