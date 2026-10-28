-- Run this once in Supabase: SQL Editor > New query > paste > Run.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  did_survey boolean not null default false,
  survey_completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint waitlist_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

-- Lock the table down. With RLS on and no policies, only the server (service role key)
-- can read or write. Nobody can pull your list from the browser.
alter table public.waitlist enable row level security;

-- Handy views for checking progress in the Supabase dashboard.
create or replace view public.waitlist_stats with (security_invoker = true) as
select
  count(*) as total_signups,
  count(*) filter (where did_survey) as did_survey,
  round(100.0 * count(*) filter (where did_survey) / nullif(count(*), 0), 1) as survey_rate_pct,
  count(*) filter (where created_at > now() - interval '7 days') as signups_last_7_days
from public.waitlist;

revoke all on public.waitlist_stats from anon, authenticated;
