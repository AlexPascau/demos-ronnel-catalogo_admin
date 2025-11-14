const CACHE_NAME = 'admin-catalogo-v1';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './css/modal.css',
  './js/app.js',
  './js/product-manager.js',
  './js/image-editor.js',
  './manifest.json',
  './images/icon-192.png',
  './images/icon-512.png',
  './images/placeholder.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Cache abierto para Admin');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      }
    )
  );
});