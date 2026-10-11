'use client';

import { useId, type ReactNode } from 'react';
import { ArrowUpRight, BadgePercent, Check, Copy } from 'lucide-react';
import { t } from '../lib/copy';
import { cx } from '../lib/cx';
import { REFERRAL } from '../lib/site';
import { fomoFee, type ChainId } from '../lib/fees';
import { num, parseAmount, usd } from '../lib/format';
import { copyText } from '../lib/clipboard';
import { toast } from '../lib/toast';
import { usePersistentState } from '../hooks/usePersistentState';
import { Field, NumberInput, QuickPicks, Segmented } from './ui';

/** Every referral link goes through here so rel, target and URL stay consistent. */
export function ReferralLink(props: { className?: string; children: ReactNode; 'aria-label'?: string }) {
  return (
    <a
      href={REFERRAL.url}
      target="_blank"
      rel="sponsored noopener"
      aria-label={props['aria-label']}
      className={props.className}
    >
      {props.children}
    </a>
  );
}

export function CopyCodeButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copyText(REFERRAL.code)) toast(t.referral.copied);
      }}
      className={cx(
        'group inline-flex h-12 items-center gap-2.5 rounded-xl border border-dashed border-line-strong bg-surface px-4 text-left transition-colors hover:border-accent-strong',
        className,
      )}
      aria-label={`${t.referral.copy}: ${REFERRAL.code}`}
    >
      <span className="flex flex-col leading-tight">
        <span className="text-[11px] text-muted">{t.referral.code}</span>
        <span className="num text-sm font-semibold text-ink">{REFERRAL.code}</span>
      </span>
      <Copy aria-hidden className="size-4 text-muted group-hover:text-accent-strong" />
    </button>
  );
}

/**
 * Shown in a result card while the referral switch is off: the saving on the
 * exact trade on screen, then the ask. Nothing renders when there is no saving.
 */
export function ReferralNudge(props: { title: string; now: number; then: number }) {
  if (!(props.now - props.then > 0)) return null;
  return (
    <div className="mt-4">
      <div className="overflow-hidden rounded-xl border border-accent-strong/30 bg-accent-wash">
        <div className="flex items-start gap-3 p-3.5">
          <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-ink">
            <BadgePercent className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-snug text-ink">{t.referral.headline}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-2">
              <span className="font-semibold text-accent-strong">{props.title}.</span>{' '}
              {t.referral.nudgeCompare(usd(props.now), usd(props.then))}
            </p>
          </div>
        </div>
        <ReferralLink className="flex h-11 items-center justify-center gap-1.5 bg-accent text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover">
          {t.referral.cta}
          <ArrowUpRight aria-hidden className="size-4" />
        </ReferralLink>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
        {t.referral.eyebrow} link. {t.referral.nudgeHave}
      </p>
    </div>
  );
}

interface EstimatorState {
  volume: string;
  size: string;
  chain: 'solana' | 'other';
}

const ESTIMATOR_INITIAL: EstimatorState = { volume: '5000', size: '100', chain: 'solana' };
const VOLUME_PICKS = ['1000', '5000', '10000', '50000', '100000'];
const SIZE_PICKS = ['25', '50', '100', '250', '1000'];

function compactLabel(v: string): string {
  const n = Number(v);
  return '$' + (n >= 1000 ? `${n / 1000}K` : String(n));
}

function SavingsEstimator() {
  const [s, setS] = usePersistentState<EstimatorState>('referral-estimate', ESTIMATOR_INITIAL);
  const ids = { volume: useId(), size: useId(), chain: useId() };
  const volume = parseAmount(s.volume);
  const size = parseAmount(s.size);
  const valid = volume > 0 && size > 0;
  // "other" stands for every 0.50% chain; Base is one of them
  const chain: ChainId = s.chain === 'solana' ? 'solana' : 'base';
  const orders = valid ? volume / size : 0;
  const monthlyFees = valid ? orders * fomoFee(size, chain).fee : 0;
  const keptMonth = monthlyFees * REFERRAL.discount;

  return (
    <div className="card p-5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)] sm:p-6">
      <h3 className="text-base font-semibold text-ink">{t.referral.estimatorTitle}</h3>
      <p className="mt-1 text-xs text-muted">{t.referral.estimatorLead}</p>

      <div className="mt-5 space-y-5">
        <Field label={t.referral.volume} htmlFor={ids.volume}>
          <NumberInput
            id={ids.volume}
            value={s.volume}
            onChange={(v) => setS((p) => ({ ...p, volume: v }))}
            prefix="$"
            suffix="USDC"
            invalid={s.volume !== '' && !(volume > 0)}
          />
          <QuickPicks
            label={t.common.quick}
            values={VOLUME_PICKS.map((v) => ({ value: v, label: compactLabel(v) }))}
            current={volume > 0 ? String(volume) : undefined}
            onPick={(v) => setS((p) => ({ ...p, volume: v }))}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t.referral.orderSize} htmlFor={ids.size}>
            <NumberInput
              id={ids.size}
              value={s.size}
              onChange={(v) => setS((p) => ({ ...p, size: v }))}
              prefix="$"
              invalid={s.size !== '' && !(size > 0)}
            />
            <QuickPicks
              label={t.common.quick}
              values={SIZE_PICKS.map((v) => ({ value: v, label: compactLabel(v) }))}
              current={size > 0 ? String(size) : undefined}
              onPick={(v) => setS((p) => ({ ...p, size: v }))}
            />
          </Field>
          <Field label={t.referral.chain} labelId={ids.chain}>
            <Segmented
              label={t.referral.chain}
              labelledBy={ids.chain}
              options={[
                { value: 'solana', label: 'Solana' },
                { value: 'other', label: t.referral.otherChains },
              ]}
              value={s.chain}
              onChange={(v) => setS((p) => ({ ...p, chain: v }))}
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-surface-2 p-4">
        <p className="text-sm text-ink-2">{t.referral.savedYear}</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight text-accent-strong" aria-live="polite">
          {usd(keptMonth * 12)}
        </p>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-2">{t.referral.savedMonth}</dt>
            <dd className="num font-medium text-ink">{usd(keptMonth)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-2">{t.referral.feesWithout}</dt>
            <dd className="num text-ink-2">
              {usd(monthlyFees)} <span className="font-sans text-xs text-muted">{t.referral.perMonth}</span>
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 text-xs text-muted">
            <dt>{t.referral.trades(num(orders, orders < 10 ? 1 : 0))}</dt>
          </div>
        </dl>
      </div>

      <ReferralLink className="mt-4 flex h-12 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover">
        {t.referral.cta}
        <ArrowUpRight aria-hidden className="size-4" />
      </ReferralLink>
    </div>
  );
}

export function ReferralSection() {
  return (
    <section id="referral" aria-labelledby="referral-title" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_50%_at_15%_20%,var(--accent-wash),transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-14 lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-accent-strong/40 bg-accent-wash px-3 py-1 text-xs font-semibold text-accent-strong">
            <BadgePercent aria-hidden className="size-3.5" />
            {t.referral.eyebrow}
          </p>
          <h2 id="referral-title" className="mt-4 text-3xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-4xl">
            {t.referral.headline}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-2">{t.referral.lead}</p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ReferralLink className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover">
              {t.referral.cta}
              <ArrowUpRight aria-hidden className="size-4" />
            </ReferralLink>
            <CopyCodeButton />
          </div>

          <ol className="mt-9 grid gap-5 sm:grid-cols-3">
            {t.referral.steps.map((step, i) => (
              <li key={step.title} className="flex gap-3 sm:flex-col sm:gap-2">
                <span className="num flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-bg">
                  {i < t.referral.steps.length - 1 ? i + 1 : <Check aria-hidden className="size-3.5" />}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">{step.title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-2">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>

          <p className="mt-8 max-w-xl text-xs leading-relaxed text-muted">{t.referral.disclosure}</p>
        </div>

        <SavingsEstimator />
      </div>
    </section>
  );
}
