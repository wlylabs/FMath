import type { Metadata } from 'next';
import { Quiz } from '../../components/Quiz';
import { t } from '../../lib/copy';
import { ROUTES } from '../../lib/routes';
import { BASE_OPEN_GRAPH } from '../../lib/site';
import { PageTransition } from '../../components/PageTransition';

export const metadata: Metadata = {
  title: t.quiz.title,
  description: t.quiz.lead,
  alternates: { canonical: ROUTES.quiz },
  openGraph: { ...BASE_OPEN_GRAPH, title: t.quiz.title, description: t.quiz.lead, url: ROUTES.quiz },
};

export default function QuizPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:pb-16">
        <Quiz />
      </div>
    </PageTransition>
  );
}
