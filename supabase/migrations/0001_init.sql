-- mobileDrive — initial schema
-- Run against your Supabase project either via `supabase db push` or the SQL editor.
--
-- Design notes:
--   * `profiles` extends auth.users 1:1 and is created automatically on signup via a trigger.
--   * All user-owned tables (saved_configurations, wishlists, orders, order_items) are
--     protected by Row Level Security — a user can only touch their own rows.
--   * `vehicles` is readable by anyone (public catalog) but writable only by admins
--     (modeled as a `profiles.role = 'admin'` check — add a `role` column when needed).

------------------------------------------------------------------
-- Extensions
------------------------------------------------------------------
create extension if not exists "uuid-ossp";

------------------------------------------------------------------
-- profiles
------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text unique,
  full_name  text,
  avatar_url text,
  phone      text,
  region     text check (region in ('US','GH','EU')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep profiles.updated_at fresh
create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_touch
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();

-- Auto-create a profile row when a new auth.users row is inserted
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

create policy "profiles are visible to their owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are updatable by their owner"
  on public.profiles for update
  using (auth.uid() = id);

------------------------------------------------------------------
-- vehicles (public catalog)
------------------------------------------------------------------
create table public.vehicles (
  id                  text primary key,
  brand               text        not null,
  model               text        not null,
  year                int         not null,
  price               int         not null,
  currency            text        not null check (currency in ('USD','GHS','EUR')),
  body_type           text        not null,
  fuel_type           text        not null,
  transmission        text        not null,
  drive_type          text        not null,
  horsepower          int         not null,
  acceleration        numeric(4,2) not null,
  top_speed           int         not null,
  range_km            int,
  description         text        not null,
  features            text[]      not null default '{}',
  model_path          text,
  hero_color_id       text        not null,
  available_colors    jsonb       not null default '[]'::jsonb,
  available_wheels    jsonb       not null default '[]'::jsonb,
  available_interiors jsonb       not null default '[]'::jsonb,
  available_packages  jsonb       not null default '[]'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger vehicles_touch
  before update on public.vehicles
  for each row execute procedure public.touch_updated_at();

alter table public.vehicles enable row level security;

create policy "vehicles are readable by anyone"
  on public.vehicles for select
  using (true);

-- Writes require elevation (service-role or admin logic). No INSERT/UPDATE policy means
-- anon/authenticated clients can only read.

------------------------------------------------------------------
-- saved_configurations
------------------------------------------------------------------
create table public.saved_configurations (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  vehicle_id  text not null references public.vehicles(id) on delete cascade,
  color_id    text not null,
  wheel_id    text not null,
  interior_id text not null,
  package_ids text[] not null default '{}',
  label       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index saved_configurations_user on public.saved_configurations(user_id);

create trigger saved_configurations_touch
  before update on public.saved_configurations
  for each row execute procedure public.touch_updated_at();

alter table public.saved_configurations enable row level security;

create policy "configurations are visible to their owner"
  on public.saved_configurations for select using (auth.uid() = user_id);
create policy "configurations are insertable by their owner"
  on public.saved_configurations for insert with check (auth.uid() = user_id);
create policy "configurations are updatable by their owner"
  on public.saved_configurations for update using (auth.uid() = user_id);
create policy "configurations are deletable by their owner"
  on public.saved_configurations for delete using (auth.uid() = user_id);

------------------------------------------------------------------
-- wishlists
------------------------------------------------------------------
create table public.wishlists (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  vehicle_id text not null references public.vehicles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, vehicle_id)
);

create index wishlists_user on public.wishlists(user_id);

alter table public.wishlists enable row level security;

create policy "wishlists are visible to their owner"
  on public.wishlists for select using (auth.uid() = user_id);
create policy "wishlists are mutable by their owner"
  on public.wishlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

------------------------------------------------------------------
-- orders & order_items
------------------------------------------------------------------
create table public.orders (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  status               text not null default 'pending'
                         check (status in ('pending','paid','production','quality','shipping','delivered','cancelled')),
  subtotal             int  not null,
  options_total        int  not null default 0,
  taxes                int  not null default 0,
  grand_total          int  not null,
  currency             text not null check (currency in ('USD','GHS','EUR')),
  delivery_method      text not null check (delivery_method in ('door','pickup')),
  delivery_address     jsonb not null,
  payment_method       text not null,
  payment_provider_id  text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index orders_user on public.orders(user_id);
create trigger orders_touch
  before update on public.orders
  for each row execute procedure public.touch_updated_at();

alter table public.orders enable row level security;

create policy "orders are visible to their owner"
  on public.orders for select using (auth.uid() = user_id);
create policy "orders are insertable by their owner"
  on public.orders for insert with check (auth.uid() = user_id);
-- Updates (status transitions, payment confirmation) typically require elevated access;
-- gate those with service-role calls, not a client-facing policy.

create table public.order_items (
  id             uuid primary key default uuid_generate_v4(),
  order_id       uuid not null references public.orders(id) on delete cascade,
  vehicle_id     text not null references public.vehicles(id),
  configuration  jsonb not null,
  unit_price     int not null,
  options_price  int not null default 0,
  line_total     int not null
);

create index order_items_order on public.order_items(order_id);

alter table public.order_items enable row level security;

create policy "order items are visible to their order's owner"
  on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid()));
create policy "order items are insertable by their order's owner"
  on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid()));
