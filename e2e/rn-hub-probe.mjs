/**
 * End-to-end probe of the Mateu HUB app (frontend/app/react-native in its default, hub mode) on
 * Expo web: add a UI by typing its address → confirm (domain + manifest name) → open it (the real
 * renderer against a real Mateu backend) → back home → add a second UI by DEEP LINK → switch between
 * them → export QR → remove (with confirmation) → the list survives a reload. Every step also checks
 * that the controls on screen carry an accessible name (RN-for-Web maps accessibilityLabel/Role to
 * aria-label/role).
 *
 * The UI manifest (GET <baseUrl>/mateu/v3/manifest) is served by a tiny proxy started HERE, in front
 * of a real Mateu backend (so the probe does not depend on the server-side half shipping first): each
 * proxy port is a different "UI" with its own manifest, and every other request is forwarded to the
 * backend with permissive CORS (the Expo page is another origin).
 *
 * Usage:
 *   cd e2e/sut/apps/mvc-app1 && java -jar target/mvc-app1-*.jar --server.port=18710
 *   cd frontend/app/react-native && CI=1 npx expo start --web --port 19010
 *   cd e2e && node rn-hub-probe.mjs
 * Env: RN_URL (default http://localhost:19010), BACKEND (default http://localhost:18710),
 *      SHOTS (screenshot dir, optional).
 */
import { createServer, request } from 'node:http'
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const RN_URL = process.env.RN_URL ?? 'http://localhost:19010'
const BACKEND = new URL(process.env.BACKEND ?? 'http://localhost:18710')
const SHOTS = process.env.SHOTS
if (SHOTS) mkdirSync(SHOTS, { recursive: true })

const UIS = [
    { port: 18711, manifest: { name: 'Acme CRM', shortName: 'CRM', themeColor: '#1f6feb', wireVersion: '3', minAppVersion: '1.0.0' } },
    { port: 18712, manifest: { name: 'People Desk', shortName: 'People', themeColor: '#f2c94c', wireVersion: '3', minAppVersion: '1.0.0' } },
]

const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
}
const proxies = UIS.map(({ port, manifest }) => createServer((req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, cors)
        return res.end()
    }
    if (req.url === '/mateu/v3/manifest') {
        res.writeHead(200, { ...cors, 'Content-Type': 'application/json' })
        return res.end(JSON.stringify(manifest))
    }
    const up = request({ host: BACKEND.hostname, port: BACKEND.port, path: req.url, method: req.method, headers: { ...req.headers, host: BACKEND.host } }, (r) => {
        const headers = { ...r.headers, ...cors }
        delete headers['access-control-allow-origin']
        res.writeHead(r.statusCode ?? 502, { ...headers, ...cors })
        r.pipe(res)
    })
    up.on('error', () => {
        res.writeHead(502, cors)
        res.end()
    })
    req.pipe(up)
}).listen(port))

const results = []
const check = (name, pass, detail = '') => {
    results.push({ name, pass })
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 420, height: 860 } })
page.on('dialog', (d) => d.accept())
const shot = async (name) => {
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png` })
}
const barShows = async (name, timeout = 20000) => {
    try {
        await page.getByTestId('hub-switch').filter({ visible: true, hasText: name }).first().waitFor({ timeout })
        return true
    } catch {
        return false
    }
}
const visible = (text) => page.getByText(text, { exact: false }).filter({ visible: true }).first()
const waitText = async (text, timeout = 20000) => {
    try {
        await visible(text).waitFor({ timeout })
        return true
    } catch {
        return false
    }
}
const unnamedControls = () => page.evaluate(() => {
    const isShown = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
    return [...document.querySelectorAll('[role="button"], button, [role="link"], input, textarea')]
        .filter(isShown)
        .filter((el) => !(el.getAttribute('aria-label') || (el.textContent ?? '').trim()))
        .map((el) => el.outerHTML.slice(0, 120))
})
const a11y = async (where) => {
    const bad = await unnamedControls()
    check(`${where}: every visible control is named`, bad.length === 0, bad.slice(0, 3).join(' | '))
}

try {
    await page.goto(RN_URL, { waitUntil: 'networkidle' })
    check('first launch shows the demo entry', await waitText('Try a demo'))
    check('home is headed "My UIs"', await waitText('My UIs'))
    await shot('01-home-first-launch')
    await a11y('home')

    // ── add by typing ────────────────────────────────────────────────────────
    // Material: the "+" FAB opens "Scan a QR code" / "Type an address"
    await page.getByRole('button', { name: 'Add a UI' }).first().click()
    await sleep(400)
    await shot('01b-fab-open')
    await page.getByRole('button', { name: 'Type an address' }).filter({ visible: true }).first().click()
    const input = page.getByLabel(/Address of the UI/).first()
    await input.fill('ftp://nope')
    await page.getByRole('button', { name: 'Continue' }).click()
    check('a non-https address is refused with a reason', await waitText('Only https'))
    await shot('02-add-refused')
    await input.fill(`http://localhost:${UIS[0].port}/`)
    await page.getByRole('button', { name: 'Continue' }).click()
    check('confirm shows the DOMAIN', await waitText(`localhost:${UIS[0].port}`))
    check('confirm shows the manifest name', await waitText('Acme CRM'))
    check('confirm flags plain http (dev build)', await waitText('Not secure'))
    await shot('03-confirm')
    await a11y('confirm')
    await page.getByRole('button', { name: 'Add', exact: true }).click()

    // ── open: the real renderer against the backend ─────────────────────────
    check('the UI opens with its bar', await barShows('Acme CRM') && await page.getByTestId('hub-home').filter({ visible: true }).count() > 0)
    await sleep(6000)
    const rendered = await page.evaluate(() => document.body.innerText)
    check('the backend content rendered inside the session', !/Can't reach|Could not|Something went wrong/i.test(rendered) && rendered.replace('Acme CRM', '').trim().length > 5,
        rendered.replace(/\s+/g, ' ').slice(0, 120))
    await shot('04-ui-open')
    await a11y('open UI')

    // ── home ────────────────────────────────────────────────────────────────
    await page.getByTestId('hub-home').filter({ visible: true }).first().click()
    check('back home lists the new UI', await waitText('Acme CRM') && await waitText('Try a demo'))
    await shot('05-home-two')

    // ── add by deep link (the web build accepts <origin>/add?u=…) ──────────
    await page.goto(`${RN_URL}/add?u=${encodeURIComponent(`http://localhost:${UIS[1].port}`)}&r=${encodeURIComponent('/')}`, { waitUntil: 'networkidle' })
    check('a deep link goes to the confirm screen', await waitText('Add this UI?') && await waitText(`localhost:${UIS[1].port}`))
    check('the deep-link manifest name is shown', await waitText('People Desk'))
    await page.getByRole('button', { name: 'Add', exact: true }).click()
    check('the deep-linked UI opens', await barShows('People Desk'))
    await sleep(4000)
    await shot('06-second-ui')

    // a deep link to an ALREADY-added UI opens it without asking again
    // (verified below after switching)

    // ── switch ──────────────────────────────────────────────────────────────
    await page.getByTestId('hub-switch').filter({ visible: true }).first().click()
    check('the switcher lists the UIs', await waitText('Switch UI'))
    await sleep(600) // fade-in
    await shot('07-switcher')
    await a11y('switcher')
    await page.getByRole('button', { name: /^Acme CRM,/ }).filter({ visible: true }).first().click()
    check('switching opens the other UI', await barShows('Acme CRM'))
    await sleep(3000)
    // type into this UI, go to the other one and come back: the session stays mounted, so the
    // half-typed value is still there (each UI keeps its own state)
    await page.locator('input').filter({ visible: true }).first().fill('Ada Lovelace')
    await page.getByTestId('hub-switch').filter({ visible: true }).first().click()
    await sleep(600)
    await page.getByRole('button', { name: /^People Desk,/ }).filter({ visible: true }).first().click()
    await barShows('People Desk')
    await page.getByTestId('hub-switch').filter({ visible: true }).first().click()
    await sleep(600)
    await page.getByRole('button', { name: /^Acme CRM,/ }).filter({ visible: true }).first().click()
    await barShows('Acme CRM')
    await sleep(500)
    const kept = await page.locator('input').filter({ visible: true }).first().inputValue().catch(() => '')
    check('the UI kept its state across the switch (no reload)', kept === 'Ada Lovelace', `field value "${kept}"`)
    await shot('08-switched')

    // ── export ──────────────────────────────────────────────────────────────
    await page.getByTestId('hub-home').filter({ visible: true }).first().click()
    await page.getByRole('button', { name: 'Export my UIs' }).click()
    check('export shows a QR', await page.getByTestId('hub-export-qr').locator('svg').count() > 0)
    const exportText = await page.evaluate(() => document.body.innerText)
    check('export lists domains, no tokens', exportText.includes(`localhost:${UIS[0].port}`) && !/token/i.test(exportText))
    await shot('09-export')
    await a11y('export')
    await page.getByRole('button', { name: 'Close' }).click()

    // ── reorder + remove ────────────────────────────────────────────────────
    await page.getByRole('button', { name: 'Edit list' }).click()
    await page.getByRole('button', { name: 'Move People Desk up' }).click()
    await sleep(300)
    const order = await page.evaluate(() => [...document.querySelectorAll('[role="button"]')].map((b) => b.getAttribute('aria-label') ?? '').filter((l) => /, (localhost|demo)/.test(l)))
    check('reorder moves the entry', order[0]?.startsWith('Try a demo') && order[1]?.startsWith('People Desk'), order.join(' / '))
    await shot('10-edit')
    await page.getByRole('button', { name: 'Remove Try a demo' }).click()
    await sleep(500)
    check('remove (after confirm) drops the entry', !(await page.evaluate(() => document.body.innerText.includes('Try a demo'))))

    // ── import (an export QR scanned on another phone: repeated u=) ─────────
    await page.goto(`${RN_URL}/add?u=${encodeURIComponent(`http://localhost:${UIS[0].port}`)}&u=new.example.com&u=javascript:alert(1)`, { waitUntil: 'networkidle' })
    check('an export link lists the domains to import', await waitText('Import UIs') && await waitText('new.example.com') && await waitText('already added'))
    check('the hostile entry is skipped and said so', await waitText('1 address was skipped'))
    await shot('11-import')
    await a11y('import')
    await page.getByRole('button', { name: 'Add 1 UI' }).click()
    check('import adds only the new one', await waitText('new.example.com') && await waitText('My UIs'))

    // ── persistence ─────────────────────────────────────────────────────────
    await page.goto(RN_URL, { waitUntil: 'networkidle' })
    check('the list survives a reload (demo stays removed)', await waitText('Acme CRM') && !(await page.evaluate(() => document.body.innerText.includes('Try a demo'))))
    const stored = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage))))
    check('metadata holds no tokens', !/accessToken|refreshToken/.test(stored))
    await shot('12-reloaded')
} catch (e) {
    check('probe ran to the end', false, e.message.split('\n')[0])
    await shot('zz-failure')
} finally {
    await browser.close()
    proxies.forEach((p) => p.close())
}

const failed = results.filter((r) => !r.pass).length
console.log(`\n${results.length - failed}/${results.length} passed`)
process.exit(failed ? 1 : 0)
