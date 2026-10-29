-- Safe Send runtime: an exact 24 h window, keys in Vault, opens counted only while readable,
-- withdrawn / expired content shredded, and nothing callable by clients.
begin;
select plan(14);

insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'ada@example.com');
update public.profiles set display_name = 'Ada Obi' where user_id = '11111111-1111-1111-1111-111111111111';
insert into public.connected_accounts (id, user_id, provider, email) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'google', 'ada@gmail.com');
insert into public.emails (id, user_id, account_id, subject, to_recipients, send_at, status, sent_at, safe_send) values
  ('eeeeeeee-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'aaaaaaaa-0000-0000-0000-000000000001', 'Pricing deck v2', '["kemi@client.co","tunde@client.co"]',
   now(), 'sent', now(), true);

create temporary table created as
  select * from public.create_safe_send(
    'eeeeeeee-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'ada/msg.bin', 'data-key-1',
    jsonb_build_array(
      jsonb_build_object('email', 'Kemi@Client.co', 'token_hash', repeat('a', 64)),
      jsonb_build_object('email', 'tunde@client.co', 'token_hash', repeat('b', 64))
    )
  );

select is((select expires_at from created), now() + interval '24 hours', 'the window is exactly 24 hours');
select is(
  (select count(*)::int from public.safe_send_recipients where message_id = (select message_id from created)),
  2, 'each recipient gets their own link'
);
select is(public.get_safe_send_key((select message_id from created)), 'data-key-1', 'the key comes back from Vault');

-- Opening a link.
create temporary table opened as select * from public.open_safe_send(repeat('a', 64));
select results_eq(
  $$ select recipient_email, subject, sender_name, sender_email from opened $$,
  $$ values ('kemi@client.co'::text, 'Pricing deck v2'::text, 'Ada Obi'::text, 'ada@gmail.com'::text) $$,
  'the page gets the message and who sent it'
);
select is((select open_count from public.safe_send_recipients where token_hash = repeat('a', 64)), 1, 'the open is counted');
select is(
  (select count(*)::int from public.activity_log where action = 'opened'), 1, 'the first open lands in the history'
);
select * from public.open_safe_send(repeat('a', 64));
select is(
  (select count(*)::int from public.activity_log where action = 'opened'), 1, 'later opens are counted, not re-logged'
);
select is_empty($$ select * from public.open_safe_send(repeat('f', 64)) $$, 'an unknown link finds nothing');

-- Withdraw for one recipient: their page says so, and their opens stop counting.
update public.safe_send_recipients set withdrawn_at = now() where token_hash = repeat('b', 64);
select isnt((select withdrawn_at from public.open_safe_send(repeat('b', 64))), null, 'a withdrawn link says withdrawn');
select is((select open_count from public.safe_send_recipients where token_hash = repeat('b', 64)), 0, 'withdrawn links are not counted');

-- Withdraw for everyone, then shred.
update public.safe_send_messages set withdrawn_at = now() where id = (select message_id from created);
select results_eq(
  format('select storage_path from public.shred_safe_send(%L)', (select message_id from created)),
  $$ values ('ada/msg.bin'::text) $$,
  'shredding returns the file to delete'
);
select is(public.get_safe_send_key((select message_id from created)), null, 'the key is destroyed: content unreadable');
select is_empty(
  $$ select 1 from vault.secrets where description = 'Safe Send data key (Clinton AI)' and name is null
     and id not in (select key_ref from public.safe_send_messages where key_ref is not null) $$,
  'no orphaned keys are left in Vault'
);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select throws_ok($$ select * from public.open_safe_send(repeat('a', 64)) $$, '42501', null, 'clients cannot call Safe Send functions');

select * from finish();
rollback;
