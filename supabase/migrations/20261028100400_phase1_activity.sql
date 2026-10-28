-- Phase 1 · AI check events and the activity history behind the dashboard.

-- Trust rule 7: this table records WHAT kinds of mistakes were found, never the email text.
-- There is deliberately no column that could hold content.
create table public.ai_check_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email_id uuid references public.emails (id) on delete set null,
  finding_types text[] not null default '{}' check (cardinality(finding_types) <= 50),
  accepted smallint not null default 0 check (accepted >= 0),
  dismissed smallint not null default 0 check (dismissed >= 0),
  model text check (char_length(model) <= 100),
  latency_ms integer check (latency_ms >= 0),
  created_at timestamptz not null default now()
);

comment on table public.ai_check_events is
  'One row per AI check: finding types and outcomes only. Never stores email text (trust rule 7).';

create index ai_check_events_user_created_idx on public.ai_check_events (user_id, created_at desc);

create type public.activity_action as enum (
  'held', 'edited', 'sent', 'cancelled', 'failed', 'withdrawn', 'expired', 'opened'
);

create table public.activity_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  email_id uuid references public.emails (id) on delete cascade,
  action public.activity_action not null,
  recipient_email text,
  created_at timestamptz not null default now()
);

comment on table public.activity_log is 'Append-only history of every email action (dashboard "Activity").';

create index activity_log_user_created_idx on public.activity_log (user_id, created_at desc);

-- Append-only: history can't be rewritten, even by mistake in server code.
create or replace function public.forbid_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception '% is append-only', tg_table_name using errcode = 'check_violation';
end;
$$;

create trigger activity_log_append_only
  before update on public.activity_log
  for each row execute function public.forbid_change();

alter table public.ai_check_events enable row level security;
alter table public.activity_log enable row level security;

create policy "ai_check_events: read own" on public.ai_check_events
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "activity_log: read own" on public.activity_log
  for select to authenticated using ((select auth.uid()) = user_id);

revoke all on table public.ai_check_events, public.activity_log from anon, authenticated;
grant select on table public.ai_check_events, public.activity_log to authenticated;
