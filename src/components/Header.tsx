'use client';

import { usePathname } from 'next/navigation';
import { ArrowUpRight, Moon, Sun } from 'lucide-react';
import { t } from '../lib/copy';
import { useTheme } from '../hooks/useTheme';
import { Logo } from './Logo';
import { cx } from '../lib/cx';
import { CALCULATOR_KEYS, ROUTES, samePage } from '../lib/routes';
import { ReferralLink } from './Referral';
import { InstallButton } from './pwa/PwaProvider';
import { NavLink } from './NavLink';
import { LangToggle } from './LangProvider';

export function Header() {
  const { toggle } = useTheme();
  const pathname = usePathname();
  const links = [
    { href: ROUTES.fee, label: t.nav.calculators, active: CALCULATOR_KEYS.some((k) => samePage(pathname, ROUTES[k])) },
    { href: ROUTES.quiz, label: t.nav.quiz, active: samePage(pathname, ROUTES.quiz) },
    { href: ROUTES.referral, label: t.nav.referral, active: samePage(pathname, ROUTES.referral) },
    { href: ROUTES.methodology, label: t.nav.method, active: samePage(pathname, ROUTES.methodology) },
    { href: ROUTES.faq, label: t.nav.faq, active: samePage(pathname, ROUTES.faq) },
  ];
  return (
    <header
      className="sticky top-0 z-40 border-b border-line bg-bg/85 pt-[env(safe-area-inset-top)] backdrop-blur-md"
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
      >
        {t.nav.skip}
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <NavLink href={ROUTES.home} className="flex items-center gap-2.5 rounded-lg" aria-label="FMath home">
          <Logo className="size-8" />
          <span className="text-base font-semibold tracking-tight text-ink">FMath</span>
        </NavLink>
        <nav aria-label={t.nav.primary} className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.href}
              href={l.href}
              // "Calculators" links to /fee/ but lights up on every calculator; only the page itself is "page"
              aria-current={samePage(pathname, l.href) ? 'page' : l.active ? 'true' : undefined}
              className={cx(
                'rounded-lg px-3 py-2 text-sm',
                l.active ? 'bg-surface-2 font-medium text-ink' : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
              )}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ReferralLink className="press inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-lg bg-accent px-2.5 text-sm font-semibold text-accent-ink hover:bg-accent-hover sm:px-3">
            {t.header.referralCta}
            {/* the arrow goes first on small phones, so the language and theme toggles keep their room */}
            <ArrowUpRight aria-hidden className="hidden size-4 min-[400px]:block" />
          </ReferralLink>
          <InstallButton />
          <LangToggle />
          <button
            type="button"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
            }}
            aria-label={t.header.toggleTheme}
            title={t.header.toggleTheme}
            className="press inline-flex size-9 items-center justify-center rounded-lg border border-line text-ink-2 hover:border-line-strong hover:text-ink"
          >
            {/* both icons render on the server; CSS picks one so the first paint matches the theme */}
            <Sun aria-hidden className="theme-icon hidden size-4 dark:block" />
            <Moon aria-hidden className="theme-icon block size-4 dark:hidden" />
          </button>
        </div>
      </div>
    </header>
  );
}
