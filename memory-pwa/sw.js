/* ===============================
   CONFIGURAZIONE VERSIONE
================================ */

const APP_VERSION = "1.0.4";   // ← aggiorna qui quando fai release
const CACHE_NAME = "app-cache-" + APP_VERSION;

/* ===============================
   FILE DA METTERE IN CACHE
================================ */

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

/* ===============================
   INSTALL
================================ */

self.addEventListener("install", (event) => {
  console.log("SW installato - versione", APP_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );

  // NON forziamo skipWaiting qui
  // aspettiamo conferma utente
});

/* ===============================
   ACTIVATE
================================ */

self.addEventListener("activate", (event) => {
  console.log("SW attivato - versione", APP_VERSION);

  // NON cancelliamo vecchie cache
  // come richiesto

  return self.clients.claim();
});

/* ===============================
   FETCH STRATEGY
   Cache First
================================ */

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

/* ===============================
   MESSAGGI DALLA PAGINA
================================ */

self.addEventListener("message", (event) => {

  // Richiesta versione
  if (event.data && event.data.type === "GET_VERSION") {
    event.source.postMessage({
      type: "VERSION",
      version: APP_VERSION
    });
  }

  // Conferma aggiornamento da utente
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/* ===============================
   NOTIFICA NUOVA VERSIONE
================================ */

// Quando un nuovo SW entra in waiting
self.addEventListener("install", (event) => {
  self.addEventListener("statechange", () => {
    if (self.registration.waiting) {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: "UPDATE_AVAILABLE",
            version: APP_VERSION
          });
        });
      });
    }
  });
});
