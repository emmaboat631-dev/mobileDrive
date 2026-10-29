'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getServerSupabase } from '@/lib/supabase/server';
import { firstZodMessage } from '@/lib/validation/schemas';

export type DealerResult = { ok: true; id: string } | { ok: false; message: string };

const dealerSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.').max(120),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/, 'Slug: lowercase letters, numbers, hyphens.'),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  region: z.string().trim().max(100).optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  email: z.string().trim().email('Enter a valid email.').optional().or(z.literal('')),
  address: z.string().trim().max(500).optional().or(z.literal('')),
  active: z.coerce.boolean().optional(),
});

async function requireAdmin() {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false as const, message: 'Backend not configured.' };
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false as const, message: 'Not signed in.' };
  const db = supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (k: string, v: string) => {
          maybeSingle: () => Promise<{ data: { role: string } | null }>;
        };
      };
    };
  };
  const { data: profile } = await db.from('profiles').select('role').eq('id', userData.user.id).maybeSingle();
  if (profile?.role !== 'admin') return { ok: false as const, message: 'Admin only.' };
  return { ok: true as const, supabase };
}

function readDealer(formData: FormData) {
  const parsed = dealerSchema.safeParse({
    name: formData.get('name'),
    slug: String(formData.get('slug') ?? '').trim().toLowerCase(),
    city: formData.get('city'),
    region: formData.get('region'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    address: formData.get('address'),
    active: formData.get('active') === 'on',
  });
  if (!parsed.success) return { ok: false as const, message: firstZodMessage(parsed.error) };
  const d = parsed.data;
  return {
    ok: true as const,
    payload: {
      name: d.name,
      slug: d.slug,
      city: d.city || null,
      region: d.region || null,
      phone: d.phone || null,
      email: d.email || null,
      address: d.address || null,
      active: d.active ?? true,
    },
  };
}

export async function createDealer(formData: FormData): Promise<DealerResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const parsed = readDealer(formData);
  if (!parsed.ok) return parsed;

  const db = auth.supabase as unknown as {
    from: (t: string) => {
      insert: (p: Record<string, unknown>) => {
        select: (c: string) => {
          single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
        };
      };
    };
  };
  const { data, error } = await db.from('dealers').insert(parsed.payload).select('id').single();
  if (error || !data) return { ok: false, message: error?.message ?? 'Create failed.' };

  revalidatePath('/admin/dealers');
  redirect(`/admin/dealers/${data.id}`);
}

export async function updateDealer(id: string, formData: FormData): Promise<DealerResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const parsed = readDealer(formData);
  if (!parsed.ok) return parsed;

  const db = auth.supabase as unknown as {
    from: (t: string) => {
      update: (p: Record<string, unknown>) => {
        eq: (k: string, v: string) => Promise<{ error: { message: string } | null }>;
      };
    };
  };
  const { error } = await db.from('dealers').update(parsed.payload).eq('id', id);
  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin/dealers');
  revalidatePath(`/admin/dealers/${id}`);
  return { ok: true, id };
}
