const CACHE_NAME = "dopamine-menu-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./css/retro-theme.css",
  "./css/category-tabs.css",
  "./css/compiled-menu.css",
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
  "./assets/wallpapers/bg3.jpeg"
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

// Cache-first strategy for fetching resources
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        // Cache newly fetched assets dynamically if appropriate
        if (networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, clone);
          });
        }
        return networkResponse;
      });
    })
  );
});
