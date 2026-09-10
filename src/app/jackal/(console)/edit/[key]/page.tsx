import { notFound } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { SectionEditor } from '@/components/admin/SectionEditor';
import type { Personal, SiteContent } from '@/data/types';
import { getContentFresh } from '@/lib/content';
import { SECTION_META } from '@/lib/sections';
import { createSupabaseServerClient, supabaseConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Favourite items may predate the image/caption fields. Filling them in here
 * guarantees every item shows its Title, Caption and Image (upload) controls.
 */
function normalizeForEditing(key: keyof SiteContent, value: SiteContent[keyof SiteContent]) {
  if (key !== 'personal') return value;
  const p = value as Personal;
  return {
    ...p,
    sections: p.sections.map((s) => ({
      ...s,
      items: s.items.map((it) => ({ caption: '', image: '', ...it })),
    })),
  };
}

export default async function EditSectionPage({ params }: { params: { key: string } }) {
  const meta = SECTION_META.find((s) => s.key === params.key);
  if (!meta) notFound();

  const content = await getContentFresh();
  const value = normalizeForEditing(meta.key, content[meta.key]);

  let email: string | null = null;
  if (supabaseConfigured) {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
  }

  return (
    <AdminShell email={email}>
      <SectionEditor
        sectionKey={meta.key}
        label={meta.label}
        description={meta.description}
        initial={value as never}
        live={supabaseConfigured}
      />
    </AdminShell>
  );
}
