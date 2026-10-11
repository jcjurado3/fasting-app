-- Apply this once to the existing Supabase project.
-- The transaction keeps both allowlists and Bre's reservation in sync.
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

do $$
declare
  existing_name text;
  existing_email text;
begin
  select name into existing_name
  from private.members
  where email = 'teamjurado3@gmail.com';

  if existing_name is not null and existing_name <> 'Bre' then
    raise exception 'teamjurado3@gmail.com is already reserved for %', existing_name;
  end if;

  select email into existing_email
  from private.members
  where name = 'Bre';

  if existing_name is null and existing_email is null then
    insert into private.members (email, name)
    values ('teamjurado3@gmail.com', 'Bre');
  elsif existing_email is not null and existing_email <> 'teamjurado3@gmail.com' then
    update private.members
    set email = 'teamjurado3@gmail.com'
    where name = 'Bre';
  end if;
end $$;

commit;
