import { pageMetadata } from '../../lib/seo';
import { CalculatorPage } from '../../components/CalculatorPage';
import { ProfitCalculator } from '../../components/calculators/ProfitCalculator';
import { PageTransition } from '../../components/PageTransition';

export const metadata = pageMetadata('profit', 'en');

export default function ProfitPage() {
  return (
    <PageTransition>
      <CalculatorPage active="profit">
        <ProfitCalculator />
      </CalculatorPage>
    </PageTransition>
  );
}
