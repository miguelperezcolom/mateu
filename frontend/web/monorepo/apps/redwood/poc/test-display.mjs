// Tests of the display components added for GA (core/display.mjs, displayDom.mjs, reproject.mjs,
// the Markdown tables and the Delta reader of richtext.mjs, the new field widgets): every wire type
// that had no Redwood view now projects to an atom, each atom carries what its template binds, and
// an unknown type shows a placeholder instead of vanishing.
// Run: node test-display.mjs (npm test runs it with the other suites).
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
  registerCustomComponent, customComponentRegistered, layoutFieldOf, HOST_ID, taskQueueOf, emptyStateOf, hostContentShown,
} from './reduceContexts.mjs'
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
  assert.ok(layoutFieldOf(md({ dataType: 'string', stereotype: 'color' }), { x: '#fff' }).isColor)
  assert.ok(layoutFieldOf(md({ dataType: 'string', stereotype: 'richText' }), {}).isRichEditor)
  assert.equal(hexColorOf('#ABC'), '#aabbcc')
  assert.equal(hexColorOf('rgb(255, 0, 16)'), '#ff0010')
  assert.equal(hexColorOf('red'), '')
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
  assert.ok(emptyStateAtomOf({ actionId: 'go', actionLabel: 'Go' }).hasAction)
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

console.log(`\n${passed} display tests OK`)
