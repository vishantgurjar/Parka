const CACHE_NAME = 'Parxee-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/logo.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force immediate activation
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Simple network-first strategy to avoid stale content
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// --- PUSH NOTIFICATIONS ---

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Parxéé City Alert';
  const options = {
    body: data.body || 'You have a new update.',
    icon: data.icon || '/logo.png',
    badge: '/logo.png',
    data: {
      url: 'https://Parxee-city.vercel.app/' // Assuming production url
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if open
      if (windowClients.length > 0) {
        return windowClients[0].focus();
      }
      // Otherwise open new
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
