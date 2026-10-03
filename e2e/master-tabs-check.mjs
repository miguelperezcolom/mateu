// Scripted check of «Record master with page tabs» (plan P1) against demo/demo-vb, in BOTH
// renderers. Not part of the Playwright suite: the renderer-vb project is not wired (the VB shell
// does not paint headless in CI — see design/renderer-e2e-strategy.md), so this runs against a
// locally started demo-vb:
//
//   cd demo/demo-vb
//   mvn package -DskipTests -Dmateu.renderer=vaadin-lit && java -jar target/demo-vb-0.0.1-SNAPSHOT.jar --server.port=9206
//   mvn package -DskipTests -Dmateu.renderer=redwood    && java -jar target/demo-vb-0.0.1-SNAPSHOT.jar --server.port=9205
//   cd e2e && node master-tabs-check.mjs --vaadin http://localhost:9206 --redwood http://localhost:9205
//
// Either flag may be left out to check one renderer. Exits non-zero when a check fails.

import { chromium } from 'playwright'

const args = process.argv.slice(2)
const arg = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined }
const VAADIN = arg('--vaadin')
const REDWOOD = arg('--redwood')

let failed = 0
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : '  — ' + detail}`)
  if (!ok) failed++
}

/** Every text node of the page, shadow roots included. */
const textOf = (page) => page.evaluate(() => {
  const acc = []
  const walk = (n) => {
    if (!n) return
    if (n.shadowRoot) walk(n.shadowRoot)
    if (n.nodeType === 1 && ['STYLE', 'SCRIPT', 'TEMPLATE'].includes(n.tagName)) return
    for (const c of n.childNodes) {
      if (c.nodeType === 3) { const t = c.textContent.trim(); if (t) acc.push(t) } else walk(c)
    }
  }
  walk(document.body)
  return acc.join(' | ')
})

const path = (page) => new URL(page.url()).pathname

/** Waits (up to `ms`) until the page text matches `re`; returns the text. */
const waitText = async (page, re, ms = 15000) => {
  const until = Date.now() + ms
  let text = ''
  while (Date.now() < until) {
    text = await textOf(page)
    if (re.test(text)) return text
    await page.waitForTimeout(500)
  }
  return text
}

async function vaadin(base) {
  console.log(`\n── Vaadin (${base})`)
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const settle = (ms = 4000) => page.waitForTimeout(ms)
  try {
    await page.goto(base + '/customers/3/orders'); await settle(6000)
    let text = await waitText(page, /\b3-1\b/)
    check('deep link to a tab: the master renders around it', text.includes('Customer 3') && text.includes('Addresses'), text.slice(0, 300))
    check('deep link to a tab: the tab lists the master\'s records', /(^|\| )3-1( \||$)/.test(text) && !/(^|\| )4-\d+( \||$)/.test(text), text.slice(0, 300))
    check('the master\'s id is a fixed scope chip, not a removable filter',
      await page.evaluate(() => {
        const find = (root, sel) => { const hit = root.querySelector(sel); if (hit) return hit; for (const el of root.querySelectorAll('*')) if (el.shadowRoot) { const h = find(el.shadowRoot, sel); if (h) return h } return null }
        return !!find(document, '.chip-scope') && !find(document, '.chip-remove[aria-label="Remove filter Customer id"]')
      }))
    check('no path param leaks into the query string', !page.url().includes('customerId='), page.url())

    await page.locator('text=Addresses').first().click(); await settle()
    check('a tab is a URL', path(page) === '/customers/3/addresses', path(page))
    await page.goBack(); await settle()
    text = await textOf(page)
    check('back returns to the previous tab', path(page) === '/customers/3/orders' && /(^|\| )3-1( \||$)/.test(text), path(page))
    await page.goForward(); await settle()
    check('forward', path(page) === '/customers/3/addresses', path(page))
    await page.reload(); await settle(6000)
    text = await textOf(page)
    check('reload keeps the tab', path(page) === '/customers/3/addresses' && text.includes('Billing'), text.slice(0, 200))

    await page.goto(base + '/customers/4'); await settle(6000)
    text = await textOf(page)
    check('the master on its own opens its default tab', /(^|\| )4-1( \||$)/.test(text), text.slice(0, 300))
    check('a tab behind an off flag is not in the bar', !text.includes('Audit'), text.slice(0, 300))

    await page.goto(base + '/customers/3/orders'); await settle(6000)
    await page.locator('text=New').first().click(); await settle()
    check('a crud\'s New inside a tab stays under the tab (no doubled URL)', path(page) === '/customers/3/orders/new', path(page))
    await page.locator('text=Save').first().click(); await settle()
    check('the new record lands under the tab and belongs to the master', /^\/customers\/3\/orders\/3-\d+$/.test(path(page)), path(page))

    await page.goto(base + '/customers/3/orders'); await settle(6000)
    await page.locator('text=← Customers').first().click(); await settle()
    check('«← Customers» goes to the parent', path(page) === '/customers', path(page))
    await page.locator('text=Customer 5').first().click(); await settle(6000)
    check('@RowRoute: a row opens the master', path(page).startsWith('/customers/5'), path(page))
    await page.locator('text=Addresses').first().click(); await settle()
    await page.goBack(); await settle()
    text = await textOf(page)
    check('row → tab → back repaints the previous tab', path(page).startsWith('/customers/5') && !path(page).endsWith('/addresses')
      && /(^|\| )5-1( \||$)/.test(text), path(page) + ' ' + text.slice(0, 200))

    await page.goto(base + '/customers/3/history'); await settle(6000)
    text = await textOf(page)
    check('a read-only page renders its values', text.includes('Customer 3 created 2026-01-01'), text.slice(0, 300))

    await page.goto(base + '/customer-overview/3'); await settle(7000)
    text = await textOf(page)
    check('@Subresource EAGER: the tab carries the row count', /Orders\s*\|\s*\d+\s*\|\s*Billing/.test(text), text.slice(0, 400))
    await page.locator('vaadin-tab:has-text("Billing")').first().click(); await settle()
    text = await textOf(page)
    check('@Tab(key): selecting the tab pushes its URL', path(page) === '/customer-overview/3/billing', path(page))
    check('@Subresource: stacked listings with their titles and help', text.includes('Invoices issued to this customer') && text.includes('Payments'), text.slice(0, 400))
    await page.goto(base + '/customer-overview/3/billing'); await settle(7000)
    text = await textOf(page)
    check('@Tab(key): a deep link opens the tab', text.includes('Invoices issued to this customer'), text.slice(0, 300))
  } finally {
    await browser.close()
  }
}

async function redwood(base) {
  console.log(`\n── Redwood (${base}) — the VB shell boots slowly`)
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const settle = (ms = 9000) => page.waitForTimeout(ms)
  const appTab = () => page.evaluate(() => { const bar = document.querySelector('.mateu-app-level oj-tab-bar'); return bar ? bar.selection : null })
  try {
    await page.goto(base + '/customers/3/orders'); await settle(25000)
    let text = await textOf(page)
    check('deep link to a tab: the master is a level (back link + tabs), not the shell', text.includes('Customers') && text.includes('Addresses'), text.slice(0, 300))
    check('deep link to a tab: the tab lists the master\'s records', /(^|\| )3-1( \||$)/.test(text) && !/(^|\| )4-\d+( \||$)/.test(text), text.slice(0, 300))
    check('the tab bar marks the tab', await appTab() === '/customers/3/orders', String(await appTab()))
    await page.locator('.mateu-app-level oj-tab-bar li:has-text("Addresses")').first().click(); await settle()
    check('a tab is a URL', path(page) === '/customers/3/addresses', path(page))
    await page.goBack(); await settle()
    check('back returns to the previous tab', path(page) === '/customers/3/orders' && await appTab() === '/customers/3/orders', path(page))

    await page.goto(base + '/customers/4'); await settle(25000)
    text = await textOf(page)
    check('the master on its own opens its default tab', /(^|\| )4-1( \||$)/.test(text) && await appTab() === '/customers/4/orders', text.slice(0, 300))

    await page.goto(base + '/customers'); await settle(25000)
    await page.locator('td:has-text("Customer 5")').first().click(); await settle()
    check('@RowRoute: a row opens the master', path(page).startsWith('/customers/5') && await appTab() === '/customers/5/orders', path(page))
    // row → tab → back: entering from a listing row leaves the boot URL (/customers) ABOVE the
    // master's — VB used to read /customers/5 as one of its pages, drop the shell and not repaint
    await page.locator('.mateu-app-level oj-tab-bar li:has-text("Addresses")').first().click(); await settle()
    check('row → tab: the tab is a URL', path(page) === '/customers/5/addresses' && await appTab() === '/customers/5/addresses', path(page))
    await page.goBack(); await settle()
    text = await textOf(page)
    check('row → tab → back repaints the previous tab', path(page) === '/customers/5' && await appTab() === '/customers/5/orders'
      && /(^|\| )5-1( \||$)/.test(text), path(page) + ' ' + String(await appTab()) + ' ' + text.slice(0, 200))
    await page.goForward(); await settle()
    text = await textOf(page)
    check('…and forward repaints the tab again', path(page) === '/customers/5/addresses' && text.includes('Billing'), path(page))
    await page.goBack(); await settle()
    await page.locator('.mateu-app-back').first().click(); await settle()
    check('«← Customers» goes to the parent', path(page) === '/customers', path(page))

    // a read-only page: its @ReadOnly fields travel as texts
    await page.goto(base + '/customers/3/history'); await settle(25000)
    text = await textOf(page)
    check('a read-only page renders its values', text.includes('Customer 3 created 2026-01-01'), text.slice(0, 300))

    // a form page with @Tab(key) and @Subresource
    const contentTab = () => page.evaluate(() => { const bar = document.querySelector('#mateuContentTabs'); return bar ? bar.selection : null })
    await page.goto(base + '/customer-overview/3'); await settle(25000)
    text = await textOf(page)
    check('form page: the tab bar is drawn, with the EAGER count', /Details \| Orders \(\d+\) \| Billing/.test(text), text.slice(0, 400))
    await page.locator('#mateuContentTabs li:has-text("Orders")').first().click(); await settle()
    text = await textOf(page)
    check('form page: the Orders tab shows the customer\'s orders', path(page) === '/customer-overview/3/orders'
      && /(^|\| )3-1( \||$)/.test(text) && !/(^|\| )4-\d+( \||$)/.test(text), path(page) + ' ' + text.slice(0, 300))
    await page.locator('#mateuContentTabs li:has-text("Billing")').first().click(); await settle()
    text = await textOf(page)
    check('form page: @Tab(key) pushes its URL', path(page) === '/customer-overview/3/billing', path(page))
    check('form page: stacked @Subresource listings with their titles and help',
      text.includes('Invoices issued to this customer') && text.includes('F3-1') && text.includes('Payments received from this customer') && text.includes('P3-1'),
      text.slice(0, 400))
    await page.goBack(); await settle()
    check('form page: back returns to the previous tab', path(page) === '/customer-overview/3/orders', path(page))
    await page.goto(base + '/customer-overview/3/billing'); await settle(25000)
    text = await textOf(page)
    check('form page: a deep link opens the tab, bar included', await contentTab() === 'tab-2'
      && text.includes('Invoices issued to this customer') && text.includes('F3-1'), text.slice(0, 300))
  } finally {
    await browser.close()
  }
}

if (!VAADIN && !REDWOOD) {
  console.log('usage: node master-tabs-check.mjs [--vaadin <base>] [--redwood <base>]')
  process.exit(2)
}
if (VAADIN) await vaadin(VAADIN)
if (REDWOOD) await redwood(REDWOOD)
console.log(`\n${failed ? failed + ' check(s) FAILED' : 'all checks passed'}`)
process.exit(failed ? 1 : 0)
