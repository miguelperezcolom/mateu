/**
 * Probe of the Redwood/VB renderer's PAGE HEADER elements and the data-authored shell's SOURCES.
 *
 * Page header (oj-sp-header-general-overview + what it has no element for):
 *  - overline above the title, the status badge, the timestamp (oj-sp's own when it is a date, on
 *    the subtitle line otherwise), the previous/next peer arrows (a side without a route is disabled) and
 *    the title placeholder (only while the title is empty, dimmed) — for a JAVA page (demo-vb
 *    /header-extras, CustomerRecordPage) and the same page authored in YAML.
 * App shell (`type: AppShell`, YAML_URL only):
 *  - the bell lists a notifications.source (proxied: through `_appsource`, the browser never calls
 *    the endpoint), opening an entry marks it read through markRead and navigates;
 *  - the Ask palette searches a DIRECT globalSearch.source fetched by the browser.
 * Java pipeline (VB_URL): the Ask palette still searches through `_globalsearch`
 * (GlobalSearchSupplier); with PMS_URL, the bell still lists through `_notifications-list`.
 *
 * VB_URL   (default http://localhost:9005/): demo-vb served with the mateu-redwood jar.
 * YAML_URL (optional): a YAML app whose shell declares notifications/globalSearch sources and has
 *          the yaml-header page at /header (see the report of the change that added this probe).
 * PMS_URL  (optional): demo-vb-pms (NotificationsSupplier).
 *
 * Usage: cd e2e && VB_URL=… YAML_URL=… node vb-header-probe.mjs
 */
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'
import { gotoVbReady, waitForVbReady } from './vb-ready.mjs'

const VB_URL = (process.env.VB_URL || 'http://localhost:9005/').replace(/\/?$/, '/')
const YAML_URL = process.env.YAML_URL ? process.env.YAML_URL.replace(/\/?$/, '/') : ''
const PMS_URL = process.env.PMS_URL ? process.env.PMS_URL.replace(/\/?$/, '/') : ''
const results = []
const check = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`) }

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()
const requests = []
page.on('request', (r) => requests.push({ url: r.url(), body: r.postData() || '' }))

/** What the page header shows, read off the oj-sp element and the page's own extras. */
const headerState = () => page.evaluate(() => {
  const h = document.querySelector('#mateuPageHeaderEl, #mateuPageHeaderInline')
  if (!h) return null
  const title = h.querySelector('.oj-sp-header-general-overview-page-title')
  const ov = document.querySelector('.mateu-header-overline')
  const badge = h.querySelector('.oj-sp-header-general-overview-badge-text')
  return {
    title: title ? title.textContent.trim() : '',
    titleColor: title ? getComputedStyle(title).color : '',
    placeholderClass: h.classList.contains('mateu-title-placeholder'),
    overline: ov ? ov.textContent.trim() : '',
    badge: badge ? badge.textContent.trim() + '|' + badge.className : '',
    ojTimestamp: h.timestamp || '',
    ojTimestampShown: [...h.querySelectorAll('*')].some((e) => !e.children.length && /ago|updated/i.test(e.textContent)),
    // a TEXT timestamp ends the subtitle line (oj-sp's own element only takes a date)
    subtitleShown: h.innerText.includes(h.pageSubtitle || '\u0000') ? h.pageSubtitle : '',
    prev: h.previousItem && h.previousItem.display,
    next: h.nextItem && h.nextItem.display,
  }
})

/** Clicks one of oj-sp's lateral arrows (the second-to-last / last icon button of the header row). */
const clickArrow = async (which) => {
  const label = await page.evaluate((which) => {
    const h = document.querySelector('#mateuPageHeaderEl, #mateuPageHeaderInline')
    return (which === 'prev' ? h.previousItem : h.nextItem).label
  }, which)
  const btn = page.locator('#mateuPageHeaderEl, #mateuPageHeaderInline').getByRole('button', { name: label }).first()
  await btn.click()
}

/** WCAG A/AA over the page (the JET-internal navigation-list rule carved out, as vb-a11y-probe does). */
async function axeCheck(who) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const violations = r.violations
    .map((v) => ({ ...v, nodes: v.nodes.filter((n) => !(v.id === 'aria-required-children' && JSON.stringify(n.target).includes('mateuNavList'))) }))
    .filter((v) => v.nodes.length > 0)
  check(`${who}: no WCAG A/AA violations`, violations.length === 0, violations.map((v) => `${v.id} x${v.nodes.length} ${JSON.stringify(v.nodes[0].target)}`).join(', '))
}

async function headerChecks(base, route, newRoute, who) {
  await gotoVbReady(page, base + route, { texts: ['Customers'] })
  await axeCheck(who + ' (record)')
  let s = await headerState()
  check(`${who}: overline above the title`, s && s.overline === 'Customers', JSON.stringify(s && s.overline))
  check(`${who}: the first header badge is oj-sp's status badge`, !!s && /^Active\|.*oj-badge-success/.test(s.badge), s && s.badge)
  check(`${who}: the timestamp shows (oj-sp's when a date, else on the subtitle line)`, !!s && (s.ojTimestamp ? s.ojTimestampShown : /Last updated/.test(s.subtitleShown)),
    s && `oj-sp=${s.ojTimestamp} subtitle=${s.subtitleShown}`)
  check(`${who}: peer arrows — previous disabled, next on`, !!s && s.prev === 'disabled' && s.next === 'on', s && `${s.prev}/${s.next}`)
  check(`${who}: a real title is not dimmed`, !!s && !s.placeholderClass && s.titleColor === 'rgb(22, 21, 19)', s && s.titleColor)
  await clickArrow('next')
  await page.waitForURL((u) => u.pathname.endsWith(newRoute), { timeout: 20000 }).catch(() => undefined)
  await waitForVbReady(page, { texts: ['New customer'] })
  s = await headerState()
  check(`${who}: the next arrow navigates to the peer`, new URL(page.url()).pathname.endsWith(newRoute), page.url())
  check(`${who}: an empty title shows the placeholder, dimmed`, !!s && s.title === 'New customer…' && s.placeholderClass && s.titleColor !== 'rgb(22, 21, 19)',
    s && `${s.title} ${s.titleColor}`)
  await axeCheck(who + ' (placeholder title)')
  check(`${who}: on the new record previous is on, next disabled`, !!s && s.prev === 'on' && s.next === 'disabled', s && `${s.prev}/${s.next}`)
  await clickArrow('prev')
  await page.waitForURL((u) => u.pathname.endsWith(route), { timeout: 20000 }).catch(() => undefined)
  await waitForVbReady(page, { texts: ['Customers'] })
  s = await headerState()
  check(`${who}: the previous arrow comes back`, !!s && s.title !== 'New customer…' && new URL(page.url()).pathname.endsWith(route), page.url())
}

/** Opens the Ask palette (the shell's FAB) and types `text`; returns the result rows' labels. */
async function askFor(text) {
  await page.evaluate(() => {
    const shell = document.querySelector('oj-sp-simple-ui-shell, [on-oj-sp-chat-action]') || document.body
    shell.dispatchEvent(new CustomEvent('ojSpChatAction', { bubbles: true }))
  })
  let input = page.locator('#mateuAskInput input')
  if (!(await input.isVisible().catch(() => false))) {
    // the FAB at the bottom-right corner
    await page.mouse.click(1280 - 36, 900 - 36)
  }
  input = page.locator('#mateuAskInput input')
  await input.waitFor({ state: 'visible', timeout: 10000 })
  await input.fill('')
  await input.type(text, { delay: 40 })
  await page.waitForTimeout(1500)
  return page.evaluate(() => [...document.querySelectorAll('#mateuAskOracle oj-action-card')]
    .map((b) => b.textContent.replace(/\s+/g, ' ').trim()).filter((t) => t))
}

// ── Java page (demo-vb) ──────────────────────────────────────────────────────────────────────
await headerChecks(VB_URL, 'header-extras', 'header-extras/new', 'Java page')
// ── the same page in YAML, in demo-vb (inline header: the navigator drawer) ─────────────────
await headerChecks(VB_URL, 'yaml-header', 'yaml-header/new', 'YAML page (demo-vb)')

// ── Java pipeline: _globalsearch ─────────────────────────────────────────────────────────────
{
  await gotoVbReady(page, VB_URL)
  requests.length = 0
  const rows = await askFor('a')
  const asked = requests.find((r) => r.body.includes('"_globalsearch"'))
  check('Java shell: the Ask palette searches through _globalsearch', !!asked && rows.length > 0, `${rows.length} rows`)
  await page.keyboard.press('Escape')
}

if (PMS_URL) {
  requests.length = 0
  await gotoVbReady(page, PMS_URL)
  await page.locator('.mateu-bell-badge').waitFor({ timeout: 15000 }).catch(() => undefined)
  const listed = requests.some((r) => r.body.includes('"_notifications-list"'))
  const unread = await page.locator('.mateu-bell-badge').textContent().catch(() => '')
  check('Java shell: the bell lists through _notifications-list', listed && !!unread, `badge=${unread}`)
}

if (YAML_URL) {
  await headerChecks(YAML_URL, 'header', 'header/new', 'YAML page')
  // ── data-authored shell: inbox from a proxied source ─────────────────────────────────────
  // the stub API behind the YAML app keeps the read state: start from three unread
  await fetch(YAML_URL + 'stub/reset', { method: 'POST' }).catch(() => undefined)
  requests.length = 0
  await gotoVbReady(page, YAML_URL + 'home', { texts: ['YAML shell home'] })
  await page.locator('.mateu-bell-badge').waitFor({ timeout: 15000 }).catch(() => undefined)
  const badge = (await page.locator('.mateu-bell-badge').textContent().catch(() => '')).trim()
  const viaAppSource = requests.some((r) => r.body.includes('"_appsource"') && r.body.includes('"notifications"'))
  const direct = requests.some((r) => /\/stub\/inbox(\?|$)/.test(r.url))
  check('YAML shell: the bell lists the PROXIED inbox through _appsource, never the url', viaAppSource && !direct && badge === '3', `badge=${badge} direct=${direct}`)
  await page.locator('#mateuBellButton').click()
  await page.locator('#mateuBellList').waitFor({ state: 'visible', timeout: 10000 })
  const titles = await page.locator('#mateuBellList oj-list-item-layout').allTextContents()
  check('YAML shell: entries read through the source\'s field map', titles.some((t) => t.includes('Overbooking tonight') && t.includes('Room 101 is double-booked')), titles.join(' | ').slice(0, 160))
  requests.length = 0
  await page.locator('#mateuBellList oj-list-item-layout', { hasText: 'Payment received' }).click()
  await page.waitForURL((u) => u.pathname.endsWith('/header'), { timeout: 15000 }).catch(() => undefined)
  await page.waitForTimeout(1500)
  const calls = await page.evaluate((base) => fetch(base + 'stub/calls').then((r) => r.json()), YAML_URL)
  const badgeAfter = (await page.locator('.mateu-bell-badge').textContent().catch(() => '')).trim()
  check('YAML shell: opening an entry marks it read (markRead, proxied) and navigates', calls.includes('read:n2') && new URL(page.url()).pathname.endsWith('/header') && badgeAfter === '2',
    `calls=${calls.filter((c) => c.startsWith('read')).join(',')} url=${page.url()} badge=${badgeAfter}`)
  // ── palette search from a DIRECT source ──────────────────────────────────────────────────
  requests.length = 0
  const rows = await askFor('grace')
  const fetched = requests.some((r) => r.url.includes('/stub/search?q=grace'))
  check('YAML shell: the Ask palette searches the DIRECT globalSearch.source from the browser', fetched && rows.some((t) => t.includes('Grace Hopper') && t.includes('VIP · Room 204')),
    rows.join(' | ').slice(0, 200))
  await page.keyboard.press('Escape')
}

await browser.close()
const failed = results.filter((r) => !r).length
console.log(`\n${results.length - failed}/${results.length} header/shell checks passed`)
process.exit(failed ? 1 : 0)
