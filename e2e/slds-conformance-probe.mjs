/**
 * Conformance probe for the SALESFORCE (SLDS) renderer: every fixture of e2e/conformance-fixtures.json (the
 * SUT screens each conformance level is judged by — core, standard, full) loaded fresh in a real
 * browser. A fixture passes when its screen draws (the content region has text), nothing on it is
 * a `<mateu-unsupported>` placeholder, and the page logged no error.
 *
 * Usage (the SUT served with the mateu-slds jar, or behind the SLDS dev server):
 *   cd e2e && BASE=http://localhost:8091 node slds-conformance-probe.mjs
 * SHOTS=<dir> writes a full-page screenshot per fixture. Exits non-zero if any fixture fails.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const BASE = process.env.BASE ?? 'http://localhost:5203'
const SHOTS = process.env.SHOTS ? path.resolve(here, process.env.SHOTS) : null
const fixtures = JSON.parse(fs.readFileSync(path.join(here, 'conformance-fixtures.json'), 'utf8')).fixtures
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true })

const browser = await chromium.launch()
const results = []
for (const f of fixtures) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const errs = []
  page.on('pageerror', (e) => errs.push(e.message.slice(0, 200)))
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
  await page.goto(BASE + f.route)
  await page.waitForSelector('#mateu-main', { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(2500)
  const unsupported = await page.$$eval('mateu-unsupported', (els) => [...new Set(els.map((e) => e.getAttribute('data-type')))])
  const blank = (await page.locator('#mateu-main').innerText().catch(() => '')).trim().length < 5
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${String(f.name).replace(/[^a-z0-9-]+/gi, '_')}.png`), fullPage: true })
  results.push({ name: f.name, level: f.level, ok: unsupported.length === 0 && !blank && errs.length === 0, unsupported, blank, errs: errs.slice(0, 3) })
  await page.close()
}
await browser.close()

for (const r of results) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  [${r.level}] ${r.name}${r.unsupported.length ? ' unsupported=' + r.unsupported.join(',') : ''}${r.blank ? ' BLANK' : ''}${r.errs.length ? ' errors=' + JSON.stringify(r.errs) : ''}`)
}
for (const level of [...new Set(results.map((r) => r.level))]) {
  const of = results.filter((r) => r.level === level)
  console.log(`${level}: ${of.filter((r) => r.ok).length}/${of.length}`)
}
process.exit(results.every((r) => r.ok) ? 0 : 1)
