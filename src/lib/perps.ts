/**
 * fomo perps route orders to Hyperliquid (crypto) and trade.xyz (HIP-3: stocks,
 * indices, commodities). fomo adds a builder fee on every fill; the venue
 * charges its own maker or taker fee on top.
 *
 * Margin and liquidation math follow the Hyperliquid docs:
 * - maintenance margin rate = half the initial margin rate at the tier's max leverage
 * - maintenance margin = notional * rate - maintenance deduction (margin tiers)
 * - liq_price = price - side * margin_available / position_size / (1 - l * side)
 */

export type PerpVenue = 'hyperliquid' | 'xyz';
export type PerpSide = 'long' | 'short';
export type OrderKind = 'taker' | 'maker';

export const PERPS_FEES = {
  /** fomo builder fee per side, and with a referral (10% off). */
  builder: 0.0005,
  builderReferral: 0.00045,
  venues: {
    /** Hyperliquid base tier (under $5M 14-day volume). */
    hyperliquid: { taker: 0.00045, maker: 0.00015 },
    /** HIP-3 standard rate is 2x the validator-operated perps; growth mode cuts all-in fees by 90%. */
    xyz: { taker: 0.0009, maker: 0.0003, growthTaker: 0.00009, growthMaker: 0.00003 },
  },
} as const;

export function venueFeeRate(venue: PerpVenue, kind: OrderKind, growthMode: boolean): number {
  if (venue === 'hyperliquid') return PERPS_FEES.venues.hyperliquid[kind];
  const v = PERPS_FEES.venues.xyz;
  if (growthMode) return kind === 'taker' ? v.growthTaker : v.growthMaker;
  return v[kind];
}

export interface MarginTier {
  /** Notional (USD) where this tier starts. */
  lowerBound: number;
  maxLeverage: number;
}

export interface MaintenanceTier extends MarginTier {
  rate: number;
  deduction: number;
}

export function maintenanceSchedule(tiers: readonly MarginTier[]): MaintenanceTier[] {
  const sorted = [...tiers].sort((a, b) => a.lowerBound - b.lowerBound);
  const out: MaintenanceTier[] = [];
  sorted.forEach((t, i) => {
    const rate = 1 / (2 * t.maxLeverage);
    const prev = out[i - 1];
    const deduction = prev ? prev.deduction + t.lowerBound * (rate - prev.rate) : 0;
    out.push({ ...t, rate, deduction });
  });
  return out;
}

export function tierFor(schedule: readonly MaintenanceTier[], notional: number): MaintenanceTier {
  let tier = schedule[0]!;
  for (const t of schedule) if (notional >= t.lowerBound) tier = t;
  return tier;
}

export function maintenanceMargin(schedule: readonly MaintenanceTier[], notional: number): number {
  const t = tierFor(schedule, notional);
  return Math.max(0, notional * t.rate - t.deduction);
}

/**
 * Isolated-margin liquidation price. Returns null when the position cannot be
 * liquidated at any positive price (a long at or below 1x).
 */
export function liquidationPrice(args: {
  side: PerpSide;
  entry: number;
  size: number;
  isolatedMargin: number;
  tiers: readonly MarginTier[];
}): number | null {
  const { entry, size, isolatedMargin } = args;
  if (!(entry > 0) || !(size > 0) || args.tiers.length === 0) return null;
  const schedule = maintenanceSchedule(args.tiers);
  const s = args.side === 'long' ? 1 : -1;
  const solve = (t: MaintenanceTier) =>
    (size * entry - s * (isolatedMargin + t.deduction)) / (size * (1 - s * t.rate));
  let fallback: number | null = null;
  for (let i = 0; i < schedule.length; i++) {
    const t = schedule[i]!;
    const p = solve(t);
    if (i === 0) fallback = p;
    const upper = schedule[i + 1]?.lowerBound ?? Infinity;
    const notional = size * p;
    if (notional >= t.lowerBound && notional < upper) {
      return p > 0 ? p : null;
    }
  }
  return fallback !== null && fallback > 0 ? fallback : null;
}

export interface PerpInput {
  side: PerpSide;
  margin: number;
  leverage: number;
  entry: number;
  exit: number;
  builderRate: number;
  venueRate: number;
  /** Hourly funding rate as a fraction; positive means longs pay shorts. */
  fundingHourly: number;
  holdHours: number;
  tiers: readonly MarginTier[];
}

export interface PerpResult {
  notional: number;
  size: number;
  feeRate: number;
  openFee: number;
  closeFee: number;
  /** Positive is a cost to this position, negative is funding received. */
  funding: number;
  grossPnl: number;
  netPnl: number;
  roe: number;
  liquidation: number | null;
  /** Price move from entry to liquidation, as a fraction of entry. */
  liquidationDistance: number | null;
  breakEven: number | null;
  /** Highest leverage the venue allows at this notional. */
  tierMaxLeverage: number | null;
}

export function perpTrade(input: PerpInput): PerpResult {
  const margin = Math.max(0, input.margin);
  const leverage = Math.max(1, input.leverage);
  const entry = Math.max(0, input.entry);
  const exit = Math.max(0, input.exit);
  const s = input.side === 'long' ? 1 : -1;
  const notional = margin * leverage;
  const size = entry > 0 ? notional / entry : 0;
  const feeRate = input.builderRate + input.venueRate;
  const openFee = notional * feeRate;
  const closeFee = size * exit * feeRate;
  const funding = s * notional * input.fundingHourly * Math.max(0, input.holdHours);
  const grossPnl = s * size * (exit - entry);
  const netPnl = grossPnl - openFee - closeFee - funding;
  const liquidation = liquidationPrice({
    side: input.side,
    entry,
    size,
    isolatedMargin: margin,
    tiers: input.tiers,
  });
  let breakEven: number | null = null;
  if (size > 0) {
    const fixed = openFee + funding;
    const p = (size * entry + s * fixed) / (size * (1 - s * feeRate));
    breakEven = p > 0 ? p : null;
  }
  const tierMaxLeverage =
    input.tiers.length > 0 ? tierFor(maintenanceSchedule(input.tiers), notional).maxLeverage : null;
  return {
    notional,
    size,
    feeRate,
    openFee,
    closeFee,
    funding,
    grossPnl,
    netPnl,
    roe: margin > 0 ? netPnl / margin : 0,
    liquidation,
    liquidationDistance: liquidation !== null && entry > 0 ? Math.abs(liquidation - entry) / entry : null,
    breakEven,
    tierMaxLeverage,
  };
}

export interface StopResult {
  /** Net loss if the stop fills, as a positive amount: price move, both fees and funding. */
  loss: number;
  /** Net loss divided by margin. */
  lossOfMargin: number;
  /** Price move from entry to the stop, as a fraction of entry. */
  distance: number;
  /** Net PnL at the exit divided by the loss at the stop; null when the exit does not make money. */
  rewardRisk: number | null;
  /** The stop sits at or past the liquidation price, so the position is liquidated first. */
  beyondLiquidation: boolean;
}

/**
 * Outcome of a stop-loss at `stop`. Stops trigger as market orders, so the
 * close pays `stopFeeRate` (the taker rate) whatever the entry order was.
 * Null when the stop is on the profit side of entry or not a price.
 */
export function stopLoss(input: PerpInput, stop: number, stopFeeRate: number): StopResult | null {
  const result = perpTrade(input);
  const s = input.side === 'long' ? 1 : -1;
  if (!(stop > 0) || !(result.size > 0) || s * (stop - input.entry) >= 0) return null;
  const closeFee = result.size * stop * stopFeeRate;
  const loss = -(s * result.size * (stop - input.entry) - result.openFee - closeFee - result.funding);
  const liq = result.liquidation;
  return {
    loss,
    lossOfMargin: input.margin > 0 ? loss / input.margin : 0,
    distance: Math.abs(stop - input.entry) / input.entry,
    rewardRisk: result.netPnl > 0 && loss > 0 ? result.netPnl / loss : null,
    beyondLiquidation: liq !== null && s * (stop - liq) <= 0,
  };
}

/**
 * Margin whose net loss at `stop` equals `risk`, at the input's leverage.
 * Price move, fees and funding all scale with the position, so the loss is
 * linear in margin. Null when the stop does not lose money.
 */
export function marginForRisk(input: PerpInput, stop: number, stopFeeRate: number, risk: number): number | null {
  if (!(risk > 0)) return null;
  const perUnit = stopLoss({ ...input, margin: 1 }, stop, stopFeeRate)?.loss ?? 0;
  return perUnit > 0 ? risk / perUnit : null;
}
