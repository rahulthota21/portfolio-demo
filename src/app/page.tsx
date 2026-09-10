import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { About } from '@/components/sections/About';
import { Contact } from '@/components/sections/Contact';
import { Hero } from '@/components/sections/Hero';
import { Journey } from '@/components/sections/Journey';
import { Projects } from '@/components/sections/Projects';
import { Publications } from '@/components/sections/Publications';
import { Skills } from '@/components/sections/Skills';
import { Stats } from '@/components/sections/Stats';
import { Testimonials } from '@/components/sections/Testimonials';
import { Blog } from '@/components/sections/Blog';
import { getContent } from '@/lib/content';

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const content = await getContent();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: content.identity.name,
    email: `mailto:${content.identity.email}`,
    url: content.meta.url,
    jobTitle: 'AI/ML Engineer & Backend Developer',
    address: { '@type': 'PostalAddress', addressLocality: 'Vijayawada', addressRegion: 'Andhra Pradesh', addressCountry: 'IN' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Amrita Vishwa Vidyapeetham, Amritapuri' },
    knowsLanguage: ['Telugu', 'English', 'Hindi'],
    sameAs: content.contact.socials.filter((s) => s.url.startsWith('http')).map((s) => s.url),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so a content value like "</script>" can never break out
        // of the JSON-LD block - the standard JSON-in-script hardening.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Nav
        wordmark={content.identity.wordmark}
        open={content.identity.availability.open}
        availabilityLabel={content.identity.availability.label}
      />
      <main id="main">
        <Hero content={content} />
        <Stats stats={content.stats} />
        <About content={content} />
        <Projects projects={content.projects} />
        <Publications publications={content.publications} />
        <Skills
          heading={content.skills.heading}
          note={content.skills.note}
          groups={content.skills.groups}
        />
        <Journey items={content.journey} />
        <Testimonials items={content.testimonials} />
        <Blog posts={content.blog} />
        <Contact content={content} />
      </main>
      <Footer content={content} />
    </>
  );
}
