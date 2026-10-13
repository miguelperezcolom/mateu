// Tests of what the two big page chains used to compute inline and now take from poc/ (thin chains):
// pageProjection.mjs (what to assign from the registry after a navigation or an action) and
// actionPlan.mjs (what an action sends, and when it must not leave yet).
// Run: node test-chains.mjs (npm test runs it).
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  listHeaderVarsOf, wizardVarsOf, archetypeVarsOf, islandVarsOf, nestedVarOf, noGenericFormVars, hostContentPlanOf,
  generalOverviewPageOf, pageHeaderOf, formActionsBesideHeader, pageWidthOf, pageLayoutOf, pageDensityOf,
} from './pageProjection.mjs'
import { outboundActionOf, hostReRendered, touchesHost, onlyMessagesAnswer, blockClickOf } from './actionPlan.mjs'
import { HOST_ID } from './reduceContexts.mjs'
import { fabsOf } from './pageProjection.mjs'
import { globalSearchHitsOf, paletteRowsOfHits } from './globalSearch.mjs'
import { initialThemeOf, nextThemeOf, applyTheme } from './theme.mjs'
import { committedValueOf } from './core/rowEditor.mjs'
import { listingUrlOf, listingUrlPagingOf } from './core/listing.mjs'

const here = dirname(fileURLToPath(import.meta.url))
let passed = 0
const test = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name) }
const node = (metadata, children = [], id = '') => ({ type: 'ClientSide', id, metadata, children })
const webApp = (rel) => readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', rel), 'utf8')

test('collection header: the first toolbar button is primary, the rest secondary', () => {
  assert.deepEqual(listHeaderVarsOf(null), { mateuListPrimary: { label: '', display: 'off' }, mateuListPrimaryId: '', mateuListSecondary: [] })
  const v = listHeaderVarsOf({ toolbar: [{ actionId: 'new', label: 'New' }, { actionId: 'exp', label: 'Export' }] })
  assert.deepEqual(v.mateuListPrimary, { label: 'New' })
  assert.equal(v.mateuListPrimaryId, 'new')
  assert.deepEqual(v.mateuListSecondary, [{ id: 'exp', value: 'exp', label: 'Export' }])
})

test('wizard footer: forward button and step — an action keeps the step, a navigation enters by the overview', () => {
  assert.deepEqual(wizardVarsOf(null, null, []), { mateuWizardForwardId: '', mateuWizardPrimary: { label: '', disabled: true }, mateuWizardShownStep: '' })
  const actions = [{ actionId: 'back', label: 'Back' }, { actionId: 'next', label: 'Next' }]
  const nav = wizardVarsOf({ tree: null }, { currentStep: 's2' }, actions)
  assert.deepEqual([nav.mateuWizardForwardId, nav.mateuWizardPrimary.label, nav.mateuWizardShownStep, nav.mateuFormActions], ['next', 'Next', '', []])
  assert.equal(wizardVarsOf({ tree: null }, { currentStep: 's2' }, actions, { keepStep: true }).mateuWizardShownStep, 's2')
  assert.deepEqual(wizardVarsOf({ tree: null }, {}, [{ actionId: 'back' }]).mateuWizardPrimary, { label: 'Done', disabled: true })
})

test('archetypes: nothing on a plain page; the generic form steps aside with noGenericFormVars', () => {
  const r = archetypeVarsOf({ tree: node({ type: 'VerticalLayout' }) }, null)
  assert.deepEqual([r.welcome, r.overview, r.item], [null, null, null])
  assert.deepEqual(r.vars.mateuItemTabTexts, [])
  assert.deepEqual(noGenericFormVars(), { mateuFormMetadata: null, mateuFormFieldsList: [], mateuFormSections: [], mateuFormActions: [] })
  assert.notEqual(noGenericFormVars().mateuFormActions, noGenericFormVars().mateuFormActions, 'fresh arrays each time')
})

test('island projection, with the nested island merged into its content', () => {
  assert.equal(islandVarsOf(null, null), null)
  // the island holds a nested one (an App marker): its atoms land in that slot
  const island = { tree: node({ type: 'VerticalLayout' }, [node({ type: 'Text', text: 'island' }), node({ type: 'Card' }, [node({ type: 'App' }, [], 'doc')])]), state: {}, data: {} }
  const nested = [{ isPlain: true, items: [{ isText: true, text: 'nested' }] }]
  const v = islandVarsOf(island, nested)
  assert.ok(Array.isArray(v.fields) && Array.isArray(v.actions))
  assert.ok(JSON.stringify(v.content).includes('nested'))
  assert.deepEqual(nestedVarOf(nested), { atoms: [{ isText: true, text: 'nested' }] })
  assert.equal(nestedVarOf(null), null)
})

test('host content: painted by the generic content only when no other branch owns the page', () => {
  const host = { tree: node({ type: 'VerticalLayout' }, [node({ type: 'Text', text: 'body' })]), state: {} }
  const own = hostContentPlanOf(host, { title: 'T' })
  assert.ok(own.noOtherBranch && own.hostBlocks && own.hostBlocks[0].items[0].text === 'body')
  assert.equal(hostContentPlanOf(host, { title: 'T', listing: {} }).hostBlocks, null)
  assert.equal(hostContentPlanOf(host, { title: 'T', wizard: true }).hostBlocks, null)
})

test('general overview page: two zoned column blocks with an EntityHeader', () => {
  const blocks = [{ blockClass: 'oj-flex-item oj-md-8', items: [{ isHeading: true, isH2: true, text: 'Main' }, { text: 'a' }] }, { blockClass: 'oj-md-4', items: [{ text: 'b' }] }]
  const gop = generalOverviewPageOf({ title: 'E' }, blocks)
  assert.ok(gop.on)
  assert.equal(gop.main.title, 'Main')
  assert.deepEqual(gop.main.blocks[0].items, [{ text: 'a' }])
  assert.equal(gop.main.blocks[0].blockClass, 'oj-flex-item oj-sm-12')
  assert.ok(!generalOverviewPageOf({ title: 'E' }, blocks, { itemOverviewOn: true }).on)
  assert.ok(!generalOverviewPageOf(null, blocks).on)
})

test('page header: primary, back affordance, secondary; band only away from edge to edge', () => {
  const toolbar = [{ actionId: 'back', label: 'Back' }, { actionId: 'save', label: 'Save', buttonStyle: 'primary' }, { actionId: 'print', label: 'Print' }]
  const h = pageHeaderOf({ host: { tree: null }, hostEntity: null, summary: { title: 'Order', trail: [] }, hostToolbar: toolbar, showHeader: true, pageWidth: 'fixed', gopOn: false })
  assert.ok(h.showBand && h.header.showBand && !h.header.showInline)
  assert.equal(h.header.title, 'Order')
  assert.ok(h.header.goToParent)
  assert.equal(h.header.backId, 'back')
  assert.deepEqual(h.translations, { goToParent: 'Back' })
  assert.ok(!h.header.secondary.some((b) => b.id === 'back'))
  const edge = pageHeaderOf({ host: { tree: null }, hostEntity: { title: 'Ada', subtitle: 'VIP', facts: [] }, summary: { title: 'x', trail: [] }, hostToolbar: [], showHeader: true, pageWidth: 'edgeToEdge', gopOn: false })
  assert.ok(!edge.showBand && edge.header.showInline)
  assert.match(edge.header.bandClass, /mateu-sticky-header/)
  assert.equal(edge.header.title, 'Ada')
  // the toolbar is painted once: the header's actions leave the form's button row
  assert.deepEqual(formActionsBesideHeader([{ actionId: 'save' }, { actionId: 'other' }], h.header, toolbar), [{ actionId: 'other' }])
  assert.deepEqual(formActionsBesideHeader([{ actionId: 'save' }], { showBand: false, showInline: false }, toolbar), [{ actionId: 'save' }])
})

test('page layout: width anatomy, bleeding header and the band overlap', () => {
  assert.equal(pageWidthOf({ host: { pageWidth: 'fullWidth' } }), 'fullWidth')
  assert.equal(pageWidthOf({ host: { pageWidth: 'fullWidth' }, drawerNav: true }), 'edgeToEdge')
  const fixed = pageLayoutOf({ host: {}, bleedingHeader: false, band: false }).vars
  assert.equal(fixed.mateuShellPageLayout, 'fixedWidth')
  assert.equal(fixed.mateuPagePadding, '24px')
  assert.equal(fixed.mateuBandBoxMargin, '0 auto')
  const banded = pageLayoutOf({ host: { pageWidth: 'fullWidth' }, bleedingHeader: true, band: true }).vars
  assert.deepEqual([banded.mateuPagePadding, banded.mateuPageMargin, banded.mateuBandBoxMargin], ['0', '-40px auto', '0'])
})

test('@Compact: a compact page or listing takes the Redwood high-density class', () => {
  // a @Compact page: the server stamps the marker into its style
  const form = { tree: { type: 'ServerSide', children: [{ type: 'ClientSide', metadata: { type: 'Page',
    style: 'max-width:900px;--lumo-size-m:1.35rem;--mateu-compact:1' } }] } }
  assert.equal(pageDensityOf(form), 'compact')
  assert.equal(pageLayoutOf({ host: form, bleedingHeader: false, band: false }).vars.mateuPageDensityClass, 'mateu-density-compact')
  // a @Compact crud: its listing says so
  const crud = { tree: { children: [{ metadata: { type: 'Page' }, children: [{ metadata: { type: 'Crud', compact: true } }] }] } }
  assert.equal(pageDensityOf(crud), 'compact')
  // anything else keeps the standard density
  assert.equal(pageDensityOf({ tree: { children: [{ metadata: { type: 'Page', style: 'width: 100%;' } }] } }), 'standard')
  assert.equal(pageLayoutOf({ host: {}, bleedingHeader: false, band: false }).vars.mateuPageDensityClass, '')
  // a nested island is its own page: its density does not leak to the host
  const island = { tree: { children: [{ type: 'ServerSide', style: '--mateu-compact:1', children: [] }] } }
  assert.equal(pageDensityOf(island), 'standard')
})

test('outbound action: the state it carries, the rows it needs, the required fields, where it goes', () => {
  const host = { id: HOST_ID, state: { a: 1 }, tree: { id: 'h', actions: [{ id: 'save', validationRequired: true }] }, outbound: {} }
  const reg = { contexts: { [HOST_ID]: host }, stack: [] }
  const plan = outboundActionOf(reg, 'go', { draft: { b: 2 }, parameters: { p: 1 } })
  assert.deepEqual(plan.componentState, { a: 1, b: 2 })
  assert.deepEqual(plan.parameters, { p: 1 })
  assert.equal(plan.overlay, null)
  // a listing whose action needs selected rows
  const listing = { rowsSelectionEnabled: true, selectionRequired: ['delete'] }
  assert.deepEqual(outboundActionOf(reg, 'delete', { listing, listingRows: [], listingSelection: { all: false, keys: [] } }), { stop: 'selectionRequired' })
  const withRows = outboundActionOf(reg, 'export', { listing, listingRows: [], listingSelection: { all: false, keys: [] } })
  assert.deepEqual(withRows.componentState.crud_selected_items, [])
  // validationRequired with an empty required field: it does not leave
  const sections = [{ fields: [{ fieldId: 'name', required: true, value: '' }] }]
  assert.deepEqual(outboundActionOf(reg, 'save', { formSections: sections }), { stop: 'fieldErrors', missing: ['name'] })
  assert.ok(!outboundActionOf(reg, 'save', { formSections: sections, draft: { name: 'Ada' } }).stop)
})

test('after the answer: host re-rendered, touched, or only messages', () => {
  const before = { tree: { id: 'a' } }
  const inc = { fragments: [{ component: {}, action: 'Replace' }] }
  assert.ok(hostReRendered(inc, before, { tree: { id: 'b' } }))
  assert.ok(!hostReRendered(inc, before, { tree: { id: 'a' } }))
  assert.ok(!hostReRendered({ fragments: [{ component: {}, action: 'Add' }] }, before, { tree: { id: 'b' } }))
  assert.ok(touchesHost(inc) && !touchesHost({ fragments: [{ action: 'Add' }] }))
  assert.ok(onlyMessagesAnswer({ lastIncrement: { fragments: [], commands: [], messages: [{}] }, events: [] }))
  assert.ok(!onlyMessagesAnswer({ lastIncrement: { fragments: [], commands: [] }, events: [], hostRepainted: true }))
  assert.ok(!onlyMessagesAnswer({ lastIncrement: { fragments: [{}] }, events: [] }))
})

test('the page chains are thin: they take the projection and the plan from the bridge', () => {
  const action = webApp('flows/main/pages/main-start-page-chains/runMateuAction.js')
  const nav = webApp('pages/shell-page-chains/onMateuNavigate.js')
  for (const fn of ['listHeaderVarsOf', 'wizardVarsOf', 'archetypeVarsOf', 'islandVarsOf', 'hostContentPlanOf', 'generalOverviewPageOf', 'pageHeaderOf', 'formActionsBesideHeader', 'pageLayoutOf']) {
    assert.ok(action.includes('bridge.' + fn + '('), 'runMateuAction uses ' + fn)
    assert.ok(nav.includes('bridge.' + fn + '('), 'onMateuNavigate uses ' + fn)
  }
  assert.ok(action.includes('bridge.outboundActionOf('))
  assert.ok(action.split('\n').length < 750, 'runMateuAction stays well under its old 835 lines')
  assert.ok(nav.split('\n').length < 600, 'onMateuNavigate stays well under its old 696 lines')
})

test('FABs: the page ones (host actions) then the app ones (app-level)', () => {
  const host = { tree: { metadata: { type: 'Page', fabs: [{ id: 'f1', actionId: 'add', label: 'Add', icon: 'vaadin:plus' }] }, children: [] } }
  const shell = { fabs: [{ id: 'g', actionId: 'quickSync', label: 'Quick sync', icon: 'vaadin:refresh', buttonStyle: 'secondary' }, { label: 'no action' }] }
  const rows = fabsOf(shell, host)
  assert.deepEqual(rows.map((r) => [r.actionId, r.appLevel, r.chroming]), [['add', false, 'callToAction'], ['quickSync', true, 'outlined']])
  assert.match(rows[0].iconClass, /^oj-ux-ico-/)
  assert.deepEqual(fabsOf(null, null), [])
})

test('global search: the hits of a _globalsearch answer, as palette rows grouped by category', () => {
  const inc = { fragments: [{ data: {} }, { data: { _globalsearch: [{ label: 'Laptop', description: 'LP-100', route: 'products', category: 'Products' }, { label: 'Ada', route: '/customers/1', category: 'Customers' }, { label: 'Mouse', route: '/products', category: 'Products' }, { label: 'no route' }] } }] }
  const hits = globalSearchHitsOf(inc)
  assert.equal(hits.length, 3)
  const rows = paletteRowsOfHits(hits)
  assert.deepEqual(rows.map((r) => [r.label, r.route, r.kind]), [['Laptop — LP-100', '/products', 'Products'], ['Mouse', '/products', 'Products'], ['Ada', '/customers/1', 'Customers']])
  assert.deepEqual(globalSearchHitsOf({ fragments: [] }), [])
})

test('theme: the stored choice wins, else the OS; dark is JET\'s inverted scheme on the page', () => {
  assert.equal(initialThemeOf('light', true), 'light')
  assert.equal(initialThemeOf(null, true), 'dark')
  assert.equal(initialThemeOf('bogus', false), 'light')
  assert.equal(nextThemeOf('dark'), 'light')
  const classes = new Set()
  const attrs = {}
  const doc = { documentElement: { classList: { toggle: (c, on) => (on ? classes.add(c) : classes.delete(c)) }, setAttribute: (k, v) => { attrs[k] = v } } }
  applyTheme('dark', doc)
  assert.ok(classes.has('oj-color-invert') && classes.has('oj-c-colorscheme-dark') && attrs.theme === 'dark')
  applyTheme('light', doc)
  assert.equal(classes.size, 0)
})

test('a display-block click: a RouteLink button navigates, any other runs its action', () => {
  assert.deepEqual(blockClickOf({ actionId: 'browseProducts', parameters: {}, route: 'products' }), { navigate: 'products' })
  assert.deepEqual(blockClickOf({ actionId: 'greet', parameters: { a: 1 } }), { actionId: 'greet', parameters: { a: 1 } })
  // VB binds an absent route as '' (or the literal 'undefined' is never sent): blank → action
  assert.deepEqual(blockClickOf({ actionId: 'greet', route: '  ' }), { actionId: 'greet', parameters: {} })
  // both dispatchers consult it before running anything
  for (const chain of ['dispatchHostBlockAction', 'dispatchIslandAction']) {
    const src = webApp(`flows/main/pages/main-start-page-chains/${chain}.js`)
    assert.ok(src.includes('bridge.blockClickOf') && src.includes('application:mateuNavigate'), chain)
  }
})

test('@AutoSave also runs from the generic form (not only from display-block inputs)', () => {
  // the actions walkthrough: a settings page whose fields are the generic form never saved
  const edited = webApp('flows/main/pages/main-start-page-chains/mateuFieldEdited.js')
  assert.ok(edited.includes('bridge.autoSaveOf('), 'mateuFieldEdited honors @AutoSave')
})

test('a Separator draws a visible rule, not an empty spacer', () => {
  const page = webApp('flows/main/pages/main-start-page.html')
  assert.ok(/isSeparator \]\]">\s*<hr class="mateu-separator/.test(page), 'the separator atom is an <hr>')
  assert.ok(webApp('resources/css/app.css').includes('.mateu-separator { border: none; border-block-start: 1px solid'))
})

test('an edited Amount keeps its currency (the money input edits only the number)', () => {
  assert.deepEqual(committedValueOf({ currency: 'EUR', value: 10, locale: 'es-ES' }, 12.5), { currency: 'EUR', value: 12.5, locale: 'es-ES' })
  assert.deepEqual(committedValueOf({ currency: 'USD', value: 1 }, '7'), { currency: 'USD', value: 7 })
  assert.equal(committedValueOf({ currency: 'EUR', value: 10 }, null), null)
  assert.equal(committedValueOf(3, 4), 4)
  assert.equal(committedValueOf(undefined, 'x'), 'x')
  const edited = webApp('flows/main/pages/main-start-page-chains/mateuFieldEdited.js')
  assert.equal(edited.split('bridge.committedValueOf(').length - 1, 2, 'both drafts (page and overlay) commit through it')
})

test('a listing keeps its page and sort in the URL, with the Vaadin contract (back, reload, shared link)', () => {
  assert.equal(listingUrlOf('/books', { genre: 'Poetry' }, 'ana', { page: 2, sort: [{ field: 'title', direction: 'descending' }] }),
    '/books?genre=Poetry&searchText=ana&page=2&sort=title:descending')
  assert.equal(listingUrlOf('/books', {}, '', { page: 0, sort: [] }), '/books')
  assert.deepEqual(listingUrlPagingOf('genre=Poetry&page=2&sort=title:descending,year:ascending'),
    { page: 2, sort: [{ field: 'title', direction: 'descending' }, { field: 'year', direction: 'ascending' }] })
  assert.deepEqual(listingUrlPagingOf(''), { page: 0, sort: [] })
  const search = webApp('flows/main/pages/main-start-page-chains/runMateuSearch.js')
  assert.ok(search.includes('bridge.listingUrlOf(') && search.includes('history.replaceState'), 'every search writes the URL')
  const nav = readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'pages', 'shell-page-chains', 'onMateuNavigate.js'), 'utf8')
  assert.ok(nav.includes('bridge.listingUrlPagingOf('), 'navigation restores page and sort')
})

test('the packaged app carries no unsubstituted VB host placeholder (the "#{env.catalogJson}#" 400 on every load)', () => {
  const bundle = readFileSync(join(here, '..', '..', '..', '..', '..', '..', 'backend', 'shared', 'frontend', 'redwood',
    'src', 'main', 'resources', 'static', '_redwood', 'bundles', 'vb-app-bundle.js'), 'utf8')
  assert.ok(!/[#%]\{env\./.test(bundle), 'a placeholder only a VB host fills is left in the jar bundle')
  // the security provider reads a static anonymous user the jar ships: without a url it asked
  // `<base>_currentuser`, which the server answered with the index page (a JSON parse error)
  assert.ok(bundle.includes('\\"userConfig\\":{\\"type\\":\\"vb/DefaultSecurityProvider\\",\\"configuration\\":{\\"url\\":\\"/_redwood/resources/mateu-anonymous-user.json\\"}'))
  const user = JSON.parse(readFileSync(join(here, '..', '..', '..', '..', '..', '..', 'backend', 'shared', 'frontend', 'redwood',
    'src', 'main', 'resources', 'static', '_redwood', 'resources', 'mateu-anonymous-user.json'), 'utf8'))
  assert.equal(user.isAuthenticated, false)
  assert.ok(bundle.includes('define("text!services/catalog.json",[],function(){return"{}";})'), 'an empty service catalogue')
})

test('leaving a wizard: no binding reads mateuWizard unguarded (the page chain set it to null and died half-way)', () => {
  // A step button, a fact action or the completion action answering a URI navigates away: the
  // chain sets mateuWizard to null BEFORE it switches mateuWizardStep off. A binding that read
  // mateuWizard.subtitle under a test on mateuWizardStep.on threw on that assignment, VB aborted
  // onMateuNavigate, and the new page was painted above the whole wizard left on screen.
  const html = webApp('flows/main/pages/main-start-page.html')
  const W = '$application.variables.mateuWizard'
  const guarded = (expr) => expr.includes(W + ' &&')
  const unguarded = []
  const tests = []
  const token = /<oj-bind-if\s+test="\[\[([\s\S]*?)\]\]"\s*>|<\/oj-bind-if>|\[\[([\s\S]*?)\]\]/g
  let m
  while ((m = token.exec(html))) {
    if (m[0] === '</oj-bind-if>') { tests.pop(); continue }
    const expr = m[1] != null ? m[1] : m[2]
    if (expr.includes(W + '.') && !guarded(expr) && !tests.some(guarded)) {
      unguarded.push(html.slice(0, m.index).split('\n').length + ': ' + expr.trim())
    }
    if (m[1] != null) tests.push(m[1])
  }
  assert.deepEqual(unguarded, [], 'reads of mateuWizard that throw once it is null')
})

console.log(`\n${passed} chain-logic tests OK`)
