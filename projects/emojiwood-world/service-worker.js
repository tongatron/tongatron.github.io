const CACHE_NAME = 'emojiwood-world-v5';
const CORE_ASSETS = [
  '/projects/emojiwood-world/',
  '/projects/emojiwood-world/index.html',
  '/projects/emojiwood-world/styles.css?v=20260315-05',
  '/projects/emojiwood-world/game.js?v=20260315-05',
  '/projects/emojiwood-world/manifest.webmanifest?v=20260315-05',
  '/projects/emojiwood-world/icon.svg',
  '/projects/emojiwood-world/icon-192.png',
  '/projects/emojiwood-world/icon-512.png',
  '/projects/emojiwood-world/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  const isAppAsset = url.origin === self.location.origin && url.pathname.startsWith('/projects/emojiwood-world/');
  const isFreshFirst = event.request.mode === 'navigate'
    || ['script', 'style', 'manifest'].includes(event.request.destination);

  if (isAppAsset && isFreshFirst) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/projects/emojiwood-world/index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match('/projects/emojiwood-world/index.html'));
    })
  );
});
