-- Phase 1 · Smart Delay can be turned off (0 seconds): the email leaves as soon as it is sent.
-- Opt-in per person; the default stays 5 minutes. Otherwise whole minutes from 1 to 30.

alter table public.profiles drop constraint if exists profiles_default_delay_seconds_check;
alter table public.profiles add constraint profiles_default_delay_seconds_check
  check (default_delay_seconds = 0 or default_delay_seconds between 60 and 1800);
