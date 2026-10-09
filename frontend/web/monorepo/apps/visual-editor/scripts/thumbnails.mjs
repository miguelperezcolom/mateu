#!/usr/bin/env node
/**
 * Regenerates the palette thumbnails: renders a sample of every catalog component with a real
 * renderer and screenshots what it paints.
 *
 *   node scripts/thumbnails.mjs --backend http://localhost:8080 [--only Grid,Card]
 *   node scripts/thumbnails.mjs --renderer redwood --backend http://localhost:8080 --vb http://localhost:9006
 *
 * `--backend` is any running Mateu app (they all answer the reserved `__preview__` action), so the
 * thumbnails show what the SERVER renders, i.e. what ships.
 *
 *  - vaadin: the harness (thumbs.html, built apart from the editor) is the editor's own canvas with
 *    the Vaadin renderer. Without `--backend` it falls back to the in-browser expander, which is
 *    close but not identical — the run says which ones fell back.
 *  - redwood: the VB app itself (`npm run serve` in apps/redwood, `--vb`), its calls to /mateu
 *    intercepted: the shell gets a one-route App and the route answers the sample's `__preview__`,
 *    so the components come out as the Redwood renderer really paints them — and a component the
 *    renderer does not paint comes out as nothing, i.e. gets no thumbnail.
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
const vb = opt('vb', 'http://localhost:9006')
const pwPath = opt('playwright', resolve(here, '../../../../../e2e/node_modules/playwright/index.mjs'))
const port = 5299
const outDir = join(here, 'src/thumbnails', renderer)
const dist = join(tmpdir(), 'mateu-thumbs-dist')
if (renderer === 'redwood' && !backend) throw new Error('--renderer redwood needs --backend (the VB app has no in-browser render)')

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
    if (renderer === 'vaadin') await harness.evaluate((b) => window.thumbs.use('vaadin', b), !!backend)
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

const redwood = (() => {
    const page = newPage()
    let yaml = ''
    // A one-route app: the shell's load gets it, the route's load gets the sample.
    const app = {
        commands: [], messages: [],
        fragments: [{ targetComponentId: 'shell', action: 'Replace', component: { type: 'ClientSide', id: 'app', children: [], metadata: {
            type: 'App', route: '', variant: 'MENU_ON_TOP', layout: 'SINGLE_SLOT', title: 'Mateu', homeRoute: '/thumb',
            menu: [{ label: ' ', path: '/thumb', route: '/thumb', consumedRoute: '', serverSideType: 'thumb', submenus: [], visible: true }],
            apps: [], fabs: [], contextSelectors: [], contextActions: [],
        } } }],
    }
    const ready = page.then(async (p) => {
        await p.route('**/mateu/v3/**', async (route) => {
            const rq = JSON.parse(route.request().postData() || '{}')
            if (rq.initiatorComponentId === 'shell' && !rq.route) {
                return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(app) })
            }
            const res = await fetch(backend.replace(/\/$/, '') + '/mateu/v3/sync/_no_route', {
                method: 'POST', headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ actionId: '__preview__', componentState: {}, initiatorComponentId: rq.initiatorComponentId || '', parameters: { _yaml: yaml } }),
            })
            const increment = await res.json()
            // A route's content arrives as a server-side component wrapping the tree, as a real one does.
            for (const f of increment.fragments ?? []) {
                f.component = { type: 'ServerSide', id: 'thumb', serverSideType: 'thumb', route: rq.route, actions: [], triggers: [], rules: [], children: [f.component], initialData: {} }
            }
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(increment) })
        })
        return p
    })
    return {
        async render(type, file) {
            const p = await ready
            yaml = await harness.evaluate((t) => window.thumbs.sampleYaml(t), type)
            await p.goto(vb)
            await p.waitForSelector('.oj-sp-public-primary-content-container', { timeout: 8000 }).catch(() => {})
            await p.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
            await p.waitForTimeout(1500)
            // The content panel, not the page header above it (the route's title, the same for all).
            const box = await p.evaluate(`(${MEASURE})(() => [...document.querySelectorAll('.oj-sp-public-primary-content-container > * > *')])`)
            if (!box) return 'blank'
            await shoot(p, box, file, VIEWPORT.width, VIEWPORT.height)
            return 'ok'
        },
    }
})()

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
