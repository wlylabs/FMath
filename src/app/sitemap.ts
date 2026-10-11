import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/site';
import { LAST_CHECKED } from '../lib/sources';
import { LANGS } from '../lib/copy';
import { localize, ROUTES } from '../lib/routes';
import { languageAlternates } from '../lib/seo';

export const dynamic = 'force-static';

const PRIORITY: Record<keyof typeof ROUTES, number> = {
  landing: 1,
  home: 0.9,
  fee: 0.9,
  profit: 0.9,
  perps: 0.9,
  quiz: 0.7,
  referral: 0.7,
  methodology: 0.6,
  faq: 0.5,
  privacy: 0.3,
  disclaimer: 0.3,
};

/** Every page in every language, each listing its translations for hreflang. */
export default function sitemap(): MetadataRoute.Sitemap {
  return (Object.keys(ROUTES) as (keyof typeof ROUTES)[]).flatMap((key) => {
    const languages = Object.fromEntries(
      Object.entries(languageAlternates(ROUTES[key])).map(([lang, path]) => [lang, `${SITE_URL}${path}`]),
    );
    return LANGS.map((lang) => ({
      url: `${SITE_URL}${localize(ROUTES[key], lang)}`,
      lastModified: LAST_CHECKED,
      changeFrequency: 'weekly' as const,
      priority: PRIORITY[key],
      alternates: { languages },
    }));
  });
}
