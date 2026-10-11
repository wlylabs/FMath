'use client';

import type { ReactNode } from 'react';
import { t } from '../lib/copy';
import { cx } from '../lib/cx';
import { CALCULATOR_KEYS, ROUTES, type CalculatorKey } from '../lib/routes';
import { UrlCleaner } from './UrlCleaner';
import { NavLink } from './NavLink';
import { SwipeNav } from './SwipeNav';

/**
 * Shared frame for the three calculator pages: switcher (desktop), heading,
 * then the tool. On touch screens a sideways swipe moves between them.
 */
export function CalculatorPage({ active, children }: { active: CalculatorKey; children: ReactNode }) {
  const page = t.calc.pages[active];
  return (
    <SwipeNav className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:pb-16">
      <UrlCleaner />
      {/* phones and tablets switch calculators from the bottom nav */}
      <nav
        aria-label={t.calc.tabsLabel}
        className="mb-6 hidden w-fit grid-cols-3 gap-1 rounded-xl border border-line bg-surface p-1 lg:grid"
      >
        {CALCULATOR_KEYS.map((key) => (
          <NavLink
            key={key}
            href={ROUTES[key]}
            aria-current={key === active ? 'page' : undefined}
            className={cx(
              'flex h-10 min-w-36 items-center justify-center rounded-lg px-4 text-sm font-semibold',
              key === active ? 'bg-ink text-bg' : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
            )}
          >
            {t.calc.tabs[key]}
          </NavLink>
        ))}
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{page.title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2">{page.lead}</p>
      <div className="mt-6">{children}</div>
    </SwipeNav>
  );
}
