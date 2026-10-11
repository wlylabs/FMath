import { fomoFee, getChain, clamp, type ChainId, type TokenClass } from './fees';

/**
 * Buy now, sell later at `multiple` times the entry price. Every cost fomo or
 * the market takes is charged on the leg where it happens: fomo fee and network
 * fee on both the buy and the sell, price impact on both fills.
 */
export interface RoundTripInput {
  chain: ChainId;
  tokenClass: TokenClass;
  referral: boolean;
  buyUsd: number;
  /** Exit price divided by entry price (2 = the token doubled). */
  multiple: number;
  /** Network fee per transaction in USD, ignored where fomo covers gas. */
  networkFeeUsd: number;
  buyImpact: number;
  sellImpact: number;
}

export interface RoundTripResult {
  buyFee: number;
  buyNetworkFee: number;
  buyImpactCost: number;
  /** Market value of the tokens right after the buy fills. */
  positionAtEntry: number;
  /** Market value of the same tokens at the exit price. */
  positionAtExit: number;
  sellImpactCost: number;
  sellFee: number;
  sellNetworkFee: number;
  /** USDC back in the balance after the sell. */
  proceeds: number;
  totalCosts: number;
  pnl: number;
  roi: number;
  /** Price multiple needed for proceeds to equal the amount spent. */
  breakEvenMultiple: number;
}

export function roundTrip(input: RoundTripInput): RoundTripResult {
  const buyUsd = Math.max(0, input.buyUsd);
  const multiple = Math.max(0, input.multiple);
  const legs = legsAt(input, buyUsd, multiple);
  const pnl = legs.proceeds - buyUsd;
  return {
    ...legs,
    totalCosts:
      legs.buyFee + legs.buyNetworkFee + legs.buyImpactCost + legs.sellImpactCost + legs.sellFee + legs.sellNetworkFee,
    pnl,
    roi: buyUsd > 0 ? pnl / buyUsd : 0,
    breakEvenMultiple: multipleForProceeds(input, buyUsd),
  };
}

function legsAt(input: RoundTripInput, buyUsd: number, multiple: number) {
  const chain = getChain(input.chain);
  const network = chain.gasCovered ? 0 : Math.max(0, input.networkFeeUsd);
  const buyFee = buyUsd > 0 ? fomoFee(buyUsd, input.chain, input.tokenClass, input.referral).fee : 0;
  const buyNetworkFee = buyUsd > 0 ? network : 0;
  const afterCosts = Math.max(0, buyUsd - buyFee - buyNetworkFee);
  const buyImpactCost = afterCosts * clamp(input.buyImpact, 0, 1);
  const positionAtEntry = afterCosts - buyImpactCost;
  const positionAtExit = positionAtEntry * multiple;
  const sellImpactCost = positionAtExit * clamp(input.sellImpact, 0, 1);
  const sellOrder = positionAtExit - sellImpactCost;
  const sellFee = sellOrder > 0 ? fomoFee(sellOrder, input.chain, input.tokenClass, input.referral).fee : 0;
  const sellNetworkFee = sellOrder > 0 ? network : 0;
  const proceeds = Math.max(0, sellOrder - sellFee - sellNetworkFee);
  return {
    buyFee,
    buyNetworkFee,
    buyImpactCost,
    positionAtEntry,
    positionAtExit,
    sellImpactCost,
    sellFee,
    sellNetworkFee,
    proceeds,
  };
}

/**
 * Smallest price multiple whose sell returns `target` USDC. Proceeds rise
 * monotonically with the multiple (every fee band is continuous and grows
 * slower than the order), so bisection is exact to floating point.
 */
export function multipleForProceeds(input: RoundTripInput, target: number): number {
  const buyUsd = Math.max(0, input.buyUsd);
  if (buyUsd <= 0 || target <= 0) return 0;
  const proceedsAt = (m: number) => legsAt(input, buyUsd, m).proceeds;
  if (legsAt(input, buyUsd, 1).positionAtEntry <= 0) return Infinity;
  let lo = 0;
  let hi = 1;
  while (proceedsAt(hi) < target) {
    lo = hi;
    hi *= 2;
    if (hi > 1e15) return Infinity;
  }
  for (let i = 0; i < 200 && hi - lo > hi * 1e-12; i++) {
    const mid = (lo + hi) / 2;
    if (proceedsAt(mid) >= target) hi = mid;
    else lo = mid;
  }
  return hi;
}
