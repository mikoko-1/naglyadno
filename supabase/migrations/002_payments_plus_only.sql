-- Плюс only + платежи ЮKassa
-- Применить в SQL Editor после 001_init.sql

update public.profiles set plan = 'plus' where plan = 'tutor';

alter table public.profiles drop constraint if exists profiles_plan_check;
alter table public.profiles
  add constraint profiles_plan_check check (plan in ('free', 'plus'));

create table if not exists public.payments (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  plan text not null default 'plus' check (plan in ('plus')),
  amount_rub numeric(10, 2) not null,
  currency text not null default 'RUB',
  status text not null default 'pending',
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_user_id_idx on public.payments (user_id);

alter table public.payments enable row level security;

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
  on public.payments for select
  using (auth.uid() = user_id);

-- insert/update только через service role (Edge webhook / create-payment)
