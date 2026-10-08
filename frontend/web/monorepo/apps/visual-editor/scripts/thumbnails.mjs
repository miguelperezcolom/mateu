#!/usr/bin/env node
/**
 * Regenerates the palette thumbnails: builds the harness (thumbs.html), serves it, and screenshots
 * every catalog component as the editor's canvas paints it.
 *
 *   node scripts/thumbnails.mjs --backend http://localhost:8080 [--renderer vaadin] [--only Grid,Card] [--playwright <path>]
 *
 * `--backend` is any running Mateu app (they all answer the reserved `__preview__` action): the
 * thumbnails then show what the SERVER renders, i.e. what ships. Without it they come from the
 * in-browser expander, which is close but not identical — the run says which ones fell back.
 *
 * Writes src/thumbnails/<renderer>/<Type>.png. A component that renders nothing visible gets no file
 * (and is listed at the end) — the palette then shows its name only.
 */
import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs'
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

const { chromium } = await import(pwPath)
const browser = await chromium.launch()
try {
    const page = await browser.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1, locale: 'en-US' })
    // A fresh page per component: an overlay (a cookie bar, a dialog) or a renderer's leftover state
    // would otherwise leak into the next thumbnail.
    const open = async () => {
        for (let i = 0; ; i++) {
            try { await page.goto(`http://localhost:${port}/thumbs.html`); break } catch (e) { if (i > 40) throw e; await page.waitForTimeout(250) }
        }
        await page.waitForFunction(() => !!window.thumbs)
        await page.evaluate(([r, b]) => window.thumbs.use(r, b), [renderer, !!backend])
    }
    await open()
    const skipped = await page.evaluate(() => window.thumbs.skipped())
    const types = (only ?? (await page.evaluate(() => window.thumbs.types()))).filter((t) => !(t in skipped))
    if (!only) { rmSync(outDir, { recursive: true, force: true }) }
    mkdirSync(outDir, { recursive: true })
    const blank = []
    const inBrowser = []
    for (const type of types) {
        await open()
        await page.evaluate((t) => window.thumbs.show(t), type)
        // the canvas debounces 200ms, then the renderer and its web components settle
        await page.waitForTimeout(1500)
        // Renderers do not all stamp the node id on their element, so measure what the sample PAINTED:
        // the union of every visible element under the root layout (shadow roots included — an
        // overlay such as a dialog then claims the viewport, which is what it looks like).
        const box = await page.evaluate(() => {
            const ux = document.getElementById('canvas')?.shadowRoot?.querySelector('mateu-ux')
            // the first painted element: some renderers inject a <style> into the ux before it
            const root = ux && [...(ux.shadowRoot ?? ux).children].find((c) => c.tagName !== 'STYLE')
            if (!root) return null
            let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity
            const visit = (el) => {
                for (const child of [...(el.shadowRoot?.children ?? []), ...el.children]) {
                    if (child.tagName === 'STYLE' || child.tagName === 'SLOT') { visit(child); continue }
                    const r = child.getBoundingClientRect()
                    const cs = getComputedStyle(child)
                    // a separator is a 1px line
                    if (r.width > 1 && r.height >= 1 && cs.visibility !== 'hidden' && cs.opacity !== '0') {
                        x1 = Math.min(x1, r.left); y1 = Math.min(y1, r.top); x2 = Math.max(x2, r.right); y2 = Math.max(y2, r.bottom)
                    }
                    visit(child)
                }
            }
            for (const child of root.children) {
                const r = child.getBoundingClientRect()
                if (r.width > 1 && r.height >= 1) { x1 = Math.min(x1, r.left); y1 = Math.min(y1, r.top); x2 = Math.max(x2, r.right); y2 = Math.max(y2, r.bottom) }
                visit(child)
            }
            return x2 > x1 ? { x: x1, y: y1, width: x2 - x1, height: y2 - y1 } : null
        })
        if (backend && (await page.evaluate(() => window.thumbs.status())) !== 'ok') inBrowser.push(type)
        const file = join(outDir, type + '.png')
        if (!box || box.width < 4 || box.height < 4) { blank.push(type); rmSync(file, { force: true }); continue }
        const pad = 8
        const x = Math.max(0, box.x - pad), y = Math.max(0, box.y - pad)
        const clip = { x, y, width: Math.min(box.width + 2 * pad, 800 - x), height: Math.min(box.height + 2 * pad, 600 - y) }
        await page.screenshot({ path: file, clip })
        process.stdout.write('.')
    }
    console.log(`\n${readdirSync(outDir).length} thumbnails in ${outDir}`)
    if (blank.length) console.log(`no visible render (${blank.length}): ${blank.join(', ')}`)
    if (inBrowser.length) console.log(`the backend could not render these, painted in the browser instead (${inBrowser.length}): ${inBrowser.join(', ')}`)
} finally {
    await browser.close()
    stop()
}
