// ============================================
// Dashboard Guru — rekap progres siswa
// Data dibaca dari profil lokal (localStorage) perangkat/browser ini.
// ============================================

// --- shared globals ---
const { Icon, Navbar, Footer, Link, useRoute, navigate, SectionHeader, Breadcrumb, EmptyState, ControlField } = window;
const { useState, useEffect } = React;

const TeacherDashboard = () => {
  const readProfiles = () => { try { return window.SIGMA_AUTH.getProfiles() || []; } catch (e) { return []; } };
  const [profiles, setProfiles] = useState(readProfiles);
  const [levelFilter, setLevelFilter] = useState("all"); // "all" | "7" | "8" | "9"

  const modules = window.CURRICULUM.modules;

  const moduleComplete = (p, mid) => { try { return window.SIGMA_AUTH.isModuleLearningComplete(mid, p); } catch (e) { return false; } };
  const quizAvg = (p) => {
    const qs = Object.values(p.quizzes || {});
    if (!qs.length) return null;
    return Math.round(qs.reduce((a, q) => a + (Number(q.latestPercent) || 0), 0) / qs.length);
  };
  const modulesTuntas = (p) => modules.filter(m => m.level === p.level && moduleComplete(p, m.id)).length;
  const modulesForLevel = (lvl) => modules.filter(m => m.level === lvl).length;
  const started = (p, mid) => !!(p.progress?.[mid]?.lessonsDone || p.quizzes?.[mid] || Object.keys(p.quests?.[mid] || {}).length);

  const shown = levelFilter === "all" ? profiles : profiles.filter(p => String(p.level) === String(levelFilter));

  // Ringkasan
  const studentCount = shown.length;
  const avgXp = studentCount ? Math.round(shown.reduce((a, p) => a + (p.xp || 0), 0) / studentCount) : 0;
  const qa = shown.map(quizAvg).filter(v => v != null);
  const avgQuiz = qa.length ? Math.round(qa.reduce((a, b) => a + b, 0) / qa.length) : null;
  const totalActs = shown.reduce((a, p) => a + (p.completedLabs?.length || 0) + (p.completedGames?.length || 0), 0);

  // Rekap per modul (hanya saat satu kelas dipilih, karena modul per-kelas)
  const levelNum = levelFilter === "all" ? null : Number(levelFilter);
  const levelModules = levelNum
    ? modules.filter(m => m.level === levelNum).sort((a, b) => a.subject === b.subject ? (a.unit || 0) - (b.unit || 0) : (a.subject < b.subject ? -1 : 1))
    : [];
  const moduleStat = (mod) => {
    const mulai = shown.filter(p => started(p, mod.id)).length;
    const tuntas = shown.filter(p => moduleComplete(p, mod.id)).length;
    const skor = shown.map(p => p.quizzes?.[mod.id]?.latestPercent).filter(v => v != null);
    const rata = skor.length ? Math.round(skor.reduce((a, b) => a + b, 0) / skor.length) : null;
    return { mulai, tuntas, rata, sudahKuis: skor.length };
  };

  const colFor = (pct) => pct == null ? "var(--ink-subtle)" : pct >= 80 ? "var(--green-500)" : pct >= 60 ? "var(--orange-500)" : "var(--red-500)";

  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px 60px" }}>
        <Breadcrumb trail={[{ to: "/", label: "Beranda" }, { label: "Dashboard Guru" }]}/>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, margin: "16px 0 8px" }}>
          <div>
            <div className="tag tag-gold" style={{ marginBottom: 10 }}>MODE GURU</div>
            <h1 className="display" style={{ fontSize: 48, margin: 0, color: "var(--navy-950)" }}>Dashboard Guru</h1>
          </div>
          <button className="btn btn-sm" onClick={() => setProfiles(readProfiles())}>
            <Icon.Refresh width="14" height="14"/> Muat ulang data
          </button>
        </div>
        <div style={{ padding: "10px 14px", background: "var(--bg-cream)", border: "1.5px solid var(--gold-400)", borderRadius: 12, fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5, marginBottom: 24 }}>
          ℹ️ Rekap di bawah dihitung dari <strong>profil siswa yang tersimpan di browser/perangkat ini</strong> (belum ada sinkronisasi antar-perangkat). Cocok untuk perangkat kelas bersama atau demo.
        </div>

        {/* Filter kelas */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { id: "all", label: "Semua Kelas" },
            { id: "7", label: "Kelas 7" },
            { id: "8", label: "Kelas 8" },
            { id: "9", label: "Kelas 9" },
          ].map(f => (
            <button key={f.id} onClick={() => setLevelFilter(f.id)} className="btn btn-sm"
              style={{ background: levelFilter === f.id ? "var(--navy-900)" : "white", color: levelFilter === f.id ? "white" : "var(--ink)" }}>
              {f.label}
            </button>
          ))}
        </div>

        {studentCount === 0 ? (
          <EmptyState icon="Users" title="Belum ada profil siswa"
            subtitle="Buat profil lewat halaman Profil, atau ganti filter kelas."
            action={<Link to="/login" className="btn btn-primary" style={{ marginTop: 18 }}>Ke Halaman Profil</Link>}/>
        ) : (
          <>
            {/* Ringkasan */}
            <div className="responsive-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              <SummaryCard icon="Users" label="Jumlah Siswa" value={studentCount} color="var(--info-500)"/>
              <SummaryCard icon="Bolt" label="Rata-rata XP" value={avgXp.toLocaleString()} color="var(--gold-500)"/>
              <SummaryCard icon="Chart" label="Rata-rata Kuis" value={avgQuiz == null ? "—" : `${avgQuiz}%`} color={colFor(avgQuiz)}/>
              <SummaryCard icon="Beaker" label="Lab + Gim Selesai" value={totalActs} color="var(--ai-500)"/>
            </div>

            {/* Tabel siswa */}
            <div className="card" style={{ padding: 0, background: "white", marginBottom: 28, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1.5px solid var(--line)", fontWeight: 900, fontSize: 16 }}>
                Daftar Siswa ({studentCount})
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 720 }}>
                  <thead>
                    <tr style={{ background: "var(--bg)", textAlign: "left" }}>
                      {["Nama", "Kelas", "XP", "Modul Tuntas", "Rata-rata Kuis", "Lab", "Gim", "Badge"].map((h, i) => (
                        <th key={i} style={{ padding: "10px 14px", fontWeight: 800, color: "var(--ink-muted)", whiteSpace: "nowrap", textAlign: i >= 2 ? "center" : "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shown.slice().sort((a, b) => (b.xp || 0) - (a.xp || 0)).map(p => {
                      const qv = quizAvg(p);
                      const tuntas = modulesTuntas(p);
                      const total = modulesForLevel(p.level) || 6;
                      return (
                        <tr key={p.id} style={{ borderTop: "1px solid var(--line)" }}>
                          <td style={{ padding: "10px 14px", fontWeight: 800, color: "var(--navy-950)" }}>{p.name}</td>
                          <td style={{ padding: "10px 14px", color: "var(--ink-muted)" }}>{p.class || `${p.level}`}</td>
                          <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700 }}>{(p.xp || 0).toLocaleString()}</td>
                          <td style={{ padding: "10px 14px", textAlign: "center" }}>{tuntas}/{total}</td>
                          <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 800, color: colFor(qv) }}>{qv == null ? "—" : `${qv}%`}</td>
                          <td style={{ padding: "10px 14px", textAlign: "center" }}>{p.completedLabs?.length || 0}</td>
                          <td style={{ padding: "10px 14px", textAlign: "center" }}>{p.completedGames?.length || 0}</td>
                          <td style={{ padding: "10px 14px", textAlign: "center" }}>{p.badges?.length || 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rekap per modul */}
            {levelNum ? (
              <div className="card" style={{ padding: 0, background: "white", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1.5px solid var(--line)", fontWeight: 900, fontSize: 16 }}>
                  Rekap per Modul — Kelas {levelNum}
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 640 }}>
                    <thead>
                      <tr style={{ background: "var(--bg)", textAlign: "left" }}>
                        {["Modul", "Mapel", "Mulai", "Tuntas", "Rata-rata Kuis"].map((h, i) => (
                          <th key={i} style={{ padding: "10px 14px", fontWeight: 800, color: "var(--ink-muted)", whiteSpace: "nowrap", textAlign: i >= 2 ? "center" : "left" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {levelModules.map(mod => {
                        const s = moduleStat(mod);
                        const subj = window.CURRICULUM.subjects[mod.subject];
                        return (
                          <tr key={mod.id} style={{ borderTop: "1px solid var(--line)" }}>
                            <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--navy-950)" }}>{mod.title}</td>
                            <td style={{ padding: "10px 14px" }}><span className={`tag ${subj.tagClass}`}>{subj.shortName || subj.name}</span></td>
                            <td style={{ padding: "10px 14px", textAlign: "center" }}>{s.mulai}/{studentCount}</td>
                            <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: s.tuntas > 0 ? "var(--green-500)" : "var(--ink-subtle)" }}>{s.tuntas}/{studentCount}</td>
                            <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 800, color: colFor(s.rata) }}>{s.rata == null ? "—" : `${s.rata}%`}<span style={{ color: "var(--ink-subtle)", fontWeight: 600, fontSize: 11 }}> ({s.sudahKuis})</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: "10px 16px", fontSize: 12, color: "var(--ink-subtle)", borderTop: "1px solid var(--line)" }}>
                  Angka dalam ( ) = jumlah siswa yang sudah mengerjakan kuis modul tersebut.
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px 18px", background: "white", border: "1.5px dashed var(--line-strong)", borderRadius: 14, fontSize: 14, color: "var(--ink-muted)" }}>
                Pilih satu kelas (7/8/9) di atas untuk melihat <strong>rekap progres per modul</strong>.
              </div>
            )}
          </>
        )}
      </div>
      <Footer/>
    </div>
  );
};

const SummaryCard = ({ icon, label, value, color }) => {
  const I = Icon[icon] || Icon.Chart;
  return (
    <div className="card" style={{ padding: 18, background: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--bg)", border: "1.5px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color }}>
          <I width="20" height="20"/>
        </div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-subtle)" }}>{label}</div>
      </div>
      <div className="display" style={{ fontSize: 32, color: "var(--navy-950)", lineHeight: 1 }}>{value}</div>
    </div>
  );
};

window.TeacherDashboard = TeacherDashboard;
