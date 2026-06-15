// ============================================
// SIGMA Edge Function: award-xp
// Penentu XP otoritatif. Siswa mengirim hasil aktivitas; server menilai
// (kuis dinilai dari kunci jawaban server), menghitung XP dengan formula
// kanonik, lalu menulis via service-role. Trigger DB (sigma_guard_xp)
// memastikan hanya jalur ini yang boleh menaikkan xp.
//
// Catatan: formula di sini HARUS sama dengan js/data/session.js.
// ============================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import answerKey from "../_shared/quiz-answer-key.json" with { type: "json" };
import curriculum from "../_shared/curriculum.json" with { type: "json" };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Batas atas XP gim per pemberian — gim tidak punya skor terverifikasi server,
// jadi nilai yang diklaim klien dibatasi agar tidak bisa diisi sembarangan.
const GAME_XP_MAX = 150;
const LAB_XP = 50;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

function questXp(score: number): number {
  if (score >= 100) return 35;
  if (score >= 80) return 25;
  if (score >= 50) return 15;
  return 10;
}

function hasBadge(data: any, id: string): boolean {
  return Array.isArray(data.badges) && data.badges.some((b: any) => b && b.id === id);
}
function addBadge(data: any, badge: any) {
  data.badges = Array.isArray(data.badges) ? data.badges : [];
  if (!hasBadge(data, badge.id)) data.badges.push(badge);
}

function awardModuleCompletion(data: any, moduleId: string) {
  const mod = (curriculum as any).modules[moduleId];
  if (!mod) return;
  const lessons = Number(mod.lessons || 0);
  data.progress = data.progress || {};
  data.progress[moduleId] = data.progress[moduleId] || { lessonsDone: lessons, total: lessons, percent: 100 };
  const maxQuestXp = lessons * 35;
  const targetXp = Math.max(80, Number(mod.xp || 0) - maxQuestXp);
  const alreadyAwarded = Number(data.progress[moduleId].moduleXpAwarded || 0);
  const xpDelta = Math.max(0, targetXp - alreadyAwarded);
  data.xp = Number(data.xp || 0) + xpDelta;
  data.progress[moduleId].moduleXpAwarded = Math.max(alreadyAwarded, targetXp);
  addBadge(data, { id: `complete-${moduleId}`, emoji: "🏅", label: `Tuntas ${moduleId}`, color: "var(--gold-400)" });
}

// ---- Penilai per aksi. Memodifikasi `data` di tempat, mengembalikan ringkasan. ----

function applyQuiz(data: any, body: any) {
  const moduleId = String(body.moduleId || "");
  const responses = Array.isArray(body.responses) ? body.responses : [];
  const key = (answerKey as any)[moduleId];
  if (!key) throw new Error(`Kunci jawaban modul ${moduleId} tidak ada di server.`);

  data.quizzes = data.quizzes || {};
  // Kuis hanya dinilai sekali (mengunci pengulangan), seperti session.js.
  if (data.quizzes[moduleId]) {
    data.quizzes[moduleId].locked = true;
    return { alreadyDone: true, ...data.quizzes[moduleId] };
  }

  const total = responses.length;
  let score = 0;
  for (const r of responses) {
    if (r && typeof r.q === "string" && key[r.q] !== undefined && r.selected === key[r.q]) score++;
  }
  const percent = total ? Math.round((score / total) * 100) : 0;
  const targetXp = Math.max(0, score * 2);
  data.xp = Number(data.xp || 0) + targetXp;
  data.quizzes[moduleId] = {
    attempts: 1,
    latestScore: score,
    latestTotal: total,
    latestPercent: percent,
    bestPercent: percent,
    bestFirstPercent: percent,
    bestRemedialPercent: 0,
    xpAwarded: targetXp,
    locked: true,
    updatedAt: new Date().toISOString(),
  };
  if (percent >= 80) {
    addBadge(data, { id: `quiz-${moduleId}`, emoji: "🧠", label: `Kuis ${moduleId}`, color: "var(--gold-400)" });
  }
  return { alreadyDone: false, score, total, percent, xpAwarded: targetXp };
}

function applyQuest(data: any, body: any) {
  const moduleId = String(body.moduleId || "");
  const lessonIndex = String(body.lessonIndex);
  const score = Math.max(0, Math.min(100, Number(body.score || 0)));
  const mod = (curriculum as any).modules[moduleId];

  data.quests = data.quests || {};
  data.quests[moduleId] = data.quests[moduleId] || {};
  const previous = data.quests[moduleId][lessonIndex] || null;
  const bestScore = Math.max(Number(previous?.bestScore || 0), score);
  const targetXp = questXp(bestScore);
  const alreadyAwarded = Number(previous?.xpAwarded || 0);
  const xpDelta = Math.max(0, targetXp - alreadyAwarded);
  data.xp = Number(data.xp || 0) + xpDelta;
  data.quests[moduleId][lessonIndex] = {
    completed: true,
    completedAt: previous?.completedAt || new Date().toISOString(),
    revisedAt: previous ? new Date().toISOString() : null,
    bestScore,
    xpAwarded: Math.max(alreadyAwarded, targetXp),
  };
  if (!previous) {
    const completedCount = Object.values(data.quests[moduleId]).filter((q: any) => q.completed).length;
    if (completedCount >= 3) {
      addBadge(data, { id: `quest-${moduleId}`, emoji: "🧭", label: `Misi ${moduleId}`, color: "var(--ai-400)" });
    }
  }
  if (mod && Number(data.progress?.[moduleId]?.lessonsDone || 0) >= Number(mod.lessons || 0)) {
    awardModuleCompletion(data, moduleId);
  }
  return { xpDelta };
}

function applyGame(data: any, body: any) {
  const gameId = String(body.gameId || "");
  if (!(curriculum as any).games.includes(gameId)) throw new Error(`Gim ${gameId} tidak dikenal.`);
  const claimed = Math.max(0, Math.min(GAME_XP_MAX, Number(body.xp || 0)));

  data.gameScores = data.gameScores || {};
  data.completedGames = Array.isArray(data.completedGames) ? data.completedGames : [];
  const previous = data.gameScores[gameId] || null;
  const bestXp = Math.max(Number(previous?.bestXp || 0), claimed);
  const alreadyAwarded = Number(previous?.xpAwarded || 0);
  const xpDelta = Math.max(0, bestXp - alreadyAwarded);
  data.xp = Number(data.xp || 0) + xpDelta;
  data.gameScores[gameId] = {
    bestXp,
    xpAwarded: Math.max(alreadyAwarded, bestXp),
    attempts: Number(previous?.attempts || 0) + 1,
    updatedAt: new Date().toISOString(),
  };
  if (!data.completedGames.includes(gameId)) data.completedGames.push(gameId);
  if (bestXp > 0) {
    addBadge(data, { id: `game-${gameId}`, emoji: "🎮", label: `Tantangan ${gameId}`, color: "var(--ai-400)" });
  }
  return { xpDelta, bestXp };
}

function applyLab(data: any, body: any) {
  const labId = String(body.labId || "");
  if (!(curriculum as any).labs.includes(labId)) throw new Error(`Lab ${labId} tidak dikenal.`);
  data.completedLabs = Array.isArray(data.completedLabs) ? data.completedLabs : [];
  if (data.completedLabs.includes(labId)) return { alreadyDone: true, xpDelta: 0 };
  data.completedLabs.push(labId);
  data.xp = Number(data.xp || 0) + LAB_XP;
  addBadge(data, { id: `lab-${labId}`, emoji: "🔬", label: `Lab ${labId}`, color: "var(--info-400)" });
  return { alreadyDone: false, xpDelta: LAB_XP };
}

function applyLesson(data: any, body: any) {
  const moduleId = String(body.moduleId || "");
  const mod = (curriculum as any).modules[moduleId];
  if (!mod) throw new Error(`Modul ${moduleId} tidak dikenal.`);
  const total = Number(mod.lessons || 0);
  data.progress = data.progress || {};
  const current = data.progress[moduleId] || { lessonsDone: 0, total, percent: 0 };
  const lessonIndex = body.lessonIndex;
  const targetDone = typeof lessonIndex === "number" ? lessonIndex + 1 : (current.lessonsDone || 0) + 1;
  const lessonsDone = Math.min(total, Math.max(current.lessonsDone || 0, targetDone));
  const completedLessons = [...new Set([...(current.completedLessons || []), ...(typeof lessonIndex === "number" ? [lessonIndex] : [])])];
  data.progress[moduleId] = {
    ...current,
    lessonsDone,
    total,
    percent: total ? Math.round((lessonsDone / total) * 100) : 0,
    completedLessons,
  };
  if (lessonsDone === total) awardModuleCompletion(data, moduleId);
  return { lessonsDone, total };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const admin = createClient(supabaseUrl, serviceKey);
    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authErr } = await caller.auth.getUser();
    if (authErr || !user) throw new Error("Sesi tidak valid, silakan login ulang.");

    const { data: row, error: loadErr } = await admin
      .from("sigma_profiles")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle();
    if (loadErr) throw new Error(`Gagal memuat profil: ${loadErr.message}`);
    if (!row) throw new Error("Profil SIGMA tidak ditemukan.");

    const data = (row.data && typeof row.data === "object") ? row.data : {};
    const body = await req.json();
    const action = String(body.action || "");

    let result: Record<string, unknown>;
    switch (action) {
      case "quiz": result = applyQuiz(data, body); break;
      case "quest": result = applyQuest(data, body); break;
      case "game": result = applyGame(data, body); break;
      case "lab": result = applyLab(data, body); break;
      case "lesson": result = applyLesson(data, body); break;
      default: throw new Error(`Aksi tidak dikenal: ${action}`);
    }

    const { error: saveErr } = await admin
      .from("sigma_profiles")
      .update({ data, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    if (saveErr) throw new Error(`Gagal menyimpan: ${saveErr.message}`);

    return json({ ok: true, action, result, profile: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: msg }, 400);
  }
});
