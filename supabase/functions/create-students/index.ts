import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey     = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Admin client — bypasses RLS, untuk create user dan insert profil
    const admin = createClient(supabaseUrl, serviceKey);

    // Caller client — untuk verifikasi JWT guru
    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authErr } = await caller.auth.getUser();
    if (authErr || !user) throw new Error("Sesi tidak valid, silakan login ulang.");

    // Pastikan caller adalah guru
    const { data: teacherProfile } = await admin
      .from("sigma_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (teacherProfile?.role !== "teacher") {
      throw new Error("Hanya guru yang dapat membuat akun siswa.");
    }

    const { students, defaultPassword } = await req.json();
    if (!Array.isArray(students) || students.length === 0) throw new Error("Tidak ada data siswa.");
    if (!defaultPassword?.trim()) throw new Error("Password default wajib diisi.");

    const results = [];

    for (const s of students) {
      try {
        if (!s.email?.trim()) throw new Error("Email wajib diisi.");
        if (!s.name?.trim())  throw new Error("Nama wajib diisi.");

        const name      = s.name.trim();
        const nickname  = (s.nickname?.trim() || name.split(" ")[0]).trim();
        const level     = Number(s.level || 7);
        const className = (s.class?.trim() || `${level}A`);
        const password  = s.password?.trim() || defaultPassword.trim();

        // Buat akun auth
        const { data: authData, error: authError } = await admin.auth.admin.createUser({
          email: s.email.trim(),
          password,
          email_confirm: true,
          user_metadata: { name, role: "student" },
        });

        if (authError) throw new Error(authError.message);
        const userId = authData.user.id;

        // Profil lengkap untuk kolom data (format session.js)
        const profileBlob = {
          id: userId,
          user_id: userId,
          role: "student",
          name,
          nickname,
          level,
          class: className,
          xp: 0,
          streak: 1,
          badges: [{ id: "starter", emoji: "✨", label: "Mulai Belajar", color: "var(--gold-400)" }],
          progress: {},
          completedLabs: [],
          completedGames: [],
          quests: {},
          quizzes: {},
          reflections: {},
          gameScores: {},
        };

        const { error: profileError } = await admin.from("sigma_profiles").insert({
          user_id: userId,
          role: "student",
          name,
          nickname,
          level,
          class_name: className,
          data: profileBlob,
          updated_at: new Date().toISOString(),
        });

        if (profileError) throw new Error(profileError.message);

        results.push({ email: s.email, name, success: true });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({ email: s.email || "?", name: s.name || "?", success: false, error: msg });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
