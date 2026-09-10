import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import { SeedButton } from '@/components/admin/SeedButton';
import { ArrowUpRight } from '@/components/Icons';
import { getContentFresh } from '@/lib/content';
import { countOf, SECTION_META } from '@/lib/sections';
import { createSupabaseServerClient, supabaseConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function JackalHome() {
  const content = await getContentFresh();

  let email: string | null = null;
  let rowCount = 0;
  if (supabaseConfigured) {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
    const { count } = await supabase.from('content').select('key', { count: 'exact', head: true });
    rowCount = count ?? 0;
  }

  const overview = [
    { label: 'Projects', value: String(content.projects.length), href: '/jackal/edit/projects' },
    { label: 'Papers', value: String(content.publications.length), href: '/jackal/edit/publications' },
    {
      label: 'Testimonials approved',
      value: `${content.testimonials.filter((t) => t.approved).length}/${content.testimonials.length}`,
      href: '/jackal/edit/testimonials',
    },
    {
      label: 'Posts published',
      value: String(content.blog.filter((b) => b.published).length),
      href: '/jackal/edit/blog',
    },
  ];

  const groups = Array.from(new Set(SECTION_META.map((s) => s.group)));

  return (
    <AdminShell email={email}>
      <div className="flex flex-wrap items-end justify-between gap-md">
        <div>
          <p className="eyebrow">Console</p>
          <h1 className="type-h2 mt-1 text-ink">Everything on the site, editable.</h1>
          <p className="mt-sm max-w-prose text-body-sm text-muted">
            Pick a section, change what you need, save - the live site updates within seconds.
          </p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="pill-outline">
          View site <ArrowUpRight width={15} height={15} />
        </a>
      </div>

      {/* Connection state */}
      <div
        className={`mt-xl rounded-md p-lg ${
          supabaseConfigured ? 'bg-canvas-soft' : 'border border-hairline bg-canvas'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-md">
          <div className="flex items-start gap-sm">
            <span className="mt-2 h-2 w-2 shrink-0 animate-pulseDot rounded-full bg-ink" aria-hidden />
            <div>
              <p className="text-title text-ink">
                {supabaseConfigured ? 'Supabase connected' : 'Running on seed data'}
              </p>
              <p className="mt-1 max-w-prose text-body-sm text-muted">
                {supabaseConfigured
                  ? rowCount === 0
                    ? `Connected but empty. Press "Load seed content" once to copy all ${SECTION_META.length} sections in.`
                    : `${rowCount} of ${SECTION_META.length} content rows live in the database. Saving here publishes to the site.`
                  : 'Add the Supabase keys to .env.local, run supabase/schema.sql, then reload this page.'}
              </p>
            </div>
          </div>
          {supabaseConfigured && <SeedButton />}
        </div>
      </div>

      {/* Overview cards */}
      <div className="mt-lg grid gap-sm sm:grid-cols-2 lg:grid-cols-4">
        {overview.map((o) => (
          <Link
            key={o.label}
            href={o.href}
            className="rounded-md border border-hairline-soft px-lg py-lg transition-colors hover:bg-canvas-soft"
          >
            <span className="block text-h3 leading-none text-ink">{o.value}</span>
            <span className="mt-sm block text-body-sm text-muted">{o.label}</span>
          </Link>
        ))}
      </div>

      {/* Sections */}
      {groups.map((g) => (
        <section key={g} className="mt-xl">
          <h2 className="mb-sm text-label text-faint">{g}</h2>
          <div className="grid gap-sm md:grid-cols-2">
            {SECTION_META.filter((s) => s.group === g).map((s) => (
              <Link
                key={s.key}
                href={`/jackal/edit/${s.key}`}
                className="group flex items-center justify-between gap-md rounded-md border border-hairline-soft px-md py-md transition-colors hover:bg-canvas-soft"
              >
                <span className="min-w-0">
                  <span className="block text-body text-ink">{s.label}</span>
                  <span className="block truncate text-caption text-muted">{s.description}</span>
                </span>
                <span className="flex shrink-0 items-center gap-sm text-caption text-faint">
                  {countOf(s.key, content)}
                  <ArrowUpRight
                    width={14}
                    height={14}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* Files */}
      <section className="mt-xl">
        <h2 className="mb-sm text-label text-faint">Files</h2>
        <Link
          href="/jackal/media"
          className="group flex items-center justify-between gap-md rounded-md border border-hairline-soft px-md py-md transition-colors hover:bg-canvas-soft md:w-1/2"
        >
          <span>
            <span className="block text-body text-ink">Media & resume</span>
            <span className="block text-caption text-muted">
              Upload posters, diagrams, paper PDFs and a new resume
            </span>
          </span>
          <ArrowUpRight
            width={16}
            height={16}
            className="shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
      </section>
    </AdminShell>
  );
}
