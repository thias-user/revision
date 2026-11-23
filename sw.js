/* Révision : garde l'appli en cache pour qu'elle s'ouvre même sans réseau (les données ont leur propre cache). */
const CACHE = 'revision-v2';
const SHELL = ['./', 'manifest.webmanifest', 'icone-192.png', 'icone.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== location.origin || u.pathname.includes('/api/')) return;
  e.respondWith(fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('./') : Response.error()))));
});
