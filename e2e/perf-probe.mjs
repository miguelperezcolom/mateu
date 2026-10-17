/**
 * Render-cost probe — INFORMATIONAL, not a CI gate. Gives a baseline of what a user waits for on
 * the Vaadin renderer, measured in a real browser with performance.now():
 *
 *   1. route load   — navigation start → the page's content painted, for a few SUT routes;
 *   2. keystrokes   — per typed character on a form: mateu-component renders and the time until
 *                     the next frame (the rules/validations run on every change);
 *   3. a big grid   — the first vaadin-grid of a listing fed 500 rows: time until they are painted;
 *   4. a big form   — a form's fields cloned to 60: time to render them.
 *
 * Usage (with a SUT app running, e.g. e2e/sut/apps/mvc-app1 on :8080):
 *   cd e2e && node perf-probe.mjs
 *   BASE=http://localhost:8081 ROUTES=/,/all-types,/items RUNS=5 node perf-probe.mjs
 *
 * Prints a table (median of RUNS); exits 0 unless the app cannot be reached.
 */
import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:8080'
const ROUTES = (process.env.ROUTES ?? '/,/all-types,/validation,/items').split(',')
const FORM_ROUTE = process.env.FORM_ROUTE ?? '/all-types'
const GRID_ROUTE = process.env.GRID_ROUTE ?? '/items'
const RUNS = Number(process.env.RUNS ?? 3)

const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] }
const ms = (n) => (n == null ? '—' : `${n.toFixed(0)} ms`)
const rows = []
const report = (what, value, note = '') => { rows.push([what, value, note]); console.log(`${what.padEnd(44)} ${String(value).padStart(10)}  ${note}`) }

/** Counts mateu-component renders: wraps the element's render() once it is defined. */
const countRenders = () => {
    window.__mateuRenders = 0
    customElements.whenDefined('mateu-component').then(() => {
        const proto = customElements.get('mateu-component').prototype
        const render = proto.render
        proto.render = function (...args) { window.__mateuRenders++; return render.apply(this, args) }
    })
}

const browser = await chromium.launch()
try {
    // 1. route load
    for (const route of ROUTES) {
        const times = []
        for (let i = 0; i < RUNS; i++) {
            const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
            const t0 = Date.now()
            await page.goto(`${BASE}${route}`)
            await page.waitForSelector('mateu-page, mateu-table-crud, vaadin-grid', { timeout: 20000 }).catch(() => {})
            await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
            times.push(Date.now() - t0)
            await page.close()
        }
        report(`load ${route}`, ms(median(times)), `median of ${RUNS}`)
    }

    // 2. keystrokes on a form
    {
        const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
        await page.addInitScript(countRenders)
        await page.goto(`${BASE}${FORM_ROUTE}`)
        await page.waitForSelector('mateu-page')
        await page.waitForTimeout(800)
        const field = page.locator('vaadin-text-field input').first()
        if (await field.count()) {
            await field.click()
            const perKey = []
            const renders = []
            for (const ch of 'performance') {
                const before = await page.evaluate(() => window.__mateuRenders)
                const t0 = await page.evaluate(() => performance.now())
                await page.keyboard.type(ch)
                const t1 = await page.evaluate(async () => { await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); return performance.now() })
                perKey.push(t1 - t0)
                renders.push((await page.evaluate(() => window.__mateuRenders)) - before)
            }
            report(`keystroke on ${FORM_ROUTE}`, ms(median(perKey)), 'median, until the next frame')
            report(`mateu-component renders per keystroke`, median(renders), `per key: ${renders.join(' ')}`)
        } else {
            report(`keystroke on ${FORM_ROUTE}`, '—', 'no text field found')
        }
        await page.close()
    }

    // 3. a 500-row grid
    {
        const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
        await page.goto(`${BASE}${GRID_ROUTE}`)
        await page.waitForTimeout(1500)
        const result = await page.evaluate(async () => {
            const deepFind = (selector) => {
                const walk = (root) => {
                    const hit = root.querySelector(selector)
                    if (hit) return hit
                    for (const el of root.querySelectorAll('*')) if (el.shadowRoot) { const h = walk(el.shadowRoot); if (h) return h }
                    return null
                }
                return walk(document)
            }
            const grid = deepFind('vaadin-grid')
            if (!grid) return null
            const sample = (grid.items && grid.items[0]) || {}
            const items = Array.from({ length: 500 }, (_, i) =>
                Object.fromEntries(Object.entries(sample).map(([k, v]) => [k, typeof v === 'number' ? i : typeof v === 'string' ? `${v} ${i}` : v])))
            const t0 = performance.now()
            grid.items = items
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
            return performance.now() - t0
        })
        report(`500-row grid on ${GRID_ROUTE}`, result == null ? '—' : ms(result), result == null ? 'no vaadin-grid found' : 'items assigned → painted')
        await page.close()
    }

    // 4. a 60-field form
    {
        const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
        await page.goto(`${BASE}${FORM_ROUTE}`)
        await page.waitForSelector('mateu-page')
        await page.waitForTimeout(800)
        const result = await page.evaluate(async () => {
            const deepFind = (selector) => {
                const walk = (root) => {
                    const hit = root.querySelector(selector)
                    if (hit) return hit
                    for (const el of root.querySelectorAll('*')) if (el.shadowRoot) { const h = walk(el.shadowRoot); if (h) return h }
                    return null
                }
                return walk(document)
            }
            const field = deepFind('mateu-field')
            if (!field || !field.parentElement) return null
            const t0 = performance.now()
            const clones = []
            for (let i = 0; i < 60; i++) {
                const el = document.createElement('mateu-field')
                el.field = { ...field.field, fieldId: `${field.field?.fieldId ?? 'f'}${i}` }
                el.state = field.state; el.data = field.data
                clones.push(el)
            }
            const box = document.createElement('div')
            field.parentElement.appendChild(box)
            clones.forEach((c) => box.appendChild(c))
            await Promise.all(clones.map((c) => c.updateComplete))
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
            return performance.now() - t0
        })
        report(`60 fields rendered on ${FORM_ROUTE}`, result == null ? '—' : ms(result), result == null ? 'no mateu-field found' : 'created → painted')
        await page.close()
    }
} finally {
    await browser.close()
}
