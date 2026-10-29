-- mobileDrive — RLS hardening (Phase 7, item 40).
--
-- Fixes discovered by the RLS audit:
--
--   1. profiles UPDATE policy let a user set their own `role`, so any
--      authenticated customer could `update profiles set role='admin'
--      where id = auth.uid()` and gain full admin access. We now block
--      self-mutation of `role` and `dealer_id` with a trigger — only
--      service-role writes can change those columns.
--
--   2. test_drive_bookings SELECT and UPDATE policies admitted ANY user
--      with role in ('dealer','admin'), so dealer A could read and
--      confirm/decline dealer B's bookings. Policies are rewritten to
--      scope to the matching dealer_id (admins still see everything).
--
--   3. order_items had no dealer/admin SELECT policy, which meant the
--      dealer order-detail pages would silently rely on the service-role
--      client. Added a SELECT policy that joins through the parent order
--      so dealers can read line items of orders they are allowed to see.
--
-- Idempotent: safe to re-run.

------------------------------------------------------------------
-- 1) profiles: block self-mutation of role / dealer_id
------------------------------------------------------------------
create or replace function public.profiles_block_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service-role calls bypass RLS and don't have a session user, so
  -- auth.uid() is null — allow those (admin tooling / server actions).
  if auth.uid() is null then
    return new;
  end if;

  -- Only an admin can change role or dealer_id.
  if (new.role is distinct from old.role) or (new.dealer_id is distinct from old.dealer_id) then
    if not exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    ) then
      raise exception 'not allowed to change role or dealer_id';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_block_privilege_escalation on public.profiles;
create trigger profiles_block_privilege_escalation
  before update on public.profiles
  for each row execute procedure public.profiles_block_privilege_escalation();

------------------------------------------------------------------
-- 2) test_drive_bookings: scope dealer visibility to their dealer_id
------------------------------------------------------------------
drop policy if exists "bookings are visible to dealers and admins" on public.test_drive_bookings;
drop policy if exists "bookings scoped to dealer or admin" on public.test_drive_bookings;
create policy "bookings scoped to dealer or admin"
  on public.test_drive_bookings for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (
          p.role = 'admin'
          or (p.role = 'dealer' and p.dealer_id = test_drive_bookings.dealer_id)
        )
    )
  );

drop policy if exists "bookings are updatable by owner (status cancel) or staff" on public.test_drive_bookings;
drop policy if exists "bookings updatable by owner or dealer or admin" on public.test_drive_bookings;
create policy "bookings updatable by owner or dealer or admin"
  on public.test_drive_bookings for update
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (
          p.role = 'admin'
          or (p.role = 'dealer' and p.dealer_id = test_drive_bookings.dealer_id)
        )
    )
  );

------------------------------------------------------------------
-- 3) order_items: dealers / admins can read items of orders they can see
------------------------------------------------------------------
drop policy if exists "order items readable by dealer or admin" on public.order_items;
create policy "order items readable by dealer or admin"
  on public.order_items for select
  using (
    exists (
      select 1
      from public.orders o
      join public.profiles p on p.id = auth.uid()
      where o.id = order_items.order_id
        and (
          p.role = 'admin'
          or (p.role = 'dealer' and p.dealer_id = o.dealer_id)
        )
    )
  );
