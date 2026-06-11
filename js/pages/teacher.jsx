// ============================================
// Dashboard Guru — rekap progres siswa dari Supabase
// ============================================

const { Icon, Navbar, Footer, Link, useRoute, navigate, SectionHeader, Breadcrumb, EmptyState, ControlField } = window;
const { useState, useEffect } = React;

// ---- helper warna berdasarkan persentase ----
const colFor = (pct) =>
  pct == null ? "var(--ink-subtle)"
  : pct >= 80  ? "var(--green-500)"
  : pct >= 60  ? "var(--orange-500)"
  : "var(--red-500)";

// ---- Panel detail satu siswa ----
const StudentDetail = ({ profile, onClose }) => {
  const [tab, setTab] = useState("materi");
  const [expandedMod, setExpandedMod] = useState(null);

  const subjectOrder = ["informatika", "kka"];
  const modules = window.CURRICULUM.modules
    .filter(m => m.level === profile.level)
    .slice().sort((a, b) =>
      a.subject === b.subject ? (a.unit || 0) - (b.unit || 0)
      : subjectOrder.indexOf(a.subject) - subjectOrder.indexOf(b.subject)
    );

  const labs  = window.CURRICULUM.labs  || [];
  const games = window.CURRICULUM.games || [];
  const TABS  = [
    { id: "materi",    label: "Materi & Refleksi" },
    { id: "misi",      label: "Misi" },
    { id: "kuis",      label: "Kuis" },
    { id: "aktivitas", label: "Aktivitas" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
      <div onClick={onClose} style={{ flex: 1, background: "rgba(11,22,51,0.45)" }}/>
      <div style={{ width: "min(680px, 100vw)", background: "var(--bg)", display: "flex", flexDirection: "column", boxShadow: "-4px 0 32px rgba(0,0,0,0.18)" }}>

        {/* Header siswa */}
        <div style={{ padding: "20px 24px 0", background: "white", borderBottom: "1.5px solid var(--line)", position: "sticky", top: 0, zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--navy-950)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, border: "2px solid var(--ink)", flexShrink: 0 }}>
              {(profile.nickname || profile.name || "?")[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 18, color: "var(--navy-950)" }}>{profile.name}</div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)", fontWeight: 700, marginTop: 2 }}>
                Kelas {profile.class || profile.level} &nbsp;·&nbsp; {(profile.xp || 0).toLocaleString()} XP &nbsp;·&nbsp; {profile.badges?.length || 0} badge
              </div>
            </div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px solid var(--line)", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <Icon.X width="16" height="16"/>
            </button>
          </div>
          {/* Tab bar */}
          <div style={{ display: "flex", gap: 2 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "8px 14px", fontSize: 13, fontWeight: 700, border: "none", background: "transparent", cursor: "pointer",
                color: tab === t.id ? "var(--navy-950)" : "var(--ink-muted)",
                borderBottom: tab === t.id ? "2.5px solid var(--navy-950)" : "2.5px solid transparent",
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Konten tab */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>

          {/* ===== TAB: MATERI & REFLEKSI ===== */}
          {tab === "materi" && (
            <div style={{ display: "grid", gap: 12 }}>
              {modules.map(mod => {
                const prog    = profile.progress?.[mod.id] || {};
                const reflMap = profile.reflections?.[mod.id] || {};
                const done    = Number(prog.lessonsDone || 0);
                const completedLessons = prog.completedLessons || [];
                const subj    = window.CURRICULUM.subjects[mod.subject];
                const pct     = Math.round((done / (mod.lessons || 1)) * 100);
                const isOpen  = expandedMod === mod.id + "-materi";
                const touched = done > 0 || Object.keys(reflMap).length > 0;

                return (
                  <div key={mod.id} style={{ background: "white", border: "1.5px solid var(--line)", borderRadius: 14, overflow: "hidden", opacity: touched ? 1 : 0.5 }}>
                    <button onClick={() => setExpandedMod(isOpen ? null : mod.id + "-materi")}
                      style={{ width: "100%", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                      <span className={`tag ${subj.tagClass}`} style={{ fontSize: 10, flexShrink: 0 }}>{subj.shortName || subj.name}</span>
                      <span style={{ flex: 1, fontWeight: 800, fontSize: 14, color: "var(--navy-950)" }}>{mod.title}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? "var(--green-500)" : "var(--ink-muted)", whiteSpace: "nowrap" }}>{done}/{mod.lessons} pelajaran</span>
                      <Icon.ArrowRight width="14" height="14" style={{ color: "var(--ink-subtle)", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}/>
                    </button>

                    {isOpen && (
                      <div style={{ borderTop: "1px solid var(--line)", padding: "4px 0" }}>
                        {Array.from({ length: mod.lessons }, (_, i) => {
                          const isDone = completedLessons.includes(i) || i < done;
                          const refl   = reflMap[i];
                          return (
                            <div key={i} style={{ padding: "12px 16px", borderBottom: i < mod.lessons - 1 ? "1px solid var(--line)" : "none" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: refl ? 8 : 0 }}>
                                <span style={{ fontSize: 18 }}>{isDone ? "✅" : "⭕"}</span>
                                <span style={{ fontWeight: 700, fontSize: 13, color: "var(--navy-950)" }}>Pelajaran {i + 1}</span>
                                {!isDone && <span style={{ fontSize: 11, color: "var(--ink-subtle)" }}>Belum dibaca</span>}
                              </div>
                              {refl ? (
                                <div style={{ marginLeft: 30, padding: "10px 12px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--line)" }}>
                                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-subtle)", marginBottom: 4 }}>REFLEKSI</div>
                                  <div style={{ fontSize: 13, color: "var(--navy-950)", lineHeight: 1.6 }}>{refl.text || "—"}</div>
                                  <div style={{ fontSize: 10, color: "var(--ink-subtle)", marginTop: 6 }}>{refl.updatedAt ? new Date(refl.updatedAt).toLocaleString("id-ID") : ""}</div>
                                </div>
                              ) : isDone ? (
                                <div style={{ marginLeft: 30, fontSize: 12, color: "var(--ink-subtle)", fontStyle: "italic" }}>Refleksi belum diisi</div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== TAB: MISI ===== */}
          {tab === "misi" && (
            <div style={{ display: "grid", gap: 12 }}>
              {modules.map(mod => {
                const quests  = profile.quests?.[mod.id] || {};
                const subj    = window.CURRICULUM.subjects[mod.subject];
                const doneCnt = Object.values(quests).filter(q => q.completed).length;
                const touched = doneCnt > 0;
                const isOpen  = expandedMod === mod.id + "-misi";

                return (
                  <div key={mod.id} style={{ background: "white", border: "1.5px solid var(--line)", borderRadius: 14, overflow: "hidden", opacity: touched ? 1 : 0.5 }}>
                    <button onClick={() => setExpandedMod(isOpen ? null : mod.id + "-misi")}
                      style={{ width: "100%", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                      <span className={`tag ${subj.tagClass}`} style={{ fontSize: 10, flexShrink: 0 }}>{subj.shortName || subj.name}</span>
                      <span style={{ flex: 1, fontWeight: 800, fontSize: 14, color: "var(--navy-950)" }}>{mod.title}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: doneCnt >= mod.lessons ? "var(--green-500)" : "var(--ink-muted)", whiteSpace: "nowrap" }}>{doneCnt}/{mod.lessons} misi</span>
                      <Icon.ArrowRight width="14" height="14" style={{ color: "var(--ink-subtle)", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}/>
                    </button>

                    {isOpen && (
                      <div style={{ borderTop: "1px solid var(--line)", padding: "4px 0" }}>
                        {Array.from({ length: mod.lessons }, (_, i) => {
                          const q = quests[i];
                          return (
                            <div key={i} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: i < mod.lessons - 1 ? "1px solid var(--line)" : "none" }}>
                              <span style={{ fontSize: 18 }}>{q?.completed ? "✅" : "⭕"}</span>
                              <span style={{ fontWeight: 700, fontSize: 13, color: "var(--navy-950)", flex: 1 }}>Misi {i + 1}</span>
                              {q?.completed ? (
                                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                  <span style={{ fontSize: 12, fontWeight: 800, color: colFor(q.bestScore), padding: "3px 10px", background: "var(--bg)", borderRadius: 99, border: "1.5px solid var(--line)" }}>
                                    Skor terbaik: {q.bestScore ?? "—"}
                                  </span>
                                  <span style={{ fontSize: 11, color: "var(--ink-subtle)" }}>+{q.xpAwarded} XP</span>
                                </div>
                              ) : (
                                <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>Belum dikerjakan</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== TAB: KUIS ===== */}
          {tab === "kuis" && (
            <div style={{ display: "grid", gap: 12 }}>
              {modules.map(mod => {
                const quiz    = profile.quizzes?.[mod.id];
                const subj    = window.CURRICULUM.subjects[mod.subject];
                const isOpen  = expandedMod === mod.id + "-kuis";
                const questions = window.QUIZ_BANK_V2?.[mod.id] || [];
                const answers   = quiz?.answers || null;

                return (
                  <div key={mod.id} style={{ background: "white", border: "1.5px solid var(--line)", borderRadius: 14, overflow: "hidden", opacity: quiz ? 1 : 0.5 }}>
                    <button onClick={() => quiz && setExpandedMod(isOpen ? null : mod.id + "-kuis")}
                      style={{ width: "100%", padding: "14px 16px", background: "none", border: "none", cursor: quiz ? "pointer" : "default", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                      <span className={`tag ${subj.tagClass}`} style={{ fontSize: 10, flexShrink: 0 }}>{subj.shortName || subj.name}</span>
                      <span style={{ flex: 1, fontWeight: 800, fontSize: 14, color: "var(--navy-950)" }}>{mod.title}</span>
                      {quiz ? (
                        <span style={{ fontSize: 13, fontWeight: 800, color: colFor(quiz.latestPercent), whiteSpace: "nowrap" }}>
                          {quiz.latestScore}/{quiz.latestTotal} &nbsp;({quiz.latestPercent}%)
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>Belum dikerjakan</span>
                      )}
                      {quiz && <Icon.ArrowRight width="14" height="14" style={{ color: "var(--ink-subtle)", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}/>}
                    </button>

                    {isOpen && quiz && (
                      <div style={{ borderTop: "1px solid var(--line)" }}>
                        {!answers && (
                          <div style={{ padding: "12px 16px", fontSize: 12, color: "var(--ink-subtle)", fontStyle: "italic" }}>
                            Jawaban per soal tidak tersedia — kuis ini dikerjakan sebelum fitur pencatatan jawaban diaktifkan.
                          </div>
                        )}
                        {answers && questions.length > 0 && questions.map((q, i) => {
                          const selected = answers[i];
                          const isRight  = selected === q.correct;
                          const unanswered = selected === undefined;
                          return (
                            <div key={i} style={{ padding: "14px 16px", borderBottom: i < questions.length - 1 ? "1px solid var(--line)" : "none", background: unanswered ? "var(--bg)" : isRight ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)" }}>
                              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                <span style={{ fontSize: 16, flexShrink: 0 }}>{unanswered ? "⏭" : isRight ? "✅" : "❌"}</span>
                                <span style={{ fontWeight: 700, fontSize: 13, color: "var(--navy-950)", lineHeight: 1.5 }}>
                                  {i + 1}. {q.question}
                                </span>
                              </div>
                              <div style={{ marginLeft: 26, display: "grid", gap: 4 }}>
                                {unanswered ? (
                                  <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>Tidak dijawab</span>
                                ) : (
                                  <>
                                    <div style={{ fontSize: 12, display: "flex", gap: 6, alignItems: "flex-start" }}>
                                      <span style={{ color: isRight ? "var(--green-600)" : "var(--red-500)", fontWeight: 700, flexShrink: 0 }}>Jawaban siswa:</span>
                                      <span style={{ color: isRight ? "var(--green-600)" : "var(--red-500)" }}>{q.options?.[selected] ?? `Opsi ${selected}`}</span>
                                    </div>
                                    {!isRight && (
                                      <div style={{ fontSize: 12, display: "flex", gap: 6, alignItems: "flex-start" }}>
                                        <span style={{ color: "var(--green-600)", fontWeight: 700, flexShrink: 0 }}>Jawaban benar:</span>
                                        <span style={{ color: "var(--green-600)" }}>{q.options?.[q.correct] ?? `Opsi ${q.correct}`}</span>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {answers && questions.length === 0 && (
                          <div style={{ padding: "12px 16px", fontSize: 12, color: "var(--ink-subtle)" }}>Data soal tidak ditemukan untuk modul ini.</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== TAB: AKTIVITAS ===== */}
          {tab === "aktivitas" && (
            <div style={{ display: "grid", gap: 16 }}>
              {/* XP & streak */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "white", border: "1.5px solid var(--line)", borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-subtle)", letterSpacing: "0.06em", marginBottom: 6 }}>TOTAL XP</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "var(--gold-500)" }}>{(profile.xp || 0).toLocaleString()}</div>
                </div>
                <div style={{ background: "white", border: "1.5px solid var(--line)", borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-subtle)", letterSpacing: "0.06em", marginBottom: 6 }}>STREAK</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "var(--info-500)" }}>{profile.streak || 0} hari</div>
                </div>
              </div>

              {/* Badge */}
              <div style={{ background: "white", border: "1.5px solid var(--line)", borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-subtle)", letterSpacing: "0.06em", marginBottom: 10 }}>BADGE ({profile.badges?.length || 0})</div>
                {(profile.badges?.length || 0) === 0 ? (
                  <span style={{ fontSize: 13, color: "var(--ink-subtle)" }}>Belum ada badge</span>
                ) : (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {profile.badges.map((b, i) => (
                      <span key={i} style={{ fontSize: 12, padding: "4px 10px", background: "var(--bg)", border: "1.5px solid var(--line)", borderRadius: 99 }}>
                        {b.emoji} {b.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Lab */}
              <div style={{ background: "white", border: "1.5px solid var(--line)", borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-subtle)", letterSpacing: "0.06em", marginBottom: 10 }}>LAB MAYA SELESAI ({profile.completedLabs?.length || 0})</div>
                {(profile.completedLabs?.length || 0) === 0 ? (
                  <span style={{ fontSize: 13, color: "var(--ink-subtle)" }}>Belum ada</span>
                ) : (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {profile.completedLabs.map(labId => {
                      const lab = labs.find(l => l.id === labId);
                      return <span key={labId} className="tag tag-info">{lab?.title || labId}</span>;
                    })}
                  </div>
                )}
              </div>

              {/* Gim */}
              <div style={{ background: "white", border: "1.5px solid var(--line)", borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-subtle)", letterSpacing: "0.06em", marginBottom: 10 }}>GIM SELESAI ({profile.completedGames?.length || 0})</div>
                {(profile.completedGames?.length || 0) === 0 ? (
                  <span style={{ fontSize: 13, color: "var(--ink-subtle)" }}>Belum ada</span>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {profile.completedGames.map(gameId => {
                      const game  = games.find(g => g.id === gameId);
                      const score = profile.gameScores?.[gameId];
                      return (
                        <div key={gameId} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className="tag tag-green" style={{ flex: 1 }}>{game?.title || gameId}</span>
                          {score?.bestXp ? <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-500)" }}>{score.bestXp} XP terbaik</span> : null}
                          {score?.attempts ? <span style={{ fontSize: 11, color: "var(--ink-subtle)" }}>{score.attempts}× main</span> : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
    <span style={{ fontSize: 11, color: "var(--ink-subtle)", fontWeight: 600 }}>{label}:</span>
    <span style={{ fontSize: 12, fontWeight: 800, color }}>{value}</span>
  </div>
);

// ---- Panel Import Siswa ----
const emptyRow = () => ({ name: "", nickname: "", level: 7, class: "7A", email: "" });

const ImportPanel = ({ onClose, onDone }) => {
  const [rows, setRows]            = useState([emptyRow()]);
  const [defaultPwd, setDefaultPwd] = useState("Sigma2025!");
  const [importing, setImporting]  = useState(false);
  const [results, setResults]      = useState(null);
  const [importError, setImportError] = useState("");

  const updateRow = (i, field, val) => {
    const next = rows.map((r, idx) => idx !== i ? r : { ...r, [field]: val });
    if (field === "level") next[i].class = `${val}A`;
    setRows(next);
  };
  const addRow    = () => setRows([...rows, emptyRow()]);
  const removeRow = (i) => setRows(rows.length === 1 ? [emptyRow()] : rows.filter((_, idx) => idx !== i));

  const doImport = async () => {
    setImportError("");
    if (!window.SIGMA_SUPABASE?.isConfigured()) {
      setImportError("Supabase belum dikonfigurasi.");
      return;
    }
    if (!defaultPwd.trim()) {
      setImportError("Password default wajib diisi.");
      return;
    }
    if (defaultPwd.trim().length < 6) {
      setImportError("Password minimal 6 karakter.");
      return;
    }
    const valid = rows.filter(r => r.name.trim() && r.email.trim());
    if (!valid.length) {
      setImportError("Isi minimal satu baris dengan nama dan email.");
      return;
    }
    const missingEmail = valid.find(r => !r.email.includes("@"));
    if (missingEmail) {
      setImportError(`Email tidak valid: "${missingEmail.email}"`);
      return;
    }

    setImporting(true);
    setResults(null);
    try {
      const res = await window.SIGMA_SUPABASE.createStudents(valid, defaultPwd);
      setResults(res);
      const ok = res.filter(r => r.success).length;
      if (ok > 0) onDone();
    } catch (err) {
      const msg = err.message || "Import gagal.";
      if (msg.toLowerCase().includes("sesi") || msg.toLowerCase().includes("session") || msg.toLowerCase().includes("unauthorized")) {
        setImportError("Sesi guru sudah habis — silakan logout lalu login ulang, kemudian coba import lagi.");
      } else {
        setImportError(msg);
      }
    } finally {
      setImporting(false);
    }
  };

  const successCount = results?.filter(r => r.success).length || 0;
  const failCount    = results?.filter(r => !r.success).length || 0;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(11,22,51,0.5)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", overflowY: "auto" }}>
      <div style={{ background: "white", borderRadius: 20, width: "min(900px, 100%)", boxShadow: "0 8px 48px rgba(0,0,0,0.22)" }}>

        {/* Header */}
        <div style={{ padding: "22px 28px 18px", borderBottom: "1.5px solid var(--line)", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 20, color: "var(--navy-950)" }}>Import Akun Siswa</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 3 }}>Isi data siswa lalu klik Import. Akun dibuat langsung di Supabase.</div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid var(--line)", background: "var(--bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon.X width="16" height="16"/>
          </button>
        </div>

        <div style={{ padding: "20px 28px", display: "grid", gap: 20 }}>
          {/* Password default */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "var(--bg)", borderRadius: 12, border: "1.5px solid var(--line)" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ink-muted)", whiteSpace: "nowrap" }}>Password default semua siswa:</div>
            <input className="input" style={{ flex: 1, maxWidth: 260 }} value={defaultPwd} onChange={e => setDefaultPwd(e.target.value)} placeholder="Contoh: Sigma2025!"/>
            <div style={{ fontSize: 12, color: "var(--ink-subtle)", lineHeight: 1.4 }}>Bisa di-override per siswa di kolom password (opsional)</div>
          </div>

          {/* Tabel input */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg)" }}>
                  {["No", "Nama Lengkap *", "Panggilan", "Kelas", "Rombel", "Email *", "Password (override)", ""].map((h, i) => (
                    <th key={i} style={{ padding: "8px 10px", fontWeight: 800, color: "var(--ink-muted)", textAlign: "left", whiteSpace: "nowrap", borderBottom: "1.5px solid var(--line)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "6px 10px", color: "var(--ink-subtle)", fontWeight: 700, width: 32 }}>{i + 1}</td>
                    <td style={{ padding: "6px 6px" }}><input className="input" style={{ minWidth: 160 }} value={row.name} onChange={e => updateRow(i, "name", e.target.value)} placeholder="Naya Putri"/></td>
                    <td style={{ padding: "6px 6px" }}><input className="input" style={{ minWidth: 90 }} value={row.nickname} onChange={e => updateRow(i, "nickname", e.target.value)} placeholder="Naya"/></td>
                    <td style={{ padding: "6px 6px" }}>
                      <select className="input" style={{ minWidth: 70 }} value={row.level} onChange={e => updateRow(i, "level", Number(e.target.value))}>
                        <option value={7}>7</option>
                        <option value={8}>8</option>
                        <option value={9}>9</option>
                      </select>
                    </td>
                    <td style={{ padding: "6px 6px" }}><input className="input" style={{ minWidth: 70 }} value={row.class} onChange={e => updateRow(i, "class", e.target.value)} placeholder="7A"/></td>
                    <td style={{ padding: "6px 6px" }}><input className="input" style={{ minWidth: 200 }} type="email" value={row.email} onChange={e => updateRow(i, "email", e.target.value)} placeholder="naya@labschool.sch.id"/></td>
                    <td style={{ padding: "6px 6px" }}><input className="input" style={{ minWidth: 140 }} value={row.password || ""} onChange={e => updateRow(i, "password", e.target.value)} placeholder={defaultPwd}/></td>
                    <td style={{ padding: "6px 6px" }}>
                      <button onClick={() => removeRow(i)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid var(--line)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red-500)" }}>
                        <Icon.X width="13" height="13"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tombol tambah baris + import */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-sm" onClick={addRow}>
              <Icon.Plus width="14" height="14"/> Tambah Baris
            </button>
            <div style={{ flex: 1 }}/>
            <button className="btn btn-primary" onClick={doImport} disabled={importing}
              style={{ minWidth: 160, justifyContent: "center" }}>
              <Icon.Play width="15" height="15"/>
              {importing ? "Membuat akun..." : `Import ${rows.filter(r => r.name && r.email).length} Siswa`}
            </button>
          </div>

          {/* Error global */}
          {importError && (
            <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.3)", borderRadius: 12, fontSize: 13, color: "var(--red-500)", fontWeight: 600, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ flexShrink: 0 }}>⚠️</span>
              <span>{importError}</span>
            </div>
          )}

          {/* Hasil import */}
          {results && (
            <div style={{ border: "1.5px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", background: "var(--bg)", borderBottom: "1px solid var(--line)", display: "flex", gap: 16 }}>
                <span style={{ fontWeight: 800, fontSize: 13 }}>Hasil Import</span>
                <span style={{ color: "var(--green-600)", fontWeight: 700, fontSize: 13 }}>✅ {successCount} berhasil</span>
                {failCount > 0 && <span style={{ color: "var(--red-500)", fontWeight: 700, fontSize: 13 }}>❌ {failCount} gagal</span>}
              </div>
              <div style={{ maxHeight: 240, overflowY: "auto" }}>
                {results.map((r, i) => (
                  <div key={i} style={{ padding: "10px 16px", borderBottom: i < results.length - 1 ? "1px solid var(--line)" : "none", display: "flex", alignItems: "flex-start", gap: 10, background: r.success ? "rgba(34,197,94,0.04)" : "rgba(239,68,68,0.04)" }}>
                    <span style={{ fontSize: 15, flexShrink: 0 }}>{r.success ? "✅" : "❌"}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--navy-950)" }}>{r.name} <span style={{ fontWeight: 400, color: "var(--ink-muted)" }}>— {r.email}</span></div>
                      {!r.success && <div style={{ fontSize: 12, color: "var(--red-500)", marginTop: 2 }}>{r.error}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---- Dashboard utama ----
const TeacherDashboard = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [levelFilter,  setLevelFilter]  = useState("all");
  const [rombelFilter, setRombelFilter] = useState("all");
  const [selected, setSelected]       = useState(null);
  const [showImport, setShowImport]   = useState(false);
  const [resetPwd, setResetPwd]       = useState(null); // { userId, name, newPwd, loading, msg, ok }
  const [deleteModal, setDeleteModal] = useState(null); // { userId, name, loading, msg }

  const refreshProfiles = async () => {
    setLoading(true);
    try {
      const next = await window.SIGMA_AUTH.getTeacherProfiles();
      setProfiles(next || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshProfiles(); }, []);
  // reset rombel filter saat kelas berubah
  useEffect(() => { setRombelFilter("all"); }, [levelFilter]);

  const modules = window.CURRICULUM.modules;

  const moduleComplete = (p, mid) => {
    try { return window.SIGMA_AUTH.isModuleLearningComplete(mid, p); } catch { return false; }
  };
  const quizAvg = (p) => {
    const qs = Object.values(p.quizzes || {});
    if (!qs.length) return null;
    return Math.round(qs.reduce((a, q) => a + (Number(q.latestPercent) || 0), 0) / qs.length);
  };
  const modulesTuntas = (p) => modules.filter(m => m.level === p.level && moduleComplete(p, m.id)).length;
  const modulesForLevel = (lvl) => modules.filter(m => m.level === lvl).length;
  const started = (p, mid) => !!(p.progress?.[mid]?.lessonsDone || p.quizzes?.[mid] || Object.keys(p.quests?.[mid] || {}).length);

  // rombel unik berdasarkan kelas yang dipilih
  const byLevel = levelFilter === "all" ? profiles : profiles.filter(p => String(p.level) === String(levelFilter));
  const rombels = [...new Set(byLevel.map(p => p.class).filter(Boolean))].sort();

  // profil yang ditampilkan
  const shown = byLevel.filter(p => rombelFilter === "all" || p.class === rombelFilter);

  // ringkasan
  const studentCount = shown.length;
  const avgXp   = studentCount ? Math.round(shown.reduce((a, p) => a + (p.xp || 0), 0) / studentCount) : 0;
  const qa      = shown.map(quizAvg).filter(v => v != null);
  const avgQuiz = qa.length ? Math.round(qa.reduce((a, b) => a + b, 0) / qa.length) : null;
  const totalActs = shown.reduce((a, p) => a + (p.completedLabs?.length || 0) + (p.completedGames?.length || 0), 0);

  // rekap per modul
  const levelNum    = levelFilter === "all" ? null : Number(levelFilter);
  const levelModules = levelNum
    ? modules.filter(m => m.level === levelNum)
        .sort((a, b) => a.subject === b.subject ? (a.unit || 0) - (b.unit || 0) : (a.subject < b.subject ? -1 : 1))
    : [];
  const moduleStat = (mod) => {
    const mulai = shown.filter(p => started(p, mod.id)).length;
    const tuntas = shown.filter(p => moduleComplete(p, mod.id)).length;
    const skor   = shown.map(p => p.quizzes?.[mod.id]?.latestPercent).filter(v => v != null);
    const rata   = skor.length ? Math.round(skor.reduce((a, b) => a + b, 0) / skor.length) : null;
    return { mulai, tuntas, rata, sudahKuis: skor.length };
  };

  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      {selected && <StudentDetail profile={selected} onClose={() => setSelected(null)}/>}

      {/* Modal ganti password */}
      {resetPwd && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(11,22,51,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "white", borderRadius: 16, width: "min(400px,100%)", padding: 28, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ fontWeight: 900, fontSize: 17, color: "var(--navy-950)", marginBottom: 4 }}>Ganti Password</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 18 }}>{resetPwd.name}</div>
            <input
              className="input"
              type="password"
              placeholder="Password baru (min. 6 karakter)"
              value={resetPwd.newPwd}
              onChange={e => setResetPwd({ ...resetPwd, newPwd: e.target.value, msg: "", ok: false })}
              style={{ width: "100%", marginBottom: 10 }}
              autoFocus
            />
            {resetPwd.msg && (
              <div style={{ fontSize: 12, fontWeight: 600, color: resetPwd.ok ? "var(--green-600)" : "var(--red-500)", marginBottom: 10, padding: "7px 10px", background: resetPwd.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", borderRadius: 8 }}>
                {resetPwd.ok ? "✅" : "⚠️"} {resetPwd.msg}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-sm" onClick={() => setResetPwd(null)} disabled={resetPwd.loading}>Batal</button>
              <button className="btn btn-primary btn-sm" disabled={resetPwd.loading}
                onClick={async () => {
                  if (!resetPwd.newPwd || resetPwd.newPwd.length < 6) {
                    setResetPwd({ ...resetPwd, msg: "Password minimal 6 karakter.", ok: false });
                    return;
                  }
                  setResetPwd({ ...resetPwd, loading: true, msg: "", ok: false });
                  try {
                    await window.SIGMA_SUPABASE.resetStudentPassword(resetPwd.userId, resetPwd.newPwd);
                    setResetPwd({ ...resetPwd, loading: false, msg: "Password berhasil diubah.", ok: true, newPwd: "" });
                  } catch (err) {
                    setResetPwd({ ...resetPwd, loading: false, msg: err.message || "Gagal mengubah password.", ok: false });
                  }
                }}>
                {resetPwd.loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal hapus siswa */}
      {deleteModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(11,22,51,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "white", borderRadius: 16, width: "min(400px,100%)", padding: 28, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ fontWeight: 900, fontSize: 17, color: "var(--navy-950)", marginBottom: 6 }}>Hapus Akun Siswa?</div>
            <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: 18 }}>
              Akun <strong>{deleteModal.name}</strong> akan dihapus permanen dari Supabase. Seluruh data progress, refleksi, dan kuis siswa ini akan hilang. Tindakan ini <strong>tidak bisa dibatalkan</strong>.
            </p>
            {deleteModal.msg && (
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--red-500)", marginBottom: 12, padding: "8px 10px", background: "rgba(239,68,68,0.08)", borderRadius: 8 }}>
                ⚠️ {deleteModal.msg}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-sm" onClick={() => setDeleteModal(null)} disabled={deleteModal.loading}>Batal</button>
              <button className="btn btn-sm" disabled={deleteModal.loading}
                style={{ background: "var(--red-500)", color: "white", border: "none" }}
                onClick={async () => {
                  setDeleteModal({ ...deleteModal, loading: true, msg: "" });
                  try {
                    await window.SIGMA_SUPABASE.deleteStudent(deleteModal.userId);
                    setDeleteModal(null);
                    refreshProfiles();
                  } catch (err) {
                    setDeleteModal({ ...deleteModal, loading: false, msg: err.message || "Gagal menghapus." });
                  }
                }}>
                {deleteModal.loading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <ImportPanel
          onClose={() => setShowImport(false)}
          onDone={() => { setShowImport(false); refreshProfiles(); }}
        />
      )}

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px 60px" }}>
        <Breadcrumb trail={[{ to: "/", label: "Beranda" }, { label: "Dashboard Guru" }]}/>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, margin: "16px 0 24px" }}>
          <div>
            <div className="tag tag-gold" style={{ marginBottom: 10 }}>MODE GURU</div>
            <h1 className="display" style={{ fontSize: 48, margin: 0, color: "var(--navy-950)" }}>Dashboard Guru</h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowImport(true)}>
              <Icon.Plus width="14" height="14"/> Tambah Siswa
            </button>
            <button className="btn btn-sm" onClick={refreshProfiles}>
              <Icon.Refresh width="14" height="14"/> {loading ? "Memuat..." : "Muat ulang"}
            </button>
          </div>
        </div>

        {/* Filter kelas */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: rombels.length > 0 ? 10 : 20 }}>
          {[{ id: "all", label: "Semua Kelas" }, { id: "7", label: "Kelas 7" }, { id: "8", label: "Kelas 8" }, { id: "9", label: "Kelas 9" }].map(f => (
            <button key={f.id} onClick={() => setLevelFilter(f.id)} className="btn btn-sm"
              style={{ background: levelFilter === f.id ? "var(--navy-900)" : "white", color: levelFilter === f.id ? "white" : "var(--ink)" }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Filter rombel — muncul hanya jika kelas dipilih dan ada > 1 rombel */}
        {rombels.length > 1 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20, paddingLeft: 4 }}>
            <button onClick={() => setRombelFilter("all")} className="btn btn-sm"
              style={{ background: rombelFilter === "all" ? "var(--gold-400)" : "var(--bg)", color: "var(--ink)", border: "1.5px solid var(--gold-400)", fontSize: 12 }}>
              Semua Rombel
            </button>
            {rombels.map(r => (
              <button key={r} onClick={() => setRombelFilter(r)} className="btn btn-sm"
                style={{ background: rombelFilter === r ? "var(--gold-400)" : "var(--bg)", color: "var(--ink)", border: "1.5px solid var(--line)", fontSize: 12 }}>
                {r}
              </button>
            ))}
          </div>
        )}

        {studentCount === 0 ? (
          <EmptyState icon="Users" title="Belum ada data siswa"
            subtitle={loading ? "Sedang memuat data dari Supabase..." : "Belum ada akun siswa yang terdaftar, atau coba filter kelas/rombel lain."}/>
        ) : (
          <>
            {/* Ringkasan */}
            <div className="responsive-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              <SummaryCard icon="Users"  label="Jumlah Siswa"    value={studentCount}                                    color="var(--info-500)"/>
              <SummaryCard icon="Bolt"   label="Rata-rata XP"    value={avgXp.toLocaleString()}                           color="var(--gold-500)"/>
              <SummaryCard icon="Chart"  label="Rata-rata Kuis"  value={avgQuiz == null ? "—" : `${avgQuiz}%`}            color={colFor(avgQuiz)}/>
              <SummaryCard icon="Beaker" label="Lab + Gim Selesai" value={totalActs}                                      color="var(--ai-500)"/>
            </div>

            {/* Tabel siswa */}
            <div className="card" style={{ padding: 0, background: "white", marginBottom: 28, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1.5px solid var(--line)", fontWeight: 900, fontSize: 16 }}>
                Daftar Siswa ({studentCount})
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", marginLeft: 10 }}>Klik nama untuk detail</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 720 }}>
                  <thead>
                    <tr style={{ background: "var(--bg)", textAlign: "left" }}>
                      {["Nama", "Kelas", "XP", "Modul Tuntas", "Rata-rata Kuis", "Lab", "Gim", "Badge", ""].map((h, i) => (
                        <th key={i} style={{ padding: "10px 14px", fontWeight: 800, color: "var(--ink-muted)", whiteSpace: "nowrap", textAlign: i >= 2 ? "center" : "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shown.slice().sort((a, b) => (b.xp || 0) - (a.xp || 0)).map(p => {
                      const qv     = quizAvg(p);
                      const tuntas = modulesTuntas(p);
                      const total  = modulesForLevel(p.level) || 6;
                      return (
                        <tr key={p.id} style={{ borderTop: "1px solid var(--line)" }}
                          onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
                          onMouseLeave={e => e.currentTarget.style.background = "white"}>
                          <td style={{ padding: "10px 14px", fontWeight: 800, color: "var(--info-500)", textDecoration: "underline", textDecorationStyle: "dotted", cursor: "pointer" }}
                            onClick={() => setSelected(p)}>{p.name}</td>
                          <td style={{ padding: "10px 14px", color: "var(--ink-muted)" }}>{p.class || p.level}</td>
                          <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700 }}>{(p.xp || 0).toLocaleString()}</td>
                          <td style={{ padding: "10px 14px", textAlign: "center" }}>{tuntas}/{total}</td>
                          <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 800, color: colFor(qv) }}>{qv == null ? "—" : `${qv}%`}</td>
                          <td style={{ padding: "10px 14px", textAlign: "center" }}>{p.completedLabs?.length || 0}</td>
                          <td style={{ padding: "10px 14px", textAlign: "center" }}>{p.completedGames?.length || 0}</td>
                          <td style={{ padding: "10px 14px", textAlign: "center" }}>{p.badges?.length || 0}</td>
                          <td style={{ padding: "10px 10px", textAlign: "center" }}>
                            {p.user_id && (
                              <div style={{ display: "inline-flex", gap: 4 }}>
                                <button title="Ganti password" onClick={() => setResetPwd({ userId: p.user_id, name: p.name, newPwd: "", loading: false, msg: "", ok: false })}
                                  style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid var(--line)", background: "white", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ink-muted)" }}>
                                  🔑
                                </button>
                                <button title="Hapus akun siswa" onClick={() => setDeleteModal({ userId: p.user_id, name: p.name, loading: false, msg: "" })}
                                  style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid rgba(239,68,68,0.3)", background: "white", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--red-500)" }}>
                                  🗑️
                                </button>
                              </div>
                            )}
                          </td>
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
                  Rekap per Modul — Kelas {levelNum}{rombelFilter !== "all" ? ` · ${rombelFilter}` : ""}
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
                        const s    = moduleStat(mod);
                        const subj = window.CURRICULUM.subjects[mod.subject];
                        return (
                          <tr key={mod.id} style={{ borderTop: "1px solid var(--line)" }}>
                            <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--navy-950)" }}>{mod.title}</td>
                            <td style={{ padding: "10px 14px" }}><span className={`tag ${subj.tagClass}`}>{subj.shortName || subj.name}</span></td>
                            <td style={{ padding: "10px 14px", textAlign: "center" }}>{s.mulai}/{studentCount}</td>
                            <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: s.tuntas > 0 ? "var(--green-500)" : "var(--ink-subtle)" }}>{s.tuntas}/{studentCount}</td>
                            <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 800, color: colFor(s.rata) }}>
                              {s.rata == null ? "—" : `${s.rata}%`}
                              <span style={{ color: "var(--ink-subtle)", fontWeight: 600, fontSize: 11 }}> ({s.sudahKuis})</span>
                            </td>
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
