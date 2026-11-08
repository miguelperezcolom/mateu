/**
 * Server latency probe — INFORMATIONAL, not a CI gate (shared CI runners are too noisy for a
 * latency gate; the deterministic budgets are RequestBudgetTest and SyncResponseSizeBudgetTest).
 *
 * Two steps:
 *
 *   1. capture — drives a real browser through a scenario and records every POST /mateu/v3/sync
 *      it sends (route, body, headers). What the load loop replays is therefore exactly what the
 *      renderer sends, not a hand-written guess of it.
 *
 *        node sync-latency-probe.mjs capture java  http://localhost:8080 out.json
 *        node sync-latency-probe.mjs capture port  http://localhost:8080 out.json   (.NET / Python starters)
 *
 *      Scenarios: `java` = the e2e SUT's /full-crud (listing load, search, open a record, save)
 *      and /wizard (a step); `port` = the starters' /products (listing load, search, open, save)
 *      — the .NET/Python starter must serve the page for this (MATEU_UI=<the mateu-vaadin jar>).
 *
 *   2. run — replays each captured action against a base url, warm (WARMUP requests first), with
 *      1, 10 and 50 concurrent loops (CONC), for DURATION seconds each; prints p50/p95/p99, req/s
 *      and the response size.
 *
 *        node sync-latency-probe.mjs run out.json http://localhost:8080
 *        CONC=1,10 DURATION=5 node sync-latency-probe.mjs run out.json http://localhost:8081
 *
 *      JSON=<file> also writes the results.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const [mode, a1, a2, a3] = process.argv.slice(2)

const capture = async (scenario, base, outFile) => {
    const { chromium } = await import('playwright')
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    const captured = []
    let label = 'boot'
    page.on('request', (rq) => {
        if (rq.method() !== 'POST' || !rq.url().includes('/mateu/v3/sync')) return
        const body = rq.postData()
        let actionId = ''
        try { actionId = JSON.parse(body).actionId ?? '' } catch { /* not json */ }
        captured.push({ label, actionId, path: new URL(rq.url()).pathname, body, headers: { 'content-type': 'application/json' } })
    })
    const settle = async () => { await page.waitForLoadState('networkidle'); await page.waitForTimeout(800) }
    const click = async (text) => { await page.getByText(text, { exact: true }).first().click(); await settle() }
    const fill = async (labelText, value) => {
        const field = page.getByLabel(labelText, { exact: true }).first()
        await field.fill(value)
        await field.press('Tab')
    }
    const crud = scenario === 'java' ? '/full-crud' : '/products'
    const record = scenario === 'java' ? 't1' : 'P-001'
    label = 'listing'; await page.goto(`${base}${crud}`); await settle()
    label = 'record'; await page.goto(`${base}${crud}/${record}`); await settle()
    label = 'edit'; await page.goto(`${base}${crud}/${record}/edit`); await settle()
    label = 'save'; await click('Save')
    if (scenario === 'java') {
        label = 'wizard'; await page.goto(`${base}/wizard`); await settle()
        await fill('Name', 'Ana'); await fill('Email', 'ana@example.com')
        label = 'wizard-step'; await click('Next')
    }
    await browser.close()
    // keep the interesting ones: one per (label, actionId) — the first
    const seen = new Set()
    const picked = captured.filter((c) => {
        const k = `${c.label}|${c.actionId}`
        if (seen.has(k)) return false
        seen.add(k)
        return true
    })
    writeFileSync(outFile, JSON.stringify(picked, null, 2))
    for (const c of picked) console.log(`${c.label.padEnd(12)} ${JSON.stringify(c.actionId).padEnd(14)} ${c.path}`)
}

const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))]

const run = async (file, base) => {
    const actions = JSON.parse(readFileSync(file, 'utf8')).filter((c) => !process.env.ONLY || process.env.ONLY.split(',').includes(c.label))
    const conc = (process.env.CONC ?? '1,10,50').split(',').map(Number)
    const duration = Number(process.env.DURATION ?? 10) * 1000
    const warmup = Number(process.env.WARMUP ?? 200)
    const results = []
    const call = async (c) => {
        const t0 = performance.now()
        const res = await fetch(base + c.path, { method: 'POST', body: c.body, headers: c.headers })
        const text = await res.text()
        return { ms: performance.now() - t0, status: res.status, bytes: text.length }
    }
    console.log(['action'.padEnd(26), 'conc', 'n', 'p50', 'p95', 'p99', 'req/s', 'bytes', 'status'].join('\t'))
    for (const c of actions) {
        for (let i = 0; i < warmup; i++) await call(c)
        for (const n of conc) {
            const lat = []
            let bytes = 0
            const statuses = new Set()
            const end = performance.now() + duration
            const t0 = performance.now()
            await Promise.all(Array.from({ length: n }, async () => {
                while (performance.now() < end) {
                    const r = await call(c)
                    lat.push(r.ms); bytes = r.bytes; statuses.add(r.status)
                }
            }))
            const secs = (performance.now() - t0) / 1000
            lat.sort((x, y) => x - y)
            const r = {
                action: `${c.label} ${c.actionId || '(load)'}`, conc: n, n: lat.length,
                p50: pct(lat, 50), p95: pct(lat, 95), p99: pct(lat, 99), rps: lat.length / secs, bytes, status: [...statuses].join(','),
            }
            results.push(r)
            console.log([r.action.padEnd(26), n, r.n, r.p50.toFixed(1), r.p95.toFixed(1), r.p99.toFixed(1), r.rps.toFixed(0), bytes, r.status].join('\t'))
        }
    }
    if (process.env.JSON) writeFileSync(process.env.JSON, JSON.stringify(results, null, 2))
}

if (mode === 'capture') await capture(a1, a2, a3)
else if (mode === 'run') await run(a1, a2)
else {
    console.error('usage: node sync-latency-probe.mjs capture java|port <base> <out.json> | run <in.json> <base>')
    process.exit(2)
}
