import { notFound, redirect } from 'next/navigation';
import {
  ADMIN_EMAIL,
  createSupabaseServerClient,
  supabaseConfigured,
} from './supabase/server';

/**
 * True when console stealth mode is armed. Must agree with middleware.ts.
 * Length-checked so a placeholder value can never silently half-arm it.
 */
export function stealthArmed(): boolean {
  return (process.env.JACKAL_GATE_KEY ?? '').length >= 16;
}

/**
 * Response for anyone who is not the verified owner:
 *  - stealth mode  → a genuine 404 (the console does not exist for them)
 *  - legacy mode   → bounced to the login page
 */
function rejectOwnerless(): never {
  if (stealthArmed()) notFound();
  redirect('/jackal/login');
}

export type OwnerSession = { email: string };

/**
 * Page-level guard - the last line of defence for every console page.
 *
 * Middleware runs first, but pages must never trust it alone: a deployment
 * without Supabase env vars, a future routing mistake or a matcher gap would
 * otherwise render the console. Whatever the environment looks like, this
 * guarantees the console only ever renders for ADMIN_EMAIL's live session.
 */
export async function requireOwner(): Promise<OwnerSession> {
  // No Supabase on this deployment → nobody can authenticate. The console is
  // unreachable: 404 in stealth, the login/setup notice in legacy mode.
  if (!supabaseConfigured) rejectOwnerless();

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
    // Wrong account (or leftover session): end it so the stray cookie is
    // cleared, then show the ownerless response.
    if (user) await supabase.auth.signOut();
    rejectOwnerless();
  }

  return { email: user.email! };
}
