import { pageMetadata } from '../../lib/seo';
import { Hero } from '../../components/Hero';
import { ReferralStrip, ToolCards } from '../../components/Home';
import { PageTransition } from '../../components/PageTransition';

// The app's home. The landing page at / links here and holds the structured data.
export const metadata = pageMetadata('home', 'en');

export default function HomePage() {
  return (
    <PageTransition>
      <Hero />
      <ToolCards />
      <ReferralStrip />
    </PageTransition>
  );
}
