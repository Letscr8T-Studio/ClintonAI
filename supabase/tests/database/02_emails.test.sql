-- Emails and accounts: owners read metadata only; writes are server-only; the lifecycle is enforced.
begin;
select plan(14);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ada@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'ben@example.com');

insert into public.connected_accounts (id, user_id, provider, email, vault_secret_id) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'google', 'ada@example.com',
   vault.create_secret('refresh-token-ada')),
  ('bbbbbbbb-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'google', 'ben@example.com', null);

insert into public.emails (id, user_id, account_id, subject, to_recipients, body_encrypted, send_at) values
  ('eeeeeeee-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'aaaaaaaa-0000-0000-0000-000000000001', 'Q3 update', '["investor@fund.co"]', 'ciphertext', now() + interval '5 min'),
  ('eeeeeeee-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
   'bbbbbbbb-0000-0000-0000-000000000002', 'Hi', '["x@y.co"]', 'ciphertext', now());

select is(
  (select safe_send from public.emails where id = 'eeeeeeee-0000-0000-0000-000000000001'),
  false, 'Safe Send is off unless chosen (trust rule 3)'
);
select throws_ok(
  $$ insert into public.emails (user_id, account_id, to_recipients, send_at)
     values ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-0000-0000-0000-000000000002', '["a@b.co"]', now()) $$,
  '23503', null, 'an email cannot use another user''s account'
);
select throws_ok(
  $$ insert into public.emails (user_id, account_id, to_recipients, send_at)
     values ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', '[]', now()) $$,
  '23514', null, 'an email needs at least one recipient'
);

-- Lifecycle.
select throws_ok(
  $$ update public.emails set status = 'sent', sent_at = now() where id = 'eeeeeeee-0000-0000-0000-000000000001' $$,
  '23514', null, 'held cannot jump straight to sent'
);
update public.emails set status = 'sending' where id = 'eeeeeeee-0000-0000-0000-000000000001';
update public.emails set status = 'sent', sent_at = now() where id = 'eeeeeeee-0000-0000-0000-000000000001';
select is(
  (select body_encrypted from public.emails where id = 'eeeeeeee-0000-0000-0000-000000000001'),
  null, 'the body is wiped once the email is sent (minimal data)'
);
select throws_ok(
  $$ update public.emails set subject = 'edited' where id = 'eeeeeeee-0000-0000-0000-000000000001' $$,
  '23514', null, 'a sent email can never be edited (trust rule 1)'
);
select throws_ok(
  $$ update public.emails set status = 'held' where id = 'eeeeeeee-0000-0000-0000-000000000001' $$,
  '23514', null, 'a sent email cannot go back to held'
);

-- Act as Ada.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select results_eq($$ select count(*)::int from public.emails $$, $$ values (1) $$, 'a user sees only their own emails');
select results_eq(
  $$ select count(*)::int from public.connected_accounts $$, $$ values (1) $$,
  'a user sees only their own accounts'
);
select throws_ok($$ select body_encrypted from public.emails $$, '42501', null, 'the encrypted body is never readable by clients');
select throws_ok($$ select vault_secret_id from public.connected_accounts $$, '42501', null, 'token references are never readable by clients');
select throws_ok(
  $$ insert into public.emails (user_id, account_id, to_recipients, send_at)
     values (auth.uid(), 'aaaaaaaa-0000-0000-0000-000000000001', '["a@b.co"]', now()) $$,
  '42501', null, 'clients cannot create emails directly (server validates first)'
);

reset role;

-- Disconnecting an account destroys its stored token.
delete from public.emails where account_id = 'aaaaaaaa-0000-0000-0000-000000000001';
create temporary table ada_secret as
  select vault_secret_id as id from public.connected_accounts where id = 'aaaaaaaa-0000-0000-0000-000000000001';
delete from public.connected_accounts where id = 'aaaaaaaa-0000-0000-0000-000000000001';
select is_empty(
  $$ select 1 from vault.secrets where id in (select id from ada_secret) $$,
  'disconnecting an account deletes its Vault secret'
);

-- Deleting a user removes all their data.
delete from auth.users where id = '22222222-2222-2222-2222-222222222222';
select is_empty(
  $$ select 1 from public.emails where user_id = '22222222-2222-2222-2222-222222222222' $$,
  'deleting a user deletes their emails'
);

select * from finish();
rollback;
