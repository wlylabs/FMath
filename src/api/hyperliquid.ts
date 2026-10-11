import type { MarginTier, PerpVenue } from '../lib/perps';

/** Hyperliquid public info endpoint, https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals */
const INFO_URL = 'https://api.hyperliquid.xyz/info';

/** trade.xyz is the HIP-3 perp dex named "xyz" on Hyperliquid. */
const DEX_NAME: Record<PerpVenue, string | undefined> = {
  hyperliquid: undefined,
  xyz: 'xyz',
};

interface UniverseAsset {
  name: string;
  szDecimals: number;
  maxLeverage: number;
  marginTableId?: number;
  onlyIsolated?: boolean;
  isDelisted?: boolean;
  growthMode?: string;
}

interface AssetCtx {
  funding?: string;
  openInterest?: string;
  markPx?: string;
  oraclePx?: string;
  midPx?: string | null;
  dayNtlVlm?: string;
  prevDayPx?: string;
}

type MarginTable = [number, { description?: string; marginTiers: { lowerBound: string; maxLeverage: number }[] }];

interface Meta {
  universe: UniverseAsset[];
  marginTables?: MarginTable[];
}

export interface PerpMarket {
  venue: PerpVenue;
  /** Coin id as the API names it, e.g. "BTC" or "xyz:TSLA". */
  coin: string;
  /** Name without the dex prefix. */
  label: string;
  maxLeverage: number;
  szDecimals: number;
  markPx: number;
  oraclePx: number;
  fundingHourly: number;
  dayVolume: number;
  change24h: number | null;
  tiers: MarginTier[];
  /** True when the API reports growth mode for this asset; null when it does not say. */
  growthMode: boolean | null;
}

export function parseMarkets(venue: PerpVenue, payload: unknown): PerpMarket[] {
  if (!Array.isArray(payload) || payload.length < 2) throw new Error('Unexpected Hyperliquid response');
  const meta = payload[0] as Meta;
  const ctxs = payload[1] as AssetCtx[];
  const tables = new Map<number, MarginTier[]>();
  for (const entry of meta.marginTables ?? []) {
    const [id, table] = entry;
    tables.set(
      id,
      (table?.marginTiers ?? []).map((t) => ({ lowerBound: Number(t.lowerBound), maxLeverage: Number(t.maxLeverage) })),
    );
  }
  const out: PerpMarket[] = [];
  meta.universe.forEach((asset, i) => {
    const ctx = ctxs[i];
    if (!ctx || asset.isDelisted) return;
    const markPx = Number(ctx.markPx);
    if (!Number.isFinite(markPx) || markPx <= 0) return;
    const tableTiers = asset.marginTableId !== undefined ? tables.get(asset.marginTableId) : undefined;
    const tiers =
      tableTiers && tableTiers.length > 0 && tableTiers.every((t) => t.maxLeverage > 0 && Number.isFinite(t.lowerBound))
        ? tableTiers
        : [{ lowerBound: 0, maxLeverage: asset.maxLeverage }];
    const prev = Number(ctx.prevDayPx);
    out.push({
      venue,
      coin: asset.name,
      label: asset.name.includes(':') ? asset.name.split(':')[1]! : asset.name,
      maxLeverage: asset.maxLeverage,
      szDecimals: asset.szDecimals,
      markPx,
      oraclePx: Number(ctx.oraclePx) || markPx,
      fundingHourly: Number(ctx.funding) || 0,
      dayVolume: Number(ctx.dayNtlVlm) || 0,
      change24h: Number.isFinite(prev) && prev > 0 ? markPx / prev - 1 : null,
      tiers,
      growthMode: typeof asset.growthMode === 'string' ? asset.growthMode === 'enabled' : null,
    });
  });
  return out.sort((a, b) => b.dayVolume - a.dayVolume);
}

export async function fetchPerpMarkets(venue: PerpVenue, signal?: AbortSignal): Promise<PerpMarket[]> {
  const dex = DEX_NAME[venue];
  const res = await fetch(INFO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dex ? { type: 'metaAndAssetCtxs', dex } : { type: 'metaAndAssetCtxs' }),
    signal,
  });
  if (!res.ok) throw new Error(`Hyperliquid ${res.status}`);
  return parseMarkets(venue, await res.json());
}
