/**
 * First-load probe — INFORMATIONAL, not a CI gate (the gated version is
 * tests/shared/first-load-budget.spec.ts). Measures what a user on a slow phone waits for when they
 * open a Mateu URL cold: an empty cache, a throttled network and a throttled CPU.
 *
 * Per route, median of RUNS cold loads (a fresh browser context each time):
 *   ttfb      navigation start → first byte of the HTML document (Navigation Timing; Chrome's
 *             emulated latency is NOT reflected here — it is the server's own time)
 *   fcp       first contentful paint (the browser's own entry — the Vaadin page paints nothing
 *             before its bundle runs, so this is close to `content`)
 *   content   "first meaningful paint": the first moment the route's CONTENT is in the rendered DOM —
 *             the READY text (a string only the route's own content shows: a column header, a
 *             record value) found by a deep walk that pierces shadow roots. Polled every 50 ms, so
 *             the resolution is ±50 ms.
 *   requests  requests issued until content + 1 s of quiet
 *   js        JavaScript bytes on the wire (transfer size, so compressed when the server compresses)
 *   total     all bytes on the wire
 *   3rd-party the part of `total` from another origin (Oracle's CDN for Redwood, a public API…)
 *   longTasks main-thread tasks > 50 ms until content (count / total blocking time = Σ(d − 50))
 *
 * Throttling (Chrome DevTools Protocol): PROFILE=fast3g (default) = 150 ms RTT, 1.6 Mbit/s down,
 * 750 kbit/s up, 4× CPU slowdown (Lighthouse's mobile profile); PROFILE=none = no throttling.
 *
 * Usage:
 *   cd e2e && node first-load-probe.mjs "http://localhost:8595/=García López" http://localhost:8600/people=Ackbar
 *   RUNS=5 PROFILE=none node first-load-probe.mjs <url>=<READY text> …
 *   JSON=out.json node first-load-probe.mjs …   (also writes the medians as JSON)
 */
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'

const RUNS = Number(process.env.RUNS ?? 3)
const PROFILE = process.env.PROFILE ?? 'fast3g'
const TIMEOUT = Number(process.env.TIMEOUT ?? 60000)
const targets = process.argv.slice(2).map((arg) => {
    const i = arg.lastIndexOf('=')
    return i > arg.indexOf('://') + 3 ? { url: arg.slice(0, i), ready: arg.slice(i + 1) } : { url: arg, ready: '' }
})
if (!targets.length) {
    console.error('usage: node first-load-probe.mjs <url>=<READY text> …')
    process.exit(2)
}

/** Installed before any page script: records long tasks and the moment the READY text appears. */
const instrument = (ready) => {
    window.__perf = { longTasks: [], content: null }
    try {
        new PerformanceObserver((list) => {
            for (const e of list.getEntries()) window.__perf.longTasks.push([e.startTime, e.duration])
        }).observe({ type: 'longtask', buffered: true })
    } catch { /* not supported */ }
    const deepText = (root, acc) => {
        for (const el of root.querySelectorAll('*')) {
            if (el.shadowRoot) deepText(el.shadowRoot, acc)
        }
        acc.push((root.nodeType === 9 ? root.documentElement?.textContent : root.textContent) ?? "")
        return acc
    }
    const check = () => {
        if (window.__perf.content != null) return
        const body = document.body
        if (body) {
            const text = deepText(document, []).join(' ')
            const hit = ready ? text.includes(ready) : document.querySelector('mateu-component') != null
            if (hit) {
                window.__perf.content = performance.now()
                return
            }
        }
        setTimeout(check, 50)
    }
    setTimeout(check, 0)
}

const median = (xs) => {
    const s = xs.filter((x) => x != null).sort((a, b) => a - b)
    return s.length ? s[Math.floor(s.length / 2)] : null
}

const one = async (browser, { url, ready }) => {
    const context = await browser.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' })
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    await cdp.send('Network.enable')
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
    if (PROFILE === 'fast3g') {
        await cdp.send('Network.emulateNetworkConditions', {
            offline: false,
            latency: 150,
            downloadThroughput: (1.6 * 1024 * 1024) / 8,
            uploadThroughput: (750 * 1024) / 8,
        })
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    }
    // bytes on the wire, per request, as the network stack saw them
    const wire = new Map()
    const types = new Map()
    const origins = new Map()
    cdp.on('Network.responseReceived', (e) => { types.set(e.requestId, e.type); origins.set(e.requestId, new URL(e.response.url).origin) })
    cdp.on('Network.loadingFinished', (e) => wire.set(e.requestId, e.encodedDataLength))
    let requests = 0
    page.on('request', () => requests++)
    await page.addInitScript(instrument, ready)

    await page.goto(url, { waitUntil: 'commit', timeout: TIMEOUT })
    await page.waitForFunction(() => window.__perf?.content != null, null, { timeout: TIMEOUT, polling: 100 })
    const atContent = requests
    // then 1 s without a new request (capped at 10 s: a live-updates stream never goes idle, which
    // is why this is not Playwright's `networkidle`)
    {
        const cap = Date.now() + 10000
        let last = requests
        let quietSince = Date.now()
        while (Date.now() < cap && Date.now() - quietSince < 1000) {
            await page.waitForTimeout(100)
            if (requests !== last) { last = requests; quietSince = Date.now() }
        }
    }
    const m = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0]
        const fcp = performance.getEntriesByName('first-contentful-paint')[0]
        const content = window.__perf.content
        const lts = window.__perf.longTasks.filter(([start]) => start < content)
        return {
            ttfb: nav ? nav.responseStart - nav.startTime : null,
            fcp: fcp ? fcp.startTime : null,
            content,
            longTasks: lts.length,
            tbt: lts.reduce((sum, [, d]) => sum + Math.max(0, d - 50), 0),
        }
    })
    let js = 0
    let total = 0
    let thirdParty = 0
    const own = new URL(url).origin
    for (const [id, bytes] of wire) {
        total += bytes
        if (origins.get(id) && origins.get(id) !== own) thirdParty += bytes
        if (types.get(id) === 'Script') js += bytes
    }
    await context.close()
    return { ...m, requests, requestsAtContent: atContent, js, total, thirdParty }
}

const browser = await chromium.launch()
const results = []
const kb = (n) => (n == null ? '—' : `${(n / 1024).toFixed(0)} KB`)
const ms = (n) => (n == null ? '—' : `${n.toFixed(0)} ms`)
console.log(`profile=${PROFILE} runs=${RUNS} (median, cold cache)`)
console.log(['url'.padEnd(46), 'ttfb', 'fcp', 'content', 'req', 'js', 'total', '3rd-party', 'longTasks/TBT'].join('\t'))
try {
    for (const t of targets) {
        const runs = []
        for (let i = 0; i < RUNS; i++) {
            try {
                runs.push(await one(browser, t))
            } catch (e) {
                console.error(`  ${t.url} run ${i + 1}: ${e.message.split('\n')[0]}`)
            }
        }
        const pick = (k) => median(runs.map((r) => r[k]))
        const r = {
            url: t.url, ready: t.ready, runs: runs.length, profile: PROFILE,
            ttfb: pick('ttfb'), fcp: pick('fcp'), content: pick('content'),
            requests: pick('requests'), requestsAtContent: pick('requestsAtContent'),
            js: pick('js'), total: pick('total'), thirdParty: pick('thirdParty'), longTasks: pick('longTasks'), tbt: pick('tbt'),
        }
        results.push(r)
        console.log([t.url.padEnd(46), ms(r.ttfb), ms(r.fcp), ms(r.content), `${r.requests} (${r.requestsAtContent})`,
            kb(r.js), kb(r.total), kb(r.thirdParty), `${r.longTasks} / ${ms(r.tbt)}`].join('\t'))
    }
} finally {
    await browser.close()
}
if (process.env.JSON) writeFileSync(process.env.JSON, JSON.stringify(results, null, 2))
