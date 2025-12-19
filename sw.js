const CACHE_NAME = 'futebol-cache-v2';
const urlsToCache = [
  '',
  'index.html',
  'jogador.html',
  'equipa.html',
  'equipas.html',
  'estatisticasequipa.html',
  'estatisticasjogadores.html',
  'jogos.html',
  'melhoresmarcadores.html',
  'tabeladepontuacao.html',
  'assets/css/main.css',
  'assets/js/main.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});


