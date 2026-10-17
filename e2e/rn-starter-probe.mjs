/**
 * The starters' three screens (Shell, Home, Products) driven on the React Native renderer (Expo
 * web), as a first-time user would: the home CTA, the bottom tabs (re-pressing the active tab goes
 * back to its own screen), search, row → detail → Edit → Save, New with a required field left empty
 * and then filled. The starters of every runtime (Java, .NET, Python) declare the same screens, so
 * the probe walks any of them.
 *
 * Usage — the renderer in DIRECT mode against a starter that answers CORS for the Expo origin:
 *
 *   cd starters/dotnet && MATEU_URL=http://localhost:8080 dotnet run      (or the Python / Java one)
 *   cd frontend/app/react-native && EXPO_PUBLIC_MATEU_BACKEND_PORT=8080 npx expo start --web --port 19006
 *   cd e2e && node rn-starter-probe.mjs
 *
 * Env: RN_URL (default http://localhost:19006). Exits non-zero on any failed step.
 */
import { chromium } from 'playwright'

const URL = process.env.RN_URL ?? 'http://localhost:19006'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 420, height: 860 } })
const text = () => page.evaluate(() => document.body.innerText)
const tap = async (name) => { await page.getByText(name, { exact: true }).filter({ visible: true }).last().click(); await sleep(2500) }
const tab = async (name) => { await page.getByRole('tab', { name: new RegExp(name) }).first().click(); await sleep(2500) }
const results = []
const step = async (name, fn) => {
    try { await fn(); results.push(true); console.log(`PASS  ${name}`) }
    catch (e) { results.push(false); console.log(`FAIL  ${name} — ${String(e.message).split('\n')[0]}`) }
}
const expect = async (re, why) => { if (!re.test(await text())) throw new Error(why) }

await step('home renders', async () => { await page.goto(URL); await sleep(12000); await expect(/Browse products/, 'no home') })
await step('the home CTA opens the products', async () => { await tap('Browse products'); await expect(/Espresso machine/, 'no products') })
await step('re-pressing the active tab goes back to its own screen', async () => {
    await tab('Home'); await expect(/Browse products/, 'stuck on the screen pushed over the tab')
})
await step('the Products tab lists, search filters', async () => {
    await tab('Products'); await expect(/Espresso/, 'no rows')
    const s = page.locator('input').filter({ visible: true }).first()
    await s.fill('grinder'); await s.press('Enter'); await sleep(2500)
    const t = await text()
    if (/Espresso/.test(t) || !/grinder/.test(t)) throw new Error('search did not filter')
})
await step('row → detail → Edit → Save keeps the new price', async () => {
    await page.goto(URL); await sleep(10000); await tab('Products')
    await tap('P-002'); await expect(/Edit/, 'no detail')
    await tap('Edit')
    await page.locator('input').filter({ visible: true }).nth(2).fill('66')
    await tap('Save')
    await page.goto(URL); await sleep(10000); await tab('Products')
    await expect(/66/, 'price not saved')
})
await step('New: a required field left empty is refused, filled it is created', async () => {
    await tap('New'); await tap('Save')
    await expect(/required|empty|fill/i, 'no validation message')
    const inputs = page.locator('input').filter({ visible: true })
    await inputs.nth(0).fill('P-777'); await inputs.nth(1).fill('Scale'); await inputs.nth(2).fill('20')
    await tap('Save')
    await page.goto(URL); await sleep(10000); await tab('Products')
    await expect(/Scale/, 'not created')
})

await browser.close()
const failed = results.filter((r) => !r).length
console.log(`\n${results.length - failed}/${results.length} passed`)
process.exit(failed ? 1 : 0)
