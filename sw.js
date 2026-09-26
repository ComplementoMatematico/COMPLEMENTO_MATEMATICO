/* Service worker de la plataforma de práctica: guarda la aplicación en el
   aparato y, a medida que se ven, las imágenes de los enunciados. Los datos
   (problemas.js) se piden primero a la red para que siempre estén al día.
   Al publicar cambios grandes de diseño, cambia el nombre de CACHE.          */
const CACHE = 'cm-practica-v3';
const BASE = ['./', 'index.html', 'css/app.css', 'js/app.js', 'problemas.js', 'actividades.js', 'img/logo.webp', 'img/camino.webp', 'img/icono-192.png', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  const red = () => fetch(r).then(resp => { if (resp.ok) caches.open(CACHE).then(c => c.put(r, resp.clone())); return resp; });
  // datos y página: primero la red (siempre lo último); sin conexión, lo guardado
  if (/\/(problemas|actividades)\.js$/.test(u.pathname) || r.mode === 'navigate') { e.respondWith(red().catch(() => caches.match(r, { ignoreSearch: true }))); return; }
  // estilos, código e imágenes: primero lo guardado (rápido) y se actualiza en segundo plano
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(g => { const n = red().catch(() => g); return g || n; }));
});
