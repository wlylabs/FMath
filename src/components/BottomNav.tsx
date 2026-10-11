'use client';

import { usePathname } from 'next/navigation';
import { BadgePercent, Gauge, House, Receipt, Target } from 'lucide-react';
import { t } from '../lib/copy';
import { cx } from '../lib/cx';
import { ROUTES, samePage } from '../lib/routes';
import { NavLink } from './NavLink';

const ITEMS: { href: string; label: 'home' | 'fee' | 'profit' | 'perps' | 'offShort'; Icon: typeof House }[] = [
  { href: ROUTES.home, label: 'home', Icon: House },
  { href: ROUTES.fee, label: 'fee', Icon: Receipt },
  { href: ROUTES.profit, label: 'profit', Icon: Target },
  { href: ROUTES.perps, label: 'perps', Icon: Gauge },
  { href: ROUTES.referral, label: 'offShort', Icon: BadgePercent },
];

/** App-style tab bar for phones and tablets; desktop uses the header nav. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label={t.nav.mobile}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = samePage(pathname, href);
          return (
            <li key={href}>
              <NavLink
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium',
                  active ? 'text-ink' : 'text-muted hover:text-ink',
                )}
              >
                <span
                  aria-hidden
                  className={cx('flex h-7 w-12 items-center justify-center rounded-full', active && 'bg-accent text-accent-ink')}
                >
                  <Icon className="size-[18px]" />
                </span>
                {t.nav[label]}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
