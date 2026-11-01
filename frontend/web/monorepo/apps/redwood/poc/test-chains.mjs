// Tests of what the two big page chains used to compute inline and now take from poc/ (thin chains):
// pageProjection.mjs (what to assign from the registry after a navigation or an action) and
// actionPlan.mjs (what an action sends, and when it must not leave yet).
// Run: node test-chains.mjs (npm test runs it).
import './test-locale.mjs' // first: off English the suite reruns in English (see the module)
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  listHeaderVarsOf, wizardVarsOf, archetypeVarsOf, islandVarsOf, nestedVarOf, noGenericFormVars, hostContentPlanOf,
  generalOverviewPageOf, pageHeaderOf, formActionsBesideHeader, pageWidthOf, pageLayoutOf, pageDensityOf,
  overlayVarsOf, EMPTY_OVERLAY,
} from './pageProjection.mjs'
import { outboundActionOf, hostReRendered, touchesHost, onlyMessagesAnswer, blockClickOf, routeStateOf, refusedFieldsOf } from './actionPlan.mjs'
import { validationErrorsOf, isSseAction } from './core/rowEditor.mjs'
import { sameRowsSameProvider } from './core/content.mjs'
import { evaluateExpression } from './rules.mjs'
import {
  HOST_ID, hostContentOf, actionsOf, withFormActions, withFormActionsRowOf, tabOnlyActionIdsOf, pageToolbarOf,
  reduceContexts, overlayOf, drawerOverlayOf, dialogOverlayOf, dismissOverlayById, followUpsOf, followUpActionsOf,
} from './reduceContexts.mjs'
import { hostContentBesideHeader, fabsOf, sameProjectedValue, changedOnly, stagedVariables } from './pageProjection.mjs'
import { globalSearchHitsOf, paletteRowsOfHits } from './globalSearch.mjs'
import { applyLightTheme } from './theme.mjs'
import { committedValueOf } from './core/rowEditor.mjs'
import { listingUrlOf, listingUrlPagingOf } from './core/listing.mjs'

const here = dirname(fileURLToPath(import.meta.url))
let passed = 0
const test = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name) }
const node = (metadata, children = [], id = '') => ({ type: 'ClientSide', id, metadata, children })
const webApp = (rel) => readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', rel), 'utf8')

test('changedOnly: a value equal to the one there is not assigned, so nothing bound to it repaints', () => {
  assert.ok(sameProjectedValue({ a: [1, { b: 'x' }], c: null }, { a: [1, { b: 'x' }], c: null }))
  assert.ok(!sameProjectedValue({ a: [1] }, { a: [2] }))
  assert.ok(!sameProjectedValue({ a: 1 }, { a: 1, b: 2 }), 'one more key is a change')
  assert.ok(sameProjectedValue({ a: 1, disabled: false }, { a: 1 }), 'a false the page wrote into the painted value is not')
  assert.ok(!sameProjectedValue({ a: 1, disabled: true }, { a: 1 }))
  assert.ok(sameProjectedValue({ a: 1 }, { a: 1, b: undefined }))
  assert.ok(!sameProjectedValue([1], { 0: 1, length: 1 }))
  const provider = new Map()
  assert.ok(sameProjectedValue(provider, provider) && !sameProjectedValue(new Map(), new Map()), 'a non-plain value only if it is the same one')
  const vars = { mateuHostContent: [{ type: 'text', text: 'Running' }], mateuDirty: false }
  const before = vars.mateuHostContent
  const changed = changedOnly(vars)
  changed.mateuHostContent = [{ type: 'text', text: 'Running' }]
  changed.mateuDirty = false
  assert.equal(vars.mateuHostContent, before, 'the same content keeps the same object')
  changed.mateuHostContent = [{ type: 'text', text: 'Completed' }]
  assert.equal(vars.mateuHostContent[0].text, 'Completed')
  assert.equal(changed.mateuDirty, false, 'reads go through')
})

test('stagedVariables: set twice on the way, assigned once at the commit — and only if it changed', () => {
  const sections = [{ title: 'Process' }]
  const target = { mateuFormSections: sections, mateuHostContent: [] }
  const writes = []
  const watched = new Proxy(target, { set: (t, k, v) => { writes.push(k); t[k] = v; return true } })
  const { vars, commit } = stagedVariables(watched)
  vars.mateuFormSections = [{ title: 'Summary' }] // the summary's…
  assert.deepEqual(vars.mateuFormSections, [{ title: 'Summary' }], 'reads give back what was set')
  vars.mateuFormSections = [{ title: 'Process' }] // …then the final one, the same as on screen
  vars.mateuHostContent = [{ type: 'text', text: 'Running' }]
  assert.deepEqual(writes, [], 'nothing reaches the variables before the commit')
  assert.deepEqual([...commit()], ['mateuHostContent'], 'the commit names what it assigned')
  assert.deepEqual(writes, ['mateuHostContent'], 'only what changed is assigned')
  assert.equal(target.mateuFormSections, sections)
})

test('sameRowsSameProvider: unchanged rows keep their data provider, changed ones get a new one', () => {
  let made = 0
  const provider = sameRowsSameProvider((rows) => ({ n: ++made, rows }), 2)
  const a = provider([{ id: 1, status: 'Running' }])
  assert.equal(provider([{ id: 1, status: 'Running' }]), a, 'same rows → the same provider: the table has nothing to repaint')
  const b = provider([{ id: 1, status: 'Completed' }])
  assert.notEqual(b, a)
  provider([{ id: 2 }]); provider([{ id: 3 }])
  assert.notEqual(provider([{ id: 1, status: 'Running' }]), a, 'only the last few are kept')
})

test('changedOnly: the action chain projects through it (a poll with the same data repaints nothing)', () => {
  const chain = webApp('flows/main/pages/main-start-page-chains/runMateuAction.js')
  assert.match(chain, /const changed = bridge\.changedOnly\(\$application\.variables\)/)
  assert.match(chain, /const staged = bridge\.stagedVariables\(\$application\.variables\)[\s\S]*?const vars = staged\.vars;[\s\S]*?vars\.mateuDirty = false;\s*const committed = staged\.commit\(\);[\s\S]*?committed\.has\('mateuHostContent'\)/)
  assert.match(readFileSync(join(here, 'make-amd.mjs'), 'utf8'), /\n {4}changedOnly,\n/)
})

test('followUps: a RunAction the server answers with runs its action after the answer (the crud refreshes its listing)', () => {
  // ec-demo1's dictionary after «Ask the agent» / Approve, as it travels (its target is Vaadin's id)
  const answer = { commands: [
    { targetComponentId: '_list', type: 'RunAction', data: { actionId: 'search', targetComponentId: 'ux___cs_list' } },
    { targetComponentId: '_list', type: 'PushStateToHistory', data: '' },
  ], messages: [{ variant: 'success', text: 'The agent answered' }], fragments: [] }
  const host = { tree: { triggers: [{ type: 'OnCustomEvent', eventName: 'mateu-crud:saved-in-drawer', actionId: 'search' }] } }
  const followUps = followUpsOf(reduceContexts({ contexts: { [HOST_ID]: host }, stack: [] }, answer).effects)
  assert.deepEqual(followUps, [{ runAction: 'search' }])
  assert.deepEqual(followUpActionsOf(host, followUps[0]), ['search'], 'the RunAction runs, whatever its Vaadin target')
  // a bus event still goes to the triggers subscribed to it, before the RunActions
  assert.deepEqual(followUpsOf({ events: [{ name: 'mateu-crud:saved-in-drawer' }], runActions: [{ actionId: 'search' }, {}] })
    .map((f) => followUpActionsOf(host, f)), [['search'], ['search']])
  assert.deepEqual(followUpActionsOf(host, { name: 'nobody-listens' }), [])
  const chain = webApp('flows/main/pages/main-start-page-chains/runMateuAction.js')
  assert.match(chain, /allEvents\.push\.apply\(allEvents, bridge\.followUpsOf\(reg\.effects\)\)/)
  assert.match(chain, /for \(const triggerActionId of bridge\.followUpActionsOf\(hostNow, busEvent\)\)/)
})

test('isSseAction: the wrapper\'s sse actions, and a crud toolbar button whose tree declares it sse (a LongTask)', () => {
  assert.ok(isSseAction({ sseActionIds: ['escanear'] }, 'escanear'))
  const crud = { sseActionIds: [], tree: { actions: [
    { id: 'action-on-row-askTheAgent', sse: true, bubble: true }, { id: 'action-on-row-approve', sse: false },
  ] } }
  assert.ok(isSseAction(crud, 'action-on-row-askTheAgent'), 'a @ListToolbarButton @Action(sse = true) goes through /sse')
  assert.ok(!isSseAction(crud, 'action-on-row-approve'))
  assert.ok(!isSseAction(null, 'x'))
  for (const chain of ['runMateuAction.js', 'runMateuIslandAction.js', 'runMateuNestedAction.js']) {
    assert.match(webApp('flows/main/pages/main-start-page-chains/' + chain), /const isSse = bridge\.isSseAction\(/)
  }
})

test('collection header: the first toolbar button is primary, the rest secondary', () => {
  assert.deepEqual(listHeaderVarsOf(null), { mateuListPrimary: { label: '', display: 'off' }, mateuListPrimaryId: '', mateuListPrimaryRoute: '', mateuListSecondary: [] })
  const v = listHeaderVarsOf({ toolbar: [{ actionId: 'new', label: 'New' }, { actionId: 'exp', label: 'Export' }] })
  assert.deepEqual(v.mateuListPrimary, { label: 'New' })
  assert.equal(v.mateuListPrimaryId, 'new')
  assert.equal(v.mateuListPrimaryRoute, '')
  // a RouteLink primary ("New character" → people/new) carries its route: listPrimary navigates
  assert.equal(listHeaderVarsOf({ toolbar: [{ actionId: 'newCharacter', label: 'New character', route: 'people/new' }] }).mateuListPrimaryRoute, 'people/new')
  assert.deepEqual(v.mateuListSecondary, [{ id: 'exp', value: 'exp', label: 'Export' }])
})

test('collection header: an action that needs rows is disabled until a row is checked; an inert one stays disabled', async () => {
  const { listSecondaryForSelection } = await import('./pageProjection.mjs')
  const summary = { selectionRequired: ['delete'], toolbar: [
    { actionId: 'new', label: 'New' }, { actionId: 'delete', label: 'Delete' },
    { actionId: 'bulk', label: 'Bulk', rowsSelectedRequired: true }, { actionId: 'off', label: 'Off', disabled: true }, { actionId: 'exp', label: 'Export' }] }
  const none = listHeaderVarsOf(summary).mateuListSecondary
  assert.deepEqual(none.map((a) => [a.id, a.display || 'on']), [['delete', 'disabled'], ['bulk', 'disabled'], ['off', 'disabled'], ['exp', 'on']])
  const one = listSecondaryForSelection(none, { all: false, keys: [3], except: [] })
  assert.deepEqual(one.map((a) => [a.id, a.display || 'on']), [['delete', 'on'], ['bulk', 'on'], ['off', 'disabled'], ['exp', 'on']])
  const all = listSecondaryForSelection(one, { all: true, keys: [], except: [] })
  assert.equal(all[0].display, undefined)
  assert.equal(listSecondaryForSelection(all, { all: false, keys: [], except: [] })[0].display, 'disabled')
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

test('item overview: the tab shown on entry is the one SELECTED in the bar (the first, or the one marked open)', () => {
  const page = (active) => ({ state: {}, data: {}, tree: node({ type: 'HorizontalLayout' }, [
    node({ type: 'Card', title: 'Key' }, [node({ type: 'Text', text: 'k' })]),
    node({ type: 'TabLayout' }, ['A', 'B', 'C'].map((label, i) => node({ type: 'Tab', label, active: i === active }, [node({ type: 'Text', text: 'in ' + label })]))),
  ]) })
  const first = archetypeVarsOf(page(-1), null)
  assert.equal(first.item.selectedTab, 'itab-0', 'none marked: the first, and the bar says so')
  assert.equal(first.vars.mateuItemTabTexts[0].text, 'in A')
  const open = archetypeVarsOf(page(2), null)
  assert.equal(open.item.selectedTab, 'itab-2', '@Tab(open): that one, shown and selected')
  assert.equal(open.vars.mateuItemTabTexts[0].text, 'in C')
  // the bar binds that selection, and on a phone its tabs that do not fit go to an overflow menu
  // (they were clipped out of reach); so do the tab strips of the content
  const html = webApp('flows/main/pages/main-start-page.html')
  const bar = html.slice(html.indexOf('<oj-tab-bar id="mateuItemTabs"'), html.indexOf('<ul>', html.indexOf('<oj-tab-bar id="mateuItemTabs"')))
  assert.match(bar, /selection="\[\[ \$application\.variables\.mateuItemOv\.selectedTab \]\]"/)
  assert.match(bar, /overflow="popup"/)
  const strips = html.match(/<oj-tab-bar :id="\[\[ \$current\.data\.barId \]\]"[^>]*>/g) || []
  assert.ok(strips.length > 0 && strips.every((t) => /overflow="popup"/.test(t)))
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
  // the NARROW zone first is not this anatomy (its main slot would take the key-data column): the
  // host content paints it in its columns
  assert.ok(!generalOverviewPageOf({ title: 'E' }, [blocks[1], blocks[0]]).on)
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

test('page header: a page that CANCELS beside a primary action is a create/edit page (oj-sp-header-create-edit); a back button is not', () => {
  const headerFor = (toolbar) => pageHeaderOf({ host: { tree: null }, hostEntity: null, summary: { title: 'Booking', trail: [] }, hostToolbar: toolbar, showHeader: true, pageWidth: 'fixed', gopOn: false }).header
  // a crud editor: cancel-edit + save
  const edit = headerFor([{ actionId: 'cancel-edit', label: 'Cancel' }, { actionId: 'save', label: 'Save' }])
  assert.equal(edit.createEdit, true)
  assert.equal(edit.backId, 'cancel-edit', "Spectra's Cancel (spCancel) runs the cancel")
  assert.equal(edit.primaryId, 'save', 'its primary action saves')
  assert.equal(headerFor([{ actionId: 'cancel-new', label: 'Cancel' }, { actionId: 'create', label: 'Create' }]).createEdit, true)
  assert.equal(headerFor([{ actionId: 'cancel', label: 'Cancel' }, { actionId: 'submit', label: 'Submit' }]).createEdit, true)
  // a record's view page goes BACK, it does not cancel; a cancel with nothing to save is no edit page
  assert.equal(headerFor([{ actionId: 'back', label: 'Back' }, { actionId: 'edit', label: 'Edit' }]).createEdit, false)
  assert.equal(headerFor([{ actionId: 'backToList', label: 'Back to list' }, { actionId: 'edit', label: 'Edit' }]).createEdit, false)
  // a crud record's view page: its «Back to list» travels as cancel-view
  assert.equal(headerFor([{ actionId: 'cancel-view', label: 'Back to list' }, { actionId: 'edit', label: 'Edit' }]).createEdit, false)
  assert.equal(headerFor([{ actionId: 'cancel-create', label: 'Cancel' }, { actionId: 'create', label: 'Create' }]).createEdit, true)
  assert.equal(headerFor([{ actionId: 'cancel-edit', label: 'Cancel' }]).createEdit, false)
  assert.equal(headerFor([{ actionId: 'save', label: 'Save' }]).createEdit, false)
})

test('app-flow: a page variable the projection may set to null is never typed object (VB refuses the assign and the whole navigation chain fails)', () => {
  const flow = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../webApps/vbredwoodapp/app-flow.json'), 'utf-8'))
  const vars = archetypeVarsOf({ state: {}, data: {}, tree: { type: 'ClientSide', metadata: { type: 'Form', title: 'x' }, children: [] } }).vars
  const nullTyped = Object.entries(vars).filter(([k, v]) => v === null && flow.variables[k] && flow.variables[k].type === 'object').map(([k]) => k)
  assert.deepEqual(nullTyped, [])
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
  // the item overview template keeps the page's width (Toolkit 26C) and the content container drops its card
  const iop = pageLayoutOf({ host: {}, iopOn: true, bleedingHeader: true, band: false }).vars
  assert.deepEqual([iop.mateuShellPageLayout, iop.mateuPageMaxWidth, iop.mateuPageHostClass], ['fixedWidth', fixed.mateuPageMaxWidth, 'mateu-iop-host'])
  assert.equal(fixed.mateuPageHostClass, '')
})

test('an empty listing says so in the chrome language, not a hard-wired English «No data.»', async () => {
  const { listingOf } = await import('./core/listing.mjs')
  const { chromeText } = await import('./i18n.mjs')
  const l = listingOf({ state: {}, data: {}, tree: { type: 'ClientSide', id: 'c', metadata: { type: 'Crud', columns: [] }, children: [] } })
  assert.equal(l.emptyStateMessage, chromeText('noData'))
  const own = listingOf({ state: {}, data: {}, tree: { type: 'ClientSide', id: 'c', metadata: { type: 'Crud', columns: [], emptyStateMessage: 'Nada' }, children: [] } })
  assert.equal(own.emptyStateMessage, 'Nada')
})

test('onMateuNavigate: every navigation names the tab — a federated screen with no SetWindowTitle no longer keeps the previous title', () => {
  const chain = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../webApps/vbredwoodapp/pages/shell-page-chains/onMateuNavigate.js'), 'utf-8')
  assert.match(chain, /bridge\.setDocTitle\(\(reg\.effects && reg\.effects\.docTitle\) \|\| summary\.title \|\| \(reg\.shell && reg\.shell\.title\)\)/)
  assert.doesNotMatch(chain, /if \(reg\.effects && reg\.effects\.docTitle\) \{/)
})

test('onMateuNavigate: the item overview template (mateuItemOv) is what turns iopOn on — not the reverted mateuIop', () => {
  const chain = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../webApps/vbredwoodapp/pages/shell-page-chains/onMateuNavigate.js'), 'utf-8')
  assert.match(chain, /const iopOn = !!itemProjection;/)
  const page = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../webApps/vbredwoodapp/flows/main/pages/main-start-page.html'), 'utf-8')
  assert.match(page, /\$application\.variables\.mateuPageHostClass/)
  assert.match(page, /<oj-tab-bar id="mateuItemTabs" edge="top" layout="condense"/)
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

// The conditions exactly as the server emits them (ConstraintValidationMapper): each holds when the
// value is VALID.
const req = (k) => `state['${k}'] != null && state['${k}'] !== '' && (state['${k}'].length === undefined || state['${k}'].length > 0)`
const absentOr = (k, cmp) => `state['${k}'] == null || state['${k}'] === '' || state['${k}'] ${cmp}`
const wireValidations = [
  { fieldId: 'name', condition: req('name'), message: 'Cannot be empty' },
  { fieldId: 'beds', condition: absentOr('beds', '>= 1'), message: 'Must be at least 1' },
  { fieldId: 'beds', condition: absentOr('beds', '<= 9'), message: 'Must be at most 9' },
  { fieldId: 'code', condition: `state['code'] == null || state['code'] === '' || /^[A-Z]{3}$/.test(state['code'])`, message: 'Invalid format' },
  { fieldId: 'notes', condition: `state['notes'] == null || state['notes'] === '' || state['notes'].length === undefined || state['notes'].length <= 5`, message: 'Size must be between 0 and 5' },
]

test('the wire validations are read without eval — a @Pattern regular expression included', () => {
  assert.equal(evaluateExpression(`/^[A-Z]{3}$/.test(state['c'])`, { state: { c: 'ABC' } }), true)
  assert.equal(evaluateExpression(`/^[A-Z]{3}$/.test(state['c'])`, { state: { c: 'ab' } }), false)
  assert.equal(evaluateExpression(String.raw`/a\/b[/]/.test('a/b/')`, {}), true)
  // a division is still a division
  assert.equal(evaluateExpression(`state['x'] / 2`, { state: { x: 8 } }), 4)
  assert.deepEqual(validationErrorsOf(wireValidations, { name: 'Ada', beds: 12, code: 'abc' }),
    { beds: 'Must be at most 9', code: 'Invalid format' })
  // absent optional values pass their bounds and patterns; fieldsToValidate restricts
  assert.deepEqual(validationErrorsOf(wireValidations, { name: 'Ada', beds: '', code: null }), {})
  // a @Size bound holds for a valid length
  assert.deepEqual(validationErrorsOf(wireValidations, { name: 'Ada', notes: 'abcde' }), {})
  assert.deepEqual(validationErrorsOf(wireValidations, { name: 'Ada', notes: 'abcdef' }), { notes: 'Size must be between 0 and 5' })
  assert.deepEqual(validationErrorsOf(wireValidations, { name: '', beds: 0 }, ['beds']), { beds: 'Must be at least 1' })
  // a condition the evaluator cannot read is the server's to check
  assert.deepEqual(validationErrorsOf([{ fieldId: 'x', condition: 'state.x ~ 1', message: 'm' }], {}), {})
})

test('the create/edit drawer validates its own form before Save leaves — required, bounds, pattern', () => {
  // the crud's drawer: its form is a ServerSide of its own (crud-edit-drawer-form) whose create
  // declares validationRequired and bubbles to the crud
  const surface = {
    type: 'ServerSide', id: 'crud-edit-drawer-form', serverSideType: 'com.acme.Room', validations: wireValidations,
    actions: [{ id: 'create', validationRequired: true, bubble: true }, { id: 'cancel-new', bubble: true }],
    children: [node({ type: 'FormLayout' }, [
      node({ type: 'FormField', fieldId: 'name', label: 'Name', dataType: 'string', required: true }, [], 'name'),
      node({ type: 'FormField', fieldId: 'beds', label: 'Beds', dataType: 'integer' }, [], 'beds'),
      node({ type: 'FormField', fieldId: 'code', label: 'Code', dataType: 'string' }, [], 'code'),
    ])],
  }
  const drawer = { id: 'overlay-1', kind: 'drawer', tree: node({ type: 'Drawer', content: surface }), surface,
    state: { name: '', beds: 1, code: '' }, title: 'New' }
  const host = { id: HOST_ID, state: {}, tree: { id: 'h', type: 'ServerSide', actions: [{ id: 'create' }] }, outbound: {} }
  const reg = { contexts: { [HOST_ID]: host, 'overlay-1': drawer }, stack: ['overlay-1'] }

  // the empty required name never leaves: marked in the DRAWER
  assert.deepEqual(outboundActionOf(reg, 'create', { drawerDraft: {} }),
    { stop: 'fieldErrors', missing: ['name'], inOverlay: true })
  // a bound and a pattern refused with the wire's messages, in form order
  assert.deepEqual(outboundActionOf(reg, 'create', { drawerDraft: { name: 'Attic', beds: 12, code: 'ab' } }),
    { stop: 'fieldErrors', missing: ['beds', 'code'], messages: { beds: 'Must be at most 9', code: 'Invalid format' }, inOverlay: true })
  // valid: it leaves, to the crud (the form's create bubbles), with the drawer's values
  const ok = outboundActionOf(reg, 'create', { drawerDraft: { name: 'Attic', beds: 2, code: 'ATT' } })
  assert.ok(!ok.stop)
  assert.deepEqual(ok.componentState, { name: 'Attic', beds: 2, code: 'ATT' })
  // an action the form does not declare validated (cancel) is never stopped
  assert.ok(!outboundActionOf(reg, 'cancel-new', { drawerDraft: {} }).stop)
})

test('the routed form refuses a failed bound or pattern too, not only an empty required field', () => {
  const host = { id: HOST_ID, state: { name: 'Ada', beds: 1 },
    tree: { id: 'h', type: 'ServerSide', validations: wireValidations, actions: [{ id: 'save', validationRequired: true }] }, outbound: {} }
  const reg = { contexts: { [HOST_ID]: host }, stack: [] }
  const sections = [{ fields: [{ fieldId: 'name', required: true, value: 'Ada' }, { fieldId: 'beds', value: 1 }, { fieldId: 'code', value: '' }] }]
  assert.deepEqual(outboundActionOf(reg, 'save', { formSections: sections, draft: { beds: 0 } }),
    { stop: 'fieldErrors', missing: ['beds'], messages: { beds: 'Must be at least 1' } })
  assert.ok(!outboundActionOf(reg, 'save', { formSections: sections, draft: { beds: 3 } }).stop)
})

test('the fields a refused save names are marked where they are (the drawer\'s form, or the page)', () => {
  const surface = { type: 'ServerSide', id: 'crud-edit-drawer-form' }
  const reg = { contexts: { [HOST_ID]: { id: HOST_ID }, 'overlay-1': { id: 'overlay-1', surface } }, stack: ['overlay-1'] }
  const refused = { fragments: [{ targetComponentId: 'crud-edit-drawer-form', data: { errors: { email: ['must be a well-formed email address'] }, _valid: false }, action: 'Replace' }] }
  assert.deepEqual(refusedFieldsOf(refused, reg),
    { missing: ['email'], messages: { email: 'must be a well-formed email address' }, inOverlay: true })
  const onPage = { fragments: [{ targetComponentId: 'h', data: { errors: { name: ['Cannot be empty'], _component: ['x'] } } }] }
  assert.deepEqual(refusedFieldsOf(onPage, reg), { missing: ['name'], messages: { name: 'Cannot be empty' }, inOverlay: false })
  assert.equal(refusedFieldsOf({ fragments: [{ data: { errors: {} } }] }, reg), null)
  assert.equal(refusedFieldsOf({ fragments: [] }, reg), null)
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

test('Redwood is light only: no light/dark switch, even with @App(themeToggle = true)', () => {
  // the wire still says themeToggle (the Vaadin renderer of the same app shows its switch)…
  const shell = webApp('pages/shell-page.html')
  assert.ok(!/themeToggle|mateuThemeToggle|brightness/.test(shell), 'the header has no theme switch')
  assert.ok(!/themeToggle/.test(webApp('pages/shell-page.json')), 'no listener for it')
  assert.equal(JSON.parse(webApp('app-flow.json')).variables.mateuThemeToggle, undefined)
  // …and the shell boot does not read it: it paints light
  const boot = webApp('pages/shell-page-chains/loadMateuShell.js')
  assert.ok(!/shell\.themeToggle/.test(boot))
  assert.match(boot, /bridge\.applyLightTheme\(\)/)
  assert.ok(!/mateu-theme-dark/.test(webApp('resources/css/app.css')), 'no dark rules left')
})

test('Redwood is light only: a stored dark choice and an OS that prefers dark still paint light', () => {
  const saved = { localStorage: globalThis.localStorage, matchMedia: globalThis.matchMedia }
  globalThis.localStorage = { getItem: (k) => (k === 'mateu-theme' ? 'dark' : null), setItem: () => {}, removeItem: () => {} }
  globalThis.matchMedia = (q) => ({ matches: /prefers-color-scheme: dark/.test(q) })
  try {
    // a page that came up dark (an older version's choice): every dark class goes
    const classes = new Set(['oj-color-invert', 'oj-c-colorscheme-dark', 'mateu-theme-dark', 'other'])
    const attrs = { theme: 'dark' }
    const doc = { documentElement: { classList: { toggle: (c, on) => (on ? classes.add(c) : classes.delete(c)) }, setAttribute: (k, v) => { attrs[k] = v } } }
    assert.equal(applyLightTheme(doc), 'light')
    assert.deepEqual([...classes], ['other'])
    assert.equal(attrs.theme, 'light')
    // the stored choice is left alone: the Vaadin renderer on the same origin still reads it
    assert.equal(globalThis.localStorage.getItem('mateu-theme'), 'dark')
  } finally {
    globalThis.localStorage = saved.localStorage
    globalThis.matchMedia = saved.matchMedia
  }
})

test('a display-block click: a RouteLink button navigates, any other runs its action', () => {
  assert.deepEqual(blockClickOf({ actionId: 'browseProducts', parameters: {}, route: 'products' }), { navigate: 'products' })
  assert.deepEqual(blockClickOf({ actionId: 'greet', parameters: { a: 1 } }), { actionId: 'greet', parameters: { a: 1 } })
  // VB binds an absent route as '' (or the literal 'undefined' is never sent): blank → action
  assert.deepEqual(blockClickOf({ actionId: 'greet', route: '  ' }), { actionId: 'greet', parameters: {} })
  // a RouteLink route is a template over the screen's state (a record page's Edit)
  assert.deepEqual(blockClickOf({ route: 'missions/${state.id}/edit', state: { id: 6 } }), { navigate: 'missions/6/edit' })
  assert.deepEqual(routeStateOf({ contexts: { [HOST_ID]: { state: { id: 6, name: 'a' } } } }, { name: 'b' }), { id: 6, name: 'b' })
  // both dispatchers consult it before running anything
  for (const chain of ['dispatchHostBlockAction', 'dispatchIslandAction']) {
    const src = webApp(`flows/main/pages/main-start-page-chains/${chain}.js`)
    assert.ok(src.includes('bridge.blockClickOf') && src.includes('application:mateuNavigate'), chain)
    assert.ok(src.includes('bridge.routeStateOf('), chain + ' reads the route against the state')
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
  // every search writes the URL — as a NEW history entry: Back returns to the previous page/filters
  // (it used to replaceState, and Back left the listing — Fable review A8)
  assert.ok(search.includes('bridge.listingUrlOf(') && search.includes('history.pushState') && !search.includes('history.replaceState'),
    'every search pushes the URL')
  const filters = webApp('flows/main/pages/main-start-page-chains/smartFiltersChanged.js')
  assert.ok(filters.includes('history.pushState') && !filters.includes('history.replaceState'), 'a filter change pushes the URL')
  const nav = readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'pages', 'shell-page-chains', 'onMateuNavigate.js'), 'utf8')
  assert.ok(nav.includes('bridge.listingUrlPagingOf('), 'navigation restores page and sort')
  // a back/forward compares with the URL ON SCREEN (with its query): back from ?page=1 to the bare
  // listing is another state of it, not the menu entry's echo — and staying puts that URL back
  assert.ok(nav.includes('((requested || fromUrl) && window.__mateuLoadedFull != null)'), 'back/forward vs the loaded URL')
  assert.ok(nav.includes('bridge.restoreUrlAfterStaying(window.__mateuLoadedFull ||'), 'stay keeps the query')
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

test('@Tab: the buttons of a tab stay in it and the toolbar of the header is not repeated under the content', () => {
  // CajaView: a frameless section, then tabs — Cobrar (its own Button), Crédito (a HorizontalLayout
  // with buttons) — and a toolbar. With Cobrar active, a row under it gathered «Volver a la reserva»
  // (painted by the header already) and the Crédito tab's three buttons.
  const tree = node({ type: 'Page', title: 'Caja', toolbar: [{ actionId: 'volver', label: 'Volver a la reserva', buttonStyle: 'primary' }] }, [
    node({ type: 'Text', text: 'Saldo: 120 €' }),
    node({ type: 'TabLayout' }, [
      node({ type: 'Tab', label: 'Cobrar', active: true }, [node({ type: 'Button', actionId: 'cobrar', label: 'Cobrar' })]),
      node({ type: 'Tab', label: 'Crédito' }, [node({ type: 'HorizontalLayout' }, [
        node({ type: 'Button', actionId: 'fijarLimite', label: 'Fijar límite' }),
        node({ type: 'Button', actionId: 'cancelarCredito', label: 'Cancelar crédito' })])]),
    ]),
  ])
  const host = { tree, state: {}, data: {} }
  // plus a footer button of the form (what the generic form would have drawn)
  const actions = [...actionsOf(tree), { actionId: 'save', label: 'Save' }]
  const rowOf = (blocks) => blocks.filter((b) => b.fromFormActions).flatMap((b) => b.items).flatMap((a) => a.buttons.map((x) => x.actionId))
  const blocks = hostContentOf(host, null, { title: 'Caja' })
  assert.deepEqual(Object.keys(tabOnlyActionIdsOf(tree)).sort((a, b) => a.localeCompare(b)), ['cancelarCredito', 'cobrar', 'fijarLimite'])
  // the bug: every button of the tree not drawn by the active tab went to the row
  assert.deepEqual(rowOf(withFormActions(blocks, actions)), ['volver', 'fijarLimite', 'cancelarCredito', 'save'])
  const withRow = withFormActions(blocks, actions, { tree })
  assert.deepEqual(rowOf(withRow), ['volver', 'save'])
  // the header paints the toolbar: the row drops it…
  const toolbar = pageToolbarOf(host)
  const beside = hostContentBesideHeader(withRow, { showBand: true }, toolbar)
  assert.deepEqual(rowOf(beside), ['save'])
  // …a row left empty goes, and nothing to drop gives the same array back (the chains compare)
  const onlyToolbar = withFormActions(blocks, actionsOf(tree), { tree })
  assert.equal(hostContentBesideHeader(onlyToolbar, { showBand: true }, toolbar).filter((b) => b.fromFormActions).length, 0)
  assert.equal(hostContentBesideHeader(beside, { showBand: true }, toolbar), beside)
  assert.equal(hostContentBesideHeader(withRow, { showBand: false, showInline: false }, toolbar), withRow)
  // every other block goes through as it came: a grid's data provider is a live object, and a
  // JSON copy of it made oj-table throw «Invalid data type» (a process's Steps stayed empty)
  const adp = new (class FakeDataProvider { fetchFirst() {} })()
  const grid = { items: [{ isGrid: true, adp }] }
  const besideGrid = hostContentBesideHeader([grid, ...withRow], { showBand: true }, toolbar)
  assert.equal(besideGrid[0], grid)
  assert.equal(besideGrid[0].items[0].adp, adp)
  // a tab switch re-projects without the row: it is carried over, once
  const credito = hostContentOf(host, null, { title: 'Caja', activeTabs: { '': 'tab-1' } })
  assert.ok(JSON.stringify(credito).includes('fijarLimite'))
  assert.deepEqual(rowOf(withFormActionsRowOf(credito, beside)), ['save'])
  assert.deepEqual(rowOf(withFormActionsRowOf(withFormActionsRowOf(credito, beside), beside)), ['save'])
  // a button also drawn OUTSIDE the tabs is not the tab's alone
  const shared = node({ type: 'Page' }, [node({ type: 'TabLayout' }, [node({ type: 'Tab', label: 'A' }, [node({ type: 'Button', actionId: 'x', label: 'X' })])]), node({ type: 'Button', actionId: 'x', label: 'X' })])
  assert.deepEqual(tabOnlyActionIdsOf(shared), {})
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
  const token = /<oj-bind-if\s+test="\[\[([^\]]*)\]\]"\s*>|<\/oj-bind-if>|\[\[([^\]]*)\]\]/g
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

// ── overlays: a Dialog over a Drawer (walkthrough: «closing the dialog leaves the drawer hidden») ──
const fx = (name) => JSON.parse(readFileSync(join(here, 'fixtures', 'real', name + '.json'), 'utf8'))
const emptyReg = () => ({ contexts: {}, stack: [], shell: null })

test('overlays: a Dialog opened over a Drawer: the panel keeps the drawer, the modal gets the dialog', () => {
  let reg = reduceContexts(emptyReg(), fx('load-form'))
  reg = reduceContexts(reg, fx('open-drawer'))
  const drawerId = reg.stack[0]
  reg = reduceContexts(reg, fx('dialog-embedded-cancel'))
  assert.equal(reg.stack.length, 2)
  // the top overlay is the dialog (what the action plan posts against)…
  assert.ok(overlayOf(reg).isDialog)
  assert.equal(dialogOverlayOf(reg).id, reg.stack[1])
  // …and the drawer panel still shows the drawer under it
  assert.equal(drawerOverlayOf(reg).id, drawerId)
  const open = overlayVarsOf(reg)
  assert.equal(open.drawer.id, drawerId)
  assert.equal(open.drawer.title, 'New')
  assert.ok(open.drawerOpen, 'the drawer stays open while the modal is up')
  assert.ok(open.modal)
  assert.ok(open.dialog.isDialog)
  // the dialog's CloseModal pops the dialog alone: the drawer is back as the only overlay
  reg = reduceContexts(reg, { fragments: [], commands: [{ type: 'CloseModal' }], messages: [] })
  const after = overlayVarsOf(reg)
  assert.deepEqual(reg.stack, [drawerId])
  assert.equal(after.drawer.id, drawerId)
  assert.ok(after.drawerOpen)
  assert.equal(after.modal, false)
  assert.equal(after.dialog, EMPTY_OVERLAY)
  assert.equal(dialogOverlayOf(reg), null)
  // without any overlay both halves are empty
  const none = overlayVarsOf(dismissOverlayById(reg, drawerId))
  assert.deepEqual([none.drawer, none.dialog, none.drawerOpen, none.modal], [EMPTY_OVERLAY, EMPTY_OVERLAY, false, false])
})

test('overlays: the real wire — a Drawer and the Dialog opened from its form both carry the filler id `fieldId`: two overlays, not a refresh', () => {
  // the sample1 OverlayLab (/overlay-lab): «Edit contact» → Drawer(ContactEditor); «Open nested dialog» → Dialog
  let reg = reduceContexts(emptyReg(), fx('sut-overlay-lab'))
  reg = reduceContexts(reg, fx('sut-overlay-open-drawer'))
  reg = reduceContexts(reg, fx('sut-overlay-nested-dialog'))
  assert.equal(reg.stack.length, 2, 'the dialog stacks on the drawer (it used to take its place)')
  const vars = overlayVarsOf(reg)
  assert.equal(vars.drawer.title, 'Edit contact')
  assert.equal(vars.dialog.title, 'Nested dialog')
  assert.ok(vars.drawerOpen && vars.modal)
  reg = reduceContexts(reg, { fragments: [], commands: [{ type: 'CloseModal' }], messages: [] })
  const after = overlayVarsOf(reg)
  assert.equal(after.drawer.title, 'Edit contact')
  assert.ok(after.drawerOpen && !after.modal)
  assert.ok(after.drawer.actions.some((a) => a.actionId === 'saveContact'), 'the drawer keeps its form actions')
})

test('overlays: dismissing the drawer by id leaves a dialog on top untouched; a picker outside the drawer hides it', () => {
  let reg = reduceContexts(emptyReg(), fx('load-form'))
  reg = reduceContexts(reg, fx('open-drawer'))
  reg = reduceContexts(reg, fx('dialog-embedded-cancel'))
  const [drawerId, dialogId] = reg.stack
  const popped = dismissOverlayById(reg, drawerId)
  assert.deepEqual(popped.stack, [dialogId])
  assert.ok(!popped.contexts[drawerId] && popped.contexts[dialogId])
  assert.equal(dismissOverlayById(reg, 'nope'), reg, 'an unknown id changes nothing')
  // a @Searchable selector (its own dialog) keeps hiding the drawer unless it is drawn inside it
  const onlyDrawer = dismissOverlayById(reg, dialogId)
  assert.equal(overlayVarsOf(onlyDrawer, { inDrawer: false }).drawerOpen, false)
  assert.equal(overlayVarsOf(onlyDrawer, { inDrawer: true }).drawerOpen, true)
  assert.equal(overlayVarsOf(onlyDrawer, { inDrawer: true }).modal, false)
})

console.log(`\n${passed} chain-logic tests OK`)

test('a Dialog that shows more than lines is painted from its content (EntityHeader, Badge, Meter…), not just its texts', () => {
  const open = (content) => reduceContexts(emptyReg(), { fragments: [{ action: 'Add', targetComponentId: '', component: {
    type: 'ClientSide', id: 'dlg', metadata: { type: 'Dialog', title: 'Record' }, children: [node({ type: 'VerticalLayout' }, content)] } }] })
  const rich = dialogOverlayOf(open([
    node({ type: 'EntityHeader', title: 'Ana', subtitle: '1º', badges: [{ label: 'Active', color: 'success' }], facts: [{ label: 'Grade', value: '8.7' }] }),
    node({ type: 'Meter', label: 'Attendance', value: 98, max: 100 }),
  ]))
  assert.equal(rich.hasRichContent, true)
  const atoms = rich.content.flatMap((b) => b.items)
  assert.ok(atoms.some((a) => a.isEntityHeader) && atoms.some((a) => a.isMeter))
  assert.deepEqual(rich.texts, [], 'the lines are in the content: not painted twice')
  // a plain message dialog is still its lines
  const plain = dialogOverlayOf(open([node({ type: 'Text', text: 'Delete it?' })]))
  assert.equal(plain.hasRichContent, false)
  assert.deepEqual(plain.texts, ['Delete it?'])
  // the modal paints the content with the shared atoms template
  const html = webApp('flows/main/pages/main-start-page.html')
  const modal = html.slice(html.indexOf('<oj-dialog id="mateuModal"'), html.indexOf('</oj-dialog>', html.indexOf('<oj-dialog id="mateuModal"')))
  assert.match(modal, /mateuDialog\.hasRichContent[\s\S]*mateuDialog\.content[\s\S]*<!-- @atoms host/)
})

test('page toolbar: a RouteLink button carries its resolved route (it navigates) and its label is interpolated', () => {
  const host = {
    state: { id: 26, name: 'Luke' },
    tree: { type: 'Form', metadata: { type: 'Form', toolbar: [
      { type: 'Button', actionId: 'backToList', label: 'Back to ${state.name}', route: 'people' },
      { type: 'Button', actionId: 'edit', label: 'Edit', buttonStyle: 'primary', route: 'people/${state.id}/edit' },
      { type: 'Button', actionId: 'gone', label: 'Gone', route: 'x/${state.missing}' },
      { type: 'Button', actionId: 'save', label: 'Save' },
    ] }, children: [] },
  }
  const [back, edit, gone, save] = pageToolbarOf(host)
  assert.deepEqual([back.label, back.route], ['Back to Luke', 'people'])
  assert.deepEqual([edit.route, edit.disabled], ['people/26/edit', false])
  assert.deepEqual([gone.route, gone.disabled], [undefined, true])
  assert.equal(save.route, undefined)
})
