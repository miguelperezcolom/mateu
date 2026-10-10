/**
 * 200 % zoom and forced-colours (Windows High Contrast) pass of the UX review.
 *
 *  - 200 % zoom = a 1280px window at zoom 2 = a 640 CSS-px viewport at deviceScaleFactor 2: the
 *    page must not scroll sideways (WCAG 1.4.10 Reflow) and nothing may be clipped.
 *  - forced-colors: active — the system palette replaces author colours; a control drawn only
 *    with a background (no border, no text) disappears. Screenshots for the reviewer, plus a count
 *    of buttons with neither a border nor visible text in that mode.
 *
 *   node ux/zoom-forced.mjs --base http://localhost:19701 --routes /full-crud,/wizard --out <dir> [--vb]
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { gotoVbReady } from '../vb-ready.mjs'

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : 'true'])
    return acc
}, []))
const base = args.base ?? 'http://localhost:8080'
const out = args.out ?? '.'
const routes = (args.routes ?? '/').split(',')
const isVb = args.vb === 'true'
fs.mkdirSync(out, { recursive: true })
const slug = (r) => (r === '/' ? 'root' : r.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-'))
const go = async (page, url) => {
    if (isVb) await gotoVbReady(page, url, { timeout: 40000 })
    else { await page.goto(url); await page.waitForSelector('mateu-page, mateu-app, mateu-component', { timeout: 15000 }).catch(() => {}) }
    await page.waitForTimeout(1500)
}
const browser = await chromium.launch()
const results = []
for (const route of routes) {
    const z = await browser.newContext({ viewport: { width: 640, height: 450 }, deviceScaleFactor: 2 })
    const zp = await z.newPage()
    await go(zp, base + route)
    const zoom = await zp.evaluate(() => ({ sideways: document.documentElement.scrollWidth > innerWidth + 1 }))
    await zp.screenshot({ path: path.join(out, `zoom200-${slug(route)}.jpg`), type: 'jpeg', quality: 50 })
    await z.close()
    const f = await browser.newContext({ viewport: { width: 1280, height: 900 }, forcedColors: 'active' })
    const fp = await f.newPage()
    await go(fp, base + route)
    const invisible = await fp.evaluate(() => {
        let n = 0
        const walk = (r) => {
            for (const e of r.querySelectorAll('button, [role=button], vaadin-button, oj-button')) {
                const rect = e.getBoundingClientRect()
                if (!rect.width || !rect.height) continue
                const cs = getComputedStyle(e)
                const border = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none'
                const text = (e.textContent || '').trim() || e.getAttribute('aria-label')
                const hasIcon = !!(e.querySelector('svg, vaadin-icon, img, [class*=icon]') || (e.shadowRoot && e.shadowRoot.querySelector('svg')))
                if (!border && !text && !hasIcon) n++
            }
            for (const e of r.querySelectorAll('*')) if (e.shadowRoot) walk(e.shadowRoot)
        }
        walk(document)
        return n
    })
    await fp.screenshot({ path: path.join(out, `forced-${slug(route)}.jpg`), type: 'jpeg', quality: 50 })
    await f.close()
    results.push({ route, zoom200Sideways: zoom.sideways, forcedInvisibleControls: invisible })
    console.log(`${route.padEnd(28)} zoom200 sideways=${zoom.sideways}  forced invisible controls=${invisible}`)
}
await browser.close()
fs.writeFileSync(path.join(out, 'zoom-forced.json'), JSON.stringify(results, null, 1))
