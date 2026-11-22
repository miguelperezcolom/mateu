// A renderer served by a plain static host (a CDN), against a Mateu backend — the two ways the
// deploy guide offers (doc deploy/renderer-on-a-cdn):
//   proxy  — the host proxies /mateu/* to the backend; the page's <meta name="mateu-backend"> is
//            empty, so every call goes to the page's own origin;
//   direct — no proxy; the meta tag names the backend and the backend allows the site's origin
//            (mateu.cors.allowed-origins).
// For each site it checks the listing, a rejected save (validation), a create, and a streamed (SSE)
// action — and that the calls went where they should (same origin vs the backend, nothing else).
//
// The backend: any Mateu app with a Product CRUD at /products (id, name, price, status) and a page
// at /jobs whose «Run» button streams a LongTask — e.g. starters/spring-mvc plus such a page. The
// sites: node e2e/cdn-static-server.mjs over a jar's static/ folder. Then:
//
//   node e2e/cdn-site-probe.mjs --backend http://localhost:8188 \
//     --site vaadin,proxy,http://localhost:9300 --site vaadin,direct,http://localhost:9301 \
//     --site redwood,proxy,http://localhost:9302 --site redwood,direct,http://localhost:9303
//
// Each site creates one product (named so it sorts first): start from a fresh backend so the seeded
// rows stay on the first page. Exits non-zero when a check fails.

import { chromium } from 'playwright'

const args = process.argv.slice(2)
const backend = args[args.indexOf('--backend') + 1]
const sites = args.flatMap((a, i) => (a === '--site' ? [args[i + 1].split(',')] : []))
  .map(([renderer, mode, url]) => ({ renderer, mode, url }))
if (!backend || !sites.length) {
  console.error('usage: node e2e/cdn-site-probe.mjs --backend <url> --site <vaadin|redwood>,<proxy|direct>,<url> …')
  process.exit(2)
}

let failures = 0
const check = (name, ok, detail = '') => {
  console.log(`  ${ok ? '✓' : '✗'} ${name}${ok || !detail ? '' : ' — ' + detail}`)
  if (!ok) failures++
}

// a screen's route: path routes on Vaadin, hash routes (hosted mode) on Redwood
const at = (site, route) => (site.renderer === 'redwood' ? `${site.url}/#${route}` : `${site.url}${route}`)
const text = (page) => page.evaluate(() => {
  const out = []
  const walk = (root) => {
    out.push(root.innerText || root.textContent || '')
    for (const e of root.querySelectorAll('*')) if (e.shadowRoot) walk(e.shadowRoot)
  }
  walk(document.body)
  return out.join('\n')
})
const waitForText = async (page, re, ms = 15000) => {
  const end = Date.now() + ms
  while (Date.now() < end) {
    if (re.test(await text(page))) return true
    await page.waitForTimeout(250)
  }
  return false
}
const button = (page, name) => page.getByRole('button', { name, exact: true }).filter({ visible: true }).first()

async function probe(browser, site) {
  console.log(`\n${site.renderer} · ${site.mode} · ${site.url}`)
  const page = await browser.newPage()
  const calls = []
  page.on('request', (r) => { if (r.url().includes('/mateu/')) calls.push(r.url()) })
  const errors = []
  const oracleErrors = []
  page.on('pageerror', (e) => {
    if (process.env.DEBUG) console.log('    pageerror at', page.url(), (e.stack || '').split('\n').slice(0, 5).join('\n'))
    // an error thrown INSIDE Oracle's own CDN scripts (seen: an intermittent rejected promise in
    // Spectra's chat component bundle on an early hash navigation) is reported, not failed on
    if (/static\.oracle\.com/.test(e.stack || '')) oracleErrors.push(e.message)
    else errors.push(e.message)
  })
  page.on('console', (m) => { if (m.type() === 'error' && /CORS|blocked|Failed to fetch/i.test(m.text())) errors.push(m.text()) })

  // 1. the listing
  await page.goto(at(site, '/products'))
  check('the listing shows the products', await waitForText(page, /Espresso machine[\s\S]*Coffee grinder/))
  const origin = site.mode === 'proxy' ? site.url : backend
  check(`every Mateu call goes to ${site.mode === 'proxy' ? 'the page origin' : 'the backend'}`,
    calls.length > 0 && calls.every((u) => u.startsWith(origin + '/mateu/')), calls.filter((u) => !u.startsWith(origin)).join(', '))

  // 2. a rejected save: nothing typed
  const id = `CDN-${site.renderer}-${site.mode}-${Date.now() % 100000}`
  await page.goto(at(site, '/products/new'))
  await page.getByLabel('Name').first().waitFor({ timeout: 15000 })
  const before = calls.length
  const blank = await text(page)
  await button(page, 'Save').click()
  await page.waitForTimeout(1500)
  // the messages the save brought (each renderer words them its own way), and still on the form
  const said = (await text(page)).split('\n').map((l) => l.trim()).filter((l) => l && !blank.includes(l))
  check('a save with required fields empty is refused', said.some((l) => /cannot be empty|enter a value|select a value|validation/i.test(l))
    && /products\/new/.test(page.url()), said.slice(0, 3).join(' | '))

  // 3. a create
  await page.getByLabel('Id').first().fill(id)
  await page.getByLabel('Name').first().fill('Aa CDN ' + id)
  await page.getByLabel('Price').first().fill('12')
  await page.keyboard.press('Tab')
  const status = page.getByLabel('Status').first()
  await status.click()
  await page.getByRole('option', { name: 'Available' }).first().click()
  await page.waitForTimeout(300)
  const writes = calls.length
  await button(page, 'Save').click()
  await page.waitForTimeout(2000)
  check('the save reached the backend', calls.length > writes && calls.length > before)
  await page.goto(at(site, '/products'))
  check('the created product is listed', await waitForText(page, new RegExp('Aa CDN ' + id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))))

  // 4. a streamed action (SSE): LongTask progress, then its result
  await page.goto(at(site, '/jobs'))
  await button(page, 'Run').waitFor({ timeout: 15000 })
  await button(page, 'Run').click()
  check('the streamed action finishes (SSE through ' + (site.mode === 'proxy' ? 'the proxy' : 'CORS') + ')',
    await waitForText(page, /Job complete/, 20000))
  check('it went over /mateu/v3/sse/', calls.some((u) => u.startsWith(origin + '/mateu/v3/sse/')))

  check('no CORS or script error', errors.length === 0, errors.slice(0, 3).join(' | '))
  if (oracleErrors.length) console.log(`  · note: ${oracleErrors.length} error(s) inside Oracle's CDN scripts: ${oracleErrors[0]}`)
  await page.close()
}

const browser = await chromium.launch()
try {
  for (const site of sites) await probe(browser, site)
} finally {
  await browser.close()
}
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed')
process.exit(failures ? 1 : 0)
