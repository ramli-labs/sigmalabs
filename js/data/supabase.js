// ============================================
// SIGMA Supabase Client
// Tahap 1: auth + profil/progres siswa. Konten modul tetap statis.
// ============================================

(function () {
  window.SIGMA_SUPABASE_CONFIG = {
    url: "https://dibzkjwyupbddihdosbi.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYnprand5dXBiZGRpaGRvc2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTYyOTEsImV4cCI6MjA5NTg5MjI5MX0.cKIOtbJkwxBjRafit7k6RXPsGNfqQDT2HsLVHJr4bfA",
    table: "sigma_profiles",
  };

  const getConfig = () => window.SIGMA_SUPABASE_CONFIG || {};

  function isConfigured() {
    const config = getConfig();
    return Boolean(config.url && config.anonKey && window.supabase?.createClient);
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (!window.SIGMA_SUPABASE_CLIENT) {
      const config = getConfig();
      window.SIGMA_SUPABASE_CLIENT = window.supabase.createClient(config.url, config.anonKey);
    }
    return window.SIGMA_SUPABASE_CLIENT;
  }

  function toProfile(row) {
    if (!row) return null;
    return {
      ...(row.data || {}),
      id: row.data?.id || row.user_id,
      user_id: row.user_id,
      role: row.role || "student",
      name: row.name || row.data?.name || "Siswa",
      nickname: row.nickname || row.data?.nickname || row.name || "Siswa",
      level: Number(row.level || row.data?.level || 7),
      class: row.class_name || row.data?.class || "7A",
    };
  }

  function toRow(profile, role) {
    return {
      user_id: profile.user_id,
      role: role || profile.role || "student",
      name: profile.name,
      nickname: profile.nickname || profile.name,
      level: Number(profile.level || 7),
      class_name: profile.class || profile.class_name || "7A",
      data: profile,
      updated_at: new Date().toISOString(),
    };
  }

  async function getSession() {
    const client = getClient();
    if (!client) return null;
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session || null;
  }

  async function signIn(email, password) {
    const client = getClient();
    if (!client) throw new Error("Supabase belum dikonfigurasi.");
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  }

  async function signUp(email, password, metadata) {
    const client = getClient();
    if (!client) throw new Error("Supabase belum dikonfigurasi.");
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: metadata || {} },
    });
    if (error) throw error;
    return data.user;
  }

  async function signOut() {
    const client = getClient();
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }

  async function fetchOwnProfile() {
    const client = getClient();
    if (!client) return null;
    const session = await getSession();
    if (!session?.user) return null;
    const table = getConfig().table || "sigma_profiles";
    const { data, error } = await client
      .from(table)
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (error) throw error;
    return toProfile(data);
  }

  async function fetchVisibleProfiles() {
    const client = getClient();
    if (!client) return [];
    const table = getConfig().table || "sigma_profiles";
    const { data, error } = await client
      .from(table)
      .select("*")
      .eq("role", "student")
      .order("level", { ascending: true })
      .order("class_name", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;
    return (data || []).map(toProfile).filter(Boolean);
  }

  async function upsertProfile(profile, role) {
    const client = getClient();
    if (!client || !profile) return null;
    const session = await getSession();
    if (!session?.user) return null;
    const table = getConfig().table || "sigma_profiles";
    const row = toRow({ ...profile, id: session.user.id, user_id: session.user.id }, role);
    const { data, error } = await client
      .from(table)
      .upsert(row, { onConflict: "user_id" })
      .select("*")
      .single();
    if (error) throw error;
    return toProfile(data);
  }

  async function clearOwnProfile() {
    const client = getClient();
    if (!client) return;
    const session = await getSession();
    if (!session?.user) return;
    const table = getConfig().table || "sigma_profiles";
    const { error } = await client.from(table).delete().eq("user_id", session.user.id);
    if (error) throw error;
  }

  async function resetStudentPassword(userId, newPassword) {
    const client = getClient();
    if (!client) throw new Error("Supabase belum dikonfigurasi.");
    const session = await getSession();
    if (!session) throw new Error("Sesi tidak valid.");
    const config = getConfig();
    const res = await fetch(`${config.url}/functions/v1/reset-student-password`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "apikey": config.anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, newPassword }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Gagal mengubah password.");
    return json;
  }

  async function createStudents(students, defaultPassword) {
    const client = getClient();
    if (!client) throw new Error("Supabase belum dikonfigurasi.");
    const session = await getSession();
    if (!session) throw new Error("Tidak ada sesi guru aktif.");
    const config = getConfig();
    const fnUrl = `${config.url}/functions/v1/create-students`;
    const res = await fetch(fnUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "apikey": config.anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ students, defaultPassword }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Gagal membuat akun siswa.");
    return json.results;
  }

  async function signInWithGoogle() {
    const client = getClient();
    if (!client) throw new Error("Supabase belum dikonfigurasi.");
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/",
      },
    });
    if (error) throw error;
    return data;
  }

  window.SIGMA_SUPABASE = {
    isConfigured,
    getSession,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    createStudents,
    resetStudentPassword,
    fetchOwnProfile,
    fetchVisibleProfiles,
    upsertProfile,
    clearOwnProfile,
  };
})();
