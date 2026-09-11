import type { SiteContent } from '@/data/types';

/**
 * Runtime shape checks for every top-level content key.
 *
 * The admin console can save arbitrary JSON, and a malformed value would
 * otherwise throw during public page renders (an empty projects array hides
 * a section; `projects: "oops"` 500s the homepage). These checks run on
 * save - bad shapes are rejected at the console - and on read - a bad row
 * already in the database is skipped so the seed value survives.
 */

const isStr = (v: unknown): v is string => typeof v === 'string';
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';
const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const ARRAY_KEYS = ['stats', 'projects', 'publications', 'journey', 'testimonials', 'blog'];
const OBJECT_KEYS = ['meta', 'identity', 'hero', 'about', 'skills', 'personal', 'contact', 'resume', 'footer', 'settings'];

export function validateSection(key: string, value: unknown): string | null {
  if (ARRAY_KEYS.includes(key)) {
    if (!Array.isArray(value)) return `${key} must be a list.`;
    for (const [i, item] of value.entries()) {
      if (key === 'projects') {
        if (!isObj(item)) return `projects[${i}] must be an object.`;
        if (!isStr(item.slug) || !item.slug) return `projects[${i}].slug must be a non-empty string.`;
        if (!isStr(item.name)) return `projects[${i}].name must be a string.`;
      } else if (key === 'blog') {
        if (!isObj(item)) return `blog[${i}] must be an object.`;
        if (!isStr(item.slug) || !item.slug) return `blog[${i}].slug must be a non-empty string.`;
        if (!isBool(item.published)) return `blog[${i}].published must be true or false.`;
      } else if (key === 'stats') {
        if (!isObj(item) || !isStr(item.value) || !isStr(item.label))
          return `stats[${i}] needs a value and a label.`;
      } else if (key === 'publications') {
        if (!isObj(item) || !isStr(item.title)) return `publications[${i}].title must be a string.`;
      } else if (key === 'journey') {
        if (!isObj(item) || !isStr(item.year) || !isStr(item.title))
          return `journey[${i}] needs a year and a title.`;
      } else if (key === 'testimonials') {
        if (!isObj(item) || !isStr(item.quote)) return `testimonials[${i}].quote must be a string.`;
      }
    }
    if (key === 'projects') {
      const slugs = value.map((p) => (isObj(p) ? p.slug : null)).filter(isStr);
      if (new Set(slugs).size !== slugs.length) return 'Two projects share the same slug.';
    }
    return null;
  }

  if (OBJECT_KEYS.includes(key)) {
    if (!isObj(value)) return `${key} must be an object.`;
    switch (key) {
      case 'meta':
        if (!isStr(value.title)) return 'meta.title must be a string.';
        break;
      case 'identity':
        if (!isStr(value.name) || !isStr(value.email)) return 'identity needs a name and an email.';
        break;
      case 'hero':
        if (!Array.isArray(value.ctas)) return 'hero.ctas must be a list.';
        break;
      case 'skills':
        if (!Array.isArray(value.groups)) return 'skills.groups must be a list.';
        break;
      case 'personal':
        if (!Array.isArray(value.sections)) return 'personal.sections must be a list.';
        break;
      case 'contact':
        if (!Array.isArray(value.socials)) return 'contact.socials must be a list.';
        break;
      case 'resume':
        if (!isStr(value.file)) return 'resume.file must be a string.';
        break;
      case 'footer':
        if (!isStr(value.line)) return 'footer.line must be a string.';
        break;
      case 'settings':
        if (!isBool(value.backgroundArt)) return 'settings.backgroundArt must be true or false.';
        break;
    }
    return null;
  }

  return `Unknown section "${key}".`;
}

export function isValidSection(key: string, value: unknown): boolean {
  return validateSection(key, value) === null;
}
