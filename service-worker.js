const CACHE_NAME = "gfin-v2";

const STATIC_FILES = [
  "/",
  "/index.html",
  "/app.js",
  "/manifest.json"
];

// 🔥 INSTALAÇÃO
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_FILES))
  );
});

// 🔥 FETCH INTELIGENTE (CORREÇÃO AQUI)
self.addEventListener("fetch", event => {

  const url = new URL(event.request.url);

  // 🚨 IGNORA API (Apps Script)
  if (url.origin.includes("script.google.com")) {
    return; // deixa o fetch normal acontecer
  }

  // 🔥 CACHE SÓ PRA ARQUIVOS LOCAIS
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});