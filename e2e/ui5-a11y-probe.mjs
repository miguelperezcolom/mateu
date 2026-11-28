/**
 * Accessibility probe for the SAP (UI5) renderer — the guarantees of tests/shared/accessibility.spec.ts
 * (written for Vaadin's DOM) checked on UI5's (custom elements; their ARIA lives in their shadow
 * roots, which axe reads): axe WCAG 2.2 A/AA on the same SUT screens, and
 * what axe cannot see — the skip link, the main landmark, live regions at boot, navigation
 * announced, a rejected save marked and focused, overlays owning the focus and giving it back.
 *
 * Usage: cd e2e && BASE=http://localhost:5194 node ui5-a11y-probe.mjs   (exits non-zero on failure)
 */
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'

const BASE = process.env.BASE ?? 'http://localhost:5194'
const ROUTES = ['/', '/all-types', '/validation', '/app', '/items', '/tabs', '/sections', '/accordion', '/overlays']
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []
const check = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`) }

const browser = await chromium.launch()
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage()
const settle = async (route) => {
  await page.goto(BASE + route)
  await page.waitForSelector('#mateu-main', { timeout: 15000 }).catch(() => {})
  await page.waitForFunction(() => !document.querySelector('ui5-busy-indicator[active]:not([data-mateu-keep])'), null, { timeout: 15000 }).catch(() => {})
  await sleep(1200)
}
// the focused element, through open shadow roots, then up through their hosts
const activeInside = (selector) => page.evaluate((sel) => {
  let a = document.activeElement
  while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement
  for (let n = a; n; n = n.parentElement ?? n.getRootNode()?.host) if (n.matches?.(sel)) return true
  return false
}, selector)

// ── markup ───────────────────────────────────────────────────────────────────────────────────
for (const route of ROUTES) {
  await settle(route)
  const r = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  check(`${route}: no WCAG A/AA violations`, r.violations.length === 0,
    r.violations.map((v) => `${v.id} x${v.nodes.length} (${v.nodes[0]?.target?.join(' ')})`).join('; '))
}

// ── behaviour ────────────────────────────────────────────────────────────────────────────────
await settle('/app')
check('live regions exist before anything needs announcing', await page.evaluate(() =>
  document.querySelectorAll('[data-mateu-announcer]').length === 2))
check('the content region is a main landmark', (await page.locator('main, [role=main]').count()) > 0)

await page.keyboard.press('Tab')
check('the skip link is the first Tab stop', await page.evaluate(() =>
  document.activeElement?.classList.contains('mateu-skip-link') ?? false))
await page.keyboard.press('Enter')
check('activating it moves the focus to the content', await activeInside('#mateu-main'))

const polite = () => page.evaluate(() => document.querySelector('[data-mateu-announcer=polite]')?.textContent?.trim() ?? '')
await sleep(300)
check('a load announces where the user landed', (await polite()).length > 0, JSON.stringify(await polite()))

// a rejected save
await settle('/validation')
await page.locator('ui5-button', { hasText: /validate|save|submit/i }).first().click()
await sleep(900)
// a UI5 control marks itself invalid with value-state="Negative" (its inner input gets aria-invalid);
// the message travels on it through accessible-description-ref (→ aria-describedby inside)
const rejected = await page.evaluate(() => {
  const invalid = [...document.querySelectorAll('[value-state="Negative"]')]
  const described = invalid.filter((el) => {
    const ids = (el.getAttribute('accessible-description-ref') ?? el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)
    return ids.some((id) => (document.getElementById(id)?.textContent ?? '').trim().length > 0)
  })
  return { invalid: invalid.length, described: described.length, focused: invalid.includes(document.activeElement) }
})
check('a rejected save marks the fields invalid', rejected.invalid > 0, `${rejected.invalid} field(s)`)
check('each message travels on its control (aria-describedby)', rejected.described === rejected.invalid, `${rejected.described}/${rejected.invalid}`)
check('the focus moves to the first rejected field', rejected.focused)

// overlays
for (const overlay of [{ label: /open drawer/i, name: 'drawer' }, { label: /open dialog/i, name: 'dialog' }]) {
  await settle('/overlays')
  const opener = page.locator('ui5-button', { hasText: overlay.label }).first()
  if (!(await opener.count())) { check(`${overlay.name}: opener found`, false); continue }
  await opener.click()
  await page.waitForSelector('ui5-dialog[open]', { timeout: 10000 }).catch(() => {})
  await sleep(600)
  const inPanel = () => activeInside('ui5-dialog')
  check(`a ${overlay.name} takes the focus on open`, await inPanel())
  let stayed = true
  for (let i = 0; i < 12; i++) { await page.keyboard.press('Tab'); if (!(await inPanel())) stayed = false }
  await page.keyboard.press('Shift+Tab')
  if (!(await inPanel())) stayed = false
  check(`a ${overlay.name} keeps the focus through 12 Tabs and back`, stayed)
  await page.keyboard.press('Escape')
  await sleep(700)
  const back = await page.evaluate((re) => new RegExp(re, 'i').test(document.activeElement?.textContent ?? ''), overlay.label.source)
  check(`closing a ${overlay.name} gives the focus back to its opener`, back)
}

// clickable without a keyboard path
for (const route of ['/', '/app', '/items']) {
  await settle(route)
  const bad = await page.evaluate(() => [...document.querySelectorAll('[role=button], [role=tab], [role=menuitem], [role=option], [role=link]')]
    .filter((el) => !el.matches('button, a[href], input, select, textarea, [tabindex]') && !el.closest('[aria-hidden=true]'))
    .map((el) => el.outerHTML.slice(0, 80)))
  check(`${route}: every interactive role has a tab stop`, bad.length === 0, bad.slice(0, 3).join(' | '))
}

await browser.close()
const failed = results.filter((r) => !r).length
console.log(`\n${results.length - failed}/${results.length} checks passed`)
process.exit(failed ? 1 : 0)
