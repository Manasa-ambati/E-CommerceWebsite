// Service Worker for Ultra-Fast Caching
const CACHE_NAME = 'shopease-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.*.css',
  '/static/js/main.*.js'
];

// Install event - cache critical files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return immediately
        if (response) {
          console.log('💾 Cache hit:', event.request.url);
          return response;
        }
        
        // Not in cache - fetch from network
        console.log('🌐 Network request:', event.request.url);
        return fetch(event.request).then(
          response => {
            // Don't cache non-success responses
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          }
        );
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if(cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
