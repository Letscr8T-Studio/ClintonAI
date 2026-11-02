-- Phase 1 · Dashboard: the four numbers at the top of Home, in one round trip.
-- security invoker: it runs as the signed-in user, so RLS applies and a user only ever counts
-- their own rows. The explicit user_id filters are for the indexes, not for safety.

create or replace function public.dashboard_stats(p_since timestamptz)
returns table (
  sent integer,
  caught integer,
  fixed integer,
  safe_send_people integer,
  safe_send_opened integer,
  waiting integer,
  withdrawable integer
)
language sql
stable
security invoker
set search_path = ''
as $$
  with mine as (
    select e.status, e.sent_at, e.created_at, e.findings_count, e.findings_accepted
    from public.emails e
    where e.user_id = (select auth.uid())
  ),
  people as (
    select r.first_opened_at
    from public.safe_send_recipients r
    join public.safe_send_messages m on m.id = r.message_id
    where m.user_id = (select auth.uid()) and m.created_at >= p_since
  )
  select
    (select count(*) from mine where status = 'sent' and sent_at >= p_since)::int,
    (select coalesce(sum(findings_count), 0) from mine where created_at >= p_since)::int,
    (select coalesce(sum(least(findings_accepted, findings_count)), 0) from mine where created_at >= p_since)::int,
    (select count(*) from people)::int,
    (select count(*) from people where first_opened_at is not null)::int,
    -- Still in the Smart Delay countdown: can be cancelled outright.
    (select count(*) from mine where status = 'held')::int,
    -- Safe Send still readable: can be withdrawn.
    (select count(*) from public.safe_send_messages m
      where m.user_id = (select auth.uid())
        and m.withdrawn_at is null and m.content_deleted_at is null and m.expires_at > now())::int;
$$;

comment on function public.dashboard_stats(timestamptz) is
  'Home dashboard numbers for the signed-in user since p_since (waiting/withdrawable are "right now").';

revoke all on function public.dashboard_stats(timestamptz) from public, anon;
grant execute on function public.dashboard_stats(timestamptz) to authenticated;
