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
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  reduceContexts, HOST_ID, overlayOf, foldoutOf, welcomeOf, welcomeLookOf, welcomeToneLookOf, listingOf,
  pageSwitcherOf, switcherPickOf, actionsOf, islandContentOf, kidsInAreaOrder, setPanelExpanded,
} from './reduceContexts.mjs'
import { pageHeaderOf, listHeaderVarsOf, archetypeVarsOf } from './pageProjection.mjs'
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
  assert.match(html, /<div slot="summary"[^>]*><oj-bind-text value="\[\[ \(\$application\.variables\.mateuFoldoutContent\.panels\[\$current\.index\] \|\| \$current\.data\)\.summary \]\]">/)
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
  const folded = (islandContentOf({ tree: node({ type: 'VerticalLayout' }, [tabs]), state: {}, data: {} }) || [])
    .flatMap((b) => b.items || []).filter((a) => a.isText).map((a) => a.text)
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

console.log(`\n${passed} pattern-gap tests OK`)
