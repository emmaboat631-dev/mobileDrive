import { LegalPage, type LegalSection } from '@/components/legal/LegalPage';

export const metadata = { title: 'Privacy policy — mobileDrive' };

const SECTIONS: LegalSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    body: (
      <>
        <p>
          mobileDrive ("we", "us") operates a digital marketplace for configuring and
          purchasing vehicles. This policy explains what personal data we collect, how we
          use it, and the rights you have over that data under GDPR, Ghana's Data
          Protection Act, 2012 (Act 843), and comparable regimes.
        </p>
        <p>
          If you only browse the showroom and don't sign in, the only data we store is
          anonymous usage telemetry (described below). Everything else requires an
          account you created.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'What we collect',
    body: (
      <>
        <ul>
          <li><strong>Account data</strong> — email, name, phone, hashed password, optional profile photo.</li>
          <li><strong>Delivery information</strong> — the shipping address you provide at checkout.</li>
          <li><strong>Order history</strong> — the vehicle, configuration, price and status of every order you've placed.</li>
          <li><strong>Saved content</strong> — builds you save, wishlisted vehicles, test-drive bookings.</li>
          <li><strong>Payment metadata</strong> — processor reference, last 4 digits of the card, status. We never store full card numbers; those live only with Stripe or Paystack.</li>
          <li><strong>Usage telemetry</strong> — anonymous page views, 3D viewer errors and feature flags, used to debug the service.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-use-it',
    title: 'How we use it',
    body: (
      <>
        <ul>
          <li>Operate your account and complete orders you place.</li>
          <li>Keep your builds and wishlist in sync across devices.</li>
          <li>Send order updates, test-drive confirmations and (if you opt in) occasional launch news.</li>
          <li>Prevent fraud, abuse and chargebacks.</li>
          <li>Improve the showroom experience through anonymous analytics.</li>
        </ul>
        <p>
          We do not sell your personal data. We do not use it to train third-party AI
          models.
        </p>
      </>
    ),
  },
  {
    id: 'who-sees-it',
    title: 'Who sees your data',
    body: (
      <>
        <ul>
          <li><strong>You.</strong> Everything in your account dashboard.</li>
          <li><strong>Your assigned specialist and the dealer</strong> fulfilling your order — only what they need to deliver the vehicle.</li>
          <li>
            <strong>Processors we rely on</strong>: Supabase (hosted database and
            authentication), Stripe and Paystack (card and mobile-money payments),
            Resend (transactional email), Vercel (hosting). Each has their own privacy
            policy and we only share what the service requires.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    body: (
      <p>
        Order history is retained for 7 years to meet accounting and warranty
        obligations. Everything else is deleted within 30 days of you closing your
        account. You can request a copy or deletion at any time from{' '}
        <code>account → settings → data &amp; privacy</code>.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: (
      <>
        <p>Depending on where you live, you have the right to:</p>
        <ul>
          <li>Access the data we hold about you.</li>
          <li>Correct it if it's wrong.</li>
          <li>Request we delete it.</li>
          <li>Receive it in a portable format.</li>
          <li>Object to a specific processing purpose.</li>
        </ul>
        <p>
          Exercise any of these from your account settings, or by emailing{' '}
          <a href="mailto:privacy@mobiledrive.app">privacy@mobiledrive.app</a>. We
          respond within 30 days.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        <strong>Data controller</strong>: mobileDrive, 12 Independence Ave, Accra, Ghana.
        Our Data Protection Officer is reachable at{' '}
        <a href="mailto:dpo@mobiledrive.app">dpo@mobiledrive.app</a>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      kind="Privacy policy"
      title="Your data, in plain language."
      lede="This is the complete picture of what mobileDrive does with your personal information. Short sections, plain English, no legalese traps."
      effective="October 1, 2026"
      sections={SECTIONS}
    />
  );
}
