import type { ReactNode } from 'react';

/**
 * Fades page content in after a client-side navigation. Plain CSS on the new
 * page only (.page-in in globals.css): no snapshot of the old page, so a tap
 * on a tab never waits on the animation and slow phones stay smooth.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return <div className="page-in">{children}</div>;
}
