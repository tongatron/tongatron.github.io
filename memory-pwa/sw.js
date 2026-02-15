const CACHE_NAME = 'memory-pwa-v2'; // cambia versione ad ogni update
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', e => {
  // cancella vecchie cache
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(k => { if(k !== CACHE_NAME) return caches.delete(k); }))
    )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});
