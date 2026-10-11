import { t } from './copy';

/**
 * Absolute origin for canonical, Open Graph and sitemap URLs. Set SITE_URL when
 * deploying anywhere other than Vercel, which provides its own production URL.
 */
export const SITE_URL =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

export const SITE_NAME = 'FMath';
export const SITE_TITLE = t.meta.title;
export const SITE_DESCRIPTION =
  'Independent calculator for fomo traders: per-chain trade fees, break-even, net profit, and perps fees with liquidation price. Live market data from DexScreener and Hyperliquid.';
