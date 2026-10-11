import { bandsFor, FEE_SCHEDULE, type ChainId, type FeeBand, type TokenClass } from '../lib/fees';
import { pct, usd } from '../lib/format';
import { t } from '../lib/copy';
import { cx } from '../lib/cx';

export function bandRange(bands: readonly FeeBand[], i: number): string {
  const band = bands[i]!;
  const lo = i > 0 ? bands[i - 1]!.upTo : 0;
  if (i === 0 && band.upTo === Infinity) return t.fee.any;
  if (i === 0) return t.fee.below(usd(band.upTo));
  if (band.upTo === Infinity) return t.fee.from(usd(lo));
  return t.fee.range(usd(lo), usd(band.upTo));
}

export function bandFee(band: FeeBand, referral: boolean): string {
  const k = referral ? 1 - FEE_SCHEDULE.referralDiscount : 1;
  if (band.kind === 'flat') return t.fee.flat(usd(band.value * k));
  return t.fee.percent(pct(band.value * k, { digits: band.value * k < 0.001 ? 3 : 2 }));
}

export function BandTable(props: {
  chain: ChainId;
  tokenClass: TokenClass;
  referral: boolean;
  activeIndex?: number;
  caption?: string;
}) {
  const bands = bandsFor(props.chain, props.tokenClass);
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <table className="w-full text-left text-sm">
        {props.caption && <caption className="sr-only">{props.caption}</caption>}
        <thead className="bg-surface-2 text-xs text-muted">
          <tr>
            <th scope="col" className="px-3.5 py-2.5 font-medium">
              {t.method.sizeCol}
            </th>
            <th scope="col" className="px-3.5 py-2.5 text-right font-medium">
              {t.method.feeCol}
            </th>
          </tr>
        </thead>
        <tbody>
          {bands.map((b, i) => {
            const active = i === props.activeIndex;
            return (
              <tr key={i} className={cx('border-t border-line', active && 'bg-accent-wash')} aria-current={active || undefined}>
                <td className="num px-3.5 py-2.5 text-ink-2">
                  <span className="inline-flex items-center gap-2">
                    {active && <span aria-hidden className="size-1.5 rounded-full bg-accent-strong" />}
                    {bandRange(bands, i)}
                  </span>
                </td>
                <td className="num px-3.5 py-2.5 text-right text-ink">{bandFee(b, props.referral)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
