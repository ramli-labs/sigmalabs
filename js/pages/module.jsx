// ============================================
// Module Detail — lessons + quiz + AI tutor
// ============================================

// --- shared globals ---
const { Icon, Navbar, Footer, Link, useRoute, navigate, SectionHeader, Breadcrumb, EmptyState, ModuleCard, LabschoolLogo, BrandStrip, ControlField } = window;
const { useState, useEffect, useRef } = React;

const ModuleDetail = ({ moduleId }) => {
  const mod = window.CURRICULUM.modules.find(m => m.id === moduleId);
  // Open the tab that matches saved progress: Materi → Misi → Kuis
  const [tab, setTab] = useState(() => {
    try {
      const s = window.SIGMA_AUTH.getLearningStepStatus(moduleId);
      if (!s.materiDone) return "materi";
      if (!s.misiDone) return "quest";
      if (!s.kuisDone) return "kuis";
      return "materi";
    } catch (e) { return "materi"; }
  });
  const [, setUserVersion] = useState(0);

  useEffect(() => {
    const onUserChange = () => setUserVersion(v => v + 1);
    window.addEventListener("sigma:userchange", onUserChange);
    return () => window.removeEventListener("sigma:userchange", onUserChange);
  }, []);

  if (!mod) {
    return (
      <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <Navbar/>
        <EmptyState icon="Search" title="Modul tidak ditemukan" subtitle={`ID: ${moduleId}`}
          action={<Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>Kembali ke Beranda</Link>}/>
      </div>
    );
  }

  if (mod.level !== window.USER.level) {
    return (
      <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <Navbar/>
        <EmptyState
          icon="Lock"
          title={`Modul kelas ${mod.level} terkunci`}
          subtitle={`Profil aktif adalah ${window.USER.nickname} kelas ${window.USER.class}. Siswa hanya bisa membuka modul sesuai kelasnya.`}
          action={<Link to={`/kelas/${window.USER.level}`} className="btn btn-primary" style={{ marginTop: 20 }}>Buka Modul Kelas {window.USER.level}</Link>}
        />
      </div>
    );
  }

  const sequenceStatus = window.SIGMA_AUTH.getModuleSequenceStatus(mod.id);
  if (!sequenceStatus.unlocked) {
    return (
      <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <Navbar/>
        <EmptyState
          icon="Lock"
          title="Modul ini belum terbuka"
          subtitle={`Selesaikan dulu ${sequenceStatus.previous?.title || "modul sebelumnya"} dengan urutan Materi, Misi, lalu Kuis.`}
          action={<Link to={`/modul/${sequenceStatus.previous?.id}`} className="btn btn-primary" style={{ marginTop: 20 }}>Buka Modul Sebelumnya</Link>}
        />
      </div>
    );
  }

  const subj = window.CURRICULUM.subjects[mod.subject];
  const progress = window.USER.progress[mod.id] || { percent: 0, lessonsDone: 0, total: mod.lessons };
  const stepStatus = window.SIGMA_AUTH.getLearningStepStatus(mod.id);

  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>

      {/* Header */}
      <section className="module-header-shell" style={{ padding: "24px 32px 20px", maxWidth: 1280, margin: "0 auto" }}>
        <Breadcrumb trail={[
          { to: "/", label: "Beranda" },
          { to: `/kelas/${mod.level}`, label: `Kelas ${mod.level}` },
          { label: mod.title },
        ]}/>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginTop: 12 }}>
          <div style={{ flex: "1 1 500px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span className={`tag ${subj.tagClass}`}>{subj.name} • Kelas {mod.level}</span>
              <span className="tag" style={{ background: "var(--line)", color: "var(--ink-muted)" }}>Unit {mod.unit}</span>
            </div>
            <h1 className="display" style={{ fontSize: 48, margin: 0, color: "var(--navy-950)", lineHeight: 1 }}>
              {mod.title.split(":").length > 1 ? (
                <>
                  {mod.title.split(":")[0]}:<br/>
                  <span style={{ color: subj.color, fontStyle: "italic" }}>{mod.title.split(":").slice(1).join(":").trim()}</span>
                </>
              ) : (
                mod.title
              )}
            </h1>
            <p style={{ fontSize: 16, color: "var(--ink-muted)", marginTop: 14, maxWidth: 640, lineHeight: 1.55 }}>
              {mod.description}
            </p>
          </div>
        </div>

        {/* Progress strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 24, padding: "16px 22px", background: "white", border: "1.5px solid var(--line)", borderRadius: 14, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Progres: {progress.lessonsDone}/{progress.total} pelajaran</div>
            <div style={{ flex: 1, maxWidth: 280, height: 8, background: "var(--line)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ width: `${progress.percent}%`, height: "100%", background: subj.color }}/>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "var(--navy-950)" }}>
            <Icon.Trophy width="16" height="16" style={{ color: "var(--ai-500)" }}/> XP Kamu: {window.USER.xp.toLocaleString()}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--ink-muted)" }}>
            <Icon.Clock width="16" height="16"/> {mod.duration}
          </div>
        </div>

        <div className="module-learning-flow" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10, marginTop: 14 }}>
          {[
            { n: "1", t: "Materi", d: "Baca penguat modul cetak", done: stepStatus.materiDone, active: tab === "materi" },
            { n: "2", t: "Refleksi", d: "Tulis refleksi singkat", done: stepStatus.materiDone, active: tab === "materi" },
            { n: "3", t: "Misi", d: "Latihan setelah materi", done: stepStatus.misiDone, active: tab === "quest", locked: !stepStatus.misiUnlocked },
            { n: "4", t: "Kuis", d: "Cek akhir modul", done: stepStatus.kuisDone, active: tab === "kuis", locked: !stepStatus.kuisUnlocked },
          ].map(item => (
            <div key={item.n} style={{
              padding: 12,
              borderRadius: 14,
              background: item.active ? "white" : "rgba(255,255,255,0.62)",
              border: item.active ? `2px solid ${subj.color}` : "1.5px solid var(--line)",
              opacity: item.locked ? 0.58 : 1,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: item.done ? "var(--green-500)" : item.locked ? "var(--line)" : subj.color, color: item.locked ? "var(--ink-muted)" : "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11 }}>
                  {item.done ? <Icon.Check width="13" height="13"/> : item.n}
                </div>
                <div style={{ fontSize: 13, fontWeight: 900 }}>{item.t}</div>
              </div>
              <div style={{ color: "var(--ink-muted)", fontSize: 11, lineHeight: 1.4, marginTop: 6 }}>{item.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <section className="module-tabs-shell" style={{ padding: "0 32px", maxWidth: 1280, margin: "0 auto" }}>
        <div className="module-tabs-scroll" style={{ display: "flex", gap: 4, borderBottom: "2px solid var(--line)", marginTop: 24 }}>
          {[
            { id: "materi", label: "📚 Materi", unlocked: true },
            { id: "quest", label: "🧭 Misi", unlocked: stepStatus.misiUnlocked },
            { id: "kuis", label: "✏️ Kuis", unlocked: stepStatus.kuisUnlocked },
            { id: "tutor", label: "🤖 AI Tutor" },
          ].map(t => (
            <button key={t.id} disabled={t.unlocked === false} onClick={() => t.unlocked === false ? null : setTab(t.id)} style={{
              padding: "12px 20px",
              fontSize: 14, fontWeight: 700,
              color: t.unlocked === false ? "var(--ink-subtle)" : tab === t.id ? subj.color : "var(--ink-muted)",
              borderBottom: tab === t.id ? `3px solid ${subj.color}` : "3px solid transparent",
              marginBottom: -2,
              opacity: t.unlocked === false ? 0.55 : 1,
              cursor: t.unlocked === false ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}>{t.label}{t.unlocked === false ? " 🔒" : ""}</button>
          ))}
        </div>
      </section>

      {/* Tab content */}
      <section className="module-content-shell" style={{ padding: "28px 32px 60px", maxWidth: 1280, margin: "0 auto" }}>
        {tab === "materi" && <MateriTab mod={mod} subject={subj} onSwitchTab={setTab}/>}
        {tab === "quest" && <QuestTab mod={mod} subject={subj} onSwitchTab={setTab}/>}
        {tab === "kuis" && <KuisTab mod={mod} subject={subj}/>}
        {tab === "tutor" && <TutorTab mod={mod} subject={subj}/>}
      </section>

      <Footer/>
    </div>
  );
};

// ---------- Tab: Materi ----------
const MateriTab = ({ mod, subject, onSwitchTab }) => {
  const progress = window.USER.progress[mod.id] || { percent: 0, lessonsDone: 0, total: mod.lessons };
  const isComplete = progress.lessonsDone >= mod.lessons;
  const startIndex = Math.min(progress.lessonsDone || 0, mod.lessons - 1);
  const [lessonIndex, setLessonIndex] = useState(startIndex);
  const lesson = getLessonContent(mod, lessonIndex);
  const savedReflection = window.USER.reflections?.[mod.id]?.[lessonIndex]?.text || "";
  const [reflection, setReflection] = useState(savedReflection);
  const [saved, setSaved] = useState(false);
  const mastery = getLessonMasteryNotes(mod, lessonIndex, lesson);

  useEffect(() => {
    setReflection(window.USER.reflections?.[mod.id]?.[lessonIndex]?.text || "");
    setSaved(false);
  }, [mod.id, lessonIndex]);

  const completeNext = () => {
    const wasLast = lessonIndex >= mod.lessons - 1;
    window.SIGMA_AUTH.completeLesson(mod.id, lessonIndex);
    if (wasLast) {
      // All lessons done → Misi unlocks; take the student straight there
      if (onSwitchTab) onSwitchTab("quest");
    } else {
      setLessonIndex(i => Math.min(mod.lessons - 1, i + 1));
    }
  };
  const prevLesson = () => setLessonIndex(i => Math.max(0, i - 1));
  const nextLesson = () => setLessonIndex(i => Math.min(mod.lessons - 1, i + 1));
  const saveReflection = () => {
    window.SIGMA_AUTH.saveReflection(mod.id, lessonIndex, reflection);
    setSaved(true);
  };

  return (
  <div className="module-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32 }}>
    <div>
      <div className="card" style={{ padding: 36, background: "white" }}>
        <div style={{ padding: "14px 18px", background: subject.colorLight, border: `2px solid ${subject.color}`, borderRadius: 12, marginBottom: 22, fontSize: 14, fontWeight: 700, lineHeight: 1.5, color: "var(--navy-950)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 900, color: subject.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            <Icon.Book width="14" height="14"/> Penguat Modul Cetak
          </div>
          Gunakan halaman ini setelah membaca bagian terkait di modul cetak. SIGMA berisi ringkasan, contoh, latihan, dan refleksi untuk memperkuat materi yang sudah diterima siswa.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, fontWeight: 800, color: "var(--ink-subtle)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
          <Icon.Book width="14" height="14"/> Pelajaran {lessonIndex + 1} dari {mod.lessons}
        </div>
        <h2 className="display" style={{ fontSize: 32, margin: "0 0 20px", color: "var(--navy-950)" }}>
          {lesson.title}
        </h2>
        <p style={{ fontSize: 16, color: "var(--ink)", lineHeight: 1.7 }}>
          {lesson.intro}
        </p>

        <div style={{ padding: "18px 20px", background: "var(--bg-cream)", border: "2px solid var(--ink)", borderRadius: 14, margin: "24px 0", boxShadow: "var(--shadow-chunk-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 900, color: "var(--navy-950)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            <Icon.Book width="14" height="14"/> Baca Modul Cetak
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.65, color: "var(--ink)" }}>
            {lesson.printGuide}
          </div>
        </div>

        <div style={{ padding: "20px 24px", background: "white", borderRadius: 14, border: `2px solid ${subject.color}`, margin: "24px 0" }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: subject.color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Pertanyaan Pemantik</div>
          <div className="display" style={{ fontSize: 24, lineHeight: 1.25, color: "var(--navy-950)" }}>
            {lesson.prompt}
          </div>
        </div>

        <div style={{ display: "grid", gap: 14, margin: "24px 0" }}>
          {lesson.blocks.map((block, i) => (
            <div key={i} style={{ padding: "18px 20px", background: i === 1 ? subject.colorLight : "var(--bg)", borderRadius: 14, border: "1.5px solid var(--line)" }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: i === 1 ? subject.color : "var(--ink-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{block.label}</div>
              <div style={{ fontSize: 15, color: "var(--navy-950)", lineHeight: 1.65 }}>{block.text}</div>
            </div>
          ))}
        </div>

        <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14, margin: "24px 0" }}>
          <div style={{ padding: 20, background: "#F0FDF4", border: "1.5px solid #A7F3D0", borderRadius: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 900, color: "var(--green-500)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
              <Icon.Check width="14" height="14"/> Inti yang Harus Dikuasai
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {mastery.core.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, lineHeight: 1.55, color: "var(--navy-950)", fontWeight: 700 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 7, background: "var(--green-500)", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0 }}>{i + 1}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: 20, background: "#FFF7ED", border: "1.5px solid #FDBA74", borderRadius: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 900, color: "var(--orange-500)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
              <Icon.X width="14" height="14"/> Kesalahan Umum
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {mastery.misconceptions.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, lineHeight: 1.55, color: "var(--navy-950)", fontWeight: 700 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 7, background: "var(--orange-500)", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0 }}>!</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 24px", background: subject.colorLight, borderRadius: 14, borderLeft: `4px solid ${subject.color}`, margin: "24px 0" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: subject.color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Aktivitas Cepat</div>
          <div style={{ fontSize: 15, color: "var(--navy-950)", lineHeight: 1.55 }}>
            {lesson.activity}
          </div>
        </div>

        <h3 className="display" style={{ fontSize: 22, marginTop: 32, marginBottom: 14, color: "var(--navy-950)" }}>Cek Pemahaman</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {lesson.checks.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--line)" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: subject.color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>{i + 1}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: 22, background: "white", border: "1.5px solid var(--line)", borderRadius: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
            <div>
              <h3 className="display" style={{ fontSize: 22, margin: 0, color: "var(--navy-950)" }}>Jurnal Refleksi</h3>
              <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 4 }}>Tulis catatan singkat setelah membaca modul cetak dan pengayaan ini.</div>
            </div>
            {saved && <span className="tag tag-green"><Icon.Check width="12" height="12"/> Tersimpan</span>}
          </div>
          <textarea
            className="input"
            rows="5"
            value={reflection}
            onChange={e => { setReflection(e.target.value); setSaved(false); }}
            placeholder="Saya paham bahwa... Saya masih bingung tentang... Contoh di sekitar saya adalah..."
            style={{ resize: "vertical", lineHeight: 1.6 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, color: "var(--ink-subtle)", fontWeight: 700 }}>{reflection.trim().length} karakter</div>
            <button className="btn btn-primary" onClick={saveReflection} disabled={!reflection.trim()}>
              <Icon.Check width="14" height="14"/> Simpan Refleksi
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <button className="btn" onClick={prevLesson} disabled={lessonIndex === 0}><Icon.ArrowLeft width="14" height="14"/> Sebelumnya</button>
          <button className="btn" onClick={nextLesson} disabled={lessonIndex === mod.lessons - 1}>
            Berikutnya <Icon.ArrowRight width="14" height="14"/>
          </button>
          <button className={`btn ${isComplete ? "btn-success" : subject.btnClass}`} style={{ marginLeft: "auto" }} onClick={completeNext} disabled={isComplete}>
            {isComplete ? <><Icon.Check width="14" height="14"/> Modul Tuntas</> : <>Tandai Pelajaran Selesai <Icon.ArrowRight width="14" height="14"/></>}
          </button>
        </div>
      </div>
    </div>

    {/* Sidebar: outline */}
    <div>
      <div className="card-soft" style={{ padding: 20, background: "white", position: "sticky", top: 100 }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Daftar Pelajaran</div>
        {Array(mod.lessons).fill(0).map((_, i) => {
          const done = i < (progress.lessonsDone || 0);
          const current = i === (progress.lessonsDone || 0);
          const label = mod.topics[i] || `Pengayaan ${i + 1}`;
          return (
            <button key={i} onClick={() => setLessonIndex(i)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 10, marginBottom: 4,
              background: lessonIndex === i ? subject.colorLight : current ? "white" : "transparent",
              border: lessonIndex === i ? `1.5px solid ${subject.color}` : current ? "1.5px solid var(--line)" : "1.5px solid transparent",
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: done ? subject.color : "white",
                border: done ? "none" : "2px solid var(--line-strong)",
                color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800,
              }}>
                {done ? <Icon.Check width="12" height="12"/> : i + 1}
              </div>
              <div style={{ fontSize: 13, fontWeight: current ? 700 : 500, color: current ? "var(--navy-950)" : "var(--ink-muted)", lineHeight: 1.35 }}>
                {label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  </div>
  );
};

// ---------- Tab: Misi ----------
const QuestTab = ({ mod, subject, onSwitchTab }) => {
  // Per-topic reflection draft persistence (unique key per user + module + lesson)
  const draftKey = i => `sigma-mission-${window.USER?.id || "anon"}-${mod.id}-${i}`;
  const readDraft = i => { try { return localStorage.getItem(draftKey(i)) || ""; } catch (e) { return ""; } };
  const writeDraft = (i, text) => { try { localStorage.setItem(draftKey(i), text); } catch (e) {} };
  const isQuestCompleted = i => !!window.USER.quests?.[mod.id]?.[i]?.completed;
  const getFirstOpenMissionIndex = () => {
    const firstOpen = Array(mod.lessons).fill(0).findIndex((_, i) => !isQuestCompleted(i));
    return firstOpen === -1 ? Math.max(0, mod.lessons - 1) : firstOpen;
  };

  const startIndex = getFirstOpenMissionIndex();
  const [lessonIndex, setLessonIndex] = useState(startIndex);
  const [activityScores, setActivityScores] = useState({});
  const [reflection, setReflection] = useState(() => readDraft(startIndex));
  const [claimed, setClaimed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const mission = buildUnderstandingMission(mod, lessonIndex);
  const completed = !!window.USER.quests?.[mod.id]?.[lessonIndex]?.completed;
  const isDone = completed || claimed;

  // Live score calculation
  const actCount = mission.activities.length;
  const actSum = mission.activities.reduce((sum, _, i) => {
    return sum + (activityScores[`${lessonIndex}-act-${i}`] || 0);
  }, 0);
  const actScore = actCount > 0 ? Math.min(75, Math.round((actSum / (actCount * 100)) * 75)) : 75;
  const reflectionCheck = analyzeReflectionQuality(reflection, mission);
  const exitTicketMin = reflectionCheck.minLength;
  const reflScore = reflectionCheck.valid ? 25 : 0;
  const liveScore = actScore + reflScore;
  // For already-completed topics, show the stored best score (per topic)
  const storedBest = window.USER.quests?.[mod.id]?.[lessonIndex]?.bestScore || 0;
  const totalScore = isDone ? Math.max(liveScore, storedBest) : liveScore;
  const passed = totalScore >= mission.passScore;
  const reflValid = reflectionCheck.valid;
  const scoreColor = totalScore >= 70 ? "var(--green-500)" : totalScore >= 50 ? "var(--orange-500)" : "var(--ink-subtle)";
  const scoreBar  = totalScore >= 70 ? "var(--green-500)" : totalScore >= 50 ? "var(--orange-500)" : "var(--info-500)";

  const recordScore = (key, sc) => {
    setActivityScores(prev => ({ ...prev, [key]: Math.max(prev[key] || 0, sc) }));
    setShowHint(false);
  };

  // Check current persisted state, plus the just-claimed lesson before React re-renders.
  const allMissionsDone = Array(mod.lessons).fill(0).every((_, i) =>
    (claimed && i === lessonIndex) || isQuestCompleted(i)
  );
  const isLastLesson = lessonIndex === mod.lessons - 1;

  const handleClaim = () => {
    if (!reflValid || isDone) return;
    if (passed) {
      window.SIGMA_AUTH.completeQuest(mod.id, lessonIndex, totalScore);
      setClaimed(true);
      setShowHint(false);
      // Auto-advance to next lesson (unless this is the last)
      if (!isLastLesson) {
        setTimeout(() => switchLesson(lessonIndex + 1), 700);
      }
    } else {
      setShowHint(true);
    }
  };

  const switchLesson = i => {
    setLessonIndex(i);
    setActivityScores({});
    setClaimed(false);
    setShowHint(false);
    setReflection(readDraft(i)); // load this topic's saved draft
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28 }} className="module-detail-grid">
      <div>
        {/* Header */}
        <div className="card" style={{ padding: 28, background: "white", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span className="tag" style={{ background: subject.colorLight, color: subject.color, fontWeight: 900, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Cek Pemahaman</span>
            {isDone && <span className="tag tag-green"><Icon.Check width="12" height="12"/> Tuntas</span>}
          </div>
          <h2 className="display" style={{ fontSize: 28, margin: "0 0 10px", color: "var(--navy-950)", lineHeight: 1.2 }}>{mission.title}</h2>
          <p style={{ fontSize: 15, color: "var(--ink-muted)", lineHeight: 1.65, margin: 0 }}>
            Misi ini adalah cek pemahaman singkat. Bacalah materi terlebih dahulu, lalu selesaikan tantangan untuk memastikan kamu siap mengikuti kuis.
          </p>
          {showHint && (
            <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "var(--bg-cream)", border: "1.5px solid var(--gold-400)", fontSize: 13, fontWeight: 700, color: "var(--orange-500)" }}>
              Skor kamu {totalScore}/100 — belum mencapai {mission.passScore}. Baca kembali ringkasan materi dan perbaiki jawabanmu.
            </div>
          )}
        </div>

        {/* Card 1: Ringkasan Materi */}
        <div className="card" style={{ padding: 24, background: "white", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: subject.colorLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon.Book width="15" height="15" style={{ color: subject.color }}/>
            </div>
            <span style={{ fontSize: 12, fontWeight: 900, color: "var(--navy-950)", textTransform: "uppercase", letterSpacing: "0.09em" }}>Ringkasan Materi</span>
          </div>
          <div style={{ display: "grid", gap: 9 }}>
            {mission.summaryPoints.map((pt, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "11px 14px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--line)" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: subject.color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 14, color: "var(--navy-950)", lineHeight: 1.6 }}>{pt}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Latihan Pemahaman */}
        <div className="card" style={{ padding: 24, background: "white", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--gold-300)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon.Puzzle width="15" height="15" style={{ color: "var(--navy-950)" }}/>
            </div>
            <span style={{ fontSize: 12, fontWeight: 900, color: "var(--navy-950)", textTransform: "uppercase", letterSpacing: "0.09em" }}>Latihan Pemahaman</span>
          </div>
          {mission.activities.length > 0 ? (
            <div className="quest-activity-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
              {mission.activities.map((a, i) => {
                const aKey = `${lessonIndex}-act-${i}`;
                return <InteractiveQuestCard key={aKey} activity={a} onComplete={sc => recordScore(aKey, sc)} done={isDone}/>;
              })}
            </div>
          ) : (
            <div style={{ padding: 16, background: "var(--bg)", borderRadius: 12, color: "var(--ink-muted)", fontSize: 14 }}>
              Selesaikan refleksi singkat di bawah untuk melanjutkan.
            </div>
          )}
        </div>

        {/* Card 3: Refleksi Singkat */}
        <div className="card" style={{ padding: 24, background: "white", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon.Sparkles width="15" height="15" style={{ color: "var(--green-500)" }}/>
            </div>
            <span style={{ fontSize: 12, fontWeight: 900, color: "var(--navy-950)", textTransform: "uppercase", letterSpacing: "0.09em" }}>Refleksi Singkat</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 12, lineHeight: 1.55 }}>
            {mission.reflectionPrompt}
          </p>
          <textarea
            className="input"
            rows="3"
            value={reflection}
            onChange={e => { setReflection(e.target.value); writeDraft(lessonIndex, e.target.value); setShowHint(false); }}
            disabled={isDone}
            placeholder="Hal paling penting dari pelajaran ini adalah..."
            style={{ resize: "vertical", lineHeight: 1.6 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: reflValid ? "var(--green-500)" : "var(--ink-subtle)" }}>
              {reflection.trim().length} / minimal {exitTicketMin} karakter {reflValid ? "✓" : ""}
            </div>
            {!reflValid && reflection.trim().length > 0 && (
              <div style={{ fontSize: 12, color: "var(--orange-500)", fontWeight: 700 }}>
                Tambahkan {reflectionCheck.missing.join(", ")} agar refleksimu lebih bermakna.
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Skor Misi */}
        <div className="card" style={{ padding: 24, background: isDone || (passed && reflValid) ? "#F0FDF4" : "white", border: `1.5px solid ${isDone || (passed && reflValid) ? "var(--green-500)" : "var(--line)"}`, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: passed ? "#D1FAE5" : "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon.Chart width="15" height="15" style={{ color: passed ? "var(--green-500)" : "var(--ink-muted)" }}/>
            </div>
            <span style={{ fontSize: 12, fontWeight: 900, color: "var(--navy-950)", textTransform: "uppercase", letterSpacing: "0.09em" }}>Skor Misi</span>
            <span style={{ marginLeft: "auto", fontSize: 24, fontWeight: 900, color: scoreColor }}>{totalScore}<span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-muted)" }}>/100</span></span>
          </div>
          <div style={{ height: 10, background: "var(--line)", borderRadius: 999, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ width: `${totalScore}%`, height: "100%", background: scoreBar, transition: "width 0.4s" }}/>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            <div style={{ padding: "5px 12px", borderRadius: 8, background: "var(--bg)", border: "1px solid var(--line)", fontSize: 12, fontWeight: 700, color: "var(--ink-muted)" }}>
              Latihan: {actScore}/75
            </div>
            <div style={{ padding: "5px 12px", borderRadius: 8, background: reflValid ? "#D1FAE5" : "var(--bg)", border: `1px solid ${reflValid ? "var(--green-500)" : "var(--line)"}`, fontSize: 12, fontWeight: 700, color: reflValid ? "var(--green-500)" : "var(--ink-muted)" }}>
              Refleksi: {reflScore}/25
            </div>
          </div>
          <div style={{ padding: "12px 16px", borderRadius: 12, background: isDone || (passed && reflValid) ? "#D1FAE5" : "var(--bg-cream)", border: `1.5px solid ${isDone || (passed && reflValid) ? "var(--green-500)" : "var(--gold-400)"}` }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: isDone || (passed && reflValid) ? "var(--green-500)" : "var(--orange-500)" }}>
              {isDone
                ? allMissionsDone
                  ? "Semua misi tuntas! Kamu siap mengerjakan kuis."
                  : isLastLesson
                    ? "Misi pelajaran terakhir tuntas."
                    : "Misi tuntas. Lanjut ke pelajaran berikutnya…"
                : passed && reflValid
                  ? isLastLesson ? "Skor cukup. Klik tombol untuk menyelesaikan semua misi." : "Skor cukup. Klik tombol untuk lanjut ke pelajaran berikutnya."
                  : passed && !reflValid
                    ? "Skor sudah cukup — isi refleksi satu kalimat untuk menyelesaikan misi."
                    : `Skor minimal lulus: ${mission.passScore}. Baca kembali materi, lalu perbaiki jawaban.`}
            </div>
          </div>
        </div>

        {/* Latihan Penguat Modul Cetak */}
        {mission.extras.length > 0 && (
          <div style={{ padding: 24, background: "var(--bg)", borderRadius: 14, border: "1.5px dashed var(--line-strong)", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.09em" }}>Latihan Penguat Modul Cetak</span>
              <span className="tag" style={{ marginLeft: "auto", fontSize: 11 }}>Rekomendasi SIGMA</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 14 }}>
              Pilih salah satu setelah misi pemahaman selesai. SIGMA menampilkan maksimal dua latihan yang paling dekat dengan unit ini agar siswa tidak asal klik terlalu banyak pilihan.
            </p>
            <div className="quest-activity-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
              {mission.extras.map((a, i) => <QuestActivity key={i} activity={a} onComplete={() => {}} done={false}/>)}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
          {isDone ? (
            allMissionsDone ? (
              <button className="btn btn-success" onClick={() => onSwitchTab && onSwitchTab("kuis")} style={{ minWidth: 220 }}>
                <Icon.Check width="14" height="14"/> Semua Misi Tuntas — Lanjut ke Kuis
              </button>
            ) : (
              <button className="btn btn-success" disabled style={{ minWidth: 220 }}>
                <Icon.Check width="14" height="14"/> Misi Tuntas — Menuju Pelajaran Berikutnya…
              </button>
            )
          ) : passed && reflValid ? (
            <button className="btn btn-success" onClick={handleClaim} style={{ minWidth: 220 }}>
              <Icon.Check width="14" height="14"/> {isLastLesson ? "Misi Tuntas — Selesaikan Semua Misi" : "Misi Tuntas — Pelajaran Berikutnya"}
            </button>
          ) : reflValid && !passed ? (
            <button className="btn btn-primary" onClick={handleClaim} style={{ minWidth: 220 }}>
              <Icon.Refresh width="14" height="14"/> Perbaiki Jawaban
            </button>
          ) : (
            <button className="btn" disabled style={{ minWidth: 220 }}>
              <Icon.Check width="14" height="14"/> Simpan Misi Pemahaman
            </button>
          )}
        </div>
      </div>

      <aside>
        <div className="card-soft" style={{ padding: 20, background: "white", position: "sticky", top: 100 }}>
          <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 14 }}>Pilih Pelajaran</div>
          {Array(mod.lessons).fill(0).map((_, i) => {
            const label = mod.topics[i] || `Pengayaan ${i + 1}`;
            const done = !!window.USER.quests?.[mod.id]?.[i]?.completed;
            return (
              <button key={i} onClick={() => switchLesson(i)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, marginBottom: 4,
                background: lessonIndex === i ? subject.colorLight : "transparent",
                border: lessonIndex === i ? `1.5px solid ${subject.color}` : "1.5px solid transparent",
                textAlign: "left",
              }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: done ? "var(--green-500)" : "white", border: done ? "none" : "2px solid var(--line-strong)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>
                  {done ? <Icon.Check width="12" height="12"/> : i + 1}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy-950)", lineHeight: 1.35 }}>{label}</span>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
};

const QuestActivity = ({ activity, onComplete, done }) => {
  if (activity.type === "interactive") {
    return <InteractiveQuestCard activity={activity} onComplete={onComplete} done={done}/>;
  }
  if (activity.type === "note") {
    return <InteractiveQuestCard activity={{ ...activity, type: "interactive", kind: "note" }} onComplete={onComplete} done={done}/>;
  }
  const isLab = activity.type === "lab";
  const item = isLab
    ? window.CURRICULUM.labs.find(l => l.id === activity.id)
    : window.CURRICULUM.games.find(g => g.id === activity.id);
  if (!item) return null;
  const to = isLab ? `/lab/${item.id}` : `/gim/${item.id}`;
  const I = Icon[item.icon];
  const isFinished = isLab
    ? (window.USER.completedLabs || []).includes(item.id)
    : (window.USER.completedGames || []).includes(item.id);
  const saveReferrer = () => sessionStorage.setItem("sigma_lab_referrer", window.location.hash.slice(1));
  return (
    <Link to={to} onClick={saveReferrer} className="card card-hover" style={{ padding: 18, background: isFinished ? "#D1FAE5" : "white", textDecoration: "none", color: "inherit", display: "block", border: isFinished ? "1.5px solid var(--green-500)" : undefined }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: isFinished ? "var(--green-500)" : item.color, border: "2px solid var(--ink)", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isFinished ? <Icon.Check width="22" height="22"/> : <I width="22" height="22"/>}
        </div>
        <div>
          <div className="tag" style={{ background: isFinished ? "#D1FAE5" : isLab ? "var(--info-100)" : "var(--ai-100)", color: isFinished ? "var(--green-500)" : isLab ? "var(--info-500)" : "var(--ai-500)", marginBottom: 4 }}>
            {isFinished ? "Sudah Dikerjakan ✓" : isLab ? "Eksperimen" : "Gim"}
          </div>
          <div style={{ fontWeight: 900, fontSize: 14 }}>{item.title}</div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5 }}>{activity.reason}</div>
      {isFinished && (
        <div style={{ marginTop: 8, fontSize: 12, fontWeight: 800, color: "var(--green-500)" }}>
          Klik untuk mengulang sebagai pengayaan tambahan.
        </div>
      )}
    </Link>
  );
};

function analyzeReflectionQuality(text, mission) {
  const raw = String(text || "").replace(/\s+/g, " ").trim();
  const normalized = raw.toLowerCase();
  const minLength = 70;
  const summaryWords = (mission?.summaryPoints || [])
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9\u00c0-\u024f]+/i)
    .filter(w => w.length >= 5);
  const concepts = [...new Set([
    ...(mission?.concepts || []),
    ...summaryWords.slice(0, 14),
  ].map(w => String(w).toLowerCase()))].filter(Boolean);
  const conceptHits = concepts.filter(w => normalized.includes(w)).length;
  const hasConcept = conceptHits > 0;
  const hasExample = /contoh|misal|misalnya|seperti|di kelas|di sekolah|pengalaman|ketika|saat/.test(normalized);
  const hasReason = /karena|sebab|agar|supaya|maka|sehingga|dampak|risiko|manfaat|penting/.test(normalized);
  const missing = [];
  if (raw.length < minLength) missing.push("tulisan lebih lengkap");
  if (!hasConcept) missing.push("kata kunci materi");
  if (!hasExample) missing.push("contoh nyata");
  if (!hasReason) missing.push("alasan");
  return { minLength, valid: missing.length === 0, missing };
}

const InteractiveQuestCard = ({ activity, onComplete, done }) => {
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [revising, setRevising] = useState(false);
  // Shuffle sequence steps once on mount so order is not given away
  const [shuffledSteps] = useState(() =>
    activity.kind === "sequence" ? [...(activity.steps || [])].sort(() => Math.random() - 0.5) : []
  );
  // Shuffle multiple-choice options once, keeping each option's original index
  const [shuffledChoiceOptions] = useState(() =>
    activity.kind === "choice"
      ? (activity.options || []).map((text, idx) => ({ text, idx })).sort(() => Math.random() - 0.5)
      : []
  );
  const set = (key, value) => setValues(v => ({ ...v, [key]: value }));
  // Actual score (never forced to 100)
  const feedback = getInteractionFeedback(activity, values, false);
  const activityPassed = submitted && feedback.score >= 70;
  const isDone = done || activityPassed;
  const locked = isDone && !revising;
  // Reveal score + correctness ONLY after the student presses "Periksa Jawaban"
  const revealed = submitted || locked;
  // Display feedback forces 100 when locked (shows perfect state)
  const displayFeedback = getInteractionFeedback(activity, values, locked);

  const mark = () => {
    onComplete(feedback.score);
    setSubmitted(true);
    setRevising(false);
  };
  const retry = () => {
    setValues({});
    setSubmitted(false);
    setRevising(false);
  };

  const wrap = (children) => (
    <div className="card" style={{ padding: 18, background: locked ? "#D1FAE5" : "white", display: "block" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: locked ? "var(--green-500)" : "var(--gold-300)", border: "2px solid var(--ink)", color: locked ? "white" : "var(--navy-950)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {locked ? <Icon.Check width="22" height="22"/> : <Icon.Puzzle width="22" height="22"/>}
        </div>
        <div>
          <div className="tag tag-gold" style={{ marginBottom: 4 }}>Latihan</div>
          <div style={{ fontWeight: 900, fontSize: 14 }}>{activity.title}</div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5, marginBottom: 12 }}>{activity.reason}</div>
      {children}
      {submitted && !locked && feedback.score < 70 && (
        <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, background: "#FEF3C7", border: "1.5px solid var(--gold-400)", fontSize: 13, fontWeight: 700, color: "var(--orange-500)" }}>
          Belum tepat. Baca kembali ringkasan materi di atas, lalu coba perbaiki jawabanmu.
        </div>
      )}
      {revealed && displayFeedback.active && (
        <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 12, background: displayFeedback.bg, border: `1.5px solid ${displayFeedback.border}`, display: "grid", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 900, color: displayFeedback.color }}>
              <Icon.Sparkles width="15" height="15"/> {displayFeedback.title}
            </div>
            <span style={{ fontSize: 12, fontWeight: 900, color: displayFeedback.color }}>{displayFeedback.score}/100</span>
          </div>
          <div style={{ height: 7, background: "white", borderRadius: 999, overflow: "hidden", border: "1px solid var(--line)" }}>
            <div style={{ width: `${displayFeedback.score}%`, height: "100%", background: displayFeedback.color }}/>
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.45, color: "var(--ink-muted)", fontWeight: 700 }}>{displayFeedback.message}</div>
          <div style={{ fontSize: 12, fontWeight: 900, color: displayFeedback.color }}>
            Hadiah: {getQuestXpPreview(displayFeedback.score)} XP
          </div>
        </div>
      )}
      {locked ? (
        <button className="btn btn-sm btn-primary" onClick={() => setRevising(true)} style={{ marginTop: 12, width: "100%" }}>
          <Icon.Refresh width="14" height="14"/> Revisi Jawaban
        </button>
      ) : submitted && feedback.score < 70 ? (
        <button className="btn btn-sm btn-primary" onClick={retry} style={{ marginTop: 12, width: "100%" }}>
          <Icon.Refresh width="14" height="14"/> Coba Lagi
        </button>
      ) : (
        <button className="btn btn-sm btn-primary" onClick={mark} style={{ marginTop: 12, width: "100%" }}>
          <Icon.Check width="14" height="14"/> Periksa Jawaban
        </button>
      )}
    </div>
  );

  if (activity.kind === "choice") {
    return wrap(
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--navy-950)", lineHeight: 1.45, marginBottom: 2 }}>{activity.question}</div>
        {shuffledChoiceOptions.map(opt => {
          const selected = values.choice === opt.idx;
          const reveal = selected && (submitted || locked);
          const isCorrect = opt.idx === activity.answer;
          const bg = reveal ? (isCorrect ? "#D1FAE5" : "#FEE2E2") : selected ? "var(--gold-300)" : "white";
          const bd = reveal ? (isCorrect ? "var(--green-500)" : "var(--red-500)") : selected ? "var(--ink)" : "var(--line-strong)";
          return (
            <button key={opt.idx} disabled={locked} onClick={() => set("choice", opt.idx)}
              style={{ textAlign: "left", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${bd}`, background: bg, fontSize: 13, fontWeight: 600, cursor: locked ? "default" : "pointer", lineHeight: 1.4 }}>
              {opt.text}
            </button>
          );
        })}
      </div>
    );
  }
  if (activity.kind === "explain") {
    const text = values.explain || "";
    const keywords = activity.keywords || [];
    const normalized = text.toLowerCase();
    const matchedKeywords = keywords.filter(k => normalized.includes(String(k).toLowerCase()));
    const neededKeywords = Math.min(2, keywords.length);
    return wrap(
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--navy-950)", lineHeight: 1.45 }}>{activity.question}</div>
        <textarea
          className="input"
          rows="5"
          disabled={locked}
          value={text}
          onChange={e => set("explain", e.target.value)}
          placeholder="Tulis 2-3 kalimat dengan bahasamu sendiri. Sertakan contoh atau alasan."
          style={{ resize: "vertical", minHeight: 116, lineHeight: 1.55 }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", fontSize: 12, fontWeight: 800, color: "var(--ink-muted)" }}>
          <span>{text.trim().length} karakter</span>
          {revealed && neededKeywords > 0 && (
            <span>Kata kunci terkait: {Math.min(matchedKeywords.length, neededKeywords)}/{neededKeywords}</span>
          )}
        </div>
      </div>
    );
  }
  if (activity.kind === "table") {
    const groups = activity.groups || [
      { label: "Objek data", choices: ["Siswa", "Buku", "Menu kantin", "Kegiatan kelas"] },
      { label: "Atribut utama", choices: ["Nama", "Kategori", "Jumlah", "Status"] },
      { label: "Atribut pembanding", choices: ["Tanggal", "Nilai", "Lokasi", "Waktu"] },
    ];
    return wrap(
      <div style={{ display: "grid", gap: 10 }}>
        {groups.map(group => (
          <div key={group.label} style={{ padding: 10, borderRadius: 10, background: "var(--bg)", border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 8, color: "var(--ink-muted)" }}>{group.label}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {group.choices.map(choice => (
                <button key={choice} className="btn btn-sm" disabled={locked} onClick={() => set(group.label, choice)} style={{ background: values[group.label] === choice ? "var(--gold-300)" : "white" }}>
                  {choice}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (activity.kind === "flow") {
    const steps = activity.steps || ["Perangkat", "Router", "Internet", "Server"];
    return wrap(
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {steps.map((step, i) => (
          <button key={step} disabled={locked} onClick={() => set(step, !values[step])} className="btn btn-sm" style={{ background: values[step] ? "var(--gold-300)" : "white" }}>
            {i + 1}. {step}
          </button>
        ))}
      </div>
    );
  }
  if (activity.kind === "sequence") {
    const steps = activity.steps || ["Pahami masalah", "Pecah bagian", "Susun langkah", "Uji solusi"];
    // Use shuffled display order (never reveal the correct order upfront)
    const displaySteps = shuffledSteps.length > 0 ? shuffledSteps : steps;
    const selected = values.order || [];
    const pick = (step) => {
      if (locked || selected.includes(step)) return;
      set("order", [...selected, step]);
    };
    return wrap(
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-muted)", marginBottom: 4 }}>
          Klik langkah dalam urutan yang benar:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {displaySteps.map(step => (
            <button key={step} disabled={locked || selected.includes(step)} onClick={() => pick(step)} className="btn btn-sm"
              style={{ background: selected.includes(step) ? "var(--gold-300)" : "white", opacity: selected.includes(step) ? 0.5 : 1 }}>
              {step}
            </button>
          ))}
        </div>
        <div style={{ padding: 10, borderRadius: 10, background: "var(--bg)", border: "1px solid var(--line)", minHeight: 42, fontSize: 13, fontWeight: 800 }}>
          {selected.length ? selected.map((s, i) => `${i + 1}. ${s}`).join(" → ") : "Klik langkah di atas untuk menyusun urutan."}
        </div>
        <button className="btn btn-sm" onClick={() => set("order", [])} disabled={!selected.length || locked}>Ulangi Urutan</button>
      </div>
    );
  }
  if (activity.kind === "decompose") {
    const parts = activity.items || ["Input", "Proses", "Aturan", "Output"];
    const selected = parts.filter(part => values[part]);
    return wrap(
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {parts.map(part => (
            <button key={part} disabled={locked} onClick={() => set(part, !values[part])} className="btn btn-sm" style={{ background: values[part] ? "var(--gold-300)" : "white" }}>
              {part}
            </button>
          ))}
        </div>
        <div style={{ padding: 10, borderRadius: 10, background: "var(--bg)", border: "1px solid var(--line)", fontSize: 13, fontWeight: 800, color: selected.length ? "var(--navy-950)" : "var(--ink-muted)" }}>
          {selected.length ? `${selected.length} bagian dipilih: ${selected.join(", ")}` : "Klik beberapa bagian yang menurutmu penting."}
        </div>
      </div>
    );
  }
  if (activity.kind === "abstraction") {
    const answer = activity.answer || {};
    return wrap(
      <div style={{ display: "grid", gap: 10 }}>
        {(activity.items || []).map(item => (
          <div key={item} style={{ padding: 10, borderRadius: 10, background: "var(--bg)", border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>{item}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Penting", "Bisa diabaikan"].map(choice => {
                const selected = values[item] === choice;
                const expected = answer[item];
                const checked = selected && expected && revealed;
                return (
                  <button key={choice} className="btn btn-sm" disabled={locked} onClick={() => set(item, choice)} style={{ background: checked ? (choice === expected ? "#D1FAE5" : "#FEE2E2") : selected ? "var(--gold-300)" : "white" }}>
                    {choice}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (activity.kind === "evaluate") {
    const fixes = activity.fixes || ["Perjelas langkah", "Tambah bukti", "Uji dengan contoh", "Kurangi bagian berlebih"];
    return wrap(
      <div style={{ display: "grid", gap: 8 }}>
        {(activity.items || ["Jelas", "Runtut", "Dapat diuji"]).map(item => (
          <label key={item} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, fontWeight: 700 }}>
            <input type="checkbox" disabled={locked} checked={!!values[item]} onChange={e => set(item, e.target.checked)}/>
            {item}
          </label>
        ))}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
          {fixes.map(fix => (
            <button key={fix} className="btn btn-sm" disabled={locked} onClick={() => set("fix", fix)} style={{ background: values.fix === fix ? "var(--gold-300)" : "white" }}>
              {fix}
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (activity.kind === "checklist") {
    return wrap(
      <div style={{ display: "grid", gap: 8 }}>
        {(activity.items || []).map(item => (
          <label key={item} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, fontWeight: 700 }}>
            <input type="checkbox" disabled={locked} checked={!!values[item]} onChange={e => set(item, e.target.checked)}/>
            {item}
          </label>
        ))}
      </div>
    );
  }
  if (activity.kind === "classify") {
    const choices = activity.choices || ["Fakta", "Opini", "Perlu Cek"];
    const answer = activity.answer || {};
    return wrap(
      <div style={{ display: "grid", gap: 10 }}>
        {(activity.items || []).map(item => (
          <div key={item} style={{ padding: 10, borderRadius: 10, background: "var(--bg)", border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>{item}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {choices.map(choice => {
                const selected = values[item] === choice;
                const expected = answer[item];
                const checked = selected && expected && revealed;
                return (
                  <button key={choice} className="btn btn-sm" disabled={locked} onClick={() => set(item, choice)} style={{ background: checked ? (choice === expected ? "#D1FAE5" : "#FEE2E2") : selected ? "var(--gold-300)" : "white" }}>
                    {choice}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (activity.kind === "binary") {
    const n = activity.number || 13;
    const bits = values.bits || ["0", "0", "0", "0"];
    const value = parseInt(bits.join(""), 2);
    const ok = value === n;
    const toggleBit = (i) => {
      const next = [...bits];
      next[i] = next[i] === "1" ? "0" : "1";
      set("bits", next);
    };
    return wrap(
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Ubah angka {n} ke biner</div>
        <div style={{ display: "flex", gap: 8 }}>
          {bits.map((bit, i) => (
            <button key={i} className="btn" disabled={locked} onClick={() => toggleBit(i)} style={{ width: 46, height: 46, padding: 0, justifyContent: "center", background: bit === "1" ? "var(--gold-300)" : "white", fontSize: 18, fontWeight: 900 }}>
              {bit}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, fontWeight: 800, color: ok ? "var(--green-500)" : "var(--ink-muted)" }}>
          Nilai sekarang: {value} {ok ? "Benar" : ""}
        </div>
      </div>
    );
  }

  const noteChoices = activity.choices || ["Contoh sekolah", "Contoh rumah", "Contoh internet", "Perlu diskusi"];
  return wrap(
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {noteChoices.map(choice => (
        <button key={choice} className="btn btn-sm" disabled={locked} onClick={() => set("note", choice)} style={{ background: values.note === choice ? "var(--gold-300)" : "white" }}>
          {choice}
        </button>
      ))}
    </div>
  );
};

function getInteractionFeedback(activity, values, done) {
  const keys = Object.keys(values).filter(k => {
    const v = values[k];
    if (Array.isArray(v)) return v.length > 0;
    return v !== undefined && v !== "" && v !== false;
  });
  let score = 0;

  const answer = activity.answer || null;

  if (activity.kind === "choice") {
    score = values.choice === undefined ? 0 : (values.choice === activity.answer ? 100 : 20);
  } else if (activity.kind === "explain") {
    const text = String(values.explain || "").replace(/\s+/g, " ").trim().toLowerCase();
    const keywords = (activity.keywords || []).map(k => String(k).toLowerCase()).filter(Boolean);
    const keywordHits = keywords.filter(k => text.includes(k)).length;
    const hasExample = /contoh|misal|misalnya|seperti|karena|sebab|agar|jika|maka/.test(text);
    if (text.length < 35) {
      score = text.length ? 25 : 0;
    } else if (text.length < 70) {
      score = 45 + Math.min(keywordHits, 1) * 15 + (hasExample ? 10 : 0);
    } else if (text.length < 110) {
      score = 65 + Math.min(keywordHits, 2) * 10 + (hasExample ? 10 : 0);
    } else {
      score = 78 + Math.min(keywordHits, 2) * 8 + (hasExample ? 6 : 0);
    }
    if (keywordHits === 0) score = Math.min(score, 65);
    score = Math.min(100, score);
  } else if ((activity.kind === "classify" || activity.kind === "abstraction") && answer) {
    const items = activity.items || [];
    const answered = items.filter(item => values[item]).length;
    const correct = items.filter(item => values[item] && values[item] === answer[item]).length;
    score = items.length ? Math.round((correct / items.length) * 100) : 0;
    if (answered > 0 && correct === 0) score = 20;
  } else if (activity.kind === "sequence" && activity.answer) {
    const selected = values.order || [];
    const correctPrefix = selected.filter((step, i) => step === activity.answer[i]).length;
    score = activity.answer.length ? Math.round((correctPrefix / activity.answer.length) * 100) : 0;
    if (selected.length > 0 && correctPrefix === 0) score = 20;
  } else if (activity.kind === "table") {
    const groups = activity.groups || [
      { label: "Objek data" },
      { label: "Atribut utama" },
      { label: "Atribut pembanding" },
    ];
    score = Math.round((groups.filter(g => values[g.label]).length / groups.length) * 100);
  } else if (activity.kind === "sequence") {
    const total = (activity.steps || []).length || 4;
    score = Math.round(((values.order || []).length / total) * 100);
  } else if (activity.kind === "flow" || activity.kind === "decompose" || activity.kind === "checklist") {
    const items = activity.kind === "flow" ? (activity.steps || []) : (activity.items || []);
    const total = Math.max(3, items.length || 4);
    const selected = items.filter(item => values[item]).length;
    score = Math.min(100, Math.round((selected / Math.min(total, 4)) * 100));
  } else if (activity.kind === "abstraction" || activity.kind === "classify") {
    const items = activity.items || [];
    score = items.length ? Math.round((items.filter(item => values[item]).length / items.length) * 100) : 0;
  } else if (activity.kind === "evaluate") {
    const items = activity.items || [];
    const checked = items.filter(item => values[item]).length;
    score = Math.min(100, Math.round(((checked + (values.fix ? 1 : 0)) / Math.max(3, Math.min(items.length + 1, 5))) * 100));
  } else if (activity.kind === "binary") {
    const n = activity.number || 13;
    const bits = values.bits || ["0", "0", "0", "0"];
    const value = parseInt(bits.join(""), 2);
    score = value === n ? 100 : bits.some(bit => bit === "1") ? 55 : 0;
  } else {
    score = keys.length ? 100 : 0;
  }

  if (done) score = 100;
  const active = done || score > 0;
  const hasAnswer = !!answer || !!activity.answer || activity.kind === "binary" || activity.kind === "choice";
  let title = hasAnswer ? "Coba cek pilihanmu" : "Mulai bagus";
  let message = hasAnswer ? "Pilih jawaban yang menurutmu tepat. Feedback benar-salah akan muncul langsung." : "Lanjutkan pilihanmu sampai kartu ini terasa lengkap.";
  let color = "var(--info-500)";
  let bg = "var(--info-100)";
  let border = "var(--info-300)";

  if (score >= 100) {
    title = hasAnswer ? "Benar semua" : "Latihan tuntas";
    message = hasAnswer ? "Mantap. Jawabanmu tepat dan misi siap diklaim." : "Mantap. Pilihanmu sudah lengkap dan misi siap diklaim.";
    color = "var(--green-500)";
    bg = "#D1FAE5";
    border = "var(--green-500)";
  } else if (score >= 80) {
    title = hasAnswer ? "Hampir benar semua" : "Hampir sempurna";
    message = hasAnswer ? "Sudah kuat. Cek lagi satu pilihan yang masih ragu." : "Sudah kuat. Kamu bisa klaim misi atau cek satu pilihan lagi.";
    color = "var(--green-500)";
    bg = "#D1FAE5";
    border = "var(--green-500)";
  } else if (score >= 50) {
    title = hasAnswer ? "Sebagian sudah benar" : "Pilihan bagus";
    message = hasAnswer ? "Ada jawaban yang tepat. Coba bandingkan lagi pilihan yang lain." : "Kamu sudah menangkap idenya. Tambah satu-dua pilihan lagi agar lebih lengkap.";
    color = "var(--orange-500)";
    bg = "var(--bg-cream)";
    border = "var(--gold-400)";
  }

  if (activity.kind === "explain") {
    if (score >= 90) {
      title = "Penjelasan kuat";
      message = "Jawabanmu sudah cukup rinci, memakai bahasa sendiri, dan terhubung dengan inti materi.";
      color = "var(--green-500)";
      bg = "#D1FAE5";
      border = "var(--green-500)";
    } else if (score >= 70) {
      title = "Penjelasan cukup";
      message = "Sudah bisa diklaim. Akan lebih kuat jika kamu menambah contoh nyata atau alasan yang lebih jelas.";
      color = "var(--green-500)";
      bg = "#D1FAE5";
      border = "var(--green-500)";
    } else if (score >= 45) {
      title = "Perlu dikembangkan";
      message = "Tambahkan satu contoh, alasan, atau kata penting dari materi agar jawaban tidak sekadar umum.";
      color = "var(--orange-500)";
      bg = "var(--bg-cream)";
      border = "var(--gold-400)";
    } else if (score > 0) {
      title = "Masih terlalu singkat";
      message = "Coba tulis ulang dengan 2-3 kalimat: jelaskan maksudnya, beri contoh, lalu sebutkan alasannya.";
    }
  }

  return { active, score, title, message, color, bg, border };
}

function getQuestXpPreview(score) {
  if (score >= 100) return 35;
  if (score >= 80) return 25;
  if (score >= 50) return 15;
  return 10;
}

// Shown after the quiz is finished — navigate to the next module / lesson
const NextStepCard = ({ mod }) => {
  const subj = window.CURRICULUM.subjects[mod.subject];
  const ordered = window.CURRICULUM.modules
    .filter(m => m.level === mod.level && m.subject === mod.subject)
    .sort((a, b) => (a.unit || 0) - (b.unit || 0));
  const idx = ordered.findIndex(m => m.id === mod.id);
  const nextModule = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;

  return (
    <div style={{ marginTop: 18, padding: 22, borderRadius: 16, background: "white", border: `2px solid ${subj.color}`, boxShadow: "var(--shadow-soft)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: subj.colorLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon.Trophy width="16" height="16" style={{ color: subj.color }}/>
        </div>
        <span style={{ fontSize: 12, fontWeight: 900, color: "var(--navy-950)", textTransform: "uppercase", letterSpacing: "0.09em" }}>Modul Tuntas</span>
      </div>
      {nextModule ? (
        <>
          <div style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.55, marginBottom: 14 }}>
            Hebat! Kamu sudah menuntaskan Materi, Misi, dan Kuis untuk <b>{mod.title}</b>. Lanjutkan ke modul berikutnya:
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "14px 16px", borderRadius: 12, background: "var(--bg)", border: "1.5px solid var(--line)", marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: subj.color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, flexShrink: 0 }}>{nextModule.unit}</div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: subj.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{subj.name} • Unit {nextModule.unit}</div>
              <div style={{ fontWeight: 900, fontSize: 15, color: "var(--navy-950)", lineHeight: 1.3 }}>{nextModule.title}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link to={`/modul/${nextModule.id}`} className={`btn ${subj.btnClass}`}>
              Lanjut ke Modul Berikutnya <Icon.ArrowRight width="14" height="14"/>
            </Link>
            <Link to={`/kelas/${mod.level}`} className="btn">
              <Icon.ArrowLeft width="14" height="14"/> Semua Modul Kelas {mod.level}
            </Link>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.55, marginBottom: 16 }}>
            Luar biasa! 🎉 Ini modul <b>{subj.name}</b> terakhir untuk kelas {mod.level}, dan kamu sudah menuntaskan seluruh rangkaiannya.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link to={`/kelas/${mod.level}`} className={`btn ${subj.btnClass}`}>
              Kembali ke Daftar Modul Kelas {mod.level} <Icon.ArrowRight width="14" height="14"/>
            </Link>
            <Link to="/dashboard" className="btn">
              <Icon.Home width="14" height="14"/> Dashboard
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

// ---------- Tab: Kuis ----------
const KuisTab = ({ mod, subject }) => {
  const [questions] = useState(() => shuffleQuizQuestions(getQuizQuestions(mod.id)));
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [integrityAccepted, setIntegrityAccepted] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null); // hasil penilaian server: {score,total,percent,xpAwarded,review}
  const [xpInfo, setXpInfo] = useState(null);

  const answeredCount = Object.keys(answers).length;
  const review = result?.review || [];
  const score = result?.score ?? 0;
  const percent = result?.percent ?? 0;
  const quizRecord = window.USER.quizzes?.[mod.id];
  const quizLocked = !!quizRecord && !submitted;
  const currentQuestion = questions[currentIndex];
  const currentAnswered = answers[currentIndex] !== undefined;
  const quizGuardProps = started && !submitted ? {
    onCopy: e => e.preventDefault(),
    onCut: e => e.preventDefault(),
    onContextMenu: e => e.preventDefault(),
    onDragStart: e => e.preventDefault(),
    style: { userSelect: "none" },
  } : {};

  useEffect(() => {
    if (!started || submitted) return undefined;
    if (remainingSeconds <= 0) {
      finishQuiz(answers);
      return undefined;
    }
    const timer = setTimeout(() => setRemainingSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(timer);
  }, [started, submitted, remainingSeconds, answers]);

  const finishQuiz = async (nextAnswers) => {
    if (submitting || submitted) return;
    setSubmitting(true);
    setSubmitError("");
    const responses = questions.map((q, i) => ({
      q: q.q,
      selected: typeof nextAnswers[i] === "number" ? q.options[nextAnswers[i]] : null,
    }));
    const before = window.USER.xp || 0;
    const res = await window.SIGMA_AUTH.completeQuiz(mod.id, responses);
    setSubmitting(false);
    if (!res || res.error) {
      setSubmitError(res?.error === "offline"
        ? "Kuis perlu koneksi internet untuk dinilai. Pastikan online lalu coba lagi."
        : "Gagal mengirim kuis. Periksa koneksi lalu coba lagi.");
      return;
    }
    const gained = Math.max(0, (window.USER.xp || 0) - before);
    setResult(res);
    setXpInfo({ gained });
    setSubmitted(true);
  };

  const submitCurrent = () => {
    if (!currentAnswered) return;
    const nextAnswers = { ...answers };
    if (currentIndex >= questions.length - 1) finishQuiz(nextAnswers);
    else setCurrentIndex(i => i + 1);
  };

  if (quizLocked) {
    return (
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <div className="card" style={{ padding: 0, background: "white", overflow: "hidden" }}>
          <div className="quiz-card-header" style={{ padding: "26px 30px", borderBottom: "1.5px solid var(--line)", background: "linear-gradient(135deg, white, var(--bg))", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: subject.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Kuis Terkunci</div>
              <h2 className="display" style={{ fontSize: 28, margin: 0 }}>Tes Pemahaman: {mod.title}</h2>
              <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 6, fontWeight: 700 }}>
                Kuis hanya bisa dikerjakan satu kali. Soal dan pilihan jawaban diacak untuk tiap siswa.
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <QuizStat label="Skor" value={`${quizRecord.latestScore || 0}/${quizRecord.latestTotal || 15}`} color={quizRecord.latestPercent >= 80 ? "var(--green-500)" : quizRecord.latestPercent >= 60 ? "var(--orange-500)" : "var(--red-500)"}/>
              <QuizStat label="Nilai" value={`${quizRecord.latestPercent || 0}%`} color={subject.color}/>
              <QuizStat label="XP Kuis" value={`+${quizRecord.xpAwarded || 0}`} color="var(--gold-500)"/>
            </div>
          </div>
          <div className="quiz-card-body" style={{ padding: 30 }}>
            <div style={{ padding: 18, borderRadius: 16, background: "#D1FAE5", border: "1.5px solid var(--green-500)" }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: "var(--green-500)" }}>Kuis sudah dikumpulkan</div>
              <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.55, marginTop: 6, fontWeight: 700 }}>
                Jawaban tidak bisa direvisi agar penilaian tetap adil. Lanjutkan pengayaan melalui Materi, Misi, atau AI Tutor.
              </div>
            </div>
            <NextStepCard mod={mod}/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <div className="card" style={{ padding: 0, background: "white", overflow: "hidden" }}>
        <div className="quiz-card-header" style={{ padding: "26px 30px", borderBottom: "1.5px solid var(--line)", background: "linear-gradient(135deg, white, var(--bg))", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: subject.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Kuis</div>
            <h2 className="display" style={{ fontSize: 28, margin: 0 }}>Tes Pemahaman: {mod.title}</h2>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 6, fontWeight: 700 }}>
              15 soal sesuai materi • 1 jawaban benar = 2 XP • Satu kali pengerjaan
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <QuizStat label="Terjawab" value={`${answeredCount}/${questions.length}`} color={subject.color}/>
            {started && !submitted && <QuizStat label="Waktu" value={formatQuizTime(remainingSeconds)} color={remainingSeconds <= 180 ? "var(--red-500)" : subject.color}/>}
            {submitted && <QuizStat label="Skor" value={`${score}/${questions.length}`} color={score >= questions.length * 0.7 ? "var(--green-500)" : score >= questions.length / 2 ? "var(--orange-500)" : "var(--red-500)"}/>}
            {submitted && <QuizStat label="XP Kuis" value={`+${result?.xpAwarded ?? 0}`} color="var(--gold-500)"/>}
          </div>
        </div>

        <div className="quiz-progress-strip" style={{ padding: "18px 30px", borderBottom: "1px solid var(--line)", background: "white" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 220px", height: 9, background: "var(--line)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${Math.round((answeredCount / questions.length) * 100)}%`, height: "100%", background: subject.color }}/>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {questions.map((_, i) => {
                const answered = answers[i] !== undefined;
                const correct = submitted && !!review[i]?.correct;
                const wrong = submitted && answered && !correct;
                return (
                  <span key={i} style={{
                    width: 24, height: 24, borderRadius: 8,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 900,
                    background: correct ? "#D1FAE5" : wrong ? "#FEE2E2" : answered ? subject.colorLight : "var(--bg)",
                    color: correct ? "var(--green-500)" : wrong ? "var(--red-500)" : answered ? subject.color : "var(--ink-muted)",
                    border: `1px solid ${correct ? "var(--green-500)" : wrong ? "var(--red-500)" : answered ? subject.color : "var(--line)"}`,
                  }}>{i + 1}</span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="quiz-card-body" style={{ padding: "24px 30px 30px" }}>
          {submitted && (
          <div style={{ padding: 14, borderRadius: 14, background: xpInfo?.gained ? "#D1FAE5" : "var(--bg-cream)", border: `1.5px solid ${xpInfo?.gained ? "var(--green-500)" : "var(--gold-400)"}`, marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: xpInfo?.gained ? "var(--green-500)" : "var(--orange-500)" }}>
              {xpInfo?.gained ? `+${xpInfo.gained} XP masuk ke total XP kamu` : "Kuis tersimpan. XP kuis 0 karena belum ada jawaban benar."}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-muted)", fontWeight: 700, marginTop: 4 }}>
              Kuis sudah dikumpulkan dan terkunci. Gunakan umpan balik ini untuk belajar di Materi, Misi, atau AI Tutor.
            </div>
          </div>
          )}

          {!started && !submitted ? (
          <div style={{ padding: 22, background: "var(--bg)", borderRadius: 16, border: "1.5px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: subject.color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon.Lock width="22" height="22"/>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "var(--navy-950)", marginBottom: 8 }}>Pernyataan Integritas</div>
                <div style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.6, fontWeight: 700 }}>
                  Kerjakan kuis dengan pemahaman sendiri. Saat kuis dimulai, teks soal tidak bisa disalin, klik kanan dibatasi, dan waktu berjalan selama 25 menit.
                </div>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 16, padding: 14, background: "white", border: "1.5px solid var(--line)", borderRadius: 12, cursor: "pointer" }}>
                  <input type="checkbox" checked={integrityAccepted} onChange={e => setIntegrityAccepted(e.target.checked)} style={{ marginTop: 2 }}/>
                  <span style={{ fontSize: 14, color: "var(--navy-950)", lineHeight: 1.45, fontWeight: 800 }}>
                    Saya mengerjakan kuis ini secara jujur tanpa meminta jawaban dari AI generatif atau orang lain.
                  </span>
                </label>
              </div>
            </div>
          </div>
          ) : !submitted ? (
          <div {...quizGuardProps} style={{ padding: 22, background: "var(--bg)", borderRadius: 16, border: "1.5px solid var(--line)", ...(quizGuardProps.style || {}) }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: subject.color, color: "white", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{currentIndex + 1}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "var(--ink-subtle)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Soal {currentIndex + 1} dari {questions.length}</div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--navy-950)", lineHeight: 1.45, marginBottom: 18 }}>
              {currentQuestion.q}
            </div>
            <div className="quiz-options-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
              {currentQuestion.options.map((opt, j) => {
                const selected = answers[currentIndex] === j;
                return (
                  <button key={j}
                    onClick={() => setAnswers({ ...answers, [currentIndex]: j })}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "14px 16px", borderRadius: 12,
                      background: selected ? subject.colorLight : "white",
                      border: `2px solid ${selected ? subject.color : "var(--line-strong)"}`,
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: selected ? 700 : 500,
                      transition: "all 0.15s",
                      width: "100%",
                      minHeight: 48,
                    }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 8,
                      background: selected ? subject.color : "transparent",
                      border: selected ? "none" : "2px solid var(--line-strong)",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "white",
                      fontSize: 12, fontWeight: 900, flexShrink: 0,
                    }}>
                      {!selected && String.fromCharCode(65 + j)}
                      {selected && <Icon.Check width="12" height="12"/>}
                    </div>
                    <span style={{ lineHeight: 1.35 }}>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
          ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {review.map((r, i) => {
              const correct = !!r.correct;
              return (
                <div key={i} style={{ padding: 16, borderRadius: 14, background: correct ? "#D1FAE5" : "#FEE2E2", border: `1.5px solid ${correct ? "var(--green-500)" : "var(--red-500)"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: correct ? "var(--green-500)" : "var(--red-500)" }}>Soal {i + 1} • {correct ? "Benar" : "Perlu cek"}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--navy-950)", lineHeight: 1.45 }}>{r.q}</div>
                  <div style={{ marginTop: 8, fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5 }}>
                    Jawabanmu: <strong>{r.selected == null ? "Belum dijawab" : r.selected}</strong><br/>
                    Jawaban tepat: <strong>{r.correctText}</strong><br/>
                    {r.explain}
                  </div>
                </div>
              );
            })}
          </div>
          )}

        {submitted && <NextStepCard mod={mod}/>}

        {submitError && (
          <div style={{ marginTop: 18, padding: 14, borderRadius: 12, background: "#FEE2E2", border: "1.5px solid var(--red-500)", fontSize: 13, fontWeight: 700, color: "var(--red-500)", lineHeight: 1.5 }}>
            ⚠️ {submitError}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 24, padding: 14, background: "white", border: "1.5px solid var(--line)", borderRadius: 14, position: "sticky", bottom: 16, zIndex: 2, boxShadow: "var(--shadow-soft)" }}>
          {!started && !submitted ? (
            <button className={`btn ${subject.btnClass}`} disabled={!integrityAccepted} onClick={() => setStarted(true)} style={{ width: "100%", justifyContent: "center" }}>
              <Icon.Play width="16" height="16"/> Mulai Kuis
            </button>
          ) : !submitted ? (
            <button className={`btn ${subject.btnClass}`} disabled={!currentAnswered || submitting} onClick={submitCurrent} style={{ width: "100%", justifyContent: "center" }}>
              {submitting
                ? "Menilai…"
                : `${currentIndex === questions.length - 1 ? "Selesaikan Kuis" : "Kirim & Lanjut"} (${answeredCount}/${questions.length})`}
            </button>
          ) : (
            <button className="btn btn-primary" disabled style={{ width: "100%", justifyContent: "center", opacity: 0.85 }}>
              <Icon.Check width="16" height="16"/> Kuis Selesai
            </button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

const QuizStat = ({ label, value, color }) => (
  <div style={{ padding: "8px 12px", background: "white", border: "1.5px solid var(--line)", borderRadius: 12, minWidth: 92, textAlign: "center" }}>
    <div style={{ fontSize: 10, fontWeight: 900, color: "var(--ink-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 900, color }}>{value}</div>
  </div>
);

function formatQuizTime(seconds) {
  const safe = Math.max(0, Number(seconds || 0));
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function shuffleQuizQuestions(questions) {
  return [...questions]
    .map(q => ({ ...q, options: q.options.map((text, index) => ({ text, index })) }))
    .sort(() => Math.random() - 0.5)
    .map(q => {
      const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
      return {
        ...q,
        options: shuffledOptions.map(o => o.text),
        correct: shuffledOptions.findIndex(o => o.index === q.correct),
      };
    });
}

// ---------- Tab: AI Tutor ----------
const TutorTab = ({ mod, subject }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", text: `Halo! Aku AI Tutor buat modul "${mod.title}". Tanya apa aja, aku bantu jelasin dengan bahasa yang gampang 🤖` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const msgsRef = React.useRef(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setMessages(m => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);

    try {
      // Try real AI if available (window.claude.complete provided by Claude Artifact env)
      if (window.claude && window.claude.complete) {
        const reply = await window.claude.complete(
          `Kamu adalah AI Tutor ramah untuk siswa SMP kelas ${mod.level} di SMP Labschool Jakarta. Jawab singkat (2-4 kalimat), Bahasa Indonesia casual tapi sopan. Fokus topik modul: "${mod.title}" — ${mod.description}. Pertanyaan siswa: ${q}`
        );
        setMessages(m => [...m, { role: "assistant", text: reply }]);
      } else {
        // Fallback: simulated smart response
        await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
        setMessages(m => [...m, { role: "assistant", text: getSimulatedReply(q, mod) }]);
      }
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", text: "Waduh, ada error. Coba pertanyaan lagi ya 🙏" }]);
    }
    setLoading(false);
  };

  const suggestions = getTutorSuggestions(mod);

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div className="card" style={{ padding: 0, background: "white", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", background: "linear-gradient(135deg, var(--ai-100), white)", borderBottom: "1.5px solid var(--line)", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--ai-500)", color: "white", border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon.Sparkles width="24" height="24"/>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>AI Tutor SIGMA</div>
            <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>Spesialis: {mod.title} • {subject.name} Kelas {mod.level}</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "#D1FAE5", borderRadius: "var(--r-full)", fontSize: 11, fontWeight: 700, color: "var(--green-500)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green-500)" }} className="pulse"/>
            Online
          </div>
        </div>

        {/* Messages */}
        <div ref={msgsRef} style={{ padding: 20, minHeight: 360, maxHeight: 460, overflowY: "auto", background: "var(--bg)" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: m.role === "user" ? "var(--gold-400)" : "var(--ai-500)",
                color: m.role === "user" ? "var(--navy-950)" : "white",
                border: "2px solid var(--ink)", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800,
              }}>
                {m.role === "user" ? window.USER.nickname[0] : <Icon.Sparkles width="18" height="18"/>}
              </div>
              <div style={{
                padding: "10px 14px",
                background: m.role === "user" ? "var(--navy-950)" : "white",
                color: m.role === "user" ? "white" : "var(--navy-950)",
                borderRadius: 14,
                fontSize: 14, lineHeight: 1.55,
                maxWidth: "80%",
                border: m.role === "assistant" ? "1.5px solid var(--line)" : "none",
              }}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--ai-500)", color: "white", border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon.Sparkles width="18" height="18"/>
              </div>
              <div style={{ padding: "10px 14px", background: "white", border: "1.5px solid var(--line)", borderRadius: 14, display: "flex", gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 6, height: 6, borderRadius: "50%", background: "var(--ai-500)",
                    animation: `bounce 1.2s ${i * 0.15}s infinite`,
                  }}/>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div style={{ padding: "12px 20px", borderTop: "1.5px solid var(--line)", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", alignSelf: "center" }}>Coba tanya:</span>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => { setInput(s); }}
                style={{ padding: "6px 12px", background: "var(--ai-100)", border: "1.5px solid var(--ai-300)", borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 600, color: "var(--ai-500)", cursor: "pointer" }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: 16, borderTop: "1.5px solid var(--line)", display: "flex", gap: 10 }}>
          <input className="input" placeholder="Tulis pertanyaanmu..."
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
            disabled={loading}
          />
          <button className="btn btn-ai" onClick={send} disabled={loading || !input.trim()}>
            <Icon.Send width="16" height="16"/>
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- helpers ----------
function getLessonContent(mod, index) {
  const topic = mod.topics[index] || `Pengayaan ${index + 1}`;

  if (mod.id === "inf7-1") {
    const bk = {
      "Dekomposisi": {
        intro: "Dekomposisi berarti memecah masalah besar menjadi bagian-bagian kecil yang lebih mudah dipahami. Dalam BK, langkah ini membantu siswa tidak langsung bingung saat melihat masalah yang tampak rumit.",
        example: "Saat ingin membuat jadwal piket kelas, masalahnya bisa dipecah menjadi daftar siswa, hari piket, aturan pembagian tugas, dan cara mengecek apakah pembagiannya adil.",
        activity: "Pilih satu masalah sederhana di sekolah, lalu pecah menjadi minimal 4 bagian kecil: siapa yang terlibat, data yang dibutuhkan, aturan, dan hasil yang diharapkan.",
        prompt: "Mengapa masalah besar lebih mudah diselesaikan setelah dipecah menjadi bagian kecil?",
        printGuide: "Baca bagian modul cetak tentang dekomposisi. Cari contoh masalah yang dibagi menjadi beberapa bagian, lalu cocokkan dengan aktivitas pecah masalah di SIGMA.",
        checks: ["Apa masalah utamanya?", "Bagian kecil apa saja yang muncul?", "Data apa yang dibutuhkan?", "Bagian mana yang paling sulit?"],
      },
      "Pengenalan Pola": {
        intro: "Pengenalan pola adalah kemampuan menemukan kesamaan, pengulangan, atau kecenderungan dari beberapa contoh. Pola membantu kita menebak aturan dan memilih strategi yang tepat.",
        example: "Jika beberapa siswa sering terlambat pada hari yang sama, kita bisa mencari pola: apakah karena jadwal, transportasi, atau kegiatan sebelum sekolah.",
        activity: "Amati 5 contoh kejadian yang mirip, lalu tulis persamaan dan perbedaannya. Dari sana, tebak aturan atau pola yang mungkin terjadi.",
        prompt: "Apa bedanya melihat satu kejadian dengan melihat pola dari banyak kejadian?",
        printGuide: "Baca bagian modul cetak tentang pengenalan pola. Tandai contoh yang menunjukkan kesamaan atau pengulangan, lalu uji dengan contoh baru di SIGMA.",
        checks: ["Apa contoh yang dibandingkan?", "Apa persamaannya?", "Apa perbedaannya?", "Pola apa yang bisa disimpulkan?"],
      },
      "Abstraksi": {
        intro: "Abstraksi berarti memilih informasi yang penting dan mengabaikan detail yang tidak diperlukan. Tujuannya agar solusi fokus pada inti masalah.",
        example: "Saat membuat denah menuju perpustakaan, warna sepatu teman tidak penting. Yang penting adalah titik awal, arah belok, ruang yang dilewati, dan tujuan.",
        activity: "Ambil satu situasi sehari-hari, lalu pisahkan detail penting dan detail yang bisa diabaikan agar masalahnya lebih sederhana.",
        prompt: "Mengapa terlalu banyak detail bisa membuat solusi menjadi membingungkan?",
        printGuide: "Baca bagian modul cetak tentang abstraksi. Perhatikan contoh pemilihan informasi penting, lalu coba tentukan detail penting di aktivitas SIGMA.",
        checks: ["Apa tujuan masalahnya?", "Detail apa yang penting?", "Detail apa yang bisa diabaikan?", "Apakah modelnya lebih sederhana?"],
      },
      "Algoritma & Flowchart": {
        intro: "Algoritma adalah urutan langkah yang jelas untuk menyelesaikan masalah. Flowchart adalah representasi visual dari algoritma menggunakan simbol — oval (mulai/selesai), persegi panjang (proses), dan belah ketupat (keputusan).",
        example: "Langkah meminjam buku: cari buku → cek ketersediaan → [tersedia?] → ya: bawa ke petugas, pindai kartu, catat tanggal kembali → tidak: cari buku lain.",
        activity: "Susun 5-7 langkah untuk menyelesaikan satu tugas harian, lalu gambarkan flowchart sederhananya menggunakan simbol dasar. Pastikan ada minimal satu keputusan jika/maka.",
        prompt: "Mengapa flowchart membantu menemukan kesalahan logika yang tidak terlihat saat menulis langkah dalam bentuk teks?",
        printGuide: "Baca bagian modul cetak tentang algoritma dan flowchart. Cocokkan contoh simbol flowchart di modul dengan latihan menyusun langkah di SIGMA.",
        checks: ["Apa simbol oval, persegi, dan belah ketupat dalam flowchart?", "Apakah langkahnya berurutan?", "Di mana letak percabangan jika/maka?", "Apakah ada akhir proses?"],
      },
      "Evaluasi Solusi": {
        intro: "Evaluasi solusi berarti memeriksa apakah langkah yang dibuat benar-benar menyelesaikan masalah. Solusi yang baik perlu jelas, efisien, bisa diuji, dan dapat diperbaiki.",
        example: "Jika jadwal piket sudah dibuat, evaluasinya bisa dengan mengecek apakah semua siswa mendapat giliran, tidak ada hari kosong, dan pembagiannya terasa adil.",
        activity: "Ambil solusi yang sudah kamu buat, lalu cek dengan kriteria: jelas, runtut, adil, hemat waktu, dan bisa diuji.",
        prompt: "Mengapa solusi perlu diuji walaupun terlihat sudah benar?",
        printGuide: "Baca bagian modul cetak tentang evaluasi solusi. Gunakan kriteria di modul sebagai acuan untuk menilai jawabanmu di SIGMA.",
        checks: ["Apakah solusi menyelesaikan masalah?", "Apakah ada langkah yang membingungkan?", "Apa bukti solusi berhasil?", "Apa yang perlu diperbaiki?"],
      },
      "Proyek LKPD Komputasional": {
        intro: "Proyek LKPD Komputasional menggabungkan semua elemen berpikir komputasional — dekomposisi, pengenalan pola, abstraksi, algoritma, dan evaluasi — dalam satu tantangan nyata yang kamu rancang sendiri.",
        example: "Contoh proyek: sistem pengaturan antrean UKS sekolah. Dekomposisi: siapa yang terlibat, waktu ramai, prosedur. Pola: waktu puncak. Abstraksi: fokus pada data penting. Algoritma: urutan langkah pendaftaran. Evaluasi: apakah antrean lebih adil?",
        activity: "Pilih satu masalah nyata di sekolah. Terapkan kelima langkah BK: pecah masalah, cari pola, pilih detail penting, susun langkah solusi, lalu evaluasi apakah solusinya layak dijalankan.",
        prompt: "Bagaimana menggabungkan dekomposisi, pola, abstraksi, algoritma, dan evaluasi dalam satu proyek secara terpadu — bukan terpisah-pisah?",
        printGuide: "Baca bagian LKPD proyek di modul cetak. Gunakan panduan proyek sebagai kerangka, lalu lengkapi tiap elemen BK menggunakan SIGMA sebagai alat bantu.",
        checks: ["Apakah masalahnya sudah didekomposisi?", "Pola apa yang ditemukan?", "Detail apa yang diabaikan (abstraksi)?", "Apakah algoritma dan flowchart sudah ada?"],
      },
    };
    const item = bk[topic] || bk["Dekomposisi"];
    return {
      title: `${topic}: BK Dasar`,
      intro: item.intro,
      printGuide: item.printGuide,
      prompt: item.prompt,
      blocks: [
        { label: "Konsep BK", text: item.intro },
        { label: "Contoh Dekat", text: item.example },
        { label: "Cara Mengecek", text: "Jawaban BK yang baik bisa dijelaskan ulang, diuji dengan contoh, dan diperbaiki jika ada bagian yang belum jelas." },
      ],
      activity: item.activity,
      checks: item.checks,
    };
  }

  if (mod.id === "inf9-1") {
    const pythonAdv = {
      "Fungsi Lanjutan & Parameter": {
        intro: "Fungsi lanjutan Python memungkinkan parameter dengan nilai default, argumen kata kunci (keyword argument), dan nilai kembalian kompleks. Ini membuat fungsi lebih fleksibel dan dapat dipakai ulang tanpa menulis ulang kode.",
        example: "def sambut(nama, sapaan='Halo'):\n    return f'{sapaan}, {nama}!'\n\nprint(sambut('Rizky'))                  # Halo, Rizky!\nprint(sambut('Aisha', 'Selamat pagi'))  # Selamat pagi, Aisha!\n\ndef rerata(*angka):\n    return sum(angka) / len(angka) if angka else 0\n\nprint(rerata(80, 90, 75))  # 81.67",
        activity: "Buat fungsi hitung_luas(panjang, lebar=1) yang mengembalikan luas persegi panjang. Uji dengan satu argumen (persegi) dan dua argumen (persegi panjang).",
        prompt: "Kapan parameter default lebih berguna daripada selalu menulis semua argumen secara eksplisit?",
        printGuide: "Baca bagian modul cetak tentang fungsi lanjutan Python. Tandai contoh parameter default dan keyword argument, lalu uji di Playground SIGMA.",
        checks: ["Apa itu parameter default?", "Apa beda argumen posisi dan keyword?", "Kapan pakai *args?", "Mengapa return lebih fleksibel dari print?"],
      },
      "Dictionary & Struktur Data": {
        intro: "Dictionary Python menyimpan data sebagai pasangan kunci-nilai (key-value). Berbeda dengan list yang diakses via indeks angka, dictionary diakses via kunci — lebih deskriptif dan efisien untuk data terstruktur.",
        example: "siswa = {\n    'nama': 'Rizky',\n    'kelas': '9A',\n    'nilai': [85, 90, 78]\n}\n\nprint(siswa['nama'])            # Rizky\nsiswa['xp'] = 500               # tambah key baru\nfor k, v in siswa.items():      # iterasi semua key-value\n    print(k, ':', v)",
        activity: "Buat dictionary untuk tiga buku favoritmu (key: judul, penulis, tahun). Tambahkan key 'rating', lalu cetak semua pasangan key-value menggunakan for loop.",
        prompt: "Kapan lebih baik memakai dictionary daripada list untuk menyimpan data?",
        printGuide: "Baca bagian modul cetak tentang Dictionary Python. Tandai contoh pembuatan, akses, dan iterasi dictionary, lalu praktikkan di Playground SIGMA.",
        checks: ["Apa bedanya dictionary dengan list?", "Bagaimana menambah key baru?", "Apa itu .keys(), .values(), .items()?", "Kapan dictionary lebih efisien dari list?"],
      },
      "Modul Python: random, math, string": {
        intro: "Modul standar Python menyediakan fungsi siap pakai yang memperluas kemampuan program. Tiga modul paling sering dipakai: math untuk matematika, random untuk nilai acak, dan string method untuk manipulasi teks.",
        example: "import math\nimport random\n\nprint(math.sqrt(16))             # 4.0\nprint(math.pi)                   # 3.14159...\nprint(random.randint(1, 100))    # angka acak 1-100\nprint(random.choice(['A','B','C']))  # pilih acak\n\nkata = 'halo dunia'\nprint(kata.upper())              # HALO DUNIA\nprint(kata.split())              # ['halo', 'dunia']",
        activity: "Gunakan random untuk membuat soal kuis matematika: angka acak 1-20, operasi acak (+/-), minta input jawaban, lalu cek kebenarannya dengan if/else.",
        prompt: "Mengapa lebih efisien memakai modul standar daripada menulis fungsi matematika atau pengacak dari nol?",
        printGuide: "Baca bagian modul cetak tentang modul Python. Coba minimal 3 fungsi dari math dan 2 dari random, lalu catat hasilnya.",
        checks: ["Apa fungsi math.sqrt dan math.pi?", "Bagaimana random.randint berbeda dari random.choice?", "Apa itu .upper() dan .split()?", "Kapan from math import sqrt vs import math?"],
      },
      "Bubble Sort": {
        intro: "Bubble Sort adalah algoritma pengurutan yang membandingkan dua elemen berdekatan dan menukar posisinya jika tidak berurutan. Proses ini diulang sampai seluruh list terurut dari kecil ke besar.",
        example: "def bubble_sort(data):\n    n = len(data)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if data[j] > data[j+1]:             # bandingkan\n                data[j], data[j+1] = data[j+1], data[j]  # tukar\n    return data\n\nnilai = [64, 34, 25, 12, 22, 11, 90]\nprint(bubble_sort(nilai))  # [11, 12, 22, 25, 34, 64, 90]",
        activity: "Implementasikan Bubble Sort lalu tambahkan counter untuk menghitung total swap pada list [5, 3, 8, 1, 9, 2]. Berapa swap yang terjadi?",
        prompt: "Mengapa Bubble Sort disebut 'bubble'? Bagaimana elemen besar 'mengapung' ke posisinya?",
        printGuide: "Baca bagian modul cetak tentang Bubble Sort. Ikuti trace manual langkah demi langkah, lalu implementasikan di Playground SIGMA.",
        checks: ["Berapa loop yang dibutuhkan Bubble Sort?", "Apa kondisi pertukaran dua elemen?", "Mengapa loop dalam berhenti di n-i-1?", "Kapan Bubble Sort paling lambat?"],
      },
      "Linear & Binary Search": {
        intro: "Linear Search memeriksa elemen satu per satu dari awal hingga menemukan target — cocok untuk data tidak terurut. Binary Search membelah data terurut menjadi dua setiap langkah — jauh lebih cepat untuk data besar.",
        example: "def linear_search(data, target):\n    for i, item in enumerate(data):\n        if item == target:\n            return i\n    return -1\n\ndef binary_search(data, target):\n    kiri, kanan = 0, len(data) - 1\n    while kiri <= kanan:\n        tengah = (kiri + kanan) // 2\n        if data[tengah] == target: return tengah\n        elif data[tengah] < target: kiri = tengah + 1\n        else: kanan = tengah - 1\n    return -1\n\ndata = [11, 12, 22, 25, 34, 64, 90]\nprint(binary_search(data, 25))  # 3",
        activity: "Implementasikan kedua algoritma. Uji pada list 10 elemen, hitung berapa langkah yang dibutuhkan masing-masing untuk menemukan angka yang sama.",
        prompt: "Mengapa Binary Search hanya bekerja pada data terurut, sedangkan Linear Search bisa pada data acak?",
        printGuide: "Baca bagian modul cetak tentang algoritma pencarian. Trace manual Binary Search pada contoh list, lalu implementasikan di Playground SIGMA.",
        checks: ["Apa kompleksitas O(n) vs O(log n)?", "Mengapa Binary Search butuh data terurut?", "Apa yang terjadi jika target tidak ada di list?", "Kapan pilih Linear vs Binary Search?"],
      },
      "Problem Solving Integratif": {
        intro: "Problem Solving Integratif menggabungkan fungsi, dictionary, modul Python, Bubble Sort, dan algoritma searching untuk menyelesaikan satu masalah nyata secara terpadu dalam satu program.",
        example: "import random\n\ndef buat_data(n):\n    return [{'nama': f'Siswa{i}', 'nilai': random.randint(60,100)} for i in range(1, n+1)]\n\ndef cari_siswa(data, nama):\n    for s in data:             # linear search\n        if s['nama'] == nama:\n            return s['nilai']\n    return None\n\ndef urut_nilai(data):\n    return sorted(data, key=lambda s: s['nilai'], reverse=True)\n\ndata = buat_data(10)\nprint('Peringkat 1:', urut_nilai(data)[0])",
        activity: "Buat program Python yang mengintegrasikan: (1) fungsi untuk generate data, (2) dictionary untuk tiap record, (3) sorting untuk mengurutkan, (4) searching untuk mencari data. Tema bebas.",
        prompt: "Bagaimana kamu memilih struktur data (list vs dictionary) dan algoritma (sorting/searching) yang paling tepat untuk satu masalah?",
        printGuide: "Baca bagian proyek integratif di modul cetak. Identifikasi komponen Python yang paling cocok untuk setiap bagian masalah, lalu kerjakan di Playground.",
        checks: ["Kapan pakai list vs dictionary?", "Bagaimana sorted() berbeda dari bubble_sort buatan sendiri?", "Fungsi apa yang perlu dibuat?", "Bagaimana menguji setiap bagian secara terpisah?"],
      },
    };
    const item = pythonAdv[topic] || pythonAdv["Fungsi Lanjutan & Parameter"];
    return {
      title: `${topic}: Python Lanjutan`,
      intro: item.intro,
      printGuide: item.printGuide,
      prompt: item.prompt,
      blocks: [
        { label: "Konsep Python", text: item.intro },
        { label: "Contoh Kode", text: item.example },
        { label: "Refleksi", text: "Coba ketik ulang contoh kode di Playground SIGMA. Modifikasi satu bagian kecil — misalnya nilai parameter atau isi list — lalu amati apa yang berubah." },
      ],
      activity: item.activity,
      checks: item.checks,
    };
  }

  const curatedLesson = getCuratedModuleLesson(mod, topic);
  if (curatedLesson) return curatedLesson;

  const topicLower = topic.toLowerCase();
  let concept = `Pada pelajaran ini, kamu fokus pada ${topicLower} sebagai bagian dari modul ${mod.title}. Perhatikan istilah penting, contoh nyata, dan hubungan topik ini dengan aktivitas digital sehari-hari.`;
  let example = `Contoh sederhana: ambil satu situasi di sekolah atau rumah, lalu cari bagian yang berhubungan dengan ${topicLower}. Dari sana, kamu bisa melihat bahwa Informatika bukan hanya komputer, tetapi cara berpikir dan mengambil keputusan.`;
  let reflection = `Setelah membaca, coba jelaskan kembali ${topicLower} dengan bahasamu sendiri. Jika belum bisa menjelaskan secara singkat, berarti bagian itu perlu dicoba lagi lewat aktivitas atau diskusi.`;
  let activity = `Tuliskan satu contoh ${topicLower} yang pernah kamu temui, lalu jelaskan mengapa contoh itu penting.`;
  let printGuide = `Ambil modul cetak ${mod.title}. Baca bagian yang membahas ${topicLower}, lalu garis bawahi 2 istilah penting dan 1 contoh yang paling dekat dengan pengalamanmu.`;
  let prompt = `Mengapa ${topicLower} penting untuk dipahami siswa SMP saat memakai teknologi?`;

  if (topicLower.includes("data") || topicLower.includes("atribut") || topicLower.includes("tabel") || topicLower.includes("filter") || topicLower.includes("sortir") || topicLower.includes("grafik")) {
    concept = `${topic} membantu kita mengubah kumpulan fakta menjadi informasi yang lebih mudah dibaca. Data yang rapi membuat pencarian, perbandingan, dan pengambilan kesimpulan jadi lebih masuk akal.`;
    example = "Misalnya data nilai, kehadiran, atau hasil survei kelas. Saat disusun dalam tabel, kita bisa melihat siapa yang perlu bantuan, pola apa yang muncul, dan keputusan apa yang perlu diambil.";
    activity = "Buat tabel kecil berisi 5 teman, 3 atribut, lalu coba urutkan atau kelompokkan datanya.";
    printGuide = `Baca bagian modul cetak tentang ${topicLower}. Tandai contoh tabel atau himpunan data, lalu tulis atribut apa saja yang digunakan.`;
    prompt = "Kalau data disusun asal-asalan, keputusan apa yang bisa menjadi keliru?";
  } else if (topicLower.includes("hoaks") || topicLower.includes("fakta") || topicLower.includes("opini") || topicLower.includes("kredibilitas") || topicLower.includes("sumber")) {
    concept = `${topic} adalah bagian dari literasi digital. Tujuannya bukan hanya menemukan informasi, tetapi menilai apakah informasi itu dapat dipercaya dan aman untuk dibagikan.`;
    example = "Saat membaca berita viral, cek siapa pembuatnya, kapan diterbitkan, apakah ada bukti, dan apakah sumber lain yang tepercaya mengatakan hal serupa.";
    activity = "Ambil satu judul berita atau unggahan, lalu tandai bagian yang berupa fakta, opini, dan klaim yang perlu dicek.";
    printGuide = `Baca bagian modul cetak tentang ${topicLower}. Cari satu contoh klaim atau informasi, lalu beri tanda: fakta, opini, atau perlu dicek lagi.`;
    prompt = "Mengapa orang bisa percaya informasi yang belum terbukti benar?";
  } else if (topicLower.includes("privasi") || topicLower.includes("password") || topicLower.includes("phishing") || topicLower.includes("keamanan") || topicLower.includes("akun")) {
    concept = `${topic} berkaitan dengan cara melindungi diri, akun, dan data pribadi. Keamanan digital dimulai dari kebiasaan kecil yang dilakukan konsisten.`;
    example = "Contohnya memakai password unik, memeriksa alamat situs sebelum login, tidak membagikan kode OTP, dan membatasi izin aplikasi.";
    activity = "Periksa satu akun digitalmu: apakah password-nya unik, verifikasi dua langkah aktif, dan email pemulihan masih benar?";
    printGuide = `Baca bagian modul cetak tentang ${topicLower}. Buat daftar 3 kebiasaan aman yang sudah kamu lakukan dan 1 kebiasaan yang perlu diperbaiki.`;
    prompt = "Data pribadi apa yang paling sering dibagikan siswa tanpa sadar?";
  } else if (topicLower.includes("pseudocode") || topicLower.includes("flowchart") || topicLower.includes("percabangan") || topicLower.includes("perulangan") || topicLower.includes("algoritma")) {
    concept = `${topic} membantu kita menyusun langkah solusi sebelum membuat program. Dengan rancangan yang jelas, kesalahan logika lebih mudah ditemukan.`;
    example = "Misalnya aturan masuk perpustakaan: jika membawa kartu, siswa boleh meminjam buku; jika tidak, siswa perlu konfirmasi ke petugas. Aturan seperti ini bisa ditulis sebagai pseudocode.";
    activity = "Tulis 5 langkah algoritma untuk aktivitas sederhana, lalu tandai bagian yang memakai pilihan jika/maka.";
    printGuide = `Baca bagian modul cetak tentang ${topicLower}. Salin satu contoh langkah kerja, lalu ubah menjadi daftar instruksi bernomor.`;
    prompt = "Apa bedanya instruksi yang jelas dengan instruksi yang hanya terasa jelas bagi pembuatnya?";
  } else if (topicLower.includes("internet") || topicLower.includes("jaringan") || topicLower.includes("router") || topicLower.includes("ip")) {
    concept = `${topic} menjelaskan bagaimana perangkat saling bertukar data. Internet bekerja karena banyak perangkat mengikuti aturan komunikasi yang sama.`;
    example = "Saat membuka halaman web, permintaan dari perangkatmu melewati jaringan lokal, router, penyedia internet, lalu menuju server sebelum jawabannya kembali.";
    activity = "Gambarkan jalur data dari HP ke sebuah situs web: perangkat, WiFi/router, internet, server, lalu kembali ke perangkat.";
    printGuide = `Baca bagian modul cetak tentang ${topicLower}. Buat sketsa alur data dari perangkatmu menuju layanan internet yang sering kamu pakai.`;
    prompt = "Mengapa koneksi internet bisa lambat padahal perangkat kita terlihat baik-baik saja?";
  }

  return {
    title: `${topic}: ${mod.title}`,
    intro: concept,
    printGuide,
    prompt,
    blocks: [
      { label: "Konsep Inti", text: concept },
      { label: "Contoh Nyata", text: example },
      { label: "Refleksi", text: reflection },
    ],
    activity,
    checks: [
      `Jelaskan ${topicLower} dengan kalimat sendiri.`,
      "Sebutkan satu contoh nyata.",
      "Apa risiko jika topik ini diabaikan?",
      `Bagaimana ${topicLower} membantu kegiatan belajar?`,
    ],
  };
}

// ============================================================
// Dynamic per-topic comprehension generator
// Activities are built from the ACTIVE topic title (keyword match)
// + a lesson-specific question, so every lesson differs.
// ============================================================

function capText(s, n) { return s && s.length > n ? s.slice(0, n - 1) + "…" : (s || ""); }

// Activity builders (compatible with existing InteractiveQuestCard kinds)
function mkChoice(title, question, options, answer) {
  return { type: "interactive", kind: "choice", title, reason: "Pilih satu jawaban yang paling tepat.", question, options, answer };
}
function mkClassify(title, instruction, map) {
  return { type: "interactive", kind: "classify", title, reason: instruction, choices: [...new Set(Object.values(map))], items: Object.keys(map), answer: map };
}
function mkSequence(title, instruction, steps) {
  return { type: "interactive", kind: "sequence", title, reason: instruction, steps, answer: [...steps] };
}
function mkChecklist(title, reason, items) {
  return { type: "interactive", kind: "checklist", title, reason, items };
}
function mkExplain(title, question, keywords) {
  return {
    type: "interactive",
    kind: "explain",
    title,
    reason: "Tulis jawaban singkat dengan contoh atau alasan. Ini melatih pemahaman, bukan sekadar memilih.",
    question,
    keywords,
  };
}

// Topic keyword buckets — ORDER MATTERS (specific → generic).
// Each bucket: test(topicLower) + summary[] (extra context) + pool[] (activities, rotated per lesson).
const TOPIC_BUCKETS = [
  { test: t => /dekomposisi|problem solving|pemecahan masalah|memecah/.test(t),
    summary: ["Dekomposisi berarti memecah masalah besar menjadi bagian-bagian kecil yang lebih mudah ditangani.", "Setiap bagian dianalisis satu per satu, lalu solusinya disusun bertahap dan diuji."],
    pool: [
      mkChoice("Tujuan Dekomposisi", "Apa tujuan utama dekomposisi masalah?", ["Memecah masalah besar menjadi bagian kecil yang lebih mudah diselesaikan", "Menghapus semua bagian masalah yang sulit", "Menebak jawaban tanpa analisis", "Membuat masalah menjadi lebih panjang"], 0),
      mkSequence("Alur Dekomposisi", "Susun urutan berpikir dekomposisi yang tepat.", ["Memahami masalah utama", "Memecah masalah jadi bagian kecil", "Menganalisis setiap bagian", "Menyusun solusi bertahap", "Menguji solusi"]),
      mkClassify("Bagian Masalah atau Langkah Solusi?", "Klasifikasikan tiap contoh berikut.", { "Data belum lengkap": "Bagian masalah", "Mencari sumber data tambahan": "Langkah solusi", "Instruksi masih membingungkan": "Bagian masalah", "Membuat urutan kerja": "Langkah solusi" }),
    ] },
  { test: t => /abstraksi/.test(t),
    summary: ["Abstraksi berarti memilih informasi penting dan mengabaikan detail yang tidak perlu.", "Tujuannya agar solusi fokus pada inti masalah."],
    pool: [
      mkChoice("Arti Abstraksi", "Apa inti dari abstraksi?", ["Memilih informasi penting dan mengabaikan detail yang tidak perlu", "Menambahkan sebanyak mungkin detail", "Menghapus seluruh informasi", "Menyalin semua data apa adanya"], 0),
      mkClassify("Penting atau Bisa Diabaikan?", "Saat membuat denah dari gerbang ke perpustakaan, klasifikasikan detail berikut.", { "Titik awal dan tujuan": "Penting", "Arah belok di koridor": "Penting", "Warna sepatu teman": "Bisa diabaikan", "Cuaca hari ini": "Bisa diabaikan" }),
    ] },
  { test: t => /\bpola\b|pattern|pengenalan pola/.test(t),
    summary: ["Pengenalan pola adalah menemukan kesamaan atau pengulangan dari beberapa contoh.", "Pola membantu kita menebak aturan dan membuat prediksi sederhana."],
    pool: [
      mkChoice("Arti Pola", "Apa yang dimaksud mengenali pola?", ["Menemukan kesamaan atau pengulangan dari beberapa kejadian", "Menghafal satu kejadian saja", "Mengabaikan data yang berulang", "Menebak tanpa membandingkan"], 0),
      mkClassify("Pola atau Bukan Pola?", "Klasifikasikan tiap pernyataan.", { "Terlambat setiap hari Senin": "Pola", "Nilai naik setelah rutin berlatih": "Pola", "Satu kali banjir tahun lalu": "Bukan pola / perlu data" }),
      mkSequence("Menemukan Pola", "Susun langkah menemukan pola dari data.", ["Kumpulkan beberapa contoh", "Bandingkan persamaan & perbedaan", "Temukan pengulangan", "Simpulkan aturan pola", "Uji dengan contoh baru"]),
    ] },
  { test: t => /jaringan|internet|topologi|\blan\b|\bwan\b|tcp|\bip\b|router|koneksi|nirkabel/.test(t),
    summary: ["Jaringan menghubungkan perangkat agar dapat bertukar data.", "Data bergerak dari perangkat → router → ISP → server, lalu kembali sebagai respons.", "Gangguan koneksi bisa berasal dari perangkat, jaringan, atau server."],
    pool: [
      mkChoice("Fungsi Jaringan", "Apa fungsi utama jaringan komputer?", ["Menghubungkan perangkat agar dapat bertukar data", "Menghapus data dari komputer", "Membuat komputer tidak butuh listrik", "Mengubah komputer jadi server selamanya"], 0),
      mkSequence("Perjalanan Data", "Susun alur saat pengguna membuka sebuah website.", ["Pengguna mengetik alamat website", "Permintaan dikirim lewat jaringan", "Server menerima permintaan", "Server mengirim respons", "Halaman tampil di perangkat"]),
      mkClassify("Sumber Gangguan Koneksi", "Klasifikasikan penyebab gangguan berikut.", { "Wi-Fi laptop mati": "Perangkat", "Router rumah bermasalah": "Jaringan", "Website sedang down": "Server" }),
      mkClassify("Jenis Jaringan", "Cocokkan tiap contoh dengan jenis jaringannya.", { "Komputer satu lab sekolah terhubung": "LAN (lokal)", "Jaringan antar kota atau negara": "WAN (luas)", "Antar perangkat lewat Bluetooth": "PAN (pribadi)" }),
    ] },
  { test: t => /mesin pencari|pencarian|search|kata kunci|sift|kredibilitas|sumber|sintesis informasi/.test(t),
    summary: ["Mesin pencari mencocokkan kata kunci dengan halaman yang sudah diindeks.", "Kata kunci spesifik dan evaluasi sumber membuat hasil lebih relevan dan tepercaya."],
    pool: [
      mkChoice("Kata Kunci Efektif", "Kata kunci paling efektif untuk mencari 'dampak sampah plastik di sekolah' adalah...", ["dampak sampah plastik sekolah", "semua hal yang ada di dunia", "gambar lucu tempat sampah", "plastik bagus sekali menurutku"], 0),
      mkClassify("Sumber Tepercaya atau Perlu Dicek?", "Klasifikasikan tiap ciri sumber.", { "Penulis dan tanggal jelas": "Tepercaya", "Ada rujukan atau data pendukung": "Tepercaya", "Judul bombastis tanpa bukti": "Perlu dicek", "Tidak mencantumkan sumber": "Perlu dicek" }),
      mkSequence("Strategi Mencari Informasi", "Susun langkah mencari informasi yang baik.", ["Tentukan pertanyaan/kebutuhan", "Pilih kata kunci spesifik", "Bandingkan beberapa sumber", "Evaluasi kredibilitas", "Catat rujukan"]),
    ] },
  { test: t => /fakta|opini|hoaks|verifikasi|berita|disinformasi|misinformasi|kritis/.test(t),
    summary: ["Fakta dapat dibuktikan dengan data atau sumber yang jelas.", "Opini adalah pendapat atau penilaian pribadi.", "Hoaks adalah informasi menyesatkan yang perlu diverifikasi sebelum dipercaya atau dibagikan."],
    pool: [
      mkChoice("Ciri Fakta", "Ciri utama fakta adalah...", ["Dapat dibuktikan dengan data atau sumber yang jelas", "Selalu berupa pendapat pribadi", "Tidak perlu diverifikasi", "Selalu viral di media sosial"], 0),
      mkClassify("Fakta, Opini, atau Perlu Verifikasi?", "Klasifikasikan tiap pernyataan.", { "Sekolah masuk pukul 07.00 sesuai jadwal resmi": "Fakta", "Informatika pelajaran paling menyenangkan": "Opini", "Pesan berantai tanpa sumber yang jelas": "Perlu Verifikasi" }),
      mkSequence("Langkah Verifikasi", "Susun langkah memverifikasi sebuah informasi.", ["Berhenti sebelum membagikan", "Periksa sumber asli", "Bandingkan dengan sumber tepercaya lain", "Cek tanggal dan konteks", "Simpulkan benar atau menyesatkan"]),
    ] },
  { test: t => /privasi|keamanan|password|sandi|phishing|2fa|otp|malware|data pribadi|jejak|reputasi|cyberbully|perundungan|psikologis|pelaporan|pencegahan|perlindungan|netiket|etika|autentikasi|identitas digital|deepfake|\bpdp\b|\buu\b|ancaman/.test(t),
    summary: ["Etika digital berarti sopan, menjaga privasi, dan bertanggung jawab di ruang online.", "Jejak digital bisa tersimpan dan tersebar, jadi pikirkan dampak sebelum mengunggah.", "Keamanan akun dimulai dari kebiasaan: password unik, verifikasi dua langkah, dan tidak membagi OTP."],
    pool: [
      mkChoice("Kebiasaan Aman", "Kebiasaan keamanan digital yang tepat adalah...", ["Memakai password unik dan tidak membagikan OTP", "Memakai satu password untuk semua akun", "Mengeklik semua tautan hadiah", "Membagikan kode OTP ke teman"], 0),
      mkClassify("Aman atau Berisiko?", "Klasifikasikan tiap tindakan.", { "Mengaktifkan verifikasi dua langkah (2FA)": "Aman", "Membagikan foto kartu pelajar di status": "Berisiko", "Mengecek alamat situs sebelum login": "Aman", "Memakai password 12345 untuk semua akun": "Berisiko" }),
      mkClassify("Data Pribadi atau Bukan?", "Klasifikasikan tiap data berikut.", { "Nomor telepon": "Data pribadi", "Lokasi rumah": "Data pribadi", "Warna favorit": "Bukan data pribadi" }),
      mkChoice("Menghadapi Perundungan Siber", "Jika melihat perundungan di grup kelas, tindakan paling aman adalah...", ["Simpan bukti, jangan membalas, lalu lapor orang dewasa tepercaya", "Membalas dengan hinaan lebih keras", "Menyebarkan tangkapan layarnya ke grup lain", "Diam dan ikut menertawakan"], 0),
      mkClassify("Jejak Digital: Aktif atau Pasif?", "Jejak aktif kita buat sengaja; jejak pasif terekam tanpa sadar. Klasifikasikan.", { "Mengunggah foto ke media sosial": "Jejak aktif", "Menulis komentar di forum": "Jejak aktif", "Riwayat pencarian terekam otomatis": "Jejak pasif", "Lokasi terlacak aplikasi di latar belakang": "Jejak pasif" }),
      mkChoice("Mengelola Reputasi Digital", "Cara menjaga reputasi digital yang baik adalah...", ["Berpikir sebelum mengunggah dan menjaga jejak yang positif", "Mengunggah apa saja karena bisa dihapus kapan pun", "Membagikan data pribadi agar terlihat terbuka", "Mengomentari semua orang dengan kasar"], 0),
      mkSequence("Langkah Pelaporan", "Susun langkah aman saat menghadapi perundungan siber.", ["Jangan membalas", "Simpan bukti (tangkapan layar)", "Blokir pelaku bila perlu", "Lapor ke orang dewasa tepercaya", "Dampingi/ dukung korban"]),
      mkChoice("Perlindungan Data Pribadi", "Langkah perlindungan data pribadi yang tepat adalah...", ["Membatasi izin aplikasi dan tidak mengumbar identitas", "Memberi semua izin agar aplikasi lancar", "Memakai nama asli dan alamat di profil publik", "Mengirim foto KTP ke akun tak dikenal"], 0),
    ] },
  { test: t => /mindfulness|screen time|fomo|detox|kesejahteraan|seimbang|keseimbangan|interpersonal|penggunaan sehat|batasan penggunaan|kebiasaan digital|digital sehat|mental/.test(t),
    summary: ["Kesejahteraan digital berarti memakai teknologi dengan sadar agar tetap mendukung belajar, relasi, dan kesehatan.", "Batas waktu, kontrol notifikasi, dan jeda layar membantu menjaga fokus dan keseimbangan."],
    pool: [
      mkChoice("Arti Mindfulness Digital", "Mindfulness digital berarti...", ["Memakai gawai secara sadar, sesuai tujuan dan batas waktu", "Menjauhi semua teknologi selamanya", "Memakai gawai tanpa henti", "Mematikan internet untuk orang lain"], 0),
      mkChoice("Dampak Screen Time Berlebih", "Screen time berlebihan terutama dapat...", ["Mengganggu fokus, tidur, dan keseimbangan kegiatan", "Membuat baterai lebih awet", "Mempercepat internet", "Menambah ruang penyimpanan"], 0),
      mkChoice("FOMO & Digital Detox", "Digital detox adalah...", ["Jeda sengaja dari gawai untuk memulihkan fokus dan keseimbangan", "Menghapus semua foto", "Membeli gawai baru", "Menambah waktu bermain game"], 0),
      mkClassify("Kebiasaan Sehat atau Tidak?", "Klasifikasikan tiap kebiasaan digital.", { "Menetapkan batas waktu layar": "Sehat", "Mengecek HP setiap menit": "Tidak sehat", "Mematikan notifikasi saat belajar": "Sehat", "Bermain gawai sampai larut malam": "Tidak sehat" }),
      mkChoice("Hubungan Interpersonal", "Agar teknologi tidak mengganggu hubungan dengan orang sekitar...", ["Sediakan waktu tanpa gawai saat bersama keluarga/teman", "Selalu menatap layar saat mengobrol", "Membalas semua notifikasi seketika", "Mengabaikan orang di sekitar demi gawai"], 0),
    ] },
  { test: t => /\bka\b|\bai\b|kecerdasan|artifisial|generatif|chatgpt|gemini|copilot|halusinasi|bias|prompt|dataset|data latih|training|model|machine|neural|klasifikasi|confusion/.test(t),
    summary: ["AI bekerja berdasarkan data dan pola, bukan benar-benar 'memahami'.", "Output AI bisa keliru, bias, atau halusinatif sehingga perlu diperiksa ulang.", "Penggunaan AI harus jujur, kritis, dan bertanggung jawab."],
    pool: [
      mkChoice("Memeriksa Output AI", "Mengapa jawaban AI tetap perlu diperiksa ulang?", ["Karena AI dapat menghasilkan jawaban keliru atau tidak sesuai konteks", "Karena AI selalu benar", "Karena AI tidak menggunakan data", "Karena AI hanya bisa menjawab matematika"], 0),
      mkClassify("Risiko Penggunaan AI", "Klasifikasikan tiap risiko AI berikut.", { "AI mengarang sumber yang tidak ada": "Halusinasi", "AI lebih sering memberi contoh dari satu kelompok saja": "Bias", "Memasukkan data pribadi ke chatbot": "Privasi", "Menyalin jawaban AI tanpa memahami": "Ketergantungan" }),
      mkChoice("Cara Kerja AI", "AI belajar mengenali sesuatu terutama dari...", ["Banyak contoh data dan pola di dalamnya", "Tebakan acak tanpa data", "Satu contoh saja", "Perintah manual untuk tiap kasus"], 0),
      mkChoice("AI yang Bertanggung Jawab", "Sikap paling tepat memakai AI untuk tugas sekolah adalah...", ["Memakai AI sebagai bantuan, lalu memverifikasi dan memahaminya sendiri", "Menyalin mentah jawaban AI sebagai milik sendiri", "Memercayai semua jawaban AI tanpa dicek", "Memasukkan data pribadi teman ke AI"], 0),
      mkChoice("Halusinasi AI", "Yang dimaksud 'halusinasi' pada AI adalah...", ["AI memberi jawaban yang terdengar meyakinkan tetapi sebenarnya keliru atau mengarang", "AI mati mendadak", "AI menolak menjawab", "AI berjalan terlalu lambat"], 0),
      mkChoice("Bias AI & Data Latih", "Bias pada AI biasanya muncul karena...", ["Data latih tidak beragam atau tidak mewakili semua kelompok", "AI terlalu sering dimatikan", "Koneksi internet lambat", "Layar komputer terlalu terang"], 0),
      mkChoice("Prompt yang Baik", "Prompt (perintah) yang baik untuk AI sebaiknya...", ["Jelas, spesifik, dan menyertakan konteks yang dibutuhkan", "Sesingkat mungkin tanpa konteks", "Sengaja dibuat ambigu", "Berisi data pribadi orang lain"], 0),
      mkClassify("Data Latih Berkualitas", "Tentukan apakah tiap kondisi data latih baik atau berisiko.", { "Contoh beragam dari banyak kelompok": "Baik", "Hanya satu jenis contoh saja": "Berisiko", "Data berlabel dan akurat": "Baik", "Data lama dan tidak relevan": "Berisiko" }),
    ] },
  { test: t => /biner|pixel|piksel|\bwarna\b|representasi gambar|encoding|kode warna/.test(t),
    summary: ["Komputer menyimpan segala sesuatu sebagai angka, khususnya biner (0 dan 1).", "Gambar digital tersusun dari pixel; tiap pixel memiliki kode warna (misalnya RGB)."],
    pool: [
      mkChoice("Dasar Representasi", "Komputer pada dasarnya menyimpan data dalam bentuk...", ["Angka biner: kombinasi 0 dan 1", "Huruf latin saja", "Gambar berwarna langsung", "Suara analog"], 0),
      mkClassify("Representasi Digital", "Cocokkan tiap istilah dengan maknanya.", { "Titik kecil penyusun gambar": "Pixel", "Kombinasi 0 dan 1": "Biner", "Kode merah-hijau-biru": "Warna (RGB)" }),
    ] },
  { test: t => /terstruktur|struktur data|\blist\b|dictionary|\bstack\b|\bqueue\b|\btree\b|\bgraf\b|lifo|fifo|variabel|bubble|searching|sorting algoritma/.test(t),
    summary: ["Struktur data menentukan cara menyimpan dan mengakses informasi (list, dictionary, stack, queue).", "Pemilihan struktur yang tepat membuat program lebih rapi dan efisien."],
    pool: [
      mkChoice("List vs Dictionary", "Untuk menyimpan profil siswa (nama, kelas, nilai), struktur paling tepat adalah...", ["Dictionary (pasangan kunci-nilai)", "List berisi angka acak", "Satu variabel teks panjang", "Tidak perlu struktur data"], 0),
      mkClassify("List atau Dictionary?", "Klasifikasikan kebutuhan berikut.", { "Daftar nama siswa berurutan": "List", "Profil: nama, kelas, nilai": "Dictionary", "Urutan langkah algoritma": "List", "Pemetaan kode kelas ke wali kelas": "Dictionary" }),
      mkChoice("Prinsip Stack", "Stack bekerja dengan prinsip...", ["LIFO: terakhir masuk, pertama keluar", "FIFO: pertama masuk, pertama keluar", "Acak tanpa aturan", "Selalu diambil dari tengah"], 0),
      mkSequence("Operasi Stack (LIFO)", "Susun urutan operasi Stack yang benar.", ["Buat stack kosong", "push item pertama", "push item kedua", "peek lihat item teratas", "pop keluarkan item teratas"]),
      mkChoice("Prinsip Queue", "Queue bekerja dengan prinsip...", ["FIFO: pertama masuk, pertama keluar", "LIFO: terakhir masuk, pertama keluar", "Acak tanpa aturan", "Tidak memiliki urutan"], 0),
      mkChoice("Konsep Tree", "Struktur Tree paling tepat digunakan untuk...", ["Menyimpan data berjenjang seperti silsilah atau struktur folder", "Menyimpan satu angka tunggal", "Mengacak data tanpa hubungan", "Menggantikan semua list"], 0),
      mkClassify("Bagian Tree", "Cocokkan istilah Tree dengan maknanya.", { "Simpul paling atas": "Root (akar)", "Simpul tanpa anak": "Leaf (daun)", "Simpul di atas sebuah simpul": "Parent (induk)" }),
      mkChoice("Konsep Graf", "Graf terdiri dari...", ["Simpul (vertex) dan sisi (edge) yang menghubungkannya", "Hanya satu baris angka", "Kolom dan baris seperti tabel saja", "Tumpukan tanpa hubungan"], 0),
      mkClassify("Pilih Struktur Data", "Cocokkan kebutuhan dengan struktur yang paling tepat.", { "Antrean cetak dokumen": "Queue (FIFO)", "Tombol Undo di aplikasi": "Stack (LIFO)", "Struktur folder bertingkat": "Tree", "Peta rute antar kota": "Graf" }),
      mkChoice("Konsep Variabel", "Variabel dalam program berfungsi untuk...", ["Menyimpan nilai yang bisa dipakai dan diubah selama program berjalan", "Menghapus semua data otomatis", "Mempercepat internet", "Mengganti nama file"], 0),
    ] },
  { test: t => /\bdata\b|tabel|spreadsheet|atribut|filter|sorting|grafik|visualisasi|pivot|vlookup|dashboard|analisis data/.test(t),
    summary: ["Data yang tersusun rapi memudahkan pencarian, perbandingan, dan penarikan kesimpulan.", "Spreadsheet memakai formula, fungsi, filter, dan grafik untuk mengolah serta menyajikan data."],
    pool: [
      mkChoice("Mengapa Data Disusun", "Mengapa data disusun dalam tabel atau grafik?", ["Agar lebih mudah dibaca, dibandingkan, dan dianalisis", "Agar terlihat berwarna saja", "Agar tidak bisa diubah", "Agar ukuran file menjadi kecil"], 0),
      mkClassify("Fitur Spreadsheet yang Tepat", "Cocokkan kebutuhan dengan fiturnya.", { "Menjumlahkan nilai": "Formula", "Menghitung rata-rata": "Fungsi", "Menampilkan tren": "Grafik", "Melihat data kelas 8A saja": "Filter" }),
      mkChoice("Atribut Data", "Contoh 'atribut' yang baik pada data siswa adalah...", ["Nama, kelas, dan nilai", "Suasana ruangan", "Warna dinding kelas", "Judul lagu tanpa konteks"], 0),
      mkSequence("Siklus Analisis Data", "Susun urutan menganalisis data.", ["Kumpulkan data", "Susun dan bersihkan data", "Olah dengan formula/fungsi", "Visualkan dengan grafik", "Tarik kesimpulan"]),
      mkChoice("Fungsi Filter", "Filter pada spreadsheet berguna untuk...", ["Menampilkan hanya data yang memenuhi kriteria tertentu", "Menghapus semua data", "Mengganti warna sel", "Membuat rumus otomatis"], 0),
      mkChoice("Memilih Grafik", "Grafik batang paling cocok untuk...", ["Membandingkan jumlah antar kategori", "Menampilkan satu angka tunggal", "Menulis paragraf panjang", "Menyembunyikan data"], 0),
      mkChoice("Pivot Table", "Pivot Table berguna untuk...", ["Merangkum dan mengelompokkan data secara otomatis", "Menghapus kolom", "Membuat animasi", "Mengunci file"], 0),
      mkChoice("Sorting Data", "Mengurutkan (sorting) data membantu...", ["Menemukan nilai tertinggi/terendah dan pola lebih cepat", "Menghapus data ganda otomatis", "Mengubah isi angka", "Memperbesar ukuran file"], 0),
    ] },
  { test: t => /komputer|input|proses|output|\bcpu\b|hardware|software|perangkat keras|perangkat lunak|memori|penyimpanan|fetch/.test(t),
    summary: ["Komputer bekerja dengan pola: input → proses → output, dan dapat menyimpan data.", "Perangkat keras bisa disentuh; perangkat lunak berupa program atau instruksi."],
    pool: [
      mkClassify("Peran Komponen", "Klasifikasikan peran tiap komponen.", { "Keyboard": "Input", "CPU": "Proses", "Monitor": "Output", "SSD": "Penyimpanan" }),
      mkChoice("Hardware vs Software", "Pasangan yang tepat adalah...", ["Mouse = perangkat keras, browser = perangkat lunak", "Browser = perangkat keras, mouse = perangkat lunak", "Monitor = perangkat lunak, file = perangkat keras", "Keyboard = perangkat lunak, kabel = program"], 0),
      mkSequence("Cara Kerja Komputer", "Susun alur kerja dasar komputer.", ["Input masuk", "Data diproses", "Hasil ditampilkan (output)", "Data disimpan bila perlu"]),
    ] },
  { test: t => /algoritma|flowchart|pseudocode|instruksi|loop|perulangan|percabangan|if\/else|kondisi|seleksi|scratch|debug/.test(t),
    summary: ["Algoritma adalah urutan langkah yang jelas dan berurutan untuk menyelesaikan masalah.", "Langkah yang baik bisa diikuti orang lain dan diuji, sering mengikuti pola input, proses, output."],
    pool: [
      mkChoice("Ciri Algoritma", "Ciri algoritma yang baik adalah...", ["Langkahnya jelas, berurutan, dan bisa dilakukan orang lain", "Rahasia dan hanya dimengerti pembuatnya", "Sengaja dibuat panjang dan rumit", "Boleh melompati langkah penting"], 0),
      mkSequence("Alur Input-Proses-Output", "Susun urutan kerja program sederhana.", ["Mulai", "Ambil input", "Proses / cek kondisi", "Tampilkan output", "Selesai"]),
      mkClassify("Bagian Program", "Klasifikasikan tiap bagian program.", { "Membaca angka dari pengguna": "Input", "Menghitung rata-rata": "Proses", "Menampilkan hasil di layar": "Output" }),
      mkChoice("Percabangan (IF/ELSE)", "Percabangan if/else dalam program berguna untuk...", ["Membuat keputusan berdasarkan kondisi tertentu", "Mengulang langkah berkali-kali", "Menyimpan data ke memori", "Mengganti warna layar"], 0),
      mkChoice("Perulangan (Loop)", "Perulangan (loop) dipakai ketika...", ["Sebuah langkah perlu diulang sampai kondisi terpenuhi", "Program hanya berjalan satu kali", "Kita ingin menghapus semua data", "Tidak ada langkah yang berulang"], 0),
      mkChoice("Pseudocode", "Pseudocode berguna karena...", ["Membantu merancang logika sebelum menulis kode sesungguhnya", "Langsung dijalankan komputer tanpa diubah", "Menggantikan kebutuhan berpikir", "Hanya untuk menggambar"], 0),
      mkChoice("Debugging", "Debugging adalah proses...", ["Menemukan dan memperbaiki kesalahan dalam program", "Menambah fitur baru", "Mempercepat internet", "Mengubah tampilan antarmuka"], 0),
    ] },
  { test: t => /konten|content|brief|infografis|slide|presentasi|video|audio|desain|storytelling|podcast|multimedia|dokumen|word|publikasi|copyright|lisensi|hak cipta|platform|ekosistem|diseminasi|distribusi|analytics|kampanye|advokasi|audiens|literasi digital/.test(t),
    summary: ["Konten yang baik dimulai dari tujuan dan audiens, bukan dari hiasan.", "Pesan ringkas, visual relevan, dan sumber yang jujur membuat konten efektif dan bertanggung jawab."],
    pool: [
      mkChoice("Langkah Pertama Konten", "Sebelum membuat konten digital, hal pertama yang dipikirkan adalah...", ["Tujuan dan audiens konten", "Warna yang paling mencolok", "Aplikasi yang paling populer", "Durasi sepanjang mungkin"], 0),
      mkSequence("Alur Produksi Konten", "Susun urutan produksi konten.", ["Tentukan tujuan & audiens", "Buat ide / storyboard", "Produksi (rekam / desain)", "Edit", "Publikasikan & evaluasi"]),
      mkClassify("Format yang Tepat", "Cocokkan kebutuhan dengan format kontennya.", { "Langkah singkat dan visual": "Infografis", "Data perbandingan": "Tabel/Grafik", "Penjelasan mendalam": "Dokumen/Teks" }),
      mkChoice("Memilih Platform", "Memilih platform untuk menyebarkan konten sebaiknya berdasarkan...", ["Di mana audiens sasaran paling aktif", "Platform yang paling banyak iklannya", "Yang paling sulit digunakan", "Asal pilih yang sedang viral"], 0),
      mkChoice("Diseminasi Etis", "Menyebarkan (diseminasi) konten secara etis berarti...", ["Jujur, menghormati hak cipta, dan menjaga privasi orang lain", "Menyebar sebanyak mungkin tanpa cek sumber", "Menyalin karya orang tanpa izin", "Membagikan data pribadi orang lain"], 0),
      mkChoice("Membaca Analytics", "Metrik 'watch time' pada analytics menunjukkan...", ["Seberapa lama audiens menonton kontenmu", "Jumlah warna pada video", "Ukuran file konten", "Banyaknya tombol di layar"], 0),
      mkChoice("Analisis Audiens", "Memahami audiens membantu kita...", ["Menyesuaikan pesan, gaya, dan platform agar konten lebih relevan", "Mengabaikan kebutuhan pembaca", "Memilih warna acak", "Membuat konten sepanjang mungkin"], 0),
      mkChoice("Infografis Efektif", "Infografis paling cocok untuk...", ["Menyajikan data atau langkah dalam bentuk visual yang ringkas", "Menulis esai panjang tanpa gambar", "Menyimpan kode rahasia", "Mengganti seluruh laporan teks"], 0),
      mkChoice("Slide Presentasi", "Slide presentasi yang baik sebaiknya...", ["Berisi poin ringkas dengan visual pendukung", "Memuat seluruh naskah kata per kata", "Penuh animasi di setiap elemen", "Memakai font sekecil mungkin agar muat banyak"], 0),
      mkChoice("Produksi Video & Audio", "Dalam video, kualitas audio yang buruk berdampak...", ["Besar — penonton cepat pergi jika suara tidak jelas", "Tidak penting selama gambar bagus", "Hanya berpengaruh pada musik", "Bisa diabaikan sepenuhnya"], 0),
      mkClassify("Lisensi & Hak Cipta", "Tentukan status tiap tindakan konten.", { "Pakai gambar CC-BY dengan menyebut sumber": "Boleh", "Pakai musik berhak cipta tanpa izin": "Melanggar", "Pakai aset CC-0 (domain publik)": "Boleh", "Salin artikel tanpa menyebut penulis": "Melanggar" }),
      mkChoice("Storytelling Digital", "Storytelling yang kuat dalam konten berarti...", ["Menyusun pesan dengan alur yang jelas agar mudah dipahami & diingat", "Menambahkan sebanyak mungkin efek", "Membuat durasi sepanjang mungkin", "Menghindari struktur sama sekali"], 0),
    ] },
  { test: t => /proyek|projek|sintesis|showcase|portfolio|graduation|pitch/.test(t),
    summary: ["Proyek akhir menggabungkan masalah, data, solusi/algoritma, produk, dan presentasi.", "Proyek yang kuat dimulai dari masalah yang jelas, lalu teknologi dipilih sebagai solusi."],
    pool: [
      mkSequence("Alur Proyek", "Susun urutan mengerjakan proyek dari awal sampai akhir.", ["Pilih masalah bermakna", "Kumpulkan data / bahan", "Rancang dan buat solusi", "Uji dan perbaiki", "Dokumentasikan & presentasikan"]),
      mkChoice("Memulai Proyek", "Proyek yang kuat sebaiknya dimulai dari...", ["Masalah nyata yang jelas", "Memilih alat tercanggih lebih dulu", "Tampilan yang paling ramai", "Meniru proyek lain apa adanya"], 0),
      mkClassify("Komponen Proyek", "Cocokkan bagian proyek dengan perannya.", { "Pertanyaan yang ingin dijawab": "Masalah", "Bukti & angka pendukung": "Data", "Hasil yang dibuat siswa": "Produk", "Menyampaikan hasil ke audiens": "Presentasi" }),
      mkChoice("Saat Data Membantah Ide", "Jika data proyek tidak mendukung ide awal, sikap paling ilmiah adalah...", ["Merevisi solusi atau kesimpulan mengikuti data", "Mengubah data agar sesuai ide", "Menghapus data yang mengganggu", "Mengabaikan data dan tetap memakai pendapat"], 0),
      mkChoice("Isi Evaluasi Proyek", "Bagian evaluasi proyek sebaiknya memuat...", ["Apa yang berhasil, bukti hasil, kendala, dan rencana perbaikan", "Hanya pujian untuk kelompok sendiri", "Daftar warna slide", "Alasan proyek lain tidak perlu dilihat"], 0),
    ] },
];

// Build a topic-SPECIFIC multiple-choice question from the active lesson's concept.
// The correct option is taken from lesson.intro, so it differs per lesson.
function buildLessonChoice(topic, lesson) {
  let correct = (lesson.intro || `${topic} adalah konsep penting yang perlu dipahami dalam modul ini.`).replace(/\s+/g, " ").trim();
  const dot = correct.indexOf(". ");
  if (dot > 25 && dot < 150) correct = correct.slice(0, dot + 1);
  correct = capText(correct, 150);
  const distractors = [
    `${topic} cukup dihafal tanpa perlu dipahami maknanya.`,
    `${topic} tidak berhubungan dengan kegiatan digital sehari-hari.`,
    `${topic} tidak bisa diterapkan untuk menyelesaikan masalah nyata.`,
  ];
  return mkChoice(`Pemahaman: ${topic}`, `Manakah pernyataan yang paling tepat tentang "${topic}"?`, [correct, ...distractors], 0);
}

// Lesson-derived self-check (always names the active topic)
function buildSelfCheck(topic) {
  const t = topic.toLowerCase();
  return mkChecklist(
    `Cek Mandiri: ${topic}`,
    `Centang hal tentang ${t} yang sudah benar-benar kamu pahami.`,
    [`Saya bisa menjelaskan ${t} dengan kata sendiri.`, `Saya bisa memberi satu contoh nyata ${t}.`, `Saya tahu mengapa ${t} penting untuk dipelajari.`]
  );
}

function buildLessonApplicationChoice(topic, lesson) {
  const activity = capText((lesson.activity || "").replace(/\s+/g, " ").trim(), 150);
  if (!activity) return null;
  return mkChoice(
    `Penerapan: ${topic}`,
    `Aktivitas mana yang paling sesuai untuk membuktikan pemahaman tentang "${topic}"?`,
    [
      activity,
      `Menghafal definisi "${topic}" tanpa membuat contoh.`,
      `Membaca judul pelajaran lalu langsung lanjut ke kuis.`,
      `Memilih jawaban acak tanpa menghubungkan dengan materi cetak.`,
    ],
    0
  );
}

function extractLessonKeywords(topic, lesson) {
  const raw = [
    topic,
    lesson.intro || "",
    lesson.activity || "",
    ...((lesson.checks || []).filter(Boolean)),
  ].join(" ").toLowerCase();
  const stop = new Set([
    "agar", "akan", "atau", "bagian", "bisa", "buat", "dalam", "dengan", "dari", "data",
    "dan", "diabaikan", "jika", "kamu", "karena", "kelas", "konsep", "materi", "membantu",
    "menjadi", "mereka", "nyata", "pada", "risiko", "satu", "secara", "sebutkan", "sendiri",
    "siswa", "tanpa", "topik", "untuk", "yang",
  ]);
  return [...new Set(raw.split(/[^a-z0-9]+/).filter(w => w.length >= 5 && !stop.has(w)))].slice(0, 6);
}

function buildLessonExplainChallenge(topic, lesson) {
  const checks = (lesson.checks || []).filter(Boolean).slice(0, 4);
  const coreQuestion = checks[0] || lesson.prompt || `Jelaskan ${topic} dengan contoh yang dekat dengan kehidupanmu.`;
  const followUp = checks[1] ? ` Lanjutkan dengan: ${checks[1]}` : " Sertakan satu contoh nyata atau alasan.";
  return mkExplain(
    `Jawaban Singkat: ${topic}`,
    `${coreQuestion}${followUp}`,
    extractLessonKeywords(topic, lesson)
  );
}

// Topic-specific summary leading line from the active lesson
function lessonSummaryPoints(lesson) {
  const pts = [];
  if (lesson.intro) pts.push(capText(lesson.intro.replace(/\s+/g, " ").trim(), 170));
  (lesson.blocks || []).forEach(b => {
    if (pts.length >= 4 || !b.text) return;
    const raw = b.text.trim();
    if ((raw.match(/\n/g) || []).length > 3) return; // skip code blocks
    const txt = capText(raw.replace(/\s+/g, " "), 150);
    if (!pts.includes(txt)) pts.push(txt);
  });
  if (pts.length < 3) (lesson.checks || []).forEach(c => { if (pts.length < 4 && c && !pts.includes(c)) pts.push(c); });
  return pts.slice(0, 4);
}

function getLessonMasteryNotes(mod, index, lesson) {
  const topic = mod.topics[index] || `Pengayaan ${index + 1}`;
  const tl = topic.toLowerCase();
  const core = [];
  const seen = new Set();
  const addCore = point => {
    const cleaned = capText(String(point || "").replace(/\s+/g, " ").trim(), 135);
    const key = cleaned.toLowerCase().replace(/[^a-z0-9]+/g, " ").slice(0, 72);
    if (!cleaned || seen.has(key)) return;
    seen.add(key);
    core.push(cleaned);
  };
  lessonSummaryPoints(lesson).forEach(addCore);
  (lesson.checks || []).forEach(check => addCore(check));
  while (core.length < 3) {
    const fallback = [
      `Jelaskan ${tl} dengan kalimat sendiri, bukan hanya menghafal istilah.`,
      `Hubungkan ${tl} dengan contoh nyata dari sekolah, rumah, atau ruang digital.`,
      `Gunakan ${tl} untuk mengambil keputusan atau menyelesaikan masalah sederhana.`,
    ][core.length];
    addCore(fallback);
  }
  return {
    core: core.slice(0, 3),
    misconceptions: getCommonMisconceptions(topic, mod).slice(0, 3),
  };
}

function getCommonMisconceptions(topic, mod) {
  const t = `${topic} ${mod.title}`.toLowerCase();
  const packs = [
    {
      test: /dekomposisi|abstraksi|pola|berpikir komputasional|problem solving|pemecahan masalah/.test(t),
      items: [
        "Mengira berpikir komputasional hanya untuk membuat program, padahal bisa dipakai untuk masalah sehari-hari.",
        "Langsung mencari solusi tanpa memecah masalah dan memeriksa data penting terlebih dahulu.",
        "Menganggap semua detail sama pentingnya, sehingga solusi menjadi terlalu rumit.",
      ],
    },
    {
      test: /algoritma|flowchart|pseudocode|instruksi|percabangan|perulangan|scratch|debug|program visual/.test(t),
      items: [
        "Mengira algoritma cukup jelas di kepala, padahal harus bisa diikuti orang lain secara runtut.",
        "Mencampur percabangan dan perulangan: if/else untuk keputusan, loop untuk pengulangan.",
        "Tidak menguji instruksi dengan contoh berbeda, sehingga kesalahan logika baru terlihat belakangan.",
      ],
    },
    {
      test: /data|spreadsheet|tabel|grafik|visualisasi|pivot|vlookup|dashboard|analisis/.test(t),
      items: [
        "Mengira data yang banyak otomatis benar, padahal data perlu rapi, relevan, dan dicek sumbernya.",
        "Memakai grafik karena terlihat menarik, bukan karena cocok dengan pertanyaan data.",
        "Membaca angka tunggal tanpa membandingkan konteks, kategori, atau tren.",
      ],
    },
    {
      test: /list|dictionary|stack|queue|tree|graf|struktur data|sorting|searching|bubble|binary search|linear/.test(t),
      items: [
        "Memakai struktur data yang sama untuk semua masalah, padahal list, dictionary, stack, dan queue punya fungsi berbeda.",
        "Mengira binary search bisa dipakai pada data acak; algoritma ini membutuhkan data yang sudah terurut.",
        "Fokus pada kode, tetapi lupa menelusuri perubahan nilai dan jumlah langkah algoritma.",
      ],
    },
    {
      test: /komputer|input|proses|output|cpu|hardware|software|memori|penyimpanan/.test(t),
      items: [
        "Menyamakan penyimpanan dan memori kerja, padahal keduanya punya peran berbeda.",
        "Mengira software bisa bekerja tanpa hardware, atau hardware berguna tanpa instruksi software.",
        "Melihat komputer hanya sebagai perangkat, bukan sebagai sistem input, proses, output, dan penyimpanan.",
      ],
    },
    {
      test: /jaringan|internet|router|topologi|tcp|ip|koneksi|nirkabel/.test(t),
      items: [
        "Mengira internet adalah satu komputer besar, padahal internet adalah jaringan dari banyak jaringan.",
        "Langsung menyalahkan perangkat saat koneksi gagal, padahal gangguan bisa terjadi di router, ISP, server, atau aplikasi.",
        "Menganggap semua jaringan sama, padahal LAN, WAN, PAN, kabel, dan nirkabel punya konteks penggunaan berbeda.",
      ],
    },
    {
      test: /pencari|search|kata kunci|sift|kredibilitas|sumber|hoaks|fakta|opini|verifikasi|media/.test(t),
      items: [
        "Mengira hasil paling atas di mesin pencari pasti paling benar.",
        "Mencampur fakta dan opini karena keduanya sama-sama ditulis dengan gaya meyakinkan.",
        "Membagikan informasi viral sebelum memeriksa sumber asli, tanggal, konteks, dan bukti pendukung.",
      ],
    },
    {
      test: /privasi|keamanan|password|phishing|otp|malware|jejak|reputasi|cyberbully|perundungan|identitas|data pribadi|pdp|deepfake/.test(t),
      items: [
        "Mengira data pribadi hanya nomor identitas, padahal foto, lokasi, akun, dan kebiasaan online juga bisa sensitif.",
        "Menganggap unggahan bisa hilang total setelah dihapus, padahal jejak digital dapat disalin atau tersimpan.",
        "Merespons perundungan digital dengan balasan emosional, bukan menyimpan bukti dan melapor dengan aman.",
      ],
    },
    {
      test: /mindfulness|screen time|fomo|detox|kesejahteraan|seimbang|digital sehat/.test(t),
      items: [
        "Mengira penggunaan digital sehat berarti berhenti memakai teknologi sepenuhnya.",
        "Mengukur produktivitas dari lamanya waktu online, bukan dari tujuan dan kualitas kegiatannya.",
        "Mengabaikan sinyal tubuh dan relasi sosial saat notifikasi terus mengambil perhatian.",
      ],
    },
    {
      test: /ka|ai|kecerdasan|artifisial|generatif|prompt|halusinasi|bias|dataset|data latih|model|klasifikasi|deepfake/.test(t),
      items: [
        "Mengira AI selalu benar karena jawabannya terdengar rapi dan meyakinkan.",
        "Memasukkan data pribadi ke AI tanpa mempertimbangkan privasi dan jejak data.",
        "Menganggap bias AI berasal dari niat AI, padahal sering muncul dari data latih dan desain sistem.",
      ],
    },
    {
      test: /konten|infografis|slide|presentasi|audio|video|storytelling|hak cipta|lisensi|diseminasi|platform|analytics|audiens|advokasi/.test(t),
      items: [
        "Memulai dari desain yang ramai, bukan dari tujuan, audiens, dan pesan utama.",
        "Menggunakan aset internet tanpa memeriksa lisensi, atribusi, atau izin penggunaan.",
        "Menilai konten hanya dari jumlah tayangan, bukan dari ketepatan pesan dan dampaknya.",
      ],
    },
    {
      test: /proyek|projek|sintesis|portofolio|pitch|presentasi akhir/.test(t),
      items: [
        "Memulai proyek dari alat yang ingin dipakai, bukan dari masalah yang ingin diselesaikan.",
        "Menganggap proyek selesai setelah produk jadi, padahal perlu diuji, dievaluasi, dan didokumentasikan.",
        "Menyembunyikan kendala proyek, padahal refleksi masalah dan perbaikan adalah bagian penting dari pembelajaran.",
      ],
    },
  ];
  const matched = packs.find(pack => pack.test);
  return matched ? matched.items : [
    "Mengira paham karena mengenal istilah, padahal belum tentu bisa menjelaskan dengan contoh.",
    "Langsung mengerjakan kuis tanpa menghubungkan materi dengan pengalaman nyata.",
    "Melewatkan aktivitas praktik, padahal praktik membantu menemukan bagian yang belum dipahami.",
  ];
}

// Rotate the bucket pool so same-bucket topics (e.g. all-network modules) still differ
// Stable string hash → spreads filler picks across different topics
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// How well an activity matches the ACTIVE topic (shared significant words)
function activityRelevance(activity, topicLower) {
  const text = `${activity.title || ""} ${activity.question || ""} ${activity.reason || ""}`.toLowerCase();
  const stop = new Set(["yang", "dengan", "untuk", "dari", "dan", "pada", "konsep", "operasi", "python", "jenis", "dasar", "prinsip"]);
  const words = topicLower.split(/[^a-z0-9]+/).filter(w => w.length >= 4 && !stop.has(w));
  let score = 0;
  words.forEach(w => { if (text.includes(w)) score++; });
  return score;
}

// Pick `count` bucket activities: most topic-relevant first, then hash-rotated fillers.
// This makes "Stack" lessons show the Stack challenge, and different topics/modules
// (even in the same theme bucket) pick different fillers — killing duplicates.
function selectBucketActivities(pool, topicLower, count) {
  if (!pool || pool.length === 0) return [];
  const scored = pool.map(a => ({ a, rel: activityRelevance(a, topicLower) }));
  const relevant = scored.filter(s => s.rel > 0).sort((x, y) => y.rel - x.rel);
  const others = scored.filter(s => s.rel === 0);
  const start = others.length ? hashStr(topicLower) % others.length : 0;
  const rotatedOthers = others.map((_, i) => others[(start + i) % others.length]);
  const out = [], seen = new Set();
  for (const s of [...relevant, ...rotatedOthers]) {
    if (out.length >= count) break;
    if (!seen.has(s.a.title)) { seen.add(s.a.title); out.push(s.a); }
  }
  return out;
}

// Core: produce { summaryPoints, activities } that depend on the ACTIVE topic
function getTopicComprehension(topic, lesson, mod, index) {
  const tl = topic.toLowerCase();
  const lessonChoice = buildLessonChoice(topic, lesson);
  const lessonApplication = buildLessonApplicationChoice(topic, lesson);
  const lessonExplain = buildLessonExplainChallenge(topic, lesson);
  const bucket = TOPIC_BUCKETS.find(b => b.test(tl));
  const summaryPoints = lessonSummaryPoints(lesson);

  let craftedAct = null;
  const profile = MODULE_PROFILES[mod.id];
  if (profile) {
    craftedAct = (profile.quest(topic).activities || []).find(a => a.type === "interactive");
  } else {
    craftedAct = (getQuestContent(mod, index).activities || []).find(a => a.type === "interactive" || a.type === "note");
  }

  const bucketActs = bucket ? selectBucketActivities(bucket.pool, tl, 2) : [];
  if (bucket) {
    bucket.summary.forEach(point => {
      if (summaryPoints.length < 4 && !summaryPoints.includes(point)) summaryPoints.push(point);
    });
  }

  const activityCandidates = [
    lessonChoice,
    lessonApplication,
    lessonExplain,
    craftedAct,
    ...bucketActs,
    buildSelfCheck(topic),
  ].filter(Boolean);

  const activities = [];
  const seenTitles = new Set();
  activityCandidates.forEach(activity => {
    if (activities.length >= 3) return;
    const key = activity.title || activity.reason || JSON.stringify(activity);
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      activities.push(activity);
    }
  });

  return { summaryPoints: summaryPoints.slice(0, 4), activities };
}

function buildUnderstandingMission(mod, index) {
  const topic = mod.topics[index] || `Pengayaan ${index + 1}`;
  const topicTitle = topic;
  const lesson = getLessonContent(mod, index);
  const { summaryPoints, activities } = getTopicComprehension(topic, lesson, mod, index);

  // Optional enrichment (lab/game) stays available but is NOT part of the core mission
  let extras = [];
  const profile = MODULE_PROFILES[mod.id];
  if (profile) {
    extras = (profile.quest(topic).activities || []).filter(a => a.type === "lab" || a.type === "game").slice(0, 2);
  } else {
    extras = (getQuestContent(mod, index).activities || []).filter(a => a.type === "lab" || a.type === "game").slice(0, 2);
  }
  extras = getModulePracticeExtras(mod, extras, index);

  return {
    id: `${mod.id || mod.slug}-${index}-understanding-mission`,
    title: `Misi Pemahaman: ${topicTitle}`,
    topicTitle,
    mission: `Misi ini adalah cek pemahaman singkat tentang ${topicTitle.toLowerCase()}. Bacalah materi terlebih dahulu, lalu selesaikan tantangan untuk memastikan kamu siap mengikuti kuis.`,
    summaryPoints,
    activities,
    extras,
    reflectionPrompt: `Refleksi singkat: tuliskan satu kalimat tentang hal paling penting dari materi "${topicTitle}" dan mengapa itu berguna.`,
    passScore: 70,
  };
}

function getModulePracticeExtras(mod, seededExtras = [], topicIndex = 0) {
  const candidates = new Map();
  const scoreItem = (type, item, sourceBonus = 0) => {
    const primaryLevel = item.primaryLevel || item.level?.[0];
    const isCurrentLevel = item.level?.includes(mod.level);
    const sameSubject = item.subject === mod.subject;
    const typeBalance = (topicIndex + sourceBonus) % 2 === 0
      ? (type === "lab" ? 8 : 0)
      : (type === "game" ? 8 : 0);
    return (
      sourceBonus +
      (sameSubject ? 80 : 0) +
      (primaryLevel === mod.level ? 45 : 0) +
      (isCurrentLevel ? 25 : 0) +
      typeBalance
    );
  };
  const collect = (activity, sourceBonus = 0) => {
    if (!activity || !activity.type || !activity.id) return;
    const item = activity.type === "lab"
      ? window.CURRICULUM.labs.find(l => l.id === activity.id)
      : window.CURRICULUM.games.find(g => g.id === activity.id);
    if (!item || !(item.moduleRefs || []).includes(mod.id)) return;
    const key = `${activity.type}:${activity.id}`;
    const score = scoreItem(activity.type, item, sourceBonus);
    const current = candidates.get(key);
    if (!current || score > current.score) {
      candidates.set(key, {
        activity: { type: activity.type, id: activity.id, reason: activity.reason || getPracticeReason(item, activity.type, mod) },
        item,
        score,
      });
    }
  };

  seededExtras.forEach(activity => collect(activity, 18));

  const resources = [
    ...window.CURRICULUM.labs.map(item => ({ type: "lab", item })),
    ...window.CURRICULUM.games.map(item => ({ type: "game", item })),
  ].filter(({ item }) => (item.moduleRefs || []).includes(mod.id));

  resources.forEach(({ type, item }) => collect({ type, id: item.id, reason: getPracticeReason(item, type, mod) }, 0));

  return [...candidates.values()]
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, 2)
    .map(entry => entry.activity);
}

function getPracticeReason(item, type, mod) {
  const skillText = (item.skills || []).slice(0, 2).join(" dan ");
  const subject = window.CURRICULUM.subjects[item.subject]?.shortName || window.CURRICULUM.subjects[item.subject]?.name || item.subject;
  if (skillText) {
    return `${type === "lab" ? "Lab" : "Gim"} ${subject} ini menguatkan ${skillText.toLowerCase()} yang terkait langsung dengan unit ini.`;
  }
  return `${type === "lab" ? "Lab" : "Gim"} ini dipilih sebagai penguat praktik untuk ${mod.title}.`;
}

function getQuestContent(mod, index) {
  const topic = mod.topics[index] || `Pengayaan ${index + 1}`;
  const topicLower = topic.toLowerCase();
  let mission = `Temukan satu contoh ${topicLower} dari kehidupan sehari-hari, lalu jelaskan masalah, pola, dan keputusan yang bisa diambil.`;
  let concepts = [topic, "Contoh", "Analisis", "Kesimpulan"];
  let activities = [
    { type: "interactive", kind: "note", title: "Mini Investigasi", reason: "Pilih jenis contoh yang paling cocok untuk dianalisis, lalu simpan sebagai misi." },
    { type: "lab", id: "image-classifier", reason: "Dipakai sebagai aktivitas eksplorasi umum untuk melihat bagaimana sistem digital membaca pola dari input." },
  ];

  if (mod.id === "inf7-1") {
    const bkQuest = {
      "Dekomposisi": {
        mission: "Pecah masalah 'kelas sulit menjaga kebersihan' menjadi beberapa bagian kecil yang bisa dikerjakan.",
        concepts: ["Masalah", "Bagian Kecil", "Prioritas", "Solusi"],
        activities: [
          { type: "interactive", kind: "decompose", title: "Pecah Masalah", reason: "Pilih bagian masalah yang perlu dianalisis.", items: ["Orang yang terlibat", "Lokasi", "Waktu kejadian", "Aturan kelas", "Alat yang dibutuhkan"] },
          { type: "game", id: "bug-hunter", reason: "Melatih kebiasaan memecah instruksi dan menemukan bagian yang bermasalah." },
        ],
      },
      "Pengenalan Pola": {
        mission: "Bandingkan beberapa kejadian berulang, lalu temukan persamaan yang bisa menjadi pola.",
        concepts: ["Contoh", "Persamaan", "Perbedaan", "Pola"],
        activities: [
          { type: "interactive", kind: "classify", title: "Cari Pola Kejadian", reason: "Kelompokkan contoh berdasarkan pola yang terlihat.", choices: ["Pola berulang", "Bukan pola", "Perlu data"], items: ["Terlambat setiap Senin", "Nilai naik setelah latihan rutin", "Kelas ramai saat guru keluar"], answer: { "Terlambat setiap Senin": "Pola berulang", "Nilai naik setelah latihan rutin": "Pola berulang", "Kelas ramai saat guru keluar": "Perlu data" } },
          { type: "game", id: "pattern-quiz", reason: "Menguatkan kemampuan membaca pola dari contoh sederhana." },
        ],
      },
      "Abstraksi": {
        mission: "Pilih informasi yang penting untuk membuat denah dari gerbang sekolah ke perpustakaan.",
        concepts: ["Tujuan", "Detail Penting", "Detail Tidak Perlu", "Model Sederhana"],
        activities: [
          { type: "interactive", kind: "abstraction", title: "Pilah Detail Penting", reason: "Tentukan detail mana yang perlu dipakai dalam model solusi.", items: ["Titik awal", "Arah belok", "Warna tas siswa", "Nama ruang yang dilewati", "Cuaca hari ini"], answer: { "Titik awal": "Penting", "Arah belok": "Penting", "Warna tas siswa": "Bisa diabaikan", "Nama ruang yang dilewati": "Penting", "Cuaca hari ini": "Bisa diabaikan" } },
        ],
      },
      "Algoritma & Flowchart": {
        mission: "Susun urutan langkah yang jelas untuk meminjam buku di perpustakaan sekolah, lalu identifikasi bagian mana yang membutuhkan percabangan jika/maka.",
        concepts: ["Input", "Langkah", "Percabangan", "Output", "Flowchart"],
        activities: [
          { type: "interactive", kind: "sequence", title: "Susun Langkah Solusi", reason: "Klik langkah dalam urutan yang menurutmu paling masuk akal.", steps: ["Cari buku", "Cek ketersediaan", "Bawa ke petugas", "Pindai kartu", "Catat tanggal kembali"], answer: ["Cari buku", "Cek ketersediaan", "Bawa ke petugas", "Pindai kartu", "Catat tanggal kembali"] },
          { type: "game", id: "bug-hunter", reason: "Melatih membaca urutan instruksi dan menemukan langkah yang tidak tepat." },
          { type: "game", id: "flowchart-builder", reason: "Mempraktikkan penyusunan alur algoritma dan keputusan bercabang." },
        ],
      },
      "Evaluasi Solusi": {
        mission: "Nilai apakah solusi jadwal piket kelas sudah jelas, adil, dan bisa dijalankan.",
        concepts: ["Solusi", "Kriteria", "Uji", "Perbaikan"],
        activities: [
          { type: "interactive", kind: "evaluate", title: "Cek Kualitas Solusi", reason: "Centang kriteria solusi yang baik, lalu pilih perbaikannya.", items: ["Jelas", "Adil", "Runtut", "Hemat waktu", "Bisa diuji"] },
          { type: "game", id: "sort-race", reason: "Melatih evaluasi urutan dan efisiensi langkah." },
          { type: "game", id: "flowchart-builder", reason: "Mengubah evaluasi solusi menjadi urutan langkah yang bisa diuji." },
        ],
      },
      "Proyek LKPD Komputasional": {
        mission: "Pilih satu masalah nyata di sekolah dan terapkan seluruh elemen BK (dekomposisi, pola, abstraksi, algoritma, evaluasi) dalam satu rancangan solusi.",
        concepts: ["Masalah", "BK Lengkap", "Solusi", "Evaluasi", "Proyek"],
        activities: [
          { type: "interactive", kind: "decompose", title: "Pecah Masalah Proyek", reason: "Pilih komponen yang perlu dianalisis dalam proyekmu menggunakan BK.", items: ["Siapa yang terlibat", "Data yang dibutuhkan", "Pola yang ditemukan", "Detail yang penting", "Langkah solusi"] },
          { type: "interactive", kind: "evaluate", title: "Evaluasi Proyek BK", reason: "Pastikan proyekmu memenuhi semua elemen berpikir komputasional.", items: ["Dekomposisi sudah dilakukan", "Pola ditemukan dari data", "Abstraksi menyederhanakan masalah", "Algoritma/flowchart sudah dirancang", "Solusi sudah dievaluasi dan bisa diuji"] },
        ],
      },
    };
    return {
      title: `Misi BK: ${topic}`,
      ...(bkQuest[topic] || bkQuest["Dekomposisi"]),
    };
  }

  if (mod.id === "inf9-1") {
    const pythonQuest = {
      "Fungsi Lanjutan & Parameter": {
        mission: "Tulis fungsi Python dengan parameter default dan keyword argument, lalu uji dengan berbagai kombinasi argumen.",
        concepts: ["def", "Parameter Default", "Keyword Arg", "Return"],
        activities: [
          { type: "interactive", kind: "sequence", title: "Alur Membuat Fungsi Lanjutan", reason: "Susun urutan langkah mendefinisikan fungsi Python dengan parameter default.", steps: ["Tulis def nama(param, default=nilai)", "Isi badan fungsi", "Tambahkan return", "Panggil tanpa argumen opsional", "Panggil dengan argumen eksplisit"], answer: ["Tulis def nama(param, default=nilai)", "Isi badan fungsi", "Tambahkan return", "Panggil tanpa argumen opsional", "Panggil dengan argumen eksplisit"] },
          { type: "lab", id: "python-trace", reason: "Melatih trace nilai variabel dan return fungsi sebelum menulis kode mandiri." },
          { type: "game", id: "bug-hunter", reason: "Berlatih membaca kode Python dan menemukan kesalahan pada definisi atau pemanggilan fungsi." },
        ],
      },
      "Dictionary & Struktur Data": {
        mission: "Buat dan manipulasi dictionary Python untuk menyimpan data terstruktur — tambah, akses, update, dan iterasi key-value.",
        concepts: ["Key-Value", "Akses", "Iterasi", "Update"],
        activities: [
          { type: "interactive", kind: "classify", title: "List atau Dictionary?", reason: "Tentukan struktur data yang paling cocok untuk setiap kebutuhan.", choices: ["List", "Dictionary", "Keduanya bisa"], items: ["Daftar nama siswa berurutan", "Profil siswa: nama, kelas, nilai", "Urutan langkah algoritma", "Pemetaan kode kelas ke wali kelas"], answer: { "Daftar nama siswa berurutan": "List", "Profil siswa: nama, kelas, nilai": "Dictionary", "Urutan langkah algoritma": "List", "Pemetaan kode kelas ke wali kelas": "Dictionary" } },
          { type: "lab", id: "python-trace", reason: "Mempraktikkan pembacaan dictionary, update key, dan output program." },
          { type: "game", id: "bug-hunter", reason: "Berlatih menemukan kesalahan sintaks saat mengakses atau mengupdate dictionary Python." },
        ],
      },
      "Modul Python: random, math, string": {
        mission: "Gunakan minimal dua modul Python bawaan untuk menyelesaikan satu program nyata yang berguna.",
        concepts: ["import", "math", "random", "string method"],
        activities: [
          { type: "interactive", kind: "classify", title: "Cocokkan Modul Python", reason: "Tentukan modul yang tepat untuk setiap kebutuhan.", choices: ["math", "random", "string method"], items: ["Hitung akar kuadrat", "Pilih satu item dari list secara acak", "Ubah teks jadi huruf besar", "Hitung nilai π"], answer: { "Hitung akar kuadrat": "math", "Pilih satu item dari list secara acak": "random", "Ubah teks jadi huruf besar": "string method", "Hitung nilai π": "math" } },
          { type: "game", id: "bug-hunter", reason: "Berlatih memperbaiki program Python yang menggunakan import modul." },
        ],
      },
      "Bubble Sort": {
        mission: "Implementasikan Bubble Sort dan trace eksekusinya langkah demi langkah untuk memahami perbandingan dan pertukaran.",
        concepts: ["Bandingkan", "Tukar", "Loop Bersarang", "Iterasi"],
        activities: [
          { type: "interactive", kind: "sequence", title: "Trace Bubble Sort", reason: "Susun urutan operasi Bubble Sort yang benar.", steps: ["Mulai dari elemen pertama", "Bandingkan dengan elemen berikutnya", "Tukar jika tidak berurutan", "Lanjutkan ke pasangan berikutnya", "Ulangi dari awal sampai tidak ada pertukaran"], answer: ["Mulai dari elemen pertama", "Bandingkan dengan elemen berikutnya", "Tukar jika tidak berurutan", "Lanjutkan ke pasangan berikutnya", "Ulangi dari awal sampai tidak ada pertukaran"] },
          { type: "lab", id: "sorting", reason: "Visualisasi Bubble Sort bergerak — lihat bagaimana perbandingan dan pertukaran terjadi secara real-time." },
        ],
      },
      "Linear & Binary Search": {
        mission: "Implementasikan kedua algoritma pencarian dan bandingkan jumlah langkah yang dibutuhkan pada dataset yang sama.",
        concepts: ["Linear O(n)", "Binary O(log n)", "Data Terurut", "Efisiensi"],
        activities: [
          { type: "interactive", kind: "classify", title: "Linear atau Binary Search?", reason: "Pilih algoritma pencarian yang paling tepat untuk setiap situasi.", choices: ["Linear Search", "Binary Search", "Keduanya bisa"], items: ["Data tidak terurut, cari nama siswa", "Data terurut, cari nilai ujian", "List kecil 5 elemen", "List 10.000 elemen sudah diurutkan"], answer: { "Data tidak terurut, cari nama siswa": "Linear Search", "Data terurut, cari nilai ujian": "Binary Search", "List kecil 5 elemen": "Keduanya bisa", "List 10.000 elemen sudah diurutkan": "Binary Search" } },
          { type: "lab", id: "python-trace", reason: "Menelusuri jumlah langkah binary search pada data terurut." },
          { type: "game", id: "search-rescue", reason: "Berlatih memilih linear atau binary search sesuai kondisi data." },
          { type: "game", id: "bug-hunter", reason: "Berlatih menemukan kesalahan dalam implementasi algoritma pencarian Python." },
        ],
      },
      "Problem Solving Integratif": {
        mission: "Rencanakan dan implementasikan program Python yang mengintegrasikan fungsi, dictionary, modul, sorting, dan searching dalam satu solusi nyata.",
        concepts: ["Integrasi", "Fungsi", "Dictionary", "Sorting", "Searching"],
        activities: [
          { type: "interactive", kind: "sequence", title: "Alur Problem Solving Python", reason: "Susun urutan yang tepat untuk menyelesaikan masalah dengan Python secara integratif.", steps: ["Definisikan masalah dan output yang diinginkan", "Pilih struktur data (list/dictionary)", "Rancang fungsi yang dibutuhkan", "Pilih modul Python yang relevan", "Implementasi dan uji tiap fungsi", "Integrasikan dan uji program lengkap"], answer: ["Definisikan masalah dan output yang diinginkan", "Pilih struktur data (list/dictionary)", "Rancang fungsi yang dibutuhkan", "Pilih modul Python yang relevan", "Implementasi dan uji tiap fungsi", "Integrasikan dan uji program lengkap"] },
          { type: "lab", id: "python-trace", reason: "Membiasakan membaca alur program sebelum mengintegrasikan fungsi dan struktur data." },
          { type: "game", id: "bug-hunter", reason: "Berlatih debug program Python yang kompleks sebelum integrasi final." },
        ],
      },
    };
    return {
      title: `Misi Python: ${topic}`,
      ...(pythonQuest[topic] || pythonQuest["Fungsi Lanjutan & Parameter"]),
    };
  }

  const curatedQuest = getCuratedModuleQuest(mod, topic, index);
  if (curatedQuest) return curatedQuest;

  if (topicLower.includes("data") || topicLower.includes("atribut") || topicLower.includes("tabel") || topicLower.includes("filter") || topicLower.includes("sortir") || topicLower.includes("grafik")) {
    mission = "Buat survei mini ke 5 orang, susun datanya dalam tabel, lalu tulis satu pola atau kesimpulan yang kamu temukan.";
    concepts = ["Data", "Atribut", "Tabel", "Pola", "Kesimpulan"];
    activities = [
      { type: "interactive", kind: "table", title: "Pembuat Tabel Mini", reason: "Pilih objek data dan atribut untuk membangun himpunan data sederhana." },
      { type: "lab", id: "dataset-labeling", reason: "Menguatkan hubungan data, label, pola, dan bias pada sistem AI sederhana." },
      { type: "lab", id: "sorting", reason: "Memperlihatkan bagaimana data bisa diurutkan untuk menemukan pola." },
      { type: "lab", id: "spreadsheet-mini", reason: "Menerapkan formula SUM, AVERAGE, IF, dan COUNTIF pada data sederhana." },
      { type: "game", id: "sort-race", reason: "Melatih intuisi mengurutkan data dengan cepat dan akurat." },
    ];
  } else if (topicLower.includes("internet") || topicLower.includes("jaringan") || topicLower.includes("router") || topicLower.includes("ip")) {
    mission = "Gambar alur perjalanan data dari perangkatmu ke satu layanan online, lalu beri label perangkat, jaringan, dan server.";
    concepts = ["Perangkat", "Router", "Internet", "Server", "Respons"];
    activities = [
      { type: "interactive", kind: "flow", title: "Susun Jalur Data", reason: "Klik setiap titik alur untuk menandai urutan perjalanan data.", steps: ["Perangkat", "Router", "ISP", "Server", "Respons"] },
      { type: "lab", id: "network-sim", reason: "Memvisualkan perjalanan paket data dari perangkat ke server." },
      { type: "game", id: "typing-binary", reason: "Menguatkan pemahaman representasi data digital yang bergerak di jaringan." },
    ];
  } else if (topicLower.includes("privasi") || topicLower.includes("password") || topicLower.includes("phishing") || topicLower.includes("keamanan") || topicLower.includes("akun") || topicLower.includes("data pribadi")) {
    mission = "Audit satu akun digital: cek password, pemulihan akun, izin aplikasi, dan risiko data pribadi yang mungkin terbuka.";
    concepts = ["Identitas", "Risiko", "Perlindungan", "Kebiasaan Aman"];
    activities = [
      { type: "interactive", kind: "checklist", title: "Audit Akun Interaktif", reason: "Centang kebiasaan aman yang sudah kamu lakukan.", items: ["Password unik", "Tidak membagi OTP", "Cek alamat situs", "Batasi izin aplikasi"] },
      { type: "game", id: "ai-ethics", reason: "Melatih pengambilan keputusan saat teknologi menyentuh privasi dan dampak sosial." },
      { type: "game", id: "caesar-cipher", reason: "Mengenalkan gagasan dasar perlindungan pesan melalui penyandian." },
      { type: "lab", id: "digital-footprint", reason: "Memilih respons saat jejak digital, reputasi, atau data pribadi berisiko." },
    ];
  } else if (topicLower.includes("pseudocode") || topicLower.includes("flowchart") || topicLower.includes("percabangan") || topicLower.includes("perulangan") || topicLower.includes("algoritma") || topicLower.includes("dekomposisi")) {
    mission = "Pilih satu rutinitas harian, pecah menjadi langkah bernomor, lalu tandai bagian yang memakai keputusan jika/maka.";
    concepts = ["Masalah", "Langkah", "Kondisi", "Uji", "Perbaiki"];
    activities = [
      { type: "interactive", kind: "sequence", title: "Susun Algoritma", reason: "Klik urutan konsep algoritma sampai lengkap.", steps: ["Masalah", "Langkah", "Kondisi", "Uji", "Perbaiki"], answer: ["Masalah", "Langkah", "Kondisi", "Uji", "Perbaiki"] },
      { type: "game", id: "bug-hunter", reason: "Melatih membaca logika dan menemukan kesalahan kecil dalam instruksi." },
      { type: "game", id: "sort-race", reason: "Mengubah urutan langkah menjadi tantangan algoritmik sederhana." },
      { type: "game", id: "flowchart-builder", reason: "Menyusun instruksi menjadi alur algoritma yang runtut." },
    ];
  } else if (topicLower.includes("hoaks") || topicLower.includes("fakta") || topicLower.includes("opini") || topicLower.includes("kredibilitas") || topicLower.includes("sumber") || topicLower.includes("media")) {
    mission = "Ambil satu unggahan atau berita pendek. Tandai bagian fakta, opini, klaim yang perlu dicek, dan sumber pembandingnya.";
    concepts = ["Informasi", "Sumber", "Bukti", "Cek Fakta", "Keputusan"];
    activities = [
      { type: "interactive", kind: "classify", title: "Klasifikasi Klaim", reason: "Tentukan apakah contoh berikut fakta, opini, atau perlu dicek.", items: ["Sekolah mulai pukul 07.00", "Aplikasi ini paling bagus", "Akun itu membagikan hadiah gratis"], answer: { "Sekolah mulai pukul 07.00": "Fakta", "Aplikasi ini paling bagus": "Opini", "Akun itu membagikan hadiah gratis": "Perlu Cek" } },
      { type: "game", id: "pattern-quiz", reason: "Melatih mengenali pola, termasuk pola informasi yang mencurigakan." },
      { type: "game", id: "ai-ethics", reason: "Membuka diskusi tentang dampak teknologi dan informasi pada orang lain." },
      { type: "lab", id: "sift-check", reason: "Mempraktikkan cek klaim dan sumber sebelum membagikan informasi." },
    ];
  } else if (topicLower.includes("biner") || topicLower.includes("representasi")) {
    mission = "Pilih 3 angka kecil, ubah ke biner, lalu jelaskan mengapa komputer membutuhkan representasi seperti ini.";
    concepts = ["Angka", "Biner", "Representasi", "Komputer"];
    activities = [
      { type: "interactive", kind: "binary", title: "Konversi Biner", reason: "Ubah angka kecil ke biner langsung di SIGMA.", number: 13 },
      { type: "lab", id: "binary", reason: "Eksperimen langsung mengubah bit menjadi nilai desimal dan heksadesimal." },
      { type: "game", id: "typing-binary", reason: "Melatih konversi biner dengan cara cepat dan menyenangkan." },
    ];
  }

  return {
    title: `Misi: ${topic}`,
    mission,
    concepts,
    activities,
  };
}

const MODULE_PROFILES = {
  "inf7-2": {
    focus: "cara komputer bekerja",
    frame: "hubungan input, proses, penyimpanan, dan output pada perangkat yang dipakai siswa",
    example: "Saat mengetik tugas, keyboard memberi input, aplikasi mengolah teks, file disimpan, lalu layar atau printer menampilkan hasil.",
    product: "diagram IPO perangkat",
    concepts: ["Input", "Proses", "Penyimpanan", "Output"],
    quest: topic => ({
      mission: `Analisis ${topic.toLowerCase()} pada satu perangkat yang kamu gunakan di sekolah atau rumah.`,
      activities: [
        { type: "interactive", kind: "decompose", title: "Bedah Cara Kerja Perangkat", reason: "Pilih komponen yang terlibat dalam cara kerja perangkat.", items: ["Input", "Proses", "Output", "Penyimpanan", "Masalah yang muncul"] },
        { type: "interactive", kind: "classify", title: "Klasifikasi Komponen", reason: "Tentukan peran tiap contoh dalam sistem komputer.", choices: ["Input", "Proses", "Output", "Penyimpanan"], items: ["Keyboard", "CPU", "Monitor", "SSD"], answer: { "Keyboard": "Input", "CPU": "Proses", "Monitor": "Output", "SSD": "Penyimpanan" } },
      ],
    }),
  },
  "inf7-3": {
    focus: "jaringan komputer dan internet",
    frame: "perjalanan data dari perangkat siswa menuju layanan online",
    example: "Saat membuka LMS, permintaan dari laptop melewati WiFi, router, penyedia internet, server, lalu kembali sebagai halaman web.",
    product: "peta jalur data",
    concepts: ["Perangkat", "Router", "Internet", "Server", "Respons"],
    quest: topic => ({
      mission: `Susun alur ${topic.toLowerCase()} dari perangkat pengguna sampai layanan internet merespons.`,
      activities: [
        { type: "interactive", kind: "flow", title: "Susun Jalur Data", reason: "Klik titik alur yang terlibat dalam perjalanan data.", steps: ["Perangkat", "WiFi", "Router", "ISP", "Server", "Respons"] },
        { type: "lab", id: "network-sim", reason: "Mendiagnosis titik masalah saat paket data gagal sampai ke server." },
      ],
    }),
  },
  "inf7-4": {
    focus: "mesin pencari dan kualitas informasi",
    frame: "cara memilih kata kunci, membaca sumber, dan menilai kepercayaan informasi",
    example: "Pencarian 'energi terbarukan sekolah site:go.id' biasanya lebih terarah daripada mengetik pertanyaan terlalu umum.",
    product: "strategi pencarian dan cek sumber",
    concepts: ["Kata Kunci", "Sumber", "Bukti", "Kredibilitas"],
    quest: topic => ({
      mission: `Uji ${topic.toLowerCase()} dengan satu kebutuhan informasi untuk tugas sekolah.`,
      activities: [
        { type: "interactive", kind: "classify", title: "Audit Hasil Pencarian", reason: "Tentukan aspek yang perlu dicek dari hasil pencarian.", choices: ["Kata kunci", "Sumber", "Bukti", "Perlu cek"], items: ["Judul terlalu bombastis", "Penulis jelas", "Tanggal publikasi lama", "Ada rujukan data"], answer: { "Judul terlalu bombastis": "Perlu cek", "Penulis jelas": "Sumber", "Tanggal publikasi lama": "Perlu cek", "Ada rujukan data": "Bukti" } },
        { type: "interactive", kind: "note", title: "Racik Kata Kunci", reason: "Pilih strategi yang membuat kata kunci pencarian lebih spesifik.", choices: ["Tambah lokasi", "Tambah tahun", "Pakai tanda kutip", "Bandingkan sumber"] },
        { type: "lab", id: "sift-check", reason: "Mempraktikkan pemilihan sumber pembanding, konteks, dan keputusan sebelum percaya informasi." },
      ],
    }),
  },
  "inf7-5": {
    focus: "fakta, opini, hoaks, dan media digital",
    frame: "membedakan klaim, bukti, opini, bias, dan informasi menyesatkan",
    example: "Kalimat 'sekolah masuk pukul 07.00' bisa dicek, sedangkan 'aplikasi ini paling bagus' perlu dibaca sebagai opini.",
    product: "kartu cek fakta",
    concepts: ["Klaim", "Bukti", "Sumber", "Keputusan"],
    quest: topic => ({
      mission: `Bedakan ${topic.toLowerCase()} pada contoh informasi digital sebelum memutuskan untuk percaya atau membagikan.`,
      activities: [
        { type: "interactive", kind: "classify", title: "Klasifikasi Klaim", reason: "Tentukan jenis informasi dari contoh yang muncul.", choices: ["Fakta", "Opini", "Perlu cek"], items: ["Sekolah mulai pukul 07.00", "Aplikasi ini paling bagus", "Akun itu membagikan hadiah gratis"], answer: { "Sekolah mulai pukul 07.00": "Fakta", "Aplikasi ini paling bagus": "Opini", "Akun itu membagikan hadiah gratis": "Perlu cek" } },
        { type: "game", id: "pattern-quiz", reason: "Melatih mengenali pola informasi yang mencurigakan." },
        { type: "lab", id: "sift-check", reason: "Melatih investigasi klaim dengan sumber, konteks, dan putusan yang bertanggung jawab." },
      ],
    }),
  },
  "inf7-6": {
    focus: "ruang publik virtual dan etika digital",
    frame: "cara berkomunikasi, menjaga privasi, dan bertanggung jawab di ruang online",
    example: "Sebelum berkomentar di grup kelas, siswa perlu mengecek nada bahasa, dampak pada teman, dan apakah ada data pribadi yang terbuka.",
    product: "panduan netiket kelas",
    concepts: ["Empati", "Privasi", "Netiket", "Tanggung Jawab"],
    quest: topic => ({
      mission: `Ambil satu skenario ruang digital, lalu tentukan sikap aman dan etis sesuai ${topic.toLowerCase()}.`,
      activities: [
        { type: "interactive", kind: "checklist", title: "Cek Etika Digital", reason: "Centang kebiasaan yang membuat interaksi online lebih aman.", items: ["Bahasa sopan", "Tidak membuka data pribadi", "Cek dampak komentar", "Minta izin sebelum membagikan"] },
        { type: "game", id: "ai-ethics", reason: "Melatih pengambilan keputusan saat teknologi berdampak pada orang lain." },
      ],
    }),
  },
  "inf8-1": {
    focus: "himpunan data terstruktur I: List Python dan Queue",
    frame: "cara merepresentasikan data terstruktur, mengoperasikan List Python sederhana, memahami Queue FIFO, dan memakai List serta Queue untuk memecahkan masalah",
    example: "antrean = ['Ari', 'Bima', 'Citra']\nantrean.append('Dina')\ndilayani = antrean.pop(0)\nprint(dilayani)  # Ari dilayani lebih dulu: prinsip Queue/FIFO",
    product: "program atau diagram sederhana yang memakai List dan Queue",
    concepts: ["Data Terstruktur", "List", "Operasi List", "Queue", "FIFO"],
    quest: topic => ({
      mission: `Terapkan konsep ${topic.toLowerCase()} dalam program Python yang mengolah data sederhana.`,
      activities: [
        { type: "interactive", kind: "sequence", title: "Susun Alur List/Queue", reason: "Susun urutan langkah memakai List sebagai antrean sederhana.", steps: ["Buat list antrean kosong", "Tambahkan data dengan append()", "Lihat elemen paling depan", "Layani elemen depan dengan pop(0)", "Periksa sisa antrean"], answer: ["Buat list antrean kosong", "Tambahkan data dengan append()", "Lihat elemen paling depan", "Layani elemen depan dengan pop(0)", "Periksa sisa antrean"] },
        { type: "lab", id: "sorting", reason: "Melihat bagaimana data dalam list diurutkan secara visual — dasar operasi list di Python." },
      ],
    }),
  },
  "inf8-2": {
    focus: "himpunan data terstruktur II: Stack Python, Tree, dan Graf konseptual",
    frame: "implementasi Stack dengan list Python (push, pop, peek) dan pemahaman konseptual Tree dan Graf sebagai fondasi algoritma lanjutan",
    example: "tumpukan = []           # Stack kosong\ntumpukan.append('A')   # push A\ntumpukan.append('B')   # push B\nprint(tumpukan.pop())  # B — LIFO: terakhir masuk, pertama keluar",
    product: "implementasi Stack Python dan diagram Tree/Graf konseptual",
    concepts: ["Stack", "LIFO", "Push/Pop", "Tree", "Graf"],
    quest: topic => ({
      mission: `Implementasikan atau visualkan konsep ${topic.toLowerCase()} menggunakan Python atau diagram.`,
      activities: [
        { type: "interactive", kind: "sequence", title: "Simulasi Operasi Stack", reason: "Susun urutan operasi Stack Python yang benar (push, pop, peek).", steps: ["tumpukan = []", "tumpukan.append('item1')  # push", "tumpukan.append('item2')  # push", "print(tumpukan[-1])       # peek", "tumpukan.pop()            # pop"], answer: ["tumpukan = []", "tumpukan.append('item1')  # push", "tumpukan.append('item2')  # push", "print(tumpukan[-1])       # peek", "tumpukan.pop()            # pop"] },
        { type: "lab", id: "sorting", reason: "Melihat algoritma bergerak melalui struktur data — koneksi visual ke cara Stack dan Tree bekerja." },
      ],
    }),
  },
  "inf8-3": {
    focus: "lembar kerja pengolah data",
    frame: "spreadsheet sebagai list of lists, referensi sel, operasi dasar, sorting, filtering, dan fungsi ringkasan",
    example: "Spreadsheet bisa menghitung rata-rata nilai, menyaring data kelas, lalu membuat grafik perkembangan belajar.",
    product: "rancangan spreadsheet mini untuk analisis data",
    concepts: ["List of Lists", "Referensi Sel", "Sorting", "Filtering", "Fungsi Ringkasan"],
    quest: topic => ({
      mission: `Rancang penggunaan ${topic.toLowerCase()} pada spreadsheet sederhana.`,
      activities: [
        { type: "interactive", kind: "classify", title: "Cocokkan Fitur Spreadsheet", reason: "Pilih fitur spreadsheet yang sesuai kebutuhan.", choices: ["Formula", "Fungsi", "Grafik", "Filter"], items: ["Menjumlahkan nilai", "Mencari rata-rata", "Menampilkan tren", "Melihat data kelas 8A saja"], answer: { "Menjumlahkan nilai": "Formula", "Mencari rata-rata": "Fungsi", "Menampilkan tren": "Grafik", "Melihat data kelas 8A saja": "Filter" } },
        { type: "interactive", kind: "table", title: "Sketsa Tabel Spreadsheet", reason: "Pilih jenis data dan kolom yang akan diolah." },
      ],
    }),
  },
  "inf8-4": {
    focus: "dokumen dan presentasi digital",
    frame: "struktur, format, slide, visualisasi, dan kolaborasi agar pesan mudah dipahami",
    example: "Presentasi laporan proyek perlu judul jelas, urutan ide, visual pendukung, dan pembagian kerja tim.",
    product: "outline dokumen atau slide",
    concepts: ["Struktur", "Format", "Visual", "Kolaborasi"],
    quest: topic => ({
      mission: `Buat keputusan desain untuk ${topic.toLowerCase()} agar dokumen atau presentasi lebih jelas.`,
      activities: [
        { type: "interactive", kind: "sequence", title: "Susun Alur Presentasi", reason: "Klik urutan bagian presentasi yang paling masuk akal.", steps: ["Judul", "Masalah", "Data pendukung", "Solusi", "Penutup"], answer: ["Judul", "Masalah", "Data pendukung", "Solusi", "Penutup"] },
        { type: "interactive", kind: "evaluate", title: "Cek Kualitas Slide", reason: "Centang kriteria tampilan yang membantu audiens.", items: ["Judul jelas", "Teks ringkas", "Visual relevan", "Kontras cukup", "Sumber dicantumkan"] },
      ],
    }),
  },
  "inf8-5": {
    focus: "produksi dan diseminasi konten digital dengan Canva dan Python Pillow",
    frame: "perencanaan konten, desain infografis (Canva dan Python Pillow), etika publikasi, dan evaluasi dampak konten",
    example: "Infografis pola belajar bisa dibuat manual di Canva, ATAU dibuat programatik dengan Python Pillow: from PIL import Image, ImageDraw — generate gambar dari data secara otomatis.",
    product: "rencana konten dan perbandingan Canva vs Python Pillow",
    concepts: ["Tujuan", "Audiens", "Canva", "Python Pillow", "Evaluasi"],
    quest: topic => ({
      mission: `Rancang atau evaluasi keputusan produksi konten untuk aspek ${topic.toLowerCase()}.`,
      activities: [
        { type: "interactive", kind: "classify", title: "Canva atau Python Pillow?", reason: "Pilih alat yang paling tepat untuk setiap kebutuhan produksi konten.", choices: ["Canva", "Python Pillow", "Keduanya bisa", "Di luar keduanya"], items: ["Desain poster manual dengan drag-and-drop", "Generate 100 sertifikat dari spreadsheet otomatis", "Infografis satu halaman untuk kelas", "Visualisasi data yang diperbarui tiap hari"], answer: { "Desain poster manual dengan drag-and-drop": "Canva", "Generate 100 sertifikat dari spreadsheet otomatis": "Python Pillow", "Infografis satu halaman untuk kelas": "Canva", "Visualisasi data yang diperbarui tiap hari": "Python Pillow" } },
        { type: "interactive", kind: "checklist", title: "Cek Konten Sebelum Publikasi", reason: "Centang syarat sebelum konten dibagikan.", items: ["Tujuan dan audiens jelas", "Aset yang digunakan legal", "Tidak membuka data pribadi orang lain", "Pesan akurat dan tidak menyesatkan"] },
      ],
    }),
  },
  "inf8-6": {
    focus: "keamanan digital dan praktik keamanan harian dengan Python",
    frame: "ancaman siber, password, phishing, malware, keamanan perangkat dan jaringan, informasi privat-publik, serta praktik keamanan dengan Python",
    example: "password = 'Rahasia123!'\nkuat = len(password) >= 10 and any(c.isdigit() for c in password)\nprint('Perlu diperkuat?' , not kuat)",
    product: "audit keamanan digital dan eksperimen Python sederhana",
    concepts: ["Ancaman Siber", "Password", "Phishing", "Malware", "Privasi"],
    quest: topic => ({
      mission: `Lakukan audit atau eksplorasi terkait ${topic.toLowerCase()} pada kebiasaan dan sistem keamanan digital.`,
      activities: [
        { type: "interactive", kind: "checklist", title: "Audit Keamanan Digital", reason: "Centang langkah perlindungan yang sudah dipahami dan dijalankan.", items: ["Password unik tiap akun", "Tidak membagi OTP ke siapapun", "Selalu cek URL sebelum login", "Backup data penting secara rutin", "Aktifkan verifikasi dua langkah"] },
        { type: "game", id: "caesar-cipher", reason: "Mengenalkan ide dasar enkripsi — langkah konseptual sebelum memahami hashing kriptografi." },
      ],
    }),
  },
  "inf9-2": {
    focus: "pseudocode dan visual programming",
    frame: "merancang algoritma dengan pseudocode, flowchart, percabangan, perulangan, dan blok visual",
    example: "Program kuis sederhana perlu input jawaban, pengecekan benar/salah, skor, dan perulangan sampai semua soal selesai.",
    product: "rancangan algoritma",
    concepts: ["Masalah", "Pseudocode", "Flowchart", "Uji"],
    quest: topic => ({
      mission: `Susun rancangan algoritma yang memakai ${topic.toLowerCase()}.`,
      activities: [
        { type: "interactive", kind: "sequence", title: "Susun Algoritma", reason: "Klik urutan kerja program sederhana.", steps: ["Mulai", "Ambil input", "Cek kondisi", "Ulangi bila perlu", "Tampilkan output"], answer: ["Mulai", "Ambil input", "Cek kondisi", "Ulangi bila perlu", "Tampilkan output"] },
        { type: "lab", id: "python-trace", reason: "Menghubungkan rancangan pseudocode dengan trace kode Python sederhana." },
        { type: "game", id: "search-rescue", reason: "Melatih pemilihan algoritma pencarian berdasarkan kondisi data." },
        { type: "game", id: "bug-hunter", reason: "Melatih membaca logika dan menemukan kesalahan instruksi." },
      ],
    }),
  },
  "inf9-3": {
    focus: "rekam jejak digital dan perundungan siber",
    frame: "dampak jejak digital, empati online, tanda cyberbullying, dan langkah pelaporan",
    example: "Komentar buruk di grup bisa disimpan, disebarkan, dan berdampak pada korban meskipun pengirim sudah menghapusnya.",
    product: "panduan respons aman",
    concepts: ["Jejak", "Dampak", "Empati", "Pelaporan"],
    quest: topic => ({
      mission: `Tentukan respons aman dan empatik untuk situasi ${topic.toLowerCase()}.`,
      activities: [
        { type: "interactive", kind: "classify", title: "Baca Situasi Digital", reason: "Kelompokkan tindakan berdasarkan risiko dan respons yang tepat.", choices: ["Aman", "Berisiko", "Perlu lapor", "Perlu dukungan"], items: ["Menyimpan bukti perundungan", "Membalas hinaan", "Minta bantuan guru BK", "Menyebar tangkapan layar"], answer: { "Menyimpan bukti perundungan": "Aman", "Membalas hinaan": "Berisiko", "Minta bantuan guru BK": "Perlu dukungan", "Menyebar tangkapan layar": "Berisiko" } },
        { type: "interactive", kind: "checklist", title: "Langkah Respons", reason: "Centang langkah aman saat menghadapi perundungan siber.", items: ["Jangan membalas kasar", "Simpan bukti", "Blokir bila perlu", "Lapor orang dewasa tepercaya"] },
        { type: "game", id: "ai-ethics", reason: "Menguji keputusan etis saat teknologi berdampak pada orang lain, privasi, dan keselamatan." },
      ],
    }),
  },
  "inf9-4": {
    focus: "identitas dan perlindungan data pribadi",
    frame: "jenis data pribadi, izin aplikasi, risiko kebocoran, dan tindakan perlindungan",
    example: "Foto wajah, lokasi, nomor telepon, dan pola kebiasaan bisa menjadi data pribadi karena dapat mengidentifikasi seseorang.",
    product: "peta risiko data pribadi",
    concepts: ["Identitas", "Data Pribadi", "Izin", "Risiko", "Perlindungan"],
    quest: topic => ({
      mission: `Pilah contoh data dan keputusan aman terkait ${topic.toLowerCase()}.`,
      activities: [
        { type: "interactive", kind: "classify", title: "Klasifikasi Data Pribadi", reason: "Tentukan tingkat risiko contoh data.", choices: ["Data pribadi", "Data sensitif", "Bukan pribadi", "Perlu izin"], items: ["Nomor telepon", "Lokasi rumah", "Nama warna favorit", "Foto kartu pelajar"], answer: { "Nomor telepon": "Data pribadi", "Lokasi rumah": "Data sensitif", "Nama warna favorit": "Bukan pribadi", "Foto kartu pelajar": "Data sensitif" } },
        { type: "interactive", kind: "checklist", title: "Perlindungan Data", reason: "Centang langkah yang membantu melindungi data.", items: ["Cek izin aplikasi", "Batasi lokasi", "Jangan unggah identitas", "Pakai akun privat"] },
        { type: "game", id: "caesar-cipher", reason: "Menguatkan gagasan bahwa data dan pesan perlu dilindungi, dimulai dari konsep enkripsi sederhana." },
      ],
    }),
  },
  "inf9-5": {
    focus: "mindfulness dan kesejahteraan digital",
    frame: "kebiasaan digital, screen time, fokus, keseimbangan, dan refleksi penggunaan teknologi",
    example: "Belajar bisa terganggu jika notifikasi terus aktif, tetapi teknologi tetap bermanfaat saat dipakai dengan tujuan dan batas waktu.",
    product: "rencana kebiasaan digital sehat",
    concepts: ["Kebiasaan", "Fokus", "Batas", "Refleksi"],
    quest: topic => ({
      mission: `Evaluasi kebiasaan digitalmu terkait ${topic.toLowerCase()} dan pilih satu perbaikan kecil.`,
      activities: [
        { type: "interactive", kind: "evaluate", title: "Audit Kesejahteraan Digital", reason: "Centang kebiasaan yang mendukung belajar dan keseimbangan.", items: ["Ada batas waktu", "Notifikasi dikendalikan", "Istirahat mata", "Prioritaskan tugas", "Refleksi setelah memakai"] },
        { type: "interactive", kind: "note", title: "Rencana Perbaikan", reason: "Pilih kebiasaan digital yang ingin kamu perbaiki minggu ini.", choices: ["Batasi notifikasi", "Jeda layar", "Fokus tugas", "Tidur lebih teratur"] },
        { type: "game", id: "pattern-quiz", reason: "Melatih fokus singkat dan kesadaran pola sebelum merefleksikan kebiasaan digital." },
      ],
    }),
  },
  "inf9-6": {
    focus: "projek akhir integrasi Fase D",
    frame: "menggabungkan masalah, data, algoritma, produk digital, dan presentasi menjadi karya akhir",
    example: "Proyek pemetaan sampah sekolah bisa memakai data lokasi, analisis pola, rancangan solusi digital, dan presentasi hasil.",
    product: "kanvas proyek akhir",
    concepts: ["Masalah", "Data", "Algoritma", "Produk", "Presentasi"],
    quest: topic => ({
      mission: `Lengkapi bagian proyek akhir yang berhubungan dengan ${topic.toLowerCase()}.`,
      activities: [
        { type: "interactive", kind: "sequence", title: "Alur Projek Akhir", reason: "Susun urutan kerja proyek dari masalah sampai presentasi.", steps: ["Pilih masalah", "Kumpulkan data", "Rancang algoritma", "Buat produk", "Presentasikan"], answer: ["Pilih masalah", "Kumpulkan data", "Rancang algoritma", "Buat produk", "Presentasikan"] },
        { type: "interactive", kind: "decompose", title: "Pecah Proyek", reason: "Pilih komponen proyek yang perlu disiapkan.", items: ["Masalah", "Data", "Solusi", "Produk digital", "Pembagian tugas"] },
        { type: "lab", id: "sorting", reason: "Membantu melihat bagaimana data proyek dapat diurutkan, dibandingkan, dan dianalisis sebelum dipresentasikan." },
      ],
    }),
  },

  // ===== KKA KELAS 7 =====
  "kka7-1": {
    focus: "pengelolaan data dan berpikir komputasional dasar",
    frame: "cara mengumpulkan, menyusun, menemukan pola, dan menyajikan informasi sederhana dari aktivitas nyata",
    example: "Daftar tugas kelas bisa disusun sebagai tabel dengan atribut nama, tanggal, dan status selesai, sehingga kita bisa melihat pola siapa yang paling konsisten.",
    product: "tabel data sederhana dari aktivitas sekolah",
    concepts: ["Data", "Atribut", "Pola", "Representasi"],
    quest: topic => ({
      mission: `Kumpulkan dan susun contoh ${topic.toLowerCase()} dari kegiatan sehari-hari di sekolah.`,
      activities: [
        { type: "interactive", kind: "table", title: "Buat Tabel Data Mini", reason: "Pilih objek dan atribut untuk menyusun informasi sederhana dari aktivitas sekolah." },
        { type: "interactive", kind: "classify", title: "Kenali Jenis Data", reason: "Tentukan apakah contoh termasuk data, atribut, atau pola.", choices: ["Data", "Atribut", "Pola", "Informasi"], items: ["Nama siswa", "Kolom 'Kelas'", "Selalu terlambat Senin", "Nilai rata-rata naik"], answer: { "Nama siswa": "Data", "Kolom 'Kelas'": "Atribut", "Selalu terlambat Senin": "Pola", "Nilai rata-rata naik": "Informasi" } },
        { type: "lab", id: "dataset-labeling", reason: "Mempraktikkan pemberian label data dan melihat dampaknya pada pola yang dipelajari AI." },
      ],
    }),
  },
  "kka7-2": {
    focus: "pemecahan masalah sistematis dan instruksi",
    frame: "cara memecah masalah menjadi langkah instruksi yang jelas, terurut, dan dapat dievaluasi",
    example: "Membuat jadwal belajar butuh langkah: inventaris mata pelajaran, cek waktu kosong, urutkan prioritas, lalu susun jam belajar per hari.",
    product: "diagram instruksi langkah demi langkah",
    concepts: ["Masalah", "Instruksi", "Langkah", "Evaluasi"],
    quest: topic => ({
      mission: `Susun langkah instruksi sistematis untuk menyelesaikan masalah yang berkaitan dengan ${topic.toLowerCase()}.`,
      activities: [
        { type: "interactive", kind: "sequence", title: "Susun Instruksi", reason: "Klik urutan langkah yang paling logis untuk menyelesaikan masalah.", steps: ["Kenali masalah", "Pecah bagian", "Susun langkah", "Uji solusi", "Perbaiki"], answer: ["Kenali masalah", "Pecah bagian", "Susun langkah", "Uji solusi", "Perbaiki"] },
        { type: "game", id: "sort-race", reason: "Melatih logika urutan — menyusun elemen dalam susunan yang benar, fondasi dari instruksi sistematis." },
        { type: "game", id: "flowchart-builder", reason: "Mengubah instruksi sistematis menjadi alur yang bisa diuji." },
      ],
    }),
  },
  "kka7-3": {
    focus: "konten digital dasar berupa slide dan infografis",
    frame: "cara merancang visual yang ringkas, jelas, dan sesuai audiens untuk menyampaikan pesan",
    example: "Infografis tentang kebiasaan belajar lebih efektif jika menggunakan ikon, angka kunci, dan kalimat pendek daripada paragraf penuh.",
    product: "rancangan slide atau infografis satu topik",
    concepts: ["Pesan", "Visual", "Audiens", "Ringkas"],
    quest: topic => ({
      mission: `Buat keputusan desain untuk ${topic.toLowerCase()} agar konten lebih mudah dipahami audiens.`,
      activities: [
        { type: "interactive", kind: "classify", title: "Pilih Format Terbaik", reason: "Tentukan format paling cocok untuk menyampaikan berbagai jenis informasi.", choices: ["Slide", "Infografis", "Teks panjang", "Tabel"], items: ["Langkah-langkah singkat", "Data perbandingan", "Penjelasan mendalam", "Angka kunci"], answer: { "Langkah-langkah singkat": "Infografis", "Data perbandingan": "Tabel", "Penjelasan mendalam": "Teks panjang", "Angka kunci": "Infografis" } },
        { type: "interactive", kind: "evaluate", title: "Cek Kualitas Visual", reason: "Centang kriteria konten visual yang efektif.", items: ["Pesan utama jelas", "Teks ringkas", "Visual relevan", "Audiens sesuai", "Sumber dicantumkan"] },
        { type: "game", id: "prompt-craft", reason: "Melatih cara meminta bantuan AI untuk memperbaiki konten tanpa mengorbankan konteks dan etika." },
      ],
    }),
  },
  "kka7-4": {
    focus: "etika digital dan diseminasi konten",
    frame: "cara mempertimbangkan hak cipta, privasi, dan dampak konten sebelum menyebarkannya",
    example: "Sebelum unggah video tugas berisi lagu, perlu mengecek apakah musik itu bebas digunakan — tidak semua lagu boleh dipakai untuk konten edukasi.",
    product: "checklist konten aman sebelum disebarkan",
    concepts: ["Etika", "Izin", "Privasi", "Dampak"],
    quest: topic => ({
      mission: `Periksa apakah contoh konten atau tindakan digital sudah memenuhi standar ${topic.toLowerCase()}.`,
      activities: [
        { type: "interactive", kind: "checklist", title: "Cek Konten Sebelum Bagikan", reason: "Centang hal yang perlu dipastikan sebelum menyebarkan konten.", items: ["Tujuan jelas", "Tidak mengandung data pribadi orang lain", "Aset yang digunakan legal", "Tidak menyinggung atau merugikan"] },
        { type: "interactive", kind: "classify", title: "Etis atau Tidak?", reason: "Tentukan apakah tindakan berikut aman, perlu izin, atau tidak etis.", choices: ["Aman", "Perlu izin", "Tidak etis"], items: ["Pakai foto sendiri", "Salin gambar tanpa sumber", "Bagikan video teman tanpa izin"], answer: { "Pakai foto sendiri": "Aman", "Salin gambar tanpa sumber": "Tidak etis", "Bagikan video teman tanpa izin": "Perlu izin" } },
        { type: "lab", id: "sift-check", reason: "Menguatkan kebiasaan menahan, memeriksa, dan memilih keputusan sebelum menyebarkan klaim digital." },
        { type: "game", id: "license-quest", reason: "Berlatih memilih kapan aset digital boleh dipakai, perlu atribusi, atau harus izin." },
      ],
    }),
  },
  "kka7-5": {
    focus: "literasi dan etika kecerdasan artifisial",
    frame: "cara kerja AI, proses belajar mesin dari data, potensi bias, dan tanggung jawab etis penggunaan AI",
    example: "AI pengenal wajah belajar dari ribuan foto. Jika data latihannya kurang beragam, AI bisa salah mengenali wajah dengan latar belakang berbeda — contoh bias data.",
    product: "peta konsep cara kerja AI sederhana",
    concepts: ["AI", "Data Latih", "Pola", "Bias", "Etika"],
    quest: topic => ({
      mission: `Identifikasi contoh ${topic.toLowerCase()} dari teknologi yang kamu gunakan sehari-hari.`,
      activities: [
        { type: "interactive", kind: "classify", title: "AI atau Bukan?", reason: "Tentukan mana teknologi yang memakai AI dan mana yang tidak.", choices: ["Menggunakan AI", "Bukan AI"], items: ["Rekomendasi lagu otomatis", "Kalkulator sederhana", "Filter foto wajah", "Tombol lampu on/off"], answer: { "Rekomendasi lagu otomatis": "Menggunakan AI", "Kalkulator sederhana": "Bukan AI", "Filter foto wajah": "Menggunakan AI", "Tombol lampu on/off": "Bukan AI" } },
        { type: "lab", id: "dataset-labeling", reason: "Menunjukkan bahwa AI belajar dari data berlabel dan dapat bias jika datanya kurang baik." },
        { type: "lab", id: "image-classifier", reason: "Melihat langsung bagaimana AI mengenali pola dari gambar yang kamu buat sendiri." },
        { type: "game", id: "pattern-quiz", reason: "Melatih pengenalan pola — dasar cara kerja sistem kecerdasan buatan." },
      ],
    }),
  },
  "kka7-6": {
    focus: "pemanfaatan kecerdasan artifisial sederhana",
    frame: "jenis alat AI, cara menggunakannya, manfaat, batas kemampuan, dan praktik bertanggung jawab",
    example: "Chatbot bisa membantu meringkas teks, tetapi jawabannya perlu dicek karena bisa keliru atau memakai informasi yang sudah usang.",
    product: "evaluasi penggunaan satu AI tool secara kritis",
    concepts: ["AI Tool", "Manfaat", "Batas", "Tanggung Jawab"],
    quest: topic => ({
      mission: `Evaluasi penggunaan ${topic.toLowerCase()} dan tentukan kapan memakai AI dengan bertanggung jawab.`,
      activities: [
        { type: "interactive", kind: "evaluate", title: "Evaluasi AI Tool", reason: "Centang aspek yang perlu dicek sebelum mengandalkan AI tool.", items: ["Cek keakuratan jawaban", "Verifikasi ke sumber asli", "Perhatikan batas topiknya", "Tidak bagikan data pribadi ke AI"] },
        { type: "game", id: "prompt-craft", reason: "Berlatih memilih prompt yang jelas, aman, dan tetap mendukung proses belajar." },
        { type: "lab", id: "dataset-labeling", reason: "Menghubungkan batas AI tool dengan kualitas data yang dipakai untuk melatihnya." },
        { type: "lab", id: "image-classifier", reason: "Melihat langsung bagaimana AI melakukan klasifikasi dan memahami batasnya." },
      ],
    }),
  },

  // ===== KKA KELAS 8 =====
  "kka8-1": {
    focus: "pengolahan data dengan spreadsheet",
    frame: "formula, fungsi statistik, pembuatan grafik, filter, dan interpretasi untuk menganalisis data nyata",
    example: "Spreadsheet nilai kelas bisa diolah dengan AVERAGE, grafik batang perkembangan belajar, dan filter per mata pelajaran untuk menemukan tren.",
    product: "rancangan spreadsheet analisis data",
    concepts: ["Formula", "Fungsi", "Grafik", "Kesimpulan"],
    quest: topic => ({
      mission: `Gunakan konsep ${topic.toLowerCase()} untuk menganalisis satu dataset sederhana.`,
      activities: [
        { type: "interactive", kind: "classify", title: "Cocokkan Fitur Spreadsheet", reason: "Pilih fitur yang tepat untuk setiap kebutuhan analisis.", choices: ["Formula", "Fungsi Statistik", "Grafik", "Filter"], items: ["Jumlahkan total nilai", "Hitung rata-rata kelas", "Tampilkan tren waktu", "Lihat data satu kelas saja"], answer: { "Jumlahkan total nilai": "Formula", "Hitung rata-rata kelas": "Fungsi Statistik", "Tampilkan tren waktu": "Grafik", "Lihat data satu kelas saja": "Filter" } },
        { type: "lab", id: "sorting", reason: "Melihat bagaimana data diurutkan untuk membantu menemukan pola." },
        { type: "lab", id: "spreadsheet-mini", reason: "Mempraktikkan formula dan fungsi spreadsheet pada data kelas." },
      ],
    }),
  },
  "kka8-2": {
    focus: "instruksi kompleks dan pemrograman visual",
    frame: "membangun program dengan percabangan kondisional, perulangan, dan fungsi menggunakan blok visual",
    example: "Program kuis interaktif butuh percabangan (cek benar/salah), perulangan (tampilkan soal berikutnya), dan fungsi (hitung skor akhir).",
    product: "rancangan program visual dengan logika percabangan",
    concepts: ["Kondisi", "Percabangan", "Perulangan", "Fungsi"],
    quest: topic => ({
      mission: `Rancang alur program yang menggunakan ${topic.toLowerCase()} untuk menyelesaikan masalah sederhana.`,
      activities: [
        { type: "interactive", kind: "sequence", title: "Susun Alur Program", reason: "Klik urutan komponen program yang paling logis.", steps: ["Input", "Cek kondisi", "Jalankan percabangan", "Ulang bila perlu", "Tampilkan output"], answer: ["Input", "Cek kondisi", "Jalankan percabangan", "Ulang bila perlu", "Tampilkan output"] },
        { type: "game", id: "bug-hunter", reason: "Melatih membaca logika program dan menemukan kesalahan instruksi." },
        { type: "game", id: "flowchart-builder", reason: "Menyusun alur program visual dari input, kondisi, perulangan, sampai output." },
      ],
    }),
  },
  "kka8-3": {
    focus: "produksi konten audio dan video",
    frame: "perencanaan storyboard, perekaman, editing dasar, dan publikasi konten multimedia yang bertanggung jawab",
    example: "Video tips belajar yang baik dimulai dari storyboard, direkam dengan pencahayaan cukup, diedit dengan transisi sederhana, lalu diunggah ke platform yang sesuai audiens.",
    product: "storyboard dan rencana produksi video pendek",
    concepts: ["Storyboard", "Rekam", "Edit", "Publikasi"],
    quest: topic => ({
      mission: `Rencanakan atau evaluasi proses produksi konten yang berkaitan dengan ${topic.toLowerCase()}.`,
      activities: [
        { type: "interactive", kind: "sequence", title: "Alur Produksi Konten", reason: "Susun urutan yang benar dalam proses produksi video.", steps: ["Tentukan tema", "Buat storyboard", "Rekam", "Edit", "Publikasikan"], answer: ["Tentukan tema", "Buat storyboard", "Rekam", "Edit", "Publikasikan"] },
        { type: "interactive", kind: "checklist", title: "Cek Sebelum Publikasi", reason: "Pastikan konten memenuhi standar sebelum dipublikasikan.", items: ["Kualitas audio jelas", "Tidak ada data pribadi tanpa izin", "Sumber musik/aset legal", "Pesan sesuai audiens"] },
        { type: "game", id: "storyboard-sprint", reason: "Mempraktikkan urutan produksi konten dari storyboard sampai publikasi etis." },
      ],
    }),
  },
  "kka8-4": {
    focus: "etika, hak cipta, dan diseminasi konten digital",
    frame: "lisensi Creative Commons, batasan plagiarisme, strategi distribusi, dan konsekuensi hukum pelanggaran hak cipta",
    example: "Gambar di internet bisa punya lisensi CC-BY (boleh dipakai dengan menyebut sumber), CC-NC (tidak untuk komersial), atau hak cipta penuh (perlu izin eksplisit).",
    product: "panduan hak cipta dan strategi distribusi konten",
    concepts: ["Lisensi", "Sumber", "Distribusi", "Konsekuensi"],
    quest: topic => ({
      mission: `Tentukan cara yang benar untuk menggunakan atau mendistribusikan konten sesuai ${topic.toLowerCase()}.`,
      activities: [
        { type: "interactive", kind: "classify", title: "Boleh atau Tidak?", reason: "Tentukan apakah tindakan berikut legal, perlu izin, atau melanggar hak cipta.", choices: ["Legal", "Perlu izin", "Melanggar"], items: ["Pakai gambar CC-BY dengan sumber", "Salin artikel tanpa menyebut penulis", "Gunakan musik CC-0 untuk video edukasi"], answer: { "Pakai gambar CC-BY dengan sumber": "Legal", "Salin artikel tanpa menyebut penulis": "Melanggar", "Gunakan musik CC-0 untuk video edukasi": "Legal" } },
        { type: "interactive", kind: "checklist", title: "Distribusi Konten Aman", reason: "Centang langkah yang memastikan konten disebarkan secara etis.", items: ["Cek lisensi aset", "Cantumkan sumber", "Pilih platform sesuai audiens", "Hormati privasi orang yang tampil"] },
        { type: "game", id: "license-quest", reason: "Menguatkan keputusan penggunaan aset dan lisensi sebelum publikasi konten." },
        { type: "game", id: "storyboard-sprint", reason: "Melatih keputusan publikasi konten yang aman, jelas, dan sesuai audiens." },
      ],
    }),
  },
  "kka8-5": {
    focus: "literasi dan etika kecerdasan artifisial tingkat lanjut",
    frame: "perbedaan cara manusia dan KA memproses informasi, sensor digital, KA sebagai alat bantu manusia, kualitas data latih, bias, dan risiko platform digital",
    example: "Sistem AI rekrutmen kerja yang dilatih dari data historis bisa mewarisi bias gender atau latar belakang dari keputusan masa lalu perusahaan.",
    product: "analisis manfaat dan risiko satu sistem AI",
    concepts: ["Manusia vs KA", "Sensor", "Data Latih", "Bias", "Platform Digital"],
    quest: topic => ({
      mission: `Analisis aspek ${topic.toLowerCase()} pada satu sistem AI yang kamu kenal.`,
      activities: [
        { type: "interactive", kind: "classify", title: "Masalah Etika AI", reason: "Kelompokkan skenario AI berdasarkan isu etis yang muncul.", choices: ["Bias", "Privasi", "Transparansi", "Regulasi"], items: ["AI rekrutmen hanya merekomendasikan pria", "Aplikasi merekam lokasi tanpa izin", "AI membuat keputusan tanpa penjelasan", "AI medis tanpa standar keamanan"], answer: { "AI rekrutmen hanya merekomendasikan pria": "Bias", "Aplikasi merekam lokasi tanpa izin": "Privasi", "AI membuat keputusan tanpa penjelasan": "Transparansi", "AI medis tanpa standar keamanan": "Regulasi" } },
        { type: "lab", id: "ai-bias-audit", reason: "Menguatkan audit risiko bias, privasi, dan transparansi pada sistem AI." },
        { type: "game", id: "ai-ethics", reason: "Berlatih mengambil keputusan etis dalam skenario AI nyata." },
      ],
    }),
  },
  "kka8-6": {
    focus: "eksperimen data latih dan klasifikasi kecerdasan artifisial",
    frame: "cara menyiapkan data latih berlabel, melatih model klasifikasi, mengukur akurasi, dan menguji model",
    example: "Untuk membuat AI mengenali jenis sampah (organik/anorganik), kita butuh ratusan foto berlabel per kategori sebagai data latih.",
    product: "rancangan eksperimen data latih dan klasifikasi",
    concepts: ["Data Latih", "Label", "Training", "Akurasi", "Uji"],
    quest: topic => ({
      mission: `Rancang atau evaluasi eksperimen ${topic.toLowerCase()} untuk model klasifikasi sederhana.`,
      activities: [
        { type: "interactive", kind: "sequence", title: "Alur Training Model", reason: "Susun urutan proses melatih model AI.", steps: ["Kumpulkan data", "Beri label", "Latih model", "Ukur akurasi", "Uji data baru"], answer: ["Kumpulkan data", "Beri label", "Latih model", "Ukur akurasi", "Uji data baru"] },
        { type: "lab", id: "neural-playground", reason: "Eksperimen melatih jaringan saraf dan melihat akurasi berubah secara langsung." },
        { type: "lab", id: "ai-bias-audit", reason: "Mengaudit risiko jika data latih kurang beragam atau labelnya tidak jelas." },
        { type: "lab", id: "image-classifier", reason: "Melihat bagaimana AI mengklasifikasi input visual." },
      ],
    }),
  },

  // ===== KKA KELAS 9 =====
  "kka9-1": {
    focus: "spreadsheet dan analisis data lanjutan",
    frame: "fungsi kompleks, pivot table, visualisasi lanjutan, analisis tren, dan pengambilan keputusan berbasis data",
    example: "Pivot table merangkum penjualan kantin per kategori dan per hari dalam hitungan detik, mengungkap tren yang tidak terlihat di data mentah.",
    product: "laporan analisis data berbasis spreadsheet",
    concepts: ["Fungsi Lanjutan", "Pivot", "Tren", "Keputusan"],
    quest: topic => ({
      mission: `Terapkan ${topic.toLowerCase()} untuk menganalisis dataset dan menarik kesimpulan yang didukung data.`,
      activities: [
        { type: "interactive", kind: "classify", title: "Pilih Analisis Tepat", reason: "Tentukan teknik analisis terbaik untuk setiap pertanyaan.", choices: ["Fungsi lanjutan", "Pivot table", "Grafik tren", "Filter bertingkat"], items: ["Ringkasan total per kategori", "Lihat perubahan dari waktu ke waktu", "Hitung persentase dengan rumus", "Tampilkan data sesuai beberapa kriteria"], answer: { "Ringkasan total per kategori": "Pivot table", "Lihat perubahan dari waktu ke waktu": "Grafik tren", "Hitung persentase dengan rumus": "Fungsi lanjutan", "Tampilkan data sesuai beberapa kriteria": "Filter bertingkat" } },
        { type: "lab", id: "sorting", reason: "Melihat bagaimana pengurutan dan pengelompokan data mendukung analisis." },
        { type: "lab", id: "spreadsheet-mini", reason: "Menerapkan operasi spreadsheet mini untuk menghasilkan insight dari data." },
      ],
    }),
  },
  "kka9-2": {
    focus: "algoritma dan program visual lanjutan",
    frame: "merancang algoritma efisien, memilih struktur data yang tepat, dan menguji solusi program visual yang kompleks",
    example: "Binary search jauh lebih cepat dari linear search untuk data besar. Memilih algoritma yang tepat bisa menghemat detik hingga jam waktu komputasi.",
    product: "rancangan algoritma lanjutan dengan analisis efisiensi",
    concepts: ["Algoritma", "Struktur Data", "Efisiensi", "Uji"],
    quest: topic => ({
      mission: `Rancang dan evaluasi solusi algoritmik menggunakan ${topic.toLowerCase()}.`,
      activities: [
        { type: "interactive", kind: "evaluate", title: "Evaluasi Algoritma", reason: "Cek kriteria algoritma yang efisien dan dapat diandalkan.", items: ["Hasilnya benar", "Efisien untuk data besar", "Bisa diterapkan ke data baru", "Mudah dipahami", "Telah diuji dengan data tepi"] },
        { type: "lab", id: "sorting", reason: "Membandingkan efisiensi berbagai algoritma sorting secara visual." },
        { type: "lab", id: "python-trace", reason: "Menelusuri output dan jumlah langkah algoritma sebelum implementasi." },
        { type: "game", id: "search-rescue", reason: "Menguatkan pilihan algoritma pencarian yang efisien." },
        { type: "game", id: "bug-hunter", reason: "Berlatih menemukan dan memperbaiki kesalahan logika dalam program." },
        { type: "game", id: "flowchart-builder", reason: "Menguatkan rancangan algoritma dan pseudocode sebelum implementasi." },
      ],
    }),
  },
  "kka9-3": {
    focus: "produksi konten digital lanjutan",
    frame: "strategi konten, identitas visual (branding), produksi multimedia kompleks, kolaborasi tim, dan evaluasi dampak",
    example: "Kampanye digital sekolah butuh identitas visual konsisten (warna, font, tone), konten terencana, pembagian tugas tim, dan metrik untuk mengukur keberhasilan.",
    product: "rencana kampanye konten digital",
    concepts: ["Strategi", "Branding", "Kolaborasi", "Evaluasi"],
    quest: topic => ({
      mission: `Rancang keputusan strategis untuk aspek ${topic.toLowerCase()} dalam kampanye konten digital.`,
      activities: [
        { type: "interactive", kind: "decompose", title: "Komponen Kampanye", reason: "Pilih elemen yang harus ada dalam rencana kampanye konten.", items: ["Tujuan kampanye", "Target audiens", "Identitas visual", "Jadwal konten", "Cara mengukur keberhasilan"] },
        { type: "interactive", kind: "evaluate", title: "Evaluasi Kampanye", reason: "Centang indikator keberhasilan kampanye digital.", items: ["Pesan konsisten", "Audiens merespons", "Konten sesuai platform", "Tim berkoordinasi", "Ada data untuk perbaikan"] },
        { type: "game", id: "pattern-quiz", reason: "Melatih membaca pola respons audiens dan memilih strategi konten yang lebih terarah." },
        { type: "game", id: "license-quest", reason: "Menguatkan keputusan lisensi dan atribusi dalam produksi konten digital." },
      ],
    }),
  },
  "kka9-4": {
    focus: "strategi diseminasi dan advokasi literasi digital",
    frame: "menganalisis audiens, merancang strategi multi-platform, mengevaluasi analytics, memahami filter bubble, echo chamber, plagiarisme digital, dan menyusun portofolio",
    example: "Siswa bisa membuat kampanye #CekSebelumBagikan di media sosial sekolah untuk mendorong teman menguji fakta sebelum menyebarkan informasi.",
    product: "rencana advokasi literasi digital dan portofolio KKA",
    concepts: ["Audiens", "Strategi", "Analytics", "Etika Lanjutan", "Advokasi"],
    quest: topic => ({
      mission: `Rancang strategi ${topic.toLowerCase()} untuk mendorong penggunaan teknologi yang lebih bertanggung jawab.`,
      activities: [
        { type: "interactive", kind: "sequence", title: "Alur Advokasi Digital", reason: "Susun langkah kampanye literasi digital yang efektif.", steps: ["Pilih isu", "Kenali audiens", "Buat pesan kunci", "Pilih platform", "Ukur dampak"], answer: ["Pilih isu", "Kenali audiens", "Buat pesan kunci", "Pilih platform", "Ukur dampak"] },
        { type: "interactive", kind: "note", title: "Pilih Platform Advokasi", reason: "Tentukan platform yang paling tepat untuk menjangkau teman sebaya.", choices: ["Instagram Stories", "Video pendek", "Poster digital", "Diskusi kelas"] },
        { type: "game", id: "ai-ethics", reason: "Membantu menimbang dampak keputusan teknologi sebelum menyusun pesan advokasi literasi digital." },
        { type: "lab", id: "sift-check", reason: "Mempraktikkan pemeriksaan klaim sebagai dasar advokasi literasi digital." },
      ],
    }),
  },
  "kka9-5": {
    focus: "literasi kecerdasan artifisial tentang keamanan data dan deepfake",
    frame: "ancaman deepfake, cara mendeteksi manipulasi berbasis AI, perlindungan data lanjutan, dan kerangka regulasi",
    example: "Deepfake adalah konten gambar/video yang dibuat AI untuk memperlihatkan seseorang melakukan atau mengatakan sesuatu yang tidak pernah terjadi — bisa digunakan untuk penyebaran hoaks.",
    product: "panduan deteksi deepfake dan perlindungan data di era AI",
    concepts: ["DeepFake", "Manipulasi", "Deteksi", "Perlindungan"],
    quest: topic => ({
      mission: `Identifikasi ancaman dan langkah perlindungan terkait ${topic.toLowerCase()}.`,
      activities: [
        { type: "interactive", kind: "checklist", title: "Cara Deteksi DeepFake", reason: "Centang tanda yang membantu mendeteksi konten yang dimanipulasi AI.", items: ["Gerakan tidak alami di tepi wajah", "Pencahayaan tidak konsisten", "Sumber tidak dapat diverifikasi", "Konteks terlalu dramatis atau mengejutkan"] },
        { type: "interactive", kind: "classify", title: "Ancaman AI vs Solusi", reason: "Cocokkan ancaman keamanan AI dengan langkah mitigasinya.", choices: ["Enkripsi data", "Verifikasi sumber", "Regulasi AI", "Edukasi pengguna"], items: ["Data bocor dari aplikasi AI", "Video deepfake menyebar", "AI digunakan tanpa pengawasan", "Pengguna tidak menyadari manipulasi"], answer: { "Data bocor dari aplikasi AI": "Enkripsi data", "Video deepfake menyebar": "Verifikasi sumber", "AI digunakan tanpa pengawasan": "Regulasi AI", "Pengguna tidak menyadari manipulasi": "Edukasi pengguna" } },
        { type: "lab", id: "image-classifier", reason: "Menunjukkan secara langsung bagaimana sistem AI membaca fitur visual dan mengapa hasil prediksi perlu dikritisi." },
        { type: "lab", id: "sift-check", reason: "Menguatkan kebiasaan verifikasi konteks saat menghadapi konten manipulatif." },
        { type: "game", id: "deepfake-detective", reason: "Melatih keputusan cepat saat menemukan tanda manipulasi AI pada video, foto, atau audio." },
      ],
    }),
  },
  "kka9-6": {
    focus: "proyek akhir integrasi KKA Fase D",
    frame: "menganalisis penerapan KA, dampak jangka panjang, penggunaan KA generatif, perancangan produk dengan Design Thinking, implementasi iteratif, dan presentasi proyek akhir",
    example: "Proyek akhir berbasis KA bisa dimulai dari masalah nyata, lalu memakai Design Thinking untuk merancang produk digital, menguji prototipe, dan merefleksikan dampaknya.",
    product: "produk digital berbasis KA dengan dokumentasi dan presentasi akhir",
    concepts: ["KA", "Dampak", "Design Thinking", "Produk Digital", "Refleksi"],
    quest: topic => ({
      mission: `Kerjakan bagian proyek akhir yang berkaitan dengan ${topic.toLowerCase()}.`,
      activities: [
        { type: "interactive", kind: "sequence", title: "Alur Proyek Akhir KKA", reason: "Susun urutan pengerjaan proyek dari awal sampai presentasi.", steps: ["Pilih masalah", "Kumpulkan data", "Analisis & rancang solusi", "Buat prototipe digital", "Presentasikan"], answer: ["Pilih masalah", "Kumpulkan data", "Analisis & rancang solusi", "Buat prototipe digital", "Presentasikan"] },
        { type: "interactive", kind: "evaluate", title: "Cek Kesiapan Proyek", reason: "Pastikan semua komponen proyek sudah siap.", items: ["Masalah jelas dan relevan", "Data mendukung solusi", "Prototipe digital berfungsi", "Presentasi ringkas dan jelas", "Refleksi mencakup pelajaran yang didapat"] },
        { type: "lab", id: "neural-playground", reason: "Memberi contoh konkret bagaimana data, pelatihan, akurasi, dan iterasi bisa masuk ke proyek akhir berbasis KA." },
      ],
    }),
  },
};

function getCuratedModuleLesson(mod, topic) {
  const profile = MODULE_PROFILES[mod.id];
  if (!profile) return null;
  const topicLower = topic.toLowerCase();
  const concept = `${topic} dipelajari sebagai bagian dari ${profile.focus}. Fokusnya adalah ${profile.frame}, bukan sekadar menghafal istilah.`;
  const example = profile.example;
  const reflection = `Coba hubungkan ${topicLower} dengan pengalamanmu. Jika kamu bisa memberi contoh, menjelaskan risikonya, dan memilih tindakan yang tepat, berarti pengayaan ini sudah mulai bekerja.`;
  return {
    title: `${topic}: ${mod.title}`,
    intro: concept,
    printGuide: `Baca bagian modul cetak yang membahas ${topicLower}. Gunakan SIGMA untuk memperdalamnya lewat contoh, simulasi singkat, dan ${profile.product}.`,
    prompt: `Keputusan apa yang lebih baik jika kamu memahami ${topicLower}?`,
    blocks: [
      { label: "Konsep Inti", text: concept },
      { label: "Contoh Dekat", text: example },
      { label: "Refleksi", text: reflection },
    ],
    activity: `Buat ${profile.product} yang menunjukkan pemahamanmu tentang ${topicLower}.`,
    checks: [
      `Apa arti ${topicLower} dalam modul ini?`,
      "Contoh apa yang paling dekat dengan sekolah atau rumah?",
      "Risiko apa yang muncul jika konsep ini diabaikan?",
      "Tindakan atau keputusan apa yang paling tepat?",
    ],
  };
}

function getCuratedModuleQuest(mod, topic, topicIndex) {
  const profile = MODULE_PROFILES[mod.id];
  if (!profile) return null;
  const quest = profile.quest(topic);
  const idx = topicIndex || 0;
  const concepts = profile.concepts || [];
  const topicLower = topic.toLowerCase();

  // 6 rotating interactive activity types — each lesson looks distinct
  const topicShort = topic.split(":")[0].split("&")[0].trim();
  const interactiveVariants = [
    { kind: "classify",
      title: `Klasifikasi: ${topic}`,
      reason: `Kelompokkan konsep ke dalam kategori yang tepat sesuai ${topicLower}.`,
      choices: ["Inti dari topik ini", "Pendukung", "Tidak langsung relevan"],
      items: concepts.slice(0, 4).length >= 2 ? concepts.slice(0, 4) : [`Konsep inti ${topicShort}`, "Pendekatan lain", "Contoh penerapan", "Konsep terkait"],
    },
    { kind: "sequence",
      title: `Alur Pemahaman: ${topic}`,
      reason: `Susun langkah yang logis untuk memahami dan menerapkan ${topicLower}.`,
      steps: [`Kenali konsep ${topicShort}`, "Temukan contoh nyata di sekitar", "Analisis keterkaitan dengan kehidupan", "Terapkan dalam situasi baru", "Refleksikan apa yang dipahami"],
    },
    { kind: "decompose",
      title: `Komponen: ${topic}`,
      reason: `Pilih elemen kunci yang membentuk ${topicLower}.`,
      items: concepts.slice(0, 5).length >= 3 ? concepts.slice(0, 5) : ["Tujuan", "Proses", "Hasil", "Dampak", "Evaluasi"],
    },
    { kind: "evaluate",
      title: `Evaluasi Diri: ${topic}`,
      reason: `Centang hal-hal tentang ${topicLower} yang sudah kamu kuasai.`,
      items: ["Saya memahami konsep dasarnya", "Saya bisa memberi contoh nyata", "Saya tahu dampak dan risikonya", "Saya bisa menjelaskan ke teman"],
      fixes: ["Baca ulang materi di modul", "Coba contoh di kehidupan nyata", "Tanya AI Tutor", "Diskusi dengan guru"],
    },
    { kind: "checklist",
      title: `Cek Pemahaman: ${topic}`,
      reason: `Tandai konsep penting dari ${topicLower} yang sudah kamu pelajari.`,
      items: concepts.slice(0, 4).length >= 2 ? concepts.slice(0, 4) : ["Konsep dipahami", "Contoh ditemukan", "Dampak dianalisis", "Tindakan dipilih"],
    },
    { kind: "note",
      title: `Refleksi: ${topic}`,
      reason: `Pilih aspek ${topicLower} yang paling menarik atau relevan dengan pengalamanmu.`,
      choices: concepts.slice(0, 4).length >= 2 ? concepts.slice(0, 4) : ["Contoh nyata", "Dampak sehari-hari", "Cara kerja teknisnya", "Penerapan praktis"],
    },
  ];

  // Primary activity rotates by topic index; secondary offset by 3 for variety
  const primary = { type: "interactive", ...interactiveVariants[idx % 6] };
  const secondary = { type: "interactive", ...interactiveVariants[(idx + 3) % 6] };

  // Keep any lab/game from the original quest
  const extras = (quest.activities || []).filter(a => a.type === "lab" || a.type === "game");

  return {
    title: `Misi: ${topic}`,
    mission: quest.mission,
    concepts: quest.concepts || profile.concepts,
    activities: [primary, ...(extras.length > 0 ? extras.slice(0, 3) : [secondary])],
  };
}

function getFunFact(id) {
  const facts = {
    "inf7-1": "Istilah 'algoritma' berasal dari nama matematikawan Al-Khwarizmi. Resep, jadwal piket, dan instruksi permainan juga bisa dibaca sebagai algoritma.",
    "inf7-2": "Komputer modern tetap bekerja dengan pola sederhana: menerima input, memprosesnya, menyimpan data bila perlu, lalu menghasilkan output.",
    "inf7-3": "Internet bukan satu tempat, melainkan jaringan dari banyak jaringan. Saat membuka situs, perangkatmu bertukar paket data dengan beberapa komputer lain.",
    "inf7-4": "Kata kunci yang tepat bisa mengubah hasil pencarian secara drastis. Menambahkan tanda kutip membantu mencari frasa yang persis sama.",
    "inf7-5": "Hoaks sering terasa meyakinkan karena memakai emosi kuat, judul provokatif, atau angka tanpa konteks. Berhenti sebentar sebelum membagikan itu sudah langkah literasi digital.",
    "inf7-6": "Ruang digital tetap ruang sosial. Komentar singkat bisa meninggalkan dampak panjang karena mudah disalin, disimpan, dan disebarkan.",
    "inf8-1": "Python list adalah struktur data paling fleksibel — bisa menyimpan angka, teks, atau bahkan list di dalam list. List juga jadi fondasi implementasi Queue dan Stack paling sederhana di Python.",
    "inf8-2": "Stack LIFO dipakai di browser (tombol Back), fungsi rekursif, dan fitur Undo. Setiap kali memanggil fungsi di Python, sebuah 'frame' ditambahkan ke call stack — itulah mengapa stack overflow bisa terjadi.",
    "inf8-3": "Spreadsheet populer karena satu perubahan data bisa langsung memperbarui rumus, tabel, dan grafik yang terhubung.",
    "inf8-4": "Presentasi yang baik bukan slide paling ramai, melainkan slide yang membantu audiens menangkap ide utama dengan cepat.",
    "inf8-5": "Python Pillow bisa membuat ribuan gambar dari template secara otomatis — dari sertifikat, label produk, sampai infografis data. Programmer menggunakannya untuk produksi konten massal tanpa desain manual.",
    "inf8-6": "Keamanan digital bekerja dari kebiasaan kecil: password unik, tidak membagikan OTP, waspada phishing, memperbarui perangkat, dan tahu mana informasi privat atau publik.",
    "inf9-1": "Python adalah bahasa pemrograman terpopuler di dunia sejak 2022. Nama Python bukan dari ular, melainkan dari acara komedi Inggris 'Monty Python's Flying Circus'.",
    "inf9-2": "Pseudocode membantu kita fokus pada logika dulu sebelum memikirkan bahasa pemrograman atau tampilan blok visual.",
    "inf9-3": "Jejak digital bisa berasal dari unggahan sendiri, komentar orang lain, tag foto, riwayat pencarian, sampai data lokasi.",
    "inf9-4": "Data pribadi bukan hanya nama dan alamat. Foto wajah, lokasi, nomor perangkat, dan pola kebiasaan juga bisa mengidentifikasi seseorang.",
    "inf9-5": "Kesejahteraan digital bukan anti-teknologi. Intinya adalah memakai teknologi dengan sadar agar tetap mendukung belajar, relasi, dan kesehatan.",
    "inf9-6": "Proyek akhir yang kuat biasanya mulai dari masalah yang jelas, bukan dari alat. Setelah masalahnya terang, teknologi dipilih sebagai solusi.",
  };
  const kkaFacts = {
    "kka7-1": "Cara kita mengatur data mencerminkan cara kita berpikir. Daftar belanja yang rapi, jadwal terstruktur, dan tabel nilai adalah data yang diorganisasi agar lebih mudah digunakan.",
    "kka7-2": "Resep masakan adalah algoritma — urutan langkah yang jelas dan bisa diikuti siapa saja. Pemecahan masalah sistematis bekerja dengan prinsip yang persis sama.",
    "kka7-3": "Manusia memproses gambar 60.000 kali lebih cepat dari teks. Itulah mengapa infografis dan slide yang baik selalu memprioritaskan visual di atas paragraf panjang.",
    "kka7-4": "Hak cipta berlaku otomatis sejak karya dibuat, bahkan tanpa simbol ©. Ketika membagikan karya orang lain, selalu periksa lisensi dan minta izin jika belum yakin.",
    "kka7-5": "AI tidak benar-benar 'mengerti' — ia menemukan pola dari data. Semakin beragam datanya, semakin baik pola yang dipelajari. Itulah mengapa data latih berkualitas sangat penting.",
    "kka7-6": "AI Tutor, rekomendasi lagu, filter kamera, dan terjemahan otomatis semuanya memakai kecerdasan buatan. Memahami cara kerjanya membantu kita menggunakan teknologi lebih bijak.",
    "kka8-1": "Spreadsheet modern menghitung ulang ribuan sel secara instan saat satu angka berubah — dulu ini dikerjakan manual oleh tim akuntan seharian penuh.",
    "kka8-2": "Pemrograman visual seperti Scratch dipakai jutaan siswa di seluruh dunia. Prinsipnya sama persis dengan kode teks, hanya lebih mudah dibaca dan dipahami.",
    "kka8-3": "Satu menit video memerlukan lebih banyak data daripada ribuan halaman teks. Itulah mengapa kompresi video menjadi teknologi krusial dalam streaming modern.",
    "kka8-4": "Creative Commons dibuat pada 2001 untuk memudahkan berbagi karya sambil tetap melindungi hak pencipta. Jutaan karya sudah menggunakan lisensi ini di seluruh dunia.",
    "kka8-5": "Bias dalam AI bukan hanya masalah teknis, tapi juga masalah sosial. Semakin beragam tim yang merancang AI, semakin besar kemungkinan bias terdeteksi lebih awal.",
    "kka8-6": "Model AI seperti GPT dilatih dengan triliunan kata teks. Data latih yang besar dan beragam adalah kunci utama kemampuan AI yang canggih.",
    "kka9-1": "Pivot table ditemukan pada 1994 di Excel. Teknologi ini mengubah cara analis melihat data dan masih menjadi fitur paling sering digunakan di spreadsheet modern.",
    "kka9-2": "Binary search 10 kali lebih cepat dari linear search untuk data besar. Memilih algoritma yang tepat bisa menghemat detik, menit, bahkan jam waktu komputasi.",
    "kka9-3": "Identitas visual yang konsisten membangun kepercayaan. Merek besar memiliki panduan desain setebal buku untuk memastikan konsistensi di setiap konten yang mereka buat.",
    "kka9-4": "Kampanye literasi digital terbesar di dunia dimulai dari proyek kecil di sekolah. Perubahan besar sering berawal dari advokasi lokal yang gigih.",
    "kka9-5": "Deepfake pertama kali muncul pada 2017. Sejak itu, teknologi deteksinya terus berkejaran dengan teknologi pembuatnya — seperti perlombaan antara kunci dan gembok.",
    "kka9-6": "Proyek akhir bukan tentang sempurna, tetapi tentang proses. Ilmuwan dan insinyur terbaik pun memulai dari prototipe sederhana yang kemudian terus diperbaiki.",
  };
  if (id.startsWith("kka")) return kkaFacts[id] || "Setiap modul KKA menyiapkan kamu untuk memahami dan memanfaatkan teknologi secara cerdas dan bertanggung jawab.";
  return facts[id] || "Setiap konsep di modul ini punya cerita sejarah yang menarik — tanya AI Tutor buat tau lebih banyak!";
}

function getQuizQuestions(id) {
  // Semua 36 modul punya bank soal statis (tanpa kunci) di quiz-bank-public.js.
  return (window.QUIZ_BANK_V2 && window.QUIZ_BANK_V2[id]) || [];
}

function getSimulatedReply(q, mod) {
  const ql = q.toLowerCase();
  if (ql.includes("apa itu") || ql.includes("jelasin")) {
    return `Oke! Topik "${mod.title}" pada dasarnya adalah ${mod.tagline.toLowerCase()} ${mod.description.split(".")[0]}. Mau aku jelasin lebih dalam bagian mana? 🤔`;
  }
  if (ql.includes("contoh")) {
    return `Contoh konkret dari modul ini: ${mod.topics[Math.floor(Math.random() * mod.topics.length)]}. Mau aku kasih contoh langkah demi langkah? 📝`;
  }
  if (ql.includes("susah") || ql.includes("ga ngerti") || ql.includes("bingung")) {
    return `Tenang, wajar kok bingung di awal. Coba kita pecah jadi potongan kecil: mulai dari konsep paling dasar dulu, yaitu ${mod.topics[0]}. Mau? 💪`;
  }
  if (ql.includes("tips") || ql.includes("cara")) {
    return `Tips belajar modul ini: (1) Baca materi sambil catat kata kunci, (2) Langsung coba di playground/lab, (3) Kerjain kuis buat ngetes pemahaman. Gak perlu ngebut, santai aja 😊`;
  }
  return `Pertanyaan bagus! Topik "${mod.title}" memang mencakup ${mod.topics.slice(0, 3).join(", ")}. Untuk jawaban lebih spesifik, coba lanjut baca materi di tab "Materi" — atau tanya lebih detail lagi ya! 💡`;
}

function getTutorSuggestions(mod) {
  const base = ["Jelasin konsep dasarnya dong", "Kasih contoh gampang"];
  const s = {
    informatika: ["Apa hubungannya sama kehidupan sehari-hari?", "Topik mana yang paling penting?"],
    kka: ["Apa bedanya sama teknologi sebelumnya?", "Gimana cara kerjanya simpelnya?"],
  };
  return [...base, ...(s[mod.subject] || [])];
}

window.ModuleDetail = ModuleDetail;
