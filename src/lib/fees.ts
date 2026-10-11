/**
 * fomo spot trading fee schedule.
 *
 * Source: fomo Help Center (help.fomo.family), version dated 25 Sep 2026, as
 * quoted by independent guides (see src/lib/sources.ts). The schedule changed
 * several times in Aug-Sep 2026, so every rate lives here in one place and the
 * UI always shows the version date next to the result.
 */

export type ChainId = 'solana' | 'base' | 'bsc' | 'monad' | 'robinhood' | 'ethereum';

export interface ChainInfo {
  id: ChainId;
  name: string;
  /** fomo pays network gas, priority fees and token rent on this chain. */
  gasCovered: boolean;
  /** Smallest sell the app accepts, in USDC. */
  minSellUsd: number;
  /** Chain id used by the DexScreener API, when DexScreener indexes the chain. */
  dexscreenerId?: string;
}

export const CHAINS: readonly ChainInfo[] = [
  { id: 'solana', name: 'Solana', gasCovered: true, minSellUsd: 2, dexscreenerId: 'solana' },
  { id: 'base', name: 'Base', gasCovered: false, minSellUsd: 2, dexscreenerId: 'base' },
  { id: 'bsc', name: 'BNB Chain', gasCovered: false, minSellUsd: 2, dexscreenerId: 'bsc' },
  { id: 'monad', name: 'Monad', gasCovered: false, minSellUsd: 2, dexscreenerId: 'monad' },
  { id: 'robinhood', name: 'Robinhood Chain', gasCovered: false, minSellUsd: 2 },
  { id: 'ethereum', name: 'Ethereum', gasCovered: false, minSellUsd: 5, dexscreenerId: 'ethereum' },
];

export function getChain(id: ChainId): ChainInfo {
  const chain = CHAINS.find((c) => c.id === id);
  if (!chain) throw new Error(`Unknown chain: ${id}`);
  return chain;
}

export function chainFromDexscreener(dexId: string): ChainId | undefined {
  return CHAINS.find((c) => c.dexscreenerId === dexId)?.id;
}

export interface FeeBand {
  /** Exclusive upper bound of the order size in USDC. */
  upTo: number;
  kind: 'flat' | 'percent';
  /** USDC for flat bands, fraction (0.005 = 0.50%) for percent bands. */
  value: number;
}

export type TokenClass = 'standard' | 'major';

export const FEE_SCHEDULE = {
  version: '2026-09-25',
  solana: [
    { upTo: 5, kind: 'flat', value: 0.1 },
    { upTo: 47.5, kind: 'percent', value: 0.02 },
    { upTo: 190, kind: 'flat', value: 0.95 },
    { upTo: Infinity, kind: 'percent', value: 0.005 },
  ],
  standard: [{ upTo: Infinity, kind: 'percent', value: 0.005 }],
  /** Select major tokens. The flat band is published as "no more than 0.50 USDC", so it is an upper bound. */
  major: [
    { upTo: 1000, kind: 'flat', value: 0.5 },
    { upTo: Infinity, kind: 'percent', value: 0.0005 },
  ],
  /** Signing up through a referral link takes 10% off trading fees. */
  referralDiscount: 0.1,
} as const satisfies {
  version: string;
  solana: readonly FeeBand[];
  standard: readonly FeeBand[];
  major: readonly FeeBand[];
  referralDiscount: number;
};

export function bandsFor(chain: ChainId, tokenClass: TokenClass): readonly FeeBand[] {
  if (tokenClass === 'major') return FEE_SCHEDULE.major;
  return chain === 'solana' ? FEE_SCHEDULE.solana : FEE_SCHEDULE.standard;
}

export function findBand(bands: readonly FeeBand[], orderUsd: number): { band: FeeBand; index: number } {
  const index = bands.findIndex((b) => orderUsd < b.upTo);
  const i = index === -1 ? bands.length - 1 : index;
  return { band: bands[i]!, index: i };
}

export interface FeeQuote {
  /** fomo trading fee in USDC, after any referral discount. */
  fee: number;
  /** Fee before the referral discount. */
  feeBeforeDiscount: number;
  /** Fee divided by order size. */
  effectiveRate: number;
  band: FeeBand;
  bandIndex: number;
}

export function fomoFee(
  orderUsd: number,
  chain: ChainId,
  tokenClass: TokenClass = 'standard',
  referral = false,
): FeeQuote {
  const bands = bandsFor(chain, tokenClass);
  const size = Math.max(0, orderUsd);
  const { band, index } = findBand(bands, size);
  const raw = size <= 0 ? 0 : band.kind === 'flat' ? band.value : size * band.value;
  const fee = referral ? raw * (1 - FEE_SCHEDULE.referralDiscount) : raw;
  return {
    fee,
    feeBeforeDiscount: raw,
    effectiveRate: size > 0 ? fee / size : 0,
    band,
    bandIndex: index,
  };
}

export interface TradeInput {
  side: 'buy' | 'sell';
  orderUsd: number;
  chain: ChainId;
  tokenClass: TokenClass;
  referral: boolean;
  /** Network fee shown in the fomo quote, in USD. Ignored where fomo covers gas. */
  networkFeeUsd: number;
  /** Price impact / slippage as a fraction (0.01 = 1%). */
  priceImpact: number;
}

export interface TradeResult {
  quote: FeeQuote;
  networkFee: number;
  impactCost: number;
  totalCost: number;
  /** Total cost divided by order size. */
  allInRate: number;
  /** Value received: token value for a buy, USDC for a sell. */
  received: number;
  savedByReferral: number;
  belowMinSell: boolean;
}

export function tradeCost(input: TradeInput): TradeResult {
  const chain = getChain(input.chain);
  const order = Math.max(0, input.orderUsd);
  const quote = fomoFee(order, input.chain, input.tokenClass, input.referral);
  const networkFee = chain.gasCovered ? 0 : Math.max(0, input.networkFeeUsd);
  const impact = clamp(input.priceImpact, 0, 1);
  const impactCost = order * impact;
  const totalCost = quote.fee + networkFee + impactCost;
  const plain = fomoFee(order, input.chain, input.tokenClass, false);
  return {
    quote,
    networkFee,
    impactCost,
    totalCost,
    allInRate: order > 0 ? totalCost / order : 0,
    received: Math.max(0, order - totalCost),
    savedByReferral: input.referral ? plain.fee - quote.fee : 0,
    belowMinSell: input.side === 'sell' && order > 0 && order < chain.minSellUsd,
  };
}

export function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}
