/** Every page, with the trailing slash the static export serves it under. */
export const ROUTES = {
  /** Static landing page, served without the app shell (src/app/index.html/route.ts). */
  landing: '/',
  home: '/home/',
  fee: '/fee/',
  profit: '/profit/',
  perps: '/perps/',
  quiz: '/quiz/',
  referral: '/referral/',
  methodology: '/methodology/',
  faq: '/faq/',
  privacy: '/privacy/',
  disclaimer: '/disclaimer/',
} as const;

export type CalculatorKey = 'fee' | 'profit' | 'perps';

export const CALCULATOR_KEYS: readonly CalculatorKey[] = ['fee', 'profit', 'perps'];

/** Indonesian pages live under this prefix: /id/, /id/fee/ and so on. English has none. */
export const ID_PREFIX = '/id';

const ID_PATH = /^\/id(?=\/|$|\?|#)/;

/** Language a path is in, from its prefix. */
export function langOfPath(path: string): 'en' | 'id' {
  return ID_PATH.test(path) ? 'id' : 'en';
}

/** The English path of a page, whichever language the path is in. */
export function unlocalize(path: string): string {
  const rest = path.replace(ID_PATH, '');
  return rest.startsWith('/') ? rest : '/' + rest;
}

/** A path in the given language. Only in-app paths (starting with one slash) change. */
export function localize(path: string, lang: 'en' | 'id'): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const en = unlocalize(path);
  return lang === 'id' ? ID_PREFIX + en : en;
}

/** "/fee", "/fee/", "/fee/index.html" and "/id/fee/" are the same page. */
export function samePage(a: string, b: string): boolean {
  const norm = (p: string) => unlocalize(p).replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
  return norm(a) === norm(b);
}

/** Neighbouring calculator for a swipe, if any. */
export function adjacentCalculator(path: string, step: 1 | -1): string | null {
  const i = CALCULATOR_KEYS.findIndex((k) => samePage(ROUTES[k], path));
  if (i === -1) return null;
  const next = CALCULATOR_KEYS[i + step];
  return next ? localize(ROUTES[next], langOfPath(path)) : null;
}

/**
 * Sections of the old single page, which installed shortcuts and shared links
 * still point at as /#referral. The landing page redirects them.
 */
export const LEGACY_HASHES: Record<string, string> = {
  '#calculator': ROUTES.fee,
  '#referral': ROUTES.referral,
  '#methodology': ROUTES.methodology,
  '#sources': `${ROUTES.methodology}#sources`,
  '#faq': ROUTES.faq,
};
