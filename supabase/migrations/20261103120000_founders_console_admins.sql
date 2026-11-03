-- Founders console: real accounts instead of a shared password. Admins sign in with the product's
-- own Google sign-in, must be listed here, and must pass a second step (TOTP MFA, checked by the
-- server). Every console visit and export is logged.

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  note text check (char_length(note) <= 200),
  added_at timestamptz not null default now()
);

comment on table public.admins is 'Founders console access. Add rows by hand (scripts/add-admin.mjs); never from the app.';

alter table public.admins enable row level security;
revoke all on table public.admins from anon, authenticated;
grant select on table public.admins to authenticated;

-- Each person can see only whether they themselves are an admin.
create policy "admins: read own" on public.admins
  for select to authenticated
  using ((select auth.uid()) = user_id);

create table public.admin_access_log (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  action text not null check (char_length(action) between 1 and 200),
  created_at timestamptz not null default now()
);

comment on table public.admin_access_log is 'Every founders console page view and export. Written by the server (service role) only.';

create index admin_access_log_created_idx on public.admin_access_log (created_at desc);

alter table public.admin_access_log enable row level security;
revoke all on table public.admin_access_log from anon, authenticated;
