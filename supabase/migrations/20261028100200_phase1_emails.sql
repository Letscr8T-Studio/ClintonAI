-- Phase 1 · emails: every email sent through Clinton AI, and its lifecycle.
--   held -> sending -> sent          (Smart Delay countdown ends, Gmail accepts it)
--   held -> cancelled                (user cancels in the Outbox)
--   sending -> held                  (temporary failure, retried later)
--   sending -> failed                (retries exhausted)
-- The body is stored encrypted only while held, and wiped when the email leaves "held" for good.

create type public.email_status as enum ('held', 'sending', 'sent', 'cancelled', 'failed');

create table public.emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null,
  subject text not null default '' check (char_length(subject) <= 998),
  to_recipients jsonb not null
    check (jsonb_typeof(to_recipients) = 'array' and jsonb_array_length(to_recipients) between 1 and 100),
  cc_recipients jsonb not null default '[]'::jsonb check (jsonb_typeof(cc_recipients) = 'array'),
  bcc_recipients jsonb not null default '[]'::jsonb check (jsonb_typeof(bcc_recipients) = 'array'),
  body_encrypted text,
  -- Trust rule 3: Safe Send is opt-in per email, never on by default.
  safe_send boolean not null default false,
  status public.email_status not null default 'held',
  send_at timestamptz not null,
  sent_at timestamptz,
  provider_message_id text,
  attempt_count smallint not null default 0 check (attempt_count >= 0),
  failure_reason text check (char_length(failure_reason) <= 500),
  findings_count smallint not null default 0 check (findings_count >= 0),
  findings_accepted smallint not null default 0 check (findings_accepted >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (account_id, user_id) references public.connected_accounts (id, user_id),
  constraint emails_sent_has_timestamp check (status <> 'sent' or sent_at is not null)
);

comment on table public.emails is 'Emails sent through Clinton AI. Status changes are enforced by enforce_email_transition().';
comment on column public.emails.body_encrypted is 'AES-GCM ciphertext of the body while held. Wiped after send/cancel/fail. Server-only.';

-- The Smart Delay dispatcher scans only due, held emails.
create index emails_due_idx on public.emails (send_at) where status = 'held';
create index emails_user_created_idx on public.emails (user_id, created_at desc);

create trigger emails_set_updated_at
  before update on public.emails
  for each row execute function public.set_updated_at();

create or replace function public.enforce_email_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Content can only change while the email is still held (it hasn't left yet).
  if old.status <> 'held' and (
    new.subject is distinct from old.subject
    or new.to_recipients is distinct from old.to_recipients
    or new.cc_recipients is distinct from old.cc_recipients
    or new.bcc_recipients is distinct from old.bcc_recipients
    or new.safe_send is distinct from old.safe_send
    or (new.body_encrypted is not null and new.body_encrypted is distinct from old.body_encrypted)
  ) then
    raise exception 'email % can no longer be edited (status %)', old.id, old.status
      using errcode = 'check_violation';
  end if;

  if new.status = old.status then
    return new;
  end if;

  if not (
    (old.status = 'held' and new.status in ('sending', 'cancelled'))
    or (old.status = 'sending' and new.status in ('sent', 'held', 'failed'))
  ) then
    raise exception 'invalid email status transition % -> %', old.status, new.status
      using errcode = 'check_violation';
  end if;

  -- Minimal data: once an email can never be sent again, its body is gone.
  if new.status in ('sent', 'cancelled', 'failed') then
    new.body_encrypted := null;
  end if;
  return new;
end;
$$;

create trigger emails_enforce_transition
  before update on public.emails
  for each row execute function public.enforce_email_transition();

alter table public.emails enable row level security;

create policy "emails: read own" on public.emails
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- Clients read metadata only; the encrypted body never leaves the server.
revoke all on table public.emails from anon, authenticated;
grant select (
  id, user_id, account_id, subject, to_recipients, cc_recipients, bcc_recipients, safe_send,
  status, send_at, sent_at, attempt_count, failure_reason, findings_count, findings_accepted,
  created_at, updated_at
) on table public.emails to authenticated;
