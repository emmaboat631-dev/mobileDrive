import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getAdminSupabase } from '@/lib/supabase/admin';
import { getServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const BUCKET = 'vehicle-media';

export async function POST() {
  const server = getServerSupabase();
  if (!server) return NextResponse.json({ error: 'supabase not configured' }, { status: 500 });
  const { data: userData } = await server.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const admin = getAdminSupabase();
  if (!admin) return NextResponse.json({ error: 'no service role' }, { status: 500 });

  const { data: profile } = await admin
    .from('profiles').select('role').eq('id', userData.user.id).maybeSingle();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'admin only' }, { status: 403 });

  const stageRoot = path.resolve(process.cwd(), 'scripts', '.gallery-staging');
  const slugs = await fs.readdir(stageRoot);
  const results: Array<Record<string, unknown>> = [];
  console.log(`[gallery] starting upload for ${slugs.length} vehicles`);

  for (const slug of slugs) {
    const subdir = path.join(stageRoot, slug);
    const stat = await fs.stat(subdir).catch(() => null);
    if (!stat?.isDirectory()) continue;

    const files = (await fs.readdir(subdir)).filter((f) => f.endsWith('.jpg')).sort();
    const urls: string[] = [];
    for (const file of files) {
      const buf = await fs.readFile(path.join(subdir, file));
      const key = `vehicles/${slug}/gallery/${Date.now()}-${file}`;
      const { error: upErr } = await admin.storage
        .from(BUCKET)
        .upload(key, buf, { contentType: 'image/jpeg', upsert: true });
      if (upErr) {
        console.log(`[gallery] ${slug}/${file}: upload-failed`, upErr.message);
        continue;
      }
      urls.push(admin.storage.from(BUCKET).getPublicUrl(key).data.publicUrl);
    }

    if (urls.length === 0) {
      results.push({ slug, status: 'no-urls' });
      continue;
    }

    const { data: vehicle } = await admin
      .from('vehicles').select('id').eq('id', slug).maybeSingle();
    if (!vehicle) {
      results.push({ slug, status: 'vehicle-not-found' });
      continue;
    }

    const { error: patchErr } = await admin
      .from('vehicles').update({ gallery_image_urls: urls }).eq('id', slug);
    if (patchErr) {
      results.push({ slug, status: 'patch-failed', msg: patchErr.message });
      continue;
    }
    console.log(`[gallery] ${slug}: OK (${urls.length} images)`);
    results.push({ slug, status: 'ok', count: urls.length });
  }
  console.log('[gallery] done');

  return NextResponse.json({
    uploaded: results.filter((r) => r.status === 'ok').length,
    total: slugs.length,
    results,
  });
}
