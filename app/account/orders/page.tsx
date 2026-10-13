import Link from 'next/link';
import { ArrowUpRight, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';

export const metadata = { title: 'Orders — Account · mobileDrive' };

const MY_ORDERS = [
  { id: 'MD-2026-1038', placed: 'Oct 6, 2026',  vehicle: 'Porsche 911 Carrera',  total: 123700, status: 'In production', eta: 'Nov 2, 2026',  config: ['Racing Red','Performance','Black Merino','Driver Pkg'] },
  { id: 'MD-2025-0942', placed: 'Dec 11, 2025', vehicle: 'BMW X5 xDrive40i',     total: 68900,  status: 'Delivered',     eta: 'Delivered Feb 3, 2026', config: ['Midnight Blue','Sport','Tan Nappa'] },
];

const statusColor: Record<string, string> = {
  'In production': 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  'Shipping':      'bg-sky-400/15 text-sky-300 border-sky-400/30',
  'Delivered':     'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
  'Pending':       'bg-white/10 text-ink-100 border-white/15',
};

export default function AccountOrdersPage() {
  return (
    <div className="space-y-6">
      <header>
        <div className="eyebrow">Your garage</div>
        <h1 className="mt-2 font-display text-display-md font-semibold text-white">
          Orders
        </h1>
        <p className="mt-2 text-sm text-ink-200">
          {MY_ORDERS.length} orders · track production and delivery here
        </p>
      </header>

      <div className="space-y-4">
        {MY_ORDERS.map((o) => (
          <article
            key={o.id}
            className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="eyebrow">Order {o.id}</div>
                  <h2 className="mt-1 font-display text-lg font-semibold text-white">
                    {o.vehicle}
                  </h2>
                  <div className="mt-0.5 text-[11px] text-ink-200">Placed {o.placed}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ' + (statusColor[o.status] ?? statusColor.Pending)}>
                  {o.status}
                </span>
                <div className="text-right">
                  <div className="font-display text-xl font-semibold text-white tabular-nums">
                    {formatPrice(o.total)}
                  </div>
                  <div className="text-[11px] text-ink-200">{o.eta}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
              <div className="flex flex-wrap gap-1.5">
                {o.config.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-white/[0.08] bg-ink-700/60 px-2 py-0.5 text-[10px] text-ink-100"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <Link
                href={`/account/orders/${o.id}`}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-ink-100 hover:bg-white/5 hover:text-white"
              >
                Track order
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
