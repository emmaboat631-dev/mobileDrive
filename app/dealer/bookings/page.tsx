import { CalendarClock, Mail, Phone, Clock, Database } from 'lucide-react';
import { getUpcomingDealerBookings, groupByDay, type BookingRecord } from '@/lib/bookings/queries';
import { StatusBadge, statusTone, EmptyState, Banner } from '@/components/ui';

export const metadata = { title: 'Test drives — Dealer · mobileDrive' };

export default async function DealerBookingsPage() {
  const result = await getUpcomingDealerBookings(14);

  const bookings = result.ok ? result.bookings : [];
  const total = bookings.length;
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const pending = bookings.filter((b) => b.status === 'pending').length;
  const days = groupByDay(bookings);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="eyebrow">Next 14 days</div>
          <h1 className="mt-2 font-display text-display-md font-semibold text-white">
            Test drives
          </h1>
          <p className="mt-2 text-sm text-ink-200">
            {result.mode === 'persisted'
              ? `${total} slot${total === 1 ? '' : 's'} · ${confirmed} confirmed · ${pending} awaiting confirmation`
              : 'Live data unavailable in this environment.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" disabled={result.mode !== 'persisted'}>
            Export
          </button>
          <button type="button" className="btn-primary" disabled={result.mode !== 'persisted'}>
            <CalendarClock className="h-4 w-4" />
            Block time
          </button>
        </div>
      </header>

      {/* Backend-state banner — honest about the mode we're in */}
      {result.mode === 'unconfigured' && (
        <Banner tone="warning" icon={<Database className="h-4 w-4" />}>
          <strong className="font-medium text-white">Supabase is not configured.</strong>
          {' '}Live bookings cannot be read. Set{' '}
          <code className="text-white">NEXT_PUBLIC_SUPABASE_URL</code>
          {' '}and{' '}
          <code className="text-white">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          {' '}in <code className="text-white">.env.local</code>, run{' '}
          <code className="text-white">supabase/migrations</code>, then refresh.
        </Banner>
      )}
      {result.mode === 'unauthenticated' && (
        <Banner tone="warning">
          You need to sign in with a dealer account to see bookings.
        </Banner>
      )}
      {result.mode === 'forbidden' && (
        <Banner tone="warning">
          Your account doesn&apos;t have the dealer or admin role. Elevate it in
          Supabase (<code className="text-white">profiles.role</code>) to see bookings.
        </Banner>
      )}
      {!result.ok && (
        <Banner tone="danger">
          Couldn&apos;t load bookings: {result.error}
        </Banner>
      )}

      {/* Content */}
      {result.mode === 'persisted' && days.length === 0 ? (
        <EmptyState
          title="No upcoming test drives"
          description="When customers request a test drive it will show up here, grouped by day."
        />
      ) : result.mode === 'persisted' ? (
        <div className="grid gap-3 lg:grid-cols-5">
          {days.map(({ dateKey, items }) => (
            <DaySection key={dateKey} dateKey={dateKey} items={items} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DaySection({ dateKey, items }: { dateKey: string; items: BookingRecord[] }) {
  const d = new Date(dateKey + 'T00:00:00');
  const dateLabel = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const weekday = d.toLocaleDateString(undefined, { weekday: 'long' });

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-4">
      <header className="mb-3 flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div>
          <div className="text-sm font-semibold text-white">{dateLabel}</div>
          <div className="text-[11px] text-ink-200">{weekday}</div>
        </div>
        <div className="text-[11px] text-ink-200">
          {items.length} slot{items.length === 1 ? '' : 's'}
        </div>
      </header>
      <ul className="space-y-2">
        {items.map((b) => {
          const time = new Date(b.scheduledAt).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          });
          return (
            <li key={b.id} className="rounded-xl border border-white/[0.04] bg-ink-700/40 p-3">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 text-[11px] text-ink-100">
                  <Clock className="h-3 w-3" />
                  {time}
                </div>
                <StatusBadge tone={statusTone(b.status)}>
                  {b.status[0].toUpperCase() + b.status.slice(1)}
                </StatusBadge>
              </div>
              <div className="mt-2 text-sm font-semibold text-white">
                {b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : b.vehicleId}
              </div>
              <div className="mt-0.5 text-[11px] text-ink-200">{b.fullName}</div>
              {b.notes && (
                <div className="mt-2 rounded-md bg-white/[0.03] px-2 py-1.5 text-[10px] italic text-ink-100">
                  {b.notes}
                </div>
              )}
              <div className="mt-2 flex gap-3 text-[11px] text-ink-200">
                <a href={`tel:${b.phone}`} className="inline-flex items-center gap-1 hover:text-white">
                  <Phone className="h-2.5 w-2.5" />
                  Call
                </a>
                <a href="mailto:#" className="inline-flex items-center gap-1 hover:text-white">
                  <Mail className="h-2.5 w-2.5" />
                  Email
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

