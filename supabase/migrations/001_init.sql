-- Наглядно: профили + прогресс + учебный год (Supabase Auth)
-- Применить в SQL Editor проекта Supabase.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  email text not null default '',
  grade smallint not null default 6 check (grade between 5 and 9),
  role text not null default 'student' check (role in ('student', 'parent')),
  plan text not null default 'free' check (plan in ('free', 'plus')),
  plan_expires_at timestamptz,
  usage jsonb not null default '{}'::jsonb,
  activity jsonb not null default '[]'::jsonb,
  baseline jsonb,
  onboarding_done boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.progress_snapshots (
  user_id uuid primary key references auth.users (id) on delete cascade,
  streak integer not null default 0,
  sound_on boolean not null default true,
  results jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.year_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  by_grade jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.progress_snapshots enable row level security;
alter table public.year_progress enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

drop policy if exists "progress_select_own" on public.progress_snapshots;
drop policy if exists "progress_insert_own" on public.progress_snapshots;
drop policy if exists "progress_update_own" on public.progress_snapshots;
create policy "progress_select_own" on public.progress_snapshots for select using (auth.uid() = user_id);
create policy "progress_insert_own" on public.progress_snapshots for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on public.progress_snapshots for update using (auth.uid() = user_id);

drop policy if exists "year_select_own" on public.year_progress;
drop policy if exists "year_insert_own" on public.year_progress;
drop policy if exists "year_update_own" on public.year_progress;
create policy "year_select_own" on public.year_progress for select using (auth.uid() = user_id);
create policy "year_insert_own" on public.year_progress for insert with check (auth.uid() = user_id);
create policy "year_update_own" on public.year_progress for update using (auth.uid() = user_id);

-- Профиль при регистрации
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'display_name', '')
  )
  on conflict (id) do nothing;
  insert into public.progress_snapshots (user_id) values (new.id)
  on conflict (user_id) do nothing;
  insert into public.year_progress (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
