'use server';

import { revalidatePath } from 'next/cache';
import { getServerSupabase } from '@/lib/supabase/server';
import { assertSameOrigin } from '@/lib/security/csrf';
import { getAdminSupabase } from '@/lib/supabase/admin';
import { getVehicleById } from '@/lib/vehicles/data';
import { bookingSchema, firstZodMessage } from '@/lib/validation/schemas';
import { sendEmail } from '@/lib/email/send';
import { TestDriveConfirmationEmail } from '@/emails/TestDriveConfirmation';

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
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) return firstZodMessage(parsed.error);

  if (!getVehicleById(parsed.data.vehicleId)) {
    return 'That vehicle isn’t available for test drives.';
  }

  const when = new Date(`${parsed.data.date}T${parsed.data.time}:00`);
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
  return null;
}

export async function bookTestDrive(input: BookingInput): Promise<BookingResult> {
  const origin = await assertSameOrigin();
  if (!origin.ok) return { ok: false, error: origin.message };

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

  revalidatePath('/account');
  revalidatePath('/dealer/bookings');

  // Fire-and-forget: buyer + dealer confirmation emails.
  void sendBookingEmails({
    bookingId: data.id as string,
    userEmail: userData.user.email ?? null,
    scheduledAtIso,
    vehicleId: input.vehicleId,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    notes: input.notes?.trim() || null,
  });

  return {
    ok: true,
    mode: 'persisted',
    bookingId: data.id as string,
    scheduledAt: scheduledAtIso,
    vehicleId: input.vehicleId,
  };
}

/**
 * Dispatch test-drive confirmation emails after a booking lands. One to the
 * buyer, one to the showroom. Pulls the showroom via the user's dealer_id —
 * for the current single-dealer deployment this is Accra by default.
 */
async function sendBookingEmails(input: {
  bookingId: string;
  userEmail: string | null;
  scheduledAtIso: string;
  vehicleId: string;
  fullName: string;
  phone: string;
  notes: string | null;
}) {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const vehicle = getVehicleById(input.vehicleId);
  const brand = vehicle?.brand ?? 'Your vehicle';
  const model = vehicle?.model ?? '';

  const scheduledAt = new Date(input.scheduledAtIso);
  const scheduledFormatted = scheduledAt.toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });

  // Pull the default dealer (Accra) for now. Multi-dealer routing comes later.
  const admin = getAdminSupabase();
  let dealerName = 'mobileDrive Accra';
  let dealerEmail: string | null = null;
  let dealerPhone: string | null = null;
  if (admin) {
    const db = admin as unknown as {
      from: (t: string) => {
        select: (c: string) => {
          eq: (k: string, v: string) => {
            maybeSingle: () => Promise<{ data: { name: string; email: string | null; phone: string | null } | null }>;
          };
        };
      };
    };
    const { data: dealer } = await db
      .from('dealers')
      .select('name, email, phone')
      .eq('slug', 'accra')
      .maybeSingle();
    if (dealer) {
      dealerName = dealer.name;
      dealerEmail = dealer.email;
      dealerPhone = dealer.phone;
    }
  }

  const firstName = input.fullName.split(/\s+/)[0] || 'there';

  // Buyer confirmation
  if (input.userEmail) {
    await sendEmail({
      to: input.userEmail,
      subject: `Test drive confirmed · ${brand} ${model}`.trim(),
      template: 'test-drive-buyer',
      relatedBooking: input.bookingId,
      react: TestDriveConfirmationEmail({
        siteUrl: site,
        recipient: 'buyer',
        firstName,
        bookingId: input.bookingId,
        vehicleBrand: brand,
        vehicleModel: model,
        scheduledAtFormatted: scheduledFormatted,
        dealerName,
        dealerPhone,
        notes: input.notes,
      }),
    });
  }

  // Dealer ping
  if (dealerEmail) {
    await sendEmail({
      to: dealerEmail,
      subject: `New test drive at ${dealerName} · ${scheduledFormatted}`,
      template: 'test-drive-dealer',
      relatedBooking: input.bookingId,
      react: TestDriveConfirmationEmail({
        siteUrl: site,
        recipient: 'dealer',
        firstName: '',
        bookingId: input.bookingId,
        vehicleBrand: brand,
        vehicleModel: model,
        scheduledAtFormatted: scheduledFormatted,
        dealerName,
        dealerPhone,
        buyerName: input.fullName,
        buyerPhone: input.phone,
        notes: input.notes,
      }),
    });
  }
}

export type CancelBookingResult =
  | { ok: true; mode: 'persisted' | 'local' }
  | { ok: false; error: string };

/**
 * Cancel a booking by id. RLS lets the owner update their own row, and dealers/
 * admins can update any row — this action does the UPDATE and relies on RLS to
 * enforce permissions, so an unauthorised caller gets an "error" result.
 */
export async function cancelBooking(bookingId: string): Promise<CancelBookingResult> {
  const origin = await assertSameOrigin();
  if (!origin.ok) return { ok: false, error: origin.message };

  if (!bookingId) return { ok: false, error: 'Missing booking id.' };

  const supabase = getServerSupabase();
  if (!supabase) {
    // Backend not configured — no record exists to cancel.
    return { ok: true, mode: 'local' };
  }

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return { ok: false, error: 'Please sign in to cancel a booking.' };
  }

  const db = supabase as any;
  const { error } = await db
    .from('test_drive_bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/account');
  revalidatePath('/dealer/bookings');

  return { ok: true, mode: 'persisted' };
}
