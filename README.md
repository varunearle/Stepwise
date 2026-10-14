# Stepwise: adaptive practice with Bayesian Knowledge Tracing

E-Learning class demonstration (Domain 58), course 24CSEN2151 Artificial Intelligence, GITAM University.
Earle Varun Sai · 2024204360

Stepwise is an adaptive practice platform for a Data Structures course. After every answer it updates the
probability that the student has learned the topic, using Bayesian Knowledge Tracing (BKT). It then picks
what to practise next and shows teachers which students need help.

## What is in this folder

```
app/                      the web application (React + TypeScript + Vite + Tailwind)
  src/lib/bkt.ts          BKT update equations, mastery estimate, EM fitting
  src/lib/store.tsx       attempts, adaptive topic and question selection, demo cohort
  src/data/questions.ts   48 Data Structures questions, 8 per topic
  src/data/evaluation.json  results produced by model/fit_bkt.py
  src/pages/              Sign in, Dashboard, Practice, Progress, Class, Model, Settings
  src/lib/bkt.test.ts     unit tests
  verify/                 question checker (compiles every code question) and browser test
model/
  bkt.py                  BKT and EM (Baum-Welch) in NumPy
  test_bkt.py             checks EM recovers known parameters from simulated learners
  fit_bkt.py              fits and evaluates BKT on ASSISTments 2009-2010
  results.json            the evaluation results
```

## Run it

Requires Node.js 18 or newer.

```bash
cd app
npm install
npm run dev          # http://localhost:5173
```

For the class demo, use the production build, which works without internet:

```bash
npm run build
npm run preview      # http://localhost:4173
```

Demo accounts (also filled in by the "Use the demo account" link on the sign-in page):

| Role    | Email                    | Password |
|---------|--------------------------|----------|
| Student | varun.sai@stepwise.demo  | stepwise |
| Teacher | teacher@stepwise.demo    | stepwise |

All data is stored in the browser (localStorage). Settings → "Reset my progress" clears the student's answers.

## Deploy

Import the `app` folder as a Vercel project (framework: Vite). `vercel.json` already sends every route to `index.html`.

## Checks

```bash
cd app
npm test                  # 12 unit tests: equations vs hand calculation and vs the Python engine, selection, input safety
npm run check-questions   # structure of all 48 questions; compiles and runs the C++ in every code question
                          # and confirms the marked answer equals the real output (needs g++)
```

Model side:

```bash
pip install numpy scikit-learn
cd model
python test_bkt.py
git clone --depth 1 https://github.com/chrispiech/DeepKnowledgeTracing.git
python fit_bkt.py DeepKnowledgeTracing/data/assistments     # about 7 minutes
```

## Security

Stepwise is a static site: no server, API, database, API keys or environment variables, and no user data leaves the browser.

- **Headers** (`app/vercel.json`, also used by `npm run preview`): a strict Content Security Policy (only the site's own
  scripts, styles, fonts and images), no framing, `nosniff`, no referrer, HSTS, cross-origin isolation, and
  camera, microphone, location, payment and USB turned off.
- **Input**: React escapes all text, and the app never injects raw HTML. Names are trimmed and capped at 60 characters.
  CSV exports escape quotes and neutralise spreadsheet formulas (cells starting with `=`, `+`, `-` or `@`).
- **Stored data** is validated on load; malformed attempts, parameters, names and session roles are discarded.
- **Build**: production React, no source maps, no inline scripts, no requests to other sites. `npm audit`: 0 vulnerabilities.
- **Sign-in** uses two public demo accounts. It selects a view rather than protecting anything: every answer lives in
  the visitor's own browser, and a visitor can only ever see their own browser's data.

```bash
cd app
npm audit
npm run preview &                         # serves the build with the production headers
node verify/security.mjs http://localhost:4173   # script injection, CSV formulas, tampered storage (needs Playwright)
```

## Results on real students (ASSISTments 2009-2010, held-out test students)

| Model | AUC | RMSE | Accuracy |
|-------|-----|------|----------|
| BKT | 0.741 | 0.420 | 74.5% |
| Baseline: per-skill average correctness | 0.617 | 0.454 | 69.4% |

Training: 3,361 students, 407,967 answers, 123 skills. Test: 856 students, 117,566 answers.

## Notes

- Topic parameters start at P(L0) = 0.20, P(T) = 0.15, P(G) = 0.25, P(S) = 0.10. The reasons are on the Model page.
- In the Class view, the student's row is live. The other 11 learners are simulated by the model and are labelled as simulated.

## References

- A. T. Corbett and J. R. Anderson, "Knowledge tracing: Modeling the acquisition of procedural knowledge," *User Modeling and User-Adapted Interaction*, 4(4), 253-278, 1994.
- C. Piech et al., "Deep Knowledge Tracing," *Advances in Neural Information Processing Systems 28* (NeurIPS 2015).
- N. T. Heffernan and C. L. Heffernan, "The ASSISTments Ecosystem," *International Journal of Artificial Intelligence in Education*, 24(4), 2014.
