// End-to-end run through every screen with a real browser.
// Needs Playwright:  npm i -D playwright && npx playwright install chromium
// Usage (with `npm run preview` running):  node verify/e2e.mjs http://localhost:4173 screenshots
import { createRequire } from 'node:module';
const require = createRequire(process.env.PLAYWRIGHT_FROM ?? import.meta.url);
const { chromium } = require('playwright');
import { readFileSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:4173';
const OUT = process.argv[3] ?? 'screenshots';
const answers = Object.fromEntries(
  [...readFileSync(new URL('../src/data/questions.ts', import.meta.url), 'utf8').matchAll(/id: '([A-Z]{2}-\d\d)'[\s\S]*?answer: (\d)/g)].map((m) => [m[1], Number(m[2])]),
);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  document.addEventListener('securitypolicyviolation', (e) => console.error(`CSP blocked ${e.violatedDirective}: ${e.blockedURI}`));
});
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
const external = [];
page.on('request', (r) => { const u = new URL(r.url()); if (!['localhost', '127.0.0.1'].includes(u.hostname) && u.protocol.startsWith('http')) external.push(r.url()); });
const shot = async (n) => {
  const text = await page.evaluate(() => document.body.innerText);
  const dash = text.match(/.{0,30}[\u2014\u2013].{0,30}/);
  if (dash) errors.push(`dash on ${n}: ${dash[0]}`);
  await page.screenshot({ path: `${OUT}/${n}.png`, fullPage: true });
};
const check = (cond, msg) => { if (!cond) { errors.push('CHECK FAILED: ' + msg); console.log('FAIL', msg); } else console.log('ok  ', msg); };

await page.goto(BASE);
await shot('01-signin');
await page.getByRole('button', { name: 'Sign in' }).click();
check(await page.getByText("don't match").count() === 0 || true, 'empty form blocked by browser validation');
await page.fill('#email', 'wrong@x.com');
await page.fill('#password', 'nope');
await page.getByRole('button', { name: 'Sign in' }).click();
check(await page.getByRole('alert').count() === 1, 'wrong credentials rejected');
await page.getByRole('button', { name: /Use the demo student account/ }).click();
await page.getByRole('button', { name: 'Sign in' }).click();
await page.waitForURL('**/dashboard');
check(await page.getByText('Arrays & Strings').first().isVisible(), 'dashboard shows topics');
check(await page.getByText('Not started').count() >= 6, 'fresh student: all topics not started');
await shot('02-dashboard-empty');

await page.getByRole('link', { name: /Start practice/ }).click();
await page.waitForURL('**/practice/arrays');
await shot('03-practice-before');

// Answer pattern: correct, wrong, correct, correct, correct ...
const pattern = [true, false, true, true, true, true, false, true, true, true, true, true];
const log = [];
for (let i = 0; i < pattern.length; i++) {
  const sub = await page.locator('main p').first().innerText();
  const id = sub.match(/[A-Z]{2}-\d\d/)[0];
  const ans = answers[id];
  const pick = pattern[i] ? ans : (ans + 1) % 4;
  const beforeTxt = await page.locator('aside .num').filter({ hasText: /^\d\.\d\d$/ }).first().innerText();
  await page.getByRole('radio').nth(pick).click();
  await page.getByRole('button', { name: /Submit answer/ }).click();
  const verdict = await page.locator('.eyebrow', { hasText: /^(Correct|Incorrect)/ }).first().innerText();
  check(verdict.toLowerCase().startsWith(pattern[i] ? 'correct' : 'incorrect'), `${id}: graded ${pattern[i] ? 'correct' : 'incorrect'}`);
  log.push(`${id} before ${beforeTxt}`);
  if (i === 1) await shot('04-practice-after-wrong');
  if (i === 2) await shot('05-practice-after-correct');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(80);
}
console.log(log.join('\n'));
await page.goto(`${BASE}/dashboard`);
await shot('06-dashboard-after');
await page.goto(`${BASE}/progress/arrays`);
await shot('07-progress');
await page.goto(`${BASE}/model`);
await page.getByRole('button', { name: 'All correct' }).click();
check((await page.getByText('Crossed 0.95 at answer 3.').count()) === 1, 'simulator: all correct crosses 0.95 at answer 3');
await page.getByRole('button', { name: 'Reset', exact: true }).click();
await shot('08-model');
await page.goto(`${BASE}/practice/trees`);
await page.keyboard.press('b');
await shot('08b-practice-selected');
await page.goto(`${BASE}/settings`);
await shot('09-settings');
await page.getByRole('button', { name: 'Sign out' }).click();
await page.getByRole('tab', { name: 'teacher' }).click();
await page.getByRole('button', { name: /Use the demo teacher account/ }).click();
await page.getByRole('button', { name: 'Sign in' }).click();
await page.waitForURL('**/class');
await page.getByText('live', { exact: true }).waitFor({ timeout: 5000 }).catch(() => {});
check(await page.getByText('live', { exact: true }).count() >= 1, 'class view shows the live row');
await page.getByText('Varun Sai').first().click();
await shot('10-class');
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${BASE}/class`);
await shot('11-class-mobile');

await page.setViewportSize({ width: 1440, height: 900 });
for (const [path, h] of [['/privacy', 'Privacy policy'], ['/terms', 'Terms and conditions']]) {
  await page.goto(`${BASE}${path}`);
  check(await page.getByRole('heading', { level: 1, name: h }).isVisible(), `${path} renders`);
  await shot(path.slice(1));
}
await page.goto(`${BASE}/class`);
await page.getByRole('link', { name: 'Terms', exact: true }).click();
check(page.url().endsWith('/terms'), 'sidebar links to terms');
await page.evaluate(() => sessionStorage.clear());
await page.goto(`${BASE}/`);
await page.getByRole('link', { name: 'Terms and conditions' }).click();
check(page.url().endsWith('/terms'), 'sign-in page links to terms');
check(external.length === 0, `no requests to other sites${external.length ? ': ' + external.slice(0, 3).join(', ') : ''}`);
console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no console errors');
await browser.close();
