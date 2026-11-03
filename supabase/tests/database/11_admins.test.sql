-- Founders console access: people can see only their own admin row, can never make themselves
-- admin, and can't read or write the access log.
begin;
select plan(6);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'founder@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'user@example.com');
insert into public.admins (user_id) values ('11111111-1111-1111-1111-111111111111');
insert into public.admin_access_log (user_id, action) values ('11111111-1111-1111-1111-111111111111', 'view dashboard');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);
select is((select count(*)::int from public.admins), 1, 'an admin sees their own row');

select set_config('request.jwt.claims', '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}', true);
select is((select count(*)::int from public.admins), 0, 'anyone else sees no admins at all');
select throws_ok(
  $$ insert into public.admins (user_id) values ('22222222-2222-2222-2222-222222222222') $$,
  '42501', null, 'nobody can make themselves an admin'
);
select throws_ok($$ select * from public.admin_access_log $$, '42501', null, 'the access log is not readable');
select throws_ok(
  $$ insert into public.admin_access_log (user_id, action) values (null, 'x') $$,
  '42501', null, 'the access log is not writable from the browser'
);

reset role;
delete from auth.users where id = '11111111-1111-1111-1111-111111111111';
select is((select count(*)::int from public.admin_access_log where user_id is null), 1, 'deleting an admin keeps the log, without the link');

select * from finish();
rollback;
