(function bootstrapApp(global) {
  const namespace = global.PSTorino || (global.PSTorino = {});
  const {
    fetchPublishedSnapshot,
    fetchTorinoHospitals,
    fetchMockHospitals,
    loadLastSync,
    loadSnapshot,
    normalizeSnapshotPayload,
    saveSnapshot,
    isApiConfigured
  } = namespace;

  const listEl = document.getElementById("hospitalList");
  const tpl = document.getElementById("hospitalCardTpl");
  const refreshBtn = document.getElementById("refreshBtn");
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const showLiveData = document.getElementById("showLiveData");
  const showSnapshotData = document.getElementById("showSnapshotData");
  const onlyOpenNow = document.getElementById("onlyOpenNow");
  const lastUpdatedEl = document.getElementById("lastUpdated");
  const sourceLabelEl = document.getElementById("sourceLabel");
  const statusLabelEl = document.getElementById("statusLabel");
  const visibleCountEl = document.getElementById("visibleCount");
  const coverageLabelEl = document.getElementById("coverageLabel");
  const runtimeNoticeEl = document.getElementById("runtimeNotice");

  let currentSnapshot = null;

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("it-IT", {
      dateStyle: "short",
      timeStyle: "short"
    }).format(date);
  }

  function normalizeText(value) {
    const source = String(value || "");
    const canNormalize = typeof source.normalize === "function";

    return (canNormalize ? source.normalize("NFD") : source)
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function getHospitalPriority(hospital) {
    if (!hospital.hasData) {
      return 2;
    }

    if (hospital.meta && hospital.meta.stale) {
      return 1;
    }

    return 0;
  }

  function getPriorityLabel(priority) {
    if (priority === 0) {
      return "Dato live";
    }

    if (priority === 1) {
      return "Ultimo snapshot";
    }

    return "Catalogo";
  }

  function compareBySelectedMode(left, right, mode) {
    if (mode === "name") {
      return left.name.localeCompare(right.name, "it");
    }

    if (mode === "red") {
      return right.red - left.red;
    }

    if (mode === "orange") {
      return right.orange - left.orange;
    }

    if (mode === "green") {
      return right.green - left.green;
    }

    if (mode === "blue") {
      return right.blue - left.blue;
    }

    return right.total - left.total;
  }

  function sortHospitals(hospitals, mode) {
    const items = [...hospitals];
    return items.sort((left, right) => {
      const priorityDelta = getHospitalPriority(left) - getHospitalPriority(right);

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      const modeDelta = compareBySelectedMode(left, right, mode);

      if (modeDelta !== 0) {
        return modeDelta;
      }

      return left.name.localeCompare(right.name, "it");
    });
  }

  function getCacheSourceLabel(snapshot) {
    return snapshot && snapshot.source === "mock" ? "Cache locale (mock)" : "Cache locale";
  }

  function getCachedSnapshot() {
    const cachedSnapshot = loadSnapshot();

    if (!cachedSnapshot) {
      return null;
    }

    return normalizeSnapshotPayload(
      cachedSnapshot,
      "cache",
      getCacheSourceLabel(cachedSnapshot)
    );
  }

  function setStatus(text) {
    statusLabelEl.textContent = text;
  }

  function setRuntimeNotice(text) {
    if (!runtimeNoticeEl) {
      return;
    }

    runtimeNoticeEl.hidden = !text;
    runtimeNoticeEl.textContent = text || "";
  }

  function setLoading(isLoading) {
    refreshBtn.disabled = isLoading;
    refreshBtn.textContent = isLoading ? "Aggiorno..." : "Aggiorna";
    listEl.setAttribute("aria-busy", String(isLoading));
  }

  function getCountLabel(hospital, key) {
    return hospital.hasData ? String(hospital[key]) : "—";
  }

  function matchesSearch(hospital, query) {
    if (!query) {
      return true;
    }

    return normalizeText(`${hospital.name} ${hospital.address}`).includes(query);
  }

  function matchesDataStateFilters(hospital) {
    if (!hospital.hasData) {
      return !onlyOpenNow.checked;
    }

    if (hospital.meta && hospital.meta.stale) {
      return showSnapshotData.checked;
    }

    return showLiveData.checked;
  }

  function updateSummary(snapshot, visibleHospitals) {
    const allHospitals = snapshot && Array.isArray(snapshot.hospitals) ? snapshot.hospitals : [];
    const freshLiveHospitals = allHospitals.filter((hospital) => hospital.hasData && !(hospital.meta && hospital.meta.stale)).length;
    const staleHospitals = allHospitals.filter((hospital) => hospital.hasData && hospital.meta && hospital.meta.stale).length;
    const catalogHospitals = allHospitals.filter((hospital) => !hospital.hasData).length;
    const coverageParts = [`${freshLiveHospitals} live`];

    if (staleHospitals) {
      coverageParts.push(`${staleHospitals} snapshot`);
    }

    coverageParts.push(`${catalogHospitals} catalogo`);

    lastUpdatedEl.textContent = formatDate(snapshot && snapshot.fetchedAt ? snapshot.fetchedAt : loadLastSync());
    sourceLabelEl.textContent = snapshot && snapshot.sourceLabel ? snapshot.sourceLabel : "—";
    visibleCountEl.textContent = `${visibleHospitals.length} / ${allHospitals.length}`;
    coverageLabelEl.textContent = coverageParts.join(" · ");
  }

  function getHospitalStatus(hospital) {
    if (!hospital.hasData) {
      return {
        label: "Catalogo",
        className: "catalog",
        title: "Struttura presente nel catalogo, senza feed dati disponibile."
      };
    }

    if (hospital.meta && hospital.meta.stale) {
      return {
        label: "Ultimo snapshot",
        className: "stale",
        title: hospital.meta.staleReason
          ? `Dato recuperato dall'ultimo snapshot valido. Ultimo errore sorgente: ${hospital.meta.staleReason}.`
          : "Dato recuperato dall'ultimo snapshot valido."
      };
    }

    return {
      label: "Dato live",
      className: "live",
      title: "Dato letto dalla sorgente live corrente."
    };
  }

  function getHospitalTimeMeta(hospital, snapshot) {
    if (!hospital.hasData) {
      return {
        updatedLabel: "Dato non disponibile",
        snapshotLabel: "",
        isStale: false
      };
    }

    if (hospital.meta && hospital.meta.stale) {
      const carriedForwardAt =
        (hospital.meta && hospital.meta.carriedForwardFromSnapshot) ||
        (snapshot && snapshot.fetchedAt) ||
        null;

      return {
        updatedLabel: `Dato: ${formatDate(hospital.updatedAt)}`,
        snapshotLabel: carriedForwardAt ? `Snapshot: ${formatDate(carriedForwardAt)}` : "",
        isStale: true
      };
    }

    return {
      updatedLabel: `Agg.: ${formatDate(hospital.updatedAt || (snapshot && snapshot.fetchedAt))}`,
      snapshotLabel: "",
      isStale: false
    };
  }

  function render(snapshot) {
    currentSnapshot = snapshot;
    listEl.innerHTML = "";

    let hospitals = snapshot && Array.isArray(snapshot.hospitals) ? snapshot.hospitals : [];

    if (onlyOpenNow.checked) {
      hospitals = hospitals.filter((hospital) => hospital.hasData);
    }

    hospitals = hospitals.filter((hospital) => matchesDataStateFilters(hospital));

    const searchQuery = normalizeText(searchInput.value);
    hospitals = hospitals.filter((hospital) => matchesSearch(hospital, searchQuery));
    hospitals = sortHospitals(hospitals, sortSelect.value);

    updateSummary(snapshot, hospitals);

    if (!hospitals.length) {
      const emptyMessage = searchQuery
        ? "Nessuna struttura corrisponde alla ricerca."
        : !showLiveData.checked && !showSnapshotData.checked
          ? "Attiva almeno un filtro tra Dato live e Ultimo snapshot."
        : onlyOpenNow.checked
          ? "Nessuna struttura corrisponde ai filtri selezionati."
          : "Nessun dato disponibile.";

      listEl.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
      return;
    }

    const fragment = document.createDocumentFragment();
    let previousPriority = null;

    for (const hospital of hospitals) {
      const hospitalPriority = getHospitalPriority(hospital);

      if (hospitalPriority !== previousPriority) {
        const divider = document.createElement("div");
        divider.className = `hospital-group-divider group-${hospitalPriority}`;
        divider.textContent = getPriorityLabel(hospitalPriority);
        fragment.appendChild(divider);
        previousPriority = hospitalPriority;
      }

      const node = tpl.content.cloneNode(true);
      const row = node.querySelector(".hospital-row");

      node.querySelector(".hospital-name").textContent = hospital.name;
      node.querySelector(".hospital-address").textContent = hospital.address;
      node.querySelector(".value-red").textContent = getCountLabel(hospital, "red");
      node.querySelector(".value-orange").textContent = getCountLabel(hospital, "orange");
      node.querySelector(".value-green").textContent = getCountLabel(hospital, "green");
      node.querySelector(".value-blue").textContent = getCountLabel(hospital, "blue");
      node.querySelector(".value-white").textContent = getCountLabel(hospital, "white");
      const statusConfig = getHospitalStatus(hospital);
      const statusEl = node.querySelector(".data-status");
      const timingConfig = getHospitalTimeMeta(hospital, snapshot);
      const updatedAtEl = node.querySelector(".updated-at");
      const snapshotAtEl = node.querySelector(".snapshot-at");

      statusEl.textContent = statusConfig.label;
      statusEl.classList.add(statusConfig.className);
      statusEl.title = statusConfig.title;
      updatedAtEl.textContent = timingConfig.updatedLabel;
      updatedAtEl.classList.toggle("is-live", hospital.hasData && !timingConfig.isStale);
      updatedAtEl.classList.toggle("is-stale", timingConfig.isStale);
      snapshotAtEl.hidden = !timingConfig.snapshotLabel;
      snapshotAtEl.textContent = timingConfig.snapshotLabel;

      const totalValueEl = node.querySelector(".hospital-total-value");
      const totalLabelEl = node.querySelector(".hospital-total-label");
      totalValueEl.textContent = hospital.hasData ? String(hospital.total) : "—";
      totalLabelEl.textContent = hospital.hasData ? "in attesa" : "senza dato";

      const mapLink = node.querySelector(".map-link");
      mapLink.href = hospital.mapUrl;
      mapLink.setAttribute("aria-label", `Apri ${hospital.name} in mappa`);

      if (!hospital.hasData) {
        row.classList.add("is-unavailable");
      }

      fragment.appendChild(node);
    }

    listEl.appendChild(fragment);
  }

  function hydrateFromCache() {
    const cachedSnapshot = getCachedSnapshot();

    if (!cachedSnapshot) {
      return false;
    }

    render(cachedSnapshot);
    setStatus(navigator.onLine ? "Snapshot locale" : "Offline / cache");
    return true;
  }

  async function loadData() {
    setLoading(true);
    setStatus(currentSnapshot ? "Aggiornamento..." : "Caricamento...");

    try {
      const apiConfigured = isApiConfigured();
      const canReadPublishedSnapshot = global.location.protocol !== "file:";

      if (canReadPublishedSnapshot) {
        try {
          const liveSnapshot = await fetchPublishedSnapshot();
          saveSnapshot(liveSnapshot);
          render(liveSnapshot);
          setStatus("Snapshot live");
          setRuntimeNotice("");
          return;
        } catch (error) {
          console.error(error);
        }
      }

      if (apiConfigured) {
        try {
          const snapshot = await fetchTorinoHospitals();
          saveSnapshot(snapshot);
          render(snapshot);
          setStatus("Online");
          setRuntimeNotice("");
          return;
        } catch (error) {
          console.error(error);
        }
      }

      if (!apiConfigured && !currentSnapshot && canReadPublishedSnapshot) {
        setRuntimeNotice("Snapshot live non disponibile: visualizzo cache o dati mock finche non aggiorni il file generato o configuri APP_CONFIG.apiBaseUrl.");
      }

      const cachedSnapshot = getCachedSnapshot();

      if (cachedSnapshot) {
        render(cachedSnapshot);
        setStatus("Offline / cache");
        return;
      }

      const mockSnapshot = await fetchMockHospitals();
      saveSnapshot(mockSnapshot);
      render(mockSnapshot);
      setStatus("Mock locale");

      if (global.location.protocol === "file:") {
        setRuntimeNotice("Anteprima locale attiva da file: i dati mock funzionano, ma PWA e service worker richiedono HTTP/HTTPS.");
      } else if (canReadPublishedSnapshot) {
        setRuntimeNotice("Snapshot live non raggiungibile: sto mostrando dati locali di fallback.");
      } else if (apiConfigured) {
        setRuntimeNotice("Backend live non raggiungibile: sto mostrando i dati mock locali.");
      }
    } catch (error) {
      console.error(error);
      listEl.innerHTML = '<div class="empty-state">Impossibile caricare i dati.</div>';
      sourceLabelEl.textContent = "—";
      lastUpdatedEl.textContent = formatDate(loadLastSync());
      visibleCountEl.textContent = "—";
      coverageLabelEl.textContent = "—";
      setStatus("Errore");
      setRuntimeNotice("Il bootstrap JavaScript e terminato, ma non e stato possibile caricare ne API, ne cache, ne mock.");
    } finally {
      setLoading(false);
    }
  }

  refreshBtn.addEventListener("click", loadData);
  searchInput.addEventListener("input", () => {
    if (currentSnapshot) {
      render(currentSnapshot);
    }
  });
  sortSelect.addEventListener("change", () => {
    if (currentSnapshot) {
      render(currentSnapshot);
    }
  });
  showLiveData.addEventListener("change", () => {
    if (currentSnapshot) {
      render(currentSnapshot);
    }
  });
  showSnapshotData.addEventListener("change", () => {
    if (currentSnapshot) {
      render(currentSnapshot);
    }
  });
  onlyOpenNow.addEventListener("change", () => {
    if (currentSnapshot) {
      render(currentSnapshot);
    }
  });

  global.addEventListener("offline", () => {
    if (currentSnapshot) {
      setStatus("Offline");
    }
  });

  global.addEventListener("online", () => {
    if (!currentSnapshot) {
      return;
    }

    if (currentSnapshot.source === "api") {
      setStatus("Online");
      return;
    }

    setStatus("Rete disponibile");
  });

  if ("serviceWorker" in navigator && global.isSecureContext) {
    global.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(console.error);
    });
  }

  hydrateFromCache();
  loadData();
})(window);
