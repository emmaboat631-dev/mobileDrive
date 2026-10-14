'use server';

import { getServerSupabase } from '@/lib/supabase/server';
import { getVehicleById } from '@/lib/vehicles/data';

export interface BookingInput {
  vehicleId: string;
  /** ISO date, 'YYYY-MM-DD'. */
  date: string;
  /** 'HH:mm', 24-hour. */
  time: string;
  fullName: string;
  phone: string;
  notes?: string;
}

export type BookingResult =
  | {
      ok: true;
      /** 'persisted' when the row was written to Supabase; 'local' when backend wasn't configured. */
      mode: 'persisted' | 'local';
      bookingId?: string;
      scheduledAt: string;
      vehicleId: string;
    }
  | { ok: false; error: string };

const BUSINESS_HOURS = { startHour: 9, endHour: 18 }; // 09:00 – 18:00 local
const E164_LIKE = /^\+?[\d\s\-().]{7,20}$/;

function validate(input: BookingInput): string | null {
  if (!input.vehicleId || !getVehicleById(input.vehicleId)) {
    return 'That vehicle isn’t available for test drives.';
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return 'Please pick a valid date.';
  if (!/^\d{2}:\d{2}$/.test(input.time)) return 'Please pick a valid time.';

  const when = new Date(`${input.date}T${input.time}:00`);
  if (Number.isNaN(when.getTime())) return 'That date/time couldn’t be parsed.';

  // Must be in the future (allow 30-minute lead-time).
  const now = Date.now();
  if (when.getTime() - now < 30 * 60 * 1000) {
    return 'Please pick a time at least 30 minutes from now.';
  }
  // No more than 60 days ahead.
  if (when.getTime() - now > 60 * 24 * 60 * 60 * 1000) {
    return 'Please pick a date within the next 60 days.';
  }
  const hour = when.getHours();
  if (hour < BUSINESS_HOURS.startHour || hour >= BUSINESS_HOURS.endHour) {
    return `Please pick a time between ${BUSINESS_HOURS.startHour}:00 and ${BUSINESS_HOURS.endHour}:00.`;
  }
  if (!input.fullName.trim() || input.fullName.trim().length < 2) {
    return 'Please enter your full name.';
  }
  if (!E164_LIKE.test(input.phone.trim())) {
    return 'Please enter a valid phone number.';
  }
  return null;
}

export async function bookTestDrive(input: BookingInput): Promise<BookingResult> {
  const error = validate(input);
  if (error) return { ok: false, error };

  const scheduledAtIso = new Date(`${input.date}T${input.time}:00`).toISOString();
  const supabase = getServerSupabase();

  // Backend not configured — accept the booking locally. The confirmation page
  // reads the mode and makes clear the request has not been persisted.
  if (!supabase) {
    return {
      ok: true,
      mode: 'local',
      scheduledAt: scheduledAtIso,
      vehicleId: input.vehicleId,
    };
  }

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return { ok: false, error: 'Please sign in to request a test drive.' };
  }

  // Supabase typed-client generics drop in current tooling; see lib/orders/actions.ts
  // for the same workaround. Regenerating database.types.ts with the CLI restores it.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Duplicate check — same user + vehicle + scheduled_at.
  const { data: existing } = await db
    .from('test_drive_bookings')
    .select('id')
    .eq('user_id', userData.user.id)
    .eq('vehicle_id', input.vehicleId)
    .eq('scheduled_at', scheduledAtIso)
    .maybeSingle();

  if (existing?.id) {
    return {
      ok: true,
      mode: 'persisted',
      bookingId: existing.id as string,
      scheduledAt: scheduledAtIso,
      vehicleId: input.vehicleId,
    };
  }

  const { data, error: insertErr } = await db
    .from('test_drive_bookings')
    .insert({
      user_id: userData.user.id,
      vehicle_id: input.vehicleId,
      scheduled_at: scheduledAtIso,
      full_name: input.fullName.trim(),
      phone: input.phone.trim(),
      notes: input.notes?.trim() || null,
    })
    .select('id')
    .single();

  if (insertErr || !data) {
    return { ok: false, error: 'Something went wrong saving your request. Please try again.' };
  }

  return {
    ok: true,
    mode: 'persisted',
    bookingId: data.id as string,
    scheduledAt: scheduledAtIso,
    vehicleId: input.vehicleId,
  };
}
