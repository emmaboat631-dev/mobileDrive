-- mobileDrive — vehicle media bucket + columns.
--
-- The `vehicle-media` storage bucket holds everything a vehicle needs for its
-- storefront: a hero shot, a gallery of extra angles, interior / color-swatch
-- photos, and optional .glb 3D models. The bucket is public read (anyone can
-- fetch an image via its URL), writable only by admins (RLS policy below).
--
-- Image URLs are stored directly on the `vehicles` row. The 3D model path
-- already exists on `model_path`.

-- Bucket (create via Studio or storage.buckets insert — included here for completeness)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vehicle-media',
  'vehicle-media',
  true,
  15728640,                                     -- 15 MB per file
  array['image/jpeg','image/png','image/webp','image/avif','model/gltf-binary','model/gltf+json']
)
on conflict (id) do nothing;

-- Public read of anything in the bucket (vehicle photos are public catalog data)
create policy "vehicle-media public read"
  on storage.objects for select
  using (bucket_id = 'vehicle-media');

-- Only admins can upload / replace / delete bucket contents
create policy "vehicle-media admin write"
  on storage.objects for all
  using (
    bucket_id = 'vehicle-media'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    bucket_id = 'vehicle-media'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Columns on vehicles for the uploaded image URLs
alter table public.vehicles
  add column if not exists hero_image_url text,
  add column if not exists gallery_image_urls text[] not null default '{}'::text[];
