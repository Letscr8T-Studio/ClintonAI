-- Dashboard numbers: counted correctly, only ever the signed-in user's own rows, never for anon.
begin;
select plan(9);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ada@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'eve@example.com');
insert into public.connected_accounts (id, user_id, provider, email) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'google', 'ada@gmail.com'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'google', 'eve@gmail.com');

insert into public.emails
  (id, user_id, account_id, subject, to_recipients, send_at, status, sent_at, safe_send, findings_count, findings_accepted, created_at)
values
  -- Ada: two sent recently (one Safe Send), one waiting, one sent long ago.
  ('eeeeeeee-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Pricing', '["kemi@client.co"]', now(), 'sent', now(), true, 3, 2, now()),
  ('eeeeeeee-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Hello', '["tunde@client.co"]', now(), 'sent', now(), false, 1, 5, now()),
  ('eeeeeeee-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Later', '["tunde@client.co"]', now() + interval '5 minutes', 'held', null, false, 0, 0, now()),
  ('eeeeeeee-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Old', '["tunde@client.co"]', now() - interval '60 days', 'sent', now() - interval '60 days', false, 4, 4,
   now() - interval '60 days'),
  -- Eve: must never show up in Ada's numbers.
  ('eeeeeeee-0000-0000-0000-000000000009', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-0000-0000-0000-000000000002',
   'Eve', '["x@y.co"]', now(), 'sent', now(), false, 9, 9, now());

select public.create_safe_send(
  'eeeeeeee-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'ada/msg.bin', 'k',
  jsonb_build_array(
    jsonb_build_object('email', 'kemi@client.co', 'token_hash', repeat('a', 64)),
    jsonb_build_object('email', 'bola@client.co', 'token_hash', repeat('b', 64))
  )
);
select public.open_safe_send(repeat('a', 64));

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
create temporary table stats as select * from public.dashboard_stats(now() - interval '30 days');

select is((select sent from stats), 2, 'sent counts only sent emails in the window');
select is((select caught from stats), 4, 'caught adds up every finding in the window');
select is((select fixed from stats), 3, 'fixed never exceeds what was caught for an email');
select is((select safe_send_people from stats), 2, 'Safe Send counts each person');
select is((select safe_send_opened from stats), 1, 'opened counts people who opened');
select is((select waiting from stats), 1, 'waiting counts emails still in the countdown');
select is((select withdrawable from stats), 1, 'withdrawable counts Safe Send still readable');

select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select is((select sent from public.dashboard_stats(now() - interval '30 days')), 1, 'another user sees only their own');

reset role;
set local role anon;
select throws_ok(
  $$select * from public.dashboard_stats(now())$$, '42501', null, 'anon cannot call it'
);

select * from finish();
rollback;
