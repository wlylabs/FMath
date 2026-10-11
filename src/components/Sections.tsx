'use client';

import { ArrowUpRight, ChevronDown, ExternalLink } from 'lucide-react';
import { ROUTES } from '../lib/routes';
import { t } from '../lib/copy';
import { LAST_CHECKED, SOURCES } from '../lib/sources';
import { date } from '../lib/format';
import { BandTable } from './BandTable';
import { Logo } from './Logo';
import { CreatorAvatar, CreatorLink, XIcon } from './Creator';
import { CREATOR } from '../lib/site';
import { ReferralLink } from './Referral';
import { InstallButton } from './pwa/PwaProvider';
import { NavLink } from './NavLink';

export function Methodology() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:pb-16 lg:pt-12" aria-labelledby="method-title">
      <h1 id="method-title" className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {t.method.title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2 sm:text-base">{t.method.lead}</p>
      <nav aria-label={t.method.title} className="-mx-4 mt-5 flex gap-2 overflow-x-auto overscroll-x-contain px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        {[
          { href: '#spot', label: t.method.spotTitle },
          { href: '#formulas', label: t.method.formulasTitle },
          { href: '#perps-fees', label: t.method.perpsTitle },
          { href: '#sources', label: t.method.sourcesTitle },
        ].map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="press inline-flex h-9 shrink-0 items-center rounded-full border border-line bg-surface px-3.5 text-sm text-ink-2 hover:border-line-strong hover:text-ink"
          >
            {l.label}
          </a>
        ))}
      </nav>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div id="spot" className="card p-5 sm:p-6">
          <h2 className="text-base font-semibold text-ink">{t.method.spotTitle}</h2>
          <p className="mt-4 text-sm font-medium text-ink">{t.method.solanaTitle}</p>
          <div className="mt-2.5">
            <BandTable chain="solana" tokenClass="standard" referral={false} caption={t.method.solanaTitle} />
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-ink">{t.method.otherTitle}</dt>
              <dd className="mt-1 text-ink-2">{t.method.otherBody}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">{t.method.majorTitle}</dt>
              <dd className="mt-1 text-ink-2">{t.method.majorBody}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Referral</dt>
              <dd className="mt-1 text-ink-2">{t.method.referralBody}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">{t.common.sell}</dt>
              <dd className="mt-1 text-ink-2">{t.method.minSell}</dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-4">
          <div id="formulas" className="card p-5 sm:p-6">
            <h2 className="text-base font-semibold text-ink">{t.method.formulasTitle}</h2>
            <dl className="mt-4 divide-y divide-line">
              {t.method.formulas.map((f) => (
                <div key={f.name} className="py-3 first:pt-0 last:pb-0">
                  <dt className="text-xs font-medium text-muted">{f.name}</dt>
                  <dd className="num mt-1 break-words text-[13px] leading-relaxed text-ink">{f.expr}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div id="perps-fees" className="card p-5 sm:p-6">
            <h2 className="text-base font-semibold text-ink">{t.method.perpsTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{t.method.perpsBody}</p>
          </div>
        </div>
      </div>

      <div id="sources" className="mt-4 card p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-ink">{t.method.sourcesTitle}</h2>
          <p className="text-xs text-muted">{t.method.checked(date(LAST_CHECKED))}</p>
        </div>
        <ul className="mt-4 grid gap-x-6 sm:grid-cols-2">
          {SOURCES.map((src) => (
            <li key={src.url} className="border-t border-line py-3">
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-accent-strong"
              >
                {src.label}
                <ExternalLink aria-hidden className="size-3.5 text-muted group-hover:text-accent-strong" />
              </a>
              <span className="ml-2 rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted">{t.method.kinds[src.kind]}</span>
              <p className="mt-1 text-xs leading-relaxed text-ink-2">{src.use}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-4 pb-12 pt-8 sm:px-6 lg:pb-16 lg:pt-12" aria-labelledby="faq-title">
      <h1 id="faq-title" className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {t.faq.title}
      </h1>
      <div className="mt-6 divide-y divide-line border-y border-line">
        {t.faq.items.map((item) => (
          <details key={item.q} className="group">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-medium text-ink [&::-webkit-details-marker]:hidden">
              {item.q}
              <ChevronDown aria-hidden className="size-4 shrink-0 text-muted transition-transform duration-[var(--dur-base)] ease-[var(--ease-standard)] group-open:rotate-180" />
            </summary>
            <p className="pb-5 pr-8 text-sm leading-relaxed text-ink-2">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  const links = [
    { href: ROUTES.fee, label: t.calc.tabs.fee },
    { href: ROUTES.profit, label: t.calc.tabs.profit },
    { href: ROUTES.perps, label: t.calc.tabs.perps },
    { href: ROUTES.quiz, label: t.nav.quiz },
    { href: ROUTES.referral, label: t.nav.referral },
    { href: ROUTES.methodology, label: t.nav.method },
    { href: ROUTES.faq, label: t.nav.faq },
    { href: `${ROUTES.methodology}#sources`, label: t.nav.sources },
  ];
  return (
    <footer
      className="border-t border-line pb-[calc(5rem+env(safe-area-inset-bottom))] pt-10 lg:pb-10"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo className="size-7" />
            <span className="font-semibold tracking-tight text-ink">FMath</span>
          </div>
          <CreatorLink
            aria-label={t.creator.followLabel(CREATOR.handle)}
            className="group mt-4 inline-flex items-center gap-2.5 rounded-full border border-line py-1 pl-1 pr-3.5 text-sm transition-colors hover:border-line-strong"
          >
            <CreatorAvatar size={28} />
            <span className="text-ink-2">
              {t.creator.label} <span className="font-semibold text-ink">{CREATOR.name}</span>
            </span>
            <XIcon className="size-3.5 text-ink-2 group-hover:text-ink" />
            <span className="num text-xs text-muted">{CREATOR.handle}</span>
          </CreatorLink>
          <div className="mt-4 max-w-2xl space-y-2 text-xs leading-relaxed text-muted">
            <p>{t.footer.disclaimer}</p>
            <p>{t.referral.disclosure}</p>
          </div>
        </div>
        <nav aria-label={t.footer.nav} className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm md:flex md:flex-col">
          <ReferralLink className="inline-flex items-center gap-1.5 font-semibold text-accent-strong hover:underline">
            {t.footer.referral}
            <ArrowUpRight aria-hidden className="size-3.5" />
          </ReferralLink>
          {links.map((l) => (
            <NavLink key={l.href} href={l.href} className="text-ink-2 hover:text-ink">
              {l.label}
            </NavLink>
          ))}
          <InstallButton variant="text" />
        </nav>
      </div>
      <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-1 border-t border-line px-4 pt-6 text-xs text-muted sm:flex-row sm:justify-between sm:px-6">
        <span>{t.footer.copyright(new Date().getUTCFullYear(), CREATOR.name)}</span>
        <span>{t.footer.built}</span>
      </div>
    </footer>
  );
}
