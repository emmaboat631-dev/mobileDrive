-- mobileDrive — test drive bookings
--
-- A single row represents a user's request to test-drive a specific vehicle at
-- a specific date and time. The dealer sees these in /dealer/bookings and can
-- confirm or decline them.
--
-- The (user_id, vehicle_id, scheduled_at) uniqueness constraint prevents a user
-- from submitting duplicate bookings for the same vehicle at the same instant.

create table if not exists public.test_drive_bookings (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  vehicle_id    text not null references public.vehicles(id) on delete cascade,
  scheduled_at  timestamptz not null,
  full_name     text not null,
  phone         text not null,
  notes         text,
  status        text not null default 'pending'
                 check (status in ('pending','confirmed','declined','cancelled','completed')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, vehicle_id, scheduled_at)
);

create index if not exists test_drive_bookings_user on public.test_drive_bookings(user_id);
create index if not exists test_drive_bookings_vehicle on public.test_drive_bookings(vehicle_id);
create index if not exists test_drive_bookings_scheduled on public.test_drive_bookings(scheduled_at);

create trigger test_drive_bookings_touch
  before update on public.test_drive_bookings
  for each row execute procedure public.touch_updated_at();

alter table public.test_drive_bookings enable row level security;

create policy "bookings are visible to their owner"
  on public.test_drive_bookings for select using (auth.uid() = user_id);

create policy "bookings are visible to dealers and admins"
  on public.test_drive_bookings for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('dealer', 'admin')
    )
  );

create policy "bookings are insertable by their owner"
  on public.test_drive_bookings for insert with check (auth.uid() = user_id);

create policy "bookings are updatable by owner (status cancel) or staff"
  on public.test_drive_bookings for update
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('dealer', 'admin')
    )
  );
