import Link from 'next/link';
import { ArrowUpRight, Search, Download } from 'lucide-react';
import { formatPrice, relativeTime } from '@/lib/utils/format';
import { DataTable, StatusBadge, statusTone, EmptyState } from '@/components/ui';
import { fetchOrders, type OrderRow } from '@/lib/admin/queries';

export const metadata = { title: 'Orders — Admin · mobileDrive' };
export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const ORDERS = await fetchOrders(50);
  const paid = ORDERS
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + o.grand_total, 0);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="eyebrow">Orders</div>
          <h1 className="mt-2 font-display text-display-md font-semibold text-white">
            All orders
          </h1>
          <p className="mt-2 text-sm text-ink-200">
            {ORDERS.length} orders · {formatPrice(paid)} received this period
          </p>
        </div>
        <button type="button" className="btn-secondary">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </header>

      {/* Status filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Pending', 'Production', 'Shipping', 'Delivered', 'Cancelled'].map((t, i) => (
          <button
            key={t}
            type="button"
            className={
              'rounded-full border px-3.5 py-1.5 text-xs font-medium transition ' +
              (i === 0
                ? 'border-white bg-white text-ink-900'
                : 'border-white/10 text-ink-100 hover:border-white/30')
            }
          >
            {t}
          </button>
        ))}

        <div className="relative ml-auto w-full max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            type="search"
            placeholder="Search by order id, buyer, vehicle…"
            className="h-10 w-full rounded-full border border-white/10 bg-ink-700 pl-11 pr-4 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
          />
        </div>
      </div>

      {ORDERS.length === 0 && (
        <EmptyState
          title="No orders yet"
          description="Orders will show up here as soon as a customer completes checkout."
        />
      )}

      {ORDERS.length > 0 && <DataTable<OrderRow>
        rows={ORDERS}
        getKey={(o) => o.id}
        columns={[
          { key: 'id',       header: 'Order',    render: (o) => <span className="font-medium text-white">{o.id.slice(0, 8)}</span> },
          { key: 'buyer',    header: 'Customer', render: (o) => o.buyer_name ?? o.buyer_email ?? '—' },
          { key: 'vehicle',  header: 'Vehicle',  render: (o) => o.items_summary || '—' },
          { key: 'amount',   header: 'Amount',   tabular: true, render: (o) => <span className="font-medium text-white">{formatPrice(o.grand_total)}</span> },
          { key: 'payment',  header: 'Payment',  render: (o) => <span className="text-ink-200">{o.payment_method}</span> },
          { key: 'status',   header: 'Status',   render: (o) => <StatusBadge tone={statusTone(o.status)}>{o.status}</StatusBadge> },
          { key: 'when',     header: 'When',     render: (o) => <span className="text-ink-200">{relativeTime(o.created_at)}</span> },
          {
            key: 'open',
            header: '',
            align: 'right',
            render: (o) => (
              <Link
                href={`/admin/orders/${o.id}`}
                className="inline-flex h-7 items-center gap-1 rounded-full border border-white/10 px-3 text-[11px] text-ink-100 hover:bg-white/5"
              >
                Open
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            ),
          },
        ]}
      />}
    </div>
  );
}
