const DEFAULT_STORAGE_KEY = "farmaci_app_data_v2";
const STORAGE_KEY = resolveStorageKey(DEFAULT_STORAGE_KEY);
const BLOCK_ORDER = ["Mattina", "Pranzo", "Pomeriggio", "Sera", "Notte"];
const CATEGORY_VALUES = ["psicofarmaci", "pressione", "colesterolo", "altro"];
const ARCHIVE_RETENTION_DAYS = 180;
const IMPORT_KEY = `${STORAGE_KEY}_import_armadietto_2026_02_27`;
const PRE_IMPORT_BACKUP_KEY = `${STORAGE_KEY}_pre_import_backup_v1`;
const APP_VERSION = "v2.4.0";
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

function initCabinetPage() {
  const form = document.getElementById("cabinet-form");
  const list = document.getElementById("cabinet-list");
  const formWrap = document.getElementById("cabinet-form-wrap");
  const openFormBtn = document.getElementById("cabinet-open-form");
  const closeFormBtn = document.getElementById("cabinet-cancel-form");
  const categorySelect = document.getElementById("cab-category");
  const categoryOtherWrap = document.getElementById("cab-category-other-wrap");
  const categoryOtherInput = document.getElementById("cab-category-other");
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

  const setFormOpen = (isOpen) => {
    formWrap.classList.toggle("hidden", !isOpen);
    openFormBtn.textContent = isOpen ? "Chiudi nuovo medicinale" : "+ Nuovo medicinale";
    if (!isOpen) {
      form.reset();
      toggleOtherCategoryField(categorySelect, categoryOtherWrap, categoryOtherInput);
    }
  };

  openFormBtn.addEventListener("click", () => {
    setFormOpen(formWrap.classList.contains("hidden"));
  });
  closeFormBtn.addEventListener("click", () => {
    setFormOpen(false);
  });

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
    renderCabinetList(list);
  });

  renderCabinetList(list);
}

function renderCabinetList(listEl) {
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
        <button class="secondary btn-compact" type="button" data-edit="${med.id}">Modifica</button>
        <button class="delete-soft btn-compact" type="button" data-delete="${med.id}">Rimuovi</button>
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
    card.querySelector("[data-delete]").addEventListener("click", () => {
      state.cabinet = state.cabinet.filter((item) => item.id !== med.id);
      state.therapy = state.therapy.filter((entry) => entry.medId !== med.id);
      saveState();
      renderCabinetList(listEl);
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

  const uiState = { activeBlock: "all" };
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
    openFormBtn.textContent = isOpen ? "Chiudi aggiunta terapia" : "Aggiungi terapia";
    if (!isOpen) form.reset();
  };

  openFormBtn.addEventListener("click", () => {
    setFormOpen(formWrap.classList.contains("hidden"));
  });
  closeFormBtn.addEventListener("click", () => {
    setFormOpen(false);
  });

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

  renderTherapy();
}

function renderTherapyPage({ listEl, filterWrapEl, medSelectEl, uiState, onRerender }) {
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

  filterWrapEl.innerHTML = "";
  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.className = `therapy-filter-chip ${uiState.activeBlock === "all" ? "active" : ""}`;
  allButton.textContent = `Tutte (${sorted.length})`;
  allButton.addEventListener("click", () => {
    uiState.activeBlock = "all";
    onRerender();
  });
  filterWrapEl.append(allButton);

  activeBlocks.forEach((block) => {
    const blockButton = document.createElement("button");
    blockButton.type = "button";
    blockButton.className = `therapy-filter-chip ${uiState.activeBlock === block ? "active" : ""}`;
    blockButton.textContent = `${block} (${grouped.get(block).length})`;
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
    card.className = `item therapy-block block-${blockToClassName(block)}`;
    card.innerHTML = `
      <div class="therapy-block-head">
        <h3 class="item-title">${escapeHtml(block)}</h3>
        <span class="tag">${blockItems.length} attivi</span>
      </div>
      <div class="therapy-block-list"></div>
    `;
    const listInside = card.querySelector(".therapy-block-list");
    blockItems.forEach(({ entry, med }) => {
      const categoryTag = formatCategoryTag(med);
      const row = document.createElement("div");
      row.className = "therapy-entry";
      row.innerHTML = `
        <div>
          <h4 class="item-title">${escapeHtml(med.name)}</h4>
          <p class="meta">${escapeHtml(med.dosage)} | ${entry.quantity} unità</p>
          ${entry.time ? `<p class="meta">${formatTime(entry.time)}</p>` : ""}
          <div class="tag-row">
            <span class="tag tag-cat ${escapeHtml(categoryTag.className)}">${escapeHtml(categoryTag.label)}</span>
          </div>
        </div>
        <div class="actions">
          <button class="secondary btn-compact" type="button" data-edit="${entry.id}">Modifica</button>
          <button class="delete-soft btn-compact" type="button" data-remove="${entry.id}">Elimina</button>
        </div>
        <div class="edit-area hidden" data-edit-area="${entry.id}"></div>
      `;
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
      row.querySelector("[data-remove]").addEventListener("click", () => {
        state.therapy = state.therapy.filter((item) => item.id !== entry.id);
        saveState();
        onRerender();
      });
      listInside.append(row);
    });
    listEl.append(card);
  });
}

function initHomePage() {
  const activeTherapyEl = document.getElementById("home-active-therapy");
  const activeMedsEl = document.getElementById("home-active-meds");
  const unitsDayEl = document.getElementById("home-units-day");
  const adherenceEl = document.getElementById("home-month-adherence");
  const trendSummaryEl = document.getElementById("home-trend-summary");
  const trendBarsEl = document.getElementById("home-trend-bars");
  const blockBreakdownEl = document.getElementById("home-block-breakdown");

  const versionEl = document.getElementById("home-app-version");
  const exportBtn = document.getElementById("home-export-backup-btn");
  const importBtn = document.getElementById("home-import-backup-btn");
  const importInput = document.getElementById("home-import-backup-input");
  const resetArchiveBtn = document.getElementById("home-reset-archive-btn");

  const renderDashboard = () => {
    const sortedTherapy = getSortedTherapy();
    const therapyItems = getDiaryItems();
    const uniqueMedIds = new Set(sortedTherapy.map((entry) => entry.medId));
    const unitsPerDay = sortedTherapy.reduce((sum, entry) => sum + toPositiveInt(entry.quantity, 1), 0);

    if (activeTherapyEl) activeTherapyEl.textContent = String(sortedTherapy.length);
    if (activeMedsEl) activeMedsEl.textContent = String(uniqueMedIds.size);
    if (unitsDayEl) unitsDayEl.textContent = String(unitsPerDay);

    const dailyStats = getDiaryDailyStats(therapyItems);
    const last30 = getLastDaysStats(30, dailyStats);
    const monthTotal = last30.reduce((sum, day) => sum + day.total, 0);
    const monthYes = last30.reduce((sum, day) => sum + day.yes, 0);
    const trackedDays = last30.filter((day) => day.total > 0).length;
    const completeDays = last30.filter((day) => day.total > 0 && day.yes === day.total).length;
    const monthMissed = Math.max(0, monthTotal - monthYes);

    if (adherenceEl) {
      adherenceEl.textContent = monthTotal > 0 ? `${Math.round((monthYes / monthTotal) * 100)}%` : "-";
    }

    if (trendSummaryEl) {
      trendSummaryEl.textContent =
        monthTotal > 0
          ? `Assunti: ${monthYes} · Mancati: ${monthMissed} · Giorni completi: ${completeDays}/${trackedDays}`
          : "Nessuna registrazione negli ultimi 30 giorni";
    }

    if (trendBarsEl) {
      trendBarsEl.innerHTML = "";
      last30.forEach((day) => {
        const bar = document.createElement("div");
        const ratio = day.total > 0 ? day.yes / day.total : 0;
        let cls = "empty";
        if (day.total > 0 && ratio >= 1) cls = "full";
        else if (day.total > 0 && ratio >= 0.66) cls = "high";
        else if (day.total > 0 && ratio >= 0.33) cls = "mid";
        else if (day.total > 0) cls = "low";
        bar.className = `home-trend-bar ${cls}`;
        bar.title = `${formatDateLong(day.date)}: ${day.yes}/${day.total}`;
        trendBarsEl.append(bar);
      });
    }

    if (blockBreakdownEl) {
      blockBreakdownEl.innerHTML = "";
      if (!sortedTherapy.length) {
        const empty = document.createElement("span");
        empty.className = "tag";
        empty.textContent = "Nessuna terapia attiva";
        blockBreakdownEl.append(empty);
      } else {
        const counts = new Map();
        sortedTherapy.forEach((entry) => {
          counts.set(entry.block, (counts.get(entry.block) || 0) + 1);
        });
        const orderedBlocks = [
          ...BLOCK_ORDER.filter((blockName) => counts.has(blockName)),
          ...Array.from(counts.keys()).filter((blockName) => !BLOCK_ORDER.includes(blockName)).sort()
        ];
        orderedBlocks.forEach((blockName) => {
          const chip = document.createElement("span");
          chip.className = "tag";
          chip.textContent = `${blockName}: ${counts.get(blockName)}`;
          blockBreakdownEl.append(chip);
        });
      }
    }
  };

  if (versionEl) {
    versionEl.textContent = `Versione app: ${APP_VERSION}`;
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
        renderDashboard();
        alert(
          `Import completato: ${result.medicines} farmaci, ${result.therapy} terapie, ${result.archiveDays} giorni archiviati.`
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
      renderDashboard();
      alert(`Archivi storici azzerati: ${result.removedDays} giorni rimossi.`);
    });
  }

  renderDashboard();
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

function initDiaryPage() {
  const list = document.getElementById("diary-list");
  const summary = document.getElementById("daily-summary");
  const calendarEl = document.getElementById("diary-calendar");
  const calendarWrap = document.getElementById("calendar-wrap");
  const monthLabelEl = document.getElementById("calendar-month-label");
  const prevBtn = document.getElementById("calendar-prev");
  const nextBtn = document.getElementById("calendar-next");
  const toggleCalendarBtn = document.getElementById("toggle-calendar-btn");

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

  let selectedDate = today;
  let visibleYear = Number(today.slice(0, 4));
  let visibleMonth = Number(today.slice(5, 7)) - 1;

  const setCalendarOpen = (isOpen) => {
    calendarWrap.classList.toggle("hidden", !isOpen);
    toggleCalendarBtn.textContent = isOpen ? "Chiudi calendario" : "Apri calendario";
    toggleCalendarBtn.setAttribute("aria-expanded", String(isOpen));
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
      }
    });
    renderDiary(list, summary, { selectedDate, items });
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

  setCalendarOpen(false);
  renderAll();
}

function renderDiary(listEl, summaryEl, filters) {
  const { selectedDate, items } = filters;
  const sorted = Array.isArray(items) ? items : getDiaryItems();
  if (!sorted.length) {
    listEl.innerHTML = '<div class="empty">Nessuna terapia da registrare.</div>';
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
        renderDiary(listEl, summaryEl, filters);
      });
      listInside.append(row);
    });
    listEl.append(card);
  });

  summaryEl.textContent = formatDateLong(selectedDate);
}

function renderDiaryCalendar({
  calendarEl,
  monthLabelEl,
  selectedDate,
  visibleYear,
  visibleMonth,
  items,
  onSelectDate
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
    if (dateIso === today) button.classList.add("today");
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
  return { cabinet: [], therapy: [], archive: { daily: {} } };
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

  return {
    cabinet,
    therapy,
    archive: { daily: sanitizeArchiveDaily(archiveSource) }
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
  const totalRows = importedState.cabinet.length + importedState.therapy.length + archiveDays;

  if (totalRows === 0) {
    const confirmEmpty = window.confirm(
      "Il backup è valido ma senza dati. Vuoi sostituire i dati attuali con un archivio vuoto?"
    );
    if (!confirmEmpty) return { applied: false, medicines: 0, therapy: 0, archiveDays: 0 };
  } else {
    const confirmImport = window.confirm(
      `Importare ${importedState.cabinet.length} farmaci, ${importedState.therapy.length} terapie e ${archiveDays} giorni archiviati? I dati locali attuali verranno sostituiti.`
    );
    if (!confirmImport) return { applied: false, medicines: 0, therapy: 0, archiveDays: 0 };
  }

  backupStateBeforeImport();
  state.cabinet = importedState.cabinet;
  state.therapy = importedState.therapy;
  state.archive = importedState.archive;
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
    renderCabinetList(listEl);
  });

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
