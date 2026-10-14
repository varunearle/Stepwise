import { useMemo, useState } from 'react';
import { CardTitle, Icon, MasteryBar, PageHeader, STATUS_TEXT, StatusChip, f2, when } from '../components/ui';
import { status, type Status } from '../lib/bkt';
import { ME, topicState, useStore, type TopicState } from '../lib/store';
import { TOPICS, topicName } from '../data/topics';
import { downloadCsv } from '../lib/csv';

const CELL: Record<Status, string> = {
  mastered: 'bg-teal-soft text-teal border-teal/25',
  learning: 'bg-amber-soft text-amber-text border-amber/25',
  'needs-work': 'bg-brick-soft text-brick border-brick/25',
  'not-started': 'bg-sunk text-faint border-line',
};
const LOW = 0.4;

export default function ClassView() {
  const { data, students } = useStore();
  const [selected, setSelected] = useState<string | null>(null);

  const rows = useMemo(
    () => students.map((s) => ({
      student: s,
      states: TOPICS.map((t) => topicState(data.attempts, s.id, t.id, data.params[t.id])),
    })),
    [students, data.attempts, data.params],
  );

  const weekAgo = Date.now() - 7 * 86400000;
  const weekAttempts = data.attempts.filter((a) => a.at >= weekAgo).length;
  const attention = rows
    .map((r) => ({ ...r, low: r.states.filter((s) => s.attempts.length > 0 && s.mastery < LOW) }))
    .filter((r) => r.low.length >= 2)
    .sort((a, b) => b.low.length - a.low.length);
  const avg = TOPICS.map((t, i) => {
    const started = rows.map((r) => r.states[i]).filter((s) => s.attempts.length > 0);
    const m = started.length ? started.reduce((s, x) => s + x.mastery, 0) / started.length : null;
    return { topic: t.id, mean: m, n: started.length };
  }).sort((a, b) => (b.mean ?? -1) - (a.mean ?? -1));

  const exportCsv = () => {
    const out: (string | number | boolean)[][] = [];
    rows.forEach((r) => r.states.forEach((st) => out.push(
      [r.student.name, r.student.simulated, topicName(st.topic), st.attempts.length, st.correct, Number(st.mastery.toFixed(4)), st.status],
    )));
    downloadCsv(`stepwise-class-mastery-${new Date().toISOString().slice(0, 10)}.csv`,
      ['student', 'simulated', 'topic', 'attempts', 'correct', 'mastery_pl', 'status'], out);
  };

  const sel = rows.find((r) => r.student.id === selected);

  return (
    <>
      <PageHeader
        eyebrow="Teacher view"
        title="Class overview"
        sub={`Data Structures · ${data.teacherName}`}
        right={
          <div className="flex flex-wrap items-center gap-2">
            <span className="num rounded border border-line bg-card px-3 py-1.5 text-[12px]">Learners: {students.length}</span>
            <span className="num rounded border border-line bg-card px-3 py-1.5 text-[12px]">Attempts, last 7 days: {weekAttempts}</span>
            <button type="button" onClick={exportCsv} className="btn-quiet px-3! py-1.5! text-[13px]">
              <Icon name="download" className="h-4 w-4" />Export CSV
            </button>
          </div>
        }
      />

      <div className="mb-5 rounded border border-line bg-sunk/60 px-4 py-2.5 text-[13px] text-muted">
        <span className="font-medium text-ink">{data.studentName}</span>'s row is live and updates as they practise.
        The other {students.length - 1} learners are simulated from the model for this demonstration.
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-10">
        <div className="card min-w-0 p-5 lg:col-span-7">
          <CardTitle right={<span className="text-[12px] text-muted">Click a row for details</span>}>Mastery by student and topic</CardTitle>
          <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
            <span className={`chip ${CELL.mastered}`}>≥ 0.95 Mastered</span>
            <span className={`chip ${CELL.learning}`}>0.50 to 0.95 Learning</span>
            <span className={`chip ${CELL['needs-work']}`}>&lt; 0.50 Needs work</span>
            <span className={`chip ${CELL['not-started']}`}>Not started</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-wider text-muted">
                  <th className="px-2 py-2 font-medium">Student</th>
                  {TOPICS.map((t) => <th key={t.id} className="px-1 py-2 text-center font-medium">{t.short}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.student.id}
                    onClick={() => setSelected(r.student.id === selected ? null : r.student.id)}
                    className={`cursor-pointer border-b border-line/70 ${selected === r.student.id ? 'bg-sunk' : 'hover:bg-sunk/50'}`}
                  >
                    <td className="whitespace-nowrap px-2 py-1.5 text-[13px] font-medium">
                      {r.student.name}
                      {r.student.id === ME && <span className="chip ml-2 border-teal/50 text-teal">live</span>}
                    </td>
                    {r.states.map((s) => (
                      <td key={s.topic} className="p-1 text-center">
                        <div className={`num rounded-sm border py-1 text-[12px] font-medium ${CELL[s.status]}`}>
                          {s.attempts.length ? f2(s.mastery) : '-'}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-3">
          {sel && <StudentCard name={sel.student.name} states={sel.states} onClose={() => setSelected(null)} />}
          <div className="card p-5">
            <CardTitle right={<span className="chip border-brick/40 bg-brick-soft text-brick">{attention.length}</span>}>Needs attention</CardTitle>
            <p className="-mt-1 mb-3 text-[12px] text-muted">Two or more practised topics below {LOW.toFixed(2)}</p>
            {attention.length === 0 ? <p className="text-muted">Nobody right now.</p> : (
              <div className="divide-y divide-line">
                {attention.map((r) => (
                  <button key={r.student.id} type="button" onClick={() => setSelected(r.student.id)} className="block w-full py-2.5 text-left first:pt-0 last:pb-0">
                    <div className="mb-1 font-medium hover:text-teal">{r.student.name}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {r.low.sort((a, b) => a.mastery - b.mastery).map((s) => (
                        <span key={s.topic} className="chip border-line bg-sunk text-brick">{TOPICS.find((t) => t.id === s.topic)!.short}: {f2(s.mastery)}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="card p-5">
            <CardTitle right={<span className="text-[12px] text-muted">Mean P(L)</span>}>By topic</CardTitle>
            <div className="flex flex-col gap-3">
              {avg.map((a) => {
                const s = a.mean === null ? 'not-started' : status(a.mean, 1);
                return (
                  <div key={a.topic}>
                    <div className="mb-1 flex justify-between text-[12px]">
                      <span className="font-medium">{topicName(a.topic)}</span>
                      <span className={`num ${STATUS_TEXT[s]}`}>{a.mean === null ? 'n/a' : f2(a.mean)} <span className="text-faint">n={a.n}</span></span>
                    </div>
                    <MasteryBar value={a.mean ?? 0} s={s} height="h-1.5" />
                  </div>
                );
              })}
            </div>
            <p className="mt-3 border-t border-line pt-3 text-[12px] text-muted">Averaged over learners who have practised the topic.</p>
          </div>
        </div>
      </div>
    </>
  );
}

function StudentCard({ name, states, onClose }: { name: string; states: TopicState[]; onClose: () => void }) {
  const last = states.flatMap((s) => s.attempts).sort((a, b) => b.at - a.at)[0];
  const total = states.reduce((s, x) => s + x.attempts.length, 0);
  const correct = states.reduce((s, x) => s + x.correct, 0);
  return (
    <div className="card p-5">
      <CardTitle right={<button type="button" onClick={onClose} className="text-muted hover:text-ink" aria-label="Close"><Icon name="cross" className="h-4 w-4" /></button>}>{name}</CardTitle>
      <div className="num mb-3 grid grid-cols-2 gap-2 text-[12px]">
        <div className="rounded bg-sunk p-2"><div className="text-muted">Attempts</div><div className="text-base font-semibold">{total}</div></div>
        <div className="rounded bg-sunk p-2"><div className="text-muted">Accuracy</div><div className="text-base font-semibold">{total ? `${Math.round((correct / total) * 100)}%` : 'n/a'}</div></div>
      </div>
      <div className="divide-y divide-line">
        {states.map((s) => (
          <div key={s.topic} className="flex items-center justify-between gap-2 py-1.5 text-[13px]">
            <span>{topicName(s.topic)}</span>
            <span className="flex items-center gap-2">
              <span className="num text-[11px] text-muted">{s.correct}/{s.attempts.length}</span>
              <StatusChip s={s.status} />
            </span>
          </div>
        ))}
      </div>
      <p className="num mt-3 text-[12px] text-muted">Last attempt: {last ? when(last.at) : 'none yet'}</p>
    </div>
  );
}
