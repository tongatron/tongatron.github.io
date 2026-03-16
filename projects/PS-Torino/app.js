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
  const sortSelect = document.getElementById("sortSelect");
  const onlyOpenNow = document.getElementById("onlyOpenNow");
  const lastUpdatedEl = document.getElementById("lastUpdated");
  const sourceLabelEl = document.getElementById("sourceLabel");
  const statusLabelEl = document.getElementById("statusLabel");
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

  function sortHospitals(hospitals, mode) {
    const items = [...hospitals];

    if (mode === "name") {
      return items.sort((a, b) => a.name.localeCompare(b.name, "it"));
    }

    if (mode === "red") {
      return items.sort((a, b) => b.red - a.red);
    }

    if (mode === "yellow") {
      return items.sort((a, b) => b.yellow - a.yellow);
    }

    if (mode === "green") {
      return items.sort((a, b) => b.green - a.green);
    }

    return items.sort((a, b) => b.total - a.total);
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

  function getCountLabel(hospital, key) {
    return hospital.hasData ? String(hospital[key]) : "—";
  }

  function render(snapshot) {
    currentSnapshot = snapshot;
    listEl.innerHTML = "";

    let hospitals = snapshot && Array.isArray(snapshot.hospitals) ? snapshot.hospitals : [];

    if (onlyOpenNow.checked) {
      hospitals = hospitals.filter((hospital) => hospital.hasData);
    }

    hospitals = sortHospitals(hospitals, sortSelect.value);

    if (!hospitals.length) {
      listEl.innerHTML = onlyOpenNow.checked
        ? '<div class="empty-state">Nessuna struttura con dati disponibili.</div>'
        : '<div class="empty-state">Nessun dato disponibile.</div>';
      lastUpdatedEl.textContent = formatDate(snapshot && snapshot.fetchedAt ? snapshot.fetchedAt : loadLastSync());
      sourceLabelEl.textContent = snapshot && snapshot.sourceLabel ? snapshot.sourceLabel : "—";
      return;
    }

    const fragment = document.createDocumentFragment();

    for (const hospital of hospitals) {
      const node = tpl.content.cloneNode(true);
      const article = node.querySelector(".card");

      node.querySelector(".hospital-name").textContent = hospital.name;
      node.querySelector(".hospital-address").textContent = hospital.address;
      node.querySelector(".hospital-total").textContent = hospital.hasData
        ? `${hospital.total} in attesa`
        : "Dato non disponibile";
      node.querySelector(".value-red").textContent = getCountLabel(hospital, "red");
      node.querySelector(".value-yellow").textContent = getCountLabel(hospital, "yellow");
      node.querySelector(".value-green").textContent = getCountLabel(hospital, "green");
      node.querySelector(".value-white").textContent = getCountLabel(hospital, "white");
      node.querySelector(".updated-at").textContent = `Agg.: ${formatDate(hospital.updatedAt || snapshot.fetchedAt)}`;

      const mapLink = node.querySelector(".map-link");
      mapLink.href = hospital.mapUrl;
      mapLink.setAttribute("aria-label", `Apri ${hospital.name} in mappa`);

      if (!hospital.hasData) {
        article.classList.add("is-unavailable");
      }

      fragment.appendChild(node);
    }

    listEl.appendChild(fragment);
    lastUpdatedEl.textContent = formatDate(snapshot.fetchedAt || loadLastSync());
    sourceLabelEl.textContent = snapshot.sourceLabel || snapshot.source || "cache";
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
    } catch (mockError) {
      console.error(mockError);
      listEl.innerHTML = '<div class="empty-state">Impossibile caricare i dati.</div>';
      sourceLabelEl.textContent = "—";
      lastUpdatedEl.textContent = formatDate(loadLastSync());
      setStatus("Errore");
      setRuntimeNotice("Il bootstrap JavaScript e terminato, ma non e stato possibile caricare ne API, ne cache, ne mock.");
    } finally {
      setLoading(false);
    }
  }

  refreshBtn.addEventListener("click", () => {
    loadData();
  });

  sortSelect.addEventListener("change", () => {
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
