-- Noted — Supabase schema
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query → Run).
-- Creates the two tables the app uses and locks them down with row-level
-- security so each signed-in user can only ever read or write their own rows.

-- ---------------------------------------------------------------------------
-- profiles — the user's information (one row per user)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  name        text,
  first_name  text,
  age         int,
  gender      text,
  conditions  jsonb default '[]'::jsonb,
  medications jsonb default '[]'::jsonb,
  allergies   jsonb default '[]'::jsonb,
  note        text,
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users manage their own profile" on public.profiles;
create policy "Users manage their own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- entries — saved symptom logs, daily check-ins and PROM results.
-- The whole entry object is kept in `payload` (jsonb) so the client data shape
-- can evolve freely; `kind` and `logged_at` are promoted to columns for
-- filtering and ordering. Primary key is (user_id, id) so the client's own
-- entry id upserts cleanly.
-- ---------------------------------------------------------------------------
create table if not exists public.entries (
  user_id    uuid not null references auth.users (id) on delete cascade,
  id         text not null,
  kind       text not null default 'log',   -- 'log' | 'checkin' | 'prom'
  payload    jsonb not null,
  logged_at  text,                           -- the entry's own date key, for ordering
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists entries_user_kind_idx
  on public.entries (user_id, kind, logged_at desc);

alter table public.entries enable row level security;

drop policy if exists "Users manage their own entries" on public.entries;
create policy "Users manage their own entries"
  on public.entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Optional: auto-create a profile row the moment a user signs up, so the row
-- always exists even before the first profile save. (The client also upserts
-- on sign-up, so this is belt-and-braces.)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, first_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'name',
    split_part(coalesce(new.raw_user_meta_data ->> 'name', ''), ' ', 1)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
