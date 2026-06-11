import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey     = Deno.env.get("SUPABASE_ANON_KEY")!;

    const admin  = createClient(supabaseUrl, serviceKey);
    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verifikasi caller adalah guru
    const { data: { user }, error: authErr } = await caller.auth.getUser();
    if (authErr || !user) throw new Error("Sesi tidak valid, silakan login ulang.");

    const { data: teacherProfile, error: teacherError } = await admin
      .from("sigma_profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (teacherError) throw new Error(`Gagal memeriksa role guru: ${teacherError.message}`);

    if (teacherProfile?.role !== "teacher") {
      throw new Error(`Hanya guru yang dapat menghapus akun siswa. Session aktif: ${user.email || user.id}; role server: ${teacherProfile?.role || "tidak ditemukan"}.`);
    }

    const { userId } = await req.json();
    if (!userId) throw new Error("user_id wajib diisi.");

    // Pastikan target adalah siswa (bukan guru)
    const { data: targetProfile } = await admin
      .from("sigma_profiles")
      .select("role, name")
      .eq("user_id", userId)
      .single();

    if (!targetProfile) throw new Error("Siswa tidak ditemukan.");
    if (targetProfile.role !== "student") throw new Error("Hanya akun siswa yang bisa dihapus.");

    // Hapus auth user terlebih dahulu. FK on delete cascade akan membersihkan sigma_profiles.
    const { error: deleteErr } = await admin.auth.admin.deleteUser(userId);
    if (deleteErr) throw new Error(deleteErr.message);

    // Fallback ringan jika cascade belum membersihkan row profil karena skema lama.
    await admin.from("sigma_profiles").delete().eq("user_id", userId);

    return new Response(
      JSON.stringify({ success: true, name: targetProfile.name }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
