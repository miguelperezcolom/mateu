/**
 * The browser half of the "first hour" smoke (scripts/first-hour-smoke.sh): what a developer sees
 * in the first minutes after generating a project from a PUBLISHED Mateu release and starting it.
 * Every starter (Java, .NET, Python, YAML, static) declares the same screens — an app shell, a home
 * page with a "Browse products" call to action and a Products screen — so one probe walks them all:
 *
 *   1. the page loads and the home page renders (its call to action is there);
 *   2. the call to action / the Products menu entry opens the products listing (sample rows);
 *   3. (--crud) New → fill the form → Save, and the new product is in the listing.
 *
 * Any uncaught page error fails the run (a broken bundle, a missing asset, a wire mismatch).
 *
 *   node first-hour-probe.mjs --url http://localhost:21200 [--crud] [--shot /tmp/failure.png]
 *
 * Exits non-zero when a step fails.
 */
import { chromium } from 'playwright'
import { parseArgs } from 'node:util'

const { values: a } = parseArgs({
    options: {
        url: { type: 'string' },
        crud: { type: 'boolean', default: false },
        shot: { type: 'string' },
        timeout: { type: 'string', default: '30000' },
    },
})
if (!a.url) {
    console.error('Usage: node first-hour-probe.mjs --url <app url> [--crud] [--shot <png>]')
    process.exit(2)
}
const T = Number(a.timeout)
const SAMPLE_ROW = 'Espresso machine'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
page.setDefaultTimeout(T)
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))
const failedRequests = []
page.on('response', (r) => {
    if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) failedRequests.push(`${r.status()} ${r.request().method()} ${r.url()}`)
})

let failed = false
const step = async (name, fn) => {
    if (failed) { console.log(`SKIP  ${name}`); return }
    try {
        await fn()
        console.log(`PASS  ${name}`)
    } catch (e) {
        failed = true
        console.log(`FAIL  ${name} — ${String(e.message).split('\n')[0]}`)
    }
}
const visible = (locator) => locator.filter({ visible: true }).first()
/** The Status field is required: a select (Java/.NET, empty on New) or already defaulted (Python). */
const pickStatus = async () => {
    const radios = page.getByRole('radio').filter({ visible: true })
    if (await radios.count()) {
        if (!(await page.getByRole('radio', { checked: true }).filter({ visible: true }).count())) await radios.first().check()
        return
    }
    const select = page.getByRole('combobox', { name: 'Status' }).or(page.getByRole('button', { name: /Status/ })).filter({ visible: true })
    if (!(await select.count())) return
    const current = (await select.first().textContent().catch(() => '')) + (await select.first().inputValue().catch(() => ''))
    if (/Available|Out ?of ?stock|Discontinued/i.test(current)) return
    await select.first().click()
    await visible(page.getByRole('option', { name: /Available/ })).click()
}
/** A menu entry: whatever widget the shell variant draws it with (button, tab, link, menu item…). */
const menuEntry = (name) => {
    const byRole = ['button', 'tab', 'link', 'menuitem', 'treeitem', 'option']
        .map((role) => page.getByRole(role, { name, exact: true }))
        .reduce((a, b) => a.or(b))
    return visible(byRole)
}
const noErrors = (where) => {
    if (pageErrors.length) throw new Error(`page error ${where}: ${pageErrors.join(' | ')}`)
}

await step('the page loads and the home page renders', async () => {
    const res = await page.goto(a.url)
    if (!res || !res.ok()) throw new Error(`GET ${a.url} answered ${res?.status()}`)
    await visible(page.getByText('Browse products', { exact: true })).waitFor()
    noErrors('on the home page')
})

await step('the home call to action opens the products listing', async () => {
    await visible(page.getByText('Browse products', { exact: true })).click()
    await visible(page.getByText(SAMPLE_ROW, { exact: true })).waitFor()
    noErrors('on the products listing')
})

await step('the Products menu entry opens the listing too', async () => {
    await page.goto(a.url)
    await visible(page.getByText('Browse products', { exact: true })).waitFor()
    await menuEntry('Products').click()
    await visible(page.getByText(SAMPLE_ROW, { exact: true })).waitFor()
    noErrors('after the menu navigation')
})

if (a.crud) {
    const id = `P-${String(Date.now()).slice(-6)}`
    const name = `Smoke scale ${id}`
    await step('New → fill the form → Save creates a product', async () => {
        await visible(page.getByRole('button', { name: 'New', exact: true })).click()
        await visible(page.getByRole('textbox', { name: 'Id' })).fill(id)
        await visible(page.getByRole('textbox', { name: 'Name' })).fill(name)
        const price = visible(page.getByRole('textbox', { name: 'Price' }).or(page.getByRole('spinbutton', { name: 'Price' })))
        await price.fill('20')
        await pickStatus()
        await visible(page.getByRole('button', { name: 'Save', exact: true })).click()
        // Saving lands on the record (or back on the listing): either way the name is on screen.
        await visible(page.getByText(name)).waitFor()
        noErrors('after saving')
    })
    await step('the new product is in the listing after a reload', async () => {
        await page.goto(new URL('products', a.url.endsWith('/') ? a.url : a.url + '/').toString())
        await visible(page.getByText(SAMPLE_ROW, { exact: true })).waitFor()
        await visible(page.getByText(name)).waitFor()
        noErrors('on the reloaded listing')
    })
}

if (failed) {
    if (a.shot) await page.screenshot({ path: a.shot, fullPage: true }).catch(() => {})
    if (failedRequests.length) console.log(`HTTP errors seen:\n  ${failedRequests.join('\n  ')}`)
    if (pageErrors.length) console.log(`Page errors:\n  ${pageErrors.join('\n  ')}`)
}
await browser.close()
process.exit(failed ? 1 : 0)
