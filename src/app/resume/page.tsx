import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { ArrowUpRight, Download, Mail } from '@/components/Icons';
import { Nav } from '@/components/Nav';
import { Reveal } from '@/components/Reveal';
import { getContent } from '@/lib/content';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Resume',
  description: 'Resume of Thota Rahul - AI/ML engineer and backend developer.',
  alternates: { canonical: '/resume' },
};

export default async function ResumePage() {
  const content = await getContent();
  const { resume, identity } = content;
  const file = resume.file || '/files/thota-rahul-resume.pdf';

  return (
    <>
      <Nav
        wordmark={identity.wordmark}
        open={identity.availability.open}
        availabilityLabel={identity.availability.label}
      />

      <main id="main" className="pt-[132px] md:pt-[168px]">
        <div className="container-content">
          <Reveal>
            <div className="flex flex-col gap-lg border-b border-hairline-soft pb-lg md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow">Resume</p>
                <h1 className="type-h1 mt-sm text-ink">{identity.name}</h1>
                <p className="mt-sm text-body text-muted">
                  AI/ML engineer & backend developer · updated {resume.updated}
                </p>
              </div>
              <div className="flex flex-wrap gap-sm">
                <a href={file} download className="pill-primary">
                  <Download width={15} height={15} />
                  Download PDF
                </a>
                <a href={file} target="_blank" rel="noreferrer noopener" className="pill-outline">
                  Open in new tab
                  <ArrowUpRight width={15} height={15} />
                </a>
                <a href={`mailto:${identity.email}`} className="pill-soft">
                  <Mail width={15} height={15} />
                  Email me
                </a>
              </div>
            </div>
          </Reveal>

          {/* Live viewer - desktop */}
          <Reveal delay={80}>
            <div className="mt-lg hidden md:block">
              <div className="overflow-hidden rounded-md border border-hairline-soft bg-canvas-soft">
                <object data={`${file}#view=FitH`} type="application/pdf" className="h-[1180px] w-full">
                  <div className="grid h-[1180px] place-items-center p-xl text-center">
                    <div>
                      <p className="text-title text-ink">Your browser can’t display PDFs inline.</p>
                      <p className="mt-sm text-body-sm text-muted">Open or download it instead.</p>
                      <div className="mt-lg flex justify-center gap-sm">
                        <a href={file} target="_blank" rel="noreferrer noopener" className="pill-primary">
                          Open resume
                        </a>
                        <a href={file} download className="pill-outline">
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                </object>
              </div>
              <p className="mt-sm text-caption text-faint">
                Not seeing the document?{' '}
                <a
                  href={file}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline decoration-hairline underline-offset-4 hover:decoration-ink"
                >
                  Open it in a new tab
                </a>
                .
              </p>
            </div>
          </Reveal>

          {/* Mobile fallback - inline PDF rendering is unreliable on phones */}
          <Reveal delay={80}>
            <div className="card-soft mt-lg p-lg md:hidden">
              <p className="text-title text-ink">One-page PDF</p>
              <p className="mt-sm text-body-sm text-muted">
                Mobile browsers don’t reliably preview PDFs inline. Open or download it below - or
                read the same material as web pages.
              </p>
              <div className="mt-lg flex flex-wrap gap-sm">
                <a href={file} target="_blank" rel="noreferrer noopener" className="pill-primary">
                  Open resume
                  <ArrowUpRight width={15} height={15} />
                </a>
                <a href={file} download className="pill-outline">
                  <Download width={15} height={15} />
                  Download
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-lg flex flex-wrap items-center justify-between gap-md rounded-md bg-canvas-soft px-lg py-lg">
              <p className="text-body-sm text-muted">
                Prefer the long version? Every project has a full case study.
              </p>
              <Link href="/#projects" className="pill-outline">
                See the work
                <ArrowUpRight width={15} height={15} />
              </Link>
            </div>
          </Reveal>
        </div>
      </main>

      <Footer content={content} />
    </>
  );
}
