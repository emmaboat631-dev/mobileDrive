import { getServerSupabase } from '@/lib/supabase/server';
import { listVehicles, getVehicleById } from '@/lib/vehicles/data';
import type { Vehicle } from '@/types/vehicle';

/**
 * Server-only data layer for admin + dealer pages.
 *
 * Every function tries Supabase first, then falls back to the hard-coded
 * demo seed in lib/vehicles/data.ts when the backend is unreachable or empty.
 * This keeps the UI meaningful for a brand-new project while real data lands.
 */

type DbVehicleRow = Record<string, unknown>;

function toVehicle(r: DbVehicleRow): Vehicle {
  return {
    id: String(r.id),
    brand: String(r.brand),
    model: String(r.model),
    year: Number(r.year),
    price: Number(r.price),
    currency: r.currency as Vehicle['currency'],
    bodyType: r.body_type as Vehicle['bodyType'],
    fuelType: r.fuel_type as Vehicle['fuelType'],
    transmission: r.transmission as Vehicle['transmission'],
    driveType: r.drive_type as Vehicle['driveType'],
    horsepower: Number(r.horsepower),
    acceleration: Number(r.acceleration),
    topSpeed: Number(r.top_speed),
    rangeKm: r.range_km == null ? undefined : Number(r.range_km),
    description: String(r.description),
    features: Array.isArray(r.features) ? (r.features as string[]) : [],
    images: Array.isArray(r.gallery_image_urls) ? (r.gallery_image_urls as string[]) : [],
    heroImageUrl: r.hero_image_url == null ? undefined : String(r.hero_image_url),
    modelPath: r.model_path == null ? undefined : String(r.model_path),
    heroColorId: String(r.hero_color_id),
    availableColors: (r.available_colors as Vehicle['availableColors']) ?? [],
    availableWheels: (r.available_wheels as Vehicle['availableWheels']) ?? [],
    availableInteriors: (r.available_interiors as Vehicle['availableInteriors']) ?? [],
    availablePackages: (r.available_packages as Vehicle['availablePackages']) ?? [],
  };
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  const supabase = getServerSupabase();
  if (!supabase) return listVehicles();
  const { data, error } = await (supabase as unknown as {
    from: (t: string) => { select: (c: string) => { order: (c: string) => Promise<{ data: DbVehicleRow[] | null; error: unknown }> } };
  }).from('vehicles').select('*').order('brand');
  if (error || !data || data.length === 0) return listVehicles();
  return data.map(toVehicle);
}

export async function fetchVehicleById(id: string): Promise<Vehicle | undefined> {
  const supabase = getServerSupabase();
  if (!supabase) return getVehicleById(id);
  const { data } = await (supabase as unknown as {
    from: (t: string) => { select: (c: string) => { eq: (k: string, v: string) => { maybeSingle: () => Promise<{ data: DbVehicleRow | null }> } } };
  }).from('vehicles').select('*').eq('id', id).maybeSingle();
  if (!data) return getVehicleById(id);
  return toVehicle(data);
}

export interface OrderRow {
  id: string;
  user_id: string;
  buyer_email: string | null;
  buyer_name: string | null;
  grand_total: number;
  currency: string;
  status: string;
  payment_method: string;
  created_at: string;
  items_summary: string;
}

export async function fetchOrders(limit = 50, dealerId?: string): Promise<OrderRow[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  const db = supabase as any;
  let query = db
    .from('orders')
    .select('id, user_id, grand_total, currency, status, payment_method, created_at, profiles!orders_user_id_fkey(email, full_name), order_items(vehicle_id)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (dealerId) query = query.eq('dealer_id', dealerId);
  const { data } = await query;
  if (!data) return [];
  return (data as Array<{
    id: string;
    user_id: string;
    grand_total: number;
    currency: string;
    status: string;
    payment_method: string;
    created_at: string;
    profiles: { email: string | null; full_name: string | null } | null;
    order_items: Array<{ vehicle_id: string }> | null;
  }>).map((o) => ({
    id: o.id,
    user_id: o.user_id,
    buyer_email: o.profiles?.email ?? null,
    buyer_name: o.profiles?.full_name ?? null,
    grand_total: o.grand_total,
    currency: o.currency,
    status: o.status,
    payment_method: o.payment_method,
    created_at: o.created_at,
    items_summary: (o.order_items ?? []).map((i) => i.vehicle_id).join(', '),
  }));
}

export interface OrderDetail {
  id: string;
  user_id: string;
  buyer_email: string | null;
  buyer_name: string | null;
  grand_total: number;
  subtotal: number;
  options_total: number;
  taxes: number;
  currency: string;
  status: string;
  payment_method: string;
  payment_provider_id: string | null;
  delivery_method: string;
  delivery_address: Record<string, unknown>;
  dealer_id: string | null;
  created_at: string;
  updated_at: string;
  items: Array<{
    vehicle_id: string;
    unit_price: number;
    options_price: number;
    line_total: number;
    configuration: unknown;
  }>;
}

export async function fetchOrderById(id: string): Promise<OrderDetail | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const db = supabase as any;
  const { data } = await db
    .from('orders')
    .select(
      'id, user_id, grand_total, subtotal, options_total, taxes, currency, status, payment_method, payment_provider_id, delivery_method, delivery_address, dealer_id, created_at, updated_at, profiles!orders_user_id_fkey(email, full_name), order_items(vehicle_id, unit_price, options_price, line_total, configuration)',
    )
    .eq('id', id)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    user_id: data.user_id,
    buyer_email: data.profiles?.email ?? null,
    buyer_name: data.profiles?.full_name ?? null,
    grand_total: data.grand_total,
    subtotal: data.subtotal,
    options_total: data.options_total,
    taxes: data.taxes,
    currency: data.currency,
    status: data.status,
    payment_method: data.payment_method,
    payment_provider_id: data.payment_provider_id,
    delivery_method: data.delivery_method,
    delivery_address: data.delivery_address,
    dealer_id: data.dealer_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    items: data.order_items ?? [],
  };
}

export interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string;
  region: string | null;
  created_at: string;
}

export async function fetchProfiles(limit = 100): Promise<ProfileRow[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  const db = supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        order: (c: string, o: { ascending: boolean }) => {
          limit: (n: number) => Promise<{ data: ProfileRow[] | null }>;
        };
      };
    };
  };
  const { data } = await db
    .from('profiles')
    .select('id, email, full_name, phone, role, region, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

export interface BookingRow {
  id: string;
  user_id: string;
  vehicle_id: string;
  scheduled_at: string;
  full_name: string;
  phone: string;
  notes: string | null;
  status: string;
  created_at: string;
}

export async function fetchBookings(limit = 100): Promise<BookingRow[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  const db = supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        order: (c: string, o: { ascending: boolean }) => {
          limit: (n: number) => Promise<{ data: BookingRow[] | null }>;
        };
      };
    };
  };
  const { data } = await db
    .from('test_drive_bookings')
    .select('id, user_id, vehicle_id, scheduled_at, full_name, phone, notes, status, created_at')
    .order('scheduled_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}
