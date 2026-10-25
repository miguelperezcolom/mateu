#!/usr/bin/env node
// Renders the default installed-app icons every Mateu UI ships when it declares none of its own
// (io.mateu.core.infra.Pwa): Mateu's mark, dark on a white rounded square (192 and 512 px,
// purpose "any") and full-bleed inside the maskable safe zone (512 px, purpose "maskable").
//
// The mark is the renderer's favicon (backend/shared/frontend/vaadin-lit/.../assets/mateu-icon.svg).
// Needs Playwright's Chromium: run it with the e2e/ install, e.g.
//   NODE_PATH=e2e/node_modules node scripts/generate-pwa-icons.mjs
// Writes into backend/shared/core/src/main/resources/io/mateu/core/infra/pwa/; copy the PNGs to the
// .NET and Python ports afterwards (their tests compare them byte for byte).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(
  join(root, 'backend/shared/frontend/vaadin-lit/src/main/resources/static/assets/mateu-icon.svg'),
  'utf8',
);
const out = join(root, 'backend/shared/core/src/main/resources/io/mateu/core/infra/pwa');
const mark = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');

// [file, size, corner radius (fraction), mark size (fraction)]
const icons = [
  ['icon-192.png', 192, 0.22, 0.74],
  ['icon-512.png', 512, 0.22, 0.74],
  // maskable: the platform crops it to its own shape; the mark stays inside the 80% safe circle
  ['icon-maskable-512.png', 512, 0, 0.56],
];

const browser = await chromium.launch();
try {
  for (const [file, size, radius, scale] of icons) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    const m = Math.round(size * scale);
    await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent">
      <div style="width:${size}px;height:${size}px;background:#ffffff;border-radius:${Math.round(size * radius)}px;
        display:flex;align-items:center;justify-content:center">
        <img src="${mark}" style="width:${m}px;height:${m}px"></div></body></html>`);
    await page.waitForFunction(() => document.images[0].complete);
    writeFileSync(join(out, file), await page.screenshot({ omitBackground: true }));
    await page.close();
    console.log('wrote', file);
  }
} finally {
  await browser.close();
}
