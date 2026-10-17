create extension if not exists pgcrypto;

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('expense','income','transfer')),
  merchant text not null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'SGD' check (currency = 'SGD'),
  transaction_date date not null default current_date,
  category text not null default 'Unknown',
  notes text,
  gst_amount numeric(12,2) not null default 0 check (gst_amount >= 0),
  includes_gst boolean not null default false,
  is_recurring boolean not null default false,
  recurring_frequency text check (recurring_frequency in ('weekly','monthly','yearly') or recurring_frequency is null),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists transactions_user_date_idx on public.transactions(user_id, transaction_date desc);
create index if not exists transactions_user_category_idx on public.transactions(user_id, category, transaction_date desc);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  amount numeric(12,2) not null check (amount > 0),
  month date not null,
  created_at timestamptz not null default now(),
  unique(user_id, category, month)
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(12,2) not null check (target_amount > 0),
  current_amount numeric(12,2) not null default 0 check (current_amount >= 0),
  target_date date,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;

create policy "Users manage their own transactions" on public.transactions for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own budgets" on public.budgets for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own savings goals" on public.savings_goals for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger transactions_updated_at before update on public.transactions for each row execute procedure public.set_updated_at();
