#!/usr/bin/env node
// Live UI push on the REACT NATIVE renderer (expo web), end to end against a running backend with
// mateu.mcp.enabled=true + mateu.mcp.push.enabled=true: "Connect AI" shows, the pairing code
// appears, pairing through the backend's /mateu/mcp flips it to connected, a pushed screen shows in
// the content area and in a drawer, a pushed navigation lands, a pushed event reaches the session
// bus, and Disconnect cuts the agent off. Exits non-zero on any failure.
//
// The renderer must run in DIRECT mode against the backend (CORS allowed for the expo origin):
//   cd frontend/app/react-native && EXPO_PUBLIC_MATEU_BACKEND_PORT=21550 npx expo start --web --port 21585
//   cd e2e && MATEU_BASE_URL=http://localhost:21550 RN_URL=http://localhost:21585 node rn-agent-push-probe.mjs [--route /app]
//
// The channel is an open-ended stream, so the page never reaches "networkidle": waits are explicit.
import { chromium } from 'playwright'

const args = process.argv.slice(2)
const opt = (name, def) => {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? args[i + 1] : def
}
const baseUrl = (process.env.MATEU_BASE_URL ?? 'http://localhost:21550').replace(/\/+$/, '')
const rnUrl = (process.env.RN_URL ?? 'http://localhost:21585').replace(/\/+$/, '')
const route = opt('--route', '/app')
const navigateTo = opt('--navigate', '/app/section2')
const navigatedText = opt('--navigated-text', 'Section 2')
const agentKey = 'rn-agent-push-probe-key-0001'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let failures = 0
const check = (ok, label, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${extra ? '  — ' + extra : ''}`)
  if (!ok) failures++
}

let rpcId = 1
async function mcp(tool, toolArgs) {
  const res = await fetch(baseUrl + '/mateu/mcp', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'X-Mateu-Agent-Key': agentKey },
    body: JSON.stringify({ jsonrpc: '2.0', id: rpcId++, method: 'tools/call', params: { name: tool, arguments: toolArgs } }),
  })
  const body = await res.json()
  const result = body.result ?? {}
  const text = result.content?.[0]?.text ?? JSON.stringify(body)
  if (result.isError) return { error: text.replace(/^Error: /, '') }
  try {
    return JSON.parse(text)
  } catch {
    return { text }
  }
}

/** Polls until `fn` answers truthy (or the time runs out); answers its last value. */
async function until(fn, ms = 8000) {
  const end = Date.now() + ms
  let v
  while (Date.now() < end) {
    v = await fn()
    if (v) return v
    await sleep(250)
  }
  return v
}

const browser = await chromium.launch({ headless: !args.includes('--headed') })
const page = await browser.newPage({ viewport: { width: 420, height: 860 } })
const logs = []
page.on('console', (m) => logs.push(m.text()))
const bodyText = () => page.evaluate(() => document.body.innerText)
const hasText = async (t) => (await bodyText()).includes(t)
const pushLog = (event) => logs.find((l) => l.includes(`agent push: ${event}`))

try {
  await page.goto(`${rnUrl}/?route=${encodeURIComponent(route)}`, { waitUntil: 'load', timeout: 120000 })
  await until(() => page.locator('[aria-label^="Connect AI"], [aria-label^="AI connected"]:visible').count(), 60000)

  // ── Connect AI: a FAB on a shell with no drawer, else a drawer entry ──
  let entry = page.locator('[aria-label="Connect AI"]:visible')
  if ((await entry.count()) === 0) {
    await page.mouse.click(26, 32) // the hamburger
    await sleep(1200)
    entry = page.locator('[aria-label="Connect AI"]:visible')
  }
  check((await entry.count()) > 0, 'Connect AI is offered (AppDto.agentPush)')
  await entry.first().click()
  await sleep(500)
  check(await hasText('Get a pairing code'), 'the modal opens on "Get a pairing code"')
  await page.getByText('Get a pairing code').click()
  const code = await until(async () => (await bodyText()).match(/\b[A-Z0-9]{4}-[A-Z0-9]{4}\b/)?.[0])
  check(!!code, 'a pairing code appears', code ?? '')
  check(await hasText('mateu_pair_session'), 'with the instruction to the agent')
  check(await hasText('Expires in 5:00') || (await hasText('Expires in 4:5')), 'and its countdown')
  const codeLabel = await page.locator('[aria-label^="Pairing code "]').first().getAttribute('aria-label').catch(() => null)
  check(!!codeLabel && /Pairing code ([A-Z0-9] ){3}[A-Z0-9], /.test(codeLabel), 'the code is labelled one character at a time', codeLabel ?? '')
  check((await page.locator('[aria-modal="true"]').count()) > 0, 'the pairing dialog is modal for assistive tech')

  // ── pair through the backend's own MCP endpoint ──
  const paired = await mcp('mateu_pair_session', { code: code?.toLowerCase().replace('-', '') ?? '' })
  check(paired.paired === true && !!paired.session, 'mateu_pair_session pairs (case-insensitive, no dash)', JSON.stringify(paired))
  check(paired.renderer === 'react-native', 'the session registered as react-native', paired.renderer)
  const session = paired.session
  check(await until(() => hasText('Connected to')), 'the modal flips to connected')
  check(await hasText('Disconnect'), 'with Disconnect')
  await page.getByText('Close', { exact: true }).click()
  await sleep(500)

  // ── a pushed screen, in the content area ──
  const contentPush = await mcp('mateu_push_ui', { session, yaml: 'type: Text\ntext: Hello from the RN probe\n' })
  check(contentPush.delivered === true, 'mateu_push_ui (content) is delivered', JSON.stringify(contentPush).slice(0, 200))
  check(await until(() => hasText('Hello from the RN probe')), 'the pushed screen shows in the content area')
  check(!!pushLog('render-screen → rendered'), 'through the shared render-screen path (no subscriber → __preview__)')

  // ── a pushed screen, in a drawer ──
  const drawerPush = await mcp('mateu_push_ui', { session, yaml: 'type: Text\ntext: Drawer from the RN probe\n', target: 'drawer', title: 'Probe drawer' })
  check(drawerPush.delivered === true, 'mateu_push_ui (drawer) is delivered')
  check(await until(() => hasText('Drawer from the RN probe')), 'the pushed screen shows in a drawer')
  check(await hasText('Probe drawer'), 'with its title')
  const closeDrawer = page.locator('[aria-label="Close Probe drawer"]')
  check((await closeDrawer.count()) > 0, 'the drawer\'s close button is a named control')
  await closeDrawer.first().click()
  check(await until(async () => !(await hasText('Drawer from the RN probe'))), 'and it closes the drawer')

  // ── a pushed navigation ──
  const nav = await mcp('mateu_navigate', { session, route: navigateTo })
  check(nav.delivered === true, 'mateu_navigate is delivered')
  check(!!(await until(() => pushLog('navigation-requested → navigated'))), 'the navigation is applied like a menu click')
  check(
    await until(async () => !(await hasText('Hello from the RN probe')) && (await page.getByRole('heading', { name: navigatedText }).count()) > 0),
    `the app shows ${navigateTo} (its "${navigatedText}" heading)`,
  )
  if (process.env.RN_SHOTS) await page.screenshot({ path: `${process.env.RN_SHOTS}/after-navigate.png` })

  // ── a pushed event, onto the session bus ──
  const ev = await mcp('mateu_dispatch_event', { session, event: 'highlight-row', detail: { id: 7 } })
  check(ev.delivered === true, 'mateu_dispatch_event is delivered')
  check(!!(await until(() => pushLog('highlight-row → dispatched'))), 'the event reaches the session event bus')

  // ── Disconnect ──
  const connected = page.locator('[aria-label^="AI connected"]:visible')
  if ((await connected.count()) === 0) {
    await page.mouse.click(26, 32)
    await sleep(1200)
  }
  // a TABS shell keeps every visited tab mounted (each with its own floating button): the live
  // tab's is the one on top, i.e. the last one in the document
  await page.locator('[aria-label^="AI connected"]:visible').last().click({ timeout: 10000 })
  await sleep(500)
  await page.getByText('Disconnect', { exact: true }).click({ timeout: 10000 })
  check(await until(() => hasText('Get a pairing code')), 'Disconnect returns the modal to "Get a pairing code"')
  const after = await mcp('mateu_push_ui', { session, yaml: 'type: Text\ntext: Should not arrive\n' })
  check(!!after.error, 'the agent can no longer reach the session', after.error ?? JSON.stringify(after))
  await page.getByText('Close', { exact: true }).click()
  check(await until(() => page.locator('[aria-label="Connect AI"]:visible').count()), 'the entry is back to "Connect AI"')
} catch (e) {
  check(false, "the probe ran to the end", e.message.split("\n").slice(0, 12).join(" | "))
} finally {
  if (failures) {
    console.log('--- last console lines ---')
    console.log(logs.filter((l) => l.includes('agent') || l.includes('rror')).slice(-15).join('\n'))
    await page.screenshot({ path: 'rn-agent-push-probe-failure.png' }).catch(() => {})
  }
  await browser.close()
}
console.log(failures ? `${failures} check(s) failed` : 'all checks passed')
process.exit(failures ? 1 : 0)
