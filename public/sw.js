const CACHE_VERSION = 'v3';
const CACHE_NAME = `unihairshop-${CACHE_VERSION}`;
const FONTS_CACHE_NAME = `unihairshop-fonts-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable.png',
  '/icons/apple-touch-icon.png',
  '/icons/icon.svg',
  '/images/barber_service.jpg',
  '/images/hair_braids.jpg',
  '/images/nail_art.jpg',
  '/images/makeup_glam.jpg',
  '/images/hair_product.jpg',
  '/images/grooming_kit.jpg',
  '/images/cosmetics_set.jpg',
  '/images/hero_banner.jpg'
];

// Install Event - Precache core static assets & shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching app shell & static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up obsolete caches
self.addEventListener('activate', (event) => {
  const allowedCaches = [CACHE_NAME, FONTS_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (!allowedCaches.includes(cache)) {
            console.log('[SW] Clearing old cache bucket:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Dynamic caching strategies
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Google Fonts Cache Strategy (Cache-First)
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONTS_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // 2. Navigation Requests (HTML) -> Network-First with Offline App-Shell Fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        return (await caches.match('/index.html')) || (await caches.match('/'));
      })
    );
    return;
  }

  // 3. Static Assets & Images (Stale-While-Revalidate)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Silent catch for offline image/asset fetching
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Push Notifications - shows an OS-level notification when the send-push
// Edge Function delivers one (new message, booking confirmed/completed/cancelled)
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'UniHairShop', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'UniHairShop';
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url || '/' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Clicking a notification focuses an existing tab (navigating it to the
// relevant view) or opens a new one if the app isn't already open.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => c.url.startsWith(self.location.origin));
      if (existing) {
        existing.focus();
        if ('navigate' in existing) {
          return existing.navigate(targetUrl);
        }
        return null;
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
