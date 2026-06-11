// ============================================
// Login — Supabase auth (email/password)
// ============================================

const { Icon, Navbar, Footer, Link, navigate } = window;
const { useState, useEffect } = React;

const LoginPage = () => {
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authStatus, setAuthStatus] = useState({ msg: "", ok: false });

  const supabaseReady = window.SIGMA_SUPABASE?.isConfigured();

  useEffect(() => {
    const checkAndNavigate = () => {
      if (window.USER && !window.USER.isGuest && window.SIGMA_AUTH.hasProfiles()) {
        navigate(window.USER.role === "teacher" ? "/guru" : "/dashboard");
      }
    };
    checkAndNavigate();
    window.addEventListener("sigma:userchange", checkAndNavigate);
    return () => window.removeEventListener("sigma:userchange", checkAndNavigate);
  }, []);

  const submitEmail = async () => {
    if (!supabaseReady) {
      setAuthStatus({ msg: "Supabase belum dikonfigurasi.", ok: false });
      return;
    }
    if (!authForm.email || !authForm.password) {
      setAuthStatus({ msg: "Email dan password wajib diisi.", ok: false });
      return;
    }
    setAuthStatus({ msg: "Memproses...", ok: false });
    try {
      await window.SIGMA_AUTH.signInWithSupabase(authForm.email, authForm.password);
      navigate(window.USER?.role === "teacher" ? "/guru" : "/dashboard");
    } catch (err) {
      const raw = err.message || "";
      let msg = raw;
      if (raw.includes("Invalid login credentials") || raw.includes("invalid_credentials")) {
        msg = "Email atau password salah.";
      } else if (raw.includes("Email not confirmed")) {
        msg = "Email belum dikonfirmasi. Hubungi guru.";
      } else if (raw.includes("profil SIGMA belum ditemukan")) {
        msg = "Akun ditemukan tapi profil SIGMA belum dibuat. Hubungi guru.";
      }
      setAuthStatus({ msg: msg || "Gagal masuk.", ok: false });
    }
  };

  const onKey = (e) => { if (e.key === "Enter") submitEmail(); };

  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "60px 32px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 48, alignItems: "center" }} className="login-grid">

          {/* Kiri: branding */}
          <section>
            <div className="tag tag-gold" style={{ marginBottom: 16 }}>SIGMA LABSCHOOL</div>
            <h1 className="display" style={{ fontSize: 60, margin: "0 0 16px", color: "var(--navy-950)", lineHeight: 1.05 }}>
              Selamat datang<br/>di SIGMA.
            </h1>
            <p style={{ fontSize: 16, color: "var(--ink-muted)", lineHeight: 1.7, maxWidth: 540, marginBottom: 28 }}>
              Platform pembelajaran Informatika &amp; KKA untuk SMP Labschool Jakarta. Masuk dengan akun email sekolah untuk menyimpan progress di semua perangkat.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { emoji: "📚", text: "Modul interaktif" },
                { emoji: "🔬", text: "Lab maya" },
                { emoji: "🎮", text: "Gim edukatif" },
                { emoji: "🏅", text: "Badge & XP" },
              ].map(f => (
                <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "white", borderRadius: 99, border: "1.5px solid var(--line)", fontSize: 13, fontWeight: 700, color: "var(--navy-950)" }}>
                  <span>{f.emoji}</span> {f.text}
                </div>
              ))}
            </div>
          </section>

          {/* Kanan: panel login */}
          <aside>
            <div className="card" style={{ padding: 28, background: "white" }}>
              <div style={{ fontWeight: 900, fontSize: 20, color: "var(--navy-950)", marginBottom: 4 }}>Masuk ke SIGMA</div>
              <div style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 20, lineHeight: 1.5 }}>
                Gunakan email &amp; password akun sekolah dari guru.
              </div>

              {/* Google SSO — hidden sampai dikonfigurasi */}
              {false && (
                <button className="btn btn-primary" type="button" style={{ width: "100%", background: "var(--navy-950)", color: "white", justifyContent: "center", gap: 10, marginBottom: 16 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Masuk dengan Google Sekolah
                </button>
              )}

              <div style={{ display: "grid", gap: 10 }}>
                <input className="input" type="email" value={authForm.email}
                  onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                  onKeyDown={onKey}
                  placeholder="email@sekolah.sch.id"
                  autoComplete="email"/>
                <input className="input" type="password" value={authForm.password}
                  onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                  onKeyDown={onKey}
                  placeholder="Password"
                  autoComplete="current-password"/>
                <button className="btn btn-primary" type="button" onClick={submitEmail}
                  style={{ justifyContent: "center" }}>
                  <Icon.Play width="15" height="15"/> Masuk
                </button>
                {authStatus.msg && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: authStatus.ok ? "var(--green-600)" : "var(--red-500)", padding: "10px 12px", background: authStatus.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", borderRadius: 8, lineHeight: 1.5 }}>
                    {authStatus.ok ? "✅" : "⚠️"} {authStatus.msg}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1.5px solid var(--line)", fontSize: 12, color: "var(--ink-subtle)", lineHeight: 1.5 }}>
                Belum punya akun? Minta guru untuk membuat akun lewat <strong>Dashboard Guru → Tambah Siswa</strong>.
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer/>
    </div>
  );
};

window.LoginPage = LoginPage;
