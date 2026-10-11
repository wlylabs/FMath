import { CHAINS, chainFromDexscreener, type ChainId } from '../lib/fees';

/** Public DexScreener API, https://docs.dexscreener.com/api/reference (300 req/min). */
const BASE = 'https://api.dexscreener.com';

interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceUsd?: string;
  liquidity?: { usd?: number };
  fdv?: number;
  marketCap?: number;
  priceChange?: { h24?: number };
  volume?: { h24?: number };
  info?: { imageUrl?: string };
}

export interface TokenMarket {
  key: string;
  chain: ChainId;
  address: string;
  name: string;
  symbol: string;
  priceUsd: number;
  marketCap: number | null;
  fdv: number | null;
  liquidityUsd: number | null;
  change24h: number | null;
  volume24h: number | null;
  imageUrl?: string;
  pairUrl: string;
  dexId: string;
  fetchedAt: number;
}

const SUPPORTED = new Set(CHAINS.map((c) => c.dexscreenerId).filter(Boolean));

function tokenKey(chainId: string, address: string): string {
  return `${chainId}:${address.startsWith('0x') ? address.toLowerCase() : address}`;
}

function toMarket(pair: DexPair, fetchedAt: number): TokenMarket | null {
  const chain = chainFromDexscreener(pair.chainId);
  const price = Number(pair.priceUsd);
  if (!chain || !Number.isFinite(price) || price <= 0) return null;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  return {
    key: tokenKey(pair.chainId, pair.baseToken.address),
    chain,
    address: pair.baseToken.address,
    name: pair.baseToken.name,
    symbol: pair.baseToken.symbol,
    priceUsd: price,
    marketCap: num(pair.marketCap),
    fdv: num(pair.fdv),
    liquidityUsd: num(pair.liquidity?.usd),
    change24h: num(pair.priceChange?.h24),
    volume24h: num(pair.volume?.h24),
    imageUrl: pair.info?.imageUrl,
    pairUrl: pair.url,
    dexId: pair.dexId,
    fetchedAt,
  };
}

/** One entry per token: the pair with the deepest liquidity sets the price. */
export function bestPairPerToken(pairs: readonly DexPair[], fetchedAt = Date.now()): TokenMarket[] {
  const best = new Map<string, TokenMarket>();
  for (const pair of pairs) {
    if (!pair?.baseToken?.address || !SUPPORTED.has(pair.chainId)) continue;
    const m = toMarket(pair, fetchedAt);
    if (!m) continue;
    const current = best.get(m.key);
    if (!current || (m.liquidityUsd ?? 0) > (current.liquidityUsd ?? 0)) best.set(m.key, m);
  }
  return [...best.values()].sort((a, b) => (b.liquidityUsd ?? 0) - (a.liquidityUsd ?? 0));
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`DexScreener ${res.status}`);
  return (await res.json()) as T;
}

export async function searchTokens(query: string, signal?: AbortSignal): Promise<TokenMarket[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const data = await getJson<{ pairs?: DexPair[] | null }>(
    `${BASE}/latest/dex/search?q=${encodeURIComponent(q)}`,
    signal,
  );
  return bestPairPerToken(data.pairs ?? []);
}

export async function getToken(chainId: string, address: string, signal?: AbortSignal): Promise<TokenMarket | null> {
  const pairs = await getJson<DexPair[] | null>(
    `${BASE}/tokens/v1/${encodeURIComponent(chainId)}/${encodeURIComponent(address)}`,
    signal,
  );
  const wanted = tokenKey(chainId, address);
  return bestPairPerToken(pairs ?? []).find((m) => m.key === wanted) ?? null;
}

export function dexscreenerChainId(chain: ChainId): string | undefined {
  return CHAINS.find((c) => c.id === chain)?.dexscreenerId;
}
