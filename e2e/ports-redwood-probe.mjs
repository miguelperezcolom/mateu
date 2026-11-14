/**
 * Probe: a backend served with the Redwood (VB) renderer paints its screens — the shell AND the
 * content. Written for the .NET/Python ports (they answered loads aimed at "ux_main" and Redwood
 * painted the shell only), works against any backend serving a Product CRUD at /products
 * (the starters: starters/dotnet, starters/python, starters/spring-mvc with mateu-redwood).
 *
 *   BASE=http://localhost:8771 node ports-redwood-probe.mjs
 *
 * Checks: /products shows the listing with rows; a click on a row opens the record (its fields).
 */
import { chromium } from 'playwright'

const BASE = (process.env.BASE || 'http://localhost:8080').replace(/\/$/, '')
const ROW_TEXT = process.env.ROW_TEXT || 'Espresso machine'
const results = []
const check = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`) }

const browser = await chromium.launch()
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage()
page.on('pageerror', (e) => console.log('pageerror:', e.message))

// the visible text of the content area, shadow roots included
const contentText = () => page.evaluate(() => {
  const walk = (n) => {
    let s = ''
    if (n.nodeType === 3) return n.textContent
    if (n.nodeType !== 1 && n.nodeType !== 11) return ''
    if (n.nodeType === 1) {
      const st = getComputedStyle(n)
      if (st.display === 'none' || st.visibility === 'hidden') return ''
      if (n.shadowRoot) s += walk(n.shadowRoot)
    }
    for (const c of n.childNodes) s += walk(c)
    return s
  }
  const main = document.querySelector('oj-vb-content') || document.querySelector('[role=main]') || document.body
  return walk(main).replace(/\s+/g, ' ').trim()
})

await page.goto(`${BASE}/products`, { waitUntil: 'load' })
let rows = 0
for (let i = 0; i < 60; i++) {
  rows = await page.getByText(ROW_TEXT, { exact: true }).count()
  if (rows > 0) break
  await page.waitForTimeout(500)
}
const listingText = await contentText()
check(`/products paints the listing (a row reads "${ROW_TEXT}")`, rows > 0, ` content: ${listingText.slice(0, 160)}`)

if (rows > 0) {
  await page.getByText(ROW_TEXT, { exact: true }).first().click()
  let opened = false, text = ''
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(500)
    text = await contentText()
    if (!/\/products\/?$/.test(new URL(page.url()).pathname) && text.length > 0 && text !== listingText) { opened = true; break }
  }
  check('a row opens the record', opened, `url ${page.url()}; content: ${text.slice(0, 160)}`)
}

await page.screenshot({ path: process.env.SHOT || '/tmp/ports-redwood-probe.png' })
await browser.close()
const failed = results.filter((ok) => !ok).length
console.log(failed ? `${failed} FAILED` : `ALL ${results.length} PASSED`)
process.exit(failed ? 1 : 0)
