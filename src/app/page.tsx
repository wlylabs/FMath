import { Header } from '../components/Header';
import { Features, Hero } from '../components/Hero';
import { CalculatorSection } from '../components/CalculatorSection';
import { ReferralSection } from '../components/Referral';
import { Faq, Footer, Methodology } from '../components/Sections';
import { t } from '../lib/copy';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../lib/site';

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
    },
    {
      '@type': 'FAQPage',
      mainEntity: t.faq.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <Header />
      <main>
        <Hero />
        <CalculatorSection />
        <ReferralSection />
        <Features />
        <Methodology />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
