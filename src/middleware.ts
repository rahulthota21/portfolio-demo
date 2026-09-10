import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/**
 * Guards /jackal.
 *
 * ── Stealth mode (armed when JACKAL_GATE_KEY is set) ────────────────────
 * The console's existence is a secret. Anyone without the owner's session
 * gets a genuine 404 - including at /jackal/login - so nobody can even tell
 * an admin area exists. The owner reaches the login page only through a
 * private bookmark:  /jackal/login?k=<JACKAL_GATE_KEY>
 * which plants a short-lived httpOnly gate cookie, so refreshing mid-login
 * (e.g. during the 2FA step) does not bounce to 404.
 *
 * ── Legacy mode (JACKAL_GATE_KEY unset) ─────────────────────────────────
 * Anonymous visitors are redirected to the login page (the old behaviour).
 *
 * Both modes:
 *  1. Refresh the Supabase session cookie on every request.
 *  2. Sign out and 404/redirect anyone whose email is not ADMIN_EMAIL.
 *  3. Keep every /jackal response (404s included) out of search engines.
 */

const GATE_COOKIE = 'jackal_gate';
const GATE_COOKIE_MAX_AGE = 60 * 30; // 30 minutes - enough for login + 2FA

/** Every /jackal response - including redirects and 404s - stays out of search engines. */
function noIndex(res: NextResponse) {
  res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return res;
}

/**
 * Rewrite to a path that has no route, so the app renders its real
 * not-found page with a 404 status. The URL bar keeps whatever the visitor
 * typed - indistinguishable from any other missing page.
 */
function ghost404(req: NextRequest) {
  const res = NextResponse.rewrite(new URL('/.ghost-404', req.url));
  res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return res;
}

/** Abort after a few seconds so a slow Supabase can never hang the guard. */
const boundedFetch: typeof fetch = (input, init) =>
  fetch(input, {
    ...init,
    signal:
      typeof AbortSignal !== 'undefined' && AbortSignal.timeout
        ? AbortSignal.timeout(4000)
        : init?.signal,
  });

/** Constant-time string compare so the gate key cannot be timed out of the middleware. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: { headers: req.headers } });

  // Site-wide hardening
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/jackal')) return res;

  res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');

  const gateKey = process.env.JACKAL_GATE_KEY ?? '';
  const stealthArmed = gateKey.length >= 16;
  const isLogin = pathname === '/jackal/login';

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Same fallback as lib/supabase/server.ts - if ADMIN_EMAIL is ever dropped
  // from the environment, the guard must not widen.
  const adminEmail = (process.env.ADMIN_EMAIL || 'rahulthota21@gmail.com').toLowerCase();

  const k = req.nextUrl.searchParams.get('k') ?? '';
  const hasGateCookie = safeEqual(req.cookies.get(GATE_COOKIE)?.value ?? '', gateKey);
  const gateOk = stealthArmed && (safeEqual(k, gateKey) || hasGateCookie);

  // Supabase not configured yet.
  if (!url || !key) {
    if (stealthArmed) {
      // Even the setup notice must not leak the console's existence.
      if (isLogin && gateOk) {
        res.cookies.set(GATE_COOKIE, gateKey, gateCookieOptions(req));
        return noIndex(res);
      }
      return ghost404(req);
    }
    return res;
  }

  const supabase = createServerClient(url, key, {
    global: { fetch: boundedFetch },
    cookies: {
      get: (name: string) => req.cookies.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        res.cookies.set({ name, value, ...options });
      },
      remove: (name: string, options: CookieOptions) => {
        res.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = Boolean(user && user.email?.toLowerCase() === adminEmail);

  if (stealthArmed) {
    // The login page exists only for someone holding the gate key.
    if (isLogin) {
      if (gateOk) {
        res.cookies.set(GATE_COOKIE, gateKey, gateCookieOptions(req));
        if (isOwner) {
          const to = req.nextUrl.clone();
          to.pathname = '/jackal';
          to.search = '';
          return noIndex(NextResponse.redirect(to));
        }
        return noIndex(res);
      }
      return ghost404(req);
    }

    if (!isOwner) {
      // Signed in as the wrong account, or not signed in: same response -
      // a 404 that gives away nothing.
      if (user) await supabase.auth.signOut();
      return ghost404(req);
    }

    return noIndex(res);
  }

  // ── Legacy mode (no gate key configured) ──────────────────────────────
  if (!user) {
    if (isLogin) return res;
    const to = req.nextUrl.clone();
    to.pathname = '/jackal/login';
    to.searchParams.set('next', pathname);
    return noIndex(NextResponse.redirect(to));
  }

  // Signed in, but not the owner.
  if (adminEmail && user.email?.toLowerCase() !== adminEmail) {
    await supabase.auth.signOut();
    const to = req.nextUrl.clone();
    to.pathname = '/jackal/login';
    to.searchParams.set('error', 'not-allowed');
    return noIndex(NextResponse.redirect(to));
  }

  if (isLogin) {
    const to = req.nextUrl.clone();
    to.pathname = '/jackal';
    to.search = '';
    return noIndex(NextResponse.redirect(to));
  }

  return res;
}

function gateCookieOptions(req: NextRequest) {
  const host = req.nextUrl.hostname;
  const secure = host !== 'localhost' && host !== '127.0.0.1';
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure,
    path: '/',
    maxAge: GATE_COOKIE_MAX_AGE,
  };
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|files|.*\\.(?:png|jpg|jpeg|svg|webp|pdf)$).*)'],
};
