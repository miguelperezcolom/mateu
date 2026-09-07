/**
 * Star Wars DSL-app probe — validates example 1 of the progressive example suite: a 100%-DSL Mateu
 * app (NO Java @UI class) that renders listings over an existing external API.
 *
 * It boots against the running demo (demo/demo-starwars on :8600) and asserts the three YAML-authored
 * listings render rows mapped from a named REST source. The external endpoints (swapi.info) are
 * INTERCEPTED and answered from local fixtures, so the probe validates OUR pipeline — YAML mount →
 * app shell → `type: Listing` with a rowsSource ref → source catalogue → external fetch → row
 * mapping → grid — deterministically, without depending on the Star Wars API's (famously flaky)
 * uptime. Run the demo pointed at the real API for a live view; the probe pins the mechanism.
 *
 *   cd demo/demo-starwars && mvn -s ../../settings.xml spring-boot:run   # or java -jar target/*.jar
 *   cd e2e && node starwars-probe.mjs
 *
 * Exits non-zero on any failure, so it gates changes to the DSL/listing/external-source pipeline.
 */
import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:8600'

const FIXTURES = {
  people: [
    { name: 'Luke Skywalker', gender: 'male', birth_year: '19BBY', height: '172', mass: '77', hair_color: 'blond', eye_color: 'blue' },
    { name: 'Leia Organa', gender: 'female', birth_year: '19BBY', height: '150', mass: '49', hair_color: 'brown', eye_color: 'brown' },
    { name: 'Darth Vader', gender: 'male', birth_year: '41.9BBY', height: '202', mass: '136', hair_color: 'none', eye_color: 'yellow' },
  ],
  planets: [
    { name: 'Tatooine', climate: 'arid', terrain: 'desert', population: '200000', diameter: '10465' },
    { name: 'Hoth', climate: 'frozen', terrain: 'tundra, ice caves', population: 'unknown', diameter: '7200' },
  ],
  films: [
    { episode_id: 4, title: 'A New Hope', director: 'George Lucas', producer: 'Gary Kurtz', release_date: '1977-05-25' },
    { episode_id: 5, title: 'The Empire Strikes Back', director: 'Irvin Kershner', producer: 'Gary Kurtz', release_date: '1980-05-17' },
  ],
}

const results = []
const check = (name, pass, detail = '') => {
  results.push({ name, pass })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  // Answer each SWAPI collection from a local fixture — deterministic, no live-host dependency.
  // `fetched` records which collections were actually asked for, so a check can assert that a
  // screen went and got ITS OWN rows rather than merely rendering someone else's.
  const fetched = []
  for (const key of Object.keys(FIXTURES)) {
    await page.route(`**/swapi.info/api/${key}**`, (route) => {
      fetched.push(key)
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FIXTURES[key]) })
    })
  }

  const deepText = () =>
    page.evaluate(() => {
      const out = []
      const walk = (root) => {
        out.push(root.textContent || '')
        root.querySelectorAll('*').forEach((el) => el.shadowRoot && walk(el.shadowRoot))
      }
      walk(document)
      return out.join(' ')
    })

  const gridLen = () =>
    page.evaluate(() => {
      let el = null
      const walk = (r) => {
        const f = r.querySelector('mateu-table-crud')
        if (f) el = f
        r.querySelectorAll('*').forEach((e) => e.shadowRoot && walk(e.shadowRoot))
      }
      walk(document)
      return el?.data?.[el.id]?.page?.content?.length ?? 0
    })

  const cases = [
    { route: 'people', rows: 3, needle: 'Luke Skywalker' },
    { route: 'planets', rows: 2, needle: 'Tatooine' },
    { route: 'films', rows: 2, needle: 'A New Hope' },
  ]

  for (const c of cases) {
    await page.goto(`${BASE}/${c.route}`, { waitUntil: 'load' })
    await page.waitForTimeout(3000)
    const text = await deepText()
    const len = await gridLen()
    check(`/${c.route} renders "${c.needle}" from the external source`, text.includes(c.needle), `grid rows=${len}`)
    check(`/${c.route} mapped every fixture row into the grid`, len === c.rows, `${len}/${c.rows}`)
  }

  // People is a master-detail listing: clicking a person shows their full record in the detail
  // pane, entirely from the already-fetched rows (no re-fetch, no id).
  await page.goto(`${BASE}/people`, { waitUntil: 'load' })
  await page.waitForTimeout(3000)
  const selected = await page.evaluate(() => {
    let el = null
    const walk = (r) => {
      const f = r.querySelector('mateu-table-crud')
      if (f) el = f
      r.querySelectorAll('*').forEach((e) => e.shadowRoot && walk(e.shadowRoot))
    }
    walk(document)
    if (!el) return { err: 'no table-crud' }
    const root = el.shadowRoot || el
    const cell = [...root.querySelectorAll('*')].find(
      (n) => /Luke Skywalker/.test(n.textContent) && n.children.length === 0,
    )
    if (!cell) return { err: 'no row cell' }
    cell.click()
    return { name: el.selectedItem?.name, hair: el.selectedItem?.hair_color }
  })
  check(
    'People master-detail: clicking a person selects their full record',
    selected.name === 'Luke Skywalker' && selected.hair === 'blond',
    JSON.stringify(selected),
  )

  // Navigating by MENU CLICK, which is not the same path as a URL load: the shell stays mounted and
  // re-points the listing element in place. Every YAML listing arrives under the same component id
  // ("crud" — CrudlMapper's fallback for a listing that declares none), so an element reused across
  // two screens can look like the same listing re-rendering and skip fetching the new source. That
  // is invisible to the URL-load cases above, and it left every screen after the first one empty.
  await page.goto(BASE, { waitUntil: 'load' })
  await page.waitForTimeout(3000)

  const clickMenu = (label) =>
    page.evaluate((wanted) => {
      const found = []
      const walk = (r) =>
        r.querySelectorAll('*').forEach((e) => {
          if ((e.textContent || '').trim() === wanted && e.children.length === 0) found.push(e)
          e.shadowRoot && walk(e.shadowRoot)
        })
      walk(document)
      if (!found.length) return false
      found[0].click()
      return true
    }, label)

  for (const c of [
    { label: 'Planets', route: 'planets', rows: 2, needle: 'Tatooine' },
    { label: 'Films', route: 'films', rows: 2, needle: 'A New Hope' },
    { label: 'People', route: 'people', rows: 3, needle: 'Luke Skywalker' },
  ]) {
    fetched.length = 0
    const clicked = await clickMenu(c.label)
    await page.waitForTimeout(4000)
    const text = await deepText()
    const len = await gridLen()
    const path = new URL(page.url()).pathname
    check(`menu "${c.label}" navigates to /${c.route}`, clicked && path === `/${c.route}`, `clicked=${clicked} url=${path}`)
    check(
      `menu "${c.label}" fetches its own source and renders "${c.needle}"`,
      text.includes(c.needle) && len === c.rows && fetched.includes(c.route),
      `rows=${len}/${c.rows} fetched=[${fetched}]`,
    )
  }

  await page.close()
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
