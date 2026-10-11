import { pageMetadata } from '../../lib/seo';
import { Faq, FaqJsonLd } from '../../components/Sections';
import { PageTransition } from '../../components/PageTransition';

export const metadata = pageMetadata('faq', 'en');

export default function FaqPage() {
  return (
    <PageTransition>
      <FaqJsonLd />
      <Faq />
    </PageTransition>
  );
}
