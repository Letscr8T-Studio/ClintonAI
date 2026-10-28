-- Profiles: auto-created on sign-up; users read and edit only their own settings.
begin;
select plan(9);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'ada@example.com', '{"full_name":"Ada Obi","avatar_url":"https://x.test/a.png"}'),
  ('22222222-2222-2222-2222-222222222222', 'ben@example.com', '{}');

select results_eq(
  $$ select display_name from public.profiles where user_id = '11111111-1111-1111-1111-111111111111' $$,
  $$ values ('Ada Obi'::text) $$,
  'a profile is created on sign-up from the Google name'
);
select is(
  (select default_delay_seconds from public.profiles where user_id = '22222222-2222-2222-2222-222222222222'),
  300, 'Smart Delay defaults to 5 minutes'
);
select is(
  (select open_tracking from public.profiles where user_id = '22222222-2222-2222-2222-222222222222'),
  false, 'open tracking is off by default'
);

-- Act as Ada.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select results_eq(
  $$ select count(*)::int from public.profiles $$, $$ values (1) $$,
  'a user sees only their own profile'
);
select lives_ok(
  $$ update public.profiles set default_delay_seconds = 600 where user_id = auth.uid() $$,
  'a user can change their own Smart Delay'
);
select throws_ok(
  $$ update public.profiles set default_delay_seconds = 5 where user_id = auth.uid() $$,
  '23514', null, 'Smart Delay must be between 1 and 30 minutes'
);
select is_empty(
  $$ update public.profiles set display_name = 'hacked'
     where user_id = '22222222-2222-2222-2222-222222222222' returning 1 $$,
  'a user cannot change someone else''s profile'
);
select throws_ok(
  $$ update public.profiles set created_at = now() where user_id = auth.uid() $$,
  '42501', null, 'users cannot edit protected columns'
);

reset role;
set local role anon;
select throws_ok($$ select * from public.profiles $$, '42501', null, 'anonymous visitors cannot read profiles');

select * from finish();
rollback;
