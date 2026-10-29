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
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'admin only' }, { status: 403 });

  const stageDir = path.resolve(process.cwd(), 'scripts', '.hero-staging');
  const files = (await fs.readdir(stageDir)).filter((f) => f.endsWith('.jpg'));
  const results: Array<Record<string, unknown>> = [];

  console.log(`[heroes] starting upload of ${files.length} files`);
  for (const file of files) {
    const slug = path.basename(file, '.jpg');
    const buf = await fs.readFile(path.join(stageDir, file));
    const key = `vehicles/${slug}/hero-${Date.now()}.jpg`;

    console.log(`[heroes] ${slug}: uploading (${buf.length} bytes)`);
    const t0 = Date.now();
    try {
      const { error: upErr } = await admin.storage
        .from(BUCKET)
        .upload(key, buf, { contentType: 'image/jpeg', upsert: true });
      if (upErr) {
        console.log(`[heroes] ${slug}: upload-failed`, upErr.message);
        results.push({ slug, status: 'upload-failed', msg: upErr.message });
        continue;
      }
    } catch (e: any) {
      console.log(`[heroes] ${slug}: upload-threw`, e?.message, e?.cause?.message);
      results.push({ slug, status: 'upload-threw', msg: `${e?.message} | ${e?.cause?.message ?? ''}` });
      continue;
    }
    console.log(`[heroes] ${slug}: uploaded in ${Date.now() - t0}ms`);

    const publicUrl = admin.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;

    const { data: vehicle, error: findErr } = await admin
      .from('vehicles').select('id').eq('id', slug).maybeSingle();
    if (findErr || !vehicle) {
      console.log(`[heroes] ${slug}: vehicle-not-found`);
      results.push({ slug, status: 'vehicle-not-found' }); continue;
    }

    const { error: patchErr } = await admin
      .from('vehicles').update({ hero_image_url: publicUrl }).eq('id', vehicle.id);
    if (patchErr) {
      console.log(`[heroes] ${slug}: patch-failed`, patchErr.message);
      results.push({ slug, status: 'patch-failed', msg: patchErr.message }); continue;
    }

    console.log(`[heroes] ${slug}: OK`);
    results.push({ slug, status: 'ok' });
  }
  console.log(`[heroes] done`);

  return NextResponse.json({ uploaded: results.filter((r) => r.status === 'ok').length, total: files.length, results });
}
