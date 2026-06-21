/**
 * One-shot screenshot tool for Mateu apps.
 *
 * Usage:
 *   node screenshot.mjs --url <url> --output <path> [options]
 *
 * Options:
 *   --url          URL to capture (required)
 *   --output       Destination file path, e.g. docs/images/form.png (required)
 *   --wait-for     CSS selector to wait for before capturing (default: mateu-page)
 *   --element      CSS selector of a specific element to screenshot instead of the full page
 *   --width        Viewport width in pixels (default: 1280)
 *   --height       Viewport height in pixels (default: 800)
 *   --full-page    Capture the full scrollable page (default: false)
 *   --settle       Extra ms to wait after --wait-for appears (default: 1500)
 *   --timeout      Max ms to wait for --wait-for selector (default: 20000)
 *
 * Examples:
 *   node screenshot.mjs --url http://localhost:8080/field-types --output ../docs/images/field-types.png
 *   node screenshot.mjs --url http://localhost:8080/sections --output ../docs/images/sections.png --element vaadin-form-layout
 */

import { chromium } from 'playwright';
import { parseArgs } from 'node:util';
import { resolve, dirname } from 'node:path';
import { mkdirSync } from 'node:fs';

const { values } = parseArgs({
  options: {
    url:         { type: 'string' },
    output:      { type: 'string' },
    'wait-for':  { type: 'string', default: 'mateu-page' },
    element:     { type: 'string' },
    width:       { type: 'string', default: '1280' },
    height:      { type: 'string', default: '800' },
    'full-page': { type: 'boolean', default: false },
    settle:      { type: 'string', default: '1500' },
    timeout:     { type: 'string', default: '20000' },
  },
  strict: false,
});

if (!values.url || !values.output) {
  console.error('Error: --url and --output are required.');
  console.error('Usage: node screenshot.mjs --url <url> --output <path>');
  process.exit(1);
}

const outputPath = resolve(values.output);
mkdirSync(dirname(outputPath), { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: {
    width:  parseInt(values.width),
    height: parseInt(values.height),
  },
});
const page = await context.newPage();

console.log(`Navigating to ${values.url} …`);
await page.goto(values.url, { waitUntil: 'domcontentloaded' });

if (values['wait-for']) {
  console.log(`Waiting for selector "${values['wait-for']}" …`);
  await page.waitForSelector(values['wait-for'], {
    state:   'visible',
    timeout: parseInt(values.timeout),
  });
}

// Let web components finish rendering after the selector appears
const settle = parseInt(values.settle);
if (settle > 0) {
  await page.waitForTimeout(settle);
}

if (values.element) {
  console.log(`Screenshotting element "${values.element}" …`);
  const locator = page.locator(values.element).first();
  await locator.screenshot({ path: outputPath });
} else {
  await page.screenshot({ path: outputPath, fullPage: values['full-page'] });
}

console.log(`Saved: ${outputPath}`);
await browser.close();
