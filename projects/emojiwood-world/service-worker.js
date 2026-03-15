const CACHE_NAME = 'emojiwood-world-v2';
const CORE_ASSETS = [
  '/projects/emojiwood-world/',
  '/projects/emojiwood-world/index.html',
  '/projects/emojiwood-world/styles.css',
  '/projects/emojiwood-world/game.js',
  '/projects/emojiwood-world/manifest.webmanifest',
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
