-- RLS: an orders row is visible / updatable to admins (any) and to a
-- dealer-role user whose profiles.dealer_id matches the row's dealer_id.
-- The owner's existing SELECT/INSERT policies stay in place so a customer
-- can still see their own orders unchanged.

create policy "orders readable by their dealer"
  on public.orders for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'admin' or (p.role = 'dealer' and p.dealer_id = orders.dealer_id))
    )
  );

create policy "orders updatable by their dealer or admin"
  on public.orders for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'admin' or (p.role = 'dealer' and p.dealer_id = orders.dealer_id))
    )
  );
