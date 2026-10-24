// Contract tests of the "Redwood pattern gaps" wire pieces (the server reference: the
// WizardTransactionalSyncTest / CrudDisplaySyncTest / PageSlotsSyncTest / PageAffordancesSyncTest
// suites of backend core). Trees are hand-built with the SAME shape the backend emits (record →
// DTO). Each piece maps onto the JET/oj-sp affordance that already exists for it:
//   A1 Announce        → the live regions of a11y.mjs (installAnnouncer), through applyDomEffects
//   A2 page switcher   → oj-sp-header-general-overview selectObject / selectContext (data switcher)
//   A3 hero tone       → oj-sp-header-welcome-banner background-color dark-<tone>
//   A4 foldout summary → oj-sp-foldout-panel's `summary` slot
//   A5 crud preSearch  → stands in for the results until the first search answers
//   B  same-id drawer refreshes in place; disabled buttons; slot-template grids by area
// Run: node test-patterns.mjs (npm test runs it with the other suites).
import './test-locale.mjs' // first: off English the suite reruns in English (see the module)
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  summarizeHost, generalOverviewOf, emptyStateOf, sectionButtonsOf, withoutSectionButtons,
  reduceContexts, HOST_ID, overlayOf, foldoutOf, foldoutContentOf, sameFoldoutStructure, welcomeOf, welcomeLookOf, welcomeToneLookOf, listingOf,
  pageSwitcherOf, switcherPickOf, actionsOf, islandContentOf, kidsInAreaOrder, setPanelExpanded,
  pageKpisOf, pageSubtitleOf, bannersOf, pageHeaderNodeOf, shellNavOf, headerActionRouteOf,
  pageHeaderExtrasOf, badgeStatusOf, headerTimestampOf,
  entityHeaderOf, mergeNestedContent, factProjectionOf, factActionsJsonOf, hostContentOf,
  spectraDrawerSize, spectraPeersOf, withListingPeers,
} from './reduceContexts.mjs'
import { drawerHasUnsavedChanges, noteDrawerUnsaved, installDrawerGuard, isDrawerUnsaved } from './drawers.mjs'
import { pageHeaderOf, listHeaderVarsOf, archetypeVarsOf, fabsOf } from './pageProjection.mjs'
import { applyDomEffects } from './files.mjs'

const here = dirname(fileURLToPath(import.meta.url))
let passed = 0
const test = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name) }
const node = (metadata, children = [], id = '', slot) => ({ type: 'ClientSide', id: id || metadata.id || '', metadata, children, ...(slot ? { slot } : {}) })
const text = (t, slot) => node({ type: 'Text', text: t }, [], '', slot)
const empty = () => ({ contexts: {}, stack: [], shell: null })
const host = (tree, state = {}, data = {}) => ({ id: HOST_ID, kind: 'host', tree, state, data })
const webApp = (rel) => readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', rel), 'utf8')
const page = (metadata, children = []) => ({
  type: 'ServerSide', id: 'p1', serverSideType: 'x.Page', route: '/p', actions: [],
  children: [node({ type: 'Page', title: 'Room 101', toolbar: [], ...metadata }, children)],
})

// ── A1 Announce ───────────────────────────────────────────────────────────────────────────

test('A1: the Announce command becomes an announcement (polite, or assertive) and draws nothing', () => {
  const { effects, contexts } = reduceContexts(empty(), {
    commands: [
      { type: 'Announce', data: { text: 'Draft saved', assertive: false } },
      { type: 'Announce', data: { text: 'Could not save: name is taken', assertive: true } },
      { type: 'Announce', data: { text: '   ' } },
    ],
    messages: [], fragments: [],
  })
  assert.deepEqual(effects.announcements, [
    { text: 'Draft saved', assertive: false },
    { text: 'Could not save: name is taken', assertive: true },
  ])
  assert.deepEqual(effects.toasts, [])
  assert.deepEqual(Object.keys(contexts), [])
})

test('A1: applyDomEffects says each announcement through the live region of its politeness', () => {
  const said = []
  applyDomEffects({ announcements: [{ text: 'Draft saved', assertive: false }, { text: 'Failed', assertive: true }] },
    null, { mateuAnnounce: (t, o) => said.push([t, o.politeness]) })
  assert.deepEqual(said, [['Draft saved', 'polite'], ['Failed', 'assertive']])
})

// ── A2 record/context switcher ────────────────────────────────────────────────────────────

const SWITCHER = {
  options: [{ value: 'r1', label: 'Room 101', description: 'Sea view' }, { value: 'r2', label: 'Room 102' }],
  value: 'r1', type: 'object', label: 'Room', searchable: false, disabled: false, actionId: '_switchRecord',
}

test('A2: PageDto.switcher → the header data switcher (selectObject), the picked value in _record', () => {
  const sw = pageSwitcherOf(host(page({ switcher: SWITCHER })))
  assert.equal(sw.on, true)
  assert.equal(sw.label, 'Room')
  assert.deepEqual(sw.objectOptions.map((o) => [o.value, o.label]), [['r1', 'Room 101'], ['r2', 'Room 102']])
  assert.deepEqual(sw.contextOptions, [])
  assert.deepEqual(switcherPickOf(sw, 'r2'), { actionId: '_switchRecord', parameters: { _record: 'r2' } })
  // the echo of the value the header was given runs nothing; nor does an empty pick
  assert.equal(switcherPickOf(sw, 'r1'), null)
  assert.equal(switcherPickOf(sw, null), null)
})

test('A2: type context goes to selectContext; searchable is the header switcherSearch flag', () => {
  const sw = pageSwitcherOf(host(page({ switcher: { ...SWITCHER, type: 'context', searchable: true } })))
  assert.deepEqual(sw.objectOptions, [])
  assert.equal(sw.contextOptions.length, 2)
  assert.equal(sw.searchable, true)
})

test('A2: a disabled switcher is read-only — no data switcher, the current entry as a fact', () => {
  const ctx = host(page({ switcher: { ...SWITCHER, disabled: true } }))
  const sw = pageSwitcherOf(ctx)
  assert.deepEqual([sw.objectOptions, sw.contextOptions], [[], []])
  assert.equal(switcherPickOf(sw, 'r2'), null)
  const { header } = pageHeaderOf({ host: ctx, hostEntity: null, summary: { title: 'Room 101', trail: [] }, hostToolbar: [], showHeader: true, pageWidth: 'fixed' })
  assert.deepEqual(header.facts[0], { label: 'Room', value: 'Room 101' })
})

test('A2: without a switcher the header carries an empty one (bindings read it unconditionally)', () => {
  const { header } = pageHeaderOf({ host: host(page({})), hostEntity: null, summary: { title: 'X', trail: [] }, hostToolbar: [], showHeader: true, pageWidth: 'fixed' })
  assert.equal(header.switcher.on, false)
  assert.deepEqual([header.switcher.objectOptions, header.switcher.contextOptions], [[], []])
})

test('A2: the three VB headers bind the switcher, and the pick runs through onPageSwitch', () => {
  const html = webApp('flows/main/pages/main-start-page.html')
  assert.equal((html.match(/select-object="\[\[ \$variables\.pageSwitcherObject \]\]"/g) || []).length, 3)
  assert.equal((html.match(/select-context="\[\[ \$variables\.pageSwitcherContext \]\]"/g) || []).length, 3)
  assert.equal((html.match(/display-options\.switcher-search=/g) || []).length, 3)
  const json = JSON.parse(webApp('flows/main/pages/main-start-page.json'))
  assert.equal(json.eventListeners.pageSwitched.chains[0].chain, 'onPageSwitch')
  assert.match(webApp('flows/main/pages/main-start-page-chains/onPageSwitch.js'), /bridge\.switcherPickOf/)
  assert.ok(JSON.parse(webApp('app-flow.json')).variables.mateuPageHeader.defaultValue.switcher)
})

// ── KPI timeframe on the welcome tiles ───────────────────────────────────────────────────

test('a welcome KPI tile carries its timeframe under the value and in its accessible name', () => {
  const tree = page({}, [
    node({ type: 'HeroSection', title: 'Welcome' }),
    node({ type: 'DashboardPanel', title: 'Revenue' }, [
      node({ type: 'MetricCard', title: 'Revenue', value: '12.4k', unit: '€', timeframe: 'Last 7 days', trendLabel: '+8%' })]),
    node({ type: 'DashboardPanel', title: 'Occupancy' }, [node({ type: 'MetricCard', title: 'Occupancy', value: '82' })]),
  ])
  const [withTf, without] = welcomeOf(host(tree)).tiles
  assert.equal(withTf.kpiTimeframe, 'Last 7 days')
  assert.equal(withTf.kpiAriaLabel, 'Revenue, 12.4k €, Last 7 days, +8%')
  assert.equal(without.kpiTimeframe, '')
  assert.equal(without.kpiAriaLabel, 'Occupancy, 82')
  const html = webApp('flows/main/pages/main-start-page.html')
  assert.match(html, /\$current\.data\.kpiTimeframe/)
  // the scoreboard atom (every surface) paints it too
  assert.ok((html.match(/mateu-metric-timeframe"><oj-bind-text value="\[\[ \$current\.data\.timeframe \]\]"/g) || []).length > 1)
})

// ── A3 hero tone ──────────────────────────────────────────────────────────────────────────

const welcomeTree = (tone) => page({}, [node({ type: 'HeroSection', title: 'Welcome', subtitle: 'Hi', tone })])

test('A3: HeroSection.tone → the welcome banner\'s dark-<tone> background, every visit the same', () => {
  const ctx = host(welcomeTree('lilac'))
  assert.equal(welcomeOf(ctx).tone, 'lilac')
  const look = welcomeLookOf('k', null, () => 0, 'lilac')
  assert.equal(look.theme, 'dark-lilac')
  assert.equal(look.illu, '') // lilac has no gallery pair
  assert.equal(welcomeToneLookOf('k', 'ocean').theme, 'dark-ocean')
  assert.match(welcomeToneLookOf('k', 'ocean').illu, /fg-01/)
  for (const t of ['ocean', 'pine', 'lilac', 'teal', 'rose', 'pebble', 'slate', 'plum', 'sienna'])
    assert.equal(welcomeToneLookOf('k', t).theme, 'dark-' + t)
  // the archetype projection: a declared tone wins over the rotation (and over the look on screen)
  const { vars } = archetypeVarsOf(ctx, { key: 'p1', theme: 'dark-pine', illuBg: 'a', illu: 'b' })
  assert.equal(vars.mateuWelcomeTheme, 'dark-lilac')
})

test('A3: no tone, or an unknown one, keeps the rotating look', () => {
  assert.equal(welcomeToneLookOf('k', null), null)
  assert.equal(welcomeToneLookOf('k', 'chartreuse'), null)
  assert.equal(welcomeLookOf('k', null, () => 0, 'chartreuse').theme, 'dark-ocean')
  const kept = { key: 'k', theme: 'dark-plum', illuBg: '', illu: '' }
  assert.equal(welcomeLookOf('k', kept, () => 0, null), kept)
})

// ── A4 foldout summary ────────────────────────────────────────────────────────────────────

const foldoutTree = () => page({}, [node({
  type: 'FoldoutLayout', headerTitle: 'Booking',
  panels: [{ title: 'Payments', open: true }, { title: 'Notes', open: false }],
}, [
  node({ type: 'VerticalLayout' }, [text('Overview')], '', 'overview'),
  node({ type: 'VerticalLayout' }, [text('Charges')], '', 'panel-0'),
  node({ type: 'HorizontalLayout' }, [text('€ 120 due'), node({ type: 'Badge', label: 'Overdue' })], '', 'summary-0'),
  node({ type: 'VerticalLayout' }, [text('Late arrival')], '', 'panel-1'),
], 'fold')])

test('A4: summary-N → the panel\'s summary (oj-sp-foldout-panel summary slot), one compact line', () => {
  const f = foldoutOf(host(foldoutTree()))
  assert.deepEqual(f.panels.map((p) => [p.title, p.hasSummary, p.summary]),
    [['Payments', true, '€ 120 due · Overdue'], ['Notes', false, '']])
  // the summary is not content of the panel nor of the overview
  assert.ok(!f.panels[0].texts.includes('€ 120 due'))
  assert.ok(!f.overview.texts.includes('€ 120 due'))
  const html = webApp('flows/main/pages/main-start-page.html')
  // a digest under the panel title (oj-sp-foldout-layout never folds a panel; its `summary` slot is
  // read once at creation, before the binding stamps — so not that slot)
  assert.match(html, /mateu-foldout-summary"><oj-bind-text value="\[\[ \(\$application\.variables\.mateuFoldoutContent\.panels\[\$current\.index\] \|\| \$current\.data\)\.summary \]\]">/)
  assert.doesNotMatch(html, /slot="summary"/)
})

test('A4: a foldout inside a tab shows a FOLDED panel\'s summary in place of its content', () => {
  const fold = foldoutTree().children[0].children[0]
  // two tabs: a lone tab is drawn as its content, without a tab scope
  const tabs = node({ type: 'TabLayout' }, [node({ type: 'Tab', label: 'Detail', active: true }, [fold]), node({ type: 'Tab', label: 'Other' }, [text('other')])])
  const texts = (islandContentOf({ tree: node({ type: 'VerticalLayout' }, [tabs]), state: {}, data: {} }) || [])
    .flatMap((b) => b.items || []).filter((a) => a.isText).map((a) => a.text)
  assert.ok(texts.includes('Charges'))
  assert.ok(!texts.includes('€ 120 due'))
  // fold the first panel: its summary stands in
  setPanelExpanded('fold:fold:0', false)
  // (the summary is a HorizontalLayout of a text and a badge: ONE inline row atom, its pieces inside)
  const folded = (islandContentOf({ tree: node({ type: 'VerticalLayout' }, [tabs]), state: {}, data: {} }) || [])
    .flatMap((b) => b.items || []).flatMap((a) => (a.isRow ? a.items : [a])).filter((a) => a.isText).map((a) => a.text)
  setPanelExpanded('fold:fold:0', true)
  assert.ok(!folded.includes('Charges'))
  assert.ok(folded.includes('€ 120 due'))
})

// ── A5 preSearch ──────────────────────────────────────────────────────────────────────────

const crudTree = (preSearch) => page({}, [node({
  type: 'Crud', title: 'Hotels', columns: [{ id: 'name', label: 'Name' }], toolbar: [], preSearch,
}, [], 'crud')])

test('A4: a foldout drawn from the generic visit does not paint its summaries as content', () => {
  const fold = foldoutTree().children[0].children[0]
  const texts = (islandContentOf({ tree: node({ type: 'VerticalLayout' }, [fold]), state: {}, data: {} }) || [])
    .flatMap((b) => b.items || []).filter((a) => a.isText).map((a) => a.text)
  assert.ok(texts.includes('Charges'))
  assert.ok(!texts.includes('€ 120 due'))
})

test('A5: before the first search the preSearch content stands in for the results', () => {
  const pre = [node({ type: 'Text', text: 'Search for a hotel to begin' })]
  const before = listingOf(host(crudTree(pre)))
  assert.equal(before.showPreSearch, true)
  assert.match(before.tableClass, /oj-helper-hidden/)
  assert.equal(before.paging.visible, false)
  const atoms = before.headerBlocks.flatMap((b) => b.items || [])
  assert.ok(atoms.some((a) => a.text === 'Search for a hotel to begin'))
})

test('A5: once a search answers (even empty) the results replace it for good', () => {
  const pre = [node({ type: 'Text', text: 'Search for a hotel to begin' })]
  const reg0 = { contexts: { [HOST_ID]: host(crudTree(pre)) }, stack: [], shell: null }
  // a search answer: a data-only fragment with the listing's page
  const { contexts } = reduceContexts(reg0, { commands: [], messages: [], fragments: [
    { targetComponentId: HOST_ID, action: 'Replace', data: { crud: { page: { content: [], totalElements: 0 } } } },
  ] })
  const after = listingOf(contexts[HOST_ID])
  assert.equal(after.showPreSearch, false)
  assert.doesNotMatch(after.tableClass, /oj-helper-hidden/)
  assert.ok(!after.headerBlocks.flatMap((b) => b.items || []).some((a) => a.text === 'Search for a hotel to begin'))
  assert.equal(after.isEmpty, true) // the normal empty state, not the pre-search content
})

test('A5: a listing without preSearch (null on the wire) is untouched', () => {
  const l = listingOf(host(crudTree(null)))
  assert.equal(l.showPreSearch, false)
  assert.doesNotMatch(l.tableClass, /oj-helper-hidden/)
})

// ── B composition ─────────────────────────────────────────────────────────────────────────

const drawerFr = (initialData, extra = []) => ({
  action: 'Add', targetComponentId: HOST_ID,
  component: node({ type: 'Drawer', headerTitle: 'Edit room', initialData },
    [node({ type: 'VerticalLayout' }, [...extra, node({ type: 'FormField', fieldId: 'name', dataType: 'string', label: 'Name' })])], 'crud-edit-drawer'),
})

test('B: the crud drawer re-sent with the SAME id refreshes in place (save and next, error banner)', () => {
  const reg0 = { contexts: { [HOST_ID]: host(crudTree(null)) }, stack: [], shell: null }
  const opened = reduceContexts(reg0, { commands: [], messages: [], fragments: [drawerFr({ id: 'r1', name: 'Sea' })] })
  assert.equal(opened.stack.length, 1)
  const first = opened.stack[0]
  const next = reduceContexts(opened, { messages: [], fragments: [drawerFr({ id: 'r2', name: 'Garden' })], commands: [
    { type: 'MarkAsClean' }, { type: 'DispatchEvent', data: { eventName: 'mateu-crud:saved-in-drawer' } },
  ] })
  assert.equal(next.stack.length, 1, 'no second drawer stacked')
  assert.notEqual(next.stack[0], first, 'a new overlay id: the drawer draft resets to the new row')
  assert.equal(next.contexts[first], undefined)
  assert.equal(overlayOf(next).state.id, 'r2')
  assert.deepEqual(next.effects.events.map((e) => e.name), ['mateu-crud:saved-in-drawer'])
  // the error banner: a danger Notice above the form, what was typed kept
  const failed = reduceContexts(next, { messages: [], fragments: [drawerFr({ id: 'r2', name: 'Dup' },
    [node({ type: 'Notice', theme: 'danger', text: 'Name is taken' }, [], 'crud-drawer-error')])], commands: [
    { type: 'Announce', data: { text: 'Name is taken', assertive: true } },
  ] })
  assert.equal(failed.stack.length, 1)
  assert.equal(overlayOf(failed).state.name, 'Dup')
  assert.deepEqual(failed.effects.announcements, [{ text: 'Name is taken', assertive: true }])
})

test('B: a different overlay still stacks on top', () => {
  const reg0 = { contexts: { [HOST_ID]: host(crudTree(null)) }, stack: [], shell: null }
  const one = reduceContexts(reg0, { commands: [], messages: [], fragments: [drawerFr({ id: 'r1' })] })
  const two = reduceContexts(one, { commands: [], messages: [], fragments: [
    { action: 'Add', targetComponentId: HOST_ID, component: node({ type: 'Dialog', headerTitle: 'Sure?' }, [], 'confirm') },
  ] })
  assert.equal(two.stack.length, 2)
})

test('B: disabled buttons (Toggle.disabled) travel to the action rows and the headers', () => {
  const tree = node({ type: 'VerticalLayout' }, [
    node({ type: 'Button', label: 'Skip', actionId: 'skip', disabled: true }),
    node({ type: 'Button', label: 'Next', actionId: 'next' }),
  ])
  assert.deepEqual(actionsOf(tree).map((a) => [a.actionId, a.disabled]), [['skip', true], ['next', false]])
  const vars = listHeaderVarsOf({ toolbar: [{ actionId: 'new', label: 'New', disabled: true }, { actionId: 'delete', label: 'Delete', disabled: true }] })
  assert.equal(vars.mateuListPrimary.display, 'disabled')
  assert.equal(vars.mateuListSecondary[0].display, 'disabled')
  const crud = listingOf(host(page({}, [node({ type: 'Crud', columns: [], toolbar: [{ actionId: 'new', label: 'New', disabled: true }] }, [], 'crud')])))
  assert.equal(crud.toolbar[0].disabled, true)
  // every button row binds it (the atoms partial is expanded into each surface)
  const html = webApp('flows/main/pages/main-start-page.html')
  assert.ok((html.match(/disabled="\[\[ !!\$current\.data\.disabled \]\]"/g) || []).length >= 19 + 4)
})

test('B: a slot-template grid (GeneralOverview info, DataManagement panel) places children by area', () => {
  const main = text('Main', 'main')
  const info = text('Info', 'info')
  // promoteInfoSlot: the info child travels FIRST — it still takes the `info` column
  assert.deepEqual(kidsInAreaOrder([info, main], 'main info').map((k) => k.slot), ['main', 'info'])
  assert.deepEqual(kidsInAreaOrder([info, main], '"main info"').map((k) => k.slot), ['main', 'info'])
  // unslotted children, or no areas, keep the list order
  assert.deepEqual(kidsInAreaOrder([info, text('x')], 'main info').map((k) => k.slot), ['info', undefined])
  assert.deepEqual(kidsInAreaOrder([info, main], null).map((k) => k.slot), ['info', 'main'])
  const grid = node({ type: 'ResponsiveGrid', gridTemplateColumns: '1fr 20rem', gridTemplateAreas: 'main info', stackBelow: '48rem' }, [info, main], 'general-overview')
  const blocks = islandContentOf({ tree: node({ type: 'VerticalLayout' }, [grid]), state: {}, data: {} })
  const texts = blocks.map((b) => (b.items || []).filter((a) => a.isText).map((a) => a.text).join())
  assert.deepEqual(texts.filter(Boolean), ['Main', 'Info'])
})

// ── wire captured from the SUT (e2e mvc-app1 patterns/*: SwitcherPage, OverviewWithInfo, GuestSearch,
//    SummaryFoldout) — the four defects found driving the Redwood build in a browser ───────────

const wire = (name) => {
  const w = JSON.parse(readFileSync(join(here, 'fixtures', 'patterns', name + '.json'), 'utf8'))
  for (const f of w.fragments) f.targetComponentId = ''
  return reduceContexts(empty(), w)
}

test('SUT switcher: the switcher is header chrome — no stray «Customer» button in the form row', () => {
  const reg = wire('switcher')
  const summary = summarizeHost(reg, '')
  assert.ok(!summary.actions.some((a) => a.actionId === '_switchRecord' || a.label === 'Customer'))
  assert.equal(pageSwitcherOf(reg.contexts[HOST_ID]).value, 'c1')
})

test('SUT switcher: @Section affordances are their oj-sp-section\'s own, never the form\'s action row', () => {
  const summary = summarizeHost(wire('switcher'), '')
  const byTitle = Object.fromEntries(summary.sections.filter((s) => s.title).map((s) => [s.title, s]))
  // they are oj-sp-section's own affordances: its one primary action (edit, else add) and view more
  assert.deepEqual(byTitle.Contact.sectionActions.primary, { type: 'edit', display: 'on' })
  assert.equal(byTitle.Contact.sectionActions.primaryAction.actionId, 'editContact')
  assert.deepEqual([byTitle.Contact.titleButtons, byTitle.Contact.footerButtons], [[], []])
  assert.deepEqual(byTitle.Segment.sectionActions.primary, { type: 'add', display: 'on' })
  assert.equal(byTitle.Segment.sectionActions.viewMore, 'on')
  assert.deepEqual([byTitle.Segment.titleButtons, byTitle.Segment.footerButtons], [[], []])
  assert.equal(byTitle.Segment.hasFooterButtons, false)
  // and they leave the form's bottom action row
  assert.deepEqual(summary.actions.map((a) => a.actionId), [])
  assert.deepEqual(withoutSectionButtons([{ actionId: 'save' }, { actionId: 'addTag' }], summary.sections).map((a) => a.actionId), ['save'])
  // the page/wizard section templates draw both rows
  const html = webApp('flows/main/pages/main-start-page.html')
  assert.equal((html.match(/mateu-section-title-row/g) || []).length, 3)
  assert.equal((html.match(/data="\[\[ \$current\.data\.footerButtons \]\]"/g) || []).length, 3)
})

test('sectionButtonsOf does not take a nested section\'s buttons', () => {
  const inner = { ...node({ type: 'Card' }, [node({ type: 'Button', label: 'Inner', actionId: 'inner' })]), cssClasses: 'mateu-section' }
  const outer = { ...node({ type: 'Card' }, [node({ type: 'Button', label: 'Outer', actionId: 'outer' }), inner]), cssClasses: 'mateu-section' }
  assert.deepEqual(sectionButtonsOf(outer).footerButtons.map((b) => b.actionId), ['outer'])
})

test('SUT overview: the GeneralOverview info slot (untitled Card slotted info) is drawn', () => {
  const o = generalOverviewOf(wire('overview').contexts[HOST_ID])
  const info = o.cards.find((c) => c.isInfo)
  assert.ok(info, 'the info card is there')
  assert.ok(info.items.some((a) => a.isText && a.text === 'Recent activity'))
  assert.ok(info.items.some((a) => a.isBullets))
  // beside other cards it is the narrower column; promoted it leads
  const main = node({ type: 'Card', title: node({ type: 'Text', text: 'Lines' }), content: [text('3 lines')] }, [], 'c', 'main')
  const infoN = node({ type: 'Card', content: [text('Activity')] }, [], 'i', 'info')
  const tree = (kids) => page({}, [node({ type: 'EntityHeader', title: 'R' }), node({ type: 'FormField', fieldId: 'record', dataType: 'string', options: [{ value: 'r1', label: 'R1' }] }),
    node({ type: 'ResponsiveGrid', gridTemplateAreas: '"main info"' }, kids, 'general-overview')])
  const plain = generalOverviewOf(host(tree([main, infoN]), { record: 'r1' }))
  assert.deepEqual(plain.cards.map((c) => [c.title, !!c.isInfo, c.colClass || '']), [['Lines', false, ''], ['', true, 'oj-flex-item oj-sm-12 oj-md-4']])
  const promoted = generalOverviewOf(host(tree([infoN, main]), { record: 'r1' }))
  assert.equal(promoted.cards[0].isInfo, true)
  assert.match(webApp('flows/main/pages/main-start-page.html'), /:class="\[\[ \$current\.data\.colClass \|\| 'oj-flex-item oj-sm-12 oj-md-6' \]\]"/)
})

test('SUT search: before the first search only the pre-search content (an EmptyState) is there', () => {
  const ctx = wire('search').contexts[HOST_ID]
  const l = listingOf(ctx)
  assert.equal(l.showPreSearch, true)
  assert.match(l.tableClass, /oj-helper-hidden/) // the table — and its «No data.» — hidden
  const atoms = l.headerBlocks.flatMap((b) => b.items || [])
  assert.ok(atoms.some((a) => a.isEmptyStateAtom))
  // the pre-search EmptyState is not the PAGE's empty state (painted under the table before)
  assert.equal(emptyStateOf(ctx.tree), null)
})

test('SUT foldout: the folded panels carry their summaries for the digest line', () => {
  const f = foldoutOf(wire('foldout').contexts[HOST_ID])
  assert.deepEqual(f.panels.map((p) => [p.title, p.open, p.hasSummary, p.summary]),
    [['Payments', false, true, '€240 due'], ['Requests', false, true, '2 open'], ['History', true, false, '']])
})


// ── YAML page header (the extras authored on a `type: Form`, FormDto — same names as PageDto) ──

const yamlPage = (metadata, children = []) => ({
  type: 'ServerSide', id: 'y1', serverSideType: undefined, route: '/customers/2', actions: [],
  children: [node({ type: 'Form', title: '${state.name}', toolbar: [], buttons: [], ...metadata }, children)],
})
const YAML_STATE = { id: '2', name: 'Grace', balance: '€120', status: 'Active', who: 'Ops' }

test('YAML Form: kpis/subtitle come off the Form when there is no Page, ${state.x} interpolated', () => {
  const ctx = host(yamlPage({
    subtitle: 'Owner ${state.who}',
    kpis: [{ title: 'Balance', text: '${state.balance}', style: null, cssClasses: null }, { title: '${state.who} desk', text: '3' }],
  }), YAML_STATE)
  assert.equal(pageHeaderNodeOf(ctx.tree).fromForm, true)
  assert.deepEqual(pageKpisOf(ctx), [{ label: 'Balance', value: '€120' }, { label: 'Ops desk', value: '3' }])
  assert.equal(pageSubtitleOf(ctx), 'Owner Ops')
})

test('YAML Form: a tree WITH a Page keeps reading the Page (the Form inside it is not the header)', () => {
  const tree = page({ kpis: [{ title: 'Nights', text: '3' }] }, [node({ type: 'Form', kpis: [{ title: 'Wrong', text: 'x' }] })])
  assert.equal(pageHeaderNodeOf(tree).metadata.type, 'Page')
  assert.deepEqual(pageKpisOf(host(tree)), [{ label: 'Nights', value: '3' }])
})

test('YAML Form: the record switcher (options, ${state} value) and a route pick navigates', () => {
  const ctx = host(yamlPage({ switcher: {
    options: [{ value: '1', label: 'Ada' }, { value: '2', label: 'Grace' }],
    value: '${state.id}', type: 'object', label: 'Customer', searchable: false, disabled: false,
    actionId: '_switchRecord', optionsSource: null, route: 'customers/${state._record}?from=${state.who}',
  } }), YAML_STATE)
  const sw = pageSwitcherOf(ctx)
  assert.equal(sw.on, true)
  assert.equal(sw.value, '2')
  assert.deepEqual(sw.objectOptions.map((o) => o.label), ['Ada', 'Grace'])
  // the page's own state resolved at projection, the picked value at pick time
  assert.equal(sw.route, 'customers/${state._record}?from=Ops')
  assert.deepEqual(switcherPickOf(sw, '1'), { actionId: '_switchRecord', parameters: { _record: '1' }, route: 'customers/1?from=Ops' })
  assert.equal(switcherPickOf(sw, '2'), null) // echo
  // the header chrome is not content: no stray «Customer» button in the form's row
  assert.equal(actionsOf(ctx.tree).some((a) => a.actionId === '_switchRecord'), false)
})

test('YAML Form: a switcher with an optionsSource reads the options loaded into data._switcher', () => {
  const md = { switcher: { options: [], value: '2', type: 'context', label: 'Customer', actionId: '_switchRecord',
    optionsSource: { ref: 'people' }, route: null } }
  assert.equal(pageSwitcherOf(host(yamlPage(md), YAML_STATE)).on, false) // not loaded yet
  const sw = pageSwitcherOf(host(yamlPage(md), YAML_STATE, { _switcher: { content: [{ value: 2, label: 'Grace' }, { value: 3, label: 'Linus' }] } }))
  assert.equal(sw.on, true)
  assert.deepEqual(sw.contextOptions.map((o) => [o.value, o.label]), [['2', 'Grace'], ['3', 'Linus']])
  assert.deepEqual(switcherPickOf(sw, '3'), { actionId: '_switchRecord', parameters: { _record: '3' } })
})

test('YAML Form: banners (interpolated) → the messages banner; fabs → the page FABs, not row buttons', () => {
  const ctx = host(yamlPage({
    banners: [{ theme: 'WARNING', hasIcon: false, hasCloseButton: true, title: 'Overdue', description: '${state.name} owes ${state.balance}', timeoutSeconds: 0 }],
    fabs: [{ id: 'newOrder', label: 'New order', icon: 'vaadin:plus', actionId: 'newOrder', buttonStyle: 'primary' }],
  }), YAML_STATE)
  assert.deepEqual(bannersOf(ctx), [{ id: 'mateu-banner-0', messageType: 'general-warning', primaryText: 'Overdue', secondaryText: 'Grace owes €120' }])
  const fabs = fabsOf({ fabs: [] }, ctx)
  assert.deepEqual(fabs.map((f) => [f.key, f.actionId, f.appLevel, f.chroming]), [['page:newOrder', 'newOrder', false, 'callToAction']])
  assert.equal(actionsOf(ctx.tree).some((a) => a.actionId === 'newOrder'), false)
})

test('YAML Form: a reflected Page banner is still read verbatim (no interpolation on the Page path)', () => {
  assert.deepEqual(bannersOf(host(page({ banners: [{ theme: 'INFO', title: 'Hi', description: 'd' }] }))).map((b) => b.primaryText), ['Hi'])
})

test('YAML Form: page badges of a foldout come off the Form too', () => {
  const tree = yamlPage({ badges: [{ text: '${state.status}', color: 'success' }, { text: '${state.missing}', color: 'normal' }] }, [
    node({ type: 'FoldoutLayout', panels: [] }, [text('Overview', 'overview')]),
  ])
  const f = foldoutOf(host(tree, YAML_STATE))
  assert.deepEqual(f.badges.map((b) => b.label), ['Active']) // a blank one is hidden
})

test('YAML shell: a header action with a route navigates (headerActionRouteOf), at any depth', () => {
  const nav = shellNavOf({ shell: { menu: [], headerActions: [
    { actionId: null, label: 'Help', route: 'help', children: [] },
    { actionId: 'more', label: 'More', children: [{ actionId: 'reports', label: 'Reports', route: 'reports/weekly' }, { actionId: 'sync', label: 'Sync' }] },
  ] } })
  assert.deepEqual(nav.headerActions.map((a) => a.route), ['help', ''])
  assert.equal(headerActionRouteOf(nav.headerActions, 'help'), 'help')
  assert.equal(headerActionRouteOf(nav.headerActions, 'reports'), 'reports/weekly')
  assert.equal(headerActionRouteOf(nav.headerActions, 'sync'), '') // dispatched app-level as before
  assert.equal(headerActionRouteOf(nav.headerActions, ''), '')
})

test('YAML wiring: the VB chains navigate on a switcher/header route and load sourced selector options', () => {
  // the switcher pick: a route fires the in-app navigation, else the action as before
  const sw = webApp('flows/main/pages/main-start-page-chains/onPageSwitch.js')
  assert.match(sw, /if \(pick\.route\)[\s\S]*application:mateuNavigate[\s\S]*payload: \{ route: pick\.route \}/)
  assert.ok(sw.indexOf('pick.route') < sw.indexOf("chain: 'runMateuAction'"))
  // a header action button passes its route; a dropdown child's value falls back to its route
  const listeners = JSON.parse(webApp('pages/shell-page.json')).eventListeners
  assert.equal(listeners.headerActionClicked.chains[0].parameters.route, '{{ $current.data.route }}')
  assert.match(webApp('pages/shell-page.html'), /<oj-option :value="\[\[ \$current\.data\.actionId \|\| \$current\.data\.route \]\]">/)
  const ha = webApp('pages/shell-page-chains/runMateuHeaderAction.js')
  assert.match(ha, /bridge\.headerActionRouteOf\(\$application\.variables\.mateuHeaderActions/)
  assert.ok(ha.indexOf("chain: 'onMateuNavigate'") < ha.indexOf('bridge.callMateu'))
  // the selectors' options are loaded before the shell nav is built, proxied through _appsource
  const boot = webApp('pages/shell-page-chains/loadMateuShell.js')
  assert.ok(boot.indexOf('bridge.loadContextSelectorOptions') > 0)
  assert.ok(boot.indexOf('bridge.loadContextSelectorOptions') < boot.indexOf('bridge.shellNavOf(reg)'))
  assert.match(boot, /runAppLevelAction\(base, reg\.shell\.serverSideType, ctxAppState, '_appsource', parameters\)/)
})

// ── header text + navigation elements: overline, titlePlaceholder, timestamp, badges, peerNav ──

const headerOf = (ctx, extra = {}) => pageHeaderOf({
  host: ctx, hostEntity: null, summary: summarizeHost({ contexts: { [HOST_ID]: ctx }, shell: { menu: [] } }, '/p'),
  hostToolbar: [], showHeader: true, pageWidth: 'fixed', gopOn: false, listing: null, ...extra,
}).header

test('header extras (Java page): overline, timestamp, first badge in oj-sp\'s badge, the rest after the subtitle', () => {
  const ctx = host(page({
    subtitle: 'Since 2019', overline: 'Customers', timestamp: 'Last updated 12 Oct',
    badges: [{ text: 'VIP', color: 'success' }, { text: 'Blocked', color: 'error' }, { text: '', color: 'warning' }],
  }))
  const h = headerOf(ctx)
  assert.equal(h.title, 'Room 101')
  assert.equal(h.overline, 'Customers')
  assert.equal(h.timestamp, '') // text, not a date: oj-sp's element never gets it…
  assert.deepEqual(h.badge, { text: 'VIP', status: 'success' })
  assert.equal(h.subtitle, 'Since 2019 · Blocked · Last updated 12 Oct') // …it ends the subtitle line
  assert.equal(h.titleIsPlaceholder, false)
  assert.equal(h.headerClass, '')
  // nothing declared: no badge, no overline, no arrows
  const bare = headerOf(host(page({})))
  assert.deepEqual([bare.badge, bare.overline, bare.timestamp, bare.previousItem.display, bare.nextItem.display, bare.prevRoute],
    [null, '', '', 'disabled', 'disabled', ''])
})

test('header extras (Java page): @BadgeInHeader travels as templates — ${state.x} and a ternary resolve', () => {
  const tree = page({ badges: [
    { type: 'Badge', text: '${state.status}', color: 'success' },
    { type: 'Badge', text: "${state.vip ? 'VIP' : ''}", color: 'warning' },
  ] })
  assert.deepEqual(pageHeaderExtrasOf(host(tree, { status: 'Active', vip: true })).badges,
    [{ label: 'Active', status: 'success' }, { label: 'VIP', status: 'warning' }])
  // a false boolean / a missing status: no chip
  assert.deepEqual(pageHeaderExtrasOf(host(tree, { vip: false })).badges, [])
})

test('header extras (Java page): a Status field\'s badge takes its COLOUR from the state too', () => {
  // FormViewBadgesBuilder: text ${state.x.message}, color ${state.x.type} (a StatusType constant)
  const tree = page({ badges: [{ type: 'Badge', text: '${state.situacion.message}', color: '${state.situacion.type}' }] })
  const of = (type) => pageHeaderExtrasOf(host(tree, { situacion: { type, message: 'Activo' } })).badges
  assert.deepEqual(of('SUCCESS'), [{ label: 'Activo', status: 'success' }])
  assert.deepEqual(['DANGER', 'WARNING', 'INFO', 'NONE'].map((t) => of(t)[0].status), ['danger', 'warning', 'info', 'neutral'])
  // an unresolved colour is neutral, never the literal template
  assert.deepEqual(pageHeaderExtrasOf(host(tree, { situacion: { message: 'Activo' } })).badges, [{ label: 'Activo', status: 'neutral' }])
})

test('header extras: oj-sp\'s timestamp only ever gets a DATE (a non-date breaks its binding)', () => {
  assert.deepEqual(headerTimestampOf('2026-10-12T09:00:00Z'), { iso: '2026-10-12T09:00:00Z', text: '' })
  assert.deepEqual(headerTimestampOf('Last updated 2026-10-12T09:00'), { iso: '2026-10-12T09:00', text: '' })
  assert.deepEqual(headerTimestampOf('Actualizado 2026-10-12 09:00'), { iso: '2026-10-12T09:00', text: '' })
  // a label oj-sp would not say (it writes its own "Last updated"), or no date at all: text
  assert.deepEqual(headerTimestampOf('Created 2026-10-12'), { iso: '', text: 'Created 2026-10-12' })
  assert.deepEqual(headerTimestampOf('Last updated 12 Oct 2026, 10:42'), { iso: '', text: 'Last updated 12 Oct 2026, 10:42' })
  assert.deepEqual(headerTimestampOf('2026-13-45'), { iso: '', text: '2026-13-45' })
  assert.deepEqual(headerTimestampOf(''), { iso: '', text: '' })
  const h = headerOf(host(page({ timestamp: 'Last updated 2026-10-12T09:00:00' })))
  assert.deepEqual([h.timestamp, h.subtitle], ['2026-10-12T09:00:00', ''])
})

test('header extras: badge colours map onto the oj-sp badge statuses', () => {
  assert.deepEqual(['success', 'error', 'danger', 'WARNING', 'normal', 'contrast', undefined].map(badgeStatusOf),
    ['success', 'danger', 'danger', 'warning', 'info', 'neutral', 'neutral'])
})

test('header extras: peerNav → oj-sp previous/next item, a side without a route is disabled', () => {
  const h = headerOf(host(page({ peerNav: { prevLabel: 'Ada', prevRoute: '/employees/1', nextLabel: null, nextRoute: null } })))
  assert.deepEqual(h.previousItem, { label: 'Ada', display: 'on' })
  assert.deepEqual(h.nextItem, { label: 'Next', display: 'disabled' }) // chrome text when unnamed
  assert.deepEqual([h.prevRoute, h.nextRoute], ['/employees/1', ''])
  // both routes null: no lateral navigation at all
  const none = headerOf(host(page({ peerNav: { prevLabel: 'a', prevRoute: null, nextLabel: 'b', nextRoute: null } })))
  assert.deepEqual([none.previousItem.display, none.nextItem.display], ['disabled', 'disabled'])
})

test('header extras: the titlePlaceholder stands in only while the title is EMPTY, dimmed', () => {
  const filled = headerOf(host(page({ title: 'Ada', titlePlaceholder: 'New customer…' })))
  assert.deepEqual([filled.title, filled.titleIsPlaceholder], ['Ada', false])
  const blank = host(page({ title: '', titlePlaceholder: 'New customer…' }))
  // the placeholder wins over the menu's label: summarizeHost keeps the empty title empty
  assert.equal(summarizeHost({ contexts: { [HOST_ID]: blank }, shell: { menu: [{ route: '/p', label: 'Customers' }] } }, '/p').title, '')
  const h = headerOf(blank)
  assert.deepEqual([h.title, h.titleIsPlaceholder, h.headerClass], ['New customer…', true, 'mateu-title-placeholder'])
})

test('header extras (YAML Form): ${state.x} resolved; a blank chip hides; peer routes resolved', () => {
  const ctx = host(yamlPage({
    overline: '${state.who} desk', titlePlaceholder: 'New customer…', timestamp: 'Last updated ${state.updatedAt}',
    badges: [{ text: '${state.status}', color: 'success' }, { text: 'VIP', color: null }, { text: '${state.missing}', color: 'error' }],
    peerNav: { prevLabel: 'Previous', prevRoute: 'customers/${state.prevId}', nextLabel: 'Next', nextRoute: null },
  }), { ...YAML_STATE, updatedAt: 'today', prevId: '1' })
  const x = pageHeaderExtrasOf(ctx)
  assert.equal(x.overline, 'Ops desk')
  assert.equal(x.timestamp, 'Last updated today')
  assert.deepEqual(x.badges, [{ label: 'Active', status: 'success' }, { label: 'VIP', status: 'neutral' }])
  assert.deepEqual(x.peerNav, { prevRoute: 'customers/1', nextRoute: '', prevLabel: 'Previous', nextLabel: 'Next' })
  const h = headerOf(ctx)
  assert.deepEqual([h.title, h.titleIsPlaceholder], ['Grace', false]) // `${state.name}` resolved
  // the same page while creating: no name yet → the placeholder
  const fresh = headerOf(host(ctx.tree, { id: '', name: '' }))
  assert.deepEqual([fresh.title, fresh.titleIsPlaceholder, fresh.badge], ['New customer…', true, { text: 'VIP', status: 'neutral' }])
})

test('header extras wiring: both page headers bind them, the arrows navigate like a breadcrumb', () => {
  const html = webApp('flows/main/pages/main-start-page.html')
  for (const id of ['mateuPageHeaderEl', 'mateuPageHeaderInline']) {
    const tag = html.slice(html.indexOf(`<oj-sp-header-general-overview id="${id}"`), html.indexOf('</oj-sp-header-general-overview>', html.indexOf(`id="${id}"`)))
    for (const attr of ['badge="[[ $application.variables.mateuPageHeader.badge ]]"', 'timestamp="[[ $application.variables.mateuPageHeader.timestamp ]]"',
      'previous-item="[[ $application.variables.mateuPageHeader.previousItem ]]"', 'next-item="[[ $application.variables.mateuPageHeader.nextItem ]]"',
      'on-sp-previous-item="[[ $listeners.headerPreviousItem ]]"', 'on-sp-next-item="[[ $listeners.headerNextItem ]]"', 'headerClass']) {
      assert.ok(tag.includes(attr), id + ' binds ' + attr)
    }
  }
  assert.equal((html.match(/class="mateu-header-overline /g) || []).length, 2)
  const listeners = JSON.parse(webApp('flows/main/pages/main-start-page.json')).eventListeners
  assert.equal(listeners.headerPreviousItem.chains[0].parameters.actionId, '__peerPrev')
  assert.equal(listeners.headerNextItem.chains[0].parameters.actionId, '__peerNext')
  const run = webApp('flows/main/pages/main-start-page-chains/runMateuAction.js')
  assert.match(run, /id === '__peerPrev' \? header\.prevRoute : header\.nextRoute[\s\S]*'navigation-requested'/)
  // the default header (before any page) carries every field the bindings read
  const def = JSON.parse(webApp('app-flow.json')).variables.mateuPageHeader.defaultValue
  assert.deepEqual([def.badge, def.timestamp, def.overline, def.previousItem.display, def.nextItem.display], [null, '', '', 'disabled', 'disabled'])
  // the shell adopts the App's sources before the bell is first listed
  const boot = webApp('pages/shell-page-chains/loadMateuShell.js')
  assert.ok(boot.indexOf('bridge.adoptShellSources(reg.shell)') > 0)
  assert.ok(boot.indexOf('bridge.adoptShellSources(reg.shell)') < boot.indexOf('bridge.fetchNotifications('))
})

// ── an EntityHeader fact with an action (the pencil next to EMPRESA) ─────────────────────────

const stayPage = () => page({ title: 'Stay' }, [node({
  type: 'EntityHeader', id: 'stay', title: 'María Fernández',
  facts: [
    { label: 'TOTAL RESERVA', value: '€ 4.890,00' },
    { label: 'EMPRESA', value: 'Acme Corporation Ltd', actionId: 'changeCompany', icon: 'vaadin:pencil',
      actionLabel: 'Cambiar empresa', parameters: { stayId: 'S-1' } },
  ],
}, [], 'stay')])

test('only the EntityHeader that HEADS the page goes up to the screen header', () => {
  const eh = (title) => node({ type: 'EntityHeader', title, facts: [] })
  const card = (...kids) => node({ type: 'Card', content: node({ type: 'Div' }, kids) })
  const grid = (...kids) => node({ type: 'ResponsiveGrid', gridTemplateAreas: '"list detail"' }, kids)
  const field = (id) => node({ type: 'FormField', fieldId: id, dataType: 'string' })
  const lifted = (children) => { const e = entityHeaderOf(host(page({}, children))); return e && e.title }
  // the page's first content, even deep in a form's section cards (a Java EntityHeader field)
  assert.equal(lifted([card(node({ type: 'FormLayout' }, [node({ type: 'FormRow' }, [eh('Ada')]), field('x')]))]), 'Ada')
  assert.equal(lifted([node({ type: 'FoldoutLayout' }, [eh('Ada'), card(field('x'))])]), 'Ada')
  // a collection's detail next to its list (CollectionDetail): the selected item's, not the page's
  assert.equal(lifted([card(field('search'), grid(node({ type: 'VerticalLayout' }, [field('list')]), node({ type: 'VerticalLayout' }, [eh('Bruno')])))]), null)
  // a task card under a planning chart (GanttPage's detail card) / its docked drawer / a dialog
  assert.equal(lifted([node({ type: 'Gantt', tasks: [] }), node({ type: 'Card', id: 'gantt-detail', content: eh('Task') })]), null)
  assert.equal(lifted([node({ type: 'Drawer', content: eh('Task') }), field('x')]), null)
  assert.equal(lifted([node({ type: 'Dialog', content: eh('Task') })]), null)
  // a console's panel (MasterDetailLayout / SplitLayout), as before
  assert.equal(lifted([node({ type: 'MasterDetailLayout' }, [eh('Guest')])]), null)
  // and the content keeps the one it does not lift
  const blocks = hostContentOf(host(page({}, [field('search'), eh('Bruno')])), null, { dropEntityHeader: false })
  assert.ok(blocks.some((b) => b.items.some((a) => a.isEntityHeader && a.title === 'Bruno')))
})

test('fact action: the projection carries the icon button; a display-only fact stays {label, value}', () => {
  const [plain, company] = entityHeaderOf(host(stayPage())).facts
  assert.deepEqual(plain, { label: 'TOTAL RESERVA', value: '€ 4.890,00' })
  assert.deepEqual(company, {
    label: 'EMPRESA', value: 'Acme Corporation Ltd', hasAction: true, actionId: 'changeCompany',
    parameters: { stayId: 'S-1' }, actionLabel: 'Cambiar empresa', iconClass: 'oj-ux-ico-edit',
  })
  // no label of its own → the fact's; no icon → the pencil
  assert.deepEqual(factProjectionOf({ label: 'EMPRESA', value: 'x', actionId: 'go' }, 'x'),
    { label: 'EMPRESA', value: 'x', hasAction: true, actionId: 'go', parameters: undefined, actionLabel: 'EMPRESA', iconClass: 'oj-ux-ico-edit' })
})

test('fact action hoisted into the page header: oj-sp gets {label, value}, the action rides as factActions', () => {
  const ctx = host(stayPage())
  const h = headerOf(ctx, { hostEntity: entityHeaderOf(ctx) })
  assert.deepEqual(h.facts, [
    { label: 'TOTAL RESERVA', value: '€ 4.890,00' }, { label: 'EMPRESA', value: 'Acme Corporation Ltd' },
  ])
  assert.deepEqual(JSON.parse(h.factActions), [
    { index: 1, actionId: 'changeCompany', parameters: { stayId: 'S-1' }, label: 'Cambiar empresa', iconClass: 'oj-ux-ico-edit' },
  ])
  // nothing acts → no attribute at all
  assert.equal(headerOf(host(page({ kpis: [{ title: 'Total', text: '3' }] }))).factActions, '')
  assert.equal(factActionsJsonOf([{ label: 'a', value: 'b' }]), '')
})

test('fact action in the content: the EntityHeader atom keeps it on its fact, and a nested island marks it', () => {
  const atom = islandContentOf(host(stayPage())).flatMap((b) => b.items).find((a) => a.isEntityHeader)
  assert.equal(atom.facts[0].hasAction, undefined)
  assert.equal(atom.facts[1].actionId, 'changeCompany')
  assert.equal(atom.facts[1].iconClass, 'oj-ux-ico-edit')
  // merged from a nested island: its action goes back to the island's context, like its buttons
  const merged = mergeNestedContent([{ isNestedBlock: true, items: [] }], [{ items: [atom] }])
  const [plain, company] = merged[0].items[0].facts
  assert.equal(plain.fromNested, undefined)
  assert.equal(company.fromNested, true)
})

test('fact action wiring: every oj-sp header with contextualInfo carries the actions; the atom button dispatches like a button', () => {
  const html = webApp('flows/main/pages/main-start-page.html')
  assert.equal((html.match(/:data-mateu-fact-actions="\[\[ \$application\.variables\.mateuPageHeader\.factActions \|\| null \]\]"/g) || []).length, 5)
  assert.equal((html.match(/:data-mateu-fact-actions="\[\[ \$application\.variables\.mateuOverview\.factActions \|\| null \]\]"/g) || []).length, 1)
  // (the two create/edit headers, oj-sp-header-create-edit, are two of them)
  assert.equal((html.match(/contextual-info=/g) || []).length, 6)
  // the content atom: an oj-button after the value, through the block's own listener
  const atoms = readFileSync(join(here, 'templates', 'atoms.html'), 'utf8')
  const piece = atoms.slice(atoms.indexOf('isEntityHeader'), atoms.indexOf('isNotice'))
  assert.match(piece, /mateu-fact-action-button[\s\S]*:data-action-id="\[\[ \$current\.data\.actionId \]\]"[\s\S]*on-oj-action="\[\[ \$listeners\.\{\{blockAction\}\} \]\]"/)
  // the shell installs the header buttons and runs them on the page's action channel
  const boot = webApp('pages/shell-page-chains/loadMateuShell.js')
  assert.match(boot, /bridge\.installFactActions\(\);\s*bridge\.setFactActionSink\(runPageAction\);/)
  assert.equal(JSON.parse(webApp('app-flow.json')).variables.mateuPageHeader.defaultValue.factActions, '')
})

// ── a form in an overlay keeps its layout (wire captured from the Java core: a Drawer/Dialog of
//    width 72rem with an EmbeddedView of a form whose first field is @Section(columns = 4,
//    frameless = true) and a TitleSupplier title; and plain FormFields in a HorizontalLayout row
//    and a FormLayout.maxColumns(4)) ─────────────────────────────────────────────────────────

const overlayFrom = (name) => overlayOf(reduceContexts(empty(), JSON.parse(readFileSync(join(here, 'fixtures', 'patterns', name + '.json'), 'utf8'))))

test('overlay: an embedded form keeps its section columns and the drawer its width; the title shows once', () => {
  const ov = overlayFrom('overlay-drawer')
  assert.equal(ov.width, '72rem')
  assert.equal(ov.title, 'Empresa')
  assert.deepEqual(ov.sections.map((s) => [s.columns, s.fields.length]), [[4, 8]])
  // the form's own heading repeated the drawer's title
  assert.ok(!ov.content.some((b) => b.items.some((a) => a.isText && a.text === 'Empresa')))
})

test('overlay: a Dialog keeps its width and columns, and does not repeat its title as a text line', () => {
  const ov = overlayFrom('overlay-dialog')
  assert.equal(ov.isDialog, true)
  assert.equal(ov.width, '72rem')
  assert.deepEqual(ov.sections.map((s) => s.columns), [4])
  assert.ok(!ov.texts.includes('Empresa'))
})

test('overlay: plain fields keep their HorizontalLayout row and their FormLayout maxColumns', () => {
  const ov = overlayFrom('overlay-plain')
  assert.deepEqual(ov.sections.map((s) => [s.columns, s.fields.map((f) => f.fieldId)]), [[2, ['a', 'b']], [4, ['c', 'd', 'e']]])
})

test('overlay templates: the drawer and the dialog bind each group\'s columns, the dialog its width', () => {
  const html = webApp('flows/main/pages/main-start-page.html')
  assert.ok(!/<oj-form-layout max-columns="1" direction="row">/.test(html), 'no overlay form forced to one column')
  for (const id of ['mateuModal', 'mateuDrawerPanel']) {
    const at = html.indexOf(`id="${id}"`)
    const piece = html.slice(at, html.indexOf(id === 'mateuModal' ? '</oj-dialog>' : '</oj-drawer-popup>', at))
    assert.match(piece, /<oj-form-layout class="oj-formlayout-full-width" max-columns="\[\[ \$current\.data\.columns \]\]" direction="row">/, id)
  }
  const modal = html.slice(html.indexOf('<oj-dialog id="mateuModal"'), html.indexOf('slot="header"', html.indexOf('<oj-dialog id="mateuModal"')))
  // the modal reads the DIALOG projection (mateuDialog), never the drawer's: a Dialog opened over a
  // Drawer shows in the modal while the drawer panel keeps showing the drawer
  assert.match(modal, /:style\.width="\[\[ \$application\.variables\.mateuDialog\.width \|\| null \]\]"/)
  const modalAll = html.slice(html.indexOf('<oj-dialog id="mateuModal"'), html.indexOf('</oj-dialog>', html.indexOf('<oj-dialog id="mateuModal"')))
  assert.ok(!/variables\.mateuDrawer\./.test(modalAll), 'nothing in the modal binds the drawer variable')
})

console.log(`\n${passed} pattern-gap tests OK`)

test('an EntityHeader fact with an action is header chrome, not a page button (no «BALANCE» row under the content)', () => {
  const tree = {
    type: 'ClientSide', metadata: { type: 'Form' }, children: [
      { type: 'ClientSide', metadata: { type: 'EntityHeader', title: 'Charlotte Wilson', facts: [
        { label: 'BALANCE', value: '€ 719,50', actionId: 'abrirCaja', icon: 'vaadin:money', actionLabel: 'Caja' },
        { label: 'PREAUTORIZADO', value: '€ 679,50' },
      ] } },
      { type: 'ClientSide', metadata: { type: 'Button', label: 'Check-out', actionId: 'checkout' } },
    ],
  }
  assert.deepEqual(actionsOf(tree).map((a) => a.actionId), ['checkout'])
})

test('foldout: content in place for the same structure; panel count or orientation changes remount', () => {
  const one = { panels: [{}], orientation: 'vertical', overview: { blocks: [1] }, header: { back: true } }
  assert.equal(sameFoldoutStructure(one, { ...one, overview: { blocks: [2] } }), true)
  assert.equal(sameFoldoutStructure(one, { ...one, panels: [{}, {}] }), false)
  assert.equal(sameFoldoutStructure(one, { ...one, orientation: 'horizontal' }), false)
  assert.equal(sameFoldoutStructure(null, one), false)
  assert.deepEqual(foldoutContentOf(one), { overview: { blocks: [1] }, panels: [{}], header: { back: true } })
  assert.deepEqual(foldoutContentOf(null), { overview: { blocks: [] }, panels: [], header: {} })
})

// ── Spectra drawer templates (#6 general, #7 create-edit, #8 bottom) ─────────────────────────────

const openDrawer = (md, children = [], id = 'd1', initialData = {}) => reduceContexts(
  { contexts: { [HOST_ID]: host(node({ type: 'VerticalLayout' }, [])) }, stack: [], shell: null },
  { commands: [], messages: [], fragments: [{ action: 'Add', targetComponentId: HOST_ID, component: node({ type: 'Drawer', ...md, initialData }, children, id) }] })

test('spectra drawer: a read-only Drawer is the GENERAL template — size, maximize, peers, close', () => {
  const ov = overlayOf(openDrawer({ headerTitle: 'Ada Lovelace', subtitle: 'Employee #100', size: 'l', maximizable: true,
    peerNav: { prevLabel: null, prevRoute: null, nextLabel: 'Alan Turing', nextRoute: '/people/2' } },
  [node({ type: 'Text', text: 'Read-only details' })]))
  assert.equal(ov.sp.template, 'general')
  assert.equal(ov.sp.size, 'lg')
  assert.deepEqual(ov.sp.displayOptions, { maximize: 'on' })
  assert.deepEqual(ov.sp.closeAction, { display: 'on' }, 'the close icon the guide requires')
  assert.deepEqual(ov.sp.nextItem, { id: '/people/2', label: 'Alan Turing', display: 'on' })
  assert.deepEqual(ov.sp.previousItem, { id: '-', label: '', display: 'disabled' }, 'a side without route is disabled')
  assert.equal(ov.sp.edge, 'end')
  assert.equal(ov.sp.modality, 'modal')
  assert.equal(ov.subtitle, 'Employee #100')
})

test('spectra drawer: sizes — DrawerSize wins, else the nearest standard size to the width', () => {
  assert.deepEqual(['s', 'm', 'l', 'xl'].map((x) => spectraDrawerSize(x)), ['sm', 'md', 'lg', 'xl'])
  assert.equal(spectraDrawerSize(null, null), 'sm')
  assert.equal(spectraDrawerSize(null, '26rem'), 'sm')
  assert.equal(spectraDrawerSize(null, '36rem'), 'md', "the crud's editDrawerWidth()")
  assert.equal(spectraDrawerSize(null, '60rem'), 'lg')
  assert.equal(spectraDrawerSize(null, '90vw'), 'xl')
  assert.equal(spectraDrawerSize('m', '90vw'), 'md')
  assert.deepEqual(spectraPeersOf(null), { previousItem: null, nextItem: null })
})

test('spectra drawer: a general drawer\'s actions go to its footer — primary + up to two secondaries', () => {
  const ov = overlayOf(openDrawer({ headerTitle: 'Order' }, [node({ type: 'Text', text: 'x' }),
    node({ type: 'Button', label: 'Print', actionId: 'print' }), node({ type: 'Button', label: 'Open', actionId: 'open', buttonStyle: 'primary' })]))
  assert.equal(ov.sp.template, 'general')
  assert.deepEqual(ov.sp.primaryAction, { label: 'Open', display: 'on' })
  assert.equal(ov.sp.primaryActionId, 'open')
  assert.deepEqual(ov.sp.secondaryActions, [{ id: 'print', label: 'Print', display: 'on' }])
  assert.deepEqual(ov.sp.footerActions, [], 'the template holds them: no bar of our own')
})

// the crud's drawer as CrudDrawerBuilder sends it: its form is a ServerSide of its own in Drawer.content
const crudDrawer = (extra = [], initialData = { id: '2', name: 'Grace' }, buttons = null) => openDrawer({ id: 'crud-edit-drawer', headerTitle: 'Edit', width: '36rem',
  content: { type: 'ServerSide', id: 'crud-edit-drawer-form', serverSideType: 'com.acme.Contact', initialData, actions: [], children: [
    ...extra,
    node({ type: 'FormField', fieldId: 'name', dataType: 'string', label: 'Name' }),
    ...(buttons || [node({ type: 'Button', label: 'Cancel', actionId: 'cancel-edit' }), node({ type: 'Button', label: 'Save', actionId: 'save', buttonStyle: 'primary' })]),
  ] } }, [], 'crud-edit-drawer', initialData)

test('spectra drawer: the crud\'s drawer is the CREATE-EDIT template — Cancel is its own, Save its primary', () => {
  const ov = overlayOf(crudDrawer())
  assert.equal(ov.sp.template, 'createEdit')
  assert.equal(ov.sp.size, 'md')
  assert.equal(ov.sp.cancelActionId, 'cancel-edit')
  assert.equal(ov.sp.primaryActionId, 'save')
  assert.deepEqual(ov.sp.primaryAction, { label: 'Save', display: 'on' })
  assert.equal(ov.sp.hasNavigation, false)
  assert.equal(ov.sp.nextItem, null)
  assert.deepEqual(ov.sp.footerActions, [])
})

test('spectra drawer: «Save and next» opens the template\'s navigation footer; the listing rows give the arrows', () => {
  const ov = overlayOf(crudDrawer([], { id: '2', name: 'Grace' }, [
    node({ type: 'Button', label: 'Cancel', actionId: 'cancel-edit' }),
    node({ type: 'Button', label: 'Save and next', actionId: 'save-and-next' }),
    node({ type: 'Button', label: 'Save', actionId: 'save', buttonStyle: 'primary' }),
  ]))
  assert.equal(ov.sp.saveAndNextActionId, 'save-and-next')
  assert.deepEqual(ov.sp.nextItem, { label: 'Save and next', display: 'on' }, 'no id: no header arrow, only the footer')
  assert.equal(ov.sp.hasNavigation, true)
  const rows = [{ id: '1', name: 'Ada', _rowNumber: 0 }, { id: '2', name: 'Grace', _rowNumber: 1 }, { id: '3', name: 'Margaret', _rowNumber: 2 }]
  const walked = withListingPeers(ov, rows)
  assert.deepEqual(walked.sp.previousItem, { id: '1', label: 'Ada', display: 'on' })
  assert.deepEqual(walked.sp.nextItem, { id: '3', label: 'Margaret', display: 'on' })
  assert.equal(walked.sp.listingPeers, true)
  // the last row: no next (the template then says «Save and close»)
  const last = withListingPeers({ ...ov, state: { id: '3' } }, rows)
  assert.equal(last.sp.nextItem.display, 'disabled')
  // a record not on this page, a drawer without «Save and next»: untouched
  const away = { ...ov, state: { id: '9' } }
  assert.equal(withListingPeers(away, rows), away)
  const plain = overlayOf(crudDrawer())
  assert.equal(withListingPeers(plain, rows), plain)
})

test('spectra drawer: a refused save shows the TEMPLATE\'s error banner (the crud\'s danger Notice leaves the content)', () => {
  const ov = overlayOf(crudDrawer([node({ type: 'Notice', theme: 'danger', text: 'Name is taken', fullWidth: true }, [], 'crud-drawer-error')]))
  assert.equal(ov.sp.errorBanner, true)
  assert.equal(ov.sp.errorMessage, 'Name is taken')
  assert.ok(!ov.content.some((b) => b.items.some((a) => a.isNotice)), 'not drawn twice')
})

test('spectra drawer: a hand-built drawer with a form and an action is create-edit; without fields it is general', () => {
  const op = overlayOf(openDrawer({ headerTitle: 'Payment' }, [node({ type: 'FormField', fieldId: 'amount', dataType: 'number', label: 'Amount' }),
    node({ type: 'Button', label: 'Charge', actionId: 'charge' })]))
  assert.equal(op.sp.template, 'createEdit')
  assert.equal(op.sp.primaryActionId, 'charge')
  assert.equal(op.sp.cancelActionId, '', 'no cancel on the wire: the template\'s Cancel just closes')
})

test('spectra drawer: DrawerPosition.bottom is the BOTTOM template, docked at the bottom; collapsible = fixed mode', () => {
  const closable = overlayOf(openDrawer({ headerTitle: 'Lines', position: 'bottom' }, [node({ type: 'Text', text: '3 lines' })]))
  assert.equal(closable.sp.template, 'bottom')
  assert.equal(closable.sp.edge, 'bottom', 'it used to open at the end edge')
  assert.deepEqual(closable.sp.bottomOptions, { drawerMode: 'closable', title: 'on', maximize: 'off' })
  assert.equal(closable.sp.modality, 'modal')
  const fixed = overlayOf(openDrawer({ headerTitle: 'Lines', position: 'bottom', collapsible: true, maximizable: true }, [node({ type: 'Text', text: '3 lines' })]))
  assert.deepEqual(fixed.sp.bottomOptions, { drawerMode: 'fixed', title: 'on', maximize: 'on' })
  assert.equal(fixed.sp.modality, 'modeless', 'docked: the page stays usable')
  assert.equal(fixed.sp.autoDismiss, 'none')
  const start = overlayOf(openDrawer({ headerTitle: 'Nav', position: 'start' }, []))
  assert.equal(start.sp.edge, 'start')
})

test('spectra drawer: unsaved changes = the draft differs from the values the drawer opened with', () => {
  const drawer = { state: { id: '2', name: 'Grace', phone: null } }
  assert.equal(drawerHasUnsavedChanges(drawer, {}), false)
  assert.equal(drawerHasUnsavedChanges(drawer, { name: 'Grace' }), false)
  assert.equal(drawerHasUnsavedChanges(drawer, { phone: '' }), false, 'blank stays blank')
  assert.equal(drawerHasUnsavedChanges(drawer, { name: 'Grace B.' }), true)
  assert.equal(drawerHasUnsavedChanges(null, { a: 1 }), false)
})

test('spectra drawer: the guard holds Esc / a click outside while unsaved, and hands it to the page', () => {
  const listeners = []
  const doc = { addEventListener: (type, fn, capture) => listeners.push({ type, fn, capture }) }
  installDrawerGuard(doc)
  installDrawerGuard(doc)
  assert.equal(listeners.length, 1, 'installed once')
  assert.equal(listeners[0].type, 'ojBeforeClose')
  assert.equal(listeners[0].capture, true, 'synchronously, before the popup closes')
  const dispatched = []
  const panel = { id: 'mateuDrawerPanel', dispatchEvent: (e) => dispatched.push(e.type) }
  const event = () => ({ target: panel, prevented: false, stopped: false, preventDefault() { this.prevented = true }, stopPropagation() { this.stopped = true } })
  noteDrawerUnsaved(false)
  const free = event(); listeners[0].fn(free)
  assert.equal(free.prevented, false)
  noteDrawerUnsaved(true)
  assert.equal(isDrawerUnsaved(), true)
  const held = event(); listeners[0].fn(held)
  assert.equal(held.prevented, true)
  assert.equal(held.stopped, true, 'the page\'s ojBeforeClose listener (which drops the overlay) never hears it')
  assert.deepEqual(dispatched, ['mateuDrawerLeave'])
  const other = { target: { id: 'mateuRowDetailPanel' }, prevented: false, preventDefault() { this.prevented = true } }
  listeners[0].fn(other)
  assert.equal(other.prevented, false, 'only the drawer panel')
  noteDrawerUnsaved(false)
})

test('spectra drawer: the panel paints the three templates around ONE generated body, wired to its chain', () => {
  const html = webApp('flows/main/pages/main-start-page.html')
  const at = html.indexOf('<oj-drawer-popup id="mateuDrawerPanel"')
  const panel = html.slice(at, html.indexOf('</oj-drawer-popup>', at))
  for (const tag of ['<oj-sp-general-drawer-template', '<oj-sp-create-edit-drawer-template', '<oj-sp-bottom-drawer-template'])
    assert.equal(panel.split(tag).length - 1, 1, tag)
  assert.equal((panel.match(/<!-- @drawer-body \w+ -->/g) || []).length, 3)
  assert.match(panel, /edge="\[\[ \$application\.variables\.mateuDrawer\.sp\.edge \|\| 'end' \]\]"/)
  assert.match(panel, /drawer-state="\{\{ \$variables\.mateuDrawerState \}\}"/)
  assert.match(panel, /on-mateu-drawer-leave="\[\[ \$listeners\.mateuDrawerLeaveRequested \]\]"/)
  assert.match(panel, /class="oj-sp-bottom-drawer-template-height-provider/)
  // our unsaved-changes banner (a template without navigation) must exist BEFORE the leave: Spectra's
  // banner only paints on a visible false → true change, so one an oj-bind-if creates already
  // visible stays 0 px high and the Cancel of a dirty «New» drawer looked dead
  const banners = panel.match(/<oj-bind-if test="[^"]*">\s*<oj-sp-message-banner-unsaved-changes/g) || []
  assert.equal(banners.length, 3)
  for (const b of banners) assert.doesNotMatch(b, /mateuDrawerLeaving/)
  assert.match(panel, /<oj-sp-message-banner-unsaved-changes[^>]*visible="\[\[ !!\$variables\.mateuDrawerLeaving \]\]"/)
  const page = JSON.parse(webApp('flows/main/pages/main-start-page.json'))
  for (const c of ['oj-sp-general-drawer-template', 'oj-sp-create-edit-drawer-template', 'oj-sp-bottom-drawer-template', 'oj-sp-message-banner-unsaved-changes'])
    assert.ok(page.imports.components[c], c)
  for (const l of ['mateuDrawerLeaveRequested', 'mateuDrawerPrevious', 'mateuDrawerNext', 'mateuDrawerPrimary', 'mateuDrawerSecondary',
    'mateuDrawerCancel', 'mateuDrawerPrimaryAndNext', 'mateuDrawerDiscard', 'mateuDrawerKeepEditing', 'mateuDrawerStateChanged']) {
    assert.ok(page.eventListeners[l], l)
    assert.equal(page.eventListeners[l].chains[0].chain, 'mateuDrawerTemplateAction', l)
  }
  for (const name of ['installDrawerGuard', 'noteDrawerUnsaved', 'drawerHasUnsavedChanges', 'withListingPeers'])
    assert.ok(webApp('resources/js/mateu-bridge.js').includes('    ' + name + ',\n'), name)
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.installDrawerGuard\(\)/)
})
