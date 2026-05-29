// ============================================
// Playground — Python-like interpreter + challenges
// ============================================

// --- shared globals ---
const { Icon, Navbar, Footer, Link, useRoute, navigate, SectionHeader, Breadcrumb, EmptyState, ModuleCard, LabschoolLogo, BrandStrip, ControlField } = window;
const { useState, useEffect, useRef } = React;

const Playground = () => {
  const challenges = [
    {
      id: "hello",
      title: "Hello, World!",
      description: "Cetak pesan \"Halo SIGMA!\" ke layar.",
      starter: `# Tulis kode Python di sini\nprint("Halo SIGMA!")`,
      check: (output) => output.trim().includes("Halo SIGMA"),
      hint: "Pakai perintah print() dengan teks di dalam tanda kutip.",
    },
    {
      id: "average",
      title: "Rata-rata Nilai",
      description: "Hitung rata-rata dari daftar nilai: [85, 92, 78, 90, 88].",
      starter: `nilai = [85, 92, 78, 90, 88]\n\n# Hitung rata-rata\ntotal = sum(nilai)\nrata = total / len(nilai)\nprint("Rata-rata:", rata)`,
      check: (output) => output.includes("86.6") || output.includes("86,6"),
      hint: "Jumlahkan semua nilai, lalu bagi dengan banyaknya nilai.",
    },
    {
      id: "genap-ganjil",
      title: "Genap atau Ganjil",
      description: "Buat fungsi yang cetak \"genap\" atau \"ganjil\" untuk angka 15.",
      starter: `angka = 15\n\nif angka % 2 == 0:\n    print("genap")\nelse:\n    print("ganjil")`,
      check: (output) => output.trim().toLowerCase() === "ganjil",
      hint: "Gunakan operator modulo (%) untuk cek sisa bagi 2.",
    },
    {
      id: "loop",
      title: "Perulangan",
      description: "Cetak angka 1 sampai 5 menggunakan perulangan.",
      starter: `for i in range(1, 6):\n    print(i)`,
      check: (output) => {
        const lines = output.trim().split("\n");
        return lines.length >= 5 && lines[0] === "1" && lines[4] === "5";
      },
      hint: "Pakai `for i in range(1, 6)`.",
    },
    {
      id: "fizzbuzz",
      title: "FizzBuzz",
      description: "Cetak 1-10. Kelipatan 3 ganti \"Fizz\", kelipatan 5 ganti \"Buzz\", kelipatan 3 dan 5 ganti \"FizzBuzz\".",
      starter: `for i in range(1, 11):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)`,
      check: (output) => output.includes("Fizz") && output.includes("Buzz") && output.includes("FizzBuzz"),
      hint: "Cek kelipatan 15 dulu, baru 3 dan 5 masing-masing.",
    },
  ];

  const [currentChallengeId, setCurrentChallengeId] = useState(challenges[0].id);
  const challenge = challenges.find(c => c.id === currentChallengeId);
  const [code, setCode] = useState(challenge.starter);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [passed, setPassed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setCode(challenge.starter);
    setOutput("");
    setPassed(false);
    setShowHint(false);
  }, [currentChallengeId]);

  const run = async () => {
    setRunning(true);
    setOutput("⏳ Menjalankan...\n");
    setPassed(false);
    await new Promise(r => setTimeout(r, 400));
    const result = pythonEval(code);
    setOutput(result.output + (result.error ? `\n❌ Error: ${result.error}` : `\n\n✓ Selesai`));
    if (!result.error && challenge.check(result.output)) {
      setPassed(true);
    }
    setRunning(false);
  };

  return (
    <div className="page" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar/>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 32px 60px" }}>
        <Breadcrumb trail={[{ to: "/", label: "Beranda" }, { label: "Playground" }]}/>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 12, marginBottom: 20, gap: 20, flexWrap: "wrap" }}>
          <div>
            <h1 className="display" style={{ fontSize: 40, margin: 0, color: "var(--navy-950)" }}>
              Playground <span style={{ color: "var(--info-500)" }}>Koding</span>
            </h1>
            <p style={{ color: "var(--ink-muted)", marginTop: 8, fontSize: 15, maxWidth: 560 }}>
              Tulis & jalankan kode Python (simulator) — lengkap dengan tantangan bertingkat dari SIGMA.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-subtle)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Bahasa:</span>
            <div style={{ display: "inline-flex", gap: 4, padding: 4, background: "white", border: "1.5px solid var(--line)", borderRadius: "var(--r-full)" }}>
              <button style={{ padding: "6px 14px", background: "var(--info-400)", color: "var(--navy-950)", borderRadius: "var(--r-full)", fontWeight: 700, fontSize: 13 }}>
                🐍 Python
              </button>
              <button style={{ padding: "6px 14px", color: "var(--ink-muted)", fontWeight: 600, fontSize: 13, opacity: 0.5, cursor: "not-allowed" }} disabled>
                JS (soon)
              </button>
            </div>
          </div>
        </div>

        <div className="playground-grid" style={{ display: "grid", gridTemplateColumns: "260px 1fr 340px", gap: 16, height: 600 }}>
          {/* Challenges list */}
          <div className="card" style={{ padding: 16, background: "white", overflowY: "auto" }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", color: "var(--ink-subtle)", textTransform: "uppercase", marginBottom: 10 }}>Tantangan</div>
            {challenges.map((c, i) => (
              <button key={c.id} onClick={() => setCurrentChallengeId(c.id)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "10px 12px", borderRadius: 10, marginBottom: 4,
                background: c.id === currentChallengeId ? "var(--info-100)" : "transparent",
                border: c.id === currentChallengeId ? "1.5px solid var(--info-400)" : "1.5px solid transparent",
                textAlign: "left", cursor: "pointer",
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: c.id === currentChallengeId ? "var(--info-500)" : "var(--line)",
                  color: c.id === currentChallengeId ? "white" : "var(--ink-muted)",
                  fontWeight: 800, fontSize: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{i + 1}</div>
                <div style={{ fontSize: 13, fontWeight: c.id === currentChallengeId ? 700 : 500 }}>{c.title}</div>
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="card" style={{ padding: 0, background: "var(--navy-950)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56" }}/>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }}/>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f" }}/>
              </div>
              <div style={{ marginLeft: 12, fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                solusi.py
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button className="btn btn-sm" onClick={() => { setCode(challenge.starter); setOutput(""); }}
                  style={{ background: "rgba(255,255,255,0.08)", color: "white", borderColor: "transparent", boxShadow: "none" }}>
                  <Icon.Refresh width="13" height="13"/> Reset
                </button>
                <button className="btn btn-sm btn-primary" onClick={run} disabled={running}>
                  <Icon.Play width="13" height="13"/> {running ? "Running..." : "Run"}
                </button>
              </div>
            </div>
            <textarea
              value={code} onChange={e => setCode(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1, padding: "18px 22px",
                background: "transparent", color: "#E6E9F2",
                fontFamily: "var(--font-mono)", fontSize: 14, lineHeight: 1.7,
                border: "none", outline: "none", resize: "none",
                width: "100%",
              }}
            />
            {/* Output */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.3)", padding: "14px 22px", minHeight: 120, maxHeight: 200, overflow: "auto" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 6 }}>Output</div>
              <pre style={{ margin: 0, color: "#E6E9F2", fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{output || "(kosong — tekan Run)"}</pre>
            </div>
          </div>

          {/* Challenge panel */}
          <div className="card" style={{ padding: 20, background: "white", overflowY: "auto" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "var(--info-500)", textTransform: "uppercase", marginBottom: 6 }}>Tantangan aktif</div>
            <h3 className="display" style={{ fontSize: 22, margin: "0 0 10px" }}>{challenge.title}</h3>
            <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 20, lineHeight: 1.55 }}>
              {challenge.description}
            </p>

            {passed && (
              <div style={{ padding: "16px 18px", background: "#D1FAE5", border: "2px solid var(--green-500)", borderRadius: 14, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, color: "var(--green-500)", marginBottom: 4 }}>
                  <Icon.Check width="18" height="18"/> Selesai!
                </div>
                <div style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.5 }}>+{50} XP — mantap! Lanjut ke tantangan berikutnya.</div>
              </div>
            )}

            <button className="btn btn-sm" onClick={() => setShowHint(!showHint)} style={{ width: "100%", justifyContent: "center" }}>
              💡 {showHint ? "Sembunyikan Hint" : "Lihat Hint"}
            </button>
            {showHint && (
              <div style={{ marginTop: 10, padding: "12px 14px", background: "var(--gold-300)", borderRadius: 12, fontSize: 13, lineHeight: 1.5 }}>
                {challenge.hint}
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "var(--ink-subtle)", textTransform: "uppercase", marginBottom: 10 }}>Reference</div>
              <div style={{ padding: 12, background: "var(--bg)", borderRadius: 10, fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.6, fontFamily: "var(--font-mono)" }}>
                <div><span style={{ color: "var(--ai-500)", fontWeight: 700 }}>print(x)</span> — cetak x</div>
                <div><span style={{ color: "var(--ai-500)", fontWeight: 700 }}>for i in range(n)</span> — loop</div>
                <div><span style={{ color: "var(--ai-500)", fontWeight: 700 }}>if x == y</span> — kondisi</div>
                <div><span style={{ color: "var(--ai-500)", fontWeight: 700 }}>len(x)</span> — panjang list</div>
                <div><span style={{ color: "var(--ai-500)", fontWeight: 700 }}>sum(x)</span> — jumlahkan</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, padding: "16px 22px", background: "var(--bg-cream)", borderRadius: 14, fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5 }}>
          ℹ️ <strong>Catatan:</strong> Playground ini simulator edukasi sederhana — mendukung <code style={{ background: "white", padding: "1px 6px", borderRadius: 4, fontFamily: "var(--font-mono)" }}>print</code>, aritmatika, <code style={{ background: "white", padding: "1px 6px", borderRadius: 4, fontFamily: "var(--font-mono)" }}>for range</code>, <code style={{ background: "white", padding: "1px 6px", borderRadius: 4, fontFamily: "var(--font-mono)" }}>if/else</code>, list, dan <code style={{ background: "white", padding: "1px 6px", borderRadius: 4, fontFamily: "var(--font-mono)" }}>sum()</code>/<code style={{ background: "white", padding: "1px 6px", borderRadius: 4, fontFamily: "var(--font-mono)" }}>len()</code>. Untuk Python penuh, gunakan IDE seperti Thonny atau Replit.
        </div>
      </div>
      <Footer/>
    </div>
  );
};

// ---------- Python Evaluator (educational subset) ----------
function pythonEval(code) {
  const lines = code.split("\n");
  const env = {};
  const out = [];
  let error = null;

  // Two-pass: first flatten into statements with indent tracking
  function parseStmts(lines, startIdx, baseIndent) {
    const stmts = [];
    let i = startIdx;
    while (i < lines.length) {
      const raw = lines[i];
      if (raw.trim() === "" || raw.trim().startsWith("#")) { i++; continue; }
      const indent = raw.match(/^ */)[0].length;
      if (indent < baseIndent) break;
      if (indent > baseIndent) { i++; continue; }
      stmts.push({ line: raw.trim(), idx: i });
      i++;
    }
    return { stmts, endIdx: i };
  }

  function getBlock(fromIdx, baseIndent) {
    const block = [];
    let i = fromIdx;
    while (i < lines.length) {
      const raw = lines[i];
      if (raw.trim() === "") { block.push(raw); i++; continue; }
      const indent = raw.match(/^ */)[0].length;
      if (indent <= baseIndent) break;
      block.push(raw);
      i++;
    }
    return { block, endIdx: i };
  }

  function evalExpr(expr, env) {
    expr = expr.trim();
    if (expr === "") return undefined;
    // String
    const strMatch = expr.match(/^["'](.*)["']$/);
    if (strMatch) return strMatch[1];
    // Number
    if (/^-?\d+(\.\d+)?$/.test(expr)) return parseFloat(expr);
    // Boolean
    if (expr === "True") return true;
    if (expr === "False") return false;
    if (expr === "None") return null;
    // List
    if (expr.startsWith("[") && expr.endsWith("]")) {
      const inner = expr.slice(1, -1).trim();
      if (!inner) return [];
      return splitArgs(inner).map(x => evalExpr(x, env));
    }
    // Function calls
    const fnMatch = expr.match(/^(\w+)\((.*)\)$/);
    if (fnMatch) {
      const fn = fnMatch[1];
      const argsStr = fnMatch[2];
      const args = argsStr.trim() === "" ? [] : splitArgs(argsStr).map(a => evalExpr(a, env));
      if (fn === "len") return args[0]?.length ?? 0;
      if (fn === "sum") return (args[0] || []).reduce((a, b) => a + b, 0);
      if (fn === "max") return Math.max(...(args[0] || []));
      if (fn === "min") return Math.min(...(args[0] || []));
      if (fn === "range") {
        const [a, b, c] = args;
        if (b === undefined) return Array.from({ length: a }, (_, i) => i);
        if (c === undefined) return Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);
        const r = [];
        if (c > 0) for (let i = a; i < b; i += c) r.push(i);
        else for (let i = a; i > b; i += c) r.push(i);
        return r;
      }
      if (fn === "str") return String(args[0]);
      if (fn === "int") return parseInt(args[0]);
      if (fn === "float") return parseFloat(args[0]);
      throw new Error(`Fungsi ${fn}() belum didukung di simulator`);
    }
    // Operators (very basic left-to-right)
    const ops = ["==", "!=", "<=", ">=", "<", ">", "+", "-", "*", "/", "%", "//"];
    for (const op of ops) {
      const i = findOpIdx(expr, op);
      if (i > 0) {
        const left = evalExpr(expr.slice(0, i), env);
        const right = evalExpr(expr.slice(i + op.length), env);
        switch (op) {
          case "==": return left === right || String(left) === String(right);
          case "!=": return left !== right;
          case "<=": return left <= right;
          case ">=": return left >= right;
          case "<": return left < right;
          case ">": return left > right;
          case "+": return typeof left === "string" || typeof right === "string" ? String(left) + String(right) : left + right;
          case "-": return left - right;
          case "*": return left * right;
          case "/": return left / right;
          case "%": return left % right;
          case "//": return Math.floor(left / right);
        }
      }
    }
    // Variable
    if (/^\w+$/.test(expr)) {
      if (expr in env) return env[expr];
      throw new Error(`Variabel '${expr}' belum didefinisikan`);
    }
    // Indexing: arr[i]
    const idxMatch = expr.match(/^(\w+)\[(.+)\]$/);
    if (idxMatch) {
      const arr = env[idxMatch[1]];
      const idx = evalExpr(idxMatch[2], env);
      return arr?.[idx];
    }
    // f-string basic
    const fMatch = expr.match(/^f["'](.*)["']$/);
    if (fMatch) {
      return fMatch[1].replace(/\{([^}]+)\}/g, (_, e) => String(evalExpr(e, env)));
    }
    // Parenthesized
    if (expr.startsWith("(") && expr.endsWith(")")) return evalExpr(expr.slice(1, -1), env);
    throw new Error(`Tidak bisa evaluasi: ${expr}`);
  }

  function findOpIdx(expr, op) {
    // Find op outside parens/strings/brackets
    let depth = 0, inStr = false, strCh = "";
    for (let i = 0; i <= expr.length - op.length; i++) {
      const c = expr[i];
      if (inStr) {
        if (c === strCh) inStr = false;
        continue;
      }
      if (c === "'" || c === '"') { inStr = true; strCh = c; continue; }
      if (c === "(" || c === "[") depth++;
      else if (c === ")" || c === "]") depth--;
      if (depth === 0 && expr.slice(i, i + op.length) === op) {
        // Don't match - in middle of identifier
        if (op === "-" && i > 0 && /[+\-*/%=<>(,\s]/.test(expr[i - 1]) === false) continue;
        // Skip -> as part of longer op
        if (op === "<" && expr[i + 1] === "=") continue;
        if (op === ">" && expr[i + 1] === "=") continue;
        if (op === "=" && expr[i + 1] === "=") continue;
        if (op === "/" && expr[i + 1] === "/") continue;
        if (op === "!" && expr[i + 1] === "=") continue;
        return i;
      }
    }
    return -1;
  }

  function splitArgs(s) {
    const out = [];
    let depth = 0, cur = "", inStr = false, strCh = "";
    for (const c of s) {
      if (inStr) {
        cur += c;
        if (c === strCh) inStr = false;
        continue;
      }
      if (c === "'" || c === '"') { inStr = true; strCh = c; cur += c; continue; }
      if (c === "(" || c === "[") { depth++; cur += c; continue; }
      if (c === ")" || c === "]") { depth--; cur += c; continue; }
      if (c === "," && depth === 0) { out.push(cur); cur = ""; continue; }
      cur += c;
    }
    if (cur.trim()) out.push(cur);
    return out.map(x => x.trim());
  }

  function exec(lines, env, startIdx = 0, baseIndent = 0) {
    let i = startIdx;
    while (i < lines.length) {
      const raw = lines[i];
      if (raw.trim() === "" || raw.trim().startsWith("#")) { i++; continue; }
      const indent = raw.match(/^ */)[0].length;
      if (indent < baseIndent) return i;
      const line = raw.trim();

      // print
      if (line.startsWith("print(") && line.endsWith(")")) {
        const args = splitArgs(line.slice(6, -1));
        const parts = args.map(a => {
          const v = evalExpr(a, env);
          return v === null ? "None" : v === true ? "True" : v === false ? "False" : String(v);
        });
        out.push(parts.join(" "));
        i++; continue;
      }

      // assignment
      const asgn = line.match(/^(\w+)\s*=\s*(.+)$/);
      if (asgn && !line.startsWith("if") && !line.startsWith("elif") && !line.startsWith("while") && !line.startsWith("for")) {
        env[asgn[1]] = evalExpr(asgn[2], env);
        i++; continue;
      }
      // augmented
      const aug = line.match(/^(\w+)\s*([+\-*/%])=\s*(.+)$/);
      if (aug) {
        const v = evalExpr(aug[3], env);
        if (aug[2] === "+") env[aug[1]] = env[aug[1]] + v;
        else if (aug[2] === "-") env[aug[1]] = env[aug[1]] - v;
        else if (aug[2] === "*") env[aug[1]] = env[aug[1]] * v;
        else if (aug[2] === "/") env[aug[1]] = env[aug[1]] / v;
        else if (aug[2] === "%") env[aug[1]] = env[aug[1]] % v;
        i++; continue;
      }

      // for
      const forM = line.match(/^for\s+(\w+)\s+in\s+(.+):$/);
      if (forM) {
        const iter = evalExpr(forM[2], env);
        const bodyStart = i + 1;
        const { block } = getBlock(bodyStart, indent);
        for (const item of iter) {
          env[forM[1]] = item;
          exec(block, env, 0, 0);
        }
        i = bodyStart + block.length;
        continue;
      }

      // if / elif / else chain
      if (line.match(/^if\s+.+:$/)) {
        let cond = evalExpr(line.slice(3, -1), env);
        let matched = false;
        let j = i;
        if (cond) {
          matched = true;
          const { block, endIdx } = getBlock(j + 1, indent);
          exec(block, env, 0, 0);
          j = endIdx;
        } else {
          const { endIdx } = getBlock(j + 1, indent);
          j = endIdx;
        }
        // check elif/else
        while (j < lines.length) {
          const nextRaw = lines[j];
          if (nextRaw.trim() === "") { j++; continue; }
          const nextIndent = nextRaw.match(/^ */)[0].length;
          if (nextIndent !== indent) break;
          const nl = nextRaw.trim();
          const elifM = nl.match(/^elif\s+(.+):$/);
          if (elifM) {
            if (!matched && evalExpr(elifM[1], env)) {
              matched = true;
              const { block, endIdx } = getBlock(j + 1, indent);
              exec(block, env, 0, 0);
              j = endIdx;
            } else {
              const { endIdx } = getBlock(j + 1, indent);
              j = endIdx;
            }
            continue;
          }
          if (nl === "else:") {
            if (!matched) {
              const { block, endIdx } = getBlock(j + 1, indent);
              exec(block, env, 0, 0);
              j = endIdx;
            } else {
              const { endIdx } = getBlock(j + 1, indent);
              j = endIdx;
            }
            break;
          }
          break;
        }
        i = j;
        continue;
      }

      // while (bounded)
      const whM = line.match(/^while\s+(.+):$/);
      if (whM) {
        const { block } = getBlock(i + 1, indent);
        let guard = 0;
        while (evalExpr(whM[1], env)) {
          if (guard++ > 10000) throw new Error("Loop terlalu panjang (max 10000 iterasi)");
          exec(block, env, 0, 0);
        }
        i = i + 1 + block.length;
        continue;
      }

      throw new Error(`Baris tidak dimengerti: "${line}"`);
    }
    return i;
  }

  try {
    exec(lines, env, 0, 0);
  } catch (e) {
    error = e.message;
  }
  return { output: out.join("\n"), error };
}

window.Playground = Playground;
