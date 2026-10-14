import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CardTitle, Icon, PageHeader } from '../components/ui';
import { ME, useStore } from '../lib/store';
import { QUESTIONS } from '../data/questions';
import { topicName } from '../data/topics';
import { downloadCsv } from '../lib/csv';
import { NAME_MAX } from '../lib/store';

export default function Settings() {
  const { data, session, setNames, resetMine, regenerateCohort, resetAll } = useStore();
  const [student, setStudent] = useState(data.studentName);
  const [teacher, setTeacher] = useState(data.teacherName);
  const [saved, setSaved] = useState(false);
  const mine = data.attempts.filter((a) => a.student === ME);

  const save = () => {
    setNames(student.trim() || 'Student', teacher.trim() || 'Course instructor');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportMine = () => {
    downloadCsv('stepwise-my-attempts.csv', ['time', 'topic', 'question_id', 'question', 'chosen_option', 'correct'],
      [...mine].sort((a, b) => a.at - b.at).map((a) => [
        new Date(a.at).toISOString(), topicName(a.topic), a.question,
        QUESTIONS.find((x) => x.id === a.question)?.title ?? '', 'ABCD'[a.chosen] ?? '', a.correct ? 1 : 0,
      ]));
  };

  const confirmThen = (msg: string, fn: () => void) => () => { if (window.confirm(msg)) fn(); };

  return (
    <>
      <PageHeader title="Settings" sub={`Signed in as the ${session?.role ?? 'student'} account`} />
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <CardTitle>Names shown in the app</CardTitle>
          <div className="space-y-4">
            <div>
              <label htmlFor="sn" className="mb-1 block text-[13px]">Student name</label>
              <input id="sn" className="input" value={student} maxLength={NAME_MAX} onChange={(e) => setStudent(e.target.value)} />
            </div>
            <div>
              <label htmlFor="tn" className="mb-1 block text-[13px]">Teacher name</label>
              <input id="tn" className="input" value={teacher} maxLength={NAME_MAX} onChange={(e) => setTeacher(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="btn-primary" onClick={save}>Save</button>
              {saved && <span className="flex items-center gap-1 text-[13px] text-teal"><Icon name="check" className="h-4 w-4" />Saved</span>}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <CardTitle>Data</CardTitle>
          <p className="mb-4 text-[13px] text-muted">
            Everything is stored in this browser (localStorage). Nothing is sent to a server.
            See the <Link to="/privacy" className="text-teal underline underline-offset-4">privacy policy</Link>.
            The student account has <span className="num text-ink">{mine.length}</span> logged attempts;
            the demo cohort has <span className="num text-ink">{data.attempts.length - mine.length}</span>.
          </p>
          <div className="divide-y divide-line">
            {[
              ['Export my attempts', 'Every answer as a CSV file.', <button key="e" type="button" className="btn-quiet py-1.5!" onClick={exportMine} disabled={!mine.length}><Icon name="download" className="h-4 w-4" />Export</button>],
              ['Reset my progress', 'Deletes the student account\'s attempts. Topics return to the starting estimate.', <button key="r" type="button" className="btn-quiet py-1.5!" onClick={confirmThen('Delete all of your attempts?', resetMine)} disabled={!mine.length}><Icon name="reset" className="h-4 w-4" />Reset</button>],
              ['New demo cohort', 'Regenerates the simulated learners shown in the Class view.', <button key="c" type="button" className="btn-quiet py-1.5!" onClick={regenerateCohort}><Icon name="reset" className="h-4 w-4" />Regenerate</button>],
              ['Reset everything', 'Restores names, parameters and all data to how the app first opened.', <button key="a" type="button" className="btn-quiet py-1.5! text-brick!" onClick={confirmThen('Reset all data, names and parameters?', resetAll)}>Reset all</button>],
            ].map(([title, note, btn]) => (
              <div key={title as string} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <div className="font-medium">{title}</div>
                  <div className="text-[12px] text-muted">{note}</div>
                </div>
                {btn}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
