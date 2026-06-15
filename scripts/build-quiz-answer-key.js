// ============================================
// Generator kunci jawaban kuis untuk server.
// Sumber tunggal: js/data/quiz-bank-v2.js (yang juga dipakai klien).
// Output: supabase/functions/_shared/quiz-answer-key.json
//
// Format: { [moduleId]: { [teksSoal]: { a: teksOpsiBenar, e: penjelasan } } }
// Edge Function award-xp menilai jawaban siswa dengan mencocokkan teks opsi
// yang dipilih ke teks opsi benar (tahan pengacakan opsi di klien), dan
// mengembalikan penjelasan untuk layar review setelah submit.
//
// Jalankan ulang setiap kali quiz-bank-v2.js berubah:
//   node scripts/build-quiz-answer-key.js
// ============================================
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const bankFile = path.join(root, "js", "data", "quiz-bank-v2.js");
const outDir = path.join(root, "supabase", "functions", "_shared");
const outFile = path.join(outDir, "quiz-answer-key.json");

// Eksekusi bank dalam sandbox dengan stub `window` agar QUIZ_BANK_V2
// terisi penuh (termasuk modul yang dibangkitkan di bagian akhir file).
const source = fs.readFileSync(bankFile, "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: "quiz-bank-v2.js" });

const bank = sandbox.window.QUIZ_BANK_V2;
if (!bank || typeof bank !== "object") {
  console.error("Gagal membaca window.QUIZ_BANK_V2 dari bank soal.");
  process.exit(1);
}

const key = {};
let moduleCount = 0;
let questionCount = 0;

for (const [moduleId, questions] of Object.entries(bank)) {
  if (!Array.isArray(questions) || !questions.length) continue;
  const map = {};
  for (const q of questions) {
    if (!q || typeof q.q !== "string" || !Array.isArray(q.options)) continue;
    const correctText = q.options[q.correct];
    if (typeof correctText !== "string") continue;
    map[q.q] = { a: correctText, e: typeof q.explain === "string" ? q.explain : "" };
    questionCount++;
  }
  if (Object.keys(map).length) {
    key[moduleId] = map;
    moduleCount++;
  }
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(key) + "\n");
console.log(`Kunci jawaban: ${moduleCount} modul, ${questionCount} soal -> ${path.relative(root, outFile)}`);
