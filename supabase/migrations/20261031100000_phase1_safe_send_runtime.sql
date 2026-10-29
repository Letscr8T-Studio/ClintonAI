-- Phase 1 · Safe Send at runtime: create, open, and shred. All server-only (service_role).
-- Content is encrypted with a per-message data key kept in Vault; destroying that key
-- (crypto-shredding) makes the stored ciphertext unreadable forever, even from backups.

-- Create a Safe Send message, its Vault key and every recipient's link, in one transaction.
-- The 24-hour window is set here, from the database clock, so it is exactly 24 hours.
create or replace function public.create_safe_send(
  p_email_id uuid,
  p_user_id uuid,
  p_storage_path text,
  p_data_key text,
  p_recipients jsonb
)
returns table (message_id uuid, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key uuid;
  v_id uuid;
  v_expires timestamptz := now() + interval '24 hours';
begin
  if jsonb_typeof(p_recipients) <> 'array' or jsonb_array_length(p_recipients) = 0 then
    raise exception 'Safe Send needs at least one recipient' using errcode = 'check_violation';
  end if;
  v_key := vault.create_secret(p_data_key, null, 'Safe Send data key (Clinton AI)');
  insert into public.safe_send_messages (email_id, user_id, storage_path, key_ref, expires_at)
  values (p_email_id, p_user_id, p_storage_path, v_key, v_expires)
  returning id into v_id;
  insert into public.safe_send_recipients (message_id, user_id, recipient_email, token_hash)
  select v_id, p_user_id, lower(r ->> 'email'), r ->> 'token_hash'
  from jsonb_array_elements(p_recipients) r;
  return query select v_id, v_expires;
end;
$$;

-- The data key, only while the content still exists.
create or replace function public.get_safe_send_key(p_message_id uuid)
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select s.decrypted_secret
  from public.safe_send_messages m
  join vault.decrypted_secrets s on s.id = m.key_ref
  where m.id = p_message_id and m.content_deleted_at is null;
$$;

-- A recipient opens their link: everything the page needs, in one call. Opens are only counted
-- while the message is readable. The first open is written to the sender's activity history.
create or replace function public.open_safe_send(p_token_hash text)
returns table (
  recipient_id uuid,
  recipient_email text,
  message_id uuid,
  subject text,
  sender_name text,
  sender_email text,
  sent_at timestamptz,
  expires_at timestamptz,
  withdrawn_at timestamptz,
  content_deleted_at timestamptz,
  storage_path text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.safe_send_recipients;
  m public.safe_send_messages;
  e public.emails;
  v_withdrawn timestamptz;
begin
  select * into r from public.safe_send_recipients where token_hash = p_token_hash;
  if not found then
    return;
  end if;
  select * into m from public.safe_send_messages where id = r.message_id;
  select * into e from public.emails where id = m.email_id;
  v_withdrawn := coalesce(m.withdrawn_at, r.withdrawn_at);

  if v_withdrawn is null and m.content_deleted_at is null and m.expires_at > now() then
    update public.safe_send_recipients
    set open_count = open_count + 1,
        first_opened_at = coalesce(first_opened_at, now()),
        last_opened_at = now()
    where id = r.id;
    if r.first_opened_at is null then
      insert into public.activity_log (user_id, email_id, action, recipient_email)
      values (m.user_id, m.email_id, 'opened', r.recipient_email);
    end if;
  end if;

  return query
  select r.id, r.recipient_email, m.id, e.subject,
    (select p.display_name from public.profiles p where p.user_id = m.user_id),
    coalesce(
      (select a.email from public.connected_accounts a where a.id = e.account_id),
      (select u.email::text from auth.users u where u.id = m.user_id)
    ),
    e.sent_at, m.expires_at, v_withdrawn, m.content_deleted_at, m.storage_path;
end;
$$;

-- Destroy content keys: one message (withdrawn for everyone) or every expired one.
-- Returns the storage paths, so the server can delete the encrypted files too.
create or replace function public.shred_safe_send(p_message_id uuid default null, p_limit integer default 50)
returns table (id uuid, storage_path text, user_id uuid, email_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with targets as (
    select m.id, m.key_ref
    from public.safe_send_messages m
    where m.content_deleted_at is null
      and ((p_message_id is null and m.expires_at <= now()) or m.id = p_message_id)
    order by m.expires_at
    limit greatest(1, least(p_limit, 200))
    for update skip locked
  ),
  destroyed as (
    delete from vault.secrets s using targets t where s.id = t.key_ref
  )
  update public.safe_send_messages m
  set key_ref = null, content_deleted_at = now()
  from targets t
  where m.id = t.id
  returning m.id, m.storage_path, m.user_id, m.email_id;
end;
$$;

revoke all on function public.create_safe_send(uuid, uuid, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.get_safe_send_key(uuid) from public, anon, authenticated;
revoke all on function public.open_safe_send(text) from public, anon, authenticated;
revoke all on function public.shred_safe_send(uuid, integer) from public, anon, authenticated;
grant execute on function public.create_safe_send(uuid, uuid, text, text, jsonb) to service_role;
grant execute on function public.get_safe_send_key(uuid) to service_role;
grant execute on function public.open_safe_send(text) to service_role;
grant execute on function public.shred_safe_send(uuid, integer) to service_role;
