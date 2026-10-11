import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

function current(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(current);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b0c0e' : '#f6f7f9');
  }, [theme]);
  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('fmath:theme', next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);
  return { theme, toggle };
}
