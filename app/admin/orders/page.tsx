import Link from 'next/link';
import { ArrowUpRight, Search, Download } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';
import { DataTable, StatusBadge, statusTone } from '@/components/ui';

export const metadata = { title: 'Orders — Admin · mobileDrive' };

interface OrderRow {
  id: string;
  buyer: string;
  vehicle: string;
  paid: number;
  status: 'Pending' | 'Production' | 'Shipping' | 'Delivered' | 'Cancelled';
  payment: string;
  when: string;
}

const ORDERS: OrderRow[] = [
  { id: 'MD-2026-1038', buyer: 'Asiamah Joshua', vehicle: 'Porsche 911 Carrera',    paid: 123700, status: 'Production', payment: 'Card',       when: '2h ago' },
  { id: 'MD-2026-1037', buyer: 'Nia Mensah',      vehicle: 'BMW M4 Competition',    paid: 87700,  status: 'Shipping',   payment: 'MTN MoMo',   when: 'Yesterday' },
  { id: 'MD-2026-1036', buyer: 'Kojo Boateng',    vehicle: 'Tesla Model S',         paid: 108300, status: 'Delivered',  payment: 'Paystack',   when: '2 days ago' },
  { id: 'MD-2026-1035', buyer: 'Ama Owusu',       vehicle: 'Audi RS6 Avant',        paid: 141500, status: 'Pending',    payment: 'Card',       when: '3 days ago' },
  { id: 'MD-2026-1034', buyer: 'Yaw Ampah',       vehicle: 'Mercedes-AMG GT',       paid: 142800, status: 'Production', payment: 'Card',       when: '4 days ago' },
  { id: 'MD-2026-1033', buyer: 'Serwaa Appiah',   vehicle: 'Range Rover Sport',     paid: 112400, status: 'Shipping',   payment: 'Telecel',    when: '5 days ago' },
  { id: 'MD-2026-1032', buyer: 'Kwesi Darko',     vehicle: 'BMW M4 Competition',    paid: 94300,  status: 'Delivered',  payment: 'Paystack',   when: '1 week ago' },
  { id: 'MD-2026-1031', buyer: 'Afia Kusi',       vehicle: 'Porsche 911 Carrera',   paid: 128900, status: 'Cancelled',  payment: 'Refunded',   when: '1 week ago' },
];

export default function AdminOrdersPage() {
  const paid = ORDERS.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.paid, 0);

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

      <DataTable<OrderRow>
        rows={ORDERS}
        getKey={(o) => o.id}
        columns={[
          { key: 'id',       header: 'Order',    render: (o) => <span className="font-medium text-white">{o.id}</span> },
          { key: 'buyer',    header: 'Customer', render: (o) => o.buyer },
          { key: 'vehicle',  header: 'Vehicle',  render: (o) => o.vehicle },
          { key: 'amount',   header: 'Amount',   tabular: true, render: (o) => <span className="font-medium text-white">{formatPrice(o.paid)}</span> },
          { key: 'payment',  header: 'Payment',  render: (o) => <span className="text-ink-200">{o.payment}</span> },
          { key: 'status',   header: 'Status',   render: (o) => <StatusBadge tone={statusTone(o.status)}>{o.status}</StatusBadge> },
          { key: 'when',     header: 'When',     render: (o) => <span className="text-ink-200">{o.when}</span> },
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
      />
    </div>
  );
}
