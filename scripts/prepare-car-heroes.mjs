/**
 * Scan C:\Users\NIMAKO\Desktop\mobileDrive Cars\<folder> → convert the pinned
 * hero image to vignetted JPG, write to scripts/.hero-staging/<slug>.jpg so we
 * can preview before uploading.
 *
 * Each vehicle has an explicit `pick` filename so the hero NEVER shuffles when
 * more images are added to a folder.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC_ROOT = String.raw`C:\Users\NIMAKO\Desktop\mobileDrive Cars`;
const OUT_DIR  = path.resolve('scripts', '.hero-staging');

const MAP = {
  'm4-competition':         { folder: 'bmw m4', sub: 'pics', pick: 'm4-road.jpg' },
  'porsche-911':            { folder: 'porsche 911',       pick: '911-custom.avif' },
  'tesla-model-s':          { folder: 'tesla Model S',     pick: '2025_tesla_model-s_sedan_plaid_fq_oem_1_1280x855.avif' },
  'amg-gt':                 { folder: 'Mercedes-Benz AMG GT', pick: '2026_mercedes-benz_amg-gt_coupe_63-s-e-performance_fq_oem_1_1280x855.avif' },
  'audi-rs6':               { folder: 'Audi rs6',          pick: '2025_audi_rs-6_wagon_performance_s_oem_1_1280x855.avif' },
  'range-rover-sport':      { folder: 'range rover sport', pick: '2026_land-rover_range-rover-sport_4dr-suv_p635-sv-black_fq_oem_3_1280x855.avif' },
  'porsche-taycan':         { folder: 'Taycan Turbo S',    pick: '2026_porsche_taycan_sedan_4_fq_oem_1_1280x855.avif' },
  'bmw-i7':                 { folder: 'BMW i7',            pick: '2026_bmw_i7_sedan_m70_fq_oem_1_1280x855.avif' },
  'mercedes-s580':          { folder: 'benz 580',          pick: '2025_mercedes-benz_s-class_sedan_amg-s-63-e-performance_fq_oem_13_1280x855.avif' },
  'bmw-x5m':                { folder: 'X5 M Competition',  pick: '2026_bmw_x5-m_4dr-suv_competition_rq_oem_10_1280x855.avif' },
  'audi-q8':                { folder: 'audi Q8 e-tron',    pick: '2024_audi_q8-e-tron_4dr-suv_prestige_s_oem_1_1280x855.jpg' },
  'tesla-model-y':          { folder: 'Model Y Performa',  pick: '2026_tesla_model-y_4dr-suv_long-range-launch-series_fq_oem_5_1280x855.avif' },
  'ford-raptor':            { folder: 'F-150 Raptor R',    pick: '2023_ford_f-150_crew-cab-pickup_raptor-r_fq_oem_1_1280x855.avif' },
  'ram-trx':                { folder: 'ram 1500 TRX',      pick: '2023_ram_1500_crew-cab-pickup_rebel_fq_oem_5_1280x855.jpg' },
  'bmw-m3-touring':         { folder: 'm3 touring',        pick: 'P90584936_highRes_the-first-ever-bmw-m.jpg' },
  'mercedes-e63-wagon':     { folder: 'E 63 S Estate',     pick: '2021_mercedes-benz_e-class_wagon_amg-e-63-s_fq_oem_1_1280x855.jpg' },
  'porsche-cayman-gt4':     { folder: '718 Cayman GT4',    pick: 'cayman-custom.jpg' },
  'lotus-emira':            { folder: 'Emira V6',          pick: 'emira-custom.jpg' },
  'genesis-g90':            { folder: 'genesis g90',       pick: '2026_genesis_g90_sedan_35t-e-supercharger_fq_oem_3_1280x855.jpg' },
  'ford-mustang':           { folder: 'Mustang GT',        pick: '2025_ford_mustang_coupe_dark-horse_fq_oem_1_1280x855.avif' },
  'dodge-challenger':       { folder: 'hellcat Dodge',     pick: '2023_dodge_challenger_coupe_srt-hellcat-redeye-widebody-jailbreak_fq_oem_1_1280x855.avif' },
  'toyota-supra':           { folder: 'Supra',             pick: '2026_toyota_gr-supra_coupe_mkv-final-edition_rq_oem_1_1280x855.jpg' },
  'toyota-land-cruiser':    { folder: 'land cruiser',      pick: '2025_toyota_land-cruiser_4dr-suv_base_fq_oem_6_1280x855.jpg' },
  'chevrolet-corvette':     { folder: 'covertte',          pick: '2024_chevrolet_corvette_coupe_stingray_fq_oem_10_1280x855.avif' },
  'lamborghini-aventador':  { folder: 'Lambo Aventador',   pick: 'lamborghini-aventador-svj-roadster-bronzo-zenas-2021-3840x2160-5618.jpg' },
};

await fs.mkdir(OUT_DIR, { recursive: true });

const summary = [];
for (const [slug, cfg] of Object.entries(MAP)) {
  const dir = path.join(SRC_ROOT, cfg.folder, cfg.sub ?? '');
  const srcPath = path.join(dir, cfg.pick);

  try {
    await fs.stat(srcPath);
  } catch {
    summary.push({ slug, picked: null, note: `(pinned file missing: ${cfg.pick})` });
    continue;
  }

  const outPath = path.join(OUT_DIR, `${slug}.jpg`);

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

  const stat = await fs.stat(outPath);
  summary.push({ slug, picked: cfg.pick, outSize: `${(stat.size / 1024).toFixed(0)} KB` });
}

console.table(summary);
console.log(`\nStaged ${summary.filter((s) => s.picked).length} heroes in ${OUT_DIR}`);
