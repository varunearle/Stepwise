import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Code, Icon, MasteryBar, PageHeader, Rich, STATUS_TEXT, StatusChip, f2, f3, signed } from '../components/ui';
import { MASTERY_THRESHOLD, correctToMastery, pCorrect, status, type UpdateDetail } from '../lib/bkt';
import { ME, nextQuestion, recommend, useStore, useTopicStates } from '../lib/store';
import { TOPICS, topicName, type TopicId } from '../data/topics';
import { toMasteryText } from './Dashboard';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function Practice() {
  const { topic: routeTopic } = useParams();
  const nav = useNavigate();
  const { data, answer } = useStore();
  const states = useTopicStates(ME);
  const rec = recommend(states);
  const valid = TOPICS.some((t) => t.id === routeTopic);
  const topic: TopicId = valid ? (routeTopic as TopicId) : rec?.topic ?? 'arrays';
  const st = states.find((s) => s.topic === topic)!;
  const params = data.params[topic];

  const [current, setCurrent] = useState(() => nextQuestion(data.attempts, ME, topic));
  const [chosen, setChosen] = useState<number | null>(null);
  const [result, setResult] = useState<{ correct: boolean; detail: UpdateDetail } | null>(null);
  const [count, setCount] = useState(1);

  // New topic from the URL: fresh question.
  useEffect(() => {
    setCurrent(nextQuestion(data.attempts, ME, topic));
    setChosen(null);
    setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  const q = current.q;
  const before = result ? result.detail.before : st.mastery;
  const beforeStatus = status(before, result ? st.attempts.length - 1 : st.attempts.length);

  const submit = useCallback(() => {
    if (chosen === null || result) return;
    const { detail } = answer(q, chosen);
    setResult({ correct: chosen === q.answer, detail });
  }, [chosen, result, answer, q]);

  const next = useCallback(() => {
    if (!result) return;
    setCount((c) => c + 1);
    if (result.detail.after >= MASTERY_THRESHOLD && rec && rec.topic !== topic) {
      nav(`/practice/${rec.topic}`);
      return;
    }
    setCurrent(nextQuestion(data.attempts, ME, topic, q.id));
    setChosen(null);
    setResult(null);
  }, [result, rec, topic, nav, data.attempts, q.id]);

  // Keyboard: 1-4 or A-D to choose, Enter to submit / continue.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      const k = e.key.toUpperCase();
      const idx = ['1', '2', '3', '4'].indexOf(k) >= 0 ? Number(k) - 1 : LETTERS.indexOf(k);
      if (!result && idx >= 0 && idx < q.options.length) setChosen(idx);
      if (e.key === 'Enter') result ? next() : submit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [result, q, next, submit]);

  const whyTopic = useMemo(() => {
    if (rec && rec.topic === topic) return rec.reason;
    return 'You chose this topic.';
  }, [rec, topic]);

  const after = result?.detail.after ?? 0;
  const afterStatus = status(after, st.attempts.length);
  const remaining = result ? correctToMastery(after, params) : correctToMastery(st.mastery, params);
  const justMastered = result && result.detail.before < MASTERY_THRESHOLD && after >= MASTERY_THRESHOLD;

  return (
    <>
      <PageHeader
        eyebrow="Practice"
        title={topicName(topic)}
        sub={<span className="num text-[13px]">Question {count} of this session · {q.id}</span>}
        right={
          <div className="flex flex-wrap gap-1.5">
            {states.map((s) => (
              <Link
                key={s.topic}
                to={`/practice/${s.topic}`}
                className={`rounded border px-2.5 py-1 text-[12px] ${s.topic === topic ? 'border-teal bg-teal text-white' : 'border-line bg-card text-muted hover:text-ink'}`}
              >
                {TOPICS.find((t) => t.id === s.topic)!.short} <span className="num">{f2(s.mastery)}</span>
              </Link>
            ))}
          </div>
        }
      />

      <div className="card grid overflow-hidden lg:grid-cols-[1fr_320px]">
        <section className="flex min-w-0 flex-col gap-4 p-5 md:p-6">
          <div>
            <h2 className="font-serif text-lg font-semibold leading-snug">{q.title}</h2>
            <p className="mt-2 text-[15px] leading-6"><Rich text={q.prompt} /></p>
          </div>
          {q.code && <Code src={q.code} />}

          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Options">
            {q.options.map((o, i) => {
              const isChosen = chosen === i;
              const isAnswer = q.answer === i;
              let cls = 'border-line bg-card hover:border-teal/60';
              if (!result && isChosen) cls = 'border-teal ring-1 ring-teal bg-teal-soft/40';
              if (result) {
                if (isAnswer) cls = 'border-teal ring-1 ring-teal bg-teal-soft/60';
                else if (isChosen) cls = 'border-brick ring-1 ring-brick bg-brick-soft/50';
                else cls = 'border-line bg-card opacity-60';
              }
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={isChosen}
                  disabled={!!result}
                  onClick={() => setChosen(i)}
                  className={`flex items-start gap-3 rounded border p-3 text-left transition-colors disabled:cursor-default ${cls}`}
                >
                  <span className={`num mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                    result && isAnswer ? 'border-teal bg-teal text-white' : result && isChosen ? 'border-brick bg-brick text-white' : isChosen ? 'border-teal bg-teal text-white' : 'border-line2 text-muted'
                  }`}>
                    {result && isAnswer ? <Icon name="check" className="h-3 w-3" /> : result && isChosen ? <Icon name="cross" className="h-3 w-3" /> : LETTERS[i]}
                  </span>
                  <span className="text-[14px] leading-5">{o}</span>
                </button>
              );
            })}
          </div>

          {result && (
            <div className={`rounded-r border-l-2 p-3 ${result.correct ? 'border-teal bg-teal-soft/40' : 'border-brick bg-brick-soft/40'}`}>
              <div className={`eyebrow mb-1 ${result.correct ? 'text-teal!' : 'text-brick!'}`}>
                {result.correct ? 'Correct' : `Incorrect · the answer is ${LETTERS[q.answer]}`}
              </div>
              <p className="leading-6">{q.explanation}</p>
            </div>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
            <span className="text-[12px] text-muted">
              {result ? 'Press Enter for the next question' : 'Choose with A to D or 1 to 4, then press Enter to submit'}
            </span>
            {result ? (
              <button type="button" className="btn-primary" onClick={next}>
                Next question <Icon name="arrow" className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" className="btn-primary" onClick={submit} disabled={chosen === null}>
                Submit answer <Icon name="check" className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-4 border-t border-line bg-[#F7F5F0] p-5 lg:border-l lg:border-t-0">
          {!result ? (
            <>
              <div className="border-b border-line pb-3">
                <div className="eyebrow">Model</div>
                <h3 className="font-serif text-lg font-semibold">Why this question</h3>
              </div>
              <div className="card p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-muted">Estimated mastery P(L)</span>
                  <StatusChip s={beforeStatus} />
                </div>
                <div className={`num mt-1 text-[32px] font-semibold leading-tight ${STATUS_TEXT[beforeStatus]}`}>{f2(before)}</div>
                <div className="mt-2"><MasteryBar value={before} s={beforeStatus} height="h-2.5" /></div>
                <div className="num mt-1.5 flex justify-between text-[11px] text-muted"><span>0.00</span><span className="text-teal">goal 0.95</span></div>
              </div>
              <div className="card p-3">
                <div className="eyebrow mb-1">Topic</div>
                <p className="leading-5">{whyTopic}</p>
                <div className="eyebrow mb-1 mt-3">Question</div>
                <p className="leading-5">{current.why}</p>
              </div>
              <div className="card p-3">
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted">Predicted P(correct)</span>
                  <span className="num font-medium">{f2(pCorrect(before, params))}</span>
                </div>
                <p className="mt-1 text-[12px] leading-4 text-muted">
                  P(L)·(1 − P(S)) + (1 − P(L))·P(G), the model's chance that your next answer is right.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="border-b border-line pb-3">
                <div className="eyebrow">Model</div>
                <h3 className="font-serif text-lg font-semibold">Mastery update</h3>
              </div>
              <div className="card p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-muted">Change</span>
                  <span className={`num text-[12px] font-medium ${after >= before ? 'text-teal' : 'text-brick'}`}>{signed(after - before)}</span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="num text-lg text-muted line-through decoration-1">{f2(before)}</span>
                  <span className="text-muted">→</span>
                  <span className={`num text-[30px] font-semibold leading-tight ${STATUS_TEXT[afterStatus]}`}>{f2(after)}</span>
                </div>
                <div className="mt-2"><MasteryBar value={after} s={afterStatus} height="h-2.5" /></div>
                <p className="mt-2 text-[12px] text-muted">
                  {justMastered ? 'Topic mastered: the estimate is now above 0.95.' : toMasteryText({ ...st, status: afterStatus }, remaining)}
                </p>
              </div>
              <details className="card p-3" open>
                <summary className="flex cursor-pointer list-none items-center justify-between">
                  <span className="eyebrow text-ink!">Calculation (BKT)</span>
                  <Icon name="chevron" className="h-4 w-4 text-muted" />
                </summary>
                <div className="num mt-3 space-y-1 text-[12.5px]">
                  {([['P(L) before', before], ['P(T) learn', params.learn], ['P(G) guess', params.guess], ['P(S) slip', params.slip]] as const).map(([k, v]) => (
                    <div key={k} className="flex justify-between"><span className="text-muted">{k}</span><span>{f3(v)}</span></div>
                  ))}
                </div>
                <div className="num mt-3 border-t border-line pt-2 text-[12px] leading-5">
                  <div className="text-muted">1 · Bayes update for a{result.correct ? ' correct' : 'n incorrect'} answer</div>
                  {result.correct ? (
                    <div>{f3(before)}×{f3(1 - params.slip)} / ({f3(before)}×{f3(1 - params.slip)} + {f3(1 - before)}×{f3(params.guess)})</div>
                  ) : (
                    <div>{f3(before)}×{f3(params.slip)} / ({f3(before)}×{f3(params.slip)} + {f3(1 - before)}×{f3(1 - params.guess)})</div>
                  )}
                  <div className="text-right font-semibold">= {f3(result.detail.posterior)}</div>
                  <div className="mt-1 text-muted">2 · Chance of learning from this attempt</div>
                  <div>{f3(result.detail.posterior)} + (1 − {f3(result.detail.posterior)})×{f3(params.learn)}</div>
                  <div className="text-right font-semibold text-teal">= {f3(after)}</div>
                </div>
              </details>
              {justMastered && rec && rec.topic !== topic && (
                <div className="card p-3 text-[13px]">
                  Next question comes from <strong className="font-medium">{topicName(rec.topic)}</strong>, your lowest topic now.
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </>
  );
}
