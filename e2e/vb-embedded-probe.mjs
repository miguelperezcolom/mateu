/**
 * The EMBEDDED mode of the VB/Redwood renderer: the <mateu-ui> JET Custom Component inside a HOST
 * page that is not ours — apps/redwood/embedded/harness (a plain Oracle JET page, JET from Oracle's
 * CDN, binding the component the way a Visual Builder page does) — against a Mateu backend.
 *
 * Checks: a listing and a form render inside the component; an action runs (and the host hears
 * it); a navigation the screen asks for fires mateuNavigate and happens inside — or not, when the
 * host cancels it or owns navigation; the host's identity rides every request (its provider is
 * asked each time); a property change re-renders; and the host page around it stays untouched (its
 * URL, its title, its header, no skip link of ours).
 *
 * Usage (demo-vb running with mateu.cors.allowed-origins = the harness origin; the component built
 * with `npm run build:embedded` and served with `npm run serve:embedded` in apps/redwood):
 *   HOST_URL=http://localhost:9131 BACKEND_URL=http://localhost:9005 node vb-embedded-probe.mjs [--shots dir]
 * Exits non-zero if a check fails.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const HOST_URL = (process.env.HOST_URL || 'http://localhost:9131').replace(/\/+$/, '')
const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:9005').replace(/\/+$/, '')
const shotsArg = process.argv.indexOf('--shots')
const shots = shotsArg > 0 ? process.argv[shotsArg + 1] : ''
if (shots) mkdirSync(shots, { recursive: true })

const browser = await chromium.launch()
let failed = 0
let passed = 0
const check = (name, ok, detail = '') => {
  if (ok) passed++
  else failed++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${!ok && detail ? ' — ' + detail : ''}`)
}

/** Opens the host page with the component on `query`; resolves once the component is ready. */
async function openHost(query) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await ctx.newPage()
  const errors = []
  const requests = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('request', (r) => {
    if (r.url().startsWith(BACKEND_URL + '/mateu/v3/')) {
      const headers = r.headers()
      requests.push({ url: r.url(), authorization: headers.authorization || '', hostApp: headers['x-host-app'] || '', body: r.postData() || '' })
    }
  })
  const params = new URLSearchParams({ backend: BACKEND_URL, ...query })
  const url = `${HOST_URL}/?${params}`
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => (window.__hostEvents || []).some((e) => e.type === 'mateuReady'), null, { timeout: 90000 })
  await page.waitForTimeout(800)
  return { ctx, page, errors, requests, url }
}

const events = (page, type) => page.evaluate((t) => (window.__hostEvents || []).filter((e) => e.type === t).map((e) => e.detail), type)
const componentText = (page) => page.evaluate(() => (document.querySelector('mateu-ui') || {}).innerText || '')
const waitForText = async (page, text, ms = 20000) => {
  try {
    await page.waitForFunction((t) => ((document.querySelector('mateu-ui') || {}).innerText || '').includes(t), text, { timeout: ms })
    return true
  } catch (e) {
    return false
  }
}
/** The host page around the component, as the probe first saw it. */
const hostSnapshot = (page) => page.evaluate(() => ({
  href: window.location.href,
  title: document.title,
  header: document.getElementById('hostHeader').querySelector('h1').textContent,
  intro: document.getElementById('hostIntro').textContent,
  skipLink: !!document.querySelector('body > .mateu-skip-link'),
}))
const clickButton = (page, label) => page.locator('mateu-ui oj-button, mateu-ui oj-c-button').filter({ hasText: label }).first().click()

// ── a listing ──────────────────────────────────────────────────────────────────────────────
{
  const { ctx, page, errors, requests, url } = await openHost({ route: 'products' })
  const before = await hostSnapshot(page)
  check('listing renders its rows inside the component', await waitForText(page, 'Keyboard') && (await componentText(page)).includes('Laptop'))
  check('the host hears the screen title (mateuTitle)', (await events(page, 'mateuTitle')).some((d) => d.title === 'Products'))
  check('mateuReady names the route', (await events(page, 'mateuReady'))[0]?.route === '/products')
  const auths = requests.map((r) => r.authorization)
  check('every request carries the HOST identity (header provider)', requests.length > 0 && auths.every((a) => /^Bearer host-token-\d+$/.test(a)) && requests.every((r) => r.hostApp === 'acme-vb'),
    JSON.stringify(auths))
  check('the provider is asked on every request (a rotating token is read fresh)', new Set(auths).size === auths.length, JSON.stringify(auths))
  const after = await hostSnapshot(page)
  check('the host page is untouched (URL, title, header, no skip link)', JSON.stringify(before) === JSON.stringify(after) && after.href === url && !after.skipLink
    && after.title === 'Host app — mateu-ui embedded', JSON.stringify(after))
  check('no page errors', !errors.length, errors[0])
  if (shots) await page.screenshot({ path: join(shots, 'vb-embedded-listing.png') })

  // an overlay: New opens the create drawer — JET's popup layer, over the host page like any JET
  // overlay of the host — and Save closes it and refreshes the listing in place
  await page.locator('mateu-ui oj-c-button, mateu-ui oj-button').filter({ hasText: 'New' }).first().click()
  const drawer = page.locator('oj-drawer-popup')
  const opened = await page.waitForFunction(() => [...document.querySelectorAll('oj-drawer-popup')].some((d) => d.innerText.includes('Sku')), null, { timeout: 15000 }).then(() => true, () => false)
  check('an overlay (the create drawer) opens from the component', opened)
  if (shots) await page.screenshot({ path: join(shots, 'vb-embedded-drawer.png') })
  if (opened) {
    const field = (label) => drawer.locator('oj-input-text, oj-input-number').filter({ hasText: label }).first().locator('input')
    await field('Name').fill('Tablet')
    await field('Sku').fill('TB-900')
    await field('Sku').press('Tab')
    await page.waitForTimeout(300)
    await drawer.locator('oj-button, oj-c-button').filter({ hasText: 'Save' }).first().click()
    check('…Save persists and the listing shows the new row', await waitForText(page, 'Tablet'))
    if (shots) await page.screenshot({ path: join(shots, 'vb-embedded-saved.png') })
  }
  await ctx.close()
}

// ── a form, an action, the app context ─────────────────────────────────────────────────────
{
  const { ctx, page, errors, requests } = await openHost({ route: 'person', appContext: JSON.stringify({ hotel: 'H1' }) })
  check('form renders inside the component', await waitForText(page, 'Age'))
  const input = page.locator('mateu-ui oj-input-text input').first()
  await input.fill('Grace')
  await input.press('Tab')
  await page.waitForTimeout(300)
  await clickButton(page, 'Save')
  const saved = await page.waitForFunction(() => document.body.innerText.includes('Saved Grace @ H1'), null, { timeout: 15000 }).then(() => true, () => false)
  check('an action runs: Save sends the edited state and the app context, the message shows', saved)
  check('the host hears the action (mateuAction)', (await events(page, 'mateuAction')).some((d) => d.actionId === 'save'))
  check('the app context rides every screen request (appState)', requests.some((r) => r.url.includes('/sync/')) && requests.filter((r) => r.url.includes('/sync/')).every((r) => r.body.includes('"hotel":"H1"')))
  check('no page errors (form)', !errors.length, errors[0])
  if (shots) await page.screenshot({ path: join(shots, 'vb-embedded-form.png') })

  // a navigation the SCREEN asks for (an action returning a URI): event first, then inside
  const before = await hostSnapshot(page)
  await clickButton(page, 'Go to products')
  check('a navigation fires mateuNavigate', await page.waitForFunction(() => (window.__hostEvents || []).some((e) => e.type === 'mateuNavigate' && e.detail.route === '/products'), null, { timeout: 15000 }).then(() => true, () => false))
  check('…and happens inside the component (navigation=internal)', await waitForText(page, 'Keyboard'))
  check('…without touching the host URL', JSON.stringify(await hostSnapshot(page)) === JSON.stringify(before))
  if (shots) await page.screenshot({ path: join(shots, 'vb-embedded-navigated.png') })

  // `route` is written back ({{ }} in the host follows the screen)…
  check('the internal navigation is written back to the host (route)', await page.evaluate(() => window.__hostVm.route()) === '/products')
  // …and a property change re-renders: the host points the component at another route
  await page.evaluate(() => window.__hostVm.route('person'))
  check('a property change (route) re-renders the component', await waitForText(page, 'Age'))
  await ctx.close()
}

// ── the host takes navigation over ─────────────────────────────────────────────────────────
for (const query of [{ route: 'person', cancel: '1' }, { route: 'person', navigation: 'host' }]) {
  const { ctx, page, requests } = await openHost(query)
  const label = query.cancel ? 'a cancelled mateuNavigate' : 'navigation=host'
  await waitForText(page, 'Age')
  const loads = requests.length
  await clickButton(page, 'Go to products')
  const fired = await page.waitForFunction(() => (window.__hostEvents || []).some((e) => e.type === 'mateuNavigate'), null, { timeout: 15000 }).then(() => true, () => false)
  await page.waitForTimeout(1500)
  const stayed = (await componentText(page)).includes('Age') && !(await componentText(page)).includes('Keyboard')
  const noLoad = !requests.slice(loads).some((r) => r.url.endsWith('/sync/products'))
  check(`${label}: the event fires and the component stays where it is`, fired && stayed && noLoad)
  await ctx.close()
}

await browser.close()
console.log(`\n${passed}/${passed + failed} checks OK`)
process.exit(failed ? 1 : 0)
