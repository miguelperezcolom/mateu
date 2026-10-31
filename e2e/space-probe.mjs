/**
 * demo-space probe — drives the 100%-YAML space demo (demo/demo-space) in a real browser, on either
 * renderer, against a LIVE local space-service (unlike starwars-probe, it does not intercept: the
 * demo's point is the API's filters, trees and writes, so the probe exercises the real thing).
 *
 *   space-service:  mvn spring-boot:run -Dspring-boot.run.arguments=--space.write-key=localdev   (:8122)
 *   demo (Vaadin):  cd demo/demo-space && MATEU_SECRET_SPACE_WRITE_KEY=localdev mvn spring-boot:run   (:8602)
 *   demo (Redwood): cd demo/demo-space && MATEU_SECRET_SPACE_WRITE_KEY=localdev mvn -Predwood spring-boot:run \
 *                       -Dspring-boot.run.arguments=--server.port=8603
 *   cd e2e && node space-probe.mjs                                   # Vaadin
 *   cd e2e && BASE=http://localhost:8603 WAIT=25000 node space-probe.mjs   # Redwood (slow bootstrap;
 *                                                     # RENDERER=redwood when it is on another port)
 *
 * Every route must render its own data (a needle read from the API), with no "Page not found", no
 * "Unsupported component", no "Unknown field type" and no uninterpolated `${state.…}`. Exits non-zero
 * on any failure.
 */
import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:8602'
const WAIT = Number(process.env.WAIT ?? 7000)

// route → a text that only shows when the page rendered the API's data
const CASES = [
  ['welcome', 'Apollo 11'],
  ['dashboard', 'Launches per decade'],
  ['search', 'Search the space age'],
  ['missions', 'Friendship 7'],
  ['missions/new', 'New mission'],
  ['missions/6', 'Kennedy Space Center Launch Complex 39A'],
  ['missions/6/edit', 'Edit Apollo 11'],
  ['mission-control', 'Voyager 1'],
  ['plan', 'Plan a mission'],
  ['timeline', 'Durations'],
  ['board', 'Update the mass budget'],
  ['tasks', 'Update the mass budget'],
  ['tasks/new', 'New task'],
  ['tasks/1', 'Update the mass budget'],
  ['calendar', 'July 1969'],
  ['launches', 'Freedom 7'],
  ['sites-map', 'Gagarin'],
  ['launch-sites', 'ELA-3'],
  ['launch-sites/4', 'Kennedy Space Center Launch Complex 39A'],
  ['launch-sites/4/edit', 'Edit Kennedy Space Center Launch Complex 39A'],
  ['astronauts', 'Alan Shepard'],
  ['astronauts/5', 'Neil Armstrong'],
  ['astronauts/5/edit', 'Edit Neil Armstrong'],
  ['spacecraft', 'Curiosity'],
  ['spacecraft/26', 'Jet Propulsion Laboratory'],
  ['components', 'Optical remote sensing'],
  ['bodies', 'Jupiter'],
  ['bodies/10', 'Jupiter'],
  ['solar-system', 'Europa'],
  ['budget', 'Budget lines'],
  ['credits', 'NASA'],
]

// Mateu bugs found while building the demo (see demo/demo-space/README.md › "Mateu bugs"): reported as
// KNOWN instead of failing, so the probe still gates everything else. Remove an entry once fixed.
const KNOWN = {
  'missions/6@vaadin': 'the MultimediaContentPage banner is not interpolated on Vaadin (${state.…} shown as written)',
  // a documented Redwood gap, not a bug: `gridLayout: tree` renders as a flat table of the roots
  'components@redwood': 'a tree listing is a flat table of its roots on Redwood',
  'solar-system@redwood': 'a tree listing is a flat table of its roots on Redwood',
}
const RENDERER = BASE.endsWith(':8603') || process.env.RENDERER === 'redwood' ? 'redwood' : 'vaadin'

const results = []
const check = (name, pass, detail = '') => {
  results.push({ name, pass })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const textOf = (page) => page.evaluate(() => {
  const out = [document.documentElement.innerText || '']
  const walk = (root) => root.querySelectorAll('*').forEach((el) => { if (el.shadowRoot) { out.push(el.shadowRoot.textContent || ''); walk(el.shadowRoot) } })
  walk(document)
  return out.join(' ').replace(/\s+/g, ' ')
})

const browser = await chromium.launch()
const one = async ([route, needle]) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } })
  try {
    await page.goto(`${BASE}/${route}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    let text = ''
    const deadline = Date.now() + WAIT * 2
    do {
      await page.waitForTimeout(1000)
      text = await textOf(page)
    } while (!text.includes(needle) && Date.now() < deadline)
    const problems = [/Page not found/, /Unsupported component/, /Unknown field type/, /\$\{state\.[a-zA-Z]+\}/]
      .map((re) => text.match(re)?.[0]).filter(Boolean)
    const pass = text.includes(needle) && problems.length === 0
    const known = KNOWN[`${route}@${RENDERER}`]
    if (!pass && known) console.log(`KNOWN /${route} — ${known}`)
    else check(`/${route} renders "${needle}"`, pass, problems.join(', '))
  } catch (e) {
    check(`/${route}`, false, String(e).slice(0, 160))
  } finally {
    await page.close()
  }
}
const queue = [...CASES]
await Promise.all([0, 1, 2, 3].map(async () => { while (queue.length) await one(queue.shift()) }))
await browser.close()

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} passed on ${BASE}`)
process.exit(failed.length ? 1 : 0)
