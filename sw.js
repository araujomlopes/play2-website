const CACHE_NAME = 'futebol-cache-v3';
const STATIC_CACHE = 'static-v3';

const STATIC_ASSETS = [
  './',
  'index.html',
  'assets/css/main.css',
  'assets/js/main.js',
  'assets/images/perfil/default.png'
];

// =======================
// INSTALL
// =======================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// =======================
// ACTIVATE
// =======================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (![CACHE_NAME, STATIC_CACHE].includes(k)) {
            return caches.delete(k);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// =======================
// FETCH
// =======================
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // 1️⃣ GOOGLE SHEETS → NETWORK FIRST + FALLBACK
  if (url.includes('docs.google.com')) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 2️⃣ IMAGENS → CACHE FIRST
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request);
      })
    );
    return;
  }

  // 3️⃣ RESTO DO SITE
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
