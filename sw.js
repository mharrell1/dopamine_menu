const CACHE_NAME = "dopamine-menu-cache-v9";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/retro-theme.css",
  "./css/retro-theme.css?v=9",
  "./css/category-tabs.css",
  "./css/category-tabs.css?v=9",
  "./css/compiled-menu.css",
  "./css/compiled-menu.css?v=9",
  "./js/app.js",
  "./js/data.js",
  "./js/storage.js",
  "./js/audio.js",
  "./js/menu-card.js",
  "./assets/stickers/appetizers.png",
  "./assets/stickers/sides.png",
  "./assets/stickers/main.png",
  "./assets/stickers/desserts.png",
  "./assets/stickers/specials.png",
  "./assets/wallpapers/bg1.jpeg",
  "./assets/wallpapers/bg2.jpeg",
  "./assets/wallpapers/bg3.jpeg",
  "./assets/icons/icon-16x16.png",
  "./assets/icons/icon-32x32.png",
  "./assets/icons/icon-180x180.png",
  "./assets/icons/icon-192x192.png",
  "./assets/icons/icon-512x512.png",
  "./assets/icons/apple-touch-icon.png"
];

// Install Service Worker and cache all critical assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Service Worker and clean up old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network-first for CSS/JS to guarantee instant live development updates, fallback to cache
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, clone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
