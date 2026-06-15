create table if not exists public.sigma_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'teacher')),
  name text not null,
  nickname text,
  level int check (level in (7, 8, 9)),
  class_name text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sigma_profiles_role_idx on public.sigma_profiles(role);
create index if not exists sigma_profiles_level_class_idx on public.sigma_profiles(level, class_name);

alter table public.sigma_profiles enable row level security;

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on public.sigma_profiles to authenticated;
grant all on public.sigma_profiles to service_role;

create policy "students can read their own profile"
on public.sigma_profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "students can insert their own profile"
on public.sigma_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "students can update their own profile"
on public.sigma_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "students can delete their own profile"
on public.sigma_profiles
for delete
to authenticated
using (auth.uid() = user_id);

create policy "teachers can read student profiles"
on public.sigma_profiles
for select
to authenticated
using (
  role = 'student'
  and exists (
    select 1
    from public.sigma_profiles teacher
    where teacher.user_id = auth.uid()
      and teacher.role = 'teacher'
  )
);

-- ============================================
-- Kunci integritas XP
-- Hanya service-role (Edge Function award-xp) yang boleh menaikkan xp.
-- Update dari siswa/guru (role authenticated/anon lewat PostgREST) tidak
-- bisa menaikkan data->xp; akun baru selalu mulai dari xp 0.
-- DEPLOY trigger ini SETELAH Edge Function award-xp aktif dan klien sudah
-- memakainya — kalau tidak, perolehan XP dari kuis/misi/gim/lab akan
-- terhenti karena masih dihitung di klien.
-- ============================================
create or replace function sigma_guard_xp()
returns trigger language plpgsql as $$
declare
  old_xp numeric;
  new_xp numeric := coalesce((new.data->>'xp')::numeric, 0);
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.data = jsonb_set(coalesce(new.data, '{}'::jsonb), '{xp}', '0'::jsonb);
    elsif tg_op = 'UPDATE' then
      old_xp := coalesce((old.data->>'xp')::numeric, 0);
      if new_xp > old_xp then
        new.data = jsonb_set(new.data, '{xp}', to_jsonb(old_xp));
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists sigma_guard_xp_trg on public.sigma_profiles;
create trigger sigma_guard_xp_trg
  before insert or update on public.sigma_profiles
  for each row execute function sigma_guard_xp();
