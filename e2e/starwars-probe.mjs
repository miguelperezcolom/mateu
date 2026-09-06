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
    { name: 'Luke Skywalker', gender: 'male', birth_year: '19BBY', height: '172', mass: '77' },
    { name: 'Leia Organa', gender: 'female', birth_year: '19BBY', height: '150', mass: '49' },
    { name: 'Darth Vader', gender: 'male', birth_year: '41.9BBY', height: '202', mass: '136' },
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
  for (const key of Object.keys(FIXTURES)) {
    await page.route(`**/swapi.info/api/${key}**`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FIXTURES[key]) }),
    )
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

  await page.close()
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
