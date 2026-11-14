/**
 * The EMBEDDED <mateu-ui> inside a REAL Visual Builder runtime — the 2701 line (visual-runtime
 * 2701.0.0-rc4.0 + rwdjet 2701.0.3-1, JET reporting 2701.0.3-1), from Oracle's public CDN, booted as a
 * VB 2701 preview page boots it, with a VB app whose page imported the component from
 * resources/components/mateu-ui-<version>/ (apps/redwood/embedded/harness/vb-host). The plain JET
 * host of vb-embedded-probe.mjs evaluates the view with JET's own bindings; this one evaluates it
 * with VB's, inside a VB page that has its OWN $application/$variables/$functions — what broke
 * 3.0-beta.68 in a real VB app («$functions is not defined», an empty listing).
 *
 * Checks: the listing paints its rows (no binding error, no module that failed to load); a click on a
 * row opens the record inside the component; a base-url typed with a trailing space works; with
 * shell="true" on a page holding only the component (VB's body does not scroll), a screen taller than
 * the window scrolls inside the component's content box, the header + menu band stay above it and
 * popups still open; Spectra's stickies are relative to that box (a GeneralOverview's title is not
 * under the band, at the top or scrolled).
 *
 * Usage (component built with `npm run build:embedded`, served with `npm run serve:embedded` in
 * apps/redwood; the backend's CORS must allow the harness origin — museums.ec1.mateu.io allows any):
 *   HOST_URL=http://localhost:9131 [BACKEND_URL=https://museums.ec1.mateu.io] [ROUTE=artworks] node vb-embedded-real-vb-probe.mjs [--shots dir]
 * Exits non-zero if a check fails.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const HOST_URL = (process.env.HOST_URL || 'http://localhost:9131').replace(/\/+$/, '')
// the trailing space is the point: the owner typed it in VB's Properties pane
const BACKEND_URL = process.env.BACKEND_URL || 'https://museums.ec1.mateu.io '
const ROUTE = process.env.ROUTE || 'artworks'
const shotsArg = process.argv.indexOf('--shots')
const shots = shotsArg > 0 ? process.argv[shotsArg + 1] : ''
if (shots) mkdirSync(shots, { recursive: true })

let failed = 0
let passed = 0
const check = (name, ok, detail = '') => {
  if (ok) passed++
  else failed++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${!ok && detail ? ' — ' + detail : ''}`)
}

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await ctx.newPage()
const errors = []
const warnings = []
const syncs = []
page.on('pageerror', (e) => errors.push(e.message + ' @ ' + String(e.stack || '').split('\n').slice(1, Number(process.env.STACK || 4)).join(' ')))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
  if (m.type() === 'warning' && /mateu-ui/.test(m.text())) warnings.push(m.text())
})
page.on('response', (r) => { if (r.url().includes('/mateu/v3/sync/')) syncs.push(`${r.status()} ${r.url()}`) })
await page.addInitScript(() => {
  window.__hostEvents = []
  for (const t of ['mateuReady', 'mateuNavigate', 'mateuTitle', 'mateuError', 'mateuAction']) {
    document.addEventListener(t, (e) => window.__hostEvents.push({ type: t, detail: e.detail }), true)
  }
})

const url = `${HOST_URL}/vb/?${new URLSearchParams({ baseUrl: BACKEND_URL, route: ROUTE })}`
await page.goto(url, { waitUntil: 'domcontentloaded' })
const ready = await page.waitForFunction(() => (window.__hostEvents || []).some((e) => e.type === 'mateuReady' || e.type === 'mateuError'), null, { timeout: 120000 }).then(() => true, () => false)
const versions = await page.evaluate(() => new Promise((resolve) => {
  window.require(['ojs/ojcore-base'], (oj) => resolve({ jet: oj.version }), () => resolve({}))
}))
console.log(`JET ${versions.jet}; ${syncs.join(', ')}`)
check('the VB host booted on JET 2701 and the component reported mateuReady', ready && /^2701\./.test(versions.jet || ''), JSON.stringify(versions))
check('the host page\'s own bindings still work ($functions/$application of the HOST)',
  await page.evaluate(() => (document.getElementById('hostHeader') || {}).textContent || '').then((t) => t.includes('(host page)')))

// the data rows of the listing (not the "No data" placeholder)
const dataRows = () => page.evaluate(() => [...document.querySelectorAll('mateu-ui oj-table tbody tr')]
  .filter((tr) => tr.querySelectorAll('td').length > 1 && !/^\s*No data\s*$/.test(tr.innerText)).length)
const rowsShown = await page.waitForFunction(() => [...document.querySelectorAll('mateu-ui oj-table tbody tr')]
  .some((tr) => tr.querySelectorAll('td').length > 1 && !/^\s*No data\s*$/.test(tr.innerText)), null, { timeout: 45000 }).then(() => true, () => false)
await page.waitForTimeout(1500)
const rowCount = await dataRows()
check(`the listing paints its rows (${rowCount})`, rowsShown && rowCount > 1)
const bindingErrors = errors.filter((e) => /Unable to process binding|is not defined|could not load the screen/.test(e))
check('no binding error ($functions/$application… is not defined)', !bindingErrors.length, bindingErrors[0])
check('every component module loaded (no oj-fa-dom-purify script error)', !warnings.some((w) => /could not be loaded/.test(w)), warnings.join(' | '))
check('the backend url was trimmed (requests go to …/mateu/v3/sync/, not "%20/mateu")', syncs.length > 0 && syncs.every((s) => !/%20|\s\/mateu/.test(s.slice(4))), syncs.join(', '))
if (shots) await page.screenshot({ path: join(shots, 'vb2701-listing.png') })

// a click on a row opens the record
const target = await page.evaluate(() => {
  const tr = [...document.querySelectorAll('mateu-ui oj-table tbody tr')]
    .find((r) => r.querySelectorAll('td').length > 1 && !/^\s*No data\s*$/.test(r.innerText) && r.getBoundingClientRect().height > 0)
  if (!tr) return null
  // a data cell, not the selection checkbox
  const td = [...tr.querySelectorAll('td')].find((c) => c.innerText.trim() && !c.querySelector('input[type=checkbox], oj-selector, oj-c-selector'))
  const r = td.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, label: td.innerText.trim().split('\n')[0] }
})
const label = target ? target.label : ''
if (target) await page.mouse.click(target.x, target.y)
const opened = await page.waitForFunction((label) => {
  const nav = (window.__hostEvents || []).some((e) => e.type === 'mateuNavigate')
  const text = (document.querySelector('mateu-ui') || {}).innerText || ''
  const listing = [...document.querySelectorAll('mateu-ui oj-table tbody tr')].some((r) => r.getBoundingClientRect().height > 0 && r.querySelectorAll('td').length > 1)
  return nav && !listing && text.includes(label.slice(0, 20))
}, label, { timeout: 30000 }).then(() => true, () => false)
await page.waitForTimeout(2000)
const route = await page.evaluate(() => ((window.__hostEvents || []).filter((e) => e.type === 'mateuNavigate').pop() || {}).detail)
check(`a click on a row ("${label}") opens the record inside the component (${JSON.stringify(route)})`, opened)
// VB's own server endpoints the static harness does not have (_currentuser) are not ours
const ours = errors.filter((e) => !/_currentuser|status of 404 \(Not Found\)|catalogRegistry/.test(e))
check('no page errors', !ours.length, ours.slice(0, 3).join(' | '))
if (shots) await page.screenshot({ path: join(shots, 'vb2701-record.png') })
check('without shell="true" the component draws no shell (the host page has its own)',
  await page.evaluate(() => !document.querySelector('mateu-ui .mateu-embedded-shell')))
await ctx.close()

// ── shell="true": the component draws the App shell — the mount's own header + menu ──────────
{
  // the owner's window: 705px of viewport, so the screen is taller than the window
  const sctx = await browser.newContext({ viewport: { width: 1512, height: 705 } })
  const spage = await sctx.newPage()
  const serrors = []
  spage.on('pageerror', (e) => serrors.push(e.message))
  spage.on('console', (m) => { if (m.type() === 'error' && !/_currentuser|status of 404 \(Not Found\)|catalogRegistry/.test(m.text())) serrors.push(m.text()) })
  await spage.addInitScript(() => {
    window.__hostEvents = []
    for (const t of ['mateuReady', 'mateuNavigate', 'mateuError']) document.addEventListener(t, (e) => window.__hostEvents.push({ type: t, detail: e.detail }), true)
  })
  // no route: the App's home, as on a VB root page holding only the component
  await spage.goto(`${HOST_URL}/vb/?${new URLSearchParams({ baseUrl: BACKEND_URL, route: '', shell: 'true' })}`, { waitUntil: 'domcontentloaded' })
  await spage.waitForFunction(() => (window.__hostEvents || []).some((e) => e.type === 'mateuReady' || e.type === 'mateuError'), null, { timeout: 120000 }).catch(() => {})
  const band = await spage.waitForFunction(() => {
    const nav = document.querySelector('mateu-ui .mateu-embedded-shell nav.mateu-subheader')
    return nav && nav.innerText.includes(document.querySelector('mateu-ui .mateu-subheader-title') ? document.querySelector('mateu-ui .mateu-subheader-title').innerText.trim() : '@@') && nav.querySelectorAll('[data-nav-item]').length > 1
  }, null, { timeout: 30000 }).then(() => true, () => false)
  const shell = await spage.evaluate(() => ({
    header: !!document.querySelector('mateu-ui .mateu-embedded-shell oj-sp-global-header'),
    logo: (document.querySelector('mateu-ui .mateu-embedded-logo') || {}).src || '',
    title: ((document.querySelector('mateu-ui .mateu-subheader-title') || {}).innerText || '').trim(),
    items: [...document.querySelectorAll('mateu-ui .mateu-subheader [data-nav-item]')].map((b) => b.innerText.trim()),
  }))
  console.log('shell:', JSON.stringify(shell))
  check(`shell="true": Spectra's global header with the app's logo, the title and the menu band (${shell.title}: ${shell.items.join(', ')})`,
    band && shell.header && /^https?:\/\//.test(shell.logo) && !!shell.title && shell.items.length > 1)
  if (shots) await spage.screenshot({ path: join(shots, 'vb2701-shell-home.png') })
  // a group of the menu opens its options; choosing one navigates INSIDE the component
  const group = spage.locator('mateu-ui .mateu-subheader oj-menu-button[data-nav-item]').first()
  const groupLabel = ((await group.innerText()) || '').trim()
  await group.click()
  const option = spage.locator('oj-menu oj-option:visible').first()
  await option.waitFor({ timeout: 10000 }).catch(() => {})
  const optionLabel = ((await option.innerText().catch(() => '')) || '').trim()
  const before = await spage.evaluate(() => (window.__hostEvents || []).filter((e) => e.type === 'mateuNavigate').length)
  await option.click().catch(() => {})
  const navigated = await spage.waitForFunction((n) => (window.__hostEvents || []).filter((e) => e.type === 'mateuNavigate').length > n, before, { timeout: 20000 }).then(() => true, () => false)
  await spage.waitForTimeout(3000)
  const after = await spage.evaluate(() => ({
    route: ((window.__hostEvents || []).filter((e) => e.type === 'mateuNavigate').pop() || {}).detail,
    active: ((document.querySelector('mateu-ui .mateu-subheader .mateu-nav-active') || {}).innerText || '').trim(),
  }))
  check(`shell="true": the menu navigates inside the component (${groupLabel} › ${optionLabel} → ${JSON.stringify(after.route)}, active: ${after.active})`,
    navigated && after.active === groupLabel)
  // the component IS the page: VB's body does not scroll (.vb-web-applayout-body), so a screen taller
  // than the window scrolls inside <mateu-ui> — in its content box, under the shell band, which does
  // not scroll — and the header + menu band stay visible
  const scrolled = await spage.evaluate(async () => {
    const component = document.querySelector('mateu-ui')
    const el = component.querySelector('.mateu-embedded-scroller')
    const before = { scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, height: Math.round(component.getBoundingClientRect().height), window: window.innerHeight }
    el.scrollTop = el.scrollHeight
    await new Promise((r) => setTimeout(r, 400))
    const header = document.querySelector('mateu-ui .mateu-embedded-shell oj-sp-global-header').getBoundingClientRect()
    const band = document.querySelector('mateu-ui .mateu-embedded-shell nav.mateu-subheader').getBoundingClientRect()
    const atHeader = document.elementFromPoint(header.left + header.width / 2, header.top + header.height / 2)
    return {
      ...before,
      scrollTop: Math.round(el.scrollTop),
      bodyOverflow: getComputedStyle(document.body).overflowY,
      headerTop: Math.round(header.top), bandTop: Math.round(band.top), bandBottom: Math.round(band.bottom),
      headerOnTop: !!atHeader && !!atHeader.closest('.mateu-embedded-shell'),
    }
  })
  console.log('scroll:', JSON.stringify(scrolled))
  check(`shell="true": a page taller than the window scrolls inside the component (${scrolled.scrollHeight}px in ${scrolled.clientHeight}px, body overflow ${scrolled.bodyOverflow}, scrolled ${scrolled.scrollTop}px)`,
    scrolled.bodyOverflow === 'hidden' && scrolled.scrollHeight > scrolled.clientHeight && scrolled.scrollTop > 0 && scrolled.height <= scrolled.window)
  check(`shell="true": scrolled down, the header and the menu band stay at the top (header at ${scrolled.headerTop}px, band ${scrolled.bandTop}–${scrolled.bandBottom}px)`,
    scrolled.headerTop >= 0 && scrolled.headerTop <= 2 && scrolled.bandBottom <= 160 && scrolled.headerOnTop)
  if (shots) await spage.screenshot({ path: join(shots, 'vb2701-shell-scrolled.png') })
  // scrolled, an overlay (the menu group's popup) still opens over the page, not clipped by the component
  await group.click()
  const popup = await spage.waitForFunction(() => {
    const opt = [...document.querySelectorAll('oj-menu oj-option')].find((o) => o.getBoundingClientRect().height > 0)
    if (!opt) return null
    const r = opt.getBoundingClientRect()
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return hit && opt.contains(hit) ? { top: Math.round(r.top), insideComponent: !!opt.closest('mateu-ui') } : null
  }, null, { timeout: 10000 }).then((h) => h.jsonValue(), () => null)
  check(`shell="true": scrolled, a popup (the menu group's) opens over the page (${JSON.stringify(popup)})`, !!popup)
  await spage.keyboard.press('Escape')

  // Spectra's stickies (page headers top: 0, section headers, table headers) are relative to the
  // CONTENT box, under the band — as in the standalone app, where the shell is outside the scroller.
  // With the band sticky inside a scrolling component, a GeneralOverview's title (Home › «Open SMK» →
  // museums/2) sat under the band at scrollTop 0.
  await spage.goto(`${HOST_URL}/vb/?${new URLSearchParams({ baseUrl: BACKEND_URL, route: '', shell: 'true' })}`, { waitUntil: 'domcontentloaded' })
  await spage.waitForFunction(() => (window.__hostEvents || []).some((e) => e.type === 'mateuReady' || e.type === 'mateuError'), null, { timeout: 120000 }).catch(() => {})
  const openSmk = spage.locator('mateu-ui .mateu-embedded-scroller').getByText('Open SMK').first()
  await openSmk.waitFor({ timeout: 30000 }).catch(() => {})
  await openSmk.scrollIntoViewIfNeeded().catch(() => {})
  const homeScrolled = await spage.evaluate(() => document.querySelector('mateu-ui .mateu-embedded-scroller').scrollTop)
  await openSmk.click().catch(() => {})
  const overview = await spage.waitForFunction(() => {
    const h = document.querySelector('mateu-ui oj-sp-header-general-overview')
    return h && h.getBoundingClientRect().height > 0 && h.innerText.trim() ? true : null
  }, null, { timeout: 30000 }).then(() => true, () => false)
  await spage.waitForTimeout(2500)
  const layoutOf = () => spage.evaluate(() => {
    const scroller = document.querySelector('mateu-ui .mateu-embedded-scroller')
    const band = document.querySelector('mateu-ui .mateu-embedded-shell').getBoundingClientRect()
    const box = scroller.getBoundingClientRect()
    const titleEl = document.querySelector('mateu-ui oj-sp-header-general-overview .oj-sp-header-general-overview-title')
      || [...document.querySelectorAll('mateu-ui oj-sp-header-general-overview [class*="title"], mateu-ui oj-sp-header-general-overview h1')]
        .find((e) => e.getBoundingClientRect().height > 0 && e.innerText.trim())
    const title = titleEl ? titleEl.getBoundingClientRect() : null
    const hit = title ? document.elementFromPoint(title.left + Math.min(20, title.width / 2), title.top + title.height / 2) : null
    const atBand = document.elementFromPoint(band.left + band.width / 2, band.bottom - 4)
    // every sticky Spectra draws, as far as it shows (the scroller clips the rest)
    const stickies = [...scroller.querySelectorAll('*')].filter((e) => getComputedStyle(e).position === 'sticky')
      .map((e) => e.getBoundingClientRect()).filter((r) => r.height > 0 && r.bottom > box.top && r.top < box.bottom)
    return {
      scrollTop: Math.round(scroller.scrollTop),
      bandBottom: Math.round(band.bottom), boxTop: Math.round(box.top),
      title: title && { text: titleEl.innerText.trim().split('\n')[0], top: Math.round(title.top), visible: !!hit && (titleEl.contains(hit) || hit.contains(titleEl)) },
      bandOnTop: !!atBand && !!atBand.closest('.mateu-embedded-shell'),
      stickies: stickies.length,
      stickyUnderBand: stickies.filter((r) => Math.max(r.top, box.top) < band.bottom - 0.5).length,
    }
  })
  const atTop = await layoutOf()
  console.log('Open SMK (home scrolled ' + Math.round(homeScrolled) + 'px):', JSON.stringify(atTop))
  check(`shell="true": Home › «Open SMK» opens the GeneralOverview at the top, its title below the band and visible (title "${atTop.title && atTop.title.text}" at ${atTop.title && atTop.title.top}px, band bottom ${atTop.bandBottom}px)`,
    overview && homeScrolled > 0 && atTop.scrollTop === 0 && atTop.boxTop >= atTop.bandBottom - 0.5
      && !!atTop.title && atTop.title.top >= atTop.bandBottom && atTop.title.visible)
  if (shots) await spage.screenshot({ path: join(shots, 'vb2701-shell-overview.png') })
  await spage.evaluate(() => { const s = document.querySelector('mateu-ui .mateu-embedded-scroller'); s.scrollTop = s.scrollHeight })
  await spage.waitForTimeout(600)
  const down = await layoutOf()
  console.log('scrolled overview:', JSON.stringify(down))
  check(`shell="true": scrolled down, the band stays on top and no Spectra sticky goes under it (scrolled ${down.scrollTop}px, ${down.stickies} stickies showing)`,
    down.scrollTop > 0 && down.bandOnTop && down.stickyUnderBand === 0 && down.boxTop >= down.bandBottom - 0.5)
  if (shots) await spage.screenshot({ path: join(shots, 'vb2701-shell-overview-scrolled.png') })
  check('shell="true": no page errors', !serrors.length, serrors.slice(0, 3).join(' | '))
  if (shots) await spage.screenshot({ path: join(shots, 'vb2701-shell-navigated.png') })
  await sctx.close()
}

await browser.close()
console.log(`\n${passed}/${passed + failed} checks OK`)
process.exit(failed ? 1 : 0)
