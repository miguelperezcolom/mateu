/**
 * Dead-button probe: opens each route in a real browser (the web renderer) and lists every control
 * the user could press that the browser will NEVER send. The web client only sends an action some
 * `mateu-component` on the way up advertises (its `actions`, exact id or a `prefix*` wildcard);
 * anything else bubbles out unclaimed and is lost with a console warning. So an element carrying
 * `data-action-id` that no enclosing component advertises is a dead button.
 *
 * It found the .NET / Python ports' dead CRUD toolbars, wizard Back, calendar toolbar and view
 * switchers (design/walkthrough/native-ports.md). Backend-agnostic: point it at any app serving the
 * web renderer (a Java app, or a port behind a proxy that serves the bundle).
 *
 * Usage:
 *   cd e2e && node dead-button-probe.mjs http://localhost:8080 / products team-calendar
 *
 * Also reports `<mateu-unsupported>` placeholders, "Not found" pages and console errors. Exits
 * non-zero when any route has a dead button or an unsupported component.
 */
import { chromium } from 'playwright'

const [base, ...routes] = process.argv.slice(2)
if (!base || routes.length === 0) {
    console.error('usage: node dead-button-probe.mjs <baseUrl> <route> [route...]')
    process.exit(2)
}
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
let bad = 0
for (const route of routes) {
    errors.length = 0
    await page.goto(`${base.replace(/\/$/, '')}/${route.replace(/^\//, '')}`).catch(() => {})
    await page.waitForTimeout(3500)
    const r = await page.evaluate(() => {
        const claims = (actions, id) => (actions || []).some((a) => a.id === id || (a.id.endsWith('*') && id.startsWith(a.id.slice(0, -1))))
        const owners = (el) => {
            const out = []
            for (let n = el; n; n = n.parentNode || n.host) if (n.nodeType === 1 && n.localName === 'mateu-component') out.push(n)
            return out
        }
        const dead = new Set()
        let unsupported = 0
        const walk = (n) => {
            if (n.nodeType === 1) {
                if (n.localName === 'mateu-unsupported') unsupported++
                const id = n.getAttribute('data-action-id')
                if (id && !n.hasAttribute('disabled') && !owners(n).some((c) => claims(c.component?.actions, id))) dead.add(id)
            }
            if (n.shadowRoot) walk(n.shadowRoot)
            for (const c of n.childNodes || []) walk(c)
        }
        walk(document.body)
        return { dead: [...dead], unsupported, notFound: /Not found|Route not found/.test(document.body.innerText) }
    })
    const failed = r.dead.length > 0 || r.unsupported > 0
    if (failed) bad++
    console.log(`${failed ? 'FAIL' : 'PASS'}  ${route} — dead=${JSON.stringify(r.dead)} unsupported=${r.unsupported}`
        + `${r.notFound ? ' NOT-FOUND' : ''}${errors.length ? `\n      console: ${errors.join(' | ')}` : ''}`)
}
await browser.close()
process.exit(bad ? 1 : 0)
