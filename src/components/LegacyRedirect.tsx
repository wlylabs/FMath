'use client';

import { useEffect } from 'react';
import { CALCULATOR_KEYS, ROUTES } from '../lib/routes';

/** Links shared before the calculators had their own pages looked like /?tab=fee&amount=100. */
export function LegacyRedirect() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = CALCULATOR_KEYS.find((k) => k === params.get('tab'));
    if (!tab) return;
    params.delete('tab');
    const query = params.toString();
    window.location.replace(ROUTES[tab] + (query ? `?${query}` : ''));
  }, []);
  return null;
}
