import Link from 'next/link';
import { ArrowUpRight, Search, Download } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';

export const metadata = { title: 'Orders — Admin · mobileDrive' };

const ORDERS = [
  { id: 'MD-2026-1038', buyer: 'Asiamah Joshua', vehicle: 'Porsche 911 Carrera',    paid: 123700, status: 'Production', payment: 'Card',       when: '2h ago' },
  { id: 'MD-2026-1037', buyer: 'Nia Mensah',      vehicle: 'BMW M4 Competition',    paid: 87700,  status: 'Shipping',   payment: 'MTN MoMo',   when: 'Yesterday' },
  { id: 'MD-2026-1036', buyer: 'Kojo Boateng',    vehicle: 'Tesla Model S',         paid: 108300, status: 'Delivered',  payment: 'Paystack',   when: '2 days ago' },
  { id: 'MD-2026-1035', buyer: 'Ama Owusu',       vehicle: 'Audi RS6 Avant',        paid: 141500, status: 'Pending',    payment: 'Card',       when: '3 days ago' },
  { id: 'MD-2026-1034', buyer: 'Yaw Ampah',       vehicle: 'Mercedes-AMG GT',       paid: 142800, status: 'Production', payment: 'Card',       when: '4 days ago' },
  { id: 'MD-2026-1033', buyer: 'Serwaa Appiah',   vehicle: 'Range Rover Sport',     paid: 112400, status: 'Shipping',   payment: 'Telecel',    when: '5 days ago' },
  { id: 'MD-2026-1032', buyer: 'Kwesi Darko',     vehicle: 'BMW M4 Competition',    paid: 94300,  status: 'Delivered',  payment: 'Paystack',   when: '1 week ago' },
  { id: 'MD-2026-1031', buyer: 'Afia Kusi',       vehicle: 'Porsche 911 Carrera',   paid: 128900, status: 'Cancelled',  payment: 'Refunded',   when: '1 week ago' },
];

function statusColor(s: string) {
  switch (s) {
    case 'Delivered':  return 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30';
    case 'Shipping':   return 'bg-sky-400/15 text-sky-300 border-sky-400/30';
    case 'Production': return 'bg-amber-400/15 text-amber-300 border-amber-400/30';
    case 'Pending':    return 'bg-white/10 text-ink-100 border-white/15';
    case 'Cancelled':  return 'bg-red-500/15 text-red-300 border-red-500/30';
    default:           return 'bg-white/10 text-ink-100 border-white/15';
  }
}

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

      {/* Table */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-ink-300">
              <tr>
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Vehicle</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Payment</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">When</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {ORDERS.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-3.5 font-medium text-white">{o.id}</td>
                  <td className="px-6 py-3.5 text-ink-100">{o.buyer}</td>
                  <td className="px-6 py-3.5 text-ink-100">{o.vehicle}</td>
                  <td className="px-6 py-3.5 font-medium text-white tabular-nums">
                    {formatPrice(o.paid)}
                  </td>
                  <td className="px-6 py-3.5 text-ink-200">{o.payment}</td>
                  <td className="px-6 py-3.5">
                    <span className={'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ' + statusColor(o.status)}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-ink-200">{o.when}</td>
                  <td className="px-6 py-3.5 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="inline-flex h-7 items-center gap-1 rounded-full border border-white/10 px-3 text-[11px] text-ink-100 hover:bg-white/5"
                    >
                      Open
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
