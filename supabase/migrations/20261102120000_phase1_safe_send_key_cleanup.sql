-- Phase 1 · Safe Send keys never outlive their message (trust rule 6).
-- Withdraw and expiry already destroy the key. But when a message row goes any other way (an
-- account deleted, cascading through emails), its Vault key was left behind. Now deleting a
-- message always deletes its key too.

create or replace function public.safe_send_drop_key()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.key_ref is not null then
    delete from vault.secrets where id = old.key_ref;
  end if;
  return old;
end;
$$;

revoke all on function public.safe_send_drop_key() from public, anon, authenticated;

create trigger safe_send_messages_drop_key
  after delete on public.safe_send_messages
  for each row execute function public.safe_send_drop_key();

-- Keys already orphaned this way (none in production; local test accounts) are removed now.
delete from vault.secrets s
where s.description = 'Safe Send data key (Clinton AI)'
  and s.name is null
  and not exists (select 1 from public.safe_send_messages m where m.key_ref = s.id);
