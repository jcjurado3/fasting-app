-- Apply in the Supabase SQL editor. Create two invited Auth users first.
-- Replace the UUID placeholders in the final commented statements with their Auth IDs.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null unique check (name in ('Jimmy', 'Juan'))
);
create table if not exists public.journals (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  data jsonb not null default '{"fasts":[],"intake":[],"checks":{},"waterGoal":2000,"notes":[]}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.journals enable row level security;
drop policy if exists "Read own profile" on public.profiles;
create policy "Read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Read own journal" on public.journals;
create policy "Read own journal" on public.journals for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Insert own journal" on public.journals;
create policy "Insert own journal" on public.journals for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Update own journal" on public.journals;
create policy "Update own journal" on public.journals for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke all on public.profiles, public.journals from anon;
grant select on public.profiles to authenticated;
grant select, insert, update on public.journals to authenticated;
-- insert into public.profiles (id, name) values
-- ('JIMMY_AUTH_UUID', 'Jimmy'), ('JUAN_AUTH_UUID', 'Juan');
