// Tests of the display components added for GA (core/display.mjs, displayDom.mjs, reproject.mjs,
// the Markdown tables and the Delta reader of richtext.mjs, the new field widgets): every wire type
// that had no Redwood view now projects to an atom, each atom carries what its template binds, and
// an unknown type shows a placeholder instead of vanishing.
// Run: node test-display.mjs (npm test runs it with the other suites).
import './test-locale.mjs' // first: off English the suite reruns in English (see the module)
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  islandContentOf, kanbanAtomOf, timelineAtomOf, pricingAtomOf, orgChartAtomOf, heatmapAtomOf, heatLevelOf,
  funnelAtomOf, featureGridAtomOf, testimonialsAtomOf, calloutAtomOf, commentsAtomOf, fileListAtomOf, fileIconOf,
  checklistAtomOf, comparisonAtomOf, processMonitorAtomOf, skeletonAtomOf, iconAtomOf, menuItemsOf, menuChoiceOf,
  menuTargetOf, dispatchOf, menuBarAtomOf, contextMenuAtomOf, directoryAtomOf, messageListAtomOf, messageInputAtomOf,
  messageSendOf, chatAtomOf, resultAtomOf, cookieConsentAtomOf, hasConsentCookie, confirmOpenOf, confirmDialogAtomOf,
  breadcrumbsAtomOf, workflowAtomOf, workflowOrderOf, formEditorFieldsOf, bpmnDiagramOf, bpmnAtomOf, componentHtmlOf,
  flattenTreeRows, gridPageOf, autoFitColClass, AUTO_FIT_DEFAULT, unsupportedAtomOf, VISITOR_PASS_THROUGH, safeHref, toneOf, cssColorOf,
  setUiValue, setPanelExpanded, carouselPagerAtomOf, microFrontendOf, tagSurfaceActions, heroAtomOf, emptyStateAtomOf, progressBarAtomOf,
  registerCustomComponent, customComponentRegistered, layoutFieldOf, HOST_ID, taskQueueOf, emptyStateOf, hostContentShown, pageToolbarOf,
  welcomeOf, returnedConfirmDialogsOf, reduceContexts, withFormActions, hostContentOf, wizardForwardOf, itemOverviewOf,
  summarizeHost, pageSubtitleOf, listingHeaderBlocksOf, buttonRouteOf, fileBytesOf, fileMimeOf,
} from './reduceContexts.mjs'
import { attachmentDownloadOf } from './files.mjs'
import { absoluteUrlOf } from './core/overviews.mjs'
import { bannerNotificationOf } from './notify.mjs'
import { isErrorAnswer, onErrorTriggers } from './polling.mjs'
import { markdownToHtml, deltaOps, deltaToHtml, richTextHtml, richTextValueOf, sanitizeHtml } from './richtext.mjs'
import { hexColorOf } from './inputs.mjs'
import { reprojectedContentOf } from './reproject.mjs'
import { chatTurnsOf } from './displayDom.mjs'
import { REDWOOD_COVERAGE } from './coverage.mjs'
import { setChromeLanguage, CHROME_TEXTS } from './i18n.mjs'
import { ruleSurfacesOf, surfaceOfElement } from './rules.mjs'

const here = dirname(fileURLToPath(import.meta.url))
let passed = 0
const test = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name) }
const node = (metadata, children = [], id = '') => ({ type: 'ClientSide', id: id || metadata.id || '', metadata, children })
const atomsOf = (tree, state = {}, data = {}, extra = {}) =>
  (islandContentOf({ tree, state, data, ...extra }) || []).flatMap((b) => b.items || [])
const webApp = (rel) => readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', rel), 'utf8')

test('every wire type is classified and none is left unrendered', () => {
  const none = Object.entries(REDWOOD_COVERAGE).filter(([, c]) => c.status === 'none').map(([t]) => t)
  assert.deepEqual(none, [])
})

test('every type claimed rendered really projects without the "Unsupported component" placeholder', () => {
  // the gate behind coverage.mjs is not a string search: a minimal node of each claimed type goes
  // through the real visitor, and a claim the visitor answers with the placeholder fails here
  const placeholders = Object.entries(REDWOOD_COVERAGE)
    .filter(([, c]) => c.status !== 'none')
    .filter(([t]) => atomsOf(node({ type: 'VerticalLayout' }, [node({ type: t }, [], 'n1')])).some((a) => a.isUnsupported))
    .map(([t]) => t)
  assert.deepEqual(placeholders, [])
})

test('containers and parts reach the fall-through without a placeholder; anything else gets one', () => {
  for (const [t, c] of Object.entries(REDWOOD_COVERAGE)) {
    if (c.status === 'layout' || c.status === 'part') assert.ok(VISITOR_PASS_THROUGH[t], t + ' should pass through')
  }
  const atoms = atomsOf(node({ type: 'VerticalLayout' }, [node({ type: 'ShinyNewThing' }, [node({ type: 'Text', text: 'child' })], 'x1')]))
  assert.ok(atoms[0].isUnsupported && /ShinyNewThing/.test(atoms[0].text) && /x1/.test(atoms[0].text))
  assert.equal(atoms[1].text, 'child', 'its children still render')
  assert.ok(!atomsOf(node({ type: 'VerticalLayout' }, [node({ type: 'Text', text: 'a' })])).some((a) => a.isUnsupported))
})

test('every wire type with a projection gets its atom from the visitor', () => {
  const cases = {
    Kanban: [{ columns: [{ title: 'To do', cards: [{ id: 'c', title: 'C' }] }] }, 'isKanban'],
    Timeline: [{ items: [{ title: 'Created' }] }, 'isTimeline'],
    PricingTable: [{ plans: [{ name: 'Pro', price: '9' }] }, 'isPricing'],
    OrgChart: [{ root: { title: 'CEO', children: [{ title: 'CTO' }] } }, 'isOrgChart'],
    Heatmap: [{ cells: [{ date: '2026-01-05', value: 3 }] }, 'isHeatmap'],
    Funnel: [{ stages: [{ label: 'Visits', value: 100 }] }, 'isFunnel'],
    FeatureGrid: [{ features: [{ title: 'Fast' }], columns: 3 }, 'isFeatureGrid'],
    Testimonials: [{ items: [{ quote: 'Great', author: 'Ada', rating: 5 }] }, 'isTestimonials'],
    CalloutCard: [{ title: 'Upgrade', actionId: 'go' }, 'isCallout'],
    CommentThread: [{ comments: [{ author: 'Ada', text: 'hi' }] }, 'isComments'],
    FileList: [{ files: [{ name: 'a.pdf', url: '/files/a.pdf' }] }, 'isFileList'],
    Checklist: [{ title: 'Steps', items: [{ id: '1', label: 'One' }] }, 'isChecklist'],
    ComparisonCard: [{ title: 'Revenue', leftValue: '1', rightValue: '2' }, 'isComparison'],
    ProcessMonitor: [{ items: [{ name: 'Sync' }] }, 'isProcessMonitor'],
    Skeleton: [{ variant: 'card', count: 2 }, 'isSkeleton'],
    Icon: [{ icon: 'vaadin:calendar' }, 'isIcon'],
    MenuBar: [{ options: [{ label: 'File', actionId: 'file' }] }, 'isMenuBar'],
    Directory: [{ menu: [{ label: 'Docs', submenus: [{ label: 'Intro', path: '/intro' }] }] }, 'isDirectory'],
    MessageList: [{ items: [{ text: 'hi', userName: 'Ada' }] }, 'isMessages'],
    MessageInput: [{ actionId: 'send' }, 'isMessageInput'],
    Chat: [{ sseUrl: '/agent/stream' }, 'isChatComponent'],
    Bpmn: [{ xml: '<definitions><process><startEvent id="s" name="Start"/></process></definitions>' }, 'isBpmn'],
    Workflow: [{ value: '{"name":"W","steps":[{"id":"a","type":"ACTION","name":"A"}]}' }, 'isWorkflow'],
    Result: [{ title: 'Done', resultType: 'Success' }, 'isResult'],
    CookieConsent: [{ cookieName: 'c', message: 'Cookies' }, 'isCookieConsent'],
    Breadcrumbs: [{ currentItemText: 'Here', breadcrumbs: [{ text: 'Home', link: '/' }] }, 'isBreadcrumbs'],
    Notification: [{ title: 'Heads up', text: 'x' }, 'isNotice'],
    MicroFrontend: [{ baseUrl: 'https://other', route: '/orders' }, 'isSubresource'],
    EmptyState: [{ title: 'Nothing yet', actionId: 'create', actionLabel: 'Create' }, 'isEmptyStateAtom'],
    ProgressBar: [{ value: 0.5, max: 1, text: 'Half' }, 'isProgressBar'],
    HeroSection: [{ title: 'Welcome' }, 'isHero'],
  }
  for (const [type, [md, flag]] of Object.entries(cases)) {
    // an EmptyState that is the page's first one is the page-level band: inside an island here
    const atoms = atomsOf(node({ type: 'VerticalLayout' }, [node({ type, ...md }, [], 'n1')]))
    assert.ok(atoms.some((a) => a[flag]), type + ' → ' + flag)
    assert.ok(!atoms.some((a) => a.isUnsupported), type + ' is not "unsupported"')
  }
})

test('Kanban: columns with counts and tones; clickable cards send _clickedCard', () => {
  const k = kanbanAtomOf({ columns: [{ title: 'Doing', color: 'warning', cards: [
    { id: 'a', title: 'A', badge: 'P1', color: 'danger', actionId: 'open' }, { id: 'b', title: 'B' }] }] })
  const col = k.columns[0]
  assert.equal(col.countText, '2')
  assert.match(col.headerClass, /mateu-tone-warning/)
  assert.deepEqual([col.cards[0].clickable, col.cards[1].clickable, col.cards[1].plain], [true, false, true])
  assert.equal(col.cards[0].parameters._clickedCard.id, 'a')
  assert.match(col.cards[0].badgeClass, /danger/)
  assert.deepEqual(kanbanAtomOf({ columns: [{ color: '#ff0000', cards: [] }] }).columns[0].headerStyle, { borderTopColor: '#ff0000' })
})

test('colours: a theme tone or a CSS colour; anything else is ignored', () => {
  assert.equal(toneOf('Error'), 'danger')
  assert.equal(toneOf('purple'), '')
  assert.equal(cssColorOf('purple'), 'purple')
  assert.equal(cssColorOf('red; background:url(x)'), '')
})

test('Timeline, Pricing, Org chart, Feature grid, Testimonials, Callout, Comments', () => {
  const t = timelineAtomOf({ items: [{ title: 'Paid', icon: 'vaadin:check', actionId: 'see' }, { title: 'x', icon: '🎉' }] })
  assert.equal(t.items[0].parameters._clickedItem.title, 'Paid')
  assert.equal(t.items[1].glyph, '🎉')
  const p = pricingAtomOf({ plans: [{ name: 'A' }, { name: 'B', featured: true, actionId: 'buy', ctaLabel: 'Buy' }] })
  assert.ok(!p.plans[0].hasCta && p.plans[1].hasCta && p.plans[1].chroming === 'callToAction')
  assert.match(p.plans[1].cardClass, /mateu-pricing-featured/)
  const o = orgChartAtomOf({ root: { id: 'r', title: 'Ada Lovelace', actionId: 'open', children: [{ title: 'B', children: [{ title: 'C' }] }] } })
  assert.deepEqual(o.nodes.map((n) => n.depth), [0, 1, 2])
  assert.equal(o.nodes[0].initials, 'AL')
  assert.ok(!('children' in o.nodes[0].parameters._clickedNode), 'the node without its subtree')
  assert.deepEqual(o.nodes[2].rowStyle, { paddingInlineStart: '4rem' })
  const f = featureGridAtomOf({ columns: 4, features: [{ title: 'x', actionId: 'go' }] })
  assert.match(f.features[0].colClass, /oj-md-3/)
  const ts = testimonialsAtomOf({ items: [{ quote: 'q', author: 'Bo', rating: 9 }] })
  assert.equal(ts.items[0].rating, 5)
  assert.match(calloutAtomOf({ theme: 'success' }).panelClass, /mateu-tone-success/)
  const c = commentsAtomOf({ comments: [{ author: 'A', text: '1', replies: [{ author: 'B', text: '2' }] }] })
  assert.deepEqual(c.comments.map((x) => x.depth), [0, 1])
})

test('Heatmap: a column per week from Monday, levels relative to the maximum', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 8].map((v) => heatLevelOf(v, 8)), [0, 1, 1, 2, 2, 4])
  const h = heatmapAtomOf({ cells: [{ date: '2026-01-07', value: 2 }, { date: '2026-01-14', value: 8, label: 'Busy' }] })
  assert.ok(h.dated)
  assert.equal(h.weeks.length, 2)
  assert.equal(h.weeks[0].days.length, 7)
  // 2026-01-07 is a Wednesday: index 2 of its week
  assert.match(h.weeks[0].days[2].cls, /mateu-heat-1/)
  assert.equal(h.weeks[1].days[2].title, 'Busy')
  assert.match(h.weeks[0].days[0].cls, /mateu-heat-none/)
  const flat = heatmapAtomOf({ cells: [{ date: 'Mon', value: 1 }] })
  assert.ok(!flat.dated && flat.flat.length === 1)
})

test('Funnel: an oj-chart funnel series per stage; colours only when they are colours', () => {
  const f = funnelAtomOf({ stages: [{ label: 'Visits', value: 100, color: '#00f' }, { label: 'Sales', value: '7' }] })
  assert.deepEqual(f.items.map((i) => [i.series, i.value, i.color]), [['Visits', 100, '#00f'], ['Sales', 7, undefined]])
})

test('FileList: icon by type, safe download links, actions send _file', () => {
  assert.equal(fileIconOf('application/pdf', 'x'), 'oj-ux-ico-file-pdf')
  assert.equal(fileIconOf('', 'sheet.xlsx'), 'oj-ux-ico-file-xls')
  const fl = fileListAtomOf({ files: [{ name: 'a', url: 'javascript:alert(1)' }, { name: 'b', url: 'https://x/b.pdf', size: '2 MB', type: 'pdf' }, { name: 'c', actionId: 'open' }] })
  assert.deepEqual(fl.files.map((f) => f.hasHref), [false, true, false])
  assert.equal(fl.files[1].meta, '2 MB · pdf')
  assert.equal(fl.files[2].parameters._file.name, 'c')
  assert.equal(safeHref('data:text/html,x'), '')
  assert.equal(safeHref('/orders/1'), '/orders/1')
})

test('Checklist: oj-checkboxset value, progress and the toggle parameters', () => {
  const c = checklistAtomOf({ title: 'Go live', items: [{ id: '1', label: 'A', done: true, actionId: 't' }, { id: '2', label: 'B' }] })
  assert.equal(c.progressText, '1 / 2')
  assert.equal(c.progressValue, 50)
  assert.deepEqual(c.items[0].value, ['done'])
  assert.equal(c.items[0].parameters._done, false)
  assert.ok(c.items[1].readonly, 'no action → read only')
})

test('Comparison, ProcessMonitor, Skeleton, Icon', () => {
  const cmp = comparisonAtomOf({ delta: '+5%', trend: 'up' })
  assert.match(cmp.deltaClass, /success/)
  assert.equal(cmp.trendIcon, 'oj-ux-ico-arrow-up')
  const pm = processMonitorAtomOf({ items: [{ name: 'Sync', systems: ['A', 'B'], ok: 3, status: 'Error', actionId: 'retry', actionLabel: 'Retry' }] })
  assert.equal(pm.items[0].systems, 'A · B')
  assert.match(pm.items[0].statusClass, /danger/)
  assert.ok(pm.items[0].hasAction)
  assert.equal(skeletonAtomOf({ variant: 'grid', count: 2 }).shapes.length, 8)
  assert.equal(iconAtomOf({ icon: '⭐' }).glyph, '⭐')
  assert.match(iconAtomOf({ icon: 'vaadin:no-such-icon' }).iconClass, /^oj-ux-ico-/)
})

test('menus: items flatten one submenu level, a choice is an action, a route or a url', () => {
  const items = menuItemsOf([
    { label: 'New', actionId: 'new' },
    { separator: true },
    { label: 'Go', submenus: [{ label: 'Orders', route: 'orders' }, { label: 'Site', path: 'https://mateu.io' }] },
    { label: 'Hidden', actionId: 'h', visible: false },
    { label: 'Nothing' },
  ])
  assert.deepEqual(items.filter((i) => i.isItem).map((i) => i.label), ['New', 'Go › Orders', 'Go › Site', 'Nothing'])
  assert.deepEqual(menuChoiceOf(items, items[0].value), { kind: 'action', actionId: 'new', parameters: {} })
  assert.deepEqual(menuChoiceOf(items, items[2].value), { kind: 'navigate', route: '/orders' })
  assert.deepEqual(menuChoiceOf(items, items[3].value), { kind: 'url', url: 'https://mateu.io' })
  assert.equal(menuChoiceOf(items, items[4].value), null, 'nothing to do: disabled')
  assert.deepEqual(dispatchOf(menuTargetOf({ actionId: 'x' }), 'island'),
    { chain: 'dispatchIslandAction', params: { actionId: 'x', parameters: {} } })
  assert.equal(dispatchOf(menuTargetOf({ actionId: 'x' }), 'host').chain, 'dispatchHostBlockAction')
  const bar = menuBarAtomOf({ options: [{ label: 'A', actionId: 'a' }, { label: 'B', route: '/b' }, { label: 'C', submenus: [{ label: 'D', actionId: 'd' }] }] })
  assert.deepEqual(bar.entries.map((e) => [e.isAction, e.isLink, e.isMenu]), [[true, false, false], [false, true, false], [false, false, true]])
  assert.equal(bar.entries[1].href, '/b')
  assert.ok(contextMenuAtomOf({ menu: [{ label: 'X', actionId: 'x' }] }).rightClick)
  const dir = directoryAtomOf({ menu: [{ label: 'Docs', submenus: [{ label: 'Intro', path: '/intro' }, { label: 'Bad', path: 'javascript:x' }] }] })
  assert.deepEqual(dir.groups[0].links.map((l) => l.href), ['/intro', ''])
})

test('ContextMenu: its content first, then the menu', () => {
  const atoms = atomsOf(node({ type: 'ContextMenu', wrapped: node({ type: 'Text', text: 'row' }), menu: [{ label: 'Delete', actionId: 'del' }] }))
  assert.equal(atoms[0].text, 'row')
  assert.ok(atoms[1].isContextMenu)
})

test('MessageList / MessageInput / Chat component', () => {
  const ml = messageListAtomOf({ items: [{ text: 'hi', userName: 'Grace Hopper', userColorIndex: 8 }] })
  assert.equal(ml.items[0].initials, 'GH')
  assert.equal(ml.items[0].avatarClass, 'mateu-avatar-tone-2')
  const mi = messageInputAtomOf({ actionId: 'send' }, 'box 1')
  assert.equal(mi.inputId, 'mateuMsg-box_1')
  assert.deepEqual(messageSendOf('  hello ', 'send'), { actionId: 'send', parameters: { message: 'hello' } })
  assert.equal(messageSendOf('   ', 'send'), null)
  assert.equal(messageSendOf('x', ''), null)
  assert.equal(chatAtomOf({ sseUrl: 'https://agent/stream' }, 'c').sseUrl, 'https://agent/stream')
  const turns = chatTurnsOf([{ role: 'user', text: '<b>hi</b>' }, { role: 'assistant', text: '**ok** <script>x</script>' }])
  assert.equal(turns[0].html, '<p>&lt;b&gt;hi&lt;/b&gt;</p>')
  assert.ok(/<strong>ok<\/strong>/.test(turns[1].html) && !/<script/.test(turns[1].html))
})

test('Result: icon by type, links by destination type, the next action on the atom', () => {
  const r = resultAtomOf({ title: 'Saved', resultType: 'Error', interestingLinks: [
    { type: 'Url', value: 'https://x', description: 'Docs' }, { type: 'ActionId', value: 'retry', description: 'Retry' },
    { type: 'View', value: '/orders', description: 'Orders' }], nowTo: { type: 'ActionId', value: 'home', description: 'Home' } })
  assert.match(r.panelClass, /mateu-tone-danger/)
  assert.deepEqual(r.links.map((l) => [l.isLink, l.isAction, l.href || l.actionId]), [[true, false, 'https://x'], [false, true, 'retry'], [true, false, '/orders']])
  assert.equal(r.actionId, 'home')
})

test('CookieConsent and its cookie', () => {
  const c = cookieConsentAtomOf({ cookieName: 'ok', position: 'TOP', learnMoreLink: 'javascript:1' })
  assert.match(c.bandClass, /mateu-cookie-top/)
  assert.ok(!c.hasLearnMore)
  assert.ok(hasConsentCookie('a=1; ok=dismiss', 'ok'))
  assert.ok(!hasConsentCookie('okay=1', 'ok'))
})

test('ConfirmDialog: open only while its condition holds; its buttons', () => {
  const state = { confirm: true, n: 3, status: 'DRAFT' }
  assert.ok(confirmOpenOf('${state.confirm}', state))
  assert.ok(confirmOpenOf('state.n > 2', state))
  assert.ok(confirmOpenOf("${state.status === 'DRAFT'}", state))
  assert.ok(!confirmOpenOf('!state.confirm', state))
  assert.ok(!confirmOpenOf('', state))
  const d = confirmDialogAtomOf({ header: 'Sure?', canCancel: true, canReject: true, rejectText: 'Nope', confirmActionId: 'yes', rejectActionId: 'no' }, 'cd', state)
  assert.ok(!d.isConfirmDialog, 'no condition → closed')
  const open = confirmDialogAtomOf({ header: 'Sure?', openedCondition: 'state.confirm', canReject: true, confirmActionId: 'yes', rejectActionId: 'no' }, 'cd', state, (x) => x, ['Delete it?'])
  assert.ok(open.isConfirmDialog)
  assert.deepEqual(open.buttons.map((b) => [b.label, b.actionId]), [['No', 'no'], ['OK', 'yes']])
  assert.deepEqual(open.lines, ['Delete it?'])
})

test('Breadcrumbs, Workflow and FormEditor', () => {
  const b = breadcrumbsAtomOf({ currentItemText: 'Order 1', breadcrumbs: [{ text: 'Orders', link: '/orders' }, { text: 'X' }] })
  assert.deepEqual(b.crumbs.map((c) => [c.hasHref, c.noHref]), [[true, false], [false, true]])
  const order = workflowOrderOf([{ id: 'b', preconditionStepId: 'a' }, { id: 'a' }, { id: 'c', preconditionStepId: 'b' }])
  assert.deepEqual(order.map((s) => s.id), ['a', 'b', 'c'])
  const w = workflowAtomOf({ value: JSON.stringify({ name: 'Onboard', status: 'ACTIVE', steps: [{ id: 'x', name: 'Check', type: 'USER_TASK' }, { id: 'y', name: 'End', type: 'END', preconditionStepId: 'x' }] }) })
  assert.equal(w.steps[1].after, 'After Check')
  assert.equal(w.steps[0].typeLabel, 'User task')
  assert.ok(workflowAtomOf({ value: '{bad' }).isNotice)
  const fe = formEditorFieldsOf({ value: JSON.stringify({ name: 'Signup', fields: [{ id: 'email', label: 'Email', dataType: 'string', required: true }, { id: 'n', dataType: 'integer', stereotype: 'slider' }] }) })
  assert.equal(fe.fields.length, 2)
  const atoms = atomsOf(node({ type: 'FormEditor', value: JSON.stringify({ name: 'Signup', fields: [{ id: 'email', label: 'Email', dataType: 'string' }] }) }))
  assert.ok(atoms.some((a) => a.isFormLayout && a.fields[0].fieldId === 'email'))
})

test('BPMN: shapes from the BPMN-DI, flows from their waypoints', () => {
  const xml = `<bpmn:definitions xmlns:bpmn="x"><bpmn:process id="p">
    <bpmn:startEvent id="s" name="Order received"/><bpmn:userTask id="t" name="Check &amp; approve"/>
    <bpmn:exclusiveGateway id="g"/><bpmn:endEvent id="e" name="Done"/>
    <bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="t"/><bpmn:sequenceFlow id="f2" sourceRef="t" targetRef="g" name="ok"/>
    <bpmn:sequenceFlow id="f3" sourceRef="g" targetRef="e"/></bpmn:process>
    <bpmndi:BPMNDiagram><bpmndi:BPMNPlane>
    <bpmndi:BPMNShape id="s_di" bpmnElement="s"><dc:Bounds x="100" y="100" width="36" height="36"/></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="t_di" bpmnElement="t"><dc:Bounds x="200" y="78" width="100" height="80"/></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="g_di" bpmnElement="g"><dc:Bounds x="350" y="93" width="50" height="50"/></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="e_di" bpmnElement="e"><dc:Bounds x="450" y="100" width="36" height="36"/></bpmndi:BPMNShape>
    <bpmndi:BPMNEdge id="f1_di" bpmnElement="f1"><di:waypoint x="136" y="118"/><di:waypoint x="200" y="118"/></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>`
  const d = bpmnDiagramOf(xml)
  assert.deepEqual(d.nodes.map((n) => [n.id, n.kind]), [['s', 'event'], ['t', 'task'], ['g', 'gateway'], ['e', 'end']])
  assert.equal(d.nodes[1].label, 'Check & approve')
  assert.deepEqual(d.nodes[1].x, 200)
  assert.deepEqual(d.flows[0].points, [[136, 118], [200, 118]], 'from its waypoints')
  assert.equal(d.flows[1].points.length, 2, 'no edge in the DI → from the shapes')
  assert.equal(d.flows[1].label, 'ok')
  // without DI: laid out left to right by the flows
  const plain = bpmnDiagramOf('<definitions><process><startEvent id="a"/><task id="b" name="B"/><endEvent id="c"/><sequenceFlow id="x" sourceRef="a" targetRef="b"/><sequenceFlow id="y" sourceRef="b" targetRef="c"/></process></definitions>')
  assert.ok(plain.nodes[0].x < plain.nodes[1].x && plain.nodes[1].x < plain.nodes[2].x)
  assert.equal(plain.flows.length, 2)
  const atom = bpmnAtomOf({ xml }, 'proc 1')
  assert.equal(atom.bpmnId, 'mateuBpmn-proc_1')
  assert.match(atom.ariaLabel, /Order received/)
})

test('Popover rich content: structure as sanitised HTML', () => {
  const html = componentHtmlOf(node({ type: 'VerticalLayout' }, [
    node({ type: 'Text', text: 'Title', container: 'h3' }), node({ type: 'Text', text: 'Hi ${state.name}' }),
    node({ type: 'BulletedList', items: ['a', '<b>'] }), node({ type: 'Anchor', url: 'javascript:alert(1)', text: 'bad' }),
  ]), (t) => t.replace('${state.name}', 'Ada'))
  assert.equal(html, '<div><h4>Title</h4><p>Hi Ada</p><ul><li>a</li><li>&lt;b&gt;</li></ul><p><a>bad</a></p></div>')
  const [pop] = atomsOf(node({ type: 'Popover', trigger: 'click', wrapped: node({ type: 'Text', text: 'Rate' }), content: node({ type: 'Markdown', markdown: '**Gold**' }) }))
  assert.ok(pop.isPopover && /<strong>Gold<\/strong>/.test(pop.html))
})

test('Tooltip: on the wrapped button, on an inline text, or an info marker after the component', () => {
  // (a content of buttons only is not display content: a text beside it)
  const [, btns] = atomsOf(node({ type: 'VerticalLayout' }, [node({ type: 'Text', text: 't' }), node({ type: 'Tooltip', text: 'Saves it', wrapped: node({ type: 'Button', label: 'Save', actionId: 'save' }) })]))
  assert.equal(btns.buttons[0].tooltip, 'Saves it')
  const [inline] = atomsOf(node({ type: 'Tooltip', text: 'More', wrapped: node({ type: 'Text', text: 'Rate' }) }))
  assert.deepEqual([inline.isTooltip, inline.label, inline.text], [true, 'Rate', 'More'])
  const atoms = atomsOf(node({ type: 'Tooltip', text: 'Tip', wrapped: node({ type: 'Image', src: '/a.png' }) }))
  assert.ok(atoms[0].isImage && atoms[1].isTooltip && atoms[1].infoOnly)
})

test('Image: the declared alt text reaches the <img> (and a gallery slide)', () => {
  const [img] = atomsOf(node({ type: 'Image', src: '/logo.png', alt: 'Company logo' }))
  assert.deepEqual([img.isImage, img.alt], [true, 'Company logo'])
  const [bare] = atomsOf(node({ type: 'Image', src: '/logo.png' }))
  assert.equal(bare.alt, '')
  const [gallery] = atomsOf(node({ type: 'CarouselLayout' }, [node({ type: 'Image', src: '/a.png', alt: 'Pool' })]))
  assert.deepEqual(gallery.images.map((i) => i.alt), ['Pool'])
})

test('Faq: a collapsible per question, the answer when open (client state)', () => {
  const faq = node({ type: 'Faq', items: [{ question: 'Q1', answer: '**A1**', open: true }, { question: 'Q2', answer: 'A2' }] }, [], 'faq1')
  let atoms = atomsOf(faq)
  assert.deepEqual(atoms.filter((a) => a.isCollapsible).map((a) => [a.title, a.expanded]), [['Q1', true], ['Q2', false]])
  assert.ok(atoms.some((a) => a.isRichText && /<strong>A1/.test(a.html)))
  setPanelExpanded('faq:faq1:1', true)
  atoms = atomsOf(faq)
  assert.ok(atoms.some((a) => a.isRichText && /A2/.test(a.html)))
})

test('Stepper and VirtualList: their children through the same projection', () => {
  const st = atomsOf(node({ type: 'Stepper' }, [node({ type: 'Text', text: 'one', title: 'First' }), node({ type: 'Text', text: 'two' })]))
  assert.deepEqual(st.filter((a) => a.isStepHeader).map((a) => a.number), ['1', '2'])
  const vl = atomsOf(node({ type: 'VirtualList', page: { content: [{ metadata: { type: 'Text', text: 'item' } }, { id: 7, name: 'Ada', age: 36 }, 'plain'] } }))
  assert.equal(vl[0].text, 'item')
  assert.deepEqual([vl[1].label, vl[1].value], ['Ada', 'age: 36'])
  assert.equal(vl[2].text, 'plain')
})

test('Grid: client-side paging and tree rows with disclosure', () => {
  const rows = Array.from({ length: 23 }, (_, i) => ({ id: i }))
  const p = gridPageOf(rows, 10, 2)
  assert.deepEqual([p.rows.length, p.rangeText, p.hasPrev, p.hasNext], [3, '21–23 of 23', true, false])
  assert.equal(gridPageOf(rows, 0, 0).paged, false)
  const tree = [{ name: 'A', children: [{ name: 'A1' }, { name: 'A2', children: [{ name: 'A2a' }] }] }, { name: 'B' }]
  assert.deepEqual(flattenTreeRows(tree, () => false).map((r) => r.name), ['A', 'B'])
  const all = flattenTreeRows(tree, () => true)
  assert.deepEqual(all.map((r) => [r.name, r.__depth]), [['A', 0], ['A1', 1], ['A2', 1], ['A2a', 2], ['B', 0]])
  assert.ok(!('children' in all[0]))
  const grid = (extra) => node({ type: 'Grid', content: [node({ type: 'GridColumn', id: 'name', label: 'Name' })], page: { content: tree }, ...extra }, [], 'g1')
  let [atom] = atomsOf(grid({ tree: true }))
  assert.deepEqual(atom.rows.map((r) => r.name), ['A', 'B'])
  assert.equal(atom.columns[0].template, 'cellTreeToggle')
  assert.equal(atom.rows[0].__uiKey, 'grid:g1:open:0')
  setUiValue('grid:g1:open:0', true)
  ;[atom] = atomsOf(grid({ tree: true }))
  assert.deepEqual(atom.rows.map((r) => r.name), ['A', 'A1', 'A2', 'B'])
  const paged = node({ type: 'Grid', size: 10, content: [node({ type: 'GridColumn', id: 'id' })], page: { content: rows } }, [], 'g2')
  ;[atom] = atomsOf(paged)
  assert.deepEqual([atom.rows.length, atom.paged, atom.pager[1].uiValue], [10, true, 1])
  setUiValue('grid:g2:page', 2)
  ;[atom] = atomsOf(paged)
  assert.equal(atom.rows.length, 3)
})

test('CarouselLayout of content: one slide and its pager', () => {
  const car = node({ type: 'CarouselLayout', loop: false }, [node({ type: 'Text', text: 's1' }), node({ type: 'Text', text: 's2' })], 'car1')
  let atoms = atomsOf(car)
  assert.ok(atoms[0].isCarouselPager)
  assert.deepEqual(atoms.slice(1).map((a) => a.text), ['s1'])
  assert.ok(atoms[0].nav[0].disabled && !atoms[0].nav[1].disabled)
  setUiValue('carousel:car1', 1)
  atoms = atomsOf(car)
  assert.deepEqual(atoms.slice(1).map((a) => a.text), ['s2'])
  assert.equal(atoms[0].positionText, '2 / 2')
})

test('ResponsiveGrid auto-fit: as many tiles per row as fit at each breakpoint', () => {
  assert.equal(autoFitColClass('repeat(auto-fit, minmax(16rem, 1fr))'),
    'oj-flex-item oj-sm-12 oj-md-4 oj-lg-3 oj-xl-2 oj-sm-padding-2x-end oj-sm-padding-2x-bottom')
  assert.equal(autoFitColClass('1fr 2fr'), null)
  assert.match(autoFitColClass(AUTO_FIT_DEFAULT), /oj-md-4 oj-lg-3/, 'the web default (min(100%, 16rem))')
  const plain = islandContentOf({ tree: node({ type: 'ResponsiveGrid' }, [node({ type: 'Text', text: 'a' }), node({ type: 'Text', text: 'b' })]), state: {} })
  assert.equal(plain.length, 2, 'no columns declared: the auto-fit default, not a stack')
  const atoms = islandContentOf({ tree: node({ type: 'ResponsiveGrid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' },
    [node({ type: 'Text', text: 'a' }), node({ type: 'Text', text: 'b' })]), state: {} })
  assert.equal(atoms.length, 2)
  assert.match(atoms[0].colClass, /oj-md-6/)
})

test('Markdown: GFM tables and allowed inline HTML, still sanitised', () => {
  const html = markdownToHtml('| A | B |\n|:-:|--:|\n| 1 | <b>2</b> |\n\n<i>x</i> <img src=x onerror=1> <script>bad()</script>')
  assert.match(html, /<table><thead><tr><th align="center">A<\/th><th align="right">B<\/th><\/tr><\/thead><tbody><tr><td align="center">1<\/td><td align="right"><b>2<\/b><\/td><\/tr><\/tbody><\/table>/)
  assert.match(html, /<i>x<\/i>/)
  assert.ok(!/<img|<script/.test(html))
  assert.equal(sanitizeHtml('<td align="javascript:x">1</td>'), '<td>1</td>')
})

test('richText: HTML as it is, a legacy Quill Delta converted; the editor stores sanitised HTML', () => {
  const delta = JSON.stringify({ ops: [{ insert: 'Title' }, { insert: '\n', attributes: { header: 2 } }, { insert: 'bold', attributes: { bold: true } }, { insert: ' and ' }, { insert: 'link', attributes: { link: 'javascript:x' } }, { insert: '\nA\n', attributes: { list: 'bullet' } }] })
  assert.ok(deltaOps(delta))
  assert.equal(deltaOps('[not json'), null)
  assert.equal(deltaOps('<p>x</p>'), null)
  assert.equal(richTextHtml(delta), '<h2>Title</h2><ul><li><strong>bold</strong> and link</li><li>A</li></ul>')
  assert.equal(deltaToHtml([{ insert: 'x\n', attributes: { blockquote: true } }]), '<blockquote>x</blockquote>')
  assert.equal(richTextHtml('<p>keep</p>'), '<p>keep</p>')
  assert.equal(richTextValueOf('<p><br></p>'), '')
  assert.equal(richTextValueOf('<p onclick="x">hi</p>'), '<p>hi</p>')
})

test('field widgets: slider, stars, colour and the rich text editor', () => {
  const md = (extra) => ({ type: 'FormField', fieldId: 'x', label: 'X', dataType: 'integer', ...extra })
  const slider = layoutFieldOf(md({ stereotype: 'slider', sliderMin: 10, sliderMax: 50, step: 5 }), { x: '20' })
  assert.deepEqual([slider.isSlider, slider.min, slider.max, slider.step, slider.value], [true, 10, 50, 5, 20])
  const stars = layoutFieldOf(md({ stereotype: 'stars' }), { x: 4 })
  assert.deepEqual([stars.isStars, stars.max, stars.value, stars.isNumber], [true, 5, 4, false])
  // a tree select offers its nested options (leaves only when asked) and keeps a nested value
  const tree = [{ value: 'es', label: 'Spain', children: [{ value: 'mca', label: 'Mallorca' }] }, { value: 'pt', label: 'Portugal' }]
  const zone = layoutFieldOf(md({ dataType: 'string', stereotype: 'treeSelect', treeLeavesOnly: true, options: tree }), { x: 'mca' })
  assert.deepEqual([zone.isSelect, zone.value, zone.options.map((o) => o.value)], [true, 'mca', ['mca', 'pt']])
  // @PlainText / @Badge present a value: never an editable input
  assert.equal(layoutFieldOf(md({ dataType: 'string', stereotype: 'plainText' }), { x: 'R-1' }).readonly, true)
  assert.equal(layoutFieldOf(md({ dataType: 'bool', stereotype: 'badge' }), { x: true }).readonly, true)
  // a read-only password shows a fixed mask (an editable one keeps its value to edit)
  assert.equal(layoutFieldOf(md({ dataType: 'string', stereotype: 'password', readOnly: true }), { x: 'hunter2' }).value, '••••••••')
  assert.equal(layoutFieldOf(md({ dataType: 'string', stereotype: 'password', readOnly: true }), { x: '' }).value, null)
  assert.equal(layoutFieldOf(md({ dataType: 'string', stereotype: 'password' }), { x: 'hunter2' }).value, 'hunter2')
  // an EDITABLE password is a masked input (oj-input-password), never the plain text input
  const secret = layoutFieldOf(md({ dataType: 'string', stereotype: 'password' }), { x: 'hunter2' })
  assert.deepEqual([secret.isPassword, secret.isText, secret.readonly], [true, false, false])
  assert.equal(layoutFieldOf(md({ dataType: 'string', stereotype: 'password', readOnly: true }), { x: 'hunter2' }).isPassword, false)
  assert.equal(layoutFieldOf(md({ dataType: 'string' }), { x: 'a' }).isPassword, false)
  // …and every copy of the field widgets in the page draws it (one per isText copy)
  const page = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page.html'), 'utf8')
  const count = (re) => (page.match(re) || []).length
  assert.ok(count(/data\.isPassword \]\]/g) > 0)
  assert.equal(count(/data\.isPassword \]\]/g), count(/data\.isText \]\]/g))
  assert.equal(count(/<oj-input-password\b/g), count(/data\.isPassword \]\]/g))
  // the wire sends sliderMax 100 on every field: a rating is still five stars
  assert.equal(layoutFieldOf(md({ stereotype: 'stars', sliderMax: 100 }), { x: 3 }).max, 5)
  // a LocalTime is drawn (as text), and an Amount shows its value
  const time = layoutFieldOf(md({ dataType: 'time' }), { x: '10:30' })
  assert.deepEqual([!!time, time && time.value], [true, '10:30'])
  const amount = layoutFieldOf(md({ dataType: 'money', stereotype: 'money' }), { x: { currency: 'EUR', value: 25.5, locale: 'de-DE' } })
  assert.deepEqual([amount.isMoney, amount.value], [true, 25.5])
  assert.ok(layoutFieldOf(md({ dataType: 'string', stereotype: 'color' }), { x: '#fff' }).isColor)
  assert.ok(layoutFieldOf(md({ dataType: 'string', stereotype: 'richText' }), {}).isRichEditor)
  assert.equal(hexColorOf('#ABC'), '#aabbcc')
  assert.equal(hexColorOf('rgb(255, 0, 16)'), '#ff0010')
  assert.equal(hexColorOf('red'), '')
})

test('a wizard step leaves Next to the guided process but keeps Back and Save', () => {
  // a Draftable wizard's row is Back | Save | Save and close | Next: kept whole, the step showed
  // Next AND the guided process's Continue
  const row = node({ type: 'HorizontalLayout' }, [
    node({ type: 'Button', actionId: 'back', label: 'Back' }), node({ type: 'Button', actionId: 'saveDraft', label: 'Save' }),
    node({ type: 'Button', actionId: 'next', label: 'Next' }),
  ])
  const tree = { type: 'ServerSide', id: 'w', children: [row] }
  const buttons = hostContentOf({ tree, state: {}, data: {} }, null, { forWizard: true })
    .flatMap((b) => b.items || []).filter((a) => a.isButtons).flatMap((a) => a.buttons.map((x) => x.actionId))
  assert.deepEqual(buttons, ['back', 'saveDraft'])
  // and the guided process's Continue is Next, not the first button that is not Back
  assert.equal(wizardForwardOf({ tree, state: {}, data: {} }).actionId, 'next')
  // the last step: Back | Save | Check in — the completion is the footer's, not the row's
  const last = { type: 'ServerSide', id: 'w', children: [node({ type: 'HorizontalLayout' }, [
    node({ type: 'Button', actionId: 'back', label: 'Back' }), node({ type: 'Button', actionId: 'saveDraft', label: 'Save' }),
    node({ type: 'Button', actionId: 'checkIn', label: 'Check in' }),
  ])] }
  assert.deepEqual(hostContentOf({ tree: last, state: {}, data: {} }, null, { forWizard: true })
    .flatMap((b) => b.items || []).filter((a) => a.isButtons).flatMap((a) => a.buttons.map((x) => x.actionId)), ['back', 'saveDraft'])
  assert.equal(wizardForwardOf({ tree: last, state: {}, data: {} }).actionId, 'checkIn')
})

test('a sectioned form with tabs inside one section is not an item overview', () => {
  // any card anywhere counted as the key panel: the form was drawn as its first section plus
  // the tab bar, every other section gone
  const card = (title, children) => node({ type: 'Card', title: { text: title } }, children)
  const tabs = node({ type: 'TabLayout' }, [node({ type: 'Tab', label: 'Room' }, [node({ type: 'Text', text: 'r' })])])
  const form = node({ type: 'VerticalLayout' }, [card('Guests', [node({ type: 'Text', text: 'g' })]), card('Preferences', [tabs]), card('Notes', [])])
  assert.equal(itemOverviewOf({ tree: form, state: {}, data: {} }), null)
  // the archetype: the key card and the tab bar side by side
  const io = node({ type: 'HorizontalLayout' }, [card('Key', [node({ type: 'Text', text: 'k' })]), tabs])
  assert.ok(itemOverviewOf({ tree: io, state: {}, data: {} }))
})

test('a form whose rich blocks replace the generic form keeps its action row', () => {
  // a form with a grid field (or a capture field…) is drawn by its blocks and the generic form
  // is cleared — with it, the form's @Button row: the page had no way to submit
  const blocks = [{ blockClass: 'x', items: [{ isGrid: true }] }]
  const actions = [{ actionId: 'echo', label: 'Echo', chroming: 'outlined' }]
  const out = withFormActions(blocks, actions)
  assert.equal(out.length, 2)
  assert.ok(out[1].isPlain, 'a block the host loop draws')
  assert.deepEqual(out[1].items[0].buttons.map((b) => b.label), ['Echo'])
  // an action a block already draws is not repeated
  const drawn = [{ items: [{ isButtons: true, buttons: [{ actionId: 'echo', label: 'Echo' }] }] }]
  assert.equal(withFormActions(drawn, actions), drawn)
})

test('the new atoms are in every atoms surface of the page, with each variant its listeners', () => {
  const page = webApp('flows/main/pages/main-start-page.html')
  const surfaces = (page.match(/<!-- @atoms /g) || []).length
  for (const flag of ['isKanban', 'isBpmn', 'isChecklist', 'isMenuBar', 'isCarouselPager', 'isCustomSlot', 'isHero'])
    assert.equal(page.split('$current.data.' + flag + ' ]]').length - 1, surfaces, flag)
  assert.ok(page.includes('$listeners.hostMenuAction') && page.includes('$listeners.islandMenuAction'))
  assert.ok(page.includes('$listeners.hostChecklistToggled') && page.includes('$listeners.islandMessageSend'))
  const json = JSON.parse(webApp('flows/main/pages/main-start-page.json'))
  for (const l of ['hostMenuAction', 'islandMenuAction', 'hostChecklistToggled', 'hostMessageSend', 'hostMessageKey', 'uiValueChanged', 'gridTreeToggled'])
    assert.ok(json.eventListeners[l], l)
  assert.ok(json.imports.components['oj-rating-gauge'] && json.imports.components['oj-slider'])
  const shell = webApp('pages/shell-page-chains/loadMateuShell.js')
  for (const install of ['installBpmn', 'installCookieConsent', 'installContextMenus', 'installChatComponents', 'installCustomComponents'])
    assert.ok(shell.includes('bridge.' + install + '()'), install)
})

test('re-projection after client state: host content and the island, not a wizard step', () => {
  const host = { id: HOST_ID, kind: 'host', state: {}, tree: node({ type: 'VerticalLayout' }, [node({ type: 'Text', text: 'hello' })]) }
  const island = { id: 'isl', kind: 'island', state: {}, tree: node({ type: 'VerticalLayout' }, [node({ type: 'Text', text: 'island' })]) }
  const vars = { mateuRegistry: { contexts: { [HOST_ID]: host, isl: island } }, mateuHostContent: [{ items: [] }], mateuIsland: { fields: [] }, mateuIslandId: 'isl' }
  const next = reprojectedContentOf(vars)
  assert.equal(next.hostContent[0].items[0].text, 'hello')
  assert.equal(next.island.content[0].items[0].text, 'island')
  assert.equal(reprojectedContentOf({ ...vars, mateuHostContent: [] }).hostContent, null, 'nothing shown → left alone')
})

test('MicroFrontend: a surface of its own, from its baseUrl; its actions tagged with it', () => {
  const sub = microFrontendOf({ baseUrl: 'https://orders.example/', route: '/orders', serverSideType: 'x.Orders', appState: { tenant: 1 } })
  assert.equal(sub.baseUrl, 'https://orders.example')
  assert.ok(sub.surface && sub.id.startsWith('mfe_'))
  const tagged = tagSurfaceActions([{ isButtons: true, buttons: [{ actionId: 'a', parameters: { actionId: 'keep' } }] }], sub.id)
  assert.equal(tagged[0].buttons[0].surfaceId, sub.id)
  assert.deepEqual(tagged[0].buttons[0].parameters, { actionId: 'keep' }, 'parameters travel untouched')
  class Provider {}
  const p = new Provider()
  assert.equal(tagSurfaceActions({ adp: p, actionId: 'x' }, 's').adp, p, 'a data provider is not copied')
})

test('HeroSection, EmptyState, ProgressBar and custom components in the content', () => {
  assert.match(heroAtomOf({ image: '/img/a.png', centered: true }).heroClass, /mateu-hero-centered/)
  // …and the page styles them: centred texts, light texts over the darkened image
  const css = webApp('resources/css/app.css')
  assert.match(css, /\.mateu-hero-centered \{ text-align: center; \}/)
  assert.match(css, /\.mateu-hero-image h2, \.mateu-hero-image p \{ color: #fff; \}/)
  assert.ok(emptyStateAtomOf({ actionId: 'go', actionLabel: 'Go' }).hasAction)
  // an icon NAME is not printed in the title (oj-sp-empty-state has its own illustration); an emoji is
  assert.equal(emptyStateAtomOf({ icon: 'vaadin:list-select', title: 'Select an item' }).title, 'Select an item')
  assert.equal(emptyStateAtomOf({ icon: '📭', title: 'Nothing' }).title, '📭 Nothing')
  assert.equal(emptyStateOf(node({ type: 'VerticalLayout' }, [node({ type: 'EmptyState', icon: 'vaadin:list-select', title: 'Select an item' })])).title, 'Select an item')
  // a StatusList row draws its avatar only when it has one (it was an empty square)
  const page = webApp('flows/main/pages/main-start-page.html')
  assert.equal((page.match(/initials="\[\[ \$current\.data\.avatar \]\]"/g) || []).length, (page.match(/<oj-bind-if test="\[\[ !!\$current\.data\.avatar \]\]">/g) || []).length)
  assert.equal(progressBarAtomOf({ max: 10, valueKey: 'done' }, { done: 4 }).value, 40)
  assert.equal(progressBarAtomOf({ indeterminate: true }, {}).value, -1)
  // the host's first EmptyState is the page-level band, not repeated in the content
  const tree = node({ type: 'VerticalLayout' }, [node({ type: 'EmptyState', title: 'None' }), node({ type: 'Text', text: 't' })])
  assert.ok(!(islandContentOf({ tree, state: {}, kind: 'host' }) || []).flatMap((b) => b.items).some((a) => a.isEmptyStateAtom))
  // a custom component: placeholder until the app registers a view, then its slot
  const cc = node({ type: 'CustomComponent', name: 'acme-gauge', props: { v: 1 } }, [], 'cc1')
  assert.ok(atomsOf(cc).some((a) => a.isNotice))
  registerCustomComponent('acme-gauge', () => {})
  assert.ok(customComponentRegistered('acme-gauge'))
  const [slot] = atomsOf(cc)
  assert.deepEqual([slot.isCustomSlot, slot.name, slot.props], [true, 'acme-gauge', '{"v":1}'])
})

test('client rules on every surface: host, islands and the overlay on top', () => {
  const withRules = (id, kind) => ({ id, kind, state: {}, tree: { rules: [{ filter: 'true' }] } })
  const reg = { contexts: { [HOST_ID]: withRules(HOST_ID, 'host'), isl: withRules('isl', 'island'), plain: { id: 'plain', kind: 'island', tree: {} }, d1: withRules('d1', 'drawer') }, stack: ['d1'] }
  assert.deepEqual(ruleSurfacesOf(reg).map((x) => [x.surface, x.ctx.id]), [['host', HOST_ID], ['island', 'isl'], ['overlay', 'd1']])
  assert.deepEqual(ruleSurfacesOf({ ...reg, stack: [] }).map((x) => x.surface), ['host', 'island'])
  const el = (match) => ({ closest: (sel) => (sel.includes(match) ? {} : null) })
  assert.equal(surfaceOfElement(el('#mateuDrawerPanel')), 'overlay')
  assert.equal(surfaceOfElement(el('data-mateu-surface')), 'island')
  assert.equal(surfaceOfElement(el('nothing-matches')), 'host')
  assert.ok(readFileSync(join(here, 'make-amd.mjs'), 'utf8').includes('setRulesContexts(reg)'))
})

test('a TaskQueue among other content is content: the queue page (queue + detail, nothing else) needs a page of its own', () => {
  const queue = node({ type: 'TaskQueue', groups: [{ label: 'Today', items: [{ id: 'q1', title: 'Call Ada' }] }] })
  // the front-office shape: the queue and the detail placeholder — the queue page
  assert.ok(taskQueueOf(node({ type: 'VerticalLayout' }, [queue, node({ type: 'EmptyState', title: 'Pick one' })])))
  // the detail island (a nested ServerSide) does not count as other content
  const island = { type: 'ServerSide', id: 'i', children: [node({ type: 'ProgressSteps', steps: [] })] }
  assert.ok(taskQueueOf(node({ type: 'VerticalLayout' }, [queue, island])))
  // a page that also shows a gantt, a kanban, a calendar… kept only the queue
  assert.equal(taskQueueOf(node({ type: 'VerticalLayout' }, [node({ type: 'Gantt', tasks: [] }), queue])), null)
})

test('a hero among other content is content: the welcome page is a hero over its tiles and nothing else', () => {
  const hero = node({ type: 'HeroSection', title: 'Welcome' }, [node({ type: 'Button', label: 'Go', actionId: 'go' })])
  const tiles = node({ type: 'ResponsiveGrid' }, [node({ type: 'DashboardPanel', title: 'P' }, [node({ type: 'Text', text: 't' })])])
  assert.ok(welcomeOf({ tree: node({ type: 'VerticalLayout' }, [hero, tiles]), state: {}, data: {} }))
  assert.equal(welcomeOf({ tree: node({ type: 'VerticalLayout' }, [hero, tiles, node({ type: 'Notice', text: 'n' })]), state: {}, data: {} }), null)
})

test('a composed page (no Page, no Crud title) takes its header title from its window title', () => {
  const tree = { type: 'ServerSide', children: [node({ type: 'VerticalLayout' }, [node({ type: 'Text', text: 'x' })])] }
  const reg = { contexts: { [HOST_ID]: { tree, state: {} } }, shell: { menu: [] }, effects: { docTitle: 'Sales dashboard' } }
  assert.equal(summarizeHost(reg, '/dash').title, 'Sales dashboard')
})

test('a composed page is headed by its OWN title (@Title, the window title), not the menu label, on every repaint', () => {
  const composed = (title) => ({ commands: title ? [{ targetComponentId: '', type: 'SetWindowTitle', data: title }] : [], messages: [],
    fragments: [{ targetComponentId: '', action: 'Replace', state: {}, data: {},
      component: { type: 'ServerSide', id: 'g', serverSideType: 'x.Gantt', route: '/gantt', actions: [], children: [
        node({ type: 'VerticalLayout' }, [{ type: 'ClientSide', id: 'gantt-page-title', metadata: { type: 'Text', text: 'Course plan' }, children: [] },
          node({ type: 'Text', text: 'Body' })])] } }] })
  const shell = { menu: [{ route: '/gantt', label: 'Gantt page' }] }
  let reg = { ...reduceContexts({ contexts: {}, stack: [], shell: null }, composed('Course plan')), shell }
  assert.equal(summarizeHost(reg, '/gantt').title, 'Course plan')
  // the page's own heading Text says the same: the content drops it (no title twice)
  const blocks = hostContentOf(reg.contexts[HOST_ID], null, { title: summarizeHost(reg, '/gantt').title })
  const texts = blocks.flatMap((b) => b.items).filter((a) => a.isText).map((a) => a.text)
  assert.deepEqual(texts, ['Body'])
  // an action answer carries no SetWindowTitle: the title stays
  reg = { ...reduceContexts(reg, { commands: [], messages: [], fragments: [{ targetComponentId: '', action: 'Replace', component: null, state: { x: 1 } }] }), shell }
  assert.equal(summarizeHost(reg, '/gantt').title, 'Course plan')
  // the App's own title (SetWindowTitle to the shell) is not the screen's
  reg = { ...reduceContexts(reg, { commands: [{ targetComponentId: 'shell', type: 'SetWindowTitle', data: 'My app' }], messages: [], fragments: [] }), shell }
  assert.equal(summarizeHost(reg, '/gantt').title, 'Course plan')
  // a new screen without a title of its own: the menu label again
  reg = { ...reduceContexts(reg, composed(null)), shell }
  assert.equal(summarizeHost(reg, '/gantt').title, 'Gantt page')
  // a declared Page title still wins over the window title
  assert.equal(summarizeHost({ contexts: { [HOST_ID]: { tree: { type: 'ServerSide', children: [node({ type: 'Page', title: 'Declared' })] }, state: {}, windowTitle: 'Window' } }, shell }, '/gantt').title, 'Declared')
})

test('the listing header (oj-sp-smart-filter-search) shows the page subtitle too', () => {
  const html = readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page.html'), 'utf8')
  for (const id of ['mateuListHeader', 'mateuListHeaderInline']) {
    const tag = html.slice(html.indexOf('<oj-sp-smart-filter-search id="' + id + '"'), html.indexOf('>', html.indexOf('<oj-sp-smart-filter-search id="' + id + '"')))
    assert.match(tag, /page-subtitle="\[\[ \$application\.variables\.mateuPageHeader\.subtitle \]\]"/, id)
  }
})

test('the hero overline: the welcome template\'s overline-text, and a quiet line above the title in the content', () => {
  const tiles = node({ type: 'ResponsiveGrid' }, [node({ type: 'DashboardPanel', title: 'P' }, [node({ type: 'Text', text: 't' })])])
  const hero = node({ type: 'HeroSection', overline: 'Good morning', title: 'Front desk' })
  const w = welcomeOf({ tree: node({ type: 'VerticalLayout' }, [hero, tiles]), state: {}, data: {} })
  assert.equal(w.overline, 'Good morning')
  assert.equal(w.title, 'Front desk')
  // none declared → '' (the template shows no overline)
  assert.equal(welcomeOf({ tree: node({ type: 'VerticalLayout' }, [node({ type: 'HeroSection', title: 'W' }), tiles]), state: {}, data: {} }).overline, '')
  // a hero in the content (a @WelcomeBanner page) carries it on its atom…
  assert.equal(heroAtomOf({ overline: 'Sales', title: 'Q3' }).overline, 'Sales')
  assert.equal(heroAtomOf({ title: 'Q3' }).overline, '')
  // …and the atom template paints it ABOVE the title, only when there is one
  const atoms = readFileSync(join(here, 'templates', 'atoms.html'), 'utf8')
  const heroAt = atoms.indexOf('$current.data.isHero')
  const block = atoms.slice(heroAt, atoms.indexOf('</oj-bind-if>\n                    <oj-bind-if', heroAt + 1) + 1)
  assert.ok(block.indexOf('mateu-hero-overline') > 0 && block.indexOf('mateu-hero-overline') < block.indexOf('<h2'), block)
  assert.match(block, /test="\[\[ !!\$current\.data\.overline \]\]"/)
})

test('a Welcome tile holding Markdown shows its text, markup dropped', () => {
  const hero = node({ type: 'HeroSection', title: 'Welcome' })
  const tiles = node({ type: 'ResponsiveGrid' }, [node({ type: 'DashboardPanel', title: 'P' }, [node({ type: 'Markdown', markdown: 'Find the **booking**' })])])
  const welcome = welcomeOf({ tree: node({ type: 'VerticalLayout' }, [hero, tiles]), state: {}, data: {} })
  assert.deepEqual(welcome.tiles[0].texts, ['Find the booking'])
})

test('the Welcome is oj-sp-welcome-page: EVERY CTA travels (secondaryActions) and the hero image replaces the illustration', () => {
  const hero = node({ type: 'HeroSection', title: 'Welcome', image: 'https://x/hero.jpg' }, [
    node({ type: 'Button', label: 'Start', actionId: 'start' }),
    node({ type: 'Button', label: 'Dashboard', actionId: 'dash' }),
    node({ type: 'Button', label: 'Help', actionId: 'help' }),
    node({ type: 'Button', label: 'Products', actionId: 'products', route: 'products' })])
  const tiles = node({ type: 'ResponsiveGrid' }, [node({ type: 'DashboardPanel', title: 'P' }, [node({ type: 'Text', text: 't' })])])
  const w = welcomeOf({ tree: node({ type: 'VerticalLayout' }, [hero, tiles]), state: {}, data: {} })
  assert.equal(w.primaryCta.label, 'Start')
  assert.deepEqual(w.secondaryCtas, [{ id: 'cta1', label: 'Dashboard' }, { id: 'cta2', label: 'Help' }, { id: 'cta3', label: 'Products' }])
  assert.deepEqual(w.secondaryById.cta2, { actionId: 'help', route: '' })
  assert.deepEqual(w.secondaryById.cta3, { actionId: 'products', route: 'products' })
  assert.equal(w.image, 'https://x/hero.jpg')
  // a page-relative image is made absolute: Spectra resolves it inside its CDN stylesheet
  assert.equal(absoluteUrlOf(''), '')
  const hadDocument = 'document' in globalThis, document = globalThis.document
  globalThis.document = { baseURI: 'http://shell.example:8800/console/' }
  try {
    assert.equal(absoluteUrlOf('/images/texture.png'), 'http://shell.example:8800/images/texture.png')
    assert.equal(absoluteUrlOf('https://x/hero.jpg'), 'https://x/hero.jpg')
  } finally {
    if (hadDocument) globalThis.document = document
    else delete globalThis.document
  }
  // the page paints Spectra's template (not the bare banner + our own tile row) and binds the image
  const html = readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page.html'), 'utf8')
  const start = html.indexOf('<oj-sp-welcome-page id="mateuWelcomeBanner"')
  assert.ok(start > 0, 'oj-sp-welcome-page')
  const tag = html.slice(start, html.indexOf('>', start))
  assert.match(tag, /secondary-actions="\[\[ \$application\.variables\.mateuWelcome\.secondaryCtas \]\]"/)
  // the image is the banner's texture, as on redwood.oracle.com: illustration-background with NO
  // foreground (an empty string still counts as one: nothing was drawn) and no stretch
  assert.match(tag, /illustration-background="\[\[ \$application\.variables\.mateuWelcome\.image \|\| \$application\.variables\.mateuWelcomeIlluBg \]\]"/)
  assert.match(tag, /illustration-foreground="\[\[ \$application\.variables\.mateuWelcome\.image \? undefined : \$application\.variables\.mateuWelcomeIllu \]\]"/)
  assert.match(tag, /display-options\.image-stretch="none"/)
  // HeroSection.overline → Spectra's own overline-text (the line above the page title)
  assert.match(tag, /overline-text="\[\[ \$application\.variables\.mateuWelcome\.overline \]\]"/)
  assert.ok(html.indexOf('</oj-sp-welcome-page>') > start, 'the tiles are its main slot')
  assert.equal(html.indexOf('<oj-sp-header-welcome-banner id="mateuWelcomeBanner"'), -1)
})

test('what a composed page puts before its listing (the HeroSearch hero) is painted above the table', () => {
  const tree = { type: 'ServerSide', children: [node({ type: 'VerticalLayout' }, [
    node({ type: 'HeroSection', title: 'Find your hotel' }),
    node({ type: 'Crud', columns: [] })])] }
  const blocks = listingHeaderBlocksOf({ tree, state: {}, data: {} })
  assert.ok(blocks.flatMap((b) => b.items).some((a) => a.isHero && a.title === 'Find your hotel'))
})

test('a SmartSearchPage intro line is the page subtitle (the listing page shows only the table)', () => {
  const tree = { type: 'ServerSide', children: [node({ type: 'VerticalLayout' }, [
    { type: 'ClientSide', id: 'page-subtitle', metadata: { type: 'Text', text: 'Find assets' }, children: [] },
    node({ type: 'Crud', columns: [] })])] }
  assert.equal(pageSubtitleOf({ tree, state: {} }), 'Find assets')
})

test('a Stat with an action drills in', () => {
  const atoms = atomsOf(node({ type: 'VerticalLayout' }, [node({ type: 'Stat', label: 'Arrivals', value: '12', actionId: 'openArrivals' })]))
  assert.ok(atoms.some((a) => a.isButtons && a.buttons.some((b) => b.actionId === 'openArrivals')))
})

test('an EmptyState with a call to action is content (the page band has no button and lost it)', () => {
  const tree = node({ type: 'VerticalLayout' }, [node({ type: 'EmptyState', title: 'Nothing here', actionId: 'newBooking', actionLabel: 'New booking' })])
  assert.equal(emptyStateOf(tree), null)
  const atom = atomsOf(tree, {}, {}, { kind: 'host' }).find((a) => a.isEmptyStateAtom)
  assert.deepEqual([atom.actionId, atom.actionLabel], ['newBooking', 'New booking'])
})

test('slot templates: a CollectionDetail list is content (not the queue page), a form with @Aside shows its aside', () => {
  const slotted = (type, slot, md = {}) => ({ type: 'ClientSide', id: '', slot, metadata: { type, ...md }, children: [] })
  const cd = node({ type: 'ResponsiveGrid', gridTemplateAreas: '"list detail"' }, [slotted('TaskQueue', 'list', { groups: [] }), slotted('EmptyState', 'detail', { title: 'Select an item' })])
  assert.equal(taskQueueOf(cd), null, 'a list in a template is not the queue page')
  assert.equal(emptyStateOf(cd), null, 'its @detail placeholder is not the page empty state')
  assert.ok(atomsOf(cd, {}, {}, { kind: 'host' }).some((a) => a.isEmptyStateAtom), 'it is painted in the content')
  const aside = node({ type: 'ResponsiveGrid', gridTemplateAreas: '"main aside"', gridTemplateColumns: '2fr 1fr' }, [
    slotted('VerticalLayout', 'main'), { ...slotted('Card', 'aside'), children: [node({ type: 'Text', text: 'Need help?' })] }])
  const blocks = islandContentOf({ tree: aside, state: {} })
  assert.ok(blocks.every((b) => b.fromTemplate))
  assert.ok(hostContentShown(blocks, { fields: [{}], sections: [{}] }), 'the template wins over the generic form')
})

test('display chrome in the interface language (English by default)', () => {
  assert.equal(carouselPagerAtomOf('k', 0, 2, false).dots[1].label, 'Slide 2')
  setChromeLanguage('es')
  try {
    assert.equal(carouselPagerAtomOf('k', 0, 2, false).dots[1].label, 'Diapositiva 2')
    assert.match(unsupportedAtomOf('X').text, /^Componente no soportado/)
    assert.equal(gridPageOf([1, 2], 10, 0).rangeText, '1–2 de 2')
  } finally { setChromeLanguage('') }
  for (const k of Object.keys(CHROME_TEXTS.en)) assert.ok(k in CHROME_TEXTS.es, 'es lacks ' + k)
})

test('a page of only buttons paints them; under fields the generic form does', () => {
  const button = node({ type: 'Button', label: 'Go', actionId: 'go' })
  const tooltip = node({ type: 'Tooltip', text: 'Saves', wrapped: node({ type: 'Button', label: 'Save', actionId: 'save' }) })
  const lone = islandContentOf({ tree: node({ type: 'VerticalLayout' }, [button]), state: {}, data: {} })
  assert.deepEqual(lone.flatMap((b) => b.items).flatMap((a) => a.buttons || []).map((b) => b.label), ['Go'])
  assert.ok(islandContentOf({ tree: node({ type: 'VerticalLayout' }, [tooltip]), state: {}, data: {} }))
  const withField = node({ type: 'VerticalLayout' }, [node({ type: 'FormField', fieldId: 'born', dataType: 'date' }), button])
  assert.equal(islandContentOf({ tree: withField, state: {}, data: {} }), null)
})

test('a Form toolbar reaches the header like a Page one, a ButtonGroup with its buttons', () => {
  const group = { type: 'Button', label: 'Actions', actionId: null,
    children: [{ type: 'Button', label: 'Print', actionId: 'print' }, { type: 'Button', label: 'Duplicate', actionId: 'dup' }] }
  const tree = node({ type: 'VerticalLayout' }, [node({ type: 'Form', title: 'Order', toolbar: [group, { type: 'Button', label: 'Save', actionId: 'save' }] })])
  assert.deepEqual(pageToolbarOf({ tree, state: {} }).map((b) => b.actionId), ['print', 'dup', 'save'])
})

test('a RouteLink button in content keeps its route (it navigates); a plain one does not get one', () => {
  // the served wire of the starters' home.yaml: a hero holding a Button whose actionable is a
  // RouteLink — the server's ButtonMapper puts the link's route on the button
  const tree = node({ type: 'VerticalLayout' }, [
    node({ type: 'HeroSection', title: 'My app', centered: true }, [
      node({ type: 'Button', label: 'Browse products', actionId: 'browseProducts', buttonStyle: 'primary', route: 'products' }),
      node({ type: 'Button', label: 'Greet', actionId: 'greet' }),
    ]),
  ])
  const buttons = atomsOf(tree).filter((a) => a.isButtons).flatMap((a) => a.buttons)
  const browse = buttons.find((b) => b.actionId === 'browseProducts')
  assert.equal(browse.route, 'products')
  assert.equal(browse.chroming, 'callToAction')
  assert.equal(buttons.find((b) => b.actionId === 'greet').route, undefined)
  // a page whose hero holds the CTAs is painted as the Redwood WELCOME banner: its CTAs carry
  // the route too (the starters' YAML home page is exactly that)
  const welcome = welcomeOf({ tree, state: {}, data: {} })
  assert.equal(welcome.primaryCtaId, 'browseProducts')
  assert.equal(welcome.primaryCtaRoute, 'products')
  assert.equal(welcome.secondaryCtaRoute, '')
  // the page's block-action and welcome listeners hand the route to the dispatchers
  const page = JSON.parse(webApp('flows/main/pages/main-start-page.json'))
  const primary = page.eventListeners.welcomePrimary.chains[0]
  assert.equal(primary.chain, 'dispatchHostBlockAction')
  assert.equal(primary.parameters.route, '{{ $application.variables.mateuWelcome.primaryCtaRoute }}')
  // a secondary CTA is told apart by the id oj-sp-welcome-page's spSecondaryAction carries
  const secondary = page.eventListeners.welcomeSecondary.chains[0]
  assert.equal(secondary.chain, 'dispatchHostBlockAction')
  assert.equal(secondary.parameters.ctaId, '{{ $event.detail.actionId }}')
  assert.equal(secondary.parameters.ctas, '{{ $application.variables.mateuWelcome.secondaryById }}')
  assert.deepEqual(welcome.secondaryById.cta1, { actionId: welcome.secondaryCtaId, route: '' })
  for (const listener of ['hostBlockAction', 'islandBlockAction']) {
    assert.equal(page.eventListeners[listener].chains[0].parameters.route, '{{ $current.data.route }}', listener + ' passes the route')
  }
})

test('a button route resolves its ${state.x}; a missing or blank value disables the button', () => {
  assert.equal(buttonRouteOf('/p/${state.id}', { id: 7 }), '/p/7')
  assert.equal(buttonRouteOf('/p/${state.id}', {}), null)
  assert.equal(buttonRouteOf('/p/${state.id}', { id: '  ' }), null)
  assert.equal(buttonRouteOf('products', {}), 'products')
  const tree = node({ type: 'VerticalLayout' }, [node({ type: 'Button', label: 'Open', actionId: 'open', route: '/p/${state.id}' })])
  const open = (state) => {
    const ctx = { id: HOST_ID, kind: 'host', tree, state, data: {} }
    return (islandContentOf(ctx) || []).flatMap((b) => b.items || []).filter((a) => a.isButtons).flatMap((a) => a.buttons)[0]
  }
  assert.deepEqual([open({ id: 3 }).route, open({ id: 3 }).disabled], ['/p/3', false])
  assert.deepEqual([open({}).route, open({}).disabled], [undefined, true])
})

// ── the actions walkthrough (design/walkthrough/actions.md): answers the shell dropped ─────────────

test('actions: PageBanners an action returns reach the message band, title and description', () => {
  const reg = reduceContexts({ contexts: {}, stack: [] }, {
    fragments: [], messages: [],
    banners: [{ theme: 'SUCCESS', title: 'Checks passed', description: 'System is healthy' }, { theme: 'DANGER', title: 'Boom', description: '' }],
  })
  const notes = reg.effects.toasts.map(bannerNotificationOf)
  assert.deepEqual(notes, [
    { summary: 'Checks passed', message: 'System is healthy', type: 'confirmation', displayMode: 'persist' },
    { summary: 'Boom', message: '', type: 'error', displayMode: 'persist' },
  ])
})

test('actions: a returned ConfirmDialog is asked, not drawn as an empty drawer', () => {
  const inc = { fragments: [{ action: 'Add', targetComponentId: 'x', component: {
    type: 'ClientSide', id: 'fieldId',
    metadata: { type: 'ConfirmDialog', header: 'Proceed?', confirmText: 'Yes', rejectText: 'No', canReject: true, canCancel: true,
      confirmActionId: 'confirmed', rejectActionId: 'rejected', openedCondition: 'true' },
    children: [{ type: 'ClientSide', metadata: { type: 'Text', text: 'Pick one' } }],
  } }] }
  assert.deepEqual(returnedConfirmDialogsOf(inc), [{
    title: 'Proceed?', message: 'Pick one', confirmText: 'Yes', denyText: 'No', confirmActionId: 'confirmed', denyActionId: 'rejected',
  }])
  const reg = reduceContexts({ contexts: {}, stack: [] }, inc)
  assert.equal(reg.stack.length, 0, 'no overlay stacked for it')
  assert.deepEqual(returnedConfirmDialogsOf({ fragments: [] }), [])
})

test('actions: an answer carrying an error message FAILED — its OnError triggers apply, not its OnSuccess', () => {
  assert.equal(isErrorAnswer({ messages: [{ variant: 'error', text: 'fail ran' }] }), true)
  assert.equal(isErrorAnswer({ messages: [{ variant: 'success', text: 'ok' }] }), false)
  assert.equal(isErrorAnswer(null), false)
  const ctx = { tree: { triggers: [
    { type: 'OnError', actionId: 'afterFail', calledActionId: 'fail' },
    { type: 'OnSuccess', actionId: 'afterOk', calledActionId: 'fail' },
  ] } }
  assert.deepEqual(onErrorTriggers(ctx, 'fail').map((t) => t.actionId), ['afterFail'])
})

// The display gallery: every display component as the Java server renders the YAML gallery
// (libs/mateu expander fixture display-gallery.golden.json, written by YamlDisplayGallerySyncTest).
test('display gallery: every display component projects to its atom, nothing left behind', () => {
  const golden = JSON.parse(readFileSync(join(here, '..', '..', '..', 'libs', 'mateu', 'src', 'mateu', 'ui',
    'infra', 'expander', '__fixtures__', 'display-gallery.golden.json'), 'utf8'))
  const atoms = atomsOf(golden.fragments[0].component)
  const flags = new Set(atoms.flatMap((a) => Object.keys(a).filter((k) => k.startsWith('is') && a[k] === true)))
  for (const flag of ['isEntityHeader', 'isRichText', 'isImage', 'isBadge', 'isAvatar', 'isChart', 'isFunnel',
    'isHeatmap', 'isGantt', 'isKanban', 'isPlanning', 'isMatrix', 'isActionPanel', 'isMap', 'isTimeline',
    'isOrgChart', 'isBpmn', 'isStatusList', 'isBullets', 'isCollapsible', 'isPricing', 'isOffer', 'isTestimonials',
    'isFeatureGrid', 'isProgress', 'isMeter', 'isEmptyStateAtom', 'isSkeleton', 'isNotice', 'isCallout',
    'isSeparator', 'isHero', 'isStat', 'isComparison', 'isScoreboard', 'isCalendar', 'isQueue']) {
    assert.ok(flags.has(flag), flag + ' missing')
  }
  // a ProgressSteps on a page that is no wizard is just a display: the ProgressBar beside it stays
  // (it was dropped as the "wizard's own" bar)
  assert.ok(atoms.some((a) => a.isProgressBar), 'the ProgressBar')
  // a Notice keeps its own action and its content
  const notice = atoms.find((a) => a.isNotice && a.text === 'Two complaints pending')
  assert.deepEqual(notice.buttons.map((b) => [b.actionId, b.label]), [['reviewComplaints', 'Review']])
  assert.ok(atoms.some((a) => a.isText && a.text === 'Inside the notice'))
})

test('a BPMN without diagram interchange is laid out left to right along its flows — a rework loop included', () => {
  const d = bpmnDiagramOf(`<bpmn:definitions><bpmn:process>
    <bpmn:startEvent id="s" name="Start"/>
    <bpmn:userTask id="t" name='Check &amp; approve'/>
    <bpmn:exclusiveGateway id="g"/>
    <bpmn:endEvent id="e"/>
    <bpmn:textAnnotation id="n"><bpmn:text> A note </bpmn:text></bpmn:textAnnotation>
    <bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="t"/>
    <bpmn:sequenceFlow id="f2" sourceRef="t" targetRef="g"/>
    <bpmn:sequenceFlow id="f3" sourceRef="g" targetRef="e" name="yes"/>
    <bpmn:sequenceFlow id="f4" sourceRef="g" targetRef="t"/>
  </bpmn:process></bpmn:definitions>`)
  const at = Object.fromEntries(d.nodes.map((n) => [n.id, n]))
  assert.equal(at.t.label, 'Check & approve')
  assert.equal(at.n.label, 'A note', 'an annotation\'s text comes from its child')
  assert.ok(at.s.x < at.t.x && at.t.x < at.g.x && at.g.x < at.e.x, 'columns follow the flow (the loop back does not move the task)')
  assert.equal(d.flows.length, 4, 'every flow is drawn from its source to its target')
  assert.ok(d.flows.every((f) => f.points.length === 2))
  assert.equal(bpmnDiagramOf('').nodes.length, 0)
  assert.deepEqual([bpmnDiagramOf('').width, bpmnDiagramOf('').height], [100, 80], 'an empty diagram keeps a minimal box')
})

test('FileList → oj-sp-attachment-chip fed locally; Timeline events → oj-sp-timeline-event-template', () => {
  const files = fileListAtomOf({ files: [
    { name: 'Contract.pdf', size: '1.2 MB', type: 'application/pdf', url: '/files/c.pdf' },
    { name: 'Rooming.xlsx', size: '48 KB', type: 'xlsx', url: 'javascript:alert(1)' },
    { name: 'Plan.png', size: 'big', type: 'PNG', actionId: 'openPlan' },
  ] }).files
  assert.equal(files[0].fileSize, Math.round(1.2 * 1024 * 1024), 'the chip takes a number of bytes')
  assert.equal(files[0].fileType, 'application/pdf')
  assert.deepEqual(files[0].chipActions, { preview: 'external', download: 'on', delete: 'off' }, 'a URL opens on a click, downloads from the menu')
  assert.equal(files[1].fileType, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'a type word → its MIME')
  assert.deepEqual(files[1].chipActions, { preview: 'off', download: 'off', delete: 'off' }, 'an unsafe URL is neither')
  assert.equal(files[2].fileSize, undefined, 'an unreadable size is left to the chip')
  assert.equal(files[2].fileType, 'image/png')
  assert.deepEqual(files[2].chipActions, { preview: 'external', download: 'off', delete: 'off' }, 'an action opens through the preview')
  assert.equal(fileBytesOf(2048), 2048)
  assert.equal(fileMimeOf('', 'notes.txt'), 'text/plain')
  const chip = { closest: (sel) => (sel.indexOf('data-mateu-href') >= 0 ? { getAttribute: () => '/files/c.pdf' } : null) }
  assert.equal(attachmentDownloadOf(chip), '/files/c.pdf')
  assert.equal(attachmentDownloadOf({ closest: () => null }), '')
  const forged = { closest: () => ({ getAttribute: () => 'javascript:alert(1)' }) }
  assert.equal(attachmentDownloadOf(forged), '', 'a forged attribute is no link')
  const atoms = readFileSync(join(here, 'templates', 'atoms.html'), 'utf8')
  const fl = atoms.slice(atoms.indexOf('$current.data.isFileList'), atoms.indexOf('$current.data.isChecklist'))
  assert.match(fl, /<oj-sp-attachment-chip[^>]*file-size="\[\[ \$current\.data\.fileSize \]\]"/)
  assert.match(fl, /on-sp-preview="\[\[ \$listeners\.\{\{blockAction\}\} \]\]"/)
  assert.match(fl, /:data-mateu-href="\[\[ \$current\.data\.href \]\]"/)
  const tl = timelineAtomOf({ items: [{ title: 'Paid', description: 'Deposit', timestamp: 'Oct 21' }, { title: 'Moved', actionId: 'open' }] }).items
  assert.deepEqual(tl[0].primaryActions, [], 'a plain event has no action menu')
  assert.equal(tl[1].primaryActions.length, 1)
  const tm = atoms.slice(atoms.indexOf('$current.data.isTimeline'), atoms.indexOf('$current.data.isPricing'))
  assert.match(tm, /<oj-sp-timeline-event-template primary-text="\[\[ \$current\.data\.title \]\]"/)
  assert.match(tm, /on-sp-primary-action="\[\[ \$listeners\.\{\{blockAction\}\} \]\]"/)
})

console.log(`\n${passed} display tests OK`)

test('the collapsed subheader takes no line: no border width either, only its colour was cleared', () => {
  const css = readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'resources', 'css', 'app.css'), 'utf8')
  const start = css.indexOf('.mateu-subheader.mateu-subheader-empty {')
  assert.ok(start > 0)
  const rule = css.slice(start, css.indexOf('}', start))
  assert.match(rule, /height: 0;/)
  assert.match(rule, /border-bottom-width: 0;/)
})
