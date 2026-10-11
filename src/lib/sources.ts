export interface Source {
  label: string;
  url: string;
  /** What the calculator takes from it. */
  use: string;
  kind: 'official' | 'secondary' | 'api' | 'opensource';
}

/** Date the fee schedule in fees.ts and perps.ts was last checked against these sources. */
export const LAST_CHECKED = '2026-10-11';

export const SOURCES: Source[] = [
  {
    label: 'fomo Help Center',
    url: 'https://help.fomo.family',
    use: 'Official source for spot fees, covered gas and minimum sells. Check it before you trade.',
    kind: 'official',
  },
  {
    label: 'fomoappguide.com: fomo fees explained',
    url: 'https://fomoappguide.com/guides/fees/fomo-fees-explained',
    use: 'Quotes the Solana bands and other-chain rates from the 25 Sep 2026 Help Center.',
    kind: 'secondary',
  },
  {
    label: 'fomotrading.app: fomo perps',
    url: 'https://fomotrading.app/perps/',
    use: 'Perps builder fee 0.05% per side (0.045% with a referral), Hyperliquid and trade.xyz venues.',
    kind: 'secondary',
  },
  {
    label: 'Hyperliquid Docs: Fees',
    url: 'https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees',
    use: 'Base-tier taker 0.045% and maker 0.015%.',
    kind: 'official',
  },
  {
    label: 'Hyperliquid Docs: Liquidations',
    url: 'https://hyperliquid.gitbook.io/hyperliquid-docs/trading/liquidations',
    use: 'Liquidation price formula.',
    kind: 'official',
  },
  {
    label: 'Hyperliquid Docs: Margin tiers',
    url: 'https://hyperliquid.gitbook.io/hyperliquid-docs/trading/margin-tiers',
    use: 'Tiered maintenance margin and deduction.',
    kind: 'official',
  },
  {
    label: 'trade.xyz Docs: Fees',
    url: 'https://docs.trade.xyz/perp-mechanics/fees',
    use: 'HIP-3 markets pay 2x the standard rate; growth mode cuts all-in fees by at least 90%.',
    kind: 'official',
  },
  {
    label: 'Hyperliquid Docs: Take profit and stop loss orders',
    url: 'https://hyperliquid.gitbook.io/hyperliquid-docs/trading/take-profit-and-stop-loss-orders-tp-sl',
    use: 'TP/SL trigger on the mark price and fill as market orders with up to 10% slippage, so the stop pays the taker fee.',
    kind: 'official',
  },
  {
    label: 'DEXTools: Memecoin trading strategy, when to take profits',
    url: 'https://www.dextools.io/tutorials/memecoin-trading-strategy-take-profits',
    use: 'Laddered exits and taking the initial stake out at 2x, which the exit plan presets follow.',
    kind: 'secondary',
  },
  {
    label: 'Hyperliquid info API',
    url: 'https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals',
    use: 'Live mark price, hourly funding, max leverage and margin tiers.',
    kind: 'api',
  },
  {
    label: 'DexScreener API',
    url: 'https://docs.dexscreener.com/api/reference',
    use: 'Live token price, market cap and liquidity.',
    kind: 'api',
  },
  {
    label: 'hyperliquid-dex/hyperliquid-python-sdk',
    url: 'https://github.com/hyperliquid-dex/hyperliquid-python-sdk',
    use: 'Reference for the info API response shape.',
    kind: 'opensource',
  },
  {
    label: 'siamak/calc-trade',
    url: 'https://github.com/siamak/calc-trade',
    use: 'Reference for risk-based sizing: risked capital and stop distance in, margin and position size out.',
    kind: 'opensource',
  },
  {
    label: 'cooljoe623/Tradesizer',
    url: 'https://github.com/cooljoe623/Tradesizer',
    use: 'Reference for the risk : reward output: entry, stop and target are inputs, the size is the output.',
    kind: 'opensource',
  },
  {
    label: 'vercel/next.js',
    url: 'https://github.com/vercel/next.js',
    use: 'Framework; the landing page is prerendered to static HTML.',
    kind: 'opensource',
  },
  {
    label: 'lucide-icons/lucide',
    url: 'https://github.com/lucide-icons/lucide',
    use: 'Interface icons.',
    kind: 'opensource',
  },
  {
    label: 'vercel/geist-font',
    url: 'https://github.com/vercel/geist-font',
    use: 'Geist and Geist Mono typefaces, self-hosted through the geist package.',
    kind: 'opensource',
  },
];
