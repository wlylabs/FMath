import { ArrowRight, ArrowUpRight, BookOpen, CircleHelp, Gauge, Receipt, Target } from 'lucide-react';
import { fomoFee } from '../lib/fees';
import { roundTrip } from '../lib/roundtrip';
import { PERPS_FEES, venueFeeRate } from '../lib/perps';
import { pct, usd } from '../lib/format';
import { t } from '../lib/copy';
import { CREATOR } from '../lib/site';
import { ROUTES } from '../lib/routes';
import { ReferralLink } from './Referral';
import { CreatorAvatar } from './Creator';
import { NavLink } from './NavLink';

/** One linked card per calculator, each with a worked example from the real fee schedule. */
export function ToolCards() {
  const fee = fomoFee(50, 'solana');
  const trip = roundTrip({
    chain: 'solana',
    tokenClass: 'standard',
    referral: false,
    buyUsd: 100,
    multiple: 2,
    networkFeeUsd: 0,
    buyImpact: 0,
    sellImpact: 0,
  });
  const perpsRate = PERPS_FEES.builder + venueFeeRate('hyperliquid', 'taker', false);
  const cards = [
    { href: ROUTES.fee, Icon: Receipt, item: t.features.items[0]!, example: t.home.feeExample(usd(fee.fee), pct(fee.effectiveRate)) },
    { href: ROUTES.profit, Icon: Target, item: t.features.items[1]!, example: t.home.profitExample(usd(trip.pnl, { signed: true })) },
    { href: ROUTES.perps, Icon: Gauge, item: t.features.items[2]!, example: t.home.perpsExample(pct(perpsRate, { digits: 3 })) },
  ];
  const more = [
    { href: ROUTES.methodology, Icon: BookOpen, title: t.nav.method, body: t.home.methodBody },
    { href: ROUTES.faq, Icon: CircleHelp, title: t.nav.faq, body: t.home.faqBody },
  ];

  return (
    <section aria-labelledby="tools-title" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <h2 id="tools-title" className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {t.home.toolsTitle}
      </h2>
      <p className="mt-2 text-sm text-ink-2">{t.home.toolsLead}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {cards.map(({ href, Icon, item, example }) => (
          <NavLink key={href} href={href} className="card press-soft group flex flex-col p-4 hover:border-line-strong sm:p-6">
            <span className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-0">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-wash text-accent-strong">
                <Icon aria-hidden className="size-5" />
              </span>
              <span className="min-w-0 flex-1 text-base font-semibold text-ink sm:mt-4">{item.title}</span>
              <ArrowRight aria-hidden className="size-4 shrink-0 text-accent-strong transition-transform group-hover:translate-x-0.5 sm:hidden" />
            </span>
            {/* phones keep the card to its title and worked example */}
            <span className="mt-1.5 hidden flex-1 text-sm leading-relaxed text-ink-2 sm:block">{item.body}</span>
            <span className="num mt-3 border-t border-dashed border-line-strong pt-3 text-xs text-ink sm:mt-4">{example}</span>
            <span className="mt-4 hidden items-center gap-1.5 text-sm font-semibold text-accent-strong sm:inline-flex">
              {t.home.open}
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </NavLink>
        ))}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {more.map(({ href, Icon, title, body }) => (
          <NavLink key={href} href={href} className="card press-soft group flex items-center gap-4 p-4 hover:border-line-strong sm:p-5">
            <Icon aria-hidden className="size-5 shrink-0 text-ink-2" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">{title}</span>
              <span className="block text-xs text-ink-2">{body}</span>
            </span>
            <ArrowRight aria-hidden className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
          </NavLink>
        ))}
      </div>
    </section>
  );
}

/** Compact version of the referral coupon; the full one lives on /referral/. */
export function ReferralStrip() {
  return (
    <section aria-labelledby="referral-strip-title" className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:pb-16">
      <div className="flex flex-col gap-6 rounded-3xl bg-accent p-6 text-accent-ink sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2.5 text-sm text-accent-ink/75">
            <CreatorAvatar size={28} className="ring-2 ring-accent-ink/15" />
            {t.referral.from} {CREATOR.name} · {CREATOR.handle}
          </p>
          <h2 id="referral-strip-title" className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {t.referral.headline}
          </h2>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <ReferralLink className="press inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent-ink px-5 text-sm font-semibold text-accent hover:opacity-90">
            {t.referral.cta}
            <ArrowUpRight aria-hidden className="size-4" />
          </ReferralLink>
          <NavLink
            href={ROUTES.referral}
            className="press inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-accent-ink/30 px-5 text-sm font-semibold hover:border-accent-ink"
          >
            {t.home.referralCta}
          </NavLink>
        </div>
      </div>
    </section>
  );
}
