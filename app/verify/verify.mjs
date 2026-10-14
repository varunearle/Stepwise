// node --experimental-strip-types verify/verify.mjs
// 1. Structural checks on every question.
// 2. Compiles verify_questions.cpp and checks the marked answer of each code question
//    against the real program output.
import { execSync } from 'node:child_process';
import { QUESTIONS } from '../src/data/questions.ts';

let fail = 0;
const bad = (m) => { console.log('FAIL', m); fail++; };

const ids = new Set();
const perTopic = {};
const answerPos = [0, 0, 0, 0];
for (const q of QUESTIONS) {
  if (ids.has(q.id)) bad(`duplicate id ${q.id}`);
  ids.add(q.id);
  perTopic[q.topic] = (perTopic[q.topic] ?? 0) + 1;
  if (q.options.length !== 4) bad(`${q.id} has ${q.options.length} options`);
  if (!(q.answer >= 0 && q.answer < q.options.length)) bad(`${q.id} answer out of range`);
  if (new Set(q.options).size !== q.options.length) bad(`${q.id} has duplicate options`);
  if (!q.explanation || !q.prompt) bad(`${q.id} missing text`);
  answerPos[q.answer]++;
}

const out = execSync('g++ -std=c++17 -o /tmp/claude-0/vq verify/verify_questions.cpp && /tmp/claude-0/vq').toString();
const got = Object.fromEntries(out.trim().split('\n').map((l) => [l.slice(0, 5), l.slice(6)]));
const norm = (s) => s.replace(/[\[\],]/g, ' ').replace(/\s+/g, ' ').trim();
const direct = ['AR-02', 'AR-05', 'AR-06', 'AR-07', 'LL-03', 'LL-06', 'SQ-01', 'SQ-02', 'SQ-03',
  'SQ-08', 'TR-03', 'SO-03', 'SO-06', 'TC-04'];
for (const id of direct) {
  const q = QUESTIONS.find((x) => x.id === id);
  const marked = norm(q.options[q.answer]);
  if (marked !== norm(got[id])) bad(`${id}: marked "${marked}" but program printed "${got[id]}"`);
  else console.log('ok  ', id, '→', marked);
  // no other option may also equal the output
  q.options.forEach((o, i) => { if (i !== q.answer && norm(o) === norm(got[id])) bad(`${id}: option ${i} also matches`); });
}
console.log('questions per topic', perTopic);
console.log('answer positions A-D', answerPos);
console.log(fail ? `${fail} problem(s)` : `all ${QUESTIONS.length} questions passed`);
process.exit(fail ? 1 : 0);
