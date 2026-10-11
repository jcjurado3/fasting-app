-- Apply this once to the existing Supabase project before reserving Bre's email.
-- The transaction keeps both allowlists in sync if either change fails.
begin;

alter table public.profiles
  drop constraint if exists profiles_name_check;
alter table public.profiles
  add constraint profiles_name_check
  check (name in ('Jimmy', 'Juan', 'Bre'));

alter table private.members
  drop constraint if exists members_name_check;
alter table private.members
  add constraint members_name_check
  check (name in ('Jimmy', 'Juan', 'Bre'));

commit;

-- Run separately after replacing the email with Bre's real lowercase address:
-- insert into private.members (email, name)
-- values ('bre@example.com', 'Bre')
-- on conflict (email) do update set name = excluded.name;
