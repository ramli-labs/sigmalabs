-- ============================================================
-- SIGMA Labschool — Supabase Schema
-- Jalankan di: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ============================================================
-- 1. Tabel utama: sigma_profiles
--    Menyimpan profil + seluruh progress belajar siswa/guru.
--    Kolom 'data' (jsonb) menyimpan XP, badge, progress, misi,
--    kuis, refleksi, lab, dan gim — sesuai format session.js.
-- ============================================================
create table if not exists sigma_profiles (
  user_id    uuid        primary key references auth.users on delete cascade,
  role       text        not null default 'student'
                         check (role in ('student', 'teacher')),
  name       text        not null default 'Siswa',
  nickname   text,
  level      integer     not null default 7
                         check (level in (7, 8, 9)),
  class_name text        not null default '7A',
  data       jsonb       not null default '{}',
  updated_at timestamptz not null default now()
);

comment on table sigma_profiles is
  'Profil + progress siswa/guru SIGMA Labschool. Kolom data menyimpan objek lengkap sesuai format session.js (xp, badges, progress, quests, quizzes, dll).';

-- ============================================================
-- 2. Row Level Security
-- ============================================================
alter table sigma_profiles enable row level security;

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on public.sigma_profiles to authenticated;
grant all on public.sigma_profiles to service_role;

-- Siswa: baca dan ubah profil sendiri
create policy "siswa_baca_sendiri"  on sigma_profiles
  for select using (auth.uid() = user_id);

create policy "siswa_insert_sendiri" on sigma_profiles
  for insert with check (auth.uid() = user_id);

create policy "siswa_update_sendiri" on sigma_profiles
  for update using (auth.uid() = user_id);

-- Guru: baca semua profil siswa
-- Menggunakan fungsi security-definer untuk menghindari circular RLS
create or replace function sigma_is_teacher()
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from sigma_profiles
    where user_id = auth.uid() and role = 'teacher'
  );
$$;

create policy "guru_baca_semua" on sigma_profiles
  for select using (
    auth.uid() = user_id or sigma_is_teacher()
  );

-- ============================================================
-- 3. Trigger: auto-update updated_at
-- ============================================================
create or replace function sigma_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sigma_profiles_updated_at
  before update on sigma_profiles
  for each row execute function sigma_set_updated_at();

-- ============================================================
-- 4. Dummy users untuk testing
--
-- CATATAN: Tidak bisa insert langsung ke auth.users dari SQL Editor.
-- Cara membuat dummy user:
--
-- Opsi A (Direkomendasikan): Supabase Dashboard
--   Authentication → Users → Add user
--   Centang "Auto Confirm User" agar tidak perlu verifikasi email
--
-- Opsi B: Lewat form Daftar di web SIGMA (nonaktifkan email
--   confirmation dulu di Auth → Providers → Email → uncheck
--   "Confirm email")
--
-- Setelah user dibuat, jalankan query di bawah untuk insert profil:
-- (Ganti UUID dengan user_id dari Authentication → Users)
-- ============================================================

-- Contoh insert profil setelah user dibuat:
-- insert into sigma_profiles (user_id, role, name, nickname, level, class_name, data) values
--   ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'student', 'Naya Putri',    'Naya',   7, '7A', '{"xp":0,"streak":1,"badges":[{"id":"starter","emoji":"✨","label":"Mulai Belajar","color":"var(--gold-400)"}],"progress":{},"completedLabs":[],"completedGames":[],"quests":{},"quizzes":{},"reflections":{},"gameScores":{}}'),
--   ('yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy', 'student', 'Bima Saputra',  'Bima',   8, '8B', '{"xp":0,"streak":1,"badges":[{"id":"starter","emoji":"✨","label":"Mulai Belajar","color":"var(--gold-400)"}],"progress":{},"completedLabs":[],"completedGames":[],"quests":{},"quizzes":{},"reflections":{},"gameScores":{}}'),
--   ('zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz', 'teacher', 'Pak Ramli',    'Pak Ramli', 7, '-', '{"xp":0,"streak":1,"badges":[],"progress":{},"completedLabs":[],"completedGames":[],"quests":{},"quizzes":{},"reflections":{},"gameScores":{}}');

-- ============================================================
-- 5. Untuk Google OAuth (SSO Email Sekolah)
--    Lakukan di Supabase Dashboard → Authentication → Providers → Google:
--
--    a. Enable Google provider
--    b. Isi Client ID & Client Secret dari Google Cloud Console
--    c. Callback URL yang perlu didaftarkan di Google:
--       https://<project-id>.supabase.co/auth/v1/callback
--
--    Di Google Cloud Console → APIs & Services → OAuth 2.0:
--    - Authorized redirect URI: https://<project-id>.supabase.co/auth/v1/callback
--    - Jika email sekolah pakai Google Workspace, set OAuth consent ke "Internal"
--      agar hanya email @sekolah.sch.id yang bisa login
--
--    Di Supabase → Authentication → URL Configuration:
--    - Site URL: https://sigmalabs.labschool.sch.id (atau URL deploy)
--    - Additional Redirect URLs: http://localhost (untuk dev lokal)
-- ============================================================
