import type { Metadata } from 'next';
import { Hero } from '../../components/Hero';
import { ReferralStrip, ToolCards } from '../../components/Home';
import { ROUTES } from '../../lib/routes';
import { BASE_OPEN_GRAPH, SITE_DESCRIPTION, SITE_TITLE } from '../../lib/site';
import { PageTransition } from '../../components/PageTransition';

// The app's home. The landing page at / links here and holds the structured data.
export const metadata: Metadata = {
  alternates: { canonical: ROUTES.home },
  openGraph: { ...BASE_OPEN_GRAPH, title: SITE_TITLE, description: SITE_DESCRIPTION, url: ROUTES.home },
};

export default function HomePage() {
  return (
    <PageTransition>
      <Hero />
      <ToolCards />
      <ReferralStrip />
    </PageTransition>
  );
}
