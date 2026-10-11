import { getChain } from './fees';
import { buyLeg, sellLeg, type RoundTripInput } from './roundtrip';

/**
 * An exit plan: sell the bag in steps as the price rises instead of all at
 * once. Every step is its own sell, so it pays its own fomo fee (in the band
 * its size falls in) and its own network fee. On Solana that makes small
 * steps expensive: a 50 USDC sell pays the 0.95 USDC flat band, 1.90%.
 */
export interface LadderStep {
  /** Sell price divided by entry price (2 = the token doubled). */
  multiple: number;
  /** Share of the tokens bought that this step sells, 0 to 1. */
  share: number;
}

export interface LadderSell extends LadderStep {
  /** Position of this step in the input list. */
  index: number;
  /** Share actually sold: the requested share, cut down to what is left of the bag. */
  sold: number;
  /** Market value of the tokens sold, at this step's price. */
  value: number;
  impactCost: number;
  fee: number;
  networkFee: number;
  /** fomo fee divided by the sell order. */
  feeRate: number;
  /** USDC back from this sell. */
  proceeds: number;
  /** USDC back from this sell and every earlier one. */
  cumulative: number;
  belowMinSell: boolean;
}

export interface LadderResult {
  /** Sells in the order they fill: lowest price first. */
  sells: LadderSell[];
  positionAtEntry: number;
  /** USDC back from every sell. */
  proceeds: number;
  /** fomo fees, network fees and price impact across every sell. */
  sellCosts: number;
  /** fomo fees across every sell. */
  sellFees: number;
  /** Share of the bag the steps ask for, before any is cut down. */
  requestedShare: number;
  /** Share of the bag still held after the last sell. */
  remainingShare: number;
  /** Market value of the tokens still held, at the highest sell price. */
  remainingValue: number;
  /** USDC back minus the amount spent. Ignores the tokens still held. */
  realizedPnl: number;
  /** Position in `sells` of the first sell that brings the amount spent back, or null. */
  initialsBackAt: number | null;
}

export function exitLadder(input: RoundTripInput, steps: readonly LadderStep[]): LadderResult {
  const buyUsd = Math.max(0, input.buyUsd);
  const { positionAtEntry } = buyLeg(input);
  const minSell = getChain(input.chain).minSellUsd;
  const ordered = steps
    .map((step, index) => ({ multiple: Math.max(0, step.multiple), share: Math.max(0, step.share), index }))
    .filter((s) => Number.isFinite(s.multiple) && Number.isFinite(s.share))
    // a sell at a lower price fills first as the price climbs; ties keep the input order
    .sort((a, b) => a.multiple - b.multiple || a.index - b.index);

  let left = 1;
  let cumulative = 0;
  let initialsBackAt: number | null = null;
  const sells: LadderSell[] = [];
  for (const step of ordered) {
    const sold = Math.min(step.share, left);
    left = Math.max(0, left - sold);
    const value = positionAtEntry * sold * step.multiple;
    const leg = sellLeg(input, value);
    cumulative += leg.proceeds;
    if (initialsBackAt === null && buyUsd > 0 && cumulative >= buyUsd) initialsBackAt = sells.length;
    sells.push({
      ...step,
      sold,
      value,
      impactCost: leg.sellImpactCost,
      fee: leg.sellFee,
      networkFee: leg.sellNetworkFee,
      feeRate: leg.sellOrder > 0 ? leg.sellFee / leg.sellOrder : 0,
      proceeds: leg.proceeds,
      cumulative,
      belowMinSell: leg.sellOrder > 0 && leg.sellOrder < minSell,
    });
  }

  const top = ordered.length > 0 ? ordered[ordered.length - 1]!.multiple : 1;
  return {
    sells,
    positionAtEntry,
    proceeds: cumulative,
    sellCosts: sells.reduce((sum, s) => sum + s.impactCost + s.fee + s.networkFee, 0),
    sellFees: sells.reduce((sum, s) => sum + s.fee, 0),
    requestedShare: ordered.reduce((sum, s) => sum + s.share, 0),
    remainingShare: left,
    remainingValue: positionAtEntry * left * top,
    realizedPnl: cumulative - buyUsd,
    initialsBackAt,
  };
}

/**
 * Share of the bag to sell at `multiple` so the USDC back equals the amount
 * spent, fees included ("take your initials out"). Null when selling the
 * whole bag at that price is not enough. Proceeds rise with the share sold
 * (every fee band grows slower than the order), so bisection converges.
 */
export function shareForInitials(input: RoundTripInput, multiple: number): number | null {
  const buyUsd = Math.max(0, input.buyUsd);
  if (!(buyUsd > 0) || !(multiple > 0)) return null;
  const { positionAtEntry } = buyLeg(input);
  const back = (share: number) => sellLeg(input, positionAtEntry * share * multiple).proceeds;
  if (back(1) < buyUsd) return null;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (back(mid) >= buyUsd) hi = mid;
    else lo = mid;
  }
  return hi;
}

/** One step as typed: a price multiple and a percent of the bag. */
export interface LadderRow {
  multiple: string;
  share: string;
}

export const MAX_STEPS = 6;

/** Rows from saved state, dropping anything that is not a row. */
export function ladderRows(value: unknown): LadderRow[] | null {
  if (!Array.isArray(value)) return null;
  return value
    .filter(
      (r): r is LadderRow =>
        !!r && typeof r === 'object' && typeof (r as LadderRow).multiple === 'string' && typeof (r as LadderRow).share === 'string',
    )
    .slice(0, MAX_STEPS)
    .map((r) => ({ multiple: r.multiple.slice(0, 16), share: r.share.slice(0, 16) }));
}

/** Rows for a shared link: "2:50,5:25". Rows that are not numbers are left out. */
export function ladderParam(steps: readonly LadderStep[]): string {
  return steps.map((s) => `${Number(s.multiple.toFixed(6))}:${Number((s.share * 100).toFixed(4))}`).join(',');
}

export function parseLadderParam(raw: string): LadderRow[] {
  const rows: LadderRow[] = [];
  for (const part of raw.split(',')) {
    const [m, p] = part.split(':').map(Number);
    if (m !== undefined && p !== undefined && m > 0 && p > 0 && p <= 100) rows.push({ multiple: String(m), share: String(p) });
    if (rows.length === MAX_STEPS) break;
  }
  return rows;
}
