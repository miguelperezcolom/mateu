// The VB action chains, RUN in Node against a fake VB context — no VB, no browser.
//
// test-chains.mjs reads the chains as TEXT (they must stay thin); this suite EXECUTES the four big
// ones — loadMateuShell, onMateuNavigate, runMateuAction, runMateuIslandAction — the way the VB
// runtime does: each chain file is an AMD module (a tiny define() shim loads it), its `Actions`
// is a recorder (callChain runs the other chains of the harness, like VB), its context is
// { $application: { variables, constants }, $page: { variables } }, and its bridge is the
// GENERATED one that ships (webApps/…/resources/js/mateu-bridge.js — make-amd.mjs --check keeps it
// equal to poc/). The backend is a scripted fake fetch answering wire increments (real captures
// from fixtures/real where they fit). What is asserted is what the user sees: the variables the
// page binds to, the URL, the toasts, the error band, the retry.
//
// The bridge keeps module state (registry hooks, pending actions, the current view…), so the tests
// run ONE AFTER ANOTHER. Run: node test-vb-chains.mjs
import './test-locale.mjs' // first: off English the suite reruns in English (see the module)
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { makeDom, FakeEvent } from './test-harness-dom.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const webApp = join(here, '..', 'webApps', 'vbredwoodapp')
const fx = (name) => JSON.parse(readFileSync(join(here, 'fixtures', 'real', name + '.json'), 'utf8'))

// ── the browser the chains see ─────────────────────────────────────────────────────────────────
const { doc, win } = makeDom()
const location = { origin: 'http://localhost', protocol: 'http:', host: 'localhost', hostname: 'localhost', port: '', pathname: '/', search: '', hash: '' }
Object.defineProperty(location, 'href', { get: () => location.origin + location.pathname + location.search + location.hash })
const historyLog = []
const setUrl = (url) => {
  const u = new URL(url, location.href)
  location.pathname = u.pathname; location.search = u.search; location.hash = u.hash
}
const history = {
  state: null,
  pushState(state, _t, url) { historyLog.push(['push', String(url)]); setUrl(url) },
  replaceState(state, _t, url) { historyLog.push(['replace', String(url)]); setUrl(url) },
}
let confirmAnswer = true
Object.assign(win, {
  location, history, confirm: () => confirmAnswer, open: () => null,
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  requestAnimationFrame: (cb) => setTimeout(cb, 0), scrollTo() {}, getComputedStyle: () => ({}),
})
globalThis.window = win
globalThis.document = doc
globalThis.customElements = win.customElements
globalThis.HTMLElement = win.HTMLElement
globalThis.CustomEvent = win.CustomEvent
globalThis.requestAnimationFrame = win.requestAnimationFrame
const store = new Map()
globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) }
globalThis.sessionStorage = globalThis.localStorage
win.localStorage = globalThis.localStorage
// the chains read these off the global scope, like a browser
for (const k of ['location', 'history']) Object.defineProperty(globalThis, k, { value: win[k], configurable: true, writable: true })
if (!globalThis.navigator || !globalThis.navigator.language) Object.defineProperty(globalThis, 'navigator', { value: { language: 'en', onLine: true }, configurable: true })

// ── AMD: the bridge and the chains ─────────────────────────────────────────────────────────────
let loaded
const define = (deps, factory) => { loaded = factory(...deps.map((d) => modules[d])) }
class FakeADP { constructor(data, options) { this.data = data; this.options = options } }
const modules = {
  // the lazy requires of the bridge (oj-dynamic for the smart-filter editors; knockout is only on
  // the visual editor's preview page — absent here, as on every other page)
  require: (names, ok, fail) => {
    const found = names.map((n) => modules[n])
    if (found.every((m) => m !== undefined)) ok(...found)
    else if (typeof fail === 'function') fail(new Error('not here: ' + names))
  },
  'oj-dynamic/providers/JsonMetadataProvider': class JsonMetadataProvider { constructor(options) { this.options = options } },
  'ojs/ojarraydataprovider': FakeADP,
  'ojs/ojconverter-number': { IntlNumberConverter: class { constructor(options) { this.options = options } } },
  'ojs/ojarraytreedataprovider': FakeADP,
  'ojs/ojflattenedtreedataproviderview': class { getExpandedObservable() { return null } },
  'ojs/ojrowdatagridprovider': { RowDataGridProvider: class {} },
  'ojs/ojkeyset': { KeySetImpl: class { constructor(keys) { this.keys = keys } } },
  'vb/action/actionChain': class ActionChain {},
}
const amd = (file) => { new Function('define', readFileSync(file, 'utf8'))(define); return loaded }

// Two bridges, the same API. By default the bridge is ASSEMBLED FROM poc/ — every module make-amd
// concatenates, imported as ES modules, and make-amd's own wiring + return object evaluated over
// them (read off make-amd.mjs, so there is one copy of it) — which is what makes the chains count
// for the core's coverage. `--generated` runs the same tests against the committed AMD bundle the
// VB app ships (npm test runs both).
const GENERATED = process.argv.includes('--generated')
async function sourceBridge() {
  const makeAmd = readFileSync(join(here, 'make-amd.mjs'), 'utf8')
  const list = makeAmd.slice(makeAmd.indexOf('export const MODULES = ['), makeAmd.indexOf(']', makeAmd.indexOf('export const MODULES = [')))
  const files = ['reduceContexts.mjs', ...[...list.matchAll(/'([\w-]+\.mjs)'/g)].map((m) => m[1])]
  const scope = {}
  for (const f of files) Object.assign(scope, await import('./' + f))
  // the wiring after the concatenated body and the API object, exactly as make-amd emits them
  const lines = makeAmd.split('\n')
  const from = lines.findIndex((l) => l.includes('${body.replace')) + 1
  const to = lines.findIndex((l, i) => i > from && l === '});')
  const wiring = lines.slice(from, to).join('\n')
  Object.assign(scope, {
    require: modules.require, ArrayDataProvider: FakeADP, NumberConverter: modules['ojs/ojconverter-number'],
    ArrayTreeDataProvider: FakeADP, FlattenedTreeDataProviderView: modules['ojs/ojflattenedtreedataproviderview'],
    RowDataGridProvider: modules['ojs/ojrowdatagridprovider'], KeySet: modules['ojs/ojkeyset'],
  })
  // sloppy-mode Function so `with` resolves the module names; the wiring itself is strict-safe
  const api = new Function('scope', 'with (scope) { return (() => {\n' + wiring + '\n})() }')(scope)
  const missing = Object.entries(api).filter(([, v]) => v === undefined).map(([k]) => k)
  if (missing.length) throw new Error('bridge names with no poc/ export: ' + missing.join(', '))
  return api
}
const bridge = GENERATED ? amd(join(webApp, 'resources', 'js', 'mateu-bridge.js')) : await sourceBridge()
modules['resources/js/mateu-bridge'] = bridge

/** VB's Actions, recorded. callChain runs the chains this harness loaded (the rest are recorded). */
const calls = []
const chains = {}
const Actions = {
  async callChain(context, { chain, params }) {
    calls.push(['callChain', chain, params])
    if (chains[chain]) return new chains[chain]().run(context, params || {})
    return undefined
  },
  async callComponentMethod(_context, { selector, method }) {
    calls.push(['method', selector, method])
    // the confirmation dialog: its Yes/No buttons answer the pending question (their chain does it)
    if (selector === '#mateuConfirm' && method === 'open') setTimeout(() => bridge.answerConfirmation(confirmAnswer), 0)
  },
  async fireEvent(_context, { name, payload }) { calls.push(['event', name, payload]) },
  async fireDataProviderEvent(_context, spec) { calls.push(['dataProvider', spec]) },
  async fireNotificationEvent(_context, n) { calls.push(['notification', n]) },
}
modules['vb/action/actions'] = Actions
const chain = (rel) => amd(join(webApp, rel))
chains.loadMateuShell = chain('pages/shell-page-chains/loadMateuShell.js')
chains.onMateuNavigate = chain('pages/shell-page-chains/onMateuNavigate.js')
chains.runMateuAction = chain('flows/main/pages/main-start-page-chains/runMateuAction.js')
chains.runMateuIslandAction = chain('flows/main/pages/main-start-page-chains/runMateuIslandAction.js')

// ── the backend: a scripted fetch ──────────────────────────────────────────────────────────────
let routes = []
const sent = []
/** answer(match, response): match is (body, url) → bool; response an increment, a fn, or { status }. */
const answer = (match, response) => routes.push({ match, response })
const byRoute = (route, actionId = '') => (b) => b.route === route && (b.actionId || '') === actionId
globalThis.fetch = async (url, init = {}) => {
  const body = init.body ? JSON.parse(init.body) : {}
  sent.push({ url: String(url), body })
  const hit = routes.find((r) => r.match(body, String(url)))
  if (!hit && process.env.DEBUG_CHAINS) console.log('unanswered', String(url), JSON.stringify(body).slice(0, 300))
  if (!hit) return { ok: false, status: 404, text: async () => 'no such route', json: async () => ({}) }
  const res = typeof hit.response === 'function' ? await hit.response(body) : hit.response
  if (res && res.__network) throw new TypeError('Failed to fetch')
  if (res && res.__sse) return { ok: true, status: 200, text: async () => res.__sse.map((inc) => 'data: ' + JSON.stringify(inc)).join('\n\n') + '\n\n' }
  if (res && res.status) return { ok: false, status: res.status, text: async () => 'boom', json: async () => ({}) }
  return { ok: true, status: 200, json: async () => JSON.parse(JSON.stringify(res)), text: async () => JSON.stringify(res) }
}
const DOWN = { __network: true }

// ── VB's context ──────────────────────────────────────────────────────────────────────────────
const newContext = () => ({
  $application: {
    constants: { mateuBaseUrl: 'http://api', mateuBundleUrl: '' },
    variables: {
      mateuRegistry: { contexts: {}, stack: [], shell: null },
      mateuAppState: {}, mateuSelectedRoute: '', mateuSelectedNavId: '', mateuDirty: false,
    },
  },
  $page: { variables: { mateuDraft: {}, mateuDrawerDraft: {}, mateuRowDraft: {}, mateuIslandDraft: {}, messagesBannerADP: {} } },
})

let passed = 0
const queue = []
const test = (name, fn) => queue.push({ name, fn })
const reset = () => {
  routes = []; sent.length = 0; calls.length = 0; historyLog.length = 0; confirmAnswer = true
  setUrl('/'); delete win.__mateuLoadedFull
  bridge.connectivity.reset && bridge.connectivity.reset()
}
const settle = () => new Promise((r) => setTimeout(r, 5))
const loads = () => sent.filter((s) => s.url.includes('/mateu/v3/')).map((s) => [s.body.route, s.body.actionId])

// wire builders (the shapes the server emits; the fixtures pin the real ones)
const page = (id, sst, title, children = [], extra = {}) => ({
  type: 'ServerSide', id, serverSideType: sst, route: extra.route || '',
  actions: extra.actions || [], triggers: extra.triggers || [],
  children: [{ type: 'ClientSide', metadata: { type: 'Page', title, pageTitle: title, toolbar: [], buttons: [], badges: [], kpis: [], banners: [] }, children }],
})
const text = (t) => ({ type: 'ClientSide', metadata: { type: 'Text', text: t, container: 'p' } })
const replace = (component, state = {}, target = '') => ({ commands: [], messages: [], fragments: [{ targetComponentId: target, action: 'Replace', component, state, data: null }] })

test('the bridge assembled from poc/ has exactly the API of the AMD bundle the app ships', async () => {
  const other = GENERATED ? await sourceBridge() : amd(join(webApp, 'resources', 'js', 'mateu-bridge.js'))
  assert.deepEqual(Object.keys(bridge).sort(), Object.keys(other).sort())
  // and every bridge.X the four chains call is in it
  for (const rel of ['pages/shell-page-chains/loadMateuShell.js', 'pages/shell-page-chains/onMateuNavigate.js',
    'flows/main/pages/main-start-page-chains/runMateuAction.js', 'flows/main/pages/main-start-page-chains/runMateuIslandAction.js']) {
    for (const [, name] of readFileSync(join(webApp, rel), 'utf8').matchAll(/bridge\.([A-Za-z_$][\w$]*)/g)) {
      assert.ok(name in bridge, rel + ' calls bridge.' + name + ', which the bridge does not have')
    }
  }
})

/** A booted shell (app.json + its first leaf): the transport hooks the shell installs (busy bar,
 *  error band) write to THIS context's variables — what an error band test needs. */
const bootShell = async () => {
  answer((b, url) => url.endsWith('/components/_/action'), fx('app'))
  answer(byRoute('/hello'), fx('load-form'))
  const ctx = newContext()
  await new chains.loadMateuShell().run(ctx)
  routes = []; sent.length = 0; calls.length = 0; historyLog.length = 0
  return ctx
}

// ═══ loadMateuShell ═══════════════════════════════════════════════════════════════════════════

test('loadMateuShell: the App configures the nav and the first leaf opens, its URL pushed', async () => {
  answer((b, url) => url.endsWith('/components/_/action'), fx('app'))
  answer(byRoute('/hello'), fx('load-form'))
  const ctx = newContext()
  await new chains.loadMateuShell().run(ctx)
  const v = ctx.$application.variables
  assert.equal(v.mateuShellTitle, 'VB Demo')
  assert.equal(doc.title, 'Person', 'the window title: the shell\'s first, then the screen\'s (SetWindowTitle)')
  assert.deepEqual(v.mateuNavItems.map((i) => i.label || i.name).slice(0, 2), ['Hello', 'Products'])
  assert.equal(v.mateuHomeRoute, '/hello', 'no declared home: the first menu leaf')
  // the shell navigated to it: the content chain ran and the page binds the loaded form
  assert.ok(calls.some((c) => c[0] === 'callChain' && c[1] === 'onMateuNavigate'))
  assert.equal(v.mateuSelectedRoute, '/hello')
  assert.equal(v.mateuHostTitle, 'Person')
  assert.equal(v.mateuNavigating, false, 'the navigation flag is down once it is painted')
  assert.equal(v.mateuBusy, false)
  assert.ok(historyLog.some(([kind, url]) => kind === 'push' && /hello/.test(url)), 'the URL names the screen')
  assert.deepEqual(loads().slice(0, 2), [['', '__load__'], ['/hello', '']])
})

test('loadMateuShell: a backend down at boot shows a plain-language error band, not a dead screen', async () => {
  answer(() => true, DOWN)
  const ctx = newContext()
  await assert.rejects(new chains.loadMateuShell().run(ctx))
  const v = ctx.$application.variables
  assert.equal(v.mateuBusy, false, 'the busy bar goes away')
  assert.ok(v.mateuLastError && !/TypeError|fetch/i.test(v.mateuLastError), 'a sentence for a person: ' + v.mateuLastError)
})

test('the shell wires navigation-requested once: a widget link navigates inside the shell', async () => {
  answer((b, url) => url.endsWith('/components/_/action'), fx('app'))
  answer(byRoute('/hello'), fx('load-form'))
  answer(byRoute('/elsewhere'), replace(page('p-else', 'x.Else', 'Elsewhere', [text('there')])))
  const ctx = newContext()
  await new chains.loadMateuShell().run(ctx)
  document.dispatchEvent(new FakeEvent('navigation-requested', { bubbles: true, detail: { route: '/elsewhere' } }))
  await settle()
  await settle()
  assert.equal(ctx.$application.variables.mateuSelectedRoute, '/elsewhere')
  assert.equal(ctx.$application.variables.mateuHostTitle, 'Elsewhere')
})

test('loadMateuShell: a deep link boots the screen in the URL, not the home', async () => {
  answer((b, url) => url.endsWith('/components/_/action'), fx('app'))
  answer(byRoute('/products'), replace(page('pp', 'x.Products', 'Products page')))
  setUrl('/#/products')
  const ctx = newContext()
  await new chains.loadMateuShell().run(ctx)
  assert.equal(ctx.$application.variables.mateuHomeRoute, '/hello', 'the home is still the first leaf')
  assert.equal(ctx.$application.variables.mateuSelectedRoute, '/products')
  assert.ok(!sent.some((s) => s.body.route === '/hello'), 'the home was never loaded')
  assert.ok(!historyLog.some(([k]) => k === 'push'), 'a URL load does not push itself again')
})

test('the shell follows the browser\'s back/forward (hash mode): the URL\'s route is navigated', async () => {
  const ctx = await bootShell()
  answer(byRoute('/elsewhere'), replace(page('pe', 'x.E', 'Elsewhere')))
  setUrl('/#/elsewhere')
  win.dispatchEvent(new FakeEvent('hashchange'))
  await settle(); await settle()
  assert.equal(ctx.$application.variables.mateuSelectedRoute, '/elsewhere')
  assert.ok(!historyLog.some(([k]) => k === 'push'), 'going back does not push a new entry')
})

// ═══ onMateuNavigate ══════════════════════════════════════════════════════════════════════════

const navigate = (ctx, route, extra = {}) => new chains.onMateuNavigate().run(ctx, { event: { detail: { route } }, ...extra })

test('onMateuNavigate: the echo of the menu selection does not reload the screen', async () => {
  answer(byRoute('/a'), replace(page('pa', 'x.A', 'A')))
  const ctx = newContext()
  await navigate(ctx, '/a')
  const before = sent.length
  await new chains.onMateuNavigate().run(ctx, { event: { detail: { currentId: '/a' } } })
  assert.equal(sent.length, before, 'same route, no request')
  // …but force (a context change) reloads it
  await new chains.onMateuNavigate().run(ctx, { event: { detail: { currentId: '/a' } }, force: true })
  assert.equal(sent.length, before + 1)
})

test('onMateuNavigate: unsaved changes ask first; cancelling stays and restores the URL', async () => {
  answer(byRoute('/a'), replace(page('pa', 'x.A', 'A')))
  answer(byRoute('/b'), replace(page('pb', 'x.B', 'B')))
  const ctx = newContext()
  await navigate(ctx, '/a')
  ctx.$application.variables.mateuDirty = true
  confirmAnswer = false
  const before = sent.length
  await navigate(ctx, '/b')
  assert.equal(sent.length, before, 'nothing was loaded')
  assert.equal(ctx.$application.variables.mateuSelectedRoute, '/a')
  assert.ok(historyLog.some(([k, u]) => k === 'replace' && /a$/.test(u)), 'the address goes back to /a')
  confirmAnswer = true
  await navigate(ctx, '/b')
  assert.equal(ctx.$application.variables.mateuSelectedRoute, '/b')
  assert.equal(ctx.$application.variables.mateuDirty, false)
})

test('onMateuNavigate: a listing gets its rows from its OnLoad search, with the page/sort of the URL', async () => {
  const crud = page('pl', 'x.Products', 'Products', [{ type: 'ClientSide', metadata: {
    type: 'Crud', id: 'crud', title: 'Products', searchable: true, pageSize: 10, toolbar: [],
    columns: [{ metadata: { id: 'name', label: 'Name', dataType: 'string' } }],
  } }], { triggers: [{ type: 'OnLoad', actionId: 'search' }] })
  answer(byRoute('/products'), replace(crud))
  let searched = null
  answer(byRoute('/products', 'search'), (b) => { searched = b; return { commands: [], messages: [], fragments: [{
    targetComponentId: 'pl', action: 'Replace', component: null, state: null,
    data: { crud: { page: { pageSize: 10, pageNumber: 1, totalElements: 12, content: [{ _rowNumber: 0, name: 'Laptop', id: '1' }] } } },
  }] } })
  const ctx = newContext()
  await navigate(ctx, '/products?page=1&sort=name:descending')
  assert.ok(searched, 'the OnLoad search went out')
  assert.equal(searched.componentState.page, 1)
  assert.equal(searched.componentState.size, 10)
  const v = ctx.$application.variables
  assert.equal(v.mateuListing.title, 'Products')
  assert.deepEqual(v.mateuListingRows.map((r) => r.name), ['Laptop'])
  assert.deepEqual(v.mateuListingSelection, { all: false, keys: [], except: [] }, 'a new table starts unselected')
})

test('onMateuNavigate: a query filter travels as a pending filter of the first search, not in the route', async () => {
  const crud = page('pl', 'x.Bookings', 'Bookings', [{ type: 'ClientSide', metadata: {
    type: 'Crud', id: 'crud', title: 'Bookings', searchable: true, toolbar: [],
    columns: [{ metadata: { id: 'status', label: 'Status' } }],
    filters: [{ metadata: { fieldId: 'status', label: 'Status', dataType: 'string' } }],
  } }], { triggers: [{ type: 'OnLoad', actionId: 'search' }] })
  answer(byRoute('/bookings'), replace(crud))
  let searched = null
  answer(byRoute('/bookings', 'search'), (b) => { searched = b; return { fragments: [] } })
  const ctx = newContext()
  await navigate(ctx, '/bookings?status=Cancelled&searchText=ada')
  assert.equal(sent.find((s) => s.body.actionId === '').body.route, '/bookings', 'the load names the clean route')
  assert.equal(searched.componentState.status, 'Cancelled')
  assert.equal(searched.componentState.searchText, 'ada')
  assert.equal(ctx.$application.variables.mateuLastSearchText, 'ada', 'the keyword shows as the applied chip')
  assert.equal(ctx.$application.variables.mateuSelectedNavId, '/bookings?status=Cancelled&searchText=ada')
})

test('onMateuNavigate: a failed load registers a retry of the whole navigation, and the retry works', async () => {
  const ctx = await bootShell()
  answer(byRoute('/flaky'), { status: 500 })
  await navigate(ctx, '/flaky')
  assert.equal(ctx.$application.variables.mateuNavigating, false, 'never an old screen hidden forever')
  assert.ok(ctx.$application.variables.mateuLastError, 'the error band says it')
  assert.ok(bridge.hasLastRetry())
  assert.deepEqual(bridge.takeLastRetry(), { kind: 'navigate', route: '/flaky' })
  routes = []
  answer(byRoute('/flaky'), replace(page('pf', 'x.F', 'Back again')))
  await navigate(ctx, '/flaky')
  assert.equal(ctx.$application.variables.mateuHostTitle, 'Back again')
  assert.equal(bridge.hasLastRetry(), false, 'a painted screen clears the retry')
})

test('onMateuNavigate: the not-found page is all the content, without the page header', async () => {
  answer(byRoute('/gone'), fx('load-not-found'))
  const ctx = newContext()
  await navigate(ctx, '/gone')
  const v = ctx.$application.variables
  assert.ok(v.mateuNotFound, 'the not-found projection is set')
  assert.deepEqual(v.mateuHostContent, [])
  assert.equal(v.mateuHostText, '')
})

test('onMateuNavigate: page banners go to the shell banner, the stale ones removed first', async () => {
  const withBanner = page('pb', 'x.B', 'B')
  withBanner.children[0].metadata.banners = [{ theme: 'WARNING', title: 'Heads up', description: 'Read me' }]
  answer(byRoute('/banner'), replace(withBanner))
  answer(byRoute('/plain'), replace(page('pp', 'x.P', 'P')))
  const ctx = newContext()
  await navigate(ctx, '/banner')
  const adds = calls.filter((c) => c[0] === 'dataProvider' && c[1].add)
  assert.equal(adds.length, 1)
  assert.equal(ctx.$application.variables.mateuBannerKeys.length, 1)
  calls.length = 0
  await navigate(ctx, '/plain')
  assert.ok(calls.some((c) => c[0] === 'dataProvider' && c[1].remove), 'the previous screen\'s banner is taken away')
  assert.deepEqual(ctx.$application.variables.mateuBannerKeys, [])
})

// Every page family lands in its own template (the variables the shell page branches on) — real
// captures of each family, loaded through the chain.
const LANDINGS = [
  ['load-wizard', (v) => v.mateuWizard && !v.mateuListing],
  ['booking-new-wizard', (v) => v.mateuWizard],
  ['load-foldout', (v) => v.mateuFoldout && v.mateuFoldoutContent.panels.length > 0],
  ['crud-view-foldout-booking', (v) => v.mateuFoldout && v.mateuHostTitle === 'QN29HB · Giulia Keller'],
  ['load-welcome', (v) => v.mateuWelcome && !v.mateuWizard],
  ['fo-load-checkin', (v) => v.mateuQueue && v.mateuHostTitle === 'Check-In'],
  ['load-stock', (v) => v.mateuListing && v.mateuHostTitle === 'Stock'],
  ['crud-view-booking', (v) => v.mateuHostContent.length > 0 && v.mateuPageHeader && !v.mateuListing],
  ['crud-edit-booking', (v) => v.mateuHostContent.length > 0 && v.mateuHostTitle === '3F2X5Y · Florian Steiner'],
  ['crud-view-integration', (v) => v.mateuHostTitle === 'MRU01 ↔ XMAR' && v.mateuHostContent.length > 0],
  ['p1-history', (v) => v.mateuHostTitle === 'History'],
  ['wf-process', (v) => v.mateuHostContent.length === 1],
  ['load-not-found', (v) => v.mateuNotFound && v.mateuHostContent.length === 0],
]
test('onMateuNavigate: every page family lands in its own template', async () => {
  for (const [name, check] of LANDINGS) {
    routes = []
    answer((b) => b.actionId === '' && !b.consumedRoute, fx(name))
    answer(() => true, { fragments: [] })
    const ctx = newContext()
    await navigate(ctx, '/' + name)
    const v = ctx.$application.variables
    assert.ok(check(v), name + ' did not land where it belongs')
    assert.equal(v.mateuNavigating, false, name)
  }
})

test('onMateuNavigate: from one foldout to another, the foldout subtree is re-created', async () => {
  answer(byRoute('/f1'), fx('load-foldout'))
  answer(byRoute('/f2'), fx('crud-view-foldout-booking'))
  answer(() => true, { fragments: [] })
  const ctx = newContext()
  await navigate(ctx, '/f1')
  const first = ctx.$application.variables.mateuFoldout
  assert.ok(first)
  await navigate(ctx, '/f2')
  assert.notEqual(ctx.$application.variables.mateuFoldout, first)
  assert.ok(ctx.$application.variables.mateuFoldout)
})

// ═══ runMateuAction ═══════════════════════════════════════════════════════════════════════════

const act = (ctx, actionId, parameters) => new chains.runMateuAction().run(ctx, { actionId, parameters })

test('runMateuAction: save sends the host state + the form draft, the answer updates state and toasts', async () => {
  answer(byRoute('/person'), fx('load-form'))
  let saved = null
  answer((b) => b.actionId === 'save', (b) => { saved = b; return fx('save-form') })
  const ctx = newContext()
  await navigate(ctx, '/person')
  const host = ctx.$application.variables.mateuRegistry.contexts[bridge.HOST_ID]
  ctx.$page.variables.mateuDraft = { name: 'Grace', age: 41 }
  await act(ctx, 'save')
  assert.ok(saved, 'the save went out')
  assert.equal(saved.componentState.name, 'Grace', 'the typed draft travels')
  assert.equal(saved.initiatorComponentId, host.tree.id)
  const after = ctx.$application.variables.mateuRegistry.contexts[bridge.HOST_ID]
  assert.equal(after.state.name, 'Grace')
  assert.equal(ctx.$page.variables.mateuToastText, 'Saved Grace')
  assert.ok(calls.some((c) => c[0] === 'method' && c[1] === '#mateuToast' && c[2] === 'open'))
})

test('runMateuAction: a failed action records a retry of the ACTION and rethrows', async () => {
  const ctx = await bootShell()
  answer(byRoute('/person'), fx('load-form'))
  answer((b) => b.actionId === 'save', { status: 500 })
  await navigate(ctx, '/person')
  await assert.rejects(act(ctx, 'save', { x: 1 }))
  assert.deepEqual(bridge.takeLastRetry(), { kind: 'action', actionId: 'save', parameters: { x: 1 } })
  assert.ok(ctx.$application.variables.mateuLastError)
})

test('runMateuAction: the action id falls back to the pressed control\'s data-action-id; none → nothing', async () => {
  answer(byRoute('/person'), fx('load-form'))
  let seen = null
  answer((b) => b.actionId === 'reset', (b) => { seen = b; return { fragments: [] } })
  const ctx = newContext()
  await navigate(ctx, '/person')
  const button = doc.createElement('oj-button')
  button.setAttribute('data-action-id', 'reset')
  await new chains.runMateuAction().run(ctx, { event: { target: button } })
  assert.ok(seen, 'the dataset id was dispatched')
  const before = sent.length
  await new chains.runMateuAction().run(ctx, {})
  assert.equal(sent.length, before)
})

test('runMateuAction: header affordances navigate without the server (parent, peers, not-found back)', async () => {
  // the shell (wired by loadMateuShell in an earlier test, ONCE per page, like VB) hears the
  // navigation-requested these dispatch and runs onMateuNavigate with the route
  answer((b) => b.actionId === '', (b) => replace(page('p' + b.route, 'x.P', 'At ' + b.route)))
  const ctx = newContext()
  ctx.$application.variables.mateuPageHeader = { parentRoute: '/customers', prevRoute: '/customers/1', nextRoute: '' }
  ctx.$application.variables.mateuNotFound = { backRoute: '/home' }
  for (const id of ['__goToParent', '__peerPrev', '__peerNext', '__notFoundBack']) {
    await act(ctx, id) // a side without a route (__peerNext here) does nothing
    await settle()
  }
  const asked = calls.filter((c) => c[0] === 'callChain' && c[1] === 'onMateuNavigate').map((c) => c[2].event.detail.route)
  assert.deepEqual(asked, ['/customers', '/customers/1', '/home'])
  assert.ok(sent.every((s) => s.body.actionId === ''), 'only navigations: no Mateu action went out')
})

test('runMateuAction: a toolbar action that needs selected rows says so instead of leaving', async () => {
  const crud = page('pl', 'x.Products', 'Products', [{ type: 'ClientSide', metadata: {
    type: 'Crud', id: 'crud', title: 'Products', rowsSelectionEnabled: true, toolbar: [{ id: 'del', actionId: 'delete', label: 'Delete', rowsSelectedRequired: true }],
    columns: [{ metadata: { id: 'name', label: 'Name' } }],
  } }], { actions: [{ id: 'delete', rowsSelectedRequired: true }] })
  answer(byRoute('/products'), replace(crud))
  const ctx = newContext()
  await navigate(ctx, '/products')
  const before = sent.length
  await act(ctx, 'delete')
  assert.equal(sent.length, before, 'nothing went out')
  assert.equal(ctx.$page.variables.mateuToastText, bridge.chromeText('selectRowsFirst'))
})

test('runMateuAction: a Drawer answer opens the drawer; CloseModal closes it and its event refreshes the host', async () => {
  const crud = page('pl', 'x.Products', 'Products', [{ type: 'ClientSide', metadata: {
    type: 'Crud', id: 'crud', title: 'Products', toolbar: [], columns: [{ metadata: { id: 'name', label: 'Name' } }],
  } }], { triggers: [{ type: 'OnCustomEvent', eventName: 'saved', actionId: 'search' }] })
  answer(byRoute('/products'), replace(crud))
  answer((b) => b.actionId === 'new', fx('open-drawer'))
  answer((b) => b.actionId === 'create', { commands: [{ type: 'CloseModal', data: { eventName: 'saved' } }], messages: [], fragments: [] })
  let refreshed = 0
  answer((b) => b.actionId === 'search', () => { refreshed++; return { fragments: [] } })
  const ctx = newContext()
  await navigate(ctx, '/products')
  await act(ctx, 'new')
  assert.equal(ctx.$application.variables.mateuDrawerOpen, true)
  assert.ok(ctx.$application.variables.mateuDrawer, 'the drawer projection is bound')
  await act(ctx, 'create')
  assert.ok(!ctx.$application.variables.mateuDrawerOpen, 'closed')
  assert.equal(refreshed, 1, 'the listing subscribed to the event searched again')
})

test('runMateuAction: a host route-flip (state-only _route) loads the inner route and pushes its URL', async () => {
  const listing = page('m1', 'x.Crud', 'Bookings', [text('list')], { route: '/bookings' })
  answer(byRoute('/bookings'), replace(listing, { _route: '/list' }))
  answer((b) => b.actionId === 'view', { commands: [{ type: 'PushStateToHistory', data: '/42' }], messages: [], fragments: [
    { targetComponentId: 'm1', action: 'Replace', component: null, state: { _route: '/42' } }] })
  let detailLoad = null
  answer((b) => b.route === '/bookings/42' && b.actionId === '', (b) => { detailLoad = b; return replace(page('d42', 'x.Booking', 'Booking 42'), {}, 'm1') })
  const ctx = newContext()
  await navigate(ctx, '/bookings')
  await act(ctx, 'view', { id: 42 })
  assert.ok(detailLoad, 'the inner route was loaded')
  assert.equal(ctx.$application.variables.mateuSelectedRoute, '/bookings/42')
  assert.ok(historyLog.some(([k, u]) => k === 'push' && /bookings\/42$/.test(u)), 'the detail is addressable')
})

test('runMateuAction: an error message goes to the shell notification banner, not to the toast', async () => {
  answer(byRoute('/person'), fx('load-form'))
  answer((b) => b.actionId === 'save', { commands: [], fragments: [], messages: [{ variant: 'error', title: 'No', text: 'Rate missing', duration: 0 }] })
  const ctx = newContext()
  await navigate(ctx, '/person')
  ctx.$page.variables.mateuDraft = { name: 'typed' }
  await act(ctx, 'save')
  const n = calls.find((c) => c[0] === 'notification')
  assert.ok(n, 'a notification event')
  assert.match(JSON.stringify(n[1]), /Rate missing/)
  assert.deepEqual(ctx.$page.variables.mateuDraft, { name: 'typed' }, 'a messages-only answer keeps what the user typed')
})

test('runMateuAction: confirmationRequired asks first — No sends nothing, Yes sends it', async () => {
  const p = page('pc', 'x.Danger', 'Danger zone', [text('careful')], { actions: [
    { id: 'purge', confirmationRequired: true, confirmationTexts: { title: 'Purge?', message: 'All rows go', confirmationText: 'Purge', denialText: 'Keep' } }] })
  answer(byRoute('/danger'), replace(p))
  let purged = 0
  answer((b) => b.actionId === 'purge', () => { purged++; return { fragments: [], messages: [{ variant: 'success', text: 'Purged' }] } })
  const ctx = newContext()
  await navigate(ctx, '/danger')
  confirmAnswer = false
  await act(ctx, 'purge')
  assert.equal(purged, 0, 'No: nothing went out')
  assert.equal(ctx.$page.variables.mateuConfirm.title, 'Purge?')
  assert.equal(ctx.$page.variables.mateuConfirm.confirmText, 'Purge')
  confirmAnswer = true
  await act(ctx, 'purge')
  assert.equal(purged, 1)
  assert.equal(ctx.$page.variables.mateuToastText, 'Purged')
})

test('runMateuAction: a wizard\'s next with its required fields empty marks them and does not leave', async () => {
  answer(byRoute('/wizard'), fx('load-wizard'))
  let nexts = 0
  answer((b) => b.actionId === 'next', () => { nexts++; return { fragments: [] } })
  const ctx = newContext()
  await navigate(ctx, '/wizard')
  const v = ctx.$application.variables
  assert.ok(v.mateuWizard, 'the wizard projection is bound')
  assert.equal(v.mateuWizardForwardId, 'next')
  assert.equal(v.mateuWizardShownStep, '', 'a fresh entry starts by the guided process overview')
  await act(ctx, 'next')
  assert.equal(nexts, 0, 'the empty required fields stop it in the browser')
  ctx.$page.variables.mateuDraft = { name: 'Ada', email: 'ada@example.com' }
  await act(ctx, 'next')
  assert.equal(nexts, 1)
})

test('runMateuAction: a flow the page declares runs in the browser, with no server round trip', async () => {
  const p = page('pf', 'x.Flows', 'Flows', [text('x')], { actions: [
    { id: 'goHome', commands: [{ type: 'NavigateTo', data: '/home' }] }] })
  answer(byRoute('/flows'), replace(p))
  const ctx = newContext()
  await navigate(ctx, '/flows')
  const before = sent.length
  await act(ctx, 'goHome')
  assert.equal(sent.length, before, 'no request')
  const nav = calls.find((c) => c[0] === 'event' && c[1] === 'application:mateuNavigate')
  assert.deepEqual(nav[2], { route: '/home', force: true }, 'a NavigateTo forces the shell to the route')
})

test('runMateuAction: an absolute NavigateTo opens the other console in its own tab', async () => {
  const opened = []
  const realOpen = win.open
  win.open = (url, target) => { opened.push([url, target]) }
  try {
    answer(byRoute('/person'), fx('load-form'))
    answer((b) => b.actionId === 'save', { commands: [{ type: 'NavigateTo', data: 'https://other.example/console' }], fragments: [], messages: [] })
    const ctx = newContext()
    await navigate(ctx, '/person')
    await act(ctx, 'save')
    assert.deepEqual(opened, [['https://other.example/console', '_blank']])
  } finally { win.open = realOpen }
})

test('runMateuAction: a LongTask (sse action) shows its progress dialog live and applies the last answer', async () => {
  const stream = fx('fo-sse-scan-stream')
  const p = page('ps', 'x.Scan', 'Scan', [text('doc')], { actions: [{ id: 'scan', sse: true }] })
  answer(byRoute('/scan'), replace(p))
  let streamed = null
  answer((b, url) => url.includes('/mateu/v3/sse/'), (b) => { streamed = b; return { __sse: stream } })
  const ctx = newContext()
  await navigate(ctx, '/scan')
  assert.deepEqual(ctx.$application.variables.mateuRegistry.contexts[bridge.HOST_ID].sseActionIds, ['scan'])
  await act(ctx, 'scan')
  assert.ok(streamed, 'it went to the /sse endpoint')
  const opened = calls.findIndex((c) => c[0] === 'method' && c[1] === '#mateuProgressDialog' && c[2] === 'open')
  const closed = calls.findIndex((c) => c[0] === 'method' && c[1] === '#mateuProgressDialog' && c[2] === 'close')
  assert.ok(opened >= 0 && closed > opened, 'opened while streaming, closed at the end')
  assert.ok(ctx.$page.variables.mateuProgressTitle, 'the dialog shows the task\'s title')
  assert.equal(typeof ctx.$page.variables.mateuProgressValue, 'number')
})

test('runMateuAction: @Searchable opens its selector dialog with its first page, and «Add selected» closes it into the host', async () => {
  const form = fx('searchable-multi-form')
  form.fragments[0].targetComponentId = ''
  answer(byRoute('/page5'), form)
  answer((b) => b.actionId === 'codesearch-hotelIds', fx('searchable-multi-open'))
  let searched = null
  answer((b) => b.actionId === 'search', (b) => { searched = b; return fx('searchable-multi-search') })
  answer((b) => b.actionId === 'action-on-row-select-selected', fx('searchable-multi-add'))
  const ctx = newContext()
  await navigate(ctx, '/page5')
  ctx.$page.variables.mateuDraft = { hotelId: 'h9' }
  await act(ctx, 'codesearch-hotelIds')
  assert.equal(ctx.$page.variables.mateuPickerOpen, true)
  assert.ok(calls.some((c) => c[0] === 'method' && c[1] === '#mateuPicker' && c[2] === 'open'))
  assert.ok(searched, 'its first page was asked for')
  assert.equal(searched.serverSideType, 'io.mateu.mdd.demoadminpanel.infra.in.ui.HotelSelector', 'against the selector, not the host')
  assert.equal(ctx.$page.variables.mateuPickerRows.length, 30)
  assert.equal(ctx.$application.variables.mateuRegistry.contexts[bridge.HOST_ID].state.hotelId, 'h9', 'what was typed is kept')
  await act(ctx, 'action-on-row-select-selected')
  assert.equal(ctx.$page.variables.mateuPickerOpen, false)
  assert.ok(calls.some((c) => c[0] === 'method' && c[1] === '#mateuPicker' && c[2] === 'close'))
  assert.deepEqual(ctx.$application.variables.mateuRegistry.contexts[bridge.HOST_ID].state.hotelIds, ['3', '1', '5'])
})

// ═══ runMateuIslandAction ═════════════════════════════════════════════════════════════════════

// the embedded-mediator island of demo-vb's IslandHostPage, as captured (fixtures/real/island-*):
// the host carries a ServerSide `_guestNote` whose child is a MEDIATOR App; the island loads in two
// steps (its mediator, then its content) and every answer is addressed to `_guestNote`
const serveIsland = ({ withHostTrigger = false } = {}) => {
  const host = fx('island-host')
  if (withHostTrigger) host.fragments[0].component.triggers = [{ type: 'OnCustomEvent', eventName: 'note-saved', actionId: 'refresh' }]
  answer(byRoute('/island-host'), host)
  answer((b) => /^\/guest-note/.test(b.route) && !/\/edit/.test(b.route) && b.actionId === '', (b) => (b.consumedRoute ? fx('island-content') : fx('island-load')))
}

test('onMateuNavigate + runMateuIslandAction: the island loads as its own surface; its action carries state + draft + seed', async () => {
  serveIsland({ withHostTrigger: true })
  let saved = null
  answer((b) => b.actionId === 'save', (b) => {
    saved = b
    const inc = fx('island-save')
    inc.commands = [{ type: 'DispatchEvent', data: { eventName: 'note-saved' } }]
    inc.messages = [{ variant: 'success', text: 'Note saved' }]
    return inc
  })
  let refreshed = null
  answer((b) => b.actionId === 'refresh', (b) => { refreshed = b; return { fragments: [] } })
  const ctx = newContext()
  await navigate(ctx, '/island-host')
  const v = ctx.$application.variables
  assert.equal(v.mateuIslandId, '_guestNote', 'the island was found and loaded')
  assert.equal(JSON.parse(v.mateuIslandSeed)._embeddedMediator, true)
  const island = v.mateuRegistry.contexts._guestNote
  assert.equal(island.state.note, 'Prefiere habitación tranquila', 'its content arrived (second step)')
  assert.deepEqual(v.mateuIsland.fields.map((f) => f.fieldId || f.id).filter(Boolean).slice(0, 2), ['paxName', 'note'])
  ctx.$page.variables.mateuIslandDraft = { note: 'Alergia al polen' }
  await new chains.runMateuIslandAction().run(ctx, { actionId: 'save' })
  assert.equal(saved.componentState.note, 'Alergia al polen', 'the draft travels')
  assert.equal(saved.componentState.paxName, 'Ada', 'with the island\'s own state')
  assert.equal(saved.componentState._embeddedMediator, true, 'and its seed, on every action')
  assert.equal(saved.initiatorComponentId.length > 0, true)
  assert.ok(refreshed, 'the host subscribed to the island\'s event refreshed')
  assert.equal(v.mateuRegistry.contexts._guestNote.state.note, 'Alergia al polen')
  assert.deepEqual(ctx.$page.variables.mateuIslandDraft, {}, 'the draft is consumed')
  assert.equal(ctx.$page.variables.mateuToastText, 'Note saved')
})

test('runMateuIslandAction: a state-only _route flip reloads the island\'s inner route with its seed', async () => {
  serveIsland()
  answer((b) => b.actionId === 'edit', { fragments: [{ targetComponentId: '_guestNote', action: 'Replace', component: null, state: { _route: '/edit' } }] })
  let flipLoad = null
  answer((b) => /\/edit/.test(b.route) && b.actionId === '', (b) => { flipLoad = b; return fx('island-edit') })
  const ctx = newContext()
  await navigate(ctx, '/island-host')
  await new chains.runMateuIslandAction().run(ctx, { actionId: 'edit' })
  assert.ok(flipLoad, 'the inner route was loaded')
  assert.equal(flipLoad.componentState._embeddedMediator, true, 'the reload carries the seed')
  assert.equal(flipLoad.initiatorComponentId, '_guestNote', 'and lands on the island')
})

test('runMateuIslandAction: without an island (or an action) it does nothing', async () => {
  const ctx = newContext()
  await new chains.runMateuIslandAction().run(ctx, { actionId: 'save' })
  ctx.$application.variables.mateuIslandId = 'ghost'
  await new chains.runMateuIslandAction().run(ctx, { actionId: 'save' })
  await new chains.runMateuIslandAction().run(ctx, {})
  assert.equal(sent.length, 0)
})

const failed = []
for (const { name, fn } of queue) {
  reset()
  try {
    await fn()
    passed++
    console.log('  ✓ ' + name)
  } catch (e) {
    failed.push(name)
    console.error('  ✗ ' + name + '\n', e)
  }
}
if (failed.length) { console.error(`\n${failed.length} VB chain tests FAILED`); process.exit(1) }
console.log(`\n${passed} VB chain tests passed`)
