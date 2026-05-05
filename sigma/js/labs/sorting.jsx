// ============================================
// LAB 1 — Sorting Algorithm Visualizer
// ============================================

// --- shared globals ---
const { Icon, Navbar, Footer, Link, useRoute, navigate, SectionHeader, Breadcrumb, EmptyState, ModuleCard, LabschoolLogo, BrandStrip, ControlField } = window;
const { useState, useEffect, useRef } = React;

const SortingLab = () => {
  const [algo, setAlgo] = useState("bubble");
  const [size, setSize] = useState(20);
  const [speed, setSpeed] = useState(40);
  const [array, setArray] = useState([]);
  const [highlights, setHighlights] = useState({ compare: [], swap: [], done: [] });
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0 });
  const cancelRef = React.useRef(false);

  const generate = () => {
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    setArray(arr);
    setHighlights({ compare: [], swap: [], done: [] });
    setStats({ comparisons: 0, swaps: 0 });
  };

  useEffect(() => { generate(); }, [size]);

  const delay = (ms) => new Promise(r => setTimeout(r, ms));
  const effectiveDelay = () => Math.max(5, 200 - speed * 2);

  const bubbleSort = async (arr) => {
    const a = [...arr];
    const n = a.length;
    let c = 0, s = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (cancelRef.current) return;
        c++;
        setHighlights({ compare: [j, j + 1], swap: [], done: [...Array(i).keys()].map(k => n - 1 - k) });
        setStats({ comparisons: c, swaps: s });
        await delay(effectiveDelay());
        if (a[j] > a[j + 1]) {
          s++;
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          setArray([...a]);
          setHighlights({ compare: [], swap: [j, j + 1], done: [...Array(i).keys()].map(k => n - 1 - k) });
          setStats({ comparisons: c, swaps: s });
          await delay(effectiveDelay());
        }
      }
    }
    setHighlights({ compare: [], swap: [], done: [...Array(n).keys()] });
  };

  const selectionSort = async (arr) => {
    const a = [...arr];
    const n = a.length;
    let c = 0, s = 0;
    for (let i = 0; i < n; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        if (cancelRef.current) return;
        c++;
        setHighlights({ compare: [minIdx, j], swap: [], done: [...Array(i).keys()] });
        setStats({ comparisons: c, swaps: s });
        await delay(effectiveDelay());
        if (a[j] < a[minIdx]) minIdx = j;
      }
      if (minIdx !== i) {
        s++;
        [a[i], a[minIdx]] = [a[minIdx], a[i]];
        setArray([...a]);
        setHighlights({ compare: [], swap: [i, minIdx], done: [...Array(i).keys()] });
        setStats({ comparisons: c, swaps: s });
        await delay(effectiveDelay());
      }
    }
    setHighlights({ compare: [], swap: [], done: [...Array(n).keys()] });
  };

  const insertionSort = async (arr) => {
    const a = [...arr];
    const n = a.length;
    let c = 0, s = 0;
    for (let i = 1; i < n; i++) {
      let j = i;
      while (j > 0) {
        if (cancelRef.current) return;
        c++;
        setHighlights({ compare: [j - 1, j], swap: [], done: [] });
        setStats({ comparisons: c, swaps: s });
        await delay(effectiveDelay());
        if (a[j - 1] > a[j]) {
          s++;
          [a[j - 1], a[j]] = [a[j], a[j - 1]];
          setArray([...a]);
          setHighlights({ compare: [], swap: [j - 1, j], done: [] });
          setStats({ comparisons: c, swaps: s });
          await delay(effectiveDelay());
          j--;
        } else break;
      }
    }
    setHighlights({ compare: [], swap: [], done: [...Array(n).keys()] });
  };

  const quickSort = async (arr) => {
    const a = [...arr];
    let c = 0, s = 0;
    const partition = async (lo, hi) => {
      const pivot = a[hi];
      let i = lo - 1;
      for (let j = lo; j < hi; j++) {
        if (cancelRef.current) return;
        c++;
        setHighlights({ compare: [j, hi], swap: [], done: [] });
        setStats({ comparisons: c, swaps: s });
        await delay(effectiveDelay());
        if (a[j] < pivot) {
          i++;
          if (i !== j) {
            s++;
            [a[i], a[j]] = [a[j], a[i]];
            setArray([...a]);
            setHighlights({ compare: [], swap: [i, j], done: [] });
            setStats({ comparisons: c, swaps: s });
            await delay(effectiveDelay());
          }
        }
      }
      s++;
      [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
      setArray([...a]);
      setStats({ comparisons: c, swaps: s });
      await delay(effectiveDelay());
      return i + 1;
    };
    const qs = async (lo, hi) => {
      if (lo < hi && !cancelRef.current) {
        const p = await partition(lo, hi);
        await qs(lo, p - 1);
        await qs(p + 1, hi);
      }
    };
    await qs(0, a.length - 1);
    setHighlights({ compare: [], swap: [], done: [...Array(a.length).keys()] });
  };

  const run = async () => {
    setRunning(true);
    cancelRef.current = false;
    if (algo === "bubble") await bubbleSort(array);
    else if (algo === "selection") await selectionSort(array);
    else if (algo === "insertion") await insertionSort(array);
    else if (algo === "quick") await quickSort(array);
    setRunning(false);
  };

  const stop = () => { cancelRef.current = true; setRunning(false); };

  const maxVal = Math.max(...array, 1);
  const algoInfo = {
    bubble: { name: "Bubble Sort", big: "O(n²)", how: "Bandingkan pasangan bersebelahan, swap jika terbalik. Ulangi sampai tidak ada swap lagi." },
    selection: { name: "Selection Sort", big: "O(n²)", how: "Cari elemen terkecil, taruh di depan. Ulangi untuk sisa array." },
    insertion: { name: "Insertion Sort", big: "O(n²)", how: "Ambil elemen satu per satu, sisipkan ke posisi yang benar." },
    quick: { name: "Quick Sort", big: "O(n log n)", how: "Pilih pivot, bagi jadi 2 grup (kurang dari & lebih dari pivot), rekursif." },
  };

  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 32px 60px" }}>
        <Breadcrumb trail={[
          { to: "/", label: "Beranda" },
          { to: "/lab", label: "Lab Maya" },
          { label: "Visualisasi Sorting" },
        ]}/>

        <div style={{ marginTop: 12, marginBottom: 24 }}>
          <div className="tag tag-info" style={{ marginBottom: 10 }}>LAB MAYA • INFORMATIKA</div>
          <h1 className="display" style={{ fontSize: 44, margin: 0, color: "var(--navy-950)" }}>
            Visualisasi Algoritma <span style={{ color: "var(--info-500)", fontStyle: "italic" }}>Sorting</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--ink-muted)", marginTop: 10, maxWidth: 680 }}>
            Lihat algoritma bekerja langkah-demi-langkah. <strong>Biru muda</strong> = sedang dibandingkan, <strong>kuning</strong> = sedang ditukar, <strong>hijau</strong> = sudah di tempat.
          </p>
        </div>

        {/* Controls */}
        <div className="card" style={{ padding: 20, background: "white", marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr) auto", gap: 16, alignItems: "end" }}>
            <ControlField label="Algoritma">
              <select value={algo} onChange={e => setAlgo(e.target.value)} disabled={running} className="input" style={{ padding: "8px 12px" }}>
                <option value="bubble">Bubble Sort</option>
                <option value="selection">Selection Sort</option>
                <option value="insertion">Insertion Sort</option>
                <option value="quick">Quick Sort</option>
              </select>
            </ControlField>
            <ControlField label={`Jumlah elemen: ${size}`}>
              <input type="range" min="5" max="40" value={size} onChange={e => setSize(+e.target.value)} disabled={running} style={{ width: "100%" }}/>
            </ControlField>
            <ControlField label={`Kecepatan: ${speed}`}>
              <input type="range" min="1" max="100" value={speed} onChange={e => setSpeed(+e.target.value)} style={{ width: "100%" }}/>
            </ControlField>
            <div style={{ display: "flex", gap: 6, fontSize: 12 }}>
              <div style={{ padding: "8px 12px", background: "var(--bg)", borderRadius: 10, flex: 1, textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{stats.comparisons}</div>
                <div style={{ color: "var(--ink-subtle)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Compare</div>
              </div>
              <div style={{ padding: "8px 12px", background: "var(--bg)", borderRadius: 10, flex: 1, textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{stats.swaps}</div>
                <div style={{ color: "var(--ink-subtle)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Swap</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-sm" onClick={generate} disabled={running}><Icon.Refresh width="14" height="14"/> Acak</button>
              {running
                ? <button className="btn btn-sm btn-danger" onClick={stop}><Icon.Pause width="14" height="14"/> Stop</button>
                : <button className="btn btn-sm btn-info" onClick={run}><Icon.Play width="14" height="14"/> Jalankan</button>
              }
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="card" style={{ padding: 30, background: "white", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 320, padding: "0 10px" }}>
            {array.map((v, i) => {
              let bg = "var(--navy-700)";
              if (highlights.done.includes(i)) bg = "var(--green-500)";
              else if (highlights.swap.includes(i)) bg = "var(--gold-400)";
              else if (highlights.compare.includes(i)) bg = "var(--info-400)";
              return (
                <div key={i} style={{
                  flex: 1,
                  height: `${(v / maxVal) * 100}%`,
                  background: bg,
                  borderRadius: "6px 6px 0 0",
                  border: "1.5px solid var(--ink)",
                  display: "flex", alignItems: "flex-start", justifyContent: "center",
                  paddingTop: 4,
                  color: "white", fontWeight: 800, fontSize: 11,
                  transition: "background 0.15s, height 0.15s",
                  minWidth: 4,
                }}>
                  {size <= 25 ? v : ""}
                </div>
              );
            })}
          </div>
        </div>

        {/* Algo info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="card" style={{ padding: 22, background: "white" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "var(--info-500)", textTransform: "uppercase", marginBottom: 8 }}>Algoritma Aktif</div>
            <h3 className="display" style={{ fontSize: 24, margin: "0 0 4px" }}>{algoInfo[algo].name}</h3>
            <div style={{ display: "inline-block", padding: "4px 10px", background: "var(--navy-950)", color: "var(--gold-400)", borderRadius: 6, fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 700, marginBottom: 12 }}>
              Kompleksitas: {algoInfo[algo].big}
            </div>
            <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.6, margin: 0 }}>{algoInfo[algo].how}</p>
          </div>
          <div className="card" style={{ padding: 22, background: "var(--bg-cream)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "var(--navy-900)", textTransform: "uppercase", marginBottom: 8 }}>💡 Coba ini</div>
            <ul style={{ paddingLeft: 18, margin: 0, fontSize: 14, lineHeight: 1.7, color: "var(--ink)" }}>
              <li>Pilih algoritma berbeda & bandingkan jumlah <strong>compare</strong> & <strong>swap</strong>.</li>
              <li>Perbesar array ke 40 elemen — Bubble vs Quick Sort seberapa beda?</li>
              <li>Kecilkan kecepatan untuk lihat detil perbandingan satu-per-satu.</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

const ControlField = ({ label, children }) => (
  <div>
    <label style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-subtle)", marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

window.SortingLab = SortingLab;
window.ControlField = ControlField;
