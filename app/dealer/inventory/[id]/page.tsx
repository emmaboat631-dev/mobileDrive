import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Package, Truck, Plus, Minus, AlertTriangle, Check,
} from 'lucide-react';
import { getHeroColor } from '@/lib/vehicles/data';
import { fetchVehicleById } from '@/lib/admin/queries';
import { formatPrice } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const v = await fetchVehicleById(params.id);
  return { title: v ? `${v.brand} ${v.model} — Inventory · mobileDrive` : 'Inventory · mobileDrive' };
}

// Mock showroom-level inventory. In production, resolve from a
// dealer_inventory table keyed by (dealer_id, vehicle_id).
const MOCK_STOCK: Record<string, {
  onHand: number;
  reserved: number;
  incoming: number;
  bay: string;
  vins: Array<{ vin: string; status: string; color: string; wheel: string }>;
  incomingList: Array<{ eta: string; qty: number; port: string }>;
  reservations: Array<{ buyer: string; stage: string; total: number }>;
}> = {
  'porsche-911': {
    onHand: 2,
    reserved: 1,
    incoming: 3,
    bay: 'A3-A4',
    vins: [
      { vin: 'WP0AB2A99KS123456', status: 'Available',    color: 'Racing Red',    wheel: 'Performance' },
      { vin: 'WP0AB2A99KS123478', status: 'Reserved',     color: 'Pearl White',   wheel: 'Carbon Forged' },
    ],
    incomingList: [
      { eta: 'Oct 24, 2026', qty: 1, port: 'Tema' },
      { eta: 'Nov 7, 2026',  qty: 2, port: 'Hamburg → Tema' },
    ],
    reservations: [
      { buyer: 'Ama Owusu',  stage: 'Deposit paid', total: 123700 },
    ],
  },
};

export default async function DealerVehicleStockPage({ params }: { params: { id: string } }) {
  const vehicle = await fetchVehicleById(params.id);
  if (!vehicle) notFound();

  const color = getHeroColor(vehicle);
  const stock = MOCK_STOCK[vehicle.id] ?? {
    onHand: 1, reserved: 0, incoming: 0, bay: '—',
    vins: [{ vin: '—', status: 'Available', color: color.name, wheel: 'Sport' }],
    incomingList: [],
    reservations: [],
  };
  const low = stock.onHand <= 2;

  return (
    <div className="space-y-6">
      <Link
        href="/dealer/inventory"
        className="inline-flex items-center gap-1.5 text-xs text-ink-100 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" />
        Inventory
      </Link>

      {/* Header */}
      <section className="rounded-3xl border border-white/[0.06] bg-ink-800/60 p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-5">
            <div
              className="h-24 w-36 shrink-0 overflow-hidden rounded-xl"
              style={{
                background: `radial-gradient(60% 60% at 50% 50%, ${color.hex}cc, #0A0B0E 85%)`,
              }}
            >
              <svg viewBox="0 0 150 100" className="h-full w-full" aria-hidden>
                <path
                  d="M20,70 L35,50 Q58,38 75,37 Q92,38 115,50 L130,70 Q128,78 120,79 L115,79 Q113,73 106,73 Q99,73 97,79 L53,79 Q51,73 44,73 Q37,73 35,79 L30,79 Q22,78 20,70 Z"
                  fill={color.hex}
                />
                <circle cx="44" cy="76" r="7" fill="#0A0B0E" stroke="#2A2D33" />
                <circle cx="106" cy="76" r="7" fill="#0A0B0E" stroke="#2A2D33" />
              </svg>
            </div>
            <div>
              <div className="eyebrow">{vehicle.brand} · {vehicle.year}</div>
              <h1 className="mt-1 font-display text-display-md font-semibold text-white">
                {vehicle.model}
              </h1>
              <p className="mt-1 text-sm text-ink-200">
                Showroom bay <code className="text-white">{stock.bay}</code> · starting {formatPrice(vehicle.price, vehicle.currency)}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-ink-700/60 px-2.5 py-0.5 text-[11px] text-ink-100">
                  {vehicle.bodyType}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-ink-700/60 px-2.5 py-0.5 text-[11px] text-ink-100">
                  {vehicle.driveType}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-ink-700/60 px-2.5 py-0.5 text-[11px] text-ink-100">
                  {vehicle.fuelType}
                </span>
                {low && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/15 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
                    <AlertTriangle className="h-2.5 w-2.5" />
                    Low stock
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/vehicles/${vehicle.id}`}
              target="_blank"
              className="btn-secondary"
            >
              Open on site →
            </Link>
            <button type="button" className="btn-primary">
              <Plus className="h-4 w-4" />
              Receive stock
            </button>
          </div>
        </div>

        {/* Stock strip */}
        <div className="mt-6 grid gap-4 border-t border-white/[0.06] pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <Stock label="On hand"   value={stock.onHand}   warn={low} />
          <Stock label="Reserved"  value={stock.reserved} />
          <Stock label="Incoming"  value={stock.incoming} />
          <Stock label="Sold YTD"  value={14} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* VINs on hand */}
          <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60">
            <header className="flex items-center justify-between px-6 py-5">
              <div>
                <div className="eyebrow">On hand</div>
                <h2 className="mt-1 font-display text-xl font-semibold text-white">
                  Individual units
                </h2>
              </div>
              <button type="button" className="btn-secondary text-xs">
                <Plus className="h-3.5 w-3.5" />
                Add VIN
              </button>
            </header>
            <div className="stack-table overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-y border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-ink-300">
                  <tr>
                    <th className="px-6 py-3 font-medium">VIN</th>
                    <th className="px-6 py-3 font-medium">Paint</th>
                    <th className="px-6 py-3 font-medium">Wheels</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {stock.vins.map((v) => (
                    <tr key={v.vin} className="hover:bg-white/[0.02]">
                      <td data-label="VIN" className="px-6 py-3.5 font-mono text-xs text-white">{v.vin}</td>
                      <td data-label="Paint" className="px-6 py-3.5 text-ink-100">{v.color}</td>
                      <td data-label="Wheels" className="px-6 py-3.5 text-ink-100">{v.wheel}</td>
                      <td data-label="Status" className="px-6 py-3.5">
                        <span
                          className={
                            'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ' +
                            (v.status === 'Available'
                              ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-400'
                              : 'border-indigo-400/30 bg-indigo-400/15 text-indigo-300')
                          }
                        >
                          {v.status}
                        </span>
                      </td>
                      <td data-label="" className="px-6 py-3.5 text-right">
                        <button
                          type="button"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-ink-100 hover:bg-white/5"
                          aria-label={`Decrement ${v.vin}`}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Incoming */}
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="eyebrow">Incoming</div>
                <h2 className="mt-1 font-display text-xl font-semibold text-white">
                  Expected shipments
                </h2>
              </div>
              <button type="button" className="btn-secondary text-xs">
                <Truck className="h-3.5 w-3.5" />
                Log shipment
              </button>
            </div>
            {stock.incomingList.length === 0 ? (
              <p className="mt-4 text-sm text-ink-200">No shipments expected.</p>
            ) : (
              <div className="mt-5 space-y-2.5">
                {stock.incomingList.map((s) => (
                  <div
                    key={s.eta}
                    className="flex items-center gap-4 rounded-xl bg-ink-700/40 px-4 py-3"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10">
                      <Truck className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-white">
                        {s.qty} unit{s.qty === 1 ? '' : 's'} · ETA {s.eta}
                      </div>
                      <div className="text-[11px] text-ink-200">{s.port}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/30 bg-sky-400/15 px-2.5 py-0.5 text-[11px] font-medium text-sky-300">
                      In transit
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right rail */}
        <aside className="space-y-6">
          {/* Reservations */}
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-white">Reservations</h2>
              <span className="text-xs text-ink-200">{stock.reservations.length}</span>
            </div>
            {stock.reservations.length === 0 ? (
              <p className="mt-3 text-xs text-ink-200">No one has reserved a unit yet.</p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {stock.reservations.map((r) => (
                  <li
                    key={r.buyer}
                    className="rounded-xl bg-ink-700/40 px-3.5 py-3"
                  >
                    <div className="text-sm font-medium text-white">{r.buyer}</div>
                    <div className="mt-0.5 flex items-center justify-between text-[11px]">
                      <span className="text-ink-200">{r.stage}</span>
                      <span className="font-medium text-white">
                        {formatPrice(r.total)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Quick stats */}
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-base font-semibold text-white">30-day sell-through</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <KV k="Walk-ins"           v="42" />
              <KV k="Test drives"        v="18" />
              <KV k="Orders"             v="4" />
              <KV k="Avg time on floor"  v="21 days" />
            </dl>
          </section>

          {/* Service */}
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-base font-semibold text-white">Pre-delivery</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Check3 label="Delivery check completed" done />
              <Check3 label="Floor matting fitted"      done />
              <Check3 label="Workshop handover" />
              <Check3 label="Buyer walk-through" />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Stock({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div
        className={
          'mt-1 font-display text-3xl font-semibold -tracking-[0.025em] tabular-nums ' +
          (warn ? 'text-amber-300' : 'text-white')
        }
      >
        {value}
      </div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-200">{k}</dt>
      <dd className="font-medium text-white tabular-nums">{v}</dd>
    </div>
  );
}

function Check3({ label, done }: { label: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={
          'grid h-5 w-5 shrink-0 place-items-center rounded-full ' +
          (done ? 'bg-emerald-400/15 text-emerald-400' : 'bg-white/[0.05] text-ink-300')
        }
      >
        {done ? <Check className="h-3 w-3" /> : <Package className="h-3 w-3" />}
      </span>
      <span className={done ? 'text-ink-100' : 'text-ink-200'}>{label}</span>
    </div>
  );
}
