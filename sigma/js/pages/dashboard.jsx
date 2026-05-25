// ============================================
// Dashboard — Student home after login
// ============================================

// --- shared globals ---
const { Icon, Navbar, Footer, Link, useRoute, navigate, SectionHeader, Breadcrumb, EmptyState, ModuleCard, LabschoolLogo, BrandStrip, ControlField } = window;
const { useState, useEffect, useRef } = React;

const Dashboard = () => {
  const [, setUserVersion] = useState(0);

  useEffect(() => {
    const onUserChange = () => setUserVersion(v => v + 1);
    window.addEventListener("sigma:userchange", onUserChange);
    return () => window.removeEventListener("sigma:userchange", onUserChange);
  }, []);

  const user = window.USER;
  const modules = window.CURRICULUM.modules;
  const levelModules = modules
    .filter(m => m.level === user.level && m.subject === "informatika")
    .sort((a, b) => (a.unit || 0) - (b.unit || 0));
  const continueItem = {
    module: levelModules.find(m => window.SIGMA_AUTH.isModuleSequenceUnlocked(m.id) && !window.SIGMA_AUTH.isModuleLearningComplete(m.id)) || levelModules[0],
    progress: null,
  };
  const continueModule = continueItem.module;
  const continueProgress = window.USER.progress[continueModule?.id] || { percent: 0, lessonsDone: 0, total: continueModule?.lessons || 1 };
  const continueSubject = continueModule ? window.CURRICULUM.subjects[continueModule.subject] : window.CURRICULUM.subjects.informatika;
  const stepStatus = continueModule ? window.SIGMA_AUTH.getLearningStepStatus(continueModule.id) : {};
  const learningDirections = continueModule ? [
    { t: "1. Baca Materi", d: "Selesaikan semua pelajaran pada modul ini.", p: `${continueProgress.lessonsDone}/${continueProgress.total} pelajaran`, c: "var(--info-400)", link: `/modul/${continueModule.id}`, enabled: true, done: stepStatus.materiDone },
    { t: "2. Kerjakan Misi", d: "Misi terbuka setelah semua materi dibaca.", p: `${stepStatus.missionCount || 0}/${continueModule.lessons} misi`, c: "var(--gold-500)", link: `/modul/${continueModule.id}`, enabled: stepStatus.misiUnlocked, done: stepStatus.misiDone },
    { t: "3. Kerjakan Kuis", d: "Kuis terbuka setelah semua misi selesai.", p: stepStatus.kuisDone ? "Sudah dikumpulkan" : "Belum dikerjakan", c: "var(--ai-500)", link: `/modul/${continueModule.id}`, enabled: stepStatus.kuisUnlocked, done: stepStatus.kuisDone },
  ] : [];

  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px 60px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--ink-subtle)", fontWeight: 600, textTransform: "capitalize" }}>{today}</div>
            <h1 className="display" style={{ fontSize: 48, margin: "4px 0 0", color: "var(--navy-950)" }}>
              Halo, <span style={{ color: "var(--ai-500)" }}>{user.nickname}!</span> 👋
            </h1>
            <p style={{ fontSize: 15, color: "var(--ink-muted)", marginTop: 6, margin: 0 }}>
              Siap lanjut petualangan koding hari ini?
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <StatPill icon="Bolt" label="XP" value={user.xp.toLocaleString()} color="var(--gold-500)"/>
            <StatPill icon="Fire" label="Streak" value={`${user.streak} hari`} color="var(--orange-500)"/>
            <StatPill icon="Trophy" label="Badge" value={`${user.badges.length}/24`} color="var(--ai-500)"/>
          </div>
        </div>

        {/* Top grid */}
        <div className="dashboard-top-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, marginBottom: 24 }}>
          {/* CTA — continue module */}
          <div className="card" style={{ padding: 32, background: "linear-gradient(135deg, var(--navy-900), var(--navy-700))", color: "white", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, right: -40, width: 220, height: 220, borderRadius: "50%", background: "var(--ai-400)", opacity: 0.3, filter: "blur(20px)" }}/>
            <div style={{ position: "absolute", bottom: -30, left: -20, width: 140, height: 140, borderRadius: "50%", background: "var(--gold-400)", opacity: 0.15, filter: "blur(12px)" }}/>
            <div className="tag" style={{ background: "rgba(38,211,234,0.18)", color: "var(--info-300)", marginBottom: 14, position: "relative" }}>{continueSubject.name} • KELAS {continueModule?.level || user.level} • LANJUTKAN</div>
            <h2 className="display" style={{ fontSize: 38, margin: 0, lineHeight: 1.05, position: "relative" }}>{continueModule?.title || "Mulai Modul Pertama"}</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 12, maxWidth: 460, position: "relative" }}>
              {continueProgress.lessonsDone > 0
                ? `Kamu sudah selesai ${continueProgress.lessonsDone} dari ${continueProgress.total} pelajaran. Lanjutkan sampai tuntas untuk dapat XP dan badge.`
                : "Mulai modul pengayaan pertama dan simpan progress langsung di browser ini."}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20, position: "relative" }}>
              <div style={{ flex: 1, maxWidth: 280, height: 10, background: "rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ width: `${continueProgress.percent}%`, height: "100%", background: "linear-gradient(90deg, var(--ai-400), var(--gold-400))" }}/>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{continueProgress.lessonsDone}/{continueProgress.total}</span>
            </div>
            <Link to={`/modul/${continueModule?.id || "inf7-1"}`} className="btn btn-primary" style={{ marginTop: 22, padding: "14px 22px", position: "relative" }}>
              <Icon.Play width="16" height="16"/> Lanjut Pelajaran
            </Link>
          </div>

          {/* Badges */}
          <div className="card" style={{ padding: 22, background: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Badge Pemuda Juara</div>
              <span style={{ fontSize: 12, color: "var(--ink-subtle)", fontWeight: 600 }}>{user.badges.length} / 24</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {user.badges.map((b, i) => (
                <div key={i} title={b.label} style={{
                  aspectRatio: 1, borderRadius: 14,
                  background: b.color,
                  border: "2px solid var(--ink)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28,
                  boxShadow: "var(--shadow-chunk-sm)",
                }}>{b.emoji}</div>
              ))}
              {Array(Math.max(0, 8 - user.badges.length)).fill(0).map((_, i) => (
                <div key={`l${i}`} style={{
                  aspectRatio: 1, borderRadius: 14,
                  background: "var(--line)",
                  border: "2px solid var(--line-strong)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, color: "var(--ink-subtle)",
                }}><Icon.Lock width="18" height="18"/></div>
              ))}
            </div>
          </div>
        </div>

        {/* Continue learning */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "24px 0 14px" }}>
          <h3 className="display" style={{ fontSize: 28, margin: 0 }}>Lanjutkan belajar</h3>
          <Link to={`/kelas/${user.level}`} style={{ fontSize: 13, fontWeight: 700, color: "var(--ai-500)" }}>Semua modul →</Link>
        </div>
        <div className="dashboard-module-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {levelModules.slice(0, 3).map((m) => (
            <ModuleCard
              key={m.id}
              module={m}
              progress={window.USER.progress[m.id] || null}
              locked={!window.SIGMA_AUTH.isModuleSequenceUnlocked(m.id)}
              lockReason={window.SIGMA_AUTH.getPreviousModule(m.id) ? `Selesaikan dulu ${window.SIGMA_AUTH.getPreviousModule(m.id).title}.` : ""}
            />
          ))}
        </div>

        {/* Quick actions */}
        <div className="dashboard-split-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
          <QuickShortcut
            title="Misi Belajar"
            subtitle="Misi per pelajaran"
            description="Setiap pelajaran punya misi dan mini interaksi agar pengayaan web terasa nyambung dengan modul cetak."
            to={`/modul/${continueModule?.id || "inf7-1"}`} bg="var(--info-100)" icon="Puzzle"
            items={["Misi", "Peta Konsep", "Mini Interaksi"]}
          />
          <QuickShortcut
            title="Portofolio"
            subtitle="Segera"
            description="Nantinya refleksi, misi selesai, kuis, XP, badge, dan proyek mini siswa terkumpul di satu tempat."
            to="/dashboard" bg="var(--ai-100)" icon="Book"
            items={["Refleksi", "Misi", "Badge"]}
          />
        </div>

        {/* Bottom row: learning directions + leaderboard */}
        <div className="dashboard-split-grid" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
          <div className="card" style={{ padding: 22, background: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>📋 Arahan Belajar</div>
              <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>Berurutan</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", fontWeight: 700, lineHeight: 1.5, marginBottom: 8 }}>
              Modul aktif: <strong>{continueModule?.title}</strong>
            </div>
            {learningDirections.map((tk, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderTop: i === 0 ? "none" : "1px solid var(--line)", opacity: tk.enabled ? 1 : 0.58 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: tk.c }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{tk.t}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>{tk.p} • {tk.d}</div>
                </div>
                {tk.done ? (
                  <span className="tag tag-green"><Icon.Check width="12" height="12"/> Selesai</span>
                ) : tk.enabled ? (
                  <Link to={tk.link} className="btn btn-sm">Buka</Link>
                ) : (
                  <span className="tag" style={{ background: "var(--line)", color: "var(--ink-muted)" }}><Icon.Lock width="12" height="12"/> Terkunci</span>
                )}
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 22, background: "var(--navy-950)", color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>🏆 Top 5 Kelas {user.class}</div>
              <span style={{ fontSize: 12, color: "var(--gold-400)", fontWeight: 600 }}>Minggu ini</span>
            </div>
            {[
              { r: 1, n: "Aisha K.", xp: 2140 },
              { r: 2, n: "Bima S.", xp: 1980 },
              { r: 3, n: `${user.nickname} (kamu)`, xp: user.xp, you: true },
              { r: 4, n: "Kayla P.", xp: 1120 },
              { r: 5, n: "Nadia R.", xp: 940 },
            ].map(p => (
              <div key={p.r} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: p.r < 5 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                <div style={{ width: 22, fontWeight: 800, color: p.r <= 3 ? "var(--gold-400)" : "rgba(255,255,255,0.5)" }}>#{p.r}</div>
                <div style={{ flex: 1, fontWeight: p.you ? 800 : 600, color: p.you ? "var(--gold-400)" : "white", fontSize: 14 }}>{p.n}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{p.xp} XP</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

const StatPill = ({ icon, label, value, color }) => {
  const I = Icon[icon];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "white", borderRadius: 14, border: "1.5px solid var(--line)" }}>
      <I width="20" height="20" style={{ color }}/>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-subtle)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{value}</div>
      </div>
    </div>
  );
};

const QuickShortcut = ({ title, subtitle, description, to, bg, icon, items }) => {
  const I = Icon[icon];
  return (
    <Link to={to} className="card card-hover" style={{ padding: 26, background: bg, textDecoration: "none", color: "inherit", display: "block", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "white", border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <I width="28" height="28"/>
        </div>
        <div style={{ padding: "6px 12px", background: "white", border: "1.5px solid var(--ink)", borderRadius: "var(--r-full)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>{subtitle}</div>
      </div>
      <h3 className="display" style={{ fontSize: 26, margin: "0 0 8px" }}>{title}</h3>
      <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 14 }}>{description}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.map((t, i) => (
          <span key={i} style={{ padding: "5px 10px", background: "white", border: "1.5px solid var(--ink)", borderRadius: "var(--r-full)", fontSize: 11, fontWeight: 700 }}>{t}</span>
        ))}
      </div>
    </Link>
  );
};

window.Dashboard = Dashboard;
