import type { Metadata } from 'next';
import { CalculatorPage } from '../../components/CalculatorPage';
import { ProfitCalculator } from '../../components/calculators/ProfitCalculator';
import { t } from '../../lib/copy';
import { ROUTES } from '../../lib/routes';

export const metadata: Metadata = {
  title: t.calc.pages.profit.title,
  description: t.calc.pages.profit.lead,
  alternates: { canonical: ROUTES.profit },
  openGraph: { title: t.calc.pages.profit.title, description: t.calc.pages.profit.lead, url: ROUTES.profit },
};

export default function ProfitPage() {
  return (
    <CalculatorPage active="profit">
      <ProfitCalculator />
    </CalculatorPage>
  );
}
