import 'server-only';
import type { Vehicle } from '@/types/vehicle';
import { VEHICLES } from './data';
import { getServerSupabase } from '@/lib/supabase/server';

/** Overlay DB hero_image_url onto the static vehicle array. Server-only. */
export async function listVehiclesWithHeroes(): Promise<Vehicle[]> {
  try {
    const supabase = getServerSupabase();
    if (!supabase) return VEHICLES;
    const { data } = await supabase.from('vehicles').select('id, hero_image_url, gallery_image_urls');
    const heroMap: Record<string, string> = {};
    const galleryMap: Record<string, string[]> = {};
    for (const row of (data ?? []) as Array<{ id: string; hero_image_url: string | null; gallery_image_urls: string[] | null }>) {
      if (row.hero_image_url) heroMap[row.id] = row.hero_image_url;
      if (Array.isArray(row.gallery_image_urls) && row.gallery_image_urls.length > 0) {
        galleryMap[row.id] = row.gallery_image_urls;
      }
    }
    return VEHICLES.map((v) => {
      const next = { ...v };
      if (heroMap[v.id]) next.heroImageUrl = heroMap[v.id];
      if (galleryMap[v.id]) next.images = galleryMap[v.id];
      return next;
    });
  } catch {
    return VEHICLES;
  }
}
