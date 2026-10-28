-- AI check events, activity history, and schema-wide guarantees.
begin;
select plan(8);

-- Trust rule 7: the AI check log has no column that could hold email text.
select columns_are(
  'public', 'ai_check_events',
  array['id', 'user_id', 'email_id', 'finding_types', 'accepted', 'dismissed', 'model', 'latency_ms', 'created_at'],
  'ai_check_events stores finding types and outcomes only, never email text'
);

-- Every table in public has row-level security on.
select is_empty(
  $$ select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity $$,
  'row-level security is enabled on every public table'
);

-- Every SECURITY DEFINER function pins its search_path (Supabase security advisor).
select is_empty(
  $$ select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.prosecdef
       and not exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%') $$,
  'security definer functions set search_path'
);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ada@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'ben@example.com');
insert into public.ai_check_events (user_id, finding_types, accepted) values
  ('11111111-1111-1111-1111-111111111111', '{missing_attachment,wrong_name}', 1),
  ('22222222-2222-2222-2222-222222222222', '{reply_all}', 0);
insert into public.activity_log (user_id, action) values
  ('11111111-1111-1111-1111-111111111111', 'held'),
  ('22222222-2222-2222-2222-222222222222', 'sent');

select throws_ok(
  $$ update public.activity_log set action = 'cancelled' $$,
  '23514', null, 'activity history is append-only'
);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select results_eq($$ select count(*)::int from public.ai_check_events $$, $$ values (1) $$, 'users see only their own AI checks');
select results_eq($$ select count(*)::int from public.activity_log $$, $$ values (1) $$, 'users see only their own activity');
select throws_ok(
  $$ insert into public.activity_log (user_id, action) values (auth.uid(), 'sent') $$,
  '42501', null, 'clients cannot write history'
);

reset role;
set local role anon;
select throws_ok($$ select * from public.emails $$, '42501', null, 'anonymous visitors cannot read emails');

select * from finish();
rollback;
