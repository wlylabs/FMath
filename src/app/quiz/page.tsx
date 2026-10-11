import type { Metadata } from 'next';
import { Quiz } from '../../components/Quiz';
import { t } from '../../lib/copy';
import { ROUTES } from '../../lib/routes';
import { BASE_OPEN_GRAPH } from '../../lib/site';

export const metadata: Metadata = {
  title: t.quiz.title,
  description: t.quiz.lead,
  alternates: { canonical: ROUTES.quiz },
  openGraph: { ...BASE_OPEN_GRAPH, title: t.quiz.title, description: t.quiz.lead, url: ROUTES.quiz },
};

export default function QuizPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:pb-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{t.quiz.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">{t.quiz.lead}</p>
      </div>
      <div className="mt-6">
        <Quiz />
      </div>
    </div>
  );
}
