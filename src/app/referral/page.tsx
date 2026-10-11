import { pageMetadata } from '../../lib/seo';
import { ReferralSection } from '../../components/Referral';
import { PageTransition } from '../../components/PageTransition';

export const metadata = pageMetadata('referral', 'en');

export default function ReferralPage() {
  return (
    <PageTransition>
      <ReferralSection />
    </PageTransition>
  );
}
