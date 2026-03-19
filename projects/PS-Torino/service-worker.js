const CACHE_NAME = "ps-torino-v9";
const APP_SHELL_URL = new URL("./index.html", self.location.href).toString();
const LIVE_SNAPSHOT_URL = new URL("./data/live-torino.json", self.location.href).toString();
const NETWORK_TIMEOUT_MS = 4000;
const NETWORK_FIRST_URLS = new Set([
  APP_SHELL_URL,
  new URL("./styles.css", self.location.href).toString(),
  new URL("./app.js", self.location.href).toString(),
  new URL("./api.js", self.location.href).toString(),
  new URL("./storage.js", self.location.href).toString(),
  new URL("./config.js", self.location.href).toString(),
  new URL("./manifest.webmanifest", self.location.href).toString(),
  LIVE_SNAPSHOT_URL
]);
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./api.js",
  "./storage.js",
  "./config.js",
  "./manifest.webmanifest",
  "./data/live-torino.json",
  "./data/mock-torino.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  const fetchWithTimeout = (requestToFetch, timeoutMs = NETWORK_TIMEOUT_MS) => (
    new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Network timeout"));
      }, timeoutMs);

      fetch(requestToFetch)
        .then((response) => {
          clearTimeout(timeoutId);
          resolve(response);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    })
  );

  const updateCache = (networkResponse) => {
    if (networkResponse.ok && networkResponse.type === "basic") {
      const responseClone = networkResponse.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
    }

    return networkResponse;
  };

  if (request.method !== "GET") {
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetchWithTimeout(request).catch(() => caches.match(APP_SHELL_URL))
    );
    return;
  }

  if (NETWORK_FIRST_URLS.has(url.href)) {
    event.respondWith(
      fetchWithTimeout(request)
        .then(updateCache)
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then(updateCache);
    })
  );
});
