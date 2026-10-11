import { pageMetadata } from '../../lib/seo';
import { Quiz } from '../../components/Quiz';
import { PageTransition } from '../../components/PageTransition';

export const metadata = pageMetadata('quiz', 'en');

export default function QuizPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:pb-16">
        <Quiz />
      </div>
    </PageTransition>
  );
}
