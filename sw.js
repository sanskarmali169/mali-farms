/* =============================================================
   Mali Farm Manager — Service Worker
   Strategy: Network-first with cache fallback.
   Every deploy: bump CACHE_VERSION → old cache auto-deleted,
   new files fetched immediately, all tabs updated at once.
   ============================================================= */

/* ── BUMP THIS every time you deploy a new version ────────────
   Format: 'mali-farm-vYYYYMMDD-N'
   The browser detects this file changed → triggers update flow. */
const CACHE_VERSION = 'mali-farm-v20250629-2';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './firebase.js',
  './manifest.json'
];

/* ── INSTALL: cache all assets for this version ────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => {
        // Skip waiting: activate immediately without waiting for
        // old tabs to close. Combined with clients.claim() below,
        // this means ALL open tabs get the new version right away.
        self.skipWaiting();
      })
  );
});

/* ── ACTIVATE: delete every old cache version ──────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)   // keep only current
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => {
      // Take control of all open pages immediately
      self.clients.claim();
      // Tell every open tab to reload so they use the new version
      self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
        });
      });
    })
  );
});

/* ── FETCH: Network-first strategy ─────────────────────────── *
   1. Try network first (always gets latest files)
   2. If network fails (offline), fall back to cache
   Firebase/CDN requests bypass the cache entirely.           */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Let Firebase, CDN, and external requests go straight to network
  const isExternal = !url.origin.includes(self.location.origin) ||
                      url.hostname.includes('firebaseapp.com') ||
                      url.hostname.includes('googleapis.com') ||
                      url.hostname.includes('gstatic.com') ||
                      url.hostname.includes('cloudflare.com') ||
                      url.hostname.includes('fonts.google') ||
                      url.hostname.includes('cdnjs');

  if (isExternal) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network-first for local app files
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Clone and store fresh copy in cache
        const clone = networkResponse.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        return networkResponse;
      })
      .catch(() => {
        // Network failed → serve from cache (offline support)
        return caches.match(event.request)
          .then(cached => cached || caches.match('./index.html'));
      })
  );
});
