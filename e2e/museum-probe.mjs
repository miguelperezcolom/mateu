/**
 * Museum DSL-app probe — renders every route of demo/demo-museum (100% YAML over museum-service) in a
 * real browser and checks each one shows the content it is about, on whichever renderer the demo was
 * started with (Vaadin or Redwood). Unlike starwars-probe it runs against the LIVE museum-service
 * (http://localhost:8121), because what it checks is that the YAML and the API agree.
 *
 *   cd museum-service && mvn spring-boot:run -Dspring-boot.run.arguments=--museum.write-key=localdev
 *   cd demo/demo-museum && mvn spring-boot:run                    # Vaadin on :8601
 *   cd e2e && node museum-probe.mjs                                # BASE=http://localhost:8601
 *   BASE=http://localhost:8602 node museum-probe.mjs               # the same app on Redwood
 *
 * SHOTS=dir saves a screenshot per route. ONLY=route1,route2 limits the run. Exits non-zero on any
 * failure.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE ?? 'http://localhost:8601'
const SHOTS = process.env.SHOTS
const SETTLE = Number(process.env.SETTLE ?? 4000)
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null

// route → texts that must be on screen once it has rendered (data from museum-service, not chrome)
export const ROUTES = [
  ['welcome', ['Three museums, one collection', 'The Met', 'SMK', 'Cleveland']],
  ['dashboard', ['Operations at a glance', '5.72 M', 'Visitors per month', 'Loans by stage']],
  ['search', ['Search the collections', 'Artwork']],
  ['artworks', ['Artworks', 'Statens Museum for Kunst', '399']],
  ['artworks/new', ['New artwork', 'Identification', 'Estimated value', 'Image URL']],
  ['artworks/133', ['Wood with Crooked Tree', 'Mogens Ballin', 'Room 225']],
  ['artworks/133/gallery', ['Wood with Crooked Tree', 'Statens Museum for Kunst · Public domain']],
  ['artworks/133/edit', ['Edit Wood with Crooked Tree', 'Tempera on millboard']],
  ['artists', ['Artists', 'Pick an artist']],
  ['artists/66', ['Mogens Ballin', 'Represented here by 1 work']],
  ['museums', ['Museums', 'The Metropolitan Museum of Art', 'Statens Museum for Kunst']],
  ['museums/2', ['Statens Museum for Kunst', 'Copenhagen', 'Royal Collection of Graphic Art']],
  ['map', ['The museums on the map']],
  ['collection', ['The collection', 'The Metropolitan Museum of Art']],
  ['departments', ['Departments', 'Arms and Armor']],
  ['exhibitions', ['Exhibitions', 'Statens Museum for Kunst']],
  ['exhibitions/new', ['New exhibition', 'Opens', 'Closes']],
  ['exhibitions/3', ['The works', 'Loans', 'Budget and visitors']],
  ['exhibitions/3/edit', ['Opens']],
  ['calendar', ['Exhibition calendar']],
  ['loans', ['Loans', 'The workflow', 'In transit']],
  ['loans/new', ['Request a loan', 'The work', 'The exhibition', 'Insurance']],
  ['loans/1', ['Loan 1', 'Insured for']],
  ['conservation', ['Conservation board', 'Backlog', 'In progress', 'Review', 'Done']],
  ['conservation/tasks', ['Conservation tasks']],
  ['conservation/tasks/new', ['New conservation task', 'Priority']],
  ['conservation/tasks/1', ['Inpainting', 'Priority']],
  ['visits', ['Visits', 'The Metropolitan Museum of Art']],
]

if (SHOTS) mkdirSync(SHOTS, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

const deepText = () =>
  page.evaluate(() => {
    const out = []
    const walk = (root) => {
      for (const n of root.querySelectorAll('*')) {
        if (n.shadowRoot) walk(n.shadowRoot)
        if (n.childNodes) for (const c of n.childNodes) if (c.nodeType === 3) out.push(c.textContent)
        if (n.value && typeof n.value === 'string') out.push(n.value)
      }
    }
    walk(document)
    return out.join(' ').replace(/\s+/g, ' ')
  })

let failures = 0
for (const [route, needles] of ROUTES) {
  if (ONLY && !ONLY.includes(route)) continue
  errors.length = 0
  await page.goto(`${BASE}/${route}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  let text = ''
  let missing = needles
  const deadline = Date.now() + Math.max(SETTLE, 25000)
  await page.waitForTimeout(SETTLE)
  while (Date.now() < deadline) {
    text = await deepText()
    missing = needles.filter((n) => !text.includes(n))
    if (!missing.length) break
    await page.waitForTimeout(1000)
  }
  const broken = /Something went wrong|Page not found|Not found|Unsupported component/.exec(text)
  const ok = !missing.length && !broken
  if (!ok) failures++
  console.log(`${ok ? '✓' : '✗'} /${route}${missing.length ? '  missing: ' + missing.join(' | ') : ''}${broken ? '  shows: ' + broken[0] : ''}${errors.length ? '  pageerrors: ' + errors.slice(0, 2).join(' / ') : ''}`)
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${route.replace(/\//g, '_') || 'root'}.png`, fullPage: true })
}
await browser.close()
console.log(failures ? `\n${failures} route(s) failed` : '\nall routes passed')
process.exit(failures ? 1 : 0)
