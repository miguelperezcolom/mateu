// Drives every "Try it" of the Explorer's Distributed UIs area in a real browser and asserts it.
// Start everything first (./run.sh), then:
//
//   node probe.mjs                 (same env vars as run.sh for the ports)
//   KNOWN_BUGS=strict node probe.mjs   fail on the checks marked as known Mateu bugs too
//
// Playwright is taken from the repo's e2e/ (cd ../../../e2e && npm ci). The version-skew check
// RESTARTS the Java remote with another MATEU_BUILD_ID (and the content-slot check runs while it is
// down) — it needs remotes/java-remote/target/explorer-java-remote-1.0-SNAPSHOT.jar.
//
// Against a deployment: EXPLORER_URL=https://explorer.mateu.io EXPLORER_JAVA_REMOTE_URL=…
// EXPLORER_STATIC_REMOTE_URL=… SKIP_REMOTE_RESTART=true node probe.mjs (no restart there).
import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
// PLAYWRIGHT_FROM: a directory whose node_modules has playwright (default: the repo's e2e/)
const require = createRequire(resolve(process.env.PLAYWRIGHT_FROM || resolve(here, '../../../e2e'), 'package.json'))
const { chromium } = require('playwright')

const port = (name, def) => process.env[name] || def
const EXPLORER = process.env.EXPLORER_URL || `http://localhost:${port('EXPLORER_PORT', 8640)}`
const JAVA = process.env.EXPLORER_JAVA_REMOTE_URL || `http://localhost:${port('JAVA_REMOTE_PORT', 8641)}`
const STATIC = process.env.EXPLORER_STATIC_REMOTE_URL || `http://localhost:${port('STATIC_REMOTE_PORT', 8643)}`
const strict = process.env.KNOWN_BUGS === 'strict'

const results = []
const check = async (name, fn, { knownBug } = {}) => {
  try {
    await fn()
    results.push({ name, ok: true })
    console.log(`  ✓ ${name}`)
  } catch (e) {
    const tolerated = knownBug && !strict
    results.push({ name, ok: tolerated, tolerated })
    console.log(`  ${tolerated ? '!' : '✗'} ${name}${knownBug ? `  [known Mateu bug: ${knownBug}]` : ''}\n      ${String(e.message).split('\n')[0]}`)
  }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg) }

const browser = await chromium.launch()
const newPage = async ({ token } = {}) => {
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 2400 } })
  if (token) await ctx.addInitScript((t) => localStorage.setItem('__mateu_auth_token', t), token)
  const page = await ctx.newPage()
  page.consoleLines = []
  page.syncAnswers = []
  page.requests = []
  page.on('console', (m) => page.consoleLines.push(m.text()))
  page.on('request', (r) => page.requests.push(r.url()))
  page.on('response', async (r) => {
    if (!r.url().includes('/mateu/v3/sync/')) return
    try { page.syncAnswers.push({ url: r.url(), status: r.status(), body: await r.text() }) } catch { /* navigated */ }
  })
  return page
}
/** The page's visible text, shadow roots and slots included. */
const textOf = (page) => page.evaluate(() => {
  const out = []
  const walk = (n) => {
    if (n.nodeType === 3) { const t = n.textContent.trim(); if (t) out.push(t); return }
    if (n.nodeType !== 1 && n.nodeType !== 11) return
    if (n.nodeType === 1 && ['STYLE', 'SCRIPT'].includes(n.tagName)) return
    if (n.shadowRoot) { walk(n.shadowRoot); return }
    if (n.tagName === 'SLOT') { n.assignedNodes().forEach(walk); return }
    n.childNodes.forEach(walk)
  }
  walk(document.body)
  const text = out.join(' | ')
  // the entry pages end with the Code tabs: the sources quote the very texts the checks look for
  const code = text.lastIndexOf(' | Code | ')
  return code > 0 ? text.slice(0, code) : text
})
const waitForText = async (page, text, timeout = 10000) => {
  const until = Date.now() + timeout
  let last = ''
  while (Date.now() < until) {
    last = await textOf(page)
    if (typeof text === 'string' ? last.includes(text) : text.test(last)) return last
    await page.waitForTimeout(250)
  }
  throw new Error(`"${text}" not on the page; it shows: ${last.slice(0, 400)}`)
}
const click = async (page, text) => {
  await page.getByText(text, { exact: true }).locator('visible=true').last().click({ timeout: 10000 })
}
const entry = (path) => `${EXPLORER}/distributed/${path}`

console.log(`Explorer ${EXPLORER} · Java remote ${JAVA} · static ${STATIC}`)

// ---------------------------------------------------------------- mounts
console.log('mounts')
await check('several mounts: /yaml-mount lands on its home and its RouteLink is mount-relative', async () => {
  const page = await newPage()
  await page.goto(`${EXPLORER}/yaml-mount`)
  await waitForText(page, 'Welcome to the YAML mount')
  await click(page, 'Go to /yaml-mount/second')
  await waitForText(page, 'The second page of the YAML mount')
})
await check('several mounts: ...and the URL it pushes is /yaml-mount/second', async () => {
  const page = await newPage()
  await page.goto(`${EXPLORER}/yaml-mount`)
  await waitForText(page, 'Welcome to the YAML mount')
  await click(page, 'Go to /yaml-mount/second')
  await waitForText(page, 'The second page of the YAML mount')
  assert(page.url().endsWith('/yaml-mount/second'), `url is ${page.url()}`)
})
await check('several mounts: the entry embeds both mounts\' welcome', async () => {
  const page = await newPage()
  await page.goto(entry('mounts/several-mounts'))
  await waitForText(page, 'Welcome to the YAML mount')
  await waitForText(page, 'Welcome to the federated console')
})
await check('ui modules: the helpdesk module (mateu.ui.modules) answers and its action runs', async () => {
  const page = await newPage()
  await page.goto(entry('mounts/ui-modules'))
  await waitForText(page, 'explorer-helpdesk-ui.jar, package com.acme.helpdesk.ui')
  await click(page, 'Close one')
  await waitForText(page, /Open tickets \| 2/)
})
await check('static bundle: served as plain files, deep link answered by the SPA fallback', async () => {
  const page = await newPage()
  await page.goto(`${STATIC}/contact`)
  await waitForText(page, 'this screen, too, ships as a static file')
  assert(!page.syncAnswers.length, 'a static bundle made a /mateu/v3/sync call')
})

// ---------------------------------------------------------------- federation
console.log('federation')
await check('remote menu: each remote is a group labelled like its RemoteMenu', async () => {
  const page = await newPage()
  await page.goto(`${EXPLORER}/fed`)
  await page.waitForLoadState('networkidle')
  const text = await waitForText(page, 'Help Center')
  for (const label of ['Inventory', 'Orders', 'Reports']) assert(text.includes(label), `no ${label} group`)
  await click(page, 'Inventory')
  await waitForText(page, 'Custom element')
})
await check('remote menu: a Java remote screen loads in the shell and its action runs on the remote', async () => {
  const page = await newPage()
  await page.goto(`${EXPLORER}/fed`)
  await page.waitForLoadState('networkidle')
  await waitForText(page, 'Inventory')
  await click(page, 'Inventory')
  await click(page, 'Stock')
  await waitForText(page, 'Madrid central')
  assert(page.url().endsWith('/fed/stock'), `url is ${page.url()}`)
  await click(page, 'Reserve one')
  await waitForText(page, /Reserved \| 1/)
  assert(page.requests.some((u) => u.startsWith(`${JAVA}/inventory/mateu/v3/sync/stock`)), 'the action did not go to the remote')
})
await check('deep link: reloading /fed/stock opens the remote screen inside the shell', async () => {
  const page = await newPage()
  await page.goto(`${EXPLORER}/fed/stock`)
  await waitForText(page, 'Madrid central')
})
await check('remote menu: a YAML-only remote screen loads in the shell', async () => {
  const page = await newPage()
  await page.goto(`${EXPLORER}/fed`)
  await page.waitForLoadState('networkidle')
  await waitForText(page, 'Orders')
  await click(page, 'Orders')
  await click(page, 'Order O-1')
  await waitForText(page, 'Order o-1')
}, { knownBug: 'a leaf without serverSideType (YAML remote) is sent with the SHELL\'s serverSideType → the remote answers 403' })
await check('static remote: the Help Center (manifest.json) renders in the shell with no sync call', async () => {
  const page = await newPage()
  await page.goto(`${EXPLORER}/fed`)
  await page.waitForLoadState('networkidle')
  await waitForText(page, 'Help Center')
  await click(page, 'Help Center')
  await click(page, 'FAQ')
  await waitForText(page, 'Frequently asked questions')
  assert(!page.syncAnswers.some((a) => a.url.startsWith(STATIC)), 'the static remote was asked for a sync')
})
await check('cross backend: the Python remote renders in the shell and its action runs in Python', async () => {
  const page = await newPage()
  await page.goto(`${EXPLORER}/fed`)
  await page.waitForLoadState('networkidle')
  await waitForText(page, 'Reports')
  await click(page, 'Reports')
  await click(page, 'Sales report')
  await waitForText(page, 'Served by')
  await click(page, 'Recompute')
  await waitForText(page, 'Recomputed by Python')
})
await check('remote element: in the console the module loads from the remote origin', async () => {
  const page = await newPage()
  await page.goto(`${EXPLORER}/fed`)
  await page.waitForLoadState('networkidle')
  await waitForText(page, 'Inventory')
  await click(page, 'Inventory')
  await click(page, 'Custom element')
  await waitForText(page, `module loaded from ${new URL(JAVA).origin}`)
})
await check('remote element: embedded from an untrusted origin, the import is dropped', async () => {
  const page = await newPage()
  await page.goto(entry('federation/remote-element-imports'))
  await waitForText(page, 'A custom element served by the remote')
  const text = await textOf(page)
  assert(!text.includes('module loaded from http'), 'the untrusted screen ran the module')
})
await check('route collisions: the renderer warns once about "about"', async () => {
  const page = await newPage()
  await page.goto(`${EXPLORER}/fed`)
  await page.waitForLoadState('networkidle')
  await waitForText(page, 'Inventory')
  await page.waitForTimeout(1500)
  const warnings = page.consoleLines.filter((l) => l.includes('route collision') && l.includes('/about'))
  assert(warnings.length === 1, `${warnings.length} warnings`)
})

// ---------------------------------------------------------------- micro frontends
console.log('micro frontends')
await check('client vs server: SERVER is in the island\'s own answer, CLIENT and the degraded ones are asked by the browser', async () => {
  const page = await newPage()
  await page.goto(entry('microfrontends/client-vs-server'))
  await waitForText(page, 'Hello from the slow remote', 8000)
  const resolved = page.syncAnswers.find((a) => a.url.startsWith(EXPLORER) && a.body.includes('"resolved"') && a.body.includes('Fast remote'))
  assert(resolved, 'no host answer carries the resolved fast remote')
  const fromBrowser = (mount) => page.requests.filter((u) => u.startsWith(`${JAVA}${mount}/mateu/v3/sync`)).length
  assert(fromBrowser('/mf-fast') === 1, `the browser asked the fast remote ${fromBrowser('/mf-fast')} times (1 = only the CLIENT one)`)
  assert(fromBrowser('/mf-slow') === 1, `the browser asked the slow remote ${fromBrowser('/mf-slow')} times (degraded → 1)`)
})
await check('client vs server: "Like" on the SERVER island goes to the remote', async () => {
  const page = await newPage()
  await page.goto(entry('microfrontends/client-vs-server'))
  await waitForText(page, 'Fast remote')
  const before = page.requests.length
  await page.getByText('Like', { exact: true }).locator('visible=true').nth(1).click()
  await page.waitForTimeout(1500)
  assert(page.requests.slice(before).some((u) => u.startsWith(`${JAVA}/mf-fast/mateu/v3/sync`)), 'the like did not go to the remote')
})
await check('embedded chrome: NONE/COMPACT/PAGE, and the window title stays the host\'s', async () => {
  const page = await newPage()
  await page.goto(entry('microfrontends/embedded-chrome'))
  await waitForText(page, 'A remote page with its own header')
  const text = await textOf(page)
  assert((text.match(/12 shipments/g) || []).length === 3, 'not three embedded pages')
  assert((text.match(/A remote page with its own header/g) || []).length === 1, 'the subtitle shows more than once (only PAGE keeps it)')
  assert(!(await page.title()).includes('Shipments'), `the remote retitled the window: ${await page.title()}`)
})
await check('fragment cache: uncached grows per load, shared stays for 30 s', async () => {
  const renderOf = (text, title) => Number(text.split(title)[1].match(/Render \| (\d+)/)[1])
  const page = await newPage()
  await page.goto(entry('microfrontends/fragment-cache'))
  let text = await waitForText(page, 'Cached per user')
  const u1 = renderOf(text, 'Never cached'), s1 = renderOf(text, 'Cached for everybody')
  await page.reload()
  text = await waitForText(page, 'Cached per user')
  const u2 = renderOf(text, 'Never cached'), s2 = renderOf(text, 'Cached for everybody')
  assert(u2 > u1, `uncached render ${u1} → ${u2}`)
  assert(s2 === s1, `shared render ${s1} → ${s2}`)
})
await check('content slots: news filled, tips fallback (answered too late)', async () => {
  const page = await newPage()
  await page.goto(entry('microfrontends/content-slots'))
  await waitForText(page, 'Fresh from the content service')
  await waitForText(page, 'this is the slot\'s fallback')
})

// ---------------------------------------------------------------- identity & versions
console.log('identity & versions')
await check('identity: forward-authorization forwards the token, none sends nothing, the app strategy its header', async () => {
  const page = await newPage({ token: 'demo-token' })
  await page.goto(entry('operations/identity-across-remotes'))
  const text = await waitForText(page, 'identity = explorer-demo-user')
  const part = (title) => text.split(title)[1].split('Asked by')[0]
  assert(part('identity = forward-authorization').includes('Bearer …oken'), 'forward-authorization did not forward')
  assert(part('identity = none').includes('Authorization: (none)'), 'none forwarded the token')
  assert(part('identity = explorer-demo-user').includes('X-Demo-User: explorer-visitor'), 'no app header')
  assert(part('identity = explorer-demo-user').includes('Authorization: (none)'), 'the app strategy forwarded the token')
})
await check('credential scope: the browser keeps the token from a remote the app does not name', async () => {
  const page = await newPage({ token: 'demo-token' })
  await page.goto(entry('operations/credential-scope'))
  const text = await waitForText(page, 'Asked by: a browser')
  assert(text.includes('Authorization: (none)'), 'the token went to an unnamed remote')
})
await check('credential scope: ...and sends it to a remote a RemoteMenu names', async () => {
  const page = await newPage({ token: 'demo-token' })
  await page.goto(`${EXPLORER}/fed`)
  await page.waitForLoadState('networkidle')
  await waitForText(page, 'Inventory')
  await click(page, 'Inventory')
  await click(page, 'Who am I?')
  await waitForText(page, 'Bearer …oken (received)')
})

// version skew + content slots with the remote down: restart the Java remote with another build id
// (a local process only: SKIP_REMOTE_RESTART=true against a deployment, e.g. explorer.mateu.io)
if (process.env.SKIP_REMOTE_RESTART !== 'true') await check('version skew: a remote restarted with another build → "This app has been updated"', async () => {
  const page = await newPage()
  await page.goto(`${EXPLORER}/fed`)
  await page.waitForLoadState('networkidle')
  await waitForText(page, 'Inventory')
  await click(page, 'Inventory')
  await click(page, 'Stock')
  await waitForText(page, 'Madrid central')
  await restartJavaRemote({ MATEU_BUILD_ID: `explorer-probe-${Date.now()}` }, async () => {
    const slots = await newPage()
    await slots.goto(entry('microfrontends/content-slots'))
    await waitForText(slots, 'No news today')
    await waitForText(slots, 'this is the slot\'s fallback')
    console.log('  ✓ content slots: with the content service down both slots paint their fallbacks')
  })
  await click(page, 'Reserve one')
  await waitForText(page, 'This app has been updated')
})

async function restartJavaRemote(env, whileDown) {
  const { execSync } = await import('node:child_process')
  try { execSync(`pkill -f explorer-java-remote-1.0-SNAPSHOT.jar`) } catch { /* not running */ }
  await new Promise((r) => setTimeout(r, 1500))
  await whileDown()
  const child = spawn(process.env.JAVA || 'java', ['-jar', resolve(here, 'java-remote/target/explorer-java-remote-1.0-SNAPSHOT.jar')], {
    env: { ...process.env, JAVA_REMOTE_PORT: new URL(JAVA).port, EXPLORER_ORIGIN: process.env.EXPLORER_ORIGIN || EXPLORER, ...env }, detached: true, stdio: 'ignore',
  })
  child.unref()
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`${JAVA}/inventory`)).ok) return } catch { /* booting */ }
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error('the Java remote did not come back')
}

await browser.close()
const failed = results.filter((r) => !r.ok)
const tolerated = results.filter((r) => r.tolerated)
console.log(`\n${results.length - failed.length}/${results.length} passed${tolerated.length ? ` (${tolerated.length} known Mateu bugs tolerated)` : ''}`)
process.exit(failed.length ? 1 : 0)
