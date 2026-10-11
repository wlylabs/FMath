'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchPerpMarkets, type PerpMarket } from '../../api/hyperliquid';
import { PERPS_FEES, perpTrade, venueFeeRate, type OrderKind, type PerpSide, type PerpVenue } from '../../lib/perps';
import { num, parseAmount, pct, price, time, usd } from '../../lib/format';
import { t } from '../../lib/copy';
import { usePersistentState } from '../../hooks/usePersistentState';
import { CardTitle, Field, Headline, LiveBadge, Notice, NumberInput, QuickPicks, Row, Segmented, Switch } from '../ui';
import { cx } from '../../lib/cx';
import { MobileSummary } from '../MobileSummary';

interface State {
  venue: PerpVenue;
  coin: Record<PerpVenue, string>;
  side: PerpSide;
  margin: string;
  leverage: number;
  entry: string;
  exit: string;
  orderKind: OrderKind;
  referral: boolean;
  growth: boolean;
  funding: string;
  hold: string;
}

const INITIAL: State = {
  venue: 'hyperliquid',
  coin: { hyperliquid: 'BTC', xyz: '' },
  side: 'long',
  margin: '100',
  leverage: 5,
  entry: '',
  exit: '',
  orderKind: 'taker',
  referral: false,
  growth: true,
  funding: '',
  hold: '24',
};

const MARGIN_PICKS = ['25', '50', '100', '250', '500', '1000'];
const MOVES = [-0.1, -0.05, -0.01, 0.01, 0.05, 0.1, 0.25];

type Load = { status: 'loading' | 'ready' | 'error'; markets: PerpMarket[]; at: number };

/** Strip float noise and trailing zeros so prices go back into inputs cleanly. */
function toInput(n: number): string {
  if (!Number.isFinite(n)) return '';
  const digits = n >= 1000 ? 2 : n >= 1 ? 4 : 8;
  return String(Number(n.toFixed(digits)));
}

export function PerpsCalculator() {
  const [s, setS] = usePersistentState<State>('perps', INITIAL);
  const set = <K extends keyof State>(k: K, v: State[K]) => setS((p) => ({ ...p, [k]: v }));
  const [load, setLoad] = useState<Load>({ status: 'loading', markets: [], at: 0 });
  const [reloadKey, setReloadKey] = useState(0);
  const ids = {
    market: useId(),
    margin: useId(),
    lev: useId(),
    entry: useId(),
    exit: useId(),
    funding: useId(),
    hold: useId(),
    venue: useId(),
    side: useId(),
    kind: useId(),
  };
  const resultsRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load the venue's markets, then refresh prices every 20s while the tab is visible.
  useEffect(() => {
    const ctrl = new AbortController();
    let first = true;
    const run = () => {
      fetchPerpMarkets(s.venue, ctrl.signal)
        .then((markets) => setLoad({ status: 'ready', markets, at: Date.now() }))
        .catch((e: unknown) => {
          if ((e as Error).name === 'AbortError') return;
          setLoad((l) => (first || l.markets.length === 0 ? { status: 'error', markets: [], at: 0 } : l));
        })
        .finally(() => {
          first = false;
        });
    };
    setLoad((l) => ({ ...l, status: 'loading', markets: l.markets.filter((m) => m.venue === s.venue) }));
    run();
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') run();
    }, 20_000);
    return () => {
      ctrl.abort();
      clearInterval(id);
    };
  }, [s.venue, reloadKey]);

  const markets = load.markets.filter((m) => m.venue === s.venue);
  const market = markets.find((m) => m.coin === s.coin[s.venue]) ?? null;

  // Pick a default market and fill live numbers the first time a market is selected.
  const selectMarket = useCallback(
    (m: PerpMarket) => {
      setS((p) => ({
        ...p,
        coin: { ...p.coin, [m.venue]: m.coin },
        leverage: Math.min(p.leverage, m.maxLeverage),
        entry: toInput(m.markPx),
        exit: '',
        funding: toInput(m.fundingHourly * 100),
        growth: m.growthMode ?? p.growth,
      }));
    },
    [setS],
  );

  useEffect(() => {
    if (load.status !== 'ready' || markets.length === 0) return;
    if (!market) selectMarket(markets[0]!);
    else if (!s.entry) selectMarket(market);
  }, [load.at, s.venue]); // only react to a new market list

  const margin = parseAmount(s.margin);
  const entry = parseAmount(s.entry);
  const exitRaw = s.exit ? parseAmount(s.exit) : entry;
  const fundingPct = s.funding ? parseAmount(s.funding.replace(/^-/, '')) * (s.funding.startsWith('-') ? -1 : 1) : 0;
  const hold = s.hold ? parseAmount(s.hold) : 0;
  const maxLev = market?.maxLeverage ?? 50;
  const leverage = Math.min(Math.max(1, Math.round(s.leverage)), maxLev);

  const marginValid = Number.isFinite(margin) && margin > 0;
  const entryValid = Number.isFinite(entry) && entry > 0;
  const exitValid = Number.isFinite(exitRaw) && exitRaw > 0;
  const builderRate = s.referral ? PERPS_FEES.builderReferral : PERPS_FEES.builder;
  const venueRate = venueFeeRate(s.venue, s.orderKind, s.growth);

  const result =
    marginValid && entryValid && exitValid
      ? perpTrade({
          side: s.side,
          margin,
          leverage,
          entry,
          exit: exitRaw,
          builderRate,
          venueRate,
          fundingHourly: Number.isFinite(fundingPct) ? fundingPct / 100 : 0,
          holdHours: Number.isFinite(hold) ? hold : 0,
          tiers: market?.tiers ?? [{ lowerBound: 0, maxLeverage: maxLev }],
        })
      : null;
  const tone = result ? (result.netPnl >= 0 ? 'pos' : 'neg') : undefined;
  const levFill = maxLev > 1 ? ((leverage - 1) / (maxLev - 1)) * 100 : 100;
  const fundingSigned = (v: string) => v.replace(/[^\d.,-]/g, '').replace(/(?!^)-/g, '');

  return (
    <div ref={containerRef} className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-6">
      <section className="card space-y-6 p-4 sm:p-6" aria-label={t.calc.tabs.perps}>
        <Field label={t.perps.venue} labelId={ids.venue}>
          <Segmented
            label={t.perps.venue}
            labelledBy={ids.venue}
            options={[
              { value: 'hyperliquid', label: 'Hyperliquid', sub: t.perps.hlHint },
              { value: 'xyz', label: 'trade.xyz', sub: t.perps.xyzHint },
            ]}
            value={s.venue}
            onChange={(v) => setS((p) => (p.venue === v ? p : { ...p, venue: v, entry: '', exit: '', funding: '' }))}
          />
        </Field>

        <Field
          label={t.perps.market}
          htmlFor={ids.market}
          aside={
            load.status === 'ready' ? (
              <span className="flex items-center gap-2">
                <LiveBadge label={t.common.live} />
                <span className="num text-[11px] text-muted">{time(load.at)}</span>
              </span>
            ) : null
          }
        >
          {load.status === 'error' && markets.length === 0 ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 px-3.5 py-3">
              <p className="text-sm text-ink-2">{t.common.loadError}</p>
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-medium text-ink hover:border-line-strong"
              >
                <RefreshCw aria-hidden className="size-3.5" />
                {t.common.retry}
              </button>
            </div>
          ) : (
            <div className="relative">
              <select
                id={ids.market}
                value={market?.coin ?? ''}
                disabled={markets.length === 0}
                onChange={(e) => {
                  const m = markets.find((x) => x.coin === e.target.value);
                  if (m) selectMarket(m);
                }}
                className="h-12 w-full appearance-none rounded-xl border border-line bg-surface-2 pl-3.5 pr-10 text-base text-ink outline-none transition-colors hover:border-line-strong focus:border-accent-strong disabled:opacity-60"
              >
                {markets.length === 0 && <option value="">{t.perps.marketLoading}</option>}
                {markets.map((m) => (
                  <option key={m.coin} value={m.coin}>
                    {m.label}-USD · {t.perps.maxLev(m.maxLeverage)}
                  </option>
                ))}
              </select>
              <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted">
                <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          {market && (
            <dl className="mt-2.5 grid grid-cols-3 gap-2 rounded-xl bg-surface-2 px-3.5 py-2.5">
              <div>
                <dt className="text-[11px] text-muted">{t.perps.mark}</dt>
                <dd className="num text-sm text-ink">{price(market.markPx)}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted">{t.profit.change24h}</dt>
                <dd
                  className={cx(
                    'num text-sm',
                    market.change24h === null ? 'text-ink' : market.change24h >= 0 ? 'text-pos' : 'text-neg',
                  )}
                >
                  {pct(market.change24h, { signed: true })}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted">{t.perps.fundingLive}</dt>
                <dd className="num text-sm text-ink">{pct(market.fundingHourly, { digits: 4, signed: true })}</dd>
              </div>
            </dl>
          )}
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t.perps.side} labelId={ids.side}>
            <Segmented
              label={t.perps.side}
              labelledBy={ids.side}
              options={[
                { value: 'long', label: t.perps.long },
                { value: 'short', label: t.perps.short },
              ]}
              value={s.side}
              onChange={(v) => set('side', v)}
              tone={(v) => (v === 'long' ? 'pos' : 'neg')}
            />
          </Field>
          <Field label={t.perps.orderType} labelId={ids.kind}>
            <Segmented
              label={t.perps.orderType}
              labelledBy={ids.kind}
              options={[
                { value: 'taker', label: t.perps.taker },
                { value: 'maker', label: t.perps.maker },
              ]}
              value={s.orderKind}
              onChange={(v) => set('orderKind', v)}
            />
          </Field>
        </div>

        <Field label={t.perps.margin} htmlFor={ids.margin}>
          <NumberInput
            id={ids.margin}
            value={s.margin}
            onChange={(v) => set('margin', v)}
            prefix="$"
            suffix="USDC"
            placeholder="100"
            invalid={s.margin !== '' && !marginValid}
          />
          <QuickPicks
            label={t.common.quick}
            values={MARGIN_PICKS.map((v) => ({ value: v, label: '$' + Number(v).toLocaleString('en-US') }))}
            current={marginValid ? String(margin) : undefined}
            onPick={(v) => set('margin', v)}
          />
        </Field>

        <Field
          label={t.perps.leverage}
          htmlFor={ids.lev}
          aside={<span className="num text-sm font-semibold text-ink">{leverage}x</span>}
          hint={t.perps.maxLev(maxLev)}
        >
          <input
            id={ids.lev}
            type="range"
            min={1}
            max={maxLev}
            step={1}
            value={leverage}
            onChange={(e) => set('leverage', Number(e.target.value))}
            className="range"
            style={{ ['--fill' as string]: `${levFill}%` }}
            aria-valuetext={`${leverage}x`}
          />
          <QuickPicks
            label={t.common.quick}
            values={[1, 2, 3, 5, 10, 20, 25, 40, 50]
              .filter((v) => v <= maxLev)
              .map((v) => ({ value: String(v), label: `${v}x` }))}
            current={String(leverage)}
            onPick={(v) => set('leverage', Number(v))}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label={t.perps.entry}
            htmlFor={ids.entry}
            aside={
              market ? (
                <button
                  type="button"
                  onClick={() => set('entry', toInput(market.markPx))}
                  className="text-xs font-medium text-accent-strong hover:underline"
                >
                  {t.perps.useMark}
                </button>
              ) : null
            }
          >
            <NumberInput
              id={ids.entry}
              value={s.entry}
              onChange={(v) => set('entry', v)}
              prefix="$"
              placeholder={market ? toInput(market.markPx) : '0'}
              invalid={s.entry !== '' && !entryValid}
            />
          </Field>
          <Field label={t.perps.exit} htmlFor={ids.exit}>
            <NumberInput
              id={ids.exit}
              value={s.exit}
              onChange={(v) => set('exit', v)}
              prefix="$"
              placeholder={entryValid ? toInput(entry) : '0'}
              invalid={s.exit !== '' && !exitValid}
            />
            {entryValid && (
              <QuickPicks
                label={t.perps.exitHint}
                values={MOVES.map((d) => ({ value: toInput(entry * (1 + d)), label: pct(d, { digits: 0, signed: true }) }))}
                current={s.exit}
                onPick={(v) => set('exit', v)}
              />
            )}
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t.perps.funding} htmlFor={ids.funding} hint={t.perps.fundingHint}>
            <div
              className={cx(
                'flex h-12 items-center rounded-xl border bg-surface-2 transition-colors focus-within:border-accent-strong focus-within:bg-surface',
                s.funding !== '' && !Number.isFinite(fundingPct) ? 'border-neg' : 'border-line hover:border-line-strong',
              )}
            >
              <input
                id={ids.funding}
                type="text"
                inputMode="text"
                autoComplete="off"
                value={s.funding}
                placeholder="0.0013"
                onChange={(e) => set('funding', fundingSigned(e.target.value))}
                className="num h-full w-full min-w-0 bg-transparent pl-3.5 pr-1.5 text-base text-ink outline-none placeholder:text-muted/70"
              />
              <span className="shrink-0 pr-3.5 text-sm text-muted">%</span>
            </div>
          </Field>
          <Field label={t.perps.hold} htmlFor={ids.hold}>
            <NumberInput id={ids.hold} value={s.hold} onChange={(v) => set('hold', v)} suffix="h" placeholder="24" />
            <QuickPicks
              label={t.common.quick}
              values={['1', '8', '24', '72', '168'].map((v) => ({ value: v, label: `${v}h` }))}
              current={s.hold}
              onPick={(v) => set('hold', v)}
            />
          </Field>
        </div>

        <div className="grid gap-3">
          <Switch
            checked={s.referral}
            onChange={(v) => set('referral', v)}
            label={t.common.referral}
            hint={`${t.perps.builderFee}: ${pct(PERPS_FEES.builderReferral, { digits: 3 })}`}
          />
          {s.venue === 'xyz' && (
            <Switch
              checked={s.growth}
              onChange={(v) => set('growth', v)}
              label={t.perps.growth}
              hint={market?.growthMode != null ? `${t.perps.growthHint} ${t.perps.growthFromApi}` : t.perps.growthHint}
            />
          )}
        </div>
      </section>

      <aside ref={resultsRef} className="card self-start p-4 sm:p-6 lg:sticky lg:top-20" aria-label={t.calc.tabs.perps}>
        <CardTitle>
          {market ? `${market.label}-USD ${s.side === 'long' ? t.perps.long : t.perps.short} ${leverage}x` : t.calc.tabs.perps}
        </CardTitle>
        {result ? (
          <>
            <div className="mt-4">
              <Headline
                label={t.perps.netPnl}
                value={usd(result.netPnl, { signed: true })}
                tone={tone}
                sub={
                  <span>
                    {t.perps.roe}{' '}
                    <span className={cx('num font-medium', tone === 'pos' ? 'text-pos' : 'text-neg')}>
                      {pct(result.roe, { signed: true })}
                    </span>
                  </span>
                }
              />
            </div>
            <dl className="mt-5 divide-y divide-line border-t border-line">
              <Row
                label={t.perps.liq}
                value={result.liquidation === null ? t.perps.liqNone : price(result.liquidation)}
                sub={result.liquidationDistance !== null ? t.perps.liqDistance(pct(result.liquidationDistance)) : undefined}
                strong
                tone={result.liquidation === null ? 'muted' : 'neg'}
              />
              <Row label={t.perps.breakEven} value={price(result.breakEven)} />
              <Row
                label={t.perps.notional}
                value={usd(result.notional)}
                sub={`${num(result.size, Math.min(6, Math.max(2, market?.szDecimals ?? 4)))} ${market?.label ?? ''}`}
              />
              <Row label={t.perps.grossPnl} value={usd(result.grossPnl, { signed: true })} />
              <Row
                label={t.perps.feeRate}
                value={pct(result.feeRate, { digits: 3 })}
                sub={t.perps.feeSplit(pct(builderRate, { digits: 3 }), pct(venueRate, { digits: 3 }))}
              />
              <Row label={t.perps.openFee} value={usd(result.openFee)} />
              <Row label={t.perps.closeFee} value={usd(result.closeFee)} />
              <Row
                label={result.funding >= 0 ? t.perps.fundingCost : t.perps.fundingGain}
                value={usd(Math.abs(result.funding))}
                tone={result.funding < 0 ? 'pos' : undefined}
              />
            </dl>
            <div className="mt-4 space-y-2">
              {result.tierMaxLeverage !== null && leverage > result.tierMaxLeverage && (
                <Notice tone="warn">{t.perps.tierWarn(result.tierMaxLeverage)}</Notice>
              )}
              <Notice>
                {t.perps.estimate} {t.perps.usNote}
              </Notice>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted">{load.status === 'loading' && !market ? t.common.loading : t.perps.noMarket}</p>
        )}
      </aside>

      <MobileSummary
        resultsRef={resultsRef}
        containerRef={containerRef}
        label={result ? t.perps.netPnl : t.perps.noMarket}
        value={result ? usd(result.netPnl, { signed: true }) : undefined}
        detail={result ? `${t.perps.roe} ${pct(result.roe, { signed: true })}` : undefined}
        tone={tone}
      />
    </div>
  );
}
