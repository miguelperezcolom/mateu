#!/usr/bin/env node
// NB1 probe: a screen an AGENT pushes is untrusted — nothing in it runs script in the tab.
//
// Against a running app (mateu.mcp.enabled=true + mateu.mcp.push.enabled=true), in a real browser:
// pair the tab over the app's own /mateu/mcp, push (content, then a drawer) a definition carrying
// every script-capable construct an Element offers — a literal onerror, an onclick, markup content
// with a handler, an `on:` event naming code, an `import` of a module on another origin, a script
// element, a javascript: link — and check that NOTHING executes (no marker on window, no request to
// the module server) while the rest of the screen renders.
//
//   MATEU_BASE_URL=http://localhost:21701 node e2e/untrusted-screen-probe.mjs [--renderer vaadin|redwood] [--route /] [--headed]
//
// Exits non-zero on any failure.

import { chromium } from 'playwright'
import { createServer } from 'node:http'

const args = process.argv.slice(2)
const opt = (name, def) => {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? args[i + 1] : def
}
const baseUrl = (process.env.MATEU_BASE_URL || opt('--base', 'http://localhost:21701')).replace(/\/+$/, '')
const route = opt('--route', '/')
const renderer = opt('--renderer', 'vaadin')
const modulePort = Number(opt('--module-port', '21749'))

let failures = 0
const check = (ok, label, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${extra ? '  — ' + extra : ''}`)
  if (!ok) failures++
}

// a module server on ANOTHER origin: an `import` the definition names must never be fetched
const moduleHits = []
const moduleServer = createServer((req, res) => {
  moduleHits.push(req.url)
  res.writeHead(200, { 'content-type': 'text/javascript', 'access-control-allow-origin': '*' })
  res.end("window.__pwned = (window.__pwned || []).concat('import')")
})
await new Promise((r) => moduleServer.listen(modulePort, '127.0.0.1', r))

let rpcId = 1
async function mcp(tool, toolArgs) {
  const res = await fetch(baseUrl + '/mateu/mcp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: rpcId++, method: 'tools/call', params: { name: tool, arguments: toolArgs } }),
  })
  const body = await res.json()
  const result = body.result ?? {}
  const text = result.content?.[0]?.text ?? JSON.stringify(body)
  if (result.isError) return { error: text.replace(/^Error: /, '') }
  try { return JSON.parse(text) } catch { return { text } }
}

const mark = (what) => `window.__pwned=(window.__pwned||[]).concat('${what}')`
const EVIL = `type: VerticalLayout
content:
  - type: Text
    text: Untrusted screen rendered
  - type: Element
    name: img
    attributes:
      src: missing-image.png
      alt: a picture
      onerror: "${mark('onerror')}"
  - type: Element
    name: div
    html: true
    content: "<img src=missing.png onerror=\\"${mark('html')}\\">markup shown as text"
  - type: Element
    name: button
    attributes:
      id: evil-button
      onclick: "${mark('onclick')}"
    on:
      click: "${mark('on-click')}"
    content: Press me
  - type: Element
    name: x-evil-widget
    attributes:
      import: "http://127.0.0.1:${modulePort}/evil.js"
  - type: Element
    name: script
    content: "${mark('script')}"
  - type: Element
    name: a
    attributes:
      id: evil-link
      href: "javascript:${mark('href')}"
    content: A link
`

const shows = async (page, text, timeout = 15000) =>
  page.getByText(text, { exact: false }).first().waitFor({ timeout }).then(() => true, () => false)

async function pair(page) {
  if (renderer === 'redwood') {
    const connect = page.locator('#mateuAgentConnect')
    await connect.waitFor({ timeout: 60000 })
    await connect.click()
    const code = page.locator('#mateuAgentBody .mateu-agent-code span[aria-hidden="true"]')
    await code.waitFor({ timeout: 15000 })
    const paired = await mcp('mateu_pair_session', { code: (await code.innerText()).trim() })
    await page.keyboard.press('Escape')
    return paired
  }
  const button = page.locator('mateu-agent-connect button.agent-button').first()
  await button.waitFor({ timeout: 30000 })
  await button.click()
  const code = page.locator('mateu-agent-connect-dialog .code')
  await code.waitFor({ timeout: 15000 })
  const paired = await mcp('mateu_pair_session', { code: (await code.innerText()).trim() })
  await page.keyboard.press('Escape')
  return paired
}

/** Clicks every element with that id, wherever it is (shadow roots included). */
const clickDeep = (page, id) => page.evaluate((id) => {
  const all = []
  const walk = (root) => {
    for (const el of root.querySelectorAll('*')) {
      if (el.id === id) all.push(el)
      if (el.shadowRoot) walk(el.shadowRoot)
    }
  }
  walk(document)
  for (const el of all) el.click()
  return all.length
}, id)

const browser = await chromium.launch({ headless: !args.includes('--headed') })
try {
  const page = await browser.newPage()
  const dialogs = []
  page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss().catch(() => {}) })
  await page.goto(baseUrl + route)
  const paired = await pair(page)
  check(!!paired.session && paired.paired === true, `the ${renderer} tab pairs`, JSON.stringify(paired).slice(0, 160))

  for (const target of ['content', 'drawer']) {
    await page.evaluate(() => { delete window.__pwned })
    const pushed = await mcp('mateu_push_ui', { session: paired.session, yaml: EVIL, target, title: 'Agent ' + target })
    check(pushed.delivered === true, `push_ui (${target}) delivered`, JSON.stringify(pushed).slice(0, 200))
    check(await shows(page, 'Untrusted screen rendered'), `${target}: the rest of the screen renders`)
    // Redwood paints Element slots on the page, not inside a drawer (a known gap of that renderer,
    // unrelated to this probe): there only "nothing executes" is checked
    const elementsPainted = !(renderer === 'redwood' && target === 'drawer')
    if (elementsPainted) check(await shows(page, 'markup shown as text'), `${target}: markup content is shown as text`)
    await page.waitForTimeout(1500)
    const clicked = await clickDeep(page, 'evil-button')
    await clickDeep(page, 'evil-link')
    if (elementsPainted) check(clicked > 0, `${target}: the button rendered (and was pressed)`)
    await page.waitForTimeout(1500)
    const pwned = await page.evaluate(() => window.__pwned ?? [])
    check(pwned.length === 0, `${target}: nothing in the agent's screen executed`, JSON.stringify(pwned))
    check(moduleHits.length === 0, `${target}: the imported module was never fetched`, JSON.stringify(moduleHits))
    if (target === 'drawer') await page.keyboard.press('Escape')
  }
  check(dialogs.length === 0, 'no alert/confirm was raised', JSON.stringify(dialogs))
} finally {
  await browser.close()
  moduleServer.close()
}
console.log(failures ? `\n${failures} check(s) FAILED` : '\nall checks passed')
process.exit(failures ? 1 : 0)
