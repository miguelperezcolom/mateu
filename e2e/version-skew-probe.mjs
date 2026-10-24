/**
 * Version-skew probe — a tab stays open while the app is deployed again, and the probe asserts what
 * the USER sees. The unit tests cover the decision (baseline, updated, stale); this covers a real
 * renderer against a real server that is really restarted with another build.
 *
 * Three scenarios:
 *   1. redeployment     → the next action shows "This app has been updated…" with Reload, once
 *   2. stale screen     → an action the new release no longer has says "This screen has changed…",
 *                         not "You are not allowed to do this"
 *   3. same build       → a real refusal stays a refusal
 * Plus: every Mateu request names the renderer (X-Mateu-Renderer).
 *
 * The probe restarts the server itself, so it needs the command that starts it with a given build
 * id ({build} is replaced; the command must return once the server answers):
 *
 *   cd e2e && START_CMD='./start-sut.sh {build}' node version-skew-probe.mjs
 *   BASE=http://localhost:8595 ROUTE=/products START_CMD='…' OUT=/tmp/shots node version-skew-probe.mjs
 *
 * The server must read the build id from -Dmateu.build-id / MATEU_BUILD_ID. Works with the Vaadin
 * and the Redwood renderer. Exits non-zero if any check fails.
 */
import { execSync } from 'child_process'
import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:8080'
const ROUTE = process.env.ROUTE ?? '/products'
const OUT = process.env.OUT ?? '/tmp/mateu-version-skew-probe'
const START_CMD = process.env.START_CMD
if (!START_CMD) {
    console.error('START_CMD is required, e.g. START_CMD="./start-sut.sh {build}"')
    process.exit(2)
}

const start = (build) => execSync(START_CMD.replaceAll('{build}', build), { stdio: 'inherit' })
const results = []
const check = (name, pass, detail = '') => {
    results.push({ name, pass })
    console.log(`${pass ? 'PASS' : 'FAIL'} ${name} ${detail}`)
}
const UPDATED = /This app has been updated/
const STALE = /This screen has changed since you opened it/
const FORBIDDEN = /not allowed to do this/

// a read the listing answers on any renderer: type in its search box and press Enter
const search = async (page, text) => {
    const byPlaceholder = page.locator('input[placeholder*="Search" i]:visible').first()
    const input = (await byPlaceholder.count()) ? byPlaceholder : page.locator('input:visible').first()
    await input.click()
    await input.fill(text)
    await input.press('Enter')
}

const open = async (browser) => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.goto(BASE + ROUTE)
    await page.locator('table:visible, vaadin-grid:visible, oj-table:visible').first().waitFor({ timeout: 60000 })
    await page.waitForTimeout(1500)
    return page
}

// rewrites the next action of the page into one the server does not have
const forceActionId = async (page, actionId) => {
    let forced = false
    await page.route('**/mateu/v3/sync/**', async (route) => {
        const body = JSON.parse(route.request().postData() || '{}')
        if (!forced && body.actionId) {
            forced = true
            body.actionId = actionId
            return route.continue({ postData: JSON.stringify(body) })
        }
        return route.continue()
    })
}

const browser = await chromium.launch()
try {
    // 1. a redeployment is announced
    start('probe-a')
    let page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    const renderers = []
    page.on('request', (r) => {
        if (r.url().includes('/mateu/v3/')) renderers.push(r.headers()['x-mateu-renderer'])
    })
    await page.goto(BASE + ROUTE)
    await page.locator('table:visible, vaadin-grid:visible, oj-table:visible').first().waitFor({ timeout: 60000 })
    await page.waitForTimeout(1500)
    check('every Mateu request names the renderer',
        renderers.length > 0 && renderers.every((h) => /^\S+\/\S+ wire\/\d+\.\d+$/.test(h ?? '')), renderers[0])
    check('no notice on the first load', (await page.getByText(UPDATED).count()) === 0)
    start('probe-b')
    await search(page, 'a')
    check('the redeployment is announced',
        await page.getByText(UPDATED).first().waitFor({ timeout: 20000 }).then(() => true, () => false))
    check('the notice offers Reload', await page.getByText(/^(Reload|Recargar)$/).first().isVisible().catch(() => false))
    await page.screenshot({ path: `${OUT}-updated.png` })
    const before = await page.getByText(UPDATED).count()
    await search(page, 'b')
    await page.waitForTimeout(2500)
    check('the notice is shown once', (await page.getByText(UPDATED).count()) === before)
    await page.close()

    // 2. a stale screen is not a permission problem
    page = await open(browser)
    start('probe-c')
    await forceActionId(page, 'removedInTheNewRelease')
    await search(page, 'c')
    check('a stale screen is explained',
        await page.getByText(STALE).first().waitFor({ timeout: 20000 }).then(() => true, () => false))
    check('no permission message for a stale screen', (await page.getByText(FORBIDDEN).count()) === 0)
    await page.screenshot({ path: `${OUT}-stale.png` })
    await page.close()

    // 3. a real refusal with the same build stays a refusal
    page = await open(browser)
    await forceActionId(page, 'noSuchThing')
    await search(page, 'd')
    check('a same-build refusal stays a refusal',
        await page.getByText(FORBIDDEN).first().waitFor({ timeout: 20000 }).then(() => true, () => false))
    check('no stale message on the same build', (await page.getByText(STALE).count()) === 0)
} finally {
    await browser.close()
}
const failed = results.filter((r) => !r.pass).length
console.log(`${results.length - failed}/${results.length} passed`)
process.exit(failed ? 1 : 0)
