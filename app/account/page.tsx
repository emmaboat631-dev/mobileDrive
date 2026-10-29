import Link from 'next/link';
import { AccountKpis } from './AccountKpis';
import { EmptyState } from '@/components/ui';
import { getUserBookings } from '@/lib/bookings/queries';
import { getCurrentUser } from '@/lib/auth/currentUser';
import { NextTestDrive, type NextTestDriveProps } from './NextTestDrive';

export const dynamic = 'force-dynamic';

function timeOfDayGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

async function resolveNextTestDrive(): Promise<NextTestDriveProps> {
  const r = await getUserBookings({ onlyUpcoming: true });
  if (r.mode === 'unconfigured')     return { mode: 'unconfigured' };
  if (r.mode === 'unauthenticated')  return { mode: 'unauthenticated' };
  if (!r.ok)                         return { mode: 'error' };
  const next = r.bookings.find((b) => b.status !== 'cancelled');
  if (!next || !next.vehicle)        return { mode: 'empty' };
  return {
    mode: 'persisted',
    booking: {
      id: next.id,
      scheduledAt: next.scheduledAt,
      status: next.status,
      vehicleId: next.vehicleId,
      vehicleBrand: next.vehicle.brand,
      vehicleModel: next.vehicle.model,
    },
  };
}

export default async function AccountOverviewPage() {
  const [user, nextTestDrive] = await Promise.all([
    getCurrentUser(),
    resolveNextTestDrive(),
  ]);
  const greeting = timeOfDayGreeting();
  const name = user?.firstName ?? 'there';

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <div className="eyebrow">Welcome back</div>
        <h1 className="mt-2 font-display text-display-md font-semibold text-white">
          {greeting}, {name}.
        </h1>
      </div>

      {/* KPIs — client component reads wishlist/cart stores */}
      <AccountKpis />

      {/* Current order — empty until the user has one */}
      <div className="rounded-3xl border border-white/[0.06] bg-ink-800/60 p-8">
        <EmptyState
          title="No orders in flight"
          description="Once you complete checkout, your order status, estimated delivery and dealer appear here."
          action={<Link href="/vehicles" className="btn-primary">Browse vehicles</Link>}
        />
      </div>

      {/* Two column */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/[0.06] bg-ink-800/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-white">Active builds</h3>
            <Link href="/account/builds" className="text-xs text-ink-100 hover:text-white">
              View all →
            </Link>
          </div>
          <EmptyState
            title="No saved builds yet"
            description="Start a configuration and save it to see it here."
            action={<Link href="/configure/m4-competition" className="btn-secondary">Open configurator</Link>}
          />
        </div>

        <NextTestDrive {...nextTestDrive} />
      </div>
    </div>
  );
}
