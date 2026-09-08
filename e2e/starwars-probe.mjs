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
  species: [
    { id: 1, name: 'Wookiee', classification: 'mammal', designation: 'sentient', language: 'Shyriiwook', averageHeight: 210, averageLifespan: 400, homeworldId: 14, homeworldName: 'Kashyyyk' },
    { id: 2, name: 'Droid', classification: 'artificial', designation: 'sentient', language: 'n/a', averageHeight: null, averageLifespan: null },
  ],
  vehicles: [
    { id: 1, name: 'AT-AT', model: 'All Terrain Armored Transport', manufacturer: 'Kuat Drive Yards', vehicleClass: 'assault walker', crew: '5', passengers: 40, costInCredits: null },
    { id: 2, name: 'Snowspeeder', model: 't-47 airspeeder', manufacturer: 'Incom corporation', vehicleClass: 'airspeeder', crew: '2', passengers: 0, costInCredits: null },
  ],
  starships: [
    { id: 1, name: 'Millennium Falcon', model: 'YT-1300 light freighter', manufacturer: 'Corellian Engineering Corporation', starshipClass: 'Light freighter', hyperdriveRating: 0.5, mglt: 75, passengers: 6 },
    { id: 2, name: 'X-wing', model: 'T-65 X-wing', manufacturer: 'Incom Corporation', starshipClass: 'Starfighter', hyperdriveRating: 1.0, mglt: 100, passengers: 0 },
  ],
}

/**
 * Answers like the service does: the conditions in the query string are applied HERE, and the
 * response is the paged envelope. A total larger than the rows returned is deliberate — it is what
 * proves the renderer takes the server's count instead of counting the array it was handed.
 */
const envelope = (key, url) => {
  // A record route asks for /api/<collection>/<id> and expects the bare object, not a page.
  const byId = new URL(url).pathname.match(new RegExp(`/api/${key}/(\\d+)$`))
  if (byId) return ROWS[key].find(r => String(r.id) === byId[1]) ?? null
  const q = new URL(url).searchParams
  let rows = ROWS[key]
  const search = (q.get('search') ?? '').toLowerCase()
  if (search) rows = rows.filter(r => Object.values(r).some(v => String(v ?? '').toLowerCase().includes(search)))
  const gender = (q.get('gender') ?? '').split(',').filter(Boolean)
  if (gender.length) rows = rows.filter(r => gender.includes(r.gender))
  const from = q.get('height_from')
  if (from) rows = rows.filter(r => Number(r.height) >= Number(from))
  for (const field of ['vehicleClass', 'starshipClass']) {
    const wanted = (q.get(field) ?? '').toLowerCase()
    if (wanted) rows = rows.filter(r => String(r[field] ?? '').toLowerCase().includes(wanted))
  }
  const classification = (q.get('classification') ?? '').split(',').filter(Boolean)
  if (classification.length) rows = rows.filter(r => classification.includes(r.classification))
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

  // All six collections the service publishes — the app is only complete if every one of them is
  // reachable and mapped, and a page that renders its chrome with no rows looks identical to a
  // working one until you count.
  const cases = [
    { route: 'people', rows: 3, needle: 'Luke Skywalker' },
    { route: 'planets', rows: 2, needle: 'Tatooine' },
    { route: 'films', rows: 2, needle: 'A New Hope' },
    { route: 'species', rows: 2, needle: 'Wookiee' },
    { route: 'vehicles', rows: 2, needle: 'Snowspeeder' },
    { route: 'starships', rows: 2, needle: 'Millennium Falcon' },
  ]

  for (const c of cases) {
    await page.goto(`${BASE}/${c.route}`, { waitUntil: 'load' })
    await page.waitForTimeout(3000)
    const text = await deepText()
    const len = await gridLen()
    check(`/${c.route} renders "${c.needle}" from the external source`, text.includes(c.needle), `grid rows=${len}`)
    check(`/${c.route} mapped every fixture row into the grid`, len === c.rows, `${len}/${c.rows}`)
  }

  // A row is the entrance to the record: the identifier column is a real anchor, and following it
  // lands on a page with its own URL. That URL is the point — a masterDetail pane showed the same
  // record and could be neither shared nor reloaded.
  await page.goto(`${BASE}/people`, { waitUntil: 'load' })
  await page.waitForTimeout(3000)
  const anchor = await page.evaluate(() => {
    let a = null
    const walk = (r) => {
      r.querySelectorAll('a').forEach((x) => { if ((x.textContent || '').trim() === 'Luke Skywalker') a = x })
      r.querySelectorAll('*').forEach((e) => e.shadowRoot && walk(e.shadowRoot))
    }
    walk(document)
    if (!a) return null
    const rect = a.getBoundingClientRect()
    return { href: a.getAttribute('href'), x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
  })
  check('the identifier column is a link to the record', anchor?.href === '/people/1', JSON.stringify(anchor?.href))

  if (anchor) {
    await page.mouse.click(anchor.x, anchor.y)
    await page.waitForTimeout(3000)
    const landed = await page.evaluate(() => {
      const buttons = []
      const walk = (r) => {
        r.querySelectorAll('vaadin-button').forEach((x) => buttons.push((x.textContent || '').trim()))
        r.querySelectorAll('*').forEach((e) => e.shadowRoot && walk(e.shadowRoot))
      }
      walk(document)
      return buttons
    })
    check(
      'following it opens the record page, with the actions its YAML declares',
      new URL(page.url()).pathname === '/people/1' && landed.includes('Edit'),
      `url=${new URL(page.url()).pathname} botones=${JSON.stringify(landed)}`,
    )
  }

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
    { label: 'Species', route: 'species', rows: 2, needle: 'Wookiee' },
    { label: 'Vehicles', route: 'vehicles', rows: 2, needle: 'Snowspeeder' },
    { label: 'Starships', route: 'starships', rows: 2, needle: 'Millennium Falcon' },
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

  // Enter on the search box, and the filter bar's own event path. Both go through
  // `mateu-table-crud.search`, which is NOT the method the checks above drive: those call
  // `handleSearchRequested` directly, one layer below what a user touches — which is exactly why
  // they stayed green while `search` dispatched a server action a definition-only page has nobody
  // to answer, and the screen did not react to Enter at all.
  await page.goto(`${BASE}/people`, { waitUntil: 'load' })
  await page.waitForTimeout(3000)

  const searchBox = await page.evaluate(() => {
    let input = null
    const walk = (r) => {
      r.querySelectorAll('input').forEach((x) => {
        if (!input && (x.placeholder || '').toLowerCase().includes('search')) input = x
      })
      r.querySelectorAll('*').forEach((e) => e.shadowRoot && walk(e.shadowRoot))
    }
    walk(document)
    if (!input) return null
    const rect = input.getBoundingClientRect()
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
  })
  check('the listing has a search box', !!searchBox)

  if (searchBox) {
    await page.mouse.click(searchBox.x, searchBox.y)
    await page.keyboard.type('sky')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(2500)
    const names = await rowNames()
    check('Enter in the search box runs the search', JSON.stringify(names) === JSON.stringify(['Luke Skywalker']), JSON.stringify(names))
  }

  // The filter bar reaches the crud through this pair; driving it is what a chip or a checked
  // option does.
  await page.evaluate(() => {
    let bar = null
    const walk = (r) => {
      const f = r.querySelector('mateu-filter-bar')
      if (f) bar = f
      r.querySelectorAll('*').forEach((e) => e.shadowRoot && walk(e.shadowRoot))
    }
    walk(document)
    // clear the keyword the Enter check left behind, or this asks for female Skywalkers
    bar?.dispatchEvent(new CustomEvent('value-changed', { detail: { fieldId: 'searchText', value: '' }, bubbles: true, composed: true }))
    bar?.dispatchEvent(new CustomEvent('value-changed', { detail: { fieldId: 'gender', value: ['female'] }, bubbles: true, composed: true }))
    bar?.dispatchEvent(new CustomEvent('search-requested', { detail: {}, bubbles: true, composed: true }))
  })
  await page.waitForTimeout(2500)
  check('the filter bar runs the search too', JSON.stringify(await rowNames()) === JSON.stringify(['Leia Organa']), JSON.stringify(await rowNames()))

  // Selecting a row. The grid tells its rows apart by `_rowNumber`, an identity the SERVER stamps on
  // the rows it produces — rows fetched from an endpoint had none, so every row read as the SAME row
  // and checking one showed all twenty checked. The selection underneath was right; the screen was
  // what lied, which is why counting `selectedItems` alone would never have caught it.
  await page.goto(`${BASE}/people`, { waitUntil: 'load' })
  await page.waitForTimeout(3000)

  const checkboxes = () =>
    page.evaluate(() => {
      const boxes = []
      const walk = (r) => {
        r.querySelectorAll('vaadin-checkbox').forEach((x) => {
          if (x.getBoundingClientRect().width > 0) boxes.push({ checked: !!x.checked, indeterminate: !!x.indeterminate })
        })
        r.querySelectorAll('*').forEach((e) => e.shadowRoot && walk(e.shadowRoot))
      }
      walk(document)
      return boxes
    })

  const firstRowBox = await page.evaluate(() => {
    const boxes = []
    const walk = (r) => {
      r.querySelectorAll('vaadin-checkbox').forEach((x) => { if (x.getBoundingClientRect().width > 0) boxes.push(x) })
      r.querySelectorAll('*').forEach((e) => e.shadowRoot && walk(e.shadowRoot))
    }
    walk(document)
    if (boxes.length < 2) return null
    const rect = boxes[1].getBoundingClientRect()   // [0] is the select-all in the header
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, total: boxes.length }
  })
  check('the listing offers a checkbox per row', (firstRowBox?.total ?? 0) > 2, `${firstRowBox?.total} casillas`)

  if (firstRowBox) {
    await page.mouse.click(firstRowBox.x, firstRowBox.y)
    await page.waitForTimeout(1200)
    const boxes = await checkboxes()
    // exactly one ROW checked; the select-all goes indeterminate, which is what a partial selection
    // is supposed to look like
    const rowsChecked = boxes.filter((b) => b.checked && !b.indeterminate).length
    const selected = await page.evaluate(() => {
      let el = null
      const walk = (r) => {
        const f = r.querySelector('mateu-table-crud')
        if (f) el = f
        r.querySelectorAll('*').forEach((e) => e.shadowRoot && walk(e.shadowRoot))
      }
      walk(document)
      return (el?.state?.crud_selected_items ?? []).length
    })
    check(
      'selecting ONE row checks one row, not all of them',
      rowsChecked === 1 && selected === 1,
      `marcadas=${rowsChecked} seleccionadas=${selected} de ${boxes.length} casillas`,
    )
  }

  await page.close()
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
