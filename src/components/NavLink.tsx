'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';

/** next/link for in-app pages. */
export function NavLink(props: ComponentProps<typeof Link> & { href: string }) {
  return <Link {...props} />;
}
