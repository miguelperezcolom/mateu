// Display atoms, listings and visualisation the Mateu Explorer review (3.0-beta.57, Redwood) found
// drawn short of the wire / the web renderer: progress and checklists, KPIs, offers and pickers,
// charts, boards, the org chart and calendars, and the listings. Each test pins the projection (and,
// where the markup decides, the template).
// Run: node test-explorer-display.mjs (npm test runs it with the other suites).
import './test-locale.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { islandContentOf, planningAtomOf, ganttAtomOf, chartAtomOf, orgChartAtomOf, setOrgHierarchyProviderFactory, GROUP_ROW_PREFIX, planningActionOf } from './reduceContexts.mjs'
import { calendarAtomOf, spCalendarElsewhere } from './calendar.mjs'
import { paymentParametersOf } from './displayDom.mjs'

const here = dirname(fileURLToPath(import.meta.url))
let passed = 0
const pending = []
const test = (name, fn) => {
  const done = () => { passed++; console.log('  ✓ ' + name) }
  const r = fn()
  if (r && r.then) pending.push(r.then(done))
  else done()
}
const node = (metadata, children = [], id = '') => ({ type: 'ClientSide', id: id || metadata.id || '', metadata, children })
const atomsOf = (tree, state = {}, data = {}) =>
  (islandContentOf({ tree, state, data }) || []).flatMap((b) => b.items || [])
const one = (metadata, flag) => atomsOf(node({ type: 'VerticalLayout' }, [node(metadata)])).find((a) => a[flag])
const template = () => readFileSync(join(here, 'templates', 'atoms.html'), 'utf8')
const css = () => readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'resources', 'css', 'app.css'), 'utf8')

test('a ProgressBar / Checklist bar is oj-c-progress-bar (the legacy oj-progress-bar never upgraded: 0px)', () => {
  const t = template()
  assert.doesNotMatch(t, /<oj-progress-bar\b/)
  assert.match(t, /<oj-c-progress-bar :class="\[\[ \$current\.data\.barClass \]\]"/)
})

test('ProgressSteps: done steps are visited (confirmation), descriptions / vertical get our own step list', () => {
  const steps = [
    { id: 's1', title: 'Identity', description: 'Documents scanned', status: 'done' },
    { id: 's2', title: 'Room', status: 'current' },
    { id: 's3', title: 'Welcome', status: 'upcoming' },
  ]
  const train = one({ type: 'ProgressSteps', steps: steps.map(({ description, ...s }) => s) }, 'isProgress')
  assert.equal(train.trainSteps, true)
  assert.deepEqual(train.steps[0], { id: 's1', label: 'Identity', visited: true, messageType: 'confirmation' })
  assert.equal(train.steps[1].visited, undefined)
  assert.equal(train.selectedId, 's2')
  const described = one({ type: 'ProgressSteps', steps }, 'isProgress')
  assert.deepEqual([described.trainSteps, described.ownSteps], [false, true])
  assert.equal(described.stepItems[0].description, 'Documents scanned')
  assert.deepEqual(described.stepItems.map((s) => s.cls), ['mateu-step mateu-step-done', 'mateu-step mateu-step-current', 'mateu-step mateu-step-upcoming'])
  assert.equal(described.stepItems[1].ariaCurrent, 'step')
  const vertical = one({ type: 'ProgressSteps', vertical: true, steps }, 'isProgress')
  assert.match(vertical.stepsClass, /mateu-steps-vertical/)
  assert.match(template(), /<ol :class="\[\[ \$current\.data\.stepsClass \]\]">/)
})

test('a read-only Checklist draws its undone items (a read-only oj-checkboxset shows only checked values)', () => {
  const c = one({ type: 'Checklist', title: 'Room 102', items: [{ id: 'a', label: 'Bed made', done: true }, { id: 'b', label: 'Minibar' }] }, 'isChecklist')
  assert.deepEqual(c.items.map((i) => [i.readonly, i.iconClass]), [[true, 'mateu-checklist-box mateu-checklist-box-done'], [true, 'mateu-checklist-box']])
  assert.match(template(), /<oj-bind-if test="\[\[ \$current\.data\.readonly \]\]">\s*<!-- a READ-ONLY oj-checkboxset/)
})

test('Ledger: an absent total is the sum of the non-included lines; a negative amount is danger', () => {
  const l = one({ type: 'Ledger', currency: '€', lines: [
    { concept: 'Room', amount: 900 }, { concept: 'Breakfast', amount: 50, included: true, includedLabel: 'Included' },
    { concept: 'Deposit', amount: -100 }, { concept: 'Spa', amount: 120.5 },
  ] }, 'isLedger')
  assert.match(l.totalText, /920[.,]50/)
  assert.equal(l.lines[2].amountClass, 'oj-text-color-danger')
  assert.equal(l.lines[1].amountClass, '')
  const given = one({ type: 'Ledger', currency: '€', total: 10, lines: [{ concept: 'x', amount: 5 }] }, 'isLedger')
  assert.match(given.totalText, /10[.,]00/)
})

test('Stat: its delta coloured by the trend and a sparkline from spark', () => {
  const s = one({ type: 'Stat', label: 'Revenue', value: '184', unit: '€', delta: '+12%', trend: 'up', spark: [1, 3, 2, 5] }, 'isStat')
  assert.equal(s.deltaText, '▲ +12%')
  assert.match(s.deltaClass, /oj-text-color-success/)
  assert.equal(s.hasSpark, true)
  assert.equal(s.sparkPoints.split(' ').length, 4)
  const down = one({ type: 'Stat', label: 'x', value: '1', delta: '-5', trend: 'down' }, 'isStat')
  assert.match(down.deltaClass, /danger/)
  assert.equal(down.hasSpark, false)
  assert.match(template(), /<polyline[^>]*:points="\[\[ \$current\.data\.sparkPoints \]\]"/)
})

test('OfferCard: its image, floating tag, features as chips and its own width', () => {
  const o = atomsOf(node({ type: 'VerticalLayout' }, [{ type: 'ClientSide', id: 'o', style: 'width: 17rem;',
    metadata: { type: 'OfferCard', title: 'Suite', tag: 'Popular', image: '/bay.svg', features: ['48 m²', 'King bed'] }, children: [] }])).find((a) => a.isOffer)
  assert.equal(o.hasImage, true)
  assert.match(o.image, /bay\.svg$/)
  assert.deepEqual([o.tagOnImage, o.tagInline], [true, false])
  assert.deepEqual(o.featureChips.map((f) => f.text), ['48 m²', 'King bed'])
  assert.equal(o.offerStyle.width, '17rem')
})

test('PricingTable: a plan\'s ctaLabel is drawn even without an actionId (inert)', () => {
  const p = one({ type: 'PricingTable', plans: [{ id: 'a', name: 'Room', ctaLabel: 'Choose' }, { id: 'b', name: 'B&B', actionId: 'pick' }, { id: 'c', name: 'None' }] }, 'isPricing')
  assert.deepEqual(p.plans.map((x) => [x.hasCta, x.ctaDisabled]), [[true, true], [true, false], [false, true]])
})

test('AddOnPicker: the running total of what is added; an included extra shows no price', () => {
  const a = one({ type: 'AddOnPicker', totalLabel: 'Extras', currency: '€', items: [
    { id: 'a', title: 'Guide', price: 4.5 }, { id: 'b', title: 'Tour', price: 9, added: true },
    { id: 'c', title: 'Cloakroom', includedLabel: 'Included' },
  ] }, 'isAddOns')
  assert.match(a.totalText, /9[.,]00/)
  assert.equal(a.items[2].priceText, '')
  assert.match(a.items[1].priceText, /9[.,]00/)
  assert.match(template(), /mateu-addons-total-value/)
})

test('PaymentPicker: the confirm sends the PICKED method (kept on the client), not the server\'s', () => {
  const p = one({ type: 'PaymentPicker', actionId: 'pay', selected: 'card', methods: [{ id: 'card', label: 'Card' }, { id: 'cash', label: 'Cash' }] }, 'isPayment')
  assert.deepEqual(p.methods.map((m) => [m.id, m.local]), [['card', true], ['cash', true]])
  const methods = { getAttribute: (n) => (n === 'data-selected' ? 'cash' : null) }
  const picker = { querySelector: () => methods }
  const target = { closest: () => picker }
  assert.deepEqual(paymentParametersOf(target, { _method: 'card' }), { _method: 'cash' })
  assert.deepEqual(paymentParametersOf(null, { _method: 'card' }), { _method: 'card' })
})

test('ResourceGrid: the recommended card carries its flag, the note keeps its colour (on a disabled card too)', () => {
  const g = one({ type: 'ResourceGrid', columns: 4, recommendedLabel: 'Best fit', items: [
    { id: 'r1', title: 'A', recommended: true, note: 'Projector', noteColor: 'success' },
    { id: 'r4', title: 'D', disabled: true, note: 'Until 18:00' },
  ] }, 'isResourceGrid')
  assert.equal(g.items[0].recommendedLabel, 'Best fit')
  assert.match(g.items[0].noteClass, /success/)
  assert.equal(g.items[1].note, 'Until 18:00')
  const disabledBranch = template().split('<oj-bind-if test="[[ $current.data.disabled ]]">')[1].split('</oj-bind-if>')[0]
  assert.match(disabledBranch, /\$current\.data\.note/)
})

test('Charts: a TrendChart\'s colour, compact and axis-less; a one-dataset Chart has its legend; pie labels', () => {
  const trend = chartAtomOf({ title: 'Visitors', values: [1, 2, 3], labels: ['a', 'b', 'c'], color: '#2563eb', area: true }, 'TrendChart')
  assert.deepEqual(trend.colors, ['#2563eb'])
  assert.equal(trend.axisRendered, 'off')
  assert.equal(trend.legend, 'off')
  assert.equal(trend.chartStyle.height, '7rem')
  const line = chartAtomOf({ chartType: 'line', chartData: { labels: ['Jan'], datasets: [{ label: 'Tickets', data: [41, 'x'] }] } }, 'Chart')
  assert.equal(line.legend, 'on')
  assert.equal(line.items[1].value, null, 'a non-number is a gap, never NaN')
  const pie = chartAtomOf({ chartType: 'doughnut', chartData: { labels: ['A', 'B', 'C'], datasets: [{ label: 'n', data: [9, 21, 70] }] } }, 'Chart')
  assert.deepEqual(pie.items.map((i) => i.label), ['9%', '21%', '70%'])
})

test('PlanningBoard: a header row per resource group, today marked, as tall as its rows', () => {
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  const p = planningAtomOf({ from: today, to: today, moveActionId: 'mv', resources: [
    { id: 'v1', label: 'Van 1', group: 'Fleet' }, { id: 'v2', label: 'Van 2', group: 'Fleet' }, { id: 'c1', label: 'Crates', group: 'Storage' },
  ], blocks: [] }, 'p')
  assert.deepEqual(p.rows.map((r) => r.label), ['Fleet', 'Van 1', 'Van 2', 'Storage', 'Crates'])
  assert.deepEqual(p.rowIds.split('\u001f'), ['', 'v1', 'v2', '', 'c1'])
  assert.equal(p.referenceObjects.length, 1)
  assert.equal(p.ganttStyle.height, (104 + 5 * 48) + 'px')
  assert.equal(p.majorScale, undefined, 'one header row (the days)')
  // nothing moves onto a group's header row
  assert.equal(planningActionOf(p, 'move', { taskId: 'b', rowId: GROUP_ROW_PREFIX + 'Fleet', start: today, end: today }), null)
  const past = planningAtomOf({ from: '2020-01-01', to: '2020-01-05', resources: [], blocks: [] }, 'p')
  assert.deepEqual(past.referenceObjects, [])
})

test('Gantt: air after the last bar (a one-day task sat on the chart\'s edge)', () => {
  const g = ganttAtomOf({ tasks: [{ id: 't', title: 'Opening', start: '2026-12-18', end: '2026-12-18' }] }, 'g')
  assert.equal(g.end, '2026-12-21T00:00:00')
})

test('OrgChart: `tree` (the default) shows every level; `focus` is Spectra\'s hierarchy viewer', () => {
  setOrgHierarchyProviderFactory((rows) => ({ rows }))
  try {
    const root = { id: 'd', title: 'Elena', color: '#2563eb', children: [{ id: 'c', title: 'Marco', children: [{ id: 'p', title: 'Aiko' }] }] }
    const tree = orgChartAtomOf({ root })
    assert.equal(tree.isOrgChart, true)
    assert.deepEqual(tree.nodes.map((n) => [n.title, n.depth]), [['Elena', 0], ['Marco', 1], ['Aiko', 2]])
    assert.deepEqual(tree.nodes[0].cardStyle, { borderInlineStart: '4px solid #2563eb' })
    assert.equal(orgChartAtomOf({ display: 'focus', root }).isOrgHierarchy, true)
  } finally { setOrgHierarchyProviderFactory(null) }
})

test('Calendar: two calendars on a page never share an id, and only ONE mounts Spectra\'s', () => {
  const a = calendarAtomOf({ month: '2026-11-09' }, 'calendar')
  const b = calendarAtomOf({ month: '2026-11-09' }, 'calendar')
  assert.notEqual(a.calId, b.calId)
  const first = { isConnected: true, __mateuSpCal: '{}' }
  const second = { isConnected: true }
  const doc = { querySelectorAll: () => [first, second] }
  assert.equal(spCalendarElsewhere(doc, second), true)
  assert.equal(spCalendarElsewhere(doc, first), false)
})

await Promise.all(pending)
console.log(`\n${passed} explorer display tests OK`)
