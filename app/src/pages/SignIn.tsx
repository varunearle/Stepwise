import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TraceChart } from '../components/charts';
import { useStore } from '../lib/store';
import { trace } from '../lib/bkt';
import { DEFAULT_PARAMS } from '../data/topics';

const ACCOUNTS = {
  student: { email: 'varun.sai@stepwise.demo', password: 'stepwise' },
  teacher: { email: 'teacher@stepwise.demo', password: 'stepwise' },
};
const EXAMPLE = [false, true, false, true, true, true, true, true];

export default function SignIn() {
  const { signIn } = useStore();
  const nav = useNavigate();
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const values = trace(EXAMPLE, DEFAULT_PARAMS);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const acc = ACCOUNTS[role];
    if (email.trim().toLowerCase() !== acc.email || password !== acc.password) {
      setError(`That email and password don't match the ${role} account.`);
      return;
    }
    signIn({ role });
    nav(role === 'teacher' ? '/class' : '/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
      <div className="card grid w-full max-w-[1040px] overflow-hidden md:grid-cols-[45fr_55fr]">
        <section className="flex flex-col justify-between border-b border-line bg-[#F5F2EC] p-8 md:border-b-0 md:border-r md:p-12">
          <div>
            <div className="font-serif text-[30px] font-semibold leading-9 tracking-tight">Stepwise</div>
            <p className="mt-3 font-serif text-lg italic text-muted">Practice that adapts to what you actually know.</p>
            <div className="mt-8 border-t border-line pt-5">
              <div className="mb-1 font-medium">How the estimate moves</div>
              <p className="text-[13px] text-muted">
                One learner's estimated mastery over eight answers (incorrect, correct, incorrect, then five correct), computed with the model's starting parameters.
              </p>
            </div>
            <div className="mt-4 rounded border border-line bg-card p-3">
              <TraceChart values={values} outcomes={EXAMPLE} width={420} height={250} />
            </div>
          </div>
          <p className="mt-6 text-[12px] text-muted">
            Mastery is estimated with Bayesian Knowledge Tracing. Teal points are correct answers, red points incorrect.
          </p>
        </section>

        <section className="flex flex-col justify-center p-8 md:p-12">
          <div className="mx-auto w-full max-w-sm">
            <h1 className="font-serif text-[22px] font-semibold">Sign in</h1>
            <p className="mt-1 text-muted">Data Structures · adaptive practice</p>

            <div className="mt-6 mb-5 flex rounded border border-line bg-sunk p-0.5" role="tablist">
              {(['student', 'teacher'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={role === r}
                  onClick={() => { setRole(r); setError(''); setEmail(''); setPassword(''); }}
                  className={`flex-1 rounded-sm py-1.5 font-medium capitalize ${role === r ? 'bg-teal text-white' : 'text-muted hover:text-ink'}`}
                >
                  {r}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-[13px]">Email</label>
                <input id="email" type="email" className="input" placeholder={ACCOUNTS[role].email} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
              </div>
              <div>
                <label htmlFor="password" className="mb-1 block text-[13px]">Password</label>
                <input id="password" type="password" className="input font-mono" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
              </div>
              {error && <p className="text-[13px] text-brick" role="alert">{error}</p>}
              <button type="submit" className="btn-primary w-full">Sign in</button>
            </form>

            <div className="mt-6 border-t border-line pt-5 text-center">
              <button
                type="button"
                className="text-teal underline underline-offset-4 hover:text-teal-dark"
                onClick={() => { setEmail(ACCOUNTS[role].email); setPassword(ACCOUNTS[role].password); setError(''); }}
              >
                Use the demo {role} account
              </button>
              <p className="mt-3 text-[12px] text-muted">Progress is saved in this browser only.</p>
              <p className="mt-4 flex justify-center gap-4 text-[12px]">
                <Link to="/privacy" className="text-muted underline underline-offset-4 hover:text-ink">Privacy policy</Link>
                <Link to="/terms" className="text-muted underline underline-offset-4 hover:text-ink">Terms and conditions</Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
