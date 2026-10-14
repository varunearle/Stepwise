// Browser checks for input handling. Run with `npm run preview` active:
//   node verify/security.mjs http://localhost:4173
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(process.env.PLAYWRIGHT_FROM ?? import.meta.url);
const { chromium } = require('playwright');

const BASE = process.argv[2] ?? 'http://localhost:4173';
const browser = await chromium.launch();
const page = await browser.newPage({ acceptDownloads: true });
let fail = 0;
const check = (c, m) => { console.log(c ? 'ok  ' : 'FAIL', m); if (!c) fail++; };
let dialogs = 0;
page.on('dialog', async (d) => { if (d.type() === 'alert') dialogs++; await d.accept(); });

// 1. Script injection through a name field must render as plain text.
const payload = '<img src=x onerror=alert(1)>';
await page.goto(BASE);
await page.getByRole('button', { name: /Use the demo student account/ }).click();
await page.getByRole('button', { name: 'Sign in' }).click();
await page.waitForURL('**/dashboard');
await page.goto(`${BASE}/settings`);
await page.fill('#sn', payload);
await page.getByRole('button', { name: 'Save' }).click();
await page.goto(`${BASE}/dashboard`);
await page.waitForTimeout(500);
check(dialogs === 0, 'name containing HTML does not execute script');
check((await page.locator('img[src="x"]').count()) === 0, 'name containing HTML is not turned into an element');
check((await page.getByText(payload).count()) >= 1, 'name containing HTML is shown as text');

// 2. Formula in a name must not become an Excel formula in the CSV export.
await page.goto(`${BASE}/settings`);
await page.fill('#sn', '=HYPERLINK("http://example.com","click")');
await page.getByRole('button', { name: 'Save' }).click();
await page.evaluate(() => sessionStorage.setItem('stepwise:session', JSON.stringify({ role: 'teacher' })));
await page.goto(`${BASE}/class`);
const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Export CSV/ }).click()]);
const csv = readFileSync(await dl.path(), 'utf8');
const row = csv.split('\r\n').find((l) => l.includes('HYPERLINK'));
check(csv.startsWith('student,simulated,topic'), 'CSV export downloads under the security policy');
check(row?.startsWith(`"'=HYPERLINK(`), `formula is neutralised: ${row?.slice(0, 40)}`);

// 3. Tampered storage must not crash the app.
await page.evaluate(() => localStorage.setItem('stepwise:v1', '{"version":1,"attempts":[{"topic":"x"}],"params":"junk"}'));
await page.evaluate(() => sessionStorage.setItem('stepwise:session', '{"role":"admin"}'));
await page.goto(`${BASE}/class`);
await page.waitForURL(`${BASE}/`, { timeout: 5000 }).catch(() => {});
check(page.url() === `${BASE}/`, `unknown role in session is rejected (now at ${page.url()})`);
await page.getByRole('button', { name: /Use the demo student account/ }).click();
await page.getByRole('button', { name: 'Sign in' }).click();
await page.waitForURL('**/dashboard');
await page.getByText('Course topics').waitFor({ timeout: 5000 }).catch(() => {});
check((await page.getByText('Course topics').count()) === 1, 'app loads normally after storage was tampered with');

await browser.close();
console.log(fail ? `${fail} failed` : 'all security checks passed');
process.exit(fail ? 1 : 0);
