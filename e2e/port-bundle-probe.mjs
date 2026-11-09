/**
 * Static-bundle probe — a bundle exported by ANY backend's exporter (mateu-bundle:bundle, python -m
 * mateu_ui.bundle, dotnet mateu-bundle) is served by plain static servers, with NO Mateu server
 * anywhere, and a real Chromium asserts that the Vaadin renderer paints its screens:
 *
 *   1. the root page paints its home screen (served by `python3 -m http.server`);
 *   2. a click on a menu entry navigates in the app and paints that screen;
 *   3. a DEEP LINK to a route paints that screen inside the shell — served by a static server that
 *      honours the bundle's `_redirects` SPA fallback (`/* /index.html 200`), as Netlify/Cloudflare
 *      Pages do (`python -m http.server` has no fallback: a deep link there is a 404 by design);
 *   4. no request reaches /mateu/v3/sync: every load was answered from manifest.json.
 *
 *   cd e2e && node port-bundle-probe.mjs <bundleDir> --home "Home text" --shell "App title" \
 *       --menu "About" --page "/about=About text" [--page "/x=…"] [--port 8710] [--out shots/]
 *
 * Exits non-zero if any check fails.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { chromium } from 'playwright'

const args = process.argv.slice(2)
const bundle = path.resolve(args[0] ?? '')
const opt = (name, fallback) => {
    const i = args.indexOf(name)
    return i >= 0 ? args[i + 1] : fallback
}
const all = name => args.flatMap((a, i) => (a === name ? [args[i + 1]] : []))
const home = opt('--home')
const menu = opt('--menu')
// a text only the app shell paints (its title): a deep link must land INSIDE the shell
const shell = opt('--shell')
const pages = all('--page').map(p => {
    const at = p.indexOf('=')
    return { route: p.substring(0, at), text: p.substring(at + 1) }
})
const port = Number(opt('--port', '8710'))
const out = opt('--out')

if (!fs.existsSync(path.join(bundle, 'manifest.json')) || !home || !pages.length) {
    console.error('usage: node port-bundle-probe.mjs <bundleDir> --home <text> --page </route=text> [--menu <label>]')
    process.exit(2)
}

const TYPES = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
    '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json',
}

/** A static server with the bundle's `_redirects` fallback: a path naming no file is index.html. */
const spaServer = () => http.createServer((rq, rs) => {
    const url = new URL(rq.url, 'http://x')
    let file = path.join(bundle, decodeURIComponent(url.pathname))
    if (!file.startsWith(bundle)) { rs.writeHead(403).end(); return }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        const index = path.join(file, 'index.html')
        file = fs.existsSync(index) ? index : path.join(bundle, 'index.html')
    }
    rs.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' })
    fs.createReadStream(file).pipe(rs)
})

const waitFor = async url => {
    for (let i = 0; i < 100; i++) {
        try { if ((await fetch(url)).ok) return } catch { /* not yet */ }
        await new Promise(r => setTimeout(r, 100))
    }
    throw new Error(`${url} never answered`)
}

const results = []
const check = (name, ok, detail = '') => {
    results.push({ name, ok })
    console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`)
}

const python = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', bundle],
    { stdio: 'ignore' })
const spa = spaServer().listen(port + 1, '127.0.0.1')
const browser = await chromium.launch()
try {
    await waitFor(`http://127.0.0.1:${port}/manifest.json`)
    const context = await browser.newContext({ serviceWorkers: 'block' })
    const page = await context.newPage()
    const syncCalls = []
    page.on('request', r => { if (r.url().includes('/mateu/v3/sync')) syncCalls.push(r.url()) })
    // the screen's text, shadow roots and field values included (a read-only field shows its value
    // in an input, which no text query sees)
    const shows = async (text, timeout = 15000) => {
        try {
            await page.waitForFunction(wanted => {
                const parts = []
                const walk = node => {
                    if (node.nodeType === Node.TEXT_NODE) parts.push(node.textContent)
                    if (node.value && typeof node.value === 'string') parts.push(node.value)
                    if (node.shadowRoot) walk(node.shadowRoot)
                    node.childNodes?.forEach(walk)
                }
                walk(document.body)
                return parts.join(' ').includes(wanted)
            }, text, { timeout })
            return true
        } catch { return false }
    }
    const shot = async name => { if (out) await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true }) }
    if (out) fs.mkdirSync(out, { recursive: true })

    // 1. the root
    await page.goto(`http://127.0.0.1:${port}/`)
    check('the root paints its home screen (python -m http.server)', await shows(home), home)
    await shot('1-root')

    // 2. navigation from the menu
    if (menu) {
        const target = pages[0]
        await page.getByText(menu, { exact: true }).first().click()
        const painted = await shows(target.text)
        check(`a click on "${menu}" paints ${target.route}`, painted, target.text)
        await shot('2-navigated')
    }

    // 3. deep links
    for (const { route, text } of pages) {
        await page.goto(`http://127.0.0.1:${port + 1}${route}`)
        const painted = await shows(text)
        const shellToo = shell ? await shows(shell, 3000) : true
        check(`a deep link to ${route} paints it${shell ? ' inside the shell' : ''}`, painted && shellToo, text)
        await shot(`3-deep${route.replaceAll('/', '_')}`)
    }

    // 4. nothing asked a server
    check('no request reached /mateu/v3/sync', syncCalls.length === 0, syncCalls.join(', '))
} finally {
    await browser.close()
    python.kill()
    spa.close()
}
const failed = results.filter(r => !r.ok).length
console.log(`${results.length - failed}/${results.length} checks passed`)
process.exit(failed ? 1 : 0)
