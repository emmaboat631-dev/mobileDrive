import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { fetchDealerById } from '@/lib/admin/dealers';
import { DealerForm } from '../DealerForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const d = await fetchDealerById(params.id);
  return { title: d ? `${d.name} — Showrooms · mobileDrive` : 'Showroom · mobileDrive' };
}

export default async function EditDealerPage({ params }: { params: { id: string } }) {
  const dealer = await fetchDealerById(params.id);
  if (!dealer) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/dealers" className="inline-flex items-center gap-1.5 text-xs text-ink-100 hover:text-white">
        <ArrowLeft className="h-3 w-3" />
        Showrooms
      </Link>

      <header>
        <div className="eyebrow">Edit showroom</div>
        <h1 className="mt-2 font-display text-display-md font-semibold text-white">
          {dealer.name}
        </h1>
        <p className="mt-2 text-sm text-ink-200">
          Changes apply immediately. Deactivating a showroom stops new orders being routed to it.
        </p>
      </header>

      <DealerForm defaults={dealer} editId={dealer.id} />
    </div>
  );
}
