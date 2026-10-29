import 'server-only';
import { headers } from 'next/headers';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Rate limiting for sensitive auth endpoints.
 *
 * Uses Upstash Redis with a sliding window. In dev (or any env without the
 * UPSTASH_* vars set) it falls back to an in-memory limiter so local flows
 * still work and tests don't need Redis — the fallback resets on reload
 * and is not safe for production.
 */

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasUpstash = Boolean(url && token);

const redis = hasUpstash ? new Redis({ url: url!, token: token! }) : null;

type LimiterConfig = { tokens: number; window: `${number} ${'s' | 'm' | 'h'}` };

const BUCKETS: Record<string, LimiterConfig> = {
  signin:   { tokens: 5,  window: '15 m' },
  signup:   { tokens: 3,  window: '1 h' },
  reset:    { tokens: 3,  window: '1 h' },
};

const upstashLimiters = hasUpstash
  ? Object.fromEntries(
      Object.entries(BUCKETS).map(([k, cfg]) => [
        k,
        new Ratelimit({
          redis: redis!,
          limiter: Ratelimit.slidingWindow(cfg.tokens, cfg.window),
          prefix: `md:rl:${k}`,
          analytics: false,
        }),
      ]),
    )
  : null;

// --- In-memory fallback (dev only) ---
type MemBucket = { count: number; resetAt: number };
const memory = new Map<string, MemBucket>();

function parseWindowMs(w: LimiterConfig['window']): number {
  const [n, unit] = w.split(' ') as [string, 's' | 'm' | 'h'];
  const ms = Number(n) * (unit === 's' ? 1000 : unit === 'm' ? 60_000 : 3_600_000);
  return ms;
}

function memCheck(bucket: keyof typeof BUCKETS, key: string): { success: boolean; reset: number } {
  const cfg = BUCKETS[bucket];
  const windowMs = parseWindowMs(cfg.window);
  const now = Date.now();
  const mapKey = `${bucket}:${key}`;
  const current = memory.get(mapKey);
  if (!current || current.resetAt <= now) {
    memory.set(mapKey, { count: 1, resetAt: now + windowMs });
    return { success: true, reset: now + windowMs };
  }
  if (current.count >= cfg.tokens) {
    return { success: false, reset: current.resetAt };
  }
  current.count += 1;
  return { success: true, reset: current.resetAt };
}

/** Returns the caller's best-guess IP from standard proxy headers. */
function callerIp(h: Headers): string {
  const fwd = h.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return h.get('x-real-ip') ?? 'local';
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

/**
 * Check (and consume) one token in the named bucket, keyed by the caller IP
 * plus an optional discriminator (e.g. the email on sign-in, so an attacker
 * iterating emails doesn't also exhaust the shared bucket).
 */
export async function rateLimit(
  bucket: keyof typeof BUCKETS,
  discriminator?: string,
): Promise<RateLimitResult> {
  const h = await headers();
  const key = `${callerIp(h)}:${(discriminator ?? '').toLowerCase()}`;

  const now = Date.now();
  const limiter = upstashLimiters?.[bucket];

  if (limiter) {
    const res = await limiter.limit(key);
    if (res.success) return { ok: true };
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((res.reset - now) / 1000)) };
  }

  const res = memCheck(bucket, key);
  if (res.success) return { ok: true };
  return { ok: false, retryAfterSec: Math.max(1, Math.ceil((res.reset - now) / 1000)) };
}
