// Explorer review, stream W4 (texts, navigation & shell, federation) — regressions of the fixes.
import assert from 'node:assert/strict'
import { interpolate, islandContentOf } from './core/content.mjs'
import { fieldListOf } from './core/tree.mjs'
import { markdownToHtml } from './richtext.mjs'
import { runSurfaceAction, expandRemoteMenus, remoteRouteOf, prefixedRoute, routeForRemote, remoteHomeOf, remotePrefixOfDeepLink, isStaticBundleBase, loadRouteInto, callMateu } from './transport.mjs'
import { ruleSurfacesOf } from './rules.mjs'

let passed = 0
const test = (name, fn) => {
  try { fn(); passed++ } catch (e) { console.error('✗ ' + name); throw e }
}
const atest = async (name, fn) => {
  try { await fn(); passed++ } catch (e) { console.error('✗ ' + name); throw e }
}
const cs = (metadata, children = [], extra = {}) => ({ type: 'ClientSide', metadata, children, ...extra })

test('an escaped ${i18n.x} is the literal text, an unescaped one its key', () => {
  assert.equal(interpolate('A YAML page with \\${i18n.title}', {}), 'A YAML page with ${i18n.title}')
  assert.equal(interpolate('Hello ${i18n.greeting}', {}), 'Hello greeting')
})

test('a Markdown is prose: its ${…} is never interpolated (descriptions, Code tabs)', () => {
  const tree = cs({ type: 'Markdown', markdown: 'A `${…}` in a label, and `@Label("Price (${state.currency})")`' })
  const blocks = islandContentOf({ tree, state: { currency: 'EUR' } }) || []
  const html = JSON.stringify(blocks)
  assert.ok(html.includes('${state.currency}'), html)
  assert.ok(!html.includes('Price (EUR)'), html)
})

test('a form field label is interpolated against the state, like a section title', () => {
  const tree = cs({ type: 'Form', title: 'Rate' }, [
    cs({ type: 'FormLayout' }, [
      cs({ type: 'FormField', fieldId: 'price', dataType: 'number', stereotype: 'regular', label: 'Price per night (${state.currency})' }),
    ]),
  ])
  const fields = fieldListOf(tree, { currency: 'USD', price: 1 }, {})
  assert.equal(fields.length, 1)
  assert.equal(fields[0].label, 'Price per night (USD)')
  // …and the same field painted in an island's form layout (islandContentOf → layoutFieldOf)
  const blocks = islandContentOf({ tree, state: { currency: 'USD', price: 1 } }) || []
  assert.ok(JSON.stringify(blocks).includes('Price per night (USD)'), JSON.stringify(blocks).slice(0, 600))
})

test('a list item wrapped onto a second line stays one item (lazy continuation)', () => {
  const html = markdownToHtml('Mateu:\n\n- keeps the required fields;\n- folds the optional ones into\n  More options;\n- done\n\nAfter.')
  assert.equal(html, '<p>Mateu:</p><ul><li>keeps the required fields;</li><li>folds the optional ones into More options;</li><li>done</li></ul><p>After.</p>')
})

await atest('an island action\'s error is shown ONCE (no subscriber answered: its toasts were counted twice)', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ fragments: [], commands: [],
    messages: [{ variant: 'error', text: 'Errors stay until you close them', duration: 0, persistence: 'sticky' }] }) })
  try {
    const island = { type: 'ServerSide', id: 'isl', serverSideType: 'x.FluentButtons', actions: [{ id: 'fail' }], children: [] }
    const reg = {
      contexts: {
        __root__: { id: '__root__', kind: 'host', tree: { type: 'ServerSide', id: 'host', serverSideType: 'x.Page', children: [island] }, state: {}, data: {}, outbound: { baseUrl: 'http://x', route: '/r' } },
        isl: { id: 'isl', kind: 'island', tree: island, state: {}, data: {}, outbound: { baseUrl: 'http://x', route: '/r', serverSideType: 'x.FluentButtons' } },
      },
      stack: [],
    }
    const next = await runSurfaceAction(reg, 'isl', 'fail', {}, { appState: {} })
    assert.equal(next.effects.toasts.length, 1, JSON.stringify(next.effects.toasts))
  } finally {
    globalThis.fetch = original
  }
})

test('the rules of an island painted inside the host apply to its fields (@Hidden("!state.company"))', () => {
  const island = { type: 'ServerSide', id: 'ship', serverSideType: 'x.ShippingForm', initialData: { company: false },
    rules: [{ filter: 'true', action: 'SetDataValue', fieldName: 'companyName', fieldAttribute: 'hidden', expression: '!state.company', result: 'Continue' }], children: [] }
  const reg = { contexts: { __root__: { id: '__root__', kind: 'host', tree: { type: 'ServerSide', id: 'entry', children: [island] }, state: {}, data: {} } }, stack: [] }
  const surfaces = ruleSurfacesOf(reg)
  assert.equal(surfaces.length, 1)
  assert.equal(surfaces[0].surface, 'host')
  assert.equal(surfaces[0].ctx.tree, island)
  assert.deepEqual(surfaces[0].ctx.state, { company: false })
})

test('federation: a remote\'s leaves live under its prefix in the shell; the remote is asked without it', () => {
  assert.equal(prefixedRoute('/inventory', '/stock'), '/inventory/stock')
  assert.equal(prefixedRoute('/inventory', 'stock?x=1'), '/inventory/stock?x=1')
  assert.equal(prefixedRoute('/inventory', '/inventory/stock'), '/inventory/stock')
  assert.equal(prefixedRoute('', '/stock'), '/stock')
  assert.equal(remotePrefixOfDeepLink('/inventory/stock', '/stock'), '/inventory')
  assert.equal(remotePrefixOfDeepLink('/stock', '/stock'), '')
  assert.ok(isStaticBundleBase('http://localhost:8643/manifest.json'))
  assert.ok(!isStaticBundleBase('http://localhost:8641/inventory'))
})

await atest('federation: expanded remote menus carry the prefix, deep links and the requests follow it', async () => {
  const original = globalThis.fetch
  const sent = []
  globalThis.fetch = async (url, init) => {
    sent.push({ url: String(url), body: init && init.body ? JSON.parse(init.body) : null })
    if (String(url).startsWith('http://inv.test/inventory/mateu/v3/sync/')) {
      return { ok: true, status: 200, headers: { get: () => null }, json: async () => ({ commands: [], messages: [], fragments: [{ component: { type: 'ClientSide', metadata: { type: 'App', route: '', homeRoute: '/stock', serverSideType: 'inv.InventoryApp',
        menu: [{ label: 'Stock', route: '/stock', path: '/stock' }, { label: 'About', route: '/about', path: '/about' }] } } }] }) }
    }
    throw new TypeError('Failed to fetch')
  }
  try {
    const menu = await expandRemoteMenus([
      { label: 'Inventory', remote: true, baseUrl: 'http://inv.test/inventory', route: '', path: '/inventory', routePrefix: '/inventory', shellLabel: true },
      { label: 'Help', remote: true, baseUrl: 'http://help.test/manifest.json', route: '', path: '/help', routePrefix: '/help', shellLabel: true },
    ])
    const inventory = menu[0]
    assert.deepEqual(inventory.submenus.map((o) => o.route), ['/inventory/stock', '/inventory/about'])
    assert.equal(remoteRouteOf('/inventory/stock').baseUrl, 'http://inv.test/inventory')
    assert.equal(routeForRemote('http://inv.test/inventory', '/inventory/stock'), '/stock')
    // a static remote is never POSTed to as a server (it used to be: …/manifest.json/mateu/v3/sync)
    assert.ok(!sent.some((r) => r.url.includes('manifest.json/mateu')), JSON.stringify(sent.map((r) => r.url)))
    sent.length = 0
    await callMateu('http://inv.test/inventory', { route: '/inventory/stock', actionId: '' }, { quiet: true })
    assert.equal(sent[0].url, 'http://inv.test/inventory/mateu/v3/sync/stock')
    assert.equal(sent[0].body.route, '/stock')
  } finally {
    globalThis.fetch = original
  }
})

await atest('federation: a fresh deep link to a remote screen loads the content from the remote the shell names', async () => {
  const original = globalThis.fetch
  const sent = []
  const shellApp = { type: 'ClientSide', metadata: { type: 'App', route: '', title: 'Fed', serverSideType: 'x.Console', menu: [],
    homeRoute: '/whoami', homeConsumedRoute: '', homeBaseUrl: 'http://inv2.test/inv', homeServerSideType: 'inv.InventoryApp' } }
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body)
    sent.push({ url: String(url), body })
    const answer = String(url).startsWith('http://inv2.test/')
      ? { commands: [], messages: [], fragments: [{ targetComponentId: body.initiatorComponentId, component: { type: 'ServerSide', id: 'who', serverSideType: 'inv.WhoAmI', children: [{ type: 'ClientSide', metadata: { type: 'Text', text: 'You are anonymous' }, children: [] }] } }] }
      : { commands: [], messages: [], fragments: [{ component: shellApp }] }
    return { ok: true, status: 200, headers: { get: () => null }, json: async () => answer }
  }
  try {
    assert.ok(remoteHomeOf({ fragments: [{ component: shellApp }] }, 'http://shell.test/fed'))
    const reg = await loadRouteInto('http://shell.test/fed', { contexts: {}, stack: [], shell: { serverSideType: 'x.Console' } }, '/inv/whoami', '', { appState: {} })
    assert.equal(sent.length, 2, JSON.stringify(sent.map((r) => r.url)))
    assert.equal(sent[1].url, 'http://inv2.test/inv/mateu/v3/sync/whoami')
    assert.equal(sent[1].body.serverSideType, 'inv.InventoryApp')
    assert.equal(reg.contexts.__root__.tree.serverSideType, 'inv.WhoAmI')
    assert.equal(reg.contexts.__root__.outbound.baseUrl, 'http://inv2.test/inv')
  } finally {
    globalThis.fetch = original
  }
})

await atest('route params: a screen\'s ?query rides the request URL (the server seeds it: query > defaults), the route stays clean', async () => {
  const original = globalThis.fetch
  const sent = []
  globalThis.fetch = async (url, init) => {
    sent.push({ url: String(url), body: JSON.parse(init.body) })
    return { ok: true, status: 200, headers: { get: () => null }, json: async () => ({ commands: [], messages: [], fragments: [{ component: { type: 'ServerSide', id: 'rq', serverSideType: 'x.RateQuote', children: [] }, state: { currency: 'USD' } }] }) }
  }
  try {
    const reg = await loadRouteInto('http://app.test', { contexts: {}, stack: [] }, '/x/rates/web/palma?currency=USD&nights=3', '', { appState: {} })
    assert.equal(sent[0].url, 'http://app.test/mateu/v3/sync/x/rates/web/palma?currency=USD&nights=3')
    assert.equal(sent[0].body.route, '/x/rates/web/palma')
    assert.equal(reg.contexts.__root__.outbound.route, '/x/rates/web/palma')
  } finally {
    globalThis.fetch = original
  }
})

test('a page\'s declared breadcrumbs (BreadcrumbsSupplier) are its trail and the header draws them', async () => {
  const { summarizeHost } = await import('./core/pageHeader.mjs')
  const { headerCrumbsOf } = await import('./pageProjection.mjs')
  const host = { id: '__root__', kind: 'host', state: {}, data: {}, tree: { type: 'ServerSide', id: 'inv', serverSideType: 'x.InvoicePage', children: [
    { type: 'ClientSide', metadata: { type: 'Page', title: 'Invoice 2026-42', breadcrumbs: [
      { text: 'Behaviour', link: '/behaviour/overview' }, { text: 'Breadcrumbs', link: '/behaviour/navigation/breadcrumb-trail' }, { text: 'Invoice 2026-42 · Ada Lovelace', link: '' },
    ] }, children: [] }] } }
  const summary = summarizeHost({ contexts: { __root__: host }, stack: [], shell: { menu: [] } }, '/x/invoices/2026-42')
  assert.deepEqual(summary.trail.map((c) => c.text), ['Behaviour', 'Breadcrumbs', 'Invoice 2026-42 · Ada Lovelace'])
  assert.equal(summary.trail[1].route, '/behaviour/navigation/breadcrumb-trail')
  const crumbs = headerCrumbsOf([{ text: 'Behaviour', route: '/behaviour/overview' }, { text: 'Now', route: '' }])
  assert.deepEqual(crumbs.map((c) => [c.text, c.hasHref, c.last]), [['Behaviour', true, false], ['Now', false, true]])
})

test('shell variants: seven shells, not two; chromeless draws none; the Ask FAB stays out of a framed app', async () => {
  const { shellNavOf, shellChromeOf } = await import('./core/shellNav.mjs')
  const menu = [{ label: 'Rooms', route: '/rooms' }, { label: 'Guests', route: '/guests' },
    { label: 'Reports', route: '/reports', submenus: [{ label: 'Arrivals', route: '/reports/arrivals' }] }]
  const modeOf = (variant, extra = {}) => shellNavOf({ shell: { variant, menu, ...extra } }).mode
  assert.deepEqual(['MENU_ON_TOP', 'MENU_ON_LEFT', 'HAMBURGER_MENU', 'HAMBURGER_SECTIONS', 'TILES', 'TABS', 'RAIL'].map((v) => modeOf(v)),
    ['subheader', 'left', 'drawer', 'sections', 'tiles', 'topbar', 'rail'])
  assert.equal(modeOf('TABS', { chromeless: true }), 'none')
  // TILES: every group opens as a panel of cards
  const tiles = shellNavOf({ shell: { variant: 'TILES', menu } })
  assert.equal(tiles.menuTree[2].isCards, true)
  assert.deepEqual(shellChromeOf({ mode: 'left' }, {}), { drawer: true, docked: true, rail: false, chromeless: false, askFab: 'on' })
  assert.deepEqual(shellChromeOf({ mode: 'rail' }, {}).rail, true)
  assert.equal(shellChromeOf({ mode: 'drawer' }, {}).docked, false)
  assert.equal(shellChromeOf({ mode: 'none' }, { chromeless: true }).chromeless, true)
  assert.equal(shellChromeOf({ mode: 'tabs' }, {}, true).askFab, 'off')
  assert.equal(shellChromeOf({ mode: 'tabs' }, { commandCenterEnabled: true }, true).askFab, 'on')
})

test('Ctrl+K / ⌘K is the palette key', async () => {
  const { isPaletteKey } = await import('./keys.mjs')
  assert.ok(isPaletteKey({ ctrlKey: true, key: 'k' }))
  assert.ok(isPaletteKey({ metaKey: true, code: 'KeyK', key: 'κ' }))
  assert.ok(!isPaletteKey({ ctrlKey: true, shiftKey: true, key: 'K' }))
  assert.ok(!isPaletteKey({ key: 'k' }))
})

console.log(`test-explorer-w4: ${passed} passed`)
