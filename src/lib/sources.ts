export interface Source {
  label: string;
  url: string;
  /** What the calculator takes from it. */
  use: { id: string; en: string };
  kind: 'official' | 'secondary' | 'api' | 'opensource';
}

/** Date the fee schedule in fees.ts and perps.ts was last checked against these sources. */
export const LAST_CHECKED = '2026-10-11';

export const SOURCES: Source[] = [
  {
    label: 'fomo Help Center',
    url: 'https://help.fomo.family',
    use: {
      id: 'Sumber resmi jadwal biaya spot, gas yang ditanggung, dan minimum jual. Cek di sini sebelum trade.',
      en: 'Official source for spot fees, covered gas and minimum sells. Check it before you trade.',
    },
    kind: 'official',
  },
  {
    label: 'fomoappguide.com: fomo fees explained',
    url: 'https://fomoappguide.com/guides/fees/fomo-fees-explained',
    use: {
      id: 'Kutipan band biaya Solana dan tarif chain lain dari Help Center versi 25 Sep 2026.',
      en: 'Quotes the Solana bands and other-chain rates from the 25 Sep 2026 Help Center.',
    },
    kind: 'secondary',
  },
  {
    label: 'fomotrading.app: fomo perps',
    url: 'https://fomotrading.app/perps/',
    use: {
      id: 'Builder fee perps 0,05% per sisi (0,045% dengan referral), venue Hyperliquid dan trade.xyz.',
      en: 'Perps builder fee 0.05% per side (0.045% with a referral), Hyperliquid and trade.xyz venues.',
    },
    kind: 'secondary',
  },
  {
    label: 'Hyperliquid Docs: Fees',
    url: 'https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees',
    use: { id: 'Tarif taker 0,045% dan maker 0,015% di tier dasar.', en: 'Base-tier taker 0.045% and maker 0.015%.' },
    kind: 'official',
  },
  {
    label: 'Hyperliquid Docs: Liquidations',
    url: 'https://hyperliquid.gitbook.io/hyperliquid-docs/trading/liquidations',
    use: { id: 'Rumus harga likuidasi.', en: 'Liquidation price formula.' },
    kind: 'official',
  },
  {
    label: 'Hyperliquid Docs: Margin tiers',
    url: 'https://hyperliquid.gitbook.io/hyperliquid-docs/trading/margin-tiers',
    use: { id: 'Maintenance margin bertingkat dan deduction.', en: 'Tiered maintenance margin and deduction.' },
    kind: 'official',
  },
  {
    label: 'trade.xyz Docs: Fees',
    url: 'https://docs.trade.xyz/perp-mechanics/fees',
    use: {
      id: 'Pasar HIP-3 dikenai 2x tarif standar; growth mode memotong biaya total minimal 90%.',
      en: 'HIP-3 markets pay 2x the standard rate; growth mode cuts all-in fees by at least 90%.',
    },
    kind: 'official',
  },
  {
    label: 'Hyperliquid info API',
    url: 'https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals',
    use: {
      id: 'Harga mark, funding per jam, leverage maksimum, dan margin tier secara live.',
      en: 'Live mark price, hourly funding, max leverage and margin tiers.',
    },
    kind: 'api',
  },
  {
    label: 'DexScreener API',
    url: 'https://docs.dexscreener.com/api/reference',
    use: {
      id: 'Harga, market cap, dan likuiditas token secara live.',
      en: 'Live token price, market cap and liquidity.',
    },
    kind: 'api',
  },
  {
    label: 'hyperliquid-dex/hyperliquid-python-sdk',
    url: 'https://github.com/hyperliquid-dex/hyperliquid-python-sdk',
    use: { id: 'Referensi bentuk respons info API.', en: 'Reference for the info API response shape.' },
    kind: 'opensource',
  },
  {
    label: 'lucide-icons/lucide',
    url: 'https://github.com/lucide-icons/lucide',
    use: { id: 'Ikon antarmuka.', en: 'Interface icons.' },
    kind: 'opensource',
  },
  {
    label: 'Google Fonts: Geist & Geist Mono',
    url: 'https://fonts.google.com/specimen/Geist',
    use: { id: 'Tipografi.', en: 'Typography.' },
    kind: 'opensource',
  },
];
