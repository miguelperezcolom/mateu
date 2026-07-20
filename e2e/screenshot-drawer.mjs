// One-shot screenshot that first CLICKS a toolbar button to open a drawer, then captures.
// Usage: node screenshot-drawer.mjs --url <url> --button "<label>" --output <png> [--settle 2500]
import { chromium } from 'playwright';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);

const url = args.url;
const buttonLabel = args.button;
const output = args.output;
const settle = Number(args.settle ?? 2500);

if (!url || !buttonLabel || !output) {
  console.error('need --url, --button and --output');
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
console.log('Navigating to', url);
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('mateu-page', { timeout: 30000 });
await page.waitForTimeout(1500);
console.log('Clicking button:', buttonLabel);
// Target an actual button element (not stray text like a hint paragraph that contains the label).
// Playwright pierces open shadow roots. Try the data-action-id hook first, then button elements.
const candidates = [
  page.locator('[data-action-id]').filter({ hasText: buttonLabel }),
  page.locator('vaadin-button, button, oj-button, oj-c-button, [role="button"]').filter({ hasText: buttonLabel }),
];
let clicked = false;
for (const c of candidates) {
  if (await c.count()) { await c.first().click(); clicked = true; break; }
}
if (!clicked) {
  const dump = await page.locator('vaadin-button, button, [data-action-id], [role="button"]').allInnerTexts();
  console.error('button not found. Clickable texts seen:', JSON.stringify(dump.slice(0, 20)));
  await browser.close();
  process.exit(2);
}
console.log('Waiting for mateu-drawer …');
// The <mateu-drawer> host has no box (the visible fixed panel lives in its shadow root), so wait
// for it ATTACHED, not visible.
await page.waitForSelector('mateu-drawer', { state: 'attached', timeout: 15000 });
await page.waitForTimeout(settle);
await page.screenshot({ path: output });
console.log('Saved:', output);
await browser.close();
