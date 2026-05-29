// ============================================
// LAB 2 — Binary Number Laboratory
// ============================================

// --- shared globals ---
const { Icon, Navbar, Footer, Link, useRoute, navigate, SectionHeader, Breadcrumb, EmptyState, ModuleCard, LabschoolLogo, BrandStrip, ControlField } = window;
const { useState, useEffect, useRef } = React;

const BinaryLab = () => {
  const [bits, setBits] = useState([0, 0, 0, 0, 1, 0, 1, 0]); // 10 decimal default

  const toggle = (i) => {
    const next = [...bits];
    next[i] = next[i] ? 0 : 1;
    setBits(next);
  };

  const decimal = bits.reduce((acc, b, i) => acc + (b ? Math.pow(2, 7 - i) : 0), 0);
  const hex = decimal.toString(16).toUpperCase().padStart(2, "0");
  const binStr = bits.join("");

  // Challenge: convert a random number
  const [targetDecimal, setTargetDecimal] = useState(42);
  const correct = decimal === targetDecimal;

  useEffect(() => {
    if (correct) window.SIGMA_AUTH?.completeLab?.("binary");
  }, [correct]);

  const newChallenge = () => {
    const n = Math.floor(Math.random() * 255) + 1;
    setTargetDecimal(n);
    setBits([0, 0, 0, 0, 0, 0, 0, 0]);
  };

  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 32px 60px" }}>
        <Breadcrumb trail={[
          { to: "/", label: "Beranda" },
          { to: "/lab", label: "Lab Maya" },
          { label: "Laboratorium Biner" },
        ]}/>
        {(() => { const ref = sessionStorage.getItem("sigma_lab_referrer"); if (!ref?.includes("/modul/")) return null; const mod = window.CURRICULUM?.modules?.find(m => m.id === (ref.split("/modul/")[1]||"").split("?")[0]); return <button onClick={() => { sessionStorage.removeItem("sigma_lab_referrer"); navigate(ref); }} style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:12,background:"var(--gold-300)",border:"2px solid var(--ink)",fontWeight:800,fontSize:14,cursor:"pointer",marginBottom:20,color:"var(--navy-950)" }}>← Kembali ke {mod ? mod.title : "Pelajaran"}</button>; })()}
        <div style={{ marginTop: 12, marginBottom: 30 }}>
          <div className="tag tag-info" style={{ marginBottom: 10 }}>LAB MAYA • INFORMATIKA</div>
          <h1 className="display" style={{ fontSize: 44, margin: 0, color: "var(--navy-950)" }}>
            Laboratorium <span style={{ color: "var(--info-500)", fontStyle: "italic" }}>Bilangan Biner</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--ink-muted)", marginTop: 10, maxWidth: 680 }}>
            Klik setiap bit untuk menyalakan (1) atau mematikan (0). Lihat hasil konversi ke desimal dan heksadesimal secara real-time.
          </p>
        </div>

        {/* Bit toggles */}
        <div className="card" style={{ padding: 36, background: "white", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "var(--ink-subtle)", textTransform: "uppercase", marginBottom: 14, textAlign: "center" }}>
            Klik bit untuk toggle
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, minmax(34px, 1fr))", gap: 10, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
            {bits.map((b, i) => (
              <div key={i}>
                <div style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--ink-subtle)", marginBottom: 4 }}>2^{7 - i}</div>
                <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--ink-muted)", marginBottom: 6 }}>{Math.pow(2, 7 - i)}</div>
                <button
                  onClick={() => toggle(i)}
                  style={{
                    width: "100%", aspectRatio: 1,
                    background: b ? "var(--gold-400)" : "var(--navy-950)",
                    color: b ? "var(--navy-950)" : "rgba(255,255,255,0.3)",
                    fontFamily: "var(--font-mono)", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800,
                    border: "3px solid var(--ink)",
                    borderRadius: 14,
                    boxShadow: b ? "var(--shadow-chunk-sm)" : "none",
                    transform: b ? "translate(-1px, -1px)" : "none",
                    transition: "all 0.15s",
                    cursor: "pointer",
                  }}>
                  {b}
                </button>
              </div>
            ))}
          </div>
          <div className="binary-result-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 24 }}>
            <ResultBox label="Biner" value={binStr} mono color="var(--navy-950)"/>
            <ResultBox label="Desimal" value={decimal} color="var(--info-500)" bigger/>
            <ResultBox label="Heksadesimal" value={`0x${hex}`} mono color="var(--ai-500)"/>
          </div>
        </div>

        {/* Challenge */}
        <div className="card" style={{ padding: 28, background: correct ? "linear-gradient(135deg, #D1FAE5, white)" : "linear-gradient(135deg, var(--gold-300), white)", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: correct ? "var(--green-500)" : "var(--orange-500)", textTransform: "uppercase", marginBottom: 6 }}>
                🎯 Tantangan
              </div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>
                Ubah <span style={{ fontFamily: "var(--font-mono)", padding: "2px 10px", background: "var(--navy-950)", color: "white", borderRadius: 6 }}>{targetDecimal}</span> menjadi biner dengan menyalakan bit di atas.
              </div>
              {correct && (
                <div style={{ marginTop: 10, padding: "8px 14px", background: "var(--green-500)", color: "white", borderRadius: "var(--r-full)", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 13 }}>
                  <Icon.Check width="16" height="16"/> BETUL! +30 XP
                </div>
              )}
            </div>
            <button className="btn btn-primary" onClick={newChallenge}>
              <Icon.Refresh width="14" height="14"/> Tantangan Baru
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="lab-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="card" style={{ padding: 22, background: "white" }}>
            <div className="display" style={{ fontSize: 22, margin: "0 0 12px" }}>Gimana cara kerjanya?</div>
            <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>
              Bilangan biner cuma pakai angka <strong>0</strong> dan <strong>1</strong>. Setiap posisi bit mewakili pangkat 2 — dari kanan: 1, 2, 4, 8, 16, 32, 64, 128. Jumlahkan pangkat 2 dari posisi bit yang bernilai 1.
            </p>
            <div style={{ marginTop: 14, padding: 14, background: "var(--bg)", borderRadius: 10, fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.7 }}>
              <div><span style={{ color: "var(--info-500)", fontWeight: 700 }}>00001010</span> = 8 + 2 = <strong>10</strong></div>
              <div><span style={{ color: "var(--info-500)", fontWeight: 700 }}>00101010</span> = 32 + 8 + 2 = <strong>42</strong></div>
              <div><span style={{ color: "var(--info-500)", fontWeight: 700 }}>11111111</span> = 128+...+1 = <strong>255</strong></div>
            </div>
          </div>
          <div className="card" style={{ padding: 22, background: "var(--navy-950)", color: "white" }}>
            <div className="display" style={{ fontSize: 22, margin: "0 0 12px", color: "var(--gold-400)" }}>Kenapa biner?</div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, margin: 0 }}>
              Komputer itu kumpulan <strong>transistor</strong> — saklar elektronik yang cuma punya 2 keadaan: ON atau OFF. Itu yang kita sebut 1 dan 0. Jutaan transistor nyala bareng = bisa menyimpan gambar, video, dan kode.
            </p>
            <div style={{ marginTop: 14, padding: 14, background: "rgba(255,255,255,0.05)", borderRadius: 10, fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.55 }}>
              <strong style={{ color: "var(--gold-400)" }}>Fun fact:</strong> Satu chip iPhone modern punya 16 miliar+ transistor — masing-masing nyala/mati miliaran kali per detik.
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

const ResultBox = ({ label, value, mono, bigger, color }) => (
  <div style={{ padding: "14px 18px", background: "var(--bg)", borderRadius: 12, border: "1.5px solid var(--line)" }}>
    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "var(--ink-subtle)", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: bigger ? 36 : 22, fontWeight: 800, color: color, fontFamily: mono ? "var(--font-mono)" : "inherit" }}>{value}</div>
  </div>
);

window.BinaryLab = BinaryLab;
