// ============================================
// Game List — all educational games
// ============================================

// --- shared globals ---
const { Icon, Navbar, Footer, Link, useRoute, navigate, SectionHeader, Breadcrumb, EmptyState, ModuleCard, LabschoolLogo, BrandStrip, ControlField } = window;
const { useState, useEffect, useRef } = React;

const GameList = () => {
  const games = window.CURRICULUM.games.filter(g => (g.primaryLevel || g.level[0]) === window.USER.level);
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? games : games.filter(g => g.subject === filter);
  const todayStr = new Date().toDateString();
  const dailyDone = Math.min(
    Object.values(window.USER.gameScores || {}).filter(g => g.updatedAt && new Date(g.updatedAt).toDateString() === todayStr).length,
    3
  );

  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px 60px" }}>
        <Breadcrumb trail={[{ to: "/", label: "Beranda" }, { label: "Gim Edukasi" }]}/>

        <div className="list-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 40, alignItems: "center", margin: "16px 0 40px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "var(--ai-300)", border: "2px solid var(--ink)", borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 800, marginBottom: 18, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <Icon.GamePad width="14" height="14"/> {games.length} Gim Seru
            </div>
            <h1 className="display mobile-safe-title" style={{ fontSize: 56, margin: 0, lineHeight: 1, color: "var(--navy-950)" }}>
              Gim <span style={{ color: "var(--ai-500)", fontStyle: "italic" }}>Edukasi</span>
            </h1>
            <p style={{ fontSize: 16, color: "var(--ink-muted)", marginTop: 18, maxWidth: 520, lineHeight: 1.55 }}>
              Belajar lewat tantangan — debug kode, pecahkan kode rahasia, hadapi dilema etika AI. Dapat XP & badge setiap menang.
            </p>
          </div>
          <div className="card" style={{ padding: 24, background: "var(--navy-950)", color: "white", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "var(--gold-400)", opacity: 0.2, filter: "blur(20px)" }}/>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--gold-400)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Misi Harian</div>
              <div className="display" style={{ fontSize: 22, lineHeight: 1.2, marginBottom: 8 }}>Main 3 gim hari ini</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>Target pemanasan: pilih gim yang sesuai modul, lalu ulangi sampai konsepnya terasa.</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[0, 1, 2].map(i => {
                  const filled = i < dailyDone;
                  return <div key={i} style={{ flex: 1, height: 10, borderRadius: 6, background: filled ? "var(--gold-400)" : "rgba(255,255,255,0.15)" }}/>;
                })}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 10, color: "rgba(255,255,255,0.8)" }}>{dailyDone}/3 selesai</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { id: "all", label: "Semua", color: "var(--navy-900)" },
            { id: "informatika", label: "Informatika", color: "var(--info-500)" },
            { id: "kka", label: "Koding & AI", color: "var(--ai-500)" },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} className="btn btn-sm"
              style={{ background: filter === f.id ? f.color : "white", color: filter === f.id ? "white" : "var(--ink)" }}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="list-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {filtered.map((g, i) => (
            <GameCard key={g.id} game={g} delay={i * 0.06}/>
          ))}
        </div>
      </div>
      <Footer/>
    </div>
  );
};

const GameCard = ({ game, delay = 0 }) => {
  const subj = window.CURRICULUM.subjects[game.subject];
  const I = Icon[game.icon];
  const done = window.USER.completedGames.includes(game.id);
  return (
    <Link to={`/gim/${game.id}`} onClick={() => { try { sessionStorage.removeItem("sigma_lab_referrer"); } catch (e) {} }} className="card card-hover fade-in-up" style={{
      padding: 22, background: "white", textDecoration: "none", color: "inherit", display: "block",
      animationDelay: `${delay}s`, position: "relative", overflow: "hidden",
    }}>
      {done && (
        <div style={{ position: "absolute", top: 14, right: 14, background: "var(--green-500)", color: "white", padding: "4px 10px", borderRadius: "var(--r-full)", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
          <Icon.Check width="12" height="12"/> Juara
        </div>
      )}
      <div style={{ width: 56, height: 56, borderRadius: 14, background: game.color, border: "2px solid var(--ink)", color: game.color === "var(--gold-500)" || game.color === "var(--info-400)" ? "var(--navy-950)" : "white", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <I width="28" height="28"/>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        <span className={`tag ${subj.tagClass}`}>{subj.shortName || subj.name}</span>
        {[game.primaryLevel || game.level[0]].map(l => (
          <span key={l} className="tag" style={{ background: "var(--line)", color: "var(--ink-muted)" }}>{l}</span>
        ))}
      </div>
      <div className="display" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2, marginBottom: 6 }}>{game.title}</div>
      <div style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 14, lineHeight: 1.5, minHeight: 40 }}>{game.tagline}</div>
      {window.ResourceModuleLinks && <window.ResourceModuleLinks item={game} compact/>}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "var(--ink-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <span><Icon.Clock width="12" height="12" style={{ verticalAlign: "-2px" }}/> {game.duration}</span>
        <span style={{ color: "var(--gold-500)" }}><Icon.Bolt width="12" height="12" style={{ verticalAlign: "-2px" }}/> +{game.xpReward} XP</span>
      </div>
    </Link>
  );
};

window.GameList = GameList;
