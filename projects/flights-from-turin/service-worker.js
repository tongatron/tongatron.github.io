const CACHE_VERSION = "flights-from-turin-v20260312-13";
const APP_SHELL = [
  "./",
  "./index.html",
  "./vendor/bootstrap/bootstrap.min.css",
  "./vendor/bootstrap/bootstrap.bundle.min.js",
  "./vendor/bootstrap-icons/bootstrap-icons.css",
  "./vendor/bootstrap-icons/fonts/bootstrap-icons.woff2?e34853135f9e39acf64315236852cd5a",
  "./vendor/bootstrap-icons/fonts/bootstrap-icons.woff?e34853135f9e39acf64315236852cd5a",
  "./styles.css?v=20260312-11",
  "./app.js?v=20260312-03",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
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
