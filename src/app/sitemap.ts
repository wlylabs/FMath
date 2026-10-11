import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/site';
import { LAST_CHECKED } from '../lib/sources';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/`, lastModified: LAST_CHECKED, changeFrequency: 'weekly', priority: 1 }];
}
