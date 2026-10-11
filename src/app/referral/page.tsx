import type { Metadata } from 'next';
import { ReferralSection } from '../../components/Referral';
import { t } from '../../lib/copy';
import { ROUTES } from '../../lib/routes';

export const metadata: Metadata = {
  title: t.referral.headline,
  description: t.referral.lead,
  alternates: { canonical: ROUTES.referral },
  openGraph: { title: t.referral.headline, description: t.referral.lead, url: ROUTES.referral },
};

export default function ReferralPage() {
  return <ReferralSection />;
}
