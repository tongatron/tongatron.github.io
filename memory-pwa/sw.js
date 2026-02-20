/* ===============================
   VERSIONE APP
================================ */

const APP_VERSION = "1.1.10";
const CACHE_NAME = "app-cache-" + APP_VERSION;

/* ===============================
   FILE DA METTERE IN CACHE
================================ */

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/style.css",
  "/app.js",
  "/icon-192.png",
  "/icon-512.png"
];

/* ===============================
   INSTALL
================================ */

self.addEventListener("install", (event) => {
  console.log("Install SW versione:", APP_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );

  // Attiva subito la nuova versione.
  self.skipWaiting();
});

/* ===============================
   ACTIVATE
================================ */

self.addEventListener("activate", (event) => {
  console.log("Activate SW versione:", APP_VERSION);

  // Pulisce tutte le cache di versioni precedenti.
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* ===============================
   FETCH - Cache First
================================ */

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Navigazioni: prova rete, fallback cache/offline.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Asset same-origin: cache first con fallback rete.
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

/* ===============================
   MESSAGGI
================================ */

self.addEventListener("message", (event) => {

  if (event.data?.type === "GET_VERSION") {
    event.source.postMessage({
      type: "VERSION",
      version: APP_VERSION
    });
  }

  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

});
