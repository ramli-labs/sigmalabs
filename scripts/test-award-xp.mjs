// ============================================
// Tes end-to-end award-xp + trigger sigma_guard_xp.
// Memakai akun siswa COBA (bukan siswa asli) — tes ini menulis XP.
//
// Jalankan:
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... \
//   TEST_EMAIL=... TEST_PASSWORD=... node scripts/test-award-xp.mjs
//
// URL & anon key default diambil dari nilai publik di repo bila tak diset.
// ============================================

const URL = process.env.SUPABASE_URL || "https://dibzkjwyupbddihdosbi.supabase.co";
const ANON = process.env.SUPABASE_ANON_KEY || "";
const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;

if (!ANON || !EMAIL || !PASSWORD) {
  console.error("Wajib set SUPABASE_ANON_KEY, TEST_EMAIL, TEST_PASSWORD.");
  process.exit(1);
}

const h = (token) => ({
  "apikey": ANON,
  "Authorization": `Bearer ${token}`,
  "Content-Type": "application/json",
});

let pass = 0, fail = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "✅" : "❌"} ${name}${detail ? "  — " + detail : ""}`);
  ok ? pass++ : fail++;
};

async function signIn() {
  const res = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "apikey": ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error("Login gagal: " + (j.error_description || j.msg || JSON.stringify(j)));
  return { token: j.access_token, userId: j.user.id };
}

async function getProfileRow(token, userId) {
  const res = await fetch(`${URL}/rest/v1/sigma_profiles?user_id=eq.${userId}&select=data`, { headers: h(token) });
  const j = await res.json();
  return Array.isArray(j) && j.length ? j[0] : null;
}

async function getXp(token, userId) {
  const row = await getProfileRow(token, userId);
  return Number(row?.data?.xp || 0);
}

// Buat row profil untuk akun coba bila belum ada (siswa boleh insert row sendiri via RLS).
async function ensureProfile(token, userId) {
  if (await getProfileRow(token, userId)) return;
  const blob = {
    id: userId, user_id: userId, role: "student",
    name: "Siswa Coba", nickname: "Coba", level: 7, class: "7A",
    xp: 0, streak: 1, badges: [], progress: {}, quests: {},
    quizzes: {}, reflections: {}, gameScores: {}, completedLabs: [], completedGames: [],
  };
  const res = await fetch(`${URL}/rest/v1/sigma_profiles`, {
    method: "POST",
    headers: { ...h(token), "Prefer": "return=minimal" },
    body: JSON.stringify({
      user_id: userId, role: "student", name: "Siswa Coba", nickname: "Coba",
      level: 7, class_name: "7A", data: blob, updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) throw new Error("Gagal membuat profil coba: " + (await res.text()));
}

async function award(token, body) {
  const res = await fetch(`${URL}/functions/v1/award-xp`, { method: "POST", headers: h(token), body: JSON.stringify(body) });
  return { ok: res.ok, json: await res.json() };
}

async function tryForge(token, userId, fakeXp) {
  // Coba paksa naik xp lewat REST (jalur yang seharusnya diblokir trigger).
  const res = await fetch(`${URL}/rest/v1/sigma_profiles?user_id=eq.${userId}`, {
    method: "PATCH",
    headers: { ...h(token), "Prefer": "return=minimal" },
    body: JSON.stringify({ data: { xp: fakeXp } }),
  });
  return res.ok;
}

(async () => {
  console.log(`Project: ${URL}\nAkun coba: ${EMAIL}\n`);
  const { token, userId } = await signIn();
  check("Login siswa coba", !!token, userId);

  await ensureProfile(token, userId);
  check("Profil coba tersedia", !!(await getProfileRow(token, userId)));

  const xp0 = await getXp(token, userId);
  console.log(`XP awal: ${xp0}\n`);

  // 1) Lab: +50 sekali
  const lab = await award(token, { action: "lab", labId: "sorting" });
  check("award lab", lab.ok, lab.json.error || JSON.stringify(lab.json.result));
  const xpLab = await getXp(token, userId);
  check("XP naik setelah lab (+50 idempoten)", xpLab >= xp0, `${xp0} -> ${xpLab}`);

  // 2) Lab lagi (idempoten — tidak boleh nambah)
  await award(token, { action: "lab", labId: "sorting" });
  const xpLab2 = await getXp(token, userId);
  check("Lab sama tidak menambah XP lagi", xpLab2 === xpLab, `${xpLab} -> ${xpLab2}`);

  // 3) Game (dibatasi GAME_XP_MAX)
  const game = await award(token, { action: "game", gameId: "bug-hunter", xp: 999999 });
  check("award game (xp dibatasi)", game.ok, game.json.error || JSON.stringify(game.json.result));

  // 4) Trigger: coba palsukan XP via REST → harus TIDAK naik
  const xpBeforeForge = await getXp(token, userId);
  await tryForge(token, userId, xpBeforeForge + 100000);
  const xpAfterForge = await getXp(token, userId);
  check("Trigger memblokir pemalsuan XP via REST", xpAfterForge <= xpBeforeForge,
    `coba set ${xpBeforeForge + 100000}, hasil ${xpAfterForge} (sebelum ${xpBeforeForge})`);

  console.log(`\nRingkasan: ${pass} lulus, ${fail} gagal.`);
  if (fail) process.exit(1);
})().catch(e => { console.error("ERROR:", e.message); process.exit(1); });
