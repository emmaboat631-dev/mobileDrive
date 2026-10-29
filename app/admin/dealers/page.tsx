import Link from 'next/link';
import { Plus, ArrowUpRight, MapPin, Phone, Mail } from 'lucide-react';
import { fetchDealers } from '@/lib/admin/dealers';
import { EmptyState, StatusBadge } from '@/components/ui';

export const metadata = { title: 'Showrooms — Admin · mobileDrive' };
export const dynamic = 'force-dynamic';

export default async function AdminDealersPage() {
  const dealers = await fetchDealers();

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="eyebrow">Network</div>
          <h1 className="mt-2 font-display text-display-md font-semibold text-white">
            Showrooms
          </h1>
          <p className="mt-2 text-sm text-ink-200">
            {dealers.length} dealer{dealers.length === 1 ? '' : 's'} on the platform.
          </p>
        </div>
        <Link href="/admin/dealers/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          New showroom
        </Link>
      </header>

      {dealers.length === 0 ? (
        <EmptyState
          title="No showrooms yet"
          description="Create your first dealer to start routing orders and bookings."
          action={<Link href="/admin/dealers/new" className="btn-primary">Create showroom</Link>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {dealers.map((d) => (
            <Link
              key={d.id}
              href={`/admin/dealers/${d.id}`}
              className="group block rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6 transition hover:border-white/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-semibold text-white">
                      {d.name}
                    </h2>
                    {!d.active && <StatusBadge tone="muted">inactive</StatusBadge>}
                  </div>
                  <div className="mt-1 text-[11px] text-ink-200">slug: <code className="font-mono text-ink-100">{d.slug}</code></div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-ink-200 transition group-hover:text-white" />
              </div>
              <div className="mt-4 space-y-2 text-sm text-ink-200">
                {(d.city || d.region) && (
                  <div className="inline-flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{[d.city, d.region].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {d.phone && (
                  <div className="inline-flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{d.phone}</span>
                  </div>
                )}
                {d.email && (
                  <div className="inline-flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{d.email}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
