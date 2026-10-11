import { Hero } from '../components/Hero';
import { ReferralStrip, ToolCards } from '../components/Home';
import { LegacyRedirect } from '../components/LegacyRedirect';
import { CREATOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../lib/site';
import { PageTransition } from '../components/PageTransition';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      author: { '@id': `${SITE_URL}/#creator` },
      creator: { '@id': `${SITE_URL}/#creator` },
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#creator`,
      name: CREATOR.name,
      alternateName: CREATOR.handle,
      url: CREATOR.url,
      sameAs: [CREATOR.url],
      image: `${SITE_URL}/creator.svg`,
    },
  ],
};

export default function HomePage() {
  return (
    <PageTransition>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <LegacyRedirect />
      <Hero />
      <ToolCards />
      <ReferralStrip />
    </PageTransition>
  );
}
