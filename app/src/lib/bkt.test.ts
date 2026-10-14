import { describe, expect, it } from 'vitest';
import { correctToMastery, pCorrect, posterior, status, trace, transition, update, type BktParams } from './bkt';
import { nextQuestion, recommend, sanitize, simulateCohort, topicState, type Attempt } from './store';
import { csvCell } from './csv';
import { DEFAULT_PARAMS, TOPICS, defaultParamsByTopic } from '../data/topics';
import { QUESTIONS } from '../data/questions';

const P: BktParams = { prior: 0.2, learn: 0.15, guess: 0.25, slip: 0.1 };

describe('BKT update', () => {
  it('matches a hand calculation', () => {
    // correct from 0.2: 0.2*0.9 / (0.2*0.9 + 0.8*0.25) = 0.18 / 0.38
    expect(posterior(0.2, true, P)).toBeCloseTo(0.18 / 0.38, 12);
    expect(transition(0.18 / 0.38, P)).toBeCloseTo(0.18 / 0.38 + (1 - 0.18 / 0.38) * 0.15, 12);
    // incorrect from 0.2: 0.2*0.1 / (0.2*0.1 + 0.8*0.75) = 0.02 / 0.62
    expect(posterior(0.2, false, P)).toBeCloseTo(0.02 / 0.62, 12);
  });

  it('matches the Python engine (model/bkt.py) exactly', () => {
    const seqs = [[1, 0, 1, 1, 1], [0, 0, 0, 1, 1, 1, 1], [1, 1, 1]];
    const python = [
      [0.38, 0.6092105263157895, 0.42563131313131314, 0.6631674577276774, 0.8241113015326292],
      [0.38, 0.3653225806451613, 0.36294472681067347, 0.36256980976838116, 0.5850153753916373, 0.7855855152790334, 0.8690510103224477],
      [0.38, 0.6092105263157895, 0.7985691144708424],
    ];
    seqs.forEach((s, i) => {
      const tr = trace(s.map(Boolean), P);
      s.forEach((_, k) => expect(pCorrect(tr[k], P)).toBeCloseTo(python[i][k], 12));
    });
  });

  it('a correct answer never lowers P(L) and an incorrect one never raises the Bayes step', () => {
    for (let pL = 0.01; pL < 1; pL += 0.07) {
      expect(update(pL, true, P).after).toBeGreaterThanOrEqual(pL);
      expect(posterior(pL, false, P)).toBeLessThanOrEqual(pL);
    }
  });

  it('counts correct answers to mastery', () => {
    expect(correctToMastery(0.2, P)).toBe(3);
    const t = trace([true, true, true], P);
    expect(t[2]).toBeLessThan(0.95);
    expect(t[3]).toBeGreaterThanOrEqual(0.95);
    expect(correctToMastery(0.97, P)).toBe(0);
  });

  it('labels status bands', () => {
    expect(status(0.2, 0)).toBe('not-started');
    expect(status(0.96, 3)).toBe('mastered');
    expect(status(0.6, 3)).toBe('learning');
    expect(status(0.3, 3)).toBe('needs-work');
  });
});

describe('adaptive selection', () => {
  const params = defaultParamsByTopic();
  const states = (att: Attempt[]) => TOPICS.map((t) => topicState(att, 'me', t.id, params[t.id]));

  it('starts with the first topic in course order', () => {
    expect(recommend(states([]))!.topic).toBe('arrays');
  });

  it('moves to the weakest unmastered topic', () => {
    const att: Attempt[] = ['AR-01', 'AR-02', 'AR-03'].map((q, i) => ({ id: q, student: 'me', topic: 'arrays', question: q, chosen: 0, correct: true, at: i }));
    att.push({ id: 'x', student: 'me', topic: 'lists', question: 'LL-01', chosen: 1, correct: false, at: 9 });
    expect(recommend(states(att))!.topic).toBe('lists');
  });

  it('serves unseen questions first, then the most recent wrong one', () => {
    const qs = QUESTIONS.filter((q) => q.topic === 'trees');
    const att: Attempt[] = qs.map((q, i) => ({ id: q.id, student: 'me', topic: 'trees', question: q.id, chosen: 0, correct: i !== 2 && i !== 5, at: i }));
    expect(nextQuestion([], 'me', 'trees').q.id).toBe(qs[0].id);
    expect(nextQuestion(att, 'me', 'trees').q.id).toBe(qs[5].id);
    expect(nextQuestion(att, 'me', 'trees', qs[5].id).q.id).toBe(qs[2].id);
  });

  it('simulated cohort is deterministic for a seed and uses real questions', () => {
    const a = simulateCohort(7, params, 1_800_000_000_000);
    const b = simulateCohort(7, params, 1_800_000_000_000);
    expect(a).toEqual(b);
    const ids = new Set(QUESTIONS.map((q) => q.id));
    a.forEach((x) => {
      expect(ids.has(x.question)).toBe(true);
      expect(x.correct).toBe(x.chosen === QUESTIONS.find((q) => q.id === x.question)!.answer);
    });
  });
});

describe('starting parameters', () => {
  it('are valid probabilities with guess + slip < 1', () => {
    expect(DEFAULT_PARAMS.guess + DEFAULT_PARAMS.slip).toBeLessThan(1);
    Object.values(DEFAULT_PARAMS).forEach((v) => { expect(v).toBeGreaterThan(0); expect(v).toBeLessThan(1); });
  });
});

describe('input safety', () => {
  it('neutralises spreadsheet formulas and escapes quotes in CSV cells', () => {
    expect(csvCell('=HYPERLINK("http://x","y")')).toBe(`"'=HYPERLINK(""http://x"",""y"")"`);
    expect(csvCell('+1')).toBe(`"'+1"`);
    expect(csvCell('@SUM(A1)')).toBe(`"'@SUM(A1)"`);
    expect(csvCell('Arrays & Strings')).toBe('"Arrays & Strings"');
    expect(csvCell(0.5)).toBe('0.5');
  });

  it('rejects malformed saved data and drops invalid attempts', () => {
    expect(sanitize(null)).toBeNull();
    expect(sanitize({ version: 2, attempts: [] })).toBeNull();
    const good: Attempt = { id: 'a', student: 'me', topic: 'arrays', question: 'AR-01', chosen: 1, correct: true, at: 1 };
    const d = sanitize({
      version: 1,
      attempts: [good, { ...good, id: 'b', chosen: 0, correct: true }, { ...good, id: 'c', topic: 'nope' }, 'x', null],
      params: { arrays: { prior: 2, learn: 0.1, guess: 0.2, slip: 0.1 } },
      studentName: 'x'.repeat(500),
      teacherName: '   ',
      cohortSeed: 'abc',
    })!;
    expect(d.attempts.map((a) => a.id)).toEqual(['a']);
    expect(d.params.arrays).toEqual(DEFAULT_PARAMS);
    expect(d.studentName.length).toBe(60);
    expect(d.teacherName).toBe('Course instructor');
    expect(d.cohortSeed).toBe(20261015);
  });
});
