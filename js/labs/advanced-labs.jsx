// ============================================
// LAB 4 — Neural Network Playground
// ============================================

// --- shared globals ---
const { Icon, Navbar, Footer, Link, useRoute, navigate, SectionHeader, Breadcrumb, EmptyState, ModuleCard, LabschoolLogo, BrandStrip, ControlField } = window;
const { useState, useEffect, useRef } = React;

const NeuralLab = () => {
  // Very simple perceptron: classifies 2D points (AND, OR, XOR)
  const [dataset, setDataset] = useState("AND");
  const [weights, setWeights] = useState({ w1: 0.5, w2: 0.5, b: -0.7 });
  const [learningRate, setLearningRate] = useState(0.1);
  const [trainStep, setTrainStep] = useState(0);
  const [training, setTraining] = useState(false);

  const datasets = {
    AND: [{ x: 0, y: 0, label: 0 }, { x: 0, y: 1, label: 0 }, { x: 1, y: 0, label: 0 }, { x: 1, y: 1, label: 1 }],
    OR:  [{ x: 0, y: 0, label: 0 }, { x: 0, y: 1, label: 1 }, { x: 1, y: 0, label: 1 }, { x: 1, y: 1, label: 1 }],
    XOR: [{ x: 0, y: 0, label: 0 }, { x: 0, y: 1, label: 1 }, { x: 1, y: 0, label: 1 }, { x: 1, y: 1, label: 0 }],
  };
  const points = datasets[dataset];

  const predict = (x, y) => {
    const sum = weights.w1 * x + weights.w2 * y + weights.b;
    return sum >= 0 ? 1 : 0;
  };

  const accuracy = points.reduce((acc, p) => acc + (predict(p.x, p.y) === p.label ? 1 : 0), 0) / points.length;

  const train = async () => {
    setTraining(true);
    let { w1, w2, b } = weights;
    let step = 0;
    for (let epoch = 0; epoch < 50; epoch++) {
      let allCorrect = true;
      for (const p of points) {
        const pred = (w1 * p.x + w2 * p.y + b) >= 0 ? 1 : 0;
        const err = p.label - pred;
        if (err !== 0) {
          allCorrect = false;
          w1 += learningRate * err * p.x;
          w2 += learningRate * err * p.y;
          b += learningRate * err;
        }
        step++;
        setWeights({ w1, w2, b });
        setTrainStep(step);
        await new Promise(r => setTimeout(r, 80));
      }
      if (allCorrect) break;
    }
    setTraining(false);
    window.SIGMA_AUTH?.completeLab?.("neural-playground");
  };

  const reset = () => {
    setWeights({ w1: Math.random() - 0.5, w2: Math.random() - 0.5, b: Math.random() - 0.5 });
    setTrainStep(0);
  };

  // Decision boundary visualization
  const size = 300;
  const cells = 40;
  const cellSize = size / cells;
  const grid = [];
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      const x = i / (cells - 1);
      const y = 1 - j / (cells - 1);
      grid.push({ i, j, pred: predict(x, y) });
    }
  }

  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 32px 60px" }}>
        <Breadcrumb trail={[{ to: "/", label: "Beranda" }, { to: "/lab", label: "Lab Maya" }, { label: "Neural Playground" }]}/>
        {(() => { const ref = sessionStorage.getItem("sigma_lab_referrer"); if (!ref?.includes("/modul/")) return null; const mod = window.CURRICULUM?.modules?.find(m => m.id === (ref.split("/modul/")[1]||"").split("?")[0]); return <button onClick={() => { sessionStorage.removeItem("sigma_lab_referrer"); navigate(ref); }} style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:12,background:"var(--gold-300)",border:"2px solid var(--ink)",fontWeight:800,fontSize:14,cursor:"pointer",marginBottom:20,color:"var(--navy-950)" }}>← Kembali ke {mod ? mod.title : "Pelajaran"}</button>; })()}
        <div style={{ marginTop: 12, marginBottom: 24 }}>
          <div className="tag tag-ai" style={{ marginBottom: 10 }}>LAB MAYA • KKA</div>
          <h1 className="display" style={{ fontSize: 44, margin: 0, color: "var(--navy-950)" }}>
            Neural <span style={{ color: "var(--ai-500)", fontStyle: "italic" }}>Playground</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--ink-muted)", marginTop: 10, maxWidth: 680 }}>
            Perceptron (neuron tunggal) mencoba belajar pola dari 4 titik data. Perhatikan garis keputusan berubah saat neural network "belajar".
          </p>
          {window.ResourceModuleLinks && <window.ResourceModuleLinks item={window.CURRICULUM.labs.find(l => l.id === "neural-playground")}/>}
        </div>

        <div className="lab-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div className="card" style={{ padding: 24, background: "white" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "var(--ai-500)", textTransform: "uppercase", marginBottom: 10 }}>Visualisasi</div>
            <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", border: "2px solid var(--ink)", borderRadius: 12, background: "#fafbff" }}>
              {/* Decision surface */}
              {grid.map((c, i) => (
                <rect key={i} x={c.i * cellSize} y={c.j * cellSize} width={cellSize + 0.5} height={cellSize + 0.5}
                  fill={c.pred === 1 ? "rgba(168,85,247,0.2)" : "rgba(0,184,212,0.12)"}/>
              ))}
              {/* Axis labels */}
              <text x={10} y={size - 10} fontSize="11" fill="var(--ink-muted)" fontWeight="700">0</text>
              <text x={size - 16} y={size - 10} fontSize="11" fill="var(--ink-muted)" fontWeight="700">1</text>
              <text x={10} y={16} fontSize="11" fill="var(--ink-muted)" fontWeight="700">1</text>
              {/* Points */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x * (size - 40) + 20}
                    cy={(1 - p.y) * (size - 40) + 20}
                    r={16}
                    fill={p.label === 1 ? "var(--ai-500)" : "var(--info-500)"}
                    stroke="var(--ink)" strokeWidth="3"
                  />
                  <text x={p.x * (size - 40) + 20} y={(1 - p.y) * (size - 40) + 26} textAnchor="middle"
                    fontSize="14" fontWeight="800" fill="white">{p.label}</text>
                </g>
              ))}
            </svg>
            <div style={{ display: "flex", gap: 12, marginTop: 12, fontSize: 12, justifyContent: "center" }}>
              <LegendDot color="var(--info-500)" label="Kelas 0"/>
              <LegendDot color="var(--ai-500)" label="Kelas 1"/>
            </div>
          </div>

          <div>
            <div className="card" style={{ padding: 22, background: "white", marginBottom: 16 }}>
              <ControlField label="Dataset">
                <div style={{ display: "flex", gap: 6 }}>
                  {["AND", "OR", "XOR"].map(d => (
                    <button key={d} onClick={() => { setDataset(d); reset(); }} disabled={training} className="btn btn-sm"
                      style={{ flex: 1, background: d === dataset ? "var(--ai-500)" : "white", color: d === dataset ? "white" : "var(--ink)" }}>
                      {d}
                    </button>
                  ))}
                </div>
              </ControlField>
              <div style={{ marginTop: 14 }}>
                <ControlField label={`Learning rate: ${learningRate.toFixed(2)}`}>
                  <input type="range" min="0.01" max="0.5" step="0.01" value={learningRate}
                    onChange={e => setLearningRate(+e.target.value)} style={{ width: "100%" }}/>
                </ControlField>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button className="btn btn-ai" onClick={train} disabled={training} style={{ flex: 1 }}>
                  <Icon.Play width="14" height="14"/> {training ? "Training..." : "Latih Model"}
                </button>
                <button className="btn btn-sm" onClick={reset} disabled={training}>
                  <Icon.Refresh width="14" height="14"/>
                </button>
              </div>
            </div>

            <div className="card" style={{ padding: 22, background: "var(--navy-950)", color: "white" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "var(--gold-400)", textTransform: "uppercase", marginBottom: 10 }}>Parameter Neuron</div>
              <div className="responsive-stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontFamily: "var(--font-mono)", fontSize: 13 }}>
                <ParamBox label="w₁" value={weights.w1.toFixed(3)}/>
                <ParamBox label="w₂" value={weights.w2.toFixed(3)}/>
                <ParamBox label="b (bias)" value={weights.b.toFixed(3)}/>
                <ParamBox label="step" value={trainStep}/>
              </div>
              <div style={{ marginTop: 14, padding: 12, background: "rgba(255,255,255,0.05)", borderRadius: 10, fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.55 }}>
                Formula: <code style={{ color: "var(--gold-400)" }}>output = 1 jika (w₁·x + w₂·y + b) ≥ 0, else 0</code>
              </div>
              <div style={{ marginTop: 14, padding: "10px 14px", background: accuracy === 1 ? "var(--green-500)" : "rgba(255,255,255,0.05)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Akurasi</div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{(accuracy * 100).toFixed(0)}%</div>
              </div>
              {dataset === "XOR" && (
                <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(226,62,62,0.15)", border: "1px solid rgba(226,62,62,0.3)", borderRadius: 8, fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
                  ⚠️ <strong>XOR</strong> tidak bisa dipelajari perceptron tunggal! (Data-nya tidak bisa dipisahkan dengan garis lurus). Butuh hidden layer — itulah kenapa deep learning lahir.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

const LegendDot = ({ color, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <div style={{ width: 12, height: 12, borderRadius: "50%", background: color, border: "1.5px solid var(--ink)" }}/>
    <span style={{ color: "var(--ink-muted)", fontWeight: 600 }}>{label}</span>
  </div>
);

const ParamBox = ({ label, value }) => (
  <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>{value}</div>
  </div>
);

window.NeuralLab = NeuralLab;


// ============================================
// LAB 5 — Image Classifier (Draw & Guess)
// ============================================

const ImageClassifierLab = () => {
  const canvasRef = React.useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [target, setTarget] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = ["lingkaran", "persegi", "segitiga", "bintang"];

  useEffect(() => { newRound(); }, []);

  const newRound = () => {
    setTarget(categories[Math.floor(Math.random() * categories.length)]);
    setResult(null);
    clear();
  };

  const clear = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, c.width, c.height);
  };

  const getPos = (e) => {
    const c = canvasRef.current;
    const rect = c.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    return { x: x * (c.width / rect.width), y: y * (c.height / rect.height) };
  };

  const start = (e) => {
    e.preventDefault();
    setDrawing(true);
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.strokeStyle = "#0B1633"; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.lineJoin = "round";
  };
  const move = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y); ctx.stroke();
  };
  const end = () => setDrawing(false);

  // "AI" classifier: shape heuristics from pixel data
  const classify = async () => {
    setLoading(true); setResult(null);
    await new Promise(r => setTimeout(r, 800));
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    const img = ctx.getImageData(0, 0, c.width, c.height).data;

    // Find bounding box of drawn pixels (and collect their coordinates)
    const pts = [];
    let minX = c.width, minY = c.height, maxX = 0, maxY = 0, drawnPx = 0;
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4;
        if (img[i] < 200 && img[i+3] > 50) {
          drawnPx++;
          pts.push(x, y);
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
    }

    if (drawnPx < 20) {
      setResult({ label: "?", confidence: 0, reason: "Gambarnya kurang kelihatan — coba gambar yang lebih jelas!" });
      setLoading(false);
      return;
    }

    const w = maxX - minX, h = maxY - minY;
    const aspectRatio = w / h;
    const boxArea = w * h;
    const fillRatio = drawnPx / boxArea;
    const rowExtents = [];
    for (let y = minY; y <= maxY; y++) {
      let rowMin = c.width, rowMax = -1, count = 0;
      for (let x = minX; x <= maxX; x++) {
        const i = (y * c.width + x) * 4;
        if (img[i] < 200 && img[i + 3] > 50) {
          rowMin = Math.min(rowMin, x);
          rowMax = Math.max(rowMax, x);
          count++;
        }
      }
      rowExtents.push(count > 0 ? { y, width: rowMax - rowMin + 1, count } : { y, width: 0, count: 0 });
    }
    const bandAvg = (from, to) => {
      const a = Math.floor(rowExtents.length * from);
      const b = Math.max(a + 1, Math.floor(rowExtents.length * to));
      const band = rowExtents.slice(a, b).filter(r => r.count > 0);
      return band.length ? band.reduce((sum, r) => sum + r.width, 0) / band.length : 0;
    };
    const topWidth = bandAvg(0.05, 0.28);
    const midWidth = bandAvg(0.38, 0.62);
    const bottomWidth = bandAvg(0.72, 0.95);

    // Profil radius: jarak tiap piksel ke titik tengah, dikelompokkan per sudut.
    // Lingkaran = radius rata (variasi kecil); bintang = radius naik-turun tajam
    // dengan banyak "lengan"; segitiga/persegi = 3/4 puncak radius (sudut).
    let cxp = 0, cyp = 0;
    for (let k = 0; k < pts.length; k += 2) { cxp += pts[k]; cyp += pts[k + 1]; }
    cxp /= drawnPx; cyp /= drawnPx;

    const SECTORS = 60;
    const maxR = new Array(SECTORS).fill(0);
    for (let k = 0; k < pts.length; k += 2) {
      const dx = pts[k] - cxp, dy = pts[k + 1] - cyp;
      const r = Math.sqrt(dx * dx + dy * dy);
      let s = Math.floor(((Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI)) * SECTORS) % SECTORS;
      if (s < 0) s += SECTORS;
      if (r > maxR[s]) maxR[s] = r;
    }
    // Isi sektor kosong (garis terputus) dengan rata-rata tetangga terdekat
    for (let s = 0; s < SECTORS; s++) {
      if (maxR[s] > 0) continue;
      let lv = 0, rv = 0;
      for (let t = 1; t <= SECTORS; t++) { const v = maxR[(s - t + SECTORS) % SECTORS]; if (v > 0) { lv = v; break; } }
      for (let t = 1; t <= SECTORS; t++) { const v = maxR[(s + t) % SECTORS]; if (v > 0) { rv = v; break; } }
      maxR[s] = (lv + rv) / 2;
    }

    const meanR = maxR.reduce((a, b) => a + b, 0) / SECTORS || 1;
    const cv = Math.sqrt(maxR.reduce((a, b) => a + (b - meanR) * (b - meanR), 0) / SECTORS) / meanR;
    // Hitung "lengan"/sudut: puncak lokal radius yang menonjol di atas rata-rata
    let peaks = 0;
    for (let s = 0; s < SECTORS; s++) {
      const v = maxR[s];
      if (v < meanR * 1.08) continue;
      let isMax = true;
      for (let d = 1; d <= 3; d++) {
        if (maxR[(s - d + SECTORS) % SECTORS] > v || maxR[(s + d) % SECTORS] > v) { isMax = false; break; }
      }
      if (isMax) peaks++;
    }

    const scores = { lingkaran: 0, persegi: 0, segitiga: 0, bintang: 0 };
    // Lingkaran: radius sangat rata, nyaris tanpa puncak tajam
    if (cv < 0.12) scores.lingkaran += 5;
    else if (cv < 0.18) scores.lingkaran += 2;
    if (peaks <= 1 && cv < 0.16) scores.lingkaran += 2;
    // Bintang: radius naik-turun tajam (cv besar) + banyak lengan
    if (peaks >= 5 && cv > 0.22) scores.bintang += 7;
    else if (peaks >= 4 && cv > 0.20) scores.bintang += 4;
    if (cv > 0.30) scores.bintang += 2;
    // Segitiga: 3 sudut, alas lebih lebar dari puncak
    if (peaks === 3) scores.segitiga += 4;
    if (bottomWidth > topWidth * 1.4) scores.segitiga += 3;
    // Persegi: 4 sudut, lebar baris atas≈tengah≈bawah, radius cukup rata
    if (peaks === 4) scores.persegi += 4;
    if (Math.abs(topWidth - bottomWidth) < w * 0.22 && Math.abs(midWidth - bottomWidth) < w * 0.22 && cv < 0.22) scores.persegi += 3;
    // Aspek mendekati 1 — penyeimbang kecil untuk semua bentuk
    if (aspectRatio > 0.7 && aspectRatio < 1.4) { scores.lingkaran += 1; scores.persegi += 1; scores.bintang += 1; }

    // Dukungan deteksi sudut kotak: piksel di 4 pojok bounding box
    const corners = [
      { x: minX + 8, y: minY + 8 }, { x: maxX - 8, y: minY + 8 },
      { x: minX + 8, y: maxY - 8 }, { x: maxX - 8, y: maxY - 8 },
    ];
    let cornerHits = 0;
    corners.forEach(p => {
      let hit = false;
      for (let dy = -6; dy <= 6 && !hit; dy++) {
        for (let dx = -6; dx <= 6; dx++) {
          const x = p.x + dx, y = p.y + dy;
          if (x < 0 || y < 0 || x >= c.width || y >= c.height) continue;
          const i = (y * c.width + x) * 4;
          if (img[i] < 200 && img[i + 3] > 50) { hit = true; break; }
        }
      }
      if (hit) cornerHits++;
    });
    if (cornerHits >= 4 && cv < 0.22) scores.persegi += 3;
    if (cornerHits <= 1 && cv < 0.14) scores.lingkaran += 2;

    // Pick highest
    const [best] = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const conf = total ? Math.min(0.95, best[1] / total + 0.3) : 0.4;
    setResult({ label: best[0], confidence: conf });
    window.SIGMA_AUTH?.completeLab?.("image-classifier");
    setLoading(false);
  };

  const correct = result && result.label === target;

  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 32px 60px" }}>
        <Breadcrumb trail={[{ to: "/", label: "Beranda" }, { to: "/lab", label: "Lab Maya" }, { label: "AI Image Classifier" }]}/>
        {(() => { const ref = sessionStorage.getItem("sigma_lab_referrer"); if (!ref?.includes("/modul/")) return null; const mod = window.CURRICULUM?.modules?.find(m => m.id === (ref.split("/modul/")[1]||"").split("?")[0]); return <button onClick={() => { sessionStorage.removeItem("sigma_lab_referrer"); navigate(ref); }} style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:12,background:"var(--gold-300)",border:"2px solid var(--ink)",fontWeight:800,fontSize:14,cursor:"pointer",marginBottom:20,color:"var(--navy-950)" }}>← Kembali ke {mod ? mod.title : "Pelajaran"}</button>; })()}
        <div style={{ marginTop: 12, marginBottom: 24 }}>
          <div className="tag tag-ai" style={{ marginBottom: 10 }}>LAB MAYA • KKA</div>
          <h1 className="display" style={{ fontSize: 44, margin: 0, color: "var(--navy-950)" }}>
            AI Image <span style={{ color: "var(--ai-500)", fontStyle: "italic" }}>Classifier</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--ink-muted)", marginTop: 10, maxWidth: 680 }}>
            Gambar bentuk sesuai instruksi, AI coba tebak — seperti Quick Draw Google. Pakai heuristik sederhana (aspect ratio, density, corner detection).
          </p>
          {window.ResourceModuleLinks && <window.ResourceModuleLinks item={window.CURRICULUM.labs.find(l => l.id === "image-classifier")}/>}
        </div>

        <div className="lab-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
          <div className="card" style={{ padding: 24, background: "white" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-subtle)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Gambar ini:</div>
                <div className="display" style={{ fontSize: 32, color: "var(--ai-500)" }}>{target}</div>
              </div>
              <button className="btn btn-sm" onClick={clear}><Icon.Refresh width="14" height="14"/> Bersihkan</button>
            </div>
            <canvas
              ref={canvasRef}
              width={500} height={400}
              onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
              onTouchStart={start} onTouchMove={move} onTouchEnd={end}
              style={{
                width: "100%", maxWidth: 500, display: "block", margin: "0 auto",
                border: "3px solid var(--ink)", borderRadius: 14, background: "white",
                cursor: "crosshair", touchAction: "none",
              }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="btn btn-ai" onClick={classify} disabled={loading} style={{ flex: 1 }}>
                {loading ? <>Menganalisis...</> : <><Icon.Sparkles width="16" height="16"/> Tebak AI</>}
              </button>
              <button className="btn" onClick={newRound}>Target Baru</button>
            </div>
          </div>

          <div>
            <div className="card" style={{ padding: 22, background: result ? (correct ? "linear-gradient(135deg, #D1FAE5, white)" : "white") : "white", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "var(--ai-500)", textTransform: "uppercase", marginBottom: 10 }}>Prediksi AI</div>
              {result ? (
                <>
                  <div className="display" style={{ fontSize: 30, margin: "0 0 8px", color: correct ? "var(--green-500)" : "var(--navy-950)" }}>
                    {correct && "✓ "}{result.label}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>
                    Confidence: <strong>{(result.confidence * 100).toFixed(0)}%</strong>
                  </div>
                  <div style={{ marginTop: 10, height: 8, background: "var(--line)", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ width: `${result.confidence * 100}%`, height: "100%", background: correct ? "var(--green-500)" : "var(--ai-500)", transition: "width 0.5s" }}/>
                  </div>
                  {result.reason && <div style={{ marginTop: 12, fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5 }}>{result.reason}</div>}
                </>
              ) : (
                <div style={{ color: "var(--ink-subtle)", fontSize: 13 }}>Gambar dulu, lalu tekan "Tebak AI"</div>
              )}
            </div>
            <div className="card" style={{ padding: 22, background: "var(--navy-950)", color: "white" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "var(--gold-400)", textTransform: "uppercase", marginBottom: 10 }}>Cara kerja AI</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: 0 }}>
                AI di sini pakai <strong>fitur geometris sederhana</strong> — rasio lebar/tinggi, kerapatan piksel, dan deteksi sudut. AI sungguhan (seperti Quick Draw Google) pakai neural network yang dilatih dari jutaan gambar.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

window.ImageClassifierLab = ImageClassifierLab;


// ============================================
// LAB 6 — Network Packet Simulation
// ============================================

const NetworkLab = () => {
  const [sending, setSending] = useState(false);
  const [log, setLog] = useState([]);
  const [packetPos, setPacketPos] = useState(-1);
  const [caseIdx, setCaseIdx] = useState(0);
  const [diagnosis, setDiagnosis] = useState("");
  const [checked, setChecked] = useState(false);
  const [solvedCases, setSolvedCases] = useState([]);

  const nodes = [
    { id: "device", name: "Laptop", x: 60, color: "var(--info-400)", icon: "PC" },
    { id: "wifi", name: "WiFi/Router", x: 220, color: "var(--gold-400)", icon: "RT" },
    { id: "dns", name: "DNS/ISP", x: 380, color: "var(--orange-400)", icon: "DNS" },
    { id: "server", name: "Server", x: 540, color: "var(--ai-400)", icon: "SV" },
  ];
  const cases = [
    { title: "Halaman sekolah tidak terbuka, tapi WiFi tersambung.", target: "sigma.labschool.sch.id", broken: "dns", answer: "DNS/ISP", fix: "Ganti DNS, coba ulang alamat, atau cek apakah layanan DNS sedang bermasalah.", logs: ["Paket dibuat dari laptop.", "Router menerima paket.", "Permintaan alamat domain dikirim ke DNS.", "DNS tidak memberi alamat IP yang valid."] },
    { title: "Video pembelajaran berhenti-berhenti.", target: "video pembelajaran", broken: "wifi", answer: "WiFi/Router", fix: "Dekatkan perangkat ke router, kurangi perangkat aktif, atau restart router.", logs: ["Paket dibuat dari laptop.", "Sinyal WiFi lemah.", "Sebagian paket hilang sebelum sampai router.", "Server tidak menerima permintaan lengkap."] },
    { title: "Satu situs tugas tidak bisa dibuka, situs lain normal.", target: "portal tugas", broken: "server", answer: "Server", fix: "Cek pengumuman layanan, tunggu server pulih, atau laporkan ke admin.", logs: ["Paket dibuat dari laptop.", "Router meneruskan paket.", "DNS memberi alamat IP.", "Server tujuan tidak merespons."] },
  ];
  const currentCase = cases[caseIdx];
  const choices = ["Laptop", "WiFi/Router", "DNS/ISP", "Server"];

  const sendPacket = async () => {
    setSending(true);
    setLog([]);
    setPacketPos(0);
    setDiagnosis("");
    setChecked(false);
    for (let i = 0; i < currentCase.logs.length; i++) {
      setLog(l => [...l, currentCase.logs[i]]);
      setPacketPos(i);
      await new Promise(r => setTimeout(r, 900));
    }
    setPacketPos(nodes.findIndex(n => n.id === currentCase.broken));
    setSending(false);
  };

  const checkDiagnosis = () => {
    const ok = diagnosis === currentCase.answer;
    setChecked(true);
    if (ok) {
      const nextSolved = solvedCases.includes(caseIdx) ? solvedCases : [...solvedCases, caseIdx];
      setSolvedCases(nextSolved);
      if (nextSolved.length >= 2) window.SIGMA_AUTH?.completeLab?.("network-sim");
    }
  };

  const nextCase = () => {
    setCaseIdx((caseIdx + 1) % cases.length);
    setLog([]);
    setPacketPos(-1);
    setDiagnosis("");
    setChecked(false);
    setSending(false);
  };

  const isCorrect = checked && diagnosis === currentCase.answer;

  return (
    <PracticeLabShell labId="network-sim" title="Lab Troubleshooting Jaringan" tag="LAB MAYA • INFORMATIKA" accent="var(--info-500)"
      intro="Pilih kasus, kirim paket, baca log, lalu tentukan titik masalah. Fokusnya bukan hafalan nama perangkat, tapi menalar jalur data.">
      <div className="lab-main-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20 }}>
        <div>
          <div className="card" style={{ padding: 26, background: "white", marginBottom: 18 }}>
            <div className="tag tag-info" style={{ marginBottom: 10 }}>Kasus {caseIdx + 1}</div>
            <h2 className="display" style={{ fontSize: 28, margin: "0 0 8px" }}>{currentCase.title}</h2>
            <div style={{ color: "var(--ink-muted)", fontWeight: 700 }}>Tujuan paket: {currentCase.target}</div>
          </div>
          <div className="card" style={{ padding: 30, background: "white" }}>
            <svg viewBox="0 0 620 190" style={{ width: "100%", maxWidth: 620, display: "block", margin: "0 auto" }}>
              <line x1={100} y1={92} x2={220} y2={92} stroke="var(--ink)" strokeWidth="3" strokeDasharray="6,4"/>
              <line x1={260} y1={92} x2={380} y2={92} stroke="var(--ink)" strokeWidth="3" strokeDasharray="6,4"/>
              <line x1={420} y1={92} x2={540} y2={92} stroke="var(--ink)" strokeWidth="3" strokeDasharray="6,4"/>
              {nodes.map((n, i) => {
                const active = packetPos === i;
                const broken = checked && n.id === currentCase.broken;
                return (
                  <g key={n.id}>
                    <circle cx={n.x + 40} cy={92} r={32} fill={broken ? "var(--red-500)" : active ? "var(--gold-400)" : n.color} stroke="var(--ink)" strokeWidth="3"/>
                    <text x={n.x + 40} y={98} fontSize="13" fontWeight="900" textAnchor="middle" fill={broken ? "white" : "var(--navy-950)"}>{n.icon}</text>
                    <text x={n.x + 40} y={150} fontSize="12" fontWeight="800" textAnchor="middle" fill="var(--ink)">{n.name}</text>
                  </g>
                );
              })}
              {packetPos >= 0 && !checked && (
                <circle cx={nodes[Math.min(packetPos, nodes.length - 1)].x + 40} cy={92} r={10} fill="var(--red-500)" stroke="var(--ink)" strokeWidth="2"/>
              )}
            </svg>
            <div style={{ marginTop: 18, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn-info" onClick={sendPacket} disabled={sending}>{sending ? "Mengirim..." : <><Icon.Send width="16" height="16"/> Kirim Paket</>}</button>
              <button className="btn" onClick={nextCase}>Kasus Lain</button>
            </div>
          </div>
        </div>
        <div>
          <div className="card" style={{ padding: 20, background: "var(--navy-950)", color: "white", fontFamily: "var(--font-mono)", fontSize: 13, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", color: "var(--gold-400)", textTransform: "uppercase", marginBottom: 10 }}>Log Jaringan</div>
            {log.length === 0 ? <div style={{ color: "rgba(255,255,255,0.6)" }}>Kirim paket untuk melihat jejaknya.</div> : log.map((l, i) => (
              <div key={i} style={{ padding: "6px 0", color: "rgba(255,255,255,0.86)", lineHeight: 1.6 }}>
                <span style={{ color: "var(--gold-400)" }}>[{(i * 120).toString().padStart(4, "0")}ms]</span> {l}
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 22, background: "white" }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Diagnosis</div>
            <div style={{ display: "grid", gap: 8 }}>
              {choices.map(choice => (
                <button key={choice} className="btn" onClick={() => setDiagnosis(choice)} disabled={checked || log.length === 0}
                  style={{ justifyContent: "flex-start", background: diagnosis === choice ? "var(--gold-300)" : "white" }}>
                  {diagnosis === choice ? <Icon.Check width="14" height="14"/> : <Icon.Search width="14" height="14"/>} {choice}
                </button>
              ))}
            </div>
            {checked && (
              <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: isCorrect ? "#D1FAE5" : "#FEE2E2", lineHeight: 1.55 }}>
                <strong>{isCorrect ? "Diagnosis tepat." : "Belum tepat."}</strong> {currentCase.fix}
              </div>
            )}
            <button className="btn btn-primary" onClick={checkDiagnosis} disabled={!diagnosis || checked} style={{ width: "100%", marginTop: 14 }}>Periksa Diagnosis</button>
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--ink-subtle)", fontWeight: 800 }}>Kasus benar: {solvedCases.length}/3. Lab tuntas setelah minimal 2 kasus.</div>
          </div>
        </div>
      </div>
      <div className="responsive-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 20 }}>
        <InfoBox title="Latency" desc="Waktu perjalanan paket. Jika tinggi, layanan terasa lambat walau tersambung."/>
        <InfoBox title="Packet Loss" desc="Paket hilang membuat video patah-patah atau permintaan web gagal lengkap."/>
        <InfoBox title="DNS" desc="DNS menerjemahkan nama situs menjadi alamat IP. Jika gagal, situs terlihat tidak ditemukan."/>
      </div>
    </PracticeLabShell>
  );
};

const InfoBox = ({ title, desc }) => (
  <div className="card-soft" style={{ padding: 18, background: "white" }}>
    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "var(--info-500)", textTransform: "uppercase", marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.55 }}>{desc}</div>
  </div>
);

window.NetworkLab = NetworkLab;


// ============================================
// LAB 7 — SIFT / Cek Hoaks Lab
// ============================================

const SiftCheckLab = () => {
  const cases = [
    {
      claim: "Minuman dingin bisa menyebabkan semua virus langsung berkembang biak di tubuh.",
      source: "Akun anonim dengan judul sensasional.",
      sourcePick: "Artikel rumah sakit/universitas",
      contextPick: "Bandingkan dengan sumber medis dan tanggal publikasi",
      tracePick: "Cari rujukan penelitian atau dokter yang disebut",
      verdict: "Tahan dulu",
      explain: "Klaim kesehatan perlu rujukan medis. Judul sensasional tanpa penulis tidak cukup kuat.",
    },
    {
      claim: "Foto banjir besar ini terjadi di Jakarta hari ini.",
      source: "Unggahan ulang tanpa lokasi asli.",
      sourcePick: "Berita lokal/BPBD",
      contextPick: "Cek tanggal dan lokasi foto",
      tracePick: "Reverse image search",
      verdict: "Perlu konteks",
      explain: "Foto lama sering dipakai ulang. Tanggal, lokasi, dan sumber pertama harus dicek.",
    },
    {
      claim: "Aplikasi belajar gratis meminta nomor KTP siswa untuk membuka fitur kuis.",
      source: "Form tidak jelas pemiliknya.",
      sourcePick: "Situs resmi sekolah/aplikasi",
      contextPick: "Cek kebutuhan data dan kebijakan privasi",
      tracePick: "Tanya guru/orang tua sebelum mengisi",
      verdict: "Jangan isi dulu",
      explain: "Data pribadi harus dilindungi. Permintaan data harus jelas tujuan dan izinnya.",
    },
  ];
  const sourceOptions = ["Akun viral", "Artikel rumah sakit/universitas", "Berita lokal/BPBD", "Situs resmi sekolah/aplikasi"];
  const contextOptions = ["Baca komentar terbanyak", "Cek tanggal dan lokasi foto", "Bandingkan dengan sumber medis dan tanggal publikasi", "Cek kebutuhan data dan kebijakan privasi"];
  const traceOptions = ["Reverse image search", "Cari rujukan penelitian atau dokter yang disebut", "Tanya guru/orang tua sebelum mengisi", "Sebarkan agar orang lain ikut mengecek"];
  const verdictOptions = ["Aman dibagikan", "Tahan dulu", "Perlu konteks", "Jangan isi dulu"];
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({ source: "", context: "", trace: "", verdict: "" });
  const [checked, setChecked] = useState(false);
  const [solvedCases, setSolvedCases] = useState([]);
  const c = cases[idx];
  const score = ["source", "context", "trace", "verdict"].reduce((sum, key) => {
    const expected = key === "source" ? c.sourcePick : key === "context" ? c.contextPick : key === "trace" ? c.tracePick : c.verdict;
    return sum + (answers[key] === expected ? 25 : 0);
  }, 0);

  const choose = (key, value) => {
    if (checked) return;
    setAnswers(v => ({ ...v, [key]: value }));
  };
  const check = () => {
    setChecked(true);
    if (score === 100) {
      const nextSolved = solvedCases.includes(idx) ? solvedCases : [...solvedCases, idx];
      setSolvedCases(nextSolved);
      if (nextSolved.length >= 2) window.SIGMA_AUTH?.completeLab?.("sift-check");
    }
  };
  const next = () => {
    setIdx((idx + 1) % cases.length);
    setAnswers({ source: "", context: "", trace: "", verdict: "" });
    setChecked(false);
  };

  return (
    <PracticeLabShell labId="sift-check" title="Lab Investigasi SIFT" tag="LAB MAYA • KKA" accent="var(--ai-500)"
      intro="Pilih bukti paling kuat, konteks yang perlu dicek, cara menelusuri klaim, dan keputusan etis sebelum membagikan informasi.">
      <div className="lab-main-grid" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 20 }}>
        <div>
          <div className="card" style={{ padding: 24, background: "white", marginBottom: 16 }}>
            <div className="tag tag-ai" style={{ marginBottom: 12 }}>Kasus {idx + 1}</div>
            <h2 className="display" style={{ fontSize: 28, margin: 0 }}>Klaim yang perlu diinvestigasi</h2>
            <div style={{ marginTop: 16, padding: 18, background: "var(--bg-cream)", borderRadius: 14, border: "1.5px solid var(--gold-400)", fontSize: 16, lineHeight: 1.6, fontWeight: 900 }}>
              {c.claim}
            </div>
            <div style={{ marginTop: 14, fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.55 }}><strong>Sumber awal:</strong> {c.source}</div>
          </div>
          <div className="card" style={{ padding: 22, background: checked ? (score === 100 ? "#D1FAE5" : "#FEE2E2") : "var(--navy-950)", color: checked ? "var(--ink)" : "white" }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: checked ? "var(--ink-muted)" : "var(--gold-400)", marginBottom: 8 }}>Hasil Investigasi</div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{checked ? `${score}/100` : "Belum diperiksa"}</div>
            {checked && <div style={{ marginTop: 10, lineHeight: 1.55 }}>{c.explain}</div>}
            <div style={{ marginTop: 12, fontSize: 12, fontWeight: 800, opacity: 0.75 }}>Kasus kuat: {solvedCases.length}/3. Lab tuntas setelah 2 investigasi lengkap.</div>
          </div>
        </div>
        <div className="card" style={{ padding: 22, background: "white" }}>
          <InvestigationGroup title="Investigasi Sumber" options={sourceOptions} value={answers.source} answer={c.sourcePick} checked={checked} onPick={v => choose("source", v)}/>
          <InvestigationGroup title="Cari Konteks" options={contextOptions} value={answers.context} answer={c.contextPick} checked={checked} onPick={v => choose("context", v)}/>
          <InvestigationGroup title="Telusuri Klaim" options={traceOptions} value={answers.trace} answer={c.tracePick} checked={checked} onPick={v => choose("trace", v)}/>
          <InvestigationGroup title="Putusan" options={verdictOptions} value={answers.verdict} answer={c.verdict} checked={checked} onPick={v => choose("verdict", v)}/>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap", marginTop: 16 }}>
            <button className="btn" onClick={next}>{checked ? "Kasus Berikutnya" : "Ganti Kasus"}</button>
            <button className="btn btn-ai" onClick={check} disabled={checked || Object.values(answers).some(v => !v)}>Periksa Investigasi</button>
          </div>
        </div>
      </div>
    </PracticeLabShell>
  );
};

const InvestigationGroup = ({ title, options, value, answer, checked, onPick }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontWeight: 900, marginBottom: 8 }}>{title}</div>
    <div style={{ display: "grid", gap: 8 }}>
      {options.map(opt => {
        const active = value === opt;
        const right = checked && opt === answer;
        const wrong = checked && active && opt !== answer;
        return (
          <button key={opt} className="btn" onClick={() => onPick(opt)} disabled={checked}
            style={{ justifyContent: "flex-start", textAlign: "left", background: right ? "#D1FAE5" : wrong ? "#FEE2E2" : active ? "var(--ai-100)" : "white" }}>
            {active ? <Icon.Check width="14" height="14"/> : <Icon.Search width="14" height="14"/>} {opt}
          </button>
        );
      })}
    </div>
  </div>
);

window.SiftCheckLab = SiftCheckLab;


// ============================================
// LAB 8 — Dataset Labeling Lab
// ============================================

const DatasetLabelingLab = () => {
  const items = [
    { text: "Foto tugas dengan cahaya terang dan objek jelas", answer: "Mudah dikenali" },
    { text: "Foto blur, sebagian objek tertutup tangan", answer: "Sulit dikenali" },
    { text: "Contoh data hanya dari satu jenis objek", answer: "Berpotensi bias" },
    { text: "Dataset berisi contoh dari banyak kondisi", answer: "Data beragam" },
    { text: "Label gambar salah tetapi tetap dipakai melatih AI", answer: "Label keliru" },
  ];
  const choices = ["Mudah dikenali", "Sulit dikenali", "Berpotensi bias", "Data beragam", "Label keliru"];
  const [labels, setLabels] = useState({});
  const [checked, setChecked] = useState(false);
  const correct = items.filter((item, i) => labels[i] === item.answer).length;
  const complete = Object.keys(labels).length === items.length;
  const bias = items.length - correct;

  const check = () => {
    setChecked(true);
    if (correct >= 4) window.SIGMA_AUTH?.completeLab?.("dataset-labeling");
  };

  return (
    <PracticeLabShell labId="dataset-labeling" title="Dataset Labeling Lab" tag="LAB MAYA • KKA" accent="var(--ai-500)"
      intro="Latih konsep data latih: AI belajar dari contoh. Jika label keliru atau data tidak beragam, prediksi AI ikut bermasalah.">
      <div className="lab-main-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20 }}>
        <div className="card" style={{ padding: 22, background: "white" }}>
          <div style={{ fontWeight: 900, marginBottom: 12 }}>Labeli contoh data</div>
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((item, i) => (
              <div key={item.text} style={{ padding: 14, borderRadius: 14, border: "1.5px solid var(--line)", background: "var(--bg)" }}>
                <div style={{ fontWeight: 800, lineHeight: 1.45, marginBottom: 10 }}>{item.text}</div>
                <select className="input" value={labels[i] || ""} onChange={e => setLabels(v => ({ ...v, [i]: e.target.value }))} disabled={checked}>
                  <option value="">Pilih label...</option>
                  {choices.map(c => <option key={c}>{c}</option>)}
                </select>
                {checked && (
                  <div style={{ marginTop: 8, fontSize: 13, fontWeight: 800, color: labels[i] === item.answer ? "var(--green-500)" : "var(--red-500)" }}>
                    {labels[i] === item.answer ? "Tepat" : `Seharusnya: ${item.answer}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="card" style={{ padding: 24, background: checked ? (correct >= 4 ? "#D1FAE5" : "#FEE2E2") : "var(--navy-950)", color: checked ? "var(--ink)" : "white", marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: checked ? "var(--ink-muted)" : "var(--gold-400)", marginBottom: 8 }}>Kualitas Dataset</div>
            <div className="display" style={{ fontSize: 34, margin: 0 }}>{checked ? `${correct}/${items.length}` : "Siap dilatih"}</div>
            <div style={{ marginTop: 14 }}>
              <Meter label="Label tepat" value={Math.round(correct / items.length * 100)} color="var(--green-500)"/>
              <Meter label="Risiko bias/salah" value={Math.round(bias / items.length * 100)} color="var(--red-500)"/>
            </div>
          </div>
          <div className="card" style={{ padding: 22, background: "white" }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Kesimpulan KKA</div>
            <div style={{ color: "var(--ink-muted)", lineHeight: 1.6 }}>
              AI tidak otomatis pintar. Ia meniru pola dari data latih. Data yang beragam, label yang benar, dan contoh yang cukup membuat hasil AI lebih adil dan lebih bisa dipercaya.
            </div>
            <button className="btn btn-ai" onClick={check} disabled={!complete || checked} style={{ width: "100%", marginTop: 16 }}>Cek Label</button>
            {checked && <button className="btn" onClick={() => { setLabels({}); setChecked(false); }} style={{ width: "100%", marginTop: 10 }}>Ulangi</button>}
          </div>
        </div>
      </div>
    </PracticeLabShell>
  );
};

window.DatasetLabelingLab = DatasetLabelingLab;


// ============================================
// LAB 9 — Spreadsheet Mini Lab
// ============================================

const SpreadsheetMiniLab = () => {
  const baseRows = [
    { nama: "Alya", kelas: "8A", tugas: 88, kuis: 82, hadir: 96 },
    { nama: "Bima", kelas: "8A", tugas: 74, kuis: 78, hadir: 92 },
    { nama: "Citra", kelas: "8B", tugas: 91, kuis: 88, hadir: 98 },
    { nama: "Dimas", kelas: "8B", tugas: 69, kuis: 72, hadir: 86 },
    { nama: "Eka", kelas: "8A", tugas: 95, kuis: 90, hadir: 100 },
    { nama: "Fajar", kelas: "8B", tugas: 80, kuis: 84, hadir: 90 },
  ];
  const [filter, setFilter] = useState("Semua");
  const [sortKey, setSortKey] = useState("nama");
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [formulaParts, setFormulaParts] = useState([]);
  const [checked, setChecked] = useState(false);
  const [solvedChallenges, setSolvedChallenges] = useState([]);
  const rows = baseRows
    .filter(r => filter === "Semua" || r.kelas === filter)
    .sort((a, b) => typeof a[sortKey] === "string" ? a[sortKey].localeCompare(b[sortKey]) : b[sortKey] - a[sortKey]);
  const avg = key => Math.round(rows.reduce((sum, r) => sum + r[key], 0) / Math.max(rows.length, 1));
  const countIf = key => rows.filter(r => r[key] >= 85).length;
  const status = r => ((r.tugas + r.kuis) / 2 >= 85 && r.hadir >= 90 ? "Tuntas" : "Perlu latihan");
  const formulaTokens = ["=", "SUM", "AVERAGE", "IF", "AND", "COUNTIF", "(", ")", "C2:D2", "D2:D7", "E2>=90", '">=85"', '>=85', '"Tuntas"', '"Perlu latihan"', ","];
  const challenges = [
    { title: "Rata-rata kuis", ask: "Susun formula untuk menghitung rata-rata nilai kuis pada baris yang tampil.", answer: ["=", "AVERAGE", "(", "D2:D7", ")"], result: `${avg("kuis")}` },
    { title: "Total tugas + kuis", ask: "Susun formula untuk menjumlahkan tugas dan kuis Alya di baris pertama.", answer: ["=", "SUM", "(", "C2:D2", ")"], result: `${rows[0]?.tugas + rows[0]?.kuis || 0}` },
    { title: "Status belajar", ask: "Susun formula status tuntas jika rata-rata tugas-kuis minimal 85 dan hadir minimal 90%.", answer: ["=", "IF", "(", "AND", "(", "AVERAGE", "(", "C2:D2", ")", ">=85", ",", "E2>=90", ")", ",", '"Tuntas"', ",", '"Perlu latihan"', ")"], result: rows[0] ? status(rows[0]) : "-" },
    { title: "Jumlah nilai kuat", ask: "Susun formula untuk menghitung berapa siswa dengan kuis minimal 85.", answer: ["=", "COUNTIF", "(", "D2:D7", ",", '">=85"', ")"], result: `${countIf("kuis")}` },
  ];
  const current = challenges[challengeIdx];
  const formula = formulaParts.join("");
  const isCorrect = checked && formula === current.answer.join("");
  const check = () => {
    setChecked(true);
    if (formula === current.answer.join("")) {
      const nextSolved = solvedChallenges.includes(challengeIdx) ? solvedChallenges : [...solvedChallenges, challengeIdx];
      setSolvedChallenges(nextSolved);
      if (nextSolved.length >= 3) window.SIGMA_AUTH?.completeLab?.("spreadsheet-mini");
    }
  };
  const next = () => {
    setChallengeIdx((challengeIdx + 1) % challenges.length);
    setFormulaParts([]);
    setChecked(false);
  };

  return (
    <PracticeLabShell labId="spreadsheet-mini" title="Spreadsheet Formula Lab" tag="LAB MAYA • KKA" accent="var(--ai-500)"
      intro="Gunakan formula SUM, AVERAGE, IF, AND, dan COUNTIF untuk menjawab pertanyaan dari data kelas.">
      <div className="card" style={{ padding: 22, background: "white", marginBottom: 18 }}>
        <div className="responsive-tool-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          <ControlField label="Filter kelas">
            <select className="input" value={filter} onChange={e => { setFilter(e.target.value); setChecked(false); }}>
              {["Semua", "8A", "8B"].map(v => <option key={v}>{v}</option>)}
            </select>
          </ControlField>
          <ControlField label="Urutkan berdasarkan">
            <select className="input" value={sortKey} onChange={e => { setSortKey(e.target.value); setChecked(false); }}>
              <option value="nama">Nama A-Z</option>
              <option value="tugas">Tugas tertinggi</option>
              <option value="kuis">Kuis tertinggi</option>
              <option value="hadir">Kehadiran tertinggi</option>
            </select>
          </ControlField>
        </div>
      </div>
      <div className="lab-main-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
        <div className="card" style={{ padding: 22, background: "white", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
            <thead><tr>{["Nama", "Kelas", "Tugas", "Kuis", "Hadir"].map(h => <th key={h} style={sheetTh}>{h}</th>)}</tr></thead>
            <tbody>{rows.map(r => (
              <tr key={r.nama}>
                <td style={sheetTd}>{r.nama}</td><td style={sheetTd}>{r.kelas}</td><td style={sheetTd}>{r.tugas}</td><td style={sheetTd}>{r.kuis}</td><td style={sheetTd}>{r.hadir}%</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div>
          <div className="card" style={{ padding: 22, background: checked ? (isCorrect ? "#D1FAE5" : "#FEE2E2") : "var(--navy-950)", color: checked ? "var(--ink)" : "white", marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: checked ? "var(--ink-muted)" : "var(--gold-400)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Latihan Formula {challengeIdx + 1}</div>
            <div style={{ fontSize: 21, fontWeight: 900, lineHeight: 1.25 }}>{current.title}</div>
            <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.55, color: checked ? "var(--ink-muted)" : "rgba(255,255,255,0.72)" }}>{current.ask}</div>
            <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: checked ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.18)", fontFamily: "var(--font-mono)", minHeight: 48, overflowX: "auto" }}>
              {formulaParts.length ? formula : <span style={{ opacity: 0.65 }}>Klik potongan formula di bawah...</span>}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
              {formulaTokens.map((token, i) => (
                <button key={`${token}-${i}`} className="btn btn-sm" onClick={() => setFormulaParts(v => [...v, token])} disabled={checked}
                  style={{ fontFamily: "var(--font-mono)", background: "white", color: "var(--ink)" }}>
                  {token}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <button className="btn btn-sm" onClick={() => setFormulaParts(v => v.slice(0, -1))} disabled={checked || !formulaParts.length}>Hapus 1</button>
              <button className="btn btn-sm" onClick={() => setFormulaParts([])} disabled={checked || !formulaParts.length}>Kosongkan</button>
            </div>
            {checked && (
              <div style={{ marginTop: 14, lineHeight: 1.55 }}>
                <strong>{isCorrect ? "Formula tepat." : "Formula belum tepat."}</strong> Hasil pada data tampil: <strong>{current.result}</strong>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button className="btn btn-ai" onClick={check} disabled={!formulaParts.length || checked}>Periksa Formula</button>
              <button className="btn" onClick={next}>{checked ? "Latihan Berikutnya" : "Ganti Latihan"}</button>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, fontWeight: 800, opacity: 0.72 }}>Formula benar: {solvedChallenges.length}/4. Lab tuntas setelah 3 formula berbeda.</div>
          </div>
          <div className="card" style={{ padding: 18, background: "white" }}>
            <div style={{ fontWeight: 900, marginBottom: 12 }}>Grafik kuis</div>
            {rows.map(r => (
              <div key={r.nama} style={{ display: "grid", gridTemplateColumns: "58px 1fr 34px", gap: 8, alignItems: "center", marginBottom: 9 }}>
                <div style={{ fontSize: 12, fontWeight: 800 }}>{r.nama}</div>
                <div style={{ height: 12, background: "var(--line)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: `${r.kuis}%`, height: "100%", background: "var(--info-500)" }}/>
                </div>
                <div style={{ fontSize: 12, fontWeight: 900 }}>{r.kuis}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PracticeLabShell>
  );
};

const sheetTh = { padding: "10px 12px", textAlign: "left", borderBottom: "2px solid var(--line-strong)", fontSize: 12, color: "var(--ink-muted)", textTransform: "uppercase" };
const sheetTd = { padding: "11px 12px", borderBottom: "1px solid var(--line)", fontWeight: 700, fontSize: 14 };

window.SpreadsheetMiniLab = SpreadsheetMiniLab;


// ============================================
// LAB 10 — AI Bias Audit Lab
// ============================================

const AIBiasAuditLab = () => {
  const cases = [
    { system: "AI memilih kandidat ketua OSIS dari data aktivitas organisasi.", risk: "Data hanya berisi siswa yang sering tampil di panggung.", answer: "Bias data", fix: "Tambah data kontribusi di balik layar, kehadiran rapat, dan rekomendasi teman/guru.", scores: { bias: 88, privacy: 45, transparency: 62 } },
    { system: "Aplikasi kebugaran kelas membaca lokasi dan jam tidur siswa.", risk: "Data pribadi dikumpulkan tanpa penjelasan kebutuhan.", answer: "Privasi", fix: "Batasi data yang dikumpulkan, minta izin jelas, dan sediakan pilihan tidak ikut.", scores: { bias: 38, privacy: 92, transparency: 60 } },
    { system: "AI memberi nilai kreativitas poster tanpa menunjukkan alasan.", risk: "Siswa tidak tahu kenapa nilainya rendah atau tinggi.", answer: "Transparansi", fix: "Tampilkan rubrik penilaian, contoh hasil, dan ruang banding manusia.", scores: { bias: 55, privacy: 32, transparency: 90 } },
  ];
  const choices = ["Bias data", "Privasi", "Transparansi"];
  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState("");
  const [checked, setChecked] = useState(false);
  const [solvedCases, setSolvedCases] = useState([]);
  const c = cases[idx];
  const ok = checked && choice === c.answer;

  const check = () => {
    setChecked(true);
    if (choice === c.answer) {
      const nextSolved = solvedCases.includes(idx) ? solvedCases : [...solvedCases, idx];
      setSolvedCases(nextSolved);
      if (nextSolved.length >= 2) window.SIGMA_AUTH?.completeLab?.("ai-bias-audit");
    }
  };
  const next = () => {
    setIdx((idx + 1) % cases.length);
    setChoice("");
    setChecked(false);
  };

  return (
    <PracticeLabShell labId="ai-bias-audit" title="AI Bias Audit Lab" tag="LAB MAYA • KKA" accent="var(--ai-500)"
      intro="Audit sistem AI sederhana: identifikasi apakah masalah utamanya bias data, privasi, atau transparansi, lalu lihat mitigasinya.">
      <div className="lab-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card" style={{ padding: 24, background: "white" }}>
          <div className="tag tag-ai" style={{ marginBottom: 12 }}>Kasus Audit {idx + 1}</div>
          <h2 className="display" style={{ fontSize: 28, margin: "0 0 12px" }}>{c.system}</h2>
          <div style={{ padding: 16, background: "var(--bg-cream)", borderRadius: 14, border: "1.5px solid var(--gold-400)", fontWeight: 800, lineHeight: 1.55 }}>{c.risk}</div>
          <div style={{ marginTop: 18, display: "grid", gap: 9 }}>
            {choices.map(x => (
              <button key={x} className="btn" onClick={() => setChoice(x)} disabled={checked}
                style={{ justifyContent: "flex-start", background: choice === x ? "var(--ai-100)" : "white" }}>
                {choice === x ? <Icon.Check width="14" height="14"/> : <Icon.Search width="14" height="14"/>} {x}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <button className="btn btn-ai" onClick={check} disabled={!choice || checked}>Periksa Audit</button>
            <button className="btn" onClick={next}>{checked ? "Kasus Berikutnya" : "Ganti Kasus"}</button>
          </div>
        </div>
        <div>
          <div className="card" style={{ padding: 24, background: checked ? (ok ? "#D1FAE5" : "#FEE2E2") : "var(--navy-950)", color: checked ? "var(--ink)" : "white", marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: checked ? "var(--ink-muted)" : "var(--gold-400)", marginBottom: 8 }}>Hasil Audit</div>
            <div className="display" style={{ fontSize: 30, margin: 0 }}>{checked ? (ok ? "Tepat" : "Tinjau Lagi") : "Belum dipilih"}</div>
            {checked && <div style={{ marginTop: 12, lineHeight: 1.55 }}><strong>Mitigasi:</strong> {c.fix}</div>}
            <div style={{ marginTop: 12, fontSize: 12, fontWeight: 800, opacity: 0.72 }}>Audit benar: {solvedCases.length}/3. Lab tuntas setelah 2 kasus.</div>
          </div>
          <div className="card" style={{ padding: 22, background: "white" }}>
            <div style={{ fontWeight: 900, marginBottom: 12 }}>Peta risiko</div>
            <Meter label="Bias data" value={c.scores.bias} color="var(--red-500)"/>
            <Meter label="Privasi" value={c.scores.privacy} color="var(--orange-500)"/>
            <Meter label="Transparansi" value={c.scores.transparency} color="var(--ai-500)"/>
          </div>
        </div>
      </div>
    </PracticeLabShell>
  );
};

window.AIBiasAuditLab = AIBiasAuditLab;


// ============================================
// LAB 11 — Digital Footprint Simulator
// ============================================

const DigitalFootprintLab = () => {
  const cases = [
    { incident: "Foto kartu pelajar terunggah di grup umum.", answer: "Hapus dan laporkan", explain: "Data identitas perlu segera ditarik, minta admin menghapus salinan, dan laporkan ke guru/orang tua.", reach: 92, risk: 90 },
    { incident: "Komentar marahmu sudah di-screenshot teman.", answer: "Minta maaf dan klarifikasi", explain: "Jejak digital tidak selalu hilang. Respons terbaik adalah memperbaiki dampak, bukan menyalahkan penyebar.", reach: 70, risk: 72 },
    { incident: "Akun meminta OTP untuk klaim hadiah sekolah.", answer: "Jangan beri OTP", explain: "OTP adalah kunci akun. Jangan dibagikan, cek kanal resmi, dan amankan akun.", reach: 50, risk: 95 },
    { incident: "Konten lama yang memalukan muncul lagi saat seleksi panitia.", answer: "Audit dan batasi akses", explain: "Kelola reputasi digital: cek unggahan lama, batasi audiens, dan siapkan penjelasan jujur bila perlu.", reach: 78, risk: 66 },
  ];
  const choices = ["Abaikan saja", "Hapus dan laporkan", "Minta maaf dan klarifikasi", "Jangan beri OTP", "Audit dan batasi akses"];
  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState("");
  const [checked, setChecked] = useState(false);
  const [solvedCases, setSolvedCases] = useState([]);
  const selected = cases[idx];
  const safe = selected.risk < 40;
  const ok = checked && choice === selected.answer;
  const check = () => {
    setChecked(true);
    if (choice === selected.answer) {
      const nextSolved = solvedCases.includes(idx) ? solvedCases : [...solvedCases, idx];
      setSolvedCases(nextSolved);
      if (nextSolved.length >= 2) window.SIGMA_AUTH?.completeLab?.("digital-footprint");
    }
  };
  const next = () => {
    setIdx((idx + 1) % cases.length);
    setChoice("");
    setChecked(false);
  };

  return (
    <PracticeLabShell labId="digital-footprint" title="Lab Respons Jejak Digital" tag="LAB MAYA • INFORMATIKA" accent="var(--gold-500)"
      intro="Analisis insiden digital, pilih respons, lalu lihat dampaknya terhadap reputasi, privasi, dan pemulihan.">
      <div className="lab-main-grid" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 20 }}>
        <div className="card" style={{ padding: 22, background: "white" }}>
          <div className="tag tag-info" style={{ marginBottom: 12 }}>Insiden {idx + 1}</div>
          <h2 className="display" style={{ fontSize: 28, margin: "0 0 14px" }}>{selected.incident}</h2>
          <div style={{ fontWeight: 900, marginBottom: 12 }}>Pilih respons</div>
          <div style={{ display: "grid", gap: 10 }}>
            {choices.map(c => (
              <button key={c} onClick={() => setChoice(c)} disabled={checked} style={{
                padding: 14, borderRadius: 12, textAlign: "left",
                border: `2px solid ${choice === c ? "var(--gold-500)" : "var(--line-strong)"}`,
                background: checked && c === selected.answer ? "#D1FAE5" : checked && choice === c ? "#FEE2E2" : choice === c ? "var(--bg-cream)" : "white",
                fontWeight: 800,
              }}>{c}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <button className="btn btn-primary" onClick={check} disabled={!choice || checked}>Periksa Respons</button>
            <button className="btn" onClick={next}>{checked ? "Insiden Berikutnya" : "Ganti Insiden"}</button>
          </div>
        </div>
        <div>
          <div className="card" style={{ padding: 24, background: checked ? (ok ? "#D1FAE5" : "#FEE2E2") : safe ? "linear-gradient(135deg,#D1FAE5,white)" : "linear-gradient(135deg,#FEE2E2,white)", marginBottom: 16 }}>
            <div className="display" style={{ fontSize: 28, margin: 0 }}>{checked ? (ok ? "Respons tepat" : "Respons perlu ditinjau") : safe ? "Risiko terkendali" : "Risiko tinggi"}</div>
            <div style={{ marginTop: 16 }}>
              <Meter label="Jangkauan jejak" value={selected.reach} color="var(--info-500)"/>
              <Meter label="Risiko privasi/reputasi" value={selected.risk} color={safe ? "var(--green-500)" : "var(--red-500)"}/>
            </div>
          </div>
          <div className="card" style={{ padding: 22, background: "white" }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "var(--ink-subtle)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Langkah pemulihan</div>
            <div style={{ fontSize: 15, color: "var(--ink)", lineHeight: 1.6, fontWeight: 700 }}>{checked ? selected.explain : "Pilih dan periksa respons untuk melihat langkah pemulihan yang paling tepat."}</div>
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--ink-subtle)", fontWeight: 800 }}>Respons benar: {solvedCases.length}/4. Lab tuntas setelah 2 insiden.</div>
          </div>
        </div>
      </div>
    </PracticeLabShell>
  );
};

const Meter = ({ label, value, color }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 900, marginBottom: 6 }}><span>{label}</span><span>{value}%</span></div>
    <div style={{ height: 12, background: "rgba(11,22,51,0.12)", borderRadius: 999, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color }}/>
    </div>
  </div>
);

window.DigitalFootprintLab = DigitalFootprintLab;


// ============================================
// LAB 12 — Python Trace Lab
// ============================================

const PythonTraceLab = () => {
  const tasks = [
    { title: "Fungsi dan return", code: "def skor(a, b):\n    return (a + b) / 2\n\nhasil = skor(80, 90)", question: "Nilai variabel hasil adalah...", options: ["85", "170", "80", "90"], answer: "85", explain: "Fungsi mengembalikan rata-rata dari 80 dan 90." },
    { title: "Dictionary", code: "profil = {'nama': 'Alya', 'kelas': '9A'}\nprofil['kelas'] = '9B'\nprint(profil['kelas'])", question: "Output program adalah...", options: ["9A", "9B", "kelas", "Alya"], answer: "9B", explain: "Nilai key kelas diperbarui dari 9A menjadi 9B." },
    { title: "Binary search", code: "data = [3, 8, 12, 20, 31]\ntarget = 20\n# cek tengah: 12, lalu kanan: 20", question: "Berapa kali pengecekan sampai target ditemukan?", options: ["1", "2", "3", "5"], answer: "2", explain: "Binary search mengecek 12 dulu, lalu 20 pada bagian kanan." },
  ];
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState("");
  const [checked, setChecked] = useState(false);
  const [solvedCases, setSolvedCases] = useState([]);
  const t = tasks[idx];
  const ok = checked && picked === t.answer;
  const check = () => {
    setChecked(true);
    if (picked === t.answer) {
      const nextSolved = solvedCases.includes(idx) ? solvedCases : [...solvedCases, idx];
      setSolvedCases(nextSolved);
      if (nextSolved.length >= 2) window.SIGMA_AUTH?.completeLab?.("python-trace");
    }
  };
  const next = () => {
    setIdx((idx + 1) % tasks.length);
    setPicked("");
    setChecked(false);
  };

  return (
    <PracticeLabShell labId="python-trace" title="Python Trace Lab" tag="LAB MAYA • INFORMATIKA" accent="var(--info-500)"
      intro="Baca kode pelan-pelan, trace nilai variabel, lalu prediksi output atau jumlah langkah algoritma.">
      <div className="lab-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card" style={{ padding: 22, background: "var(--navy-950)", color: "white" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "var(--gold-400)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{t.title}</div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)", fontSize: 14, lineHeight: 1.7 }}>{t.code}</pre>
        </div>
        <div className="card" style={{ padding: 22, background: "white" }}>
          <h2 className="display" style={{ fontSize: 28, margin: "0 0 14px" }}>{t.question}</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {t.options.map(opt => (
              <button key={opt} className="btn" onClick={() => setPicked(opt)} disabled={checked}
                style={{ justifyContent: "flex-start", background: checked && opt === t.answer ? "#D1FAE5" : checked && picked === opt ? "#FEE2E2" : picked === opt ? "var(--bg-cream)" : "white" }}>
                {picked === opt ? <Icon.Check width="14" height="14"/> : <Icon.Search width="14" height="14"/>} {opt}
              </button>
            ))}
          </div>
          {checked && <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: ok ? "#D1FAE5" : "#FEE2E2", lineHeight: 1.55 }}><strong>{ok ? "Trace tepat." : "Trace belum tepat."}</strong> {t.explain}</div>}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <button className="btn btn-info" onClick={check} disabled={!picked || checked}>Periksa Trace</button>
            <button className="btn" onClick={next}>{checked ? "Trace Berikutnya" : "Ganti Kode"}</button>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--ink-subtle)", fontWeight: 800 }}>Trace benar: {solvedCases.length}/3. Lab tuntas setelah 2 trace.</div>
        </div>
      </div>
    </PracticeLabShell>
  );
};

window.PythonTraceLab = PythonTraceLab;

// ============================================
// LAB 13 — Search Quality Lab
// ============================================

const SearchQualityLab = () => {
  const tasks = [
    {
      need: "Cari informasi apakah sekolah libur karena cuaca ekstrem.",
      query: "pengumuman resmi sekolah libur cuaca ekstrem Labschool",
      source: "Kanal resmi sekolah / dinas terkait",
      reason: "Informasi jadwal sekolah harus dicek ke kanal resmi, bukan unggahan ulang.",
    },
    {
      need: "Cari penjelasan sederhana tentang DNS untuk tugas Informatika.",
      query: "DNS penjelasan sederhana untuk siswa SMP site:edu OR site:ac.id",
      source: "Artikel edukasi dengan penulis/sumber jelas",
      reason: "Materi teknis lebih kuat jika sumbernya edukatif dan bisa dibandingkan.",
    },
    {
      need: "Cek klaim video viral yang katanya terjadi hari ini.",
      query: "kata kunci peristiwa tanggal lokasi sumber resmi",
      source: "Berita tepercaya dan pencarian gambar/video balik",
      reason: "Konten viral perlu tanggal, lokasi, dan sumber pertama sebelum dipercaya.",
    },
  ];
  const queryOptions = [
    "viral banget hari ini",
    "pengumuman resmi sekolah libur cuaca ekstrem Labschool",
    "DNS penjelasan sederhana untuk siswa SMP site:edu OR site:ac.id",
    "kata kunci peristiwa tanggal lokasi sumber resmi",
  ];
  const sourceOptions = [
    "Komentar paling ramai",
    "Kanal resmi sekolah / dinas terkait",
    "Artikel edukasi dengan penulis/sumber jelas",
    "Berita tepercaya dan pencarian gambar/video balik",
  ];
  const [idx, setIdx] = useState(0);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("");
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState([]);
  const t = tasks[idx];
  const score = (query === t.query ? 50 : 0) + (source === t.source ? 50 : 0);
  const ok = checked && score === 100;

  const check = () => {
    setChecked(true);
    if (score === 100) {
      const next = solved.includes(idx) ? solved : [...solved, idx];
      setSolved(next);
      if (next.length >= 2) window.SIGMA_AUTH?.completeLab?.("search-quality");
    }
  };
  const next = () => {
    setIdx((idx + 1) % tasks.length);
    setQuery("");
    setSource("");
    setChecked(false);
  };

  return (
    <PracticeLabShell labId="search-quality" title="Search Quality Lab" tag="LAB MAYA • INFORMATIKA" accent="var(--info-500)"
      intro="Latih strategi mencari informasi: pilih kata kunci yang spesifik, sumber yang tepat, lalu jelaskan kenapa hasilnya layak dipercaya.">
      <div className="lab-main-grid" style={{ display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: 20 }}>
        <div className="card" style={{ padding: 24, background: "white" }}>
          <div className="tag tag-info" style={{ marginBottom: 12 }}>Kasus Pencarian {idx + 1}</div>
          <h2 className="display" style={{ fontSize: 28, margin: "0 0 14px" }}>{t.need}</h2>
          <div style={{ padding: 16, background: "var(--bg-cream)", borderRadius: 14, border: "1.5px solid var(--gold-400)", lineHeight: 1.55, fontWeight: 800 }}>
            Tugasmu: jangan pilih kata kunci terlalu umum. Pilih query dan jenis sumber yang paling bisa dipertanggungjawabkan.
          </div>
        </div>
        <div className="card" style={{ padding: 22, background: "white" }}>
          <SearchChoiceGroup title="Strategi kata kunci" options={queryOptions} value={query} answer={t.query} checked={checked} onPick={setQuery}/>
          <SearchChoiceGroup title="Sumber pembanding" options={sourceOptions} value={source} answer={t.source} checked={checked} onPick={setSource}/>
          {checked && (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: ok ? "#D1FAE5" : "#FEE2E2", lineHeight: 1.55 }}>
              <strong>{ok ? "Strategi kuat." : "Strategi belum kuat."}</strong> {t.reason}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <button className="btn btn-info" onClick={check} disabled={!query || !source || checked}>Periksa Strategi</button>
            <button className="btn" onClick={next}>{checked ? "Kasus Berikutnya" : "Ganti Kasus"}</button>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--ink-subtle)", fontWeight: 800 }}>Strategi kuat: {solved.length}/3. Lab tuntas setelah 2 kasus.</div>
        </div>
      </div>
    </PracticeLabShell>
  );
};

const SearchChoiceGroup = ({ title, options, value, answer, checked, onPick }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontWeight: 900, marginBottom: 8 }}>{title}</div>
    <div style={{ display: "grid", gap: 8 }}>
      {options.map(opt => {
        const active = value === opt;
        const right = checked && opt === answer;
        const wrong = checked && active && opt !== answer;
        return (
          <button key={opt} className="btn" disabled={checked} onClick={() => onPick(opt)}
            style={{ justifyContent: "flex-start", textAlign: "left", whiteSpace: "normal", background: right ? "#D1FAE5" : wrong ? "#FEE2E2" : active ? "var(--info-100)" : "white" }}>
            {active ? <Icon.Check width="14" height="14"/> : <Icon.Search width="14" height="14"/>} {opt}
          </button>
        );
      })}
    </div>
  </div>
);

window.SearchQualityLab = SearchQualityLab;

// ============================================
// LAB 14 — Instruction Studio Lab
// ============================================

const InstructionStudioLab = () => {
  const cases = [
    {
      goal: "Robot kelas mengambil buku jika tersedia, lalu mencatat peminjam.",
      answer: ["Mulai", "Cari buku", "Cek tersedia?", "Jika ya: catat peminjam", "Jika tidak: pilih buku lain", "Selesai"],
      distractors: ["Warnai sampul", "Hitung jumlah meja"],
      explain: "Instruksi baik punya tujuan, percabangan, dan langkah akhir yang jelas.",
    },
    {
      goal: "Scratch menampilkan pesan jika skor minimal 80.",
      answer: ["Mulai", "Input skor", "Cek skor >= 80?", "Jika ya: tampilkan 'Tuntas'", "Jika tidak: tampilkan 'Latihan lagi'", "Selesai"],
      distractors: ["Ubah ukuran panggung", "Acak semua blok"],
      explain: "Percabangan if/else harus punya kondisi dan dua kemungkinan keluaran.",
    },
    {
      goal: "Program mencari nama pada daftar presensi yang belum terurut.",
      answer: ["Mulai", "Ambil nama target", "Cek nama satu per satu", "Nama ditemukan?", "Tampilkan hasil", "Selesai"],
      distractors: ["Gunakan binary search dulu", "Hapus daftar"],
      explain: "Untuk daftar belum terurut, pencarian satu per satu lebih aman daripada binary search.",
    },
  ];
  const [idx, setIdx] = useState(0);
  const [bank, setBank] = useState([]);
  const [answer, setAnswer] = useState([]);
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState([]);
  const c = cases[idx];

  useEffect(() => {
    const pool = [...c.answer, ...c.distractors].sort(() => Math.random() - 0.5);
    setBank(pool);
    setAnswer([]);
    setChecked(false);
  }, [idx]);

  const add = step => {
    if (checked) return;
    setBank(bank.filter(x => x !== step));
    setAnswer([...answer, step]);
  };
  const undo = step => {
    if (checked) return;
    setAnswer(answer.filter(x => x !== step));
    setBank([...bank, step]);
  };
  const correct = answer.length === c.answer.length && answer.every((x, i) => x === c.answer[i]);
  const check = () => {
    setChecked(true);
    if (correct) {
      const next = solved.includes(idx) ? solved : [...solved, idx];
      setSolved(next);
      if (next.length >= 2) window.SIGMA_AUTH?.completeLab?.("instruction-studio");
    }
  };
  const next = () => setIdx((idx + 1) % cases.length);

  return (
    <PracticeLabShell labId="instruction-studio" title="Instruction Studio Lab" tag="LAB MAYA • KKA" accent="var(--ai-500)"
      intro="Susun instruksi yang runtut, pilih blok yang relevan, dan hindari langkah yang tidak membantu tujuan program.">
      <div className="card" style={{ padding: 24, background: "white", marginBottom: 18 }}>
        <div className="tag tag-ai" style={{ marginBottom: 12 }}>Skenario Instruksi {idx + 1}</div>
        <h2 className="display" style={{ fontSize: 28, margin: 0 }}>{c.goal}</h2>
      </div>
      <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card" style={{ padding: 20, background: "white" }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Bank blok</div>
          <div style={{ display: "grid", gap: 8 }}>
            {bank.map(step => <button key={step} className="btn" onClick={() => add(step)} style={{ justifyContent: "flex-start", textAlign: "left" }}>{step}</button>)}
            {!bank.length && <div style={{ padding: 14, color: "var(--ink-subtle)", border: "1.5px dashed var(--line-strong)", borderRadius: 12 }}>Semua blok sudah dipakai.</div>}
          </div>
        </div>
        <div className="card" style={{ padding: 20, background: "var(--bg-cream)" }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Urutan instruksi</div>
          <div style={{ display: "grid", gap: 8 }}>
            {answer.map((step, i) => (
              <button key={step} className="btn" onClick={() => undo(step)}
                style={{ justifyContent: "flex-start", textAlign: "left", background: checked ? (c.answer[i] === step ? "#D1FAE5" : "#FEE2E2") : "white" }}>
                <span style={{ fontWeight: 900 }}>{i + 1}.</span> {step}
              </button>
            ))}
            {!answer.length && <div style={{ padding: 14, color: "var(--ink-subtle)", border: "1.5px dashed var(--line-strong)", borderRadius: 12 }}>Pilih blok dari kiri.</div>}
          </div>
        </div>
      </div>
      {checked && <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: correct ? "#D1FAE5" : "#FEE2E2", lineHeight: 1.55 }}><strong>{correct ? "Instruksi runtut." : "Instruksi belum runtut."}</strong> {c.explain}</div>}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap", marginTop: 16 }}>
        {!checked ? <button className="btn btn-ai" onClick={check} disabled={!answer.length}>Periksa Instruksi</button> : <button className="btn btn-primary" onClick={next}>Skenario Berikutnya</button>}
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: "var(--ink-subtle)", fontWeight: 800 }}>Instruksi tuntas: {solved.length}/3. Lab tuntas setelah 2 skenario.</div>
    </PracticeLabShell>
  );
};

window.InstructionStudioLab = InstructionStudioLab;

const PracticeLabShell = ({ labId, title, tag, accent, intro, children }) => {
  const lab = window.CURRICULUM.labs.find(l => l.id === labId);
  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 32px 60px" }}>
        <Breadcrumb trail={[{ to: "/", label: "Beranda" }, { to: "/lab", label: "Lab Maya" }, { label: title }]}/>
        <div style={{ marginTop: 12, marginBottom: 24 }}>
          <div className="tag" style={{ marginBottom: 10, background: "white", color: accent, border: "1.5px solid var(--line)" }}>{tag}</div>
          <h1 className="display" style={{ fontSize: 44, margin: 0, color: "var(--navy-950)" }}>{title}</h1>
          <p style={{ fontSize: 15, color: "var(--ink-muted)", marginTop: 10, maxWidth: 720, lineHeight: 1.55 }}>{intro}</p>
          {window.ResourceModuleLinks && <window.ResourceModuleLinks item={lab}/>}
        </div>
        {children}
      </div>
      <Footer/>
    </div>
  );
};
