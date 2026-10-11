import type { Metadata } from 'next';
import { Faq } from '../../components/Sections';
import { t } from '../../lib/copy';
import { ROUTES } from '../../lib/routes';

const DESCRIPTION = 'Answers on accuracy, live data sources, the fomo fee schedule and the referral discount.';

export const metadata: Metadata = {
  title: t.faq.title,
  description: DESCRIPTION,
  alternates: { canonical: ROUTES.faq },
  openGraph: { title: t.faq.title, description: DESCRIPTION, url: ROUTES.faq },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: t.faq.items.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <Faq />
    </>
  );
}
