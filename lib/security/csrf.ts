import 'server-only';
import { headers } from 'next/headers';

/**
 * Defense-in-depth same-origin check for Server Actions.
 *
 * Next.js 14+ already validates the Origin header for Server Action calls and
 * uses signed action references, which blocks most CSRF. This helper adds an
 * explicit guard that any sensitive action can call before mutating state, so
 * a future framework-level regression (or a misconfigured proxy that drops
 * Next.js's own protections) can't bypass it.
 *
 * The guard trusts `NEXT_PUBLIC_SITE_URL` as the canonical origin when set,
 * then falls back to the Host header the request already arrived on. The
 * Origin / Referer headers from the client must match one of those or the
 * action is refused.
 *
 * Returns `null` when the origin passes, or an `AuthResult`-shaped error that
 * the caller can return directly.
 */
export type SameOriginCheck = { ok: true } | { ok: false; message: string };

/** Pull just the host:port out of a URL string. */
function hostOf(u: string | null): string | null {
  if (!u) return null;
  try {
    return new URL(u).host.toLowerCase();
  } catch {
    return null;
  }
}

export async function assertSameOrigin(): Promise<SameOriginCheck> {
  const h = await headers();
  const origin = h.get('origin');
  const referer = h.get('referer');
  const host = h.get('host')?.toLowerCase() ?? null;

  // Build the list of allowed hosts. NEXT_PUBLIC_SITE_URL is the primary
  // production host. The current request's own Host header is also allowed —
  // this covers dev (localhost), ngrok tunnels, Vercel preview URLs, and any
  // alt domain the app is served from, while still blocking a request whose
  // Origin names a different host than the one serving the page.
  const allowed = new Set<string>();
  const envHost = hostOf(process.env.NEXT_PUBLIC_SITE_URL ?? null);
  if (envHost) allowed.add(envHost);
  if (host) allowed.add(host);

  // Null Origin on same-origin fetches in some browsers — fall back to Referer.
  const claimHost = hostOf(origin) ?? hostOf(referer);
  if (!claimHost) {
    return { ok: false, message: 'Request blocked: missing origin.' };
  }
  if (allowed.size === 0) {
    return { ok: false, message: 'Request blocked: no canonical host.' };
  }
  if (!allowed.has(claimHost)) {
    return { ok: false, message: 'Request blocked: cross-origin not allowed.' };
  }
  return { ok: true };
}
