'use client';

import { Check, Share2 } from 'lucide-react';
import { t } from '../lib/copy';
import { shareLink } from '../lib/clipboard';
import { toast } from '../lib/toast';
import { useFlash } from './ui';

export function ShareButton({ getUrl }: { getUrl: () => string }) {
  const [done, flash] = useFlash();
  return (
    <button
      type="button"
      onClick={async () => {
        const result = await shareLink(getUrl(), t.share.title);
        if (result === 'copied') toast(t.share.copied);
        else if (result === 'failed') toast(t.share.failed);
        // the native share sheet is its own confirmation
        if (result === 'copied') flash();
      }}
      aria-label={t.share.label}
      title={t.share.label}
      className="press inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-medium text-ink-2 hover:border-line-strong hover:text-ink"
    >
      {done ? (
        <Check aria-hidden key="done" className="icon-in size-3.5 text-pos" />
      ) : (
        <Share2 aria-hidden key="share" className="size-3.5" />
      )}
      {t.share.button}
    </button>
  );
}
