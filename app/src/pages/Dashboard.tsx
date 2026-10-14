import { Link } from 'react-router-dom';
import { DayBars } from '../components/charts';
import { CardTitle, Icon, MasteryBar, PageHeader, STATUS_TEXT, StatusChip, f2, longDate, signed, when } from '../components/ui';
import { correctToMastery } from '../lib/bkt';
import { ME, recommend, useStore, useTopicStates, type TopicState } from '../lib/store';
import { QUESTIONS } from '../data/questions';
import { topicName } from '../data/topics';

export function toMasteryText(s: TopicState, n: number | null) {
  if (s.status === 'mastered') return 'At or above 0.95';
  if (n === null) return 'More than 50 correct answers to reach 0.95';
  return `About ${n} more correct answer${n === 1 ? '' : 's'} to reach 0.95`;
}

export default function Dashboard() {
  const { data } = useStore();
  const states = useTopicStates(ME);
  const rec = recommend(states);
  const recState = rec ? states.find((s) => s.topic === rec.topic)! : null;
  const counts = { mastered: 0, learning: 0, 'needs-work': 0, 'not-started': 0 };
  states.forEach((s) => counts[s.status]++);

  const recent = states
    .flatMap((s) => s.attempts.map((a, i) => ({ a, before: s.trace[i], after: s.trace[i + 1] })))
    .sort((x, y) => y.a.at - x.a.at)
    .slice(0, 6);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const mine = data.attempts.filter((a) => a.student === ME);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d0 = today.getTime() - (6 - i) * 86400000;
    return { label: String(new Date(d0).getDate()), count: mine.filter((a) => a.at >= d0 && a.at < d0 + 86400000).length };
  });
  const weekTotal = days.reduce((s, d) => s + d.count, 0);

  return (
    <>
      <PageHeader title="Dashboard" sub={longDate(Date.now())} />
      <div className="grid items-start gap-5 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-8">
          {rec && recState ? (
            <div className="card p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="eyebrow">Next up</span>
                <StatusChip s={recState.status} />
              </div>
              <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                <h2 className="font-serif text-[22px] font-semibold">{topicName(rec.topic)}</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-[12px] text-muted">Estimated mastery P(L)</span>
                  <span className={`num text-lg font-semibold ${STATUS_TEXT[recState.status]}`}>{f2(recState.mastery)}</span>
                </div>
              </div>
              <p className="mt-1 text-muted">{rec.reason}</p>
              <div className="mt-4 rounded border border-line bg-sunk/60 p-3">
                <div className="mb-2 flex justify-between gap-3 text-[12px]">
                  <span className="num text-muted">{topicName(rec.topic)} · {f2(recState.mastery)}</span>
                  <span>{toMasteryText(recState, correctToMastery(recState.mastery, data.params[rec.topic]))}</span>
                </div>
                <MasteryBar value={recState.mastery} s={recState.status} />
              </div>
              <div className="mt-4 flex justify-end">
                <Link to={`/practice/${rec.topic}`} className="btn-primary">
                  Start practice <Icon name="arrow" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="card p-5">
              <span className="eyebrow">Next up</span>
              <h2 className="mt-2 font-serif text-[22px] font-semibold">All six topics are at or above 0.95</h2>
              <p className="mt-1 text-muted">You can keep practising any topic from the Practice page.</p>
            </div>
          )}

          <div className="card p-5">
            <CardTitle right={
              <div className="flex flex-wrap gap-3 text-[12px] text-muted">
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-teal" />Mastered {counts.mastered}</span>
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-amber" />Learning {counts.learning}</span>
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-brick" />Needs work {counts['needs-work']}</span>
                {counts['not-started'] > 0 && <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-line2" />Not started {counts['not-started']}</span>}
              </div>
            }>Course topics</CardTitle>
            <div className="divide-y divide-line">
              {states.map((s) => (
                <Link key={s.topic} to={`/progress/${s.topic}`} className="-mx-2 flex flex-col gap-2 rounded px-2 py-3.5 hover:bg-sunk/60">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                      <span className="min-w-[150px] font-medium">{topicName(s.topic)}</span>
                      <span className="text-[12px] text-muted">
                        {s.attempts.length === 0 ? 'No attempts yet' : toMasteryText(s, correctToMastery(s.mastery, data.params[s.topic]))}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`num font-semibold ${STATUS_TEXT[s.status]}`}>{f2(s.mastery)}</span>
                      <span className="w-[92px] whitespace-nowrap text-center"><StatusChip s={s.status} /></span>
                      <span className="num w-[86px] text-right text-[12px] text-muted">{s.attempts.length} attempt{s.attempts.length === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                  <MasteryBar value={s.mastery} s={s.status} />
                </Link>
              ))}
            </div>
            <p className="mt-3 border-t border-line pt-3 text-right text-[12px] text-muted">
              The thin vertical mark on each bar is the 0.95 mastery threshold.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-4">
          <div className="card p-5">
            <CardTitle right={<span className="text-[12px] text-muted">Change in P(L)</span>}>Recent attempts</CardTitle>
            {recent.length === 0 ? (
              <p className="text-muted">Your answers will appear here.</p>
            ) : (
              <div className="divide-y divide-line">
                {recent.map(({ a, before, after }) => (
                  <div key={a.id} className="flex flex-col gap-1 py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium leading-tight">{QUESTIONS.find((q) => q.id === a.question)?.title}</span>
                      <span className={`num flex shrink-0 items-center gap-0.5 text-[12px] font-medium ${a.correct ? 'text-teal' : 'text-brick'}`}>
                        <Icon name={a.correct ? 'check' : 'cross'} className="h-3.5 w-3.5" />{signed(after - before)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[12px] text-muted">
                      <span>{topicName(a.topic)}</span>
                      <span className="num">{when(a.at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card p-5">
            <CardTitle right={<span className="text-[12px] text-muted">Last 7 days</span>}>Attempts per day</CardTitle>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-[13px] text-muted">Total this week</span>
              <span className="num text-lg font-semibold text-teal">{weekTotal}</span>
            </div>
            <DayBars days={days} />
          </div>
        </div>
      </div>
    </>
  );
}
