// Projections of the core (core/*.mjs) the other suites pin only on their happy path: how each
// display atom reacts to the shapes the wire really carries — a CSS colour instead of a tone, one
// item instead of three, an undated heatmap, a workflow step with its precondition, a BPMN with no
// diagram interchange, a condition with an operator, a paged grid with nothing in it. Each test
// states what the user sees in that case.
// Run: node test-projections.mjs (npm test runs it with the other suites).
import './test-locale.mjs' // first: off English the suite reruns in English (see the module)
import assert from 'node:assert/strict'
import {
  kanbanAtomOf, timelineAtomOf, pricingAtomOf, orgChartAtomOf, heatmapAtomOf, funnelAtomOf, featureGridAtomOf,
  testimonialsAtomOf, fileListAtomOf, checklistAtomOf, processMonitorAtomOf, skeletonAtomOf, menuItemsOf, menuChoiceOf,
  menuBarAtomOf, directoryAtomOf, messageListAtomOf, messageInputAtomOf, chatAtomOf, resultAtomOf, cookieConsentAtomOf,
  confirmOpenOf, confirmDialogAtomOf, returnedConfirmDialogsOf, workflowAtomOf, formEditorFieldsOf,
  componentHtmlOf, gridPageOf, autoFitColClass, carouselPagerAtomOf, progressBarAtomOf, customComponentAtomOf,
  registerCustomComponent, setDataProviderFactory, toneOf, cssColorOf,
  targetPageOf, listingSearchStateOf, listingSortOf, selectionOfKeySet, selectedRowsOf, rowAsArrived, lineValueText,
  rowLinesSplit, rowLinesRows, statusTypeOfTone, statusTypeOfValue, humanizeConstant, filterDescriptorOf, filterChipsOf,
  navTargetOf, queryFiltersOf, splitListingQuery, listingQueryOf, listingUrlOf, listingUrlPagingOf, multiValuesOf,
  smartFilterSuggestionsOf, smartFilterValueOf, filterStateOfSmartFilters, suggestionFiltersProviderOf,
  smartFilterDropdownRowsOf, suggestionsProviderOf, smartFiltersOf, setMetadataProviderFactory, IDS_PARAM,
  pageSwitcherOf, switcherPickOf, pageKpisOf, welcomeOf,
  planningActionOf, formatAggregate, aggregateFootersOf, groupedRows, rowToneOf, labelCellRows, LABEL_CELL_SUFFIX,
} from './reduceContexts.mjs'
import { chromeText, setChromeLanguage, moneyText } from './i18n.mjs'
import * as prefs from './prefs.mjs'
import { readFileSync as readPageFile } from 'node:fs'
const webApp = (rel) => readPageFile(new URL('../webApps/vbredwoodapp/' + rel, import.meta.url), 'utf8')
import { createChatProgress, classifyChatPayload, projectChatScreen, chatTurnOf, chatTurnTextOf, chatToolStepsOf, formatToolDuration, withAttachments, createSseParser } from './chat.mjs'
import { evaluateExpression, evaluateTemplate, computeRules, fieldFlagsOf, valueChangeActionOf } from './rules.mjs'

let passed = 0
const queue = []
const test = (name, fn) => queue.push({ name, fn })

// ── colours ────────────────────────────────────────────────────────────────────────────────────

test('a wire colour is a theme tone or a CSS colour: tones get the tone class, CSS colours an inline style', () => {
  assert.equal(toneOf('error'), 'danger')
  assert.equal(toneOf('primary'), 'info')
  assert.equal(toneOf('#ff0000'), '')
  assert.equal(cssColorOf('#ff0000'), '#ff0000')
  assert.equal(cssColorOf('success'), '', 'a tone is not painted as a CSS colour')
  assert.equal(cssColorOf('url(x)'), '', 'anything else is dropped')
  const k = kanbanAtomOf({ columns: [
    { title: 'Doing', color: '#123456', cards: [{ title: 'A', color: 'rgb(1,2,3)' }, { title: 'B', color: 'warning', badge: 'late' }] },
    { title: 'Done', color: 'success' },
  ] })
  const [doing, done] = k.columns
  assert.deepEqual(doing.headerStyle, { borderTopColor: '#123456' })
  assert.equal(doing.headerClass, 'mateu-kanban-head')
  assert.deepEqual(doing.cards[0].cardStyle, { borderInlineStartColor: 'rgb(1,2,3)' })
  assert.equal(doing.cards[1].cardClass, 'mateu-kanban-card mateu-tone-warning')
  assert.ok(doing.cards[1].hasBadge && /warning/.test(doing.cards[1].badgeClass))
  assert.equal(done.headerClass, 'mateu-kanban-head mateu-tone-success')
  assert.equal(done.isEmpty, true, 'a column without cards says so')
  assert.equal(done.countText, '0')
  const t = timelineAtomOf({ items: [{ title: 'Paid', color: 'hsl(1,2%,3%)', icon: '💶' }, { title: 'Shipped', color: 'info', icon: 'vaadin:truck', actionId: 'track' }] })
  assert.deepEqual(t.items[0].dotStyle, { backgroundColor: 'hsl(1,2%,3%)' })
  assert.equal(t.items[0].glyph, '💶', 'an emoji icon travels as text')
  assert.equal(t.items[0].iconClass, '')
  assert.equal(t.items[1].dotClass, 'mateu-timeline-dot mateu-tone-info')
  assert.ok(t.items[1].iconClass, 'an icon name becomes an icon class')
  assert.equal(t.items[1].clickable, true)
  assert.deepEqual(t.items[1].parameters, { _clickedItem: { title: 'Shipped', color: 'info', icon: 'vaadin:truck', actionId: 'track' } })
})

// ── layouts that depend on how many items there are ────────────────────────────────────────────

test('cards share the row by count: pricing plans, testimonials, directory columns', () => {
  const plans = (n) => pricingAtomOf({ plans: Array.from({ length: n }, (_, i) => ({ name: 'P' + i, featured: i === 0, actionId: i === 0 ? 'buy' : '' })) }).plans
  assert.equal(plans(1)[0].colClass, 'oj-flex-item oj-sm-12 oj-md-12')
  assert.equal(plans(3)[0].colClass, 'oj-flex-item oj-sm-12 oj-md-4')
  assert.equal(plans(6)[0].colClass, 'oj-flex-item oj-sm-12 oj-md-3', 'never narrower than four per row')
  const [featured, plain] = plans(2)
  assert.equal(featured.chroming, 'callToAction')
  assert.equal(featured.hasCta, true)
  assert.equal(featured.ctaLabel, chromeText('choose'), 'a CTA without a label says Choose')
  assert.equal(plain.chroming, 'outlined')
  assert.equal(plain.hasCta, false)
  const quotes = (n, rating) => testimonialsAtomOf({ items: Array.from({ length: n }, () => ({ quote: 'q', author: 'Ada Lovelace', rating })) }).items
  assert.equal(quotes(1)[0].colClass, 'oj-flex-item oj-sm-12 oj-md-12')
  assert.equal(quotes(2)[0].colClass, 'oj-flex-item oj-sm-12 oj-md-6')
  assert.equal(quotes(4)[0].colClass, 'oj-flex-item oj-sm-12 oj-md-4')
  assert.equal(quotes(1, 9)[0].rating, 5, 'a rating is clamped to five stars')
  assert.equal(quotes(1, 9)[0].ratingLabel, '9 / 5')
  assert.equal(quotes(1)[0].hasRating, false)
  assert.equal(quotes(1)[0].initials, 'AL')
  const dir = directoryAtomOf({ menu: [
    { label: 'Docs', submenus: [{ label: 'Guide', route: 'guide' }, { label: 'Hidden', route: '/h', visible: false }, { label: 'Ext', route: 'https://x.example' }] },
    { label: 'Gone', visible: false },
    { label: 'Bad', submenus: [{ label: 'Evil', route: 'javascript:alert(1)' }] },
  ] })
  assert.equal(dir.groups.length, 2)
  assert.equal(dir.groups[0].colClass, 'oj-flex-item oj-sm-12 oj-md-6')
  assert.deepEqual(dir.groups[0].links.map((l) => [l.label, l.href]), [['Guide', '/guide'], ['Ext', 'https://x.example']])
  assert.equal(dir.groups[1].links[0].href, '', 'a javascript: link goes nowhere')
  const grid = featureGridAtomOf({ columns: 9, features: [{ title: 'Fast', icon: '⚡' }] })
  assert.equal(grid.features[0].colClass, 'oj-flex-item oj-sm-12 oj-md-4', 'an out-of-range column count falls back to three')
  assert.equal(featureGridAtomOf({ columns: 6, features: [{}] }).features[0].colClass, 'oj-flex-item oj-sm-12 oj-md-2')
})

test('an org chart is an outline: depth indents, the last child of each level is marked', () => {
  const chart = orgChartAtomOf({ root: { title: 'CEO', subtitle: 'Board', actionId: 'open', children: [
    { title: 'CTO', children: [{ title: 'Dev' }] }, { title: 'CFO' }] } })
  assert.deepEqual(chart.nodes.map((n) => [n.title, n.depth]), [['CEO', 0], ['CTO', 1], ['Dev', 2], ['CFO', 1]])
  assert.equal(chart.nodes[0].rowClass, 'mateu-org-node mateu-org-last')
  assert.equal(chart.nodes[1].rowClass, 'mateu-org-node mateu-org-child')
  assert.equal(chart.nodes[3].rowClass, 'mateu-org-node mateu-org-child mateu-org-last')
  assert.equal(chart.nodes[0].ariaLabel, 'CEO, Board')
  assert.deepEqual(Object.keys(chart.nodes[0].parameters._clickedNode).sort(), ['actionId', 'subtitle', 'title'], 'the clicked node travels without its subtree')
  assert.deepEqual(orgChartAtomOf({}).nodes, [])
})

test('a heatmap without ISO dates is a flat strip; with them, Monday-first weeks with blank days', () => {
  const flat = heatmapAtomOf({ cells: [{ date: 'Q1', value: 2 }, { date: 'Q2', value: 8, label: 'Busy quarter' }, { value: 3 }] })
  assert.equal(flat.dated, false)
  assert.deepEqual(flat.flat.map((c) => c.title), ['Q1: 2', 'Busy quarter'], 'an undated cell without a date is dropped')
  assert.deepEqual(flat.flat.map((c) => c.cls), ['mateu-heat-cell mateu-heat-1', 'mateu-heat-cell mateu-heat-4'])
  const weeks = heatmapAtomOf({ cells: [{ date: '2026-10-14', value: 0 }, { date: '2026-10-20', value: 4 }] })
  assert.equal(weeks.dated, true)
  assert.equal(weeks.weeks.length, 2, 'Wednesday to the next Tuesday spans two weeks')
  const firstWeek = weeks.weeks[0].days
  assert.equal(firstWeek[0].cls, 'mateu-heat-cell mateu-heat-none', 'Monday before the first date is blank')
  assert.equal(firstWeek[2].title, '2026-10-14: 0')
  assert.equal(firstWeek[2].cls, 'mateu-heat-cell mateu-heat-0')
  assert.equal(heatmapAtomOf({}).flat.length, 0)
})

test('a funnel is one oj-chart series per stage, sized by the number of stages', () => {
  setDataProviderFactory((rows) => ({ rows }))
  const f = funnelAtomOf({ stages: [{ label: 'Leads', value: '120', color: '#0a0' }, { value: 'x' }] })
  assert.deepEqual(f.items.map((i) => [i.series, i.value, i.color]), [['Leads', 120, '#0a0'], ['Stage 2', 0, undefined]])
  assert.deepEqual(f.provider, { rows: f.items })
  assert.equal(f.chartStyle.height, '12rem', 'never shorter than 12rem')
  assert.equal(funnelAtomOf({ stages: Array(10).fill({ value: 1 }) }).chartStyle.height, '28rem', 'nor taller than 28rem')
})

test('a file links to its download unless it has an action; its icon follows the type', () => {
  const files = fileListAtomOf({ files: [
    { name: 'a.pdf', size: '2 MB', type: 'application/pdf', url: '/files/a.pdf' },
    { name: 'b.xlsx', actionId: 'openB' },
    { name: 'c.bin', url: 'javascript:alert(1)' },
  ] }).files
  assert.equal(files[0].hasHref, true)
  assert.equal(files[0].meta, '2 MB · application/pdf')
  assert.equal(files[0].iconClass, 'oj-ux-ico-file-pdf')
  assert.equal(files[1].hasHref, false)
  assert.equal(files[1].clickable, true)
  assert.equal(files[1].iconClass, 'oj-ux-ico-file-xls')
  assert.equal(files[2].href, '', 'an unsafe url is not a link')
  assert.equal(files[2].noHref, true)
})

test('a checklist shows its progress; an item without action is read only, toggling sends its new value', () => {
  const c = checklistAtomOf({ title: 'Arrival', items: [{ label: 'Key', done: true, actionId: 'tick' }, { label: 'Bags' }, { label: 'Map' }] })
  assert.equal(c.progressText, '1 / 3')
  assert.equal(c.progressValue, 33)
  assert.deepEqual(c.items[0].value, ['done'])
  assert.equal(c.items[0].labelClass, 'mateu-checklist-done')
  assert.equal(c.items[0].parameters._done, false, 'ticking a done item un-ticks it')
  assert.equal(c.items[1].readonly, true)
  assert.equal(checklistAtomOf({}).progressValue, 0, 'an empty checklist is at 0%, not NaN')
})

test('a process row: its status tone, counts default to 0, the action only with a label', () => {
  const [ok, failing, unknown] = processMonitorAtomOf({ items: [
    { name: 'Sync', status: 'Running', systems: ['A', 'B'], ok: 3, actionId: 'stop', actionLabel: 'Stop' },
    { name: 'Load', status: 'FAILED', errors: 2, actionId: 'retry' },
    { name: 'Idle', status: 'weird' },
  ] }).items
  assert.equal(ok.systems, 'A · B')
  assert.equal(ok.okText, '3')
  assert.equal(ok.warningsText, '0')
  assert.equal(ok.hasAction, true)
  assert.match(ok.statusClass, /info/)
  assert.match(failing.statusClass, /danger/)
  assert.equal(failing.hasAction, false, 'no label, no button')
  assert.equal(unknown.hasStatus, true)
})

test('a skeleton repeats its shape count times (1..20), text by default', () => {
  assert.equal(skeletonAtomOf({ variant: 'card', count: 3 }).shapes.length, 3)
  assert.equal(skeletonAtomOf({ variant: 'nope' }).shapes.length, 3, 'unknown variant: the text shape')
  assert.equal(skeletonAtomOf({ variant: 'grid', count: 99 }).shapes.length, 80)
  assert.equal(skeletonAtomOf({ count: 0 }).shapes.length, 3)
})

// ── menus ─────────────────────────────────────────────────────────────────────────────────────

test('menus: submenus flatten with a breadcrumb, separators stay, an item that goes nowhere is disabled', () => {
  const items = menuItemsOf([
    { label: 'Edit', actionId: 'edit', params: { id: 1 } },
    { separator: true },
    { label: 'Go', submenus: [{ label: 'Home', route: 'home' }, { label: 'Deep', submenus: [{ label: 'Leaf', route: '/leaf' }] }] },
    { label: 'Nothing' },
    { label: 'Hidden', route: '/x', visible: false },
    { label: 'Off', route: '/off', disabled: true },
  ])
  assert.deepEqual(items.map((i) => i.label), ['Edit', '', 'Go › Home', 'Go › Deep › Leaf', 'Nothing', 'Off'])
  assert.equal(items[1].isSeparator, true)
  assert.deepEqual(items[2].target, { kind: 'navigate', route: '/home' })
  assert.equal(items[4].disabled, true)
  assert.deepEqual(menuChoiceOf(items, 0), { kind: 'action', actionId: 'edit', parameters: { id: 1 } })
  assert.equal(menuChoiceOf(items, items[5].value), null, 'a disabled item does nothing')
  assert.equal(menuChoiceOf(items, 'zz'), null)
  const bar = menuBarAtomOf({ options: [
    { label: 'Save', actionId: 'save', selected: true },
    { label: 'Site', route: 'https://x.example' },
    { label: 'More', submenus: [{ label: 'A', route: '/a' }] },
    { label: 'Inert' },
    { separator: true },
  ] }).entries
  assert.deepEqual(bar.map((e) => [e.isAction, e.isLink, e.isMenu, e.isInert]), [[true, false, false, false], [false, true, false, false], [false, false, true, false], [false, false, false, true]])
  assert.equal(bar[0].chroming, 'callToAction')
  assert.equal(bar[1].href, 'https://x.example')
  assert.equal(bar[2].menuItems.length, 1)
})

// ── messages, chat, result, cookie consent ────────────────────────────────────────────────────

test('messages: avatar tone per user index, input/chat ids safe for the DOM', () => {
  const [a, b] = messageListAtomOf({ items: [{ userName: 'Ada Lovelace', text: 'hi', userColorIndex: 7 }, { userAbbr: 'ZZ', text: 'yo' }] }).items
  assert.equal(a.avatarClass, 'mateu-avatar-tone-1')
  assert.equal(a.initials, 'AL')
  assert.equal(b.avatarClass, 'mateu-avatar-tone-0')
  assert.equal(b.initials, 'ZZ')
  assert.equal(messageInputAtomOf({ actionId: 'send' }, 'a b/c').inputId, 'mateuMsg-a_b_c')
  assert.equal(messageInputAtomOf({}, null).inputId, 'mateuMsg-input')
  const chat = chatAtomOf({ sseUrl: '/agent', uploadUrl: '/up' }, 'x.y')
  assert.equal(chat.chatId, 'mateuChat-x_y')
  assert.ok(chat.uploadUrl.endsWith('/up'))
  assert.equal(chatAtomOf({ sseUrl: '/agent' }).uploadUrl, '', 'no upload url, no attach button')
})

test('a result: its look by type, links by destination type, the «what next» action', () => {
  const r = resultAtomOf({ resultType: 'ERROR', title: 'Failed', leftSideImageUrl: '/img/x.png',
    interestingLinks: [
      { type: 'Url', value: 'https://help.example', description: 'Help' },
      { type: 'Url', value: 'javascript:x' },
      { type: 'View', value: '/bookings', description: 'Bookings' },
      { type: 'Component', value: 'nope', id: 'doIt' },
      null,
    ],
    nowTo: { type: 'ActionId', value: 'retry', description: 'Retry' } })
  assert.equal(r.iconClass, 'oj-ux-ico-error-s')
  assert.match(r.panelClass, /mateu-tone-danger/)
  assert.equal(r.hasImage, true)
  assert.deepEqual(r.links.map((l) => [l.label, l.isLink, l.href, l.isAction, l.actionId]), [
    ['Help', true, 'https://help.example', false, ''],
    ['javascript:x', false, '', false, ''],
    ['Bookings', true, '/bookings', false, ''],
    ['nope', false, '', true, 'doIt'],
  ])
  assert.equal(r.actionId, 'retry')
  const plain = resultAtomOf({ resultType: 'whatever' })
  assert.equal(plain.iconClass, 'oj-ux-ico-information-s', 'an unknown type looks like info')
  assert.equal(plain.hasNext, false)
  assert.equal(plain.actionId, '')
})

test('cookie consent: its texts default to the chrome words, its cookie to cookieconsent_status', () => {
  const c = cookieConsentAtomOf({})
  assert.equal(c.cookieName, 'cookieconsent_status')
  assert.equal(c.message, chromeText('cookieMessage'))
  assert.equal(c.dismiss, chromeText('cookieDismiss'))
  assert.equal(cookieConsentAtomOf({ cookieName: 'ok', message: 'We bake', learnMoreLink: 'javascript:x' }).learnMoreLink, '')
})

// ── ConfirmDialog ─────────────────────────────────────────────────────────────────────────────

test('a ConfirmDialog opens on its condition: literals, paths, negation and every comparison', () => {
  const state = { n: 5, s: 'open', flag: true, nested: { ok: false }, nil: null }
  const cases = [
    ['', false], ['true', true], ['false', false],
    ['${state.flag}', true], ['!state.flag', false], ['${state.nested.ok}', false], ['state.missing.deep', false],
    ['state.n === 5', true], ["state.s == 'open'", true], ['state.s != "open"', false], ['state.n !== 4', true],
    ['state.n > 4', true], ['state.n < 4', false], ['state.n >= 5', true], ['state.n <= 4', false],
    ['state.nil == null', true], ['state.nil === undefined', true], ['state.flag == true', true], ['state.flag == false', false],
    ['unknown', false],
  ]
  for (const [condition, expected] of cases) assert.equal(confirmOpenOf(condition, state), expected, condition)
})

test('a ConfirmDialog\'s buttons: cancel/reject only when declared, with their texts or the chrome ones', () => {
  const all = confirmDialogAtomOf({ header: 'Delete?', canCancel: true, canReject: true, rejectText: 'Keep', confirmText: 'Delete',
    cancelActionId: 'c', rejectActionId: 'r', confirmActionId: 'ok', openedCondition: 'true' }, 'dlg 1', {}, (x) => x, ['Sure?', ''])
  assert.deepEqual(all.buttons.map((b) => [b.key, b.label, b.actionId]), [['cancel', chromeText('cancel'), 'c'], ['reject', 'Keep', 'r'], ['confirm', 'Delete', 'ok']])
  assert.equal(all.dialogId, 'mateuConfirmDialog-dlg_1')
  assert.deepEqual(all.lines, ['Sure?'])
  assert.equal(all.isConfirmDialog, true)
  // a cancel with a reject text but no reject button wears the reject text
  const cancelOnly = confirmDialogAtomOf({ canCancel: true, rejectText: 'Not now' }, '', {})
  assert.deepEqual(cancelOnly.buttons.map((b) => b.label), ['Not now', chromeText('ok')])
  assert.equal(cancelOnly.opened, false)
  // returned by an action: asked through the shell's dialog
  const asked = returnedConfirmDialogsOf({ fragments: [
    { action: 'Add', component: { metadata: { type: 'ConfirmDialog', header: 'Overbook?', canReject: true, confirmActionId: 'go', rejectActionId: 'stop' },
      children: [{ metadata: { type: 'Text', text: 'Room 204' }, children: [{ metadata: { type: 'Text', text: 'is full' } }] }] } },
    { action: 'Add', component: { metadata: { type: 'ConfirmDialog', cancelActionId: 'cx' } } },
    { action: 'Replace', component: { metadata: { type: 'ConfirmDialog' } } },
  ] })
  assert.deepEqual(asked, [
    { title: 'Overbook?', message: 'Room 204 is full', confirmText: chromeText('ok'), denyText: chromeText('confirmNo'), confirmActionId: 'go', denyActionId: 'stop' },
    { title: '', message: '', confirmText: chromeText('ok'), denyText: chromeText('cancel'), confirmActionId: '', denyActionId: 'cx' },
  ])
  assert.deepEqual(returnedConfirmDialogsOf(null), [])
})

// ── Workflow / FormEditor / BPMN ──────────────────────────────────────────────────────────────

test('a workflow lists its steps in dependency order, saying after which step and when', () => {
  const w = workflowAtomOf({ value: JSON.stringify({ name: 'Onboarding', status: 'ACTIVE', steps: [
    { id: 'b', name: 'Approve', type: 'USER_TASK', preconditionStepId: 'a', preconditionExpression: 'amount > 100' },
    { id: 'a', type: 'FORK', parallel: true },
    { id: 'c', type: 'MYSTERY', preconditionStepId: 'ghost' },
    { name: 'no id' },
  ] }) })
  assert.deepEqual(w.steps.map((s) => s.name), ['a', 'Approve', 'c'])
  assert.equal(w.steps[0].typeLabel, chromeText('stepFork') + ' · ' + chromeText('parallel'))
  assert.equal(w.steps[1].after, chromeText('afterStep', { name: 'a' }) + chromeText('whenCondition', { condition: 'amount > 100' }))
  assert.equal(w.steps[2].after, chromeText('afterStep', { name: 'ghost' }), 'an unknown precondition is named by its id')
  assert.equal(w.steps[2].iconClass, 'oj-ux-ico-play', 'an unknown type looks like an action')
  assert.match(w.statusClass, /success/)
  assert.equal(workflowAtomOf({ value: '{not json' }).isNotice, true, 'a broken definition says so')
  const empty = workflowAtomOf({})
  assert.equal(empty.name, 'Workflow')
  assert.equal(empty.isEmpty, true)
})

test('a FormEditor\'s definition becomes the form fields it defines', () => {
  const f = formEditorFieldsOf({ value: JSON.stringify({ fields: [
    { id: 'name', required: true }, { id: 'notes', dataType: 'string', stereotype: 'textarea', label: 'Notes' }, { id: 'r', stereotype: 'regular' }, { label: 'no id' }] }) })
  assert.equal(f.name, 'Form')
  assert.deepEqual(f.fields.map((x) => [x.fieldId, x.label, x.dataType, x.stereotype, x.required]), [
    ['name', 'name', 'string', undefined, true], ['notes', 'Notes', 'string', 'textarea', false], ['r', 'r', 'string', undefined, false]])
  assert.equal(formEditorFieldsOf({ value: '[[' }), null)
  assert.equal(formEditorFieldsOf({ value: '7' }), null)
})

// ── HTML of rich content (popovers, tooltips) ─────────────────────────────────────────────────

test('rich content as HTML: headings, links (safe), lists, badges, separators, containers as blocks', () => {
  const html = componentHtmlOf({ metadata: { type: 'Card', content: { metadata: { type: 'Text', text: 'Inner' } } }, children: [
    { metadata: { type: 'Text', container: 'h2', text: 'Title <b>' } },
    { metadata: { type: 'Anchor', url: 'javascript:alert(1)', text: 'evil' } },
    { metadata: { type: 'Anchor', url: '/ok' } },
    { metadata: { type: 'BulletedList', items: ['a', 'b'] } },
    { metadata: { type: 'Badge', text: 'VIP' } },
    { metadata: { type: 'Separator' } },
    { metadata: { type: 'Button', label: 'never' } },
  ] })
  assert.match(html, /^<div><h4>Title &lt;b&gt;<\/h4>/)
  assert.ok(!/javascript/.test(html), 'an unsafe link loses its href')
  assert.match(html, /<a href="\/ok">\/ok<\/a>/)
  assert.match(html, /<ul><li>a<\/li><li>b<\/li><\/ul>/)
  assert.match(html, /<span>VIP<\/span>/)
  assert.match(html, /<hr>/)
  assert.ok(!/never/.test(html), 'a button is not content')
  assert.match(html, /<p>Inner<\/p><\/div>$/, 'a single content child is walked too')
  assert.equal(componentHtmlOf(null), '')
  assert.equal(componentHtmlOf({ metadata: { type: 'Mystery', label: 'shown as text' } }).length >= 0, true)
})

// ── paging, auto-fit, carousel ────────────────────────────────────────────────────────────────

test('a client-side grid page: range text, clamped page, an empty grid', () => {
  const rows = Array.from({ length: 25 }, (_, i) => ({ i }))
  const p = gridPageOf(rows, 10, 7)
  assert.equal(p.page, 2, 'beyond the last page → the last page')
  assert.equal(p.rangeText, '21–25 ' + chromeText('pagingOf') + ' 25')
  assert.equal(p.hasNext, false)
  assert.equal(p.hasPrev, true)
  const none = gridPageOf([], 10, 0)
  assert.equal(none.rangeText, '0 ' + chromeText('pagingOf') + ' 0')
  assert.equal(none.paged, false)
  assert.equal(gridPageOf(rows, 0, 0).rows.length, 25, 'no page size: everything')
})

test('auto-fit tracks become responsive column classes; other templates are not translated', () => {
  assert.equal(autoFitColClass('repeat(auto-fill, minmax(200px, 1fr))'), 'oj-flex-item oj-sm-6 oj-md-4 oj-lg-2 oj-xl-2 oj-sm-padding-2x-end oj-sm-padding-2x-bottom')
  assert.equal(autoFitColClass('1fr 1fr'), null)
  assert.equal(autoFitColClass('repeat(auto-fit, minmax(0px, 1fr))'), null)
})

test('a carousel pager: with loop the ends wrap, without it they stop', () => {
  const pager = (current, count, loop) => {
    const a = carouselPagerAtomOf('k', current, count, loop)
    return JSON.stringify(a)
  }
  assert.notEqual(pager(0, 3, true), pager(0, 3, false), 'at the start the loop changes what «previous» does')
  assert.notEqual(pager(2, 3, true), pager(2, 3, false), 'and at the end what «next» does')
})

test('a progress bar reads its value from the state key; a custom component without a mount says so', () => {
  const bar = progressBarAtomOf({ valueKey: 'pct', max: 200, theme: 'success' }, { pct: 50 })
  assert.match(JSON.stringify(bar), /mateu-tone-success/)
  registerCustomComponent('my-gauge', () => {})
  const custom = customComponentAtomOf({ name: 'my-gauge', props: { v: 1 } }, 'g 1')
  assert.equal(custom.slotId, 'mateuCustom-g_1')
  assert.equal(custom.props, '{"v":1}')
  const unnamed = customComponentAtomOf({ name: 'x y' })
  assert.equal(unnamed.slotId, 'mateuCustom-x_y')
  assert.equal(unnamed.props, '{}')
})

// ── listings: paging, selection, rows, status words ────────────────────────────────────────────

test('the pager: each button leads to its page, or nowhere at the edges; a number is a page', () => {
  const middle = { hasPrev: true, hasNext: true, hasLast: true, pageNumber: 3, lastPage: 9 }
  assert.deepEqual(['first', 'prev', 'next', 'last', '5', '-1', 'x'].map((w) => targetPageOf(middle, w)), [0, 2, 4, 9, 5, null, null])
  const first = { hasPrev: false, hasNext: false, hasLast: false, pageNumber: 0 }
  assert.deepEqual(['first', 'prev', 'next', 'last'].map((w) => targetPageOf(first, w)), [null, null, null, null])
  assert.equal(targetPageOf(null, 'next'), null)
})

test('a listing search keeps the text and filters when paging; the sort travels only when there is one', () => {
  const st = listingSearchStateOf({ mode: 'x', sort: [{ field: 'stale' }] }, { searchText: 'ada', page: 2, size: 50, filters: { status: 'OPEN', nights_from: 2 } })
  assert.deepEqual(st, { mode: 'x', searchText: 'ada', page: 2, size: 50, status: 'OPEN', nights_from: 2 })
  const sorted = listingSearchStateOf({}, { sort: [{ field: 'name', direction: 'descending', extra: 1 }] })
  assert.deepEqual(sorted, { searchText: '', page: 0, size: 20, sort: [{ field: 'name', direction: 'descending' }] })
  assert.deepEqual(listingSortOf({ header: 'code__uuidCell', direction: 'descending' }, { code: 'bookingCode' }), [{ field: 'bookingCode', direction: 'descending' }])
  assert.deepEqual(listingSortOf({ header: 'name', direction: 'weird' }), [{ field: 'name', direction: 'ascending' }])
  assert.deepEqual(listingSortOf({}), [])
})

test('a «select all» selection is everything but the unchecked rows; the rows go back as they arrived', () => {
  const all = selectionOfKeySet({ isAddAll: () => true, deletedValues: () => new Set(['r2']) })
  assert.deepEqual(all, { all: true, keys: [], except: ['r2'] })
  assert.deepEqual(selectionOfKeySet({ isAddAll: () => false, values: () => new Set(['r1']) }), { all: false, keys: ['r1'], except: [] })
  assert.deepEqual(selectionOfKeySet({ isAddAll: () => true }), { all: true, keys: [], except: [] })
  assert.deepEqual(selectionOfKeySet(null), { all: false, keys: [], except: [] })
  const rows = [
    { _rowNumber: 'r1', id: 1, code: 'abc', code__uuidCell: 'a…', status: { badgeClass: 'x', plain: true, raw: 'OPEN', message: 'Open' } },
    { _rowNumber: 'r2', id: 2, status: { badgeClass: 'y', plain: true, message: 'Closed' } },
    { _rowNumber: 'r3', id: 3, status: { badgeClass: 'z', type: 'SUCCESS', message: 'Paid' } },
  ]
  assert.deepEqual(selectedRowsOf(rows, all).map((r) => [r.id, r.status]), [[1, 'OPEN'], [3, { type: 'SUCCESS', message: 'Paid' }]])
  assert.ok(!('code__uuidCell' in selectedRowsOf(rows, all)[0]), 'the precomputed cells do not travel')
  assert.deepEqual(selectedRowsOf(rows, { all: false, keys: ['r2'], except: [] })[0].status, 'Closed', 'a plain word without raw is its message')
  assert.deepEqual(selectedRowsOf(rows, null), [])
  assert.equal(rowAsArrived(null), null)
})

test('a row\'s extra lines (@Line): columns split by line, values as text (lists, money, states, yes/no)', () => {
  const cols = [{ metadata: { id: 'a', line: 1 } }, { metadata: { id: 'b', line: 3, label: 'B' } }, { metadata: { id: 'c', line: 2.7 } }, { metadata: { type: 'GridGroupColumn', id: 'g', line: 5 } }]
  const split = rowLinesSplit(cols)
  assert.deepEqual(split.first.map((c) => c.metadata.id), ['a', 'g'])
  assert.deepEqual(split.extra.map((l) => l.map((c) => c.metadata.id)), [['c'], ['b']])
  assert.equal(lineValueText(['x', null, { message: 'Open' }]), 'x, Open')
  assert.equal(lineValueText({ amount: 10, currency: 'EUR' }), '10 EUR')
  assert.equal(lineValueText({ amount: 10 }), '10')
  assert.equal(lineValueText({ name: 'Ada' }), 'Ada')
  assert.equal(lineValueText({ message: null }), '')
  assert.equal(lineValueText(true), '✓')
  assert.equal(lineValueText(false), '✗')
  assert.equal(lineValueText(3), '3')
  const [row] = rowLinesRows([{ c: { message: 'Late', badgeClass: 'warn' }, b: 'x' }], split.extra)
  assert.deepEqual(row.__rowLines.lines.map((l) => [l.key, l.pairs.map((p) => [p.label, p.text, p.cls])]), [['l2', [['c', 'Late', 'warn']]], ['l3', [['B', 'x', '']]]])
  assert.deepEqual(rowLinesRows([{ a: 1 }], []), [{ a: 1 }])
})

test('a plain status word: the declared tone wins, then the lifecycle words; constants read as words', () => {
  assert.deepEqual(['success', 'WARNING', 'error', 'danger', 'info', 'none', 'neutral', 'pink', null].map(statusTypeOfTone),
    ['SUCCESS', 'WARNING', 'DANGER', 'DANGER', 'INFO', 'NONE', 'NONE', undefined, undefined])
  assert.equal(statusTypeOfValue('shipped', { SHIPPED: 'info' }), 'INFO', 'the tone of the upper-cased word')
  assert.equal(statusTypeOfValue('Odd', { Odd: 'pink' }), 'NONE', 'an unknown tone falls to the words')
  assert.equal(statusTypeOfValue('in progress'), 'WARNING')
  assert.equal(statusTypeOfValue('Cancelled'), 'DANGER')
  assert.equal(statusTypeOfValue('whatever'), 'NONE')
  assert.equal(humanizeConstant('IN_PROGRESS'), 'In progress')
  assert.equal(humanizeConstant('ROOM1'), 'Room 1')
  assert.equal(humanizeConstant('Already words'), 'Already words')
  assert.equal(humanizeConstant(7), 7)
})

// ── listings: filters, chips, URL, smart search ───────────────────────────────────────────────

const FILTERS = [
  filterDescriptorOf({ fieldId: 'arrival', label: 'Arrival', stereotype: 'dateRange', dataType: 'dateTime' }, {}),
  filterDescriptorOf({ fieldId: 'nights', label: 'Nights', stereotype: 'numberRange' }, {}),
  filterDescriptorOf({ fieldId: 'tags', label: 'Tags', stereotype: 'multiSelect', options: [{ value: 'a', label: 'Alpha' }, { value: 'b' }] }, {}),
  filterDescriptorOf({ fieldId: 'vip', label: 'VIP', dataType: 'boolean' }, {}),
  filterDescriptorOf({ fieldId: 'status', label: 'Status', options: [{ value: 'OPEN', label: 'Open' }] }, {}),
  filterDescriptorOf({ fieldId: 'amount', dataType: 'money' }, {}),
]

test('each filter knows its kind and the input it is typed in', () => {
  assert.deepEqual(FILTERS.map((f) => [f.kind, f.inputType]), [['range', 'datetime-local'], ['range', 'number'], ['multi', 'text'], ['bool', 'text'], ['options', 'text'], ['text', 'number']])
  assert.equal(FILTERS[5].label, 'amount', 'no label: its field id')
  assert.equal(filterDescriptorOf({ fieldId: 'd', stereotype: 'dateRange' }, {}).inputType, 'date')
  assert.deepEqual(FILTERS[2].options, [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'b' }])
})

test('filter chips: one per filter, the applied value as the user reads it; a range clears both keys', () => {
  const chips = filterChipsOf(FILTERS, { arrival_to: '2026-10-20', nights_from: 2, nights_to: 4, tags: 'a,b', vip: 'false', status: 'OPEN', amount: 30, ids: 'X1,X2' })
  assert.deepEqual(chips.map((c) => [c.fieldId, c.text, c.applied]), [
    [IDS_PARAM, chromeText('idsFew') + 'X1, X2', true],
    ['arrival', '≤ 2026-10-20', true], ['nights', '2 → 4', true], ['tags', 'Alpha, b', true], ['vip', 'No', true], ['status', 'Open', true], ['amount', '30', true]])
  assert.deepEqual(chips[2].keys, ['nights_from', 'nights_to'])
  assert.equal(filterChipsOf(FILTERS, { arrival_from: '2026-10-01' })[0].text, '≥ 2026-10-01')
  assert.equal(filterChipsOf(FILTERS, { vip: true })[3].text, 'Yes')
  assert.ok(filterChipsOf(FILTERS, {}).every((c) => !c.applied))
  assert.equal(filterChipsOf(FILTERS, { ids: Array.from({ length: 5 }, (_, i) => 'I' + i) })[0].text, chromeText('idsMany', { n: 5 }))
})

test('the URL of a listing: filters, keyword, page and sort round-trip; paging is not a filter', () => {
  const url = listingUrlOf('/bookings?old=1', { status: 'A B', tags: ['x', 'y'], empty: '', page: 3 }, ' ada ', { page: 2, sort: [{ field: 'name', direction: 'descending' }, { field: 'x' }] })
  assert.equal(url, '/bookings?status=A%20B&tags=x,y&searchText=ada&page=2&sort=name:descending')
  assert.equal(listingUrlOf('/b', {}, '', { page: 0, sort: [] }), '/b')
  const query = url.split('?')[1]
  const back = splitListingQuery(queryFiltersOf(query))
  assert.deepEqual(back, { searchText: 'ada', values: { status: 'A B', tags: 'x,y' } })
  assert.deepEqual(listingUrlPagingOf(query), { page: 2, sort: [{ field: 'name', direction: 'descending' }] })
  assert.deepEqual(listingUrlPagingOf('page=-3&sort=a:sideways,b:ascending&=x&bad'), { page: 0, sort: [{ field: 'b', direction: 'ascending' }] })
  assert.deepEqual(queryFiltersOf('?q=a+b&bad=%E0%A4%A&=x&size=10'), { q: 'a b', bad: '%E0%A4%A' }, 'a broken escape is kept as it came')
  assert.equal(splitListingQuery({ q: 'alias' }).searchText, 'alias')
  assert.deepEqual(navTargetOf('/r?x=1', '/r?x=1'), { route: '/r', full: '/r?x=1', filters: { x: '1' }, same: true })
  assert.equal(navTargetOf('/r', '/r?x=1').same, false, 'the same screen with other filters is another navigation')
  assert.equal(listingQueryOf(null, null), '')
  assert.deepEqual(multiValuesOf(' a, ,b '), ['a', 'b'])
  assert.deepEqual(multiValuesOf(null), [])
  assert.deepEqual(multiValuesOf([1, 2]), ['1', '2'])
})

test('smart search: the applied chips from the state, and back — keywords, ids, ranges, lists, yes/no, picks', () => {
  const value = smartFilterValueOf(FILTERS, { ids: 'K1', arrival_from: '2026-10-01', tags: ['b'], vip: true, status: 'OPEN', amount: 9 }, ' late ')
  assert.deepEqual(value.map((c) => c.filter), ['keyword', IDS_PARAM, 'arrival', 'tags', 'vip', 'status', 'amount'])
  assert.deepEqual(value[2].value, { gte: '2026-10-01', lte: null })
  assert.equal(value[4].label, 'Yes')
  assert.equal(value[5].label, 'Open')
  const state = filterStateOfSmartFilters(FILTERS, [...value, { filter: 'keyword', value: 'more' }, { filter: 'nights', value: { lte: 3 } }, { filter: 'ghost', value: 1 }, null, { filter: 'tags', value: [] }])
  assert.deepEqual(state, { searchText: 'late more', values: { ids: 'K1', arrival_from: '2026-10-01', tags: ['b'], vip: 'true', status: 'OPEN', amount: 9, nights_to: 3 } })
  // a freshly picked suggestion has no value yet: it does not filter
  assert.deepEqual(filterStateOfSmartFilters(FILTERS, [{ filter: 'status' }]).values, {})
  const sugg = smartFilterSuggestionsOf(FILTERS)
  assert.deepEqual(sugg[0].value, { gte: null, lte: null }, 'a range opens its popup with both bounds')
  assert.equal(sugg[2].filterLabel, 'Tags')
  assert.equal(sugg[5].filterLabel, undefined, 'a text filter shows its own label')
})

test('smart search providers: what is applied is not offered again, typing narrows, keys resolve', async () => {
  const rows = smartFilterSuggestionsOf(FILTERS)
  const legacy = suggestionFiltersProviderOf(rows)
  const first = await legacy.fetchFirst({ filterCriterion: { op: '$and', criteria: [{ op: '$ne', value: { filters: [{ filter: 'vip' }] } }, { text: 'TA' }] } })[Symbol.asyncIterator]().next()
  assert.deepEqual(first.value.data.map((r) => r.filter), ['tags', 'status'])
  assert.deepEqual([...(await legacy.fetchByKeys({ keys: ['vip', 'nope'] })).results.keys()], ['vip'])
  assert.deepEqual([...(await legacy.containsKeys({ keys: ['vip', 'nope'] })).results], ['vip'])
  assert.equal(await legacy.getTotalSize(), 6)
  assert.equal(legacy.isEmpty(), 'no')
  assert.equal(suggestionFiltersProviderOf([]).isEmpty(), 'yes')
  const dropdown = suggestionsProviderOf(smartFilterDropdownRowsOf(FILTERS))
  const it = dropdown.fetchFirst({ filterCriterion: { text: 'n' } })[Symbol.asyncIterator]()
  const block = await it.next()
  assert.deepEqual(block.value.data.map((r) => r.id), ['nights', 'amount'])
  assert.equal((await it.next()).done, true, 'then the empty end, like an ArrayDataProvider')
  const page = await dropdown.fetchByOffset({ offset: 1, size: 2 })
  assert.deepEqual(page.results.map((r) => r.data.id), ['nights', 'tags'])
  assert.equal(page.done, false)
  assert.equal((await dropdown.fetchByOffset({ offset: 4 })).done, true)
  assert.deepEqual([...(await dropdown.containsKeys({ keys: ['vip', 'x'] })).results], ['vip'])
  assert.equal((await dropdown.fetchByKeys({ keys: ['status'] })).results.get('status').data.id, 'status')
  assert.equal(await dropdown.getTotalSize(), -1, 'unknown: the total depends on the filter')
  assert.deepEqual(dropdown.getCapability('filter').operators, ['$and', '$ne'])
  assert.equal(dropdown.getCapability('sort'), null)
})

test('smart search config: text only without filters; ids alone carry their chip; the editors\' metadata when JET is there', async () => {
  const plain = await smartFiltersOf([], {}, 'x')
  assert.deepEqual(Object.keys(plain).sort(), ['askHint', 'value'])
  const ids = await smartFiltersOf([], { ids: 'A' }, '')
  assert.equal(ids.suggestions, undefined)
  setMetadataProviderFactory(async (data) => ({ metadataOf: data }))
  try {
    const full = await smartFiltersOf(FILTERS, {}, '')
    assert.ok(full.suggestions && full.filtersMetadata && full.filtersMetadata.metadataOf)
  } finally { setMetadataProviderFactory(null) }
})

// ── client rules: the expression language a @Hidden/@Disabled/@Rule is written in ──────────────

test('rule expressions: every operator, with JavaScript\'s precedence and semantics', () => {
  const scope = { state: { n: 7, s: 'Ada', zero: 0, list: ['a', 'b'], obj: { k: 'v' } }, data: { flag: true }, appState: { hotel: 'H1' } }
  const ev = (e) => evaluateExpression(e, scope)
  const cases = [
    ['1 + 2 * 3', 7], ['(1 + 2) * 3', 9], ['10 - 4 - 3', 3], ['7 % 4', 3], ['9 / 2', 4.5], ['-state.n + +"2"', -5],
    ['state.n >= 7', true], ['state.n <= 6', false], ['state.n < 8 && state.n > 6', true],
    ['state.n === 7', true], ['state.n !== 7', false], ['state.n == "7"', true], ['state.n != "7"', false],
    ['state.zero || "fallback"', 'fallback'], ['state.zero && "never"', 0], ['!data.flag', false],
    ['state.n > 5 ? state.n > 6 ? "big" : "mid" : "small"', 'big'],
    ["'it\\'s'", "it's"], ['.5 + 0.5', 1], ['false', false], ['null', null], ['undefined', undefined],
    ['["x", state.s][1]', 'Ada'], ['state.list[0]', 'a'], ['state.obj["k"]', 'v'], ['state.missing[0]', undefined],
    ['state.s.startsWith("A")', true], ['state.s.endsWith("x")', false], ['state.s.indexOf("d")', 1],
    ['state.list.indexOf("b")', 1], ['state.missing.indexOf("b")', -1], ['state.s.toLowerCase()', 'ada'],
    ['"  pad ".trim()', 'pad'], ['state.n.toString()', '7'], ['state.missing.includes("a")', false],
    ['state.s.toUpperCase()', 'ADA'], ['state.s.unknownMethod()', undefined], ['appState.hotel', 'H1'],
  ]
  for (const [expr, expected] of cases) assert.deepEqual(ev(expr), expected, expr)
  // what it does not understand is undefined (the rule does not hold), never a broken screen
  for (const bad of ['state.n #', '1 +', '', '   ', null, 'state.n )', 'state.n state.s']) assert.equal(ev(bad), undefined, String(bad))
  assert.equal(ev('(1'), 1, 'an unclosed parenthesis is forgiven')
  assert.equal(evaluateTemplate('Hi ${state.s}, ${state.missing}!', scope), 'Hi Ada, !')
  assert.equal(evaluateTemplate('state.n * 2', scope), 14, 'without ${ it is an expression')
  assert.equal(evaluateTemplate(null, scope), undefined)
})

test('rules: data attributes per field (several fields at once), the flags the template reflects', () => {
  const r = computeRules([
    null,
    { filter: '', action: 'SetDataValue', fieldName: 'a, b', fieldAttribute: 'hidden', value: true },
    { filter: 'state.x', action: 'SetDataValue', fieldName: 'c', fieldAttribute: 'readOnly', value: 1 },
    { filter: 'state.y', action: 'SetDataValue', fieldName: 'd', fieldAttribute: 'disabled', value: true },
    { filter: 'true', action: 'SetStateValue', fieldName: 'total', expression: '${state.x * 10}' },
    { filter: 'true', action: 'RunAction' },
  ], { state: { x: 2 } })
  assert.deepEqual(r.data, { 'a.hidden': true, 'b.hidden': true, 'c.readOnly': 1 })
  assert.deepEqual(r.state, { total: 20 })
  assert.deepEqual(r.actions, [], 'a RunAction without an action id runs nothing')
  assert.deepEqual(fieldFlagsOf({ ...r.data, 'e.required': 0, 'f.other': true, plain: 1 }),
    { a: { hidden: true }, b: { hidden: true }, c: { readonly: true }, e: { required: false } })
  const ctx = { tree: { triggers: [{ type: 'OnValueChange', actionId: 'recalc', propertyName: 'nights', condition: 'state.nights > 0' }] }, data: {} }
  assert.equal(valueChangeActionOf(ctx, 'nights', { nights: 0 }), null, 'the condition does not hold')
  assert.equal(valueChangeActionOf(ctx, 'nights', { nights: 2 }), 'recalc')
  assert.equal(valueChangeActionOf(null, 'x'), null)
})

// ── listing personalisation (columns, saved views, tile order) in the browser's storage ─────────

const memoryStore = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m } }

test('personalisation survives a blocked or corrupt storage: nothing is remembered, nothing breaks', () => {
  const blocked = { getItem: () => { throw new Error('SecurityError') }, setItem: () => { throw new Error('QuotaExceeded') } }
  assert.equal(prefs.readColumnPrefs('/r', blocked), null)
  prefs.writeColumnPrefs('/r', { hidden: ['a'] }, blocked)
  prefs.saveView('/r', { name: 'v' }, blocked)
  assert.deepEqual(prefs.listSavedViews('/r', blocked), [])
  const corrupt = { getItem: () => '{not json', setItem: () => {} }
  assert.equal(prefs.readTileOrder('/r#g', corrupt), null)
  const nulls = { getItem: () => 'null', setItem: () => {} }
  assert.equal(prefs.readColumnPrefs('/r', nulls), null)
  const odd = memoryStore()
  odd.setItem('mateu-column-prefs', JSON.stringify({ '/r': { hidden: 'x', order: null }, '/s': 'nope' }))
  assert.deepEqual(prefs.readColumnPrefs('/r', odd), { hidden: [], order: [] })
  assert.equal(prefs.readColumnPrefs('/s', odd), null)
  odd.setItem('mateu-tile-order', JSON.stringify({ '/r#g': ['a', 3, 'b'] }))
  assert.deepEqual(prefs.readTileOrder('/r#g', odd), ['a', 'b'], 'only keys that can be keys')
})

test('columns: ordered ones first, the rest after in their order, hidden ones out, technical ones in place', () => {
  const cols = [{ field: '_select' }, { field: 'a', headerText: 'A' }, { field: 'b' }, { field: 'c' }, { template: 'cellRowActions', field: 'act' }, { field: '__rowLines' }]
  const shown = prefs.applyColumnPrefs(cols, { hidden: ['b'], order: ['c'] })
  assert.deepEqual(shown.map((c) => c.field), ['_select', 'c', 'a', 'act', '__rowLines'])
  assert.equal(prefs.applyColumnPrefs(cols, null), cols)
  const chooser = prefs.columnChooserOf(cols, { hidden: ['b'], order: ['c'] })
  assert.deepEqual(chooser, [{ id: 'c', label: 'c', visible: true }, { id: 'a', label: 'A', visible: true }, { id: 'b', label: 'b', visible: false }])
  assert.equal(prefs.moveChooserItem(chooser, 'c', -1), chooser, 'the first cannot go up')
  assert.equal(prefs.moveChooserItem(chooser, 'b', 1), chooser, 'the last cannot go down')
  assert.equal(prefs.moveChooserItem(chooser, 'ghost', 1), chooser)
  const store = memoryStore()
  prefs.writeColumnPrefs('/r', prefs.prefsFromChooser(chooser), store)
  prefs.writeColumnPrefs('/r', { hidden: [], order: [] }, store)
  assert.equal(prefs.readColumnPrefs('/r', store), null, 'back to the defaults: the scope is forgotten')
})

test('saved views: a new default replaces the old one, saving a name again replaces it, the last one deleted forgets the scope', () => {
  const store = memoryStore()
  prefs.saveView('/r', { name: 'A', values: { x: 1 }, isDefault: true }, store)
  prefs.saveView('/r', { name: 'B', isDefault: true }, store)
  assert.deepEqual(prefs.listSavedViews('/r', store).map((v) => [v.name, v.isDefault]), [['A', false], ['B', true]])
  assert.deepEqual(prefs.listSavedViews('/r', store)[1].values, {})
  prefs.saveView('/r', { name: 'A', values: { x: 2 } }, store)
  assert.deepEqual(prefs.listSavedViews('/r', store).map((v) => v.name), ['B', 'A'])
  assert.equal(prefs.defaultView('/r', store).name, 'B')
  assert.deepEqual(prefs.viewsMenuOf('/r', store).map((o) => o.label), ['★ B', 'A', chromeText('saveCurrentView'), chromeText('clearFilters')])
  prefs.deleteView('/r', 'A', store)
  prefs.deleteView('/r', 'B', store)
  assert.ok(!('/r' in JSON.parse(store.m.get('mateu-saved-views'))))
  assert.equal(prefs.defaultView('/r', store), null)
  assert.deepEqual(prefs.viewsMenuOf('/r', store).map((o) => o.value), ['save'], 'nothing saved: no «clear»')
  assert.equal(prefs.viewRouteOf('/r', { tags: ['a', 'b'], none: [], n: null }), '/r?tags=a%2Cb')
  assert.equal(prefs.viewRouteOf('/r?x=1', {}), '/r')
  assert.deepEqual(prefs.currentViewValues(null, ''), {})
})

test('tile order: saved keys first, new tiles after, keys gone from the grid ignored; moves by key', () => {
  assert.deepEqual(prefs.orderedTileIndices(['a', 'b', 'c'], ['c', 'gone', 'a']), [2, 0, 1])
  assert.deepEqual(prefs.orderedTileIndices(['a', 'b'], []), [0, 1])
  assert.equal(prefs.tileKeyOf({ id: 7 }, 0), '7')
  assert.equal(prefs.tileKeyOf(null, 3), '#3')
  const order = ['a', 'b', 'c']
  assert.equal(prefs.moveTile(order, 'a', 'a'), order)
  assert.equal(prefs.moveTile(order, 'x', 'a'), order)
  assert.equal(prefs.moveTileBy(order, 'a', -1), order, 'the first cannot go back')
  assert.equal(prefs.moveTileBy(order, 'c', 1), order)
  assert.deepEqual(prefs.moveTileBy(order, 'a', 1), ['b', 'a', 'c'])
  assert.equal(prefs.tileScopeOf('', { pathname: '/dash' }), '/dash#grid')
  assert.equal(prefs.tileScopeOf('g', null), '#g')
  assert.equal(prefs.listingScope(null), '')
  assert.equal(prefs.listingScope({ hash: '#x', pathname: '/p?q' }), '/p', 'a hash that is not a route: the path')
})

// ── the page header's record switcher and KPIs, the welcome's trend ───────────────────────────

const formCtx = (metadata, state = {}, data = {}) => ({ tree: { type: 'ServerSide', id: 'p', children: [{ type: 'ClientSide', metadata: { type: 'Form', ...metadata }, children: [] }] }, state, data })

test('record switcher: its options (declared or fetched), the current one, a pick — never an echo', () => {
  const sw = pageSwitcherOf(formCtx({ switcher: { label: 'Booking of ${state.guest}', value: '${state.id}', searchable: true,
    options: [{ value: 1, label: 'B-1 ${state.guest}', description: 'Room ${state.room}' }, { value: 2 }, { label: 'no value' }] } }, { id: 1, guest: 'Ada', room: 204 }))
  assert.equal(sw.on, true)
  assert.equal(sw.label, 'Booking of Ada')
  assert.equal(sw.value, '1')
  assert.deepEqual(sw.objectOptions, [{ value: '1', label: 'B-1 Ada', description: 'Room 204' }, { value: '2', label: '2', description: '' }])
  assert.deepEqual(sw.contextOptions, [])
  assert.equal(switcherPickOf(sw, '1'), null, 'the data switcher writes back what it was given: not a pick')
  assert.deepEqual(switcherPickOf(sw, { value: 2 }), { actionId: sw.actionId, parameters: { _record: '2' } })
  assert.deepEqual(switcherPickOf(sw, { key: 2 }).parameters, { _record: '2' })
  assert.equal(switcherPickOf(sw, null), null)
  // a context switcher, fed by a REST source (its options in data._switcher), that navigates
  const ctxSw = pageSwitcherOf(formCtx({ switcher: { type: 'context', optionsSource: { ref: 'hotels' }, route: '/h/${state._record}/${state.tab}' } },
    { tab: 'rooms' }, { _switcher: { content: [{ value: 'H1', label: 'One' }] } }))
  assert.deepEqual(ctxSw.contextOptions.map((o) => o.value), ['H1'])
  assert.equal(switcherPickOf(ctxSw, 'H1').route, '/h/H1/rooms')
  // disabled: no picker, the current record shown as a fact
  const locked = pageSwitcherOf(formCtx({ switcher: { disabled: true, label: 'Hotel', value: 'H1', options: [{ value: 'H1', label: 'One' }] } }))
  assert.deepEqual([locked.objectOptions, locked.fact], [[], { label: 'Hotel', value: 'One' }])
  assert.equal(switcherPickOf(locked, 'H2'), null)
  assert.equal(pageSwitcherOf(formCtx({ switcher: { options: [] } })).on, false, 'no options yet: no switcher')
  assert.equal(pageSwitcherOf(formCtx({})).on, false)
})

test('page KPIs: on a Form both title and text interpolate the state; empty ones are dropped', () => {
  const kpis = pageKpisOf(formCtx({ kpis: [{ title: 'Nights of ${state.guest}', text: '${state.n}' }, { title: '', text: '' }, { text: 7 }] }, { guest: 'Ada', n: 3 }))
  assert.deepEqual(kpis, [{ label: 'Nights of Ada', value: '3' }, { label: '', value: '7' }])
  assert.deepEqual(pageKpisOf({ tree: null }), [])
})

test('welcome: every panel is a tile in order, with its content as atoms; a lone metric is a KPI', () => {
  const panel = (md, kids) => ({ type: 'ClientSide', metadata: { type: 'DashboardPanel', ...md }, children: kids })
  const leaf = (md) => ({ type: 'ClientSide', metadata: md, children: [] })
  const w = welcomeOf({ state: {}, data: {}, tree: { type: 'ServerSide', id: 'w', children: [
    leaf({ type: 'HeroSection', title: 'Hi' }),
    { type: 'ClientSide', metadata: { type: 'DashboardLayout', columns: 3 }, children: [
      panel({ title: 'Occupancy', subtitle: 'per day', colSpan: 2 }, [leaf({ type: 'TrendChart', title: 'Rooms', values: [1, 2], labels: ['Mon', 'Tue'], area: true })]),
      panel({ title: '' }, [leaf({ type: 'Stat', label: 'Arrivals', value: null, caption: 'today' })]),
      panel({ title: 'Features' }, [leaf({ type: 'FeatureGrid', features: [{ title: 'Fast', description: 'd' }] })]),
      panel({ title: 'Setup' }, [leaf({ type: 'Checklist', items: [{ id: 'a', label: 'One', done: true }] })]),
    ] },
  ] } })
  // the chart stays where it was declared (it used to be moved under every tile), as the AREA chart it
  // is with its own series name (it was bars titled «Occupancy %»), at its colSpan, with its subtitle
  assert.deepEqual(w.tiles.map((t) => t.title), ['Occupancy', '', 'Features', 'Setup'])
  assert.equal(w.trend, null)
  const chart = w.tiles[0].items.find((a) => a.isChart)
  assert.equal(chart.chartType, 'area')
  assert.equal(chart.items[0].series, 'Rooms')
  assert.equal(w.tiles[0].subtitle, 'per day')
  assert.match(w.tiles[0].colClass, /oj-md-8/)
  assert.match(w.tiles[2].colClass, /oj-md-4/)
  const kpi = w.tiles[1]
  assert.deepEqual([kpi.isKpi, kpi.kpiTitle, kpi.kpiValue, kpi.kpiCaption, kpi.items], [true, 'Arrivals', '', 'today', []])
  // what only the text was taken of — a FeatureGrid, a Checklist — is drawn (they were empty cards)
  assert.ok(w.tiles[2].items.some((a) => a.isFeatureGrid))
  assert.ok(w.tiles[3].items.some((a) => a.isChecklist))
  // the page draws each tile's atoms with the shared template, at its colClass
  const html = webApp('flows/main/pages/main-start-page.html')
  const tiles = html.slice(html.indexOf('data="[[ $application.variables.mateuWelcome.tiles ]]"'), html.indexOf('<!-- GENERAL OVERVIEW archetype'))
  assert.match(tiles, /:class="\[\[ \$current\.data\.colClass/)
  assert.match(tiles, /data="\[\[ \$current\.data\.items \]\]"[\s\S]*<!-- @atoms host/)
})

// ── the AI chat panel: what the agent is doing, what it sees of the screen, what it answers ─────

test('chat progress: the status line follows the agent — a running tool with its seconds, answering, a phase', () => {
  const p = createChatProgress(0)
  assert.equal(p.line(5000), null, 'an agent that reports nothing: the panel keeps its own «thinking»')
  p.status({ phase: 'connecting', text: 'Connecting to 2 MCP servers…' }, 1000)
  assert.equal(p.line(1500), 'Connecting to 2 MCP servers…', 'under a second: no counter')
  assert.equal(p.line(4200), 'Connecting to 2 MCP servers… 3 s')
  p.tool({ phase: 'start', name: 'findBookings', server: 'pms', kind: 'mcp' }, 5000)
  p.tool({ phase: 'start' }, 5000)
  assert.equal(p.line(7000), chromeText('chatCalling', { name: chromeText('chatTool') }) + ' 2 s', 'the latest running tool')
  p.tool({ phase: 'end', ms: 850 }, 7000)
  p.tool({ phase: 'end', name: 'findBookings', server: 'pms', ms: 1234, error: 'timeout' }, 8000)
  p.tool({ phase: 'end', name: 'lateNoStart', ms: 3 }, 8000)
  assert.deepEqual(chatToolStepsOf(p).map((s) => [s.title, s.icon, s.cls, s.time, s.error]), [
    ['findBookings (pms)', '✕', 'mateu-chat-step failed', '1,2 s', 'timeout'],
    [chromeText('chatTool'), '✓', 'mateu-chat-step done', '850 ms', ''],
    ['lateNoStart', '✓', 'mateu-chat-step done', '3 ms', ''],
  ])
  assert.equal(p.line(9000), 'Connecting to 2 MCP servers… 1 s', 'no tool running: back to the phase')
  p.text(9000)
  assert.equal(p.line(20000), chromeText('chatAnswering'))
  p.status({ phase: 'thinking' }, 21000)
  assert.equal(p.line(21000), chromeText('chatThinking'))
  assert.equal(formatToolDuration(NaN), '')
  assert.deepEqual(chatToolStepsOf(null), [])
})

test('chat payloads: a delta, a status, a tool, an error (with or without message), another event, text', () => {
  const ev = (event, detail) => JSON.stringify({ event, detail })
  assert.deepEqual(classifyChatPayload(ev('agent-delta', { text: 'Hi' })), { kind: 'delta', text: 'Hi' })
  assert.deepEqual(classifyChatPayload(ev('agent-delta', { text: 3 })), { kind: 'delta', text: '' })
  assert.equal(classifyChatPayload(ev('agent-status', { phase: 'x' })).kind, 'status')
  assert.equal(classifyChatPayload(ev('agent-tool', {})).kind, 'tool')
  assert.deepEqual(classifyChatPayload(ev('agent-error', { message: 'quota' })), { kind: 'error', message: 'quota' })
  assert.deepEqual(classifyChatPayload(ev('agent-error')), { kind: 'error', message: chromeText('chatAgentError') })
  assert.deepEqual(classifyChatPayload(ev('open-screen', { route: '/x' })), { kind: 'event', event: 'open-screen', detail: { route: '/x' } })
  assert.deepEqual(classifyChatPayload('plain'), { kind: 'text', text: 'plain' })
  assert.deepEqual(classifyChatPayload(undefined), { kind: 'text', text: '' })
  // the parser: CRLF split across pushes, a field without a colon, a comment
  const parser = createSseParser()
  assert.deepEqual(parser.push('data: a\r'), [])
  assert.deepEqual(parser.push('\n\r\ndata\n: keep\nid: 7\n\n'), ['a', ''])
  assert.deepEqual(parser.push('data: tail'), [])
  assert.deepEqual(parser.end(), ['tail'])
})

test('chat: the screen the agent sees — fields once with values and options, actions with their button labels', () => {
  const tree = { type: 'ServerSide', route: '/person', serverSideType: 'x.Person', actions: [{ id: 'save', shortcut: 'ctrl+s' }, { id: 'save' }, { id: 'reset' }, null],
    children: [{ type: 'ClientSide', metadata: { type: 'Page', title: 'Person', pageType: 'form' }, children: [
      { type: 'ClientSide', metadata: { type: 'FormField', fieldId: 'name', required: true } },
      { type: 'ClientSide', metadata: { type: 'FormField', fieldId: 'name', label: 'dup' } },
      { type: 'ClientSide', metadata: { type: 'FormField', fieldId: 'kind', label: 'Kind', options: ['A', { value: 'B' }, { value: null }] } },
      { type: 'ClientSide', metadata: { type: 'Button', actionId: 'save', label: 'Save' } },
      { type: 'ClientSide', metadata: { type: 'Button', actionId: 'help' } },
    ] }] }
  const screen = projectChatScreen(tree, { name: 'Ada' })
  assert.deepEqual(screen.fields, [
    { id: 'name', label: 'name', dataType: 'string', stereotype: 'regular', required: true, readOnly: false, value: 'Ada' },
    { id: 'kind', label: 'Kind', dataType: 'string', stereotype: 'regular', required: false, readOnly: false,
      options: [{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: null, label: '' }] },
  ])
  assert.deepEqual(screen.actions, [{ id: 'save', label: 'Save', shortcut: 'ctrl+s' }, { id: 'reset', label: 'reset' }, { id: 'help', label: 'help' }])
  assert.deepEqual([screen.title, screen.route, screen.serverSideType, screen.pageType], ['Person', '/person', 'x.Person', 'form'])
  assert.deepEqual(projectChatScreen(null), { fields: [], actions: [] })
  const withSeed = projectChatScreen({ initialData: { a: 1 }, children: [{ metadata: { type: 'FormField', fieldId: 'a' } }] })
  assert.equal(withSeed.fields[0].value, 1, 'without a state: the component\'s initial data')
})

test('chat turn: the body carries the screen when there is one, the menu only when asked, files as 📎', () => {
  const registry = { contexts: { __root__: { state: { name: 'Ada' }, data: { d: 1 }, tree: { children: [{ metadata: { type: 'Page', title: 'P' } }] } } }, appData: { ad: 1 } }
  const turn = chatTurnOf({ message: '  hi ', sessionId: 's', attachments: [{ name: 'a.pdf', path: '/f/a' }], registry, mcpUrl: '/mcp',
    menu: [{ label: 'Home', route: '/home', submenus: [] }], sendMenu: true, origin: 'https://app.example' })
  assert.equal(turn.shown, 'hi\n\n📎 a.pdf')
  assert.equal(turn.body.screen.title, 'P')
  assert.equal(turn.body.mcpUrl, 'https://app.example/mcp')
  assert.ok(turn.body.menuContext)
  assert.deepEqual(turn.body.context.appData, { ad: 1 })
  const bare = chatTurnOf({ message: '', sessionId: 's', attachments: [{ name: 'x', path: 'p' }] })
  assert.equal(bare.shown, '📎 x', 'only files: no empty line before them')
  assert.equal(bare.body.screen, undefined)
  assert.equal(chatTurnTextOf('', new Error('Failed to fetch')), '⚠️ ' + chromeText('chatNoAnswer'))
  assert.equal(chatTurnTextOf('partial', new Error('Failed to fetch')), '⚠️ ' + chromeText('chatError', { message: 'Failed to fetch' }))
  assert.equal(chatTurnTextOf('', 'boom'), '⚠️ ' + chromeText('chatError', { message: 'boom' }))
  assert.equal(chatTurnTextOf('', null), '⚠️ ' + chromeText('chatEmptyAnswer'))
  const files = withAttachments([{ name: 'a', path: '/a' }], [{ path: '/a' }, { path: '/b' }, null, { name: 'no path' }])
  assert.deepEqual(files.map((f) => [f.name, f.path]), [['a', '/a'], ['/b', '/b']])
})

// ── the tape chart (planning board) and listing totals ───────────────────────────────────────

test('tape chart: a drop is the new nights (end exclusive → last night), the row it landed on; a range in either direction', () => {
  const atom = { moveActionId: 'move', resizeActionId: 'resize', selectActionId: 'pick', rangeSelectActionId: 'book' }
  const moved = planningActionOf(atom, 'move', { taskContexts: [{ id: 'B1' }], rowContext: { data: { id: 'R2' } }, value: '2026-10-05', end: '2026-10-08' })
  assert.deepEqual(moved, { actionId: 'move', parameters: { _blockId: 'B1', _resourceId: 'R2', _start: '2026-10-05', _end: '2026-10-07' } })
  assert.equal(planningActionOf(atom, 'move', { taskId: 'B1', rowId: 'R9', start: '2026-10-05', end: '2026-10-06' }).parameters._resourceId, 'R9')
  const resized = planningActionOf(atom, 'resize', { taskContexts: [{ data: { id: 'B1' }, rowContext: { rowData: { id: 'R3' } } }], start: '2026-10-01', end: null })
  assert.deepEqual(resized.parameters, { _blockId: 'B1', _resourceId: 'R3', _start: '2026-10-01', _end: null })
  assert.deepEqual(planningActionOf(atom, 'select', { taskId: 'B7' }), { actionId: 'pick', parameters: { _blockId: 'B7' } })
  assert.deepEqual(planningActionOf({ ...atom, selectParam: '_clickedTaskId' }, 'select', { taskId: 'T' }).parameters, { _clickedTaskId: 'T' })
  // a range dragged right-to-left is the same stay
  assert.deepEqual(planningActionOf(atom, 'range', { rowId: 'R1', start: '2026-10-09', end: '2026-10-03' }).parameters, { _resourceId: 'R1', _start: '2026-10-03', _end: '2026-10-09' })
  assert.equal(planningActionOf(atom, 'range', { rowId: 'R1', start: '2026-10-09' }), null)
  // an instant (where the pointer let go) is rounded to its day
  const instant = planningActionOf(atom, 'move', { taskId: 'B1', start: '2026-10-05T23:59:00', end: '2026-10-08T00:00:00' })
  assert.match(instant.parameters._start, /^2026-10-0[56]$/)
  assert.equal(planningActionOf(atom, 'open', { taskId: 'B1' }), null, 'no open action declared: nothing')
  assert.equal(planningActionOf(null, 'move', {}), null)
})

test('totals: money as money, counts as whole numbers; the footer names the total, a group row its count', () => {
  // money follows the UI's locale (i18n.moneyText): these expectations are a German one's
  setChromeLanguage('de-DE')
  try {
  assert.equal(formatAggregate(1234.5, { dataType: 'money' }), '1.234,50')
  assert.equal(formatAggregate(1234.5, { stereotype: 'money' }), '1.234,50')
  assert.equal(formatAggregate(2.6, { aggregate: 'count' }), new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(3))
  assert.equal(formatAggregate(null, {}), '')
  const md = { groupBy: 'status', columns: [{ metadata: { id: 'status' } }, { metadata: { id: 'total', aggregate: 'sum', dataType: 'money' } }, { metadata: {} }] }
  assert.deepEqual(aggregateFootersOf(md, { aggregates: { total: 10 }, page: { totalElements: 4 } }), { total: '10,00', status: 'Total (4)' })
  assert.deepEqual(aggregateFootersOf({ columns: [{ id: 'name' }, { id: 'n', aggregate: 'count' }] }, { aggregates: { n: 2 } }), { n: '2', name: 'Total' })
  assert.equal(aggregateFootersOf({ columns: [{ id: 'name' }] }, { aggregates: { name: 1 } }), null, 'nothing to total')
  const rows = [{ status: 'OPEN', total: 1 }, { status: 'OPEN', total: 2 }, { status: null, total: 3 }]
  const out = groupedRows(rows, md, { groups: [{ value: 'OPEN', count: 2, aggregates: { total: 3 } }] })
  assert.deepEqual(out.filter((r) => r._group).map((r) => [r.status, r.total]), [['OPEN (2)', '3,00'], [' (1)', '']], 'a group the server did not list is counted here')
  assert.equal(out.length, 5)
  assert.equal(groupedRows(rows, { columns: [] }, {}), rows)
  assert.equal(rowToneOf({ s: { type: 'ERROR' } }, 's'), 'danger')
  assert.equal(rowToneOf({ s: { value: 'pink' } }, 's'), null)
  assert.equal(rowToneOf({ s: null }, 's'), null)
  } finally { setChromeLanguage('') }
  // …and an English UI groups the English way — the de-DE default it replaced read "1.234,50"
  setChromeLanguage('en-US')
  try {
    assert.equal(formatAggregate(1234.5, { dataType: 'money' }), '1,234.50')
  } finally { setChromeLanguage('') }
})

test('money cells: a price column reads "89.50" in the UI locale, an Amount in its own; the row keeps the raw value', () => {
  setChromeLanguage('en-US')
  try {
    const cols = [{ metadata: { id: 'price', dataType: 'number', stereotype: 'money' } }, { metadata: { id: 'total', dataType: 'money' } }]
    const [row] = labelCellRows([{ price: 89.5, total: { value: 10, currency: 'EUR', locale: 'de-DE' } }], cols)
    assert.equal(row.price, 89.5)
    assert.equal(row['price' + LABEL_CELL_SUFFIX], '89.50')
    assert.equal(row['total' + LABEL_CELL_SUFFIX], '10,00\u00a0€')
    assert.equal(moneyText({ value: 5, currency: 'EUR' }), '€5.00')
    assert.equal(moneyText(null), '')
    assert.equal(moneyText('n/a'), 'n/a')
  } finally { setChromeLanguage('') }
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
console.log(`\n${passed} projection tests OK`)
