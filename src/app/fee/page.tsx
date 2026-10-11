import { pageMetadata } from '../../lib/seo';
import { CalculatorPage } from '../../components/CalculatorPage';
import { FeeCalculator } from '../../components/calculators/FeeCalculator';
import { PageTransition } from '../../components/PageTransition';

export const metadata = pageMetadata('fee', 'en');

export default function FeePage() {
  return (
    <PageTransition>
      <CalculatorPage active="fee">
        <FeeCalculator />
      </CalculatorPage>
    </PageTransition>
  );
}
