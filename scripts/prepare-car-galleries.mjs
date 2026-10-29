/**
 * Pick up to 4 extra gallery images per vehicle from
 * C:\Users\NIMAKO\Desktop\mobileDrive Cars\<folder>, convert to JPG with the
 * same vignette as the heroes, write to scripts/.gallery-staging/<slug>/N.jpg
 * so we can preview before uploading.
 *
 * We try to pick a VARIETY of angles — not duplicate near-identical shots.
 * Priority order (first match of each category wins):
 *   1. s_oem        — side profile
 *   2. fq_oem       — front quarter
 *   3. rq_oem       — rear quarter
 *   4. int_oem      — interior
 *   5. tds_izmo     — turntable
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC_ROOT = String.raw`C:\Users\NIMAKO\Desktop\mobileDrive Cars`;
const OUT_DIR  = path.resolve('scripts', '.gallery-staging');
const MAX_PER_CAR = 4;

const MAP = {
  'm4-competition':         { folder: 'bmw m4', sub: 'pics' },
  'porsche-911':            { folder: 'porsche 911' },
  'tesla-model-s':          { folder: 'tesla Model S' },
  'amg-gt':                 { folder: 'Mercedes-Benz AMG GT' },
  'audi-rs6':               { folder: 'Audi rs6' },
  'range-rover-sport':      { folder: 'range rover sport' },
  'porsche-taycan':         { folder: 'Taycan Turbo S' },
  'bmw-i7':                 { folder: 'BMW i7' },
  'mercedes-s580':          { folder: 'benz 580' },
  'bmw-x5m':                { folder: 'X5 M Competition' },
  'audi-q8':                { folder: 'audi Q8 e-tron' },
  'tesla-model-y':          { folder: 'Model Y Performa' },
  'ford-raptor':            { folder: 'F-150 Raptor R', require: 'raptor' },
  'ram-trx':                { folder: 'ram 1500 TRX' },
  'bmw-m3-touring':         { folder: 'm3 touring' },
  'mercedes-e63-wagon':     { folder: 'E 63 S Estate', require: 'wagon' },
  'porsche-cayman-gt4':     { folder: '718 Cayman GT4' },
  'lotus-emira':            { folder: 'Emira V6' },
  'genesis-g90':            { folder: 'genesis g90' },
  'ford-mustang':           { folder: 'Mustang GT' },
  'dodge-challenger':       { folder: 'hellcat Dodge', require: 'hellcat' },
  'toyota-supra':           { folder: 'Supra' },
  'toyota-land-cruiser':    { folder: 'land cruiser' },
  'chevrolet-corvette':     { folder: 'covertte', require: 'coupe' },
  'lamborghini-aventador':  { folder: 'Lambo Aventador' },
};

// We pick ONE image for each angle category, in this preferred order
const CATEGORIES = ['s_oem', 'fq_oem', 'rq_oem', 'int_oem', 'tds_izmo'];

async function pickDiverseImages(dir, require) {
  const all = await fs.readdir(dir);
  let images = all.filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f));
  if (require) images = images.filter((f) => f.toLowerCase().includes(require));
  const picks = [];
  for (const cat of CATEGORIES) {
    const found = images.find((f) => f.toLowerCase().includes(cat));
    if (found && !picks.includes(found)) picks.push(found);
    if (picks.length >= MAX_PER_CAR) break;
  }
  // If still under MAX, fill with anything we haven't picked
  for (const f of images) {
    if (picks.length >= MAX_PER_CAR) break;
    if (!picks.includes(f)) picks.push(f);
  }
  return picks;
}

await fs.rm(OUT_DIR, { recursive: true, force: true });
await fs.mkdir(OUT_DIR, { recursive: true });

const summary = [];
for (const [slug, cfg] of Object.entries(MAP)) {
  const dir = path.join(SRC_ROOT, cfg.folder, cfg.sub ?? '');
  let picks;
  try {
    picks = await pickDiverseImages(dir, cfg.require);
  } catch (err) {
    summary.push({ slug, count: 0, note: `(folder missing)` });
    continue;
  }
  if (picks.length === 0) {
    summary.push({ slug, count: 0, note: '(no images)' });
    continue;
  }
  const outSubdir = path.join(OUT_DIR, slug);
  await fs.mkdir(outSubdir, { recursive: true });

  for (let i = 0; i < picks.length; i++) {
    const srcPath = path.join(dir, picks[i]);
    const outPath = path.join(outSubdir, `${String(i + 1).padStart(2, '0')}.jpg`);

    const resized = await sharp(srcPath)
      .resize({ width: 1600, withoutEnlargement: true })
      .toBuffer({ resolveWithObject: true });
    const W = resized.info.width;
    const H = resized.info.height;

    const vignetteSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
          <stop offset="0%" stop-color="#000" stop-opacity="0"/>
          <stop offset="30%" stop-color="#000" stop-opacity="0.2"/>
          <stop offset="60%" stop-color="#000" stop-opacity="0.65"/>
          <stop offset="80%" stop-color="#000" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#000" stop-opacity="1"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>`;

    await sharp(resized.data)
      .composite([{ input: Buffer.from(vignetteSvg), blend: 'over' }])
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(outPath);
  }

  summary.push({ slug, count: picks.length });
}

console.table(summary);
console.log(`\nStaged ${summary.reduce((n, r) => n + r.count, 0)} gallery images across ${summary.filter((r) => r.count > 0).length} vehicles in ${OUT_DIR}`);
