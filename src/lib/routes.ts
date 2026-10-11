/** Every page, with the trailing slash the static export serves it under. */
export const ROUTES = {
  home: '/',
  fee: '/fee/',
  profit: '/profit/',
  perps: '/perps/',
  referral: '/referral/',
  methodology: '/methodology/',
  faq: '/faq/',
} as const;

export type CalculatorKey = 'fee' | 'profit' | 'perps';

export const CALCULATOR_KEYS: readonly CalculatorKey[] = ['fee', 'profit', 'perps'];

/** "/fee", "/fee/" and "/fee/index.html" are the same page. */
export function samePage(a: string, b: string): boolean {
  const norm = (p: string) => p.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
  return norm(a) === norm(b);
}
