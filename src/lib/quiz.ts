/**
 * Practice questions generated from the same math the calculators use. Every
 * question comes from a template filled with seeded random numbers, so a seed
 * always rebuilds the same session and the answer is computed, never typed in.
 * Wrong options are the results of common mistakes (forgetting a fee leg,
 * mixing up margin and position size), and each one says which mistake it is.
 */

import { fomoFee } from './fees';
import { roundTrip } from './roundtrip';
import { shareForInitials } from './ladder';
import { PERPS_FEES, perpTrade, stopLoss, venueFeeRate, type PerpInput, type PerpSide } from './perps';
import { multiple, pct, price, usd } from './format';
import { ROUTES } from './routes';

export type QuizTopic = 'fees' | 'profit' | 'perps' | 'risk';
export type QuizLevel = 1 | 2 | 3;

export const QUIZ_TOPICS: readonly QuizTopic[] = ['fees', 'profit', 'perps', 'risk'];

export interface QuizOption {
  label: string;
  /** Why this option is wrong; absent on the right answer. */
  why?: string;
}

export interface Question {
  /** Template id plus seed, unique within a session. */
  id: string;
  topic: QuizTopic;
  level: QuizLevel;
  prompt: string;
  /** Facts the question gives, shown as chips above the options. */
  facts: string[];
  options: QuizOption[];
  answer: number;
  /** Worked solution shown after answering. */
  explain: string;
  formula: string;
  /** Calculator that does this math. */
  href: string;
}

/** mulberry32: small, fast and good enough for picking quiz numbers. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rand = () => number;

function pick<T>(r: Rand, xs: readonly T[]): T {
  return xs[Math.floor(r() * xs.length)]!;
}

function shuffle<T>(r: Rand, xs: readonly T[]): T[] {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

interface Draft {
  level: QuizLevel;
  prompt: string;
  facts: string[];
  correct: string;
  /** Mistakes in order of how common they are; duplicates of the answer or of each other are dropped. */
  wrong: { label: string; why: string }[];
  /** Fills missing options when mistakes collapse to the same label. */
  spare: (k: number) => string;
  explain: string;
  formula: string;
}

interface Template {
  id: string;
  topic: QuizTopic;
  href: string;
  make: (r: Rand) => Draft;
}

const OPTIONS = 4;
const NEAR_MISS = 'Close, but not what the numbers give. Work through the solution below.';

function finish(t: Template, seed: number, d: Draft): Question {
  const r = rng(seed ^ 0x9e3779b9);
  const seen = new Set([d.correct]);
  const wrong: QuizOption[] = [];
  for (const w of d.wrong) {
    if (wrong.length === OPTIONS - 1) break;
    if (seen.has(w.label)) continue;
    seen.add(w.label);
    wrong.push(w);
  }
  for (let k = 1; wrong.length < OPTIONS - 1 && k < 50; k++) {
    const label = d.spare(k);
    if (seen.has(label)) continue;
    seen.add(label);
    wrong.push({ label, why: NEAR_MISS });
  }
  const options = shuffle(r, [{ label: d.correct }, ...wrong]);
  return {
    id: `${t.id}-${seed}`,
    topic: t.topic,
    level: d.level,
    prompt: d.prompt,
    facts: d.facts,
    options,
    answer: options.findIndex((o) => o.why === undefined),
    explain: d.explain,
    formula: d.formula,
    href: t.href,
  };
}

/** Same position, priced for a spare option: a step of ±12% around the answer, alternating sides. */
function nudge(value: number, k: number): number {
  const step = Math.ceil(k / 2) * 0.12;
  return value * (k % 2 === 1 ? 1 + step : 1 - step);
}

const HL_TAKER = PERPS_FEES.builder + venueFeeRate('hyperliquid', 'taker', false);
const HL_MAKER = PERPS_FEES.builder + venueFeeRate('hyperliquid', 'maker', false);

/** Round prices that keep the mental math doable, from memecoin-ish to BTC-ish. */
const ENTRIES = [2, 5, 20, 50, 100, 150, 200, 250, 2500, 4000, 60000, 100000];

/**
 * Price options at one fixed precision per question. The shared price()
 * formatter trims digits by value, which would let the exact answer stand out
 * from rounder wrong options.
 */
function priceAt(entry: number): (n: number) => string {
  const digits = entry >= 10 ? 2 : 4;
  return (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function sideWord(side: PerpSide): string {
  return side === 'long' ? 'Long' : 'Short';
}

function perpInput(side: PerpSide, margin: number, leverage: number, entry: number, maxLeverage: number, feeRate = HL_TAKER): PerpInput {
  return {
    side,
    margin,
    leverage,
    entry,
    exit: entry,
    builderRate: PERPS_FEES.builder,
    venueRate: feeRate - PERPS_FEES.builder,
    fundingHourly: 0,
    holdHours: 0,
    tiers: [{ lowerBound: 0, maxLeverage }],
  };
}

const TEMPLATES: readonly Template[] = [
  {
    id: 'sol-fee',
    topic: 'fees',
    href: ROUTES.fee,
    make: (r) => {
      const order = pick(r, [10, 20, 30, 40, 50, 75, 100, 150]);
      const q = fomoFee(order, 'solana');
      return {
        level: 1,
        prompt: `You buy a memecoin for ${usd(order)} on Solana. What is the fomo fee?`,
        facts: ['Solana', `Order ${usd(order)}`, 'No referral'],
        correct: usd(q.fee),
        wrong: [
          { label: usd(order * 0.005), why: '0.50% is the rate from 190 USDC up. Smaller Solana orders fall into the flat and 2% bands.' },
          { label: usd(order * 0.02), why: '2% only applies from 5 to 47.50 USDC. From 47.50 to 190 USDC the fee is a flat 0.95 USDC.' },
          { label: usd(0.95), why: 'The flat 0.95 USDC band only covers 47.50 to 190 USDC.' },
          { label: usd(q.fee * 0.9), why: 'That is the fee with the 10% referral discount, but this order has no referral.' },
        ],
        spare: (k) => usd(nudge(q.fee, k)),
        explain: `${usd(order)} falls in the ${q.band.kind === 'flat' ? `flat ${usd(q.band.value)}` : `${pct(q.band.value)}`} band, so the fee is ${usd(q.fee)} (${pct(q.effectiveRate)} of the order).`,
        formula: 'fee = band(order): under 5 → 0.10 · 5–47.50 → 2% · 47.50–190 → 0.95 · from 190 → 0.50%',
      };
    },
  },
  {
    id: 'sol-rate',
    topic: 'fees',
    href: ROUTES.fee,
    make: (r) => {
      const order = pick(r, [50, 60, 80, 95, 100, 120, 150, 190, 250, 500]);
      const q = fomoFee(order, 'solana');
      return {
        level: 2,
        prompt: `On Solana, what share of a ${usd(order)} order goes to the fomo fee?`,
        facts: ['Solana', `Order ${usd(order)}`],
        correct: pct(q.effectiveRate),
        wrong: [
          { label: pct(0.005), why: 'That is the headline rate from 190 USDC up, not the effective rate of this order.' },
          { label: pct(0.02), why: '2% is the band from 5 to 47.50 USDC.' },
          { label: pct(0.95 / 47.5), why: 'That is 0.95 USDC on a 47.50 USDC order, the worst case of the flat band, not this order.' },
          { label: pct(q.effectiveRate * 2), why: 'That counts the fee twice, as if it were a buy and a sell.' },
        ],
        spare: (k) => pct(nudge(q.effectiveRate, k)),
        explain: `The fee on ${usd(order)} is ${usd(q.fee)}. ${usd(q.fee)} ÷ ${usd(order)} = ${pct(q.effectiveRate)}. Flat bands cost more, as a share, on smaller orders.`,
        formula: 'effective rate = fee ÷ order',
      };
    },
  },
  {
    id: 'base-total',
    topic: 'fees',
    href: ROUTES.fee,
    make: (r) => {
      const order = pick(r, [100, 200, 250, 400, 500, 1000]);
      const gas = pick(r, [0.1, 0.2, 0.3, 0.5]);
      const fee = fomoFee(order, 'base').fee;
      return {
        level: 1,
        prompt: `You buy ${usd(order)} of a token on Base. The quote shows a ${usd(gas)} network fee. What does the trade cost in total?`,
        facts: ['Base', `Order ${usd(order)}`, `Network fee ${usd(gas)}`],
        correct: usd(fee + gas),
        wrong: [
          { label: usd(fee), why: 'fomo only covers gas on Solana. On Base the network fee is added on top.' },
          { label: usd(order * 0.02 + gas), why: '2% is a Solana band. Base charges 0.50% at every size.' },
          { label: usd(fee + 2 * gas), why: 'One buy is one transaction, so the network fee is paid once.' },
          { label: usd(gas), why: 'The network fee is only part of it; the 0.50% fomo fee comes on top.' },
        ],
        spare: (k) => usd(nudge(fee + gas, k)),
        explain: `fomo fee: 0.50% × ${usd(order)} = ${usd(fee)}. Add the ${usd(gas)} network fee: ${usd(fee + gas)}.`,
        formula: 'total = order × 0.50% + network fee',
      };
    },
  },
  {
    id: 'referral',
    topic: 'fees',
    href: ROUTES.referral,
    make: (r) => {
      const order = pick(r, [200, 500, 1000, 2000, 5000]);
      const chain = pick(r, ['base', 'ethereum', 'bsc'] as const);
      const fee = fomoFee(order, chain, 'standard', true).fee;
      return {
        level: 1,
        prompt: `With a referral discount, what is the fomo fee on a ${usd(order)} order on ${chain === 'bsc' ? 'BNB Chain' : chain === 'base' ? 'Base' : 'Ethereum'}?`,
        facts: [`Order ${usd(order)}`, 'Standard rate 0.50%', '10% off fees'],
        correct: usd(fee),
        wrong: [
          { label: usd(order * 0.005), why: 'That is the fee without the discount.' },
          { label: usd(order * 0.004), why: '10% off takes 10% of the fee away (0.50% → 0.45%), not 0.10 percentage points.' },
          { label: usd(order * 0.005 - 0.1), why: 'The discount is a share of the fee, not a fixed amount.' },
          { label: usd(order * 0.0005), why: 'That is 10% of the fee: what you save, not what you pay.' },
        ],
        spare: (k) => usd(nudge(fee, k)),
        explain: `0.50% × (1 − 10%) = 0.45%. 0.45% × ${usd(order)} = ${usd(fee)}, saving ${usd(order * 0.0005)}.`,
        formula: 'fee = order × 0.50% × (1 − 0.10)',
      };
    },
  },
  {
    id: 'split-sells',
    topic: 'fees',
    href: ROUTES.profit,
    make: (r) => {
      const steps = pick(r, [2, 4, 5]);
      const each = pick(r, [50, 60, 80, 100]);
      const total = steps * each;
      const many = steps * fomoFee(each, 'solana').fee;
      const one = fomoFee(total, 'solana').fee;
      return {
        level: 2,
        prompt: `On Solana, you sell ${usd(total)} in ${steps} sells of ${usd(each)} instead of one sell. How much more do you pay in fomo fees?`,
        facts: ['Solana', `${steps} × ${usd(each)}`, `vs 1 × ${usd(total)}`],
        correct: usd(many - one),
        wrong: [
          { label: usd(0), why: 'Every sell pays its own fee, and small Solana sells sit in the expensive flat band.' },
          { label: usd(many), why: 'That is the total for the small sells, not the difference from one sell.' },
          { label: usd((steps - 1) * fomoFee(each, 'solana').fee), why: 'The one big sell is not free; subtract its fee, not one of the small ones.' },
          { label: usd(one), why: 'That is the fee of the single sell.' },
        ],
        spare: (k) => usd(nudge(many - one, k)),
        explain: `${steps} sells × ${usd(fomoFee(each, 'solana').fee)} = ${usd(many)}. One ${usd(total)} sell pays ${usd(one)}. Difference: ${usd(many - one)}.`,
        formula: 'extra = n × fee(each) − fee(n × each)',
      };
    },
  },
  {
    id: 'break-even',
    topic: 'profit',
    href: ROUTES.profit,
    make: (r) => {
      const buy = pick(r, [20, 40, 50, 100, 150, 300, 1000]);
      const trip = roundTrip({ chain: 'solana', tokenClass: 'standard', referral: false, buyUsd: buy, multiple: 1, networkFeeUsd: 0, buyImpact: 0, sellImpact: 0 });
      const need = trip.breakEvenMultiple - 1;
      const buyRate = fomoFee(buy, 'solana').effectiveRate;
      return {
        level: 2,
        prompt: `You buy ${usd(buy)} of a token on Solana. How much does the price have to rise just to get your ${usd(buy)} back after fees?`,
        facts: ['Solana', `Buy ${usd(buy)}`, 'No price impact'],
        correct: pct(need),
        wrong: [
          { label: pct(0), why: 'Selling at the buy price returns less than you spent: you paid a fee on the buy and pay another on the sell.' },
          { label: pct(buyRate), why: 'That only makes up the buy fee. The sell has its own fee.' },
          { label: pct(2 * buyRate * 1.5), why: 'Overshoots: each fee is taken once, on the amount at that leg.' },
          { label: pct(0.01), why: 'That is a rule of thumb, not what this order pays.' },
        ],
        spare: (k) => pct(nudge(need, k)),
        explain: `The buy fee leaves ${usd(trip.positionAtEntry)} of tokens. They have to be worth enough that, after the sell fee, ${usd(buy)} comes back. That takes a ${multiple(trip.breakEvenMultiple)} move, or +${pct(need)}.`,
        formula: 'find k where (buy − buy fee) × k − sell fee = buy',
      };
    },
  },
  {
    id: 'net-profit',
    topic: 'profit',
    href: ROUTES.profit,
    make: (r) => {
      const buy = pick(r, [50, 100, 200, 500]);
      const k = pick(r, [1.5, 2, 3, 5]);
      const chain = pick(r, ['solana', 'base'] as const);
      const trip = roundTrip({ chain, tokenClass: 'standard', referral: false, buyUsd: buy, multiple: k, networkFeeUsd: 0, buyImpact: 0, sellImpact: 0 });
      const gross = buy * (k - 1);
      const buyFee = fomoFee(buy, chain).fee;
      return {
        level: 2,
        prompt: `You buy ${usd(buy)} of a token on ${chain === 'solana' ? 'Solana' : 'Base'} and sell when it hits ${multiple(k)}. What is the net profit?`,
        facts: [chain === 'solana' ? 'Solana' : 'Base', `Buy ${usd(buy)}`, `Sell at ${multiple(k)}`, 'Ignore network fees'],
        correct: usd(trip.pnl),
        wrong: [
          { label: usd(gross), why: 'That is the profit before fees.' },
          { label: usd(gross - buyFee), why: 'That leaves out the sell fee.' },
          { label: usd(gross - 2 * buyFee), why: 'The sell fee is charged on the larger sell amount, not on what you bought.' },
          { label: usd(gross - buyFee * k), why: 'The buy fee is not multiplied; it is taken once from the amount you put in.' },
        ],
        spare: (kk) => usd(nudge(trip.pnl, kk)),
        explain: `Buy fee ${usd(trip.buyFee)} leaves ${usd(trip.positionAtEntry)} of tokens. At ${multiple(k)} they are worth ${usd(trip.positionAtExit)}. Sell fee ${usd(trip.sellFee)} leaves ${usd(trip.proceeds)}. Profit: ${usd(trip.proceeds)} − ${usd(buy)} = ${usd(trip.pnl)}.`,
        formula: 'profit = (buy − buy fee) × multiple − sell fee − buy',
      };
    },
  },
  {
    id: 'initials-out',
    topic: 'profit',
    href: ROUTES.profit,
    make: (r) => {
      const buy = pick(r, [200, 300, 500, 1000]);
      const k = pick(r, [2, 3, 4, 5]);
      const input = { chain: 'base' as const, tokenClass: 'standard' as const, referral: false, buyUsd: buy, multiple: k, networkFeeUsd: 0, buyImpact: 0, sellImpact: 0 };
      const share = shareForInitials(input, k)!;
      return {
        level: 3,
        prompt: `You bought ${usd(buy)} of a token on Base. It is now at ${multiple(k)}. What share of the bag do you sell to take your ${usd(buy)} back, after fees?`,
        facts: ['Base', `Buy ${usd(buy)}`, `Now ${multiple(k)}`, '0.50% per trade'],
        correct: pct(share, { digits: 1 }),
        wrong: [
          { label: pct(1 / k, { digits: 1 }), why: 'That ignores fees: the buy fee left you with fewer tokens, and the sell pays another fee.' },
          { label: pct(0.5, { digits: 1 }), why: 'Half the bag is only right at about 2x before fees; the share depends on the multiple.' },
          { label: pct(1 / k + 0.005, { digits: 1 }), why: 'Each fee scales the amount, it does not add a fixed half percent to the share.' },
          { label: pct(1 / (k - 1), { digits: 1 }), why: 'That would take back your profit, not your initial.' },
        ],
        spare: (kk) => pct(nudge(share, kk), { digits: 1 }),
        explain: `After the 0.50% buy fee you hold ${usd(buy * 0.995)} of tokens, worth ${usd(buy * 0.995 * k)} at ${multiple(k)}. Selling ${pct(share, { digits: 1 })} of that and paying the 0.50% sell fee returns ${usd(buy)}. The rest rides for free.`,
        formula: 'find share s where (buy − buy fee) × multiple × s × (1 − sell fee) = buy',
      };
    },
  },
  {
    id: 'notional',
    topic: 'perps',
    href: ROUTES.perps,
    make: (r) => {
      const margin = pick(r, [20, 50, 100, 200, 500]);
      const lev = pick(r, [3, 5, 10, 20, 25]);
      return {
        level: 1,
        prompt: `You open a perps position with ${usd(margin)} of margin at ${lev}x. How big is the position?`,
        facts: [`Margin ${usd(margin)}`, `${lev}x leverage`],
        correct: usd(margin * lev),
        wrong: [
          { label: usd(margin), why: 'That is the margin you put up. Leverage multiplies it.' },
          { label: usd(margin / lev), why: 'Leverage multiplies the margin; it does not divide it.' },
          { label: usd(margin * (lev + 1)), why: 'Your margin is already inside the position; it is not added on top.' },
          { label: usd(margin + lev), why: 'Leverage is a multiplier, not an amount.' },
        ],
        spare: (k) => usd(nudge(margin * lev, k)),
        explain: `${usd(margin)} × ${lev} = ${usd(margin * lev)}. Fees, PnL and funding all scale with this number, not with the margin.`,
        formula: 'position = margin × leverage',
      };
    },
  },
  {
    id: 'perp-fee',
    topic: 'perps',
    href: ROUTES.perps,
    make: (r) => {
      const margin = pick(r, [50, 100, 200, 500]);
      const lev = pick(r, [5, 10, 20]);
      const maker = r() < 0.3;
      const rate = maker ? HL_MAKER : HL_TAKER;
      const notional = margin * lev;
      return {
        level: 2,
        prompt: `${usd(margin)} margin at ${lev}x on Hyperliquid, opened with a ${maker ? 'limit (maker)' : 'market (taker)'} order. What is the fee to open?`,
        facts: [`Margin ${usd(margin)}`, `${lev}x`, `fomo ${pct(PERPS_FEES.builder, { digits: 3 })} + venue ${pct(rate - PERPS_FEES.builder, { digits: 3 })}`],
        correct: usd(notional * rate),
        wrong: [
          { label: usd(margin * rate), why: 'Fees are charged on the whole position, not on the margin.' },
          { label: usd(notional * PERPS_FEES.builder), why: 'That is only the fomo builder fee; the venue fee comes on top.' },
          { label: usd(notional * rate * 2), why: 'That is open and close together. Opening is one side.' },
          { label: usd(notional * (rate - PERPS_FEES.builder)), why: 'That is only the venue fee; fomo adds its builder fee on top.' },
        ],
        spare: (k) => usd(nudge(notional * rate, k)),
        explain: `Position: ${usd(margin)} × ${lev} = ${usd(notional)}. Fee per side: ${pct(rate, { digits: 3 })}. ${usd(notional)} × ${pct(rate, { digits: 3 })} = ${usd(notional * rate)}.`,
        formula: 'fee per side = margin × leverage × (builder fee + venue fee)',
      };
    },
  },
  {
    id: 'fees-of-margin',
    topic: 'perps',
    href: ROUTES.perps,
    make: (r) => {
      const lev = pick(r, [10, 20, 25, 40, 50]);
      const share = 2 * lev * HL_TAKER;
      return {
        level: 3,
        prompt: `You open and close a ${lev}x position with market orders on Hyperliquid, and the price does not move. What share of your margin goes to fees?`,
        facts: [`${lev}x`, `${pct(HL_TAKER, { digits: 3 })} per side`, 'Price unchanged'],
        correct: pct(share),
        wrong: [
          { label: pct(2 * HL_TAKER), why: 'That is the fee as a share of the position. As a share of margin it is multiplied by the leverage.' },
          { label: pct(lev * HL_TAKER), why: 'That is one side. Opening and closing both pay.' },
          { label: pct(HL_TAKER), why: 'That is the fee rate per side on the position, not the cost against your margin.' },
          { label: pct(4 * lev * HL_TAKER), why: 'Each side pays once: two fees, not four.' },
        ],
        spare: (k) => pct(nudge(share, k)),
        explain: `Each side pays ${pct(HL_TAKER, { digits: 3 })} of the position, and the position is ${lev}× the margin. 2 × ${lev} × ${pct(HL_TAKER, { digits: 3 })} = ${pct(share)} of margin gone before the price moves at all.`,
        formula: 'fees ÷ margin = 2 × leverage × fee per side',
      };
    },
  },
  {
    id: 'liq-price',
    topic: 'perps',
    href: ROUTES.perps,
    make: (r) => {
      const side: PerpSide = r() < 0.5 ? 'long' : 'short';
      const maxLev = pick(r, [20, 40, 50]);
      const lev = pick(r, [5, 10, 20].filter((l) => l <= maxLev));
      const entry = pick(r, ENTRIES);
      const margin = 100;
      const res = perpTrade(perpInput(side, margin, lev, entry, maxLev));
      const s = side === 'long' ? 1 : -1;
      const p = priceAt(entry);
      const liq = res.liquidation!;
      return {
        level: 3,
        prompt: `${sideWord(side)} at ${lev}x from ${price(entry)}, isolated margin. The market's max leverage is ${maxLev}x. Roughly where is the liquidation price?`,
        facts: [sideWord(side), `${lev}x`, `Entry ${price(entry)}`, `Max ${maxLev}x`],
        correct: p(liq),
        wrong: [
          { label: p(entry * (1 - s / lev)), why: 'That is where the whole margin is gone. Liquidation comes earlier, when equity drops to the maintenance margin.' },
          { label: p(entry * (1 + s / lev)), why: 'Wrong direction: a ' + side + ' loses when the price moves ' + (side === 'long' ? 'down' : 'up') + '.' },
          { label: p(entry * (1 - s / (2 * lev))), why: 'Halving the move confuses the maintenance rate with the margin itself.' },
          { label: p(entry * (1 - (s * 1) / maxLev)), why: 'The max leverage sets the maintenance rate; your own leverage sets how far the price can move.' },
        ],
        spare: (k) => p(nudge(liq, k)),
        explain: `Maintenance rate = 1 ÷ (2 × ${maxLev}) = ${pct(1 / (2 * maxLev))}. The position is liquidated when the loss leaves only that much margin, ${pct(res.liquidationDistance)} ${side === 'long' ? 'below' : 'above'} entry: ${p(liq)}.`,
        formula: 'liq = (size × entry − side × margin) ÷ (size × (1 − side × mmr)), mmr = 1 ÷ (2 × max leverage)',
      };
    },
  },
  {
    id: 'liq-distance',
    topic: 'perps',
    href: ROUTES.perps,
    make: (r) => {
      const lev = pick(r, [2, 3, 5, 10, 20, 25]);
      const maxLev = 50;
      const res = perpTrade(perpInput('long', 100, lev, 100, maxLev));
      const d = res.liquidationDistance!;
      return {
        level: 2,
        prompt: `A ${lev}x long on a market with 50x max leverage. About how far can the price fall before liquidation?`,
        facts: ['Long', `${lev}x`, 'Max 50x (maintenance 1%)'],
        correct: pct(d, { digits: 1 }),
        wrong: [
          { label: pct(1 / lev, { digits: 1 }), why: 'That is the drop that wipes out the whole margin. Liquidation hits before that, at the maintenance margin.' },
          { label: pct(1 / (2 * lev), { digits: 1 }), why: 'Half the margin is not the trigger; the maintenance margin is much smaller.' },
          { label: pct(lev / 100, { digits: 1 }), why: 'Leverage shrinks the room to move; it does not grow it.' },
          { label: pct(1 / lev + 0.01, { digits: 1 }), why: 'The maintenance margin is subtracted from your room, not added.' },
        ],
        spare: (k) => pct(nudge(d, k), { digits: 1 }),
        explain: `Without maintenance margin it would be 1 ÷ ${lev} = ${pct(1 / lev, { digits: 1 })}. Hyperliquid liquidates while 1% of the position is still left as margin, so the room is a bit smaller: ${pct(d, { digits: 1 })}.`,
        formula: 'distance ≈ (1 ÷ leverage − mmr) ÷ (1 − mmr)',
      };
    },
  },
  {
    id: 'perp-break-even',
    topic: 'perps',
    href: ROUTES.perps,
    make: (r) => {
      const side: PerpSide = r() < 0.5 ? 'long' : 'short';
      const entry = pick(r, ENTRIES);
      const lev = pick(r, [5, 10, 20]);
      const res = perpTrade(perpInput(side, 100, lev, entry, 50));
      const s = side === 'long' ? 1 : -1;
      const p = priceAt(entry);
      const be = res.breakEven!;
      return {
        level: 3,
        prompt: `${sideWord(side)} at ${lev}x from ${price(entry)} with market orders on Hyperliquid. Ignoring funding, where do you break even?`,
        facts: [sideWord(side), `${lev}x`, `Entry ${price(entry)}`, `${pct(HL_TAKER, { digits: 3 })} per side`],
        correct: p(be),
        wrong: [
          { label: p(entry), why: 'At the entry price you have still paid the open and close fees.' },
          { label: p(entry * (1 + s * HL_TAKER)), why: 'That covers the open fee only; the close pays another.' },
          { label: p(entry * (1 + s * 2 * HL_TAKER * lev)), why: 'Leverage does not change the break-even move: fees and PnL both scale with the position.' },
          { label: p(entry * (1 - s * 2 * HL_TAKER)), why: 'Wrong direction: a ' + side + ' needs the price to move ' + (side === 'long' ? 'up' : 'down') + ' to cover fees.' },
        ],
        spare: (k) => p(entry + nudge(be - entry, k)),
        explain: `Fees take ${pct(HL_TAKER, { digits: 3 })} on the open and about as much on the close, so the price has to move about ${pct(2 * HL_TAKER, { digits: 3 })} your way: ${p(be)}. Leverage changes the size, not this move.`,
        formula: 'break-even = (size × entry + side × open fee) ÷ (size × (1 − side × fee rate))',
      };
    },
  },
  {
    id: 'funding',
    topic: 'perps',
    href: ROUTES.perps,
    make: (r) => {
      const margin = pick(r, [100, 200, 500]);
      const lev = pick(r, [5, 10]);
      const rate = pick(r, [0.0000125, 0.00001, 0.00002, 0.00005]);
      const hours = pick(r, [8, 24, 48, 72]);
      const notional = margin * lev;
      const cost = notional * rate * hours;
      return {
        level: 2,
        prompt: `You hold a long of ${usd(margin)} at ${lev}x for ${hours} hours. Funding is ${pct(rate, { digits: 4 })} per hour, paid by longs. How much funding do you pay?`,
        facts: ['Long', `Position ${usd(notional)}`, `Funding ${pct(rate, { digits: 4 })}/h`, `${hours}h`],
        correct: usd(cost),
        wrong: [
          { label: usd(margin * rate * hours), why: 'Funding is charged on the position size, not on the margin.' },
          { label: usd(notional * rate), why: 'That is one hour. Hyperliquid charges funding every hour.' },
          { label: usd(notional * rate * (hours / 8)), why: 'Hyperliquid funding is hourly, not every 8 hours.' },
          { label: usd(0), why: 'When the rate is positive, longs pay shorts.' },
        ],
        spare: (k) => usd(nudge(cost, k)),
        explain: `${usd(notional)} × ${pct(rate, { digits: 4 })} × ${hours} = ${usd(cost)}.`,
        formula: 'funding = position × hourly rate × hours',
      };
    },
  },
  {
    id: 'stop-loss',
    topic: 'risk',
    href: ROUTES.perps,
    make: (r) => {
      const margin = pick(r, [50, 100, 200]);
      const lev = pick(r, [5, 10]);
      const dist = pick(r, [0.02, 0.03, 0.05]);
      const entry = pick(r, ENTRIES);
      const input = perpInput('long', margin, lev, entry, 50);
      const stop = entry * (1 - dist);
      const res = stopLoss(input, stop, HL_TAKER)!;
      const notional = margin * lev;
      return {
        level: 2,
        prompt: `Long ${usd(margin)} at ${lev}x from ${price(entry)}, stop-loss at ${price(stop)} (${pct(dist, { digits: 0 })} below). How much do you lose if the stop fills?`,
        facts: [`Position ${usd(notional)}`, `Stop −${pct(dist, { digits: 0 })}`, `${pct(HL_TAKER, { digits: 3 })} per side`],
        correct: usd(res.loss),
        wrong: [
          { label: usd(notional * dist), why: 'That is the price move only. The open fee and the close fee at the stop add to the loss.' },
          { label: usd(margin * dist), why: 'The loss scales with the position, not the margin: multiply by the leverage.' },
          { label: usd(margin * dist + notional * HL_TAKER * 2), why: 'The fees are right, but the price move is on the whole position, not the margin.' },
          { label: usd(margin), why: 'A stop this close fills well before the margin is gone.' },
        ],
        spare: (k) => usd(nudge(res.loss, k)),
        explain: `Price move: ${usd(notional)} × ${pct(dist, { digits: 0 })} = ${usd(notional * dist)}. Plus the open fee and the taker fee on the stop fill: ${usd(res.loss)}, or ${pct(res.lossOfMargin, { digits: 1 })} of the margin.`,
        formula: 'loss = size × |entry − stop| + open fee + close fee at stop',
      };
    },
  },
  {
    id: 'risk-size',
    topic: 'risk',
    href: ROUTES.perps,
    make: (r) => {
      const risk = pick(r, [10, 20, 25, 50]);
      const lev = pick(r, [5, 10]);
      const dist = pick(r, [0.02, 0.04, 0.05]);
      const entry = 100;
      const per = stopLoss(perpInput('long', 1, lev, entry, 50), entry * (1 - dist), HL_TAKER)!.loss;
      const margin = risk / per;
      return {
        level: 3,
        prompt: `You will lose at most ${usd(risk)} if the stop fills. The stop is ${pct(dist, { digits: 0 })} below entry and you trade at ${lev}x. How much margin can you put in?`,
        facts: [`Max loss ${usd(risk)}`, `Stop −${pct(dist, { digits: 0 })}`, `${lev}x`, 'Fees included'],
        correct: usd(margin),
        wrong: [
          { label: usd(risk / dist), why: 'That is the position size the risk allows, not the margin. Divide by the leverage.' },
          { label: usd(risk / (lev * dist)), why: 'Close, but it forgets the fees, so the real loss at the stop would be bigger than planned.' },
          { label: usd(risk), why: 'With leverage, a small move loses more than the margin share; size from the stop distance.' },
          { label: usd((risk * lev) / dist), why: 'Leverage makes each dollar of margin riskier, so the margin goes down, not up.' },
        ],
        spare: (k) => usd(nudge(margin, k)),
        explain: `Each 1 USDC of margin at ${lev}x loses $${per.toFixed(4)} at the stop (${pct(dist, { digits: 0 })} × ${lev} plus fees). ${usd(risk)} ÷ $${per.toFixed(4)} = ${usd(margin)} of margin, a ${usd(margin * lev)} position.`,
        formula: 'margin = max loss ÷ loss at the stop per 1 USDC of margin',
      };
    },
  },
  {
    id: 'stop-vs-liq',
    topic: 'risk',
    href: ROUTES.perps,
    make: (r) => {
      const lev = pick(r, [10, 20, 40]);
      const maxLev = 50;
      const dist = pick(r, [0.02, 0.03, 0.05, 0.08]);
      const liqDist = perpTrade(perpInput('long', 100, lev, 100, maxLev)).liquidationDistance!;
      const first = dist >= liqDist;
      const right = first ? 'You get liquidated before the stop' : 'The stop fills first';
      const other = first ? 'The stop fills first' : 'You get liquidated before the stop';
      return {
        level: 2,
        prompt: `Long at ${lev}x (max 50x) with a stop-loss ${pct(dist, { digits: 0 })} below entry. The price falls straight through. What happens?`,
        facts: ['Long', `${lev}x`, `Stop −${pct(dist, { digits: 0 })}`],
        correct: right,
        wrong: [
          {
            label: other,
            why: first
              ? `At ${lev}x liquidation sits ${pct(liqDist, { digits: 1 })} below entry, closer than the stop.`
              : `At ${lev}x liquidation sits ${pct(liqDist, { digits: 1 })} below entry, past the stop.`,
          },
          { label: 'Both trigger at the same price', why: 'They are set by different things: the stop by you, liquidation by leverage and the maintenance margin.' },
          { label: 'Neither, the position stays open', why: 'A stop or liquidation always closes the position once the price reaches it.' },
        ],
        spare: () => other,
        explain: `At ${lev}x the liquidation price is about ${pct(liqDist, { digits: 1 })} from entry. The stop is ${pct(dist, { digits: 0 })} away, so ${first ? 'liquidation comes first and the stop never fills. Lower the leverage or move the stop closer.' : 'the stop fills first and caps the loss.'}`,
        formula: 'liquidation distance ≈ (1 ÷ leverage − mmr) ÷ (1 − mmr)',
      };
    },
  },
];

export const TEMPLATE_COUNT = TEMPLATES.length;

/** One question from a named template; exported for tests. */
export function questionFrom(templateId: string, seed: number): Question {
  const t = TEMPLATES.find((x) => x.id === templateId);
  if (!t) throw new Error(`Unknown template: ${templateId}`);
  return finish(t, seed, t.make(rng(seed)));
}

export function templateIds(topic?: QuizTopic): string[] {
  return TEMPLATES.filter((t) => !topic || t.topic === topic).map((t) => t.id);
}

/**
 * A practice set: distinct templates where the topic has enough of them,
 * ordered from easy to hard so a session warms up.
 */
export function makeSession(seed: number, topic: QuizTopic | 'all', count = 5): Question[] {
  const r = rng(seed);
  const pool = TEMPLATES.filter((t) => topic === 'all' || t.topic === topic);
  const order = shuffle(r, pool);
  const picked: Template[] = [];
  while (picked.length < count && order.length > 0) picked.push(order[picked.length % order.length]!);
  return picked
    .map((t, i) => finish(t, (seed + i * 7919) >>> 0, t.make(rng((seed + i * 7919) >>> 0))))
    .sort((a, b) => a.level - b.level);
}

export interface TopicScore {
  topic: QuizTopic;
  right: number;
  total: number;
}

/** Per-topic tally of a finished session, topics with questions only. */
export function scoreByTopic(questions: readonly Question[], picks: readonly (number | null)[]): TopicScore[] {
  return QUIZ_TOPICS.map((topic) => {
    const idx = questions.map((q, i) => (q.topic === topic ? i : -1)).filter((i) => i !== -1);
    return { topic, total: idx.length, right: idx.filter((i) => picks[i] === questions[i]!.answer).length };
  }).filter((s) => s.total > 0);
}
