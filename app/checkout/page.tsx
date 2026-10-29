import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/currentUser';
import { getServerSupabase } from '@/lib/supabase/server';
import { CheckoutClient, type CheckoutDefaults } from './CheckoutClient';

export const metadata: Metadata = { title: 'Checkout — mobileDrive' };
export const dynamic = 'force-dynamic';

async function fetchDefaults(userId: string, fallbackName: string): Promise<CheckoutDefaults> {
  const supabase = getServerSupabase();
  if (!supabase) {
    return { fullName: fallbackName, phone: '', street: '', city: '', region: '', postalCode: '' };
  }
  const db = supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (k: string, v: string) => {
          maybeSingle: () => Promise<{
            data: {
              full_name: string | null;
              phone: string | null;
              default_delivery_address: {
                street?: string;
                city?: string;
                region?: string;
                postalCode?: string;
              } | null;
            } | null;
          }>;
        };
      };
    };
  };
  const { data } = await db
    .from('profiles')
    .select('full_name, phone, default_delivery_address')
    .eq('id', userId)
    .maybeSingle();

  const addr = data?.default_delivery_address ?? {};
  return {
    fullName: data?.full_name ?? fallbackName,
    phone: data?.phone ?? '',
    street: addr.street ?? '',
    city: addr.city ?? '',
    region: addr.region ?? '',
    postalCode: addr.postalCode ?? '',
  };
}

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const defaults = user
    ? await fetchDefaults(user.id, user.fullName ?? '')
    : { fullName: '', phone: '', street: '', city: '', region: '', postalCode: '' };

  return <CheckoutClient defaults={defaults} />;
}
