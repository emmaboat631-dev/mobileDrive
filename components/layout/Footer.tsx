import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/[0.06] bg-ink-900">
      <div className="container-page grid grid-cols-2 gap-10 py-16 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <div className="font-display text-lg font-semibold text-white">mobileDrive</div>
          <p className="mt-3 max-w-xs text-sm text-ink-200">
            Configure. Experience. Drive. A premium 3D automotive marketplace.
          </p>
        </div>
        <FooterCol
          title="Shop"
          items={[
            { label: 'Vehicles', href: '/vehicles' },
            { label: 'Compare', href: '/compare' },
            { label: 'Deals', href: '/deals' },
            { label: 'Wishlist', href: '/wishlist' },
          ]}
        />
        <FooterCol
          title="Experience"
          items={[
            { label: 'Showroom', href: '/' },
            { label: 'Configurator', href: '/configure/m4-competition' },
            { label: 'Test drive', href: '/test-drive' },
          ]}
        />
        <FooterCol
          title="Company"
          items={[
            { label: 'About', href: '/about' },
            { label: 'Press', href: '/press' },
            { label: 'Careers', href: '/careers' },
            { label: 'Contact', href: '/contact' },
          ]}
        />
      </div>
      <div className="container-page flex flex-col gap-2 py-6 border-t border-white/[0.06] text-xs text-ink-300 md:flex-row md:items-center md:justify-between">
        <div>© {new Date().getFullYear()} mobileDrive. Demo inventory shown.</div>
        <div className="flex gap-5">
          <Link href="/legal/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/legal/terms" className="hover:text-white">Terms</Link>
          <Link href="/legal/cookies" className="hover:text-white">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <div className="eyebrow mb-4">{title}</div>
      <ul className="space-y-2.5 text-sm">
        {items.map((i) => (
          <li key={i.label}>
            <Link href={i.href} className="text-ink-100 hover:text-white">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
