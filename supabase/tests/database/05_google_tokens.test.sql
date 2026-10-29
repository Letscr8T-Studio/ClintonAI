-- Gmail tokens: stored encrypted in Vault, rotated in place, readable only by the server.
begin;
select plan(10);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ada@example.com');

-- Baseline, so the test also passes on a database that already holds real connections.
create temporary table baseline as
  select count(*)::int as n from vault.secrets where description like 'Google refresh token%';

-- First connect stores the token and creates the account.
create temporary table first_connect as
  select public.save_google_account(
    '11111111-1111-1111-1111-111111111111', ' Ada@Example.com ', '{https://www.googleapis.com/auth/gmail.send}', 'token-1'
  ) as id;

select is(
  (select email from public.connected_accounts where id = (select id from first_connect)),
  'ada@example.com', 'the address is normalised'
);
select is(
  public.get_account_refresh_token((select id from first_connect)), 'token-1',
  'the server can read the token back'
);
select isnt(
  (select secret from vault.secrets s join public.connected_accounts a on a.vault_secret_id = s.id
   where a.id = (select id from first_connect)),
  'token-1', 'the token is encrypted at rest'
);

-- Reconnecting rotates the same secret and reactivates the account.
update public.connected_accounts set status = 'revoked' where id = (select id from first_connect);
select is(
  public.save_google_account('11111111-1111-1111-1111-111111111111', 'ada@example.com', '{x}', 'token-2'),
  (select id from first_connect), 'reconnecting keeps the same account'
);
select is(public.get_account_refresh_token((select id from first_connect)), 'token-2', 'the token is rotated');
select is(
  (select status::text from public.connected_accounts where id = (select id from first_connect)),
  'active', 'reconnecting reactivates the account'
);
select is((select count(*)::int from vault.secrets where description like 'Google refresh token%'),
  (select n + 1 from baseline),
  'rotation does not leave old secrets behind');

select throws_ok(
  $$ select public.save_google_account('11111111-1111-1111-1111-111111111111', 'ada@example.com', '{}', '') $$,
  '23514', null, 'an empty token is refused'
);

-- Signed-in users and visitors cannot call either function.
select set_config('test.account_id', (select id::text from first_connect), true);
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select throws_ok(
  format('select public.get_account_refresh_token(%L)', current_setting('test.account_id')),
  '42501', null, 'users cannot read tokens, even their own'
);
reset role;
set local role anon;
select throws_ok(
  $$ select public.save_google_account('11111111-1111-1111-1111-111111111111', 'x@y.co', '{}', 't') $$,
  '42501', null, 'visitors cannot store tokens'
);

select * from finish();
rollback;
