import type { FavouriteItem, FavouriteSection } from '@/data/types';

function initials(title: string) {
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase();
}

function Tile({ item, ratio }: { item: FavouriteItem; ratio: 'poster' | 'portrait' }) {
  const aspect = ratio === 'poster' ? 'aspect-[2/3]' : 'aspect-square';

  return (
    <figure className="group">
      <div className={`relative overflow-hidden rounded-sm bg-canvas-soft ${aspect}`}>
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover grayscale transition-[filter,transform] duration-500 group-hover:grayscale-0 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <span className="text-h3 text-faint">{initials(item.title)}</span>
          </div>
        )}
      </div>
      <figcaption className="mt-sm">
        <span className="block text-body-sm text-ink">{item.title}</span>
        {item.caption && <span className="block text-caption text-muted">{item.caption}</span>}
      </figcaption>
    </figure>
  );
}

export function FavouriteGroup({ section }: { section: FavouriteSection }) {
  if (section.items.length === 0) return null;

  if (section.display === 'pill') {
    return (
      <div className="grid gap-md border-b border-hairline-soft py-lg md:grid-cols-[220px_minmax(0,1fr)] md:gap-xl">
        <h3 className="text-title text-ink">{section.title}</h3>
        <ul className="flex flex-wrap gap-xs">
          {section.items.map((item) => (
            <li key={item.title} className="chip">
              {item.title}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const cols =
    section.display === 'poster'
      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
      : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6';

  return (
    <div className="grid gap-md border-b border-hairline-soft py-lg md:grid-cols-[220px_minmax(0,1fr)] md:gap-xl">
      <h3 className="text-title text-ink">{section.title}</h3>
      <ul className={`grid gap-md ${cols}`}>
        {section.items.map((item, i) => (
          <li key={`${section.id}-${item.title}-${i}`}>
            <Tile item={item} ratio={section.display === 'poster' ? 'poster' : 'portrait'} />
          </li>
        ))}
      </ul>
    </div>
  );
}
