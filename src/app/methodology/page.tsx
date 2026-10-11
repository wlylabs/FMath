import { pageMetadata } from '../../lib/seo';
import { Methodology } from '../../components/Sections';
import { PageTransition } from '../../components/PageTransition';

export const metadata = pageMetadata('methodology', 'en');

export default function MethodologyPage() {
  return (
    <PageTransition>
      <Methodology />
    </PageTransition>
  );
}
