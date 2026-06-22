import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await (await browser.newContext()).newPage();
await page.goto('http://localhost:8080/products/new', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('mateu-page', { timeout: 10000 });
await page.waitForTimeout(1500);

// Playwright locator pierces shadow DOM automatically
const els = await page.locator('[label]').all();
for (const el of els) {
  const tag = await el.evaluate(n => n.tagName.toLowerCase());
  const label = await el.getAttribute('label');
  console.log(`${tag} label="${label}"`);
}
await browser.close();
