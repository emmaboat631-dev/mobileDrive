'use server';

import { revalidatePath } from 'next/cache';
import { getServerSupabase } from '@/lib/supabase/server';
import { getAdminSupabase } from '@/lib/supabase/admin';
import { SUPABASE_URL } from '@/lib/supabase/env';

const BUCKET = 'vehicle-media';
const MAX_BYTES = 15 * 1024 * 1024;
const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MODEL_MIME = new Set(['model/gltf-binary', 'model/gltf+json', 'application/octet-stream']);

export type MediaResult = { ok: true; url: string } | { ok: false; message: string };

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
  return { ok: true as const };
}

/**
 * Upload a single file to the vehicle-media bucket at `vehicles/<vehicleId>/<kind>-<timestamp>.<ext>`
 * and return the public URL. Admin only. The service-role client is used for
 * the storage write so we don't need to attach a user session cookie to the
 * upload call.
 */
export async function uploadVehicleMedia(
  vehicleId: string,
  kind: 'hero' | 'gallery' | 'model',
  formData: FormData,
): Promise<MediaResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const file = formData.get('file');
  if (!(file instanceof File)) return { ok: false, message: 'No file provided.' };
  if (file.size === 0) return { ok: false, message: 'File is empty.' };
  if (file.size > MAX_BYTES) return { ok: false, message: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB; max 15 MB).` };

  const isModel = kind === 'model';
  const allowed = isModel ? MODEL_MIME : IMAGE_MIME;
  if (!allowed.has(file.type) && !(isModel && file.name.endsWith('.glb'))) {
    return { ok: false, message: `Unsupported file type: ${file.type || 'unknown'}.` };
  }

  const admin = getAdminSupabase();
  if (!admin) return { ok: false, message: 'SUPABASE_SERVICE_ROLE_KEY not set.' };

  const extGuess = (file.name.split('.').pop() ?? (isModel ? 'glb' : 'jpg')).toLowerCase();
  const path = `vehicles/${vehicleId}/${kind}-${Date.now()}.${extGuess}`;

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type || (isModel ? 'model/gltf-binary' : 'image/jpeg'),
    upsert: false,
  });
  if (error) return { ok: false, message: error.message };

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

  // Patch the vehicle row with the new URL.
  const db = admin as unknown as {
    from: (t: string) => {
      update: (p: Record<string, unknown>) => {
        eq: (k: string, v: string) => Promise<{ error: { message: string } | null }>;
      };
      select: (c: string) => {
        eq: (k: string, v: string) => {
          maybeSingle: () => Promise<{ data: { gallery_image_urls: string[] | null } | null }>;
        };
      };
    };
  };

  if (kind === 'hero') {
    const { error: upErr } = await db.from('vehicles').update({ hero_image_url: publicUrl }).eq('id', vehicleId);
    if (upErr) return { ok: false, message: upErr.message };
  } else if (kind === 'model') {
    const { error: upErr } = await db.from('vehicles').update({ model_path: publicUrl }).eq('id', vehicleId);
    if (upErr) return { ok: false, message: upErr.message };
  } else {
    // gallery: append to array
    const { data: current } = await db.from('vehicles').select('gallery_image_urls').eq('id', vehicleId).maybeSingle();
    const next = [...(current?.gallery_image_urls ?? []), publicUrl];
    const { error: upErr } = await db.from('vehicles').update({ gallery_image_urls: next }).eq('id', vehicleId);
    if (upErr) return { ok: false, message: upErr.message };
  }

  revalidatePath('/admin/vehicles');
  revalidatePath(`/admin/vehicles/${vehicleId}`);
  revalidatePath('/vehicles');
  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath(`/configure/${vehicleId}`);

  return { ok: true, url: publicUrl };
}

/**
 * Remove a single media file. Pass the full public URL; we derive the path
 * inside the bucket from it. Also clears the matching column on the vehicle.
 */
export async function deleteVehicleMedia(vehicleId: string, publicUrl: string): Promise<MediaResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const admin = getAdminSupabase();
  if (!admin) return { ok: false, message: 'SUPABASE_SERVICE_ROLE_KEY not set.' };

  const prefix = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
  if (!publicUrl.startsWith(prefix)) return { ok: false, message: 'URL not in vehicle-media bucket.' };
  const path = publicUrl.slice(prefix.length);

  const { error } = await admin.storage.from(BUCKET).remove([path]);
  if (error) return { ok: false, message: error.message };

  const db = admin as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (k: string, v: string) => {
          maybeSingle: () => Promise<{ data: { hero_image_url: string | null; gallery_image_urls: string[] | null; model_path: string | null } | null }>;
        };
      };
      update: (p: Record<string, unknown>) => {
        eq: (k: string, v: string) => Promise<{ error: { message: string } | null }>;
      };
    };
  };
  const { data: row } = await db.from('vehicles').select('hero_image_url, gallery_image_urls, model_path').eq('id', vehicleId).maybeSingle();
  if (row) {
    const patch: Record<string, unknown> = {};
    if (row.hero_image_url === publicUrl) patch.hero_image_url = null;
    if (row.model_path === publicUrl) patch.model_path = null;
    if (row.gallery_image_urls?.includes(publicUrl)) {
      patch.gallery_image_urls = row.gallery_image_urls.filter((u) => u !== publicUrl);
    }
    if (Object.keys(patch).length > 0) {
      await db.from('vehicles').update(patch).eq('id', vehicleId);
    }
  }

  revalidatePath('/admin/vehicles');
  revalidatePath(`/admin/vehicles/${vehicleId}`);
  revalidatePath(`/vehicles/${vehicleId}`);
  return { ok: true, url: publicUrl };
}
