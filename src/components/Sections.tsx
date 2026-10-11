import { ArrowUpRight, ChevronDown, ExternalLink } from 'lucide-react';
import { t } from '../lib/copy';
import { LAST_CHECKED, SOURCES } from '../lib/sources';
import { date } from '../lib/format';
import { BandTable } from './BandTable';
import { Logo } from './Logo';
import { ReferralLink } from './Referral';
import { InstallButton } from './pwa/PwaProvider';

export function Methodology() {
  return (
    <section id="methodology" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20" aria-labelledby="method-title">
      <h2 id="method-title" className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {t.method.title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2 sm:text-base">{t.method.lead}</p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="card p-5 sm:p-6">
          <h3 className="text-base font-semibold text-ink">{t.method.spotTitle}</h3>
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
          <div className="card p-5 sm:p-6">
            <h3 className="text-base font-semibold text-ink">{t.method.formulasTitle}</h3>
            <dl className="mt-4 divide-y divide-line">
              {t.method.formulas.map((f) => (
                <div key={f.name} className="py-3 first:pt-0 last:pb-0">
                  <dt className="text-xs font-medium text-muted">{f.name}</dt>
                  <dd className="num mt-1 break-words text-[13px] leading-relaxed text-ink">{f.expr}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card p-5 sm:p-6">
            <h3 className="text-base font-semibold text-ink">{t.method.perpsTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{t.method.perpsBody}</p>
          </div>
        </div>
      </div>

      <div id="sources" className="mt-4 card p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base font-semibold text-ink">{t.method.sourcesTitle}</h3>
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
    <section id="faq" className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:pb-24" aria-labelledby="faq-title">
      <h2 id="faq-title" className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {t.faq.title}
      </h2>
      <div className="mt-6 divide-y divide-line border-y border-line">
        {t.faq.items.map((item) => (
          <details key={item.q} className="group">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-medium text-ink [&::-webkit-details-marker]:hidden">
              {item.q}
              <ChevronDown aria-hidden className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
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
    { href: '#calculator', label: t.nav.calculator },
    { href: '#referral', label: t.referral.eyebrow },
    { href: '#methodology', label: t.nav.method },
    { href: '#faq', label: t.nav.faq },
    { href: '#sources', label: t.nav.sources },
  ];
  return (
    <footer className="border-t border-line pb-28 pt-10 lg:pb-10">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo className="size-7" />
            <span className="font-semibold tracking-tight text-ink">FMath</span>
          </div>
          <div className="mt-4 max-w-2xl space-y-2 text-xs leading-relaxed text-muted">
            <p>{t.footer.disclaimer}</p>
            <p>{t.referral.disclosure}</p>
          </div>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2.5 text-sm">
          <ReferralLink className="inline-flex items-center gap-1.5 font-semibold text-accent-strong hover:underline">
            {t.footer.referral}
            <ArrowUpRight aria-hidden className="size-3.5" />
          </ReferralLink>
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-ink-2 hover:text-ink">
              {l.label}
            </a>
          ))}
          <InstallButton variant="text" />
        </nav>
      </div>
      <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-1 border-t border-line px-4 pt-6 text-xs text-muted sm:flex-row sm:justify-between sm:px-6">
        <span>© {new Date().getUTCFullYear()} FMath. Not affiliated with fomo.</span>
        <span>{t.footer.built}</span>
      </div>
    </footer>
  );
}
