const CACHE_NAME = 'buddy-planner-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/css/base.css',
  '/js/planner-interactive.js',
  '/js/theme-switcher.js',
  '/js/backup-manager.js',
  '/js/region-selector.js',
  '/js/stuck-buddy.js',
  '/img/logo.png',
  '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Assets (Network-First strategy to ensure latest changes are visible when online)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and http/https requests to avoid extension errors
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache the updated file dynamically
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network is unavailable (offline mode)
        return caches.match(event.request);
      })
  );
});
