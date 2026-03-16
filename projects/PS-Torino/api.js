(function bootstrapApi(global) {
  const namespace = global.PSTorino || (global.PSTorino = {});
  const { APP_CONFIG } = namespace;

  const HOSPITAL_CATALOG = [
    {
      id: "molinette",
      name: "AOU Citta della Salute e della Scienza - Molinette",
      address: "Corso Bramante 88, Torino",
      latitude: 45.039468,
      longitude: 7.674409
    },
    {
      id: "cto",
      name: "CTO Torino",
      address: "Via Zuretti 29, Torino",
      latitude: 45.033682,
      longitude: 7.673996
    },
    {
      id: "sant-anna",
      name: "Ospedale Sant'Anna",
      address: "Corso Spezia 60, Torino",
      latitude: 45.036144,
      longitude: 7.67402
    },
    {
      id: "regina-margherita",
      name: "Ospedale Regina Margherita",
      address: "Piazza Polonia 94, Torino",
      latitude: 45.034666,
      longitude: 7.674901
    },
    {
      id: "mauriziano",
      name: "Ospedale Mauriziano Umberto I",
      address: "Largo Filippo Turati 62, Torino",
      latitude: 45.05168,
      longitude: 7.665596
    },
    {
      id: "maria-vittoria",
      name: "Ospedale Maria Vittoria",
      address: "Via Cibrario 72, Torino",
      latitude: 45.081927,
      longitude: 7.656633
    },
    {
      id: "martini",
      name: "Ospedale Martini",
      address: "Via Tofane 71, Torino",
      latitude: 45.06709,
      longitude: 7.628532
    },
    {
      id: "oftalmico",
      name: "Ospedale Oftalmico",
      address: "Via Filippo Juvarra 19, Torino",
      latitude: 45.074562,
      longitude: 7.670831
    },
    {
      id: "san-giovanni-bosco",
      name: "Ospedale San Giovanni Bosco",
      address: "Piazza del Donatore di Sangue 3, Torino",
      latitude: 45.097766,
      longitude: 7.700378
    },
    {
      id: "san-luigi-orbassano",
      name: "AOU San Luigi Gonzaga di Orbassano",
      address: "Regione Gonzole 10, Orbassano",
      latitude: 45.02922,
      longitude: 7.555669
    },
    {
      id: "rivoli",
      name: "Ospedale di Rivoli",
      address: "Rivoli, TO",
      latitude: 45.061008,
      longitude: 7.51872
    },
    {
      id: "pinerolo",
      name: "Ospedale Edoardo Agnelli di Pinerolo",
      address: "Pinerolo, TO",
      latitude: 44.882703,
      longitude: 7.319632
    },
    {
      id: "susa",
      name: "Ospedale di Susa",
      address: "Susa, TO",
      latitude: 45.13746,
      longitude: 7.050801
    },
    {
      id: "moncalieri",
      name: "Ospedale Santa Croce di Moncalieri",
      address: "Moncalieri, TO",
      latitude: 45.001835,
      longitude: 7.689941
    },
    {
      id: "chieri",
      name: "Ospedale Maggiore di Chieri",
      address: "Chieri, TO",
      latitude: 45.010629,
      longitude: 7.823663
    },
    {
      id: "carmagnola",
      name: "Ospedale San Lorenzo di Carmagnola",
      address: "Carmagnola, TO",
      latitude: 44.846806,
      longitude: 7.716566
    },
    {
      id: "chivasso",
      name: "Ospedale di Chivasso",
      address: "Chivasso, TO",
      latitude: 45.19072,
      longitude: 7.89432
    },
    {
      id: "cirie",
      name: "Ospedale di Cirie",
      address: "Cirie, TO",
      latitude: 45.234122,
      longitude: 7.596507
    },
    {
      id: "ivrea",
      name: "Ospedale di Ivrea",
      address: "Ivrea, TO",
      latitude: 45.467174,
      longitude: 7.872281
    },
    {
      id: "cuorgne",
      name: "Ospedale di Cuorgne",
      address: "Cuorgne, TO",
      latitude: 45.386865,
      longitude: 7.649899
    }
  ];

  const HOSPITAL_CATALOG_KEYS = new Map();

  for (const hospital of HOSPITAL_CATALOG) {
    HOSPITAL_CATALOG_KEYS.set(buildCatalogKey(hospital.id), hospital);
    HOSPITAL_CATALOG_KEYS.set(buildCatalogKey(hospital.name), hospital);
  }

  function buildCatalogKey(value) {
    const normalizedValue = String(value || "");
    const canNormalize = typeof normalizedValue.normalize === "function";

    return (canNormalize ? normalizedValue.normalize("NFD") : normalizedValue)
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function buildFallbackId(item) {
    const seed = String(
      item.id || item.slug || item.codice || item.name || item.nome || item.descrizione || item.address || item.indirizzo || "struttura"
    );
    const fallbackId = buildCatalogKey(seed);

    return fallbackId || `struttura-${Date.now()}`;
  }

  function pickNumber(item, keys) {
    for (const key of keys) {
      const rawValue = item[key];

      if (rawValue === null || rawValue === undefined || rawValue === "") {
        continue;
      }

      const parsedValue = Number(rawValue);

      if (Number.isFinite(parsedValue)) {
        return parsedValue;
      }
    }

    return null;
  }

  function buildMapUrl(name, address) {
    const query = [name, address].filter(Boolean).join(", ") || address || name || "Pronto Soccorso Torino";
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  function resolveOrange(item) {
    const orange = pickNumber(item, ["orange", "arancione"]);

    if (orange !== null) {
      return orange;
    }

    const yellow = pickNumber(item, ["yellow", "giallo"]);
    return yellow === null ? 0 : yellow;
  }

  function resolveGreen(item) {
    const green = pickNumber(item, ["green", "verde"]);
    return green === null ? 0 : green;
  }

  function resolveBlue(item) {
    const blue = pickNumber(item, ["blue", "azzurro"]);
    return blue === null ? 0 : blue;
  }

  function hasExplicitData(item) {
    return pickNumber(item, [
      "total",
      "totale",
      "red",
      "rosso",
      "yellow",
      "giallo",
      "orange",
      "arancione",
      "green",
      "verde",
      "blue",
      "azzurro",
      "white",
      "bianco"
    ]) !== null;
  }

  function resolveCatalogHospital(item, fallbackId) {
    const keys = [
      item.id,
      item.slug,
      item.codice,
      item.name,
      item.nome,
      item.descrizione,
      fallbackId
    ];

    for (const key of keys) {
      const catalogKey = buildCatalogKey(key);

      if (catalogKey && HOSPITAL_CATALOG_KEYS.has(catalogKey)) {
        return HOSPITAL_CATALOG_KEYS.get(catalogKey);
      }
    }

    return null;
  }

  function normalizeHospital(item) {
    const fallbackId = buildFallbackId(item);
    const catalogHospital = resolveCatalogHospital(item, fallbackId);
    const red = pickNumber(item, ["red", "rosso"]);
    const orange = resolveOrange(item);
    const green = resolveGreen(item);
    const blue = resolveBlue(item);
    const white = pickNumber(item, ["white", "bianco"]);
    const total = pickNumber(item, ["total", "totale"]);
    const latitude = pickNumber(item, ["latitude", "lat", "latitudine"]);
    const longitude = pickNumber(item, ["longitude", "lng", "lon", "longitudine"]);
    const name = item.name || item.nome || item.descrizione || (catalogHospital ? catalogHospital.name : "Struttura");
    const address = item.address || item.indirizzo || (catalogHospital ? catalogHospital.address : "Indirizzo non disponibile");
    const hasData = typeof item.hasData === "boolean" ? item.hasData : hasExplicitData(item);

    return {
      id: catalogHospital ? catalogHospital.id : fallbackId,
      name: catalogHospital ? catalogHospital.name : name,
      address: catalogHospital ? catalogHospital.address : address,
      mapUrl:
        item.mapUrl ||
        item.mappa ||
        buildMapUrl(catalogHospital ? catalogHospital.name : name, catalogHospital ? catalogHospital.address : address),
      red: red === null ? 0 : red,
      orange: orange === null ? 0 : orange,
      yellow: orange === null ? 0 : orange,
      green: green === null ? 0 : green,
      blue: blue === null ? 0 : blue,
      white: white === null ? 0 : white,
      total: total === null
        ? (red === null ? 0 : red) + (orange === null ? 0 : orange) + (green === null ? 0 : green) + (blue === null ? 0 : blue) + (white === null ? 0 : white)
        : total,
      latitude: latitude === null ? (catalogHospital ? catalogHospital.latitude || null : null) : latitude,
      longitude: longitude === null ? (catalogHospital ? catalogHospital.longitude || null : null) : longitude,
      updatedAt: item.updatedAt || item.aggiornato_alle || item.updated_at || null,
      hasData,
      meta: item.meta || {}
    };
  }

  function createCatalogPlaceholder(hospital) {
    return {
      id: hospital.id,
      name: hospital.name,
      address: hospital.address,
      mapUrl: buildMapUrl(hospital.name, hospital.address),
      red: 0,
      orange: 0,
      yellow: 0,
      green: 0,
      blue: 0,
      white: 0,
      total: 0,
      latitude: hospital.latitude || null,
      longitude: hospital.longitude || null,
      updatedAt: null,
      hasData: false,
      meta: {
        catalogOnly: true
      }
    };
  }

  function mergeHospitalsWithCatalog(hospitals) {
    const mergedHospitals = HOSPITAL_CATALOG.map(createCatalogPlaceholder);
    const mergedIndex = new Map();
    const extras = [];

    for (let index = 0; index < mergedHospitals.length; index += 1) {
      mergedIndex.set(mergedHospitals[index].id, index);
    }

    for (const hospital of hospitals) {
      if (mergedIndex.has(hospital.id)) {
        mergedHospitals[mergedIndex.get(hospital.id)] = hospital;
        continue;
      }

      extras.push(hospital);
    }

    return mergedHospitals.concat(
      extras.sort((left, right) => left.name.localeCompare(right.name, "it"))
    );
  }

  function extractHospitalArray(payload) {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload && Array.isArray(payload.data)) {
      return payload.data;
    }

    if (payload && Array.isArray(payload.hospitals)) {
      return payload.hospitals;
    }

    if (payload && Array.isArray(payload.items)) {
      return payload.items;
    }

    return [];
  }

  function resolveFetchedAt(payload) {
    if (payload && payload.fetchedAt) {
      return payload.fetchedAt;
    }

    if (payload && payload.updatedAt) {
      return payload.updatedAt;
    }

    if (payload && payload.timestamp) {
      return payload.timestamp;
    }

    return new Date().toISOString();
  }

  function ensureConfiguredApi() {
    const apiBaseUrl = APP_CONFIG.apiBaseUrl ? APP_CONFIG.apiBaseUrl.trim() : "";

    if (!apiBaseUrl || apiBaseUrl.includes("TUO-BACKEND") || apiBaseUrl.includes("example.com")) {
      throw new Error("API non configurata");
    }

    return apiBaseUrl.replace(/\/+$/, "");
  }

  namespace.isApiConfigured = function isApiConfigured() {
    try {
      ensureConfiguredApi();
      return true;
    } catch (error) {
      return false;
    }
  };

  function readEmbeddedMock() {
    const embeddedMockNode = document.getElementById("mockData");

    if (!embeddedMockNode || !embeddedMockNode.textContent || !embeddedMockNode.textContent.trim()) {
      return null;
    }

    try {
      return JSON.parse(embeddedMockNode.textContent);
    } catch (error) {
      console.error("Mock embedded non valido", error);
      return null;
    }
  }

  function normalizeSnapshot(payload, fallbackSource, fallbackSourceLabel) {
    const hospitals = extractHospitalArray(payload).map(normalizeHospital);

    return {
      source: payload && payload.source ? payload.source : fallbackSource,
      sourceLabel: payload && payload.sourceLabel ? payload.sourceLabel : fallbackSourceLabel,
      fetchedAt: resolveFetchedAt(payload),
      hospitals: mergeHospitalsWithCatalog(hospitals)
    };
  }

  namespace.normalizeSnapshotPayload = normalizeSnapshot;

  namespace.fetchTorinoHospitals = async function fetchTorinoHospitals() {
    const apiBaseUrl = ensureConfiguredApi();
    const url = `${apiBaseUrl}/${APP_CONFIG.region}/${APP_CONFIG.province}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json"
      }
    });

    if (!res.ok) {
      throw new Error(`Errore API: ${res.status}`);
    }

    const payload = await res.json();
    return normalizeSnapshot(payload, "api", "API remota");
  };

  namespace.fetchPublishedSnapshot = async function fetchPublishedSnapshot() {
    const liveSnapshotUrl = new URL(APP_CONFIG.liveSnapshotPath, global.location.href).toString();
    const res = await fetch(liveSnapshotUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json"
      }
    });

    if (!res.ok) {
      throw new Error(`Errore snapshot live: ${res.status}`);
    }

    const payload = await res.json();
    return normalizeSnapshot(payload, "live-snapshot", "Snapshot live");
  };

  namespace.fetchMockHospitals = async function fetchMockHospitals() {
    if (global.location.protocol === "file:") {
      const embeddedPayload = readEmbeddedMock();

      if (!embeddedPayload) {
        throw new Error("Mock embedded non disponibile");
      }

      return normalizeSnapshot(embeddedPayload, "mock", "Mock locale");
    }

    try {
      const mockUrl = new URL(APP_CONFIG.fallbackMockPath, global.location.href).toString();
      const res = await fetch(mockUrl);

      if (!res.ok) {
        throw new Error(`Errore mock: ${res.status}`);
      }

      const payload = await res.json();
      return normalizeSnapshot(payload, "mock", "Mock locale");
    } catch (error) {
      const embeddedPayload = readEmbeddedMock();

      if (!embeddedPayload) {
        throw error;
      }

      return normalizeSnapshot(embeddedPayload, "mock", "Mock embedded");
    }
  };
})(window);
