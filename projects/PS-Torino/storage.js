(function bootstrapStorage(global) {
  const namespace = global.PSTorino || (global.PSTorino = {});
  const { APP_CONFIG } = namespace;

  function getStorage() {
    try {
      return global.localStorage;
    } catch (error) {
      return null;
    }
  }

  namespace.saveSnapshot = function saveSnapshot(data) {
    const storage = getStorage();

    if (!storage) {
      return;
    }

    storage.setItem(APP_CONFIG.cacheKey, JSON.stringify(data));
    storage.setItem(APP_CONFIG.cacheTimestampKey, new Date().toISOString());
  };

  namespace.loadSnapshot = function loadSnapshot() {
    const storage = getStorage();

    if (!storage) {
      return null;
    }

    const raw = storage.getItem(APP_CONFIG.cacheKey);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      storage.removeItem(APP_CONFIG.cacheKey);
      return null;
    }
  };

  namespace.loadLastSync = function loadLastSync() {
    const storage = getStorage();

    if (!storage) {
      return null;
    }

    return storage.getItem(APP_CONFIG.cacheTimestampKey);
  };
})(window);
