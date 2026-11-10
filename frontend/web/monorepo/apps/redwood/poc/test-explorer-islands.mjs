// Island composition, as the Mateu Explorer found it on Redwood (3.0-beta.57): every Java example
// is an inline island (an EmbeddedView → a ServerSide inside the entry page) and every `route:`
// example a MicroFrontend. Each test pins one rule: an island is another SURFACE — it draws its own
// header and buttons, its overlays open, its own surfaces load, it never claims the host page, and
// a component inside a card stays content.
// Run: node test-explorer-islands.mjs (npm test runs it with the other suites).
import './test-locale.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  HOST_ID, islandContentOf, hostContentOf, withSubresources, findByType, pageToolbarOf, pageHeaderNodeOf,
  bannersOf, notFoundOf, pageListingNodeOf, foldoutOf, reduceContexts, overlayOf, tagSurfaceActions,
  dismissBanner, pageEmptyStateNode,
} from './reduceContexts.mjs'
import { surfaceOverlayVarsOf, drawerChangedBetween } from './pageProjection.mjs'
import { embeddedAppOf, runSurfaceAction, loadSubresources } from './transport.mjs'

const here = dirname(fileURLToPath(import.meta.url))
let passed = 0
const pending = []
const test = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name) }
const atest = (name, fn) => pending.push([name, fn])
const cs = (metadata, children = [], id = '') => ({ type: 'ClientSide', id, metadata, children })
const ss = (id, serverSideType, children = [], extra = {}) => ({ type: 'ServerSide', id, serverSideType, children, actions: [], ...extra })
const itemsOf = (blocks) => (blocks || []).flatMap((b) => b.items || [])

// the Explorer's shape: an entry page (a Form) with an example card holding a Java island
const islandPage = cs({
  type: 'Page', title: 'Room 214', subtitle: 'Ada Lovelace', overline: 'Front desk',
  badges: [{ text: 'VIP', color: 'warning' }], kpis: [{ title: 'Nights', text: '3' }],
  toolbar: [{ actionId: 'refresh', label: 'Refresh' }],
  buttons: [{ actionId: 'release', label: 'Release room', color: 'error' }],
  banners: [
    { theme: 'SUCCESS', title: 'Audit done', description: 'Goes in 5 s', timeoutSeconds: 5 },
    { theme: 'WARNING', title: 'Overbooking', description: 'Saturday', hasCloseButton: true },
  ],
}, [cs({ type: 'Card' }, [cs({ type: 'FormLayout' }, [cs({ type: 'FormRow' }, [cs({ type: 'FormField', fieldId: 'guest', dataType: 'string', label: 'Guest' })])])])])
const island = ss('isl-1', 'demo.RoomRelease', [islandPage], { actions: [{ id: 'release', confirmationRequired: true, confirmationTexts: { title: 'Release?' } }] })
const entry = ss('entry', 'explorer.EntryPage', [cs({ type: 'Form', title: 'Confirmations', overline: 'Behaviour', toolbar: [] }, [
  cs({ type: 'Markdown', markdown: 'Try it' }),
  cs({ type: 'Card', title: cs({ type: 'Text', text: 'Release a room' }) }, [cs({ type: 'VerticalLayout' }, [island])]),
])])
const hostReg = () => ({
  contexts: {
    [HOST_ID]: { id: HOST_ID, kind: 'host', tree: entry, state: {}, data: {}, outbound: { route: '/confirmations', baseUrl: '' } },
    'isl-1': { id: 'isl-1', kind: 'island', tree: island, state: { guest: 'Ada' }, data: {}, outbound: { route: '/confirmations', serverSideType: 'demo.RoomRelease', baseUrl: '' } },
  },
  stack: [],
  shell: { title: 'Explorer', menu: [] },
})

test('findByType never crosses into an island: the host page header is the host\'s', () => {
  assert.equal(findByType(entry, 'Page'), null, 'the island\'s Page is another surface')
  assert.equal(pageHeaderNodeOf(entry).metadata.title, 'Confirmations')
  assert.deepEqual(pageToolbarOf({ tree: entry, state: {} }), [], 'no island @Toolbar copied into the host header')
  assert.deepEqual(bannersOf({ tree: entry, state: {} }), [], 'the island banners are not hoisted above the entry title')
})

test('an island\'s page draws its header, toolbar, banners and @Button row inside its hole', () => {
  const reg = hostReg()
  const host = hostContentOf(reg.contexts[HOST_ID], null, { title: 'Confirmations' })
  const items = itemsOf(withSubresources(host, reg.contexts))
  const header = items.find((a) => a.isIslandHeader)
  assert.equal(header.title, 'Room 214')
  assert.equal(header.subtitle, 'Ada Lovelace')
  assert.deepEqual(header.badges.map((b) => b.label), ['VIP'])
  assert.deepEqual(header.facts, [{ label: 'Nights', value: '3' }])
  assert.ok(items.some((a) => a.isText && a.text === 'Front desk'), 'its overline')
  const toolbar = items.find((a) => a.isButtons && a.buttons.some((b) => b.actionId === 'refresh'))
  assert.ok(toolbar && !toolbar.fromPageToolbar, 'its toolbar is its own, not the host header\'s')
  const row = items.find((a) => a.fromPageButtons)
  assert.deepEqual(row.buttons.map((b) => [b.label, b.surfaceId]), [['Release room', 'isl-1']], 'dispatched to the island')
  const banners = items.filter((a) => a.isIslandBanner)
  assert.deepEqual(banners.map((b) => [b.closeable, b.timeoutMs]), [[false, '5000'], [true, '']])
})

test('a dismissed island banner is not painted again', () => {
  const reg = hostReg()
  const key = itemsOf(withSubresources(hostContentOf(reg.contexts[HOST_ID], null, {}), reg.contexts)).find((a) => a.isIslandBanner && a.closeable).bannerKey
  dismissBanner(key)
  const again = itemsOf(withSubresources(hostContentOf(reg.contexts[HOST_ID], null, {}), reg.contexts)).filter((a) => a.isIslandBanner)
  assert.equal(again.length, 1)
})

test('a field-less page draws its own @Button row (no generic form would)', () => {
  const tree = ss('p', 'demo.Rates', [cs({ type: 'Page', title: 'Rates', buttons: [{ actionId: 'update', label: 'Update 5 rate plans' }] })])
  const blocks = hostContentOf({ tree, state: {}, data: {} }, null, { title: 'Rates' })
  assert.deepEqual(itemsOf(blocks).filter((a) => a.isButtons).flatMap((a) => a.buttons.map((b) => b.label)), ['Update 5 rate plans'])
})

test('a @Button label follows the state, like a title (Charge ${state.nights} nights)', () => {
  const tree = ss('p', 'demo.Rate', [cs({ type: 'Page', title: 'Rate', buttons: [{ actionId: 'charge', label: 'Charge ${state.nights} nights' }] })])
  const blocks = hostContentOf({ tree, state: { nights: 3 }, data: {} }, null, { title: 'Rate' })
  assert.deepEqual(itemsOf(blocks).filter((a) => a.isButtons).flatMap((a) => a.buttons.map((b) => b.label)), ['Charge 3 nights'])
})

test('a page\'s FABs are FABs, not also buttons of the content', () => {
  const tree = ss('p', 'demo.Board', [cs({ type: 'Page', title: 'Rooms', fabs: [{ actionId: 'markClean', label: 'Mark clean' }],
    buttons: [{ actionId: 'go', label: 'Go' }] }, [cs({ type: 'Badge', text: 'x' })])])
  const labels = itemsOf(hostContentOf({ tree, state: {}, data: {} }, null, {})).filter((a) => a.isButtons).flatMap((a) => a.buttons.map((b) => b.label))
  assert.deepEqual(labels, ['Go'])
})

test('a Notification an action returns is a toast; the surface keeps its tree', () => {
  const reg = hostReg()
  const next = reduceContexts(reg, { fragments: [{ targetComponentId: 'isl-1', action: 'Replace',
    component: cs({ type: 'Notification', title: 'Exported', text: '1,284 records' }) }] }, { initiator: 'isl-1' })
  assert.equal(next.contexts['isl-1'].tree, island)
  assert.deepEqual(next.effects.toasts.map((t) => t.text), ['Exported — 1,284 records'])
})

test('a Dialog / Drawer an island returns opens (surfaceOverlayVarsOf); a dialog over a drawer keeps the drawer', () => {
  const before = hostReg()
  const withDialog = reduceContexts(before, { fragments: [{ targetComponentId: 'isl-1', action: 'Add',
    component: cs({ type: 'Dialog', headerTitle: 'Opening hours', content: cs({ type: 'Text', text: 'Mon–Fri' }) }) }] }, { initiator: 'isl-1' })
  const vars = surfaceOverlayVarsOf(before, withDialog)
  assert.ok(vars.changed && vars.modal && !vars.drawerOpen)
  assert.equal(overlayOf(withDialog).title, 'Opening hours')
  const withDrawer = reduceContexts(before, { fragments: [{ targetComponentId: 'isl-1', action: 'Add',
    component: cs({ type: 'Drawer', headerTitle: 'New contact', content: cs({ type: 'Text', text: 'x' }) }) }] }, { initiator: 'isl-1' })
  assert.ok(surfaceOverlayVarsOf(before, withDrawer).drawerOpen)
  assert.ok(drawerChangedBetween(before, withDrawer))
  const nested = reduceContexts(withDrawer, { fragments: [{ targetComponentId: 'x', action: 'Add',
    component: cs({ type: 'Dialog', headerTitle: 'Duplicates', content: cs({ type: 'Text', text: 'none' }) }) }] })
  assert.equal(drawerChangedBetween(withDrawer, nested), false, 'what was typed in the drawer stays')
})

atest('runSurfaceAction: its toasts once, and the ConfirmDialog it returned', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async () => ({ ok: true, status: 200, headers: { get: () => null }, json: async () => ({
    commands: [], messages: [{ text: 'Room 214 released', variant: 'success' }],
    fragments: [{ targetComponentId: 'isl-1', action: 'Add', component: cs({ type: 'ConfirmDialog', header: 'Publish?', confirmActionId: 'published', rejectActionId: 'keptAsDraft', canReject: true }) }],
  }) })
  try {
    const next = await runSurfaceAction(hostReg(), 'isl-1', 'release', {}, { appState: {} })
    assert.deepEqual(next.effects.toasts.map((t) => t.text), ['Room 214 released'])
    assert.deepEqual(next.effects.returnedConfirms.map((c) => [c.confirmActionId, c.denyActionId]), [['published', 'keptAsDraft']])
  } finally { globalThis.fetch = original }
})

test('a surface inside a surface is filled too, and its actions go to the innermost one', () => {
  const inner = ss('isl-inner', 'demo.Madrid', [cs({ type: 'Button', label: 'Madrid: stock changed', actionId: 'madridStock' })])
  const outer = ss('isl-outer', 'demo.Warehouses', [cs({ type: 'Page', title: 'Warehouses' }, [cs({ type: 'CustomField', label: 'Madrid' }, [inner])])])
  const host = ss('entry', 'explorer.EntryPage', [cs({ type: 'Form', title: 'Event bus' }, [cs({ type: 'Card' }, [outer])])])
  const contexts = {
    [HOST_ID]: { id: HOST_ID, kind: 'host', tree: host, state: {}, data: {} },
    'isl-outer': { id: 'isl-outer', kind: 'island', tree: outer, state: {}, data: {} },
  }
  const blocks = hostContentOf(contexts[HOST_ID], null, {})
  const unloaded = itemsOf(withSubresources(blocks, contexts)).find((a) => a.isSubresource)
  assert.equal(unloaded.subresource.parentId, 'isl-outer', 'the nested hole names its parent surface')
  contexts['isl-inner'] = { id: 'isl-inner', kind: 'island', tree: inner, state: {}, data: {} }
  const button = itemsOf(withSubresources(blocks, contexts)).flatMap((a) => a.buttons || []).find((b) => b.actionId === 'madridStock')
  assert.equal(button.surfaceId, 'isl-inner')
  assert.equal(tagSurfaceActions({ actionId: 'a', surfaceId: 'in' }, 'out').surfaceId, 'in')
})

atest('loadSubresources registers the islands of a loaded surface (in rounds) under their parent', async () => {
  const inner = ss('isl-inner', 'demo.Madrid', [cs({ type: 'Text', text: 'Madrid' })])
  const outer = ss('isl-outer', 'demo.Warehouses', [cs({ type: 'Page', title: 'W' }, [cs({ type: 'CustomField' }, [inner])])])
  const host = ss('entry', 'explorer.EntryPage', [cs({ type: 'Form', title: 'E' }, [cs({ type: 'Card' }, [outer])])])
  let reg = { contexts: { [HOST_ID]: { id: HOST_ID, kind: 'host', tree: host, state: {}, data: {}, outbound: { route: '/e', baseUrl: '' } } }, stack: [] }
  reg = await loadSubresources('', reg, hostContentOf(reg.contexts[HOST_ID], null, {}), {})
  assert.ok(reg.contexts['isl-outer'] && reg.contexts['isl-inner'], 'both islands registered with no request')
  assert.equal(reg.contexts['isl-inner'].outbound.serverSideType, 'demo.Madrid')
})

test('a MicroFrontend answering a whole app or a page only a page can draw is framed', () => {
  const app = { fragments: [{ component: cs({ type: 'App', variant: 'TABS', title: 'App context demo', route: '/apps/app-context' }) }] }
  assert.deepEqual(embeddedAppOf(app, { baseUrl: '/apps/app-context', route: '' }), { src: '/apps/app-context', title: 'App context demo', height: '36rem' })
  const crud = { fragments: [{ component: ss('_app', 'demo.ArtworkCrud', [cs({ type: 'App', variant: 'MEDIATOR', homeRoute: '/x/crud' })]) }] }
  assert.equal(embeddedAppOf(crud, { baseUrl: '', route: '/x/crud' }).src, '/x/crud')
  const templated = { fragments: [{ component: cs({ type: 'Form', title: 'Impressions', template: { type: 'FoldoutPage' } }) }] }
  assert.equal(embeddedAppOf(templated, { route: 'x/foldout-page' }).src, '/x/foldout-page')
  const plain = { fragments: [{ component: ss('p', 'demo.Planet', [cs({ type: 'Form', title: 'Tatooine' })]) }] }
  assert.equal(embeddedAppOf(plain, { route: '/x/planets/1' }), null, 'a plain page is painted inline')
  const contexts = { m: { id: 'm', tree: { type: 'ServerSide' }, embeddedApp: { src: '/apps/x', title: 'X', height: '36rem' } } }
  const frame = itemsOf(withSubresources([{ items: [{ isSubresource: true, islandId: 'm', subresource: { id: 'm' } }] }], contexts))[0]
  assert.ok(frame.isAppFrame && frame.src === '/apps/x')
  assert.ok(readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page.html'), 'utf8')
    .includes('<iframe class="mateu-app-frame"'), 'the generated page draws the frame')
})

test('a NotFound, an EmptyState, a FoldoutLayout or a Listing inside an example card stays content', () => {
  const card = (child) => ss('entry', 'explorer.EntryPage', [cs({ type: 'Form', title: 'Entry' }, [cs({ type: 'Markdown', markdown: 'x' }), cs({ type: 'Card' }, [child])])])
  const nf = card(cs({ type: 'NotFound', title: 'Booking not found', message: 'No HB-99999', backRoute: 'home' }))
  assert.equal(notFoundOf(nf, 'en'), null)
  const nfAtoms = itemsOf(islandContentOf({ tree: nf, state: {}, data: {}, kind: 'host' }))
  assert.ok(nfAtoms.some((a) => a.isEmptyStateAtom && a.title === 'Booking not found'))
  assert.ok(nfAtoms.some((a) => a.isAnchor && a.href === '/home'))
  assert.equal(pageEmptyStateNode(card(cs({ type: 'EmptyState', title: 'No arrivals' }))), null)
  assert.equal(foldoutOf({ tree: card(cs({ type: 'FoldoutLayout', panels: [] })), state: {} }), null)
  const listing = card(cs({ type: 'Crud', title: 'Artworks', rowsSource: { url: '/api/a' }, columns: [] }))
  assert.equal(pageListingNodeOf(listing), null)
  assert.ok(itemsOf(islandContentOf({ tree: listing, state: {}, data: {} })).some((a) => a.isNestedListing))
  // …while a page's own NotFound / Listing still is the page's
  assert.ok(notFoundOf(ss('p', 'X', [cs({ type: 'NotFound', title: 'Gone' })]), 'en'))
  assert.ok(pageListingNodeOf(ss('p', 'X', [cs({ type: 'Crud', title: 'All', columns: [] })])))
})

test('an island\'s tabs and panels keep their own keys: a click in one never switches another', () => {
  const tabs = (label) => cs({ type: 'TabLayout' }, [cs({ type: 'Tab', label: label + ' A' }, [cs({ type: 'Text', text: label + ' a' })]),
    cs({ type: 'Tab', label: label + ' B' }, [cs({ type: 'Text', text: label + ' b' })])])
  const isl = ss('isl-t', 'demo.Overview', [cs({ type: 'VerticalLayout' }, [tabs('Island'), cs({ type: 'AccordionLayout' }, [cs({ type: 'AccordionPanel', label: 'Parking' }, [cs({ type: 'Text', text: 'p' })])])])])
  const host = ss('entry', 'explorer.EntryPage', [cs({ type: 'Form', title: 'E' }, [cs({ type: 'Card' }, [isl]), tabs('Code')])])
  const contexts = { [HOST_ID]: { id: HOST_ID, kind: 'host', tree: host, state: {}, data: {} }, 'isl-t': { id: 'isl-t', kind: 'island', tree: isl, state: {}, data: {} } }
  const strips = (activeTabs) => itemsOf(withSubresources(hostContentOf(contexts[HOST_ID], null, { activeTabs }), contexts, { activeTabs })).filter((a) => a.isTabs)
  const [islandStrip, codeStrip] = strips({})
  assert.notEqual(islandStrip.stripKey, codeStrip.stripKey)
  assert.notEqual(islandStrip.barId, codeStrip.barId)
  const picked = islandStrip.tabs[1].id
  const after = strips({ [islandStrip.stripKey]: picked })
  assert.equal(after[0].selectedId, picked, 'the island tab switched')
  assert.equal(after[1].selectedId, codeStrip.selectedId, 'the Code tabs did not')
})

test('a Card inside an example card stays in place, with its media, subtitle, suffix and footer', () => {
  const inner = cs({ type: 'Card', title: cs({ type: 'Text', text: 'Deluxe sea view' }), subtitle: cs({ type: 'Text', text: '32 m²' }),
    media: cs({ type: 'Image', src: '/bay.svg' }), headerSuffix: cs({ type: 'Badge', text: '€ 380' }),
    content: cs({ type: 'Text', text: 'Morning sun' }), footer: cs({ type: 'Button', label: 'See availability', actionId: 'see' }) })
  const tree = ss('entry', 'explorer.EntryPage', [cs({ type: 'Form', title: 'Cards' }, [
    cs({ type: 'Card', title: cs({ type: 'Text', text: 'In YAML' }) }, [cs({ type: 'VerticalLayout' }, [inner, cs({ type: 'Text', text: 'after' })])]),
  ])])
  const blocks = hostContentOf({ tree, state: {}, data: {} }, null, {})
  const card = blocks.find((b) => b.isCard)
  const seq = card.items.map((a) => (a.isImage ? 'img' : a.isBadge ? 'badge:' + a.label : a.isButtons ? 'btn:' + a.buttons[0].label : a.text))
  assert.deepEqual(seq, ['In YAML', 'img', 'Deluxe sea view', '32 m²', 'badge:€ 380', 'Morning sun', 'btn:See availability', 'after'])
  assert.equal(blocks.filter((b) => b.isCard).length, 1, 'not moved out as a block of its own')
})

for (const [name, fn] of pending) { await fn(); passed++; console.log('  ✓ ' + name) }
console.log(`\n${passed} explorer-islands tests OK`)
