// ============================================
// Generator bank soal PUBLIK untuk browser — TANPA kunci jawaban.
// Sumber tunggal: js/data/quiz-bank-v2.js (berisi jawaban; TIDAK dikirim ke browser).
// Output: js/data/quiz-bank-public.js  (window.QUIZ_BANK_V2 = soal tanpa correct/explain)
//
// index.html memuat file PUBLIK ini, bukan sumbernya. Penilaian & penjelasan
// dilakukan server (Edge Function award-xp), sehingga siswa tidak bisa
// mengintip kunci jawaban dari source browser.
//
// Jalankan ulang setiap kali quiz-bank-v2.js berubah:
//   node scripts/build-public-quiz-bank.js
// ============================================
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const bankFile = path.join(root, "js", "data", "quiz-bank-v2.js");
const outFile = path.join(root, "js", "data", "quiz-bank-public.js");

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(bankFile, "utf8"), sandbox, { filename: "quiz-bank-v2.js" });

const bank = sandbox.window.QUIZ_BANK_V2;
if (!bank || typeof bank !== "object") {
  console.error("Gagal membaca window.QUIZ_BANK_V2 dari bank soal.");
  process.exit(1);
}

const pub = {};
let moduleCount = 0, questionCount = 0;
for (const [moduleId, questions] of Object.entries(bank)) {
  if (!Array.isArray(questions) || !questions.length) continue;
  pub[moduleId] = questions
    .filter(q => q && typeof q.q === "string" && Array.isArray(q.options))
    .map(q => ({ difficulty: q.difficulty || "Sedang", q: q.q, options: q.options }));
  moduleCount++;
  questionCount += pub[moduleId].length;
}

const banner = "// DIBUAT OTOMATIS oleh scripts/build-public-quiz-bank.js — JANGAN diedit manual.\n"
  + "// Bank soal tanpa kunci jawaban (kunci ada di server). Edit sumbernya: js/data/quiz-bank-v2.js\n";
fs.writeFileSync(outFile, banner + "window.QUIZ_BANK_V2 = " + JSON.stringify(pub) + ";\n");
console.log(`Bank publik (tanpa kunci): ${moduleCount} modul, ${questionCount} soal -> ${path.relative(root, outFile)}`);
