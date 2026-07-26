// JoraApps OS Engine v2.0.5
const CACHE_NAME = 'jora-apps-cache-v0.0.2';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html', // SPA asosiy kirish nuqtasi shart!
  '/manifest.json',
  '/offline.html',
  '/favicon.svg',
  '/favicon-16.png',
  '/favicon-36.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Eski kesh o‘chirildi:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// GET so'rovlarini to'g'ri keshdan va tarmoqdan qidirish logikasi
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // 🔥 Eng muhim joyi: Agar foydalanuvchi /apps yoki /profile kabi URL-larda sahifani yangilasa
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Internet bo'lmasa, har doim asosiy index.html qobig'ini beramiz (SPA o'zi yo'naltirishi uchun)
          return caches.match('/').then((response) => {
            return response || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Statik fayllar (Rasm, JS, CSS, Manifest) uchun kesh-birinchi va fonda yangilash strategiyasi
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => null);
        
        return cachedResponse;
      }

      return fetch(event.request).catch(() => {
        if (event.request.destination === 'image') {
          return caches.match('/icons/icon-192.png'); // Rasmlar topilmasa default ikonka
        }
      });
    })
  );
});

// Push bildirishnomalar kodlari o'zgarishsiz qoladi...
self.addEventListener('push', (event) => {
  let data = { title: 'JoraApps', body: 'Yangi bildirishnoma!' };
  if (event.data) {
    try { data = event.data.json(); } catch (e) { data = { title: 'JoraApps', body: event.data.text() }; }
  }
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/apps' }
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let c of clientList) { if (c.focused) client = c; }
        return client.focus();
      }
      return clients.openWindow(event.notification.data.url);
    })
  );
});

// Sahifalarni indekslash
async function indexContent() {
  if (!('index' in registration)) return;

  const routes = [
    { id: 'apps', title: 'Ilovalar', url: '/apps', icon: '/icons/icon-192.png' },
    { id: 'profile', title: 'Profilim', url: '/profile', icon: '/icons/icon-192.png' },
    { id: 'security', title: 'Xavfsizlik', url: '/security', icon: '/icons/icon-192.png' }
  ];

  for (const route of routes) {
    await registration.index.add({
      id: route.id,
      title: route.title,
      description: 'JoraApps sahifasi',
      launchUrl: route.url,
      icons: [{ src: route.icon, sizes: '192x192', type: 'image/png' }],
      category: 'article'
    });
  }
}

// SW o'rnatilganda ishga tushiring
self.addEventListener('activate', (event) => {
  event.waitUntil(indexContent());
});