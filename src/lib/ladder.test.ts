import { describe, expect, it } from 'vitest';
import { exitLadder, ladderParam, ladderRows, parseLadderParam, shareForInitials } from './ladder';
import { roundTrip, type RoundTripInput } from './roundtrip';

const base: RoundTripInput = {
  chain: 'solana',
  tokenClass: 'standard',
  referral: false,
  buyUsd: 100,
  multiple: 1,
  networkFeeUsd: 0,
  buyImpact: 0,
  sellImpact: 0,
};

describe('exit ladder', () => {
  it('matches the round trip when one step sells the whole bag', () => {
    const ladder = exitLadder(base, [{ multiple: 2, share: 1 }]);
    const trip = roundTrip({ ...base, multiple: 2 });
    expect(ladder.proceeds).toBeCloseTo(trip.proceeds, 10);
    expect(ladder.sellFees).toBeCloseTo(trip.sellFee, 10);
    expect(ladder.remainingShare).toBe(0);
  });

  it('charges each step in its own fee band', () => {
    // $100 buy leaves 99.05 of tokens. Half at 2x is a 99.05 sell: 0.95 flat band.
    // The other half at 4x is a 198.10 sell: 0.50%.
    const r = exitLadder(base, [
      { multiple: 2, share: 0.5 },
      { multiple: 4, share: 0.5 },
    ]);
    expect(r.sells[0]!.fee).toBeCloseTo(0.95, 10);
    expect(r.sells[0]!.proceeds).toBeCloseTo(98.1, 10);
    expect(r.sells[1]!.fee).toBeCloseTo(0.9905, 10);
    expect(r.sells[1]!.cumulative).toBeCloseTo(98.1 + 197.1095, 10);
    expect(r.realizedPnl).toBeCloseTo(195.2095, 10);
    // the first sell is 1.90 short of the 100 spent, so the initials come back on the second
    expect(r.initialsBackAt).toBe(1);
  });

  it('sells lower prices first and never more than the bag', () => {
    const r = exitLadder(base, [
      { multiple: 5, share: 0.6 },
      { multiple: 2, share: 0.6 },
    ]);
    expect(r.sells.map((s) => s.index)).toEqual([1, 0]);
    expect(r.sells[0]!.sold).toBeCloseTo(0.6, 12);
    expect(r.sells[1]!.sold).toBeCloseTo(0.4, 12);
    expect(r.requestedShare).toBeCloseTo(1.2, 12);
    expect(r.remainingShare).toBe(0);
  });

  it('values what is left at the highest sell price', () => {
    const r = exitLadder(base, [{ multiple: 3, share: 0.25 }]);
    expect(r.remainingShare).toBeCloseTo(0.75, 12);
    expect(r.remainingValue).toBeCloseTo(99.05 * 0.75 * 3, 9);
    expect(r.initialsBackAt).toBeNull();
  });

  it('adds the network fee on every sell where fomo does not cover gas', () => {
    const r = exitLadder({ ...base, chain: 'base', networkFeeUsd: 0.2 }, [
      { multiple: 2, share: 0.5 },
      { multiple: 3, share: 0.5 },
    ]);
    expect(r.sells.every((s) => s.networkFee === 0.2)).toBe(true);
  });

  it('flags steps under the minimum sell', () => {
    const r = exitLadder({ ...base, chain: 'ethereum' }, [{ multiple: 2, share: 0.02 }]);
    expect(r.sells[0]!.belowMinSell).toBe(true);
  });
});

describe('initials out', () => {
  it('finds the share that returns exactly the amount spent', () => {
    const share = shareForInitials(base, 2)!;
    expect(share).toBeGreaterThan(0.5);
    const r = exitLadder(base, [{ multiple: 2, share }]);
    expect(r.proceeds).toBeCloseTo(100, 6);
    expect(r.initialsBackAt).toBe(0);
  });

  it('is null below break-even', () => {
    expect(shareForInitials(base, 1.01)).toBeNull();
    expect(shareForInitials({ ...base, buyUsd: 0 }, 2)).toBeNull();
  });
});

describe('exit plan links', () => {
  it('round-trips through the query string', () => {
    const param = ladderParam([
      { multiple: 2, share: 0.505 },
      { multiple: 10, share: 0.25 },
    ]);
    expect(param).toBe('2:50.5,10:25');
    expect(parseLadderParam(param)).toEqual([
      { multiple: '2', share: '50.5' },
      { multiple: '10', share: '25' },
    ]);
  });

  it('drops malformed steps', () => {
    expect(parseLadderParam('2:50,x:10,3:0,4:120,5')).toEqual([{ multiple: '2', share: '50' }]);
    expect(ladderRows('nope')).toBeNull();
    expect(ladderRows([{ multiple: '2', share: '50' }, { multiple: 2 }, null])).toEqual([{ multiple: '2', share: '50' }]);
  });
});
