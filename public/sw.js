const CACHE_NAME = 'horemow-app-shell-v1';
const APP_SHELL = [
  '/manifest.webmanifest',
  '/favicon.svg',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const indexResponse = await fetch('/', { cache: 'no-store' });

      if (!indexResponse.ok) {
        throw new Error(`Unable to precache app shell: HTTP ${indexResponse.status}`);
      }

      const indexHtml = await indexResponse.clone().text();
      const assetPaths = Array.from(
        indexHtml.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g),
        (match) => match[1],
      );

      await cache.put('/', indexResponse);
      await cache.addAll([...APP_SHELL, ...assetPaths]);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('horemow-app-shell-') && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match('/')) || Response.error()),
    );
    return;
  }

  if (url.pathname.startsWith('/assets/') || APP_SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request).then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return response;
        });
      }),
    );
  }
});
