/* ===============================
   VERSIONE APP
================================ */

const APP_VERSION = "1.1.3";
const CACHE_NAME = "app-cache-" + APP_VERSION;

/* ===============================
   FILE DA METTERE IN CACHE
================================ */

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json"
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

  // NON forziamo skipWaiting
});

/* ===============================
   ACTIVATE
================================ */

self.addEventListener("activate", (event) => {
  console.log("Activate SW versione:", APP_VERSION);

  // NON cancelliamo cache vecchie
  event.waitUntil(self.clients.claim());
});

/* ===============================
   FETCH - Cache First
================================ */

self.addEventListener("fetch", (event) => {
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
