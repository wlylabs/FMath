'use client';

import { useSyncExternalStore } from 'react';
import { X } from 'lucide-react';
import { dismissToast, getServerToasts, getToasts, subscribeToasts } from '../lib/toast';

export function Toaster() {
  const items = useSyncExternalStore(subscribeToasts, getToasts, getServerToasts);
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-[calc(4.75rem+env(safe-area-inset-top))] z-50 flex flex-col items-center gap-2 px-4"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="toast-in pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border border-line-strong bg-surface px-4 py-3 text-sm text-ink shadow-xl"
        >
          <span className="min-w-0 flex-1">{item.message}</span>
          {item.action && (
            <button
              type="button"
              onClick={() => {
                item.action?.onClick();
                dismissToast(item.id);
              }}
              className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-ink hover:bg-accent-hover"
            >
              {item.action.label}
            </button>
          )}
          <button
            type="button"
            onClick={() => dismissToast(item.id)}
            aria-label="Dismiss"
            className="-mr-1 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted hover:text-ink"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
