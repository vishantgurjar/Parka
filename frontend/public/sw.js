const CACHE_NAME = 'Parxee-cache-v3';
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
  // Only intercept GET requests and HTTP/HTTPS protocols
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Handle SPA page navigations (e.g., /login, /register)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cachedIndex = await caches.match('/index.html');
        return cachedIndex || caches.match('/');
      })
    );
    return;
  }
  
  // Asset requests: network-first, fallback to cache if matched
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      return cached || new Response('', { status: 408, statusText: 'Request Timeout' });
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
      url: 'https://Parxee-city.vercel.app/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      if (windowClients.length > 0) {
        return windowClients[0].focus();
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
