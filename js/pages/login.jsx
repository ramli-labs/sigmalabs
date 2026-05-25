// ============================================
// Login Simulation — localStorage profiles
// ============================================

const { Icon, Navbar, Footer, Link, navigate } = window;
const { useState } = React;

const LoginPage = () => {
  const [profiles, setProfiles] = useState(window.SIGMA_AUTH.getProfiles());
  const [form, setForm] = useState({ name: "", nickname: "", level: 7, class: "7A" });

  const activeId = window.USER?.id;

  const enterAs = (id) => {
    window.SIGMA_AUTH.login(id);
    navigate("/dashboard");
  };

  const create = (e) => {
    e.preventDefault();
    const user = window.SIGMA_AUTH.createProfile(form);
    setProfiles(window.SIGMA_AUTH.getProfiles());
    if (user) navigate("/dashboard");
  };

  const reset = () => {
    window.SIGMA_AUTH.resetDemo();
    setProfiles(window.SIGMA_AUTH.getProfiles());
  };

  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 32px 70px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 28, alignItems: "start" }} className="login-grid">
          <section>
            <div className="tag tag-gold" style={{ marginBottom: 14 }}>SIMULASI LOGIN LOKAL</div>
            <h1 className="display" style={{ fontSize: 56, margin: 0, color: "var(--navy-950)" }}>
              Masuk sebagai siswa
            </h1>
            <p style={{ fontSize: 16, color: "var(--ink-muted)", lineHeight: 1.6, maxWidth: 620, marginTop: 14 }}>
              Pilih profil demo atau buat profil baru. Semua progress, XP, dan badge tersimpan di browser perangkat ini.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16, marginTop: 28 }} className="profile-grid">
              {profiles.map(profile => (
                <button key={profile.id} onClick={() => enterAs(profile.id)} className="card card-hover" style={{
                  padding: 20,
                  textAlign: "left",
                  background: profile.id === activeId ? "var(--gold-300)" : "white",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--navy-950)", color: "white", border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20 }}>
                      {profile.nickname[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 17 }}>{profile.name}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-muted)", fontWeight: 700 }}>Kelas {profile.class} • {profile.xp.toLocaleString()} XP</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span className="tag tag-info">{Object.keys(profile.progress || {}).length} modul aktif</span>
                    <span className="tag tag-green">{profile.badges.length} badge</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <aside className="card" style={{ padding: 24, background: "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--info-400)", border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon.Users width="22" height="22"/>
              </div>
              <div>
                <div style={{ fontWeight: 900 }}>Buat profil siswa</div>
                <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>Untuk simulasi lokal</div>
              </div>
            </div>

            <form onSubmit={create} style={{ display: "grid", gap: 12 }}>
              <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 800, color: "var(--ink-muted)" }}>
                Nama Lengkap
                <input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Naya Putri"/>
              </label>
              <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 800, color: "var(--ink-muted)" }}>
                Nama Panggilan
                <input className="input" value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} placeholder="Contoh: Naya"/>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 800, color: "var(--ink-muted)" }}>
                  Kelas
                  <select className="input" value={form.level} onChange={e => setForm({ ...form, level: Number(e.target.value), class: `${e.target.value}A` })}>
                    <option value={7}>7</option>
                    <option value={8}>8</option>
                    <option value={9}>9</option>
                  </select>
                </label>
                <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 800, color: "var(--ink-muted)" }}>
                  Rombel
                  <input className="input" value={form.class} onChange={e => setForm({ ...form, class: e.target.value })} placeholder="8A"/>
                </label>
              </div>
              <button className="btn btn-primary" type="submit" style={{ marginTop: 6 }}>
                <Icon.Play width="16" height="16"/> Buat & Masuk
              </button>
              <button className="btn" type="button" onClick={reset}>
                <Icon.Refresh width="16" height="16"/> Reset Demo
              </button>
            </form>
          </aside>
        </div>
      </main>
      <Footer/>
    </div>
  );
};

window.LoginPage = LoginPage;
