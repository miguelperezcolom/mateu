// Headless live-test of the Mateu visual editor (the shared web bundle that IntelliJ/VSCode embed).
// Focus: the €0 path — `client` preview mode renders a classless definition OFFLINE via the coherence
// Phase 6 expander, with NO backend — plus the toolbar surfaces and the static "Export bundle".
//
// This does NOT drive the IDE JCEF/webview bridges (those need a real IDE GUI); it verifies the bundle.
// Usage: node visual-editor-probe.mjs [--url http://localhost:4173]
import { chromium } from '@playwright/test'
import { parseArgs } from 'node:util'

const { values } = parseArgs({ options: { url: { type: 'string', default: 'http://localhost:4173' } } })
const URL = values.url

const checks = []
const check = (name, ok, detail = '') => { checks.push({ name, ok, detail }); console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`) }

// Deep text across open shadow roots (the editor renders through nested custom elements).
const DEEP_TEXT = `(root => { const out = []; const walk = n => { if (!n) return;
  if (n.nodeType === 3) out.push(n.textContent);
  if (n.shadowRoot) walk(n.shadowRoot);
  for (const c of (n.childNodes || [])) walk(c); };
  walk(root); return out.join(' ').replace(/\\s+/g, ' '); })(document.body)`

const browser = await chromium.launch()
const page = await browser.newPage()
const netErrors = []
page.on('requestfailed', (r) => netErrors.push(r.url()))
let backendCalls = 0
page.on('request', (r) => { if (/\/mateu\/v3\//.test(r.url())) backendCalls++ })

await page.goto(URL, { waitUntil: 'domcontentloaded' })
await page.waitForSelector('mateu-visual-editor', { timeout: 20000 })
await page.waitForTimeout(800)

// 1. The toolbar carries the surfaces we shipped this session.
const buttons = await page.evaluate(() => {
    const ed = document.querySelector('mateu-visual-editor')
    return [...ed.renderRoot.querySelectorAll('.toolbar button')].map((b) => b.textContent.trim())
})
for (const label of ['Export bundle', 'Flows', 'Sync', 'AI', 'Quick Start', 'Templates']) {
    check(`toolbar has "${label}"`, buttons.some((b) => b.startsWith(label)))
}

// 2. Switch the preview source to `client` (offline render, no backend). Count backend calls that
//    happen AFTER the switch (the initial remote-mode load makes some against a non-existent backend).
const callsBeforeSwitch = backendCalls
const switched = await page.evaluate(() => {
    const ed = document.querySelector('mateu-visual-editor')
    const sel = ed.renderRoot.querySelector('.preview-source select')
    if (!sel) return false
    sel.value = 'client'
    sel.dispatchEvent(new Event('change', { bubbles: true }))
    return true
})
check('preview-source selector switches to client', switched)
await page.waitForTimeout(1800)

// 3. The CANVAS rendered the sample OFFLINE — its own deep text (not the outline's) carries the labels.
//    Scope of what the client-side expander (coherence Phase 6) paints today: layout containers
//    (VerticalLayout/HorizontalLayout/Div/Flex), Text, Buttons, Cards, Listings — all with NO backend.
//    FormLayout's packed FormField rows are a KNOWN pending expander increment (each pinned to a Java
//    golden — see expandComponent.ts CONTAINER_TYPES comment), so `Name`/`Email` are not asserted here;
//    they render in every backed mode (remote/local/mock). This check proves offline paint is real.
const canvasText = await page.evaluate(() => {
    const ed = document.querySelector('mateu-visual-editor')
    const canvas = ed.renderRoot.querySelector('editor-canvas')
    const out = []
    const walk = (n) => { if (!n) return
        if (n.nodeType === 3) out.push(n.textContent)
        if (n.shadowRoot) walk(n.shadowRoot)
        for (const c of (n.childNodes || [])) walk(c) }
    walk(canvas)
    return out.join(' ').replace(/\s+/g, ' ')
})
const wanted = ['New page', 'Save', 'Cancel']
check('client mode renders the sample offline in the canvas', wanted.every((t) => canvasText.includes(t)), `canvas shows: ${wanted.filter((t) => canvasText.includes(t)).join(', ') || '(nothing)'}`)
check('no backend sync call after switching to client', backendCalls - callsBeforeSwitch === 0, `${backendCalls - callsBeforeSwitch} call(s) after switch`)
// Informational (not a gate): the FormLayout expander increment is not shipped yet.
const fieldsRender = ['Name', 'Email'].every((t) => canvasText.includes(t))
console.log(`ℹ FormLayout offline increment ${fieldsRender ? 'SHIPPED (fields render)' : 'pending (form fields need a backend for now)'}`)

// 4. Export bundle downloads a valid specs-mode manifest.
const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 8000 }).catch(() => null),
    page.evaluate(() => {
        const ed = document.querySelector('mateu-visual-editor')
        // suppress the confirmation alert the handler shows after the download
        window.alert = () => {}
        ;[...ed.renderRoot.querySelectorAll('.toolbar button')].find((b) => b.textContent.trim().startsWith('Export bundle'))?.click()
    }),
])
let manifestOk = false, manifestDetail = 'no download'
if (download) {
    const stream = await download.createReadStream()
    const chunks = []
    for await (const c of stream) chunks.push(c)
    try {
        const m = JSON.parse(Buffer.concat(chunks).toString('utf8'))
        manifestOk = m.staticOnly === true && m.definitions && Object.keys(m.definitions).length > 0
        manifestDetail = `staticOnly=${m.staticOnly}, ${Object.keys(m.definitions || {}).length} definition(s)`
    } catch (e) { manifestDetail = 'unparseable: ' + e.message }
}
check('Export bundle downloads a valid manifest.json', manifestOk, manifestDetail)

await browser.close()
const failed = checks.filter((c) => !c.ok)
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`)
process.exit(failed.length ? 1 : 0)
