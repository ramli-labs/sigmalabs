// ============================================
// SIGMA Edge Function: reset-quiz
// Guru mengizinkan seorang siswa mengulang kuis sebuah modul.
// Menghapus record kuis modul itu + mengurangi XP yang sempat diberikan +
// melepas badge kuis, lalu siswa bisa mengerjakan ulang (dinilai server).
// Hanya guru (diverifikasi service-role) yang boleh memanggil.
// ============================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status });

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
    const caller = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });

    const { data: { user }, error: authErr } = await caller.auth.getUser();
    if (authErr || !user) throw new Error("Sesi tidak valid, silakan login ulang.");

    // Pastikan caller adalah guru.
    const { data: me, error: meErr } = await admin
      .from("sigma_profiles").select("role").eq("user_id", user.id).maybeSingle();
    if (meErr) throw new Error(`Gagal memeriksa role: ${meErr.message}`);
    if (me?.role !== "teacher") throw new Error("Hanya guru yang dapat mengatur ulang kuis siswa.");

    const { userId, moduleId } = await req.json();
    if (!userId || !moduleId) throw new Error("userId dan moduleId wajib diisi.");

    const { data: row, error: loadErr } = await admin
      .from("sigma_profiles").select("data").eq("user_id", userId).maybeSingle();
    if (loadErr) throw new Error(`Gagal memuat profil siswa: ${loadErr.message}`);
    if (!row) throw new Error("Profil siswa tidak ditemukan.");

    const data = (row.data && typeof row.data === "object") ? row.data : {};
    const rec = data.quizzes?.[moduleId];
    if (rec) {
      data.xp = Math.max(0, Number(data.xp || 0) - Number(rec.xpAwarded || 0));
      delete data.quizzes[moduleId];
      if (Array.isArray(data.badges)) {
        data.badges = data.badges.filter((b: any) => b && b.id !== `quiz-${moduleId}`);
      }
    }

    const { error: saveErr } = await admin
      .from("sigma_profiles").update({ data, updated_at: new Date().toISOString() }).eq("user_id", userId);
    if (saveErr) throw new Error(`Gagal menyimpan: ${saveErr.message}`);

    return json({ ok: true, reset: !!rec });
  } catch (err: unknown) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 400);
  }
});
