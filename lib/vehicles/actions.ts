'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { assertSameOrigin } from '@/lib/security/csrf';
import { logAdminAction } from '@/lib/security/audit';
import { vehicleSchema, firstZodMessage } from '@/lib/validation/schemas';
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
  const rangeKmRaw = String(formData.get('range_km') ?? '').trim();
  const rangeKm = rangeKmRaw === '' || rangeKmRaw === '—' ? null : rangeKmRaw;

  const parsed = vehicleSchema.safeParse({
    id: String(formData.get('slug') ?? '').trim().toLowerCase(),
    brand: formData.get('brand'),
    model: formData.get('model'),
    year: formData.get('year') ?? new Date().getFullYear(),
    price: formData.get('price'),
    currency: formData.get('currency') ?? 'USD',
    bodyType: formData.get('body_type') ?? 'Coupe',
    fuelType: formData.get('fuel_type') ?? 'Petrol',
    transmission: formData.get('transmission') ?? 'Automatic',
    driveType: formData.get('drive_type') ?? 'RWD',
    horsepower: formData.get('horsepower') ?? 0,
    acceleration: formData.get('acceleration') ?? 0,
    topSpeed: formData.get('top_speed') ?? 0,
    rangeKm,
    description: formData.get('description'),
    features: [],
    modelPath: String(formData.get('model_path') ?? '').trim() || null,
    heroColorId: formData.get('hero_color_id') ?? 'midnight-blue',
  });
  if (!parsed.success) return { error: firstZodMessage(parsed.error) };

  const v = parsed.data;
  return {
    id: v.id,
    brand: v.brand,
    model: v.model,
    year: v.year,
    price: v.price,
    currency: v.currency as Vehicle['currency'],
    bodyType: v.bodyType as Vehicle['bodyType'],
    fuelType: v.fuelType as Vehicle['fuelType'],
    transmission: v.transmission as Vehicle['transmission'],
    driveType: v.driveType as Vehicle['driveType'],
    horsepower: v.horsepower,
    acceleration: v.acceleration,
    topSpeed: v.topSpeed,
    rangeKm: v.rangeKm ?? null,
    description: v.description,
    features: v.features,
    modelPath: v.modelPath ?? null,
    heroColorId: v.heroColorId,
  };
}

export async function createVehicle(formData: FormData): Promise<VehicleResult> {
  const origin = await assertSameOrigin();
  if (!origin.ok) return { ok: false, message: origin.message };

  const parsed = readVehicleFromForm(formData);
  if ('error' in parsed) return { ok: false, message: parsed.error };
  const input = parsed;

  const supabase = getServerSupabase();
  if (!supabase) {
    // Dev mode: nothing to persist, bounce back with the new slug so the UI can display success.
    revalidatePath('/admin/vehicles');
    redirect(`/admin/vehicles?created=${encodeURIComponent(input.id)}&mock=1`);
  }

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
  {
    const origin = await assertSameOrigin();
    if (!origin.ok) return { ok: false, message: origin.message };
  }
  const parsed = readVehicleFromForm(formData);
  if ('error' in parsed) return { ok: false, message: parsed.error };
  const input = parsed;

  const supabase = getServerSupabase();
  if (!supabase) {
    revalidatePath('/admin/vehicles');
    revalidatePath(`/admin/vehicles/${id}`);
    return { ok: true, id };
  }

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

  await logAdminAction({
    action: 'vehicle.update',
    entity: 'vehicle',
    entityId: id,
    summary: `Updated ${input.brand} ${input.model}`,
    diff: input,
  });

  revalidatePath('/admin/vehicles');
  revalidatePath(`/admin/vehicles/${id}`);
  revalidatePath(`/vehicles/${id}`);
  return { ok: true, id };
}

export async function deleteVehicle(id: string): Promise<VehicleResult> {
  {
    const origin = await assertSameOrigin();
    if (!origin.ok) return { ok: false, message: origin.message };
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    revalidatePath('/admin/vehicles');
    return { ok: true, id };
  }
  const db = supabase as any;
  const { error } = await db.from('vehicles').delete().eq('id', id);
  if (error) return { ok: false, message: error.message };
  await logAdminAction({
    action: 'vehicle.delete',
    entity: 'vehicle',
    entityId: id,
    summary: `Deleted vehicle ${id}`,
  });
  revalidatePath('/admin/vehicles');
  return { ok: true, id };
}
