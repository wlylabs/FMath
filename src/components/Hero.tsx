import type { CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight, CalendarCheck } from 'lucide-react';
import { ROUTES } from '../lib/routes';
import { FEE_SCHEDULE, fomoFee } from '../lib/fees';
import { PERPS_FEES } from '../lib/perps';
import { date, pct, usd } from '../lib/format';
import { t } from '../lib/copy';
import { cx } from '../lib/cx';
import { ReferralLink } from './Referral';
import { CreatorLink } from './Creator';
import { CREATOR } from '../lib/site';
import { NavLink } from './NavLink';

const EXAMPLE_SIZES = [10, 50, 190, 1000];

/** Stagger slot for the first-load entrance (.rise, .grow-x in globals.css). */
const at = (i: number) => ({ '--i': i }) as CSSProperties;

export function Hero() {
  const examples = EXAMPLE_SIZES.map((size) => ({ size, ...fomoFee(size, 'solana') }));
  const maxRate = Math.max(...examples.map((e) => e.effectiveRate));
  const facts = [
    { value: pct(FEE_SCHEDULE.standard[0].value), label: t.facts.standard },
    { value: t.facts.solanaValue(FEE_SCHEDULE.solana.length), label: t.facts.solana },
    { value: pct(PERPS_FEES.builder), label: t.facts.builder },
    { value: pct(FEE_SCHEDULE.referralDiscount, { digits: 0 }), label: t.facts.referral },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-10 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-14 lg:pb-14 lg:pt-16">
        <div>
          <p className="rise inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-2" style={at(0)}>
            <span aria-hidden className="size-1.5 rounded-full bg-accent-strong" />
            <span>
              {t.hero.eyebrow} {t.hero.by}{' '}
              <CreatorLink className="font-semibold text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink">
                {CREATOR.name}
              </CreatorLink>
            </span>
          </p>
          <h1 className="rise mt-5 text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl" style={at(1)}>
            {t.hero.title}
          </h1>
          <p className="rise mt-5 max-w-xl text-base leading-relaxed text-ink-2 sm:text-lg" style={at(2)}>
            {t.hero.lead}
          </p>
          <div className="rise mt-8 flex flex-col gap-3 sm:flex-row" style={at(3)}>
            <NavLink
              href={ROUTES.fee}
              className="press inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-ink hover:bg-accent-hover"
            >
              {t.hero.cta}
              <ArrowRight aria-hidden className="size-4" />
            </NavLink>
            <NavLink
              href={ROUTES.methodology}
              className="press inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 text-sm font-semibold text-ink hover:border-line-strong"
            >
              {t.hero.ctaSecondary}
            </NavLink>
          </div>
          <ReferralLink className="rise press group mt-4 inline-flex [--i:4] max-w-full items-center gap-2.5 rounded-2xl border border-accent-strong/30 bg-accent-wash py-1.5 pl-1.5 pr-3.5 text-left text-sm hover:border-accent-strong">
            <span className="shrink-0 rounded-xl bg-accent px-2 py-1 text-xs font-bold text-accent-ink">10% OFF</span>
            <span className="min-w-0">
              <span className="text-ink-2">{t.hero.referralLead}</span>{' '}
              <span className="font-semibold text-ink">{t.hero.referralLink}</span>
            </span>
            <ArrowUpRight
              aria-hidden
              className="size-4 shrink-0 text-accent-strong transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </ReferralLink>
          <p className="rise mt-5 flex items-center gap-2 text-xs text-muted" style={at(5)}>
            <CalendarCheck aria-hidden className="size-3.5" />
            {t.hero.schedule(date(FEE_SCHEDULE.version))}
          </p>
        </div>

        {/* phones get the same worked examples from the tool cards, closer to the top */}
        <figure className="receipt rise relative mb-3 hidden rounded-t-2xl bg-surface px-5 pb-7 pt-5 sm:block sm:px-7 sm:pt-6" style={at(2)}>
          <figcaption className="num flex items-baseline justify-between gap-3 border-b border-dashed border-line-strong pb-3 text-[11px] uppercase tracking-[0.16em] text-muted">
            <span>{t.hero.receipt}</span>
            <span>Solana</span>
          </figcaption>
          <p className="mt-4 text-sm font-semibold text-ink">{t.chart.title}</p>
          <ul className="mt-4 space-y-4">
            {examples.map((e, i) => (
              <li key={e.size}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="num text-ink-2">
                    {t.chart.order} {usd(e.size)}
                  </span>
                  <span className="num">
                    <span className="font-semibold text-ink">{usd(e.fee)}</span>
                    <span className="ml-2 text-muted">{pct(e.effectiveRate)}</span>
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-surface-2">
                  <div
                    className={cx('grow-x h-2 rounded-full', e.effectiveRate === maxRate ? 'bg-chart' : 'bg-chart/55')}
                    style={{ ...at(4 + i), width: `${Math.max(4, (e.effectiveRate / maxRate) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-dashed border-line-strong pt-4 text-xs leading-relaxed text-muted">{t.faq.items[1]!.a}</p>
          <div aria-hidden className="receipt-edge absolute inset-x-0 top-full h-3" />
        </figure>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <dl className="rise grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4" style={{ ...at(4), gap: 1 }}>
          {facts.map((f) => (
            <div key={f.label} className="bg-surface px-4 py-5 sm:px-6">
              <dt className="text-xs text-muted">{f.label}</dt>
              <dd className="num mt-1.5 text-2xl font-semibold tracking-tight text-ink">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
