/**
 * Theming-isolation probe — proves an embedded Mateu app does NOT inherit a foreign host page's
 * design tokens, and that its own scoped dark palette tracks the document theme.
 *
 * Shadow DOM does not isolate CSS custom properties (they inherit across the boundary), so a host
 * that declares `--lumo-*` on its `:root` would repaint every embedded component. The firewall is
 * proximity: the Vaadin renderer (lumo.js) re-emits Lumo's root token blocks scoped to the
 * `<mateu-ui>`/`<mateu-ux>` container, a CLOSER ancestor than the host `:root`; and `mateu-ui`
 * mirrors the document `theme` attribute (libs/mateu themeScope) so the scoped dark palette follows.
 *
 * This is backend-free: it loads only the built Vaadin bundle (which runs lumo.js on import), drops
 * a rogue `:root` token next to a plain control element and a `<mateu-ui>`, and compares the token
 * each one resolves. It serves the assets copied to demo/sites/vaadin by `yarn copy`.
 *
 *   cd e2e && node theming-isolation-probe.mjs
 *
 * Exits non-zero on any failure, so it gates changes to the theming layer.
 */
import { chromium } from 'playwright'
import http from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'

const ROOT = resolve(process.env.SITE ?? '../demo/sites/vaadin')
const MIME = { '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' }

const PAGE = `<!doctype html><html><head><meta charset="utf-8">
<style>
  /* A hostile host: rogue tokens on :root, exactly what an embedding page might carry. */
  :root { --lumo-primary-color: rgb(255, 0, 0); --lumo-base-color: rgb(255, 0, 0); }
</style>
<script type="module" src="/assets/mateu-vaadin.js"></script>
</head><body>
  <div id="control">a plain element under the host :root</div>
  <mateu-ui id="app" baseUrl="http://127.0.0.1:1"></mateu-ui>
</body></html>`

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0]
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'content-type': 'text/html' }); res.end(PAGE); return
  }
  const file = join(ROOT, url)
  if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404); res.end('not found'); return }
  res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' })
  res.end(readFileSync(file))
})
await new Promise((r) => server.listen(0, r))
const port = server.address().port
const base = `http://127.0.0.1:${port}`

const results = []
const check = (name, pass, detail = '') => {
  results.push({ name, pass }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(base, { waitUntil: 'load' })
  // The scoped baseline is injected on module import; wait for it (backend errors are irrelevant).
  await page.waitForFunction(() => !!document.querySelector('style[data-mateu-theme-scope]'), { timeout: 15000 })

  const read = (sel, prop) =>
    page.evaluate(([s, p]) => getComputedStyle(document.querySelector(s)).getPropertyValue(p).trim(), [sel, prop])

  // 1. The host token really reaches a plain element — proves the test is not vacuous.
  const controlPrimary = await read('#control', '--lumo-primary-color')
  check('host :root token reaches a plain element (control)', /255,\s*0,\s*0/.test(controlPrimary), controlPrimary)

  // 2. It does NOT reach inside the Mateu container — the firewall held.
  const appPrimary = await read('#app', '--lumo-primary-color')
  const isolated = !/255,\s*0,\s*0/.test(appPrimary) && /006af5|0c6ce9/i.test(appPrimary)
  check('host token does NOT leak into <mateu-ui> (Lumo baseline wins)', isolated, appPrimary)

  const appBaseLight = await read('#app', '--lumo-base-color')
  check('<mateu-ui> keeps its own base color, not the host red', !/255,\s*0,\s*0/.test(appBaseLight), appBaseLight)

  // 3. Dark mode mirrored onto the container switches the SCOPED palette.
  await page.evaluate(() => document.documentElement.setAttribute('theme', 'dark'))
  await page.waitForFunction(() => document.getElementById('app')?.getAttribute('theme') === 'dark', { timeout: 5000 })
  const appBaseDark = await read('#app', '--lumo-base-color')
  check('theme mirror switches the scoped dark palette on <mateu-ui>', /233348|#233348/i.test(appBaseDark), appBaseDark)

  check('no uncaught page errors from the bundle', errors.length === 0, errors[0] ?? '')
  await page.close()
} finally {
  await browser.close()
  server.close()
}

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
