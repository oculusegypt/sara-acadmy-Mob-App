/* Service Worker — أكاديمية سارة العربي (PWA)
 * استراتيجية:
 *  - App Shell: precache (html + assets البناء)
 *  - أصول ثابتة (js/css/png/svg/woff): CacheFirst مع حد أقصى وLRU
 *  - صفحات HTML: NetworkFirst لبقاء التحديثات فورية
 *  - مسارات /api/ و /uploads/ و /realtime/: لا تخزين إطلاقاً (بيانات حيّة/p2p)
 */
const VERSION = 'v2026.11.02a';
const SHELL_CACHE = `sara-shell-${VERSION}`;
const RUNTIME_CACHE = `sara-runtime-${VERSION}`;
const MAX_RUNTIME_ENTRIES = 120;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(['/', '/index.html'])).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

const isDynamic = (url) =>
  url.pathname.startsWith('/api/') ||
  url.pathname.startsWith('/uploads/') ||
  url.pathname.startsWith('/realtime') ||
  url.pathname.startsWith('/socket.io') ||
  url.search.includes('nocache');

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // عدم اعتراض CDN الخطوط الخارجية
  if (isDynamic(url)) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put('/', copy));
          return res;
        })
        .catch(() => caches.match('/').then((r) => r || caches.match('/index.html')))
    );
    return;
  }

  const ext = url.pathname.split('.').pop() || '';
  const staticAsset = ['js', 'css', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'woff', 'woff2', 'ico'].includes(ext);

  if (staticAsset) {
    e.respondWith(
      caches.match(req).then((hit) => {
        if (hit) return hit;
        return fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then(async (c) => {
              await c.put(req, copy);
              const keys = await c.keys();
              if (keys.length > MAX_RUNTIME_ENTRIES) await c.delete(keys[0]); // LRU تقريبي
            });
          }
          return res;
        });
      })
    );
  }
});

// إتاحة رسائل من العميل للتحكم اليدوي في التحديث
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
