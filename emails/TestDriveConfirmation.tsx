import { Button, Heading, Hr, Section, Text } from '@react-email/components';
import { EmailLayout } from './_Layout';

export interface TestDriveConfirmationProps {
  siteUrl: string;
  recipient: 'buyer' | 'dealer';
  firstName: string;
  bookingId: string;
  vehicleBrand: string;
  vehicleModel: string;
  scheduledAtFormatted: string;   // "Fri, 25 Oct · 2:00 PM"
  dealerName: string;
  dealerPhone: string | null;
  buyerName?: string;             // only used in dealer-recipient variant
  buyerPhone?: string | null;
  notes?: string | null;
}

/**
 * One template, two recipients. The buyer gets a "you booked a test drive"
 * email; the dealer gets a "new test drive booked at your showroom" email.
 * Keeping it in one file so the copy stays consistent.
 */
export function TestDriveConfirmationEmail(props: TestDriveConfirmationProps) {
  return props.recipient === 'buyer' ? <BuyerVariant {...props} /> : <DealerVariant {...props} />;
}

function BuyerVariant({
  siteUrl, firstName, bookingId, vehicleBrand, vehicleModel,
  scheduledAtFormatted, dealerName, dealerPhone, notes,
}: TestDriveConfirmationProps) {
  return (
    <EmailLayout
      preview={`Test drive confirmed · ${vehicleBrand} ${vehicleModel} · ${scheduledAtFormatted}`}
      siteUrl={siteUrl}
    >
      <Heading as="h1" className="m-0 font-sans text-2xl font-semibold text-white">
        See you soon, {firstName}.
      </Heading>
      <Text className="mt-3 text-sm text-white/80">
        Your test drive of the <strong className="text-white">{vehicleBrand} {vehicleModel}</strong>{' '}
        at <strong className="text-white">{dealerName}</strong> is confirmed.
      </Text>

      <Section className="mt-6 rounded-xl border border-white/10 bg-[#121418] p-5 text-sm">
        <Row k="When" v={scheduledAtFormatted} />
        <Row k="Vehicle" v={`${vehicleBrand} ${vehicleModel}`} />
        <Row k="Where" v={dealerName} />
        {dealerPhone && <Row k="Dealer phone" v={dealerPhone} />}
        {notes && <Row k="Your notes" v={notes} />}
      </Section>

      <Section className="mt-6">
        <Button
          href={`${siteUrl}/account/test-drives`}
          className="rounded-full bg-white px-6 py-3 text-sm font-medium text-[#07080A]"
        >
          Manage test drive →
        </Button>
      </Section>

      <Hr className="my-6 border-white/10" />

      <Text className="text-xs text-white/60">
        Bring a valid driver&apos;s license. You can reschedule or cancel from your
        account up to 2 hours before. Booking ref: {bookingId.slice(0, 8).toUpperCase()}.
      </Text>
    </EmailLayout>
  );
}

function DealerVariant({
  siteUrl, bookingId, vehicleBrand, vehicleModel, scheduledAtFormatted,
  dealerName, buyerName, buyerPhone, notes,
}: TestDriveConfirmationProps) {
  return (
    <EmailLayout
      preview={`New test drive at ${dealerName} · ${scheduledAtFormatted}`}
      siteUrl={siteUrl}
    >
      <Heading as="h1" className="m-0 font-sans text-2xl font-semibold text-white">
        New test drive at {dealerName}.
      </Heading>
      <Text className="mt-3 text-sm text-white/80">
        <strong className="text-white">{buyerName ?? 'A buyer'}</strong> booked a test drive of
        the <strong className="text-white">{vehicleBrand} {vehicleModel}</strong>.
      </Text>

      <Section className="mt-6 rounded-xl border border-white/10 bg-[#121418] p-5 text-sm">
        <Row k="When" v={scheduledAtFormatted} />
        <Row k="Vehicle" v={`${vehicleBrand} ${vehicleModel}`} />
        <Row k="Buyer" v={buyerName ?? '—'} />
        {buyerPhone && <Row k="Buyer phone" v={buyerPhone} />}
        {notes && <Row k="Notes" v={notes} />}
      </Section>

      <Section className="mt-6">
        <Button
          href={`${siteUrl}/dealer/bookings`}
          className="rounded-full bg-white px-6 py-3 text-sm font-medium text-[#07080A]"
        >
          Open in dealer dashboard →
        </Button>
      </Section>

      <Hr className="my-6 border-white/10" />

      <Text className="text-xs text-white/60">
        Confirm or decline from your dashboard. The buyer gets an email either way.
        Booking ref: {bookingId.slice(0, 8).toUpperCase()}.
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
