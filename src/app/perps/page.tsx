import type { Metadata } from 'next';
import { CalculatorPage } from '../../components/CalculatorPage';
import { PerpsCalculator } from '../../components/calculators/PerpsCalculator';
import { t } from '../../lib/copy';
import { ROUTES } from '../../lib/routes';

export const metadata: Metadata = {
  title: t.calc.pages.perps.title,
  description: t.calc.pages.perps.lead,
  alternates: { canonical: ROUTES.perps },
  openGraph: { title: t.calc.pages.perps.title, description: t.calc.pages.perps.lead, url: ROUTES.perps },
};

export default function PerpsPage() {
  return (
    <CalculatorPage active="perps">
      <PerpsCalculator />
    </CalculatorPage>
  );
}
