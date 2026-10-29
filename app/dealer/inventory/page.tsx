import Link from 'next/link';
import { Plus, Search, ArrowUpRight } from 'lucide-react';
import { getHeroColor } from '@/lib/vehicles/data';
import { fetchVehicles } from '@/lib/admin/queries';
import { formatPrice } from '@/lib/utils/format';

export const metadata = { title: 'Inventory — Dealer · mobileDrive' };
export const dynamic = 'force-dynamic';

// Showroom-level stock is not yet tracked in the schema; keep a static sample so
// the UI shows plausible on-hand/reserved figures until a `stock` table lands.
const STOCK_LEVELS: Record<string, { onHand: number; reserved: number }> = {
  'm4-competition':     { onHand: 4, reserved: 1 },
  'porsche-911':        { onHand: 2, reserved: 1 },
  'tesla-model-s':      { onHand: 1, reserved: 0 },
  'amg-gt':             { onHand: 3, reserved: 0 },
  'audi-rs6':           { onHand: 2, reserved: 2 },
  'range-rover-sport':  { onHand: 6, reserved: 1 },
};

export default async function DealerInventoryPage() {
  const vehicles = await fetchVehicles();
  const totalOnHand = vehicles.reduce((s, v) => s + (STOCK_LEVELS[v.id]?.onHand ?? 0), 0);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="eyebrow">Dealer inventory</div>
          <h1 className="mt-2 font-display text-display-md font-semibold text-white">
            Inventory
          </h1>
          <p className="mt-2 text-sm text-ink-200">
            {totalOnHand} vehicles on hand · Accra showroom
          </p>
        </div>
        <Link href="/dealer/inventory/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          List vehicle
        </Link>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'On hand', 'Reserved', 'Low stock', 'Incoming'].map((t, i) => (
          <button
            key={t}
            type="button"
            className={
              'rounded-full border px-3.5 py-1.5 text-xs font-medium transition ' +
              (i === 0 ? 'border-white bg-white text-ink-900' : 'border-white/10 text-ink-100 hover:border-white/30')
            }
          >
            {t}
          </button>
        ))}
        <div className="relative ml-auto w-full max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            type="search"
            placeholder="Search by brand or model…"
            className="h-10 w-full rounded-full border border-white/10 bg-ink-700 pl-11 pr-4 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((v) => {
          const stock = STOCK_LEVELS[v.id] ?? { onHand: 0, reserved: 0 };
          const low = stock.onHand <= 2;
          const color = getHeroColor(v);
          return (
            <article
              key={v.id}
              className="overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60"
            >
              <div
                className="aspect-[16/9]"
                style={{
                  background: `radial-gradient(60% 60% at 50% 50%, ${color.hex}cc, #0A0B0E 85%)`,
                }}
              >
                <svg viewBox="0 0 400 170" className="h-full w-full" aria-hidden>
                  <ellipse cx="200" cy="150" rx="150" ry="8" fill="#000" opacity="0.5" />
                  <path
                    d="M60,130 L95,80 Q145,55 200,52 Q255,55 305,80 L340,130 Q335,145 315,146 L305,146 Q301,135 288,135 Q275,135 271,146 L129,146 Q125,135 112,135 Q99,135 95,146 L85,146 Q65,145 60,130 Z"
                    fill={color.hex}
                  />
                  <path d="M135,80 Q175,60 200,58 Q225,60 265,80 L255,96 L145,96 Z" fill="#0A0C10" opacity="0.95" />
                  <circle cx="112" cy="140" r="14" fill="#0A0B0E" stroke="#3A3F48" />
                  <circle cx="288" cy="140" r="14" fill="#0A0B0E" stroke="#3A3F48" />
                </svg>
              </div>

              <div className="p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <div className="eyebrow">{v.brand} · {v.year}</div>
                    <div className="truncate font-display text-lg font-semibold text-white">
                      {v.model}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-display text-base font-semibold text-white">
                      {formatPrice(v.price, v.currency)}
                    </div>
                    <div className="text-[10px] text-ink-200">starting</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-4">
                  <StockTile k="On hand" v={stock.onHand} warn={low} />
                  <StockTile k="Reserved" v={stock.reserved} />
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={`/dealer/inventory/${v.id}`}
                    className="btn-secondary flex-1 text-xs"
                  >
                    Manage
                  </Link>
                  <Link
                    href={`/vehicles/${v.id}`}
                    target="_blank"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-ink-100 hover:bg-white/5"
                    aria-label={`Open ${v.model} on site`}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function StockTile({ k, v, warn }: { k: string; v: number; warn?: boolean }) {
  return (
    <div className="rounded-xl bg-ink-700/40 px-3 py-2.5">
      <div className="text-[10px] font-medium uppercase tracking-wider text-ink-300">{k}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className={'font-display text-lg font-semibold tabular-nums ' + (warn ? 'text-amber-300' : 'text-white')}>
          {v}
        </span>
        {warn && <span className="text-[10px] text-amber-300">low</span>}
      </div>
    </div>
  );
}
