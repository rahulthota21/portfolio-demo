import type { Metadata } from 'next';
import { ContactForm } from '@/components/ContactForm';
import { FavouriteGroup } from '@/components/FavouriteGroup';
import { ArrowUpRight, Mail } from '@/components/Icons';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { Reveal } from '@/components/Reveal';
import { getContent } from '@/lib/content';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Beyond code',
  description:
    'The films, series, sport and music I keep going back to - and the poster design work I do on the side.',
  alternates: { canonical: '/beyond-code' },
};

export default async function BeyondCodePage() {
  const content = await getContent();
  const { personal, identity } = content;
  const sections = [...personal.sections].sort((a, b) => a.order - b.order);
  const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ?? '';
  const hasAny = sections.some((s) => s.items.length > 0);

  return (
    <>
      <Nav
        wordmark={identity.wordmark}
        open={identity.availability.open}
        availabilityLabel={identity.availability.label}
      />

      <main id="main" className="pt-[132px] md:pt-[176px]">
        {/* Hero */}
        <section className="container-content">
          <Reveal>
            <p className="chip">Beyond code</p>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="type-display mt-lg balance text-ink">Away from the keyboard.</h1>
          </Reveal>
          <Reveal delay={110}>
            <p className="mt-lg max-w-prose text-body-lg pretty text-muted">{personal.intro}</p>
          </Reveal>

          {/* The quote, right under the hero */}
          <Reveal delay={160}>
            <figure className="mt-xl rounded-md bg-ink px-lg py-xl text-canvas md:px-xl md:py-section">
              <blockquote className="type-h2 balance">“{personal.quote}”</blockquote>
            </figure>
          </Reveal>
        </section>

        {/* Now */}
        {personal.now.length > 0 && (
          <section className="container-content mt-section">
            <Reveal>
              <div className="border-b border-hairline-soft pb-lg">
                <p className="eyebrow">Now</p>
              </div>
            </Reveal>
            <Reveal delay={60}>
              <dl
                className={`mt-lg grid gap-px overflow-hidden rounded-md bg-hairline-soft ${
                  personal.now.length >= 4
                    ? 'sm:grid-cols-2 lg:grid-cols-4'
                    : personal.now.length === 3
                      ? 'sm:grid-cols-3'
                      : 'sm:grid-cols-2'
                }`}
              >
                {personal.now.map((row) => (
                  <div key={row.label} className="bg-canvas px-lg py-lg">
                    <dt className="text-caption text-muted">{row.label}</dt>
                    <dd className="mt-1 text-title text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </section>
        )}

        {/* Favourites */}
        {hasAny && (
          <section className="container-content mt-section">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-md border-b border-hairline-soft pb-lg">
                <h2 className="type-h2 text-ink">Things I like.</h2>
                <a
                  href="https://letterboxd.com/rahulthota/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="pill-outline shrink-0"
                >
                  Letterboxd
                  <ArrowUpRight width={15} height={15} />
                </a>
              </div>
            </Reveal>
            <div className="mt-lg">
              {sections.map((s, i) => (
                <Reveal key={s.id} delay={Math.min(i * 40, 200)}>
                  <FavouriteGroup section={s} />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Freelance */}
        <section id="design" className="container-content mt-section scroll-mt-32">
          <div className="grid gap-xl rounded-md bg-canvas-soft p-lg md:p-section lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Reveal>
              <div>
                <p className="eyebrow">Freelance</p>
                <h2 className="type-h2 mt-sm balance text-ink">{personal.freelance.title}</h2>
                <p className="mt-md max-w-prose text-body-lg pretty text-muted">
                  {personal.freelance.body}
                </p>
                <a
                  href={`mailto:${identity.email}`}
                  className="mt-lg inline-flex items-center gap-2 text-body-sm font-semibold text-ink underline decoration-hairline underline-offset-4 transition-colors hover:decoration-ink"
                >
                  <Mail width={15} height={15} />
                  Email me
                </a>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="rounded-md bg-canvas p-lg">
                <ContactForm
                  endpoint={endpoint}
                  subject="Portfolio - design enquiry"
                  cta={personal.freelance.cta}
                  compact
                  privacyNote={content.contact.privacyNote}
                />
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer content={content} />
    </>
  );
}
