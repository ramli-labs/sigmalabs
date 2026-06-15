// ============================================
// SIGMA Service Worker — offline-first app shell
// Naikkan versi CACHE saat rilis baru agar cache lama dibersihkan.
// ============================================
const CACHE = "sigma-v3";

// Shell minimum agar app tetap bisa boot saat offline.
// Aset lain (js/css/data) di-cache otomatis saat kunjungan online pertama
// lewat strategi stale-while-revalidate di bawah.
const SHELL = [
  "./",
  "index.html",
  "manifest.json",
  "assets/icon-192.png",
  "assets/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Jangan sentuh non-GET (login, upsert progres, dll).
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Biarkan request lintas-origin (Supabase API, CDN font/supabase-js)
  // lewat jaringan apa adanya — jangan pernah cache respons auth/data.
  if (url.origin !== self.location.origin) return;

  // Navigasi halaman: network-first, fallback ke shell cache saat offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put("./", copy));
          return res;
        })
        .catch(() => caches.match("./").then((r) => r || caches.match("index.html")))
    );
    return;
  }

  // Aset statis same-origin: stale-while-revalidate.
  // Sajikan cepat dari cache, perbarui di latar belakang.
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
