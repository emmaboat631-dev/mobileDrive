'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import type { Vehicle } from '@/types/vehicle';

export interface VehicleInput {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  currency: Vehicle['currency'];
  bodyType: Vehicle['bodyType'];
  fuelType: Vehicle['fuelType'];
  transmission: Vehicle['transmission'];
  driveType: Vehicle['driveType'];
  horsepower: number;
  acceleration: number;
  topSpeed: number;
  rangeKm?: number | null;
  description: string;
  features: string[];
  modelPath?: string | null;
  heroColorId: string;
}

export type VehicleResult = { ok: true; id: string } | { ok: false; message: string };

function readVehicleFromForm(formData: FormData): VehicleInput | { error: string } {
  const brand = String(formData.get('brand') ?? '').trim();
  const model = String(formData.get('model') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim().toLowerCase();

  if (!brand || !model) return { error: 'Brand and Model are required.' };
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return { error: 'URL slug must be lowercase letters, numbers and hyphens.' };
  }

  const price = Number(formData.get('price') ?? 0);
  const year = Number(formData.get('year') ?? new Date().getFullYear());
  if (!Number.isFinite(price) || price <= 0) {
    return { error: 'Base price must be a positive number.' };
  }

  const rangeKmRaw = String(formData.get('range_km') ?? '').trim();
  const rangeKm = rangeKmRaw === '' || rangeKmRaw === '—' ? null : Number(rangeKmRaw);
  if (rangeKm !== null && !Number.isFinite(rangeKm)) {
    return { error: 'Range must be a number or empty.' };
  }

  return {
    id: slug,
    brand,
    model,
    year,
    price,
    currency: String(formData.get('currency') ?? 'USD') as Vehicle['currency'],
    bodyType: String(formData.get('body_type') ?? 'Coupe') as Vehicle['bodyType'],
    fuelType: String(formData.get('fuel_type') ?? 'Petrol') as Vehicle['fuelType'],
    transmission: String(formData.get('transmission') ?? 'Automatic') as Vehicle['transmission'],
    driveType: String(formData.get('drive_type') ?? 'RWD') as Vehicle['driveType'],
    horsepower: Number(formData.get('horsepower') ?? 0),
    acceleration: Number(formData.get('acceleration') ?? 0),
    topSpeed: Number(formData.get('top_speed') ?? 0),
    rangeKm,
    description: String(formData.get('description') ?? '').trim(),
    features: [],
    modelPath: String(formData.get('model_path') ?? '').trim() || null,
    heroColorId: String(formData.get('hero_color_id') ?? 'midnight-blue'),
  };
}

export async function createVehicle(formData: FormData): Promise<VehicleResult> {
  const parsed = readVehicleFromForm(formData);
  if ('error' in parsed) return { ok: false, message: parsed.error };
  const input = parsed;

  const supabase = getServerSupabase();
  if (!supabase) {
    // Dev mode: nothing to persist, bounce back with the new slug so the UI can display success.
    revalidatePath('/admin/vehicles');
    redirect(`/admin/vehicles?created=${encodeURIComponent(input.id)}&mock=1`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { error } = await db.from('vehicles').insert({
    id: input.id,
    brand: input.brand,
    model: input.model,
    year: input.year,
    price: input.price,
    currency: input.currency,
    body_type: input.bodyType,
    fuel_type: input.fuelType,
    transmission: input.transmission,
    drive_type: input.driveType,
    horsepower: input.horsepower,
    acceleration: input.acceleration,
    top_speed: input.topSpeed,
    range_km: input.rangeKm,
    description: input.description,
    features: input.features,
    model_path: input.modelPath,
    hero_color_id: input.heroColorId,
    available_colors: [],
    available_wheels: [],
    available_interiors: [],
    available_packages: [],
  });

  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin/vehicles');
  revalidatePath('/vehicles');
  redirect(`/admin/vehicles/${encodeURIComponent(input.id)}`);
}

export async function updateVehicle(id: string, formData: FormData): Promise<VehicleResult> {
  const parsed = readVehicleFromForm(formData);
  if ('error' in parsed) return { ok: false, message: parsed.error };
  const input = parsed;

  const supabase = getServerSupabase();
  if (!supabase) {
    revalidatePath('/admin/vehicles');
    revalidatePath(`/admin/vehicles/${id}`);
    return { ok: true, id };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { error } = await db.from('vehicles').update({
    brand: input.brand,
    model: input.model,
    year: input.year,
    price: input.price,
    currency: input.currency,
    body_type: input.bodyType,
    fuel_type: input.fuelType,
    transmission: input.transmission,
    drive_type: input.driveType,
    horsepower: input.horsepower,
    acceleration: input.acceleration,
    top_speed: input.topSpeed,
    range_km: input.rangeKm,
    description: input.description,
    model_path: input.modelPath,
    hero_color_id: input.heroColorId,
  }).eq('id', id);

  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin/vehicles');
  revalidatePath(`/admin/vehicles/${id}`);
  revalidatePath(`/vehicles/${id}`);
  return { ok: true, id };
}

export async function deleteVehicle(id: string): Promise<VehicleResult> {
  const supabase = getServerSupabase();
  if (!supabase) {
    revalidatePath('/admin/vehicles');
    return { ok: true, id };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { error } = await db.from('vehicles').delete().eq('id', id);
  if (error) return { ok: false, message: error.message };
  revalidatePath('/admin/vehicles');
  return { ok: true, id };
}
