/**
 * Star Wars DSL-app probe — validates example 1 of the progressive example suite: a 100%-DSL Mateu
 * app (NO Java @UI class) that renders listings over an external API.
 *
 * It boots against the running demo (demo/demo-starwars on :8600) and asserts the three YAML-authored
 * listings render rows mapped from a named REST source. The external endpoints are INTERCEPTED and
 * answered from local fixtures, so the probe validates OUR pipeline — YAML mount → app shell →
 * `type: Listing` with a rowsSource ref → source catalogue → external fetch → row mapping → grid —
 * deterministically, without depending on a live host's uptime.
 *
 * The demo points at swapi.ec1.mateu.io, a writable clone that searches, filters and pages on the
 * SERVER, so the fixtures answer the paged envelope (`content` + `totalElements`) and the checks
 * below assert the page is rendered as given — not re-filtered or re-sliced in the browser.
 *
 *   cd demo/demo-starwars && mvn -s ../../settings.xml spring-boot:run   # or java -jar target/*.jar
 *   cd e2e && node starwars-probe.mjs
 *
 * Exits non-zero on any failure, so it gates changes to the DSL/listing/external-source pipeline.
 */
import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:8600'

// The rows as the service serves them: camelCase, typed numbers, and the homeworld's NAME beside
// its id — the whole point of a backend that knows about references.
const ROWS = {
  people: [
    { id: 1, name: 'Luke Skywalker', gender: 'male', birthYear: '19BBY', height: 172, mass: 77, hairColor: 'blond', eyeColor: 'blue', homeworldId: 1, homeworldName: 'Tatooine' },
    { id: 2, name: 'Leia Organa', gender: 'female', birthYear: '19BBY', height: 150, mass: 49, hairColor: 'brown', eyeColor: 'brown', homeworldId: 2, homeworldName: 'Alderaan' },
    { id: 3, name: 'Darth Vader', gender: 'male', birthYear: '41.9BBY', height: 202, mass: 136, hairColor: 'none', eyeColor: 'yellow', homeworldId: 1, homeworldName: 'Tatooine' },
  ],
  planets: [
    { id: 1, name: 'Tatooine', climate: 'arid', terrain: 'desert', population: 200000, diameter: 10465 },
    { id: 2, name: 'Hoth', climate: 'frozen', terrain: 'tundra, ice caves', population: null, diameter: 7200 },
  ],
  films: [
    { id: 1, episodeId: 4, title: 'A New Hope', director: 'George Lucas', producer: 'Gary Kurtz', releaseDate: '1977-05-25' },
    { id: 2, episodeId: 5, title: 'The Empire Strikes Back', director: 'Irvin Kershner', producer: 'Gary Kurtz', releaseDate: '1980-05-17' },
  ],
}

/**
 * Answers like the service does: the conditions in the query string are applied HERE, and the
 * response is the paged envelope. A total larger than the rows returned is deliberate — it is what
 * proves the renderer takes the server's count instead of counting the array it was handed.
 */
const envelope = (key, url) => {
  const q = new URL(url).searchParams
  let rows = ROWS[key]
  const search = (q.get('search') ?? '').toLowerCase()
  if (search) rows = rows.filter(r => Object.values(r).some(v => String(v ?? '').toLowerCase().includes(search)))
  const gender = (q.get('gender') ?? '').split(',').filter(Boolean)
  if (gender.length) rows = rows.filter(r => gender.includes(r.gender))
  const from = q.get('height_from')
  if (from) rows = rows.filter(r => Number(r.height) >= Number(from))
  return { content: rows, totalElements: rows.length, totalPages: 1, page: 0, size: 20 }
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
  for (const key of Object.keys(ROWS)) {
    await page.route(`**/api/${key}**`, (route) => {
      fetched.push(key)
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(envelope(key, route.request().url())),
      })
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
    return { name: el.selectedItem?.name, hair: el.selectedItem?.hairColor, home: el.selectedItem?.homeworldName }
  })
  check(
    'People master-detail: clicking a person selects their full record, reference included',
    selected.name === 'Luke Skywalker' && selected.hair === 'blond' && selected.home === 'Tatooine',
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

  // The declared filters (people.yaml) travel to the SERVER in the url, through the `${state.…}`
  // interpolation in sources.yaml, and the page that comes back is rendered as given. Driving the
  // state directly is the same path the filter bar takes — it writes `<id>`, `<id>_from` and
  // `<id>_to`, and a multi-select as a list.
  await page.goto(`${BASE}/people`, { waitUntil: 'load' })
  await page.waitForTimeout(3000)

  const applyFilters = (patch) =>
    page.evaluate((values) => {
      let el = null
      const walk = (r) => {
        const f = r.querySelector('mateu-table-crud')
        if (f) el = f
        r.querySelectorAll('*').forEach((e) => e.shadowRoot && walk(e.shadowRoot))
      }
      walk(document)
      if (!el) return false
      el.state = { ...el.state, ...values }
      el.handleSearchRequested(undefined)
      return true
    }, patch)

  const rowNames = () =>
    page.evaluate(() => {
      let el = null
      const walk = (r) => {
        const f = r.querySelector('mateu-table-crud')
        if (f) el = f
        r.querySelectorAll('*').forEach((e) => e.shadowRoot && walk(e.shadowRoot))
      }
      walk(document)
      return (el?.data?.[el.id]?.page?.content ?? []).map((row) => row.name)
    })

  for (const c of [
    { what: 'free text searches the visible columns', patch: { searchText: 'sky' }, expected: ['Luke Skywalker'] },
    { what: 'a multi-select filter takes any picked value', patch: { searchText: '', gender: ['female'] }, expected: ['Leia Organa'] },
    { what: 'a number range reaches the server as a bound', patch: { gender: [], height_from: '200' }, expected: ['Darth Vader'] },
    { what: 'a multi-select travels as one comma-joined parameter', patch: { height_from: '', gender: ['male', 'female'] }, expected: ['Luke Skywalker', 'Leia Organa', 'Darth Vader'] },
    { what: 'text and filters combine — every condition holds', patch: { searchText: 'Skywalker', gender: ['male'] }, expected: ['Luke Skywalker'] },
  ]) {
    await applyFilters(c.patch)
    await page.waitForTimeout(1500)
    const got = await rowNames()
    check(`filters: ${c.what}`, JSON.stringify(got) === JSON.stringify(c.expected), `got ${JSON.stringify(got)}`)
  }

  await page.close()
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
