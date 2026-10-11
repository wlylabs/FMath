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

/** The REST endpoint sends these as strings; the docs type the socket's as numbers, so accept both. */
interface AssetCtx {
  funding?: string | number;
  openInterest?: string | number;
  markPx?: string | number;
  oraclePx?: string | number;
  midPx?: string | number | null;
  dayNtlVlm?: string | number;
  prevDayPx?: string | number;
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

/** The fields of a market that move with the price; null when the context has no usable mark. */
export type LiveFields = Pick<PerpMarket, 'markPx' | 'oraclePx' | 'fundingHourly' | 'dayVolume' | 'change24h'>;

function liveFields(ctx: AssetCtx): LiveFields | null {
  const markPx = Number(ctx.markPx);
  if (!Number.isFinite(markPx) || markPx <= 0) return null;
  const prev = Number(ctx.prevDayPx);
  return {
    markPx,
    oraclePx: Number(ctx.oraclePx) || markPx,
    fundingHourly: Number(ctx.funding) || 0,
    dayVolume: Number(ctx.dayNtlVlm) || 0,
    change24h: Number.isFinite(prev) && prev > 0 ? markPx / prev - 1 : null,
  };
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
    const live = liveFields(ctx);
    if (!live) return;
    const tableTiers = asset.marginTableId !== undefined ? tables.get(asset.marginTableId) : undefined;
    const tiers =
      tableTiers && tableTiers.length > 0 && tableTiers.every((t) => t.maxLeverage > 0 && Number.isFinite(t.lowerBound))
        ? tableTiers
        : [{ lowerBound: 0, maxLeverage: asset.maxLeverage }];
    out.push({
      venue,
      coin: asset.name,
      label: asset.name.includes(':') ? asset.name.split(':')[1]! : asset.name,
      maxLeverage: asset.maxLeverage,
      szDecimals: asset.szDecimals,
      ...live,
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

/** Hyperliquid websocket, https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket */
const WS_URL = 'wss://api.hyperliquid.xyz/ws';

/** Reads an activeAssetCtx push; anything else (subscription acks, pongs, other coins) is null. */
export function parseAssetCtxMessage(coin: string, payload: unknown): LiveFields | null {
  const msg = payload as { channel?: unknown; data?: { coin?: unknown; ctx?: AssetCtx } } | null;
  if (msg?.channel !== 'activeAssetCtx' || msg.data?.coin !== coin || !msg.data.ctx) return null;
  return liveFields(msg.data.ctx);
}

/**
 * Streams one market's live price and funding, at most once per `gapMs`.
 * The socket is closed while the tab is hidden and reconnects with backoff when it drops.
 * Returns a function that stops it.
 */
export function watchMarket(coin: string, onLive: (live: LiveFields) => void, gapMs = 2000): () => void {
  if (typeof WebSocket === 'undefined') return () => {};
  let ws: WebSocket | null = null;
  let stopped = false;
  let retry = 0;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let pingTimer: ReturnType<typeof setInterval> | undefined;
  let flushTimer: ReturnType<typeof setTimeout> | undefined;
  let pending: LiveFields | null = null;
  let sentAt = 0;

  const flush = () => {
    flushTimer = undefined;
    if (!pending) return;
    sentAt = Date.now();
    const live = pending;
    pending = null;
    onLive(live);
  };

  const close = () => {
    clearTimeout(retryTimer);
    clearInterval(pingTimer);
    if (ws) {
      ws.onclose = null;
      ws.close();
      ws = null;
    }
  };

  const open = () => {
    if (stopped || ws || document.visibilityState !== 'visible') return;
    const sock = new WebSocket(WS_URL);
    ws = sock;
    sock.onopen = () => {
      retry = 0;
      sock.send(JSON.stringify({ method: 'subscribe', subscription: { type: 'activeAssetCtx', coin } }));
      // the server drops connections that stay quiet for a minute
      pingTimer = setInterval(() => sock.send(JSON.stringify({ method: 'ping' })), 50_000);
    };
    sock.onmessage = (e) => {
      if (ws !== sock) return;
      let live: LiveFields | null = null;
      try {
        live = parseAssetCtxMessage(coin, JSON.parse(String(e.data)));
      } catch {
        return;
      }
      if (!live) return;
      pending = live;
      if (!flushTimer) flushTimer = setTimeout(flush, Math.max(0, sentAt + gapMs - Date.now()));
    };
    sock.onclose = () => {
      clearInterval(pingTimer);
      ws = null;
      if (stopped) return;
      retryTimer = setTimeout(open, Math.min(30_000, 1000 * 2 ** retry++));
    };
  };

  const onVisibility = () => (document.visibilityState === 'visible' ? open() : close());
  document.addEventListener('visibilitychange', onVisibility);
  open();
  return () => {
    stopped = true;
    document.removeEventListener('visibilitychange', onVisibility);
    clearTimeout(flushTimer);
    close();
  };
}
