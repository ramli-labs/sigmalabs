// ============================================
// Halaman Edit Profil Siswa
// ============================================

const { Icon, Navbar, Footer, Link, navigate, Breadcrumb, ControlField } = window;
const { useState, useEffect } = React;

const ProfilePage = () => {
  const user = window.USER;
  const [form, setForm] = useState({
    name: user?.name || "",
    nickname: user?.nickname || "",
    level: user?.level || 7,
    class: user?.class || "7A",
  });
  const [status, setStatus] = useState({ msg: "", ok: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!window.USER || window.USER.isGuest) {
      navigate("/login");
    }
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setStatus({ msg: "Nama wajib diisi.", ok: false });
      return;
    }
    setSaving(true);
    setStatus({ msg: "", ok: false });
    try {
      const next = {
        ...window.USER,
        name,
        nickname: form.nickname.trim() || name.split(" ")[0],
        level: Number(form.level),
        class: form.class.trim() || `${form.level}A`,
      };
      window.SIGMA_AUTH.saveActiveUser(next);
      setStatus({ msg: "Profil berhasil disimpan.", ok: true });
    } catch (err) {
      setStatus({ msg: err.message || "Gagal menyimpan.", ok: false });
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.isGuest) return null;

  const initial = (form.nickname || form.name || "?")[0]?.toUpperCase() || "?";

  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      <main style={{ maxWidth: 560, margin: "0 auto", padding: "36px 32px 80px" }}>
        <Breadcrumb trail={[{ to: "/dashboard", label: "Dashboard" }, { label: "Edit Profil" }]}/>

        <h1 className="display" style={{ fontSize: 40, margin: "12px 0 4px", color: "var(--navy-950)" }}>Edit Profil</h1>
        <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 28, lineHeight: 1.6 }}>
          Perubahan tersimpan otomatis ke akun Supabase.
        </p>

        <div className="card" style={{ padding: 28, background: "white" }}>
          {/* Avatar preview */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: "16px 18px", background: "var(--bg)", borderRadius: 14, border: "1.5px solid var(--line)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--navy-950)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24, border: "3px solid var(--ink)", flexShrink: 0 }}>
              {initial}
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 17, color: "var(--navy-950)" }}>{form.name || "—"}</div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>
                Kelas {form.class} &nbsp;·&nbsp; {(user.xp || 0).toLocaleString()} XP &nbsp;·&nbsp; {user.badges?.length || 0} badge
              </div>
            </div>
          </div>

          <form onSubmit={save} style={{ display: "grid", gap: 16 }}>
            <ControlField label="Nama Lengkap">
              <input className="input" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Nama lengkap"/>
            </ControlField>

            <ControlField label="Nama Panggilan">
              <input className="input" value={form.nickname}
                onChange={e => setForm({ ...form, nickname: e.target.value })}
                placeholder="Panggilan (opsional, default: nama depan)"/>
            </ControlField>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <ControlField label="Tingkat Kelas">
                <select className="input" value={form.level}
                  onChange={e => setForm({ ...form, level: Number(e.target.value), class: `${e.target.value}A` })}>
                  <option value={7}>Kelas 7</option>
                  <option value={8}>Kelas 8</option>
                  <option value={9}>Kelas 9</option>
                </select>
              </ControlField>
              <ControlField label="Rombel">
                <input className="input" value={form.class}
                  onChange={e => setForm({ ...form, class: e.target.value })}
                  placeholder="7A"/>
              </ControlField>
            </div>

            {status.msg && (
              <div style={{ fontSize: 13, fontWeight: 600, color: status.ok ? "var(--green-600)" : "var(--red-500)", padding: "10px 14px", background: status.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", borderRadius: 10, lineHeight: 1.5 }}>
                {status.ok ? "✅" : "⚠️"} {status.msg}
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={saving}
              style={{ justifyContent: "center" }}>
              <Icon.Play width="15" height="15"/>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        </div>

        {/* Info email */}
        <div style={{ marginTop: 16, padding: "14px 16px", background: "white", border: "1.5px solid var(--line)", borderRadius: 14, fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6 }}>
          <strong>Email akun:</strong> {user.email || "(tidak tersedia)"}<br/>
          Untuk mengganti email atau password, hubungi guru.
        </div>
      </main>
      <Footer/>
    </div>
  );
};

window.ProfilePage = ProfilePage;
