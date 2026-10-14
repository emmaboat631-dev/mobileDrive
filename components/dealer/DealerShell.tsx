'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Car, CalendarClock, Receipt, Users, Megaphone, Settings, Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const NAV = [
  { href: '/dealer',           label: 'Overview',     icon: LayoutDashboard },
  { href: '/dealer/inventory', label: 'Inventory',    icon: Car },
  { href: '/dealer/bookings',  label: 'Test drives',  icon: CalendarClock },
  { href: '/dealer/sales',     label: 'Sales',        icon: Receipt },
  { href: '/dealer/customers', label: 'Customers',    icon: Users },
  { href: '/dealer/marketing', label: 'Marketing',    icon: Megaphone },
  { href: '/dealer/settings',  label: 'Settings',     icon: Settings },
];

export function DealerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <section className="container-page pb-20 pt-28">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="shell-rail h-fit rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5">
          <div className="shell-head mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-ink-200">mobileDrive</div>
              <div className="text-sm font-semibold text-white">Dealer</div>
            </div>
          </div>
          <div className="h-px bg-white/[0.06]" />
          <nav className="shell-rail-nav mt-5 space-y-0.5">
            {NAV.map((item) => {
              const active =
                item.href === '/dealer'
                  ? pathname === '/dealer'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm transition',
                    active
                      ? 'bg-white/[0.06] font-semibold text-white shell-rail-active'
                      : 'font-medium text-ink-100 hover:bg-white/[0.03] hover:text-white',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </section>
  );
}
