'use client';

import { usePathname } from 'next/navigation';
import { BadgePercent, Gauge, House, Receipt, Target } from 'lucide-react';
import { t } from '../lib/copy';
import { cx } from '../lib/cx';
import { ROUTES, samePage } from '../lib/routes';
import { NavLink } from './NavLink';

const ITEMS = [
  { href: ROUTES.home, label: t.nav.home, Icon: House },
  { href: ROUTES.fee, label: t.nav.fee, Icon: Receipt },
  { href: ROUTES.profit, label: t.nav.profit, Icon: Target },
  { href: ROUTES.perps, label: t.nav.perps, Icon: Gauge },
  { href: ROUTES.referral, label: t.nav.offShort, Icon: BadgePercent },
];

/** App-style tab bar for phones and tablets; desktop uses the header nav. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label={t.nav.mobile}
      style={{ viewTransitionName: 'bottom-nav' }}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {ITEMS.map(({ href, label, Icon }, i) => {
          const active = samePage(pathname, href);
          return (
            <li key={href}>
              <NavLink
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'press flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium',
                  active ? 'text-ink' : 'text-muted hover:text-ink',
                )}
              >
                <span
                  aria-hidden
                  // named so the icon stays above the pill while it glides past (vt-tab-label in globals.css)
                  style={{ viewTransitionName: `bottom-tab-${i}` }}
                  className={cx('vt-tab-label relative flex h-7 w-12 items-center justify-center rounded-full', active && 'text-accent-ink')}
                >
                  {/* one pill that glides to the active tab between pages */}
                  {active && <span className="absolute inset-0 -z-10 rounded-full bg-accent" style={{ viewTransitionName: 'tab-indicator' }} />}
                  <Icon className="size-[18px]" />
                </span>
                {label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
