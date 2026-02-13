const CACHE_NAME = 'fn-v5-0214';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // GASリクエストはService Workerを完全にバイパス
  if (e.request.url.includes('script.google.com') || e.request.url.includes('googleusercontent.com')) {
    return; // ブラウザに任せる
  }
  // Network-first: always try fresh copy
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r.ok) { const c = r.clone(); caches.open(CACHE_NAME).then(cache => cache.put(e.request, c)); }
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
