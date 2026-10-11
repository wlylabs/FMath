export type Locale = 'id' | 'en';

const tag = (l: Locale) => (l === 'id' ? 'id-ID' : 'en-US');
const cache = new Map<string, Intl.NumberFormat>();

function nf(locale: Locale, opts: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = locale + JSON.stringify(opts);
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(tag(locale), opts);
    cache.set(key, f);
  }
  return f;
}

/** USD amounts. Sub-cent values keep enough digits to stay meaningful. */
export function usd(n: number, locale: Locale, opts: { signed?: boolean } = {}): string {
  if (!Number.isFinite(n)) return '-';
  const abs = Math.abs(n);
  const digits = abs > 0 && abs < 0.01 ? 4 : 2;
  const s = nf(locale, {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
    signDisplay: opts.signed ? 'exceptZero' : 'auto',
  }).format(n);
  return s;
}

export function compactUsd(n: number | null | undefined, locale: Locale): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '-';
  return nf(locale, {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n);
}

/** Fraction to percent: 0.0195 -> "1.95%". */
export function pct(n: number | null | undefined, locale: Locale, opts: { digits?: number; signed?: boolean } = {}): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '-';
  const digits = opts.digits ?? 2;
  return nf(locale, {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: opts.signed ? 'exceptZero' : 'auto',
  }).format(n);
}

/** Prices from $90,000 BTC down to $0.000004 memecoins. */
export function price(n: number | null | undefined, locale: Locale): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '-';
  const abs = Math.abs(n);
  const opts: Intl.NumberFormatOptions =
    abs >= 1000
      ? { maximumFractionDigits: 2, minimumFractionDigits: 2 }
      : abs >= 1
        ? { maximumFractionDigits: 4, minimumFractionDigits: 2 }
        : { maximumSignificantDigits: 4, minimumSignificantDigits: 2 };
  return '$' + nf(locale, opts).format(n);
}

export function num(n: number, locale: Locale, digits = 2): string {
  if (!Number.isFinite(n)) return '-';
  return nf(locale, { maximumFractionDigits: digits }).format(n);
}

export function multiple(n: number, locale: Locale): string {
  if (!Number.isFinite(n)) return '-';
  const digits = n < 10 ? 3 : n < 100 ? 2 : 1;
  return nf(locale, { maximumFractionDigits: digits, minimumFractionDigits: Math.min(2, digits) }).format(n) + 'x';
}

export function time(ts: number, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(ts);
}

export function date(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(iso + 'T00:00:00Z'),
  );
}

/**
 * Parses what people type into amount fields: "1250", "1250.5", "1250,5",
 * "1.250,50", "1,250.50" and "1.250.000" all work. When both separators
 * appear the last one is the decimal mark; a separator that repeats is
 * grouping; a single lone separator is always the decimal mark, whatever the
 * UI language, so saved inputs read the same after switching languages.
 */
export function parseAmount(raw: string): number {
  const s = raw.replace(/[\s$%_]/g, '');
  if (!s) return NaN;
  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');
  let normalized = s;
  if (lastDot !== -1 && lastComma !== -1) {
    const dec = lastDot > lastComma ? '.' : ',';
    const group = dec === '.' ? ',' : '.';
    normalized = s.split(group).join('').replace(dec, '.');
  } else if (lastDot !== -1 || lastComma !== -1) {
    const parts = s.split(lastDot !== -1 ? '.' : ',');
    normalized = parts.length > 2 ? parts.join('') : parts.join('.');
  }
  if (!/^\d*\.?\d*$/.test(normalized) || normalized === '.') return NaN;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

/** "1.250" or "1,250" could be read either way; the UI echoes how it was read. */
export function isAmbiguousAmount(raw: string): boolean {
  return /^[1-9]\d{0,2}[.,]\d{3}$/.test(raw.trim());
}

/** Shortens long mint/contract addresses for display. */
export function shortAddress(a: string): string {
  return a.length > 12 ? `${a.slice(0, 4)}...${a.slice(-4)}` : a;
}
