-- Still: private email reservations and per-account journals.
-- Email reservations are inserted separately, never shipped to the browser.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null unique check (name in ('Jimmy', 'Juan', 'Bre'))
);
create table public.journals (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  data jsonb not null default '{"fasts":[],"intake":[],"checks":{},"waterGoal":2000,"notes":[],"checkins":[],"sleep":[],"workouts":[]}'::jsonb,
  revision bigint not null default 1,
  updated_at timestamptz not null default now(),
  constraint journal_object check (jsonb_typeof(data) = 'object')
);
create table private.members (
  email text primary key check (email = lower(email)),
  name text not null unique check (name in ('Jimmy', 'Juan', 'Bre'))
);
alter table public.profiles enable row level security;
alter table public.journals enable row level security;
alter table private.members enable row level security;
revoke all on public.profiles, public.journals from anon, authenticated;
revoke all on private.members from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant select, update (data, revision, updated_at) on public.journals to authenticated;
create policy "Read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Read own journal" on public.journals for select to authenticated using ((select auth.uid()) = user_id);
create policy "Update own journal" on public.journals for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- This trigger is not an RPC and has no client EXECUTE privileges. Auth invokes it
-- during signup, before a session exists; identity comes from the reserved email.
create function private.provision_still_member() returns trigger
language plpgsql security definer set search_path = '' as $$
declare reserved_name text;
begin
  select name into reserved_name from private.members where email = lower(new.email);
  if reserved_name is null then
    raise exception 'This app is available to its reserved members only.';
  end if;
  insert into public.profiles (id, name) values (new.id, reserved_name);
  insert into public.journals (user_id) values (new.id);
  return new;
end;
$$;
revoke all on function private.provision_still_member() from public, anon, authenticated;
create trigger provision_still_member after insert on auth.users
  for each row execute function private.provision_still_member();
create policy "No client access" on private.members for all to anon, authenticated using (false) with check (false);
-- Supabase's project-created event trigger is internal, not a client RPC.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
