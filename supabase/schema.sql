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
