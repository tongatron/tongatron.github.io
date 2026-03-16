(function bootstrapConfig(global) {
  const namespace = global.PSTorino || (global.PSTorino = {});

  namespace.APP_CONFIG = {
    // GitHub Pages non puo eseguire Laravel/PHP: qui va l'URL HTTPS di un backend esterno gia deployato.
    apiBaseUrl: "",
    region: "piemonte",
    province: "torino",
    cacheKey: "ps-torino:last-snapshot",
    cacheTimestampKey: "ps-torino:last-sync",
    appVersion: "0.2.0",
    liveSnapshotPath: "./data/live-torino.json",
    fallbackMockPath: "./data/mock-torino.json"
  };
})(window);
