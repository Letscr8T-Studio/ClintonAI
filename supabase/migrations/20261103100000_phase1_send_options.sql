-- Phase 1 · send options: attachments, scheduled sends and "Likely opened".

-- 1. New columns on emails.
--    attachments: metadata only ({path, name, size, type}); the files wait in the private
--    "attachments" bucket while the email is held and are deleted once it leaves or is cancelled.
--    scheduled: send_at was picked by the user (Send later), not by the Smart Delay.
--    track_opens / opens: "Likely opened" for normal emails, opt-in (profiles.open_tracking).
--    Only the SHA-256 of the pixel token is stored; opens are a guess and labelled that way.
alter table public.emails
  add column attachments jsonb not null default '[]'::jsonb
    check (jsonb_typeof(attachments) = 'array' and jsonb_array_length(attachments) <= 10),
  add column scheduled boolean not null default false,
  add column track_opens boolean not null default false,
  add column open_token_hash text unique check (char_length(open_token_hash) = 64),
  add column opens_count integer not null default 0 check (opens_count >= 0),
  add column first_opened_at timestamptz,
  add column last_opened_at timestamptz;

comment on column public.emails.attachments is 'Attachment metadata ({path, name, size, type}). Files live in the attachments bucket only while held.';
comment on column public.emails.open_token_hash is 'SHA-256 of the "Likely opened" pixel token. Server-only.';

-- 2. What was sent can't change afterwards: attachments and send options join the locked fields.
create or replace function public.enforce_email_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status <> 'held' and (
    new.subject is distinct from old.subject
    or new.to_recipients is distinct from old.to_recipients
    or new.cc_recipients is distinct from old.cc_recipients
    or new.bcc_recipients is distinct from old.bcc_recipients
    or new.safe_send is distinct from old.safe_send
    or new.attachments is distinct from old.attachments
    or new.scheduled is distinct from old.scheduled
    or new.track_opens is distinct from old.track_opens
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

  if new.status in ('sent', 'cancelled', 'failed') then
    new.body_encrypted := null;
  end if;
  return new;
end;
$$;

-- 3. Users see the new metadata; never the token hash.
grant select (attachments, scheduled, track_opens, opens_count, first_opened_at, last_opened_at)
  on table public.emails to authenticated;

-- 4. The attachments bucket: private, service role only (uploads use signed URLs the server
--    creates for the user's own folder). 18 MB keeps a whole message under Gmail's 25 MB.
insert into storage.buckets (id, name, public, file_size_limit)
values ('attachments', 'attachments', false, 18874368)
on conflict (id) do nothing;

-- 5. A pixel load: counted only for sent emails that asked for it, and not in the first seconds
--    (mail scanners fetch images on arrival).
create or replace function public.record_email_open(p_token_hash text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.emails
  set opens_count = opens_count + 1,
      first_opened_at = coalesce(first_opened_at, now()),
      last_opened_at = now()
  where open_token_hash = p_token_hash
    and status = 'sent'
    and track_opens
    and now() > sent_at + interval '5 seconds';
$$;

-- 6. Uploads nobody sent (Compose closed, files removed) or left behind: older than 24 hours and
--    not part of an email that is still waiting. The dispatcher deletes them.
create or replace function public.stale_attachments(p_limit integer default 100)
returns setof text
language sql
stable
security definer
set search_path = ''
as $$
  select o.name
  from storage.objects o
  where o.bucket_id = 'attachments'
    and o.created_at < now() - interval '24 hours'
    and not exists (
      select 1 from public.emails e
      where e.status in ('held', 'sending')
        and e.attachments @> jsonb_build_array(jsonb_build_object('path', o.name))
    )
  order by o.created_at
  limit greatest(1, least(p_limit, 500));
$$;

revoke all on function public.record_email_open(text) from public, anon, authenticated;
revoke all on function public.stale_attachments(integer) from public, anon, authenticated;
grant execute on function public.record_email_open(text) to service_role;
grant execute on function public.stale_attachments(integer) to service_role;
