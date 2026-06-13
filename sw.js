const CACHE = 'set-point-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './supabase.bundle.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Ne jamais mettre en cache les appels Supabase (live + auth)
  if(url.hostname.endsWith('supabase.co')) return;
  if(e.request.method !== 'GET') return;

  // Navigation et fichiers de l'app : réseau d'abord (toujours la dernière version),
  // avec repli sur le cache si hors-ligne.
  if(e.request.mode === 'navigate' || url.origin === location.origin){
    e.respondWith(
      fetch(e.request).then(res => {
        if(res.ok){
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Ressources externes (polices, etc.) : cache d'abord
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
