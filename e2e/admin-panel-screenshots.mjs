/**
 * Generates the interactive admin-panel walkthrough screenshots.
 * Run with: node admin-panel-screenshots.mjs
 * Requires mvc-app1 running on http://localhost:8080
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:8080';
const OUT  = '../doc/public/images/docs/admin-panel';
const SETTLE = 1200;

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 700 } });
const page    = await context.newPage();

async function go(url) {
  await page.goto(`${BASE}${url}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('mateu-page', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(SETTLE);
}

async function shot(name) {
  await page.screenshot({ path: `${OUT}/${name}`, fullPage: false });
  console.log(`Saved: ${OUT}/${name}`);
}

// ── 1. Products list (already generated, but take a clean one) ────────────────
await go('/products');
await shot('products-list.png');

// ── 2. New product form — empty ───────────────────────────────────────────────
await go('/products/new');
await shot('new-product-form-empty.png');

// ── 3. Fill in the "second product" form ─────────────────────────────────────
// Vaadin web components wrap inputs in shadow DOM; pierce with .locator('input')
await page.locator('vaadin-text-field[label="Id"]').locator('input').fill('p4');
await page.locator('vaadin-text-field[label="Name"]').locator('input').fill('Mechanical Keyboard');
await page.locator('vaadin-text-area[label="Description"]').locator('textarea').fill('A premium mechanical keyboard with RGB backlighting and Cherry MX switches.');
// vaadin-select: click button to open overlay, then pick item
await page.locator('vaadin-select[label="Status"]').click();
await page.waitForTimeout(400);
await page.locator('vaadin-select-item').filter({ hasText: 'Available' }).click();
await page.waitForTimeout(400);
await shot('add-second-product-filled-form.png');

// ── 4. Click Save and capture the success toast ──────────────────────────────
await page.locator('vaadin-button:has-text("Save")').click();
await page.waitForTimeout(1200);
await shot('add-second-product-saved.png');

// ── 5. Navigate back to list ──────────────────────────────────────────────────
// Click the "Cancel" / "Back" link or navigate directly
await go('/products');
await shot('add-second-product-back-to-list.png');

// ── 6. Select a row (check the checkbox of one product) ──────────────────────
const firstCheckbox = page.locator('vaadin-grid vaadin-checkbox').nth(1);
await firstCheckbox.click();
await page.waitForTimeout(400);
await shot('select-second-product-on-list.png');

// ── 7. Click Delete to open confirmation ─────────────────────────────────────
await page.locator('vaadin-button:has-text("Delete")').click();
await page.waitForTimeout(800);
await shot('confirm-deletion.png');

// ── 8. Confirm deletion and capture result ────────────────────────────────────
// Look for a confirm button inside the dialog
const confirmBtn = page.locator('vaadin-confirm-dialog-overlay vaadin-button').filter({ hasText: /delete|confirm|yes/i }).first();
await confirmBtn.click();
await page.waitForTimeout(1200);
await shot('second-product-has-been-deleted.png');

await browser.close();
console.log('Done.');
