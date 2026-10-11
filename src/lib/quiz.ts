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
import { getLang } from './copy';

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

/** Picks the question text for the language the quiz is shown in when the session is built. */
function L(en: string, id: string): string {
  return getLang() === 'id' ? id : en;
}

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
    wrong.push({ label, why: L('Close, but not what the numbers give. Work through the solution below.', 'Hampir, tapi bukan hasil hitungannya. Ikuti pembahasan di bawah.') });
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
        prompt: L(`You buy a memecoin for ${usd(order)} on Solana. What is the fomo fee?`, `Kamu beli memecoin seharga ${usd(order)} di Solana. Berapa fee fomo-nya?`),
        facts: ['Solana', `Order ${usd(order)}`, L('No referral', 'Tanpa referral')],
        correct: usd(q.fee),
        wrong: [
          { label: usd(order * 0.005), why: L('0.50% is the rate from 190 USDC up. Smaller Solana orders fall into the flat and 2% bands.', '0.50% itu tarif mulai 190 USDC. Order Solana yang lebih kecil masuk band flat dan 2%.') },
          { label: usd(order * 0.02), why: L('2% only applies from 5 to 47.50 USDC. From 47.50 to 190 USDC the fee is a flat 0.95 USDC.', '2% cuma berlaku dari 5 sampai 47.50 USDC. Dari 47.50 sampai 190 USDC fee-nya flat 0.95 USDC.') },
          { label: usd(0.95), why: L('The flat 0.95 USDC band only covers 47.50 to 190 USDC.', 'Band flat 0.95 USDC cuma untuk 47.50 sampai 190 USDC.') },
          { label: usd(q.fee * 0.9), why: L('That is the fee with the 10% referral discount, but this order has no referral.', 'Itu fee dengan diskon referral 10%, padahal order ini tanpa referral.') },
        ],
        spare: (k) => usd(nudge(q.fee, k)),
        explain: L(`${usd(order)} falls in the ${q.band.kind === 'flat' ? `flat ${usd(q.band.value)}` : `${pct(q.band.value)}`} band, so the fee is ${usd(q.fee)} (${pct(q.effectiveRate)} of the order).`, `${usd(order)} masuk band ${q.band.kind === 'flat' ? `flat ${usd(q.band.value)}` : `${pct(q.band.value)}`}, jadi fee-nya ${usd(q.fee)} (${pct(q.effectiveRate)} dari order).`),
        formula: L('fee = band(order): under 5 → 0.10 · 5–47.50 → 2% · 47.50–190 → 0.95 · from 190 → 0.50%', 'fee = band(order): di bawah 5 → 0.10 · 5–47.50 → 2% · 47.50–190 → 0.95 · mulai 190 → 0.50%'),
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
        prompt: L(`On Solana, what share of a ${usd(order)} order goes to the fomo fee?`, `Di Solana, berapa persen dari order ${usd(order)} yang jadi fee fomo?`),
        facts: ['Solana', `Order ${usd(order)}`],
        correct: pct(q.effectiveRate),
        wrong: [
          { label: pct(0.005), why: L('That is the headline rate from 190 USDC up, not the effective rate of this order.', 'Itu tarif utama mulai 190 USDC, bukan tarif efektif order ini.') },
          { label: pct(0.02), why: L('2% is the band from 5 to 47.50 USDC.', '2% itu band dari 5 sampai 47.50 USDC.') },
          { label: pct(0.95 / 47.5), why: L('That is 0.95 USDC on a 47.50 USDC order, the worst case of the flat band, not this order.', 'Itu 0.95 USDC untuk order 47.50 USDC, kasus terburuk band flat, bukan order ini.') },
          { label: pct(q.effectiveRate * 2), why: L('That counts the fee twice, as if it were a buy and a sell.', 'Itu menghitung fee dua kali, seolah beli lalu jual.') },
        ],
        spare: (k) => pct(nudge(q.effectiveRate, k)),
        explain: L(`The fee on ${usd(order)} is ${usd(q.fee)}. ${usd(q.fee)} ÷ ${usd(order)} = ${pct(q.effectiveRate)}. Flat bands cost more, as a share, on smaller orders.`, `Fee untuk ${usd(order)} adalah ${usd(q.fee)}. ${usd(q.fee)} ÷ ${usd(order)} = ${pct(q.effectiveRate)}. Secara persentase, band flat makin mahal untuk order yang makin kecil.`),
        formula: L('effective rate = fee ÷ order', 'tarif efektif = fee ÷ order'),
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
        prompt: L(`You buy ${usd(order)} of a token on Base. The quote shows a ${usd(gas)} network fee. What does the trade cost in total?`, `Kamu beli token senilai ${usd(order)} di Base. Quote menunjukkan network fee ${usd(gas)}. Berapa total biaya trade-nya?`),
        facts: ['Base', `Order ${usd(order)}`, `Network fee ${usd(gas)}`],
        correct: usd(fee + gas),
        wrong: [
          { label: usd(fee), why: L('fomo only covers gas on Solana. On Base the network fee is added on top.', 'fomo cuma menanggung gas di Solana. Di Base, network fee ditambahkan di atasnya.') },
          { label: usd(order * 0.02 + gas), why: L('2% is a Solana band. Base charges 0.50% at every size.', '2% itu band Solana. Base kena 0.50% di semua ukuran.') },
          { label: usd(fee + 2 * gas), why: L('One buy is one transaction, so the network fee is paid once.', 'Satu kali beli = satu transaksi, jadi network fee dibayar sekali.') },
          { label: usd(gas), why: L('The network fee is only part of it; the 0.50% fomo fee comes on top.', 'Network fee cuma sebagian; fee fomo 0.50% ditambahkan juga.') },
        ],
        spare: (k) => usd(nudge(fee + gas, k)),
        explain: L(`fomo fee: 0.50% × ${usd(order)} = ${usd(fee)}. Add the ${usd(gas)} network fee: ${usd(fee + gas)}.`, `Fee fomo: 0.50% × ${usd(order)} = ${usd(fee)}. Tambah network fee ${usd(gas)}: ${usd(fee + gas)}.`),
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
        prompt: L(`With a referral discount, what is the fomo fee on a ${usd(order)} order on ${chain === 'bsc' ? 'BNB Chain' : chain === 'base' ? 'Base' : 'Ethereum'}?`, `Dengan diskon referral, berapa fee fomo untuk order ${usd(order)} di ${chain === 'bsc' ? 'BNB Chain' : chain === 'base' ? 'Base' : 'Ethereum'}?`),
        facts: [`Order ${usd(order)}`, L('Standard rate 0.50%', 'Tarif standar 0.50%'), L('10% off fees', 'Diskon fee 10%')],
        correct: usd(fee),
        wrong: [
          { label: usd(order * 0.005), why: L('That is the fee without the discount.', 'Itu fee tanpa diskon.') },
          { label: usd(order * 0.004), why: L('10% off takes 10% of the fee away (0.50% → 0.45%), not 0.10 percentage points.', 'Diskon 10% memotong 10% dari fee (0.50% → 0.45%), bukan 0.10 poin persen.') },
          { label: usd(order * 0.005 - 0.1), why: L('The discount is a share of the fee, not a fixed amount.', 'Diskonnya berupa persentase dari fee, bukan potongan tetap.') },
          { label: usd(order * 0.0005), why: L('That is 10% of the fee: what you save, not what you pay.', 'Itu 10% dari fee: yang kamu hemat, bukan yang kamu bayar.') },
        ],
        spare: (k) => usd(nudge(fee, k)),
        explain: L(`0.50% × (1 − 10%) = 0.45%. 0.45% × ${usd(order)} = ${usd(fee)}, saving ${usd(order * 0.0005)}.`, `0.50% × (1 − 10%) = 0.45%. 0.45% × ${usd(order)} = ${usd(fee)}, hemat ${usd(order * 0.0005)}.`),
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
        prompt: L(`On Solana, you sell ${usd(total)} in ${steps} sells of ${usd(each)} instead of one sell. How much more do you pay in fomo fees?`, `Di Solana, kamu jual ${usd(total)} dalam ${steps} kali jual masing-masing ${usd(each)}, bukan sekali jual. Berapa fee fomo tambahan yang kamu bayar?`),
        facts: ['Solana', `${steps} × ${usd(each)}`, `vs 1 × ${usd(total)}`],
        correct: usd(many - one),
        wrong: [
          { label: usd(0), why: L('Every sell pays its own fee, and small Solana sells sit in the expensive flat band.', 'Setiap jual bayar fee sendiri, dan jual kecil di Solana masuk band flat yang mahal.') },
          { label: usd(many), why: L('That is the total for the small sells, not the difference from one sell.', 'Itu total fee jual kecil-kecil, bukan selisihnya dengan sekali jual.') },
          { label: usd((steps - 1) * fomoFee(each, 'solana').fee), why: L('The one big sell is not free; subtract its fee, not one of the small ones.', 'Sekali jual besar juga tidak gratis; kurangi dengan fee-nya, bukan fee satu jual kecil.') },
          { label: usd(one), why: L('That is the fee of the single sell.', 'Itu fee untuk sekali jual.') },
        ],
        spare: (k) => usd(nudge(many - one, k)),
        explain: L(`${steps} sells × ${usd(fomoFee(each, 'solana').fee)} = ${usd(many)}. One ${usd(total)} sell pays ${usd(one)}. Difference: ${usd(many - one)}.`, `${steps} kali jual × ${usd(fomoFee(each, 'solana').fee)} = ${usd(many)}. Sekali jual ${usd(total)} bayar ${usd(one)}. Selisih: ${usd(many - one)}.`),
        formula: L('extra = n × fee(each) − fee(n × each)', 'tambahan = n × fee(per jual) − fee(n × per jual)'),
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
        prompt: L(`You buy ${usd(buy)} of a token on Solana. How much does the price have to rise just to get your ${usd(buy)} back after fees?`, `Kamu beli token senilai ${usd(buy)} di Solana. Harganya harus naik berapa persen cuma buat balikin ${usd(buy)} kamu setelah fee?`),
        facts: ['Solana', L(`Buy ${usd(buy)}`, `Beli ${usd(buy)}`), L('No price impact', 'Tanpa price impact')],
        correct: pct(need),
        wrong: [
          { label: pct(0), why: L('Selling at the buy price returns less than you spent: you paid a fee on the buy and pay another on the sell.', 'Jual di harga beli mengembalikan lebih sedikit dari modal: kamu bayar fee saat beli dan bayar lagi saat jual.') },
          { label: pct(buyRate), why: L('That only makes up the buy fee. The sell has its own fee.', 'Itu cuma menutup fee beli. Jual punya fee sendiri.') },
          { label: pct(2 * buyRate * 1.5), why: L('Overshoots: each fee is taken once, on the amount at that leg.', 'Kebanyakan: tiap fee diambil sekali, dari jumlah di transaksi itu.') },
          { label: pct(0.01), why: L('That is a rule of thumb, not what this order pays.', 'Itu cuma kira-kira, bukan yang dibayar order ini.') },
        ],
        spare: (k) => pct(nudge(need, k)),
        explain: L(`The buy fee leaves ${usd(trip.positionAtEntry)} of tokens. They have to be worth enough that, after the sell fee, ${usd(buy)} comes back. That takes a ${multiple(trip.breakEvenMultiple)} move, or +${pct(need)}.`, `Setelah fee beli, token kamu senilai ${usd(trip.positionAtEntry)}. Nilainya harus cukup supaya setelah fee jual, ${usd(buy)} kembali. Butuh gerakan ${multiple(trip.breakEvenMultiple)}, atau +${pct(need)}.`),
        formula: L('find k where (buy − buy fee) × k − sell fee = buy', 'cari k di mana (beli − fee beli) × k − fee jual = beli'),
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
        prompt: L(`You buy ${usd(buy)} of a token on ${chain === 'solana' ? 'Solana' : 'Base'} and sell when it hits ${multiple(k)}. What is the net profit?`, `Kamu beli token senilai ${usd(buy)} di ${chain === 'solana' ? 'Solana' : 'Base'} dan jual saat naik ${multiple(k)}. Berapa profit bersihnya?`),
        facts: [chain === 'solana' ? 'Solana' : 'Base', L(`Buy ${usd(buy)}`, `Beli ${usd(buy)}`), L(`Sell at ${multiple(k)}`, `Jual di ${multiple(k)}`), L('Ignore network fees', 'Abaikan network fee')],
        correct: usd(trip.pnl),
        wrong: [
          { label: usd(gross), why: L('That is the profit before fees.', 'Itu profit sebelum fee.') },
          { label: usd(gross - buyFee), why: L('That leaves out the sell fee.', 'Itu belum termasuk fee jual.') },
          { label: usd(gross - 2 * buyFee), why: L('The sell fee is charged on the larger sell amount, not on what you bought.', 'Fee jual dihitung dari nilai jual yang lebih besar, bukan dari nilai beli.') },
          { label: usd(gross - buyFee * k), why: L('The buy fee is not multiplied; it is taken once from the amount you put in.', 'Fee beli tidak ikut dikali; diambil sekali dari modal yang kamu masukkan.') },
        ],
        spare: (kk) => usd(nudge(trip.pnl, kk)),
        explain: L(`Buy fee ${usd(trip.buyFee)} leaves ${usd(trip.positionAtEntry)} of tokens. At ${multiple(k)} they are worth ${usd(trip.positionAtExit)}. Sell fee ${usd(trip.sellFee)} leaves ${usd(trip.proceeds)}. Profit: ${usd(trip.proceeds)} − ${usd(buy)} = ${usd(trip.pnl)}.`, `Fee beli ${usd(trip.buyFee)} menyisakan token senilai ${usd(trip.positionAtEntry)}. Di ${multiple(k)} nilainya ${usd(trip.positionAtExit)}. Fee jual ${usd(trip.sellFee)} menyisakan ${usd(trip.proceeds)}. Profit: ${usd(trip.proceeds)} − ${usd(buy)} = ${usd(trip.pnl)}.`),
        formula: L('profit = (buy − buy fee) × multiple − sell fee − buy', 'profit = (beli − fee beli) × kelipatan − fee jual − beli'),
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
        prompt: L(`You bought ${usd(buy)} of a token on Base. It is now at ${multiple(k)}. What share of the bag do you sell to take your ${usd(buy)} back, after fees?`, `Kamu beli token senilai ${usd(buy)} di Base. Sekarang sudah ${multiple(k)}. Berapa persen bag yang harus dijual supaya ${usd(buy)} kamu balik, setelah fee?`),
        facts: ['Base', L(`Buy ${usd(buy)}`, `Beli ${usd(buy)}`), L(`Now ${multiple(k)}`, `Sekarang ${multiple(k)}`), '0.50% per trade'],
        correct: pct(share, { digits: 1 }),
        wrong: [
          { label: pct(1 / k, { digits: 1 }), why: L('That ignores fees: the buy fee left you with fewer tokens, and the sell pays another fee.', 'Itu mengabaikan fee: fee beli bikin token kamu lebih sedikit, dan jual bayar fee lagi.') },
          { label: pct(0.5, { digits: 1 }), why: L('Half the bag is only right at about 2x before fees; the share depends on the multiple.', 'Setengah bag cuma pas di sekitar 2x sebelum fee; porsinya tergantung kelipatan.') },
          { label: pct(1 / k + 0.005, { digits: 1 }), why: L('Each fee scales the amount, it does not add a fixed half percent to the share.', 'Fee mengalikan jumlahnya, bukan menambah setengah persen tetap ke porsinya.') },
          { label: pct(1 / (k - 1), { digits: 1 }), why: L('That would take back your profit, not your initial.', 'Itu malah mengambil profit kamu, bukan modal.') },
        ],
        spare: (kk) => pct(nudge(share, kk), { digits: 1 }),
        explain: L(`After the 0.50% buy fee you hold ${usd(buy * 0.995)} of tokens, worth ${usd(buy * 0.995 * k)} at ${multiple(k)}. Selling ${pct(share, { digits: 1 })} of that and paying the 0.50% sell fee returns ${usd(buy)}. The rest rides for free.`, `Setelah fee beli 0.50% kamu pegang token senilai ${usd(buy * 0.995)}, jadi ${usd(buy * 0.995 * k)} di ${multiple(k)}. Jual ${pct(share, { digits: 1 })} dari itu dan bayar fee jual 0.50% mengembalikan ${usd(buy)}. Sisanya jalan gratis.`),
        formula: L('find share s where (buy − buy fee) × multiple × s × (1 − sell fee) = buy', 'cari porsi s di mana (beli − fee beli) × kelipatan × s × (1 − fee jual) = beli'),
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
        prompt: L(`You open a perps position with ${usd(margin)} of margin at ${lev}x. How big is the position?`, `Kamu buka posisi perps dengan margin ${usd(margin)} di ${lev}x. Berapa ukuran posisinya?`),
        facts: [`Margin ${usd(margin)}`, L(`${lev}x leverage`, `Leverage ${lev}x`)],
        correct: usd(margin * lev),
        wrong: [
          { label: usd(margin), why: L('That is the margin you put up. Leverage multiplies it.', 'Itu margin yang kamu setor. Leverage mengalikannya.') },
          { label: usd(margin / lev), why: L('Leverage multiplies the margin; it does not divide it.', 'Leverage mengalikan margin, bukan membaginya.') },
          { label: usd(margin * (lev + 1)), why: L('Your margin is already inside the position; it is not added on top.', 'Margin kamu sudah termasuk di dalam posisi; tidak ditambahkan lagi.') },
          { label: usd(margin + lev), why: L('Leverage is a multiplier, not an amount.', 'Leverage itu pengali, bukan jumlah uang.') },
        ],
        spare: (k) => usd(nudge(margin * lev, k)),
        explain: L(`${usd(margin)} × ${lev} = ${usd(margin * lev)}. Fees, PnL and funding all scale with this number, not with the margin.`, `${usd(margin)} × ${lev} = ${usd(margin * lev)}. Fee, PnL, dan funding semuanya mengikuti angka ini, bukan margin.`),
        formula: L('position = margin × leverage', 'posisi = margin × leverage'),
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
        prompt: L(`${usd(margin)} margin at ${lev}x on Hyperliquid, opened with a ${maker ? 'limit (maker)' : 'market (taker)'} order. What is the fee to open?`, `Margin ${usd(margin)} di ${lev}x di Hyperliquid, dibuka dengan order ${maker ? 'limit (maker)' : 'market (taker)'}. Berapa fee untuk buka posisinya?`),
        facts: [`Margin ${usd(margin)}`, `${lev}x`, `fomo ${pct(PERPS_FEES.builder, { digits: 3 })} + venue ${pct(rate - PERPS_FEES.builder, { digits: 3 })}`],
        correct: usd(notional * rate),
        wrong: [
          { label: usd(margin * rate), why: L('Fees are charged on the whole position, not on the margin.', 'Fee dihitung dari seluruh posisi, bukan dari margin.') },
          { label: usd(notional * PERPS_FEES.builder), why: L('That is only the fomo builder fee; the venue fee comes on top.', 'Itu cuma builder fee fomo; venue fee ditambahkan juga.') },
          { label: usd(notional * rate * 2), why: L('That is open and close together. Opening is one side.', 'Itu buka dan tutup sekaligus. Buka cuma satu sisi.') },
          { label: usd(notional * (rate - PERPS_FEES.builder)), why: L('That is only the venue fee; fomo adds its builder fee on top.', 'Itu cuma venue fee; fomo menambahkan builder fee-nya juga.') },
        ],
        spare: (k) => usd(nudge(notional * rate, k)),
        explain: L(`Position: ${usd(margin)} × ${lev} = ${usd(notional)}. Fee per side: ${pct(rate, { digits: 3 })}. ${usd(notional)} × ${pct(rate, { digits: 3 })} = ${usd(notional * rate)}.`, `Posisi: ${usd(margin)} × ${lev} = ${usd(notional)}. Fee per sisi: ${pct(rate, { digits: 3 })}. ${usd(notional)} × ${pct(rate, { digits: 3 })} = ${usd(notional * rate)}.`),
        formula: L('fee per side = margin × leverage × (builder fee + venue fee)', 'fee per sisi = margin × leverage × (builder fee + venue fee)'),
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
        prompt: L(`You open and close a ${lev}x position with market orders on Hyperliquid, and the price does not move. What share of your margin goes to fees?`, `Kamu buka lalu tutup posisi ${lev}x pakai market order di Hyperliquid, dan harganya tidak bergerak. Berapa persen margin kamu yang habis buat fee?`),
        facts: [`${lev}x`, L(`${pct(HL_TAKER, { digits: 3 })} per side`, `${pct(HL_TAKER, { digits: 3 })} per sisi`), L('Price unchanged', 'Harga tetap')],
        correct: pct(share),
        wrong: [
          { label: pct(2 * HL_TAKER), why: L('That is the fee as a share of the position. As a share of margin it is multiplied by the leverage.', 'Itu fee sebagai persen dari posisi. Sebagai persen dari margin, dikali leverage.') },
          { label: pct(lev * HL_TAKER), why: L('That is one side. Opening and closing both pay.', 'Itu cuma satu sisi. Buka dan tutup sama-sama bayar.') },
          { label: pct(HL_TAKER), why: L('That is the fee rate per side on the position, not the cost against your margin.', 'Itu tarif fee per sisi terhadap posisi, bukan biaya terhadap margin kamu.') },
          { label: pct(4 * lev * HL_TAKER), why: L('Each side pays once: two fees, not four.', 'Tiap sisi bayar sekali: dua fee, bukan empat.') },
        ],
        spare: (k) => pct(nudge(share, k)),
        explain: L(`Each side pays ${pct(HL_TAKER, { digits: 3 })} of the position, and the position is ${lev}× the margin. 2 × ${lev} × ${pct(HL_TAKER, { digits: 3 })} = ${pct(share)} of margin gone before the price moves at all.`, `Tiap sisi bayar ${pct(HL_TAKER, { digits: 3 })} dari posisi, dan posisinya ${lev}× margin. 2 × ${lev} × ${pct(HL_TAKER, { digits: 3 })} = ${pct(share)} margin hilang bahkan sebelum harga bergerak.`),
        formula: L('fees ÷ margin = 2 × leverage × fee per side', 'fee ÷ margin = 2 × leverage × fee per sisi'),
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
        prompt: L(`${sideWord(side)} at ${lev}x from ${price(entry)}, isolated margin. The market's max leverage is ${maxLev}x. Roughly where is the liquidation price?`, `${sideWord(side)} ${lev}x dari ${price(entry)}, isolated margin. Leverage maksimal market-nya ${maxLev}x. Kira-kira di mana harga likuidasinya?`),
        facts: [sideWord(side), `${lev}x`, `Entry ${price(entry)}`, L(`Max ${maxLev}x`, `Maks ${maxLev}x`)],
        correct: p(liq),
        wrong: [
          { label: p(entry * (1 - s / lev)), why: L('That is where the whole margin is gone. Liquidation comes earlier, when equity drops to the maintenance margin.', 'Itu titik seluruh margin habis. Likuidasi datang lebih dulu, saat ekuitas turun ke maintenance margin.') },
          { label: p(entry * (1 + s / lev)), why: L('Wrong direction: a ' + side + ' loses when the price moves ' + (side === 'long' ? 'down' : 'up') + '.', 'Arah salah: posisi ' + side + ' rugi saat harga ' + (side === 'long' ? 'turun' : 'naik') + '.') },
          { label: p(entry * (1 - s / (2 * lev))), why: L('Halving the move confuses the maintenance rate with the margin itself.', 'Membagi dua gerakannya berarti menyamakan maintenance rate dengan margin itu sendiri.') },
          { label: p(entry * (1 - (s * 1) / maxLev)), why: L('The max leverage sets the maintenance rate; your own leverage sets how far the price can move.', 'Leverage maksimal menentukan maintenance rate; leverage kamu sendiri yang menentukan seberapa jauh harga boleh bergerak.') },
        ],
        spare: (k) => p(nudge(liq, k)),
        explain: L(`Maintenance rate = 1 ÷ (2 × ${maxLev}) = ${pct(1 / (2 * maxLev))}. The position is liquidated when the loss leaves only that much margin, ${pct(res.liquidationDistance)} ${side === 'long' ? 'below' : 'above'} entry: ${p(liq)}.`, `Maintenance rate = 1 ÷ (2 × ${maxLev}) = ${pct(1 / (2 * maxLev))}. Posisi dilikuidasi saat rugi menyisakan margin sebesar itu, ${pct(res.liquidationDistance)} ${side === 'long' ? 'di bawah' : 'di atas'} entry: ${p(liq)}.`),
        formula: L('liq = (size × entry − side × margin) ÷ (size × (1 − side × mmr)), mmr = 1 ÷ (2 × max leverage)', 'liq = (size × entry − side × margin) ÷ (size × (1 − side × mmr)), mmr = 1 ÷ (2 × leverage maks)'),
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
        prompt: L(`A ${lev}x long on a market with 50x max leverage. About how far can the price fall before liquidation?`, `Long ${lev}x di market dengan leverage maksimal 50x. Kira-kira harga boleh turun berapa jauh sebelum likuidasi?`),
        facts: ['Long', `${lev}x`, L('Max 50x (maintenance 1%)', 'Maks 50x (maintenance 1%)')],
        correct: pct(d, { digits: 1 }),
        wrong: [
          { label: pct(1 / lev, { digits: 1 }), why: L('That is the drop that wipes out the whole margin. Liquidation hits before that, at the maintenance margin.', 'Itu penurunan yang menghabiskan seluruh margin. Likuidasi kena sebelum itu, di maintenance margin.') },
          { label: pct(1 / (2 * lev), { digits: 1 }), why: L('Half the margin is not the trigger; the maintenance margin is much smaller.', 'Setengah margin bukan pemicunya; maintenance margin jauh lebih kecil.') },
          { label: pct(lev / 100, { digits: 1 }), why: L('Leverage shrinks the room to move; it does not grow it.', 'Leverage memperkecil ruang gerak, bukan memperbesar.') },
          { label: pct(1 / lev + 0.01, { digits: 1 }), why: L('The maintenance margin is subtracted from your room, not added.', 'Maintenance margin mengurangi ruang gerak kamu, bukan menambah.') },
        ],
        spare: (k) => pct(nudge(d, k), { digits: 1 }),
        explain: L(`Without maintenance margin it would be 1 ÷ ${lev} = ${pct(1 / lev, { digits: 1 })}. Hyperliquid liquidates while 1% of the position is still left as margin, so the room is a bit smaller: ${pct(d, { digits: 1 })}.`, `Tanpa maintenance margin, jaraknya 1 ÷ ${lev} = ${pct(1 / lev, { digits: 1 })}. Hyperliquid melikuidasi saat masih tersisa 1% dari posisi sebagai margin, jadi ruangnya sedikit lebih kecil: ${pct(d, { digits: 1 })}.`),
        formula: L('distance ≈ (1 ÷ leverage − mmr) ÷ (1 − mmr)', 'jarak ≈ (1 ÷ leverage − mmr) ÷ (1 − mmr)'),
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
        prompt: L(`${sideWord(side)} at ${lev}x from ${price(entry)} with market orders on Hyperliquid. Ignoring funding, where do you break even?`, `${sideWord(side)} ${lev}x dari ${price(entry)} pakai market order di Hyperliquid. Tanpa funding, di harga berapa kamu break-even?`),
        facts: [sideWord(side), `${lev}x`, `Entry ${price(entry)}`, L(`${pct(HL_TAKER, { digits: 3 })} per side`, `${pct(HL_TAKER, { digits: 3 })} per sisi`)],
        correct: p(be),
        wrong: [
          { label: p(entry), why: L('At the entry price you have still paid the open and close fees.', 'Di harga entry kamu tetap sudah bayar fee buka dan tutup.') },
          { label: p(entry * (1 + s * HL_TAKER)), why: L('That covers the open fee only; the close pays another.', 'Itu cuma menutup fee buka; tutup posisi bayar fee lagi.') },
          { label: p(entry * (1 + s * 2 * HL_TAKER * lev)), why: L('Leverage does not change the break-even move: fees and PnL both scale with the position.', 'Leverage tidak mengubah gerakan break-even: fee dan PnL sama-sama mengikuti ukuran posisi.') },
          { label: p(entry * (1 - s * 2 * HL_TAKER)), why: L('Wrong direction: a ' + side + ' needs the price to move ' + (side === 'long' ? 'up' : 'down') + ' to cover fees.', 'Arah salah: posisi ' + side + ' butuh harga ' + (side === 'long' ? 'naik' : 'turun') + ' untuk menutup fee.') },
        ],
        spare: (k) => p(entry + nudge(be - entry, k)),
        explain: L(`Fees take ${pct(HL_TAKER, { digits: 3 })} on the open and about as much on the close, so the price has to move about ${pct(2 * HL_TAKER, { digits: 3 })} your way: ${p(be)}. Leverage changes the size, not this move.`, `Fee mengambil ${pct(HL_TAKER, { digits: 3 })} saat buka dan kira-kira segitu juga saat tutup, jadi harga harus bergerak sekitar ${pct(2 * HL_TAKER, { digits: 3 })} ke arah kamu: ${p(be)}. Leverage mengubah ukuran, bukan gerakan ini.`),
        formula: L('break-even = (size × entry + side × open fee) ÷ (size × (1 − side × fee rate))', 'break-even = (size × entry + side × fee buka) ÷ (size × (1 − side × tarif fee))'),
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
        prompt: L(`You hold a long of ${usd(margin)} at ${lev}x for ${hours} hours. Funding is ${pct(rate, { digits: 4 })} per hour, paid by longs. How much funding do you pay?`, `Kamu pegang long ${usd(margin)} di ${lev}x selama ${hours} jam. Funding ${pct(rate, { digits: 4 })} per jam, dibayar oleh long. Berapa funding yang kamu bayar?`),
        facts: ['Long', L(`Position ${usd(notional)}`, `Posisi ${usd(notional)}`), L(`Funding ${pct(rate, { digits: 4 })}/h`, `Funding ${pct(rate, { digits: 4 })}/jam`), L(`${hours}h`, `${hours} jam`)],
        correct: usd(cost),
        wrong: [
          { label: usd(margin * rate * hours), why: L('Funding is charged on the position size, not on the margin.', 'Funding dihitung dari ukuran posisi, bukan dari margin.') },
          { label: usd(notional * rate), why: L('That is one hour. Hyperliquid charges funding every hour.', 'Itu cuma satu jam. Hyperliquid menagih funding tiap jam.') },
          { label: usd(notional * rate * (hours / 8)), why: L('Hyperliquid funding is hourly, not every 8 hours.', 'Funding Hyperliquid per jam, bukan tiap 8 jam.') },
          { label: usd(0), why: L('When the rate is positive, longs pay shorts.', 'Kalau rate-nya positif, long membayar short.') },
        ],
        spare: (k) => usd(nudge(cost, k)),
        explain: `${usd(notional)} × ${pct(rate, { digits: 4 })} × ${hours} = ${usd(cost)}.`,
        formula: L('funding = position × hourly rate × hours', 'funding = posisi × rate per jam × jam'),
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
        prompt: L(`Long ${usd(margin)} at ${lev}x from ${price(entry)}, stop-loss at ${price(stop)} (${pct(dist, { digits: 0 })} below). How much do you lose if the stop fills?`, `Long ${usd(margin)} di ${lev}x dari ${price(entry)}, stop-loss di ${price(stop)} (${pct(dist, { digits: 0 })} di bawah). Berapa rugi kamu kalau stop kena?`),
        facts: [L(`Position ${usd(notional)}`, `Posisi ${usd(notional)}`), `Stop −${pct(dist, { digits: 0 })}`, L(`${pct(HL_TAKER, { digits: 3 })} per side`, `${pct(HL_TAKER, { digits: 3 })} per sisi`)],
        correct: usd(res.loss),
        wrong: [
          { label: usd(notional * dist), why: L('That is the price move only. The open fee and the close fee at the stop add to the loss.', 'Itu cuma pergerakan harga. Fee buka dan fee tutup di stop menambah ruginya.') },
          { label: usd(margin * dist), why: L('The loss scales with the position, not the margin: multiply by the leverage.', 'Rugi mengikuti ukuran posisi, bukan margin: kalikan dengan leverage.') },
          { label: usd(margin * dist + notional * HL_TAKER * 2), why: L('The fees are right, but the price move is on the whole position, not the margin.', 'Fee-nya sudah benar, tapi pergerakan harga berlaku ke seluruh posisi, bukan margin.') },
          { label: usd(margin), why: L('A stop this close fills well before the margin is gone.', 'Stop sedekat ini kena jauh sebelum margin habis.') },
        ],
        spare: (k) => usd(nudge(res.loss, k)),
        explain: L(`Price move: ${usd(notional)} × ${pct(dist, { digits: 0 })} = ${usd(notional * dist)}. Plus the open fee and the taker fee on the stop fill: ${usd(res.loss)}, or ${pct(res.lossOfMargin, { digits: 1 })} of the margin.`, `Pergerakan harga: ${usd(notional)} × ${pct(dist, { digits: 0 })} = ${usd(notional * dist)}. Ditambah fee buka dan fee taker saat stop kena: ${usd(res.loss)}, atau ${pct(res.lossOfMargin, { digits: 1 })} dari margin.`),
        formula: L('loss = size × |entry − stop| + open fee + close fee at stop', 'rugi = size × |entry − stop| + fee buka + fee tutup di stop'),
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
        prompt: L(`You will lose at most ${usd(risk)} if the stop fills. The stop is ${pct(dist, { digits: 0 })} below entry and you trade at ${lev}x. How much margin can you put in?`, `Kamu mau rugi maksimal ${usd(risk)} kalau stop kena. Stop ada ${pct(dist, { digits: 0 })} di bawah entry dan kamu pakai ${lev}x. Berapa margin yang boleh kamu pasang?`),
        facts: [L(`Max loss ${usd(risk)}`, `Rugi maks ${usd(risk)}`), `Stop −${pct(dist, { digits: 0 })}`, `${lev}x`, L('Fees included', 'Termasuk fee')],
        correct: usd(margin),
        wrong: [
          { label: usd(risk / dist), why: L('That is the position size the risk allows, not the margin. Divide by the leverage.', 'Itu ukuran posisi yang diizinkan risikonya, bukan margin. Bagi dengan leverage.') },
          { label: usd(risk / (lev * dist)), why: L('Close, but it forgets the fees, so the real loss at the stop would be bigger than planned.', 'Hampir, tapi lupa fee, jadi rugi asli di stop bakal lebih besar dari rencana.') },
          { label: usd(risk), why: L('With leverage, a small move loses more than the margin share; size from the stop distance.', 'Dengan leverage, gerakan kecil merugikan lebih dari porsi margin; hitung ukurannya dari jarak stop.') },
          { label: usd((risk * lev) / dist), why: L('Leverage makes each dollar of margin riskier, so the margin goes down, not up.', 'Leverage bikin tiap dolar margin lebih berisiko, jadi margin-nya turun, bukan naik.') },
        ],
        spare: (k) => usd(nudge(margin, k)),
        explain: L(`Each 1 USDC of margin at ${lev}x loses $${per.toFixed(4)} at the stop (${pct(dist, { digits: 0 })} × ${lev} plus fees). ${usd(risk)} ÷ $${per.toFixed(4)} = ${usd(margin)} of margin, a ${usd(margin * lev)} position.`, `Tiap 1 USDC margin di ${lev}x rugi $${per.toFixed(4)} di stop (${pct(dist, { digits: 0 })} × ${lev} ditambah fee). ${usd(risk)} ÷ $${per.toFixed(4)} = margin ${usd(margin)}, posisi ${usd(margin * lev)}.`),
        formula: L('margin = max loss ÷ loss at the stop per 1 USDC of margin', 'margin = rugi maks ÷ rugi di stop per 1 USDC margin'),
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
      const right = first ? L('You get liquidated before the stop', 'Kena likuidasi sebelum stop') : L('The stop fills first', 'Stop kena duluan');
      const other = first ? L('The stop fills first', 'Stop kena duluan') : L('You get liquidated before the stop', 'Kena likuidasi sebelum stop');
      return {
        level: 2,
        prompt: L(`Long at ${lev}x (max 50x) with a stop-loss ${pct(dist, { digits: 0 })} below entry. The price falls straight through. What happens?`, `Long ${lev}x (maks 50x) dengan stop-loss ${pct(dist, { digits: 0 })} di bawah entry. Harga anjlok terus menembus. Apa yang terjadi?`),
        facts: ['Long', `${lev}x`, `Stop −${pct(dist, { digits: 0 })}`],
        correct: right,
        wrong: [
          {
            label: other,
            why: first
              ? L(`At ${lev}x liquidation sits ${pct(liqDist, { digits: 1 })} below entry, closer than the stop.`, `Di ${lev}x, likuidasi ada ${pct(liqDist, { digits: 1 })} di bawah entry, lebih dekat dari stop.`)
              : L(`At ${lev}x liquidation sits ${pct(liqDist, { digits: 1 })} below entry, past the stop.`, `Di ${lev}x, likuidasi ada ${pct(liqDist, { digits: 1 })} di bawah entry, lebih jauh dari stop.`),
          },
          { label: L('Both trigger at the same price', 'Dua-duanya kena di harga yang sama'), why: L('They are set by different things: the stop by you, liquidation by leverage and the maintenance margin.', 'Keduanya ditentukan hal berbeda: stop oleh kamu, likuidasi oleh leverage dan maintenance margin.') },
          { label: L('Neither, the position stays open', 'Tidak dua-duanya, posisi tetap terbuka'), why: L('A stop or liquidation always closes the position once the price reaches it.', 'Stop atau likuidasi selalu menutup posisi begitu harga menyentuhnya.') },
        ],
        spare: () => other,
        explain: L(`At ${lev}x the liquidation price is about ${pct(liqDist, { digits: 1 })} from entry. The stop is ${pct(dist, { digits: 0 })} away, so ${first ? 'liquidation comes first and the stop never fills. Lower the leverage or move the stop closer.' : 'the stop fills first and caps the loss.'}`, `Di ${lev}x, harga likuidasi sekitar ${pct(liqDist, { digits: 1 })} dari entry. Stop berjarak ${pct(dist, { digits: 0 })}, jadi ${first ? 'likuidasi datang duluan dan stop tidak pernah kena. Turunkan leverage atau dekatkan stop.' : 'stop kena duluan dan membatasi rugi.'}`),
        formula: L('liquidation distance ≈ (1 ÷ leverage − mmr) ÷ (1 − mmr)', 'jarak likuidasi ≈ (1 ÷ leverage − mmr) ÷ (1 − mmr)'),
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
