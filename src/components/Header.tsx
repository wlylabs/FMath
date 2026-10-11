'use client';

import { Moon, Sun } from 'lucide-react';
import { t } from '../lib/copy';
import { useTheme } from '../hooks/useTheme';
import { Logo } from './Logo';

export function Header() {
  const { toggle } = useTheme();
  const links = [
    { href: '#calculator', label: t.nav.calculator },
    { href: '#methodology', label: t.nav.method },
    { href: '#faq', label: t.nav.faq },
    { href: '#sources', label: t.nav.sources },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <a
        href="#calculator"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
      >
        {t.nav.skip}
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5 rounded-lg" aria-label="FMath home">
          <Logo className="size-8" />
          <span className="text-base font-semibold tracking-tight text-ink">FMath</span>
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="#calculator"
            className="inline-flex h-9 items-center rounded-lg bg-accent px-3.5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover md:hidden"
          >
            {t.nav.calculator}
          </a>
          <button
            type="button"
            onClick={toggle}
            aria-label={t.header.toggleTheme}
            title={t.header.toggleTheme}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-line text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
          >
            {/* both icons render on the server; CSS picks one so the first paint matches the theme */}
            <Sun aria-hidden className="hidden size-4 dark:block" />
            <Moon aria-hidden className="block size-4 dark:hidden" />
          </button>
        </div>
      </div>
    </header>
  );
}
