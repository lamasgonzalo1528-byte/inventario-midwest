// Service worker del Inventario Oficina MidWest.
// Guarda la app en el celular para que abra sin señal.
// Cada vez que subas una versión nueva, cambiá el número de VERSION: así los celulares
// se enteran, bajan la nueva y le muestran al usuario el botón "Actualizar".
const VERSION = 'inventario-v4';
const ARCHIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'apple-touch-icon.png',
  'favicon-32.png'
];

// Instalación: baja todos los archivos y los guarda
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)));
});

// Cuando el usuario toca "Actualizar", la versión nueva toma el control
self.addEventListener('message', e => { if (e.data === 'activar') self.skipWaiting(); });

// Activación: borra las versiones viejas guardadas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Pedidos: primero lo guardado (abre al instante y sin señal); si no está, va a internet
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, {ignoreSearch: true}).then(guardado => {
      if (guardado) return guardado;
      return fetch(req).then(resp => {
        if (resp.ok && resp.type === 'basic'){
          const copia = resp.clone();
          caches.open(VERSION).then(c => c.put(req, copia));
        }
        return resp;
      }).catch(() => req.mode === 'navigate' ? caches.match('index.html') : Response.error());
    })
  );
});
