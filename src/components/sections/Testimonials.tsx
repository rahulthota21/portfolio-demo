import { Reveal } from '@/components/Reveal';
import { SectionHeader } from '@/components/SectionHeader';
import type { Testimonial } from '@/data/types';

function displayName(t: Testimonial) {
  if (t.approved) return t.name;
  return t.role.split('·')[0]?.trim() || 'Colleague';
}

/** With the name hidden, the caption drops the duplicated role word. */
function displayRole(t: Testimonial) {
  if (t.approved) return t.role;
  const rest = t.role.split('·').slice(1).join('·').trim();
  return rest ? `${rest} · name pending approval` : 'Name pending approval';
}

export function Testimonials({ items }: { items: Testimonial[] }) {
  const list = [...items].sort((a, b) => a.order - b.order);
  if (list.length === 0) return null;
  const anyPending = list.some((t) => !t.approved);

  return (
    <section id="words" className="section-pad scroll-mt-32">
      <div className="container-content">
        <SectionHeader
          eyebrow="Words"
          title="What people I worked with say."
          note={anyPending ? 'Names appear once each person has approved their quote.' : undefined}
        />

        <div className="mt-xl grid gap-lg md:grid-cols-2">
          {list.map((t, i) => (
            <Reveal key={`${t.order}-${t.name}`} delay={(i % 2) * 80} as="article">
              <figure className="card flex h-full flex-col p-lg md:p-xl">
                <blockquote className="text-body pretty text-ink-soft">“{t.quote}”</blockquote>
                <figcaption className="mt-lg flex items-center gap-sm border-t border-hairline-soft pt-lg">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-canvas-soft text-label text-muted">
                    {displayName(t).charAt(0)}
                  </span>
                  <span>
                    <span className="block text-link text-ink">{displayName(t)}</span>
                    <span className="block text-caption text-muted">{displayRole(t)}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
