/**
 * Probe of LIVE UI PUSH on the VB/Redwood renderer (apps/redwood poc/agentPush.mjs), in a real
 * browser against a real backend: the header shows "Connect AI"; its dialog shows a one-time code;
 * pairing over the app's own MCP endpoint (mateu_pair_session) flips the tab to connected; a pushed
 * screen renders in the content, a drawer and a dialog; mateu_navigate navigates; a custom event
 * reaches the document; Disconnect cuts the agent off. A second tab is never touched.
 *
 *   backend: an app with mateu.mcp.enabled=true + mateu.mcp.push.enabled=true, CORS for the VB origin
 *   cd frontend/web/monorepo/apps/redwood && npm run build && npx grunt vb-serve --port=21580
 *   cd e2e && VB_URL=http://localhost:21580/ VB_BACKEND=http://localhost:21550/app \
 *     MCP_URL=http://localhost:21550/mateu/mcp NAVIGATE=/section2 NAVIGATED_TEXT="Section 2" node vb-agent-push-probe.mjs
 *
 * VB_BACKEND: the app's development backend (the mateuBaseUrl constant, http://localhost:9005) is
 * rewritten to it in the browser — a mount path included (…/app: the API hangs off it).
 * Exits non-zero if a check fails.
 */
import { chromium } from 'playwright'
import { gotoVbReady } from './vb-ready.mjs'

const VB_URL = process.env.VB_URL || 'http://localhost:9006/'
const VB_BACKEND = process.env.VB_BACKEND || ''
const DEV_BACKEND = 'http://localhost:9005'
const MCP_URL = process.env.MCP_URL || (VB_BACKEND ? new URL(VB_BACKEND).origin : DEV_BACKEND) + '/mateu/mcp'
const NAVIGATE = process.env.NAVIGATE || '/section2'
const NAVIGATED_TEXT = process.env.NAVIGATED_TEXT || ''
const results = []
const check = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`) }

let rpcId = 1
async function mcp(tool, args) {
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: rpcId++, method: 'tools/call', params: { name: tool, arguments: args } }),
  })
  const body = await res.json()
  const result = body.result || {}
  const text = (result.content && result.content[0] && result.content[0].text) || JSON.stringify(body)
  if (result.isError) return { error: text.replace(/^Error: /, '') }
  try { return JSON.parse(text) } catch { return { text } }
}

const browser = await chromium.launch({ headless: !process.argv.includes('--headed') })
const context = await browser.newContext()
const openTab = async () => {
  const page = await context.newPage()
  page.on('pageerror', (e) => console.log('  [pageerror]', e.message))
  if (VB_BACKEND) await page.route(DEV_BACKEND + '/**', (r) => r.continue({ url: r.request().url().replace(DEV_BACKEND, VB_BACKEND) }))
  await gotoVbReady(page, VB_URL)
  return page
}
const shows = async (page, text, timeout = 10000) => page.getByText(text, { exact: false }).first().waitFor({ timeout }).then(() => true, () => false)
const live = (page) => page.evaluate(() => [...document.querySelectorAll('[data-mateu-live-region]')].map((r) => r.textContent).join(' | '))
const until = async (fn, timeout = 10000) => {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) { if (await fn()) return true; await new Promise((r) => setTimeout(r, 200)) }
  return false
}

try {
  const tab = await openTab()
  const other = await openTab()

  // 1. the control
  const connect = tab.locator('#mateuAgentConnect')
  check('the header shows Connect AI', await connect.isVisible().catch(() => false))
  const name = await connect.locator('button').first().evaluate((b) => b.getAttribute('aria-label') || b.textContent.trim()).catch(() => '')
  check('…named for assistive technology', /Connect AI/.test(name), name)
  check('the paired dot is hidden while nobody is paired', !(await tab.locator('#mateuAgentIndicator').isVisible()))

  // 2. the dialog and its code
  await connect.click()
  const codeEl = tab.locator('#mateuAgentBody .mateu-agent-code span[aria-hidden="true"]')
  const gotCode = await codeEl.waitFor({ timeout: 15000 }).then(() => true, () => false)
  const code = gotCode ? (await codeEl.innerText()).trim() : ''
  check('the dialog shows a pairing code', /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code), code || await tab.locator('#mateuAgentBody').innerText().catch(() => '?'))
  check('…with the instruction', await shows(tab, 'mateu_pair_session'))
  check('…and a countdown', /Expires in [45]:\d\d/.test(await tab.locator('#mateuAgentCountdown').innerText().catch(() => '')))
  check('the code is announced', /Pairing code/.test(await live(tab)), await live(tab))

  // 3. pairing through MCP flips the tab to connected
  const paired = await mcp('mateu_pair_session', { code })
  check('mateu_pair_session pairs the tab', !!paired.session && paired.paired === true && paired.renderer === 'redwood', JSON.stringify(paired))
  check('the dialog says it is connected', await until(async () => (await tab.locator('#mateuAgentBody').getAttribute('data-mode')) === 'paired'))
  check('…listing the agent', /Connected to:/.test(await tab.locator('#mateuAgentBody').innerText()))
  check('the Disconnect button shows', await tab.locator('#mateuAgentDisconnect').isVisible())
  check('the paired dot shows, named', await tab.locator('#mateuAgentIndicator').isVisible()
    && /AI agent connected/.test(await tab.locator('#mateuAgentIndicator').getAttribute('aria-label')))
  check('the pairing is announced', /AI agent connected/.test(await live(tab)), await live(tab))
  await tab.keyboard.press('Escape')
  await tab.waitForTimeout(500)
  const session = paired.session

  // 4. pushed screens
  const content = await mcp('mateu_push_ui', { session, yaml: 'type: VerticalLayout\ncontent:\n  - type: Text\n    text: Pushed into the content\n' })
  check('push_ui (content) delivered', content.delivered === true, JSON.stringify(content).slice(0, 200))
  check('the pushed screen renders in the content', await shows(tab, 'Pushed into the content'))
  check('…and not in the other tab', !(await shows(other, 'Pushed into the content', 2500)))
  check('a pushed screen is announced', /An AI agent sent a screen/.test(await live(tab)), await live(tab))

  const drawer = await mcp('mateu_push_ui', { session, yaml: 'type: Text\ntext: A drawer from the agent\n', target: 'drawer', title: 'Agent drawer' })
  check('push_ui (drawer) delivered', drawer.delivered === true)
  check('the drawer opens with its content', await shows(tab, 'A drawer from the agent'))
  check('…and its title', await shows(tab, 'Agent drawer'))
  // Esc closes it once the popup has taken the focus (its open animation)
  await until(async () => tab.evaluate(() => { const d = document.querySelector('#mateuDrawerPanel'); return !!d && d.contains(document.activeElement) }), 5000)
  await tab.keyboard.press('Escape')
  check('Esc closes the drawer', await until(async () => tab.evaluate(() => !document.querySelector('#mateuDrawerPanel').opened), 5000))

  const dialog = await mcp('mateu_push_ui', { session, yaml: 'type: Text\ntext: A dialog from the agent\n', target: 'dialog', title: 'Agent dialog' })
  check('push_ui (dialog) delivered', dialog.delivered === true)
  check('the dialog opens with its content', await shows(tab, 'A dialog from the agent'))
  check('…and its title', await shows(tab, 'Agent dialog'))
  await until(async () => tab.evaluate(() => { const d = document.querySelector('#mateuModal'); return !!d && d.contains(document.activeElement) }), 5000)
  await tab.keyboard.press('Escape')
  check('Esc closes the dialog', await until(async () => !(await tab.getByText('A dialog from the agent').first().isVisible().catch(() => false)), 5000))

  // 5. navigation
  const urlOther = other.url()
  const nav = await mcp('mateu_navigate', { session, route: NAVIGATE })
  check('navigate delivered', nav.delivered === true, JSON.stringify(nav))
  const routeOf = (u) => { const x = new URL(u); return x.hash ? x.hash.slice(1) : x.pathname }
  check('the tab navigated to ' + NAVIGATE, await until(async () => routeOf(tab.url()) === NAVIGATE), tab.url())
  if (NAVIGATED_TEXT) check('…and shows its screen', await shows(tab, NAVIGATED_TEXT))
  check('the other tab did not move', other.url() === urlOther, other.url())

  // 6. a custom event reaches the document
  await tab.evaluate(() => { window.__agentEvents = []; document.addEventListener('highlight-row', (e) => window.__agentEvents.push(e.detail)) })
  const ev = await mcp('mateu_dispatch_event', { session, event: 'highlight-row', detail: { id: 7 } })
  check('dispatch_event delivered', ev.delivered === true)
  check('the event reached the document', await until(async () => (await tab.evaluate(() => window.__agentEvents)).some((d) => d && d.id === 7)))

  // 7. Disconnect
  await connect.click()
  await tab.locator('#mateuAgentDisconnect').waitFor({ timeout: 5000 })
  await tab.locator('#mateuAgentDisconnect').click()
  check('the dialog leaves the paired state', await until(async () => (await tab.locator('#mateuAgentBody').getAttribute('data-mode')) !== 'paired'))
  check('the paired dot goes away', await until(async () => !(await tab.locator('#mateuAgentIndicator').isVisible())))
  check('the disconnection is announced', /AI agent disconnected/.test(await live(tab)), await live(tab))
  const after = await mcp('mateu_navigate', { session, route: '/' })
  check('the agent can no longer reach the tab', !!after.error && /Unknown session/.test(after.error), JSON.stringify(after))
} catch (e) {
  check('the probe ran to the end', false, e.message.split('\n')[0])
  if (process.env.PROBE_SHOT) {
    for (const p of context.pages()) { await p.screenshot({ path: process.env.PROBE_SHOT }).catch(() => {}); break }
  }
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r).length
console.log(`\n${results.length - failed}/${results.length} checks passed`)
process.exit(failed ? 1 : 0)
