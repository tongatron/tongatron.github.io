const CACHE_VERSION = "voli-trn-v20260307-8";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=20260307-12",
  "./app.js?v=20260307-12",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/flag-piedmont.svg",
  "./assets/flag-sardinia.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        const clonedResponse = networkResponse.clone();
        caches.open(CACHE_VERSION).then((cache) => {
          cache.put(request, clonedResponse);
        });
        return networkResponse;
      });
    })
  );
});
