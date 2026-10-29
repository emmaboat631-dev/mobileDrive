import 'server-only';

import { getServerSupabase } from '@/lib/supabase/server';
import { getVehicleById } from '@/lib/vehicles/data';
import type { Vehicle } from '@/types/vehicle';

export type BookingStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';

export interface BookingRecord {
  id: string;
  userId: string;
  vehicleId: string;
  vehicle: Vehicle | null; // null if the referenced vehicle id isn't in the seed catalog
  scheduledAt: string;     // ISO
  fullName: string;
  phone: string;
  notes: string | null;
  status: BookingStatus;
}

/**
 * Discriminated result so callers never confuse "no backend configured" with
 * "query returned no rows". The UI can render honest copy for each case.
 */
export type BookingsResult =
  | { ok: true; mode: 'persisted'; bookings: BookingRecord[] }
  | { ok: true; mode: 'unconfigured'; bookings: [] }
  | { ok: true; mode: 'unauthenticated'; bookings: [] }
  | { ok: true; mode: 'forbidden'; bookings: [] }
  | { ok: false; mode: 'error'; bookings: []; error: string };

interface RawBooking {
  id: string;
  user_id: string;
  vehicle_id: string;
  scheduled_at: string;
  full_name: string;
  phone: string;
  notes: string | null;
  status: BookingStatus;
}

function hydrate(rows: RawBooking[]): BookingRecord[] {
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    vehicleId: r.vehicle_id,
    vehicle: getVehicleById(r.vehicle_id) ?? null,
    scheduledAt: r.scheduled_at,
    fullName: r.full_name,
    phone: r.phone,
    notes: r.notes,
    status: r.status,
  }));
}

/** Bookings for the currently signed-in customer, ordered by scheduled_at asc. */
export async function getUserBookings(options?: { onlyUpcoming?: boolean }): Promise<BookingsResult> {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: true, mode: 'unconfigured', bookings: [] };

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) return { ok: true, mode: 'unauthenticated', bookings: [] };

  const db = supabase as any;
  let query = db
    .from('test_drive_bookings')
    .select('id,user_id,vehicle_id,scheduled_at,full_name,phone,notes,status')
    .eq('user_id', userData.user.id)
    .order('scheduled_at', { ascending: true });

  if (options?.onlyUpcoming) {
    query = query.gte('scheduled_at', new Date().toISOString());
  }

  const { data, error } = await query;
  if (error) return { ok: false, mode: 'error', bookings: [], error: error.message };

  return { ok: true, mode: 'persisted', bookings: hydrate((data ?? []) as RawBooking[]) };
}

/**
 * Bookings a dealer or admin can see. Scoped to the next `days` days, ordered
 * by scheduled_at asc. RLS gates visibility — this query only returns rows the
 * caller's role is allowed to read.
 */
export async function getUpcomingDealerBookings(days = 14): Promise<BookingsResult> {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: true, mode: 'unconfigured', bookings: [] };

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) return { ok: true, mode: 'unauthenticated', bookings: [] };

  const db = supabase as any;

  // Confirm the caller is dealer or admin so we can render accurate copy if not.
  const { data: profile } = await db
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  if (role !== 'dealer' && role !== 'admin') {
    return { ok: true, mode: 'forbidden', bookings: [] };
  }

  const now = new Date();
  const until = new Date();
  until.setDate(until.getDate() + days);

  const { data, error } = await db
    .from('test_drive_bookings')
    .select('id,user_id,vehicle_id,scheduled_at,full_name,phone,notes,status')
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', until.toISOString())
    .order('scheduled_at', { ascending: true });

  if (error) return { ok: false, mode: 'error', bookings: [], error: error.message };

  return { ok: true, mode: 'persisted', bookings: hydrate((data ?? []) as RawBooking[]) };
}

/** Group bookings by local date (YYYY-MM-DD). Useful for the dealer week view. */
export function groupByDay(bookings: BookingRecord[]): Array<{ dateKey: string; items: BookingRecord[] }> {
  const map = new Map<string, BookingRecord[]>();
  for (const b of bookings) {
    const key = b.scheduledAt.slice(0, 10);
    const list = map.get(key) ?? [];
    list.push(b);
    map.set(key, list);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([dateKey, items]) => ({ dateKey, items }));
}
