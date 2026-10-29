-- Wire dealer_id onto the three tables that need showroom scope.
--
-- profiles.dealer_id — which showroom a 'dealer'-role user staffs. Null for
--   customers and admins.
-- orders.dealer_id — which showroom gets credit / handles fulfilment.
-- test_drive_bookings.dealer_id — which showroom receives the booking.
--
-- Backfill assigns every existing row to the Accra showroom so the dealer
-- dashboards aren't blank on first load.

alter table public.profiles
  add column if not exists dealer_id uuid references public.dealers(id) on delete set null;

alter table public.orders
  add column if not exists dealer_id uuid references public.dealers(id) on delete set null;

alter table public.test_drive_bookings
  add column if not exists dealer_id uuid references public.dealers(id) on delete set null;

create index if not exists profiles_dealer_idx on public.profiles(dealer_id);
create index if not exists orders_dealer_idx on public.orders(dealer_id);
create index if not exists bookings_dealer_idx on public.test_drive_bookings(dealer_id);

update public.profiles set dealer_id = (select id from public.dealers where slug='accra')
  where role = 'dealer' and dealer_id is null;
update public.orders set dealer_id = (select id from public.dealers where slug='accra')
  where dealer_id is null;
update public.test_drive_bookings set dealer_id = (select id from public.dealers where slug='accra')
  where dealer_id is null;
