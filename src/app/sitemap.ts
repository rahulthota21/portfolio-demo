import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContent();
  const base = process.env.NEXT_PUBLIC_SITE_URL || content.meta.url;
  const now = new Date();

  const staticRoutes = ['', '/beyond-code', '/resume'].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.7,
  }));

  const projectRoutes = content.projects
    .filter((p) => p.published)
    .map((p) => ({
      url: `${base}/work/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));

  const writingRoutes = content.blog
    .filter((p) => p.published)
    .map((p) => ({
      url: `${base}/writing/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...projectRoutes, ...writingRoutes];
}
