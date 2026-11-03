/**
 * Upload every .glb in public/models/ to the Supabase `vehicle-media` bucket
 * and overwrite each vehicle's `modelPath` in lib/vehicles/data.ts to the
 * Supabase public URL.
 *
 * Pairing convention: the viewer's HQ/1k swap replaces `.glb` with `-hq.glb`
 * on the same URL, so both files for a vehicle must sit at the same base path.
 * We upload the base as `vehicles/<slug>/model.glb` and the HQ as
 * `vehicles/<slug>/model-hq.glb`, then set modelPath to the base URL.
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET       = 'vehicle-media';
const MODELS_DIR   = path.resolve('public', 'models');
const DATA_FILE    = path.resolve('lib', 'vehicles', 'data.ts');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Pair up <slug>.glb and <slug>-hq.glb
const files = (await fs.readdir(MODELS_DIR)).filter((f) => f.endsWith('.glb'));
const pairs = new Map(); // slug -> { base?: file, hq?: file }
for (const f of files) {
  const base = f.replace(/\.glb$/, '');
  const hqMatch = base.endsWith('-hq');
  const slug = hqMatch ? base.slice(0, -3) : base;
  const entry = pairs.get(slug) ?? {};
  if (hqMatch) entry.hq = f;
  else entry.base = f;
  pairs.set(slug, entry);
}

console.log(`Found ${pairs.size} vehicle slug(s), ${files.length} total files`);

const results = [];
const urlBySlug = {};

for (const [slug, { base, hq }] of pairs) {
  const uploads = [];
  if (base) uploads.push({ file: base, key: `vehicles/${slug}/model.glb` });
  if (hq)   uploads.push({ file: hq,   key: `vehicles/${slug}/model-hq.glb` });

  let allOk = true;
  for (const { file, key } of uploads) {
    const buf = await fs.readFile(path.join(MODELS_DIR, file));
    const sizeMb = (buf.length / 1024 / 1024).toFixed(1);
    process.stdout.write(`  ${slug} ${file} (${sizeMb}MB) ... `);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(key, buf, { contentType: 'model/gltf-binary', upsert: true });
    if (error) {
      console.log(`FAIL: ${error.message}`);
      allOk = false;
      break;
    }
    console.log('ok');
  }

  if (allOk && base) {
    const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(`vehicles/${slug}/model.glb`).data.publicUrl;
    urlBySlug[slug] = publicUrl;
    results.push({ slug, status: 'ok', url_tail: publicUrl.slice(-70) });
  } else {
    results.push({ slug, status: 'failed' });
  }
}

console.log('\nUpload summary:');
console.table(results);

// Patch lib/vehicles/data.ts — swap /models/<slug>.glb for the Supabase URL
console.log('\nPatching lib/vehicles/data.ts ...');
let dataSrc = await fs.readFile(DATA_FILE, 'utf8');
let patched = 0;
for (const [slug, url] of Object.entries(urlBySlug)) {
  const needle = `modelPath: '/models/${slug}.glb'`;
  const next = `modelPath: '${url}'`;
  if (dataSrc.includes(needle)) {
    dataSrc = dataSrc.replace(needle, next);
    patched++;
  }
}
await fs.writeFile(DATA_FILE, dataSrc);
console.log(`Patched ${patched}/${Object.keys(urlBySlug).length} modelPath entries.`);
console.log(`\nDone. Commit the modified lib/vehicles/data.ts and redeploy.`);
