import type { ReactNode } from 'react';
import { CREATOR } from '../lib/site';
import { t } from '../lib/copy';
import { cx } from '../lib/cx';

/** The X wordmark, for links to the creator's profile. */
export function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/** Monogram rather than a hotlinked profile photo, so it never breaks or goes stale. */
export function CreatorAvatar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-accent-ink font-semibold text-accent ring-1 ring-line-strong',
        className ?? 'size-12 text-lg',
      )}
    >
      {CREATOR.name.slice(0, 1)}
    </span>
  );
}

export function CreatorLink(props: { className?: string; children: ReactNode; 'aria-label'?: string }) {
  return (
    <a href={CREATOR.url} target="_blank" rel="noopener me" aria-label={props['aria-label']} className={props.className}>
      {props.children}
    </a>
  );
}

export function CreatorCard() {
  return (
    <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <CreatorAvatar />
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{t.creator.label}</p>
          <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
            <span className="text-base font-semibold text-ink">{CREATOR.name}</span>
            <span className="num text-sm text-ink-2">{CREATOR.handle}</span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-2">{t.creator.body}</p>
        </div>
      </div>
      <CreatorLink
        aria-label={t.creator.followLabel(CREATOR.handle)}
        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
      >
        <XIcon className="size-4" />
        {t.creator.follow}
      </CreatorLink>
    </div>
  );
}
