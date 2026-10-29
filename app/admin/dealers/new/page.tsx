import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { DealerForm } from '../DealerForm';

export const metadata = { title: 'New showroom — Admin · mobileDrive' };

export default function NewDealerPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/dealers" className="inline-flex items-center gap-1.5 text-xs text-ink-100 hover:text-white">
        <ArrowLeft className="h-3 w-3" />
        Showrooms
      </Link>

      <header>
        <div className="eyebrow">New showroom</div>
        <h1 className="mt-2 font-display text-display-md font-semibold text-white">
          Create a dealer
        </h1>
        <p className="mt-2 text-sm text-ink-200">
          A dealer is one physical showroom. Each gets its own staff, inventory, orders and bookings.
        </p>
      </header>

      <DealerForm />
    </div>
  );
}
