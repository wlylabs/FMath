import type { Metadata } from 'next';
import { en, type Copy, type Lang } from './copy';
import { id } from './copy.id';
import { localize, ROUTES } from './routes';
import { BASE_OPEN_GRAPH } from './site';

/**
 * Page metadata in both languages, for the server-rendered pages under app/
 * and app/id/. Server modules only: it imports the Indonesian copy directly,
 * which the client bundle loads on demand instead.
 */

export type PageKey = Exclude<keyof typeof ROUTES, 'landing'>;

const COPIES: Record<Lang, Copy> = { en, id };

const OG_LOCALE: Record<Lang, string> = { en: 'en_US', id: 'id_ID' };

/** Title (without the " · FMath" suffix) and description of each page. Home uses the site's own. */
const PAGES: Record<PageKey, (c: Copy) => { title?: string; description: string }> = {
  home: (c) => ({ description: c.meta.description }),
  fee: (c) => ({ title: c.calc.pages.fee.title, description: c.calc.pages.fee.lead }),
  profit: (c) => ({ title: c.calc.pages.profit.title, description: c.calc.pages.profit.lead }),
  perps: (c) => ({ title: c.calc.pages.perps.title, description: c.calc.pages.perps.lead }),
  quiz: (c) => ({ title: c.quiz.title, description: c.quiz.lead }),
  referral: (c) => ({ title: c.referral.headline, description: c.referral.lead }),
  methodology: (c) => ({ title: c.method.title, description: c.method.lead }),
  faq: (c) => ({ title: c.faq.title, description: c.faq.description }),
  privacy: (c) => ({ title: c.legal.privacy.title, description: c.legal.privacy.lead }),
  disclaimer: (c) => ({ title: c.legal.disclaimer.title, description: c.legal.disclaimer.lead }),
};

/** hreflang alternates for a page: English is the default for every other language. */
export function languageAlternates(path: string): Record<string, string> {
  const enPath = localize(path, 'en');
  return { en: enPath, id: localize(path, 'id'), 'x-default': enPath };
}

export function pageMetadata(key: PageKey, lang: Lang): Metadata {
  const c = COPIES[lang];
  const { title, description } = PAGES[key](c);
  const url = localize(ROUTES[key], lang);
  return {
    // home has no page title of its own, so it takes the full site title without the suffix
    title: title ?? { absolute: c.meta.title },
    description,
    alternates: { canonical: url, languages: languageAlternates(ROUTES[key]) },
    openGraph: {
      ...BASE_OPEN_GRAPH,
      title: title ?? c.meta.title,
      description,
      url,
      locale: OG_LOCALE[lang],
      alternateLocale: OG_LOCALE[lang === 'id' ? 'en' : 'id'],
    },
  };
}
