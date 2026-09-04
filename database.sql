-- PROCURA database setup
-- Run this entire file in Supabase SQL Editor.

create table if not exists public.app_state (
  id integer primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

-- Keep updated_at current whenever the snapshot changes.
create or replace function public.set_app_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_state_updated_at on public.app_state;
create trigger app_state_updated_at
before update on public.app_state
for each row execute function public.set_app_state_updated_at();

-- Enable Row Level Security.
alter table public.app_state enable row level security;

-- Hackathon/demo policies: the public browser client may read/write the single
-- application snapshot. For a production system, replace these with Supabase
-- Auth + role-based policies.
drop policy if exists "procura public read" on public.app_state;
drop policy if exists "procura public insert" on public.app_state;
drop policy if exists "procura public update" on public.app_state;

create policy "procura public read"
on public.app_state for select
to anon, authenticated
using (true);

create policy "procura public insert"
on public.app_state for insert
to anon, authenticated
with check (id = 1);

create policy "procura public update"
on public.app_state for update
to anon, authenticated
using (id = 1)
with check (id = 1);

-- Optional: make Supabase Realtime aware of the table for future upgrades.
do $$
begin
  alter publication supabase_realtime add table public.app_state;
exception
  when duplicate_object then null;
end;
$$;
