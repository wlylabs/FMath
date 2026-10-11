import { pageMetadata } from '../../lib/seo';
import { CalculatorPage } from '../../components/CalculatorPage';
import { PerpsCalculator } from '../../components/calculators/PerpsCalculator';
import { PageTransition } from '../../components/PageTransition';

export const metadata = pageMetadata('perps', 'en');

export default function PerpsPage() {
  return (
    <PageTransition>
      <CalculatorPage active="perps">
        <PerpsCalculator />
      </CalculatorPage>
    </PageTransition>
  );
}
