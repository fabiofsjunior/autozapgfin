const CACHE_NAME = "gfin-v3";

const FILES = ["./", "./index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES)));
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 🚨 NÃO INTERCEPTA API
  if (url.hostname.includes("script.google.com")) return;

  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request)),
  );
});
