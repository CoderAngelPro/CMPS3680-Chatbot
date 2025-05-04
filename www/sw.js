const CACHE   = 'fredbot-v1';
const STATIC  = [
  '/',                 
  '/login.html',
  '/style.css',
  '/login.css',
  '/script.js',
  '/login.js',
  '/img/happy_robot.png',
  '/img/happy_robot_192.png',
  '/img/happy_robot_512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const isAPI = request.url.includes('/generate') ||
                request.url.includes('/history')  ||
                request.url.includes('/auth/');
  if (isAPI) return;               

  event.respondWith(
    caches.match(request).then(
      cached => cached || fetch(request).then(resp => {
        // lazy-update cache
        if (resp.status === 200 && request.method === 'GET') {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
        }
        return resp;
      })
    )
  );
});