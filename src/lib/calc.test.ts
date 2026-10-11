import { describe, expect, it } from 'vitest';
import { fomoFee, tradeCost } from './fees';
import { roundTrip, multipleForProceeds, type RoundTripInput } from './roundtrip';
import { parseAmount } from './format';
import { liquidationPrice, maintenanceSchedule, maintenanceMargin, perpTrade } from './perps';

describe('fomo spot fee', () => {
  it('applies the four Solana bands', () => {
    expect(fomoFee(1, 'solana').fee).toBeCloseTo(0.1, 10);
    expect(fomoFee(4.99, 'solana').fee).toBeCloseTo(0.1, 10);
    expect(fomoFee(10, 'solana').fee).toBeCloseTo(0.2, 10);
    expect(fomoFee(50, 'solana').fee).toBeCloseTo(0.95, 10);
    expect(fomoFee(189.99, 'solana').fee).toBeCloseTo(0.95, 10);
    expect(fomoFee(1000, 'solana').fee).toBeCloseTo(5, 10);
  });

  it('matches the published worked examples', () => {
    // $10 buy costs 2%, $50 buy costs 1.90%
    expect(fomoFee(10, 'solana').effectiveRate).toBeCloseTo(0.02, 10);
    expect(fomoFee(50, 'solana').effectiveRate).toBeCloseTo(0.019, 10);
  });

  it('is continuous at every band edge', () => {
    for (const edge of [5, 47.5, 190]) {
      const below = fomoFee(edge - 1e-9, 'solana').fee;
      const at = fomoFee(edge, 'solana').fee;
      expect(Math.abs(at - below)).toBeLessThan(1e-6);
    }
  });

  it('charges 0.50% on other chains and 0.05% on large major-token orders', () => {
    expect(fomoFee(100, 'base').fee).toBeCloseTo(0.5, 10);
    expect(fomoFee(100, 'ethereum').effectiveRate).toBeCloseTo(0.005, 10);
    expect(fomoFee(200, 'solana', 'major').fee).toBeCloseTo(0.5, 10);
    expect(fomoFee(5000, 'solana', 'major').fee).toBeCloseTo(2.5, 10);
  });

  it('takes 10% off with a referral', () => {
    expect(fomoFee(1000, 'base', 'standard', true).fee).toBeCloseTo(4.5, 10);
    expect(fomoFee(1000, 'base', 'standard', true).effectiveRate).toBeCloseTo(0.0045, 10);
  });

  it('adds network fee only where fomo does not cover gas', () => {
    const base = { side: 'buy', orderUsd: 100, tokenClass: 'standard', referral: false, networkFeeUsd: 0.3, priceImpact: 0 } as const;
    expect(tradeCost({ ...base, chain: 'solana' }).networkFee).toBe(0);
    const eth = tradeCost({ ...base, chain: 'ethereum' });
    expect(eth.networkFee).toBeCloseTo(0.3, 10);
    expect(eth.totalCost).toBeCloseTo(0.8, 10);
    expect(eth.received).toBeCloseTo(99.2, 10);
  });

  it('flags sells under the minimum', () => {
    const t = tradeCost({ side: 'sell', orderUsd: 4, chain: 'ethereum', tokenClass: 'standard', referral: false, networkFeeUsd: 0, priceImpact: 0 });
    expect(t.belowMinSell).toBe(true);
  });
});

describe('round trip', () => {
  const base: RoundTripInput = {
    chain: 'solana',
    tokenClass: 'standard',
    referral: false,
    buyUsd: 100,
    multiple: 2,
    networkFeeUsd: 0,
    buyImpact: 0,
    sellImpact: 0,
  };

  it('charges the fee on both legs', () => {
    const r = roundTrip(base);
    // buy $100 -> fee 0.95, position 99.05; at 2x = 198.10, sell fee 0.5% = 0.9905
    expect(r.buyFee).toBeCloseTo(0.95, 10);
    expect(r.positionAtExit).toBeCloseTo(198.1, 10);
    expect(r.sellFee).toBeCloseTo(0.9905, 10);
    expect(r.proceeds).toBeCloseTo(197.1095, 10);
    expect(r.pnl).toBeCloseTo(97.1095, 10);
  });

  it('finds the break-even multiple', () => {
    const r = roundTrip(base);
    const atBreakEven = roundTrip({ ...base, multiple: r.breakEvenMultiple });
    expect(atBreakEven.proceeds).toBeCloseTo(100, 6);
    // 99.05 * m lands in the 0.95 flat band: 99.05m - 0.95 = 100
    expect(r.breakEvenMultiple).toBeCloseTo(100.95 / 99.05, 9);
  });

  it('solves for a profit target', () => {
    const m = multipleForProceeds(base, 300);
    expect(roundTrip({ ...base, multiple: m }).proceeds).toBeCloseTo(300, 6);
  });
});

describe('perps', () => {
  it('builds the maintenance schedule from margin tiers', () => {
    const s = maintenanceSchedule([
      { lowerBound: 0, maxLeverage: 40 },
      { lowerBound: 150_000_000, maxLeverage: 20 },
    ]);
    expect(s[0]!.rate).toBeCloseTo(0.0125, 12);
    expect(s[1]!.rate).toBeCloseTo(0.025, 12);
    expect(s[1]!.deduction).toBeCloseTo(150_000_000 * 0.0125, 6);
    // continuous at the tier edge
    const edge = 150_000_000;
    expect(maintenanceMargin(s, edge)).toBeCloseTo(maintenanceMargin(s, edge - 1e-3), 3);
  });

  it('matches the Hyperliquid liquidation formula on one tier', () => {
    // long 10x, $100 margin, entry 100, max lev 40 => l = 1.25%
    const size = 10;
    const liq = liquidationPrice({ side: 'long', entry: 100, size, isolatedMargin: 100, tiers: [{ lowerBound: 0, maxLeverage: 40 }] });
    const l = 1 / 80;
    const marginAvailable = 100 - size * 100 * l;
    expect(liq).toBeCloseTo(100 - marginAvailable / size / (1 - l), 10);

    const short = liquidationPrice({ side: 'short', entry: 100, size, isolatedMargin: 100, tiers: [{ lowerBound: 0, maxLeverage: 40 }] });
    expect(short).toBeCloseTo(100 + marginAvailable / size / (1 + l), 10);
  });

  it('returns null for an unliquidatable 1x long', () => {
    expect(liquidationPrice({ side: 'long', entry: 100, size: 1, isolatedMargin: 100, tiers: [{ lowerBound: 0, maxLeverage: 40 }] })).toBeNull();
  });

  it('computes fees, PnL and break-even', () => {
    const r = perpTrade({
      side: 'long',
      margin: 100,
      leverage: 10,
      entry: 100,
      exit: 110,
      builderRate: 0.0005,
      venueRate: 0.00045,
      fundingHourly: 0,
      holdHours: 0,
      tiers: [{ lowerBound: 0, maxLeverage: 40 }],
    });
    expect(r.notional).toBe(1000);
    expect(r.openFee).toBeCloseTo(0.95, 10);
    expect(r.closeFee).toBeCloseTo(1.045, 10);
    expect(r.grossPnl).toBeCloseTo(100, 10);
    expect(r.netPnl).toBeCloseTo(100 - 0.95 - 1.045, 10);
    const be = perpTrade({ ...rArgs(), exit: r.breakEven! });
    expect(be.netPnl).toBeCloseTo(0, 9);
  });

  it('charges funding to longs when the rate is positive', () => {
    const r = perpTrade({ ...rArgs(), fundingHourly: 0.0001, holdHours: 24 });
    expect(r.funding).toBeCloseTo(1000 * 0.0001 * 24, 10);
    const s = perpTrade({ ...rArgs(), side: 'short', fundingHourly: 0.0001, holdHours: 24 });
    expect(s.funding).toBeCloseTo(-2.4, 10);
  });
});

function rArgs() {
  return {
    side: 'long' as const,
    margin: 100,
    leverage: 10,
    entry: 100,
    exit: 110,
    builderRate: 0.0005,
    venueRate: 0.00045,
    fundingHourly: 0,
    holdHours: 0,
    tiers: [{ lowerBound: 0, maxLeverage: 40 }],
  };
}

describe('parseAmount', () => {
  it('reads US-style amounts and tolerates comma decimals', () => {
    expect(parseAmount('1250')).toBe(1250);
    expect(parseAmount('1250.5')).toBe(1250.5);
    expect(parseAmount('1,250')).toBe(1250);
    expect(parseAmount('1,250.50')).toBe(1250.5);
    expect(parseAmount('12,500,000')).toBe(12500000);
    expect(parseAmount('1.250,50')).toBe(1250.5);
    expect(parseAmount('1.250.000')).toBe(1250000);
    expect(parseAmount('145.125')).toBe(145.125);
    expect(parseAmount('0,5')).toBe(0.5);
    expect(parseAmount('12,75')).toBe(12.75);
    expect(parseAmount('0,005')).toBe(0.005);
    expect(parseAmount('1,2,3')).toBeNaN();
    expect(parseAmount('$ 100')).toBe(100);
    expect(parseAmount('abc')).toBeNaN();
    expect(parseAmount('')).toBeNaN();
  });
});
