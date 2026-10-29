import { InShellNotFound } from '@/components/ui/InShellNotFound';

export const metadata = { title: 'Not found — Dealer · mobileDrive' };

export default function DealerNotFound() {
  return (
    <InShellNotFound
      backLabel="Dealer overview"
      backHref="/dealer"
      description="This id doesn't match any vehicle, customer or booking at this showroom. Double-check the URL or head back to the list."
    />
  );
}
