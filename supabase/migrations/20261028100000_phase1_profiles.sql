-- Phase 1 · profiles: one row per user, created automatically on sign-up.
-- Access model for every Phase 1 table: users READ their own rows through RLS;
-- all writes go through server code (service role) that validates first.

-- Shared trigger helper: keeps updated_at current.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 120),
  avatar_url text check (char_length(avatar_url) <= 2048),
  -- Smart Delay default. 5 minutes until beta testing sets the real default (docs/phases/phase-1).
  default_delay_seconds integer not null default 300 check (default_delay_seconds between 60 and 1800),
  -- Open tracking on normal emails is off unless the user turns it on (minimal data).
  open_tracking boolean not null default false,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Per-user settings. Created by the on_auth_user_created trigger.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create the profile when a user signs up (Google sign-in fills full_name and avatar_url).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name, avatar_url)
  values (
    new.id,
    left(new.raw_user_meta_data ->> 'full_name', 120),
    left(new.raw_user_meta_data ->> 'avatar_url', 2048)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row-level security: read and update your own profile only.
alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "profiles: update own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Column-level grants: users may change their settings, never ids or timestamps.
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (display_name, default_delay_seconds, open_tracking, onboarded_at)
  on table public.profiles to authenticated;
