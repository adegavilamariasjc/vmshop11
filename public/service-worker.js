// Service Worker ULTRA AGRESSIVO para limpar cache
// Versão única por deploy para forçar atualização
const CACHE_VERSION = 'v' + Date.now() + '-' + Math.random();
const CACHE_NAME = 'adega-vm-cache-' + CACHE_VERSION;

// Limpar todos os caches antigos na instalação
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando nova versão');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Service Worker: Limpando cache antigo:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.skipWaiting();
});

// Ativar e assumir controle imediatamente
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando e limpando caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('Service Worker: Removendo cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Sempre buscar da rede (sem cache) - MODO ULTRA AGRESSIVO
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }).catch((error) => {
      console.error('Fetch failed:', error);
      throw error;
    })
  );
});

// Mensagem para forçar atualização imediata
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
