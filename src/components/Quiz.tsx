'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, RotateCcw, X } from 'lucide-react';
import { t } from '../lib/copy';
import { cx } from '../lib/cx';
import { makeSession, scoreByTopic, QUIZ_TOPICS, type Question, type QuizTopic } from '../lib/quiz';
import { Notice, Pills } from './ui';
import { NavLink } from './NavLink';

const LENGTH = 5;

type Choice = QuizTopic | 'all';

type Phase =
  | { kind: 'pick' }
  | { kind: 'play'; topic: Choice; questions: Question[]; index: number; picks: (number | null)[] }
  | { kind: 'done'; topic: Choice; questions: Question[]; picks: (number | null)[] };

function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 32);
}

/** Practice mode: five generated questions, then a per-topic summary. */
export function Quiz() {
  const [topic, setTopic] = useState<Choice>('all');
  const [phase, setPhase] = useState<Phase>({ kind: 'pick' });
  const top = useRef<HTMLDivElement>(null);

  const start = (choice: Choice) => {
    setTopic(choice);
    setPhase({ kind: 'play', topic: choice, questions: makeSession(newSeed(), choice, LENGTH), index: 0, picks: Array(LENGTH).fill(null) });
  };

  // a new question or the results start at the top of the card, not mid-scroll
  const step = phase.kind === 'play' ? phase.index : phase.kind;
  useEffect(() => {
    const el = top.current;
    if (!el || el.getBoundingClientRect().top >= 0) return;
    el.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [step]);

  return (
    <div ref={top} className="mx-auto max-w-2xl scroll-mt-24">
      {phase.kind === 'pick' && <Picker topic={topic} onTopic={setTopic} onStart={() => start(topic)} />}
      {phase.kind === 'play' && (
        <Play
          key={phase.questions[phase.index]!.id}
          question={phase.questions[phase.index]!}
          index={phase.index}
          total={phase.questions.length}
          pick={phase.picks[phase.index] ?? null}
          onPick={(i) =>
            setPhase((p) => (p.kind === 'play' ? { ...p, picks: p.picks.map((v, j) => (j === p.index ? i : v)) } : p))
          }
          onNext={() =>
            setPhase((p) => {
              if (p.kind !== 'play') return p;
              if (p.index + 1 < p.questions.length) return { ...p, index: p.index + 1 };
              return { kind: 'done', topic: p.topic, questions: p.questions, picks: p.picks };
            })
          }
        />
      )}
      {phase.kind === 'done' && (
        <Results
          questions={phase.questions}
          picks={phase.picks}
          onAgain={() => start(phase.topic)}
          onTopic={(tp) => start(tp)}
          onChange={() => setPhase({ kind: 'pick' })}
        />
      )}
      <p className="mt-6 text-xs leading-relaxed text-muted">{t.quiz.disclaimer}</p>
    </div>
  );
}

function Picker(props: { topic: Choice; onTopic: (c: Choice) => void; onStart: () => void }) {
  const options = (['all', ...QUIZ_TOPICS] as Choice[]).map((value) => ({ value, label: t.quiz.topics[value] }));
  return (
    <section className="card p-5 sm:p-6">
      <p id="quiz-topic" className="mb-3 text-sm font-medium text-ink">
        {t.quiz.topicLabel}
      </p>
      <Pills options={options} value={props.topic} onChange={props.onTopic} label={t.quiz.topicLabel} labelledBy="quiz-topic" />
      <button
        type="button"
        onClick={props.onStart}
        className="press mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-ink hover:bg-accent-hover sm:w-auto"
      >
        {t.quiz.start}
        <ArrowRight aria-hidden className="size-4" />
      </button>
      <p className="mt-3 text-xs text-muted">{t.quiz.meta(LENGTH)}</p>
    </section>
  );
}

function Play(props: {
  question: Question;
  index: number;
  total: number;
  pick: number | null;
  onPick: (i: number) => void;
  onNext: () => void;
}) {
  const { question: q, pick } = props;
  const answered = pick !== null;
  const right = pick === q.answer;
  const next = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (answered) next.current?.focus({ preventScroll: true });
  }, [answered]);
  const last = props.index + 1 === props.total;

  return (
    <section aria-labelledby="quiz-prompt" className="card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 text-xs text-muted">
        <span>{t.quiz.progress(props.index + 1, props.total)}</span>
        <span>
          {t.quiz.topics[q.topic]} · {t.quiz.level(q.level)}
        </span>
      </div>
      <div
        className="mt-2 h-1 overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={props.total}
        aria-valuenow={props.index + (answered ? 1 : 0)}
        aria-label={t.quiz.progress(props.index + 1, props.total)}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-[var(--dur-base)] ease-[var(--ease-standard)]"
          style={{ width: `${((props.index + (answered ? 1 : 0)) / props.total) * 100}%` }}
        />
      </div>

      <h2 id="quiz-prompt" className="mt-5 text-lg font-semibold leading-snug tracking-tight text-ink">
        {q.prompt}
      </h2>
      <ul aria-label={t.quiz.given} className="mt-3 flex flex-wrap gap-1.5">
        {q.facts.map((f) => (
          <li key={f} className="num rounded-lg bg-surface-2 px-2.5 py-1 text-xs text-ink-2">
            {f}
          </li>
        ))}
      </ul>

      <div role="group" aria-label={t.quiz.options} className="mt-5 grid gap-2">
        {q.options.map((o, i) => {
          const isAnswer = i === q.answer;
          const isPick = i === pick;
          return (
            <button
              key={o.label}
              type="button"
              disabled={answered}
              onClick={() => props.onPick(i)}
              aria-pressed={isPick}
              className={cx(
                'flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                !answered && 'press-soft border-line bg-surface-2 text-ink hover:border-line-strong',
                answered && isAnswer && 'border-pos bg-pos-wash text-ink',
                answered && isPick && !isAnswer && 'border-neg bg-neg-wash text-ink',
                answered && !isAnswer && !isPick && 'border-line text-muted',
              )}
            >
              <span className="num font-medium">{o.label}</span>
              {answered && isAnswer && <Check aria-label={t.quiz.answer} className="size-4 shrink-0 text-pos" />}
              {answered && isPick && !isAnswer && <X aria-label={t.quiz.yourPick} className="size-4 shrink-0 text-neg" />}
            </button>
          );
        })}
      </div>

      <div aria-live="polite">
        {answered && (
          <div className="mt-5 space-y-3">
            <p className={cx('text-sm font-semibold', right ? 'text-pos' : 'text-neg')}>{right ? t.quiz.right : t.quiz.wrong}</p>
            {!right && q.options[pick]?.why && <Notice tone="warn">{q.options[pick].why}</Notice>}
            <div className="rounded-xl border border-line p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">{t.quiz.solution}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink">{q.explain}</p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted">{t.quiz.formula}</p>
              <p className="num mt-1 text-xs leading-relaxed text-ink-2">{q.formula}</p>
            </div>
            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <NavLink href={q.href} className="text-sm font-medium text-accent-strong hover:underline">
                {t.quiz.open}
              </NavLink>
              <button
                ref={next}
                type="button"
                onClick={props.onNext}
                className="press inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-bg hover:opacity-90"
              >
                {last ? t.quiz.finish : t.quiz.next}
                <ArrowRight aria-hidden className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Results(props: {
  questions: Question[];
  picks: (number | null)[];
  onAgain: () => void;
  onTopic: (t: QuizTopic) => void;
  onChange: () => void;
}) {
  const { questions, picks } = props;
  const right = questions.filter((q, i) => picks[i] === q.answer).length;
  const topics = scoreByTopic(questions, picks);
  const weakest = topics.filter((s) => s.right < s.total).sort((a, b) => a.right / a.total - b.right / b.total)[0];

  return (
    <section aria-labelledby="quiz-score" className="card p-5 sm:p-6">
      <p className="text-sm text-ink-2">{t.quiz.score}</p>
      <p id="quiz-score" className="mt-1 text-4xl font-semibold tracking-tight text-ink sm:text-[2.75rem]">
        {t.quiz.scoreValue(right, questions.length)}
      </p>
      <p className="mt-1.5 text-sm text-ink-2">{t.quiz.verdict(right, questions.length)}</p>

      <dl className="mt-5 divide-y divide-line border-y border-line">
        {topics.map((s) => (
          <div key={s.topic} className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-sm text-ink-2">{t.quiz.topics[s.topic]}</dt>
            <dd className="flex items-baseline gap-3 text-sm">
              <span className={cx('text-xs', s.right === s.total ? 'text-pos' : 'text-warn')}>
                {s.right === s.total ? t.quiz.solid : t.quiz.practice}
              </span>
              <span className="num font-semibold text-ink">{t.quiz.scoreValue(s.right, s.total)}</span>
            </dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-6 text-sm font-semibold text-ink">{t.quiz.review}</h3>
      <ol className="mt-2 space-y-2">
        {questions.map((q, i) => {
          const ok = picks[i] === q.answer;
          const picked = picks[i] ?? null;
          return (
            <li key={q.id} className="flex gap-2.5 rounded-xl bg-surface-2 px-3.5 py-3 text-sm">
              {ok ? <Check aria-label={t.quiz.right} className="mt-0.5 size-4 shrink-0 text-pos" /> : <X aria-label={t.quiz.wrong} className="mt-0.5 size-4 shrink-0 text-neg" />}
              <div className="min-w-0">
                <p className="text-ink">{q.prompt}</p>
                <p className="num mt-1 text-xs text-ink-2">
                  {t.quiz.answer}: {q.options[q.answer]!.label}
                  {!ok && picked !== null && ` · ${t.quiz.yourPick}: ${q.options[picked]!.label}`}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={props.onAgain}
          className="press inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-ink hover:bg-accent-hover"
        >
          <RotateCcw aria-hidden className="size-4" />
          {t.quiz.again}
        </button>
        {weakest && topics.length > 1 && (
          <button
            type="button"
            onClick={() => props.onTopic(weakest.topic)}
            className="press inline-flex h-11 items-center justify-center rounded-xl border border-line px-5 text-sm font-semibold text-ink hover:border-line-strong"
          >
            {t.quiz.retryWeak(t.quiz.topics[weakest.topic])}
          </button>
        )}
        <button
          type="button"
          onClick={props.onChange}
          className="press inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold text-ink-2 hover:text-ink"
        >
          {t.quiz.changeTopic}
        </button>
      </div>
    </section>
  );
}
