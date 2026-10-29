import { LegalPage, type LegalSection } from '@/components/legal/LegalPage';

export const metadata = { title: 'Terms of service — mobileDrive' };

const SECTIONS: LegalSection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance',
    body: (
      <p>
        By creating an account, placing an order, or booking a test drive on
        mobileDrive, you agree to these terms. If you don't agree, don't use the
        service. These terms form a binding contract between you and mobileDrive Ltd.
      </p>
    ),
  },
  {
    id: 'who-can-use',
    title: 'Who can use mobileDrive',
    body: (
      <>
        <p>
          You must be at least 18 years old and legally able to buy a vehicle in your
          region. You must provide accurate information. One account per person — don't
          share credentials.
        </p>
        <p>
          Dealer and admin accounts are issued by mobileDrive and are subject to a
          separate commercial agreement.
        </p>
      </>
    ),
  },
  {
    id: 'orders',
    title: 'Orders and vehicles',
    body: (
      <>
        <p>
          Showroom prices are indicative. A binding offer only exists once:
        </p>
        <ul>
          <li>You submit the configurator to the cart,</li>
          <li>You complete checkout,</li>
          <li>And mobileDrive confirms the order by email.</li>
        </ul>
        <p>
          Until confirmation, we may decline an order for any lawful reason (stock,
          pricing error, suspicious activity, inability to deliver to your region).
          Where we decline after taking a deposit, we refund in full within 7 days.
        </p>
      </>
    ),
  },
  {
    id: 'delivery',
    title: 'Delivery and risk',
    body: (
      <p>
        Risk and title pass to you on delivery. Delivery windows are estimates, not
        guarantees. If delivery is delayed by more than 60 days from the estimate, you
        may cancel for a full refund.
      </p>
    ),
  },
  {
    id: 'payments',
    title: 'Payments',
    body: (
      <>
        <p>
          You can pay with any supported method shown at checkout. All prices on the
          website are inclusive of VAT where shown. The amount charged is the amount
          displayed at checkout at the time you placed the order.
        </p>
        <p>
          Refunds, where owed, go back to the original payment method within 14 days.
        </p>
      </>
    ),
  },
  {
    id: 'returns',
    title: 'Cancellations and returns',
    body: (
      <>
        <p>
          For custom-built vehicles (anything that enters production with your chosen
          colour, trim or packages), cancellation after production starts incurs a 10%
          restocking fee. Before production, you can cancel for a full refund.
        </p>
        <p>
          Standard-inventory vehicles can be returned within 14 days of delivery if
          unused and undamaged, minus a cleaning fee.
        </p>
      </>
    ),
  },
  {
    id: 'content',
    title: 'Your content',
    body: (
      <p>
        You keep ownership of anything you submit — saved builds, messages, reviews.
        You grant mobileDrive a non-exclusive licence to display that content back to
        you and (for reviews) to prospective buyers. We never claim ownership.
      </p>
    ),
  },
  {
    id: 'warranties',
    title: 'Warranties and liability',
    body: (
      <>
        <p>
          Vehicles come with the manufacturer's warranty. mobileDrive provides a
          12-month platform-level guarantee covering delivery and configuration
          accuracy.
        </p>
        <p>
          To the maximum extent permitted by law, our aggregate liability for any
          claim related to the service is capped at the amount you paid for the
          relevant vehicle.
        </p>
      </>
    ),
  },
  {
    id: 'termination',
    title: 'Termination',
    body: (
      <p>
        You can close your account at any time from settings. We can suspend or close
        your account if you breach these terms or use the service to defraud others.
        Open orders are honoured through to delivery or refund.
      </p>
    ),
  },
  {
    id: 'governing-law',
    title: 'Governing law',
    body: (
      <p>
        These terms are governed by the laws of Ghana. Disputes go to the courts of
        Accra, except where mandatory consumer law requires otherwise.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      kind="Terms of service"
      title="The rules of the showroom."
      lede="What you agree to when you use mobileDrive — what we promise, what we don't, and what to do if something goes wrong."
      effective="October 1, 2026"
      sections={SECTIONS}
    />
  );
}
