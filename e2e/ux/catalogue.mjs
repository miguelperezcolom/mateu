/**
 * UX review — screenshot catalogue + mechanical checks, one pass per renderer.
 *
 * For every route × {light, dark} × {1440px desktop, 390px phone} it:
 *  - saves a JPEG screenshot (small enough to keep a catalogue around);
 *  - runs axe-core (WCAG 2.0/2.1/2.2 A + AA) and records violations by rule;
 *  - measures horizontal overflow (an element wider than the viewport = sideways scrolling, the
 *    most common phone-width defect) — walking OPEN SHADOW ROOTS, since every Mateu control lives
 *    in one;
 *  - lists emoji found in the rendered text (the "one icon family per renderer" rule — a screen
 *    that mixes the design system's icon set with emoji fails it);
 *  - records page errors and the framework's own failure texts ("Not found.", "Unsupported component").
 *
 * Usage (with the apps running):
 *   node ux/catalogue.mjs --base http://localhost:19702 --renderer vaadin --app admin \
 *        --routes /dashboard-demo,/welcome-demo --out <dir> [--themes light,dark] [--widths 1440,390] [--vb]
 * Writes <out>/<app>/<shots>.jpg and <out>/<app>-catalogue.json.
 */
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'
import fs from 'node:fs'
import path from 'node:path'
import { gotoVbReady } from '../vb-ready.mjs'

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : 'true'])
    return acc
}, []))
const base = args.base ?? 'http://localhost:8080'
const app = args.app ?? 'app'
const renderer = args.renderer ?? 'vaadin'
const out = args.out ?? '.'
const routes = (args.routes ?? '/').split(',').filter(Boolean)
const themes = (args.themes ?? 'light,dark').split(',')
const widths = (args.widths ?? '1440,390').split(',').map(Number)
const isVb = args.vb === 'true'
const settle = +(args.settle ?? (isVb ? 1500 : 1800))
const doAxe = args.axe !== 'false'
fs.mkdirSync(path.join(out, app), { recursive: true })

const slug = (r) => (r === '/' || r === '' ? 'root' : r.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-'))

/** Deep metrics, evaluated in the page. */
const probe = () => {
    const vw = window.innerWidth
    const all = []
    const walk = (root) => {
        for (const el of root.querySelectorAll('*')) {
            all.push(el)
            if (el.shadowRoot) walk(el.shadowRoot)
        }
    }
    walk(document)
    let overflowing = []
    for (const el of all) {
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        if (r.right > vw + 2) {
            const cs = getComputedStyle(el)
            if (cs.visibility === 'hidden' || cs.position === 'fixed') continue
            // only report the outermost offenders (skip descendants of one already reported)
            overflowing.push({ tag: el.tagName.toLowerCase(), cls: (el.className && el.className.baseVal === undefined ? String(el.className) : '').slice(0, 60), right: Math.round(r.right), width: Math.round(r.width) })
        }
    }
    // collapse: keep the first 8 widest
    overflowing = overflowing.sort((a, b) => b.width - a.width).slice(0, 8)
    // emoji in rendered text
    const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}]/gu
    const emojis = new Set()
    const texts = []
    const twalk = (root) => {
        const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
        let n
        while ((n = tw.nextNode())) {
            const t = n.nodeValue
            if (!t || !t.trim()) continue
            const p = n.parentElement
            if (p && ['STYLE', 'SCRIPT'].includes(p.tagName)) continue
            texts.push(t)
            for (const m of t.matchAll(emojiRe)) emojis.add(m[0])
        }
        for (const el of root.querySelectorAll('*')) if (el.shadowRoot) twalk(el.shadowRoot)
    }
    twalk(document)
    const joined = texts.join(' ')
    const failures = ['Not found.', 'Unsupported component', 'is not supported by', 'Something went wrong']
        .filter((f) => joined.includes(f))
    const docOverflow = document.documentElement.scrollWidth > vw + 1
    return { overflowing, docOverflow, emojis: [...emojis], failures, textLength: joined.length }
}

const browser = await chromium.launch()
const results = []
for (const theme of themes) {
    for (const width of widths) {
        const context = await browser.newContext({
            viewport: { width, height: width < 600 ? 844 : 900 },
            colorScheme: theme,
            deviceScaleFactor: 1,
        })
        await context.addInitScript((t) => { try { localStorage.setItem('mateu-theme', t) } catch { /* ignore */ } }, theme)
        const page = await context.newPage()
        let errors = []
        page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)))
        for (const route of routes) {
            errors = []
            const name = `${renderer}-${slug(route)}-${theme}-${width}`
            const entry = { app, renderer, route, theme, width, shot: `${app}/${name}.jpg` }
            const t0 = Date.now()
            try {
                if (isVb) {
                    await gotoVbReady(page, base + route, { timeout: 40000 })
                } else {
                    await page.goto(base + route, { waitUntil: 'domcontentloaded' })
                    await page.waitForSelector('mateu-page, mateu-app, mateu-component, vaadin-grid', { timeout: 15000 }).catch(() => {})
                }
                await page.waitForTimeout(settle)
                entry.loadMs = Date.now() - t0
                await page.screenshot({ path: path.join(out, entry.shot), type: 'jpeg', quality: 55 })
                Object.assign(entry, await page.evaluate(probe))
                if (doAxe) {
                    const ax = await new AxeBuilder({ page })
                        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
                        .analyze()
                    entry.axe = ax.violations.map((v) => ({
                        id: v.id, impact: v.impact, n: v.nodes.length,
                        sample: (v.nodes[0]?.target ?? []).join(' ').slice(0, 140),
                        html: (v.nodes[0]?.html ?? '').slice(0, 140).replace(/\s+/g, ' '),
                    }))
                }
            } catch (e) {
                entry.error = String(e.message).split('\n')[0]
            }
            entry.pageErrors = errors.slice(0, 5)
            results.push(entry)
            const ax = (entry.axe ?? []).map((v) => v.id).join(',')
            console.log(`${name.padEnd(60)} ${entry.error ? 'ERR ' + entry.error : ''} ovf=${entry.overflowing?.length ?? '-'} emoji=${(entry.emojis ?? []).join('')} axe=${ax} fail=${(entry.failures ?? []).join('|')}`)
        }
        await context.close()
    }
}
await browser.close()
fs.writeFileSync(path.join(out, `${app}-${renderer}-catalogue.json`), JSON.stringify(results, null, 1))
