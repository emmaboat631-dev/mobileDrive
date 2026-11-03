/**
 * Upload the 3 compressed models (dodge-challenger, toyota-land-cruiser,
 * toyota-supra) to Supabase Storage and patch lib/vehicles/data.ts so each
 * modelPath points to the Supabase public URL. These three failed the
 * first-pass upload because of the free-tier 50 MB per-file ceiling;
 * compressed .glb files from public/models/.compressed/ now fit.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const envText = await fs.readFile(path.resolve('.env.local'), 'utf8');
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET       = 'vehicle-media';
const SRC_DIR      = path.resolve('public', 'models', '.compressed');
const DATA_FILE    = path.resolve('lib', 'vehicles', 'data.ts');

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SLUGS = ['dodge-challenger', 'toyota-land-cruiser', 'toyota-supra'];
const results = [];

for (const slug of SLUGS) {
  let allOk = true;
  for (const variant of ['', '-hq']) {
    const file = path.join(SRC_DIR, `${slug}${variant}.glb`);
    const key = `vehicles/${slug}/model${variant}.glb`;
    try {
      const buf = await fs.readFile(file);
      process.stdout.write(`  ${slug}${variant} (${(buf.length / 1024 / 1024).toFixed(2)}MB) ... `);
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(key, buf, { contentType: 'model/gltf-binary', upsert: true });
      if (error) {
        console.log(`FAIL: ${error.message}`);
        allOk = false;
        break;
      }
      console.log('ok');
    } catch (e) {
      console.log(`skip (${e.message})`);
    }
  }
  if (allOk) {
    const url = supabase.storage.from(BUCKET).getPublicUrl(`vehicles/${slug}/model.glb`).data.publicUrl;
    results.push({ slug, url });
  }
}

// Patch data.ts — replace /models/<slug>.glb with the Supabase URL
let dataSrc = await fs.readFile(DATA_FILE, 'utf8');
let patched = 0;
for (const { slug, url } of results) {
  const needle = `modelPath: '/models/${slug}.glb'`;
  const next = `modelPath: '${url}'`;
  if (dataSrc.includes(needle)) {
    dataSrc = dataSrc.replace(needle, next);
    patched++;
  }
}
await fs.writeFile(DATA_FILE, dataSrc);
console.log(`\nPatched ${patched} modelPath entries for compressed models.`);
