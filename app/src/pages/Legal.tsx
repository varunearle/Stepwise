import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';

const UPDATED = '15 October 2026';

function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-[#F5F2EC]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-serif text-xl font-semibold tracking-tight">Stepwise</Link>
          <nav className="flex gap-4 text-[13px]">
            <NavLink to="/privacy" className={({ isActive }) => (isActive ? 'text-teal' : 'text-muted hover:text-ink')}>Privacy policy</NavLink>
            <NavLink to="/terms" className={({ isActive }) => (isActive ? 'text-teal' : 'text-muted hover:text-ink')}>Terms and conditions</NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="font-serif text-[30px] font-semibold leading-9 tracking-tight">{title}</h1>
        <p className="mt-1 text-muted">Last updated {UPDATED}</p>
        <div className="mt-8 space-y-8 text-[15px] leading-7">{children}</div>
        <div className="mt-12 border-t border-line pt-5 text-[13px]">
          <Link to="/" className="text-teal underline underline-offset-4 hover:text-teal-dark">Back to Stepwise</Link>
        </div>
      </main>
    </div>
  );
}

function Part({ h, children }: { h: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-serif text-lg font-semibold">{h}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

const List = ({ items }: { items: ReactNode[] }) => (
  <ul className="list-disc space-y-1.5 pl-5 marker:text-faint">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
);

export function Privacy() {
  return (
    <LegalLayout title="Privacy policy">
      <p>
        Stepwise is a student project built for the course 24CSEN2151 Artificial Intelligence at GITAM University.
        This page explains what it stores and where.
      </p>

      <Part h="What Stepwise stores">
        <List items={[
          'Your answers: the question, the option you chose, whether it was correct, and the time.',
          'The names entered on the Settings page.',
          'The model parameters in use.',
          'Which demo account you signed in with. This is kept only until the browser tab is closed.',
        ]} />
      </Part>

      <Part h="Where it is stored">
        <p>
          Everything listed above is saved in your own browser on this device, using the browser's local storage.
          Stepwise has no server or database, so none of it is sent to the author or anyone else.
        </p>
        <p>
          Stepwise sets no cookies, runs no analytics or tracking, and loads no third-party scripts. Its fonts are packaged
          with the app rather than fetched from another site.
        </p>
      </Part>

      <Part h="Hosting">
        <p>
          When Stepwise is opened from a web address, the company hosting the files may keep standard server logs, such as
          the IP address of the request and the page requested. Those logs are handled under the hosting provider's own
          privacy policy. Running Stepwise on your own computer avoids this.
        </p>
      </Part>

      <Part h="Demo accounts">
        <p>
          The sign-in accounts are shared demonstration accounts, not personal ones. Please do not enter personal or
          sensitive information in the name fields.
        </p>
      </Part>

      <Part h="Your control over the data">
        <List items={[
          <>Settings, <span className="font-medium">Export my attempts</span>: download every answer as a CSV file.</>,
          <>Settings, <span className="font-medium">Reset my progress</span>: delete your answers.</>,
          <>Settings, <span className="font-medium">Reset everything</span>: return the app to how it first opened.</>,
          'Clearing this site\'s data in your browser settings removes everything Stepwise has stored.',
        ]} />
      </Part>

      <Part h="Changes and contact">
        <p>
          If this policy changes, the date at the top of the page will change with it. Questions can be sent to the author,
          Earle Varun Sai, GITAM University, Visakhapatnam.
        </p>
      </Part>
    </LegalLayout>
  );
}

export function Terms() {
  return (
    <LegalLayout title="Terms and conditions">
      <p>
        By using Stepwise you agree to these terms. They are written in plain language because Stepwise is an academic
        project, not a commercial service.
      </p>

      <Part h="What Stepwise is">
        <p>
          Stepwise is a demonstration built for the course 24CSEN2151 Artificial Intelligence at GITAM University. It offers
          practice questions on Data Structures and estimates how well each topic has been learned using Bayesian Knowledge
          Tracing. It is free to use and is not sold or licensed to anyone.
        </p>
      </Part>

      <Part h="Practice questions">
        <p>
          The questions and their explanations were checked by the author, and every question containing code was compiled
          and run to confirm its answer. They are intended for practice. If you find an error, please report it to the author.
        </p>
      </Part>

      <Part h="Mastery estimates">
        <p>
          Mastery values are statistical estimates produced by a model. They are not marks or grades, and they should not be
          used on their own to make decisions about a student. A teacher's judgement always comes first.
        </p>
        <p>
          In the teacher view, every learner except the signed-in student is simulated by the model for demonstration
          purposes and is labelled as simulated.
        </p>
      </Part>

      <Part h="Evaluation results">
        <p>
          The results on the Model page come from the author's own run of the fitting code on the public ASSISTments
          2009-2010 skill builder dataset, using the train and test split published with Deep Knowledge Tracing
          (Piech et al., 2015). The dataset belongs to its publishers and is used here only for evaluation.
        </p>
      </Part>

      <Part h="Your data">
        <p>
          Your answers are stored only in your browser, as described in the <Link to="/privacy" className="text-teal underline underline-offset-4">privacy policy</Link>.
          They can be lost if browser data is cleared, so export them from Settings if you want to keep a copy.
        </p>
      </Part>

      <Part h="Acceptable use">
        <p>Please do not try to disrupt the site or the service hosting it, or present Stepwise as your own work.</p>
      </Part>

      <Part h="No warranty">
        <p>
          Stepwise is provided as it is, without any guarantee that it will be available, error-free or suitable for a
          particular purpose. To the extent the law allows, the author is not responsible for any loss arising from its use.
        </p>
      </Part>

      <Part h="Changes">
        <p>These terms may be updated. The date at the top of the page shows when they last changed.</p>
      </Part>
    </LegalLayout>
  );
}
