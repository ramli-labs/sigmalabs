// ============================================
// Generator data kurikulum ringkas untuk server (Edge Function award-xp).
// Sumber tunggal: js/data/curriculum.js (yang juga dipakai klien).
// Output: supabase/functions/_shared/curriculum.json
//   { modules: { [id]: { lessons, xp } }, labs: [id...], games: [id...] }
//
// Jalankan ulang setiap kali curriculum.js berubah:
//   node scripts/build-curriculum-data.js
// ============================================
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const curFile = path.join(root, "js", "data", "curriculum.js");
const outDir = path.join(root, "supabase", "functions", "_shared");
const outFile = path.join(outDir, "curriculum.json");

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(curFile, "utf8"), sandbox, { filename: "curriculum.js" });

const C = sandbox.window.CURRICULUM;
if (!C || !Array.isArray(C.modules)) {
  console.error("Gagal membaca window.CURRICULUM dari curriculum.js");
  process.exit(1);
}

const modules = {};
for (const m of C.modules) {
  modules[m.id] = { lessons: Number(m.lessons || 0), xp: Number(m.xp || 0) };
}
const labs = (C.labs || []).map((l) => l.id);
const games = (C.games || []).map((g) => g.id);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify({ modules, labs, games }) + "\n");
console.log(`Data kurikulum: ${Object.keys(modules).length} modul, ${labs.length} lab, ${games.length} gim -> ${path.relative(root, outFile)}`);
