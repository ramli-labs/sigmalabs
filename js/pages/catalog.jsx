// ============================================
// Catalog — modules filtered by kelas level
// ============================================

// --- shared globals ---
const { Icon, Navbar, Footer, Link, useRoute, navigate, SectionHeader, Breadcrumb, EmptyState, ModuleCard, LabschoolLogo, BrandStrip, ControlField } = window;
const { useState, useEffect, useRef } = React;

const Catalog = ({ level }) => {
  const levelNum = parseInt(level);
  const [filter, setFilter] = useState("all"); // all | informatika | kka
  const userLevel = window.USER.level;

  if (levelNum !== userLevel) {
    return (
      <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <Navbar/>
        <EmptyState
          icon="Lock"
          title={`Akses kelas ${levelNum} terkunci`}
          subtitle={`Profil aktif adalah siswa kelas ${userLevel}. Untuk simulasi, ganti profil di halaman login jika ingin membuka kelas lain.`}
          action={<Link to={`/kelas/${userLevel}`} className="btn btn-primary" style={{ marginTop: 20 }}>Buka Kelas {userLevel}</Link>}
        />
      </div>
    );
  }

  const modules = window.CURRICULUM.modules.filter(m => m.level === levelNum);
  const filtered = filter === "all" ? modules : modules.filter(m => m.subject === filter);

  const subjects = window.CURRICULUM.subjects;
  const countInf = modules.filter(m => m.subject === "informatika").length;
  const countKka = modules.filter(m => m.subject === "kka").length;

  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px 60px" }}>
        <Breadcrumb trail={[
          { to: "/", label: "Beranda" },
          { to: "/dashboard", label: "Dashboard" },
          { label: `Kelas ${levelNum}` },
        ]}/>

        {/* Header */}
        <div className="catalog-header-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 40, alignItems: "center", margin: "20px 0 40px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "var(--gold-300)", border: "2px solid var(--ink)", borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 800, marginBottom: 18, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <Icon.Book width="14" height="14"/> Katalog Modul Pembelajaran
            </div>
            <h1 className="display" style={{ fontSize: 64, margin: 0, lineHeight: 1, color: "var(--navy-950)" }}>
              Kelas <span style={{ background: "var(--gold-400)", padding: "0 16px", display: "inline-block", transform: "rotate(-1deg)", borderRadius: 16 }}>{numberToRoman(levelNum)}</span>
            </h1>
            <p style={{ fontSize: 16, color: "var(--ink-muted)", marginTop: 18, maxWidth: 520, lineHeight: 1.55 }}>
              {getLevelDescription(levelNum)}
            </p>
          </div>
          <div className="count-card-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <CountCard subj={subjects.informatika} count={countInf} onClick={() => setFilter("informatika")} active={filter === "informatika"}/>
            <CountCard subj={subjects.kka} count={countKka} onClick={() => setFilter("kka")} active={filter === "kka"}/>
          </div>
        </div>

        {/* Tabs / filter */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "inline-flex", background: "white", border: "2px solid var(--ink)", borderRadius: "var(--r-full)", padding: 4, boxShadow: "var(--shadow-chunk-sm)" }}>
            {[
              { id: "all", label: `Semua (${modules.length})` },
              { id: "informatika", label: `Informatika (${countInf})`, color: "var(--info-500)" },
              { id: "kka", label: `Koding & AI (${countKka})`, color: "var(--ai-500)" },
            ].map(t => (
              <button key={t.id} onClick={() => setFilter(t.id)} style={{
                padding: "10px 20px",
                borderRadius: "var(--r-full)",
                fontSize: 14,
                fontWeight: 700,
                background: filter === t.id ? (t.color || "var(--navy-900)") : "transparent",
                color: filter === t.id ? "white" : "var(--ink-muted)",
              }}>{t.label}</button>
            ))}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-muted)" }}>
            Menampilkan {filtered.length} modul
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="module-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {filtered.map((m, i) => (
              <div key={m.id} className="fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <ModuleCard
                  module={m}
                  progress={window.USER.progress[m.id] || null}
                  locked={!window.SIGMA_AUTH.isModuleSequenceUnlocked(m.id)}
                  lockReason={window.SIGMA_AUTH.getPreviousModule(m.id) ? `Selesaikan dulu ${window.SIGMA_AUTH.getPreviousModule(m.id).title}.` : ""}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="Search"
            title="Belum ada modul"
            subtitle="Coba filter lain atau kembali ke beranda."
          />
        )}

        {/* Nav between levels */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 60, padding: "24px 28px", background: "var(--navy-950)", borderRadius: "var(--r-lg)", color: "white", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", color: "var(--gold-400)", textTransform: "uppercase", marginBottom: 6 }}>
              Akses Siswa
            </div>
            <div className="display" style={{ fontSize: 24, margin: 0 }}>Profil ini hanya membuka kelas {window.USER.level}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/login" className="btn btn-primary">
              Ganti Profil
            </Link>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

const CountCard = ({ subj, count, onClick, active }) => {
  const I = Icon[subj.icon];
  return (
    <div onClick={onClick} className="card card-hover" style={{
      padding: 20,
      background: active ? subj.colorLight : "white",
      borderColor: active ? subj.color : "var(--ink)",
      cursor: "pointer",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: subj.colorMid, color: "var(--navy-950)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--ink)" }}>
          <I width="20" height="20"/>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "var(--ink-subtle)", textTransform: "uppercase" }}>{subj.shortName || subj.name}</div>
          <div className="display" style={{ fontSize: 24 }}>{count} modul</div>
        </div>
      </div>
    </div>
  );
};

function numberToRoman(n) {
  return ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] || String(n);
}

function getLevelDescription(level) {
  if (level === 7) return "Fondasi Informatika: berpikir komputasional, cara kerja komputer, internet, pencarian informasi, literasi media, dan etika ruang digital.";
  if (level === 8) return "Penguatan data dan karya digital: himpunan data terstruktur, spreadsheet, dokumen-presentasi, produksi konten, dan keamanan digital.";
  if (level === 9) return "Integrasi Fase D: penerapan BK pada data, pseudocode, visual programming, jejak digital, perlindungan data pribadi, kesejahteraan digital, dan projek akhir.";
  return "Modul pembelajaran SIGMA Labschool.";
}

window.Catalog = Catalog;
