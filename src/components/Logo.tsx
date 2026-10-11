/**
 * FMath mark: a percent sign whose slash cuts through both discs, so the
 * fee math reads at a glance even at favicon size.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <rect width="64" height="64" rx="16" fill="var(--accent)" />
      <circle cx="21" cy="23" r="12" fill="var(--accent-ink)" />
      <circle cx="43" cy="41" r="12" fill="var(--accent-ink)" />
      <path d="M20 55H31L44 9H33Z" fill="var(--accent-ink)" stroke="var(--accent)" strokeWidth="5" paintOrder="stroke" />
    </svg>
  );
}
