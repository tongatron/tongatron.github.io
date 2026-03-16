(function bootstrapApi(global) {
  const namespace = global.PSTorino || (global.PSTorino = {});
  const { APP_CONFIG } = namespace;

  function buildFallbackId(item) {
    const seed = String(
      item.id || item.slug || item.name || item.nome || item.address || item.indirizzo || "struttura"
    );

    return seed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `struttura-${Date.now()}`;
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

  function resolveYellow(item) {
    const yellow = pickNumber(item, ["yellow"]);

    if (yellow !== null) {
      return yellow;
    }

    const giallo = pickNumber(item, ["giallo"]);
    const arancione = pickNumber(item, ["arancione"]);

    return (giallo === null ? 0 : giallo) + (arancione === null ? 0 : arancione);
  }

  function resolveGreen(item) {
    const green = pickNumber(item, ["green"]);

    if (green !== null) {
      return green;
    }

    const verde = pickNumber(item, ["verde"]);
    const azzurro = pickNumber(item, ["azzurro"]);

    return (verde === null ? 0 : verde) + (azzurro === null ? 0 : azzurro);
  }

  function hasExplicitData(item) {
    return pickNumber(item, [
      "total",
      "totale",
      "red",
      "rosso",
      "yellow",
      "giallo",
      "arancione",
      "green",
      "verde",
      "azzurro",
      "white",
      "bianco"
    ]) !== null;
  }

  function normalizeHospital(item) {
    const red = pickNumber(item, ["red", "rosso"]);
    const yellow = resolveYellow(item);
    const green = resolveGreen(item);
    const white = pickNumber(item, ["white", "bianco"]);
    const total = pickNumber(item, ["total", "totale"]);
    const address = item.address || item.indirizzo || "Indirizzo non disponibile";

    return {
      id: buildFallbackId(item),
      name: item.name || item.nome || "Struttura",
      address,
      mapUrl:
        item.mapUrl ||
        item.mappa ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      red: red === null ? 0 : red,
      yellow: yellow === null ? 0 : yellow,
      green: green === null ? 0 : green,
      white: white === null ? 0 : white,
      total: total === null
        ? (red === null ? 0 : red) + (yellow === null ? 0 : yellow) + (green === null ? 0 : green) + (white === null ? 0 : white)
        : total,
      updatedAt: item.updatedAt || item.aggiornato_alle || item.updated_at || null,
      hasData: hasExplicitData(item)
    };
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
    const hospitals = extractHospitalArray(payload);

    return {
      source: "api",
      sourceLabel: "API remota",
      fetchedAt: resolveFetchedAt(payload),
      hospitals: hospitals.map(normalizeHospital)
    };
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
    const hospitals = extractHospitalArray(payload);

    if (!hospitals.length) {
      throw new Error("Snapshot live vuoto");
    }

    return {
      source: "live-snapshot",
      sourceLabel: payload.sourceLabel || "Snapshot live",
      fetchedAt: resolveFetchedAt(payload),
      hospitals: hospitals.map(normalizeHospital)
    };
  };

  namespace.fetchMockHospitals = async function fetchMockHospitals() {
    if (global.location.protocol === "file:") {
      const embeddedPayload = readEmbeddedMock();

      if (!embeddedPayload) {
        throw new Error("Mock embedded non disponibile");
      }

      return {
        source: "mock",
        sourceLabel: "Mock locale",
        fetchedAt: resolveFetchedAt(embeddedPayload),
        hospitals: extractHospitalArray(embeddedPayload).map(normalizeHospital)
      };
    }

    try {
      const mockUrl = new URL(APP_CONFIG.fallbackMockPath, global.location.href).toString();
      const res = await fetch(mockUrl);

      if (!res.ok) {
        throw new Error(`Errore mock: ${res.status}`);
      }

      const payload = await res.json();

      return {
        source: "mock",
        sourceLabel: "Mock locale",
        fetchedAt: resolveFetchedAt(payload),
        hospitals: extractHospitalArray(payload).map(normalizeHospital)
      };
    } catch (error) {
      const embeddedPayload = readEmbeddedMock();

      if (!embeddedPayload) {
        throw error;
      }

      return {
        source: "mock",
        sourceLabel: "Mock embedded",
        fetchedAt: resolveFetchedAt(embeddedPayload),
        hospitals: extractHospitalArray(embeddedPayload).map(normalizeHospital)
      };
    }
  };
})(window);
