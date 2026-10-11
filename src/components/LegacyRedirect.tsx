'use client';

import { useEffect } from 'react';
import { CALCULATOR_KEYS, ROUTES } from '../lib/routes';

/** Sections of the old single page, which installed shortcuts and shared links still point at. */
const LEGACY_HASHES: Record<string, string> = {
  '#calculator': ROUTES.fee,
  '#referral': ROUTES.referral,
  '#methodology': ROUTES.methodology,
  '#sources': `${ROUTES.methodology}#sources`,
  '#faq': ROUTES.faq,
};

/**
 * Links shared before the calculators had their own pages looked like
 * /?tab=fee&amount=100 or /#referral. Mounted on the home page only.
 */
export function LegacyRedirect() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = CALCULATOR_KEYS.find((k) => k === params.get('tab'));
    if (tab) {
      params.delete('tab');
      const query = params.toString();
      window.location.replace(ROUTES[tab] + (query ? `?${query}` : ''));
      return;
    }
    const target = LEGACY_HASHES[window.location.hash];
    if (!target) return;
    const [path, hash] = target.split('#');
    window.location.replace(path + window.location.search + (hash ? `#${hash}` : ''));
  }, []);
  return null;
}
