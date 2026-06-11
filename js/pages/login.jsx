// ============================================
// Login — Supabase auth (Google / email) + profil lokal
// ============================================

const { Icon, Navbar, Footer, Link, navigate } = window;
const { useState, useEffect } = React;

const LoginPage = () => {
  const [profiles, setProfiles] = useState(window.SIGMA_AUTH.getProfiles());
  const [localForm, setLocalForm] = useState({ name: "", nickname: "", level: 7, class: "7A" });
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authStatus, setAuthStatus] = useState({ msg: "", ok: false });
  const [googleLoading, setGoogleLoading] = useState(false);

  const activeId = window.USER?.id;
  const supabaseReady = window.SIGMA_SUPABASE?.isConfigured();

  // Auto-navigate setelah Google OAuth redirect atau hydration selesai
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

  const enterAs = (id) => {
    window.SIGMA_AUTH.login(id);
    navigate("/dashboard");
  };

  const createLocal = (e) => {
    e.preventDefault();
    const user = window.SIGMA_AUTH.createProfile(localForm);
    setProfiles(window.SIGMA_AUTH.getProfiles());
    if (user) navigate("/dashboard");
  };

  const resetLocal = () => {
    window.SIGMA_AUTH.resetLocalData();
    setProfiles(window.SIGMA_AUTH.getProfiles());
  };

  const loginWithGoogle = async () => {
    if (!supabaseReady) {
      setAuthStatus({ msg: "Isi Supabase URL dan anon key di js/data/supabase.js dulu.", ok: false });
      return;
    }
    setGoogleLoading(true);
    try {
      await window.SIGMA_SUPABASE.signInWithGoogle();
      // Halaman akan redirect ke Google — tidak lanjut eksekusi di sini
    } catch (err) {
      setAuthStatus({ msg: err.message || "Login Google gagal.", ok: false });
      setGoogleLoading(false);
    }
  };

  const submitEmail = async () => {
    if (!supabaseReady) {
      setAuthStatus({ msg: "Isi Supabase URL dan anon key di js/data/supabase.js dulu.", ok: false });
      return;
    }
    if (!authForm.email || !authForm.password) {
      setAuthStatus({ msg: "Email dan password wajib diisi.", ok: false });
      return;
    }
    setAuthStatus({ msg: "Memproses...", ok: false });
    try {
      await window.SIGMA_AUTH.signInWithSupabase(authForm.email, authForm.password);
      setProfiles(window.SIGMA_AUTH.getProfiles());
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

  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 32px 70px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 28, alignItems: "start" }} className="login-grid">

          {/* Kiri: daftar profil lokal */}
          <section>
            <div className="tag tag-gold" style={{ marginBottom: 14 }}>SIGMA LABSCHOOL</div>
            <h1 className="display" style={{ fontSize: 56, margin: 0, color: "var(--navy-950)" }}>
              Masuk ke SIGMA
            </h1>
            <p style={{ fontSize: 16, color: "var(--ink-muted)", lineHeight: 1.6, maxWidth: 620, marginTop: 14 }}>
              Gunakan akun email sekolah untuk menyimpan progress di semua perangkat, atau buat profil lokal untuk belajar di perangkat ini.
            </p>
            <Link to="/guru" className="btn btn-sm" style={{ marginTop: 14 }}>
              <Icon.Users width="14" height="14"/> Dashboard Guru
            </Link>

            {/* Profil lokal yang tersimpan */}
            {profiles.length > 0 && (
              <>
                <div style={{ fontWeight: 800, fontSize: 13, color: "var(--ink-muted)", marginTop: 28, marginBottom: 12, letterSpacing: "0.06em" }}>
                  PROFIL TERSIMPAN DI PERANGKAT INI
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }} className="profile-grid">
                  {profiles.map(profile => (
                    <button key={profile.id} onClick={() => enterAs(profile.id)} className="card card-hover" style={{
                      padding: 18,
                      textAlign: "left",
                      background: profile.id === activeId ? "var(--gold-300)" : "white",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--navy-950)", color: "white", border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                          {profile.nickname[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 900, fontSize: 15 }}>{profile.name}</div>
                          <div style={{ fontSize: 12, color: "var(--ink-muted)", fontWeight: 700 }}>Kelas {profile.class} • {profile.xp.toLocaleString()} XP</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span className="tag tag-info">{Object.keys(profile.progress || {}).length} modul</span>
                        <span className="tag tag-green">{profile.badges.length} badge</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {profiles.length === 0 && (
              <div className="card" style={{ marginTop: 28, padding: 24, background: "white", border: "2px dashed var(--line-strong)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--bg-cream)", border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon.Users width="22" height="22"/>
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, color: "var(--navy-950)" }}>Belum ada profil tersimpan</div>
                    <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5, marginTop: 3 }}>
                      Masuk dengan email sekolah atau buat profil lokal di sebelah kanan.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Kanan: panel login */}
          <aside style={{ display: "grid", gap: 16 }}>

            {/* Google SSO — tampil hanya jika sudah dikonfigurasi di Supabase */}
            {false && (
              <div className="card" style={{ padding: 20, background: "white" }}>
                <div style={{ fontWeight: 900, fontSize: 13, color: "var(--ink-muted)", marginBottom: 12, letterSpacing: "0.06em" }}>MASUK DENGAN AKUN SEKOLAH</div>
                <button className="btn btn-primary" type="button" onClick={loginWithGoogle} disabled={googleLoading}
                  style={{ width: "100%", background: "var(--navy-950)", color: "white", justifyContent: "center", gap: 10 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {googleLoading ? "Mengarahkan ke Google..." : "Masuk dengan Google Sekolah"}
                </button>
              </div>
            )}

            {/* 2. Email + password — hanya Masuk, tidak ada Daftar */}
            <div className="card" style={{ padding: 20, background: "white" }}>
              <div style={{ fontWeight: 900, fontSize: 13, color: "var(--ink-muted)", marginBottom: 12, letterSpacing: "0.06em" }}>ATAU DENGAN EMAIL</div>
              <div style={{ display: "grid", gap: 8 }}>
                <input className="input" type="email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} placeholder="email@sekolah.sch.id"/>
                <input className="input" type="password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} placeholder="Password"/>
                <button className="btn btn-primary" type="button" onClick={submitEmail} style={{ justifyContent: "center" }}>
                  <Icon.Play width="15" height="15"/> Masuk
                </button>
                {authStatus.msg && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: authStatus.ok ? "var(--green-600)" : "var(--red-500)", padding: "8px 12px", background: authStatus.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", borderRadius: 8, lineHeight: 1.5 }}>
                    {authStatus.ok ? "✅" : "⚠️"} {authStatus.msg}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Profil lokal (tanpa akun) */}
            <div className="card" style={{ padding: 20, background: "white" }}>
              <div style={{ fontWeight: 900, fontSize: 13, color: "var(--ink-muted)", marginBottom: 4, letterSpacing: "0.06em" }}>PROFIL LOKAL (TANPA AKUN)</div>
              <div style={{ fontSize: 12, color: "var(--ink-subtle)", marginBottom: 12, lineHeight: 1.4 }}>Progress tersimpan di perangkat ini saja.</div>
              <form onSubmit={createLocal} style={{ display: "grid", gap: 8 }}>
                <input className="input" required value={localForm.name} onChange={e => setLocalForm({ ...localForm, name: e.target.value })} placeholder="Nama lengkap"/>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <select className="input" value={localForm.level} onChange={e => setLocalForm({ ...localForm, level: Number(e.target.value), class: `${e.target.value}A` })}>
                    <option value={7}>Kelas 7</option>
                    <option value={8}>Kelas 8</option>
                    <option value={9}>Kelas 9</option>
                  </select>
                  <input className="input" value={localForm.class} onChange={e => setLocalForm({ ...localForm, class: e.target.value })} placeholder="Rombel (7A)"/>
                </div>
                <button className="btn" type="submit" style={{ justifyContent: "center" }}>
                  <Icon.Play width="15" height="15"/> Buat &amp; Masuk Lokal
                </button>
              </form>
              {profiles.length > 0 && (
                <button className="btn" type="button" onClick={resetLocal} style={{ marginTop: 8, width: "100%", justifyContent: "center", color: "var(--red-500)" }}>
                  <Icon.Refresh width="14" height="14"/> Hapus Semua Profil Lokal
                </button>
              )}
            </div>

          </aside>
        </div>
      </main>
      <Footer/>
    </div>
  );
};

window.LoginPage = LoginPage;
