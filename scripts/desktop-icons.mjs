#!/usr/bin/env node
// Regenerates the desktop app's icons from frontend/app/intellij-plugin/branding/mateu-icon.svg:
//   mateu-1024.png (Linux, and the source of the others), mateu.icns (macOS), mateu.ico (Windows).
// Needs macOS (sips + iconutil) and the Playwright installed in e2e/ (it renders the SVG):
//   node scripts/desktop-icons.mjs
// The SVG embeds the phone app's face (frontend/app/react-native/assets/icon.png) on a rounded
// square with the margin macOS icons use, so the desktop and phone apps share one face.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const branding = join(root, 'frontend/app/intellij-plugin/branding');
const require = createRequire(join(root, 'e2e/package.json'));
const { chromium } = require('playwright');

const work = mkdtempSync(join(tmpdir(), 'mateu-icons-'));
const png1024 = join(branding, 'mateu-1024.png');

// 1. render the SVG at 1024×1024 on a transparent background
const svg = readFileSync(join(branding, 'mateu-icon.svg'), 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
await page.locator('svg').screenshot({ path: png1024, omitBackground: true });
await browser.close();

// macOS's own tools by their absolute path, never whatever an inherited PATH names first
const sips = (size, out) => execFileSync('/usr/bin/sips', ['-z', String(size), String(size), png1024, '--out', out], { stdio: 'ignore' });

// 2. macOS: an .iconset → iconutil
const iconset = join(work, 'mateu.iconset');
mkdirSync(iconset);
for (const s of [16, 32, 128, 256, 512]) {
  sips(s, join(iconset, `icon_${s}x${s}.png`));
  sips(s * 2, join(iconset, `icon_${s}x${s}@2x.png`));
}
execFileSync('/usr/bin/iconutil', ['-c', 'icns', iconset, '-o', join(branding, 'mateu.icns')]);

// 3. Windows: an .ico whose entries are PNGs (valid since Windows Vista)
const sizes = [16, 24, 32, 48, 64, 128, 256];
const images = sizes.map((s) => {
  const out = join(work, `ico-${s}.png`);
  sips(s, out);
  return readFileSync(out);
});
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(images.length, 4);
const entries = [];
let offset = 6 + 16 * images.length;
images.forEach((data, i) => {
  const e = Buffer.alloc(16);
  const s = sizes[i];
  e.writeUInt8(s >= 256 ? 0 : s, 0); // width (0 = 256)
  e.writeUInt8(s >= 256 ? 0 : s, 1); // height
  e.writeUInt8(0, 2); // palette
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(data.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += data.length;
  entries.push(e);
});
writeFileSync(join(branding, 'mateu.ico'), Buffer.concat([header, ...entries, ...images]));
console.log('desktop icons regenerated in', branding);
