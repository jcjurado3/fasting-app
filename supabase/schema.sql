-- Still: private email reservations and per-account journals.
-- Safe to run again on the existing project. Tables are created only when missing.
-- Email reservations are inserted separately (see add-bre.sql), never shipped to the browser.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null unique check (name in ('Jimmy', 'Juan', 'Bre'))
);
create table if not exists public.journals (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  data jsonb not null default '{"fasts":[],"intake":[],"checks":{},"waterGoal":2000,"notes":[],"checkins":[],"sleep":[],"workouts":[]}'::jsonb,
  revision bigint not null default 1,
  updated_at timestamptz not null default now(),
  constraint journal_object check (jsonb_typeof(data) = 'object')
);
create table if not exists private.members (
  email text primary key check (email = lower(email)),
  name text not null unique check (name in ('Jimmy', 'Juan', 'Bre'))
);
alter table public.profiles drop constraint if exists profiles_name_check;
alter table public.profiles add constraint profiles_name_check check (name in ('Jimmy', 'Juan', 'Bre'));
alter table private.members drop constraint if exists members_name_check;
alter table private.members add constraint members_name_check check (name in ('Jimmy', 'Juan', 'Bre'));
alter table public.journals
  alter column data set default '{"fasts":[],"intake":[],"checks":{},"waterGoal":2000,"notes":[],"checkins":[],"sleep":[],"workouts":[]}'::jsonb;
alter table public.profiles enable row level security;
alter table public.journals enable row level security;
alter table private.members enable row level security;
revoke all on public.profiles, public.journals from anon, authenticated;
revoke all on private.members from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant select, update (data, revision, updated_at) on public.journals to authenticated;
drop policy if exists "Read own profile" on public.profiles;
drop policy if exists "Read own journal" on public.journals;
drop policy if exists "Update own journal" on public.journals;
drop policy if exists "No client access" on private.members;
create policy "Read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Read own journal" on public.journals for select to authenticated using ((select auth.uid()) = user_id);
create policy "Update own journal" on public.journals for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "No client access" on private.members for all to anon, authenticated using (false) with check (false);
-- This trigger is not an RPC and has no client EXECUTE privileges. Auth invokes it
-- during signup, before a session exists; identity comes from the reserved email.
create or replace function private.provision_still_member() returns trigger
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
drop trigger if exists provision_still_member on auth.users;
create trigger provision_still_member after insert on auth.users
  for each row execute function private.provision_still_member();
-- Shared garden: start and finish times only, so each member can see the other trees.
-- Journals, photos, and notes stay private to their owner.
create table if not exists public.garden_progress (
  name text primary key check (name in ('Jimmy', 'Juan', 'Bre')),
  fast_start timestamptz,
  fast_end timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.garden_progress enable row level security;
revoke all on public.garden_progress from anon, authenticated;
grant select, insert, update on public.garden_progress to authenticated;
drop policy if exists "Read the garden" on public.garden_progress;
drop policy if exists "Share own tree" on public.garden_progress;
drop policy if exists "Update own tree" on public.garden_progress;
create policy "Read the garden" on public.garden_progress
  for select to authenticated
  using (exists (select 1 from public.profiles where id = (select auth.uid())));
create policy "Share own tree" on public.garden_progress
  for insert to authenticated
  with check (name = (select name from public.profiles where id = (select auth.uid())));
create policy "Update own tree" on public.garden_progress
  for update to authenticated
  using (name = (select name from public.profiles where id = (select auth.uid())))
  with check (name = (select name from public.profiles where id = (select auth.uid())));
-- Supabase's project-created event trigger is internal, not a client RPC.
do $$
begin
  revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
exception
  when undefined_function then null;
end $$;
