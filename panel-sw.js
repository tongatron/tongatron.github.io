const PANEL_CACHE = 'tongatron-panel-v1';
const PANEL_URLS = [
  '/panel.html',
  '/panel.webmanifest',
  '/img/panel-icon-192.png',
  '/img/panel-icon-512.png',
  '/img/panel-apple-touch-icon.png',
  '/img/robottino.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PANEL_CACHE).then((cache) => cache.addAll(PANEL_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== PANEL_CACHE)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  const isPanelNavigation =
    event.request.mode === 'navigate' &&
    (url.pathname === '/panel.html' || url.pathname === '/');
  const isPanelAsset =
    url.origin === self.location.origin &&
    (PANEL_URLS.includes(url.pathname) || url.pathname === '/test.html');

  if (!isPanelNavigation && !isPanelAsset) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(PANEL_CACHE).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(async () => {
        if (isPanelNavigation) {
          return (
            (await caches.match('/panel.html')) ||
            Response.error()
          );
        }

        return (
          (await caches.match(event.request)) ||
          Response.error()
        );
      }),
  );
});
