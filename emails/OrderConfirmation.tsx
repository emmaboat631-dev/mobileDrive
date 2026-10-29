import { Button, Heading, Hr, Section, Text } from '@react-email/components';
import { EmailLayout } from './_Layout';

export interface OrderConfirmationProps {
  siteUrl: string;
  firstName: string;
  orderId: string;
  vehicleBrand: string;
  vehicleModel: string;
  amountFormatted: string;      // e.g. "$147,560"
  paystackReference: string | null;
  estDeliveryWeeks: string;     // e.g. "3–4 weeks"
  dealerName: string;
}

/**
 * Sent to the buyer when charge.success fires. Doubles as a receipt — includes
 * amount paid + Paystack reference so the buyer can forward for proof.
 */
export function OrderConfirmationEmail({
  siteUrl, firstName, orderId, vehicleBrand, vehicleModel,
  amountFormatted, paystackReference, estDeliveryWeeks, dealerName,
}: OrderConfirmationProps) {
  const shortId = orderId.slice(0, 8).toUpperCase();

  return (
    <EmailLayout
      preview={`Order ${shortId} confirmed · ${vehicleBrand} ${vehicleModel}`}
      siteUrl={siteUrl}
    >
      <Heading as="h1" className="m-0 font-sans text-2xl font-semibold text-white">
        Order confirmed — thanks, {firstName}.
      </Heading>
      <Text className="mt-3 text-sm text-white/80">
        We&apos;ve received your payment of <strong className="text-white">{amountFormatted}</strong>.
        Your <strong className="text-white">{vehicleBrand} {vehicleModel}</strong> is now in the
        production queue at {dealerName}.
      </Text>

      <Section className="mt-6 rounded-xl border border-white/10 bg-[#121418] p-5 text-sm">
        <Row k="Order" v={shortId} />
        <Row k="Vehicle" v={`${vehicleBrand} ${vehicleModel}`} />
        <Row k="Amount paid" v={amountFormatted} />
        {paystackReference && <Row k="Payment reference" v={paystackReference} mono />}
        <Row k="Estimated delivery" v={estDeliveryWeeks} />
        <Row k="Dealer" v={dealerName} />
      </Section>

      <Section className="mt-6">
        <Button
          href={`${siteUrl}/account/orders/${orderId}`}
          className="rounded-full bg-white px-6 py-3 text-sm font-medium text-[#07080A]"
        >
          Track your order →
        </Button>
      </Section>

      <Hr className="my-6 border-white/10" />

      <Text className="text-xs text-white/60">
        A mobileDrive specialist from {dealerName} will reach out within one business day
        to walk you through next steps. Reply to this email if you have questions in the meantime.
      </Text>
    </EmailLayout>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
      <span style={{ color: 'rgba(255,255,255,0.6)' }}>{k}</span>
      <span
        style={{
          color: '#fff',
          fontWeight: 500,
          fontFamily: mono ? 'ui-monospace, Menlo, monospace' : undefined,
          fontSize: mono ? '12px' : undefined,
        }}
      >
        {v}
      </span>
    </div>
  );
}
