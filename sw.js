/* KVPy service worker — offline support.
   - Own-origin files (index.html, css, icons): network-first, cache fallback.
     Keeps you on the latest app shell while online, still works offline.
   - Cross-origin CDN files (CodeMirror/esm.sh, fflate/jsdelivr, Pyodide core
     + whichever packages you've actually run, Google Fonts): cache-first with
     a background refresh. These URLs are version-pinned, so a cache hit is
     always correct — no staleness risk — and this is what lets Run/Debug work
     with no network at all once you've used a package while online before.
   Bump CACHE_VERSION whenever the app shell changes so old caches get cleared. */

const CACHE_VERSION = "kvpy-cache-v1";

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./kvsql-ui-kit.css",
  "./favicon.svg",
  "./favicon.ico",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./og-banner.png",
  "./site.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      // Cache each file independently — one missing/renamed asset shouldn't
      // fail the whole install.
      await Promise.allSettled(
        PRECACHE_URLS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: "no-cache" });
            if (res && res.ok) await cache.put(url, res);
          } catch (e) {}
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  const isOwnOrigin = url.origin === self.location.origin;

  event.respondWith(isOwnOrigin ? networkFirst(req) : cacheFirst(req));
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await cache.match(req);
    if (cached) return cached;
    if (req.mode === "navigate") {
      const shell = await cache.match("./index.html");
      if (shell) return shell;
    }
    throw e;
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(req);
  if (cached) {
    // Refresh in the background without blocking this response.
    fetch(req).then((res) => { if (res && res.ok) cache.put(req, res); }).catch(() => {});
    return cached;
  }
  const fresh = await fetch(req);
  if (fresh && fresh.ok) cache.put(req, fresh.clone());
  return fresh;
}
