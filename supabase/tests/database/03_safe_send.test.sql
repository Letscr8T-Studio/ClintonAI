-- Safe Send: withdraw, never edit; withdrawals are permanent; the 24-hour window is fixed; private storage.
begin;
select plan(12);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ada@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'ben@example.com');
insert into public.connected_accounts (id, user_id, provider, email) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'google', 'ada@example.com');
insert into public.emails (id, user_id, account_id, to_recipients, send_at, safe_send) values
  ('eeeeeeee-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'aaaaaaaa-0000-0000-0000-000000000001', '["kemi@client.co","tunde@client.co"]', now(), true),
  ('eeeeeeee-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'aaaaaaaa-0000-0000-0000-000000000001', '["old@client.co"]', now(), true);

insert into public.safe_send_messages (id, email_id, user_id, storage_path, expires_at) values
  ('55555555-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111', 'ada/msg1.bin', now() + interval '24 hours');
insert into public.safe_send_recipients (id, message_id, user_id, recipient_email, token_hash) values
  ('66666666-0000-0000-0000-000000000001', '55555555-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111', 'kemi@client.co', repeat('a', 64)),
  ('66666666-0000-0000-0000-000000000002', '55555555-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111', 'tunde@client.co', repeat('b', 64));

select throws_ok(
  $$ insert into public.safe_send_messages (email_id, user_id, storage_path, expires_at)
     values ('eeeeeeee-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'x', now() + interval '48 hours') $$,
  '23514', null, 'the Unsend window cannot exceed 24 hours'
);
select throws_ok(
  $$ update public.safe_send_messages set storage_path = 'ada/swapped.bin' where id = '55555555-0000-0000-0000-000000000001' $$,
  '23514', null, 'delivered content can never be swapped (withdraw, never edit)'
);
select throws_ok(
  $$ update public.safe_send_messages set expires_at = now() + interval '20 hours' where id = '55555555-0000-0000-0000-000000000001' $$,
  '23514', null, 'the window is fixed at creation'
);

-- Withdraw for one recipient, then everyone.
select lives_ok(
  $$ update public.safe_send_recipients set withdrawn_at = now() where id = '66666666-0000-0000-0000-000000000001' $$,
  'a sender can withdraw for one recipient'
);
select throws_ok(
  $$ update public.safe_send_recipients set withdrawn_at = null where id = '66666666-0000-0000-0000-000000000001' $$,
  '23514', null, 'a withdrawal cannot be undone (always visible)'
);
select lives_ok(
  $$ update public.safe_send_messages set withdrawn_at = now() where id = '55555555-0000-0000-0000-000000000001' $$,
  'a sender can withdraw for everyone within 24 hours'
);
select lives_ok(
  $$ update public.safe_send_messages set content_deleted_at = now(), key_ref = null
     where id = '55555555-0000-0000-0000-000000000001' $$,
  'content and its key can be destroyed'
);
select throws_ok(
  $$ update public.safe_send_messages set content_deleted_at = null where id = '55555555-0000-0000-0000-000000000001' $$,
  '23514', null, 'deleted content cannot be restored'
);
select throws_ok(
  $$ update public.safe_send_recipients set token_hash = repeat('c', 64) where id = '66666666-0000-0000-0000-000000000002' $$,
  '23514', null, 'a recipient link cannot be re-pointed'
);

select is(
  (select public from storage.buckets where id = 'safe-send'), false, 'the Safe Send bucket is private'
);

-- Clients: own rows only, no secrets.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select is_empty($$ select 1 from public.safe_send_recipients $$, 'other users cannot see your recipients');
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select throws_ok($$ select token_hash from public.safe_send_recipients $$, '42501', null, 'link token hashes are server-only');

select * from finish();
rollback;
