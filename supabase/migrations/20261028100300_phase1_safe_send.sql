-- Phase 1 · Safe Send: the encrypted content behind a withdrawable email, and its recipients.
-- Trust rules enforced here: withdraw, never edit (content can't be replaced); withdrawals are
-- permanent and always visible; the 24-hour window is fixed at creation.

create table public.safe_send_messages (
  id uuid primary key default gen_random_uuid(),
  email_id uuid not null unique references public.emails (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null check (char_length(storage_path) <= 512),
  key_ref uuid,
  expires_at timestamptz not null,
  withdrawn_at timestamptz,
  content_deleted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint safe_send_window check (expires_at > created_at and expires_at <= created_at + interval '24 hours')
);

comment on table public.safe_send_messages is
  'Encrypted Safe Send content (in the private safe-send bucket). Withdraw, never edit.';
comment on column public.safe_send_messages.key_ref is
  'vault.secrets id of the per-message data key. Set to null when the content is deleted. Server-only.';

create index safe_send_expiring_idx on public.safe_send_messages (expires_at) where content_deleted_at is null;

create table public.safe_send_recipients (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.safe_send_messages (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  recipient_email text not null check (recipient_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  -- sha256 hex of the link token. The raw token only ever exists in the recipient's email.
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  first_opened_at timestamptz,
  last_opened_at timestamptz,
  open_count integer not null default 0 check (open_count >= 0),
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  unique (message_id, recipient_email)
);

create index safe_send_recipients_message_idx on public.safe_send_recipients (message_id);

-- Shared guard: a withdrawal or deletion, once recorded, is permanent.
create or replace function public.guard_safe_send()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.withdrawn_at is not null and new.withdrawn_at is distinct from old.withdrawn_at then
    raise exception 'a withdrawal is permanent' using errcode = 'check_violation';
  end if;

  if tg_table_name = 'safe_send_messages' then
    if new.storage_path is distinct from old.storage_path
      or new.email_id is distinct from old.email_id
      or new.expires_at is distinct from old.expires_at
      or (new.key_ref is not null and new.key_ref is distinct from old.key_ref) then
      raise exception 'Safe Send content cannot be replaced: withdraw, never edit'
        using errcode = 'check_violation';
    end if;
    if old.content_deleted_at is not null and new.content_deleted_at is distinct from old.content_deleted_at then
      raise exception 'deleted content cannot be restored' using errcode = 'check_violation';
    end if;
    if old.withdrawn_at is null and new.withdrawn_at is not null and now() > old.expires_at then
      raise exception 'the 24-hour Unsend window has closed' using errcode = 'check_violation';
    end if;
  else
    if new.token_hash is distinct from old.token_hash
      or new.recipient_email is distinct from old.recipient_email
      or new.message_id is distinct from old.message_id then
      raise exception 'Safe Send recipients are immutable' using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

create trigger safe_send_messages_guard
  before update on public.safe_send_messages
  for each row execute function public.guard_safe_send();

create trigger safe_send_recipients_guard
  before update on public.safe_send_recipients
  for each row execute function public.guard_safe_send();

alter table public.safe_send_messages enable row level security;
alter table public.safe_send_recipients enable row level security;

create policy "safe_send_messages: read own" on public.safe_send_messages
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "safe_send_recipients: read own" on public.safe_send_recipients
  for select to authenticated using ((select auth.uid()) = user_id);

revoke all on table public.safe_send_messages, public.safe_send_recipients from anon, authenticated;
grant select (id, email_id, user_id, expires_at, withdrawn_at, content_deleted_at, created_at)
  on table public.safe_send_messages to authenticated;
grant select (id, message_id, user_id, recipient_email, first_opened_at, last_opened_at, open_count,
  withdrawn_at, created_at)
  on table public.safe_send_recipients to authenticated;

-- Private bucket for the encrypted blobs. No storage policies: only the server can touch it.
insert into storage.buckets (id, name, public, file_size_limit)
values ('safe-send', 'safe-send', false, 26214400)
on conflict (id) do nothing;
