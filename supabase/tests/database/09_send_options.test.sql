-- Send options: attachments and send settings are locked once an email leaves; "Likely opened"
-- counts only sent, tracked emails after the first seconds; stale uploads are found; nothing here
-- is callable by clients, and clients never see the pixel token hash.
begin;
select plan(11);

insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'ada@example.com');
insert into public.connected_accounts (id, user_id, provider, email) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'google', 'ada@example.com');

insert into public.emails (id, user_id, account_id, subject, to_recipients, body_encrypted, send_at, attachments, track_opens, open_token_hash) values
  ('eeeeeeee-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'aaaaaaaa-0000-0000-0000-000000000001', 'tracked', '["a@x.co"]', 'c1', now(),
   '[{"path": "11111111-1111-1111-1111-111111111111/keep", "name": "deck.pdf", "size": 10, "type": "application/pdf"}]',
   true, repeat('a', 64)),
  ('eeeeeeee-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'aaaaaaaa-0000-0000-0000-000000000001', 'untracked', '["a@x.co"]', 'c2', now(), '[]', false, repeat('b', 64));

-- A pixel load before the email is sent does nothing.
select public.record_email_open(repeat('a', 64));
select is((select opens_count from public.emails where subject = 'tracked'), 0, 'no opens before it is sent');

update public.emails set status = 'sending' where subject in ('tracked', 'untracked');
update public.emails set status = 'sent', sent_at = now() - interval '1 minute' where subject in ('tracked', 'untracked');

select throws_ok(
  $$ update public.emails set attachments = '[]' where subject = 'tracked' $$,
  '23514', null, 'attachments cannot change after the email has left'
);
select throws_ok(
  $$ update public.emails set track_opens = false where subject = 'tracked' $$,
  '23514', null, 'the tracking choice cannot change after the email has left'
);

select public.record_email_open(repeat('a', 64));
select public.record_email_open(repeat('a', 64));
select results_eq(
  $$ select opens_count, first_opened_at is not null from public.emails where subject = 'tracked' $$,
  $$ values (2, true) $$,
  'opens of a sent, tracked email are counted'
);
select public.record_email_open(repeat('b', 64));
select is((select opens_count from public.emails where subject = 'untracked'), 0, 'untracked emails are never counted');
select public.record_email_open(repeat('c', 64));
select pass('an unknown token is ignored without error');

-- Stale uploads: old, and not part of a waiting email.
insert into storage.objects (bucket_id, name, created_at) values
  ('attachments', '11111111-1111-1111-1111-111111111111/old', now() - interval '2 days'),
  ('attachments', '11111111-1111-1111-1111-111111111111/new', now());
insert into public.emails (user_id, account_id, subject, to_recipients, body_encrypted, send_at, attachments) values
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 'waiting', '["a@x.co"]', 'c3',
   now() + interval '1 day', '[{"path": "11111111-1111-1111-1111-111111111111/held", "name": "a.pdf", "size": 1, "type": "application/pdf"}]');
insert into storage.objects (bucket_id, name, created_at) values
  ('attachments', '11111111-1111-1111-1111-111111111111/held', now() - interval '2 days');
select results_eq(
  $$ select * from public.stale_attachments(100) $$,
  $$ values ('11111111-1111-1111-1111-111111111111/old'::text) $$,
  'only old uploads that no waiting email uses are stale'
);

-- Clients.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);
select results_eq(
  $$ select opens_count, jsonb_array_length(attachments) from public.emails where subject = 'tracked' $$,
  $$ values (2, 1) $$,
  'users can read their open counts and attachment names'
);
select throws_ok($$ select open_token_hash from public.emails $$, '42501', null, 'users never see the pixel token hash');
select throws_ok($$ select public.record_email_open(repeat('a', 64)) $$, '42501', null, 'clients cannot record opens');
select throws_ok($$ select * from public.stale_attachments(10) $$, '42501', null, 'clients cannot list stale files');

select * from finish();
rollback;
