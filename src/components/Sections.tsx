import { useId, useRef, type KeyboardEvent } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { useI18n } from '../i18n/I18n';
import { usePersistentState } from '../hooks/usePersistentState';
import { LAST_CHECKED, SOURCES } from '../lib/sources';
import { date } from '../lib/format';
import { FeeCalculator } from './calculators/FeeCalculator';
import { ProfitCalculator } from './calculators/ProfitCalculator';
import { PerpsCalculator } from './calculators/PerpsCalculator';
import { BandTable } from './BandTable';
import { Logo } from './Header';
import { cx } from './ui';

type Tab = 'fee' | 'profit' | 'perps';
const TABS: Tab[] = ['fee', 'profit', 'perps'];

export function CalculatorSection() {
  const { t } = useI18n();
  const [tab, setTab] = usePersistentState<Tab>('tab', 'fee');
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
    <section id="kalkulator" className="border-y border-line bg-surface-2/40 py-12 sm:py-16" aria-labelledby={`${base}-title`}>
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

export function Methodology() {
  const { t, locale } = useI18n();
  return (
    <section id="cara-hitung" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20" aria-labelledby="method-title">
      <h2 id="method-title" className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {t.method.title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2 sm:text-base">{t.method.lead}</p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="card p-5 sm:p-6">
          <h3 className="text-base font-semibold text-ink">{t.method.spotTitle}</h3>
          <p className="mt-4 text-sm font-medium text-ink">{t.method.solanaTitle}</p>
          <div className="mt-2.5">
            <BandTable chain="solana" tokenClass="standard" referral={false} caption={t.method.solanaTitle} />
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-ink">{t.method.otherTitle}</dt>
              <dd className="mt-1 text-ink-2">{t.method.otherBody}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">{t.method.majorTitle}</dt>
              <dd className="mt-1 text-ink-2">{t.method.majorBody}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Referral</dt>
              <dd className="mt-1 text-ink-2">{t.method.referralBody}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">{t.common.sell}</dt>
              <dd className="mt-1 text-ink-2">{t.method.minSell}</dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-4">
          <div className="card p-5 sm:p-6">
            <h3 className="text-base font-semibold text-ink">{t.method.formulasTitle}</h3>
            <dl className="mt-4 divide-y divide-line">
              {t.method.formulas.map((f) => (
                <div key={f.name} className="py-3 first:pt-0 last:pb-0">
                  <dt className="text-xs font-medium text-muted">{f.name}</dt>
                  <dd className="num mt-1 break-words text-[13px] leading-relaxed text-ink">{f.expr}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card p-5 sm:p-6">
            <h3 className="text-base font-semibold text-ink">{t.method.perpsTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{t.method.perpsBody}</p>
          </div>
        </div>
      </div>

      <div id="sumber" className="mt-4 card p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base font-semibold text-ink">{t.method.sourcesTitle}</h3>
          <p className="text-xs text-muted">{t.method.checked(date(LAST_CHECKED, locale))}</p>
        </div>
        <ul className="mt-4 grid gap-x-6 sm:grid-cols-2">
          {SOURCES.map((src) => (
            <li key={src.url} className="border-t border-line py-3">
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-accent-strong"
              >
                {src.label}
                <ExternalLink aria-hidden className="size-3.5 text-muted group-hover:text-accent-strong" />
              </a>
              <span className="ml-2 rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted">{t.method.kinds[src.kind]}</span>
              <p className="mt-1 text-xs leading-relaxed text-ink-2">{src.use[locale]}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Faq() {
  const { t } = useI18n();
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:pb-24" aria-labelledby="faq-title">
      <h2 id="faq-title" className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {t.faq.title}
      </h2>
      <div className="mt-6 divide-y divide-line border-y border-line">
        {t.faq.items.map((item) => (
          <details key={item.q} className="group">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-medium text-ink [&::-webkit-details-marker]:hidden">
              {item.q}
              <ChevronDown aria-hidden className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
            </summary>
            <p className="pb-5 pr-8 text-sm leading-relaxed text-ink-2">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-line pb-24 pt-10 lg:pb-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-2.5">
          <Logo className="size-7" />
          <span className="font-semibold tracking-tight text-ink">FMath</span>
        </div>
        <div className="max-w-2xl space-y-2 text-xs leading-relaxed text-muted">
          <p>{t.footer.disclaimer}</p>
          <p>{t.footer.built}</p>
        </div>
      </div>
    </footer>
  );
}
