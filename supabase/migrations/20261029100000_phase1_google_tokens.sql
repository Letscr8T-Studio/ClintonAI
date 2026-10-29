-- Phase 1 · Gmail tokens in Vault. Only the server (service_role) can store or read a token;
-- clients never see it, and the connected_accounts row only holds the Vault secret id.

-- Store (or rotate) a user's Google refresh token and upsert the account. Returns the account id.
create or replace function public.save_google_account(
  p_user_id uuid,
  p_email text,
  p_scopes text[],
  p_refresh_token text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
  v_secret uuid;
  v_account uuid;
begin
  if coalesce(p_refresh_token, '') = '' then
    raise exception 'refresh token required' using errcode = 'check_violation';
  end if;

  select vault_secret_id into v_secret
  from public.connected_accounts
  where user_id = p_user_id and provider = 'google' and email = v_email;

  if v_secret is not null then
    perform vault.update_secret(v_secret, p_refresh_token);
  else
    v_secret := vault.create_secret(p_refresh_token, null, 'Google refresh token (Clinton AI)');
  end if;

  insert into public.connected_accounts (user_id, provider, email, scopes, vault_secret_id, status)
  values (p_user_id, 'google', v_email, p_scopes, v_secret, 'active')
  on conflict (user_id, provider, email) do update
    set scopes = excluded.scopes, vault_secret_id = excluded.vault_secret_id, status = 'active'
  returning id into v_account;

  return v_account;
end;
$$;

-- Decrypted refresh token for one account, for sending. Server-only.
create or replace function public.get_account_refresh_token(p_account_id uuid)
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select s.decrypted_secret
  from public.connected_accounts a
  join vault.decrypted_secrets s on s.id = a.vault_secret_id
  where a.id = p_account_id;
$$;

revoke all on function public.save_google_account(uuid, text, text[], text) from public, anon, authenticated;
revoke all on function public.get_account_refresh_token(uuid) from public, anon, authenticated;
grant execute on function public.save_google_account(uuid, text, text[], text) to service_role;
grant execute on function public.get_account_refresh_token(uuid) to service_role;
