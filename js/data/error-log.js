// ============================================
// SIGMA — pencatat error klien sederhana.
// Menangkap error JS tak tertangani + promise rejection, lalu mengirimnya
// ke tabel Supabase `sigma_errors` agar guru/admin bisa melihat masalah
// yang dialami siswa (lihat di Supabase → Table Editor → sigma_errors).
// Dibatasi agar tidak membanjiri (maksimal beberapa per sesi).
// ============================================
(function () {
  const MAX_PER_SESSION = 8;
  let sent = 0;
  const seen = new Set();

  function cfg() {
    return window.SIGMA_SUPABASE_CONFIG || {};
  }

  function logError(message, detail) {
    try {
      const c = cfg();
      if (!c.url || !c.anonKey) return;          // Supabase belum dikonfigurasi
      const msg = String(message || "Error").slice(0, 500);
      const key = msg + "|" + String(detail || "").slice(0, 80);
      if (seen.has(key)) return;                 // jangan ulangi error yang sama
      seen.add(key);
      if (sent >= MAX_PER_SESSION) return;
      sent++;

      const u = window.USER || {};
      fetch(`${c.url}/rest/v1/sigma_errors`, {
        method: "POST",
        headers: {
          "apikey": c.anonKey,
          "Authorization": `Bearer ${c.anonKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          user_id: u.user_id || null,
          role: u.role || null,
          message: msg,
          detail: String(detail || "").slice(0, 2000),
          url: (location.hash || location.pathname || "").slice(0, 300),
          user_agent: (navigator.userAgent || "").slice(0, 300),
        }),
        keepalive: true,
      }).catch(() => {});
    } catch (e) { /* jangan pernah melempar dari pencatat error */ }
  }

  window.addEventListener("error", (e) => {
    const where = e.filename ? `${e.filename}:${e.lineno || 0}:${e.colno || 0}` : "";
    logError(e.message, (e.error && e.error.stack) || where);
  });

  window.addEventListener("unhandledrejection", (e) => {
    const r = e.reason;
    logError("Unhandled promise rejection", (r && (r.stack || r.message)) || String(r));
  });

  // Bisa dipanggil manual dari kode bila perlu mencatat error yang ditangani.
  window.SIGMA_LOG_ERROR = logError;
})();
