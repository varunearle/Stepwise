import { Link, useParams } from 'react-router-dom';
import { TraceChart } from '../components/charts';
import { CardTitle, MasteryBar, PageHeader, STATUS_TEXT, StatusChip, f2, signed, when } from '../components/ui';
import { correctToMastery } from '../lib/bkt';
import { ME, recommend, useStore, useTopicStates } from '../lib/store';
import { QUESTIONS } from '../data/questions';
import { TOPICS, topicName, type TopicId } from '../data/topics';

export default function Progress() {
  const { topic: routeTopic } = useParams();
  const { data } = useStore();
  const states = useTopicStates(ME);
  const rec = recommend(states);
  const topic: TopicId = TOPICS.some((t) => t.id === routeTopic)
    ? (routeTopic as TopicId)
    : (states.filter((s) => s.attempts.length).sort((a, b) => b.attempts[b.attempts.length - 1].at - a.attempts[a.attempts.length - 1].at)[0]?.topic ?? rec?.topic ?? 'arrays');
  const st = states.find((s) => s.topic === topic)!;
  const p = data.params[topic];
  const n = st.attempts.length;
  let streak = 0;
  for (let i = n - 1; i >= 0 && st.attempts[i].correct; i--) streak++;
  const toGo = correctToMastery(st.mastery, p);
  const crossed = st.trace.findIndex((v, i) => i > 0 && v >= 0.95);
  const mastered = states.filter((s) => s.status === 'mastered').length;
  const mean = states.reduce((s, x) => s + x.mastery, 0) / states.length;

  return (
    <>
      <PageHeader title="Progress" sub="Estimated mastery after every answer, per topic" />
      <div className="-mt-2 mb-6 flex gap-5 overflow-x-auto border-b border-line">
        {states.map((s) => (
          <Link
            key={s.topic}
            to={`/progress/${s.topic}`}
            className={`-mb-px flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 pb-2.5 ${s.topic === topic ? 'border-teal font-medium text-teal' : 'border-transparent text-muted hover:text-ink'}`}
          >
            {topicName(s.topic)}
            <span className={`num text-[12px] ${STATUS_TEXT[s.status]}`}>{f2(s.mastery)}</span>
          </Link>
        ))}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-10">
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-7">
          <div className="card p-5">
            <CardTitle right={<StatusChip s={st.status} />}>Mastery trajectory · {topicName(topic)}</CardTitle>
            {n === 0 ? (
              <div className="py-10 text-center">
                <p className="text-muted">No attempts in this topic yet. The estimate starts at P(L0) = {f2(p.prior)}.</p>
                <Link to={`/practice/${topic}`} className="btn-primary mt-4">Practise {topicName(topic)}</Link>
              </div>
            ) : (
              <>
                <TraceChart values={st.trace} outcomes={st.attempts.map((a) => a.correct)} />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-[12px]">
                  <div className="flex flex-wrap gap-4">
                    <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-teal" />Correct</span>
                    <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-brick" />Incorrect</span>
                    <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full border border-[#8C877E] bg-white" />Starting estimate P(L0)</span>
                  </div>
                  <span className="num text-muted">x-axis: attempt number · y-axis: P(L) after that attempt</span>
                </div>
              </>
            )}
          </div>

          <div className="card p-5">
            <CardTitle right={<span className="text-[12px] text-muted">Newest first</span>}>Attempt log ({n})</CardTitle>
            {n === 0 ? <p className="text-muted">Nothing logged yet.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-line bg-sunk/70 text-[11px] uppercase tracking-wider text-muted">
                      <th className="px-3 py-2 font-medium">#</th>
                      <th className="px-3 py-2 font-medium">When</th>
                      <th className="px-3 py-2 font-medium">Question</th>
                      <th className="px-3 py-2 font-medium">Answer</th>
                      <th className="px-3 py-2 text-right font-medium">Before</th>
                      <th className="px-3 py-2 text-right font-medium">After</th>
                      <th className="px-3 py-2 text-right font-medium">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {st.attempts.map((a, i) => ({ a, i })).reverse().map(({ a, i }) => {
                      const d = st.trace[i + 1] - st.trace[i];
                      return (
                        <tr key={a.id} className="hover:bg-sunk/50">
                          <td className="num px-3 py-2">{i + 1}</td>
                          <td className="num whitespace-nowrap px-3 py-2 text-muted">{when(a.at)}</td>
                          <td className="px-3 py-2">{QUESTIONS.find((q) => q.id === a.question)?.title} <span className="num text-[11px] text-faint">{a.question}</span></td>
                          <td className="px-3 py-2">
                            <span className={`chip ${a.correct ? 'border-teal/50 text-teal' : 'border-brick/50 text-brick'}`}>{a.correct ? 'Correct' : 'Incorrect'}</span>
                          </td>
                          <td className="num px-3 py-2 text-right text-muted">{f2(st.trace[i])}</td>
                          <td className="num px-3 py-2 text-right font-medium">{f2(st.trace[i + 1])}</td>
                          <td className={`num px-3 py-2 text-right ${d >= 0 ? 'text-teal' : 'text-brick'}`}>{signed(d)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-3">
          <div className="card p-5">
            <CardTitle>Summary</CardTitle>
            <dl className="divide-y divide-line">
              {[
                ['Attempts', String(n)],
                ['Accuracy', n ? `${((st.correct / n) * 100).toFixed(1)}% (${st.correct}/${n})` : 'No attempts'],
                ['Current P(L)', f2(st.mastery)],
                ['To reach 0.95', st.status === 'mastered' ? 'Reached' : toGo === null ? '> 50 correct' : `${toGo} correct in a row`],
                ['Reached 0.95 at', crossed > 0 ? `attempt ${crossed}` : 'Not yet'],
                ['Current streak', `${streak} correct`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="text-muted">{k}</dt>
                  <dd className="num text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card p-5">
            <CardTitle right={<span className="num text-[12px] text-teal">{mastered} of 6 mastered</span>}>All topics</CardTitle>
            <div className="flex flex-col gap-3">
              {states.map((s) => (
                <div key={s.topic}>
                  <div className="mb-1 flex justify-between text-[12px]">
                    <span className="font-medium">{topicName(s.topic)}</span>
                    <span className={`num ${STATUS_TEXT[s.status]}`}>{f2(s.mastery)}</span>
                  </div>
                  <MasteryBar value={s.mastery} s={s.status} height="h-1.5" />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-line pt-3 text-[12px]">
              <span className="text-muted">Mean P(L) across topics</span>
              <span className="num font-semibold">{f2(mean)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
