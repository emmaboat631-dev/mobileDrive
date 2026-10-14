'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Calendar, AlertTriangle, Database } from 'lucide-react';
import { cancelBooking } from '@/lib/bookings/actions';
import { StatusBadge, statusTone, type StatusTone, Banner } from '@/components/ui';

export type Mode =
  | 'persisted'
  | 'unconfigured'
  | 'unauthenticated'
  | 'empty'
  | 'error';

export interface NextTestDriveProps {
  mode: Mode;
  booking?: {
    id: string;
    scheduledAt: string;
    status: 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';
    vehicleId: string;
    vehicleBrand: string;
    vehicleModel: string;
  };
}

export function NextTestDrive(props: NextTestDriveProps) {
  return (
    <div className="rounded-3xl border border-white/[0.06] bg-ink-800/60 p-6">
      <h3 className="mb-4 font-display text-base font-semibold text-white">Next test drive</h3>
      <Body {...props} />
    </div>
  );
}

function Body({ mode, booking }: NextTestDriveProps) {
  if (mode === 'unconfigured') {
    return (
      <Banner tone="warning" icon={<Database className="h-4 w-4" />}>
        Supabase is not configured in this environment, so your bookings can&apos;t be read.
      </Banner>
    );
  }
  if (mode === 'unauthenticated') {
    return (
      <Banner tone="warning">
        <Link href="/sign-in?next=/account" className="underline">Sign in</Link>
        {' '}to see your upcoming test drives.
      </Banner>
    );
  }
  if (mode === 'error') {
    return (
      <Banner tone="danger">Couldn&apos;t load your bookings right now. Please try again.</Banner>
    );
  }
  if (mode === 'empty' || !booking) {
    return (
      <div className="rounded-xl border border-dashed border-white/[0.1] px-4 py-6 text-center">
        <Calendar className="mx-auto h-5 w-5 text-ink-200" />
        <p className="mt-3 text-sm text-ink-100">No upcoming test drives.</p>
        <Link href="/vehicles" className="btn-secondary mt-4 inline-flex h-9 px-4 text-xs">
          Browse vehicles
        </Link>
      </div>
    );
  }
  return <BookingTile booking={booking} />;
}

function BookingTile({ booking }: { booking: NonNullable<NextTestDriveProps['booking']> }) {
  const [cancelled, setCancelled] = useState(booking.status === 'cancelled');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const when = new Date(booking.scheduledAt);
  const day = when.toLocaleDateString(undefined, { day: 'numeric' });
  const month = when.toLocaleDateString(undefined, { month: 'short' });
  const timeRange = `${when.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} — ${new Date(
    when.getTime() + 90 * 60 * 1000,
  ).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;

  const onCancel = () => {
    if (cancelled || pending) return;
    if (!confirm('Cancel this test drive?')) return;
    setError(null);
    startTransition(async () => {
      const r = await cancelBooking(booking.id);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setCancelled(true);
    });
  };

  const tone: StatusTone = cancelled ? 'danger' : statusTone(booking.status);
  const label = cancelled ? 'Cancelled' : booking.status[0].toUpperCase() + booking.status.slice(1);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-ink-700/40 p-4">
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-white text-ink-900">
          <div className="text-center">
            <div className="font-display text-2xl font-semibold leading-none">{day}</div>
            <div className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-ink-700">
              {month}
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">
            {booking.vehicleBrand} {booking.vehicleModel}
          </div>
          <div className="text-[11px] text-ink-200">{timeRange}</div>
          <div className="mt-1.5">
            <StatusBadge tone={tone}>{label}</StatusBadge>
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={cancelled || pending}
          className="btn-secondary h-10 flex-1 px-3 text-xs disabled:opacity-50"
        >
          {cancelled ? 'Cancelled' : pending ? 'Cancelling…' : 'Cancel'}
        </button>
        <Link
          href={`/vehicles/${booking.vehicleId}`}
          className="btn-primary h-10 flex-1 px-3 text-xs"
        >
          View vehicle
        </Link>
      </div>
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-400/30 bg-rose-400/10 p-2 text-[11px] text-rose-200">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

