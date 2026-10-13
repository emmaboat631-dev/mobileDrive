'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Heart, Zap, Package, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const NAV = [
  { href: '/account',          icon: Home,     label: 'Overview' },
  { href: '/account/wishlist', icon: Heart,    label: 'Wishlist' },
  { href: '/account/builds',   icon: Zap,      label: 'Builds' },
  { href: '/account/orders',   icon: Package,  label: 'Orders' },
  { href: '/account/settings', icon: Settings, label: 'Settings' },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <section className="container-page pb-20 pt-28">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="shell-rail h-fit rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5">
          <div className="shell-head flex items-center gap-3">
            <div
              className="grid h-11 w-11 place-items-center rounded-full font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #A078FF, #FF78A0)' }}
            >
              A
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">Asiamah J.</div>
              <div className="text-[11px] text-ink-200">Premium member</div>
            </div>
          </div>
          <div className="my-5 h-px bg-white/[0.06]" />
          <nav className="shell-rail-nav space-y-0.5">
            {NAV.map((item) => {
              const active =
                item.href === '/account'
                  ? pathname === '/account'
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
