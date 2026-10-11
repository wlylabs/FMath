'use client';

import { useEffect, useState, type ReactNode, type RefObject } from 'react';
import { ChevronDown } from 'lucide-react';
import { t } from '../lib/copy';
import { cx } from '../lib/cx';
import { prefersReducedMotion, SwapValue } from './ui';

/**
 * Bottom bar on small screens that keeps the headline result in view while
 * the inputs are being edited. Tapping it scrolls to the full breakdown.
 */
export function MobileSummary(props: {
  resultsRef: RefObject<HTMLElement | null>;
  containerRef: RefObject<HTMLElement | null>;
  label: ReactNode;
  value?: ReactNode;
  detail?: ReactNode;
  tone?: 'pos' | 'neg';
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const results = props.resultsRef.current;
    const container = props.containerRef.current;
    if (!results || !container || typeof IntersectionObserver === 'undefined') return;
    let resultsVisible = true;
    let resultsBelow = false;
    let containerVisible = false;
    const io = new IntersectionObserver(
      (entries) => {
      for (const e of entries) {
        if (e.target === results) {
          resultsVisible = e.isIntersecting;
          resultsBelow = e.boundingClientRect.top > 0;
        } else if (e.target === container) {
          containerVisible = e.isIntersecting;
        }
      }
        setShow(containerVisible && !resultsVisible && resultsBelow);
      },
      // the bottom tab bar covers the last 64px; results under it are not in view yet
      { rootMargin: '0px 0px -80px 0px' },
    );
    io.observe(results);
    io.observe(container);
    return () => io.disconnect();
  }, [props.resultsRef, props.containerRef]);

  // keyboard focus and anchors stop above the bar while it shows (scroll-padding in globals.css);
  // a class instead of html:has(), which the browser would re-check on every DOM change
  useEffect(() => {
    document.documentElement.classList.toggle('summary-shown', show);
    return () => document.documentElement.classList.remove('summary-shown');
  }, [show]);

  return (
    <div
      inert={!show}
      aria-hidden={!show}
      className={cx(
        // sits just above the bottom nav, which is also hidden from lg up; rises
        // in with the drawer curve, drops away faster than it came
        'fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 px-3 pb-2 transition-transform lg:hidden',
        show
          ? 'translate-y-0 duration-[var(--dur-slow)] ease-[var(--ease-drawer)]'
          : 'pointer-events-none translate-y-[calc(100%+6rem)] duration-200 ease-[var(--ease-exit)]',
      )}
    >
      <button
        type="button"
        onClick={() => props.resultsRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })}
        className="press-soft flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-left shadow-xl"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[11px] text-muted">{props.label}</span>
          {props.value !== undefined && (
            <span className="flex items-baseline gap-2">
              <span
                className={cx(
                  'num text-base font-semibold',
                  props.tone === 'pos' ? 'text-pos' : props.tone === 'neg' ? 'text-neg' : 'text-ink',
                )}
              >
                {typeof props.value === 'string' ? <SwapValue value={props.value} /> : props.value}
              </span>
              {props.detail && <span className="num truncate text-xs text-ink-2">{props.detail}</span>}
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-ink-2">
          {/* on the narrowest phones the chevron alone leaves room for the numbers */}
          <span className="max-[359px]:sr-only">{t.common.seeResults}</span>
          <ChevronDown aria-hidden className="size-4" />
        </span>
      </button>
    </div>
  );
}
