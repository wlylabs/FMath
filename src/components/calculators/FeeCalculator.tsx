'use client';

import { useId, useRef, useState } from 'react';
import { BarChart3, Table2 } from 'lucide-react';
import { bandsFor, CHAINS, fomoFee, getChain, tradeCost, type ChainId, type TokenClass } from '../../lib/fees';
import { parseAmount, pct, usd } from '../../lib/format';
import { t } from '../../lib/copy';
import { usePersistentState } from '../../hooks/usePersistentState';
import { CardTitle, Field, Headline, Notice, NumberInput, Pills, QuickPicks, Row, Segmented, Switch } from '../ui';
import { BandTable, bandFee, bandRange } from '../BandTable';
import { FeeCurveChart } from '../FeeCurveChart';
import { MobileSummary } from '../MobileSummary';
import { ShareButton } from '../ShareButton';
import { ReferralNudge } from '../Referral';
import { buildShareUrl, primitivesFrom } from '../../lib/urlState';

interface State {
  chain: ChainId;
  side: 'buy' | 'sell';
  amount: string;
  tokenClass: TokenClass;
  referral: boolean;
  networkFee: string;
  impact: string;
}

const INITIAL: State = {
  chain: 'solana',
  side: 'buy',
  amount: '100',
  tokenClass: 'standard',
  referral: false,
  networkFee: '',
  impact: '',
};

const CHAIN_IDS = CHAINS.map((c) => c.id);

function fromUrl(params: URLSearchParams): Partial<State> {
  return primitivesFrom(INITIAL, params, { chain: CHAIN_IDS, side: ['buy', 'sell'], tokenClass: ['standard', 'major'] });
}

export const AMOUNT_PICKS = ['10', '50', '100', '190', '500', '1000'];

export function FeeCalculator() {
  const [s, setS] = usePersistentState<State>('fee', INITIAL, { tab: 'fee', fromUrl });
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const set = <K extends keyof State>(k: K, v: State[K]) => setS((p) => ({ ...p, [k]: v }));
  const ids = { amount: useId(), network: useId(), impact: useId(), chain: useId(), side: useId(), cls: useId() };
  const resultsRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const chain = getChain(s.chain);
  const amount = parseAmount(s.amount);
  const networkFee = s.networkFee ? parseAmount(s.networkFee) : 0;
  const impactPct = s.impact ? parseAmount(s.impact) : 0;
  const amountValid = Number.isFinite(amount) && amount > 0;
  const networkValid = Number.isFinite(networkFee) && networkFee >= 0;
  const impactValid = Number.isFinite(impactPct) && impactPct >= 0 && impactPct < 100;

  const result = amountValid
    ? tradeCost({
        side: s.side,
        orderUsd: amount,
        chain: s.chain,
        tokenClass: s.tokenClass,
        referral: s.referral,
        networkFeeUsd: networkValid ? networkFee : 0,
        priceImpact: impactValid ? impactPct / 100 : 0,
      })
    : null;

  const bands = bandsFor(s.chain, s.tokenClass);

  return (
    <div ref={containerRef} className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-6">
      <section className="card space-y-6 p-4 sm:p-6" aria-label={t.calc.tabs.fee}>
        <Field label={t.common.chain} labelId={ids.chain}>
          <Pills
            label={t.common.chain}
            labelledBy={ids.chain}
            options={CHAINS.map((c) => ({ value: c.id, label: c.name }))}
            value={s.chain}
            onChange={(v) => set('chain', v)}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t.common.side} labelId={ids.side}>
            <Segmented
              label={t.common.side}
              labelledBy={ids.side}
              options={[
                { value: 'buy', label: t.common.buy },
                { value: 'sell', label: t.common.sell },
              ]}
              value={s.side}
              onChange={(v) => set('side', v)}
            />
          </Field>
          <Field label={t.common.tokenClass} labelId={ids.cls}>
            <Segmented
              label={t.common.tokenClass}
              labelledBy={ids.cls}
              options={[
                { value: 'standard', label: t.common.standard },
                { value: 'major', label: t.common.major },
              ]}
              value={s.tokenClass}
              onChange={(v) => set('tokenClass', v)}
            />
          </Field>
        </div>

        <Field label={t.common.amount} htmlFor={ids.amount} hint={s.tokenClass === 'major' ? t.common.majorHint : undefined}>
          <NumberInput
            id={ids.amount}
            value={s.amount}
            onChange={(v) => set('amount', v)}
            prefix="$"
            suffix="USDC"
            placeholder="100"
            invalid={s.amount !== '' && !amountValid}
          />
          <QuickPicks
            label={t.common.quick}
            values={AMOUNT_PICKS.map((v) => ({ value: v, label: '$' + Number(v).toLocaleString('en-US') }))}
            current={amountValid ? String(amount) : undefined}
            onPick={(v) => set('amount', v)}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label={t.common.networkFee}
            htmlFor={ids.network}
            hint={chain.gasCovered ? t.common.gasCovered(chain.name) : t.common.networkFeeHint}
          >
            <NumberInput
              id={ids.network}
              value={chain.gasCovered ? '' : s.networkFee}
              onChange={(v) => set('networkFee', v)}
              prefix="$"
              placeholder="0"
              disabled={chain.gasCovered}
              invalid={!chain.gasCovered && s.networkFee !== '' && !networkValid}
            />
          </Field>
          <Field label={t.common.priceImpact} htmlFor={ids.impact} optional>
            <NumberInput
              id={ids.impact}
              value={s.impact}
              onChange={(v) => set('impact', v)}
              suffix="%"
              placeholder="0"
              invalid={s.impact !== '' && !impactValid}
            />
          </Field>
        </div>

        <Switch checked={s.referral} onChange={(v) => set('referral', v)} label={t.common.referral} hint={t.common.referralHint} />
      </section>

      <aside ref={resultsRef} className="card self-start p-4 sm:p-6 lg:sticky lg:top-20" aria-label={t.fee.results}>
        <CardTitle
          aside={
            <ShareButton
              getUrl={() =>
                buildShareUrl('fee', {
                  chain: s.chain,
                  side: s.side,
                  amount: s.amount,
                  tokenClass: s.tokenClass,
                  referral: s.referral,
                  networkFee: chain.gasCovered ? '' : s.networkFee,
                  impact: s.impact,
                })
              }
            />
          }
        >
          {t.fee.results}
        </CardTitle>
        {result ? (
          <>
            <div className="mt-4">
              <Headline
                label={t.fee.fomoFee}
                value={usd(result.quote.fee)}
                sub={
                  <span>
                    <span className="num font-medium text-ink">{pct(result.quote.effectiveRate)}</span> {t.fee.effective}
                  </span>
                }
              />
            </div>
            <dl className="mt-5 divide-y divide-line border-t border-line">
              <Row
                label={t.fee.band}
                value={bandFee(result.quote.band, s.referral)}
                sub={bandRange(bands, result.quote.bandIndex)}
              />
              <Row
                label={t.fee.network}
                value={usd(result.networkFee)}
                sub={chain.gasCovered ? t.fee.covered : undefined}
                tone={chain.gasCovered ? 'muted' : undefined}
              />
              {result.impactCost > 0 && <Row label={t.fee.impact} value={usd(result.impactCost)} />}
              <Row label={t.fee.total} value={usd(result.totalCost)} sub={`${pct(result.allInRate)} ${t.fee.effective}`} strong />
              <Row
                label={s.side === 'buy' ? t.fee.receivedBuy : t.fee.receivedSell}
                value={usd(result.received)}
                strong
              />
              {s.referral && result.savedByReferral > 0 && (
                <Row label={t.fee.saved} value={usd(result.savedByReferral)} tone="pos" />
              )}
            </dl>
            {!s.referral && (
              <ReferralNudge
                title={t.referral.nudgeTitle(usd(result.quote.fee - fomoFee(amount, s.chain, s.tokenClass, true).fee))}
                now={result.quote.fee}
                then={fomoFee(amount, s.chain, s.tokenClass, true).fee}
              />
            )}
            <div className="mt-4 space-y-2 empty:hidden">
              {result.belowMinSell && (
                <Notice tone="warn">{t.fee.minSell(usd(chain.minSellUsd), chain.name)}</Notice>
              )}
              {s.tokenClass === 'major' && result.quote.band.kind === 'flat' && <Notice>{t.fee.majorCap}</Notice>}
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted">{t.fee.enterAmount}</p>
        )}
      </aside>

      <section className="card p-4 sm:p-6 lg:col-span-2" aria-labelledby={ids.chain + '-chart'}>
        <CardTitle
          id={ids.chain + '-chart'}
          aside={
            <button
              type="button"
              onClick={() => setView((v) => (v === 'chart' ? 'table' : 'chart'))}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-line px-3 text-xs font-medium text-ink-2 hover:border-line-strong hover:text-ink"
            >
              {view === 'chart' ? <Table2 aria-hidden className="size-3.5" /> : <BarChart3 aria-hidden className="size-3.5" />}
              {view === 'chart' ? t.chart.showTable : t.chart.showChart}
            </button>
          }
        >
          {t.chart.title}
        </CardTitle>
        <p className="mt-1 text-xs text-muted">{t.chart.subtitle(chain.name)}</p>
        <div className="mt-4">
          {view === 'chart' ? (
            <FeeCurveChart
              chain={s.chain}
              tokenClass={s.tokenClass}
              referral={s.referral}
              networkFee={networkValid ? networkFee : 0}
              order={amountValid ? amount : 0}
            />
          ) : (
            <BandTable
              chain={s.chain}
              tokenClass={s.tokenClass}
              referral={s.referral}
              activeIndex={result?.quote.bandIndex}
              caption={t.chart.title}
            />
          )}
        </div>
      </section>

      <MobileSummary
        resultsRef={resultsRef}
        containerRef={containerRef}
        label={result ? t.fee.fomoFee : t.fee.enterAmount}
        value={result ? usd(result.quote.fee) : undefined}
        detail={result ? `${pct(result.quote.effectiveRate)} ${t.fee.effective}` : undefined}
      />
    </div>
  );
}
