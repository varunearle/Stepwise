import { useMemo, useState, type ReactNode } from 'react';
import { TraceChart } from '../components/charts';
import { PageHeader, f2 } from '../components/ui';
import { trace, type BktParams } from '../lib/bkt';
import { useStore } from '../lib/store';
import evaluation from '../data/evaluation.json';
import { DEFAULT_PARAMS, PARAM_REASONS, TOPICS, type TopicId } from '../data/topics';

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center gap-3 border-b border-line pb-2">
        <span className="num rounded-sm bg-teal px-1.5 py-0.5 text-[11px] text-white">{n}</span>
        <h2 className="font-serif text-[22px] font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Frac({ top, bottom }: { top: ReactNode; bottom: ReactNode }) {
  return (
    <span className="inline-flex flex-col items-center align-middle">
      <span className="px-1 pb-0.5">{top}</span>
      <span className="w-full border-t border-ink px-1 pt-0.5">{bottom}</span>
    </span>
  );
}

function Eq({ label, children, note }: { label: string; children: ReactNode; note: string }) {
  return (
    <div className="card flex flex-col p-4">
      <div className="eyebrow mb-3">{label}</div>
      <div className="num flex min-h-[64px] flex-wrap items-center gap-2 overflow-x-auto rounded border border-line bg-sunk/60 px-3 py-3 text-[13px]">{children}</div>
      <p className="mt-2 text-[12.5px] text-muted">{note}</p>
    </div>
  );
}

const KEYS: (keyof BktParams)[] = ['prior', 'learn', 'guess', 'slip'];
const SYMBOL: Record<keyof BktParams, string> = { prior: 'P(L0)', learn: 'P(T)', guess: 'P(G)', slip: 'P(S)' };
const MEANING: Record<keyof BktParams, string> = {
  prior: 'Probability the topic is already learned before the first attempt.',
  learn: 'Probability of moving from not learned to learned after an attempt.',
  guess: 'Probability of a correct answer while the topic is not learned.',
  slip: 'Probability of an incorrect answer while the topic is learned.',
};
const PRESET = [true, false, true, true, false, true, true, true, true, true];

export default function Model() {
  const { data } = useStore();
  const [simTopic, setSimTopic] = useState<TopicId>('stacks');
  const [seq, setSeq] = useState<boolean[]>(PRESET);

  const simParams = data.params[simTopic];
  const simTrace = useMemo(() => trace(seq, simParams), [seq, simParams]);
  const crossAt = simTrace.findIndex((v, i) => i > 0 && v >= 0.95);
  const final = simTrace[simTrace.length - 1];
  const ev = evaluation;
  const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

  return (
    <div className="pb-8">
      <PageHeader
        eyebrow="How it works"
        title="Bayesian Knowledge Tracing"
        sub="The model behind every mastery estimate, its parameters, how well it predicts real students, and a simulator."
      />

      <Section n="01" title="How mastery is estimated">
        <p className="mb-5 max-w-3xl leading-6">
          For each topic the model keeps one number per student: P(L), the probability that the student has learned the topic.
          Learned or not learned is hidden; only answers are observed. It is a two-state hidden Markov model
          (Corbett &amp; Anderson, 1994). After every answer, P(L) is updated in two steps: a Bayes update using the answer,
          then a chance that the student learned something from the attempt. A topic counts as mastered once P(L) reaches 0.95.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Eq label="Step 1 · after a correct answer" note="A correct answer raises P(L), but less when guessing is likely.">
            <span>P(L | correct) =</span>
            <Frac top="P(L) · (1 − P(S))" bottom="P(L) · (1 − P(S)) + (1 − P(L)) · P(G)" />
          </Eq>
          <Eq label="Step 1 · after an incorrect answer" note="An incorrect answer lowers P(L), but less when slips are likely.">
            <span>P(L | incorrect) =</span>
            <Frac top="P(L) · P(S)" bottom="P(L) · P(S) + (1 − P(L)) · (1 − P(G))" />
          </Eq>
          <Eq label="Step 2 · learning from the attempt" note="Applied after every answer. A learned topic stays learned (no forgetting).">
            <span>P(L)<sub>next</sub> = P(L | answer) + (1 − P(L | answer)) · P(T)</span>
          </Eq>
          <Eq label="Prediction · next answer" note="Used to evaluate the model: how likely the next answer is correct.">
            <span>P(correct) = P(L) · (1 − P(S)) + (1 − P(L)) · P(G)</span>
          </Eq>
        </div>
        <div className="card mt-4 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {KEYS.map((k) => (
            <div key={k}>
              <div className="num font-semibold text-teal">{SYMBOL[k]}</div>
              <p className="mt-1 text-[13px] text-muted">{MEANING[k]}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section n="02" title="Parameters in use">
        <div className="card p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-wider text-muted">
                  <th className="px-3 py-2 font-medium">Topic</th>
                  {KEYS.map((k) => <th key={k} className="num px-3 py-2 text-right font-medium">{SYMBOL[k]}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {TOPICS.map((t) => (
                  <tr key={t.id}>
                    <td className="px-3 py-2.5 font-medium">{t.name}</td>
                    {KEYS.map((k) => <td key={k} className="num px-3 py-2.5 text-right">{f2(data.params[t.id][k])}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 border-t border-line pt-4 text-[13px]">
                <p className="mb-2"><span className="font-medium">Source:</span> starting values, the same for every topic. Once the course has enough real attempts, they are refitted per topic with the same EM code used in section 03.</p>
                <ul className="grid gap-1.5 text-muted md:grid-cols-2">
                  {KEYS.map((k) => <li key={k}><span className="num text-ink">{SYMBOL[k]} = {f2(DEFAULT_PARAMS[k])}</span> · {PARAM_REASONS[k]}</li>)}
                </ul>
              

          </div>
        </div>

      </Section>

      <Section n="03" title="Does it predict real students?">
        <p className="mb-5 max-w-3xl leading-6">
          The same model and fitting code were run on a public dataset of real students:
          <span className="font-medium"> ASSISTments 2009-2010 skill builder</span>, using the train/test split published with Deep Knowledge Tracing
          (Piech et al., 2015). Parameters were fitted per skill on {ev.train.students.toLocaleString('en-IN')} training students
          ({ev.train.attempts.toLocaleString('en-IN')} answers, {ev.train.skills} skills). The model then predicted each of the
          {' '}{ev.test.attempts.toLocaleString('en-IN')} answers of {ev.test.students} unseen test students before seeing it.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {([
            ['AUC', 'Higher is better', ev.bkt.auc, ev.baseline.auc, (x: number) => x.toFixed(3), 'How well predictions rank correct answers above incorrect ones. 0.5 is chance.'],
            ['RMSE', 'Lower is better', ev.bkt.rmse, ev.baseline.rmse, (x: number) => x.toFixed(3), 'Average gap between the predicted probability and the actual answer (0 or 1).'],
            ['Accuracy', 'Higher is better', ev.bkt.accuracy, ev.baseline.accuracy, pct, 'Share of answers predicted correctly when P(correct) ≥ 0.5 is read as "correct".'],
          ] as const).map(([name, dir, a, b, fmt, note]) => (
            <div key={name} className="card flex flex-col p-5">
              <div className="flex items-baseline justify-between">
                <h3 className="font-serif text-lg font-semibold">{name}</h3>
                <span className="text-[11px] text-muted">{dir}</span>
              </div>
              <div className="num mt-4 space-y-3 text-[12px]">
                {[['BKT', a, 'bg-teal'], ['Baseline', b, 'bg-line2']].map(([label, v, c]) => (
                  <div key={label as string}>
                    <div className="mb-1 flex justify-between"><span className={label === 'BKT' ? 'font-medium text-teal' : 'text-muted'}>{label}</span><span className="font-semibold">{fmt(v as number)}</span></div>
                    <div className="h-2 overflow-hidden rounded-sm bg-sunk"><div className={`h-full ${c}`} style={{ width: `${(v as number) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
              <p className="mt-4 border-t border-line pt-3 text-[12px] text-muted">{note}</p>
            </div>
          ))}
        </div>
        <div className="card mt-4 grid gap-5 p-5 md:grid-cols-2">
          <div className="text-[13px] leading-6">
            <div className="eyebrow mb-2">Setup</div>
            <p><span className="font-medium">Baseline:</span> {ev.baseline_name.toLowerCase()}. It knows how hard each skill is but nothing about the student's own history.</p>
            <p className="mt-1"><span className="font-medium">Fitting:</span> {ev.fit}.</p>
            <p className="mt-1"><span className="font-medium">Test set:</span> {pct(ev.test.correct_rate)} of test answers were correct.</p>
            <p className="mt-1 text-muted">Reproduce with <code className="code-inline">python model/fit_bkt.py</code>.</p>
          </div>
          <div>
            <div className="eyebrow mb-2">Fitted parameters across {ev.train.skills} skills (25th · median · 75th percentile)</div>
            <table className="num w-full text-[13px]">
              <tbody className="divide-y divide-line">
                {KEYS.map((k) => (
                  <tr key={k}>
                    <td className="py-1.5 text-teal">{SYMBOL[k]}</td>
                    {ev.param_quartiles[k].map((v, i) => <td key={i} className="py-1.5 text-right">{v.toFixed(2)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-[12px] text-muted">
              ASSISTments students had usually been taught a skill before practising it, which is why the typical P(L0) there is high.
            </p>
          </div>
        </div>
      </Section>

      <Section n="04" title="Try it">
        <div className="card p-5">
          <div className="flex flex-col justify-between gap-3 border-b border-line pb-4 lg:flex-row lg:items-center">
            <div>
              <h3 className="font-serif text-lg font-semibold">Simulate ten answers</h3>
              <p className="text-[13px] text-muted">Click an answer to flip it between correct and incorrect. Uses the parameters currently in use.</p>
            </div>
            <label className="flex items-center gap-2 text-[13px]">
              <span className="text-muted">Topic</span>
              <select value={simTopic} onChange={(e) => setSimTopic(e.target.value as TopicId)} className="input w-auto! py-1.5!">
                {TOPICS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 py-4">
            <div className="grid flex-1 grid-cols-5 gap-2 md:grid-cols-10">
              {seq.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSeq(seq.map((x, j) => (j === i ? !x : x)))}
                  className={`flex flex-col items-center rounded border py-2 text-[11px] ${v ? 'border-teal/60 text-teal hover:bg-teal-soft/40' : 'border-brick/60 text-brick hover:bg-brick-soft/40'}`}
                >
                  <span className="num text-faint">#{i + 1}</span>
                  <span className="font-medium">{v ? 'Correct' : 'Incorrect'}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-quiet px-3! py-1.5! text-[13px]" onClick={() => setSeq(PRESET)}>Reset</button>
              <button type="button" className="btn-quiet px-3! py-1.5! text-[13px]" onClick={() => setSeq(Array(10).fill(true))}>All correct</button>
              <button type="button" className="btn-quiet px-3! py-1.5! text-[13px]" onClick={() => setSeq(Array(10).fill(false))}>All incorrect</button>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
            <div className="rounded border border-line bg-sunk/40 p-3"><TraceChart values={simTrace} outcomes={seq} /></div>
            <div className="flex flex-col gap-3">
              <div className="rounded border border-line bg-sunk/60 p-4">
                <div className="eyebrow">After 10 answers</div>
                <div className={`num mt-1 text-[28px] font-semibold ${final >= 0.95 ? 'text-teal' : final >= 0.5 ? 'text-amber-text' : 'text-brick'}`}>{f2(final)}</div>
                <p className="text-[12px] text-muted">{crossAt > 0 ? `Crossed 0.95 at answer ${crossAt}.` : 'Did not reach 0.95.'}</p>
              </div>
              <div className="num rounded border border-line p-4 text-[12px]">
                {KEYS.map((k) => <div key={k} className="flex justify-between py-0.5"><span className="text-muted">{SYMBOL[k]}</span><span>{f2(simParams[k])}</span></div>)}
                <div className="mt-1 flex justify-between border-t border-line pt-1.5"><span className="text-muted">Correct</span><span>{seq.filter(Boolean).length} / 10</span></div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <p className="text-[12px] text-muted">
        References: A. T. Corbett and J. R. Anderson, "Knowledge tracing: Modeling the acquisition of procedural knowledge," User Modeling and User-Adapted Interaction, 4(4), 253-278, 1994.
        C. Piech et al., "Deep Knowledge Tracing," NeurIPS 2015. ASSISTments 2009-2010 skill builder dataset, Heffernan &amp; Heffernan, 2014.
      </p>
    </div>
  );
}
