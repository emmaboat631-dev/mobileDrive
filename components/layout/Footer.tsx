'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lockup } from '@/components/brand/Logo';

interface FooterItem {
  label: string;
  href?: string;
  disabled?: boolean;
}

// Routes that are full-viewport app chrome — a footer makes no sense here,
// it just competes with the primary content (configurator, admin shell, etc).
const HIDE_FOOTER_PREFIXES = ['/configure', '/admin', '/dealer', '/account', '/checkout', '/sign-in', '/sign-up', '/forgot-password', '/auth'];

export function Footer() {
  const pathname = usePathname();
  if (HIDE_FOOTER_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <footer className="mt-24 border-t border-white/[0.06] bg-ink-900">
      <div className="container-page grid grid-cols-2 gap-10 py-16 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" aria-label="mobileDrive — home" className="inline-flex items-center text-white">
            <Lockup size="md" tone="light" />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-200">
            Configure. Experience. Drive. A premium 3D automotive marketplace.
          </p>
        </div>
        <FooterCol
          title="Shop"
          items={[
            { label: 'Vehicles', href: '/vehicles' },
            { label: 'Compare', href: '/compare' },
            { label: 'Wishlist', href: '/account/wishlist' },
          ]}
        />
        <FooterCol
          title="Experience"
          items={[
            { label: 'Showroom', href: '/' },
            { label: 'Configurator', href: '/configure/porsche-911' },
            { label: 'Book a test drive', href: '/test-drive/porsche-911' },
          ]}
        />
        <FooterCol
          title="Account"
          items={[
            { label: 'Sign in', href: '/sign-in' },
            { label: 'Create account', href: '/sign-up' },
            { label: 'My garage', href: '/account' },
            { label: 'Orders', href: '/account/orders' },
          ]}
        />
      </div>
      <div className="container-page flex flex-col gap-3 border-t border-white/[0.06] py-6 text-xs text-ink-300 md:flex-row md:items-center md:justify-between">
        <div>© {new Date().getFullYear()} mobileDrive. Demo inventory shown.</div>
        <div className="flex gap-5 text-ink-300">
          <span className="opacity-60" title="Not yet implemented">Privacy</span>
          <span className="opacity-60" title="Not yet implemented">Terms</span>
          <span className="opacity-60" title="Not yet implemented">Cookies</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: FooterItem[] }) {
  return (
    <div>
      <div className="eyebrow mb-4">{title}</div>
      <ul className="space-y-2.5 text-sm">
        {items.map((i) => (
          <li key={i.label}>
            {i.href && !i.disabled ? (
              <Link href={i.href} className="text-ink-100 transition hover:text-white">
                {i.label}
              </Link>
            ) : (
              <span className="text-ink-300 opacity-60">{i.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
