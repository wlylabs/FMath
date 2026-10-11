'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { localize } from '../lib/routes';
import { useLang } from './LangProvider';

/** next/link for in-app pages. Takes the English path and links to the page in the current language. */
export function NavLink({ href, ...props }: ComponentProps<typeof Link> & { href: string }) {
  return <Link href={localize(href, useLang())} {...props} />;
}
