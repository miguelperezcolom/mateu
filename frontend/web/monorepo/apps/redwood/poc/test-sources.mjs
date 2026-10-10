// Contract tests of the REST sources on the Redwood renderer (restSources.mjs + fieldTypes.mjs):
// resolution by ref against the app's catalogue, sample mode (read → a copy, write → null, never
// proxied), the in-memory search/filter/sort/page of a listing, the direct vs the proxied leg
// (stub fetch / stub `__restfetch__`), field options, REST actions, the editor canvas adopting the
// catalogue, and status tones. The module state (catalogue, sample mode) is shared, so the tests
// run ONE AFTER ANOTHER. Run: node test-sources.mjs (npm test runs it with the other suites).
import assert from 'node:assert/strict'
import {
  setRestSourceCatalogue, resolveRestSource, setSampleMode, isSampleMode, isSampled, viaProxy, sampleOf,
  fetchRestJson, filterRestRows, sortRestRows, restListingPage, restAnswerOf, loadRestOptions,
  adoptAppSources, adoptManifestSources, interpolateRestUrl, interpolateRest, mapItemsToOptions, restPageOf,
} from './restSources.mjs'
import { resolveFieldTypes, setFieldTypeCatalogue } from './fieldTypes.mjs'
import { adoptRenderMessage, previewLoadIncrement } from './editorPreview.mjs'
import { reduceContexts, listingOf, onLoadTriggers, HOST_ID, LOOKUP_LOADED, statusBadgeRows, selectedRowsOf, optionsOf } from './reduceContexts.mjs'
import { runMateuAction, loadLookups } from './transport.mjs'

let passed = 0
const queue = []
const test = (name, fn) => queue.push({ name, fn })

const ORDERS = [
  { id: 1, customer: { name: 'Acme' }, status: 'OPEN', total: 120.5 },
  { id: 2, customer: { name: 'Globex' }, status: 'SHIPPED', total: 80 },
  { id: 3, customer: { name: 'Initech' }, status: 'OPEN', total: 300 },
  { id: 4, customer: { name: 'Acme Corp' }, status: 'CANCELLED', total: 15 },
]
const catalogue = () => [
  {
    name: 'orders',
    source: { url: '/api/orders?page=${state.page}', itemsPath: 'data', proxy: false },
    totalPath: 'meta.total',
    fields: { customer: 'customer.name' },
    sample: { data: ORDERS, meta: { total: 4 } },
  },
  { name: 'countries', source: { url: '/api/countries', itemsPath: 'items', valuePath: 'code', labelPath: 'name' },
    sample: { items: [{ code: 'ES', name: 'Spain' }, { code: 'FR', name: 'France' }] } },
  { name: 'secret', source: { url: 'https://api.example.com/things', proxy: true } },
  { name: 'saveOrder', source: { url: '/api/orders/${state.id}', method: 'PUT', body: '{"note":"${state.note}"}', headers: { 'Content-Type': 'application/json' } },
    sample: { ok: true } },
]
const reset = () => { setSampleMode(false); setRestSourceCatalogue(catalogue()) }

// a fetch stub that records its calls and answers `json`
const stubFetch = (json, status = 200) => {
  const calls = []
  const f = async (url, init) => {
    calls.push({ url, init })
    return { ok: status >= 200 && status < 300, status, text: async () => (json == null ? '' : JSON.stringify(json)) }
  }
  f.calls = calls
  return f
}

const col = (id, extra = {}) => ({ type: 'ClientSide', id, metadata: { type: 'GridColumn', id, label: id, dataType: 'string', ...extra }, children: [] })
const listingCtx = (rowsSource, extra = {}) => ({
  id: HOST_ID,
  tree: {
    type: 'ServerSide', id: 'page', serverSideType: undefined, actions: [], triggers: [],
    children: [{ type: 'ClientSide', id: 'crud', metadata: {
      type: 'Crud', pageSize: 2, rowsSource, columns: [col('id', { identifier: true }), col('customer'), col('status', { dataType: 'status' }), col('total', { dataType: 'number' })],
      filters: [{ type: 'FormField', fieldId: 'status', dataType: 'string', options: [{ value: 'OPEN' }, { value: 'SHIPPED' }] }],
      ...extra,
    }, children: [] }],
  },
  state: {}, data: {},
})

// ── resolution by ref ──
test('a ref resolves against the catalogue; what the surface declares wins', () => {
  reset()
  const r = resolveRestSource({ ref: 'countries', labelPath: 'label' })
  assert.equal(r.url, '/api/countries')
  assert.equal(r.itemsPath, 'items')
  assert.equal(r.valuePath, 'code')
  assert.equal(r.labelPath, 'label')
  // an inline descriptor is untouched; an unknown ref comes back as declared
  const inline = { url: '/x' }
  assert.equal(resolveRestSource(inline), inline)
  assert.deepEqual(resolveRestSource({ ref: 'nope' }), { ref: 'nope' })
})

test('proxy is read off the RESOLVED source (a by-ref surface carries only the name)', () => {
  reset()
  assert.equal(viaProxy({ ref: 'secret' }), true)
  assert.equal(viaProxy({ ref: 'countries' }), false)
})

test('the catalogue and the opt-in arrive with the App (restSources/mockSources) and the manifest', () => {
  setSampleMode(false)
  setRestSourceCatalogue([])
  adoptAppSources({ fragments: [{ component: { type: 'ClientSide', metadata: { type: 'App', restSources: catalogue() } } }] })
  assert.equal(resolveRestSource({ ref: 'orders' }).url, '/api/orders?page=${state.page}')
  assert.equal(isSampleMode(), false, 'an app without mockSources does not switch sample mode on')
  adoptAppSources({ fragments: [{ component: { type: 'ClientSide', metadata: { type: 'App', mockSources: true } } }] })
  assert.equal(isSampleMode(), true)
  setSampleMode(false)
  setRestSourceCatalogue([])
  adoptManifestSources({ sources: { sources: [{ name: 'm', source: { url: '/m' } }] }, mockSources: true })
  assert.equal(resolveRestSource({ ref: 'm' }).url, '/m')
  assert.equal(isSampleMode(), true)
})

// ── sample mode ──
test('sample mode is OFF by default: a sampled source is fetched for real', async () => {
  reset()
  assert.equal(isSampled({ ref: 'orders' }), false)
  const f = stubFetch({ data: [] })
  await fetchRestJson({ ref: 'orders' }, { state: { page: 0 } }, f)
  assert.equal(f.calls.length, 1)
  assert.equal(f.calls[0].url, '/api/orders?page=0')
})

test('sample mode: a read answers a COPY of the sample and never fetches', async () => {
  reset(); setSampleMode(true)
  const f = stubFetch(null)
  const json = await fetchRestJson({ ref: 'orders' }, {}, f)
  assert.equal(f.calls.length, 0)
  assert.equal(json.data.length, 4)
  json.data.pop()
  assert.equal(sampleOf({ ref: 'orders' }).data.length, 4, 'the sample itself is untouched')
  // the surface's own sample wins over the entry's
  assert.deepEqual(await fetchRestJson({ ref: 'orders', sample: { data: [] } }, {}, f), { data: [] })
})

test('sample mode: a write succeeds with null, nothing persisted', async () => {
  reset(); setSampleMode(true)
  const f = stubFetch({ id: 9 })
  assert.equal(await fetchRestJson({ ref: 'saveOrder' }, { state: { id: 1 } }, f), null)
  assert.equal(f.calls.length, 0)
})

test('sample mode: a sampled source is never proxied; one without a sample still is', () => {
  reset(); setSampleMode(true)
  setRestSourceCatalogue([...catalogue(), { name: 'p', source: { url: '/p', proxy: true }, sample: [] }])
  assert.equal(viaProxy({ ref: 'p' }), false)
  assert.equal(viaProxy({ ref: 'secret' }), true)
})

// ── the direct leg ──
test('direct leg: the url is encoded by position, a JSON body escaped, a non-2xx throws', async () => {
  reset()
  assert.equal(interpolateRestUrl('/people/${state.id}?q=${state.q}', { state: { id: 'a/b', q: 'x y&z' } }), '/people/a%2Fb?q=x%20y%26z')
  assert.throws(() => interpolateRestUrl('/people/${state.id}', { state: { id: '..' } }))
  assert.throws(() => interpolateRestUrl('${state.host}/x', { state: { host: 'http://evil' } }))
  assert.equal(interpolateRestUrl('${appState.base}/x', { appState: { base: 'https://a.b' } }), 'https://a.b/x')
  const f = stubFetch({ ok: 1 })
  await fetchRestJson({ ref: 'saveOrder' }, { state: { id: 7, note: 'say "hi"\n' } }, f)
  assert.equal(f.calls[0].url, '/api/orders/7')
  assert.equal(f.calls[0].init.method, 'PUT')
  assert.equal(f.calls[0].init.body, '{"note":"say \\"hi\\"\\n"}')
  assert.deepEqual(JSON.parse(f.calls[0].init.body), { note: 'say "hi"\n' })
  await assert.rejects(fetchRestJson({ url: '/x' }, {}, stubFetch({}, 500)), (e) => e.status === 500)
  assert.equal(await fetchRestJson({ url: '/x', method: 'DELETE' }, {}, stubFetch(null, 204)), null)
})

// ── in-memory listing ──
test('in memory: search, filter, sort and page over the fetched rows', () => {
  const rows = ORDERS.map((o) => ({ id: o.id, customer: o.customer.name, status: o.status, total: o.total }))
  const ids = ['id', 'customer', 'status', 'total']
  assert.deepEqual(filterRestRows(rows, ids, [], { searchText: 'acme' }).map((r) => r.id), [1, 4])
  const filters = [{ fieldId: 'status', options: [{ value: 'OPEN' }] }]
  assert.deepEqual(filterRestRows(rows, ids, filters, { status: 'OPEN' }).map((r) => r.id), [1, 3])
  assert.deepEqual(sortRestRows(rows, [{ field: 'total', direction: 'descending' }]).map((r) => r.id), [3, 1, 2, 4])
  const md = { pageSize: 2, columns: [col('id', { identifier: true })] }
  const page1 = restListingPage(md, rows, 4, { page: 1, sort: [{ fieldId: 'total', direction: 'ascending' }] }, false)
  assert.equal(page1.totalElements, 4)
  assert.deepEqual(page1.content.map((r) => r.id), [1, 3])
  assert.equal(page1.content[0]._rowNumber, '1', 'the identifier column is the row key')
  // a server-paged source: the page is taken as it came, its total trusted
  const paged = restListingPage(md, rows.slice(0, 2), 40, { page: 3, searchText: 'zzz' }, true)
  assert.equal(paged.totalElements, 40)
  assert.equal(paged.content.length, 2)
})

test('a listing over a rowsSource loads on opening (an implicit OnLoad search)', () => {
  reset()
  assert.deepEqual(onLoadTriggers(listingCtx({ ref: 'orders' })), ['search'])
  const declared = listingCtx({ ref: 'orders' })
  declared.tree.triggers = [{ type: 'OnLoad', actionId: 'search' }]
  assert.deepEqual(onLoadTriggers(declared), ['search'])
  const plain = listingCtx(undefined)
  assert.deepEqual(onLoadTriggers(plain), [])
})

test('sampled listing: search answers from the sample, in memory, even with a totalPath — and paints', async () => {
  reset(); setSampleMode(true)
  const ctx = listingCtx({ ref: 'orders' })
  const f = stubFetch(null)
  const inc = await restAnswerOf(ctx, 'search', { page: 0, size: 2, searchText: 'acme' }, { fetchImpl: f })
  assert.equal(f.calls.length, 0)
  const page = inc.fragments[0].data.crud.page
  assert.equal(page.totalElements, 2, 'filtered in memory, not the sample\'s meta.total')
  assert.deepEqual(page.content.map((r) => r.customer), ['Acme', 'Acme Corp'], 'the source\'s field map reads customer.name')
  const reg = reduceContexts({ contexts: { [HOST_ID]: ctx }, stack: [] }, inc)
  const listing = listingOf(reg.contexts[HOST_ID])
  assert.equal(listing.rows.length, 2)
  assert.equal(listing.rows[0].status.badgeClass.indexOf('oj-badge') >= 0, true)
})

test('direct listing over a server-paged source: the url carries the page, the total is trusted', async () => {
  reset()
  const ctx = listingCtx({ ref: 'orders' })
  const f = stubFetch({ data: [{ id: 5, customer: { name: 'X' }, status: 'OPEN', total: 1 }], meta: { total: 41 } })
  const direct = await restAnswerOf(ctx, 'search', { page: 3, size: 2 }, { fetchImpl: f })
  assert.equal(f.calls[0].url, '/api/orders?page=3')
  const page = direct.fragments[0].data.crud.page
  assert.equal(page.totalElements, 41)
  assert.equal(page.pageNumber, 3)
  assert.equal(page.content[0].customer, 'X')
})

test('proxied listing: one __restfetch__ (rows, the crud id) and the rows shaped from appData._restfetch', async () => {
  reset()
  const ctx = listingCtx({ ref: 'secret' })
  const asked = []
  const server = async (parameters, idempotent) => {
    asked.push({ parameters, idempotent })
    return { appData: { _restfetch: [{ id: 1, customer: 'A', status: 'OPEN', total: 1 }, { id: 2, customer: 'B', status: 'OPEN', total: 2 }, { id: 3, customer: 'C', status: 'OPEN', total: 3 }] } }
  }
  const f = stubFetch(null)
  const inc = await restAnswerOf(ctx, 'search', { page: 1 }, { server, fetchImpl: f })
  assert.equal(f.calls.length, 0, 'the browser does not call the endpoint')
  assert.deepEqual(asked, [{ parameters: { _sourceKind: 'rows', _sourceId: 'crud' }, idempotent: true }])
  const page = inc.fragments[0].data.crud.page
  assert.equal(page.totalElements, 3)
  assert.deepEqual(page.content.map((r) => r.id), [3])
})

test('runMateuAction routes a proxied search through the server as __restfetch__', async () => {
  reset()
  const ctx = listingCtx({ ref: 'secret' })
  const realFetch = globalThis.fetch
  const bodies = []
  globalThis.fetch = async (url, init) => {
    bodies.push({ url, body: JSON.parse(init.body) })
    return { ok: true, status: 200, json: async () => ({ fragments: [], appData: { _restfetch: [{ id: 1 }] } }) }
  }
  try {
    const inc = await runMateuAction('http://mateu', ctx, '/orders', 'search', { page: 0 }, {})
    assert.equal(bodies.length, 1)
    assert.equal(bodies[0].body.actionId, '__restfetch__')
    assert.deepEqual(bodies[0].body.parameters, { _sourceKind: 'rows', _sourceId: 'crud' })
    assert.equal(inc.fragments[0].data.crud.page.content[0].id, 1)
  } finally { globalThis.fetch = realFetch }
})

test('an ordinary action still goes to the server', () => {
  reset()
  assert.equal(restAnswerOf(listingCtx({ ref: 'orders' }), 'save', {}, {}), null)
  assert.equal(restAnswerOf(listingCtx(undefined), 'search', {}, {}), null)
})

// ── field options ──
const formCtx = (optionsSource) => ({
  id: HOST_ID,
  tree: { type: 'ServerSide', id: 'page', actions: [], triggers: [], children: [
    { type: 'ClientSide', id: 'country', metadata: { type: 'FormField', fieldId: 'country', dataType: 'string', stereotype: 'select', optionsSource }, children: [] },
  ] },
  state: { country: 'ES' }, data: {},
})

test('options: a sampled optionsSource {ref} fills ctx.data[field] (where optionsOf reads them), once', async () => {
  reset(); setSampleMode(true)
  let reg = { contexts: { [HOST_ID]: formCtx({ ref: 'countries' }) }, stack: [] }
  const f = stubFetch(null)
  reg = await loadRestOptions(reg, HOST_ID, { fetchImpl: f })
  assert.equal(f.calls.length, 0)
  const ctx = reg.contexts[HOST_ID]
  assert.deepEqual(optionsOf({ fieldId: 'country' }, ctx.data), [{ value: 'ES', label: 'Spain' }, { value: 'FR', label: 'France' }])
  assert.equal(ctx.data.country[LOOKUP_LOADED], true)
  const again = await loadRestOptions(reg, HOST_ID, { fetchImpl: f })
  assert.equal(again, reg, 'not reloaded while its url is the same')
})

test('options: direct fetch, and proxied through __restfetch__ (options, the field id)', async () => {
  reset()
  const f = stubFetch({ items: [{ code: 'IT', name: 'Italy' }] })
  let reg = await loadRestOptions({ contexts: { [HOST_ID]: formCtx({ ref: 'countries' }) }, stack: [] }, HOST_ID, { fetchImpl: f })
  assert.equal(f.calls[0].url, '/api/countries')
  assert.deepEqual(reg.contexts[HOST_ID].data.country.content, [{ value: 'IT', label: 'Italy' }])
  const asked = []
  reg = await loadRestOptions({ contexts: { [HOST_ID]: formCtx({ ref: 'secret' }) }, stack: [] }, HOST_ID, {
    server: async (parameters) => { asked.push(parameters); return { appData: { _restfetch: ['a', 'b'] } } },
  })
  assert.deepEqual(asked, [{ _sourceKind: 'options', _sourceId: 'country' }])
  assert.deepEqual(reg.contexts[HOST_ID].data.country.content, [{ value: 'a', label: 'a' }, { value: 'b', label: 'b' }])
})

test('loadLookups also loads the REST options (the chains call it after every load)', async () => {
  reset(); setSampleMode(true)
  const reg = await loadLookups('http://mateu', { contexts: { [HOST_ID]: formCtx({ ref: 'countries' }) }, stack: [] }, HOST_ID, {})
  assert.equal(reg.contexts[HOST_ID].data.country.content.length, 2)
})

// ── REST actions ──
const actionCtx = (restAction, state = {}) => ({
  id: HOST_ID,
  tree: { type: 'ServerSide', id: 'page', actions: [{ id: 'save', restAction }, { id: '__restdata__', restAction: { source: { ref: 'orders' }, resultPath: 'data.0' } }], triggers: [{ type: 'OnLoad', actionId: '__restdata__' }], children: [] },
  state, data: {},
})

test('rest action (direct): merges resultPath, toasts successMessage, navigates to successRoute', async () => {
  reset()
  const f = stubFetch({ result: { id: 9, note: 'saved' } })
  const ctx = actionCtx({ source: { ref: 'saveOrder' }, resultPath: 'result', successMessage: 'Order ${state.id} saved', successRoute: '/orders/${state.id}' }, { id: 9, note: 'n' })
  const inc = await restAnswerOf(ctx, 'save', ctx.state, { fetchImpl: f, route: '/orders' })
  assert.equal(f.calls.length, 1)
  assert.deepEqual(inc.fragments[0].state, { id: 9, note: 'saved' })
  assert.deepEqual(inc.messages, [{ variant: 'success', text: 'Order 9 saved' }])
  assert.equal(inc.commands[0].type, 'NavigateTo')
  assert.equal(inc.commands[0].data, '/orders/9')
  const reg = reduceContexts({ contexts: { [HOST_ID]: ctx }, stack: [] }, inc)
  assert.equal(reg.contexts[HOST_ID].state.note, 'saved')
  assert.equal(reg.effects.navigate.route, '/orders/9')
  assert.equal(reg.effects.toasts[0].text, 'Order 9 saved')
})

test('rest action: back to the route on screen re-runs the search; a failure toasts and does nothing else', async () => {
  reset()
  const ctx = actionCtx({ source: { ref: 'saveOrder' }, successRoute: '/orders' }, { id: 1 })
  const same = await restAnswerOf(ctx, 'save', ctx.state, { fetchImpl: stubFetch(null, 204), route: '/orders' })
  assert.deepEqual(same.commands.map((c) => c.type), ['RunAction'])
  const failed = await restAnswerOf(ctx, 'save', ctx.state, { fetchImpl: stubFetch({}, 500), route: '/x' })
  assert.deepEqual(failed.commands, [])
  assert.equal(failed.messages[0].variant, 'error')
  assert.match(failed.messages[0].text, /500/)
})

test('rest action in sample mode: the write answers null, nothing is fetched, it still succeeds', async () => {
  reset(); setSampleMode(true)
  const f = stubFetch({})
  const ctx = actionCtx({ source: { ref: 'saveOrder' }, resultPath: 'result', successMessage: 'Saved' }, { id: 1 })
  const inc = await restAnswerOf(ctx, 'save', ctx.state, { fetchImpl: f })
  assert.equal(f.calls.length, 0)
  assert.deepEqual(inc.fragments, [])
  assert.equal(inc.messages[0].text, 'Saved')
})

test('the route\'s data: load (__restdata__) merges the record; proxied it goes as kind data', async () => {
  reset(); setSampleMode(true)
  const ctx = actionCtx({ source: { ref: 'saveOrder' } })
  const inc = await restAnswerOf(ctx, '__restdata__', {}, {})
  assert.equal(inc.fragments[0].state.id, 1)
  setSampleMode(false)
  const asked = []
  const proxied = { ...ctx, tree: { ...ctx.tree, actions: [{ id: '__restdata__', restAction: { source: { ref: 'secret' }, resultPath: '' } }] } }
  const out = await restAnswerOf(proxied, '__restdata__', {}, { server: async (p, idem) => { asked.push([p, idem]); return { appData: { _restfetch: { name: 'Luke' } } } } })
  assert.deepEqual(asked, [[{ _sourceKind: 'data', _sourceId: '__restdata__' }, true]])
  assert.deepEqual(out.fragments[0].state, { name: 'Luke' })
  const err = await restAnswerOf(proxied, '__restdata__', {}, { server: async () => ({ appData: { _restfetchError: { status: 401 } } }) })
  assert.match(err.messages[0].text, /401/)
})

test('bulk: once per selected row in the browser; ONE proxied call with _forEachSelectedRow', async () => {
  reset()
  const f = stubFetch(null, 204)
  const ctx = actionCtx({ source: { url: '/api/orders/${row.id}', method: 'DELETE' }, forEachSelectedRow: true, successMessage: 'Deleted' })
  const inc = await restAnswerOf(ctx, 'save', { crud_selected_items: [{ id: 1 }, { id: 2 }] }, { fetchImpl: f })
  assert.deepEqual(f.calls.map((c) => c.url), ['/api/orders/1', '/api/orders/2'])
  assert.equal(inc.messages[0].text, 'Deleted')
  const asked = []
  const proxied = actionCtx({ source: { ref: 'secret' }, forEachSelectedRow: true })
  await restAnswerOf(proxied, 'save', { crud_selected_items: [{ id: 1 }] }, { server: async (p) => { asked.push(p); return { appData: { _restfetch: {} } } } })
  assert.deepEqual(asked, [{ _sourceKind: 'action', _sourceId: 'save', _forEachSelectedRow: true }])
  const none = await restAnswerOf(ctx, 'save', {}, { fetchImpl: f })
  assert.equal(none.messages[0].variant, 'warning')
})

// ── the editor canvas ──
test('editor canvas: the render message brings the catalogue and the types; fieldType refs resolve', () => {
  setSampleMode(false); setRestSourceCatalogue([]); setFieldTypeCatalogue([])
  const fragment = adoptRenderMessage({
    fragment: { component: { type: 'ClientSide', metadata: { type: 'GridColumn', id: 'status', fieldType: 'OrderStatus' } } },
    sources: catalogue(),
    types: [{ id: 'OrderStatus', label: 'Status', dataType: 'status', tones: { OPEN: 'warning' }, options: [{ value: 'OPEN' }] }],
  })
  assert.equal(resolveRestSource({ ref: 'orders' }).itemsPath, 'data')
  const md = fragment.component.metadata
  assert.equal(md.fieldType, undefined)
  assert.equal(md.label, 'Status')
  assert.equal(md.dataType, 'status')
  assert.deepEqual(md.tones, { OPEN: 'warning' })
  assert.equal(md.options, undefined, 'a GridColumn does not take options')
  // the field's own attribute wins; an unknown type renders as declared
  assert.equal(resolveFieldTypes({ type: 'FormField', fieldType: 'OrderStatus', label: 'Mine' }).label, 'Mine')
  assert.deepEqual(resolveFieldTypes({ type: 'FormField', fieldType: 'Nope', id: 'x' }), { type: 'FormField', id: 'x' })
})

test('editor canvas: a page with behaviour (ServerSide) is the page itself, so its OnLoad fires', () => {
  const own = { type: 'ServerSide', id: 'page_x', actions: [{ id: '__restdata__', restAction: { source: { ref: 'orders' } } }], triggers: [{ type: 'OnLoad', actionId: '__restdata__' }], children: [] }
  const inc = previewLoadIncrement({ component: own })
  const reg = reduceContexts({ contexts: {}, stack: [] }, inc)
  assert.deepEqual(onLoadTriggers(reg.contexts[HOST_ID]), ['__restdata__'])
  assert.equal(reg.contexts[HOST_ID].tree.actions[0].id, '__restdata__')
})

// ── status tones ──
test('status cells: a plain word gets the declared tone, else the word heuristics; the row goes back as it came', () => {
  const columns = [{ metadata: { id: 'status', dataType: 'status', tones: { OPEN: 'warning', SHIPPED: 'success' } } }]
  const [a, b, c, d] = statusBadgeRows([{ status: 'OPEN', _rowNumber: 'a' }, { status: 'SHIPPED', _rowNumber: 'b' }, { status: 'FAILED', _rowNumber: 'c' }, { status: 'weird', _rowNumber: 'd' }], columns)
  assert.match(a.status.badgeClass, /warning/)
  assert.match(b.status.badgeClass, /success/)
  assert.match(c.status.badgeClass, /danger/)
  assert.match(d.status.badgeClass, /neutral/)
  assert.equal(a.status.message, 'Open') // a bare constant reads as words (the enum-label rule)
  assert.deepEqual(selectedRowsOf([a], { all: false, keys: ['a'], except: [] }), [{ status: 'OPEN', _rowNumber: 'a' }])
  // a server's {type, message} keeps its own type
  assert.match(statusBadgeRows([{ status: { type: 'DANGER', message: 'x' } }], columns)[0].status.badgeClass, /danger/)
})

test('helpers: options mapping and a page with no total', () => {
  reset()
  assert.deepEqual(mapItemsToOptions([{ v: 1 }], '', 'v', 'missing'), [{ value: 1, label: '1' }])
  assert.equal(restPageOf({ data: [] }, { url: '/x', itemsPath: 'data' }, []).total, null)
  assert.equal(interpolateRest('Hi ${state.who.name}', { state: { who: { name: 'Ann' } } }), 'Hi Ann')
})

for (const { name, fn } of queue) {
  try {
    await fn()
    passed++
    console.log('  ✓ ' + name)
  } catch (e) {
    console.error('  ✗ ' + name)
    throw e
  }
}
setSampleMode(false)
console.log(`\n${passed} rest-source tests OK`)
