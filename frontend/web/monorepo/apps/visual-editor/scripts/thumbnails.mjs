#!/usr/bin/env node
/**
 * Regenerates the palette thumbnails: renders a sample of every catalog component with a real
 * renderer and screenshots what it paints.
 *
 *   node scripts/thumbnails.mjs --backend http://localhost:8080 [--only Grid,Card]
 *   node scripts/thumbnails.mjs --renderer redwood --backend http://localhost:8080
 *
 * `--backend` is any running Mateu app (they all answer the reserved `__preview__` action), so the
 * thumbnails show what the SERVER renders, i.e. what ships.
 *
 *  - vaadin: the harness (thumbs.html, built apart from the editor) is the editor's own canvas with
 *    the Vaadin renderer. Without `--backend` it falls back to the in-browser expander, which is
 *    close but not identical — the run says which ones fell back.
 *  - redwood: the same harness with the canvas switched to Redwood — the editor's Redwood canvas,
 *    i.e. the REAL VB app of io.mateu:mateu-redwood framed in editor-preview mode and handed the sample's
 *    `__preview__` (apps/redwood/poc/editorPreview.mjs). No VB dev server to run: the app is served
 *    from the jar's resources (MATEU_REDWOOD_STATIC overrides — rebuild them with `npm run build &&
 *    npm run copy` in apps/redwood after touching its poc/). Needs Oracle's CDN.
 *
 * Writes src/thumbnails/<renderer>/<Type>.png. A component that renders nothing visible gets no file
 * (and is listed at the end) — the palette then shows its name only.
 */
import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync, rmSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { tmpdir } from 'node:os'

const here = resolve(import.meta.dirname, '..')
const args = process.argv.slice(2)
const opt = (name, dflt) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : dflt }
const renderer = opt('renderer', 'vaadin')
const only = opt('only')?.split(',')
const backend = opt('backend')
const pwPath = opt('playwright', resolve(here, '../../../../../e2e/node_modules/playwright/index.mjs'))
const port = 5299
const outDir = join(here, 'src/thumbnails', renderer)
const dist = join(tmpdir(), 'mateu-thumbs-dist')

execFileSync('npx', ['vite', 'build', '--config', 'vite.thumbs.config.ts', '--outDir', dist, '--emptyOutDir', '--logLevel', 'warn'], { cwd: here, stdio: 'inherit' })
const server = spawn('npx', ['vite', 'preview', '--config', 'vite.thumbs.config.ts', '--outDir', dist, '--port', String(port), '--strictPort'], { cwd: here, stdio: 'ignore', detached: true, env: { ...process.env, ...(backend ? { MATEU_BACKEND: backend } : {}) } })
const stop = () => { try { process.kill(-server.pid) } catch { /* gone */ } }
process.on('exit', stop)

const VIEWPORT = { width: 800, height: 600 }
const { chromium } = await import(pwPath)
const browser = await chromium.launch()
const newPage = (viewport = VIEWPORT) => browser.newPage({ viewport, deviceScaleFactor: 1, locale: 'en-US' })

/** The union of every visible element under `roots` (shadow roots included), or null. Runs in the page. */
const MEASURE = (rootSelectorFn) => {
    const roots = rootSelectorFn()
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity
    const take = (el) => {
        const r = el.getBoundingClientRect()
        const cs = getComputedStyle(el)
        // a separator is a 1px line
        if (r.width > 1 && r.height >= 1 && cs.visibility !== 'hidden' && cs.opacity !== '0') {
            x1 = Math.min(x1, r.left); y1 = Math.min(y1, r.top); x2 = Math.max(x2, r.right); y2 = Math.max(y2, r.bottom)
        }
    }
    const visit = (el) => {
        for (const child of [...(el.shadowRoot?.children ?? []), ...el.children]) {
            if (child.tagName !== 'STYLE' && child.tagName !== 'SLOT') take(child)
            visit(child)
        }
    }
    for (const root of roots) { take(root); visit(root) }
    return x2 > x1 ? { x: x1, y: y1, width: x2 - x1, height: y2 - y1 } : null
}

async function shoot(page, box, file, maxW, maxH) {
    const pad = 8
    const x = Math.max(0, box.x - pad), y = Math.max(0, box.y - pad)
    await page.screenshot({ path: file, clip: { x, y, width: Math.min(box.width + 2 * pad, maxW - x), height: Math.min(box.height + 2 * pad, maxH - y) } })
}

// --- the harness: the catalog, the samples and (for vaadin) the canvas that paints them ---
const harness = await newPage()
const openHarness = async () => {
    for (let i = 0; ; i++) {
        try {
            await harness.goto(`http://localhost:${port}/thumbs.html`)
            break
        } catch (e) {
            if (i > 40) throw e
            await harness.waitForTimeout(250)
        }
    }
    await harness.waitForFunction(() => !!window.thumbs)
    await harness.evaluate(([r, b]) => window.thumbs.use(r, b), [renderer, !!backend])
}

// A fresh page per component in both modes: an overlay (a cookie bar, a dialog) or a renderer's
// leftover state would otherwise leak into the next thumbnail.
const vaadin = {
    async render(type, file) {
        await openHarness()
        await harness.evaluate((t) => window.thumbs.show(t), type)
        // the canvas debounces 200ms, then the renderer and its web components settle
        await harness.waitForTimeout(1500)
        // Renderers do not all stamp the node id on their element, so measure what the sample
        // PAINTED under the root layout (an overlay such as a dialog then claims the viewport,
        // which is what it looks like). The first painted element: some renderers inject a <style>.
        const box = await harness.evaluate(`(${MEASURE})(() => {
            const ux = document.getElementById('canvas')?.shadowRoot?.querySelector('mateu-ux')
            const root = ux && [...(ux.shadowRoot ?? ux).children].find((c) => c.tagName !== 'STYLE')
            return root ? [...root.children] : []
        })`)
        if (!box) return 'blank'
        await shoot(harness, box, file, VIEWPORT.width, VIEWPORT.height)
        if (backend && (await harness.evaluate(() => window.thumbs.status())) !== 'ok') return 'in-browser'
        return 'ok'
    },
}

const redwood = {
    async render(type, file) {
        await openHarness()
        await harness.evaluate((t) => window.thumbs.show(t), type)
        // the canvas frames the VB app: it boots (Oracle's CDN), is handed the sample, paints it
        await harness.waitForFunction(() => window.thumbs.redwoodRenders() > 0, null, { timeout: 90000 })
        await harness.waitForTimeout(2000)
        const iframe = await harness.waitForSelector('#canvas >> redwood-frame >> iframe')
        const frame = await iframe.contentFrame()
        const at = await iframe.boundingBox()
        // The content panel, not the (empty) page header band above it.
        // A component Redwood paints INTO the page header (an EntityHeader, a form's toolbar) leaves
        // the panel empty: then the header is its picture.
        const box = await frame.evaluate(`(${MEASURE})(() => [...document.querySelectorAll('.oj-sp-public-primary-content-container > * > *')])`)
            ?? await frame.evaluate(`(${MEASURE})(() => [...document.querySelectorAll('oj-sp-header-general-overview')])`)
        if (!box) return 'blank'
        await shoot(harness, { ...box, x: box.x + at.x, y: box.y + at.y }, file, Math.min(VIEWPORT.width, at.x + at.width), Math.min(VIEWPORT.height, at.y + at.height))
        if (backend && (await harness.evaluate(() => window.thumbs.status())) !== 'ok') return 'in-browser'
        return 'ok'
    },
}

try {
    await openHarness()
    const skipped = await harness.evaluate(() => window.thumbs.skipped())
    const types = (only ?? (await harness.evaluate(() => window.thumbs.types()))).filter((t) => !(t in skipped))
    if (!only) rmSync(outDir, { recursive: true, force: true })
    mkdirSync(outDir, { recursive: true })
    const mode = renderer === 'redwood' ? redwood : vaadin
    const blank = []
    const inBrowser = []
    for (const type of types) {
        const file = join(outDir, type + '.png')
        const outcome = await mode.render(type, file)
        if (outcome === 'blank') { blank.push(type); rmSync(file, { force: true }); continue }
        if (outcome === 'in-browser') inBrowser.push(type)
        process.stdout.write('.')
    }
    console.log(`\n${readdirSync(outDir).length} thumbnails in ${outDir}`)
    if (blank.length) console.log(`no visible render (${blank.length}): ${blank.join(', ')}`)
    if (inBrowser.length) console.log(`the backend could not render these, painted in the browser instead (${inBrowser.length}): ${inBrowser.join(', ')}`)
} finally {
    await browser.close()
    stop()
}
