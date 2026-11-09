// The Explorer probe: opens EVERY entry page in a real browser and checks that it works.
//
//   cd demo/demo-explorer && mvn test        (writes target/explorer-entries.json, the list it opens)
//   start the Explorer (mvn spring-boot:run, or remotes/run.sh for the distributed entries too)
//   node e2e/explorer-probe.mjs
//
// Per entry: the page loads with no console error, no error marker ("Unknown metadata type",
// "Page not found", "Something went wrong"…), every example card shows something besides its title,
// and the Code tabs are there and not empty. An entry that fails but declares a `knownIssue:` is
// REPORTED, not failed (KNOWN_BUGS=strict fails on them too). What an example does ON PURPOSE (a
// 403 of a permissions demo, a down remote) is listed in the entry's `probeAllows:`.
//
// Env: EXPLORER_URL (default http://localhost:${EXPLORER_PORT:-8640}), PROBE_ONLY=<substring of a
// route>, PROBE_CONCURRENCY (4), PROBE_REPORT=<file> (a markdown summary), PLAYWRIGHT_FROM=<dir
// whose node_modules has playwright> (default: the repo's e2e/).
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const require = createRequire(resolve(process.env.PLAYWRIGHT_FROM || resolve(here, '../../../e2e'), 'package.json'))
const { chromium } = require('playwright')

const EXPLORER = process.env.EXPLORER_URL || `http://localhost:${process.env.EXPLORER_PORT || 8640}`
const strict = process.env.KNOWN_BUGS === 'strict'
const only = process.env.PROBE_ONLY
const concurrency = Number(process.env.PROBE_CONCURRENCY || 4)
const manifest = resolve(here, '../target/explorer-entries.json')

let entries
try {
  entries = JSON.parse(readFileSync(manifest, 'utf8'))
} catch {
  console.error(`No ${manifest}: run "mvn test" in demo/demo-explorer first.`)
  process.exit(2)
}
if (only) entries = entries.filter((e) => e.route.includes(only))

// texts that mean the screen is broken, wherever they appear above the Code tabs
const ERROR_MARKERS = [
  'Unknown metadata type',
  'Page not found',
  'Something went wrong',
  'An unexpected error occurred',
  'Cannot build ',
  'was not found in the jar',
  'There is no Explorer entry',
]
// console noise that is not the page's fault
const IGNORED_CONSOLE = [
  /Download the React DevTools/,
  /\[vite\]/,
  /favicon\.ico/,
]

const browser = await chromium.launch()

/** Deep text of the page and of every card, shadow roots and slots included. */
const snapshot = (page) =>
  page.evaluate(() => {
    const textOf = (root) => {
      const out = []
      const walk = (n) => {
        if (n.nodeType === 3) {
          const t = n.textContent.trim()
          if (t) out.push(t)
          return
        }
        if (n.nodeType !== 1 && n.nodeType !== 11) return
        if (n.nodeType === 1 && ['STYLE', 'SCRIPT', 'TEMPLATE'].includes(n.tagName)) return
        if (n.shadowRoot) {
          walk(n.shadowRoot)
          return
        }
        if (n.tagName === 'SLOT') {
          n.assignedNodes().forEach(walk)
          return
        }
        n.childNodes.forEach(walk)
      }
      walk(root)
      return out.join(' | ')
    }
    const cards = []
    const visit = (n) => {
      if (n.nodeType !== 1 && n.nodeType !== 11) return
      if (n.nodeType === 1 && n.tagName === 'VAADIN-CARD') {
        const r = n.getBoundingClientRect()
        const titleEl = [...n.children].find((c) => c.getAttribute('slot') === 'title')
        const title = titleEl ? textOf(titleEl) : n.getAttribute('card-title') || ''
        const all = textOf(n)
        const body = all.startsWith(title) ? all.slice(title.length).replace(/^ \| /, '') : all
        cards.push({ title, body, visible: r.width > 0 && r.height > 0, height: r.height })
      }
      if (n.shadowRoot) visit(n.shadowRoot)
      n.childNodes.forEach(visit)
    }
    visit(document.body)
    return { text: textOf(document.body), cards }
  })

const probe = async (entry) => {
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 2000 } })
  const page = await ctx.newPage()
  const consoleErrors = []
  const failedCalls = []
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const t = m.text()
    if (IGNORED_CONSOLE.some((r) => r.test(t))) return
    consoleErrors.push(t.slice(0, 300))
  })
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${String(e.message).slice(0, 300)}`))
  page.on('response', (r) => {
    if (r.url().includes('/mateu/') && r.status() >= 500) failedCalls.push(`${r.status()} ${r.url()}`)
  })
  const problems = []
  let snap = { text: '', cards: [] }
  try {
    await page.goto(`${EXPLORER}/${entry.route}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    // settle: the title is drawn, every example card has content (islands load on their own)
    const until = Date.now() + 25000
    for (;;) {
      await page.waitForTimeout(500)
      snap = await snapshot(page)
      const ready =
        snap.text.includes(entry.title) &&
        entry.examples.every((t) => cardOf(snap, t)?.body) &&
        (entry.codeFiles === 0 || codeOf(snap.text).length > 0)
      if (ready || Date.now() > until) break
    }
    await page.waitForTimeout(1000) // late errors
    snap = await snapshot(page)
  } catch (e) {
    problems.push(`load: ${String(e.message).split('\n')[0]}`)
  }
  const body = aboveCode(snap.text)
  const allowed = (text) => (entry.probeAllows || []).some((a) => text.includes(a))
  if (!snap.text.includes(entry.title)) problems.push('the entry title is not drawn')
  // error texts are looked for where the examples run (an entry's description may quote them)
  const drawn = snap.cards.length ? snap.cards.map((c) => c.body).join(' | ') : body
  for (const m of ERROR_MARKERS) if (drawn.includes(m) && !allowed(m)) problems.push(`shows "${m}"`)
  for (const t of entry.examples) {
    const card = cardOf(snap, t)
    if (!card) problems.push(`example "${t}": no card (cards: ${snap.cards.map((c) => c.title.slice(0, 40)).join(" / ")})`)
    else if (!card.body) problems.push(`example "${t}": the card is empty`)
    else if (!card.visible) problems.push(`example "${t}": the card is not visible`)
  }
  if (entry.notDemonstrable && !body.includes('Not demonstrable live')) problems.push('no "not demonstrable" notice')
  if (entry.codeFiles > 0) {
    const code = codeOf(snap.text)
    if (!code) problems.push('no Code tabs')
    else if (code.length < 40) problems.push('the Code tab is (almost) empty')
  }
  for (const c of consoleErrors) if (!allowed(c)) problems.push(`console: ${c}`)
  for (const c of failedCalls) problems.push(`server error: ${c}`)
  await ctx.close()
  const status = problems.length === 0 ? 'pass' : entry.knownIssue && !strict ? 'known' : 'fail'
  return { entry, status, problems }
}

function aboveCode(text) {
  const i = text.lastIndexOf(' | Code | ')
  return i > 0 ? text.slice(0, i) : text
}
function codeOf(text) {
  const i = text.lastIndexOf(' | Code | ')
  return i > 0 ? text.slice(i + ' | Code | '.length) : ''
}
// An example's card: the vaadin-card titled like it (its title slot). It has a body when it draws
// some text besides its title or, for content with no text (a chart, an image), is taller than a
// bare title.
function cardOf(snap, title) {
  const card = snap.cards.find((c) => c.title === title)
  if (!card) return null
  return { ...card, body: card.body.trim().length > 0 || card.height > 120 }
}

console.log(`Explorer ${EXPLORER} · ${entries.length} entries · concurrency ${concurrency}`)
const results = []
const queue = [...entries]
await Promise.all(
  Array.from({ length: concurrency }, async () => {
    while (queue.length) {
      const entry = queue.shift()
      const r = await probe(entry)
      results.push(r)
      const mark = { pass: '✓', known: '!', fail: '✗' }[r.status]
      console.log(`  ${mark} ${entry.route}${r.status === 'known' ? '  [known issue]' : ''}`)
      for (const p of r.problems) console.log(`      ${p}`)
    }
  }),
)
await browser.close()

results.sort((a, b) => a.entry.route.localeCompare(b.entry.route))
const count = (s) => results.filter((r) => r.status === s).length
const areas = [...new Set(results.map((r) => r.entry.route.split('/')[0]))]
const lines = [
  `| Area | Entries | Pass | Failed, known issue (reported) | Fail | Known issues declared |`,
  `|---|---|---|---|---|---|`,
  ...areas.map((a) => {
    const rs = results.filter((r) => r.entry.route.startsWith(a + '/'))
    const c = (s) => rs.filter((r) => r.status === s).length
    return `| ${a} | ${rs.length} | ${c('pass')} | ${c('known')} | ${c('fail')} | ${rs.filter((r) => r.entry.knownIssue).length} |`
  }),
  `| **total** | **${results.length}** | **${count('pass')}** | **${count('known')}** | **${count('fail')}** | **${results.filter((r) => r.entry.knownIssue).length}** |`,
]
const failing = results.filter((r) => r.status !== 'pass')
const detail = failing.map(
  (r) =>
    `- ${r.status === 'known' ? 'known issue' : '**FAIL**'} \`${r.entry.route}\`: ${r.problems.join('; ').slice(0, 400)}`,
)
console.log('\n' + lines.join('\n'))
if (process.env.PROBE_REPORT) writeFileSync(process.env.PROBE_REPORT, [...lines, '', ...detail, ''].join('\n'))
process.exit(count('fail') > 0 ? 1 : 0)
