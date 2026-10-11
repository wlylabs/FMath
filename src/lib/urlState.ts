/**
 * Shared calculation links: /?tab=fee&chain=solana&amount=100#calculator.
 *
 * The query string is read once when this module loads in the browser, so
 * every calculator sees the same snapshot even after the address bar is
 * cleaned up. Each consumer takes its slice once; remounting a tab later
 * keeps whatever the user edited since.
 */

const snapshot: URLSearchParams | null =
  typeof window === 'undefined' ? null : new URLSearchParams(window.location.search);
const consumed = new Set<string>();

/** Params for `tab` (or any param set when `tab` is omitted), once per scope. */
export function takeUrlState(tab: string | null, scope: string = tab ?? 'tab'): URLSearchParams | null {
  if (!snapshot || consumed.has(scope)) return null;
  if (tab === null ? !snapshot.has('tab') : snapshot.get('tab') !== tab) return null;
  consumed.add(scope);
  return snapshot;
}

/** Drops the query string from the address bar, keeping the hash. */
export function cleanUrl() {
  if (typeof window === 'undefined' || !window.location.search) return;
  window.history.replaceState(window.history.state, '', window.location.pathname + window.location.hash);
}

type Primitive = string | number | boolean;

/**
 * Reads the primitive fields of `initial` from the query. Strings named in
 * `enums` must be one of the listed values; other strings are numeric inputs
 * and keep only characters an amount field accepts.
 */
export function primitivesFrom<T extends object>(
  initial: T,
  params: URLSearchParams,
  enums: Partial<Record<keyof T, readonly string[]>> = {},
): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(initial) as (keyof T & string)[]) {
    const raw = params.get(key);
    if (raw === null) continue;
    const current = initial[key] as unknown;
    let value: Primitive | undefined;
    if (typeof current === 'boolean') value = raw === '1' || raw === 'true';
    else if (typeof current === 'number') {
      const n = Number(raw);
      value = Number.isFinite(n) ? n : undefined;
    } else if (typeof current === 'string') {
      const allowed = enums[key];
      value = allowed ? (allowed.includes(raw) ? raw : undefined) : raw.replace(/[^\d.,-]/g, '').slice(0, 32);
    }
    if (value !== undefined) (out as Record<string, Primitive>)[key] = value;
  }
  return out;
}

/** Absolute link that reopens the calculator with these inputs. */
export function buildShareUrl(tab: string, fields: Record<string, Primitive | null | undefined>): string {
  const url = new URL(window.location.pathname, window.location.origin);
  url.searchParams.set('tab', tab);
  for (const [k, v] of Object.entries(fields)) {
    if (v === null || v === undefined || v === '') continue;
    url.searchParams.set(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v));
  }
  url.hash = 'calculator';
  return url.toString();
}
