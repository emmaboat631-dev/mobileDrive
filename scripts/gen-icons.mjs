/**
 * Compose square PNG icons from the wide brand mark at public/logo-light.png.
 *
 * The source is a ~620×275 PNG (horizontal MD lockup on black). iOS Safari's
 * add-to-home-screen only accepts PNG, not SVG, and insists on square dims,
 * so we pre-render each PWA size with the glyph centered on black and
 * letterboxed vertically. Run from the project root:
 *
 *   npx tsx scripts/gen-icons.mjs
 *
 * Outputs to public/{apple-touch-icon.png, icon-192.png, icon-512.png}.
 * The 512 variant leaves a 10% safe-zone border so it also works as a
 * maskable icon on Android.
 */
import { Jimp } from 'jimp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcPath = path.join(root, 'public', 'logo-light.png');

const sizes = [
  { out: 'apple-touch-icon.png', size: 180, safePct: 0 },
  { out: 'icon-192.png',         size: 192, safePct: 0 },
  { out: 'icon-512.png',         size: 512, safePct: 0.1 }, // maskable safe zone
];

const BLACK = 0x000000ff; // Jimp int (RGBA)

const src = await Jimp.read(srcPath);
console.log('source:', src.bitmap.width, 'x', src.bitmap.height);

for (const { out, size, safePct } of sizes) {
  const canvas = new Jimp({ width: size, height: size, color: BLACK });
  const inner = Math.round(size * (1 - 2 * safePct));
  // Scale source to fit inside `inner` square preserving aspect ratio.
  const scaled = src.clone().scaleToFit({ w: inner, h: inner });
  const x = Math.round((size - scaled.bitmap.width) / 2);
  const y = Math.round((size - scaled.bitmap.height) / 2);
  canvas.composite(scaled, x, y);
  const outPath = path.join(root, 'public', out);
  await canvas.write(outPath);
  console.log('wrote', out, '(' + scaled.bitmap.width + 'x' + scaled.bitmap.height + ' glyph on ' + size + 'x' + size + ' canvas)');
}
