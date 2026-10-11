import { pageMetadata } from '../../lib/seo';
import { Legal } from '../../components/Sections';
import { PageTransition } from '../../components/PageTransition';

export const metadata = pageMetadata('privacy', 'en');

export default function PrivacyPage() {
  return (
    <PageTransition>
      <Legal page="privacy" />
    </PageTransition>
  );
}
