const CACHE = "checklist-cache-v2";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.url.includes("supabase.co")) return; // nunca cachear llamadas a la base de datos

  // network-first: siempre intenta traer la versión más nueva del servidor.
  // Solo usa la copia guardada si no hay conexión a internet. Antes era al
  // revés (cache-first), por eso la app se quedaba pegada mostrando código
  // viejo aunque subieras cambios nuevos a GitHub.
  e.respondWith(
    fetch(e.request).then((res) => {
      const clone = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
