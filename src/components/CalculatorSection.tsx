'use client';

import { useEffect, useId, useRef, type KeyboardEvent } from 'react';
import { t } from '../lib/copy';
import { cx } from '../lib/cx';
import { usePersistentState } from '../hooks/usePersistentState';
import { cleanUrl } from '../lib/urlState';
import { FeeCalculator } from './calculators/FeeCalculator';
import { ProfitCalculator } from './calculators/ProfitCalculator';
import { PerpsCalculator } from './calculators/PerpsCalculator';

type Tab = 'fee' | 'profit' | 'perps';
const TABS: Tab[] = ['fee', 'profit', 'perps'];

export function CalculatorSection() {
  const [tab, setTab] = usePersistentState<Tab>('tab', 'fee', {
    tab: null,
    fromUrl: (params) => TABS.find((x) => x === params.get('tab')),
  });
  // every calculator has its own copy of the shared link by now; tidy the address bar
  useEffect(() => cleanUrl(), []);
  const current: Tab = TABS.includes(tab) ? tab : 'fee';
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    const target = e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1 : (i + delta + TABS.length) % TABS.length;
    if (!delta && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    setTab(TABS[target]!);
    refs.current[target]?.focus();
  };

  return (
    <section id="calculator" className="border-y border-line bg-surface-2/40 py-12 sm:py-16" aria-labelledby={`${base}-title`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id={`${base}-title`} className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {t.calc.title}
            </h2>
            <p className="mt-2 text-sm text-ink-2">{t.calc.lead}</p>
          </div>
        </div>
        <div
          role="tablist"
          aria-label={t.calc.tabsLabel}
          className="mt-6 grid grid-cols-3 gap-1 rounded-xl border border-line bg-surface p-1 sm:inline-grid sm:w-auto sm:min-w-[480px]"
        >
          {TABS.map((id, i) => {
            const selected = id === current;
            return (
              <button
                key={id}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                id={`${base}-tab-${id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${base}-panel-${id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(id)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={cx(
                  'h-11 rounded-lg px-2 text-[13px] font-semibold transition-colors sm:px-4 sm:text-sm',
                  selected ? 'bg-ink text-bg' : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
                )}
              >
                {t.calc.tabs[id]}
              </button>
            );
          })}
        </div>
        <div
          id={`${base}-panel-${current}`}
          role="tabpanel"
          aria-labelledby={`${base}-tab-${current}`}
          className="mt-5"
        >
          {current === 'fee' && <FeeCalculator />}
          {current === 'profit' && <ProfitCalculator />}
          {current === 'perps' && <PerpsCalculator />}
        </div>
      </div>
    </section>
  );
}
