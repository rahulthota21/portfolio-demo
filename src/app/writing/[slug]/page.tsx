import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { ArrowRight } from '@/components/Icons';
import { Nav } from '@/components/Nav';
import { Reveal } from '@/components/Reveal';
import { getContent } from '@/lib/content';

export const revalidate = 60;

/**
 * Minimal post renderer - the missing target for the Writing section's
 * cards. Intentionally small: title, date, body paragraphs, back link.
 */
export async function generateStaticParams() {
  const { blog } = await getContent();
  return blog.filter((p) => p.published).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { blog } = await getContent();
  const post = blog.find((p) => p.slug === params.slug);
  if (!post) return { title: 'Not found' };

  const path = `/writing/${post.slug}`;
  // Shallow merge: restate the OG fields the layout would otherwise lose.
  const openGraph: Metadata['openGraph'] = {
    type: 'article',
    url: path,
    title: post.title,
    description: post.excerpt,
    siteName: 'Thota Rahul',
    images: [{ url: '/og-card.png', width: 1200, height: 630, alt: post.title }],
  };
  const twitter: Metadata['twitter'] = {
    card: 'summary_large_image',
    title: post.title,
    description: post.excerpt,
    images: ['/og-card.png'],
  };

  return { title: post.title, description: post.excerpt, alternates: { canonical: path }, openGraph, twitter };
}

export default async function WritingPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const content = await getContent();
  const post = content.blog.find((p) => p.slug === params.slug && p.published);
  if (!post) notFound();

  const paragraphs = post.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const { identity } = content;

  return (
    <>
      <Nav
        wordmark={identity.wordmark}
        open={identity.availability.open}
        availabilityLabel={identity.availability.label}
      />

      <main id="main" className="pt-[132px] md:pt-[168px]">
        <article className="container-content">
          <Reveal>
            <Link
              href="/#writing"
              className="inline-flex items-center gap-1.5 text-body-sm text-muted transition-colors hover:text-ink"
            >
              <ArrowRight className="rotate-180" width={14} height={14} />
              All writing
            </Link>
          </Reveal>

          <Reveal delay={60}>
            <p className="eyebrow mt-lg">{post.date}</p>
            <h1 className="type-h1 mt-sm balance max-w-prose text-ink">{post.title}</h1>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-xl max-w-prose space-y-md">
              {paragraphs.length > 0 ? (
                paragraphs.map((p, i) => (
                  <p key={i} className="text-body-lg pretty text-ink-soft">
                    {p}
                  </p>
                ))
              ) : (
                <p className="text-body-lg text-muted">{post.excerpt}</p>
              )}
            </div>
          </Reveal>
        </article>
      </main>

      <Footer content={content} />
    </>
  );
}
