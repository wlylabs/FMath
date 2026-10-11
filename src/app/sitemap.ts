import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/site';
import { LAST_CHECKED } from '../lib/sources';
import { ROUTES } from '../lib/routes';

export const dynamic = 'force-static';

const PRIORITY: Record<keyof typeof ROUTES, number> = {
  home: 1,
  fee: 0.9,
  profit: 0.9,
  perps: 0.9,
  referral: 0.7,
  methodology: 0.6,
  faq: 0.5,
};

export default function sitemap(): MetadataRoute.Sitemap {
  return (Object.keys(ROUTES) as (keyof typeof ROUTES)[]).map((key) => ({
    url: `${SITE_URL}${ROUTES[key]}`,
    lastModified: LAST_CHECKED,
    changeFrequency: 'weekly',
    priority: PRIORITY[key],
  }));
}
