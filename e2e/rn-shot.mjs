import { chromium } from "@playwright/test";
const url = process.argv[2] ?? 'http://localhost:19006';
const out = process.argv[3] ?? 'rn.png';
const actions = process.argv[4] ?? '';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 860 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
if (actions.includes('menu')) {
  // open the drawer (hamburger at top-left) and tap Products
  await page.mouse.click(26, 32);
  await page.waitForTimeout(1000);
  await page.getByText('Products', { exact: true }).first().click();
  await page.waitForTimeout(3000);
}
if (actions.includes('checkin')) {
  await page.mouse.click(26, 32);
  await page.waitForTimeout(1000);
  await page.getByText('Check-in', { exact: true }).first().click();
  await page.waitForTimeout(3000);
}
if (actions.includes('filters')) {
  await page.getByText('Filters', { exact: false }).first().click();
  await page.waitForTimeout(800);
}
if (actions.includes('row')) {
  await page.getByText('Producto 10', { exact: false }).first().click();
  await page.waitForTimeout(2500);
}
if (actions.includes('edit')) {
  await page.getByText('Edit', { exact: true }).first().click();
  await page.waitForTimeout(2500);
}
if (actions.includes('gridrow')) {
  // tap the first grid row inside the edit form (opens the row form modal)
  await page.getByText('x10', { exact: true }).first().click();
  await page.waitForTimeout(1200);
}
await page.screenshot({ path: out, fullPage: false });
await browser.close();
console.log('saved', out);
