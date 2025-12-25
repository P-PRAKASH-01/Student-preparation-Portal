// ===================================
// PrepHub Service Worker (FIXED)
// Prevents stale cache issues on GitHub Pages
// ===================================

const CACHE_VERSION = 'v1.1'; // 🔥 bump this when needed
const CACHE_NAME = `prephub-${CACHE_VERSION}`;

const STATIC_CACHE_URLS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// ---------------- INSTALL ----------------
self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_CACHE_URLS))
  );
});

// ---------------- ACTIVATE ----------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ---------------- FETCH ----------------
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Skip cross-origin
  if (!request.url.startsWith(self.location.origin)) return;

  // 🔥 NETWORK FIRST for HTML (prevents stale UI)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) =>
            cache.put('./index.html', copy)
          );
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // ⚡ CACHE FIRST for assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) =>
            cache.put(request, copy)
          );
        }
        return response;
      });
    })
  );
});
