'use client';

import { RotateCcw } from 'lucide-react';
import { Logo } from '../components/Logo';
import { t } from '../lib/copy';

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60svh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <Logo className="size-12" />
      <h1 className="mt-8 text-3xl font-semibold tracking-tight text-ink">{t.error.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-2">{t.error.body}</p>
      <button
        type="button"
        onClick={() => retry()}
        className="press mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-accent-ink hover:bg-accent-hover"
      >
        <RotateCcw aria-hidden className="size-4" />
        {t.error.retry}
      </button>
    </div>
  );
}
