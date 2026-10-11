'use client';

import { useId } from 'react';
import { Plus, X } from 'lucide-react';
import { FEE_SCHEDULE, getChain } from '../lib/fees';
import { exitLadder, MAX_STEPS, shareForInitials, type LadderRow, type LadderStep } from '../lib/ladder';
import type { RoundTripInput } from '../lib/roundtrip';
import { compactUsd, multiple, parseAmount, pct, usd } from '../lib/format';
import { t } from '../lib/copy';
import { cx } from '../lib/cx';
import { CardTitle, Notice, NumberInput, QuickPicks, Row } from './ui';

/** Upper edge of the last Solana flat band; sells under it pay more than 0.50%. */
const SOLANA_SMALL = FEE_SCHEDULE.solana[2].upTo;

/** A row as a step, or null while it is empty or not a number. */
export function stepFrom(row: LadderRow): LadderStep | null {
  const m = parseAmount(row.multiple);
  const p = parseAmount(row.share);
  if (!(m > 0) || !(p > 0) || p > 100) return null;
  return { multiple: m, share: p / 100 };
}

/** 0.5 -> "50%", 0.505 -> "50.5%". */
function share(n: number): string {
  return pct(n, { digits: Math.abs(n * 100 - Math.round(n * 100)) < 1e-9 ? 0 : 1 });
}

/** Percent to type into a share field, rounded up so the step never falls short. */
function shareInput(n: number): string {
  return String(Math.min(100, Math.ceil(n * 1000 - 1e-9) / 10));
}

export function ExitPlan(props: {
  base: RoundTripInput | null;
  rows: LadderRow[];
  onChange: (rows: LadderRow[]) => void;
  /** Market cap at buy, to show the market cap each step sells at. */
  entryMcap: number | null;
}) {
  const { base, rows, onChange, entryMcap } = props;
  const id = useId();
  const steps = rows.map(stepFrom);
  const valid = steps.filter((s): s is LadderStep => s !== null);
  const result = base && valid.length > 0 ? exitLadder(base, valid) : null;
  const chain = base ? getChain(base.chain) : null;
  // the first step that takes profit, or 2x when there is none yet
  const firstUp = valid.filter((s) => s.multiple > 1).reduce<number | null>((lo, s) => (lo === null || s.multiple < lo ? s.multiple : lo), null) ?? 2;
  const initials = base ? shareForInitials(base, firstUp) : null;
  const initialsAt2 = base ? shareForInitials(base, 2) : null;

  const setRow = (i: number, patch: Partial<LadderRow>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const addRow = () => {
    const last = valid[valid.length - 1];
    const used = valid.reduce((sum, s) => sum + s.share, 0);
    onChange([
      ...rows,
      {
        multiple: last ? String(Number((last.multiple * 2).toFixed(4))) : '2',
        share: used < 1 ? String(Number(((1 - used) * 100).toFixed(1))) : '10',
      },
    ]);
  };
  const preset = (key: string) => {
    const first = initialsAt2 !== null ? shareInput(initialsAt2) : '50';
    if (key === 'initials') onChange([{ multiple: '2', share: first }]);
    else onChange([{ multiple: '2', share: first }, { multiple: '5', share: '25' }, { multiple: '10', share: '25' }]);
  };

  const small = result && base?.chain === 'solana' && base.tokenClass === 'standard'
    ? result.sells.filter((s) => s.value - s.impactCost > 0 && s.value - s.impactCost < SOLANA_SMALL)
    : [];
  const smallTop = small.reduce((top, s) => Math.max(top, s.feeRate), 0);
  const soldOrder = result ? result.sells.reduce((sum, s) => sum + s.value - s.impactCost, 0) : 0;
  const top = result && result.sells.length > 0 ? result.sells[result.sells.length - 1]!.multiple : 1;
  const tone = result ? (result.realizedPnl >= 0 ? 'pos' : 'neg') : undefined;

  return (
    <section className="card p-4 sm:p-6 lg:col-span-2" aria-labelledby={`${id}-title`}>
      <CardTitle
        id={`${id}-title`}
        aside={
          result ? (
            <span className={cx('num text-xs', result.requestedShare > 1 + 1e-9 ? 'text-neg' : 'text-muted')}>
              {t.ladder.allocated(share(result.requestedShare))}
            </span>
          ) : null
        }
      >
        {t.ladder.title}
      </CardTitle>
      <p className="mt-1 text-xs text-muted">{t.ladder.lead}</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_3rem] gap-2 pb-2 text-xs font-medium text-muted">
            <span>{t.ladder.multiple}</span>
            <span>{t.ladder.share}</span>
          </div>
          <ol className="space-y-2">
            {rows.map((row, i) => (
              <li key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_3rem] items-start gap-2">
                <div className="min-w-0">
                  <NumberInput
                    id={`${id}-m-${i}`}
                    value={row.multiple}
                    onChange={(v) => setRow(i, { multiple: v })}
                    suffix="x"
                    placeholder="2"
                    ariaLabel={t.ladder.multipleLabel(i + 1)}
                    invalid={row.multiple !== '' && !(parseAmount(row.multiple) > 0)}
                  />
                </div>
                <div className="min-w-0">
                  <NumberInput
                    id={`${id}-s-${i}`}
                    value={row.share}
                    onChange={(v) => setRow(i, { share: v })}
                    suffix="%"
                    placeholder="50"
                    ariaLabel={t.ladder.shareLabel(i + 1)}
                    invalid={row.share !== '' && !(parseAmount(row.share) > 0 && parseAmount(row.share) <= 100)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onChange(rows.filter((_, j) => j !== i))}
                  aria-label={t.ladder.remove(i + 1)}
                  title={t.ladder.remove(i + 1)}
                  className="press inline-flex size-12 items-center justify-center rounded-xl border border-line text-muted hover:border-line-strong hover:text-ink"
                >
                  <X aria-hidden className="size-4" />
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={addRow}
            disabled={rows.length >= MAX_STEPS}
            className="press mt-2 inline-flex h-10 items-center gap-1.5 rounded-lg border border-dashed border-line-strong px-3 text-sm font-medium text-ink-2 hover:text-ink disabled:opacity-40"
          >
            <Plus aria-hidden className="size-4" />
            {t.ladder.add}
          </button>
          <div className="mt-4">
            <p className="text-xs font-medium text-ink-2">{t.ladder.presets}</p>
            <QuickPicks
              label={t.ladder.presets}
              values={[
                { value: 'initials', label: t.ladder.presetInitials },
                { value: 'ladder', label: t.ladder.presetLadder },
              ]}
              onPick={preset}
            />
          </div>
          {base && (
            <p className="mt-3 text-xs leading-relaxed text-muted">
              {initials !== null
                ? t.ladder.initialsHint(share(initials), multiple(firstUp))
                : t.ladder.initialsNever(multiple(firstUp))}
            </p>
          )}
        </div>

        <div className="min-w-0">
          {!base ? (
            <p className="text-sm text-muted">{t.ladder.needBuy}</p>
          ) : !result ? (
            <p className="text-sm text-muted">{t.ladder.empty}</p>
          ) : (
            <>
              <dl className="divide-y divide-line border-y border-line">
                <Row label={t.ladder.back} value={usd(result.proceeds)} strong />
                <Row
                  label={result.realizedPnl >= 0 ? t.ladder.realized : t.ladder.realizedLoss}
                  value={usd(result.realizedPnl, { signed: true })}
                  tone={tone}
                />
                <Row
                  label={t.ladder.fees}
                  value={usd(result.sellFees)}
                  sub={`${t.ladder.feesSub(result.sells.length)}${soldOrder > 0 ? ` · ${pct(result.sellFees / soldOrder)}` : ''}`}
                />
                <Row
                  label={t.ladder.initialsBack}
                  value={result.initialsBackAt !== null ? multiple(result.sells[result.initialsBackAt]!.multiple) : t.ladder.initialsNotBack}
                  tone={result.initialsBackAt !== null ? 'pos' : 'muted'}
                />
                {result.remainingShare > 1e-9 && (
                  <Row
                    label={t.ladder.left}
                    value={usd(result.remainingValue)}
                    sub={t.ladder.leftSub(share(result.remainingShare), multiple(top))}
                  />
                )}
              </dl>
              <div className="mt-4 space-y-2 empty:hidden">
                {result.requestedShare > 1 + 1e-9 && <Notice tone="warn">{t.ladder.over}</Notice>}
                {chain && result.sells.some((s) => s.belowMinSell) && (
                  <Notice tone="warn">{t.ladder.minSell(usd(chain.minSellUsd), chain.name)}</Notice>
                )}
                {small.length > 0 && <Notice>{t.ladder.smallSells(small.length, usd(SOLANA_SMALL), pct(smallTop))}</Notice>}
              </div>
            </>
          )}
        </div>
      </div>

      {result && (
        <div className="-mx-4 mt-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[20rem] text-sm">
            <caption className="sr-only">{t.ladder.title}</caption>
            <thead className="text-xs text-muted">
              <tr>
                <th scope="col" className="pb-2 text-left font-medium">
                  {t.ladder.colSell}
                </th>
                <th scope="col" className="pb-2 text-right font-medium">
                  {t.ladder.colFee}
                </th>
                <th scope="col" className="pb-2 text-right font-medium">
                  {t.ladder.colBack}
                </th>
                <th scope="col" className="pb-2 text-right font-medium">
                  {t.ladder.colTotal}
                </th>
              </tr>
            </thead>
            <tbody>
              {result.sells.map((s, i) => (
                <tr key={s.index} className="border-t border-line align-top">
                  <td className="py-2">
                    <span className="num text-ink">{multiple(s.multiple)}</span>
                    <span className="num text-ink-2"> · {share(s.sold)}</span>
                    {s.sold < s.share - 1e-9 && <span className="block text-[11px] text-neg">{t.ladder.asked(share(s.share))}</span>}
                    {entryMcap !== null && <span className="num block text-[11px] text-muted">{compactUsd(entryMcap * s.multiple)}</span>}
                  </td>
                  <td className="py-2 text-right">
                    <span className="num text-ink">{usd(s.fee)}</span>
                    <span className="num block text-[11px] text-muted">{pct(s.feeRate)}</span>
                  </td>
                  <td className="num py-2 text-right text-ink">{usd(s.proceeds)}</td>
                  <td className={cx('num py-2 text-right', i === result.initialsBackAt ? 'font-medium text-pos' : 'text-ink')}>
                    {usd(s.cumulative)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
