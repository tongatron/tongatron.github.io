const APP_VERSION = "1.5.0";
const CACHE_PREFIX = "qrscanner-cache";
const CACHE_NAME = `${CACHE_PREFIX}-${APP_VERSION}`;
const APP_SHELL = [
  "./",
  "./?v=1.5.0",
  "./?v=1.5.0&source=pwa",
  "./?v=1.5.0&source=shortcut",
  "./index.html",
  "./style.css?v=1.5.0",
  "./app.js?v=1.5.0",
  "./vendor/jsQR.min.js?v=1.5.0",
  "./manifest.webmanifest?v=1.5.0",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-192.png",
  "./icons/maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(APP_SHELL);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const oldKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME);
      await Promise.all(oldKeys.map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

async function fromNetworkThenCache(request) {
  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) {
        event.waitUntil(
          fromNetworkThenCache(event.request).catch(() => {
            return null;
          })
        );
        return cached;
      }

      try {
        return await fromNetworkThenCache(event.request);
      } catch (error) {
        if (event.request.mode === "navigate") {
          const fallback = await caches.match("./index.html");
          if (fallback) {
            return fallback;
          }
        }
        throw error;
      }
    })()
  );
});
