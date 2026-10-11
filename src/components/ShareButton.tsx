'use client';

import { Share2 } from 'lucide-react';
import { t } from '../lib/copy';
import { shareLink } from '../lib/clipboard';
import { toast } from '../lib/toast';

export function ShareButton({ getUrl }: { getUrl: () => string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        const result = await shareLink(getUrl(), t.share.title);
        if (result === 'copied') toast(t.share.copied);
        else if (result === 'failed') toast(t.share.failed);
      }}
      aria-label={t.share.label}
      title={t.share.label}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
    >
      <Share2 aria-hidden className="size-3.5" />
      {t.share.button}
    </button>
  );
}
