/**
 * Renderer conformance suite — measures how much of the Mateu component surface a renderer
 * actually draws, by screenshotting a set of fixture routes and detecting the explicit
 * <mateu-unsupported> placeholders emitted by the shared BasicComponentRenderer fallback
 * (see libs/mateu .../renderers/unsupportedRenderer.ts).
 *
 * Prerequisites: a renderer app reachable at --base-url (usually its Vite dev server, wired to
 * the SUT backend — use e2e/conformance.sh which does that wiring for you), and the SUT running.
 *
 * Usage:
 *   node conformance.mjs --base-url http://localhost:5173 [options]
 *
 * Options:
 *   --base-url   Renderer app URL prefix (required)
 *   --renderer   Renderer label for the output dir/report. Default: read from the app itself
 *                (window.__mateuRendererInfo.name, published by ComponentRendererSingleton.set)
 *   --fixtures   Fixtures file (default: conformance-fixtures.json next to this script)
 *   --routes     Comma-separated subset of routes to run (default: all fixtures)
 *   --out        Output dir (default: conformance-report/<renderer>)
 *   --settle     Extra ms after mateu-ui appears (default: 4000)
 *   --timeout    Max ms waiting for mateu-ui per route (default: 30000)
 *
 * Output: <out>/report.json, <out>/report.md, <out>/screenshots/*.png
 */

import { chromium } from 'playwright';
import { parseArgs } from 'node:util';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));

const { values } = parseArgs({
  options: {
    'base-url': { type: 'string' },
    renderer:   { type: 'string' },
    fixtures:   { type: 'string', default: join(here, 'conformance-fixtures.json') },
    routes:     { type: 'string' },
    out:        { type: 'string' },
    settle:     { type: 'string', default: '4000' },
    timeout:    { type: 'string', default: '30000' },
  },
  strict: false,
});

if (!values['base-url']) {
  console.error('Error: --base-url is required, e.g. --base-url http://localhost:5173');
  process.exit(1);
}

const baseUrl = values['base-url'].replace(/\/$/, '');
const settle = parseInt(values.settle);
const timeout = parseInt(values.timeout);
let fixtures = JSON.parse(readFileSync(resolve(values.fixtures), 'utf8')).fixtures;
if (values.routes) {
  const wanted = values.routes.split(',').map(r => r.trim());
  fixtures = fixtures.filter(f => wanted.includes(f.route));
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1300, height: 850 } });

const results = [];
let rendererInfo = null;

for (const fixture of fixtures) {
  const url = baseUrl + fixture.route;
  const consoleErrors = [];
  const onConsole = msg => { if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 300)); };
  const onPageError = err => consoleErrors.push(String(err).slice(0, 300));
  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  const result = { route: fixture.route, name: fixture.name, declaredTypes: fixture.types };
  try {
    console.log(`→ ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('mateu-ui', { state: 'attached', timeout });
    await page.waitForTimeout(settle);

    // Renderer identity + declared supported types, published by ComponentRendererSingleton.set
    rendererInfo ??= await page.evaluate(() => globalThis.__mateuRendererInfo ?? null);

    // Playwright CSS selectors pierce open shadow roots, so this finds placeholders anywhere.
    result.unsupported = await page.locator('mateu-unsupported').evaluateAll(els =>
      els.map(el => ({ type: el.getAttribute('type'), renderer: el.getAttribute('renderer') })));

    // Visible-ish text length, walking into open shadow roots (document.body.innerText does not)
    const textLength = await page.evaluate(() => {
      const collect = root => {
        let t = root.textContent ?? '';
        for (const el of root.querySelectorAll('*')) {
          if (el.shadowRoot) t += collect(el.shadowRoot);
        }
        return t;
      };
      return collect(document.body).trim().length;
    });
    result.textLength = textLength;
    result.status = textLength < 10 ? 'blank' : 'rendered';
  } catch (e) {
    result.status = 'error';
    result.error = String(e).slice(0, 300);
    result.unsupported = [];
  }
  result.consoleErrors = consoleErrors;
  page.off('console', onConsole);
  page.off('pageerror', onPageError);

  const rendererLabel = values.renderer ?? rendererInfo?.name ?? 'unknown';
  const outDir = resolve(values.out ?? join(here, 'conformance-report', rendererLabel));
  mkdirSync(join(outDir, 'screenshots'), { recursive: true });
  result.screenshot = join('screenshots', `${fixture.name}.png`);
  try {
    await page.screenshot({ path: join(outDir, result.screenshot), fullPage: true });
  } catch { /* screenshot is best-effort */ }
  results.push(result);
}

await browser.close();

// ---------------------------------------------------------------- report ----
const rendererLabel = values.renderer ?? rendererInfo?.name ?? 'unknown';
const outDir = resolve(values.out ?? join(here, 'conformance-report', rendererLabel));
mkdirSync(outDir, { recursive: true });

// Parity matrix over every type any fixture declares to exercise
const allTypes = [...new Set(fixtures.flatMap(f => f.types))].sort();
const placeholderTypes = new Set(results.flatMap(r => (r.unsupported ?? []).map(u => u.type)));
const declared = rendererInfo?.supportedTypes; // null/undefined = declares full support
const matrix = allTypes.map(type => ({
  type,
  declaredSupported: declared ? declared.includes(type) : true,
  placeholderObserved: placeholderTypes.has(type),
}));

const report = {
  renderer: rendererLabel,
  baseUrl,
  date: new Date().toISOString(),
  rendererInfo,
  matrix,
  results,
};
writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));

const md = [];
md.push(`# Renderer conformance report — ${rendererLabel}`);
md.push('');
md.push(`- Base URL: ${baseUrl}`);
md.push(`- Date: ${report.date}`);
md.push(`- Renderer info: ${rendererInfo ? `name=\`${rendererInfo.name}\`, declared types: ${rendererInfo.supportedTypes ? rendererInfo.supportedTypes.length : 'ALL (reference renderer)'}` : 'NOT PUBLISHED (old build without __mateuRendererInfo?)'}`);
md.push('');
md.push('## Parity matrix (types exercised by the fixtures)');
md.push('');
md.push('| ComponentMetadataType | Declared supported | Placeholder observed |');
md.push('|---|---|---|');
for (const row of matrix) {
  md.push(`| ${row.type} | ${row.declaredSupported ? 'yes' : 'NO'} | ${row.placeholderObserved ? 'YES ⚠' : 'no'} |`);
}
md.push('');
md.push('## Fixtures');
md.push('');
md.push('| Route | Status | Placeholders seen | Console errors | Screenshot |');
md.push('|---|---|---|---|---|');
for (const r of results) {
  const ph = (r.unsupported ?? []).map(u => u.type);
  const phTxt = ph.length ? [...new Set(ph)].join(', ') + ` (${ph.length})` : '—';
  md.push(`| ${r.route} | ${r.status}${r.error ? `: ${r.error.replaceAll('|', '\\|')}` : ''} | ${phTxt} | ${r.consoleErrors.length || '—'} | ![](${r.screenshot}) |`);
}
md.push('');
writeFileSync(join(outDir, 'report.md'), md.join('\n'));

const total = results.length;
const rendered = results.filter(r => r.status === 'rendered').length;
console.log(`\nDone: ${rendered}/${total} routes rendered, ${placeholderTypes.size} unsupported type(s) observed: ${[...placeholderTypes].join(', ') || '—'}`);
console.log(`Report: ${join(outDir, 'report.md')}`);
