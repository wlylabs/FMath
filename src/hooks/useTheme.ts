import { useCallback } from 'react';

export type Theme = 'light' | 'dark';

/**
 * The theme lives on <html data-theme>, set by an inline script before first
 * paint, so components style themselves with CSS and never read it in render.
 */
export function useTheme() {
  const toggle = useCallback(() => {
    const root = document.documentElement;
    const next: Theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#0b0c0e' : '#f6f7f9');
    try {
      localStorage.setItem('fmath:theme', next);
    } catch {
      /* ignore */
    }
  }, []);
  return { toggle };
}
