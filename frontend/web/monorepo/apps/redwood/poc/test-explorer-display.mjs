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
import { islandContentOf, planningAtomOf, ganttAtomOf, chartAtomOf, orgChartAtomOf, setOrgHierarchyProviderFactory, GROUP_ROW_PREFIX, planningActionOf,
  GRID_ACTION_CELL_SUFFIX, withSubresources, filterDescriptorOf, smartFiltersMetadataOf, smartFilterIdOf, smartFilterSuggestionsOf, filterStateOfSmartFilters,
  labelColumn, valueLabelOf, numberConverterOf, bpmnDiagramOf, bpmnAtomOf } from './reduceContexts.mjs'
import { calendarAtomOf, spCalendarElsewhere } from './calendar.mjs'
import { paymentParametersOf, bpmnFlowLabelPointOf, installRowClickSelectionGuard, selectionIsRowOpen } from './displayDom.mjs'
import { listHeaderVarsOf, listPrimaryForSelection } from './pageProjection.mjs'

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

// ── listings & grids ─────────────────────────────────────────────────────────────────────────

test('Grid: an actionId column is a link cell with the row\'s values; money formatted, align, sortable only where declared, stripes', () => {
  const g = one({ type: 'Grid', rowStripes: true, content: [
    { type: 'GridColumn', id: 'title', label: 'Title', actionId: 'openWork' },
    { type: 'GridColumn', id: 'artist', label: 'Artist', sortable: true },
    { type: 'GridColumn', id: 'insurance', label: 'Insured', dataType: 'money', align: 'end' },
  ], page: { content: [{ title: 'The Bedroom', artist: 'Van Gogh', insurance: 82000000 }] } }, 'isGrid')
  const [title, artist, insurance] = g.columns
  assert.deepEqual([title.template, title.field], ['cellGridAction', 'title' + GRID_ACTION_CELL_SUFFIX])
  assert.deepEqual(g.rows[0][title.field], { text: 'The Bedroom', actionId: 'openWork', parameters: { title: 'The Bedroom', artist: 'Van Gogh', insurance: 82000000 } })
  assert.deepEqual([title.sortable, artist.sortable, insurance.sortable], ['disabled', 'enabled', 'disabled'])
  assert.equal(insurance.className, 'oj-helper-text-align-end')
  assert.match(String(g.rows[0][insurance.field]), /82[.,  ]?000[.,  ]?000/)
  assert.match(g.gridClass, /mateu-grid-stripes/)
  assert.match(template(), /<template slot="cellGridAction">/)
})

const surfaceOf = (tree, data) => ({ contexts: { s: { tree, data, state: {} } }, blocks: [{ items: [{ isSubresource: true, islandId: 's', subresource: { id: 's', surface: true } }] }] })
const crudNode = (md) => ({ type: 'ClientSide', id: 'crud', metadata: { type: 'Crud', columns: [
  { type: 'GridColumn', id: 'name', label: 'Name', identifier: true, priority: 1 },
  { type: 'GridColumn', id: 'type', label: 'Type', priority: 2 },
  { type: 'GridColumn', id: 'moons', label: 'Moons', dataType: 'integer' },
], ...md }, children: [] })
const planets = { crud: { page: { content: [{ name: 'Mercury', type: 'Rocky', moons: 0 }, { name: 'Jupiter', type: 'Gas giant', moons: 95 }] } } }

test('a surface\'s listing is ONE part of it: its DropZones and its page\'s header are drawn too, the table where it sits', () => {
  const tree = { type: 'ServerSide', id: 'p', metadata: { type: 'Page', header: [node({ type: 'Text', text: 'Drop here' })] }, children: [
    node({ type: 'HorizontalLayout' }, [crudNode({ title: 'Artworks', rowsSelectionEnabled: true, dragType: 'artwork' }),
      node({ type: 'DropZone', accept: 'artwork', actionId: 'pack', title: 'Crate A' })]),
  ] }
  const { contexts, blocks } = surfaceOf(tree, planets)
  const items = withSubresources(blocks, contexts)[0].items
  const grid = items.find((a) => a.isGrid)
  assert.ok(grid, 'the table')
  assert.equal(grid.label, 'Artworks')
  assert.deepEqual(grid.selectionMode, { row: 'multiple' })
  assert.deepEqual(grid.dragTypes, ['application/x-mateu-artwork'])
  const zone = items.find((a) => a.isDropZone)
  assert.ok(zone, 'the drop zone beside it')
  assert.equal(zone.surfaceId, 's', 'its drop goes back to the surface')
  assert.ok(items.some((a) => a.isText && a.text === 'Drop here'), 'the HeaderSupplier header')
  // the drop finds that surface through the zone's data-mateu-surface-id (make-html stamps it)
  assert.match(readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page.html'), 'utf8'),
    /class="mateu-drop-zone[^>]*:data-mateu-surface-id="\[\[ \$current\.data\.surfaceId \]\]"/)
})

test('a surface\'s listing in its gridLayout: cards, list (identifier + priorities), master/detail, tree', () => {
  const lay = (gridLayout, data = planets) => {
    const { contexts, blocks } = surfaceOf({ type: 'ServerSide', id: 'p', metadata: { type: 'Page' }, children: [crudNode({ gridLayout, title: 'Planets' })] }, data)
    return withSubresources(blocks, contexts)[0].items[0]
  }
  const cards = lay('cards')
  assert.deepEqual([cards.isNestedListing, cards.asCards, cards.isGrid], [true, true, false])
  assert.equal(cards.cards[1].title, 'Jupiter')
  const list = lay('list')
  assert.deepEqual(list.cards[1].lines.map((l) => l.value), ['Gas giant'])
  assert.match(list.cards[0].cellClass, /oj-sm-12/)
  const md = lay('masterDetail')
  assert.equal(md.hasDetail, true)
  assert.equal(md.cards[1].uiKey, 'listingPick:s')
  assert.deepEqual(md.detail.map((d) => d.value), ['Mercury', 'Rocky', '0'])
  const tree = lay('tree', { crud: { page: { content: [{ name: 'Furniture', moons: 41, children: [{ name: 'Chairs', moons: 18 }] }] } } })
  assert.equal(tree.columns[0].template, 'cellTreeToggle')
  assert.equal(tree.rows.length, 1, 'collapsed at first')
  assert.equal(tree.rows[0].__hasChildren, true)
  assert.equal(lay('').isGrid, true, 'a table stays a table')
})

test('smart filters: a field named `items` does not answer Spectra\'s propertyPath probe (every popup opened its editor)', () => {
  const filters = [filterDescriptorOf({ fieldId: 'status', stereotype: 'multiSelect', options: [{ value: 'OPEN', label: 'Open' }] }),
    filterDescriptorOf({ fieldId: 'items', dataType: 'integer' })]
  const meta = smartFiltersMetadataOf(filters)
  assert.equal(meta.polymorphicTypes.items, undefined)
  assert.ok(meta.polymorphicTypes[smartFilterIdOf('items')])
  assert.deepEqual(smartFilterSuggestionsOf(filters).map((c) => c.filter), ['status', smartFilterIdOf('items')])
  assert.deepEqual(filterStateOfSmartFilters(filters, [{ filter: smartFilterIdOf('items'), value: 3 }]).values, { items: 3 })
})

test('listing: a totalled number column reads like its totals; a rows-required primary is off without a selection', () => {
  const c = { id: 'amount', dataType: 'integer', aggregate: 'sum' }
  assert.equal(labelColumn(c), true)
  assert.equal(valueLabelOf(c, 1122), new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(1122))
  assert.equal(labelColumn({ id: 'year', dataType: 'integer' }), false, 'an untotalled number is left alone')
  const vars = listHeaderVarsOf({ toolbar: [{ actionId: 'ship', label: 'Mark as shipped', rowsSelectedRequired: true }], selectionRequired: [] })
  assert.equal(vars.mateuListPrimary.display, 'disabled')
  assert.equal(listPrimaryForSelection(vars.mateuListPrimary, { keys: [1] }).display, undefined)
})

test('an integer field is ungrouped (a year read «1,906»); a decimal keeps JET\'s default', () => {
  assert.deepEqual(numberConverterOf('integer').options, { style: 'decimal', useGrouping: false, maximumFractionDigits: 0 })
  assert.deepEqual(numberConverterOf('number').options, { style: 'decimal' })
  assert.equal(numberConverterOf('integer'), numberConverterOf('long'), 'one instance per kind')
  for (const markup of [template(), readFileSync(join(here, 'templates', 'drawer-body.html'), 'utf8')]) {
    assert.match(markup, /<oj-input-number[^>]*converter="\[\[ \$current\.data\.converter \]\]"/)
  }
})

test('a long VirtualList is virtualised in its own height; a short one stays inline', () => {
  const rows = Array.from({ length: 200 }, (_, i) => ({ type: 'ClientSide', metadata: { type: 'HorizontalLayout' }, children: [
    node({ type: 'Text', text: 'ACC-' + i }), node({ type: 'Badge', text: 'in store', color: 'success' })] }))
  const v = atomsOf(node({ type: 'VerticalLayout' }, [{ type: 'ClientSide', id: 'v', style: 'height: 18rem;', metadata: { type: 'VirtualList', page: { content: rows } }, children: [] }])).find((a) => a.isVirtualList)
  assert.equal(v.rows.length, 200)
  assert.deepEqual([v.rows[3].primary, v.rows[3].badges[0].text], ['ACC-3', 'in store'])
  assert.equal(v.listStyle.height, '18rem')
  assert.match(template(), /<oj-list-view class="mateu-virtual-list[^>]*scroll-policy="loadMoreOnScroll"/)
  const short = atomsOf(node({ type: 'VerticalLayout' }, [node({ type: 'VirtualList', page: { content: ['a', 'b'] } })]))
  assert.equal(short.some((a) => a.isVirtualList), false)
})

test('BPMN: a name under a shape widens the box (not clipped); a flow name at its middle segment', () => {
  const xml = '<definitions><process><startEvent id="s" name="Loan requested"/><task id="t" name="Review"/><sequenceFlow id="f" name="yes" sourceRef="s" targetRef="t"/></process>'
    + '<BPMNDiagram><BPMNPlane><BPMNShape bpmnElement="s"><Bounds x="40" y="82" width="36" height="36"/></BPMNShape>'
    + '<BPMNShape bpmnElement="t"><Bounds x="130" y="60" width="110" height="80"/></BPMNShape>'
    + '<BPMNEdge bpmnElement="f"><waypoint x="76" y="100"/><waypoint x="130" y="100"/></BPMNEdge></BPMNPlane></BPMNDiagram></definitions>'
  const d = bpmnDiagramOf(xml)
  assert.ok(d.minX < 58 - 14 * 3.6 + 1, 'the label\'s left edge is inside the box')
  assert.deepEqual(bpmnFlowLabelPointOf([[76, 100], [130, 100]]), [103, 100, false])
  assert.equal(bpmnFlowLabelPointOf([[320, 125], [320, 200]])[2], true, 'vertical: beside it')
  assert.deepEqual(bpmnAtomOf({ xml }, 'b', 'height: 18rem; width: 100%;').bpmnStyle, { height: '18rem', width: '100%' })
})

test('a click on a row that OPENS is no selection; the checkbox still selects', () => {
  const doc = { listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn } }
  installRowClickSelectionGuard(doc)
  const cell = { closest: (sel) => (/oj-table-data-cell/.test(sel) ? cell : null) }
  const box = { closest: (sel) => (/oj-selector/.test(sel) ? box : /oj-table-data-cell/.test(sel) ? box : null) }
  const table = { getAttribute: () => 'oj-sm-12 mateu-rows-open', contains: () => true }
  doc.listeners.pointerdown({ target: cell })
  assert.equal(selectionIsRowOpen(table), true)
  doc.listeners.pointerdown({ target: box })
  assert.equal(selectionIsRowOpen(table), false)
  doc.listeners.pointerdown({ target: cell })
  assert.equal(selectionIsRowOpen({ ...table, getAttribute: () => 'oj-sm-12' }), false, 'a listing whose rows do not open keeps the click')
})

await Promise.all(pending)
console.log(`\n${passed} explorer display tests OK`)
