-- Smart Delay: only due emails are claimed, each once; "Send now" is scoped to its owner;
-- a crashed send is never retried; disconnecting keeps history; nothing is callable by clients.
begin;
select plan(13);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ada@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'ben@example.com');
insert into public.connected_accounts (id, user_id, provider, email) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'google', 'ada@example.com');

insert into public.emails (id, user_id, account_id, subject, to_recipients, body_encrypted, send_at) values
  ('eeeeeeee-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'aaaaaaaa-0000-0000-0000-000000000001', 'due', '["a@x.co"]', 'c1', now() - interval '1 minute'),
  ('eeeeeeee-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'aaaaaaaa-0000-0000-0000-000000000001', 'later', '["a@x.co"]', 'c2', now() + interval '5 minutes'),
  ('eeeeeeee-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'aaaaaaaa-0000-0000-0000-000000000001', 'stuck', '["a@x.co"]', 'c3', now() - interval '1 hour');

-- A send that crashed 20 minutes ago.
update public.emails set status = 'sending' where id = 'eeeeeeee-0000-0000-0000-000000000003';
alter table public.emails disable trigger emails_set_updated_at;
update public.emails set updated_at = now() - interval '20 minutes' where id = 'eeeeeeee-0000-0000-0000-000000000003';
alter table public.emails enable trigger emails_set_updated_at;

create temporary table claimed as select * from public.claim_emails(20);

select results_eq($$ select subject from claimed $$, $$ values ('due') $$, 'only due, held emails are claimed');
select is(
  (select status::text from public.emails where id = 'eeeeeeee-0000-0000-0000-000000000001'),
  'sending', 'a claimed email moves to sending'
);
select is((select attempt_count::int from claimed), 1, 'each claim counts one attempt');
select is((select body_encrypted from claimed), 'c1', 'the dispatcher receives the encrypted body');
select is_empty($$ select * from public.claim_emails(20) $$, 'a claimed email is never claimed twice');
select is(
  (select status::text from public.emails where id = 'eeeeeeee-0000-0000-0000-000000000003'),
  'failed', 'an interrupted send is marked failed, never retried (no double sends)'
);

-- "Send now": only the owner can pull a not-yet-due email forward.
select is_empty(
  $$ select * from public.claim_emails(1, 'eeeeeeee-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222') $$,
  'another user cannot send your email now'
);
select results_eq(
  $$ select subject from public.claim_emails(1, 'eeeeeeee-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111') $$,
  $$ values ('later') $$,
  'the owner can send a held email now'
);

-- Disconnecting Gmail keeps the history.
update public.emails set status = 'sent', sent_at = now() where id = 'eeeeeeee-0000-0000-0000-000000000001';
delete from public.connected_accounts where id = 'aaaaaaaa-0000-0000-0000-000000000001';
select results_eq(
  $$ select subject, account_id from public.emails where id = 'eeeeeeee-0000-0000-0000-000000000001' $$,
  $$ values ('due'::text, null::uuid) $$,
  'deleting the account keeps sent emails, without the account link'
);

select lives_ok(
  $$ select public.configure_dispatcher('http://host.docker.internal:3000/api/cron/dispatch', repeat('s', 40)) $$,
  'the server can configure the dispatcher'
);
select throws_ok(
  $$ select public.configure_dispatcher('ftp://nope', 'short') $$,
  '23514', null, 'a bad dispatcher config is refused'
);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select throws_ok($$ select * from public.claim_emails(1) $$, '42501', null, 'clients cannot claim emails');
select throws_ok(
  $$ select public.configure_dispatcher('https://evil.example', repeat('s', 40)) $$,
  '42501', null, 'clients cannot point the dispatcher elsewhere'
);

select * from finish();
rollback;
