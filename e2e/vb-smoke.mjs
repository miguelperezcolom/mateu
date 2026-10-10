/**
 * Smoke pass of the VB/Redwood renderer over demo-vb's key screens: each route loads in a real
 * (headless) browser through the PACKAGED app (the io.mateu:mateu-redwood jar a Mateu backend serves) and
 * paints its content. demo-vb mounts a root App (@UI("") with a menu) AND several standalone UIs at
 * their own paths — pages, a crud, archetypes — so this also covers the packaged app at a non-root
 * mount (the API under the mount, deep links below it).
 *
 * Usage (demo-vb running with the redwood renderer, e.g. on :9005):
 *   VB_URL=http://localhost:9005 node vb-smoke.mjs [--shots dir]
 * Exits non-zero if a screen fails.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { gotoVbReady } from './vb-ready.mjs'

const VB_URL = (process.env.VB_URL || 'http://localhost:9005').replace(/\/+$/, '')
const shotsArg = process.argv.indexOf('--shots')
const shots = shotsArg > 0 ? process.argv[shotsArg + 1] : ''
if (shots) mkdirSync(shots, { recursive: true })

// route → texts the screen must show (all of them)
const SCREENS = [
  ['/', ['Welcome', 'Products', 'VB Demo front desk']],                // root App: menu + home
  ['/products', ['Products', 'Laptop', 'Keyboard']],                  // crud mounted at its path
  ['/products/new', ['Save', 'Sku']],                                 // deep link below that mount
  ['/hello', ['Hola', 'Message']],                                    // a plain page at a mount
  ['/welcome', ['VB Demo front desk', 'Start checkout']],             // welcome archetype
  ['/booking', ['Booking B-1024', 'Guest profile']],                  // foldout
  ['/requisitions', ['Requisition 204', 'Approval']],                 // general overview
  ['/chair', ['SKU: EC-200-BLK', 'Specifications']],                  // item overview
  ['/person', ['Name', 'Age', 'Save']],                               // form
  // the display components galleries (data-only routes, specs/ui/components*.yaml): every type
  ['/components', ['Review contract', 'Order placed', 'Go Pro', 'Grace Hopper', 'Go-live checklist',
    'Nightly sync', 'Maintenance window']],
  ['/components-2', ['Rate details', 'Engineering', 'Release notes', 'Approve', 'Onboarding', 'Sign-up form', 'Sales']],
]

const browser = await chromium.launch()
let failed = 0
for (const [route, texts] of SCREENS) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => { if (!/Aborting stale fetch/.test(e.message)) errors.push(e.message) })
  let missing = texts
  try {
    // ready = shell booted, no load in flight and every expected text shown (vb-ready.mjs), with
    // the navigation retried once — not networkidle, which the Oracle CDN can hold off for >60s.
    await gotoVbReady(page, VB_URL + route, { texts })
    missing = []
  } catch (e) {
    const shown = await page.evaluate(() => document.body.innerText).catch(() => '')
    missing = texts.filter((t) => !shown.includes(t))
    if (!missing.length) errors.push(e.message)
  }
  const ok = !missing.length && !errors.length
  if (!ok) failed++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${route}${missing.length ? ' — missing ' + JSON.stringify(missing) : ''}${errors.length ? ' — ' + errors[0].slice(0, 160) : ''}`)
  if (shots) await page.screenshot({ path: join(shots, (route.replace(/[^a-z0-9]+/gi, '_') || 'root') + '.png') })
  await ctx.close()
}
await browser.close()
console.log(`\n${SCREENS.length - failed}/${SCREENS.length} screens OK`)
process.exit(failed ? 1 : 0)
