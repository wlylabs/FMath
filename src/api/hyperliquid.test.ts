import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseAssetCtxMessage, parseMarkets, watchMarket } from './hyperliquid';

const ctx = { markPx: '100', oraclePx: '99.5', funding: '0.0000125', dayNtlVlm: '5000', prevDayPx: '80' };

describe('hyperliquid markets', () => {
  it('reads the REST list and skips delisted or priceless assets', () => {
    const markets = parseMarkets('hyperliquid', [
      {
        universe: [
          { name: 'BTC', szDecimals: 5, maxLeverage: 40 },
          { name: 'OLD', szDecimals: 0, maxLeverage: 3, isDelisted: true },
          { name: 'NOPX', szDecimals: 0, maxLeverage: 3 },
        ],
      },
      [ctx, ctx, { markPx: '0' }],
    ]);
    expect(markets.map((m) => m.coin)).toEqual(['BTC']);
    expect(markets[0]).toMatchObject({ markPx: 100, oraclePx: 99.5, fundingHourly: 0.0000125, dayVolume: 5000 });
    expect(markets[0]!.change24h).toBeCloseTo(0.25, 10);
  });
});

describe('hyperliquid live feed', () => {
  it('reads an activeAssetCtx push with string or number fields', () => {
    const msg = (c: object, coin = 'xyz:TSLA') => ({ channel: 'activeAssetCtx', data: { coin, ctx: c } });
    expect(parseAssetCtxMessage('xyz:TSLA', msg(ctx))).toMatchObject({ markPx: 100, fundingHourly: 0.0000125 });
    expect(parseAssetCtxMessage('xyz:TSLA', msg({ markPx: 250, prevDayPx: 200 }))).toMatchObject({ markPx: 250, oraclePx: 250, change24h: 0.25 });
  });

  it('ignores other channels, other coins and unusable prices', () => {
    expect(parseAssetCtxMessage('BTC', { channel: 'subscriptionResponse', data: {} })).toBeNull();
    expect(parseAssetCtxMessage('BTC', { channel: 'pong' })).toBeNull();
    expect(parseAssetCtxMessage('BTC', { channel: 'activeAssetCtx', data: { coin: 'ETH', ctx } })).toBeNull();
    expect(parseAssetCtxMessage('BTC', { channel: 'activeAssetCtx', data: { coin: 'BTC', ctx: { markPx: 'x' } } })).toBeNull();
    expect(parseAssetCtxMessage('BTC', null)).toBeNull();
  });
});

describe('watchMarket', () => {
  class FakeSocket {
    static all: FakeSocket[] = [];
    sent: string[] = [];
    closed = false;
    onopen: (() => void) | null = null;
    onmessage: ((e: { data: string }) => void) | null = null;
    onclose: (() => void) | null = null;
    constructor(public url: string) {
      FakeSocket.all.push(this);
    }
    send(s: string) {
      this.sent.push(s);
    }
    close() {
      this.closed = true;
    }
    push(markPx: number) {
      this.onmessage?.({ data: JSON.stringify({ channel: 'activeAssetCtx', data: { coin: 'BTC', ctx: { markPx } } }) });
    }
  }
  const doc = new EventTarget() as EventTarget & { visibilityState: string };
  const setVisible = (v: boolean) => {
    doc.visibilityState = v ? 'visible' : 'hidden';
    doc.dispatchEvent(new Event('visibilitychange'));
  };

  beforeEach(() => {
    vi.useFakeTimers();
    FakeSocket.all = [];
    doc.visibilityState = 'visible';
    vi.stubGlobal('WebSocket', FakeSocket);
    vi.stubGlobal('document', doc);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('subscribes, passes the latest price at most once per gap, and stops cleanly', () => {
    const seen: number[] = [];
    const stop = watchMarket('BTC', (l) => seen.push(l.markPx), 2000);
    const ws = FakeSocket.all[0]!;
    ws.onopen?.();
    expect(JSON.parse(ws.sent[0]!)).toEqual({ method: 'subscribe', subscription: { type: 'activeAssetCtx', coin: 'BTC' } });
    ws.push(1);
    vi.advanceTimersByTime(0);
    ws.push(2);
    ws.push(3);
    vi.advanceTimersByTime(1999);
    expect(seen).toEqual([1]);
    vi.advanceTimersByTime(1);
    expect(seen).toEqual([1, 3]);
    stop();
    expect(ws.closed).toBe(true);
    ws.push(4);
    vi.advanceTimersByTime(5000);
    expect(seen).toEqual([1, 3]);
  });

  it('reconnects after a drop and sleeps while the tab is hidden', () => {
    const stop = watchMarket('BTC', () => {});
    FakeSocket.all[0]!.onclose?.();
    vi.advanceTimersByTime(1000);
    expect(FakeSocket.all).toHaveLength(2);
    setVisible(false);
    expect(FakeSocket.all[1]!.closed).toBe(true);
    vi.advanceTimersByTime(60_000);
    expect(FakeSocket.all).toHaveLength(2);
    setVisible(true);
    expect(FakeSocket.all).toHaveLength(3);
    stop();
  });
});
