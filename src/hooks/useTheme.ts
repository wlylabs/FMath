import { useCallback } from 'react';
import { BRAND } from '../lib/brand';

export type Theme = 'light' | 'dark';

/**
 * The theme lives on <html data-theme>, set by an inline script before first
 * paint, so components style themselves with CSS and never read it in render.
 *
 * Toggling swaps the palette in one frame. Transitions are held off for that
 * frame (html.theme-switch in globals.css) so hundreds of elements do not each
 * animate their colours at once.
 */
export function useTheme() {
  const toggle = useCallback(() => {
    const root = document.documentElement;
    const next: Theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('fmath:theme', next);
    } catch {
      /* ignore */
    }
    root.classList.add('theme-switch');
    root.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? BRAND.darkBg : BRAND.lightBg);
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switch')));
  }, []);
  return { toggle };
}
