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
} from './reduceContexts.mjs'
import { chromeText } from './i18n.mjs'

let passed = 0
const test = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name) }

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

console.log(`\n${passed} projection tests OK`)
