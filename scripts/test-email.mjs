/**
 * Smoke-test the Resend send path directly, without having to run the whole
 * checkout flow. Reads .env.local for the key + from-address and fires a plain
 * email to emmaboat631@gmail.com (the only address an unverified Resend
 * account is allowed to send to).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resend } from 'resend';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const key = process.env.RESEND_API_KEY;
if (!key) { console.error('RESEND_API_KEY missing'); process.exit(1); }

const resend = new Resend(key);
const { data, error } = await resend.emails.send({
  from: process.env.RESEND_FROM ?? 'onboarding@resend.dev',
  to: 'emmaboat631@gmail.com',
  subject: 'mobileDrive email test',
  text: 'If you can read this, the Resend wiring works. — mobileDrive',
});

if (error) {
  console.error('✗ Resend error:', error);
  process.exit(1);
}
console.log('✓ Sent:', data);
