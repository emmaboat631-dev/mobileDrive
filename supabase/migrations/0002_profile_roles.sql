-- mobileDrive — add role to profiles so /admin and /dealer can be gated.
--
-- 'customer' is the default and matches the behaviour before this migration.
-- Elevate individual users with:
--   update public.profiles set role = 'admin'  where email = 'you@example.com';
--   update public.profiles set role = 'dealer' where email = 'dealer@example.com';

alter table public.profiles
  add column if not exists role text not null default 'customer'
    check (role in ('customer','dealer','admin'));

create index if not exists profiles_role_idx on public.profiles(role);

-- Vehicles: admins can write; everyone keeps read.
drop policy if exists "vehicles are writable by admins" on public.vehicles;
create policy "vehicles are writable by admins"
  on public.vehicles for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
