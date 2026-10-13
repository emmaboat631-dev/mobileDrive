-- mobileDrive — seed inventory
-- Keeps the Supabase vehicles table in sync with lib/vehicles/data.ts.
-- Run after 0001_init.sql.

insert into public.vehicles (
  id, brand, model, year, price, currency, body_type, fuel_type, transmission, drive_type,
  horsepower, acceleration, top_speed, range_km, description, features,
  model_path, hero_color_id,
  available_colors, available_wheels, available_interiors, available_packages
) values
  ('m4-competition', 'BMW', 'M4 Competition', 2025, 82400, 'USD', 'Coupe', 'Petrol', 'DCT', 'RWD',
   503, 3.9, 290, null,
   'A track-sharpened grand tourer. Twin-turbocharged inline-six, carbon roof, launch control, and a chassis tuned for both circuit and street.',
   array['Carbon roof','Adaptive M suspension','M Drive Professional','Launch Control'],
   null, 'midnight-blue',
   '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb),

  ('porsche-911', 'Porsche', '911 Carrera', 2025, 116400, 'USD', 'Sports', 'Petrol', 'DCT', 'RWD',
   388, 4.1, 294, null,
   'The icon, refined. Flat-six engineering, telepathic handling, timeless silhouette.',
   array['Sport Chrono','PASM','Sport exhaust','Launch Control'],
   null, 'racing-red',
   '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb),

  ('tesla-model-s', 'Tesla', 'Model S', 2025, 94990, 'USD', 'Electric', 'Electric', 'Automatic', 'AWD',
   670, 3.1, 250, 652,
   'All-electric performance sedan with yoke-free steering and tri-motor dynamics.',
   array['Autopilot','Glass roof','17" display','Over-the-air updates'],
   null, 'pearl-white',
   '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)

on conflict (id) do update set
  price = excluded.price,
  updated_at = now();

-- The option arrays (colors/wheels/interiors/packages) are populated via a separate
-- JSON import step in your deploy pipeline — see docs/supabase.md for the one-liner.
