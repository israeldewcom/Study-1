/* Study Arena service worker.
   Change VERSION on every release so installed apps pick up the new files. */
const VERSION = 'sa-v6';
const SHELL = ['./', './studyarena-v2.html', './sa-manifest.json', './icon-192-1.png', './icon-512-1.png', './favicon-32.png', './og.png'];

self.addEventListener('install', (e) => {
  // Do not skipWaiting here: the page asks for it, so nobody loses a quiz in progress.
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener('message', (e) => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('sa-') && k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 9000); // slow network: show the saved copy instead of waiting
    const res = await fetch(req, { signal: ctl.signal });
    clearTimeout(t);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (_) {
    return (await cache.match(req, { ignoreSearch: true })) || (await cache.match('./studyarena-v2.html')) || (await cache.match('./')) ||
      new Response('You are offline.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req);
  const refresh = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || refresh;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    // Fonts are cached; everything else (the API!) goes straight to the network and is never stored.
    if (/(^|\.)(googleapis|gstatic)\.com$/.test(url.hostname)) e.respondWith(staleWhileRevalidate(req));
    return;
  }
  if (req.mode === 'navigate') { e.respondWith(networkFirst(req)); return; }
  e.respondWith(staleWhileRevalidate(req));
});
