import { getServerSupabase } from '@/lib/supabase/server';

export interface DealerRow {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  region: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  active: boolean;
  created_at: string;
}

export async function fetchDealers(): Promise<DealerRow[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  const db = supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        order: (c: string, o: { ascending: boolean }) => Promise<{ data: DealerRow[] | null }>;
      };
    };
  };
  const { data } = await db
    .from('dealers')
    .select('id, name, slug, city, region, phone, email, address, active, created_at')
    .order('name', { ascending: true });
  return data ?? [];
}

export async function fetchDealerById(id: string): Promise<DealerRow | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const db = supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (k: string, v: string) => {
          maybeSingle: () => Promise<{ data: DealerRow | null }>;
        };
      };
    };
  };
  const { data } = await db
    .from('dealers')
    .select('id, name, slug, city, region, phone, email, address, active, created_at')
    .eq('id', id)
    .maybeSingle();
  return data;
}
