import type { Metadata } from 'next';
import { Legal } from '../../components/Sections';
import { t } from '../../lib/copy';
import { ROUTES } from '../../lib/routes';
import { BASE_OPEN_GRAPH } from '../../lib/site';
import { PageTransition } from '../../components/PageTransition';

const { title, lead } = t.legal.disclaimer;

export const metadata: Metadata = {
  title,
  description: lead,
  alternates: { canonical: ROUTES.disclaimer },
  openGraph: { ...BASE_OPEN_GRAPH, title, description: lead, url: ROUTES.disclaimer },
};

export default function DisclaimerPage() {
  return (
    <PageTransition>
      <Legal page="disclaimer" />
    </PageTransition>
  );
}
