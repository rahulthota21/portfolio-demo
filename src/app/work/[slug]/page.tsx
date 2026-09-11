import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { ArrowRight, ArrowUpRight, FileText, Github } from '@/components/Icons';
import { Nav } from '@/components/Nav';
import { ProjectArtifact } from '@/components/ProjectArtifact';
import { Reveal } from '@/components/Reveal';
import { getContent } from '@/lib/content';

export const revalidate = 60;

export async function generateStaticParams() {
  const { projects } = await getContent();
  // Only published projects get pre-rendered.
  return projects.filter((p) => p.published).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { projects } = await getContent();
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) return { title: 'Not found' };

  const path = `/work/${project.slug}`;
  const title = `${project.name} - ${project.subtitle}`;
  const description = project.overview;

  // Metadata merges shallowly in Next.js: defining openGraph here replaces
  // the layout's openGraph wholesale, so every field must be restated or
  // social shares of case studies lose their preview image entirely.
  const openGraph: Metadata['openGraph'] = {
    type: 'article',
    url: path,
    title,
    description,
    siteName: 'Thota Rahul',
    images: [{ url: '/og-card.png', width: 1200, height: 630, alt: title }],
  };
  const twitter: Metadata['twitter'] = {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og-card.png'],
  };

  return { title, description, alternates: { canonical: path }, openGraph, twitter };
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const content = await getContent();
  const list = content.projects.filter((p) => p.published).sort((a, b) => a.order - b.order);
  const project = list.find((p) => p.slug === params.slug);
  if (!project) notFound();

  const index = list.findIndex((p) => p.slug === project.slug);
  const next = list[(index + 1) % list.length];
  const paper = content.publications.find((pub) => pub.project === project.slug);

  return (
    <>
      <Nav
        wordmark={content.identity.wordmark}
        open={content.identity.availability.open}
        availabilityLabel={content.identity.availability.label}
      />

      <main id="main" className="pt-[132px] md:pt-[168px]">
        <article className="container-content">
          {/* Header */}
          <Reveal>
            <Link
              href="/#projects"
              className="inline-flex items-center gap-1.5 text-body-sm text-muted transition-colors hover:text-ink"
            >
              <ArrowRight className="rotate-180" width={14} height={14} />
              All work
            </Link>
          </Reveal>

          <Reveal delay={60}>
            <div className="mt-lg flex flex-wrap items-center gap-xs">
              <span className="rounded-full bg-ink px-3 py-1.5 text-label text-canvas">
                {project.badge}
              </span>
              <span className="chip">{project.category}</span>
              <span className="chip-outline">{project.timeline}</span>
              <span className="chip-outline">{project.role}</span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="type-h1 mt-lg balance text-ink">{project.name}</h1>
            <p className="mt-sm text-body-lg pretty text-muted">{project.subtitle}</p>
          </Reveal>

          <Reveal delay={140}>
            <div className="mt-lg flex flex-wrap gap-sm">
              {project.links.demo && (
                <a href={project.links.demo} target="_blank" rel="noreferrer noopener" className="pill-primary">
                  Live demo
                  <ArrowUpRight width={15} height={15} />
                </a>
              )}
              {project.links.github && (
                <a href={project.links.github} target="_blank" rel="noreferrer noopener" className="pill-outline">
                  <Github width={15} height={15} />
                  View code
                </a>
              )}
              {project.links.pdf && (
                <a href={project.links.pdf} target="_blank" rel="noreferrer noopener" className="pill-soft">
                  <FileText width={15} height={15} />
                  Read the paper
                </a>
              )}
            </div>
          </Reveal>

          {/* Artifact band */}
          <Reveal delay={180}>
            <div className="mt-xl overflow-hidden rounded-md bg-canvas-soft p-xl md:p-section">
              <div className="mx-auto max-w-2xl">
                <ProjectArtifact type={project.artifact} />
              </div>
            </div>
          </Reveal>

          {/* Metrics */}
          {project.metrics.length > 0 && (
            <Reveal delay={60}>
              <dl className="mt-xl grid grid-cols-2 gap-px overflow-hidden rounded-md bg-hairline-soft md:grid-cols-4">
                {project.metrics.map((m) => (
                  <div key={m.label} className="bg-canvas px-lg py-xl">
                    <dt className="sr-only">{m.label}</dt>
                    <dd>
                      <span className="block text-h3 leading-none text-ink">{m.value}</span>
                      <span className="mt-sm block text-body-sm text-muted">{m.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}

          {/* Body */}
          <div className="mt-section grid gap-xl lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-section">
            <div className="space-y-xl">
              {[
                { h: 'The problem', b: project.problem },
                { h: 'What I built', b: project.solution },
              ].map((block, i) => (
                <Reveal key={block.h} delay={i * 60}>
                  <section>
                    <h2 className="text-h4 text-ink">{block.h}</h2>
                    <p className="mt-md max-w-prose text-body-lg pretty text-ink-soft">{block.b}</p>
                  </section>
                </Reveal>
              ))}

              {project.highlights.length > 0 && (
                <Reveal delay={120}>
                  <section>
                    <h2 className="text-h4 text-ink">Highlights</h2>
                    <ul className="mt-md space-y-0">
                      {project.highlights.map((h) => (
                        <li
                          key={h}
                          className="flex gap-sm border-b border-hairline-soft py-sm text-body pretty text-ink-soft first:border-t"
                        >
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" aria-hidden />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </section>
                </Reveal>
              )}

              {project.pipeline.length > 0 && (
                <Reveal delay={160}>
                  <section>
                    <h2 className="text-h4 text-ink">How it works</h2>
                    <ol className="mt-md grid gap-sm sm:grid-cols-2 lg:grid-cols-3">
                      {project.pipeline.map((step, i) => (
                        <li key={step.label} className="card-soft flex flex-col gap-1 p-md">
                          <span className="text-caption text-faint">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="text-body-sm text-ink">{step.label}</span>
                          {step.detail && (
                            <span className="text-caption text-muted">{step.detail}</span>
                          )}
                        </li>
                      ))}
                    </ol>
                    {project.archImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.archImage}
                        alt={`${project.name} architecture diagram`}
                        className="mt-lg w-full rounded-md border border-hairline-soft"
                      />
                    )}
                  </section>
                </Reveal>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-lg">
              <Reveal delay={80}>
                <aside className="card-soft p-lg">
                  <p className="eyebrow">Status</p>
                  <p className="mt-sm text-body text-ink">{project.status}</p>
                  {paper && (
                    <>
                      <p className="eyebrow mt-lg">Paper</p>
                      <p className="mt-sm text-body-sm text-ink">{paper.title}</p>
                      <p className="mt-1 text-caption text-muted">
                        {paper.venue} · {paper.role}
                      </p>
                    </>
                  )}
                </aside>
              </Reveal>

              <Reveal delay={120}>
                <aside className="card p-lg">
                  <p className="eyebrow">Stack</p>
                  <ul className="mt-md flex flex-wrap gap-xs">
                    {project.stack.map((s) => (
                      <li key={s} className="chip">
                        {s}
                      </li>
                    ))}
                  </ul>
                </aside>
              </Reveal>
            </div>
          </div>

          {/* Next project */}
          <Reveal>
            <Link
              href={`/work/${next.slug}`}
              className="group mt-section flex items-center justify-between gap-md rounded-md bg-canvas-soft px-lg py-xl transition-opacity hover:opacity-80 md:px-xl"
            >
              <span>
                <span className="eyebrow">Next project</span>
                <span className="mt-sm block text-h3 text-ink">{next.name}</span>
                <span className="mt-1 block text-body-sm text-muted">{next.subtitle}</span>
              </span>
              <ArrowRight
                width={28}
                height={28}
                className="shrink-0 text-ink transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </Reveal>
        </article>
      </main>

      <Footer content={content} />
    </>
  );
}
