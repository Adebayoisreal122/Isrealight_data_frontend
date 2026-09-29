/* Isrealight Data Hub service worker.
   - Precaches the offline page and brand assets
   - Cache-first for static build assets
   - Navigations: network first, offline page as fallback
   - NEVER caches API calls (wallet, balances, purchases): the API lives on another origin
     and is ignored here on purpose. */
const VERSION = 'ihub-v1';
const STATIC = `${VERSION}-static`;
const PRECACHE = ['/offline.html', '/logo.svg', '/icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('/offline.html')));
    return;
  }
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/') || url.pathname === '/logo.svg') {
    e.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      })
    );
  }
});
