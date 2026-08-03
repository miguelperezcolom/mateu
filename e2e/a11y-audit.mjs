/**
 * Accessibility audit — runs axe-core over a set of representative Mateu routes and reports
 * violations grouped by rule, so the framework's OWN output is measured rather than guessed at.
 *
 * Usage (with a SUT app running):
 *   cd e2e && node a11y-audit.mjs
 *   BASE=http://localhost:8080 node a11y-audit.mjs
 */
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'

const BASE = process.env.BASE ?? 'http://localhost:8080'
const ROUTES = (process.env.ROUTES ?? [
    '/',              // plain form
    '/all-types',     // every field kind
    '/validation',    // required fields + errors
    '/app',           // app shell with menu
    '/items',         // crud listing
    '/tabs',          // tab layout
    '/sections',      // sections
    '/accordion',     // disclosure
].join(',')).split(',')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await context.newPage()

const byRule = new Map()
let total = 0

for (const route of ROUTES) {
    try {
        await page.goto(BASE + route, { waitUntil: 'domcontentloaded' })
        await page.waitForSelector('mateu-page, mateu-app, vaadin-grid', { timeout: 10000 }).catch(() => {})
        await sleep(1500)
        const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze()
        for (const v of results.violations) {
            // Same upstream carve-out as the spec: vaadin-tabs puts a <div tabindex> inside its
            // own role="tablist" shadow root, which nothing here can change.
            if (v.id === 'aria-required-children'
                && v.nodes.every((n) => JSON.stringify(n.target).includes('vaadin-tabs'))) continue
            total += v.nodes.length
            const entry = byRule.get(v.id) ?? { impact: v.impact, help: v.help, count: 0, routes: new Set(), sample: '' }
            entry.count += v.nodes.length
            entry.routes.add(route)
            if (!entry.sample) entry.sample = (v.nodes[0]?.html ?? '').slice(0, 110).replace(/\s+/g, ' ')
            byRule.set(v.id, entry)
        }
        console.log(`  scanned ${route.padEnd(14)} ${results.violations.length} rule(s) violated`)
    } catch (e) {
        console.log(`  SKIP ${route}: ${e.message.split('\n')[0]}`)
    }
}

await browser.close()

const order = { critical: 0, serious: 1, moderate: 2, minor: 3 }
const rows = [...byRule.entries()].sort((a, b) =>
    (order[a[1].impact] ?? 9) - (order[b[1].impact] ?? 9) || b[1].count - a[1].count)

console.log(`\n${'impact'.padEnd(10)} ${'count'.padStart(5)}  rule`)
console.log('-'.repeat(96))
for (const [id, e] of rows) {
    console.log(`${(e.impact ?? '?').padEnd(10)} ${String(e.count).padStart(5)}  ${id} — ${e.help}`)
    console.log(`${' '.repeat(17)}routes: ${[...e.routes].join(', ')}`)
    console.log(`${' '.repeat(17)}e.g.:   ${e.sample}`)
}
console.log(`\n${total} violation(s) across ${byRule.size} rule(s), ${ROUTES.length} route(s)`)
