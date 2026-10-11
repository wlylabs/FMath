import { pageMetadata } from '../../lib/seo';
import { Legal } from '../../components/Sections';
import { PageTransition } from '../../components/PageTransition';

export const metadata = pageMetadata('disclaimer', 'en');

export default function DisclaimerPage() {
  return (
    <PageTransition>
      <Legal page="disclaimer" />
    </PageTransition>
  );
}
