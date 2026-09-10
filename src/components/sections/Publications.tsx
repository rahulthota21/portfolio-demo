import Link from 'next/link';
import { ArrowUpRight, FileText } from '@/components/Icons';
import { Reveal } from '@/components/Reveal';
import { SectionHeader } from '@/components/SectionHeader';
import type { Publication } from '@/data/types';

export function Publications({ publications }: { publications: Publication[] }) {
  const list = [...publications].sort((a, b) => a.order - b.order);
  if (list.length === 0) return null;

  return (
    <section id="papers" className="section-pad scroll-mt-32">
      <div className="container-content">
        <SectionHeader
          eyebrow="Research"
          title="Four papers, accepted at IEEE conferences."
          note="Each one is a system I helped build, written up and presented."
        />

        <div className="mt-xl grid gap-lg lg:grid-cols-2">
          {list.map((pub, i) => (
            <Reveal key={pub.title} delay={(i % 2) * 80} as="article">
              <div className="card flex h-full flex-col p-lg md:p-xl">
                <div className="flex flex-wrap items-center gap-xs">
                  <span className="rounded-full bg-ink px-3 py-1.5 text-label text-canvas">
                    {pub.venue}
                  </span>
                  <span className="chip-outline">{pub.status}</span>
                  <span className="chip-outline">{pub.role}</span>
                </div>

                <h3 className="mt-lg text-title pretty text-ink">{pub.title}</h3>
                <p className="mt-sm text-body-sm pretty text-muted">{pub.note}</p>

                <div className="mt-auto flex flex-wrap items-center gap-sm pt-lg">
                  {pub.pdf && (
                    <a
                      href={pub.pdf}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 rounded-full bg-canvas-soft px-4 py-2 text-body-sm text-ink transition-opacity hover:opacity-70"
                    >
                      <FileText width={15} height={15} />
                      Read the paper
                    </a>
                  )}
                  {pub.project && (
                    <Link
                      href={`/work/${pub.project}`}
                      className="inline-flex items-center gap-1 text-body-sm text-ink underline decoration-hairline underline-offset-4 transition-colors hover:decoration-ink"
                    >
                      See the system
                      <ArrowUpRight width={14} height={14} />
                    </Link>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
