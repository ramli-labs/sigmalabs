// ============================================
// Shared Layout Components
// ============================================

const { useState, useEffect } = React;
const { Icon } = window;

// ---------- Router (hash-based) ----------
const useRoute = () => {
  const [route, setRoute] = useState(window.location.hash.slice(1) || "/");
  useEffect(() => {
    const onChange = () => {
      setRoute(window.location.hash.slice(1) || "/");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
};

const navigate = (path) => {
  window.location.hash = path;
};

const Link = ({ to, children, className, style, onClick }) => (
  <a
    href={`#${to}`}
    className={className}
    style={style}
    onClick={(e) => { if (onClick) onClick(e); }}
  >
    {children}
  </a>
);

window.useRoute = useRoute;
window.navigate = navigate;
window.Link = Link;

// ---------- Brand / Logo ----------
const LabschoolLogo = ({ size = 36, showText = true, showKicker = true, invert = false }) => (
  <Link to="/" className="brand-logo" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", minWidth: 0 }}>
    <div style={{
      width: size,
      height: size,
      borderRadius: 10,
      background: invert ? "var(--gold-400)" : "var(--navy-950)",
      color: invert ? "var(--navy-950)" : "white",
      border: invert ? "1.5px solid rgba(255,255,255,0.18)" : "2px solid var(--ink)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-display)",
      fontWeight: 800,
      fontSize: Math.max(18, Math.round(size * 0.58)),
      lineHeight: 1,
      flexShrink: 0,
    }}>
      S
    </div>
    {showText && (
      <div className="brand-logo-text" style={{ display: "grid", gap: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: Math.max(24, Math.round(size * 0.82)),
          lineHeight: 0.92,
          color: invert ? "white" : "var(--navy-950)",
          letterSpacing: 0,
        }}>
          SIGMA<span style={{ color: "var(--gold-500)" }}>.</span>
        </div>
        {showKicker && (
          <div className="brand-logo-kicker" style={{
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: invert ? "rgba(255,255,255,0.58)" : "var(--ink-subtle)",
            whiteSpace: "nowrap",
          }}>
            SMP Labschool Jakarta
          </div>
        )}
      </div>
    )}
  </Link>
);

const BrandStrip = ({ variant = "light" }) => {
  const invert = variant === "dark";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <img src="assets/logo labschool lengkap.png" style={{ height: 44, width: "auto", filter: invert ? "brightness(0) invert(1)" : "none", opacity: 0.9 }} alt="Labschool"/>
      <img src="assets/logo-maju.png" style={{ height: 26, opacity: invert ? 0.85 : 1 }} alt="MAJU"/>
      <img src="assets/logo-pemudajuara.png" style={{ height: 26, opacity: invert ? 0.85 : 1 }} alt="Pemuda Juara"/>
    </div>
  );
};

window.LabschoolLogo = LabschoolLogo;
window.BrandStrip = BrandStrip;

// ---------- Navbar ----------
const Navbar = ({ variant = "light" }) => {
  const route = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const dark = variant === "dark";

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: `/kelas/${window.USER.level}`, label: `Kelas ${window.USER.level}` },
    { to: "/lab", label: "Lab Maya" },
    { to: "/gim", label: "Gim" },
    { to: "/playground", label: "Playground" },
    { to: "/login", label: "Profil" },
  ];

  const isActive = (to) => route === to || route.startsWith(to + "/") || (to === "/dashboard" && route === "/dashboard");

  return (
    <nav className="site-nav" style={{
      padding: "18px 32px",
      background: dark ? "var(--navy-950)" : "var(--bg)",
      borderBottom: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid var(--line)",
      position: "sticky", top: 0, zIndex: 50,
      backdropFilter: "blur(8px)",
      backgroundColor: dark ? "rgba(11,22,51,0.95)" : "rgba(247,248,252,0.92)",
    }}>
      <div className="site-nav-inner" style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
        <div className="header-brand-lockup" style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <img
            src="assets/logo labschool lengkap.png"
            alt="SMP Labschool Jakarta"
            className="header-labschool-logo"
            style={{ height: 48, width: "auto", display: "block", filter: dark ? "brightness(0) invert(1)" : "none", flexShrink: 0 }}
          />
          <div style={{ width: 1, height: 32, background: dark ? "rgba(255,255,255,0.16)" : "var(--line-strong)", flexShrink: 0 }}/>
          <LabschoolLogo invert={dark} size={36}/>
        </div>

        <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: "8px 14px", borderRadius: "var(--r-full)",
              fontSize: 14, fontWeight: 600,
              color: isActive(l.to) ? (dark ? "var(--gold-400)" : "var(--navy-900)") : (dark ? "rgba(255,255,255,0.7)" : "var(--ink-muted)"),
              background: isActive(l.to) ? (dark ? "rgba(245,197,24,0.14)" : "white") : "transparent",
              border: isActive(l.to) && !dark ? "1.5px solid var(--line)" : "1.5px solid transparent",
            }}>{l.label}</Link>
          ))}
        </div>

        <div className="site-nav-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: dark ? "rgba(255,255,255,0.06)" : "white", borderRadius: "var(--r-full)", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid var(--line)" }}>
            <Icon.Bolt width="15" height="15" style={{ color: "var(--gold-500)" }}/>
            <span style={{ fontWeight: 800, fontSize: 13, color: dark ? "white" : "var(--navy-900)" }}>{window.USER.xp.toLocaleString()} XP</span>
          </div>
          <Link to="/login" className="profile-avatar" title="Ganti profil siswa" style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--gold-400)", border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800 }}>
            {window.USER.nickname[0]}
          </Link>
          <button
            className="btn btn-sm mobile-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Buka menu"
          ><Icon.Menu width="18" height="18"/></button>
        </div>
      </div>
      {menuOpen && (
        <div className="mobile-nav-panel">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} className={isActive(l.to) ? "mobile-nav-link active" : "mobile-nav-link"}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};
window.Navbar = Navbar;

// ---------- Footer ----------
const Footer = () => (
  <footer style={{ padding: "28px 32px", background: "var(--navy-950)", color: "rgba(255,255,255,0.72)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div className="footer-main-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <LabschoolLogo invert={true} size={34} showKicker={false}/>
          <div style={{ width: 1, height: 34, background: "rgba(255,255,255,0.14)" }}/>
          <div style={{ display: "grid", gap: 5 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "rgba(255,255,255,0.9)" }}>SMP Labschool Jakarta</div>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.58)" }}>
              SISTEM INFORMATIKA • GENERASI MAHIR ARTIFISIAL
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--gold-400)" }}>
              <span>Kreatif</span><span style={{ opacity: 0.45 }}>•</span><span>Berprestasi</span><span style={{ opacity: 0.45 }}>•</span><span>Berkarakter</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.52)", fontWeight: 700 }}>
            © 2026 SIGMA Labschool
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 11px", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, background: "rgba(255,255,255,0.94)", boxShadow: "0 8px 24px -18px rgba(0,0,0,0.7)" }}>
            <img
              src="assets/LOGO RJM Credit.png"
              alt="RJM"
              style={{ height: 26, width: "auto", opacity: 0.96 }}
            />
            <div style={{ fontSize: 12, fontWeight: 900, color: "var(--navy-950)", whiteSpace: "nowrap" }}>
              RamliJM
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
);
window.Footer = Footer;

// ---------- Module Card (used everywhere) ----------
const ModuleCard = ({ module: mod, progress = null, compact = false, locked = false, lockReason = "" }) => {
  const subj = window.CURRICULUM.subjects[mod.subject];
  const IconComp = Icon[subj.icon];
  const cardStyle = {
      padding: compact ? 18 : 22,
      background: "white",
      display: "block",
      textDecoration: "none",
      color: "inherit",
      opacity: locked ? 0.72 : 1,
      cursor: locked ? "not-allowed" : "pointer",
      position: "relative",
    };
  const content = (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{
          width: compact ? 44 : 50, height: compact ? 44 : 50,
          borderRadius: 12,
          background: subj.colorMid, color: "var(--navy-950)",
          border: "2px solid var(--ink)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <IconComp width={compact ? 22 : 26} height={compact ? 22 : 26}/>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
          <span className={`tag ${subj.tagClass}`}>Kelas {mod.level}</span>
          {locked && <span className="tag" style={{ background: "var(--line)", color: "var(--ink-muted)" }}><Icon.Lock width="11" height="11"/> Terkunci</span>}
        </div>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: compact ? 18 : 20, lineHeight: 1.15, marginBottom: 6, color: "var(--navy-950)" }}>
        {mod.title}
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5, marginBottom: 14, minHeight: 36 }}>
        {mod.tagline}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, fontWeight: 700, color: "var(--ink-subtle)", marginBottom: progress ? 10 : 0, textTransform: "uppercase", letterSpacing: "0.04em", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Icon.Clock width="12" height="12"/> {mod.duration}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Icon.Bolt width="12" height="12" style={{ color: "var(--gold-500)" }}/> {mod.xp} XP
        </div>
        <div>{mod.lessons} pelajaran</div>
      </div>
      {progress && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", marginBottom: 4 }}>
            <span>Progress</span>
            <span>{progress.percent}% • {progress.lessonsDone}/{progress.total}</span>
          </div>
          <div style={{ height: 6, background: "var(--line)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ width: `${progress.percent}%`, height: "100%", background: subj.colorMid }}/>
          </div>
        </div>
      )}
      {locked && lockReason && (
        <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "var(--bg)", border: "1px solid var(--line)", fontSize: 12, color: "var(--ink-muted)", fontWeight: 700, lineHeight: 1.45 }}>
          {lockReason}
        </div>
      )}
    </>
  );
  if (locked) {
    return (
      <div className="card" style={cardStyle}>
        {content}
      </div>
    );
  }
  return (
    <Link to={`/modul/${mod.id}`} className="card card-hover" style={cardStyle}>
      {content}
    </Link>
  );
};
window.ModuleCard = ModuleCard;

// ---------- Section header helper ----------
const SectionHeader = ({ eyebrow, title, subtitle, accentColor = "var(--navy-950)" }) => (
  <div style={{ marginBottom: 28 }}>
    {eyebrow && (
      <div style={{ display: "inline-block", fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accentColor, marginBottom: 10 }}>
        {eyebrow}
      </div>
    )}
    <h2 className="display" style={{ fontSize: 36, margin: 0, color: "var(--navy-950)" }}>{title}</h2>
    {subtitle && <p style={{ fontSize: 15, color: "var(--ink-muted)", maxWidth: 640, marginTop: 10 }}>{subtitle}</p>}
  </div>
);
window.SectionHeader = SectionHeader;

// ---------- Breadcrumb ----------
const Breadcrumb = ({ trail }) => (
  <div style={{ fontSize: 13, color: "var(--ink-subtle)", marginBottom: 10, fontWeight: 600 }}>
    {trail.map((t, i) => (
      <React.Fragment key={i}>
        {i > 0 && <span style={{ margin: "0 8px", color: "var(--line-strong)" }}>/</span>}
        {t.to ? <Link to={t.to} style={{ color: "var(--ink-muted)" }}>{t.label}</Link> : <span style={{ color: "var(--ink)" }}>{t.label}</span>}
      </React.Fragment>
    ))}
  </div>
);
window.Breadcrumb = Breadcrumb;

// ---------- Empty state ----------
const EmptyState = ({ icon = "Search", title, subtitle, action }) => {
  const I = Icon[icon];
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--bg)", border: "2px solid var(--line-strong)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 18, color: "var(--ink-subtle)" }}>
        <I width="32" height="32"/>
      </div>
      <div className="display" style={{ fontSize: 22, marginBottom: 6 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 14, color: "var(--ink-muted)", maxWidth: 360, margin: "0 auto" }}>{subtitle}</div>}
      {action}
    </div>
  );
};
window.EmptyState = EmptyState;

// ---------- Back to Lesson Button ----------
const BackToLesson = () => {
  const referrer = sessionStorage.getItem("sigma_lab_referrer");
  if (!referrer || !referrer.includes("/modul/")) return null;
  const modId = referrer.split("/modul/")[1]?.split("?")[0];
  const mod = window.CURRICULUM?.modules?.find(m => m.id === modId);
  const label = mod ? mod.title : "Pelajaran";
  return (
    <button
      onClick={() => {
        sessionStorage.removeItem("sigma_lab_referrer");
        navigate(referrer);
      }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "10px 18px", borderRadius: 12,
        background: "var(--gold-300)", border: "2px solid var(--ink)",
        fontWeight: 800, fontSize: 14, cursor: "pointer",
        boxShadow: "var(--shadow-chunk-sm)", marginBottom: 20,
        color: "var(--navy-950)",
      }}
    >
      ← Kembali ke Modul: {label}
    </button>
  );
};
window.BackToLesson = BackToLesson;

// ---------- Form control helper ----------
const ControlField = ({ label, children }) => (
  <div>
    <label style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-subtle)", marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);
window.ControlField = ControlField;
