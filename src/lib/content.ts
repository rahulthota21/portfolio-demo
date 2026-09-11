import { unstable_cache } from 'next/cache';
import { seed } from '@/data/seed';
import type { SiteContent } from '@/data/types';
import { createSupabasePublicClient, supabaseConfigured } from './supabase/server';
import { isValidSection } from './validate';

export const CONTENT_TAG = 'site-content';

/** Every top-level key is a row in the `content` table (key text, value jsonb). */
export type ContentKey = keyof SiteContent;

async function fetchFromSupabase(): Promise<SiteContent> {
  const client = createSupabasePublicClient();
  if (!client) return seed;

  const { data, error } = await client.from('content').select('key, value');
  if (error || !data || data.length === 0) {
    if (error) console.warn('[content] Supabase read failed, falling back to seed:', error.message);
    return seed;
  }

  // Merge over the seed so a missing row can never blank out a section.
  // Rows failing their shape check are skipped (and logged) so one corrupt
  // value can never take public pages down - the seed value survives.
  const merged: Record<string, unknown> = { ...seed };
  for (const row of data) {
    if (row.value === null || row.value === undefined) continue;
    if (!isValidSection(row.key, row.value)) {
      console.warn(`[content] row "${row.key}" failed its shape check - using seed value instead.`);
      continue;
    }
    merged[row.key] = row.value;
  }
  return merged as unknown as SiteContent;
}

const cachedContent = unstable_cache(fetchFromSupabase, ['site-content'], {
  tags: [CONTENT_TAG],
  revalidate: 60,
});

/** The site's content. Supabase when configured, seed data otherwise. */
export async function getContent(): Promise<SiteContent> {
  if (!supabaseConfigured) return seed;
  try {
    return await cachedContent();
  } catch (err) {
    console.warn('[content] falling back to seed:', err);
    return seed;
  }
}

/** Uncached read - used by the dashboard so edits appear immediately. */
export async function getContentFresh(): Promise<SiteContent> {
  if (!supabaseConfigured) return seed;
  try {
    return await fetchFromSupabase();
  } catch {
    return seed;
  }
}

export function isSupabaseLive() {
  return supabaseConfigured;
}
