// ============================================
// LAB 3 — Logic Gates Simulator
// ============================================

// --- shared globals ---
const { Icon, Navbar, Footer, Link, useRoute, navigate, SectionHeader, Breadcrumb, EmptyState, ModuleCard, LabschoolLogo, BrandStrip, ControlField } = window;
const { useState, useEffect, useRef } = React;

const LogicGatesLab = () => {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  const [selectedGate, setSelectedGate] = useState("AND");
  const markExplored = () => window.SIGMA_AUTH?.completeLab?.("logic-gates");

  const gates = {
    AND: { fn: (a, b) => a && b, desc: "Output 1 jika A DAN B dua-duanya 1. Kalau salah satu 0, output 0." },
    OR: { fn: (a, b) => a || b, desc: "Output 1 jika A ATAU B salah satu 1. Cuma 0 kalau dua-duanya 0." },
    NOT: { fn: (a) => !a, desc: "Membalik nilai. Kalau A = 1, output 0. Kalau A = 0, output 1. (Tidak butuh B)" },
    XOR: { fn: (a, b) => a !== b, desc: "Exclusive OR. Output 1 jika A dan B BERBEDA. Output 0 jika sama." },
    NAND: { fn: (a, b) => !(a && b), desc: "NOT-AND. Kebalikan AND. Output 0 cuma kalau A dan B dua-duanya 1." },
    NOR: { fn: (a, b) => !(a || b), desc: "NOT-OR. Kebalikan OR. Output 1 cuma kalau dua-duanya 0." },
  };

  const current = gates[selectedGate];
  const output = selectedGate === "NOT" ? current.fn(a) : current.fn(a, b);

  // Truth table
  const rows = selectedGate === "NOT"
    ? [[0], [1]]
    : [[0, 0], [0, 1], [1, 0], [1, 1]];

  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 32px 60px" }}>
        <Breadcrumb trail={[
          { to: "/", label: "Beranda" },
          { to: "/lab", label: "Lab Maya" },
          { label: "Gerbang Logika" },
        ]}/>
        {(() => { const ref = sessionStorage.getItem("sigma_lab_referrer"); if (!ref?.includes("/modul/")) return null; const mod = window.CURRICULUM?.modules?.find(m => m.id === (ref.split("/modul/")[1]||"").split("?")[0]); return <button onClick={() => { sessionStorage.removeItem("sigma_lab_referrer"); navigate(ref); }} style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:12,background:"var(--gold-300)",border:"2px solid var(--ink)",fontWeight:800,fontSize:14,cursor:"pointer",marginBottom:20,color:"var(--navy-950)" }}>← Kembali ke {mod ? mod.title : "Pelajaran"}</button>; })()}
        <div style={{ marginTop: 12, marginBottom: 30 }}>
          <div className="tag tag-info" style={{ marginBottom: 10 }}>LAB MAYA • INFORMATIKA</div>
          <h1 className="display" style={{ fontSize: 44, margin: 0, color: "var(--navy-950)" }}>
            Simulator <span style={{ color: "var(--info-500)", fontStyle: "italic" }}>Gerbang Logika</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--ink-muted)", marginTop: 10, maxWidth: 680 }}>
            Gerbang logika adalah "atom" dari semua komputer. Setiap operasi di CPU, dari hitung 1+1 sampai render video 4K, dibangun dari jutaan gerbang ini.
          </p>
        </div>

        {/* Gate picker */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {Object.keys(gates).map(g => (
            <button key={g} onClick={() => { setSelectedGate(g); markExplored(); }} className="btn btn-sm"
              style={{
                background: g === selectedGate ? "var(--navy-900)" : "white",
                color: g === selectedGate ? "white" : "var(--ink)",
                padding: "10px 20px", fontSize: 15,
              }}>{g}</button>
          ))}
        </div>

        {/* Circuit */}
        <div className="card" style={{ padding: 40, background: "white", marginBottom: 20 }}>
          <svg viewBox="0 0 600 260" style={{ width: "100%", maxWidth: 600, margin: "0 auto", display: "block" }}>
            {/* Input A */}
            <InputSwitch x={40} y={selectedGate === "NOT" ? 130 : 70} label="A" value={a} onChange={() => { setA(!a); markExplored(); }}/>
            {selectedGate !== "NOT" && <InputSwitch x={40} y={190} label="B" value={b} onChange={() => { setB(!b); markExplored(); }}/>}

            {/* Wires into gate */}
            <line x1={90} y1={selectedGate === "NOT" ? 130 : 70} x2={240} y2={selectedGate === "NOT" ? 130 : 90}
              stroke={a ? "var(--gold-500)" : "var(--ink-muted)"} strokeWidth="4"/>
            {selectedGate !== "NOT" && (
              <line x1={90} y1={190} x2={240} y2={170}
                stroke={b ? "var(--gold-500)" : "var(--ink-muted)"} strokeWidth="4"/>
            )}

            {/* Gate shape */}
            <GateShape type={selectedGate} x={240} y={130} active={output}/>

            {/* Output wire */}
            <line x1={400} y1={130} x2={510} y2={130}
              stroke={output ? "var(--gold-500)" : "var(--ink-muted)"} strokeWidth="4"/>

            {/* Output LED */}
            <g>
              <circle cx={540} cy={130} r={28}
                fill={output ? "var(--gold-400)" : "#2a2a35"}
                stroke="var(--ink)" strokeWidth="3"
                style={{ filter: output ? "drop-shadow(0 0 12px var(--gold-400))" : "none", transition: "all 0.2s" }}
              />
              <text x={540} y={137} textAnchor="middle" fontSize="22" fontWeight="800"
                fill={output ? "var(--navy-950)" : "rgba(255,255,255,0.3)"}>
                {output ? 1 : 0}
              </text>
              <text x={540} y={180} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink-muted)">OUT</text>
            </g>
          </svg>
        </div>

        {/* Description + Truth table */}
        <div className="lab-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="card" style={{ padding: 24, background: "white" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "var(--info-500)", textTransform: "uppercase", marginBottom: 8 }}>Gerbang {selectedGate}</div>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink)", margin: 0 }}>{current.desc}</p>
            <div style={{ marginTop: 18, padding: "10px 14px", background: "var(--bg-cream)", borderRadius: 10, fontSize: 13, color: "var(--ink-muted)" }}>
              💡 Coba ganti nilai A dan B dengan klik saklar di kiri — lihat output berubah.
            </div>
          </div>
          <div className="card" style={{ padding: 24, background: "white" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "var(--info-500)", textTransform: "uppercase", marginBottom: 12 }}>Tabel Kebenaran</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={tableTh}>A</th>
                  {selectedGate !== "NOT" && <th style={tableTh}>B</th>}
                  <th style={{ ...tableTh, color: "var(--gold-500)" }}>OUT</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const rowOut = selectedGate === "NOT" ? current.fn(!!row[0]) : current.fn(!!row[0], !!row[1]);
                  const match = selectedGate === "NOT"
                    ? row[0] === (a ? 1 : 0)
                    : row[0] === (a ? 1 : 0) && row[1] === (b ? 1 : 0);
                  return (
                    <tr key={i} style={{ background: match ? "var(--gold-300)" : "transparent" }}>
                      <td style={tableTd}>{row[0]}</td>
                      {selectedGate !== "NOT" && <td style={tableTd}>{row[1]}</td>}
                      <td style={{ ...tableTd, color: rowOut ? "var(--green-500)" : "var(--ink-muted)", fontWeight: 800 }}>
                        {rowOut ? 1 : 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ fontSize: 11, color: "var(--ink-subtle)", marginTop: 10, textAlign: "center" }}>Baris kuning = kondisi saat ini</div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

const InputSwitch = ({ x, y, label, value, onChange }) => (
  <g style={{ cursor: "pointer" }} onClick={onChange}>
    <rect x={x - 40} y={y - 18} width={80} height={36} rx={18}
      fill={value ? "var(--gold-400)" : "#2a2a35"} stroke="var(--ink)" strokeWidth="3"/>
    <circle cx={value ? x + 18 : x - 18} cy={y} r={14}
      fill="white" stroke="var(--ink)" strokeWidth="2"/>
    <text x={x - 68} y={y + 6} fontSize="18" fontWeight="800" fill="var(--ink)">{label}</text>
    <text x={x + (value ? -12 : 12)} y={y + 5} fontSize="13" fontWeight="800"
      fill={value ? "var(--navy-950)" : "rgba(255,255,255,0.5)"}>
      {value ? "1" : "0"}
    </text>
  </g>
);

const GateShape = ({ type, x, y, active }) => {
  const color = active ? "var(--info-500)" : "white";
  const stroke = "var(--ink)";
  if (type === "AND" || type === "NAND") {
    return (
      <g>
        <path d={`M${x} ${y - 40} L${x + 60} ${y - 40} A40 40 0 0 1 ${x + 60} ${y + 40} L${x} ${y + 40} Z`}
          fill={color} stroke={stroke} strokeWidth="3"/>
        {type === "NAND" && <circle cx={x + 110} cy={y} r={6} fill="white" stroke={stroke} strokeWidth="3"/>}
        <text x={x + 45} y={y + 6} fontSize="14" fontWeight="800" fill={active ? "white" : "var(--ink)"} textAnchor="middle">{type}</text>
      </g>
    );
  }
  if (type === "OR" || type === "NOR") {
    return (
      <g>
        <path d={`M${x} ${y - 40} Q${x + 30} ${y - 40}, ${x + 90} ${y} Q${x + 30} ${y + 40}, ${x} ${y + 40} Q${x + 20} ${y}, ${x} ${y - 40} Z`}
          fill={color} stroke={stroke} strokeWidth="3"/>
        {type === "NOR" && <circle cx={x + 100} cy={y} r={6} fill="white" stroke={stroke} strokeWidth="3"/>}
        <text x={x + 40} y={y + 6} fontSize="14" fontWeight="800" fill={active ? "white" : "var(--ink)"} textAnchor="middle">{type}</text>
      </g>
    );
  }
  if (type === "XOR") {
    return (
      <g>
        <path d={`M${x - 8} ${y - 40} Q${x + 12} ${y}, ${x - 8} ${y + 40}`} fill="none" stroke={stroke} strokeWidth="3"/>
        <path d={`M${x} ${y - 40} Q${x + 30} ${y - 40}, ${x + 90} ${y} Q${x + 30} ${y + 40}, ${x} ${y + 40} Q${x + 20} ${y}, ${x} ${y - 40} Z`}
          fill={color} stroke={stroke} strokeWidth="3"/>
        <text x={x + 40} y={y + 6} fontSize="14" fontWeight="800" fill={active ? "white" : "var(--ink)"} textAnchor="middle">XOR</text>
      </g>
    );
  }
  if (type === "NOT") {
    return (
      <g>
        <path d={`M${x} ${y - 40} L${x + 80} ${y} L${x} ${y + 40} Z`}
          fill={color} stroke={stroke} strokeWidth="3"/>
        <circle cx={x + 90} cy={y} r={6} fill="white" stroke={stroke} strokeWidth="3"/>
        <text x={x + 30} y={y + 6} fontSize="13" fontWeight="800" fill={active ? "white" : "var(--ink)"} textAnchor="middle">NOT</text>
      </g>
    );
  }
};

const tableTh = { padding: "10px 12px", fontSize: 13, fontWeight: 800, textAlign: "center", borderBottom: "2px solid var(--line-strong)", color: "var(--ink-muted)", fontFamily: "var(--font-mono)" };
const tableTd = { padding: "12px", fontSize: 18, fontWeight: 700, textAlign: "center", borderBottom: "1px solid var(--line)", fontFamily: "var(--font-mono)" };

window.LogicGatesLab = LogicGatesLab;
