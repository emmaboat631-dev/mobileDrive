import { Button, Heading, Hr, Section, Text } from '@react-email/components';
import { EmailLayout } from './_Layout';

export interface DealerNewOrderProps {
  siteUrl: string;
  dealerName: string;
  orderId: string;
  buyerName: string;
  buyerEmail: string | null;
  buyerPhone: string | null;
  vehicleBrand: string;
  vehicleModel: string;
  amountFormatted: string;
}

/**
 * Sent to the showroom's email when a new order is captured. Short, scannable,
 * one CTA — the dealer taps "Open in admin" to view/action it.
 */
export function DealerNewOrderEmail({
  siteUrl, dealerName, orderId, buyerName, buyerEmail, buyerPhone,
  vehicleBrand, vehicleModel, amountFormatted,
}: DealerNewOrderProps) {
  const shortId = orderId.slice(0, 8).toUpperCase();

  return (
    <EmailLayout
      preview={`New order ${shortId} · ${vehicleBrand} ${vehicleModel} · ${amountFormatted}`}
      siteUrl={siteUrl}
    >
      <Heading as="h1" className="m-0 font-sans text-2xl font-semibold text-white">
        New order at {dealerName}.
      </Heading>
      <Text className="mt-3 text-sm text-white/80">
        {buyerName} just paid <strong className="text-white">{amountFormatted}</strong> for
        a <strong className="text-white">{vehicleBrand} {vehicleModel}</strong>.
      </Text>

      <Section className="mt-6 rounded-xl border border-white/10 bg-[#121418] p-5 text-sm">
        <Row k="Order" v={shortId} />
        <Row k="Vehicle" v={`${vehicleBrand} ${vehicleModel}`} />
        <Row k="Amount" v={amountFormatted} />
        <Row k="Buyer" v={buyerName} />
        {buyerEmail && <Row k="Email" v={buyerEmail} />}
        {buyerPhone && <Row k="Phone" v={buyerPhone} />}
      </Section>

      <Section className="mt-6">
        <Button
          href={`${siteUrl}/admin/orders/${orderId}`}
          className="rounded-full bg-white px-6 py-3 text-sm font-medium text-[#07080A]"
        >
          Open order in admin →
        </Button>
      </Section>

      <Hr className="my-6 border-white/10" />

      <Text className="text-xs text-white/60">
        Next step: contact the buyer within one business day to confirm colour,
        wheels and interior choices before production begins.
      </Text>
    </EmailLayout>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
      <span style={{ color: 'rgba(255,255,255,0.6)' }}>{k}</span>
      <span style={{ color: '#fff', fontWeight: 500 }}>{v}</span>
    </div>
  );
}
