-- Shared rate limits: one counter per (bucket, time window), shared by every server instance and
-- kept across redeploys. Buckets are SHA-256 hashes made by the server (src/server/rate-limit.ts),
-- so no IP address or email is stored here.

create table public.rate_limit_hits (
  bucket text not null check (char_length(bucket) = 64),
  window_start timestamptz not null,
  hits integer not null default 1 check (hits > 0),
  primary key (bucket, window_start)
);

comment on table public.rate_limit_hits is 'Fixed-window rate-limit counters. Server-only; old windows deleted hourly.';

alter table public.rate_limit_hits enable row level security;
revoke all on table public.rate_limit_hits from anon, authenticated;

-- Counts one attempt in the current window and returns the total so far, in one atomic statement.
create or replace function public.rate_limit_take(p_bucket text, p_window_seconds integer)
returns integer
language sql
security definer
set search_path = ''
as $$
  insert into public.rate_limit_hits as r (bucket, window_start)
  values (
    p_bucket,
    to_timestamp(floor(extract(epoch from now()) / greatest(p_window_seconds, 1)) * greatest(p_window_seconds, 1))
  )
  on conflict (bucket, window_start) do update set hits = r.hits + 1
  returning hits;
$$;

revoke all on function public.rate_limit_take(text, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_take(text, integer) to service_role;

-- Windows are at most a day long; anything older is spent.
select cron.schedule(
  'clinton-rate-limit-cleanup',
  '17 * * * *',
  $$delete from public.rate_limit_hits where window_start < now() - interval '1 day'$$
);
