// ============================================
// Lab List — all virtual labs
// ============================================

// --- shared globals ---
const { Icon, Navbar, Footer, Link, useRoute, navigate, SectionHeader, Breadcrumb, EmptyState, ModuleCard, LabschoolLogo, BrandStrip, ControlField } = window;
const { useState, useEffect, useRef } = React;

const ResourceModuleLinks = ({ item, compact = false }) => {
  if (!item) return null;
  const refs = (item.moduleRefs || [])
    .map(id => window.CURRICULUM.modules.find(m => m.id === id))
    .filter(Boolean);
  const skills = item.skills || [];
  if (!refs.length && !skills.length) return null;

  return (
    <div className={compact ? "" : "card-soft"} style={{
      padding: compact ? 0 : 16,
      background: compact ? "transparent" : "var(--bg-cream)",
      border: compact ? "none" : "1.5px solid var(--line)",
      borderRadius: compact ? 0 : 14,
      marginTop: compact ? 12 : 16,
    }}>
      <div style={{ fontSize: 11, fontWeight: 900, color: "var(--ink-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
        Penguat Modul Cetak
      </div>
      {refs.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: skills.length ? 10 : 0 }}>
          {refs.slice(0, compact ? 2 : 4).map(mod => (
            <span key={mod.id} className="tag" style={{ background: "white", color: "var(--navy-950)", border: "1px solid var(--line)" }}>
              {window.CURRICULUM.subjects[mod.subject]?.shortName || window.CURRICULUM.subjects[mod.subject]?.name || mod.subject} • Kelas {mod.level} • Unit {mod.unit}
            </span>
          ))}
        </div>
      )}
      {!compact && refs.length > 0 && (
        <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5, marginBottom: skills.length ? 10 : 0 }}>
          {refs.slice(0, 3).map(mod => mod.title).join(" • ")}
        </div>
      )}
      {skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {skills.map(skill => (
            <span key={skill} style={{ padding: "5px 9px", borderRadius: "var(--r-full)", background: compact ? "var(--bg)" : "white", border: "1px solid var(--line)", fontSize: 11, fontWeight: 800, color: "var(--ink-muted)" }}>
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

window.ResourceModuleLinks = ResourceModuleLinks;

const LabList = () => {
  const labs = window.CURRICULUM.labs.filter(l => (l.primaryLevel || l.level[0]) === window.USER.level);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? labs : labs.filter(l => l.subject === filter);

  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px 60px" }}>
        <Breadcrumb trail={[{ to: "/", label: "Beranda" }, { label: "Lab Maya" }]}/>

        <div className="list-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 40, alignItems: "center", margin: "16px 0 40px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "var(--info-300)", border: "2px solid var(--ink)", borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 800, marginBottom: 18, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <Icon.Beaker width="14" height="14"/> {labs.length} Eksperimen Interaktif
            </div>
            <h1 className="display" style={{ fontSize: 56, margin: 0, lineHeight: 1, color: "var(--navy-950)" }}>
              Lab <span style={{ color: "var(--info-500)", fontStyle: "italic" }}>Maya</span>
            </h1>
            <p style={{ fontSize: 16, color: "var(--ink-muted)", marginTop: 18, maxWidth: 520, lineHeight: 1.55 }}>
              Eksperimen digital yang berjalan langsung di browser. Visualisasi algoritma, simulator sirkuit, neural network playground — ngulik konsep susah jadi kelihatan dan terasa.
            </p>
          </div>
          <div className="card" style={{ padding: 24, background: "linear-gradient(135deg, var(--info-100), white)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "var(--info-300)", opacity: 0.4 }}/>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--info-500)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Tentang Lab Maya</div>
              <div className="display" style={{ fontSize: 22, lineHeight: 1.2, marginBottom: 12 }}>
                Lihat konsep abstrak jadi visual & bisa diotak-atik
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.55 }}>
                Setiap lab punya kontrol yang bisa kamu ubah — kecepatan, ukuran data, parameter. Eksperimen sesukamu, gak ada yang rusak.
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { id: "all", label: "Semua", color: "var(--navy-900)" },
            { id: "informatika", label: "Informatika", color: "var(--info-500)" },
            { id: "kka", label: "Koding & AI", color: "var(--ai-500)" },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="btn btn-sm"
              style={{
                background: filter === f.id ? f.color : "white",
                color: filter === f.id ? "white" : "var(--ink)",
              }}>{f.label}</button>
          ))}
        </div>

        {/* Grid */}
        <div className="list-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {filtered.map((lab, i) => (
            <LabCard key={lab.id} lab={lab} delay={i * 0.06}/>
          ))}
        </div>
      </div>
      <Footer/>
    </div>
  );
};

const LabCard = ({ lab, delay = 0 }) => {
  const subj = window.CURRICULUM.subjects[lab.subject];
  const I = Icon[lab.icon];
  const done = window.USER.completedLabs.includes(lab.id);
  return (
    <Link to={`/lab/${lab.id}`} onClick={() => { try { sessionStorage.removeItem("sigma_lab_referrer"); } catch (e) {} }} className="card card-hover fade-in-up" style={{
      padding: 22, background: "white", textDecoration: "none", color: "inherit", display: "block",
      animationDelay: `${delay}s`, position: "relative", overflow: "hidden",
    }}>
      {done && (
        <div style={{ position: "absolute", top: 14, right: 14, background: "var(--green-500)", color: "white", padding: "4px 10px", borderRadius: "var(--r-full)", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
          <Icon.Check width="12" height="12"/> Selesai
        </div>
      )}
      <div style={{ width: 56, height: 56, borderRadius: 14, background: lab.color, border: "2px solid var(--ink)", color: "var(--navy-950)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <I width="28" height="28"/>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        <span className={`tag ${subj.tagClass}`}>{subj.shortName || subj.name}</span>
        {[lab.primaryLevel || lab.level[0]].map(l => (
          <span key={l} className="tag" style={{ background: "var(--line)", color: "var(--ink-muted)" }}>{l}</span>
        ))}
      </div>
      <div className="display" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2, marginBottom: 6 }}>{lab.title}</div>
      <div style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 14, lineHeight: 1.5, minHeight: 40 }}>{lab.tagline}</div>
      <ResourceModuleLinks item={lab} compact/>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "var(--ink-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <span><Icon.Clock width="12" height="12" style={{ verticalAlign: "-2px" }}/> {lab.duration}</span>
        <span>{lab.difficulty}</span>
      </div>
    </Link>
  );
};

window.LabList = LabList;
