import type { Metadata } from 'next';
import { ReferralSection } from '../../components/Referral';
import { t } from '../../lib/copy';
import { ROUTES } from '../../lib/routes';
import { BASE_OPEN_GRAPH } from '../../lib/site';
import { PageTransition } from '../../components/PageTransition';

export const metadata: Metadata = {
  title: t.referral.headline,
  description: t.referral.lead,
  alternates: { canonical: ROUTES.referral },
  openGraph: { ...BASE_OPEN_GRAPH, title: t.referral.headline, description: t.referral.lead, url: ROUTES.referral },
};

export default function ReferralPage() {
  return (
    <PageTransition>
      <ReferralSection />
    </PageTransition>
  );
}
