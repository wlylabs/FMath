'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { CHAINS, getChain, type ChainId, type TokenClass } from '../../lib/fees';
import { roundTrip, type RoundTripInput } from '../../lib/roundtrip';
import { compactUsd, multiple, num, parseAmount, pct, price, usd } from '../../lib/format';
import { dexscreenerChainId, getToken, type TokenMarket } from '../../api/dexscreener';
import { t } from '../../lib/copy';
import { ROUTES } from '../../lib/routes';
import { usePersistentState } from '../../hooks/usePersistentState';
import { CardTitle, Field, Headline, Notice, NumberInput, Pills, QuickPicks, Row, Segmented, Switch } from '../ui';
import { cx } from '../../lib/cx';
import { TokenLookup } from '../TokenLookup';
import { MobileSummary } from '../MobileSummary';
import { AMOUNT_PICKS } from './FeeCalculator';
import { ShareButton } from '../ShareButton';
import { ReferralNudge } from '../Referral';
import { buildShareUrl, primitivesFrom, takeUrlState } from '../../lib/urlState';

interface State {
  chain: ChainId;
  tokenClass: TokenClass;
  referral: boolean;
  buy: string;
  entryMcap: string;
  targetBy: 'mcap' | 'multiple';
  targetMcap: string;
  targetMultiple: string;
  networkFee: string;
  buyImpact: string;
  sellImpact: string;
  token: TokenMarket | null;
}

const INITIAL: State = {
  chain: 'solana',
  tokenClass: 'standard',
  referral: false,
  buy: '100',
  entryMcap: '',
  targetBy: 'multiple',
  targetMcap: '',
  targetMultiple: '2',
  networkFee: '',
  buyImpact: '',
  sellImpact: '',
  token: null,
};

function fromUrl(params: URLSearchParams): Partial<State> | undefined {
  const fields = primitivesFrom(INITIAL, params, {
    chain: CHAINS.map((c) => c.id),
    tokenClass: ['standard', 'major'],
    targetBy: ['mcap', 'multiple'],
  });
  // only tracking params (?fbclid=, ?utm_*=): not a shared calculation, keep the saved token
  if (Object.keys(fields).length === 0 && !params.has('token')) return undefined;
  // a shared link describes the whole calculation; its token (if any) loads separately
  return { ...fields, token: null };
}

const SCENARIOS = [0.5, 1, 2, 5, 10, 100];
const MULTIPLE_PICKS = ['1.5', '2', '3', '5', '10', '100'];

function optionalPct(raw: string): { value: number; valid: boolean } {
  if (!raw) return { value: 0, valid: true };
  const v = parseAmount(raw);
  return { value: v / 100, valid: Number.isFinite(v) && v >= 0 && v < 100 };
}

export function ProfitCalculator() {
  const [s, setS] = usePersistentState<State>('profit', INITIAL, { page: ROUTES.profit, fromUrl });
  const set = <K extends keyof State>(k: K, v: State[K]) => setS((p) => ({ ...p, [k]: v }));
  const ids = {
    buy: useId(),
    entry: useId(),
    target: useId(),
    network: useId(),
    buyImpact: useId(),
    sellImpact: useId(),
    chain: useId(),
    by: useId(),
    cls: useId(),
  };
  const resultsRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const liveMcap = s.token ? (s.token.marketCap ?? s.token.fdv) : null;

  const onToken = useCallback(
    (tok: TokenMarket | null) => {
      setS((p) => {
        if (!tok) return { ...p, token: null };
        const isNew = p.token?.key !== tok.key;
        const mcap = tok.marketCap ?? tok.fdv;
        return {
          ...p,
          token: tok,
          chain: tok.chain,
          // a fresh pick fills the entry market cap; background refreshes leave the user's entry alone
          entryMcap: isNew && mcap ? String(Math.round(mcap)) : p.entryMcap,
        };
      });
    },
    [setS],
  );

  // A shared link can name a token as <dexscreener chain>:<address>; fetch it live.
  useEffect(() => {
    const ref = takeUrlState(ROUTES.profit, 'profit-token')?.get('token');
    const [chainId, address] = ref?.split(':') ?? [];
    if (!chainId || !address) return;
    getToken(chainId, address)
      .then((tok) => {
        if (tok) setS((p) => ({ ...p, token: tok, chain: tok.chain }));
      })
      .catch(() => {});
  }, [setS]);

  const chain = getChain(s.chain);
  const buy = parseAmount(s.buy);
  const entryMcap = s.entryMcap ? parseAmount(s.entryMcap) : NaN;
  const targetMcap = s.targetMcap ? parseAmount(s.targetMcap) : NaN;
  const targetMultiple = parseAmount(s.targetMultiple);
  const network = s.networkFee ? parseAmount(s.networkFee) : 0;
  const buyImpact = optionalPct(s.buyImpact);
  const sellImpact = optionalPct(s.sellImpact);

  const buyValid = Number.isFinite(buy) && buy > 0;
  const entryValid = Number.isFinite(entryMcap) && entryMcap > 0;
  const networkValid = Number.isFinite(network) && network >= 0;
  const m =
    s.targetBy === 'mcap'
      ? entryValid && Number.isFinite(targetMcap) && targetMcap >= 0
        ? targetMcap / entryMcap
        : NaN
      : Number.isFinite(targetMultiple) && targetMultiple >= 0
        ? targetMultiple
        : NaN;

  const base: RoundTripInput | null = buyValid
    ? {
        chain: s.chain,
        tokenClass: s.tokenClass,
        referral: s.referral,
        buyUsd: buy,
        multiple: Number.isFinite(m) ? m : 1,
        networkFeeUsd: networkValid ? network : 0,
        buyImpact: buyImpact.valid ? buyImpact.value : 0,
        sellImpact: sellImpact.valid ? sellImpact.value : 0,
      }
    : null;

  const result = base && Number.isFinite(m) ? roundTrip(base) : null;
  const withReferral = result && base && !s.referral ? roundTrip({ ...base, referral: true }) : null;
  const scenarios = base ? SCENARIOS.map((k) => ({ k, r: roundTrip({ ...base, multiple: k }) })) : [];

  // price that corresponds to the target, when a live token anchors the market cap
  const targetPrice =
    s.token && liveMcap && entryValid && Number.isFinite(m) ? s.token.priceUsd * ((entryMcap * m) / liveMcap) : null;
  const tone = result ? (result.pnl >= 0 ? 'pos' : 'neg') : undefined;

  return (
    <div ref={containerRef} className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-6">
      <section className="card space-y-6 p-4 sm:p-6" aria-label={t.calc.tabs.profit}>
        <Field label={t.profit.token} optional hint={s.token ? undefined : t.profit.tokenHint}>
          <TokenLookup token={s.token} onChange={onToken} />
        </Field>

        <Field label={t.common.chain} labelId={ids.chain}>
          <Pills
            label={t.common.chain}
            labelledBy={ids.chain}
            options={CHAINS.map((c) => ({ value: c.id, label: c.name }))}
            value={s.chain}
            onChange={(v) => set('chain', v)}
            disabled={!!s.token}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t.common.buyAmount} htmlFor={ids.buy}>
            <NumberInput
              id={ids.buy}
              value={s.buy}
              onChange={(v) => set('buy', v)}
              prefix="$"
              suffix="USDC"
              placeholder="100"
              invalid={s.buy !== '' && !buyValid}
            />
            <QuickPicks
              label={t.common.quick}
              values={AMOUNT_PICKS.map((v) => ({ value: v, label: '$' + Number(v).toLocaleString('en-US') }))}
              current={buyValid ? String(buy) : undefined}
              onPick={(v) => set('buy', v)}
            />
          </Field>
          <Field
            label={t.profit.entryMcap}
            htmlFor={ids.entry}
            optional={s.targetBy === 'multiple'}
            hint={entryValid ? compactUsd(entryMcap) : undefined}
          >
            <NumberInput
              id={ids.entry}
              value={s.entryMcap}
              onChange={(v) => set('entryMcap', v)}
              prefix="$"
              placeholder="1000000"
              invalid={s.entryMcap !== '' && !entryValid}
            />
          </Field>
        </div>

        <div className="space-y-4">
          <Field label={t.profit.exitBy} labelId={ids.by}>
            <Segmented
              label={t.profit.exitBy}
              labelledBy={ids.by}
              options={[
                { value: 'multiple', label: t.profit.byMultiple },
                { value: 'mcap', label: t.profit.byMcap },
              ]}
              value={s.targetBy}
              onChange={(v) => set('targetBy', v)}
            />
          </Field>
          {s.targetBy === 'multiple' ? (
            <Field
              label={t.profit.targetMultiple}
              htmlFor={ids.target}
              hint={
                entryValid && Number.isFinite(m)
                  ? t.profit.impliedMcap(compactUsd(entryMcap * m)) +
                    (targetPrice ? ` · ${t.profit.impliedPrice(price(targetPrice))}` : '')
                  : undefined
              }
            >
              <NumberInput
                id={ids.target}
                value={s.targetMultiple}
                onChange={(v) => set('targetMultiple', v)}
                suffix="x"
                placeholder="2"
                invalid={s.targetMultiple !== '' && !Number.isFinite(targetMultiple)}
              />
              <QuickPicks
                label={t.common.quick}
                values={MULTIPLE_PICKS.map((v) => ({ value: v, label: v + 'x' }))}
                current={Number.isFinite(targetMultiple) ? String(targetMultiple) : undefined}
                onPick={(v) => set('targetMultiple', v)}
              />
            </Field>
          ) : (
            <Field
              label={t.profit.targetMcap}
              htmlFor={ids.target}
              hint={
                !entryValid
                  ? t.profit.needEntry
                  : Number.isFinite(m)
                    ? `${compactUsd(targetMcap)} · ${multiple(m)}` +
                      (targetPrice ? ` · ${t.profit.impliedPrice(price(targetPrice))}` : '')
                    : undefined
              }
            >
              <NumberInput
                id={ids.target}
                value={s.targetMcap}
                onChange={(v) => set('targetMcap', v)}
                prefix="$"
                placeholder="10000000"
                invalid={s.targetMcap !== '' && !(Number.isFinite(targetMcap) && targetMcap >= 0)}
              />
              {entryValid && (
                <QuickPicks
                  label={t.common.quick}
                  values={[2, 5, 10, 100].map((k) => ({ value: String(Math.round(entryMcap * k)), label: compactUsd(entryMcap * k) }))}
                  current={Number.isFinite(targetMcap) ? String(targetMcap) : undefined}
                  onPick={(v) => set('targetMcap', v)}
                />
              )}
            </Field>
          )}
        </div>

        <Switch checked={s.referral} onChange={(v) => set('referral', v)} label={t.common.referral} hint={t.common.referralHint} />

        <details className="group rounded-xl border border-line">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-3.5 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
            {t.common.advanced}
            <ChevronDown aria-hidden className="size-4 text-muted transition-transform duration-[var(--dur-base)] ease-[var(--ease-standard)] group-open:rotate-180" />
          </summary>
          <div className="space-y-6 border-t border-line p-3.5">
            <Field label={t.common.tokenClass} labelId={ids.cls} hint={s.tokenClass === 'major' ? t.common.majorHint : undefined}>
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
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label={t.profit.buyImpact} htmlFor={ids.buyImpact} optional>
                <NumberInput
                  id={ids.buyImpact}
                  value={s.buyImpact}
                  onChange={(v) => set('buyImpact', v)}
                  suffix="%"
                  placeholder="0"
                  invalid={!buyImpact.valid}
                />
              </Field>
              <Field label={t.profit.sellImpact} htmlFor={ids.sellImpact} optional>
                <NumberInput
                  id={ids.sellImpact}
                  value={s.sellImpact}
                  onChange={(v) => set('sellImpact', v)}
                  suffix="%"
                  placeholder="0"
                  invalid={!sellImpact.valid}
                />
              </Field>
            </div>
          </div>
        </details>
      </section>

      <aside ref={resultsRef} className="card self-start p-4 sm:p-6 lg:sticky lg:top-20" aria-label={t.calc.tabs.profit}>
        <CardTitle
          aside={
            <ShareButton
              getUrl={() =>
                buildShareUrl(ROUTES.profit, {
                  chain: s.chain,
                  tokenClass: s.tokenClass,
                  referral: s.referral,
                  buy: s.buy,
                  entryMcap: s.entryMcap,
                  targetBy: s.targetBy,
                  targetMcap: s.targetBy === 'mcap' ? s.targetMcap : '',
                  targetMultiple: s.targetBy === 'multiple' ? s.targetMultiple : '',
                  networkFee: chain.gasCovered ? '' : s.networkFee,
                  buyImpact: s.buyImpact,
                  sellImpact: s.sellImpact,
                  token: s.token ? `${dexscreenerChainId(s.token.chain)}:${s.token.address}` : '',
                })
              }
            />
          }
        >
          {t.calc.tabs.profit}
        </CardTitle>
        {result ? (
          <>
            <div className="mt-4">
              <Headline
                label={result.pnl >= 0 ? t.profit.netPnl : t.profit.loss}
                value={usd(result.pnl, { signed: true })}
                tone={tone}
                sub={
                  <span>
                    {t.profit.roi}{' '}
                    <span className={cx('num font-medium', tone === 'pos' ? 'text-pos' : 'text-neg')}>
                      {pct(result.roi, { signed: true })}
                    </span>{' '}
                    · {t.profit.proceeds} <span className="num font-medium text-ink">{usd(result.proceeds)}</span>
                  </span>
                }
              />
            </div>
            <dl className="mt-5 divide-y divide-line border-t border-line">
              <Row
                label={t.profit.breakEven}
                value={multiple(result.breakEvenMultiple)}
                sub={pct(result.breakEvenMultiple - 1, { signed: true })}
                strong
              />
              {entryValid && (
                <Row label={t.profit.breakEvenMcap} value={compactUsd(entryMcap * result.breakEvenMultiple)} />
              )}
              <Row label={t.profit.costs} value={usd(result.totalCosts)} sub={pct(result.totalCosts / buy)} />
            </dl>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <LegCard
                title={t.profit.buyLeg}
                rows={[
                  [t.profit.fomoFee, usd(result.buyFee)],
                  [t.profit.network, usd(result.buyNetworkFee)],
                  [t.profit.impact, usd(result.buyImpactCost)],
                ]}
                footer={[t.profit.positionEntry, usd(result.positionAtEntry)]}
              />
              <LegCard
                title={t.profit.sellLeg}
                rows={[
                  [t.profit.fomoFee, usd(result.sellFee)],
                  [t.profit.network, usd(result.sellNetworkFee)],
                  [t.profit.impact, usd(result.sellImpactCost)],
                ]}
                footer={[t.profit.positionExit, usd(result.positionAtExit)]}
              />
            </div>

            {withReferral && (
              <ReferralNudge
                title={t.referral.nudgeTitleRoundTrip(usd(withReferral.proceeds - result.proceeds))}
                now={result.totalCosts}
                then={withReferral.totalCosts}
              />
            )}

            {Number.isFinite(result.breakEvenMultiple) && result.breakEvenMultiple > 1 && (
              <div className="mt-4">
                <Notice>{t.profit.breakEvenNote(pct(result.breakEvenMultiple - 1))}</Notice>
              </div>
            )}

            <div className="mt-5">
              <h3 className="text-sm font-medium text-ink">{t.profit.scenarios}</h3>
              <p className="mt-0.5 text-xs text-muted">{t.profit.scenariosHint}</p>
              <table className="mt-3 w-full text-sm">
                <thead className="text-xs text-muted">
                  <tr>
                    <th scope="col" className="pb-2 text-left font-medium">
                      {t.profit.scenarioMultiple}
                    </th>
                    <th scope="col" className="pb-2 text-right font-medium">
                      {t.profit.scenarioProceeds}
                    </th>
                    <th scope="col" className="pb-2 text-right font-medium">
                      {t.profit.scenarioPnl}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map(({ k, r }) => (
                    <tr key={k} className="border-t border-line">
                      <td className="num py-2 text-ink-2">{num(k)}x</td>
                      <td className="num py-2 text-right text-ink">{usd(r.proceeds)}</td>
                      <td className={cx('num py-2 text-right', r.pnl >= 0 ? 'text-pos' : 'text-neg')}>
                        {usd(r.pnl, { signed: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted">
            {!buyValid ? t.fee.enterAmount : s.targetBy === 'mcap' && !entryValid ? t.profit.needEntry : t.common.invalid}
          </p>
        )}
      </aside>

      <MobileSummary
        resultsRef={resultsRef}
        containerRef={containerRef}
        label={result ? (result.pnl >= 0 ? t.profit.netPnl : t.profit.loss) : t.fee.enterAmount}
        value={result ? usd(result.pnl, { signed: true }) : undefined}
        detail={result ? `${t.profit.roi} ${pct(result.roi, { signed: true })}` : undefined}
        tone={tone}
      />
    </div>
  );
}

function LegCard(props: { title: string; rows: [string, string][]; footer: [string, string] }) {
  return (
    <div className="rounded-xl bg-surface-2 p-3">
      <p className="text-xs font-medium text-ink">{props.title}</p>
      <dl className="mt-2 space-y-1.5">
        {props.rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-2">
            <dt className="truncate text-[11px] text-muted">{k}</dt>
            <dd className="num text-xs text-ink-2">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-2 border-t border-line pt-2">
        <p className="text-[11px] text-muted">{props.footer[0]}</p>
        <p className="num text-sm font-medium text-ink">{props.footer[1]}</p>
      </div>
    </div>
  );
}
