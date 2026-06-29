// Service worker disabled — app updates frequently and cached JS causes crashes.
// This SW exists only to unregister itself from browsers that have an old version cached.
self.addEventListener('install', (e) => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// Pass-through: only handle same-origin, let browser handle the rest
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (url.origin === self.location.origin) {
    e.respondWith(fetch(e.request))
  }
})
