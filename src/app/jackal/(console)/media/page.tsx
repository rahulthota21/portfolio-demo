import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { getContentFresh } from '@/lib/content';
import { createSupabaseServerClient, supabaseConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const content = await getContentFresh();
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
      <div className="mb-lg">
        <p className="eyebrow">Files</p>
        <h1 className="type-h3 mt-1 text-ink">Media & resume</h1>
        <p className="mt-sm max-w-prose text-body-sm text-muted">
          Uploads go to the public <code className="rounded bg-canvas-soft px-1.5 py-0.5">media</code>{' '}
          bucket in Supabase Storage. Copy the URL and paste it into the field it belongs to - a
          poster in Beyond code, a diagram on a project, a PDF on a paper.
        </p>
      </div>

      {!supabaseConfigured ? (
        <div className="rounded-md border border-hairline bg-canvas-soft p-lg text-body-sm text-muted">
          Connect Supabase first - uploads need the storage bucket.
        </div>
      ) : (
        <MediaUploader />
      )}

      <div className="mt-xl rounded-md bg-canvas-soft p-lg">
        <p className="text-title text-ink">Current resume</p>
        <p className="mt-1 text-body-sm text-muted">
          Served at <code className="rounded bg-canvas px-1.5 py-0.5">/resume</code> · updated{' '}
          {content.resume.updated}
        </p>
        <div className="mt-md flex flex-wrap items-center gap-sm">
          <a href={content.resume.file} target="_blank" rel="noreferrer" className="pill-outline">
            Open current PDF
          </a>
          <Link href="/jackal/edit/resume" className="pill-primary">
            Point /resume at a new file
          </Link>
        </div>
        <p className="mt-sm text-caption text-faint">
          Upload the new PDF above (folder: Resume PDF), copy its URL, then paste it into the “File”
          field in the Resume section.
        </p>
      </div>
    </AdminShell>
  );
}
