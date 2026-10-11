import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '../components/Logo';
import { t } from '../lib/copy';
import { ROUTES } from '../lib/routes';

export const metadata: Metadata = {
  title: `${t.notFound.title} · FMath`,
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[100svh] max-w-md flex-col items-center justify-center px-4 text-center">
      <Logo className="size-12" />
      <p className="num mt-8 text-sm text-muted">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">{t.notFound.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-2">{t.notFound.body}</p>
      <Link
        href={ROUTES.fee}
        className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
      >
        {t.notFound.cta}
      </Link>
    </main>
  );
}
