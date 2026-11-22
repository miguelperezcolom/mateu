/**
 * Slow-network probe for the PRIMER renderer — the same scenarios as slow-network-probe.mjs (the
 * Vaadin one), read off Primer's DOM: what the USER ends up seeing under a bad connection.
 *
 *   1. slow first load  → a loading indicator, not a blank page
 *   2. slow action      → the pressed control is marked busy
 *   3. double press     → the second press sends nothing
 *   4. connection lost  → a standing banner + a plain-language error; recovery announced
 *   5. failed write     → an explicit Retry that re-runs the action AND applies its answer
 *   6. 503              → a read recovers by itself; a write is sent exactly once
 *
 * Usage (the SUT on :8080 behind the Primer dev server, or an app serving the mateu-primer jar):
 *   cd e2e && BASE=http://localhost:5180 node primer-slow-network-probe.mjs
 * Exits non-zero if any check fails.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = process.env.BASE ?? 'http://localhost:5180'
const OUT = process.env.OUT ?? '/tmp/mateu-primer-slow-network-probe'
const SYNC = '**/mateu/v3/sync/**'
const isLoad = (body) => body.includes('"actionId":""') || body.includes('"actionId":"__load__"')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []
const check = (name, pass, detail = '') => {
  results.push({ name, pass })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}
fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const open = async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(`${BASE}/`)
  await page.getByRole('button', { name: /greet/i }).waitFor({ timeout: 15000 })
  await page.locator('input[type=text]').first().fill('Ada')
  await page.locator('input[type=text]').first().blur()
  await sleep(300)
  return page
}
const greet = (page) => page.getByRole('button', { name: /greet/i }).first()
const toastTexts = (page) => page.evaluate(() =>
  [...document.querySelectorAll('[role=alert], [role=status], .mateu-toasts *')]
    .map((n) => (n.textContent ?? '').trim()).filter(Boolean))

// 1. slow first load
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.route(SYNC, async (route) => { await sleep(2500); await route.continue() })
  page.goto(`${BASE}/`).catch(() => {})
  await sleep(1200)
  const loading = await page.evaluate(() =>
    !!document.querySelector('[aria-busy="true"], .mateu-busy-bar, [role=progressbar], svg[class*=Spinner], [class*=Spinner]'))
  check('a slow load shows a loading indicator instead of a blank page', loading)
  await page.screenshot({ path: `${OUT}/1-loading.png` })
  await page.close()
}

// 2 & 3. busy control + no double submit
{
  const page = await open()
  let posts = 0
  await page.route(SYNC, async (route) => {
    if (!isLoad(route.request().postData() ?? '')) { posts++; await sleep(3000) }
    await route.continue()
  })
  const button = greet(page)
  await button.click()
  await sleep(700)
  check('the pressed control is marked busy while the action runs',
    (await button.getAttribute('aria-busy')) === 'true' && (await button.getAttribute('data-mateu-pending')) !== null)
  await page.screenshot({ path: `${OUT}/2-pending-button.png` })
  const before = posts
  await button.dispatchEvent('click')
  await button.dispatchEvent('click')
  await sleep(400)
  check('a repeat press while in flight sends no second request', posts === before, `${posts - before} extra request(s)`)
  await sleep(3200)
  check('the busy mark goes once the answer is in', (await button.getAttribute('aria-busy')) === null)
  await page.close()
}

// 4. connection lost
{
  const page = await open()
  await page.context().setOffline(true)
  await page.evaluate(() => window.dispatchEvent(new Event('offline')))
  await sleep(400)
  const banner = await page.locator('[data-mateu-connectivity]').textContent().catch(() => '(none)')
  check('losing the connection raises a standing banner', /no connection/i.test(banner ?? ''), JSON.stringify(banner))
  await greet(page).click().catch(() => {})
  await sleep(2500)
  const joined = (await toastTexts(page)).join(' | ')
  check('the failure is explained in plain language',
    joined.length > 0 && !/Network Error|ECONNABORTED|status code|timeout of|Failed to fetch/i.test(joined), JSON.stringify(joined.slice(0, 200)))
  await page.screenshot({ path: `${OUT}/3-offline.png` })
  await page.context().setOffline(false)
  await page.evaluate(() => window.dispatchEvent(new Event('online')))
  await sleep(500)
  const back = await page.locator('[data-mateu-connectivity]').textContent().catch(() => '(none)')
  check('recovery is announced', /restored/i.test(back ?? ''), JSON.stringify(back))
  await page.close()
}

// 5. Retry
{
  const page = await open()
  let failNext = true
  await page.route(SYNC, async (route) => {
    if (failNext && !isLoad(route.request().postData() ?? '')) { failNext = false; await route.abort('failed'); return }
    await route.continue()
  })
  await greet(page).click()
  await sleep(1500)
  const retry = page.getByRole('button', { name: /^retry$/i }).first()
  check('a failed write offers an explicit Retry', (await retry.count()) > 0)
  if (await retry.count()) {
    await retry.click()
    await sleep(1500)
    const texts = await toastTexts(page)
    check('Retry re-runs the action and its answer is applied', texts.some((t) => /Hello Ada/.test(t)), JSON.stringify(texts.slice(0, 4)))
  }
  await page.close()
}

// 6. reads recover, writes don't repeat
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  let loads = 0
  await page.route(SYNC, async (route) => {
    if (isLoad(route.request().postData() ?? '')) {
      loads++
      if (loads === 1) { await route.fulfill({ status: 503, body: 'nope' }); return }
    }
    await route.continue()
  })
  await page.goto(`${BASE}/`)
  await page.getByRole('heading', { name: /simple form/i }).waitFor({ timeout: 15000 }).catch(() => {})
  const heading = await page.getByRole('heading', { name: /simple form/i }).count()
  check('a read that hits a 503 retries itself and the page still loads', loads >= 2 && heading > 0, `${loads} load attempt(s)`)
  await page.unroute(SYNC)
  await page.locator('input[type=text]').first().fill('Ada')
  let writes = 0
  await page.route(SYNC, async (route) => {
    if (!isLoad(route.request().postData() ?? '')) { writes++; await route.fulfill({ status: 503, body: 'nope' }); return }
    await route.continue()
  })
  await greet(page).click()
  await sleep(3000)
  check('a write that hits a 503 is sent exactly once', writes === 1, `${writes} attempt(s)`)
  await page.close()
}

await browser.close()
const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
