const CACHE_VERSION = 'torino-line-radar-v1'
const APP_BASE_URL = new URL('./', self.location.href)
const SHELL_CACHE = `${CACHE_VERSION}-shell`
const ASSET_CACHE = `${CACHE_VERSION}-assets`
const DATA_CACHE = `${CACHE_VERSION}-data`
const TILE_CACHE = `${CACHE_VERSION}-tiles`

const APP_INDEX_URL = new URL('index.html', APP_BASE_URL).toString()
const MANIFEST_URL = new URL('manifest.webmanifest', APP_BASE_URL).toString()
const STATIC_ICON_URLS = [
  new URL('favicon.svg', APP_BASE_URL).toString(),
  new URL('apple-touch-icon.png', APP_BASE_URL).toString(),
  new URL('pwa-icon-192.png', APP_BASE_URL).toString(),
  new URL('pwa-icon-512.png', APP_BASE_URL).toString(),
  new URL('pwa-maskable-192.png', APP_BASE_URL).toString(),
  new URL('pwa-maskable-512.png', APP_BASE_URL).toString(),
]

async function collectShellUrls() {
  const shellUrls = new Set([
    new URL('./', APP_BASE_URL).toString(),
    APP_INDEX_URL,
    MANIFEST_URL,
    ...STATIC_ICON_URLS,
  ])

  try {
    const indexResponse = await fetch(APP_INDEX_URL, { cache: 'no-store' })
    if (indexResponse.ok) {
      const indexHtml = await indexResponse.text()
      const assetMatches = indexHtml.matchAll(
        /<(?:script|link)\b[^>]+(?:src|href)="([^"]+)"/g,
      )

      for (const match of assetMatches) {
        const assetUrl = new URL(match[1], APP_BASE_URL)
        if (assetUrl.origin === self.location.origin) {
          shellUrls.add(assetUrl.toString())
        }
      }
    }
  } catch (error) {
    console.warn('[sw] Unable to collect app shell assets.', error)
  }

  return Array.from(shellUrls)
}

async function installShellCache() {
  const cache = await caches.open(SHELL_CACHE)
  const shellUrls = await collectShellUrls()
  const requests = shellUrls.map((url) => new Request(url, { cache: 'reload' }))
  await cache.addAll(requests)
}

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName)

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    if (fallbackUrl) {
      const fallbackResponse = await caches.match(fallbackUrl)
      if (fallbackResponse) {
        return fallbackResponse
      }
    }

    throw error
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)

  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        void cache.put(request, networkResponse.clone())
      }
      return networkResponse
    })
    .catch(() => null)

  if (cachedResponse) {
    void networkPromise
    return cachedResponse
  }

  const networkResponse = await networkPromise
  if (networkResponse) {
    return networkResponse
  }

  return new Response('Offline', {
    status: 503,
    statusText: 'Offline',
  })
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    installShellCache().then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter((cacheName) => !cacheName.startsWith(CACHE_VERSION))
          .map((cacheName) => caches.delete(cacheName)),
      )

      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') {
    return
  }

  const requestUrl = new URL(request.url)

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, SHELL_CACHE, APP_INDEX_URL))
    return
  }

  if (
    requestUrl.origin === self.location.origin &&
    requestUrl.pathname.startsWith('/api/vehicles')
  ) {
    event.respondWith(networkFirst(request, DATA_CACHE))
    return
  }

  if (requestUrl.hostname.endsWith('cartocdn.com')) {
    event.respondWith(staleWhileRevalidate(request, TILE_CACHE))
    return
  }

  if (
    requestUrl.origin === self.location.origin &&
    ['document', 'script', 'style', 'font', 'image'].includes(request.destination)
  ) {
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE))
  }
})
