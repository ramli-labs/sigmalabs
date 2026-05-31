// ============================================
// SIGMA App Root + Router
// ============================================

// --- shared globals ---
const { Icon, Navbar, Footer, Link, useRoute, navigate, SectionHeader, Breadcrumb, EmptyState, ModuleCard, LabschoolLogo, BrandStrip, ControlField } = window;
const { useState, useEffect, useRef } = React;

// --- page components ---
const {
  Landing, LoginPage, Dashboard, Catalog, ModuleDetail, Playground,
  LabList, GameList,
  SortingLab, BinaryLab, LogicGatesLab, NeuralLab, ImageClassifierLab, NetworkLab, SiftCheckLab, DatasetLabelingLab, SpreadsheetMiniLab, AIBiasAuditLab, DigitalFootprintLab, PythonTraceLab, SearchQualityLab, InstructionStudioLab,
  BugHunterGame, SortRaceGame, CaesarCipherGame, AIEthicsGame, PatternQuizGame, PromptCraftGame, BinaryTypingGame, FlowchartBuilderGame, LicenseQuestGame, StoryboardSprintGame, DeepfakeDetectiveGame, SearchRescueGame,
} = window;

const App = () => {
  const route = useRoute();
  const [, setUserVersion] = useState(0);

  useEffect(() => {
    const onUserChange = () => setUserVersion(v => v + 1);
    window.addEventListener("sigma:userchange", onUserChange);
    return () => window.removeEventListener("sigma:userchange", onUserChange);
  }, []);

  useEffect(() => {
    if (route !== "/" && route !== "/login" && !window.SIGMA_AUTH.hasProfiles()) {
      navigate("/login");
    }
  }, [route]);

  // Parse route
  if (route === "/" || route === "") return <Landing/>;
  if (route === "/login") return <LoginPage/>;
  if (!window.SIGMA_AUTH.hasProfiles()) return <LoginPage/>;
  if (route === "/dashboard") return <Dashboard/>;
  if (route === "/guru") return <window.TeacherDashboard/>;
  if (route === "/playground") return <Playground/>;

  // Kelas catalog: /kelas/7, /kelas/8, /kelas/9, optional subject filter.
  const kelasMatch = route.match(/^\/kelas\/(\d+)(?:\/(informatika|kka))?$/);
  if (kelasMatch) return <Catalog level={kelasMatch[1]} initialFilter={kelasMatch[2] || "all"}/>;

  // Module: /modul/:id
  const modulMatch = route.match(/^\/modul\/([\w-]+)$/);
  if (modulMatch) return <ModuleDetail key={modulMatch[1]} moduleId={modulMatch[1]}/>;

  // Lab list
  if (route === "/lab") return <LabList/>;

  // Individual labs
  const lockedResource = (kind, level) => (
    <div className="page" style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar/>
      <EmptyState
        icon="Lock"
        title={`${kind} ini belum terbuka untuk kelas ${window.USER.level}`}
        subtitle={`Konten ini ditujukan untuk kelas ${Array.isArray(level) ? level.join(", ") : level}. Ganti profil siswa jika ingin menyimulasikan kelas lain.`}
        action={<Link to="/login" className="btn btn-primary" style={{ marginTop: 20 }}>Ganti Profil</Link>}
      />
    </div>
  );
  // Jika lab/gim dibuka dari dalam modul (sebagai pengayaan misi), izinkan
  // walau level default-nya beda — guru sengaja menautkannya ke pelajaran itu.
  const cameFromModule = () => {
    try { return (sessionStorage.getItem("sigma_lab_referrer") || "").includes("/modul/"); }
    catch (e) { return false; }
  };
  const canOpenLab = (id) => {
    const lab = window.CURRICULUM.labs.find(l => l.id === id);
    return !lab || lab.level.includes(window.USER.level) || cameFromModule() ? null : lockedResource("Lab", lab.level);
  };
  const canOpenGame = (id) => {
    const game = window.CURRICULUM.games.find(g => g.id === id);
    return !game || game.level.includes(window.USER.level) || cameFromModule() ? null : lockedResource("Gim", game.level);
  };

  if (route === "/lab/sorting") return canOpenLab("sorting") || <SortingLab/>;
  if (route === "/lab/binary") return canOpenLab("binary") || <BinaryLab/>;
  if (route === "/lab/logic-gates") return canOpenLab("logic-gates") || <LogicGatesLab/>;
  if (route === "/lab/neural-playground") return canOpenLab("neural-playground") || <NeuralLab/>;
  if (route === "/lab/image-classifier") return canOpenLab("image-classifier") || <ImageClassifierLab/>;
  if (route === "/lab/network-sim") return canOpenLab("network-sim") || <NetworkLab/>;
  if (route === "/lab/sift-check") return canOpenLab("sift-check") || <SiftCheckLab/>;
  if (route === "/lab/dataset-labeling") return canOpenLab("dataset-labeling") || <DatasetLabelingLab/>;
  if (route === "/lab/spreadsheet-mini") return canOpenLab("spreadsheet-mini") || <SpreadsheetMiniLab/>;
  if (route === "/lab/ai-bias-audit") return canOpenLab("ai-bias-audit") || <AIBiasAuditLab/>;
  if (route === "/lab/digital-footprint") return canOpenLab("digital-footprint") || <DigitalFootprintLab/>;
  if (route === "/lab/python-trace") return canOpenLab("python-trace") || <PythonTraceLab/>;
  if (route === "/lab/search-quality") return canOpenLab("search-quality") || <SearchQualityLab/>;
  if (route === "/lab/instruction-studio") return canOpenLab("instruction-studio") || <InstructionStudioLab/>;

  // Game list
  if (route === "/gim") return <GameList/>;

  // Individual games
  if (route === "/gim/bug-hunter") return canOpenGame("bug-hunter") || <BugHunterGame/>;
  if (route === "/gim/sort-race") return canOpenGame("sort-race") || <SortRaceGame/>;
  if (route === "/gim/caesar-cipher") return canOpenGame("caesar-cipher") || <CaesarCipherGame/>;
  if (route === "/gim/ai-ethics") return canOpenGame("ai-ethics") || <AIEthicsGame/>;
  if (route === "/gim/pattern-quiz") return canOpenGame("pattern-quiz") || <PatternQuizGame/>;
  if (route === "/gim/prompt-craft") return canOpenGame("prompt-craft") || <PromptCraftGame/>;
  if (route === "/gim/typing-binary") return canOpenGame("typing-binary") || <BinaryTypingGame/>;
  if (route === "/gim/flowchart-builder") return canOpenGame("flowchart-builder") || <FlowchartBuilderGame/>;
  if (route === "/gim/license-quest") return canOpenGame("license-quest") || <LicenseQuestGame/>;
  if (route === "/gim/storyboard-sprint") return canOpenGame("storyboard-sprint") || <StoryboardSprintGame/>;
  if (route === "/gim/deepfake-detective") return canOpenGame("deepfake-detective") || <DeepfakeDetectiveGame/>;
  if (route === "/gim/search-rescue") return canOpenGame("search-rescue") || <SearchRescueGame/>;

  // 404
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar/>
      <div style={{ maxWidth: 600, margin: "100px auto", textAlign: "center", padding: "0 32px" }}>
        <div className="display" style={{ fontSize: 120, color: "var(--gold-400)", margin: 0 }}>404</div>
        <h1 className="display" style={{ fontSize: 32 }}>Halaman tidak ditemukan</h1>
        <p style={{ color: "var(--ink-muted)", marginBottom: 24 }}>Rute <code style={{ background: "white", padding: "2px 8px", borderRadius: 4, fontFamily: "var(--font-mono)" }}>#{route}</code> belum tersedia.</p>
        <Link to="/" className="btn btn-primary"><Icon.Home width="16" height="16"/> Kembali ke Beranda</Link>
      </div>
    </div>
  );
};

class SigmaErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    window.SIGMA_LAST_ERROR = { error, info };
    console.error("SIGMA render error", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="card" style={{ maxWidth: 560, padding: 28, background: "white" }}>
          <div className="tag tag-red" style={{ marginBottom: 14 }}>Terjadi Gangguan</div>
          <h1 className="display" style={{ fontSize: 30, margin: "0 0 10px", color: "var(--navy-950)" }}>SIGMA perlu dimuat ulang</h1>
          <p style={{ color: "var(--ink-muted)", lineHeight: 1.6, margin: "0 0 20px" }}>
            Ada bagian halaman yang gagal dimuat. Data belajar lokal tetap aman; coba muat ulang halaman ini.
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            <Icon.Refresh width="16" height="16"/> Muat Ulang
          </button>
        </div>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById("app")).render(
  <SigmaErrorBoundary>
    <App/>
  </SigmaErrorBoundary>
);
