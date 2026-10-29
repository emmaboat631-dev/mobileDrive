import { LegalPage, type LegalSection } from '@/components/legal/LegalPage';

export const metadata = { title: 'Cookie policy — mobileDrive' };

const SECTIONS: LegalSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    body: (
      <p>
        mobileDrive uses a small number of cookies and similar local-storage
        technologies to make the showroom work, keep you signed in, remember what you
        liked, and understand which parts of the service people use. This page lists
        all of them and lets you turn the non-essential ones off.
      </p>
    ),
  },
  {
    id: 'essential',
    title: 'Essential cookies',
    body: (
      <>
        <p>
          Required for the service to work. You can't turn these off without
          breaking core features like signing in and paying.
        </p>
        <div className="stack-table mt-4 overflow-hidden rounded-xl border border-white/[0.06]">
          <table className="w-full text-sm">
            <thead className="bg-ink-800 text-left text-[11px] uppercase tracking-wider text-ink-300">
              <tr>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Purpose</th>
                <th className="px-4 py-2.5 font-medium">Lifespan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              <tr>
                <td data-label="Name" className="px-4 py-3 font-mono text-xs text-white">sb-access-token</td>
                <td data-label="Purpose" className="px-4 py-3">Keeps you signed in across pages.</td>
                <td data-label="Lifespan" className="px-4 py-3">1 hour</td>
              </tr>
              <tr>
                <td data-label="Name" className="px-4 py-3 font-mono text-xs text-white">sb-refresh-token</td>
                <td data-label="Purpose" className="px-4 py-3">Issues a new access token when the old one expires.</td>
                <td data-label="Lifespan" className="px-4 py-3">30 days</td>
              </tr>
              <tr>
                <td data-label="Name" className="px-4 py-3 font-mono text-xs text-white">mobiledrive.cart.v1</td>
                <td data-label="Purpose" className="px-4 py-3">Remembers what you've added to your cart.</td>
                <td data-label="Lifespan" className="px-4 py-3">Until you sign out or clear it</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: 'functional',
    title: 'Functional storage',
    body: (
      <>
        <p>
          Local to your browser. We use them for convenience features that make the
          service nicer. You can clear them at any time from your browser's privacy
          settings.
        </p>
        <div className="stack-table mt-4 overflow-hidden rounded-xl border border-white/[0.06]">
          <table className="w-full text-sm">
            <thead className="bg-ink-800 text-left text-[11px] uppercase tracking-wider text-ink-300">
              <tr>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              <tr>
                <td data-label="Name" className="px-4 py-3 font-mono text-xs text-white">mobiledrive.wishlist.v1</td>
                <td data-label="Purpose" className="px-4 py-3">Keeps your hearted vehicles across sessions.</td>
              </tr>
              <tr>
                <td data-label="Name" className="px-4 py-3 font-mono text-xs text-white">mobiledrive.configurator.last</td>
                <td data-label="Purpose" className="px-4 py-3">Remembers the paint/wheels you last picked.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: 'analytics',
    title: 'Analytics',
    body: (
      <>
        <p>
          Anonymous usage telemetry (page views, 3D viewer errors, feature flags). We
          use it to debug and improve the service. No personal identifiers are sent to
          the analytics processor.
        </p>
        <p>
          You can opt out from <code>account → settings → data &amp; privacy</code>, or by
          enabling your browser's Do Not Track / Global Privacy Control signal — we
          honour both.
        </p>
      </>
    ),
  },
  {
    id: 'third-party',
    title: 'Third-party services on checkout',
    body: (
      <>
        <p>
          Our payment pages are hosted by Stripe or Paystack. Those processors set
          their own cookies to detect fraud and keep the payment session safe. Their
          cookies are governed by their policies:
        </p>
        <ul>
          <li>
            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">
              Stripe privacy policy
            </a>
          </li>
          <li>
            <a href="https://paystack.com/privacy" target="_blank" rel="noopener noreferrer">
              Paystack privacy policy
            </a>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'managing',
    title: 'Managing your preferences',
    body: (
      <p>
        You can clear any cookie from your browser's privacy settings. In every modern
        browser, open settings and look for "Site settings" or "Cookies and site data".
        You can also sign out, which immediately invalidates the auth tokens on this
        device.
      </p>
    ),
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      kind="Cookie policy"
      title="What's in your browser and why."
      lede="A short, honest list of every cookie and local-storage key mobileDrive sets, what it's for, and how long it sticks around."
      effective="October 1, 2026"
      sections={SECTIONS}
    />
  );
}
