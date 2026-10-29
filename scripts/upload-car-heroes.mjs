/**
 * Upload every staged JPG in scripts/.hero-staging/<slug>.jpg to the
 * `vehicle-media` Supabase Storage bucket and patch the matching vehicle row's
 * hero_image_url to the public URL.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// Minimal .env.local loader
const envText = await fs.readFile(path.resolve('.env.local'), 'utf8');
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET        = 'vehicle-media';
const STAGE_DIR     = path.resolve('scripts', '.hero-staging');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const files = (await fs.readdir(STAGE_DIR)).filter((f) => f.endsWith('.jpg'));
const results = [];

for (const file of files) {
  const slug = path.basename(file, '.jpg');
  const localPath = path.join(STAGE_DIR, file);
  const buf = await fs.readFile(localPath);
  const key = `vehicles/${slug}/hero-${Date.now()}.jpg`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(key, buf, { contentType: 'image/jpeg', upsert: true });
  if (upErr) {
    results.push({ slug, status: 'upload-failed', msg: `${upErr.message} | ${upErr.cause?.message ?? ''} | ${upErr.cause?.cause?.code ?? ''}` });
    continue;
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(key);
  const publicUrl = pub.publicUrl;

  const { data: vehicle, error: findErr } = await supabase
    .from('vehicles')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (findErr || !vehicle) {
    results.push({ slug, status: 'vehicle-not-found', msg: findErr?.message ?? 'no row' });
    continue;
  }

  const { error: patchErr } = await supabase
    .from('vehicles')
    .update({ hero_image_url: publicUrl })
    .eq('id', vehicle.id);
  if (patchErr) {
    results.push({ slug, status: 'patch-failed', msg: patchErr.message });
    continue;
  }

  results.push({ slug, status: 'ok', url: publicUrl.slice(-60) });
}

console.table(results);
console.log(`\nUploaded ${results.filter((r) => r.status === 'ok').length}/${files.length}`);
