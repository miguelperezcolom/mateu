/**
 * Probe: a Mateu app USING a third-party Mateu UI (EventConductor's workflow console is the worked
 * example) — federated through RemoteMenu and/or mounted in-process with mateu.ui.modules.
 *
 *   node external-ui-probe.mjs                       # the demo/demo-eventconductor defaults
 *   SHELLS=http://localhost:8621,http://localhost:8622 \
 *   CONSOLE=http://localhost:8620 INPROCESS=http://localhost:8620 node external-ui-probe.mjs
 *
 * SHELLS     comma-separated federated shells (a Java @UI shell, a YAML AppShell…). Each must have
 *            a menu section labelled $SECTION ("Workflow") that is a RemoteMenu on $CONSOLE.
 * CONSOLE    origin of the console the shells compose (the remote service). Only used to check
 *            that the screens really came from it, cross-origin.
 * ISLAND     a page of a shell that embeds a console screen as a remote island (MicroFrontend),
 *            default "http://localhost:8621/embedded"; "" skips it.
 * INPROCESS  an app that mounts the console's UI module in-process ("" to skip).
 * MOUNT      the console's own mount path, checked in-process (default "/_workflow").
 * SECTION    the menu label of the console's section (default "Workflow").
 * SCREEN     an entry of that section to open (default "Processes").
 * EXPECT     a text the screen shows once its data has loaded (default: a regex matching the
 *            demo's workflows, "Slow saga|Hello World").
 * RECORD     a regex matching a link in the screen that opens a record (default "^…-", the
 *            console's shortened process ids); "" skips the record checks.
 * ELEMENT    a custom element the record's screen loads from its OWN server through an Element
 *            `import` (default "eventconductor-workflow-graph", the process diagram); "" skips it.
 * SHOTS      directory for screenshots (default: none).
 *
 * Exits non-zero when any check fails. Checks per federated shell:
 *   1. the shell boots and its menu shows the remote section (descriptor fetched server to server);
 *   2. opening the remote screen from the menu loads it FROM THE CONSOLE (cross-origin, CORS ok)
 *      and its data renders;
 *   3. the browser's Bearer token travels to the console on those calls (auth propagation);
 *   4. the URL that screen ended on works as a deep link (fresh page load);
 *   5. no wire-version mismatch is reported and every console response says which wire it speaks;
 *   6. a record opens from the screen, and its custom element (loaded from the console's origin,
 *      not the shell's) gets defined.
 * And for the in-process app: the console's screens render inside the app's own shell, and the
 * console's own mount answers too.
 */
import { chromium } from '@playwright/test'

const env = (k, d) => (process.env[k] === undefined ? d : process.env[k])
const SHELLS = env('SHELLS', 'http://localhost:8621,http://localhost:8622').split(',').map((s) => s.trim()).filter(Boolean)
const CONSOLE = env('CONSOLE', 'http://localhost:8620')
const ISLAND = env('ISLAND', 'http://localhost:8621/embedded')
const INPROCESS = env('INPROCESS', 'http://localhost:8620')
const MOUNT = env('MOUNT', '/_workflow')
const SECTION = env('SECTION', 'Workflow')
const SCREEN = env('SCREEN', 'Processes')
const EXPECT = new RegExp(env('EXPECT', 'Slow saga|Hello World'))
const RECORD = env('RECORD', '^…-')
const ELEMENT = env('ELEMENT', 'eventconductor-workflow-graph')
const SHOTS = env('SHOTS', '')
const TOKEN = 'external-ui-probe-token'

let failures = 0
const check = (ok, what, detail = '') => {
  console.log(`${ok ? '  ok  ' : '  FAIL'} ${what}${detail ? ' — ' + detail : ''}`)
  if (!ok) failures++
}

/** Every text node, through open shadow roots (the screens are web components). */
const deepText = (page) => page.evaluate(() => {
  const walk = (n) => {
    let s = ''
    if (n.shadowRoot) s += walk(n.shadowRoot)
    for (const c of n.childNodes) {
      if (c.nodeType === 3) s += c.textContent.trim() ? c.textContent.trim() + ' | ' : ''
      else if (c.nodeType === 1 && !['SCRIPT', 'STYLE'].includes(c.tagName)) s += walk(c)
    }
    return s
  }
  return walk(document.body)
})

const waitForText = async (page, re, ms = 15000) => {
  const until = Date.now() + ms
  while (Date.now() < until) {
    if (re.test(await deepText(page))) return true
    await page.waitForTimeout(250)
  }
  return false
}

const shot = async (page, name) => {
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png` })
}

const newPage = async (browser) => {
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } })
  // the token the bootstrap (an OIDC adapter, a login page…) would leave for Mateu to send
  await context.addInitScript((t) => localStorage.setItem('__mateu_auth_token', t), TOKEN)
  const page = await context.newPage()
  const log = { consoleCalls: [], errors: [], wire: new Set() }
  page.on('console', (m) => {
    if (m.type() === 'error') log.errors.push(m.text())
  })
  page.on('request', (r) => {
    if (r.url().startsWith(CONSOLE) && r.url().includes('/mateu/') && r.method() === 'POST') {
      log.consoleCalls.push({ url: r.url(), auth: r.headers()['authorization'] })
    }
  })
  page.on('response', async (r) => {
    if (!r.url().includes('/mateu/v3/') || r.request().method() !== 'POST') return
    try {
      const body = await r.json()
      log.wire.add(`${new URL(r.url()).origin} → ${body.wireVersion ?? '(none)'}`)
    } catch {
      // streamed (SSE) or not JSON
    }
  })
  return { page, log }
}

const browser = await chromium.launch()

async function probeShell(shell) {
  const { page, log } = await newPage(browser)
  await page.goto(shell)
  const sectionShown = await waitForText(page, new RegExp(`\\b${SECTION}\\b`))
  check(sectionShown, `the menu shows the "${SECTION}" section`)

  // the remote's entries join the menu when the browser's own ask of the console answers (a cold
  // console can take a while), and they are drawn when the section opens: open it until they show
  let entryShown = false
  for (let attempt = 0; attempt < 10 && !entryShown; attempt++) {
    await page.getByText(SECTION, { exact: true }).first().click()
    entryShown = await waitForText(page, new RegExp(`\\b${SCREEN}\\b`), 3000)
    if (!entryShown) await page.keyboard.press('Escape')
  }
  check(entryShown, `the remote section merged its menu ("${SCREEN}" is there)`)
  await page.getByText(SCREEN, { exact: true }).first().click({ timeout: 10000 })
  const loaded = await waitForText(page, EXPECT)
  await shot(page, `federated-${new URL(shell).port}-screen`)
  check(loaded, `"${SCREEN}" renders the console's data`, loaded ? '' : (await deepText(page)).slice(0, 300))
  const fromConsole = log.consoleCalls.filter((c) => !c.url.endsWith('/_no_route'))
  check(fromConsole.length > 0, 'the screen was loaded from the console, cross-origin', fromConsole[0]?.url ?? 'no call reached the console')
  const corsErrors = log.errors.filter((e) => /CORS|Access-Control/i.test(e))
  check(corsErrors.length === 0, 'no CORS error', corsErrors[0] ?? '')
  check(
    log.consoleCalls.length > 0 && log.consoleCalls.every((c) => c.auth === `Bearer ${TOKEN}`),
    'every call to the console carries the browser\'s Bearer token',
    log.consoleCalls.find((c) => c.auth !== `Bearer ${TOKEN}`)?.url ?? '',
  )

  const deepLink = page.url()
  const { page: fresh, log: freshLog } = await newPage(browser)
  await fresh.goto(deepLink)
  const deepLoaded = await waitForText(fresh, EXPECT)
  await shot(fresh, `federated-${new URL(shell).port}-deeplink`)
  check(deepLoaded, `deep link ${new URL(deepLink).pathname} renders the remote screen`, deepLoaded ? '' : (await deepText(fresh)).slice(0, 300))

  if (RECORD) {
    await fresh.getByText(new RegExp(RECORD)).first().click({ timeout: 10000 })
    const listPath = new URL(deepLink).pathname
    const opened = await fresh.waitForURL((u) => u.pathname !== listPath, { timeout: 10000 }).then(() => true, () => false)
    check(opened, 'a record opens from the remote screen', fresh.url())
    if (ELEMENT) {
      const defined = await fresh.waitForFunction((tag) => !!customElements.get(tag), ELEMENT, { timeout: 10000 }).then(() => true, () => false)
      await fresh.waitForTimeout(1000)
      await shot(fresh, `federated-${new URL(shell).port}-record`)
      const notFound = freshLog.errors.filter((e) => /404|Failed to fetch dynamically imported module|CORS/i.test(e))
      check(defined, `the record's <${ELEMENT}> is defined (its module came from the console)`, defined ? '' : notFound[0] ?? '')
    }
  }

  const allText = (await deepText(page)) + (await deepText(fresh))
  check(!/speaks Mateu wire|habla el protocolo Mateu/.test(allText), 'no wire-version mismatch reported')
  console.log(`        wire versions seen: ${[...log.wire, ...freshLog.wire].filter((v, i, a) => a.indexOf(v) === i).join(', ')}`)
  await page.context().close()
  await fresh.context().close()
}

async function probeIsland() {
  const { page, log } = await newPage(browser)
  await page.goto(ISLAND)
  const loaded = await waitForText(page, EXPECT)
  await shot(page, 'island')
  check(loaded, 'the embedded console screen renders inside the page', loaded ? '' : (await deepText(page)).slice(0, 300))
  const fromConsole = log.consoleCalls.filter((c) => !c.url.endsWith('/_no_route'))
  check(fromConsole.length > 0 && fromConsole.every((c) => c.auth === `Bearer ${TOKEN}`),
    'the island was loaded from the console, with the browser\'s token', fromConsole[0]?.url ?? 'no call reached the console')
  await page.context().close()
}

async function probeInProcess() {
  const { page } = await newPage(browser)
  await page.goto(INPROCESS)
  check(await waitForText(page, new RegExp(`\\b${SECTION}\\b`)), `the app's own menu shows "${SECTION}"`)
  await page.getByText(SECTION, { exact: true }).first().click()
  await page.getByText(SCREEN, { exact: true }).first().click({ timeout: 10000 })
  const loaded = await waitForText(page, EXPECT)
  await shot(page, 'inprocess-screen')
  check(loaded, `"${SCREEN}" renders inside the app's shell`, loaded ? '' : (await deepText(page)).slice(0, 300))
  const wrong = /Something went wrong|Page not found/.test(await deepText(page))
  check(!wrong, 'no error page')
  const res = await page.request.post(`${INPROCESS}${MOUNT}/mateu/v3/sync/_no_route`, {
    data: { route: '', consumedRoute: '_empty', actionId: '', componentState: {}, parameters: {}, appState: {} },
  })
  check(res.status() === 200, `the console's own mount (${MOUNT}) answers in-process`, `HTTP ${res.status()}`)
  await page.context().close()
}

for (const shell of SHELLS) {
  console.log(`\nFederated shell ${shell} → console ${CONSOLE}`)
  await probeShell(shell).catch((e) => check(false, 'the probe could not go on', e.message.split('\n')[0]))
}
if (ISLAND) {
  console.log(`\nRemote island ${ISLAND} → console ${CONSOLE}`)
  await probeIsland().catch((e) => check(false, 'the probe could not go on', e.message.split('\n')[0]))
}
if (INPROCESS) {
  console.log(`\nIn-process ${INPROCESS}`)
  await probeInProcess().catch((e) => check(false, 'the probe could not go on', e.message.split('\n')[0]))
}

await browser.close()
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed')
process.exit(failures ? 1 : 0)
