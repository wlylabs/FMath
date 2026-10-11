import { ArrowDown, ArrowRight, ArrowUpRight, CalendarCheck, Gauge, Receipt, Target } from 'lucide-react';
import { FEE_SCHEDULE, fomoFee } from '../lib/fees';
import { PERPS_FEES } from '../lib/perps';
import { date, pct, usd } from '../lib/format';
import { t } from '../lib/copy';
import { cx } from '../lib/cx';
import { ReferralLink } from './Referral';

const EXAMPLE_SIZES = [10, 50, 190, 1000];

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
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-14 lg:pb-20 lg:pt-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-2">
            <span aria-hidden className="size-1.5 rounded-full bg-accent-strong" />
            {t.hero.eyebrow}
          </p>
          <h1 className="mt-5 text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {t.hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-2 sm:text-lg">{t.hero.lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#calculator"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
            >
              {t.hero.cta}
              <ArrowDown aria-hidden className="size-4" />
            </a>
            <a
              href="#methodology"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
            >
              {t.hero.ctaSecondary}
              <ArrowRight aria-hidden className="size-4" />
            </a>
          </div>
          <ReferralLink className="group mt-4 inline-flex max-w-full items-center gap-2.5 rounded-2xl border border-accent-strong/30 bg-accent-wash py-1.5 pl-1.5 pr-3.5 text-left text-sm transition-colors hover:border-accent-strong">
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
          <p className="mt-5 flex items-center gap-2 text-xs text-muted">
            <CalendarCheck aria-hidden className="size-3.5" />
            {t.hero.schedule(date(FEE_SCHEDULE.version))}
          </p>
        </div>

        <figure className="card p-5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)] sm:p-6">
          <figcaption className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-semibold text-ink">{t.chart.title}</span>
            <span className="text-xs text-muted">Solana</span>
          </figcaption>
          <ul className="mt-5 space-y-4">
            {examples.map((e) => (
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
                    className={cx('h-2 rounded-full', e.effectiveRate === maxRate ? 'bg-chart' : 'bg-chart/55')}
                    style={{ width: `${Math.max(4, (e.effectiveRate / maxRate) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-muted">{t.faq.items[1]!.a}</p>
        </figure>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4" style={{ gap: 1 }}>
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

export function Features() {
  const icons = [Receipt, Target, Gauge];
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20" aria-labelledby="features-title">
      <h2 id="features-title" className="max-w-2xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {t.features.title}
      </h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {t.features.items.map((f, i) => {
          const Icon = icons[i]!;
          return (
            <div key={f.title} className="card p-5 sm:p-6">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-accent-wash text-accent-strong">
                <Icon aria-hidden className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{f.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
