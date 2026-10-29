-- Phase 1 · Smart Delay: claim due emails safely, and wake the dispatcher on a schedule.

-- 1. Disconnecting Gmail keeps the email history: sent emails lose their account link, not their row.
--    (Held emails are cancelled by the server before the account is deleted.)
alter table public.emails drop constraint emails_account_id_user_id_fkey;
alter table public.emails alter column account_id drop not null;
alter table public.emails
  add constraint emails_account_id_user_id_fkey
  foreign key (account_id, user_id) references public.connected_accounts (id, user_id)
  on delete set null (account_id);

-- 2. Claim emails for sending: held -> sending, one attempt counted. FOR UPDATE SKIP LOCKED means
--    two dispatchers running at once can never claim (and send) the same email.
--    With p_email_id ("Send now"), only that email is claimed, whatever its send_at.
create or replace function public.claim_emails(
  p_limit integer default 20,
  p_email_id uuid default null,
  p_user_id uuid default null
)
returns setof public.emails
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- An email stuck in "sending" means a dispatcher died mid-send. Gmail may already have it, so
  -- retrying could send it twice: mark it failed instead.
  update public.emails
  set status = 'failed',
      failure_reason = 'Sending was interrupted. Check your Gmail Sent folder before writing it again.'
  where status = 'sending' and updated_at < now() - interval '10 minutes';

  return query
  update public.emails e
  set status = 'sending', attempt_count = e.attempt_count + 1
  where e.id in (
    select id from public.emails
    where status = 'held'
      and (
        (p_email_id is null and send_at <= now())
        or (id = p_email_id and user_id = p_user_id)
      )
    order by send_at
    limit greatest(1, least(p_limit, 100))
    for update skip locked
  )
  returning e.*;
end;
$$;

-- 3. The dispatcher's address and shared secret live in Vault, set per environment by
--    configure_dispatcher() (npm run db:dispatcher locally; once by hand in production).
create or replace function public.configure_dispatcher(p_url text, p_secret text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_url !~ '^https?://' or char_length(p_secret) < 32 then
    raise exception 'dispatcher needs an http(s) URL and a secret of 32+ characters'
      using errcode = 'check_violation';
  end if;
  select id into v_id from vault.secrets where name = 'clinton_dispatch_url';
  if v_id is null then perform vault.create_secret(p_url, 'clinton_dispatch_url');
  else perform vault.update_secret(v_id, p_url); end if;

  select id into v_id from vault.secrets where name = 'clinton_cron_secret';
  if v_id is null then perform vault.create_secret(p_secret, 'clinton_cron_secret');
  else perform vault.update_secret(v_id, p_secret); end if;
end;
$$;

-- Fire-and-forget POST to the dispatcher. Does nothing until configure_dispatcher() has run.
create or replace function public.invoke_dispatcher()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url text;
  v_secret text;
begin
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'clinton_dispatch_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'clinton_cron_secret';
  if v_url is null or v_secret is null then
    return;
  end if;
  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_secret),
    body := '{}'::jsonb,
    timeout_milliseconds := 25000
  );
end;
$$;

revoke all on function public.claim_emails(integer, uuid, uuid) from public, anon, authenticated;
revoke all on function public.configure_dispatcher(text, text) from public, anon, authenticated;
revoke all on function public.invoke_dispatcher() from public, anon, authenticated;
grant execute on function public.claim_emails(integer, uuid, uuid) to service_role;
grant execute on function public.configure_dispatcher(text, text) to service_role;

-- 4. Wake the dispatcher every 20 seconds: an email leaves at most ~20 s after its countdown ends.
create extension if not exists pg_net;
create extension if not exists pg_cron;
select cron.schedule('clinton-dispatch', '20 seconds', 'select public.invoke_dispatcher()');
