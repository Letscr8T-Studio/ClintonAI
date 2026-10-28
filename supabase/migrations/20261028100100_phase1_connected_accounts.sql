-- Phase 1 · connected_accounts: the Gmail (later Outlook) accounts a user sends from.
-- The OAuth refresh token lives in Supabase Vault; this table only stores its secret id,
-- which is never readable by clients.

create type public.account_status as enum ('active', 'revoked', 'error');

create table public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('google')),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  scopes text[] not null default '{}',
  vault_secret_id uuid,
  status public.account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider, email),
  -- Lets emails reference (account, owner) so an email can only use its owner's account.
  unique (id, user_id)
);

comment on table public.connected_accounts is
  'Email accounts a user sends from. Tokens are in Vault (vault_secret_id), never in this table.';
comment on column public.connected_accounts.vault_secret_id is
  'vault.secrets id of the encrypted OAuth refresh token. Server-only.';

create index connected_accounts_user_idx on public.connected_accounts (user_id);

create trigger connected_accounts_set_updated_at
  before update on public.connected_accounts
  for each row execute function public.set_updated_at();

-- Disconnecting an account destroys its token, so access is truly revoked.
create or replace function public.delete_account_secret()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.vault_secret_id is not null then
    delete from vault.secrets where id = old.vault_secret_id;
  end if;
  return old;
end;
$$;

create trigger connected_accounts_delete_secret
  after delete on public.connected_accounts
  for each row execute function public.delete_account_secret();

alter table public.connected_accounts enable row level security;

create policy "connected_accounts: read own" on public.connected_accounts
  for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.connected_accounts from anon, authenticated;
grant select (id, user_id, provider, email, scopes, status, created_at, updated_at)
  on table public.connected_accounts to authenticated;
