// Bayesian Knowledge Tracing (Corbett & Anderson, 1994).
// Hidden state per topic: learned or not learned. Four parameters per topic.

export interface BktParams {
  prior: number; // P(L0): learned before the first attempt
  learn: number; // P(T):  not learned -> learned after an attempt
  guess: number; // P(G):  correct while not learned
  slip: number;  // P(S):  incorrect while learned
}

export const MASTERY_THRESHOLD = 0.95;

/** Probability that the next answer is correct, given current P(L). */
export function pCorrect(pL: number, p: BktParams): number {
  return pL * (1 - p.slip) + (1 - pL) * p.guess;
}

/** Bayes step: P(L | observation). */
export function posterior(pL: number, correct: boolean, p: BktParams): number {
  if (correct) {
    const num = pL * (1 - p.slip);
    return num / (num + (1 - pL) * p.guess);
  }
  const num = pL * p.slip;
  return num / (num + (1 - pL) * (1 - p.guess));
}

/** Learning step: P(L) for the next attempt. */
export function transition(post: number, p: BktParams): number {
  return post + (1 - post) * p.learn;
}

export interface UpdateDetail {
  before: number;
  posterior: number;
  after: number;
}

export function update(pL: number, correct: boolean, p: BktParams): UpdateDetail {
  const post = posterior(pL, correct, p);
  return { before: pL, posterior: post, after: transition(post, p) };
}

/** Replays a sequence of answers; returns P(L) before the first attempt followed by P(L) after each. */
export function trace(answers: boolean[], p: BktParams): number[] {
  const out = [p.prior];
  let pL = p.prior;
  for (const a of answers) {
    pL = update(pL, a, p).after;
    out.push(pL);
  }
  return out;
}

/** Number of consecutive correct answers needed to reach the threshold (0 if already there). */
export function correctToMastery(pL: number, p: BktParams, threshold = MASTERY_THRESHOLD, cap = 50): number | null {
  let n = 0;
  while (pL < threshold) {
    if (n >= cap) return null;
    pL = update(pL, true, p).after;
    n++;
  }
  return n;
}

export type Status = 'mastered' | 'learning' | 'needs-work' | 'not-started';

export function status(pL: number, attempts: number): Status {
  if (attempts === 0) return 'not-started';
  if (pL >= MASTERY_THRESHOLD) return 'mastered';
  if (pL >= 0.5) return 'learning';
  return 'needs-work';
}

export const STATUS_LABEL: Record<Status, string> = {
  mastered: 'Mastered',
  learning: 'Learning',
  'needs-work': 'Needs work',
  'not-started': 'Not started',
};

// Small seeded random generator, used to build the demo cohort reproducibly.
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export { rng as seededRandom };
