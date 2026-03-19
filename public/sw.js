const CACHE_NAME = "testify-v3";

const ASSETS = [
  "/TESTIFY/",
  "/TESTIFY/index.html",
  "/TESTIFY/manifest.json",
  "/TESTIFY/icon-192.png",
  "/TESTIFY/icon-512.png"
];

// Install — cache essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache
self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("googleapis.com")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() =>
        caches.match("/TESTIFY/index.html")
      );
    })
  );
});