/* Noted — service worker
   Offline-first app shell + runtime caching + push notification handling.
   Bump CACHE_VERSION whenever the shell changes to force an update. */

const CACHE_VERSION = 'noted-v2';
const CORE_CACHE = `${CACHE_VERSION}-core`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// The minimum needed to boot the app offline. Everything else (the .jsx
// modules, svgs, fonts) is picked up by the runtime cache on first visit.
const CORE_ASSETS = [
  'Noted.html',
  'pwa.js',
  'tokens.css',
  'app.css',
  'manifest.json',
  'assets/noted-wordmark.svg',
  'assets/noted-mark.svg',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/apple-touch-icon.png',
  // CDN runtime (CORS-enabled, so these cache cleanly)
  'https://unpkg.com/react@18.3.1/umd/react.development.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone@7.29.0/babel.min.js',
  'https://unpkg.com/@supabase/supabase-js@2.45.4/dist/umd/supabase.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE_CACHE);
    // Add individually so one missing/blocked asset can't fail the whole install.
    await Promise.all(CORE_ASSETS.map(async (url) => {
      try { await cache.add(new Request(url, { cache: 'reload' })); }
      catch (e) { /* skip assets that can't be fetched at install time */ }
    }));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => !k.startsWith(CACHE_VERSION)).map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

// Strategy:
//  - Navigations: network-first, fall back to cached Noted.html (offline shell).
//  - Same-origin GET: stale-while-revalidate (fast + self-healing).
//  - Cross-origin GET (CDN/fonts): cache-first, then network.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        return (await caches.match('Noted.html')) ||
               (await caches.match(req)) ||
               Response.error();
      }
    })());
    return;
  }

  if (isSameOrigin) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      const network = fetch(req).then(async (res) => {
        if (res && res.ok) {
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(req, res.clone());
        }
        return res;
      }).catch(() => null);
      return cached || (await network) || Response.error();
    })());
    return;
  }

  // Cross-origin: cache-first
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res && (res.ok || res.type === 'opaque')) {
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(req, res.clone());
      }
      return res;
    } catch (e) {
      return cached || Response.error();
    }
  })());
});

/* ---------------- Push notifications ----------------
   Works end-to-end once a backend sends a push with a VAPID key.
   Until then, notifications are triggered locally from the app
   (registration.showNotification) which exercises this same UI. */

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (e) { data = { body: event.data && event.data.text() }; }

  const title = data.title || 'Noted';
  const options = {
    body: data.body || 'Time for a quick check-in. Logging takes under 30 seconds.',
    icon: 'assets/icons/icon-192.png',
    badge: 'assets/icons/icon-192.png',
    tag: data.tag || 'noted-reminder',
    renotify: true,
    data: { url: data.url || 'Noted.html?action=log&source=push' },
    actions: [
      { action: 'log', title: 'Log a symptom' },
      { action: 'dismiss', title: 'Not now' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const target = event.action === 'log'
    ? 'Noted.html?action=log&source=push'
    : (event.notification.data && event.notification.data.url) || 'Noted.html?source=push';

  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of all) {
      if ('focus' in client) {
        client.postMessage({ type: 'notification-open', url: target });
        return client.focus();
      }
    }
    if (self.clients.openWindow) return self.clients.openWindow(target);
  })());
});

// Allow the page to ask the SW to update immediately.
self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});
