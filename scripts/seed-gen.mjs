import { VEHICLES } from '../lib/vehicles/data.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const esc = (s) => String(s).replace(/'/g, "''");
const j = (o) => `'${esc(JSON.stringify(o))}'::jsonb`;
const arr = (a) => `ARRAY[${a.map((x) => `'${esc(x)}'`).join(',')}]::text[]`;

const rows = VEHICLES.map((v) => {
  const vals = [
    `'${esc(v.id)}'`,
    `'${esc(v.brand)}'`,
    `'${esc(v.model)}'`,
    v.year,
    v.price,
    `'${v.currency}'`,
    `'${esc(v.bodyType)}'`,
    `'${esc(v.fuelType)}'`,
    `'${esc(v.transmission)}'`,
    `'${esc(v.driveType)}'`,
    v.horsepower,
    v.acceleration,
    v.topSpeed,
    v.rangeKm ?? 'NULL',
    `'${esc(v.description)}'`,
    arr(v.features),
    v.modelPath ? `'${esc(v.modelPath)}'` : 'NULL',
    `'${esc(v.heroColorId)}'`,
    j(v.availableColors),
    j(v.availableWheels),
    j(v.availableInteriors),
    j(v.availablePackages),
  ];
  return `(${vals.join(', ')})`;
});

const sql = `insert into public.vehicles (
  id, brand, model, year, price, currency,
  body_type, fuel_type, transmission, drive_type,
  horsepower, acceleration, top_speed, range_km,
  description, features, model_path, hero_color_id,
  available_colors, available_wheels, available_interiors, available_packages
) values
${rows.join(',\n')}
on conflict (id) do nothing;`;

fs.writeFileSync(path.join(projectRoot, 'seed.sql'), sql);
console.log('wrote', sql.length, 'bytes with', rows.length, 'rows to seed.sql');
