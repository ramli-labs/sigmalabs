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

  const nodes = [
    { name: "Laptop Kamu", x: 60, color: "var(--info-400)", icon: "💻" },
    { name: "Router Rumah", x: 220, color: "var(--gold-400)", icon: "📡" },
    { name: "ISP", x: 380, color: "var(--orange-400)", icon: "🏢" },
    { name: "Server YouTube", x: 540, color: "var(--ai-400)", icon: "☁️" },
  ];

  const sendPacket = async () => {
    setSending(true); setLog([]); setPacketPos(0);
    const msgs = [
      "🔵 Paket HTTP dibuat — GET /video",
      "→ Dikirim ke Router Rumah via WiFi...",
      "→ Router meneruskan ke ISP lewat kabel fiber...",
      "→ ISP route ke data center YouTube...",
      "✅ Sampai di server! Diproses...",
      "← Server kirim video kembali (balik jalur sama)",
    ];
    for (let i = 0; i < msgs.length; i++) {
      setLog(l => [...l, msgs[i]]);
      setPacketPos(i);
      await new Promise(r => setTimeout(r, 900));
    }
    setPacketPos(-1);
    setSending(false);
    window.SIGMA_AUTH?.completeLab?.("network-sim");
  };

  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 32px 60px" }}>
        <Breadcrumb trail={[{ to: "/", label: "Beranda" }, { to: "/lab", label: "Lab Maya" }, { label: "Simulasi Jaringan" }]}/>
        {(() => { const ref = sessionStorage.getItem("sigma_lab_referrer"); if (!ref?.includes("/modul/")) return null; const mod = window.CURRICULUM?.modules?.find(m => m.id === (ref.split("/modul/")[1]||"").split("?")[0]); return <button onClick={() => { sessionStorage.removeItem("sigma_lab_referrer"); navigate(ref); }} style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:12,background:"var(--gold-300)",border:"2px solid var(--ink)",fontWeight:800,fontSize:14,cursor:"pointer",marginBottom:20,color:"var(--navy-950)" }}>← Kembali ke {mod ? mod.title : "Pelajaran"}</button>; })()}
        <div style={{ marginTop: 12, marginBottom: 24 }}>
          <div className="tag tag-info" style={{ marginBottom: 10 }}>LAB MAYA • INFORMATIKA</div>
          <h1 className="display" style={{ fontSize: 44, margin: 0, color: "var(--navy-950)" }}>
            Simulasi <span style={{ color: "var(--info-500)", fontStyle: "italic" }}>Paket Jaringan</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--ink-muted)", marginTop: 10, maxWidth: 680 }}>
            Ketika kamu buka YouTube, datanya melewati banyak "pos pemeriksaan" sebelum sampai. Ini simulasinya.
          </p>
          {window.ResourceModuleLinks && <window.ResourceModuleLinks item={window.CURRICULUM.labs.find(l => l.id === "network-sim")}/>}
        </div>

        <div className="card" style={{ padding: 40, background: "white", marginBottom: 20 }}>
          <svg viewBox="0 0 620 180" style={{ width: "100%", maxWidth: 620, display: "block", margin: "0 auto" }}>
            {/* connection lines */}
            <line x1={100} y1={90} x2={220} y2={90} stroke="var(--ink)" strokeWidth="3" strokeDasharray="6,4"/>
            <line x1={260} y1={90} x2={380} y2={90} stroke="var(--ink)" strokeWidth="3" strokeDasharray="6,4"/>
            <line x1={420} y1={90} x2={540} y2={90} stroke="var(--ink)" strokeWidth="3" strokeDasharray="6,4"/>
            {/* nodes */}
            {nodes.map((n, i) => (
              <g key={i}>
                <circle cx={n.x + 40} cy={90} r={30} fill={n.color} stroke="var(--ink)" strokeWidth="3"/>
                <text x={n.x + 40} y={99} fontSize="24" textAnchor="middle">{n.icon}</text>
                <text x={n.x + 40} y={145} fontSize="12" fontWeight="700" textAnchor="middle" fill="var(--ink)">{n.name}</text>
              </g>
            ))}
            {/* moving packet */}
            {packetPos >= 0 && packetPos < 4 && (
              <g>
                <circle
                  cx={nodes[Math.min(packetPos, 3)].x + 40} cy={90} r={12}
                  fill="var(--red-500)" stroke="var(--ink)" strokeWidth="2"
                  style={{ transition: "cx 0.8s ease" }}
                />
                <text x={nodes[Math.min(packetPos, 3)].x + 40} y={95} fontSize="11" fontWeight="800" fill="white" textAnchor="middle">📦</text>
              </g>
            )}
          </svg>
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <button className="btn btn-info btn-lg" onClick={sendPacket} disabled={sending}>
              {sending ? "Mengirim..." : <><Icon.Send width="16" height="16"/> Kirim Paket</>}
            </button>
          </div>
        </div>

        {log.length > 0 && (
          <div className="card" style={{ padding: 20, background: "var(--navy-950)", color: "white", fontFamily: "var(--font-mono)", fontSize: 13 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "var(--gold-400)", textTransform: "uppercase", marginBottom: 10 }}>Log Jaringan</div>
            {log.map((l, i) => (
              <div key={i} style={{ padding: "6px 0", color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
                <span style={{ color: "var(--gold-400)" }}>[{(i * 50).toString().padStart(4, "0")}ms]</span> {l}
              </div>
            ))}
          </div>
        )}

        <div className="responsive-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 20 }}>
          <InfoBox title="Latency" desc="Waktu total perjalanan paket. Internet yang bagus < 50ms, gaming online butuh < 30ms."/>
          <InfoBox title="Packet Loss" desc="Paket kadang hilang di jalan — TCP akan otomatis kirim ulang, UDP tidak (makanya video streaming kadang nge-freeze)."/>
          <InfoBox title="Routing" desc="Tiap router pilih jalur tercepat. Kalau ada kabel putus, paket otomatis cari rute alternatif."/>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

const InfoBox = ({ title, desc }) => (
  <div className="card-soft" style={{ padding: 18, background: "white" }}>
    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "var(--info-500)", textTransform: "uppercase", marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.55 }}>{desc}</div>
  </div>
);

window.NetworkLab = NetworkLab;
