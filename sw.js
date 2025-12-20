const CACHE_NAME = 'futebol-cache-v2';
const urlsToCache = [
  './',
  'index.html',
  'assets/css/main.css',
  'assets/js/main.js',
  'assets/images/perfil/default.png'
];

// Instalação: cache inicial
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Ativação: limpar caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Interceptar fetch
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // 1️⃣ GOOGLE SHEETS: network-first
  if (url.includes('docs.google.com')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 2️⃣ Imagens: cache-first com fallback
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request)
        .then(cached => cached || fetch(event.request))
        .catch(() => caches.match('/assets/images/perfil/default.png'))
    );
    return;
  }

  // 3️⃣ HTML/JS/CSS: cache-first, atualizar em background
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request)
        .then(fetchResponse => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, fetchResponse.clone()));
          return fetchResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
