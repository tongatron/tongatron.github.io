(function bootstrapConfig(global) {
  const namespace = global.PSTorino || (global.PSTorino = {});

  namespace.APP_CONFIG = {
    // Backend pubblico primario per i dati live.
    apiBaseUrl: "https://api.prontosoccorso.live/api",
    region: "piemonte",
    province: "torino",
    cacheKey: "ps-torino:last-snapshot",
    cacheTimestampKey: "ps-torino:last-sync",
    appVersion: "0.2.0",
    liveSnapshotPath: "./data/live-torino.json",
    fallbackMockPath: "./data/mock-torino.json"
  };
})(window);
