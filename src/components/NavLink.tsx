import Link from 'next/link';
import type { ComponentProps } from 'react';

/** next/link for in-app pages. Navigation swaps pages instantly, without a transition. */
export function NavLink(props: ComponentProps<typeof Link> & { href: string }) {
  return <Link {...props} />;
}
