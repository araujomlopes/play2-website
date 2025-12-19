const CACHE_NAME = 'futebol-cache-v2';

const urlsToCache = [
  './',
  'index.html',
  'assets/css/main.css',
  'assets/js/main.js',
  'assets/images/perfil/default.png'
];



self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Retorna do cache
        return cachedResponse;
      }
      // Se não estiver no cache, busca online
      return fetch(event.request).then(fetchResponse => {
        // Guarda no cache para a próxima vez
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      }).catch(() => {
        // Se estiver offline e não houver cache, podemos devolver fallback opcional
        // Por exemplo uma imagem padrão ou HTML simples
        if (event.request.destination === 'image') {
          return caches.match('/assets/images/perfil/default.png');
        }
      });
    })
  );
});



