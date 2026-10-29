/**
 * Direct check: what does placeOrder's Paystack call look like, byte-for-byte?
 *
 * Reads your .env.local for PAYSTACK_SECRET_KEY, replicates the exact body
 * our server action sends, prints it, then (if you pass --live) actually
 * hits Paystack and prints their reply so we can see what they're deciding.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\//, '')), '..');
const envPath = path.join(root, '.env.local');

// Parse .env.local manually to avoid depending on dotenv
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const secret = process.env.PAYSTACK_SECRET_KEY;
if (!secret) {
  console.error('No PAYSTACK_SECRET_KEY in .env.local. Add it first.');
  process.exit(1);
}

const isTestMode = secret.startsWith('sk_test_');
console.log('Secret key kind:', isTestMode ? 'TEST ✓' : 'LIVE');

// Simulate a cart that matches what the user has been checking out with
const grandTotalUsd = 193130;
const fxUsd = Number(process.env.PAYSTACK_FX_USD ?? '15');
const grandTotalGhs = Math.round(grandTotalUsd * fxUsd);
const amountGhs = isTestMode ? 100 : grandTotalGhs;

const body = {
  email: 'emmaboat631@gmail.com',
  amount: Math.round(amountGhs * 100), // subunits (pesewas)
  currency: 'GHS',
  reference: `md_test_${Date.now()}`,
  callback_url: 'https://reabsorb-secular-pry.ngrok-free.dev/checkout/confirm?orderId=test',
  metadata: {
    test_mode: isTestMode,
    source_currency: 'USD',
    source_amount: grandTotalUsd,
    source_amount_ghs: grandTotalGhs,
  },
};

console.log('\nBody being sent to Paystack /transaction/initialize:');
console.log(JSON.stringify(body, null, 2));
console.log('\nDecoded:');
console.log(`  amount:   ${body.amount} subunits = GHS ${(body.amount / 100).toFixed(2)}`);
console.log(`  currency: ${body.currency}`);

if (!process.argv.includes('--live')) {
  console.log('\n(Not calling Paystack. Pass --live to actually fire the request.)');
  process.exit(0);
}

console.log('\n→ calling https://api.paystack.co/transaction/initialize ...');
const res = await fetch('https://api.paystack.co/transaction/initialize', {
  method: 'POST',
  headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
const reply = await res.json();
console.log('\n← Paystack HTTP', res.status);
console.log(JSON.stringify(reply, null, 2));
if (reply.data?.authorization_url) {
  console.log('\nOpen this URL in a browser to see what Paystack renders:');
  console.log(reply.data.authorization_url);
}
