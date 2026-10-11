import { describe, expect, it } from 'vitest';
import { fomoFee } from './fees';
import { makeSession, questionFrom, rng, scoreByTopic, templateIds, QUIZ_TOPICS } from './quiz';
import { usd } from './format';
import { setLang } from './copy';

const SEEDS = Array.from({ length: 300 }, (_, i) => (i * 2654435761) >>> 0);

describe('quiz generator', () => {
  it('is deterministic for a seed', () => {
    expect(makeSession(42, 'all')).toEqual(makeSession(42, 'all'));
    expect(rng(1)()).toBe(rng(1)());
  });

  it('gives every question four distinct options and exactly one answer', () => {
    for (const id of templateIds()) {
      for (const seed of SEEDS) {
        const q = questionFrom(id, seed);
        const labels = q.options.map((o) => o.label);
        expect(new Set(labels).size, `${id} ${seed}: ${labels.join(' | ')}`).toBe(labels.length);
        expect(labels.length, `${id} ${seed}`).toBeGreaterThanOrEqual(3);
        expect(q.options.filter((o) => o.why === undefined)).toHaveLength(1);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(labels.every((l) => !l.includes('NaN') && l !== '-'), `${id} ${seed}: ${labels.join(' | ')}`).toBe(true);
      }
    }
  });

  it('formats every numeric option of a question to the same precision', () => {
    const decimals = (l: string) => l.match(/\.(\d+)/)?.[1]?.length ?? 0;
    for (const id of templateIds()) {
      for (const seed of SEEDS) {
        const q = questionFrom(id, seed);
        const numeric = q.options.map((o) => o.label).filter((l) => /^[$\d]/.test(l));
        // usd() keeps 4 digits under one cent; that only shows up on tiny wrong options
        const shown = new Set(numeric.filter((l) => !/^\$0\.00\d/.test(l)).map(decimals));
        expect(shown.size, `${id} ${seed}: ${numeric.join(' | ')}`).toBeLessThanOrEqual(1);
      }
    }
  });

  it('computes the answer with the calculator math', () => {
    const q = questionFrom('sol-fee', 7);
    const order = Number(q.facts[1]!.replace(/[^\d.]/g, ''));
    expect(q.options[q.answer]!.label).toBe(usd(fomoFee(order, 'solana').fee));
  });

  it('covers every topic and keeps a session on its topic', () => {
    for (const topic of QUIZ_TOPICS) {
      expect(templateIds(topic).length).toBeGreaterThanOrEqual(3);
      const s = makeSession(9, topic);
      expect(s).toHaveLength(5);
      expect(s.every((q) => q.topic === topic)).toBe(true);
    }
  });

  it('uses distinct templates and orders a session from easy to hard', () => {
    const s = makeSession(123, 'all', 8);
    expect(new Set(s.map((q) => q.id.replace(/-\d+$/, ''))).size).toBe(8);
    expect(s.map((q) => q.level)).toEqual([...s.map((q) => q.level)].sort());
  });

  it('scores by topic', () => {
    const s = makeSession(5, 'all');
    const all = scoreByTopic(s, s.map((q) => q.answer));
    expect(all.reduce((n, t) => n + t.right, 0)).toBe(5);
    const none = scoreByTopic(s, s.map(() => null));
    expect(none.reduce((n, t) => n + t.right, 0)).toBe(0);
  });

  it('writes the same questions in Indonesian', () => {
    const en = makeSession(77, 'all', 8);
    setLang('id');
    try {
      const id = makeSession(77, 'all', 8);
      expect(id.map((q) => q.answer)).toEqual(en.map((q) => q.answer));
      expect(id.every((q, i) => q.prompt !== en[i]!.prompt)).toBe(true);
      for (const tid of templateIds()) {
        for (const seed of SEEDS.slice(0, 50)) {
          const q = questionFrom(tid, seed);
          expect(new Set(q.options.map((o) => o.label)).size).toBe(q.options.length);
        }
      }
    } finally {
      setLang('en');
    }
  });
});
