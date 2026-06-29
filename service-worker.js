/* =====================================================================
   service-worker.js — offline cache for the PWA
   Cache-first for the app shell; network-falls-back-to-cache otherwise.
   ===================================================================== */

const CACHE = 'flt-pro-v2';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './nutrition-data.js',
  './storage.js',
  './meal-engine.js',
  './charts.js',
  './blood-report.js',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        // cache same-origin successful GETs
        if (res && res.status === 200 && new URL(req.url).origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
