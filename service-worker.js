// ===================================
// PrepHub Service Worker (STABLE)
// Auto-updates + No stale cache issues
// Works perfectly on GitHub Pages
// ===================================

const CACHE_VERSION = 'v1.2'; // 🔥 bump on major updates
const CACHE_NAME = `prephub-${CACHE_VERSION}`;

// Files that must be cached
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
  self.skipWaiting(); // activate immediately

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE_URLS);
    })
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
    ).then(() => self.clients.claim()) // take control instantly
  );
});

// ---------------- FETCH ----------------
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignore non-GET requests
  if (request.method !== 'GET') return;

  // Ignore cross-origin requests
  if (!request.url.startsWith(self.location.origin)) return;

  // 🌐 NETWORK FIRST for HTML navigation
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put('./index.html', copy);
          });
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // ⚡ CACHE FIRST for static assets (CSS, JS, icons)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, copy);
            });
          }
          return response;
        })
        .catch(() => {
          // Optional: fallback if needed later
        });
    })
  );
});
