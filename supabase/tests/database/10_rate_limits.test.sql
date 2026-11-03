-- Shared rate limits: counts are atomic per bucket and window, separate per bucket, and nothing
-- here is reachable from the browser.
begin;
select plan(5);

select is(public.rate_limit_take(repeat('a', 64), 60), 1, 'the first attempt in a window counts 1');
select is(public.rate_limit_take(repeat('a', 64), 60), 2, 'each attempt adds one');
select is(public.rate_limit_take(repeat('b', 64), 60), 1, 'buckets are counted separately');

set local role authenticated;
select throws_ok($$ select public.rate_limit_take(repeat('a', 64), 60) $$, '42501', null, 'users cannot call the limiter');
select throws_ok($$ select * from public.rate_limit_hits $$, '42501', null, 'users cannot read the counters');

select * from finish();
rollback;
