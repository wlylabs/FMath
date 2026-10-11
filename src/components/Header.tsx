import { Moon, Sun } from 'lucide-react';
import { useI18n } from '../i18n/I18n';
import { useTheme } from '../hooks/useTheme';
import type { Locale } from '../lib/format';
import { cx } from './ui';

/**
 * FMath mark: a percent sign whose slash cuts through both discs, so the
 * fee math reads at a glance even at favicon size.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <rect width="64" height="64" rx="16" fill="var(--accent)" />
      <circle cx="21" cy="23" r="12" fill="var(--accent-ink)" />
      <circle cx="43" cy="41" r="12" fill="var(--accent-ink)" />
      <path d="M20 55H31L44 9H33Z" fill="var(--accent-ink)" stroke="var(--accent)" strokeWidth="5" paintOrder="stroke" />
    </svg>
  );
}

export function Header() {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggle } = useTheme();
  const links = [
    { href: '#kalkulator', label: t.nav.calculator },
    { href: '#cara-hitung', label: t.nav.method },
    { href: '#faq', label: t.nav.faq },
    { href: '#sumber', label: t.nav.sources },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <a
        href="#kalkulator"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
      >
        {t.nav.skip}
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5 rounded-lg" aria-label="FMath">
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
          <div role="group" aria-label={t.header.language} className="flex h-9 items-center rounded-lg border border-line p-0.5">
            {(['id', 'en'] as Locale[]).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={locale === l}
                onClick={() => setLocale(l)}
                className={cx(
                  'h-full rounded-md px-2.5 text-xs font-semibold uppercase transition-colors',
                  locale === l ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink',
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? t.header.toLight : t.header.toDark}
            title={theme === 'dark' ? t.header.toLight : t.header.toDark}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-line text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
          >
            {theme === 'dark' ? <Sun aria-hidden className="size-4" /> : <Moon aria-hidden className="size-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
