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
  const [xpInfo, setXpInfo] = useState(null);

  const score = questions.reduce((sum, q, i) => sum + (answers[i] === q.correct ? 1 : 0), 0);
  const answeredCount = Object.keys(answers).length;
  const percent = questions.length ? Math.round((score / questions.length) * 100) : 0;
  const quizRecord = window.USER.quizzes?.[mod.id];
  const quizLocked = !!quizRecord && !submitted;
  const potentialXp = getQuizXpPreview(score);
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

  const finishQuiz = (nextAnswers) => {
    const finalScore = questions.reduce((sum, q, i) => sum + (nextAnswers[i] === q.correct ? 1 : 0), 0);
    const finalPercent = questions.length ? Math.round((finalScore / questions.length) * 100) : 0;
    const before = window.USER.xp || 0;
    window.SIGMA_AUTH.completeQuiz(mod.id, finalScore, questions.length);
    const gained = Math.max(0, (window.USER.xp || 0) - before);
    setXpInfo({ gained, potentialXp: getQuizXpPreview(finalScore) });
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
            <QuizStat label="Potensi XP" value={potentialXp} color="var(--gold-500)"/>
            {started && !submitted && <QuizStat label="Waktu" value={formatQuizTime(remainingSeconds)} color={remainingSeconds <= 180 ? "var(--red-500)" : subject.color}/>}
            {submitted && <QuizStat label="Skor" value={`${score}/${questions.length}`} color={score >= questions.length * 0.7 ? "var(--green-500)" : score >= questions.length / 2 ? "var(--orange-500)" : "var(--red-500)"}/>}
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
                const correct = submitted && answers[i] === questions[i].correct;
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
            {questions.map((q, i) => {
              const correct = answers[i] === q.correct;
              return (
                <div key={i} style={{ padding: 16, borderRadius: 14, background: correct ? "#D1FAE5" : "#FEE2E2", border: `1.5px solid ${correct ? "var(--green-500)" : "var(--red-500)"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: correct ? "var(--green-500)" : "var(--red-500)" }}>Soal {i + 1} • {correct ? "Benar" : "Perlu cek"}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--navy-950)", lineHeight: 1.45 }}>{q.q}</div>
                  <div style={{ marginTop: 8, fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5 }}>
                    Jawabanmu: <strong>{answers[i] === undefined ? "Belum dijawab" : q.options[answers[i]]}</strong><br/>
                    Jawaban tepat: <strong>{q.options[q.correct]}</strong><br/>
                    {q.explain}
                  </div>
                </div>
              );
            })}
          </div>
          )}

        {submitted && <NextStepCard mod={mod}/>}

        <div style={{ display: "flex", gap: 10, marginTop: 24, padding: 14, background: "white", border: "1.5px solid var(--line)", borderRadius: 14, position: "sticky", bottom: 16, zIndex: 2, boxShadow: "var(--shadow-soft)" }}>
          {!started && !submitted ? (
            <button className={`btn ${subject.btnClass}`} disabled={!integrityAccepted} onClick={() => setStarted(true)} style={{ width: "100%", justifyContent: "center" }}>
              <Icon.Play width="16" height="16"/> Mulai Kuis
            </button>
          ) : !submitted ? (
            <button className={`btn ${subject.btnClass}`} disabled={!currentAnswered} onClick={submitCurrent} style={{ width: "100%", justifyContent: "center" }}>
              {currentIndex === questions.length - 1 ? "Selesaikan Kuis" : "Kirim & Lanjut"} ({answeredCount}/{questions.length})
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
  const mod = window.CURRICULUM.modules.find(m => m.id === id);
  // Bank soal kontekstual v2 (file js/data/quiz-bank-v2.js) diutamakan bila tersedia.
  if (window.QUIZ_BANK_V2 && Array.isArray(window.QUIZ_BANK_V2[id]) && window.QUIZ_BANK_V2[id].length) {
    return window.QUIZ_BANK_V2[id];
  }
  const banks = {
    "inf7-1": [
      { difficulty: "Mudah",
        q: "Kelas 7B ingin membuat jadwal piket yang adil. Langkah dekomposisi yang paling tepat adalah...",
        options: ["Membagi masalah menjadi siswa, hari, aturan, dan cek keadilan", "Meminta ketua kelas memilih sendiri tanpa aturan giliran", "Membuat tabel warna-warni lalu mengisi nama secara acak", "Menyalin jadwal kelas lain tanpa menyesuaikan jumlah siswa"],
        correct: 0, explain: "Dekomposisi memecah masalah besar menjadi bagian kecil yang bisa ditangani." },
      { difficulty: "Mudah",
        q: "Saat mencari pola keterlambatan siswa, data yang paling berguna untuk dibandingkan adalah...",
        options: ["Hari, jam datang, alasan, dan jumlah kejadian terlambat", "Warna tas, merek sepatu, dan bekal yang dibawa siswa", "Nama guru favorit, posisi duduk, dan warna buku catatan", "Ukuran ruang kelas, warna papan tulis, dan jumlah spidol"],
        correct: 0, explain: "Pola ditemukan dari data yang relevan dengan kejadian yang dianalisis." },
      { difficulty: "Mudah",
        q: "Dalam abstraksi, mengapa beberapa detail perlu diabaikan?",
        options: ["Agar fokus pada informasi penting untuk menyelesaikan masalah", "Agar jawaban terlihat sederhana meskipun belum diuji", "Agar semua contoh dipaksa sama walau kondisinya berbeda", "Agar masalah bisa dilewati tanpa memahami penyebabnya"],
        correct: 0, explain: "Abstraksi memilih detail penting dan mengabaikan detail yang tidak memengaruhi solusi." },
      { difficulty: "Mudah",
        q: "Algoritma yang baik untuk teman sekelas seharusnya...",
        options: ["Jelas, berurutan, dan bisa dilakukan oleh orang lain", "Rahasia, singkat, dan hanya dimengerti pembuatnya", "Selalu berupa kode komputer meskipun masalahnya sederhana", "Panjang dan rumit supaya terlihat seperti pekerjaan besar"],
        correct: 0, explain: "Algoritma adalah urutan langkah yang jelas dan dapat dijalankan." },
      { difficulty: "Sedang",
        q: "Rani menulis langkah: 'Buka aplikasi, kirim tugas, pilih file, login'. Bagian yang perlu dievaluasi adalah...",
        options: ["Urutan langkahnya, karena login biasanya dilakukan sebelum kirim tugas", "Warna aplikasi, karena warna menentukan tugas pasti terkirim", "Nama file saja, karena semua kegagalan pasti berasal dari nama file", "Jumlah langkah saja, karena algoritma yang benar selalu berisi 10 langkah"],
        correct: 0, explain: "Evaluasi solusi memeriksa apakah urutan dan logika langkah sudah masuk akal." },
      { difficulty: "Sedang",
        q: "Sekolah ingin mengurangi antrean kantin. Contoh dekomposisi yang baik adalah...",
        options: ["Pisahkan waktu ramai, jumlah penjual, menu populer, dan alur bayar", "Mengganti semua menu tanpa mengecek penyebab antrean lebih dulu", "Meminta semua siswa tidak jajan agar antrean langsung hilang", "Menganggap kantin kurang menarik tanpa melihat data kunjungan"],
        correct: 0, explain: "Dekomposisi membantu melihat beberapa penyebab yang mungkin berkontribusi pada masalah." },
      { difficulty: "Sedang",
        q: "Dalam kasus perpustakaan sepi pengunjung, pernyataan mana yang masih berupa dugaan pola dan perlu bukti?",
        options: ["Pengunjung berkurang setiap Jumat karena ada kegiatan lain", "Perpustakaan memiliki rak buku dan meja baca untuk siswa", "Ada petugas perpustakaan yang menjaga saat jam sekolah", "Siswa boleh membaca buku di tempat pada waktu istirahat"],
        correct: 0, explain: "Dugaan pola perlu dibuktikan dengan data beberapa kejadian, bukan satu pengamatan saja." },
      { difficulty: "Sedang",
        q: "Saat membuat denah dari gerbang ke ruang komputer, detail yang paling penting adalah...",
        options: ["Titik awal, arah belok, ruang yang dilewati, dan tujuan", "Warna sepatu siswa yang kebetulan berjalan di koridor", "Merek tas siswa yang membawa laptop menuju ruang komputer", "Lagu yang terdengar dari kelas lain saat jam istirahat"],
        correct: 0, explain: "Denah membutuhkan detail yang membantu orang mencapai tujuan." },
      { difficulty: "Sedang",
        q: "Sebuah instruksi berbunyi: 'Jika printer mati, cetak dokumen'. Apa kelemahan logikanya?",
        options: ["Kondisinya tidak masuk akal karena printer mati tidak bisa mencetak", "Instruksinya terlalu pendek sehingga otomatis dianggap benar", "Instruksinya harus memakai bahasa Inggris agar terlihat teknis", "Instruksinya tidak boleh memakai kata jika dalam algoritma"],
        correct: 0, explain: "Percabangan harus masuk akal terhadap kondisi yang terjadi." },
      { difficulty: "Sulit",
        q: "Kelompok A membuat solusi: 'Agar kelas bersih, semua siswa harus sadar'. Mengapa solusi ini lemah menurut BK?",
        options: ["Belum ada langkah, pembagian tugas, atau cara mengecek hasil", "Terlalu singkat sehingga semua bagian solusinya pasti salah", "Tidak memakai komputer sehingga bukan bagian dari informatika", "Tidak menyebut nama semua siswa sehingga tidak bisa dibaca"],
        correct: 0, explain: "Solusi perlu dibuat menjadi langkah konkret yang dapat dijalankan dan dievaluasi." },
      { difficulty: "Sulit",
        q: "Siswa melihat nilai kuis meningkat setelah latihan 10 menit setiap hari selama dua minggu. Kesimpulan yang paling hati-hati adalah...",
        options: ["Latihan mungkin membantu, tetapi data dan faktor lain perlu dicek", "Latihan pasti satu-satunya penyebab semua nilai menjadi naik", "Nilai naik hanya karena kebetulan dan tidak perlu dianalisis", "Semua siswa pasti akan mendapat nilai sempurna setelah latihan"],
        correct: 0, explain: "Pengenalan pola harus diikuti sikap hati-hati agar tidak menarik kesimpulan berlebihan." },
      { difficulty: "Sulit",
        q: "Ketika menguji algoritma meminjam buku, contoh uji yang paling baik adalah...",
        options: ["Mencoba kondisi buku tersedia dan kondisi buku tidak tersedia", "Hanya membaca langkah tanpa mencoba pada situasi nyata", "Mengubah warna kartu perpustakaan agar terlihat lebih rapi", "Menanyakan satu teman apakah ia suka membaca buku cerita"],
        correct: 0, explain: "Evaluasi algoritma perlu contoh uji untuk kondisi berbeda." },
      { difficulty: "Sulit",
        q: "Dalam membuat aturan pemilihan ketua kelompok, mengapa abstraksi penting?",
        options: ["Agar kriteria relevan, misalnya tanggung jawab dan kerja sama", "Agar semua detail pribadi dimasukkan ke aturan pemilihan", "Agar keputusan bisa dibuat cepat tanpa alasan yang jelas", "Agar aturan hanya diketahui oleh beberapa anggota kelompok"],
        correct: 0, explain: "Abstraksi membantu memilih kriteria yang relevan dengan tujuan." },
      { difficulty: "HOTS",
        q: "Sekolah ingin membuat sistem antre peminjaman laptop. Urutan berpikir komputasional yang paling kuat adalah...",
        options: ["Pahami masalah, pecah bagian, cari pola, pilih detail, susun langkah, lalu uji", "Langsung membuat poster antrean tanpa melihat penyebab masalah", "Memilih aplikasi paling populer lalu memakainya untuk semua kasus", "Menunggu masalah hilang sendiri setelah beberapa hari berjalan"],
        correct: 0, explain: "HOTS BK menuntut gabungan dekomposisi, pola, abstraksi, algoritma, dan evaluasi." },
      { difficulty: "HOTS",
        q: "Dua solusi jadwal piket sama-sama selesai dibuat. Solusi A lebih sederhana, semua siswa mendapat giliran, dan mudah dicek. Solusi B lebih indah tetapi ada siswa yang tidak mendapat giliran. Pilihan terbaik adalah...",
        options: ["Solusi A, karena memenuhi tujuan dan mudah dicek adil", "Solusi B, karena tampilan menarik selalu lebih penting", "Solusi B, karena jadwal rumit biasanya dianggap lebih baik", "Keduanya sama saja meskipun ada hasil yang berbeda"],
        correct: 0, explain: "Evaluasi solusi melihat kecocokan dengan tujuan, keadilan, dan keterujian, bukan hanya tampilan." },
    ],
    "inf7-2": [
      { difficulty: "Mudah",
        q: "Saat Raka mengetik jawaban di keyboard lalu melihat teks muncul di layar, pasangan input dan output yang tepat adalah...",
        options: ["Keyboard sebagai input dan layar sebagai output", "Layar sebagai input dan keyboard sebagai output", "CPU sebagai output dan mouse sebagai penyimpanan", "Flashdisk sebagai proses dan monitor sebagai input"],
        correct: 0, explain: "Keyboard memberi masukan, komputer memprosesnya, lalu layar menampilkan hasil." },
      { difficulty: "Mudah",
        q: "Contoh proses pada komputer paling tepat ditunjukkan oleh...",
        options: ["Aplikasi menghitung total nilai dari data yang dimasukkan", "Siswa menekan tombol huruf pada keyboard", "Monitor menampilkan gambar hasil presentasi", "Flashdisk menyimpan salinan file tugas"],
        correct: 0, explain: "Proses terjadi saat komputer mengolah data atau instruksi menjadi hasil." },
      { difficulty: "Mudah",
        q: "Jika sebuah file tetap ada setelah komputer dimatikan, bagian yang paling berperan adalah...",
        options: ["Penyimpanan seperti SSD, hard disk, atau flashdisk", "Layar yang menampilkan isi file saat komputer menyala", "Speaker yang mengeluarkan bunyi dari aplikasi", "Mouse yang dipakai untuk memilih ikon file"],
        correct: 0, explain: "Penyimpanan menyimpan data agar bisa dibuka lagi di waktu berikutnya." },
      { difficulty: "Mudah",
        q: "Perangkat lunak yang paling tepat untuk menulis laporan sekolah adalah...",
        options: ["Aplikasi pengolah kata karena dirancang untuk mengetik dan menyusun dokumen", "Kabel HDMI karena bisa menghubungkan layar ke perangkat", "RAM karena menyimpan kerja sementara saat aplikasi berjalan", "Printer karena mencetak dokumen setelah selesai dibuat"],
        correct: 0, explain: "Perangkat lunak adalah program yang menjalankan fungsi tertentu, misalnya pengolah kata." },
      { difficulty: "Sedang",
        q: "Laptop lambat saat banyak aplikasi dibuka sekaligus. Dugaan awal yang masuk akal adalah...",
        options: ["Memori kerja sedang penuh sehingga proses aplikasi berebut sumber daya", "Monitor terlalu terang sehingga semua program pasti berhenti", "Keyboard rusak sehingga internet menjadi lebih lambat", "Nama file terlalu pendek sehingga komputer sulit membaca data"],
        correct: 0, explain: "Banyak aplikasi dapat membebani RAM dan proses komputer." },
      { difficulty: "Sedang",
        q: "Printer menyala, tetapi dokumen tidak tercetak. Langkah troubleshooting yang paling runtut adalah...",
        options: ["Cek koneksi, pilih printer yang benar, lihat antrean cetak, lalu coba ulang", "Langsung membeli printer baru karena semua printer lama pasti rusak", "Menghapus seluruh file tugas agar antrean cetak menjadi kosong", "Mengganti wallpaper komputer supaya printer mengenali perangkat"],
        correct: 0, explain: "Troubleshooting dilakukan bertahap dari kemungkinan yang paling sederhana dan relevan." },
      { difficulty: "Sedang",
        q: "Sebuah aplikasi menggambar tidak mau terbuka karena ruang penyimpanan hampir penuh. Solusi paling tepat adalah...",
        options: ["Menghapus atau memindahkan file yang tidak diperlukan sebelum membuka aplikasi", "Menekan tombol power berulang-ulang agar aplikasi dipaksa berjalan", "Mengganti warna ikon aplikasi supaya sistem membaca ulang program", "Membuka lebih banyak aplikasi agar komputer bekerja lebih cepat"],
        correct: 0, explain: "Ruang penyimpanan yang penuh dapat mengganggu aplikasi dan penyimpanan data baru." },
      { difficulty: "Sedang",
        q: "Ketika kamera laptop digunakan untuk rapat daring, peran kamera dalam sistem komputer adalah...",
        options: ["Input karena menangkap gambar dari lingkungan pengguna", "Output karena mengeluarkan suara dari aplikasi", "Penyimpanan karena menyimpan semua video otomatis", "Proses karena menghitung semua data di CPU"],
        correct: 0, explain: "Kamera menangkap data visual sebagai masukan ke komputer." },
      { difficulty: "Sedang",
        q: "Jika siswa ingin menjelaskan cara kerja komputer secara sederhana, urutan paling tepat adalah...",
        options: ["Input masuk, data diproses, hasil ditampilkan, data bisa disimpan", "Output masuk, penyimpanan berbicara, input menghapus data, proses berhenti", "Data disimpan dulu tanpa masukan lalu layar memilih jawabannya", "Aplikasi mencetak dokumen sebelum komputer menerima instruksi"],
        correct: 0, explain: "Model input-proses-output-penyimpanan membantu memahami alur kerja komputer." },
      { difficulty: "Sulit",
        q: "Suara video tidak terdengar, tetapi gambar berjalan normal. Bagian yang paling perlu diperiksa lebih dulu adalah...",
        options: ["Volume, perangkat output audio, dan izin suara pada aplikasi", "Kapasitas SSD karena semua masalah video berasal dari penyimpanan", "Ukuran monitor karena layar menentukan keras kecilnya suara", "Nama folder video karena suara hanya keluar dari folder tertentu"],
        correct: 0, explain: "Karena masalahnya suara, pemeriksaan awal harus fokus pada output audio dan pengaturannya." },
      { difficulty: "Sulit",
        q: "Guru meminta siswa membedakan perangkat keras dan perangkat lunak. Contoh pasangan yang tepat adalah...",
        options: ["Mouse adalah perangkat keras, aplikasi browser adalah perangkat lunak", "Browser adalah perangkat keras, mouse adalah perangkat lunak", "File foto adalah perangkat keras, monitor adalah perangkat lunak", "Keyboard adalah perangkat lunak, sistem operasi adalah kabel"],
        correct: 0, explain: "Perangkat keras bisa disentuh secara fisik, sedangkan perangkat lunak berupa program." },
      { difficulty: "Sulit",
        q: "Sebuah komputer sering mati mendadak saat dipakai bermain gim berat. Kesimpulan yang paling hati-hati adalah...",
        options: ["Perlu memeriksa panas perangkat, daya, dan beban kerja sebelum menyimpulkan penyebabnya", "Pasti karena pengguna salah mengetik password saat komputer dinyalakan", "Pasti karena monitor terlalu kecil untuk menampilkan gim berat", "Tidak perlu dicek karena komputer selalu mati saat digunakan serius"],
        correct: 0, explain: "Troubleshooting yang baik memeriksa beberapa kemungkinan berdasarkan gejala." },
      { difficulty: "Sulit",
        q: "Saat membuat diagram IPO untuk mesin presensi, contoh data input yang paling relevan adalah...",
        options: ["Kartu atau sidik jari siswa yang dibaca oleh alat presensi", "Warna dinding ruangan tempat alat presensi dipasang", "Merek sepatu siswa yang sedang berdiri di antrean", "Lagu yang diputar saat siswa masuk ke sekolah"],
        correct: 0, explain: "Input harus berupa data yang dipakai sistem untuk menghasilkan keputusan atau keluaran." },
      { difficulty: "HOTS",
        q: "Tablet kelas tidak bisa membuka video pembelajaran karena internet normal tetapi ruang penyimpanan penuh. Keputusan terbaik adalah...",
        options: ["Membersihkan file tidak penting atau cache, lalu mencoba membuka video kembali", "Mengganti password WiFi karena semua masalah video pasti dari jaringan", "Membuka banyak tab baru supaya tablet mencari ruang penyimpanan sendiri", "Menghapus aplikasi belajar utama agar semua materi tidak perlu diputar"],
        correct: 0, explain: "Solusi harus sesuai gejala: internet normal, masalahnya ruang penyimpanan." },
      { difficulty: "HOTS",
        q: "Siswa ingin membeli perangkat untuk membuat video tugas. Pertimbangan paling lengkap adalah...",
        options: ["Kamera/mikrofon sebagai input, penyimpanan cukup, proses lancar, dan output layar jelas", "Hanya memilih warna perangkat yang paling menarik bagi kelompok", "Memilih perangkat dengan layar terbesar tanpa melihat kebutuhan tugas", "Membeli perangkat paling mahal karena pasti cocok untuk semua kondisi"],
        correct: 0, explain: "Pemilihan perangkat sebaiknya melihat kebutuhan input, proses, penyimpanan, dan output." },
    ],
    "inf7-3": [
      { difficulty: "Mudah",
        q: "Saat membuka laman SIGMA dari laptop, perangkat yang biasanya menghubungkan laptop ke jaringan rumah/sekolah adalah...",
        options: ["Router atau access point yang meneruskan koneksi jaringan", "Printer yang mencetak data dari semua perangkat", "Speaker yang mengubah data menjadi suara", "Flashdisk yang menyimpan file tanpa internet"],
        correct: 0, explain: "Router/access point membantu perangkat terhubung ke jaringan dan internet." },
      { difficulty: "Mudah",
        q: "Contoh jaringan lokal paling tepat adalah...",
        options: ["Beberapa komputer di laboratorium sekolah saling terhubung", "Satu buku catatan dipinjam bergantian oleh siswa", "Satu kalkulator digunakan tanpa terhubung ke perangkat lain", "Satu poster ditempel di papan pengumuman kelas"],
        correct: 0, explain: "Jaringan lokal menghubungkan perangkat dalam area terbatas seperti lab atau sekolah." },
      { difficulty: "Mudah",
        q: "Alamat IP pada jaringan berfungsi seperti...",
        options: ["Alamat perangkat agar data bisa dikirim ke tujuan yang tepat", "Warna tampilan aplikasi agar halaman terlihat menarik", "Nama file yang menentukan besar kecilnya layar", "Kata sandi yang selalu boleh dibagikan ke teman"],
        correct: 0, explain: "Alamat IP membantu perangkat dikenali dalam komunikasi jaringan." },
      { difficulty: "Mudah",
        q: "Jika WiFi terhubung tetapi situs tidak bisa dibuka, langkah awal yang masuk akal adalah...",
        options: ["Cek apakah internet benar-benar aktif dan coba buka situs lain", "Menghapus semua dokumen di laptop agar jaringan bersih", "Mengganti ukuran huruf browser supaya server merespons", "Mencabut keyboard karena keyboard mengatur sinyal WiFi"],
        correct: 0, explain: "Pemeriksaan awal perlu membedakan masalah WiFi lokal, internet, atau situs tujuan." },
      { difficulty: "Sedang",
        q: "Urutan perjalanan data saat membuka situs paling masuk akal adalah...",
        options: ["Perangkat, router, penyedia internet, server, lalu respons kembali", "Server, printer, buku tulis, keyboard, lalu respons kembali", "Monitor, speaker, meja, router, lalu alamat rumah", "Flashdisk, kamera, papan tulis, browser, lalu layar mati"],
        correct: 0, explain: "Permintaan web biasanya melewati perangkat, jaringan lokal, internet, server, lalu kembali sebagai respons." },
      { difficulty: "Sedang",
        q: "Mengapa jaringan sekolah sebaiknya diberi password?",
        options: ["Agar akses lebih terkendali dan tidak semua orang bisa masuk jaringan", "Agar semua siswa pasti mendapat nilai kuis lebih tinggi", "Agar monitor komputer menyala lebih terang dari biasanya", "Agar file di flashdisk berubah menjadi file internet"],
        correct: 0, explain: "Password jaringan membantu membatasi akses dan mengurangi risiko penyalahgunaan." },
      { difficulty: "Sedang",
        q: "Dua siswa memakai jaringan yang sama. Satu bisa membuka situs, satu tidak. Dugaan paling tepat adalah...",
        options: ["Masalah mungkin ada pada perangkat atau pengaturan siswa kedua", "Semua jaringan sekolah pasti rusak total", "Server situs pasti hilang dari internet", "Printer kelas membuat koneksi siswa kedua lambat"],
        correct: 0, explain: "Jika pengguna lain normal, pemeriksaan bisa diarahkan ke perangkat atau pengaturan yang bermasalah." },
      { difficulty: "Sedang",
        q: "Paket data dalam jaringan dapat dipahami sebagai...",
        options: ["Potongan data kecil yang dikirim melalui jalur jaringan", "Kotak fisik yang harus dibawa siswa ke ruang server", "Buku cetak yang selalu dikirim lewat kantor pos", "Gambar dekorasi yang muncul di layar browser"],
        correct: 0, explain: "Data di jaringan dikirim dalam bagian-bagian kecil agar dapat diarahkan dan dirakit kembali." },
      { difficulty: "Sedang",
        q: "Saat menggunakan WiFi umum, kebiasaan yang paling aman adalah...",
        options: ["Menghindari login akun penting dan memastikan alamat situs benar", "Membagikan password semua akun agar koneksi lebih cepat", "Menonaktifkan semua pembaruan keamanan perangkat", "Mengunggah foto kartu pelajar agar jaringan mengenali pengguna"],
        correct: 0, explain: "WiFi umum memiliki risiko lebih tinggi sehingga akses sensitif perlu dihindari." },
      { difficulty: "Sulit",
        q: "Jika banyak siswa streaming video bersamaan, jaringan terasa lambat. Penyebab yang paling masuk akal adalah...",
        options: ["Bandwidth dipakai banyak perangkat sehingga lalu lintas data padat", "Semua layar komputer berubah menjadi perangkat penyimpanan", "Alamat IP setiap perangkat otomatis menjadi sama persis", "Keyboard siswa mengirim terlalu banyak huruf ke router"],
        correct: 0, explain: "Banyak aktivitas data besar dapat memenuhi kapasitas jaringan." },
      { difficulty: "Sulit",
        q: "Siswa mendapat pesan 'alamat situs tidak ditemukan'. Pemeriksaan yang paling relevan adalah...",
        options: ["Cek penulisan alamat situs dan coba sumber/mesin pencari tepercaya", "Mengubah warna mouse karena mouse menentukan alamat situs", "Mencetak halaman kosong agar browser menemukan server", "Menghapus semua foto di galeri agar alamat situs kembali"],
        correct: 0, explain: "Alamat salah atau situs tidak tersedia dapat membuat browser gagal menemukan tujuan." },
      { difficulty: "Sulit",
        q: "Mengapa data yang dikirim lewat internet perlu dilindungi?",
        options: ["Karena data bisa melewati banyak jaringan sebelum sampai tujuan", "Karena semua data internet selalu berubah menjadi suara", "Karena router hanya bisa membaca file yang dicetak", "Karena monitor menyimpan semua password secara otomatis"],
        correct: 0, explain: "Data melewati infrastruktur jaringan, sehingga keamanan dan privasi perlu diperhatikan." },
      { difficulty: "Sulit",
        q: "Ketika guru meminta peta jaringan sederhana, komponen yang paling penting ditampilkan adalah...",
        options: ["Perangkat pengguna, router/access point, internet, dan server tujuan", "Warna meja, posisi kursi, merek sepatu, dan jadwal piket", "Nama semua siswa, tinggi badan, makanan favorit, dan lagu kelas", "Jumlah poster, ukuran papan tulis, warna pintu, dan jam dinding"],
        correct: 0, explain: "Peta jaringan harus menampilkan komponen yang berperan dalam komunikasi data." },
      { difficulty: "HOTS",
        q: "Di lab komputer, semua perangkat tidak bisa internet, tetapi masih bisa berbagi file lokal. Kesimpulan terbaik adalah...",
        options: ["Jaringan lokal mungkin berjalan, tetapi koneksi ke internet perlu diperiksa", "Semua komputer pasti rusak dan harus diganti seluruhnya", "File lokal membuktikan internet sudah sangat cepat", "Monitor lab menghalangi data masuk ke server sekolah"],
        correct: 0, explain: "Bisa berbagi lokal berarti LAN mungkin aktif, sedangkan akses internet adalah masalah berbeda." },
      { difficulty: "HOTS",
        q: "Siswa ingin menjelaskan mengapa video call bisa putus-putus. Jawaban paling kuat adalah...",
        options: ["Koneksi membutuhkan pengiriman data terus-menerus; jika jaringan padat atau tidak stabil, audio-video terganggu", "Video call putus karena kamera selalu menyimpan data terlalu banyak di flashdisk", "Video call putus karena layar tidak cukup besar untuk menampilkan wajah teman", "Video call putus karena semua router hanya boleh dipakai untuk membuka teks"],
        correct: 0, explain: "Video call memerlukan koneksi stabil karena data audio dan video dikirim hampir real-time." },
    ],
    "inf7-4": [
      { difficulty: "Mudah",
        q: "Saat mencari informasi tentang 'dampak sampah plastik di sekolah', kata kunci yang paling tepat adalah...",
        options: ["dampak sampah plastik sekolah", "semua hal yang ada di dunia", "gambar lucu tempat sampah", "plastik bagus sekali menurutku"],
        correct: 0, explain: "Kata kunci yang spesifik membantu mesin pencari menemukan hasil yang lebih relevan." },
      { difficulty: "Mudah",
        q: "Hasil pencarian yang lebih layak dipercaya biasanya memiliki...",
        options: ["Penulis/sumber jelas, tanggal, dan bukti atau rujukan", "Judul paling heboh dan banyak huruf kapital", "Gambar paling ramai tanpa keterangan sumber", "Komentar terbanyak walau isinya saling bertentangan"],
        correct: 0, explain: "Kualitas informasi dilihat dari sumber, bukti, konteks, dan keterbaruan." },
      { difficulty: "Mudah",
        q: "Jika hasil pencarian terlalu umum, strategi yang paling membantu adalah...",
        options: ["Menambah kata kunci pembatas seperti lokasi, tahun, atau topik khusus", "Menghapus semua kata kunci sampai tinggal satu huruf", "Membuka hasil pertama tanpa membaca judulnya", "Mengganti bahasa keyboard agar internet lebih cepat"],
        correct: 0, explain: "Pembatas membuat pencarian lebih fokus pada kebutuhan informasi." },
      { difficulty: "Mudah",
        q: "Kredibilitas sumber berarti...",
        options: ["Tingkat kepercayaan sumber berdasarkan identitas, bukti, dan rekam jejak", "Ukuran gambar yang tampil paling besar di halaman web", "Jumlah warna pada desain halaman sumber informasi", "Kecepatan mengetik siswa saat memasukkan kata kunci"],
        correct: 0, explain: "Sumber kredibel dapat ditelusuri dan didukung bukti yang memadai." },
      { difficulty: "Sedang",
        q: "Siswa menemukan artikel kesehatan tanpa nama penulis dan tanpa tanggal. Sikap terbaik adalah...",
        options: ["Membandingkan dengan sumber kesehatan resmi sebelum mempercayai", "Langsung membagikan karena topiknya terlihat penting", "Menganggap benar karena artikelnya panjang dan banyak iklan", "Menghapus semua sumber lain agar artikel itu menjadi satu-satunya rujukan"],
        correct: 0, explain: "Informasi penting perlu dicek ke sumber yang jelas dan tepercaya." },
      { difficulty: "Sedang",
        q: "Untuk tugas sekolah, mengapa jejak sumber perlu dicatat?",
        options: ["Agar pembaca tahu dari mana informasi diambil dan bisa mengeceknya", "Agar daftar tugas terlihat lebih panjang daripada isi tugas", "Agar semua gambar bebas dipakai tanpa izin", "Agar mesin pencari berhenti menampilkan hasil lain"],
        correct: 0, explain: "Jejak sumber membantu transparansi, pemeriksaan ulang, dan menghargai karya orang lain." },
      { difficulty: "Sedang",
        q: "Dua situs memberi data berbeda tentang topik yang sama. Langkah evaluasi terbaik adalah...",
        options: ["Cek sumber data, tanggal, metode, dan apakah ada rujukan pendukung", "Memilih situs dengan warna paling cerah agar mudah dibaca", "Memilih data yang paling sesuai keinginan kelompok", "Menggabungkan angka tanpa mencatat asal datanya"],
        correct: 0, explain: "Perbedaan informasi perlu dievaluasi dari sumber, waktu, dan cara data diperoleh." },
      { difficulty: "Sedang",
        q: "Judul 'Mengejutkan! Semua Siswa Wajib Beli Aplikasi Ini!' sebaiknya dibaca sebagai...",
        options: ["Klaim yang perlu dicek karena memakai gaya bombastis", "Sumber resmi karena tanda serunya banyak", "Fakta pasti karena judulnya membuat penasaran", "Informasi aman yang tidak perlu dibandingkan"],
        correct: 0, explain: "Judul bombastis bisa menjadi tanda clickbait atau informasi yang perlu diverifikasi." },
      { difficulty: "Sedang",
        q: "Saat memakai gambar dari internet untuk presentasi, tindakan paling tepat adalah...",
        options: ["Memeriksa izin penggunaan dan mencantumkan sumber gambar", "Menghapus nama pembuat agar slide terlihat lebih bersih", "Mengambil gambar apa pun karena semua gambar internet bebas", "Mengubah sedikit warna agar sumber tidak perlu ditulis"],
        correct: 0, explain: "Penggunaan aset digital perlu memperhatikan izin dan atribusi." },
      { difficulty: "Sulit",
        q: "Siswa mencari 'planet paling dekat dengan matahari' dan menemukan blog lama tanpa sumber. Hasil yang lebih baik adalah...",
        options: ["Situs edukasi/ilmiah yang mencantumkan data dan penjelasan jelas", "Komentar media sosial yang paling lucu tentang planet", "Gambar tanpa keterangan yang muncul paling atas", "Iklan teleskop yang menyebut nama planet secara sekilas"],
        correct: 0, explain: "Sumber ilmiah/edukasi dengan bukti lebih tepat untuk tugas pengetahuan." },
      { difficulty: "Sulit",
        q: "Menggunakan tanda kutip pada mesin pencari berguna untuk...",
        options: ["Mencari frasa yang sama persis dengan kata di dalam tanda kutip", "Menghapus semua hasil yang berasal dari sumber resmi", "Membuat internet hanya menampilkan gambar tanpa teks", "Mengubah semua artikel lama menjadi artikel terbaru"],
        correct: 0, explain: "Tanda kutip membantu mencari frasa persis sehingga hasil lebih spesifik." },
      { difficulty: "Sulit",
        q: "Jika satu informasi viral tidak ditemukan di media tepercaya lain, kesimpulan paling hati-hati adalah...",
        options: ["Informasi perlu ditahan dulu sampai ada verifikasi lebih kuat", "Informasi pasti benar karena sudah banyak dibagikan", "Informasi pasti salah tanpa perlu membaca isinya", "Informasi boleh diubah lalu dibagikan sebagai lelucon"],
        correct: 0, explain: "Informasi viral tetap perlu bukti dan verifikasi dari sumber pembanding." },
      { difficulty: "Sulit",
        q: "Kata kunci 'banjir Jakarta 2024 site:go.id' kemungkinan lebih terarah karena...",
        options: ["Membatasi topik, lokasi, tahun, dan jenis domain sumber", "Membuat semua hasil pencarian berasal dari komentar teman", "Menghapus semua data resmi dari hasil pencarian", "Mengubah mesin pencari menjadi aplikasi pengolah angka"],
        correct: 0, explain: "Kata kunci yang punya batasan membuat hasil lebih sesuai kebutuhan." },
      { difficulty: "HOTS",
        q: "Kelompok mendapat tugas membuat poster hemat energi. Strategi pencarian paling kuat adalah...",
        options: ["Menentukan pertanyaan, memakai kata kunci spesifik, membandingkan sumber, lalu mencatat rujukan", "Membuka hasil pertama dan langsung menyalin semua kalimatnya", "Mencari gambar paling menarik lalu menghapus sumbernya", "Memilih informasi yang paling cepat ditemukan meskipun tidak jelas asalnya"],
        correct: 0, explain: "Pencarian berkualitas membutuhkan rencana, evaluasi sumber, dan pencatatan rujukan." },
      { difficulty: "HOTS",
        q: "Siswa ingin membuktikan klaim 'membaca 15 menit sehari meningkatkan kemampuan literasi'. Bukti terbaik adalah...",
        options: ["Data atau laporan dari sumber pendidikan yang menjelaskan metode dan hasil", "Pendapat satu teman yang merasa membaca itu membosankan", "Poster promosi buku yang tidak mencantumkan data", "Judul video pendek yang hanya memakai kata-kata heboh"],
        correct: 0, explain: "Klaim sebab-akibat perlu didukung data, metode, dan sumber yang dapat dipercaya." },
    ],
    "inf7-5": [
      { difficulty: "Mudah",
        q: "Kalimat 'Perpustakaan sekolah buka pukul 08.00' termasuk fakta jika...",
        options: ["Dapat dicek melalui jadwal resmi atau pengumuman sekolah", "Ditulis dengan huruf kapital dan banyak tanda seru", "Disukai banyak teman di grup percakapan", "Terasa benar karena sesuai pendapat pribadi"],
        correct: 0, explain: "Fakta dapat diperiksa kebenarannya melalui bukti atau sumber." },
      { difficulty: "Mudah",
        q: "Kalimat 'Aplikasi ini paling bagus untuk semua siswa' lebih tepat disebut...",
        options: ["Opini karena berisi penilaian yang bisa berbeda antar orang", "Fakta karena memakai kata aplikasi", "Data resmi karena terdengar meyakinkan", "Hoaks pasti karena menyebut semua siswa"],
        correct: 0, explain: "Opini adalah pendapat atau penilaian, bukan sesuatu yang otomatis bisa dibuktikan untuk semua orang." },
      { difficulty: "Mudah",
        q: "Ciri informasi hoaks yang perlu diwaspadai adalah...",
        options: ["Memaksa pembaca segera menyebarkan tanpa bukti jelas", "Mencantumkan sumber, tanggal, dan data pembanding", "Mengajak pembaca mengecek ke sumber resmi", "Memakai bahasa tenang dan menyebut batasan informasi"],
        correct: 0, explain: "Hoaks sering memakai desakan emosional dan minim bukti." },
      { difficulty: "Mudah",
        q: "Sebelum membagikan berita mengejutkan di grup kelas, tindakan terbaik adalah...",
        options: ["Cek sumber, bukti, tanggal, dan bandingkan dengan sumber lain", "Langsung bagikan agar terlihat paling cepat tahu", "Ubah judulnya supaya lebih seru sebelum dikirim", "Hapus nama sumber agar teman lebih penasaran"],
        correct: 0, explain: "Cek fakta membantu mencegah penyebaran informasi salah." },
      { difficulty: "Sedang",
        q: "Unggahan menyebut 'semua siswa akan libur besok' tanpa surat resmi. Sikap yang paling tepat adalah...",
        options: ["Menunggu konfirmasi sekolah atau mengecek kanal resmi", "Langsung menyebarkan karena kabarnya menyenangkan", "Menganggap benar karena banyak teman ingin libur", "Membuat versi baru agar unggahan lebih ramai dibaca"],
        correct: 0, explain: "Informasi tentang sekolah perlu dikonfirmasi ke sumber resmi." },
      { difficulty: "Sedang",
        q: "Bias informasi terjadi ketika...",
        options: ["Informasi disajikan berat sebelah sehingga memengaruhi penilaian pembaca", "Informasi selalu mencantumkan dua sisi dan bukti lengkap", "Data ditampilkan dengan sumber dan metode yang jelas", "Pembaca diajak memeriksa informasi dari banyak sumber"],
        correct: 0, explain: "Bias membuat informasi condong pada sudut pandang tertentu." },
      { difficulty: "Sedang",
        q: "Iklan produk belajar berkata 'nilai pasti 100 dalam satu malam'. Mengapa klaim ini perlu dicurigai?",
        options: ["Menjanjikan hasil berlebihan tanpa bukti yang masuk akal", "Memakai kata belajar sehingga pasti benar", "Memiliki desain warna cerah yang selalu resmi", "Muncul di internet sehingga otomatis sudah diverifikasi"],
        correct: 0, explain: "Klaim berlebihan perlu bukti kuat sebelum dipercaya." },
      { difficulty: "Sedang",
        q: "Perbedaan utama fakta dan opini adalah...",
        options: ["Fakta bisa diuji dengan bukti, opini adalah penilaian atau pendapat", "Fakta selalu pendek, opini selalu lebih panjang", "Fakta hanya ada di buku cetak, opini hanya ada di video", "Fakta harus lucu, opini harus membuat orang marah"],
        correct: 0, explain: "Kunci pembedanya adalah keterujian dengan bukti." },
      { difficulty: "Sedang",
        q: "Jika sebuah video memotong pidato seseorang hanya sebagian, risiko informasinya adalah...",
        options: ["Konteks bisa hilang sehingga penonton salah memahami maksud", "Video pasti menjadi lebih benar karena durasinya pendek", "Semua penonton otomatis tahu bagian yang dipotong", "Kualitas suara selalu membuktikan kebenaran isi video"],
        correct: 0, explain: "Potongan informasi tanpa konteks bisa menyesatkan." },
      { difficulty: "Sulit",
        q: "Siswa menemukan dua berita berbeda tentang peristiwa yang sama. Langkah cek fakta paling baik adalah...",
        options: ["Bandingkan sumber, waktu kejadian, bukti, dan pernyataan pihak terkait", "Pilih berita yang paling sesuai dengan perasaan sendiri", "Pilih judul yang paling membuat marah agar ramai dibahas", "Gabungkan dua berita tanpa mencatat sumbernya"],
        correct: 0, explain: "Cek fakta perlu membandingkan bukti dan sumber secara hati-hati." },
      { difficulty: "Sulit",
        q: "Akun anonim membagikan tautan hadiah dan meminta data pribadi. Tindakan paling aman adalah...",
        options: ["Jangan mengisi data, cek sumber resmi, dan laporkan jika mencurigakan", "Isi cepat karena hadiah biasanya terbatas untuk yang tercepat", "Bagikan ke semua grup agar teman ikut mencoba", "Berikan data palsu agar akun anonim menjadi bingung"],
        correct: 0, explain: "Permintaan data pribadi dari sumber tidak jelas berisiko penipuan." },
      { difficulty: "Sulit",
        q: "Mengapa literasi media penting bagi siswa SMP?",
        options: ["Agar mampu menilai informasi sebelum percaya, bereaksi, atau membagikan", "Agar semua unggahan terlihat sama dan tidak perlu dibaca", "Agar siswa bisa membuat judul heboh tanpa bukti", "Agar informasi viral selalu dianggap benar lebih cepat"],
        correct: 0, explain: "Literasi media membantu siswa mengambil keputusan digital yang bertanggung jawab." },
      { difficulty: "Sulit",
        q: "Sebuah klaim mencantumkan angka statistik, tetapi tidak menyebut sumber data. Sikap paling tepat adalah...",
        options: ["Mencari sumber asli angka tersebut sebelum memakai sebagai bukti", "Langsung percaya karena angka selalu berarti ilmiah", "Mengubah angka agar lebih mudah diingat teman", "Menghapus angka dan menggantinya dengan opini pribadi"],
        correct: 0, explain: "Angka tanpa sumber tetap perlu diverifikasi." },
      { difficulty: "HOTS",
        q: "Dalam diskusi kelas, satu kelompok hanya memilih berita yang mendukung pendapatnya. Masalah utamanya adalah...",
        options: ["Mereka berisiko bias karena mengabaikan sumber pembanding", "Mereka pasti paling teliti karena hanya membaca satu sisi", "Mereka tidak perlu bukti karena pendapat kelompok sudah cukup", "Mereka otomatis benar karena semua anggota setuju"],
        correct: 0, explain: "Mengabaikan sumber pembanding dapat membuat kesimpulan berat sebelah." },
      { difficulty: "HOTS",
        q: "Sebelum membuat konten edukasi dari berita viral, langkah paling bertanggung jawab adalah...",
        options: ["Verifikasi klaim, pahami konteks, cantumkan sumber, dan hindari judul menyesatkan", "Ambil bagian paling mengejutkan agar konten cepat viral", "Ubah kalimat sumber agar terlihat seperti temuan sendiri", "Sebarkan dulu, lalu cek kebenarannya jika ada yang protes"],
        correct: 0, explain: "Konten digital perlu akurat, beretika, dan tidak memperkuat misinformasi." },
    ],
    "inf7-6": [
      { difficulty: "Mudah",
        q: "Contoh netiket yang baik saat berdiskusi di grup kelas adalah...",
        options: ["Menyampaikan pendapat sopan dan tidak menyerang pribadi teman", "Menulis komentar kasar agar pesan lebih cepat dibaca", "Mengirim spam stiker sampai percakapan ramai", "Membagikan nomor teman tanpa izin agar semua bisa menghubungi"],
        correct: 0, explain: "Netiket adalah etika berkomunikasi di ruang digital." },
      { difficulty: "Mudah",
        q: "Data pribadi yang sebaiknya tidak disebarkan sembarangan adalah...",
        options: ["Alamat rumah, nomor telepon, foto kartu pelajar, atau lokasi langsung", "Warna favorit yang tidak terkait identitas penting", "Jenis makanan kesukaan yang dibahas santai", "Nama tokoh fiksi yang disukai saat membaca"],
        correct: 0, explain: "Data pribadi dapat disalahgunakan jika dibagikan tanpa kontrol." },
      { difficulty: "Mudah",
        q: "Sebelum mengunggah foto teman ke media sosial, tindakan paling tepat adalah...",
        options: ["Meminta izin dan mempertimbangkan apakah unggahan bisa merugikan", "Mengunggah dulu karena teman pasti tidak keberatan", "Menandai semua orang agar foto terlihat lebih ramai", "Menambahkan komentar lucu meskipun membuat teman malu"],
        correct: 0, explain: "Mengunggah foto orang lain perlu izin dan empati." },
      { difficulty: "Mudah",
        q: "Komentar digital yang bertanggung jawab adalah komentar yang...",
        options: ["Jujur, sopan, relevan, dan mempertimbangkan dampaknya", "Paling pedas agar mendapat banyak reaksi", "Dikirim berulang-ulang sampai semua orang setuju", "Menyebut data pribadi orang agar argumen terlihat kuat"],
        correct: 0, explain: "Tanggung jawab digital berarti memikirkan isi, cara, dan dampak komunikasi." },
      { difficulty: "Sedang",
        q: "Teman membuat kesalahan di forum kelas. Respons yang paling berempati adalah...",
        options: ["Mengingatkan dengan bahasa baik atau menghubungi secara pribadi", "Mengejek di komentar agar ia cepat sadar", "Menyebarkan tangkapan layar ke grup lain", "Membuat meme tentang kesalahannya tanpa izin"],
        correct: 0, explain: "Empati online membantu menjaga martabat dan keamanan psikologis orang lain." },
      { difficulty: "Sedang",
        q: "Jika menerima pesan marah dari teman, langkah yang paling bijak adalah...",
        options: ["Menunda balasan, membaca ulang konteks, lalu merespons dengan tenang", "Langsung membalas lebih kasar agar tidak terlihat kalah", "Mengirim pesan itu ke semua grup untuk mencari dukungan", "Mengubah isi pesan agar teman lain ikut marah"],
        correct: 0, explain: "Menunda dan membaca konteks membantu mencegah konflik digital membesar." },
      { difficulty: "Sedang",
        q: "Mengapa jejak digital perlu dipikirkan sebelum mengunggah sesuatu?",
        options: ["Karena unggahan dapat tersimpan, disebarkan, dan memengaruhi diri atau orang lain", "Karena semua unggahan otomatis hilang setelah satu menit", "Karena internet hanya bisa dibaca oleh teman dekat", "Karena komentar lama tidak pernah bisa ditemukan lagi"],
        correct: 0, explain: "Jejak digital bisa bertahan dan berdampak di masa depan." },
      { difficulty: "Sedang",
        q: "Siswa ingin mengkritik karya teman di platform kelas. Contoh kritik paling tepat adalah...",
        options: ["Bagian pembuka sudah jelas, tetapi sumber gambar perlu dicantumkan", "Karyamu jelek dan tidak pantas dilihat siapa pun", "Aku tidak suka, jadi semua bagian pasti salah", "Hapus saja tugasmu agar kelas lebih rapi"],
        correct: 0, explain: "Kritik yang baik spesifik, sopan, dan memberi arah perbaikan." },
      { difficulty: "Sedang",
        q: "Saat aplikasi meminta izin lokasi, kamera, dan kontak, sikap yang tepat adalah...",
        options: ["Memeriksa apakah izin itu sesuai fungsi aplikasi sebelum menyetujui", "Menyetujui semua izin agar aplikasi merasa dipercaya", "Membagikan izin ke teman agar mereka bisa ikut memakai", "Mengaktifkan semua izin meskipun aplikasi tidak membutuhkannya"],
        correct: 0, explain: "Izin aplikasi perlu dibatasi sesuai kebutuhan untuk menjaga privasi." },
      { difficulty: "Sulit",
        q: "Seseorang menyebarkan candaan yang membuat teman malu di grup. Mengapa ini bermasalah?",
        options: ["Dampak pada perasaan dan reputasi teman tetap nyata meskipun disebut bercanda", "Candaan digital selalu aman karena tidak terjadi langsung di kelas", "Jika banyak yang tertawa, berarti tidak ada yang dirugikan", "Komentar di grup tidak termasuk tanggung jawab digital"],
        correct: 0, explain: "Etika digital menilai dampak, bukan hanya niat pengirim." },
      { difficulty: "Sulit",
        q: "Jika melihat perundungan di ruang virtual kelas, tindakan paling aman adalah...",
        options: ["Simpan bukti, jangan ikut menyerang, dan lapor ke guru/orang dewasa tepercaya", "Ikut membalas agar pelaku merasa takut", "Menyebarkan bukti ke grup lain agar semua orang tahu", "Diam saja karena masalah online tidak perlu bantuan"],
        correct: 0, explain: "Respons aman melindungi korban dan membantu penyelesaian oleh pihak yang tepat." },
      { difficulty: "Sulit",
        q: "Menggunakan nama samaran untuk mengejek teman tetap tidak etis karena...",
        options: ["Tindakan digital tetap berdampak meskipun identitas disembunyikan", "Nama samaran membuat semua komentar menjadi lucu", "Akun anonim selalu bebas dari aturan sekolah", "Teman tidak akan merasa terganggu jika tidak tahu pelakunya"],
        correct: 0, explain: "Tanggung jawab digital berlaku pada tindakan, bukan hanya nama akun." },
      { difficulty: "Sulit",
        q: "Sebelum membagikan tangkapan layar percakapan, pertanyaan yang paling penting adalah...",
        options: ["Apakah ada izin, data pribadi, dan dampak bagi orang yang terlibat?", "Apakah gambarnya cukup terang untuk dilihat semua orang?", "Apakah tangkapan layar akan membuat grup lebih ramai?", "Apakah nama file tangkapan layar mudah diingat?"],
        correct: 0, explain: "Percakapan bisa mengandung privasi dan konteks yang tidak boleh disebarkan sembarangan." },
      { difficulty: "HOTS",
        q: "Dalam debat online, dua siswa berbeda pendapat. Cara menjaga ruang publik virtual tetap sehat adalah...",
        options: ["Fokus pada argumen, gunakan bahasa sopan, dan akui jika perlu mengecek data", "Menyerang pribadi lawan agar pendapat sendiri terlihat kuat", "Mengajak teman lain menyerbu komentar siswa yang berbeda pendapat", "Menghapus semua pendapat yang tidak sama dengan pendapat sendiri"],
        correct: 0, explain: "Diskusi sehat menjaga martabat orang dan kualitas argumen." },
      { difficulty: "HOTS",
        q: "Sebuah akun kelas ingin membuat aturan komentar. Aturan paling lengkap adalah...",
        options: ["Sopan, relevan, tidak membuka data pribadi, tidak merundung, dan siap direvisi jika berdampak buruk", "Komentar boleh apa saja selama pengirim merasa itu lucu", "Komentar hanya boleh dari siswa yang paling aktif di media sosial", "Komentar kasar boleh jika ditulis di luar jam pelajaran"],
        correct: 0, explain: "Aturan ruang digital perlu menjaga keamanan, empati, privasi, dan tanggung jawab." },
    ],
    "kka7-1": [
      { q: "Apa yang dimaksud dengan 'atribut' dalam pengelolaan data?",
        options: ["Nama dari sebuah tabel", "Keterangan yang mendeskripsikan setiap item data", "Angka hasil perhitungan", "Aplikasi untuk menyimpan data"],
        correct: 1, explain: "Atribut adalah kolom atau keterangan yang menjelaskan properti setiap objek data, seperti nama, tanggal, atau status." },
      { q: "Data kelas berisi nama, nilai, dan kehadiran. Yang termasuk 'pola' adalah...",
        options: ["Kolom bernama 'Nilai'", "Nama siswa 'Budi'", "Nilai rata-rata kelas naik setiap semester", "Total jumlah siswa"],
        correct: 2, explain: "Pola adalah kecenderungan yang terlihat dari beberapa data, bukan dari satu nilai tunggal." },
      { q: "Mengapa data perlu direpresentasikan dalam tabel atau grafik?",
        options: ["Agar data terlihat berwarna", "Agar lebih mudah dibaca, dibandingkan, dan dianalisis", "Agar data tidak bisa diubah", "Agar ukuran file lebih kecil"],
        correct: 1, explain: "Representasi yang tepat membantu menemukan pola, membandingkan nilai, dan mengambil keputusan berbasis data." },
    ],
    "kka7-2": [
      { q: "Instruksi yang baik untuk diselesaikan orang lain harus...",
        options: ["Rahasia dan hanya dimengerti pembuatnya", "Jelas, berurutan, dan tidak ambigu", "Sepanjang mungkin agar detail", "Berupa kode program"],
        correct: 1, explain: "Instruksi yang baik bisa dilakukan orang lain karena jelas dan tidak punya makna ganda." },
      { q: "Langkah 'dekomposisi' dalam pemecahan masalah berarti...",
        options: ["Membuang bagian yang sulit", "Memecah masalah besar menjadi bagian-bagian lebih kecil", "Menggabungkan semua solusi menjadi satu", "Mencari siapa yang salah"],
        correct: 1, explain: "Dekomposisi membantu kita tidak kewalahan karena masalah dipecah menjadi bagian yang bisa ditangani satu per satu." },
      { q: "Mengapa solusi perlu dievaluasi setelah disusun?",
        options: ["Agar tampilan solusi lebih rapi", "Untuk memastikan solusi benar-benar menyelesaikan masalah", "Agar langkah-langkahnya terlihat banyak", "Agar orang lain tidak bisa menyalin"],
        correct: 1, explain: "Evaluasi membantu menemukan kelemahan sebelum solusi diterapkan ke situasi nyata." },
    ],
    "kka7-3": [
      { q: "Slide presentasi yang efektif sebaiknya...",
        options: ["Memuat semua informasi agar tidak ada yang terlewat", "Berisi poin ringkas dan visual yang mendukung penjelasan lisan", "Memakai banyak animasi di setiap elemen", "Menggunakan warna berbeda untuk setiap kata"],
        correct: 1, explain: "Slide adalah alat bantu visual, bukan naskah lengkap. Poin ringkas membantu audiens tetap fokus." },
      { q: "Infografis paling cocok digunakan untuk...",
        options: ["Menulis esai panjang tentang sejarah", "Menyajikan data atau proses dalam bentuk visual yang mudah dipahami", "Menyimpan catatan kelas", "Membuat soal ujian"],
        correct: 1, explain: "Infografis menggabungkan teks singkat dan visual untuk menyampaikan informasi dengan cepat." },
      { q: "Sebelum membuat konten digital, hal pertama yang perlu dipikirkan adalah...",
        options: ["Warna yang paling menarik", "Aplikasi yang paling populer", "Tujuan dan audiens konten tersebut", "Panjang konten yang ideal"],
        correct: 2, explain: "Tujuan dan audiens menentukan gaya bahasa, format, dan medium yang paling tepat." },
    ],
    "kka7-4": [
      { q: "Jika ingin memakai lagu populer di video tugas, langkah yang benar adalah...",
        options: ["Langsung pakai karena untuk tugas sekolah", "Cek lisensi lagu dan minta izin jika diperlukan", "Ubah judulnya agar tidak terdeteksi", "Pakai hanya bagian kecil saja pasti aman"],
        correct: 1, explain: "Hak cipta melindungi karya termasuk musik, bahkan untuk keperluan pendidikan sekalipun." },
      { q: "Sebelum membagikan foto teman di media sosial, hal yang wajib dilakukan adalah...",
        options: ["Pastikan fotonya bagus secara estetika", "Minta izin dari teman yang ada di foto", "Beri keterangan di caption", "Tunggu 24 jam dulu"],
        correct: 1, explain: "Privasi dan persetujuan adalah hak setiap orang, termasuk dalam konteks konten digital." },
      { q: "Konten yang menyebarkan informasi belum terverifikasi dapat berdampak...",
        options: ["Positif karena mempercepat penyebaran", "Negatif karena bisa menyesatkan dan merugikan orang lain", "Netral karena pembaca bisa menilai sendiri", "Tidak berdampak karena hanya di internet"],
        correct: 1, explain: "Informasi yang salah dapat membahayakan orang, bahkan jika disebarkan dengan niat baik." },
    ],
    "kka7-5": [
      { q: "Apa yang membuat sistem AI berbeda dari kalkulator biasa?",
        options: ["AI lebih mahal", "AI belajar dari data dan meningkat lewat pengalaman", "AI hanya bisa menghitung angka", "AI selalu terhubung internet"],
        correct: 1, explain: "AI (Machine Learning) menggunakan data untuk menemukan pola dan meningkatkan prediksinya, bukan hanya mengikuti rumus tetap." },
      { q: "Bias dalam AI biasanya terjadi karena...",
        options: ["AI terlalu pintar", "Data latih yang tidak beragam atau tidak representatif", "AI terlalu sering digunakan", "Koneksi internet yang lambat"],
        correct: 1, explain: "Jika data latih memiliki kecenderungan tertentu, model AI akan mewarisi bias itu dalam prediksinya." },
      { q: "Mengapa penting memahami cara kerja AI meski bukan programmer?",
        options: ["Agar bisa membuat AI sendiri", "Agar bisa menggunakan dan mengkritisi teknologi AI secara bijak", "Agar nilai matematika naik", "Agar tidak perlu belajar hal lain"],
        correct: 1, explain: "Literasi AI membantu kita membuat keputusan lebih baik saat berinteraksi dengan teknologi." },
    ],
    "kka7-6": [
      { q: "Saat menggunakan chatbot AI untuk tugas sekolah, langkah penting yang harus dilakukan adalah...",
        options: ["Langsung salin jawaban AI tanpa dicek", "Verifikasi jawaban AI ke sumber terpercaya lain", "Percaya AI karena selalu benar", "Hindari AI karena berbahaya"],
        correct: 1, explain: "AI bisa membuat kesalahan atau memberikan informasi usang. Selalu cek ke sumber terpercaya." },
      { q: "Rekomendasi lagu di aplikasi streaming bekerja dengan cara...",
        options: ["Mengacak lagu secara acak", "Menganalisis pola lagu yang pernah kamu putar untuk menyarankan lagu serupa", "Memilih lagu paling populer saja", "Meminta pilihan teman-temanmu"],
        correct: 1, explain: "Sistem rekomendasi AI mempelajari preferensimu dari riwayat aktivitas untuk memberikan saran yang relevan." },
      { q: "Salah satu batas kemampuan AI saat ini adalah...",
        options: ["AI tidak bisa memproses gambar", "AI tidak selalu bisa memahami konteks nuansa atau emosi manusia", "AI tidak bisa menjawab pertanyaan apapun", "AI hanya bisa berbahasa Inggris"],
        correct: 1, explain: "Meski AI sangat kuat mengenali pola, memahami konteks sosial dan emosi manusia masih menjadi tantangan besar." },
    ],
    "inf8-1": [
      { q: "Cara membuat list kosong di Python adalah...",
        options: ["data = []", "data = {}", "data = ()", "data = 0"],
        correct: 0, explain: "[] adalah list kosong. {} adalah dict, () adalah tuple — ketiganya berbeda." },
      { q: "Untuk menambahkan angka 90 ke akhir list nilai, perintah Python yang tepat adalah...",
        options: ["nilai.append(90)", "nilai.add(90)", "nilai.push(90)", "nilai + 90"],
        correct: 0, explain: "append() menambahkan elemen ke akhir list — operasi paling umum pada list Python." },
      { q: "Hasil dari: data = [10, 20, 30]; print(len(data)) adalah...",
        options: ["3", "60", "10", "Error"],
        correct: 0, explain: "len() mengembalikan jumlah elemen dalam list, bukan jumlah nilainya." },
    ],
    "kka8-1": [
      { q: "Fungsi AVERAGE pada spreadsheet digunakan untuk...",
        options: ["Menjumlahkan semua nilai", "Menghitung nilai rata-rata dari rentang data", "Mencari nilai tertinggi", "Mengurutkan data"],
        correct: 1, explain: "AVERAGE menghitung rata-rata dengan membagi total nilai dengan jumlah data." },
      { q: "Grafik batang paling cocok digunakan ketika ingin...",
        options: ["Menampilkan proporsi bagian dari keseluruhan", "Membandingkan jumlah antar kategori atau periode", "Menulis teks penjelasan", "Menyembunyikan data outlier"],
        correct: 1, explain: "Grafik batang cocok untuk perbandingan nilai antar kategori yang berbeda." },
      { q: "Filter pada spreadsheet berguna saat ingin...",
        options: ["Mengubah semua data sekaligus", "Menampilkan hanya data yang memenuhi kriteria tertentu", "Menghapus kolom yang tidak diperlukan", "Membuat rumus otomatis"],
        correct: 1, explain: "Filter menyaring tampilan data berdasarkan syarat tertentu tanpa menghapus data aslinya." },
    ],
    "kka8-2": [
      { q: "Percabangan (if-else) dalam program digunakan untuk...",
        options: ["Mengulang sebuah langkah berkali-kali", "Membuat keputusan berdasarkan kondisi tertentu", "Menyimpan data ke memori", "Menampilkan teks ke layar"],
        correct: 1, explain: "Percabangan memungkinkan program berjalan berbeda tergantung kondisi yang terpenuhi." },
      { q: "Perulangan (loop) dalam program berguna saat...",
        options: ["Kita perlu membuat keputusan satu kali", "Kita ingin mengulang langkah tertentu sampai kondisi terpenuhi", "Kita ingin menyimpan hasil akhir saja", "Kita tidak tahu jumlah datanya"],
        correct: 1, explain: "Loop menghindari penulisan instruksi yang sama berulang kali dan membuat program lebih efisien." },
      { q: "Debugging adalah proses...",
        options: ["Menulis kode lebih cepat", "Menemukan dan memperbaiki kesalahan dalam program", "Menambahkan fitur baru ke program", "Mengubah tampilan antarmuka"],
        correct: 1, explain: "Bug adalah kesalahan dalam kode; debugging adalah proses sistematis mencari dan memperbaikinya." },
    ],
    "kka8-3": [
      { q: "Storyboard dalam produksi video berfungsi sebagai...",
        options: ["Alat untuk merekam suara", "Rencana visual setiap adegan sebelum mulai merekam", "Software editing video", "Platform untuk mengunggah video"],
        correct: 1, explain: "Storyboard membantu tim memiliki gambaran jelas tentang isi video sebelum proses perekaman dimulai." },
      { q: "Sebelum mengunggah video yang menampilkan teman sekelas, hal yang harus dilakukan adalah...",
        options: ["Memastikan resolusinya HD", "Meminta izin dari semua orang yang tampil", "Menambahkan efek visual yang menarik", "Menunggu komentar dulu"],
        correct: 1, explain: "Setiap orang punya hak atas gambar mereka sendiri. Izin adalah etika dasar produksi konten." },
      { q: "Kualitas audio yang baik dalam video adalah...",
        options: ["Tidak penting selama gambarnya jelas", "Lebih penting dari gambar karena penonton lebih toleran terhadap gambar buram", "Sama pentingnya, suara yang tidak jelas membuat pesan tidak tersampaikan", "Bisa diperbaiki sepenuhnya saat editing"],
        correct: 2, explain: "Penelitian menunjukkan penonton lebih mudah meninggalkan video karena audio buruk daripada gambar yang kurang tajam." },
    ],
    "kka8-4": [
      { q: "Lisensi Creative Commons CC-BY berarti...",
        options: ["Tidak boleh digunakan siapapun", "Boleh digunakan dengan menyebutkan sumber/pencipta", "Hanya untuk penggunaan komersial", "Harus membayar royalti"],
        correct: 1, explain: "BY (Attribution) artinya pengguna boleh memakai karya asal menyebut nama pencipta aslinya." },
      { q: "Plagiarisme dalam konten digital adalah...",
        options: ["Menggunakan karya sendiri berulang kali", "Mengambil karya orang lain dan mengklaim sebagai milik sendiri tanpa izin", "Membagikan konten yang sudah viral", "Membuat konten yang mirip dengan orang lain"],
        correct: 1, explain: "Plagiarisme bukan hanya soal hukum, tapi juga soal kejujuran dan menghargai kerja keras orang lain." },
      { q: "Musik berlabel CC-0 (Public Domain) artinya...",
        options: ["Hanya bisa digunakan untuk keperluan sekolah", "Bebas digunakan siapapun untuk tujuan apapun tanpa perlu izin", "Hanya untuk artis profesional", "Perlu mendaftar ke pemilik hak cipta"],
        correct: 1, explain: "CC-0 melepaskan semua hak — karya bisa digunakan, dimodifikasi, dan didistribusikan bebas." },
    ],
    "kka8-5": [
      { q: "Apa yang dimaksud dengan 'bias' dalam sistem AI?",
        options: ["AI yang terlalu cepat memproses data", "Kecenderungan tidak adil dalam hasil AI karena data latih yang tidak representatif", "Program AI yang terlalu mahal", "AI yang tidak bisa diperbarui"],
        correct: 1, explain: "Bias AI terjadi ketika model menghasilkan keputusan yang tidak adil karena data latihnya tidak mewakili semua kelompok." },
      { q: "Mengapa privasi menjadi isu penting saat menggunakan aplikasi berbasis AI?",
        options: ["Karena AI selalu lambat", "Karena AI sering mengumpulkan dan mengolah data pengguna untuk meningkatkan kemampuannya", "Karena AI tidak bisa menyimpan data", "Karena AI tidak bekerja tanpa internet"],
        correct: 1, explain: "Banyak sistem AI belajar dari data pengguna. Memahami apa yang dikumpulkan membantu kita melindungi privasi." },
      { q: "Transparansi AI berarti...",
        options: ["AI yang bisa dilihat secara fisik", "Kemampuan memahami bagaimana dan mengapa AI membuat suatu keputusan", "AI yang selalu menampilkan kodenya", "AI yang tidak pernah membuat kesalahan"],
        correct: 1, explain: "AI yang transparan bisa dijelaskan alasan keputusannya, penting untuk kepercayaan dan akuntabilitas." },
    ],
    "kka8-6": [
      { q: "Apa itu 'data latih' (training data) dalam konteks AI?",
        options: ["Data yang dihasilkan oleh AI", "Kumpulan contoh berlabel yang digunakan untuk mengajarkan model AI mengenali pola", "Data yang hanya bisa dibaca manusia", "Instruksi manual untuk programmer"],
        correct: 1, explain: "Data latih adalah fondasi pembelajaran mesin — semakin berkualitas dan beragam datanya, semakin baik modelnya." },
      { q: "Akurasi model AI yang 80% berarti...",
        options: ["Model gagal 80% dari waktu", "Model membuat prediksi benar pada 80% data yang diuji", "Model hanya bekerja 80% hari", "Model memerlukan 80% data latih lagi"],
        correct: 1, explain: "Akurasi mengukur seberapa sering prediksi model sesuai dengan jawaban yang benar pada data uji." },
      { q: "Mengapa kita perlu menguji model AI dengan data baru yang belum pernah dilihat sebelumnya?",
        options: ["Agar model terlihat lebih canggih", "Untuk memeriksa apakah model benar-benar belajar pola atau hanya menghafal data latih", "Karena data lama sudah tidak berlaku", "Agar training lebih cepat"],
        correct: 1, explain: "Pengujian dengan data baru membantu mendeteksi overfitting — ketika model hafal latihan tapi gagal di dunia nyata." },
    ],
    "inf9-1": [
      { difficulty: "Mudah",
        q: "Keuntungan utama mendefinisikan fungsi dengan def di Python adalah...",
        options: ["Kode yang sama tidak perlu ditulis berulang kali", "Program menjadi lebih lambat", "Fungsi hanya bisa dipanggil sekali", "Variabel di dalam fungsi bisa diakses dari mana saja"],
        correct: 0, explain: "Fungsi mengizinkan kode dipakai ulang: tulis sekali, panggil berkali-kali." },
      { difficulty: "Mudah",
        q: "Perintah import random digunakan untuk...",
        options: ["Menggunakan fungsi acak bawaan Python seperti random.randint dan random.choice", "Membuat variabel bernama random", "Menghapus data secara acak", "Mempercepat program Python"],
        correct: 0, explain: "import memuat modul ke dalam program agar fungsinya bisa digunakan." },
      { difficulty: "Mudah",
        q: "Cara mengakses nilai dengan kunci 'nama' pada dictionary siswa = {'nama': 'Rizky', 'kelas': '9A'} adalah...",
        options: ["siswa['nama']", "siswa.nama", "siswa[0]", "siswa.get(0)"],
        correct: 0, explain: "Dictionary diakses menggunakan kunci dalam tanda kurung siku: dict['kunci']." },
      { difficulty: "Sedang",
        q: "Perhatikan kode: def kuadrat(x): return x * x. Hasil dari print(kuadrat(5)) adalah...",
        options: ["25", "10", "5", "Error"],
        correct: 0, explain: "Fungsi kuadrat menerima 5, lalu mengembalikan 5 * 5 = 25." },
      { difficulty: "Sedang",
        q: "Perbedaan antara parameter dan argumen dalam fungsi Python adalah...",
        options: ["Parameter adalah variabel di definisi fungsi; argumen adalah nilai yang dikirim saat pemanggilan", "Parameter adalah nilai, argumen adalah nama fungsi", "Keduanya sama dan bisa dipakai bergantian", "Argumen hanya dipakai di library eksternal"],
        correct: 0, explain: "Parameter ditulis di def namaFungsi(parameter). Argumen adalah nilai aktual yang diberikan saat fungsi dipanggil." },
      { difficulty: "Sedang",
        q: "Cara paling tepat untuk menghitung nilai pi di Python tanpa mengetik angkanya sendiri adalah...",
        options: ["import math, lalu gunakan math.pi", "Mengetik 3.14 secara langsung", "pi = 'tiga koma empat belas'", "Tidak bisa dilakukan di Python"],
        correct: 0, explain: "Library math menyediakan konstanta math.pi dengan presisi tinggi." },
      { difficulty: "Sulit",
        q: "Pada Bubble Sort, list [3, 1, 2] membutuhkan berapa kali pertukaran (swap) untuk menjadi terurut [1, 2, 3]?",
        options: ["2 swap", "1 swap", "3 swap", "0 swap"],
        correct: 0, explain: "Pass 1: [3,1,2] → [1,3,2] (swap 3&1) → [1,2,3] (swap 3&2). Total 2 swap." },
      { difficulty: "HOTS",
        q: "Mengapa Binary Search tidak bisa digunakan langsung pada list acak tanpa proses tambahan?",
        options: ["Binary Search hanya bekerja pada data yang sudah terurut karena ia membelah data di titik tengah dan mengasumsikan posisi relatif elemen", "Binary Search terlalu lambat untuk data acak", "Binary Search hanya bekerja pada angka genap", "Binary Search membutuhkan koneksi internet"],
        correct: 0, explain: "Binary Search membelah data di tengah. Jika data tidak terurut, perbandingan 'kiri atau kanan' tidak bermakna dan hasilnya salah." },
    ],
    "kka9-1": [
      { q: "Pivot table pada spreadsheet berguna untuk...",
        options: ["Menghapus data yang tidak diperlukan", "Merangkum dan mengelompokkan data kompleks secara otomatis", "Membuat grafik animasi", "Memformat warna sel"],
        correct: 1, explain: "Pivot table memungkinkan analisis multidimensi — merangkum data berdasarkan kategori tanpa formula rumit." },
      { q: "Saat membaca grafik tren data nilai siswa selama satu tahun, kesimpulan yang tepat adalah...",
        options: ["Mengambil keputusan hanya dari satu titik data tertinggi", "Melihat pola keseluruhan sambil mempertimbangkan konteks dan faktor lain", "Mengabaikan bulan dengan data yang tidak biasa", "Memilih tren yang paling disukai"],
        correct: 1, explain: "Analisis tren yang baik mempertimbangkan seluruh pola dan konteks, bukan hanya nilai ekstrem." },
      { q: "Pengambilan keputusan berbasis data berarti...",
        options: ["Selalu percaya angka tanpa pertanyaan", "Menggunakan bukti dari data untuk mendukung keputusan, sambil tetap kritis", "Mengabaikan intuisi dan pengalaman", "Hanya memakai data terbaru"],
        correct: 1, explain: "Data adalah alat bantu keputusan, bukan pengganti penilaian kritis. Konteks dan kualitas data tetap perlu dievaluasi." },
    ],
    "kka9-2": [
      { q: "Mengapa memilih algoritma yang tepat penting dalam pemrograman?",
        options: ["Agar kode terlihat lebih panjang", "Karena algoritma yang efisien menghemat waktu dan sumber daya secara signifikan", "Agar program susah dipahami orang lain", "Karena semua algoritma menghasilkan hasil yang berbeda"],
        correct: 1, explain: "Algoritma yang tepat bisa membuat perbedaan besar dalam performa, terutama saat data semakin besar." },
      { q: "Struktur data seperti array atau list berguna karena...",
        options: ["Membuat program lebih lambat", "Membantu mengorganisir kumpulan data agar mudah diakses dan diproses", "Hanya digunakan oleh programmer profesional", "Tidak bisa diubah setelah dibuat"],
        correct: 1, explain: "Memilih struktur data yang tepat adalah kunci efisiensi program — data yang terorganisir lebih mudah dicari dan dimodifikasi." },
      { q: "Langkah pertama dalam 'menguji solusi' program adalah...",
        options: ["Langsung menjalankan di data produksi", "Menguji dengan contoh kecil dan kasus tepi untuk memverifikasi kebenaran logika", "Meminta orang lain menggunakan program tanpa panduan", "Menunggu ada yang menemukan bug"],
        correct: 1, explain: "Pengujian sistematis dengan data tepi (edge cases) menemukan bug sebelum program digunakan secara nyata." },
    ],
    "kka9-3": [
      { q: "Branding digital yang konsisten berarti...",
        options: ["Menggunakan template yang sama untuk semua platform tanpa adaptasi", "Mempertahankan identitas visual dan pesan yang kohesif, disesuaikan dengan karakter tiap platform", "Hanya membuat konten di satu platform saja", "Mengganti identitas visual setiap bulan"],
        correct: 1, explain: "Konsistensi membangun kepercayaan, tapi setiap platform memiliki format dan audiens yang berbeda." },
      { q: "Saat mengevaluasi efektivitas kampanye konten digital, indikator yang paling berguna adalah...",
        options: ["Berapa banyak like yang didapat", "Seberapa jauh tujuan kampanye tercapai berdasarkan data yang dikumpulkan", "Tampilan visual yang paling bagus", "Konten yang paling cepat dibuat"],
        correct: 1, explain: "Evaluasi berbasis tujuan memberikan gambaran nyata apakah kampanye berhasil, bukan hanya popularitas." },
      { q: "Kolaborasi tim dalam produksi konten digital lebih efektif jika...",
        options: ["Satu orang mengerjakan semua bagian sendirian", "Ada pembagian peran jelas, komunikasi aktif, dan proses review bersama", "Semua anggota membuat versi masing-masing lalu dipilih satu", "Tidak ada deadline agar hasilnya sempurna"],
        correct: 1, explain: "Pembagian tugas yang jelas dan komunikasi aktif mencegah tumpang tindih dan memastikan kualitas konten." },
    ],
    "kka9-4": [
      { q: "Advokasi literasi digital berarti...",
        options: ["Melarang penggunaan media sosial di sekolah", "Mendorong dan membantu orang lain menggunakan teknologi secara bijak dan kritis", "Hanya membagikan artikel tentang bahaya internet", "Membuat aturan ketat tentang konten digital"],
        correct: 1, explain: "Advokasi yang baik memberdayakan orang lain dengan pengetahuan, bukan sekadar larangan." },
      { q: "Strategi komunikasi yang efektif untuk menyampaikan pesan literasi digital ke teman sebaya adalah...",
        options: ["Menggunakan bahasa formal dan istilah teknis agar terkesan serius", "Menggunakan bahasa yang relevan, contoh nyata, dan format yang disukai audiens", "Mengulang pesan yang sama tanpa variasi", "Hanya menyampaikan secara lisan dalam rapat formal"],
        correct: 1, explain: "Pesan yang efektif disesuaikan dengan cara audiens berkomunikasi dan contoh yang relevan dengan kehidupan mereka." },
      { q: "Mengukur dampak kampanye literasi digital yang paling bermakna adalah dengan...",
        options: ["Menghitung berapa banyak orang yang melihat konten", "Mengamati perubahan perilaku nyata pada audiens setelah kampanye", "Melihat jumlah follower yang bertambah", "Membandingkan desain dengan kampanye lain"],
        correct: 1, explain: "Dampak sejati terlihat dari perubahan sikap atau perilaku, bukan hanya dari metrik jangkauan." },
    ],
    "kka9-5": [
      { q: "Deepfake adalah...",
        options: ["Foto dengan filter kecantikan otomatis", "Konten gambar/video manipulasi AI yang memperlihatkan seseorang melakukan sesuatu yang tidak pernah terjadi", "Berita palsu dalam format teks", "Iklan produk yang menyesatkan"],
        correct: 1, explain: "Deepfake menggunakan AI generatif untuk menciptakan konten visual palsu yang sangat meyakinkan." },
      { q: "Salah satu cara mendeteksi deepfake adalah dengan...",
        options: ["Melihat apakah videonya berkualitas HD", "Memperhatikan ketidaknaturalan di area wajah, pencahayaan tidak konsisten, dan verifikasi sumber", "Mengecek jumlah like dan komentar", "Melihat apakah akun pengunggahnya terverifikasi"],
        correct: 1, explain: "Deepfake sering meninggalkan artefak visual di area kompleks seperti tepi wajah, rambut, atau pencahayaan." },
      { q: "Untuk melindungi data pribadi saat menggunakan aplikasi AI, langkah terpenting adalah...",
        options: ["Menghindari semua aplikasi yang memakai AI", "Membaca kebijakan privasi, membatasi izin akses, dan tidak membagikan data sensitif ke AI", "Hanya menggunakan AI buatan dalam negeri", "Menggunakan nama palsu di semua aplikasi"],
        correct: 1, explain: "Literasi privasi membantu kita memanfaatkan AI tanpa mengorbankan keamanan data pribadi." },
    ],
    "kka9-6": [
      { q: "Proyek akhir KKA yang baik dimulai dari...",
        options: ["Alat atau teknologi yang paling canggih tersedia", "Masalah nyata yang relevan dengan kehidupan, lalu teknologi dipilih sebagai solusi", "Membuat produk yang paling memukau secara visual", "Menyalin proyek yang sudah ada dan memodifikasinya"],
        correct: 1, explain: "Proyek yang bermakna dimulai dari masalah yang jelas. Teknologi adalah alat, bukan tujuan." },
      { q: "Integrasi KKA dalam proyek akhir berarti...",
        options: ["Menggunakan sebanyak mungkin teknologi digital", "Menggabungkan keterampilan data, algoritma, konten digital, dan etika dalam satu solusi utuh", "Membuat program komputer yang kompleks", "Hanya fokus pada satu aspek KKA saja"],
        correct: 1, explain: "Proyek akhir yang kuat menggunakan berbagai keterampilan KKA secara terpadu untuk menyelesaikan masalah nyata." },
      { q: "Refleksi setelah proyek akhir penting karena...",
        options: ["Hanya sebagai formalitas untuk nilai", "Membantu mengidentifikasi pembelajaran, keberhasilan, dan area yang perlu ditingkatkan untuk proyek berikutnya", "Agar proyek terlihat lebih panjang", "Hanya diperlukan jika proyek gagal"],
        correct: 1, explain: "Refleksi adalah bagian dari proses belajar yang mengubah pengalaman menjadi pengetahuan yang bisa diterapkan di masa depan." },
    ],
  };
  const bank = banks[id];
  if (bank) {
    const enrichedBank = bank.length >= 15 ? bank : bank.concat(getModuleDomainQuizQuestions(mod));
    return expandQuizQuestions(mod, enrichedBank);
  }
  return expandQuizQuestions(mod, getModuleDomainQuizQuestions(mod));
}

function getModuleDomainQuizQuestions(mod) {
  const id = mod?.id || "";
  const profile = MODULE_PROFILES[id] || {};
  const focus = profile.focus || mod?.title || "materi modul";
  const product = profile.product || "produk pengayaan";
  const seeds = getModuleCoreQuestions(mod);

  if (id === "inf8-1") {
    return seeds.concat([
      { q: "Hasil dari kode: nilai = [80, 90, 75]; nilai.append(85); print(len(nilai)) adalah...", options: ["4", "3", "330", "Error"], correct: 0, explain: "append() menambah satu elemen ke list, sehingga jumlah elemen menjadi 4." },
      { q: "Untuk mengakses elemen pertama dari list data = ['a', 'b', 'c'], perintah yang benar adalah...", options: ["data[0]", "data[1]", "data.first()", "data.get(0)"], correct: 0, explain: "Python menggunakan indeks mulai dari 0. Elemen pertama ada di indeks 0." },
      { q: "Kode for x in [1, 2, 3]: print(x * 2) akan mencetak...", options: ["2, 4, 6 (masing-masing di baris baru)", "1, 2, 3", "6", "Error karena tidak ada if"], correct: 0, explain: "For loop mengiterasi setiap elemen list dan menjalankan blok kode untuk tiap elemen." },
      { q: "Prinsip utama Queue dalam struktur data adalah...", options: ["FIFO — yang pertama masuk adalah yang pertama keluar", "LIFO — yang terakhir masuk adalah yang pertama keluar", "Acak — elemen keluar tanpa urutan tertentu", "Terbesar dulu — elemen bernilai besar keluar lebih dulu"], correct: 0, explain: "Queue = antrian. Persis seperti antrean kantin: yang pertama datang dilayani pertama (FIFO)." },
      { q: "Perbedaan list dan variabel biasa di Python adalah...", options: ["List bisa menyimpan banyak nilai sekaligus; variabel biasa hanya satu nilai", "List hanya bisa menyimpan angka; variabel bisa semua tipe", "Variabel lebih cepat dari list untuk semua operasi", "List tidak bisa diubah setelah dibuat"], correct: 0, explain: "List adalah kumpulan nilai berurutan yang bisa diakses lewat indeks." },
      { q: "Sebuah Queue simpel di Python bisa diimplementasikan dengan...", options: ["List biasa: append() untuk enqueue, pop(0) untuk dequeue", "Dictionary dengan key angka", "Fungsi input() yang diulang", "Tidak bisa diimplementasikan dengan Python dasar"], correct: 0, explain: "append() menambah ke belakang (enqueue), pop(0) mengambil dari depan (dequeue) — menciptakan perilaku FIFO." },
    ]);
  }

  if (id === "inf8-2") {
    return seeds.concat([
      { q: "Stack menerapkan prinsip LIFO yang berarti...", options: ["Elemen terakhir yang dimasukkan adalah yang pertama dikeluarkan", "Elemen terbesar selalu ada di posisi teratas", "Elemen pertama yang dimasukkan selalu yang pertama keluar", "Elemen dikeluarkan secara acak"], correct: 0, explain: "LIFO = Last In, First Out. Seperti tumpukan piring: piring yang baru ditaruh paling atas diambil lebih dulu." },
      { q: "Dalam Python, operasi 'push' pada Stack dilakukan dengan...", options: ["tumpukan.append(item)", "tumpukan.push(item)", "tumpukan.add(item)", "tumpukan.insert(0, item)"], correct: 0, explain: "Python list tidak punya metode push — kita gunakan append() untuk menambah elemen ke akhir (atas stack)." },
      { q: "Untuk melihat elemen teratas Stack tanpa menghapusnya (peek), cara paling tepat di Python adalah...", options: ["tumpukan[-1]", "tumpukan[0]", "tumpukan.top()", "tumpukan.get()"], correct: 0, explain: "Indeks -1 mengakses elemen terakhir (teratas stack) tanpa menghapusnya." },
      { q: "Tree (pohon) dalam struktur data paling tepat menggambarkan...", options: ["Hierarki — satu simpul induk bisa punya banyak anak", "Rangkaian linear seperti list", "Tumpukan berlapis-lapis tanpa hubungan", "Antrian yang selalu FIFO"], correct: 0, explain: "Tree cocok untuk hierarki: folder/file, pohon keluarga, atau menu aplikasi berlapis." },
      { q: "Graf berbeda dari Tree karena...", options: ["Graf bisa punya siklus dan koneksi bebas antar simpul, bukan hanya hierarki", "Graf hanya bisa menyimpan angka", "Graf tidak bisa memiliki lebih dari 3 simpul", "Graf selalu lebih lambat dari Tree"], correct: 0, explain: "Graf lebih fleksibel: simpul bisa terhubung ke mana saja, tidak harus membentuk hierarki seperti Tree." },
      { q: "Contoh kehidupan nyata yang paling cocok dimodelkan sebagai Graf adalah...", options: ["Jaringan jalan antar kota yang saling terhubung", "Daftar nilai siswa berurutan", "Struktur direktori file komputer", "Antrian pembeli di kasir"], correct: 0, explain: "Graf ideal untuk jaringan: setiap kota adalah simpul, dan jalan adalah sisi — bisa membentuk siklus." },
    ]);
  }

  if (id === "inf8-3") {
    return seeds.concat([
      { q: "Dalam spreadsheet nilai, rumus paling tepat untuk menjumlahkan nilai tugas dan kuis adalah...", options: ["Formula penjumlahan pada sel yang berisi nilai", "Mengganti font agar angka terlihat lebih besar", "Menghapus kolom nilai yang sulit dihitung", "Menyalin judul tabel ke semua baris"], correct: 0, explain: "Formula dipakai untuk menghitung data berdasarkan isi sel." },
      { q: "Jika guru ingin melihat rata-rata nilai kelas, fitur yang paling tepat adalah...", options: ["Fungsi rata-rata pada rentang nilai", "Mengurutkan nama siswa berdasarkan panjang nama", "Mengubah warna latar spreadsheet", "Menyembunyikan semua nilai yang rendah"], correct: 0, explain: "Fungsi membantu melakukan perhitungan umum seperti rata-rata." },
      { q: "Grafik batang paling cocok digunakan ketika siswa ingin...", options: ["Membandingkan jumlah antar kategori", "Menyimpan password akun kelas", "Menulis paragraf panjang tanpa angka", "Menghapus data yang tidak sesuai harapan"], correct: 0, explain: "Grafik batang cocok untuk perbandingan antar kategori." },
      { q: "Filter pada spreadsheet berguna saat ingin...", options: ["Menampilkan data tertentu sesuai kriteria", "Membuat semua data otomatis benar", "Mengubah tabel menjadi video", "Menghapus kebutuhan membaca judul kolom"], correct: 0, explain: "Filter menyaring tampilan data berdasarkan syarat tertentu." },
      { q: "Kesalahan formula #DIV/0! biasanya menunjukkan...", options: ["Ada pembagian dengan nol atau sel pembagi kosong", "Spreadsheet berhasil membuat grafik terbaik", "Data otomatis sudah siap dipublikasikan", "Judul tabel perlu dibuat lebih panjang"], correct: 0, explain: "Pesan kesalahan membantu menemukan bagian formula yang perlu diperbaiki." },
      { q: "Saat membaca grafik nilai, siswa tidak boleh langsung menyimpulkan sebelum...", options: ["Memeriksa judul, satuan, sumber data, dan rentang datanya", "Memilih warna grafik yang paling disukai", "Menghapus legenda agar grafik terlihat sederhana", "Mencetak grafik tanpa melihat angka"], correct: 0, explain: "Interpretasi grafik perlu memperhatikan konteks dan elemen grafik." },
    ]);
  }

  if (id === "inf8-4") {
    return seeds.concat([
      { q: "Dokumen laporan proyek lebih mudah dibaca jika...", options: ["Memiliki judul, subjudul, paragraf rapi, dan urutan ide jelas", "Semua teks diberi warna berbeda agar terlihat ramai", "Sumber gambar dihapus supaya halaman lebih bersih", "Semua paragraf digabung menjadi satu blok panjang"], correct: 0, explain: "Struktur dan format membantu pembaca mengikuti isi dokumen." },
      { q: "Slide presentasi yang efektif sebaiknya...", options: ["Berisi poin ringkas dan visual yang mendukung pesan", "Memuat seluruh naskah laporan agar pembicara tinggal membaca", "Menggunakan animasi sebanyak mungkin pada setiap kata", "Menaruh gambar acak agar slide tidak kosong"], correct: 0, explain: "Slide membantu komunikasi, bukan menggantikan seluruh penjelasan." },
      { q: "Jika satu kelompok mengedit dokumen bersama, kebiasaan kolaborasi yang baik adalah...", options: ["Membagi peran, memberi komentar jelas, dan tidak menghapus bagian teman tanpa diskusi", "Mengedit semua bagian sekaligus tanpa memberi tahu anggota lain", "Menghapus nama anggota agar dokumen terlihat ditulis satu orang", "Menyalin sumber tanpa mencatat asalnya"], correct: 0, explain: "Kolaborasi digital memerlukan komunikasi dan tanggung jawab." },
      { q: "Visualisasi data pada presentasi dipakai agar...", options: ["Audiens lebih mudah melihat pola atau perbandingan penting", "Slide terlihat penuh walaupun data tidak relevan", "Pembicara tidak perlu menjelaskan sumber data", "Semua angka bisa disembunyikan dari audiens"], correct: 0, explain: "Visualisasi harus membantu memahami pesan atau data." },
      { q: "Saat memakai gambar dari internet di dokumen, tindakan paling tepat adalah...", options: ["Memeriksa izin penggunaan dan mencantumkan sumber", "Mengubah sedikit warna agar tidak perlu menyebut sumber", "Menghapus watermark lalu menganggap gambar milik sendiri", "Memilih gambar terbesar tanpa membaca konteks"], correct: 0, explain: "Dokumen digital tetap perlu menghargai hak cipta dan sumber." },
      { q: "Jika slide terlalu penuh teks, perbaikan terbaik adalah...", options: ["Meringkas poin utama dan memindahkan detail ke penjelasan lisan", "Menambah ukuran slide tanpa mengurangi kata", "Mengubah semua teks menjadi huruf kapital", "Menghapus judul agar ruangnya lebih luas"], correct: 0, explain: "Slide yang ringkas membantu audiens fokus pada ide utama." },
    ]);
  }

  if (id === "inf8-5") {
    return seeds.concat([
      { q: "Sebelum membuat konten digital, keputusan awal yang paling penting adalah...", options: ["Menentukan tujuan, audiens, pesan utama, dan kanal publikasi", "Memilih musik paling populer tanpa melihat isi pesan", "Mengunggah dulu lalu menentukan tujuan setelah viral", "Menyalin desain orang lain agar cepat selesai"], correct: 0, explain: "Produksi konten perlu perencanaan agar pesan tepat sasaran." },
      { q: "Konten untuk siswa kelas 7 sebaiknya berbeda dari konten untuk orang tua karena...", options: ["Audiens berbeda membutuhkan bahasa, contoh, dan kanal yang berbeda", "Semua audiens harus mendapat kalimat yang sama persis", "Konten untuk orang tua tidak boleh memakai data", "Konten untuk siswa harus selalu tanpa tujuan"], correct: 0, explain: "Mengenali audiens membantu menentukan bentuk komunikasi." },
      { q: "Python Pillow digunakan untuk produksi konten digital ketika...", options: ["Perlu membuat atau memodifikasi gambar secara programatik dari data", "Ingin desain manual dengan drag-and-drop yang cepat", "Membuat video animasi dengan musik", "Mengolah spreadsheet nilai siswa"], correct: 0, explain: "Pillow cocok untuk otomasi — misal generate 100 sertifikat dari spreadsheet secara otomatis." },
      { q: "Jika memakai lagu populer sebagai latar video tugas, hal yang perlu diperhatikan adalah...", options: ["Hak cipta dan izin penggunaan lagu tersebut", "Jumlah komentar pada video asli saja", "Warna sampul lagu agar cocok dengan poster", "Panjang judul lagu agar mudah diingat"], correct: 0, explain: "Aset digital seperti lagu, gambar, dan video dilindungi hak cipta." },
      { q: "Keunggulan Canva dibanding Python Pillow untuk pemula adalah...", options: ["Antarmuka visual drag-and-drop yang tidak memerlukan kode", "Bisa generate ribuan file sekaligus dari data spreadsheet", "Lebih cepat untuk membuat animasi kompleks", "Tidak perlu koneksi internet sama sekali"], correct: 0, explain: "Canva mudah dipakai tanpa coding — ideal untuk desain manual satu per satu." },
      { q: "Evaluasi konten setelah dipublikasikan berguna untuk...", options: ["Menilai apakah tujuan tercapai dan apa yang perlu diperbaiki", "Membuktikan bahwa semua komentar negatif pasti salah", "Menghapus konten lain agar konten sendiri terlihat unggul", "Mengubah data agar hasil evaluasi selalu bagus"], correct: 0, explain: "Evaluasi membantu memperbaiki konten dan strategi berikutnya." },
    ]);
  }

  if (id === "inf8-6") {
    return seeds.concat([
      { q: "Password yang lebih aman untuk akun belajar adalah...", options: ["Unik, panjang, tidak mudah ditebak, dan tidak dipakai di semua akun", "Nama panggilan ditambah tanggal lahir agar mudah diingat teman", "Satu password yang sama untuk semua akun agar praktis", "Kata 'password' karena mudah diketik saat terburu-buru"], correct: 0, explain: "Password kuat dan unik mengurangi risiko akun lain ikut bocor." },
      { q: "Pesan yang meminta OTP dengan alasan hadiah sebaiknya...", options: ["Diabaikan, tidak diberi OTP, dan dicek ke sumber resmi", "Dibalas cepat agar hadiah tidak hilang", "Diteruskan ke teman agar semua mendapat kesempatan", "Dikirimi data lain sebagai pengganti OTP"], correct: 0, explain: "OTP adalah kode rahasia dan tidak boleh dibagikan." },
      { q: "Tautan phishing sering berbahaya karena...", options: ["Menyamar sebagai situs resmi untuk mencuri data pengguna", "Selalu mempercepat internet saat dibuka", "Membuat layar lebih terang dari biasanya", "Menghapus semua iklan di halaman web"], correct: 0, explain: "Phishing menipu pengguna agar memasukkan data pada tempat palsu." },
      { q: "Contoh praktik keamanan digital dengan Python yang sesuai untuk pemula adalah...", options: ["Membuat pengecek sederhana apakah password cukup panjang dan bervariasi", "Menyimpan password teman di file publik", "Membuat tautan palsu untuk menipu orang", "Menghapus data penting tanpa backup"], correct: 0, explain: "Python bisa dipakai untuk latihan sederhana yang memperkuat kebiasaan aman, misalnya mengecek kekuatan password." },
      { q: "Backup data penting berguna ketika...", options: ["Perangkat rusak, file terhapus, atau akun bermasalah", "Siswa ingin membuat password menjadi lebih pendek", "Semua data ingin dibagikan ke publik", "Aplikasi tidak perlu diperbarui lagi"], correct: 0, explain: "Backup membantu pemulihan saat terjadi masalah data." },
      { q: "Verifikasi dua langkah membuat akun lebih aman karena...", options: ["Login membutuhkan bukti tambahan selain password", "Password menjadi boleh dibagikan ke teman dekat", "Akun tidak perlu lagi memakai email pemulihan", "Semua tautan otomatis menjadi aman"], correct: 0, explain: "Lapisan keamanan tambahan membantu mencegah akses tidak sah." },
    ]);
  }

  if (id === "inf9-2") {
    return seeds.concat([
      { q: "Pseudocode berguna sebelum membuat program karena...", options: ["Membantu merancang logika tanpa terikat aturan bahasa pemrograman tertentu", "Menghapus kebutuhan menguji program setelah selesai dibuat", "Membuat semua program otomatis bebas kesalahan", "Mengubah gambar flowchart menjadi nilai kuis"], correct: 0, explain: "Pseudocode memudahkan perencanaan alur solusi." },
      { q: "Flowchart paling tepat digunakan untuk...", options: ["Memvisualkan urutan langkah, keputusan, dan alur proses", "Menghias laporan agar semua halaman penuh gambar", "Menyimpan data pribadi siswa dalam satu diagram", "Mengganti semua kebutuhan membaca masalah"], correct: 0, explain: "Flowchart membantu melihat alur algoritma secara visual." },
      { q: "Instruksi 'Jika nilai >= 75 maka lulus, selain itu remedial' menunjukkan konsep...", options: ["Percabangan karena ada kondisi yang menentukan tindakan", "Perulangan karena langkah yang sama selalu diulang", "Penyimpanan karena data otomatis masuk flashdisk", "Publikasi karena hasil langsung dibagikan"], correct: 0, explain: "Percabangan memilih jalur berdasarkan kondisi." },
      { q: "Perulangan cocok digunakan ketika...", options: ["Langkah yang sama perlu dilakukan beberapa kali sampai syarat tertentu terpenuhi", "Hanya ada satu instruksi yang tidak pernah diulang", "Program tidak memiliki input sama sekali", "Hasil program harus berupa gambar presentasi"], correct: 0, explain: "Loop/perulangan mengulang instruksi secara terkontrol." },
      { q: "Blok visual programming membantu pemula karena...", options: ["Struktur perintah terlihat dan bisa disusun seperti potongan logika", "Semua kesalahan logika pasti hilang tanpa pengujian", "Program bisa dibuat tanpa memahami urutan langkah", "Blok hanya dipakai untuk mengganti warna layar"], correct: 0, explain: "Blok visual memudahkan melihat struktur program, tetapi tetap perlu pemahaman logika." },
      { q: "Saat algoritma kuis tidak menambah skor setelah jawaban benar, langkah evaluasi terbaik adalah...", options: ["Cek kondisi jawaban benar dan instruksi penambahan skor", "Menghapus semua soal agar skor tidak perlu dihitung", "Mengganti tema warna supaya skor muncul", "Menambah gambar agar program terlihat selesai"], correct: 0, explain: "Debugging fokus pada bagian logika yang berhubungan dengan gejala." },
    ]);
  }

  if (id === "inf9-3" || id === "inf9-4") {
    return seeds.concat([
      { q: "Jejak digital perlu dijaga karena...", options: ["Unggahan, komentar, dan data bisa tersimpan serta memengaruhi reputasi", "Semua unggahan pasti hilang ketika aplikasi ditutup", "Internet hanya dapat dilihat oleh teman satu kelas", "Komentar lama tidak pernah bisa ditemukan kembali"], correct: 0, explain: "Aktivitas digital dapat meninggalkan dampak jangka panjang." },
      { q: "Jika melihat perundungan siber di grup, tindakan paling aman adalah...", options: ["Simpan bukti, jangan ikut menyerang, dan lapor ke orang dewasa tepercaya", "Membalas lebih kasar agar pelaku berhenti", "Menyebarkan tangkapan layar ke banyak grup", "Diam saja karena masalah online tidak berdampak nyata"], correct: 0, explain: "Respons aman melindungi korban dan mendukung penanganan tepat." },
      { q: "Data seperti alamat rumah, nomor telepon, dan foto kartu pelajar termasuk...", options: ["Data pribadi yang perlu dilindungi", "Dekorasi profil yang selalu aman dibagikan", "Data umum yang tidak pernah disalahgunakan", "Konten hiburan yang bebas dipublikasikan"], correct: 0, explain: "Data pribadi bisa dipakai untuk mengenali atau menghubungi seseorang." },
      { q: "Saat aplikasi meminta izin kamera, lokasi, dan kontak, keputusan terbaik adalah...", options: ["Memeriksa kebutuhan izin dan menolak yang tidak relevan", "Menyetujui semua izin agar aplikasi bekerja lebih cepat", "Mengirim izin aplikasi ke teman agar bisa ikut login", "Mengaktifkan lokasi setiap saat untuk semua aplikasi"], correct: 0, explain: "Izin aplikasi perlu dibatasi sesuai fungsi dan kebutuhan." },
      { q: "Jika akun teman diretas dan mengirim tautan aneh, tindakan tepat adalah...", options: ["Jangan klik tautan, konfirmasi lewat jalur lain, dan beri tahu teman", "Klik cepat karena pesan berasal dari akun teman", "Masukkan password agar tautan bisa diperiksa", "Sebarkan ke grup lain agar semua ikut melihat"], correct: 0, explain: "Akun yang diretas bisa mengirim pesan berbahaya seolah dari orang dikenal." },
      { q: "Mengapa empati penting saat berkomunikasi digital?", options: ["Karena pesan singkat tetap dapat melukai, mempermalukan, atau membantu orang lain", "Karena semua komentar online hanya bercanda dan tidak berdampak", "Karena empati membuat password lebih sulit ditebak", "Karena internet menghapus semua perasaan pengguna"], correct: 0, explain: "Interaksi digital tetap melibatkan manusia dan dampak sosial." },
    ]);
  }

  if (id === "inf9-5") {
    return seeds.concat([
      { q: "Mindfulness digital berarti...", options: ["Sadar terhadap tujuan, durasi, dan dampak penggunaan teknologi", "Memakai perangkat selama mungkin tanpa berhenti", "Membuka semua notifikasi agar tidak ketinggalan apa pun", "Menghapus semua aplikasi tanpa memahami kebutuhan"], correct: 0, explain: "Mindfulness digital menekankan kesadaran dan kendali diri saat memakai teknologi." },
      { q: "Screen time perlu dikelola karena...", options: ["Durasi dan pola penggunaan dapat memengaruhi fokus, tidur, dan emosi", "Semakin lama layar selalu membuat nilai belajar naik", "Semua aplikasi belajar pasti boleh dipakai tanpa batas", "Perangkat otomatis tahu kapan siswa harus berhenti"], correct: 0, explain: "Keseimbangan digital membantu kesehatan dan produktivitas." },
      { q: "Saat belajar, notifikasi terus-menerus sebaiknya...", options: ["Dibatasi atau dimatikan sementara agar fokus terjaga", "Dinyalakan semua agar belajar terasa ramai", "Dibalas satu per satu saat mengerjakan tugas penting", "Dijadikan alasan untuk membuka aplikasi lain"], correct: 0, explain: "Mengelola notifikasi membantu mempertahankan perhatian." },
      { q: "Contoh kebiasaan digital seimbang adalah...", options: ["Menentukan waktu belajar, istirahat layar, dan waktu tidur yang cukup", "Menggunakan perangkat sampai lupa makan dan tidur", "Membuka media sosial setiap kali merasa bosan saat belajar", "Menghindari semua teknologi termasuk untuk tugas sekolah"], correct: 0, explain: "Keseimbangan bukan menolak teknologi, tetapi menggunakannya secara sadar." },
      { q: "Refleksi setelah memakai gawai berguna untuk...", options: ["Mengenali pola penggunaan dan merancang perbaikan yang realistis", "Membuktikan bahwa semua aplikasi selalu buruk", "Menghapus kebutuhan membuat jadwal belajar", "Menambah waktu layar tanpa merasa bersalah"], correct: 0, explain: "Refleksi membantu siswa memahami kebiasaan dan dampaknya." },
      { q: "Jika siswa sulit berhenti bermain gim sebelum tidur, langkah awal yang realistis adalah...", options: ["Membuat batas waktu, menjauhkan perangkat, dan memilih aktivitas penutup lain", "Menghapus semua tugas sekolah agar waktu gim lebih panjang", "Tidur sambil tetap memegang perangkat", "Menyalakan notifikasi gim supaya tidak lupa bermain"], correct: 0, explain: "Perubahan kebiasaan lebih mudah dimulai dari batas kecil dan lingkungan yang mendukung." },
    ]);
  }

  if (id === "inf9-6") {
    return seeds.concat([
      { q: "Pada projek akhir, langkah pertama yang paling tepat adalah...", options: ["Menentukan masalah nyata, tujuan, dan batasan proyek", "Langsung memilih warna poster tanpa memahami masalah", "Membuat presentasi sebelum data dikumpulkan", "Menyalin proyek kelompok lain agar cepat selesai"], correct: 0, explain: "Proyek kuat dimulai dari masalah dan tujuan yang jelas." },
      { q: "Data dalam projek akhir dipakai untuk...", options: ["Memahami masalah, mendukung keputusan, dan mengevaluasi solusi", "Mengisi halaman laporan agar terlihat panjang", "Mengganti semua kebutuhan wawancara atau observasi", "Membuat produk terlihat sulit walau tidak relevan"], correct: 0, explain: "Data memberi dasar bukti bagi solusi proyek." },
      { q: "Algoritma dalam produk digital proyek membantu...", options: ["Menjelaskan langkah kerja atau logika solusi secara runtut", "Menghapus kebutuhan pembagian tugas kelompok", "Membuat desain otomatis menarik tanpa tujuan", "Menentukan nilai proyek sebelum diuji"], correct: 0, explain: "Algoritma membuat cara kerja solusi lebih jelas dan bisa diuji." },
      { q: "Produk digital yang baik untuk projek akhir sebaiknya...", options: ["Menjawab masalah, mudah digunakan, dan bisa diuji oleh pengguna", "Memiliki fitur sebanyak mungkin walau tidak dipakai", "Meniru tampilan aplikasi populer tanpa fungsi jelas", "Hanya berisi judul besar dan animasi menarik"], correct: 0, explain: "Produk perlu sesuai kebutuhan dan bisa dievaluasi." },
      { q: "Saat presentasi proyek, bagian evaluasi sebaiknya memuat...", options: ["Apa yang berhasil, bukti hasil, kendala, dan rencana perbaikan", "Hanya pujian untuk kelompok sendiri", "Daftar warna yang dipakai dalam slide", "Alasan mengapa proyek lain tidak perlu dilihat"], correct: 0, explain: "Evaluasi menunjukkan sikap reflektif dan berbasis bukti." },
      { q: "Jika data proyek tidak mendukung ide awal kelompok, tindakan paling ilmiah adalah...", options: ["Merevisi solusi atau kesimpulan berdasarkan data yang ditemukan", "Mengubah data agar sesuai ide awal", "Menghapus data yang tidak menguntungkan", "Mengabaikan data dan tetap memakai pendapat kelompok"], correct: 0, explain: "Integritas proyek berarti mengikuti bukti, bukan memaksa bukti mengikuti keinginan." },
    ]);
  }

  return seeds.concat([
    { q: `Pada modul "${mod.title}", hasil belajar paling kuat terlihat ketika siswa...`, options: [`Mampu memakai ${focus} untuk menganalisis kasus baru`, "Hanya menghafal judul tanpa memahami contoh", "Mengerjakan kuis tanpa membaca feedback", "Melewati misi karena sudah melihat ringkasan"], correct: 0, explain: "Pengayaan menargetkan penerapan konsep pada situasi baru." },
    { q: `Produk pengayaan berupa ${product} sebaiknya dinilai dari...`, options: ["Kesesuaian dengan tujuan, alasan, dan kemampuan direvisi", "Jumlah warna dan dekorasi yang paling mencolok", "Kecepatan selesai tanpa memahami konteks", "Kemiripan penuh dengan jawaban teman"], correct: 0, explain: "Produk belajar perlu menunjukkan pemahaman, bukan sekadar tampilan." },
  ]);
}

function getModuleCoreQuestions(mod) {
  const title = mod?.title || "modul ini";
  const firstTopic = mod?.topics?.[0] || "konsep utama";
  return [
    {
      q: `Saat memulai pengayaan "${title}", tindakan awal yang paling menunjukkan pemahaman adalah...`,
      options: [
        `Membaca tujuan, mengenali ${firstTopic}, lalu mencoba contoh kasusnya`,
        "Langsung menebak jawaban kuis tanpa membaca konteks materi",
        "Memilih aktivitas yang paling mudah tanpa melihat tujuan belajar",
        "Menghafal judul modul lalu melewati bagian umpan balik",
      ],
      correct: 0,
      explain: "Pengayaan SIGMA menekankan memahami tujuan, mencoba kasus, lalu memakai umpan balik untuk memperdalam materi.",
    },
    {
      q: `Seorang siswa sudah membaca modul cetak tentang "${title}". Cara terbaik memakai SIGMA sebagai pengayaan adalah...`,
      options: [
        "Mencoba misi, membaca feedback, lalu menghubungkannya dengan contoh di modul cetak",
        "Mencari tombol unduh agar isi modul cetak bisa digandakan ulang",
        "Menyelesaikan kuis secepat mungkin tanpa melihat alasan jawaban",
        "Mengabaikan misi karena pengayaan tidak perlu latihan interaktif",
      ],
      correct: 0,
      explain: "Website ini dibuat untuk pengayaan dan pendalaman, bukan pengganti atau salinan modul cetak.",
    },
    {
      q: `Jika jawaban pada misi "${title}" belum tepat, sikap belajar yang paling kuat adalah...`,
      options: [
        "Membaca feedback, membandingkan alasan, lalu merevisi pilihan",
        "Mengulang pilihan yang sama karena yang penting sudah mencoba",
        "Menutup halaman karena kesalahan berarti materi tidak cocok",
        "Memilih jawaban acak agar cepat mendapat tanda selesai",
      ],
      correct: 0,
      explain: "Feedback membantu siswa memperbaiki pemahaman, terutama pada materi yang menguji penerapan.",
    },
  ];
}

function expandQuizQuestions(mod, seeds = []) {
  const questions = seeds.map((q, i) => ({ difficulty: difficultyForQuizIndex(i), ...q }));
  const topics = mod?.topics || [];
  const profile = MODULE_PROFILES[mod?.id] || null;
  const focus = profile?.focus || mod?.title || "materi modul";
  const product = profile?.product || "contoh pengayaan";

  topics.forEach(topic => {
    questions.push({
      q: `Pada sebuah kasus nyata, topik "${topic}" dalam modul "${mod.title}" paling tepat dipakai untuk...`,
      options: [`Menganalisis situasi yang berhubungan dengan ${focus} lalu memilih tindakan yang masuk akal`, "Membuat tampilan tugas terlihat menarik tanpa memeriksa isi dan tujuan", "Menghapus contoh yang berbeda karena dianggap mengganggu kesimpulan", "Menghafal istilah dari modul tanpa mencoba menggunakannya pada kasus"],
      correct: 0,
      explain: `${topic} dipelajari sebagai bagian dari ${focus}.`,
      difficulty: difficultyForQuizIndex(questions.length),
    });
  });

  topics.slice(0, 5).forEach(topic => {
    questions.push({
      q: `Setelah membaca bagian "${topic}", aktivitas yang paling menguji pemahaman adalah...`,
      options: [`Menganalisis kasus, memilih alasan, lalu membuat ${product} sesuai materi`, "Menyalin contoh dari teman agar hasil terlihat sama dan cepat selesai", "Melewati feedback karena benar-salah tidak memengaruhi pemahaman", "Mengubah warna tampilan aktivitas tanpa menjelaskan keputusan yang dibuat"],
      correct: 0,
      explain: `SIGMA dipakai untuk memperdalam modul lewat ${product} dan aktivitas interaktif.`,
      difficulty: difficultyForQuizIndex(questions.length),
    });
  });

  questions.push(...getModuleScenarioQuestions(mod));

  while (questions.length < 15) {
    const topic = topics[questions.length % Math.max(1, topics.length)] || mod.title;
    questions.push({
      q: `Mengapa "${topic}" perlu dipahami, bukan hanya dihafal?`,
      options: ["Agar konsep bisa dipakai mengambil keputusan pada kasus baru", "Agar jawaban kuis terlihat panjang meskipun alasannya lemah", "Agar siswa tidak perlu mencoba praktik atau membaca umpan balik", "Agar modul cetak berubah menjadi bahan yang bisa diunduh"],
      correct: 0,
      explain: "Pengayaan SIGMA menekankan pemahaman dan penerapan, bukan sekadar hafalan.",
      difficulty: difficultyForQuizIndex(questions.length),
    });
  }

  return questions.slice(0, 15).map((q, i) => ({ difficulty: difficultyForQuizIndex(i), ...q }));
}

function difficultyForQuizIndex(index) {
  if (index < 4) return "Mudah";
  if (index < 9) return "Sedang";
  if (index < 13) return "Sulit";
  return "HOTS";
}

function getModuleScenarioQuestions(mod) {
  const id = mod?.id || "";
  const scenarioMap = {
    "inf7-1": [
      { q: "Jika masalah jadwal piket terasa rumit, langkah BK pertama yang tepat adalah...", options: ["Memecah masalah menjadi bagian kecil", "Langsung menyalahkan teman", "Menghapus jadwal", "Membuat warna tabel"], correct: 0, explain: "Dekomposisi membantu masalah besar menjadi lebih mudah dikelola." },
      { q: "Detail mana yang bisa diabaikan saat membuat denah menuju perpustakaan?", options: ["Warna tas siswa", "Titik awal", "Arah belok", "Nama ruang"], correct: 0, explain: "Abstraksi memilih detail penting dan mengabaikan detail yang tidak relevan." },
    ],
    "inf7-2": [
      { q: "Agar instruksi komputer tidak membingungkan, langkah yang dibuat harus...", options: ["Urut, jelas, dan bisa diikuti", "Panjang tetapi acak", "Berisi istilah sulit saja", "Tidak perlu diuji"], correct: 0, explain: "Instruksi komputasional perlu runtut dan dapat diuji." },
    ],
    "inf7-3": [
      { q: "Saat membuka situs, urutan yang paling masuk akal adalah...", options: ["Perangkat-router-internet-server-respons", "Server-buku-pensil-router", "Keyboard-monitor-kertas", "Akun-password-folder"], correct: 0, explain: "Data berjalan dari perangkat melalui jaringan menuju server dan kembali sebagai respons." },
    ],
    "inf7-4": [
      { q: "Saat mencari informasi untuk tugas, kata kunci yang baik sebaiknya...", options: ["Spesifik dan sesuai pertanyaan", "Sangat umum dan panjang", "Berisi kata acak", "Hanya memakai satu huruf"], correct: 0, explain: "Kata kunci spesifik membantu menemukan sumber yang relevan." },
    ],
    "inf7-5": [
      { q: "Klaim 'akun ini membagikan hadiah gratis' sebaiknya...", options: ["Dicek dulu sumber dan buktinya", "Langsung dibagikan", "Dipercaya karena menarik", "Dianggap selalu benar"], correct: 0, explain: "Klaim yang mengundang emosi atau hadiah perlu diverifikasi." },
    ],
    "inf7-6": [
      { q: "Jika melihat komentar yang mengejek teman di grup kelas, respons paling tepat adalah...", options: ["Tidak ikut menyebarkan, simpan bukti, dan laporkan ke orang dewasa tepercaya", "Ikut membalas agar ramai", "Membagikan tangkapan layar untuk hiburan", "Mengabaikan semua aturan netiket"], correct: 0, explain: "Perundungan digital perlu dihentikan dengan cara aman dan bertanggung jawab." },
    ],
    "inf8-1": [
      { q: "Antrean siswa di kantin paling cocok dimodelkan dengan struktur...", options: ["Queue karena yang datang lebih dulu dilayani lebih dulu", "Stack karena yang terakhir selalu dilayani dulu", "Graf lengkap", "Folder gambar"], correct: 0, explain: "Queue memakai prinsip FIFO: first in, first out." },
    ],
    "inf8-2": [
      { q: "Fitur undo pada editor paling dekat dengan konsep...", options: ["Stack", "Queue", "Graf sosial", "Tabel filter"], correct: 0, explain: "Undo mengambil aksi terakhir terlebih dahulu, sesuai prinsip stack/LIFO." },
    ],
    "inf8-3": [
      { q: "Untuk mencari nilai di atas 80 pada tabel, operasi yang paling tepat adalah...", options: ["Filter", "Menghapus tabel", "Mengganti tema", "Menutup spreadsheet"], correct: 0, explain: "Filter membantu menampilkan data yang memenuhi kriteria tertentu." },
      { q: "Atribut yang baik pada data siswa contohnya...", options: ["Nama dan kelas", "Warna latar", "Suasana ruangan saja", "Judul lagu tanpa konteks"], correct: 0, explain: "Atribut menjelaskan setiap objek data secara konsisten." },
    ],
    "inf8-4": [
      { q: "Saat proyek Scratch tidak berjalan sesuai rencana, langkah debugging awal yang masuk akal adalah...", options: ["Uji satu bagian kode lalu cari blok yang menyebabkan masalah", "Menghapus semua sprite", "Menambah suara sebanyak mungkin", "Mengabaikan pesan error"], correct: 0, explain: "Debugging lebih mudah saat masalah diperiksa bagian demi bagian." },
    ],
    "inf8-5": [
      { q: "Jika ingin menilai apakah solusi komputasional berhasil, kita perlu...", options: ["Membandingkan hasil dengan tujuan dan kriteria keberhasilan", "Melihat warna tampilannya saja", "Menghindari uji coba", "Menyalin solusi teman"], correct: 0, explain: "Evaluasi solusi perlu memakai tujuan dan kriteria yang jelas." },
    ],
    "inf8-6": [
      { q: "Contoh kebiasaan keamanan digital yang tepat adalah...", options: ["Tidak membagikan OTP", "Memakai satu password untuk semua akun", "Klik semua tautan", "Membuka data pribadi di publik"], correct: 0, explain: "OTP dan data pribadi harus dilindungi." },
    ],
    "inf9-1": [
      { q: "Representasi biner berguna karena komputer menyimpan dan memproses data sebagai...", options: ["Pola 0 dan 1", "Warna catatan", "Kalimat bebas", "Gambar tanpa kode"], correct: 0, explain: "Komputer digital bekerja dengan representasi 0 dan 1." },
    ],
    "inf9-2": [
      { q: "Pseudocode berguna karena...", options: ["Membantu merancang logika sebelum implementasi", "Menghapus kebutuhan berpikir", "Selalu mengganti semua program", "Hanya untuk menggambar"], correct: 0, explain: "Pseudocode membantu fokus pada alur logika." },
    ],
    "inf9-3": [
      { q: "Saat melihat perundungan siber, tindakan yang paling aman adalah...", options: ["Simpan bukti dan minta bantuan orang dewasa tepercaya", "Membalas dengan hinaan", "Menyebarkan tangkapan layar", "Mengajak teman menyerang balik"], correct: 0, explain: "Respons aman melindungi korban dan membantu pelaporan." },
    ],
    "inf9-4": [
      { q: "Contoh data pribadi yang tidak boleh dibagikan sembarangan adalah...", options: ["Alamat rumah dan kata sandi", "Nama mata pelajaran", "Judul buku pelajaran", "Warna sampul modul"], correct: 0, explain: "Data pribadi sensitif harus dilindungi agar tidak disalahgunakan." },
    ],
    "inf9-5": [
      { q: "Saat penggunaan gawai mulai mengganggu tidur dan belajar, strategi awal yang sehat adalah...", options: ["Membuat batas waktu dan jeda sadar", "Menambah notifikasi", "Membuka semua aplikasi sekaligus", "Mengabaikan rasa lelah"], correct: 0, explain: "Kesejahteraan digital membutuhkan pengaturan waktu dan perhatian." },
    ],
    "inf9-6": [
      { q: "Proyek digital yang baik sebaiknya dimulai dari...", options: ["Masalah nyata dan kebutuhan pengguna", "Memilih warna favorit saja", "Menyalin produk lain", "Membuat fitur sebanyak mungkin tanpa tujuan"], correct: 0, explain: "Proyek kuat berangkat dari masalah dan pengguna yang jelas." },
    ],
    "kka7-1": [
      { q: "Saat mencatat data perpustakaan, atribut yang paling berguna adalah...", options: ["Judul buku, peminjam, tanggal pinjam", "Warna langit", "Suasana hati penjaga", "Jenis musik favorit"], correct: 0, explain: "Atribut harus menjelaskan data yang sedang dianalisis." },
    ],
    "kka7-2": [
      { q: "Instruksi untuk robot menggambar persegi harus memuat...", options: ["Langkah berulang yang jelas dan urut", "Perintah acak tanpa ukuran", "Cerita panjang tanpa tindakan", "Gambar akhir saja"], correct: 0, explain: "Algoritma perlu instruksi runtut agar bisa dijalankan." },
    ],
    "kka7-3": [
      { q: "Slide presentasi yang baik sebaiknya...", options: ["Ringkas, visual relevan, dan mudah dibaca", "Penuh teks kecil", "Berisi semua animasi", "Tidak punya tujuan"], correct: 0, explain: "Konten digital efektif menyesuaikan pesan dengan audiens." },
    ],
    "kka7-4": [
      { q: "Sebelum membagikan konten buatan orang lain, tindakan etis adalah...", options: ["Memeriksa izin/lisensi dan mencantumkan sumber", "Menghapus nama pembuat", "Mengklaim sebagai karya sendiri", "Menyebarkan data pribadi"], correct: 0, explain: "Etika digital menghargai hak, privasi, dan tanggung jawab berbagi." },
    ],
    "kka7-5": [
      { q: "Aplikasi AI yang memberi rekomendasi tetap perlu dikritisi karena...", options: ["Bisa dipengaruhi data dan aturan yang digunakan", "Selalu pasti benar", "Tidak pernah memakai data", "Tidak berdampak pada manusia"], correct: 0, explain: "AI bisa membantu, tetapi hasilnya perlu dinilai secara kritis." },
    ],
    "kka7-6": [
      { q: "Prompt yang baik untuk AI sebaiknya berisi...", options: ["Tujuan, konteks, batasan, dan format hasil yang diinginkan", "Satu kata acak", "Perintah yang saling bertentangan", "Data pribadi rahasia"], correct: 0, explain: "Prompt jelas membantu AI menghasilkan keluaran yang lebih relevan dan aman." },
    ],
    "kka8-1": [
      { q: "Untuk membandingkan nilai beberapa kelas di spreadsheet, langkah yang tepat adalah...", options: ["Merapikan tabel, memakai fungsi ringkasan, lalu membaca hasilnya", "Menghapus header", "Mengubah semua angka jadi teks acak", "Menutup file"], correct: 0, explain: "Analisis spreadsheet membutuhkan data rapi dan fungsi yang sesuai." },
    ],
    "kka8-2": [
      { q: "Sebelum membuat program Scratch, pseudocode berguna untuk...", options: ["Merancang logika dan urutan aksi", "Mengganti semua blok", "Menghapus kebutuhan uji coba", "Memilih warna latar saja"], correct: 0, explain: "Pseudocode membantu merencanakan program sebelum implementasi." },
    ],
    "kka8-3": [
      { q: "Dalam produksi video pembelajaran, bagian yang paling perlu dijaga adalah...", options: ["Pesan jelas, audio terbaca, dan visual mendukung", "Efek sebanyak mungkin", "Durasi tanpa batas", "Sumber gambar tidak penting"], correct: 0, explain: "Multimedia efektif ketika pesan dan kualitas komunikasi jelas." },
    ],
    "kka8-4": [
      { q: "Jika memakai gambar berlisensi CC-BY, hal yang harus dilakukan adalah...", options: ["Mencantumkan atribusi pembuat", "Menghapus sumber", "Menjual ulang sebagai karya sendiri", "Mengubah lisensi seenaknya"], correct: 0, explain: "Lisensi CC-BY mengizinkan penggunaan dengan atribusi." },
    ],
    "kka8-5": [
      { q: "Model AI bisa bias jika...", options: ["Data latihnya tidak seimbang atau tidak mewakili semua kelompok", "Data latihnya rapi", "Pengguna membaca hasilnya", "Model diuji sebelum digunakan"], correct: 0, explain: "Kualitas dan keberagaman data latih memengaruhi hasil AI." },
    ],
    "kka8-6": [
      { q: "Saat melatih model klasifikasi gambar, dataset yang baik sebaiknya...", options: ["Beragam, cukup banyak, dan labelnya benar", "Semua gambar sama persis", "Label dibuat acak", "Hanya satu contoh per kelas"], correct: 0, explain: "Model belajar dari data, sehingga dataset harus representatif dan berlabel benar." },
    ],
    "kka9-1": [
      { q: "Fungsi spreadsheet seperti VLOOKUP/XLOOKUP berguna untuk...", options: ["Mencari dan mencocokkan data dari tabel", "Menggambar ikon", "Menghapus seluruh sheet", "Mengganti semua angka jadi gambar"], correct: 0, explain: "Lookup membantu menemukan data berdasarkan kunci tertentu." },
    ],
    "kka9-2": [
      { q: "Binary search efektif jika data...", options: ["Sudah terurut", "Selalu acak", "Tidak punya nilai", "Berisi gambar saja"], correct: 0, explain: "Binary search membagi ruang pencarian pada data yang sudah terurut." },
    ],
    "kka9-3": [
      { q: "Konten digital lanjutan perlu konsisten agar...", options: ["Audiens mudah mengenali pesan dan identitasnya", "Semua file menjadi besar", "Tidak perlu sumber", "Semua platform otomatis sama"], correct: 0, explain: "Konsistensi membantu pesan terlihat profesional dan mudah diingat." },
    ],
    "kka9-4": [
      { q: "Strategi diseminasi yang baik dimulai dari...", options: ["Memahami audiens target dan platform yang mereka gunakan", "Mengunggah acak ke semua tempat", "Mengabaikan analytics", "Menyalin kampanye lain"], correct: 0, explain: "Diseminasi efektif perlu audiens, platform, pesan, dan evaluasi yang jelas." },
    ],
    "kka9-5": [
      { q: "Saat menerima video yang terlihat mencurigakan, langkah literasi digital yang tepat adalah...", options: ["Cek sumber, konteks, dan kemungkinan manipulasi", "Langsung percaya", "Sebarkan agar viral", "Abaikan semua bukti"], correct: 0, explain: "Konten manipulatif seperti deepfake perlu diverifikasi sebelum dipercaya atau dibagikan." },
    ],
    "kka9-6": [
      { q: "Dalam proyek akhir berbasis AI, Design Thinking membantu siswa...", options: ["Memahami pengguna, membuat ide, menguji prototipe, dan memperbaiki solusi", "Langsung membuat produk tanpa masalah", "Menghindari refleksi", "Menghapus dokumentasi"], correct: 0, explain: "Design Thinking menuntun proyek dari kebutuhan pengguna sampai iterasi solusi." },
    ],
  };
  return scenarioMap[id] || [
    { q: "Sikap terbaik saat menyelesaikan aktivitas SIGMA adalah...", options: ["Mencoba, membaca feedback, lalu merevisi", "Menyerah saat salah", "Menebak tanpa membaca", "Menghindari Misi"], correct: 0, explain: "Feedback dan revisi membantu belajar lebih dalam." },
  ];
}

function getQuizXpPreview(score) {
  return Math.max(0, Number(score || 0) * 2);
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
