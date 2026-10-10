// Task metrics for the React Native renderer (expo web at phone size), run by a "synthetic user"
// that only knows the GOAL of each task: it looks for controls by their visible text / accessible
// name (what a first-time user or a screen-reader user would find), never by test ids.
// Usage (expo web of the RN renderer pointed at demo/demo-admin-panel, CORS allowed for it):
//   RN_URL=http://localhost:19006 OUT_DIR=/tmp/rn-metrics node rn-task-metrics.mjs before
// → OUT_DIR/metrics-<label>.json + one screenshot per task. Re-run after a change and compare.
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const BASE = process.env.RN_URL ?? 'http://localhost:19006';
const label = process.argv[2] ?? 'run';
const OUT_DIR = process.env.OUT_DIR ?? '/tmp/rn-metrics';
const SHOTS = OUT_DIR;
mkdirSync(OUT_DIR, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const results = [];

async function task(id, goal, route, body) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const log = { id, goal, steps: [], taps: 0, keystrokes: 0, errors: [], success: false, notes: [] };
  page.on('console', (m) => { if (m.type() === 'error' && !/descendant|nested|hydration/i.test(m.text())) log.errors.push(m.text().slice(0, 160)); });
  const t0 = Date.now();
  await page.goto(route ? `${BASE}/?route=${encodeURIComponent(route)}` : BASE, { waitUntil: 'networkidle' });
  await sleep(3500);
  const u = {
    page,
    async tap(name, how = 'text') {
      log.taps++;
      log.steps.push(`tap ${name}`);
      const loc = how === 'button' ? page.getByRole('button', { name, exact: true })
        : how === 'partial' ? page.getByText(name, { exact: false })
        : page.getByText(name, { exact: true });
      await loc.first().click({ timeout: 4000 });
      await sleep(2200);
    },
    async menu(name) {
      log.taps += 2;
      log.steps.push(`menu ${name}`);
      await page.mouse.click(26, 32);
      await sleep(900);
      await page.getByText(name, { exact: true }).first().click({ timeout: 4000 });
      await sleep(2500);
    },
    async type(labelText, value) {
      log.taps++;
      log.keystrokes += value.length;
      log.steps.push(`type ${labelText}=${value}`);
      await page.getByLabel(labelText, { exact: false }).first().fill(value, { timeout: 4000 });
      await sleep(300);
    },
    async typeByPlaceholder(ph, value) {
      log.taps++;
      log.keystrokes += value.length + 1;
      log.steps.push(`type [${ph}]=${value}`);
      const loc = page.getByPlaceholder(ph).last();
      await loc.fill(value, { timeout: 4000 });
      await loc.press('Enter');
      await sleep(2200);
    },
    async sees(text) {
      return (await page.getByText(text, { exact: false }).count()) > 0 &&
        (await page.getByText(text, { exact: false }).first().isVisible());
    },
    note(n) { log.notes.push(n); },
  };
  try {
    log.success = !!(await body(u));
  } catch (e) {
    log.notes.push(`stuck: ${e.message.split('\n')[0].slice(0, 160)}`);
  }
  log.seconds = Math.round((Date.now() - t0) / 100) / 10;
  await page.screenshot({ path: `${SHOTS}/task-${label}-${id}.png` });
  await page.close();
  results.push(log);
  console.log(`${log.success ? 'PASS' : 'FAIL'} ${id} taps=${log.taps} keys=${log.keystrokes} ${log.seconds}s ${log.notes.join(' | ')}`);
}

await task('T1-find-screen', 'Open the Products listing from the menu', '', async (u) => {
  await u.menu('Products');
  return u.sees('Producto 1');
});

await task('T2-find-record', 'Find "Producto 10" and open it', '', async (u) => {
  await u.menu('Products');
  await u.typeByPlaceholder('Search...', 'Producto 10');
  // the row shows "Producto 10" either as a table cell or inside a list row's supporting line
  log_tap: {
    const exact = u.page.getByText('Producto 10', { exact: true });
    if ((await exact.count()) > 0 && (await exact.first().isVisible())) await u.tap('Producto 10');
    else await u.tap('Producto 10 ·', 'partial');
  }
  return u.sees('Product Producto 10');
});

await task('T3-create-record', 'Create a product "Widget X" with id 9001', '', async (u) => {
  await u.menu('Products');
  await u.tap('New', 'button');
  if (!(await u.sees('Save'))) { u.note('New did not open a form'); return false; }
  await u.type('Id', '9001');
  await u.type('Name', 'Widget X');
  await u.tap('Save', 'button');
  if (await u.sees('Cannot be empty')) {
    // a recoverable error: the user reads it, fixes the field it points at and saves again
    u.note('validation error shown next to the field');
    await u.tap('Select… ▾');
    await u.tap('Available');
    await u.tap('Save', 'button');
  }
  return (await u.sees('Widget X')) && !(await u.sees('Cannot be empty'));
});

await task('T4-recover-validation', 'Try to save an empty new product, then understand what is missing', '', async (u) => {
  await u.menu('Products');
  await u.tap('New', 'button');
  if (!(await u.sees('Save'))) { u.note('New did not open a form'); return false; }
  await u.tap('Save', 'button');
  const told = await u.sees('required') || await u.sees('must not') || await u.sees('Cannot be empty');
  if (!told) u.note('no visible explanation of what is missing');
  return told;
});

await task('T5-read-record', 'Read the contact card (name + email)', '/drawer-demo', async (u) => {
  const ok = (await u.sees('Ada Lovelace')) && (await u.sees('ada@example.com'));
  if (!ok) u.note('values not shown');
  return ok;
});

await task('T6-wizard', 'Complete "Wizard 1"', '', async (u) => {
  await u.menu('Wizard 1');
  for (let i = 0; i < 6; i++) {
    if (await u.sees('Name')) await u.type('Name', 'Ada').catch(() => {});
    const next = u.page.getByRole('button', { name: 'Next', exact: true });
    if ((await next.count()) === 0) break;
    await u.tap('Next', 'button');
  }
  const finish = u.page.getByRole('button', { name: /finish|complete|submit|create/i });
  if ((await finish.count()) > 0) { await finish.first().click(); await sleep(2000); }
  return !(await u.page.getByRole('button', { name: 'Next', exact: true }).count());
});

await task('T7-unknown-route', 'Open a link to a screen that does not exist and get back to work', '/no-such-screen', async (u) => {
  const body = await u.page.evaluate(() => document.body.innerText);
  const hasWayOut = /retry|try again|home|back/i.test(body);
  u.note(`screen says: ${body.replace(/\s+/g, ' ').slice(-120)}`);
  return hasWayOut;
});

writeFileSync(`${OUT_DIR}/metrics-${label}.json`, JSON.stringify(results, null, 2));
await browser.close();
