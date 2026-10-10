/**
 * Live-reload probe — drives a real Mateu app running in DEVELOPMENT MODE and asserts what the
 * developer ends up seeing when they edit a spec on disk and when the backend restarts.
 *
 *   1. the index announces the dev event stream (<meta name="mateu-dev">)
 *   2. a YAML label edited on disk shows up IN PLACE: no navigation, no full page load,
 *      and the value typed into a field survives
 *   3. a "Reloaded" indicator says so; POST /mateu/dev/reload (the IDE, after a HotSwap) re-renders
 *   4. after the backend restarts, the page re-renders by itself (again in place)
 *
 * Usage (a SUT app with -Dmateu.dev=true -Dmateu.dev.specs-dir=$SPECS, serving a `live-demo`
 * route whose definition is $SPECS/live-demo.yaml with the text "Live label v1"):
 *   BASE=http://localhost:18093 SPECS=/path/to/specs RESTART="./start-sut.sh" STOP="kill …" \
 *     OUT=/tmp/shots node live-reload-probe.mjs
 * RESTART/STOP are optional (step 4 is skipped without them). Exits non-zero on any failure.
 */
import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join } from 'node:path'

const BASE = process.env.BASE ?? 'http://localhost:8080'
const SPECS = process.env.SPECS
const OUT = process.env.OUT ?? '/tmp/mateu-live-reload-probe'
const STOP = process.env.STOP
const RESTART = process.env.RESTART
if (!SPECS) {
    console.error('SPECS (the dev specs directory) is required')
    process.exit(2)
}
const definition = join(SPECS, 'live-demo.yaml')

const results = []
const check = (name, pass, detail = '') => {
    results.push({ name, pass, detail })
    console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`)
}
const setLabel = (from, to) =>
    writeFileSync(definition, readFileSync(definition, 'utf8').replace(from, to))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1100, height: 700 } })
let navigations = 0
if (process.env.DEBUG) {
    page.on('request', (r) => { if (r.url().includes('/mateu/v3/')) console.log('  >', r.url(), (r.postData() ?? '').slice(0, 300)) })
    page.on('requestfailed', (r) => console.log('  ✗', r.url(), r.failure()?.errorText))
    page.on('console', (m) => console.log('  console:', m.text()))
}
page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) navigations++
})
try {
    await page.goto(`${BASE}/live-demo`)
    check('the index announces the dev event stream',
        (await page.locator('meta[name="mateu-dev"]').count()) === 1)
    await page.getByText('Live label v1').waitFor({ timeout: 20000 })
    const input = page.locator('vaadin-text-field input').first()
    await input.fill('Ada Lovelace')
    await input.press('Tab')
    // a marker on window: a full page load would wipe it
    await page.evaluate(() => { window.__liveReloadMarker = 'still here' })
    const navigationsBefore = navigations
    // give the EventSource time to connect before editing
    await page.waitForTimeout(1000)

    setLabel('Live label v1', 'Live label v2')
    await page.getByText('Live label v2').waitFor({ timeout: 15000 })
    check('an edited YAML label shows up without touching the browser', true)
    check('it was re-rendered IN PLACE (no navigation, no full page load)',
        navigations === navigationsBefore
            && (await page.evaluate(() => window.__liveReloadMarker)) === 'still here',
        `navigations ${navigations - navigationsBefore}`)
    const kept = await page.locator('vaadin-text-field input').first().inputValue()
    check('the value typed into a field survived the reload', kept === 'Ada Lovelace', `"${kept}"`)
    const pill = page.locator('#mateu-live-reload-indicator')
    check('an unobtrusive indicator says it reloaded',
        (await pill.textContent())?.includes('Reloaded') ?? false, await pill.textContent())
    await page.screenshot({ path: `${OUT}-1-edited.png` })

    // the IDE's trigger after a HotSwap: POST /mateu/dev/reload re-renders the open screen
    const reloads = []
    page.on('request', (r) => { if (r.url().includes('/mateu/v3/sync/')) reloads.push(r.postData() ?? '') })
    const status = (await fetch(`${BASE}/mateu/dev/reload`, { method: 'POST' })).status
    await page.waitForTimeout(1500)
    check('POST /mateu/dev/reload (the IDE after a HotSwap) re-renders the open screen',
        status === 204 && reloads.length === 1 && reloads[0].includes('Ada Lovelace'),
        `status ${status}, ${reloads.length} load(s)`)

    if (STOP && RESTART) {
        execSync(STOP, { stdio: 'inherit' })
        // changed while the server was down: only the restart can bring it to the screen
        setLabel('Live label v2', 'Live label v3')
        execSync(RESTART, { stdio: 'inherit' })
        await page.getByText('Live label v3').waitFor({ timeout: 30000 })
        check('after a backend restart the page re-renders by itself', true)
        const keptAfterRestart = await page.locator('vaadin-text-field input').first().inputValue()
        check('…keeping the typed value', keptAfterRestart === 'Ada Lovelace', `"${keptAfterRestart}"`)
        check('…in place, too',
            (await page.evaluate(() => window.__liveReloadMarker)) === 'still here'
                && navigations === navigationsBefore)
        await page.screenshot({ path: `${OUT}-2-restarted.png` })
    }
} catch (e) {
    check('probe ran to the end', false, String(e).split('\n')[0])
    await page.screenshot({ path: `${OUT}-failure.png` }).catch(() => {})
} finally {
    await browser.close()
    // leave the definition as the probe found it
    setLabel(/Live label v\d/, 'Live label v1')
}
const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
