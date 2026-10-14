import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from '@/lib/supabase/env';

/**
 * Refresh Supabase auth cookies on every request so Server Components see
 * an up-to-date session. Also protects /account and /checkout — if there's
 * no session, bounce to /sign-in with a return path.
 *
 * No-ops entirely when Supabase env vars aren't set, so a fresh clone still
 * runs without the backend.
 */
export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  const protectedPaths = ['/account', '/checkout', '/admin', '/dealer', '/test-drive'];
  const requiresAuth = protectedPaths.some((p) => pathname.startsWith(p));
  if (requiresAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Role-gated areas. profiles.role is 'customer' | 'dealer' | 'admin' (added in 0002).
  const needsRole: 'admin' | 'dealer' | null = pathname.startsWith('/admin')
    ? 'admin'
    : pathname.startsWith('/dealer')
      ? 'dealer'
      : null;

  if (needsRole && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    const role = (profile as { role?: string } | null)?.role;
    const allowed = role === 'admin' || (needsRole === 'dealer' && role === 'dealer');
    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('forbidden', '1');
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match everything except:
     *   - static files (/_next/static, /_next/image, /favicon.ico)
     *   - public images, models and textures
     */
    '/((?!_next/static|_next/image|favicon.ico|models/|textures/|vehicles/).*)',
  ],
};
