/**
 * Oracle CDN mirror probe — a Redwood app configured with `mateu.oracle-cdn.url` must load ALL of
 * Oracle's runtime (JET, Spectra, the Visual Builder runtime, the gallery's images and fonts) from the
 * mirror, and none of it from static.oracle.com.
 *
 * The probe IS the mirror: it starts a forwarding server (http://localhost:<MIRROR_PORT>/oracle/cdn/…
 * → https://static.oracle.com/cdn/…), so no copy of Oracle's files is needed. Start the app against it:
 *
 *   java -Dmateu.oracle-cdn.url=http://localhost:9777/oracle/cdn -jar app.jar   (a Redwood app)
 *   cd e2e && BASE=http://localhost:8595 ROUTE=/products node oracle-cdn-mirror-probe.mjs
 *
 * It prints the CDN trees the page fetched — what an organisation has to mirror — and exits non-zero
 * if the screen does not render or anything was fetched from static.oracle.com directly.
 */
import http from 'node:http'
import https from 'node:https'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:8080'
const ROUTE = process.env.ROUTE ?? '/'
const MIRROR_PORT = Number(process.env.MIRROR_PORT ?? 9777)
// the screenshot goes to a private directory of its own unless one is named (never a fixed /tmp path)
const OUT = process.env.OUT ?? path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'mateu-oracle-cdn-')), 'mirror-probe.png')
const PREFIX = '/oracle/cdn/'
const UPSTREAM = new URL('https://static.oracle.com/cdn/')

/** The upstream URL a mirror request forwards to, or null when its path is not a plain CDN path:
 *  segments of [A-Za-z0-9._~-] only — no `..`, no empty segment (`//`), no scheme — and the
 *  resolved URL must still be on Oracle's CDN origin, under /cdn/ (a query string is dropped). */
function upstreamOf(requestUrl) {
    if (typeof requestUrl !== 'string' || !requestUrl.startsWith(PREFIX)) return null
    const rest = requestUrl.slice(PREFIX.length).split(/[?#]/)[0]
    const segments = rest.split('/')
    if (!rest || segments.some((s) => !/^[A-Za-z0-9._~-]+$/.test(s) || s === '.' || s === '..')) return null
    const target = new URL(rest, UPSTREAM)
    if (target.origin !== UPSTREAM.origin || !target.pathname.startsWith(UPSTREAM.pathname)) return null
    return target
}

const mirrored = []
const server = http.createServer((req, res) => {
    const target = upstreamOf(req.url)
    if (!target) {
        res.statusCode = 404
        res.end()
        return
    }
    mirrored.push(target.pathname.slice(UPSTREAM.pathname.length))
    https.get(target, (up) => {
        res.writeHead(up.statusCode, { ...up.headers, 'access-control-allow-origin': '*' })
        up.pipe(res)
    }).on('error', () => {
        res.statusCode = 502
        res.end()
    })
})
await new Promise((resolve) => server.listen(MIRROR_PORT, resolve))

const direct = []
const browser = await chromium.launch()
let rendered = false
try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    page.on('request', (r) => {
        let host = ''
        try { host = new URL(r.url()).hostname } catch { /* not a URL (data:, about:) */ }
        if (host === UPSTREAM.hostname) direct.push(r.url())
    })
    await page.goto(BASE + ROUTE)
    rendered = await page.locator('oj-vb-content *').first().waitFor({ timeout: 60000 }).then(() => true, () => false)
    await page.waitForTimeout(4000)
    await page.screenshot({ path: OUT })
} finally {
    await browser.close()
    server.close()
}

// the trees an organisation mirrors: the first three path segments (product/version) of each fetch
const trees = [...new Set(mirrored.map((p) => p.split('/').slice(0, 3).join('/')))].sort((a, b) => a.localeCompare(b))
console.log(`fetched through the mirror: ${mirrored.length} files from`)
trees.forEach((t) => console.log(`  ${t}/`))
console.log(`${rendered ? 'PASS' : 'FAIL'} the screen renders`)
console.log(`${mirrored.length > 0 ? 'PASS' : 'FAIL'} the page loads Oracle's runtime from the mirror`)
console.log(`${direct.length === 0 ? 'PASS' : 'FAIL'} nothing is fetched from static.oracle.com (${direct.length})`)
direct.slice(0, 10).forEach((u) => console.log(`    ${u}`))
process.exit(rendered && mirrored.length > 0 && direct.length === 0 ? 0 : 1)
