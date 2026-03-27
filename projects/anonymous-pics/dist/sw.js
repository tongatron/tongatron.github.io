const CACHE_NAME = "anonymous-pics-v2";
const APP_SHELL = [
  "/projects/anonymous-pics/",
  "/projects/anonymous-pics/manifest.webmanifest",
  "/projects/anonymous-pics/icons/icon-192.png",
  "/projects/anonymous-pics/icons/icon-512.png",
];

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return caches.match("/projects/anonymous-pics/");
  }
}

async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);

  const networkFetch = fetch(request)
    .then((networkResponse) => {
      if (
        networkResponse &&
        networkResponse.status === 200 &&
        networkResponse.type !== "opaque"
      ) {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse.clone());
        });
      }

      return networkResponse;
    })
    .catch(() => cachedResponse);

  return cachedResponse || networkFetch;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(staleWhileRevalidate(event.request));
});
