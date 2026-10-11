import type { Metadata } from 'next';
import { Methodology } from '../../components/Sections';
import { t } from '../../lib/copy';
import { ROUTES } from '../../lib/routes';

export const metadata: Metadata = {
  title: t.method.title,
  description: t.method.lead,
  alternates: { canonical: ROUTES.methodology },
  openGraph: { title: t.method.title, description: t.method.lead, url: ROUTES.methodology },
};

export default function MethodologyPage() {
  return <Methodology />;
}
