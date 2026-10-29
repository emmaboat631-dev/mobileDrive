-- mobileDrive — multi-dealer support.
--
-- A dealer is a physical showroom. Platform admins manage the catalog and
-- rules; each dealer manages their own stock, bookings and sales. The default
-- 'mobileDrive Accra' row is seeded so there's at least one dealer to assign
-- rows to during local development.

create table if not exists public.dealers (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  slug       text unique not null,
  city       text,
  region     text,
  phone      text,
  email      text,
  address    text,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger dealers_touch
  before update on public.dealers
  for each row execute procedure public.touch_updated_at();

create index if not exists dealers_slug_idx on public.dealers(slug);

alter table public.dealers enable row level security;

create policy "dealers are readable by anyone"
  on public.dealers for select using (true);

create policy "dealers are writable by admins"
  on public.dealers for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

insert into public.dealers (name, slug, city, region, phone, email, address) values
  ('mobileDrive Accra', 'accra', 'Accra', 'Greater Accra',
   '+233 55 123 4567', 'accra@mobiledrive.app', '12 Independence Ave, Accra')
on conflict (slug) do nothing;
