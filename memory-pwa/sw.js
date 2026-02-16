const CACHE="memory-v3";

self.addEventListener("install",e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(["./","./index.html"]))
  );
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.map(k=>k!==CACHE&&caches.delete(k))
    ))
  );
});

self.addEventListener("fetch",e=>{
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request))
  );
});
