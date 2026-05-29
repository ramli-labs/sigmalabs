// ============================================
// GAME 1 — Bug Hunter (find the bug in code)
// ============================================

// --- shared globals ---
const { Icon, Navbar, Footer, Link, useRoute, navigate, SectionHeader, Breadcrumb, EmptyState, ModuleCard, LabschoolLogo, BrandStrip, ControlField } = window;
const { useState, useEffect, useRef } = React;

const BugHunterGame = () => {
  const challenges = [
    {
      code: `def hitung_rata(nilai):\n    total = 0\n    for n in nilai:\n        total = total + n\n    return total  # ← baris mana yang salah?\n\nprint(hitung_rata([80, 90, 100]))`,
      bugLine: 5,
      explain: "Fungsi cuma mengembalikan total, bukan rata-rata. Harusnya: `return total / len(nilai)`",
      options: [2, 3, 4, 5],
    },
    {
      code: `# Cetak angka 1 sampai 5\nfor i in range(5):\n    print(i + 1)\n\n# Kenapa outputnya salah?`,
      bugLine: null,
      explain: "Trick question! Kode ini sebenarnya BENAR — range(5) = [0,1,2,3,4], ditambah 1 jadi 1-5.",
      options: [1, 2, 3, "Tidak ada bug"],
      correctIdx: 3,
    },
    {
      code: `nama = "Rizky"\nif nama = "Rizky":\n    print("Halo!")`,
      bugLine: 2,
      explain: "`=` adalah assignment (pemberian nilai), `==` adalah perbandingan. Di `if`, harus pakai `==`.",
      options: [1, 2, 3],
    },
    {
      code: `angka = [1, 2, 3, 4, 5]\ntotal = 0\nfor i in range(len(angka))\n    total += angka[i]\nprint(total)`,
      bugLine: 3,
      explain: "Missing colon (`:`) di akhir baris 3. Python butuh `:` setelah `for`, `if`, `while`, dll.",
      options: [1, 2, 3, 4],
    },
    {
      code: `def sapa(nama):\n    print("Halo, " + nama)\n\nsapa(123)`,
      bugLine: 4,
      explain: "Error: tidak bisa concat string dan int. Harus diubah `str(123)` atau kirim string.",
      options: [1, 2, 3, 4],
    },
  ];

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timer, setTimer] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const startRef = React.useRef(Date.now());

  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => setTimer(Math.floor((Date.now() - startRef.current) / 1000)), 500);
    return () => clearInterval(interval);
  }, [done]);

  const c = challenges[idx];
  const lines = c.code.split("\n");

  const pick = (opt, i) => {
    if (selected !== null) return;
    setSelected(opt);
    const isRight = c.correctIdx !== undefined ? i === c.correctIdx : opt === c.bugLine;
    if (isRight) setCorrect(correct + 1);
    setTimeout(() => {
      if (idx < challenges.length - 1) {
        setIdx(idx + 1);
        setSelected(null);
      } else {
        setDone(true);
      }
    }, 1800);
  };

  if (done) {
    const xpEarned = correct * 24;
    return (
      <GameEndScreen gameId="bug-hunter" correct={correct} total={challenges.length} time={timer} xp={xpEarned}/>
    );
  }

  const isRight = selected !== null && (c.correctIdx !== undefined ? challenges[idx].options.indexOf(selected) === c.correctIdx : selected === c.bugLine);

  return (
    <GameShell title="Bug Hunter" subject="informatika" gameId="bug-hunter"
      stats={[
        { label: "Soal", value: `${idx + 1} / ${challenges.length}` },
        { label: "Benar", value: correct, color: "var(--green-500)" },
        { label: "Waktu", value: `${timer}s` },
      ]}>
      <div className="card" style={{ padding: 28, background: "white" }}>
        <div style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 12 }}>
          Temukan baris yang punya bug:
        </div>
        <div style={{ background: "var(--navy-950)", color: "#E6E9F2", padding: "16px 0", borderRadius: 12, fontFamily: "var(--font-mono)", fontSize: 14, lineHeight: 1.7, marginBottom: 20, overflowX: "auto" }}>
          {lines.map((line, i) => (
            <div key={i} style={{
              padding: "2px 20px",
              background: selected !== null && (i + 1) === c.bugLine ? "rgba(226,62,62,0.25)" : "transparent",
              borderLeft: selected !== null && (i + 1) === c.bugLine ? "3px solid var(--red-500)" : "3px solid transparent",
              whiteSpace: "pre",
            }}>
              <span style={{ color: "rgba(255,255,255,0.3)", display: "inline-block", width: 28, textAlign: "right", marginRight: 14 }}>{i + 1}</span>
              {line}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${c.options.length}, 1fr)`, gap: 10 }}>
          {c.options.map((opt, i) => {
            const isThisRight = c.correctIdx !== undefined ? i === c.correctIdx : opt === c.bugLine;
            const picked = selected === opt;
            const show = selected !== null;
            return (
              <button key={i} onClick={() => pick(opt, i)} disabled={selected !== null}
                className="btn"
                style={{
                  padding: "14px",
                  background: show && isThisRight ? "var(--green-500)" : show && picked ? "var(--red-500)" : "white",
                  color: show && (isThisRight || picked) ? "white" : "var(--ink)",
                  fontWeight: 800, fontSize: 15,
                }}>
                {typeof opt === "number" ? `Baris ${opt}` : opt}
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <div style={{ marginTop: 16, padding: "14px 18px", background: isRight ? "#D1FAE5" : "#FEE2E2", borderRadius: 12, fontSize: 14, lineHeight: 1.6, color: "var(--ink)" }}>
            <strong>{isRight ? "✓ Benar!" : "✗ Kurang tepat."}</strong> {c.explain}
          </div>
        )}
      </div>
    </GameShell>
  );
};
window.BugHunterGame = BugHunterGame;


// ============================================
// GAME 2 — Sort Race (drag to sort)
// ============================================

const SortRaceGame = () => {
  const [nums, setNums] = useState([]);
  const [time, setTime] = useState(0);
  const [done, setDone] = useState(false);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [rounds, setRounds] = useState([]);
  const startRef = React.useRef(null);

  const generate = () => {
    const n = Array.from({ length: 7 }, () => Math.floor(Math.random() * 90) + 10);
    setNums(n);
    setTime(0);
    startRef.current = Date.now();
  };

  useEffect(() => { generate(); }, []);
  useEffect(() => {
    if (done) return;
    const iv = setInterval(() => setTime(Math.floor((Date.now() - startRef.current) / 1000)), 500);
    return () => clearInterval(iv);
  }, [done, rounds.length]);

  const swap = (i, j) => {
    if (i === j) return;
    const next = [...nums];
    [next[i], next[j]] = [next[j], next[i]];
    setNums(next);
  };

  useEffect(() => {
    if (nums.length === 0) return;
    const sorted = [...nums].sort((a, b) => a - b);
    const isSorted = nums.every((n, i) => n === sorted[i]);
    if (isSorted && startRef.current) {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      setRounds(r => [...r, elapsed]);
      if (rounds.length >= 2) {
        setDone(true);
      } else {
        setTimeout(generate, 600);
      }
    }
  }, [nums]);

  if (done) {
    const totalTime = rounds.reduce((a, b) => a + b, 0);
    const avgTime = Math.round(totalTime / rounds.length);
    const xp = Math.max(30, 150 - avgTime * 5);
    return <GameEndScreen gameId="sort-race" correct={3} total={3} time={totalTime} xp={xp} extra={`Rata-rata ${avgTime}s per ronde!`}/>;
  }

  return (
    <GameShell title="Balap Sorting" subject="informatika" gameId="sort-race"
      stats={[
        { label: "Ronde", value: `${rounds.length + 1} / 3` },
        { label: "Waktu", value: `${time}s`, color: "var(--orange-500)" },
        { label: "Selesai", value: rounds.length, color: "var(--green-500)" },
      ]}>
      <div className="card" style={{ padding: 32, background: "white" }}>
        <div style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 20, textAlign: "center" }}>
          Drag & drop angka untuk menyusun dari <strong>terkecil ke terbesar</strong>. Cepat = XP lebih banyak!
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {nums.map((n, i) => (
            <div key={i}
              draggable
              onDragStart={() => setDraggingIdx(i)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => { swap(draggingIdx, i); setDraggingIdx(null); }}
              style={{
                width: 80, height: 80,
                background: draggingIdx === i ? "var(--gold-400)" : "var(--info-400)",
                color: "var(--navy-950)",
                border: "3px solid var(--ink)", borderRadius: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 800,
                cursor: "grab", userSelect: "none",
                boxShadow: "var(--shadow-chunk-sm)",
                transition: "all 0.15s",
              }}>{n}</div>
          ))}
        </div>
        <div style={{ marginTop: 24, fontSize: 13, color: "var(--ink-subtle)", textAlign: "center" }}>
          Tips: klik angka lalu drag ke posisi angka lain untuk swap
        </div>
      </div>
    </GameShell>
  );
};
window.SortRaceGame = SortRaceGame;


// ============================================
// GAME 3 — Caesar Cipher
// ============================================

const CaesarCipherGame = () => {
  const puzzles = [
    { plain: "SIGMA", shift: 3, cipher: "VLJPD" },
    { plain: "CODING", shift: 5, cipher: "HTINSL" },
    { plain: "ALGORITMA", shift: 7, cipher: "HSNVYPTH" },
    { plain: "NEURAL", shift: 4, cipher: "RIYVEP" },
    { plain: "JUARA", shift: 2, cipher: "LWCTC" },
  ];

  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [solved, setSolved] = useState([]);
  const [wrong, setWrong] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const p = puzzles[idx];

  const check = () => {
    if (input.toUpperCase().trim() === p.plain) {
      setSolved([...solved, idx]);
      setWrong(false);
      setInput("");
      setShowHint(false);
      if (idx < puzzles.length - 1) setTimeout(() => setIdx(idx + 1), 1000);
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 800);
    }
  };

  if (solved.length === puzzles.length) {
    return <GameEndScreen gameId="caesar-cipher" correct={puzzles.length} total={puzzles.length} xp={150} extra="Semua kode terpecahkan!"/>;
  }

  return (
    <GameShell title="Pemecah Kode Caesar" subject="informatika" gameId="caesar-cipher"
      stats={[
        { label: "Puzzle", value: `${idx + 1} / ${puzzles.length}` },
        { label: "Terpecahkan", value: solved.length, color: "var(--green-500)" },
      ]}>
      <div className="card" style={{ padding: 30, background: "white", animation: wrong ? "wiggle 0.3s" : "none" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--red-500)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>KODE TERENKRIPSI</div>
          <div className="display" style={{ fontSize: 56, color: "var(--navy-950)", letterSpacing: 6, fontFamily: "var(--font-mono)" }}>{p.cipher}</div>
          <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 10 }}>
            Shift: <strong>+{p.shift}</strong> (setiap huruf digeser ke kanan {p.shift} posisi)
          </div>
        </div>
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <input className="input" placeholder="KETIK JAWABAN..."
            value={input} onChange={e => setInput(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && check()}
            style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 22, letterSpacing: 4, fontWeight: 800 }}
            autoFocus
          />
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button className="btn" onClick={() => setShowHint(!showHint)}>💡 Hint</button>
            <button className="btn btn-danger" onClick={check} style={{ flex: 1 }}>Cek Jawaban</button>
          </div>
          {showHint && (
            <div style={{ marginTop: 14, padding: "12px 16px", background: "var(--gold-300)", borderRadius: 12, fontSize: 13, lineHeight: 1.5 }}>
              Huruf pertama <code style={{ background: "white", padding: "1px 6px", borderRadius: 4 }}>{p.cipher[0]}</code> digeser {p.shift} balik = <strong>{p.plain[0]}</strong>. Lanjutkan polanya untuk huruf lain!
            </div>
          )}
        </div>
        <div style={{ marginTop: 30, padding: 16, background: "var(--bg)", borderRadius: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "var(--ink-subtle)", textTransform: "uppercase", marginBottom: 10, textAlign: "center" }}>Alfabet Reference</div>
          <div style={{ display: "flex", gap: 3, fontFamily: "var(--font-mono)", fontSize: 11, justifyContent: "center", flexWrap: "wrap" }}>
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l, i) => (
              <div key={i} style={{ padding: "4px 6px", background: "white", border: "1px solid var(--line)", borderRadius: 4, minWidth: 20, textAlign: "center", fontWeight: 700 }}>{l}</div>
            ))}
          </div>
        </div>
      </div>
    </GameShell>
  );
};
window.CaesarCipherGame = CaesarCipherGame;


// ============================================
// GAME 4 — AI Ethics Dilemma
// ============================================

const AIEthicsGame = () => {
  const scenarios = [
    {
      title: "Self-Driving Car",
      situation: "Mobil otonom tidak sempat berhenti. Bisa menabrak 1 pejalan kaki di depan, atau banting setir menabrak pohon (penumpang cedera berat). Apa yang harus AI lakukan?",
      options: [
        { label: "Selamatkan penumpang (tabrak pejalan kaki)", impact: "Egois tapi penumpang dilindungi", score: 1 },
        { label: "Selamatkan pejalan kaki (banting ke pohon)", impact: "Etis, tapi siapa yang mau beli mobil yang mengorbankan pemiliknya?", score: 2 },
        { label: "Hitung berdasarkan usia/jumlah orang", impact: "Siapa yang berhak menentukan nilai nyawa?", score: 0 },
      ],
      discuss: "Tidak ada jawaban 'benar' — ini dilema sesungguhnya yang dihadapi perusahaan seperti Tesla dan Waymo. MIT bahkan punya 'Moral Machine' untuk mengumpulkan pandangan global.",
    },
    {
      title: "AI Recruitment",
      situation: "Perusahaan pakai AI untuk screening CV. AI dilatih dari data 10 tahun terakhir — ternyata secara historis lebih banyak pria yang direkrut. AI jadi bias terhadap perempuan.",
      options: [
        { label: "Lanjutkan pakai — AI tinggal prediksi", impact: "Memperkuat diskriminasi sistematis", score: 0 },
        { label: "Retrain dengan data seimbang", impact: "Tanggung jawab — butuh effort tapi fair", score: 3 },
        { label: "Matikan sistem AI sepenuhnya", impact: "Hilang efisiensi, tapi aman dari bias", score: 2 },
      ],
      discuss: "Kasus nyata: Amazon pernah hentikan AI rekrutmen-nya di 2018 karena bias gender. Solusi modern: audit bias rutin + diversity dalam training data + human-in-the-loop.",
    },
    {
      title: "Deepfake Video",
      situation: "Kamu menemukan video presiden mengatakan sesuatu kontroversial. Video-nya ternyata deepfake — tapi sudah viral dan dipercaya jutaan orang.",
      options: [
        { label: "Share dulu, nanti cek belakangan", impact: "Menyebarkan disinformasi", score: 0 },
        { label: "Cek sumber & lapor platform", impact: "Tanggung jawab literasi digital", score: 3 },
        { label: "Diam saja, bukan urusan saya", impact: "Membiarkan hoax menyebar", score: 1 },
      ],
      discuss: "Deepfake makin canggih. Cek: watermark C2PA, reverse image search, perhatikan gerakan bibir. Platform besar punya deteksi otomatis, tapi tidak sempurna.",
    },
    {
      title: "AI Surveillance",
      situation: "Sekolah ingin pasang kamera dengan AI pengenalan wajah di koridor untuk mencegah bullying dan absen palsu. Siswa tidak dimintai persetujuan.",
      options: [
        { label: "Setuju — demi keamanan", impact: "Privasi vs keamanan — bahaya slippery slope", score: 1 },
        { label: "Tolak keras — pelanggaran privasi", impact: "Hak privasi dilindungi, tapi bullying bisa terus", score: 2 },
        { label: "Diskusi dulu dengan siswa/ortu", impact: "Transparansi & informed consent itu kunci", score: 3 },
      ],
      discuss: "UE sudah melarang AI surveillance di ruang publik lewat AI Act 2024. Kunci: siapa yang diuntungkan? Siapa yang dirugikan? Ada alternative yang less invasive?",
    },
  ];

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [done, setDone] = useState(false);

  const s = scenarios[idx];

  const pick = (i) => {
    if (picked !== null) return;
    setPicked(i);
    setTotalScore(totalScore + s.options[i].score);
  };

  const next = () => {
    if (idx < scenarios.length - 1) {
      setIdx(idx + 1);
      setPicked(null);
    } else {
      setDone(true);
    }
  };

  if (done) {
    const maxScore = scenarios.reduce((sum, s) => sum + Math.max(...s.options.map(o => o.score)), 0);
    const percent = totalScore / maxScore;
    const rating = percent > 0.8 ? "Etis & Bijaksana" : percent > 0.5 ? "Cukup Pertimbangan" : "Perlu Refleksi Lebih";
    return <GameEndScreen gameId="ai-ethics" correct={totalScore} total={maxScore} xp={Math.round(200 * percent)} extra={`Rating: ${rating}`}/>;
  }

  return (
    <GameShell title="Dilema Etika AI" subject="kka" gameId="ai-ethics"
      stats={[
        { label: "Skenario", value: `${idx + 1} / ${scenarios.length}` },
        { label: "Skor Etika", value: totalScore, color: "var(--ai-500)" },
      ]}>
      <div className="card" style={{ padding: 30, background: "white" }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "var(--ai-500)", textTransform: "uppercase", marginBottom: 6 }}>Skenario {idx + 1}</div>
        <h3 className="display" style={{ fontSize: 30, margin: "0 0 14px" }}>{s.title}</h3>
        <div style={{ padding: "18px 22px", background: "var(--ai-100)", borderLeft: "4px solid var(--ai-500)", borderRadius: 8, fontSize: 15, color: "var(--ink)", lineHeight: 1.6, marginBottom: 24 }}>
          {s.situation}
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {s.options.map((opt, i) => {
            const isPicked = picked === i;
            const show = picked !== null;
            const scoreColor = opt.score >= 3 ? "var(--green-500)" : opt.score >= 2 ? "var(--orange-500)" : "var(--red-500)";
            return (
              <button key={i} onClick={() => pick(i)} disabled={picked !== null}
                style={{
                  padding: "16px 20px", textAlign: "left", cursor: picked !== null ? "default" : "pointer",
                  background: show && isPicked ? "var(--navy-950)" : "white",
                  color: show && isPicked ? "white" : "var(--ink)",
                  border: `2px solid ${show && isPicked ? "var(--navy-950)" : "var(--line-strong)"}`,
                  borderRadius: 12,
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16,
                }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{opt.label}</div>
                  {show && <div style={{ fontSize: 13, color: show && isPicked ? "rgba(255,255,255,0.75)" : "var(--ink-muted)", marginTop: 6, lineHeight: 1.5 }}>{opt.impact}</div>}
                </div>
                {show && <div style={{ padding: "4px 10px", background: scoreColor, color: "white", borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{opt.score}/3</div>}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <>
            <div style={{ marginTop: 20, padding: "16px 20px", background: "var(--bg-cream)", borderRadius: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--navy-900)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>💭 Diskusi</div>
              <div style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.6 }}>{s.discuss}</div>
            </div>
            <button className="btn btn-ai" onClick={next} style={{ marginTop: 16, width: "100%", justifyContent: "center" }}>
              {idx < scenarios.length - 1 ? "Skenario Berikutnya" : "Lihat Hasil"} <Icon.ArrowRight width="14" height="14"/>
            </button>
          </>
        )}
      </div>
    </GameShell>
  );
};
window.AIEthicsGame = AIEthicsGame;


// ============================================
// GAME 5 — Pattern Quiz
// ============================================

const PatternQuizGame = () => {
  const puzzles = [
    { seq: [2, 4, 6, 8], next: 10, options: [9, 10, 11, 12], explain: "Kelipatan 2 — pola: tambah 2." },
    { seq: [1, 1, 2, 3, 5], next: 8, options: [6, 7, 8, 13], explain: "Fibonacci — setiap angka = jumlah 2 sebelumnya." },
    { seq: [1, 4, 9, 16], next: 25, options: [20, 23, 25, 36], explain: "Kuadrat: 1², 2², 3², 4², 5²." },
    { seq: [2, 6, 12, 20], next: 30, options: [28, 30, 32, 40], explain: "Pola: +4, +6, +8, +10. Selisih bertambah 2." },
    { seq: [100, 50, 25], next: 12.5, options: [10, 12.5, 15, 20], explain: "Dibagi 2 setiap langkah." },
    { seq: [1, 8, 27, 64], next: 125, options: [81, 100, 125, 216], explain: "Pangkat 3: 1³, 2³, 3³, 4³, 5³." },
  ];

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [time, setTime] = useState(0);
  const startRef = React.useRef(Date.now());

  useEffect(() => {
    const iv = setInterval(() => setTime(Math.floor((Date.now() - startRef.current) / 1000)), 500);
    return () => clearInterval(iv);
  }, []);

  const pick = (opt) => {
    if (selected !== null) return;
    setSelected(opt);
    if (opt === puzzles[idx].next) setCorrect(correct + 1);
    setTimeout(() => {
      if (idx < puzzles.length - 1) {
        setIdx(idx + 1);
        setSelected(null);
      }
    }, 1400);
  };

  if (idx === puzzles.length - 1 && selected !== null) {
    return <GameEndScreen gameId="pattern-quiz" correct={correct} total={puzzles.length} time={time} xp={correct * 15}/>;
  }

  const p = puzzles[idx];
  return (
    <GameShell title="Tebak Pola AI" subject="kka" gameId="pattern-quiz"
      stats={[
        { label: "Soal", value: `${idx + 1} / ${puzzles.length}` },
        { label: "Benar", value: correct, color: "var(--green-500)" },
        { label: "Waktu", value: `${time}s` },
      ]}>
      <div className="card" style={{ padding: 40, background: "white", textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ai-500)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Tebak angka berikutnya</div>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 40, flexWrap: "wrap" }}>
          {p.seq.map((n, i) => (
            <div key={i} style={{ width: 72, height: 72, background: "var(--navy-950)", color: "white", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, border: "2px solid var(--ink)" }}>
              {n}
            </div>
          ))}
          <div style={{ width: 72, height: 72, background: "var(--gold-400)", color: "var(--navy-950)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 800, border: "2px solid var(--ink)", boxShadow: "var(--shadow-chunk-sm)" }}>
            ?
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, maxWidth: 500, margin: "0 auto" }}>
          {p.options.map(opt => {
            const isPicked = selected === opt;
            const isCorrect = opt === p.next;
            const show = selected !== null;
            return (
              <button key={opt} onClick={() => pick(opt)} disabled={selected !== null}
                className="btn btn-lg"
                style={{
                  background: show && isCorrect ? "var(--green-500)" : show && isPicked ? "var(--red-500)" : "white",
                  color: show && (isCorrect || isPicked) ? "white" : "var(--ink)",
                  fontSize: 20, fontWeight: 800,
                }}>
                {opt}
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <div style={{ marginTop: 20, fontSize: 14, color: "var(--ink-muted)" }}>{p.explain}</div>
        )}
      </div>
    </GameShell>
  );
};
window.PatternQuizGame = PatternQuizGame;


// ============================================
// GAME 6 — Binary Typing Challenge
// ============================================

const BinaryTypingGame = () => {
  const [num, setNum] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [time, setTime] = useState(60);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  const nextNum = () => setNum(Math.floor(Math.random() * 255) + 1);

  useEffect(() => {
    if (!started) return;
    if (time <= 0) { setDone(true); return; }
    const t = setTimeout(() => setTime(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [time, started]);

  const start = () => {
    setStarted(true);
    nextNum();
    setScore(0); setWrong(0); setTime(60); setDone(false); setInput("");
  };

  useEffect(() => {
    if (!started || done) return;
    const expected = num.toString(2);
    if (input === expected) {
      setScore(s => s + 1);
      setInput("");
      nextNum();
    } else if (input.length >= expected.length && input !== expected) {
      setWrong(w => w + 1);
      setInput("");
      nextNum();
    }
  }, [input, num]);

  if (done) {
    return <GameEndScreen gameId="typing-binary" correct={score} total={score + wrong} time={60 - time} xp={score * 5} extra={`Kecepatan: ${(score / 60 * 60).toFixed(1)}/menit`}/>;
  }

  if (!started) {
    return (
      <GameShell title="Biner Typing" subject="informatika" gameId="typing-binary" stats={[]}>
        <div className="card" style={{ padding: 40, background: "white", textAlign: "center" }}>
          <div className="display" style={{ fontSize: 28, margin: "0 0 10px" }}>⌨️ Konversi desimal ke biner</div>
          <p style={{ color: "var(--ink-muted)", fontSize: 15, maxWidth: 480, margin: "0 auto 30px", lineHeight: 1.55 }}>
            Angka desimal akan muncul. Ketik representasi binernya secepat mungkin. <strong>60 detik</strong>. Jawaban otomatis di-submit.
          </p>
          <button className="btn btn-info btn-lg" onClick={start}>
            <Icon.Play width="16" height="16"/> Mulai
          </button>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Biner Typing" subject="informatika" gameId="typing-binary"
      stats={[
        { label: "Benar", value: score, color: "var(--green-500)" },
        { label: "Salah", value: wrong, color: "var(--red-500)" },
        { label: "Sisa", value: `${time}s`, color: time < 10 ? "var(--red-500)" : "var(--orange-500)" },
      ]}>
      <div className="card" style={{ padding: 40, background: "white", textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "var(--info-500)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Konversi ke biner</div>
        <div className="display" style={{ fontSize: 100, color: "var(--navy-950)", margin: "0 0 30px", lineHeight: 1 }}>{num}</div>
        <input
          className="input"
          value={input}
          onChange={e => setInput(e.target.value.replace(/[^01]/g, ""))}
          placeholder="0 dan 1 saja..."
          autoFocus
          style={{ fontFamily: "var(--font-mono)", fontSize: 28, textAlign: "center", letterSpacing: 6, fontWeight: 800, maxWidth: 400, margin: "0 auto" }}
        />
        <div style={{ fontSize: 12, color: "var(--ink-subtle)", marginTop: 14 }}>
          Tips: 10 = 1010, 42 = 101010, 255 = 11111111
        </div>
      </div>
    </GameShell>
  );
};
window.BinaryTypingGame = BinaryTypingGame;


// ============================================
// Shared game shell + end screen
// ============================================

const GameShell = ({ title, subject, gameId, stats, children }) => {
  const subj = window.CURRICULUM.subjects[subject];
  const game = window.CURRICULUM.games.find(g => g.id === gameId);
  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 32px 60px" }}>
        <Breadcrumb trail={[{ to: "/", label: "Beranda" }, { to: "/gim", label: "Gim Edukasi" }, { label: title }]}/>
        {(() => { const ref = sessionStorage.getItem("sigma_lab_referrer"); if (!ref?.includes("/modul/")) return null; const mod = window.CURRICULUM?.modules?.find(m => m.id === (ref.split("/modul/")[1]||"").split("?")[0]); return <button onClick={() => { sessionStorage.removeItem("sigma_lab_referrer"); navigate(ref); }} style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:12,background:"var(--gold-300)",border:"2px solid var(--ink)",fontWeight:800,fontSize:14,cursor:"pointer",marginBottom:20,color:"var(--navy-950)" }}>← Kembali ke {mod ? mod.title : "Pelajaran"}</button>; })()}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 12, marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className={`tag ${subj.tagClass}`} style={{ marginBottom: 8 }}>GIM EDUKASI</div>
            <h1 className="display" style={{ fontSize: 36, margin: 0 }}>{title}</h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {stats.map((s, i) => (
              <div key={i} style={{ padding: "8px 14px", background: "white", border: "1.5px solid var(--line)", borderRadius: 12, minWidth: 80, textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--ink-subtle)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color || "var(--navy-950)" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
        {children}
      </div>
      <Footer/>
    </div>
  );
};

const GameEndScreen = ({ gameId, correct, total, time, xp, extra }) => {
  const game = window.CURRICULUM.games.find(g => g.id === gameId);
  const subj = window.CURRICULUM.subjects[game.subject];
  const [xpSaved, setXpSaved] = useState(null);

  useEffect(() => {
    if (!window.SIGMA_AUTH?.completeGame) return;
    const before = window.USER.xp || 0;
    window.SIGMA_AUTH.completeGame(gameId, xp);
    setXpSaved(Math.max(0, (window.USER.xp || 0) - before));
  }, []);

  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "60px 32px" }}>
        <div className="card" style={{ padding: 40, background: "linear-gradient(135deg, var(--gold-300), white)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "var(--gold-400)", opacity: 0.3 }}/>
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 140, height: 140, borderRadius: "50%", background: "var(--ai-300)", opacity: 0.25 }}/>
          <div style={{ fontSize: 72, marginBottom: 10 }}>🎉</div>
          <div className="display" style={{ fontSize: 38, margin: "0 0 10px", color: "var(--navy-950)" }}>Selesai!</div>
          <div style={{ fontSize: 16, color: "var(--ink-muted)", marginBottom: 24 }}>{game.title}</div>

          <div style={{ display: "grid", gridTemplateColumns: time !== undefined ? "1fr 1fr 1fr" : "1fr 1fr", gap: 10, marginBottom: 24 }}>
            <ResultStat label="Skor" value={`${correct}/${total}`} color="var(--navy-950)"/>
            {time !== undefined && <ResultStat label="Waktu" value={`${time}s`} color="var(--orange-500)"/>}
            <ResultStat label="XP Diraih" value={`+${xp}`} color="var(--gold-500)"/>
          </div>

          {xpSaved !== null && (
            <div style={{ padding: "10px 16px", background: xpSaved > 0 ? "#D1FAE5" : "var(--bg-cream)", borderRadius: 10, fontSize: 13, fontWeight: 800, color: xpSaved > 0 ? "var(--green-500)" : "var(--orange-500)", marginBottom: 14, border: `1.5px solid ${xpSaved > 0 ? "var(--green-500)" : "var(--gold-400)"}` }}>
              {xpSaved > 0 ? `+${xpSaved} XP masuk ke total XP kamu` : "Tersimpan. XP belum bertambah karena skor terbaik tantangan belum naik."}
            </div>
          )}

          {extra && <div style={{ padding: "10px 16px", background: "white", borderRadius: 10, fontSize: 14, fontWeight: 700, color: "var(--navy-950)", marginBottom: 24, border: "1.5px solid var(--line)" }}>{extra}</div>}

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              <Icon.Refresh width="14" height="14"/> Main Lagi
            </button>
            <Link to="/gim" className="btn">Gim Lain <Icon.ArrowRight width="14" height="14"/></Link>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

const ResultStat = ({ label, value, color }) => (
  <div style={{ padding: 14, background: "white", borderRadius: 10, border: "1.5px solid var(--line)" }}>
    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-subtle)", marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
  </div>
);

window.GameShell = GameShell;
window.GameEndScreen = GameEndScreen;
