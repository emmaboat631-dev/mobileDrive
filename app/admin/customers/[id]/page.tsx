import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { formatPrice, relativeTime } from '@/lib/utils/format';
import { getServerSupabase } from '@/lib/supabase/server';
import { fetchDealers } from '@/lib/admin/dealers';
import { StatusBadge, statusTone } from '@/components/ui';
import { RoleEditor } from './RoleEditor';

export const metadata = { title: 'Customer — Admin · mobileDrive' };
export const dynamic = 'force-dynamic';

interface ProfileFull {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'dealer' | 'admin';
  region: string | null;
  dealer_id: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface OrderMini {
  id: string;
  grand_total: number;
  status: string;
  created_at: string;
}

async function fetchProfileFull(id: string) {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const db = supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (k: string, v: string) => {
          maybeSingle?: () => Promise<{ data: ProfileFull | null }>;
          order?: (c: string, o: { ascending: boolean }) => Promise<{ data: OrderMini[] | null }>;
        };
      };
    };
  };

  const { data: profile } = await db
    .from('profiles')
    .select('id, email, full_name, phone, role, region, dealer_id, avatar_url, created_at')
    .eq('id', id)
    .maybeSingle!();

  if (!profile) return null;

  const { data: orders } = await db
    .from('orders')
    .select('id, grand_total, status, created_at')
    .eq('user_id', id)
    .order!('created_at', { ascending: false });

  return { profile, orders: orders ?? [] };
}

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  const result = await fetchProfileFull(params.id);
  if (!result) notFound();
  const { profile, orders } = result;

  const dealers = await fetchDealers();

  const spent = orders.reduce((s, o) => (o.status === 'cancelled' ? s : s + o.grand_total), 0);

  const initials = (profile.full_name ?? profile.email ?? 'U')
    .split(/[\s@._-]+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-xs text-ink-100 hover:text-white">
        <ArrowLeft className="h-3 w-3" />
        Customers
      </Link>

      <section className="rounded-3xl border border-white/[0.06] bg-ink-800/60 p-6">
        <div className="flex items-start gap-5">
          <div
            className="grid h-16 w-16 shrink-0 place-items-center rounded-full font-display text-2xl font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #A078FF, #FF78A0)' }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-display-sm font-semibold text-white">
              {profile.full_name ?? profile.email ?? profile.id.slice(0, 8)}
            </h1>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-200">
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1.5 hover:text-white">
                  <Mail className="h-3.5 w-3.5" /> {profile.email}
                </a>
              )}
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className="inline-flex items-center gap-1.5 hover:text-white">
                  <Phone className="h-3.5 w-3.5" /> {profile.phone}
                </a>
              )}
              {profile.region && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {profile.region}
                </span>
              )}
            </div>
            <div className="mt-3 text-[11px] text-ink-300">
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-white/[0.06] pt-5">
          <RoleEditor
            userId={profile.id}
            currentRole={profile.role}
            currentDealerId={profile.dealer_id}
            dealers={dealers}
          />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Lifetime spend" value={formatPrice(spent)} />
        <Stat label="Orders" value={String(orders.length)} />
        <Stat label="Last order" value={orders[0] ? relativeTime(orders[0].created_at) : '—'} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60">
        <header className="flex items-center justify-between px-6 py-5">
          <h2 className="font-display text-xl font-semibold text-white">Orders</h2>
          <span className="text-xs text-ink-200">{orders.length} total</span>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-y border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-ink-300">
              <tr>
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Placed</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {orders.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-ink-200">No orders yet.</td></tr>
              )}
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-3.5 font-medium text-white">
                    <Link href={`/admin/orders/${o.id}`} className="hover:underline">{o.id.slice(0, 8).toUpperCase()}</Link>
                  </td>
                  <td className="px-6 py-3.5 text-ink-200">{relativeTime(o.created_at)}</td>
                  <td className="px-6 py-3.5">
                    <StatusBadge tone={statusTone(o.status)}>{o.status}</StatusBadge>
                  </td>
                  <td className="px-6 py-3.5 text-right font-medium text-white tabular-nums">
                    {formatPrice(o.grand_total)}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5">
      <div className="eyebrow">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold text-white tabular-nums">{value}</div>
    </div>
  );
}
