-- Пробный период 3 дня
alter table public.profiles
  add column if not exists trial_ends_at timestamptz;
