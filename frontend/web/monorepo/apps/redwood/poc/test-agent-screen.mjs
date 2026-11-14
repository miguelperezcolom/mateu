// Live UI push on the Redwood/VB renderer — reading and operating the screen the user has open
// (conformance/mcp/README.md "Reading and operating the screen the user has open"): the summary of
// agentScreen.mjs (the desktop's ScreenSummary shape, built from the registry + drafts), the plans
// that refuse a field or an action the screen does not offer, the query runner of agentPush.mjs
// (its answers through `_agent-screen`, the settle wait), the page operations (typing into the
// input on show, pressing through the page's chains), the "an agent is operating" band with Stop,
// and the VB wiring. Run: node test-agent-screen.mjs (npm test runs it with the other suites).
import './test-locale.mjs' // first: off English the suite reruns in English (see the module)
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  buildScreenSummary, screenOfferedActionIds, planScreenEdits, planScreenAction, screenQueryOf, screenMessagesAfter,
  agentOperatingOf, AGENT_OPERATING_MS, screenCap, SCREEN_MAX_ROWS,
} from './agentScreen.mjs'
import {
  agentPushPlanOf, agentActionBodyOf, applyAgentPush, syncAgentPush, installAgentPush, resetAgentPush,
  setAgentQueryHost, runAgentQuery, agentPageOps, noteAgentTransport, noteAgentAnswer, agentOperationState,
  stopAgentOperation, requestAgentPairing, agentFieldElementOf, agentTypeInto, settleAgentScreen, AGENT_SCREEN_ACTION,
} from './agentPush.mjs'
import { HOST_ID } from './reduceContexts.mjs'
import { setChromeLanguage, CHROME_TEXTS, FULL_LANGUAGES } from './i18n.mjs'
import { makeDom, sleep } from './test-harness-dom.mjs'

setChromeLanguage('en')
const here = dirname(fileURLToPath(import.meta.url))
const webApp = (rel) => readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', rel), 'utf8')
let passed = 0
const queue = []
const test = (name, fn) => queue.push({ name, fn })
const memoryStorage = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) } }
const withDocument = async (doc, fn) => {
  const before = globalThis.document
  globalThis.document = doc
  try { await fn() } finally { if (before === undefined) delete globalThis.document; else globalThis.document = before }
}

// a page as the wire sends it: a Page with a header, two fields (one read-only, one a password),
// a toolbar button, a declared action, and a listing (Crud) with its page of rows
const field = (fieldId, extra = {}) => ({ type: 'ClientSide', id: fieldId, metadata: { type: 'FormField', fieldId, label: fieldId[0].toUpperCase() + fieldId.slice(1), dataType: 'string', ...extra } })
const pageTree = () => ({
  type: 'ServerSide', id: 'host', serverSideType: 'x.Order', initialData: { customer: 'Ada' },
  actions: [{ id: 'save' }, { id: 'archive' }, { id: 'search' }],
  children: [{
    type: 'ClientSide', id: 'page',
    metadata: {
      type: 'Page', title: 'Order ${state.number}', subtitle: 'Draft',
      badges: [{ text: 'Open' }], kpis: [{ title: 'Total', text: '12 €' }],
      toolbar: [{ type: 'ClientSide', metadata: { type: 'Button', actionId: 'save', label: 'Save' } }],
    },
    children: [
      field('customer', { required: true }),
      field('number', { readOnly: true }),
      field('pin', { dataType: 'password' }),
      field('kind', { options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] }),
      { type: 'ClientSide', id: 'del', metadata: { type: 'Button', actionId: 'delete', label: 'Delete', disabled: true } },
      {
        type: 'ClientSide', id: 'lines',
        metadata: {
          type: 'Crud', title: 'Lines', searchable: true,
          columns: [{ metadata: { id: 'name', label: 'Name', actionId: 'view' } }, { metadata: { id: 'qty', label: 'Qty' } },
            { metadata: { id: 'acts', label: '', dataType: 'action' } }],
          toolbar: [{ actionId: 'new', label: 'New' }],
          filters: [{ metadata: { type: 'FormField', fieldId: 'status', label: 'Status', dataType: 'string' } }],
        },
      },
    ],
  }],
})
const rows = [
  { id: 1, name: 'Bolt', qty: 3, acts: { methodNameInCrud: 'archive', label: 'Archive' } },
  { id: 2, name: { message: 'Nut', type: 'success' }, qty: 5, acts: { methodNameInCrud: 'archive', label: 'Archive' } },
]
const inputOf = (extra = {}) => ({
  route: '/orders/42', windowTitle: 'Order 42',
  app: { title: 'Shop', contextSelectors: [{ fieldName: 'hotel', label: 'Hotel', options: [{ value: 'h1', label: 'Hotel 1' }] }],
    contextActions: [{ actionId: 'help', label: 'Help' }], user: { name: 'Ana', accessToken: 'NEVER' } },
  appState: { hotel: 'h1' },
  messages: [{ variant: 'success', text: 'Saved' }],
  view: { content: pageTree(), state: { number: '42', pin: 'secret', kind: 'a', searchText: 'bo' }, listings: { lines: { page: { content: rows, pageNumber: 0, pageSize: 20, totalElements: 2 } } }, fieldErrors: { customer: 'Cannot be empty' } },
  ...extra,
})

// ── the summary (pure) ───────────────────────────────────────────────────────────────────────

test('the summary: route, header, fields with values (a password as dots), actions, the listing page, the app header', () => {
  const s = buildScreenSummary(inputOf())
  assert.equal(s.route, '/orders/42')
  assert.equal(s.windowTitle, 'Order 42')
  assert.equal(s.focus, 'page')
  assert.deepEqual(s.ui, { appTitle: 'Shop' })
  assert.deepEqual(s.user, { name: 'Ana' }, 'no token, secret or credential of the user')
  assert.deepEqual(s.header, { title: 'Order 42', subtitle: 'Draft', badges: ['Open'], kpis: [{ title: 'Total', value: '12 €' }] })
  const byId = Object.fromEntries(s.fields.map((f) => [f.id, f]))
  assert.deepEqual(byId.customer, { id: 'customer', label: 'Customer', type: 'string', required: true, value: 'Ada', error: 'Cannot be empty' }, 'the value the ServerSide seeded')
  assert.equal(byId.number.readOnly, true)
  assert.equal(byId.pin.value, '••••••')
  assert.deepEqual(byId.kind.options, [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }])
  assert.ok(!s.fields.some((f) => f.id === 'status'), "a listing's filter is the listing's, not the form's")
  assert.deepEqual(s.errors, { customer: 'Cannot be empty' })
  assert.deepEqual(s.actions, [{ id: 'save', label: 'Save', enabled: true }, { id: 'delete', label: 'Delete', enabled: false }])
  assert.deepEqual(s.otherActionIds, ['archive'], 'declared, no button; search is the listing\'s own')
  const l = s.listings[0]
  assert.equal(l.id, 'lines')
  assert.equal(l.searchText, 'bo')
  assert.deepEqual(l.actions, [{ id: 'new', label: 'New', enabled: true }])
  assert.deepEqual(l.rows, [{ name: 'Bolt', qty: 3, acts: 'Archive' }, { name: 'Nut', qty: 5, acts: 'Archive' }])
  assert.equal(l.totalElements, 2)
  assert.deepEqual(l.rowActions, [{ id: 'open-row', label: 'Open' }, { id: 'action-on-row-archive', label: 'Archive' }])
  assert.deepEqual(l.builtInActions, ['search', 'nextPage', 'prevPage'])
  assert.deepEqual(l.filters, [{ id: 'status', label: 'Status', type: 'string' }])
  assert.deepEqual(s.appContext, [{ field: 'hotel', label: 'Hotel', value: 'h1', valueLabel: 'Hotel 1', options: [{ value: 'h1', label: 'Hotel 1' }] }])
  assert.deepEqual(s.appActions, [{ id: 'help', label: 'Help' }])
  assert.deepEqual(s.messages, [{ variant: 'success', text: 'Saved' }])
  assert.equal(s.truncated, undefined)
})

test('an open overlay comes first (focus overlay) and the page moves under `page`', () => {
  const drawer = { type: 'ClientSide', metadata: { type: 'Drawer', headerTitle: 'Edit line', content: { type: 'ClientSide', metadata: { type: 'FormLayout' }, children: [field('qty'), { type: 'ClientSide', metadata: { type: 'Button', actionId: 'saveLine', label: 'Save line' } }] } } }
  const s = buildScreenSummary(inputOf({ overlay: { component: drawer, view: { state: { qty: 7 } } } }))
  assert.equal(s.focus, 'overlay')
  assert.equal(s.overlay.kind, 'drawer')
  assert.equal(s.overlay.title, 'Edit line')
  assert.deepEqual(s.overlay.fields, [{ id: 'qty', label: 'Qty', type: 'string', value: 7 }])
  assert.deepEqual(s.overlay.actions, [{ id: 'saveLine', label: 'Save line', enabled: true }])
  assert.equal(s.page.header.title, 'Order 42')
  assert.ok(!('fields' in s && s.fields !== s.page.fields && s.fields), 'the page view is under page')
})

test('caps: long text, data URIs, long lists, many rows — each cut path named in truncated', () => {
  const notes = { list: [], add(p) { this.list.push(p) } }
  assert.equal(screenCap('x'.repeat(600), 'p', notes).length, 501)
  assert.equal(screenCap('data:image/png;base64,AAAA', 'd', notes), '[data:image/png data, 26 characters]')
  assert.equal(screenCap(Array.from({ length: 80 }, (_, i) => i), 'l', notes).length, 50)
  assert.deepEqual(notes.list, ['p', 'd', 'l'])
  const many = Array.from({ length: 70 }, (_, i) => ({ id: i, name: 'n' + i, qty: i }))
  const s = buildScreenSummary(inputOf({ view: { content: pageTree(), state: { notes: 'x' }, listings: { lines: { page: { content: many, totalElements: 70 } } } } }))
  assert.equal(s.listings[0].rows.length, SCREEN_MAX_ROWS)
  assert.deepEqual(s.truncated, ['listings.lines.rows'])
})

test('offered ids and the plans: unknown/readOnly field refuses the whole call; unknown/disabled action; rows', () => {
  const s = buildScreenSummary(inputOf())
  const ids = screenOfferedActionIds(s)
  for (const id of ['save', 'delete', 'archive', 'new', 'open-row', 'action-on-row-archive', 'search', 'nextPage', 'help']) assert.ok(ids.has(id), id)
  assert.deepEqual(planScreenEdits(s, { customer: 'Grace', searchText: 'nu', status: 'x' }).edits.map((e) => e.kind), ['field', 'search', 'filter'])
  assert.deepEqual(planScreenEdits(s, { customer: 'Grace', number: '7' }), { ok: false, error: { code: 'unknownField', id: 'number' } })
  assert.deepEqual(planScreenEdits(s, { secret: 1 }), { ok: false, error: { code: 'unknownField', id: 'secret' } })
  assert.deepEqual(planScreenAction(s, { actionId: 'drop' }), { ok: false, error: { code: 'unknownAction', id: 'drop' } })
  assert.deepEqual(planScreenAction(s, { actionId: 'delete' }), { ok: false, error: { code: 'disabledAction', id: 'delete' } })
  assert.deepEqual(planScreenAction(s, { actionId: 'open-row', row: 9 }), { ok: false, error: { code: 'unknownRow', id: '9' } })
  assert.equal(planScreenAction(s, { actionId: 'open-row', row: 1 }).kind, 'open-row')
  assert.deepEqual(planScreenAction(s, { actionId: 'action-on-row-archive', row: 0, listing: 'lines' }),
    { ok: true, actionId: 'action-on-row-archive', rowIndex: 0, listingId: 'lines', kind: 'row-action', method: 'archive' })
  assert.equal(planScreenAction(s, { actionId: 'nextPage' }).which, 'next')
  assert.equal(planScreenAction(s, { actionId: 'help' }).kind, 'app')
  assert.deepEqual(planScreenAction(s, { actionId: 'save', parameters: { x: 1 } }), { ok: true, actionId: 'save', parameters: { x: 1 }, kind: 'action' })
})

test('the query a message carries; kind query is planned as one; messages kept; the band window', () => {
  const push = { kind: 'query', event: 'run-action', detail: { requestId: 'r1', actionId: 'save', row: 2, listing: 'l', parameters: { a: 1 } } }
  assert.deepEqual(screenQueryOf(push), { event: 'run-action', requestId: 'r1', actionId: 'save', parameters: { a: 1 }, row: 2, listing: 'l' })
  assert.equal(screenQueryOf({ kind: 'query', event: 'describe-screen', detail: {} }), null, 'no request id')
  assert.equal(screenQueryOf({ kind: 'query', event: 'format-disk', detail: { requestId: 'x' } }), null)
  assert.deepEqual(agentPushPlanOf(push), { kind: 'query', query: screenQueryOf(push) })
  assert.deepEqual(agentPushPlanOf({ kind: 'query', event: 'nope', detail: {} }), { kind: 'ignore' })
  const kept = screenMessagesAfter([], { messages: Array.from({ length: 12 }, (_, i) => ({ variant: 'INFO', text: 't' + i })) })
  assert.equal(kept.length, 10)
  assert.deepEqual(kept[9], { variant: 'info', text: 't11' })
  assert.equal(agentOperatingOf({ lastQueryAt: 1000 }, 1000 + AGENT_OPERATING_MS - 1), true)
  assert.equal(agentOperatingOf({ lastQueryAt: 1000 }, 1000 + AGENT_OPERATING_MS), false)
  assert.equal(agentOperatingOf({ lastQueryAt: 1000, stopped: true }, 1001), false)
  // the answer action carries the answer, never the credentials twice
  assert.deepEqual(agentActionBodyOf(AGENT_SCREEN_ACTION, { sessionId: 's', secret: 'k' }, { requestId: 'r', screen: {}, secret: 'x' }).parameters,
    { sessionId: 's', secret: 'k', requestId: 'r', screen: {} })
})

// ── the runner (agentPush.mjs) ───────────────────────────────────────────────────────────────

const answered = []
const shellSinks = () => ({
  base: 'http://b', claim: { Channel: null, storage: memoryStorage() },
  fetchImpl: async () => new Promise(() => {}),
  call: async (base, body) => { answered.push(body); return { fragments: [] } },
})
const fakeOps = (input, { onEdit, onPress, confirming } = {}) => ({
  describe: () => input(),
  edit: async (e) => (onEdit ? onEdit(e) : true),
  press: async (p) => (onPress ? onPress(p) : true),
  confirmationOpen: () => !!(confirming && confirming()),
})
const fast = { settle: { firstMs: 0, quietMs: 0, maxMs: 300 } }

test('a query: the band shows, the content page is handed it, its answer is `_agent-screen`', async () => {
  resetAgentPush()
  const { doc, el } = makeDom()
  doc.body.appendChild(el('div', { id: 'mateuAgentOperating', hidden: true }, el('span', { id: 'mateuAgentOperatingText' }), el('oj-button', { id: 'mateuAgentStop' })))
  await withDocument(doc, async () => {
    installAgentPush(doc)
    answered.length = 0
    await syncAgentPush({ agentPush: true, serverSideType: 'x.App' }, shellSinks())
    const fired = []
    setAgentQueryHost({ fire: (q) => fired.push(q) })
    await applyAgentPush({ kind: 'query', event: 'describe-screen', detail: { requestId: 'r1' } })
    await sleep(5)
    assert.deepEqual(fired, [{ event: 'describe-screen', requestId: 'r1' }])
    assert.equal(doc.getElementById('mateuAgentOperating').hasAttribute('hidden'), false, 'the band shows')
    assert.equal(doc.getElementById('mateuAgentOperatingText').textContent, 'An AI agent is operating this screen')
    assert.equal(agentOperationState().operating, true)
    const a = await runAgentQuery(fired[0], fakeOps(() => inputOf()), fast)
    assert.equal(a.screen.route, '/orders/42')
    assert.equal(answered.length, 1)
    assert.equal(answered[0].actionId, '_agent-screen')
    assert.equal(answered[0].parameters.requestId, 'r1')
    assert.equal(answered[0].parameters.screen.header.title, 'Order 42')
    assert.equal(answered[0].serverSideType, 'x.App')
    // a second run of the same request does nothing (it was answered)
    assert.equal(await runAgentQuery(fired[0], fakeOps(() => inputOf()), fast), null)
  })
  resetAgentPush()
})

test('set-fields: refused whole (nothing typed) / typed one by one, settled, then the new screen', async () => {
  resetAgentPush()
  const { doc } = makeDom()
  await withDocument(doc, async () => {
    answered.length = 0
    await syncAgentPush({ agentPush: true }, shellSinks())
    const fired = []
    setAgentQueryHost({ fire: (q) => fired.push(q) })
    const typed = []
    let state = { number: '42' }
    const ops = fakeOps(() => inputOf({ view: { content: pageTree(), state } }), { onEdit: (e) => { typed.push(e.fieldId); state = { ...state, [e.fieldId]: e.value }; return true } })
    await applyAgentPush({ kind: 'query', event: 'set-fields', detail: { requestId: 'r2', values: { customer: 'Grace', number: '1' } } })
    await runAgentQuery(fired[0], ops, fast)
    assert.deepEqual(typed, [], 'nothing typed when one id is refused')
    assert.deepEqual(answered[0].parameters, { sessionId: answered[0].parameters.sessionId, secret: answered[0].parameters.secret, requestId: 'r2', error: { code: 'unknownField', id: 'number' } })
    await applyAgentPush({ kind: 'query', event: 'set-fields', detail: { requestId: 'r3', values: { customer: 'Grace' } } })
    const a = await runAgentQuery(fired[1], ops, fast)
    assert.deepEqual(typed, ['customer'])
    assert.equal(a.screen.fields.find((f) => f.id === 'customer').value, 'Grace')
  })
  resetAgentPush()
})

test('run-action: pressed (not awaited: a confirmation waits for the user), refusals, app actions unsupported', async () => {
  resetAgentPush()
  const { doc } = makeDom()
  await withDocument(doc, async () => {
    answered.length = 0
    await syncAgentPush({ agentPush: true }, shellSinks())
    const fired = []
    setAgentQueryHost({ fire: (q) => fired.push(q) })
    const pressed = []
    let confirming = false
    const ops = fakeOps(() => inputOf(), {
      onPress: (p) => { pressed.push(p); confirming = true; return new Promise(() => {}) }, // waits for the user
      confirming: () => confirming,
    })
    await applyAgentPush({ kind: 'query', event: 'run-action', detail: { requestId: 'r4', actionId: 'save' } })
    const a = await runAgentQuery(fired[0], ops, fast)
    assert.equal(pressed[0].kind, 'action')
    assert.ok(a.screen, 'answered while the confirmation is on screen')
    for (const [detail, error] of [
      [{ requestId: 'r5', actionId: 'delete' }, { code: 'disabledAction', id: 'delete' }],
      [{ requestId: 'r6', actionId: 'open-row', row: 5 }, { code: 'unknownRow', id: '5' }],
      [{ requestId: 'r7', actionId: 'help' }, { code: 'unsupported' }],
    ]) {
      await applyAgentPush({ kind: 'query', event: 'run-action', detail })
      const r = await runAgentQuery(fired[fired.length - 1], ops, fast)
      assert.deepEqual(r.error, error)
    }
    assert.equal(pressed.length, 1)
  })
  resetAgentPush()
})

test('nobody takes a query: no host → unsupported; a host that never runs it → failed after the claim time', async () => {
  resetAgentPush()
  const { doc } = makeDom()
  await withDocument(doc, async () => {
    answered.length = 0
    await syncAgentPush({ agentPush: true }, shellSinks())
    await applyAgentPush({ kind: 'query', event: 'describe-screen', detail: { requestId: 'n1' } })
    await sleep(5)
    assert.deepEqual(answered[0].parameters.error, { code: 'unsupported' })
    setAgentQueryHost({ fire: () => { throw new Error('no page') } })
    await applyAgentPush({ kind: 'query', event: 'describe-screen', detail: { requestId: 'n2' } })
    await sleep(5)
    assert.deepEqual(answered[1].parameters.error, { code: 'failed' })
  })
  resetAgentPush()
})

test('the settle wait: the tab\'s own calls in flight hold it; a confirmation on screen ends it', async () => {
  resetAgentPush()
  noteAgentTransport(1)
  let ended = false
  const waiting = settleAgentScreen({}, { firstMs: 0, quietMs: 20, maxMs: 1000 }).then((r) => { ended = r })
  await sleep(60)
  assert.equal(ended, false, 'a call is in flight')
  noteAgentTransport(-1)
  await waiting
  assert.equal(ended, 'idle')
  noteAgentTransport(1)
  assert.equal(await settleAgentScreen({ confirmationOpen: () => true }, { firstMs: 0, maxMs: 500 }), 'confirmation')
  assert.equal(await settleAgentScreen({}, { firstMs: 0, maxMs: 80 }), 'timeout')
  noteAgentTransport(-1)
  noteAgentAnswer({ messages: [{ variant: 'error', text: 'Nope' }] })
  resetAgentPush()
})

test('Stop: unpaired, channel closed, band hidden, queries ignored; connecting again reopens the channel', async () => {
  resetAgentPush()
  const { doc, el, fire } = makeDom()
  doc.body.appendChild(el('div', { id: 'mateuAgentOperating', hidden: true }, el('span', { id: 'mateuAgentOperatingText' }), el('oj-button', { id: 'mateuAgentStop' }, el('span', { id: 'stopInner' }))))
  await withDocument(doc, async () => {
    installAgentPush(doc)
    answered.length = 0
    let opened = 0
    const sinks = shellSinks()
    sinks.fetchImpl = async () => { opened++; return new Promise(() => {}) }
    sinks.call = async (base, body) => {
      answered.push(body)
      return body.actionId === '_agent-pair' ? { fragments: [{ data: { _agentPairing: { code: 'AB12-CD34', expiresInSeconds: 300 } } }] } : { fragments: [] }
    }
    await syncAgentPush({ agentPush: true }, sinks)
    await sleep(5)
    assert.equal(opened, 1)
    const fired = []
    setAgentQueryHost({ fire: (q) => fired.push(q) })
    await applyAgentPush({ kind: 'query', event: 'describe-screen', detail: { requestId: 's1' } })
    fire(doc.getElementById('stopInner'), 'ojAction')
    await sleep(10)
    assert.equal(answered.at(-1).actionId, '_agent-unpair')
    assert.equal(agentOperationState().stopped, true)
    assert.equal(doc.getElementById('mateuAgentOperating').hasAttribute('hidden'), true)
    // the pending one was dropped; a new one is ignored
    assert.equal(await runAgentQuery(fired[0], fakeOps(() => inputOf()), fast), null)
    await applyAgentPush({ kind: 'query', event: 'describe-screen', detail: { requestId: 's2' } })
    assert.equal(fired.length, 1)
    // the shell rebuilding does not reopen it
    await syncAgentPush({ agentPush: true }, sinks)
    await sleep(5)
    assert.equal(opened, 1)
    // Connect AI does
    const pairing = requestAgentPairing()
    await sleep(20)
    assert.equal(opened, 2, 'the channel opened again')
    assert.equal(agentOperationState().stopped, false)
    void pairing
  })
  resetAgentPush()
})

// ── the page's operations (DOM) ──────────────────────────────────────────────────────────────

test('page ops: the summary from the registry + drafts + painted errors; typing into the input on show; pressing through the page chains', async () => {
  const { doc, el } = makeDom()
  const input = el('oj-input-text', { 'data-field-id': 'customer' })
  input.messagesCustom = [{ severity: 'error', summary: '', detail: 'Cannot be empty' }]
  const heard = []
  input.addEventListener('valueChanged', (e) => heard.push(e.detail))
  doc.body.appendChild(el('div', { id: 'pageContent' }, input))
  doc.title = 'Order 42'
  const host = { tree: pageTree(), state: { number: '42' }, data: { lines: { page: { content: rows, totalElements: 2 } } } }
  const app = {
    mateuRegistry: { contexts: { [HOST_ID]: host }, stack: [], shell: { title: 'Shop', appContext: [], headerActions: [] } },
    mateuSelectedRoute: '/orders/42', mateuAppState: {}, mateuListingRows: [{ _group: true }, { id: 1, _rowNumber: 0 }, { id: 2, _rowNumber: 1 }],
  }
  const page = { mateuDraft: { customer: 'Typed' } }
  const chains = []
  const ops = agentPageOps({ app, page, doc, callChain: async (chain, params) => { chains.push([chain, params]) } })
  const s = buildScreenSummary(ops.describe())
  assert.equal(s.windowTitle, 'Order 42')
  assert.equal(s.fields.find((f) => f.id === 'customer').value, 'Typed', 'what was typed and not sent yet')
  assert.deepEqual(s.errors, { customer: 'Cannot be empty' })
  assert.equal(s.listings[0].rows.length, 2)
  // typing: the input takes the value and announces it as its own (internal) change
  assert.equal(agentFieldElementOf(doc, 'customer', false), input)
  assert.equal(await ops.edit({ fieldId: 'customer', value: 'Grace', kind: 'field' }), true)
  assert.equal(input.value, 'Grace')
  assert.deepEqual(heard, [{ value: 'Grace', previousValue: undefined, updatedFrom: 'internal' }])
  // no input on show: the edit chain still records it
  await ops.edit({ fieldId: 'notes', value: 'x', kind: 'field' })
  assert.deepEqual(chains.at(-1), ['mateuFieldEdited', { fieldId: 'notes', event: { detail: { value: 'x', updatedFrom: 'internal' } } }])
  assert.equal(await ops.edit({ fieldId: 'status', value: 'x', kind: 'filter' }), false, 'a filter widget not on show: unsupported')
  await ops.edit({ fieldId: 'searchText', value: 'nu', kind: 'search' })
  assert.equal(app.mateuLastSearchText, 'nu')
  // pressing
  await ops.press({ kind: 'action', actionId: 'save', parameters: { a: 1 } })
  assert.deepEqual(chains.at(-1), ['dispatchHostBlockAction', { actionId: 'save', parameters: { a: 1 } }])
  await ops.press({ kind: 'row-action', method: 'archive', listingId: 'lines', rowIndex: 1 })
  assert.deepEqual(chains.at(-1), ['listingRowAction', { methodName: 'archive', rowId: 2, rowKey: 1 }])
  await ops.press({ kind: 'open-row', listingId: 'lines', rowIndex: 0 })
  assert.equal(chains.at(-1)[0], 'mateuRowClicked')
  assert.deepEqual(chains.at(-1)[1].event.detail.context, { key: 0, item: { data: { id: 1, _rowNumber: 0 } } })
  await ops.press({ kind: 'search' })
  assert.deepEqual(chains.at(-1), ['runMateuSearch', { searchText: 'nu' }])
  await ops.press({ kind: 'page', which: 'next' })
  assert.deepEqual(chains.at(-1), ['listingPaged', { which: 'next' }])
  // an overlay on top: its tree, its draft, and its actions go through runMateuAction
  app.mateuRegistry = { ...app.mateuRegistry, contexts: { ...app.mateuRegistry.contexts, 'overlay-1': { id: 'overlay-1', tree: { type: 'ClientSide', metadata: { type: 'Drawer', headerTitle: 'Edit', content: field('qty') } }, state: { qty: 1 } } }, stack: ['overlay-1'] }
  page.mateuDrawerDraft = { qty: 2 }
  const o = buildScreenSummary(ops.describe())
  assert.equal(o.focus, 'overlay')
  assert.deepEqual(o.overlay.fields, [{ id: 'qty', label: 'Qty', type: 'string', value: 2 }])
  await ops.press({ kind: 'action', actionId: 'saveLine' })
  assert.deepEqual(chains.at(-1), ['runMateuAction', { actionId: 'saveLine', parameters: undefined }])
  assert.equal(agentTypeInto(null, 'x'), false)
})

// ── wiring + texts ───────────────────────────────────────────────────────────────────────────

test('wiring: bridge order + exports, the app event, the page listener + chain, the shell band, the busy count', () => {
  const amd = readFileSync(join(here, 'make-amd.mjs'), 'utf8')
  assert.ok(amd.indexOf("'agentScreen.mjs'") > 0 && amd.indexOf("'agentScreen.mjs'") < amd.indexOf("'agentPush.mjs'"))
  for (const name of ['setAgentQueryHost', 'noteAgentTransport', 'runAgentQuery', 'agentPageOps']) assert.match(amd, new RegExp('\\n\\s+' + name + ','), name)
  const flow = JSON.parse(webApp('app-flow.json'))
  assert.deepEqual(flow.events.mateuAgentQuery.payloadType, { query: 'any' })
  const pageJson = JSON.parse(webApp('flows/main/pages/main-start-page.json'))
  assert.deepEqual(pageJson.eventListeners['application:mateuAgentQuery'], { chains: [{ chain: 'agentQueryRun', parameters: { query: '{{ $event.query }}' } }] })
  const chain = webApp('flows/main/pages/main-start-page-chains/agentQueryRun.js')
  assert.match(chain, /bridge\.runAgentQuery\(query, bridge\.agentPageOps\(/)
  const load = webApp('pages/shell-page-chains/loadMateuShell.js')
  assert.match(load, /bridge\.setAgentQueryHost\(\{[\s\S]*?application:mateuAgentQuery/)
  assert.match(load, /bridge\.noteAgentTransport\(1\)/)
  assert.match(load, /bridge\.noteAgentTransport\(-1\)/)
  const html = webApp('pages/shell-page.html')
  assert.match(html, /<div id="mateuAgentOperating" class="mateu-agent-operating" role="status" hidden>/)
  assert.match(html, /<oj-button id="mateuAgentStop"[^>]*><oj-bind-text value="\[\[ \$application\.translations\.appBundle\.agentStop \]\]">/)
  assert.match(webApp('resources/css/app.css'), /\.mateu-agent-operating\[hidden\] \{ display: none !important; \}/)
})

test('texts: the band and Stop in the six chrome languages (and in the VB bundles)', () => {
  const expected = {
    en: ['An AI agent is operating this screen', 'Stop'], es: ['Un agente de IA está manejando esta pantalla', 'Detener'],
    fr: ["Un agent d'IA pilote cet écran", 'Arrêter'], de: ['Ein KI-Agent bedient diesen Bildschirm', 'Stoppen'],
    pt: ['Um agente de IA está operando esta tela', 'Parar'], it: ['Un agente di IA sta usando questa schermata', 'Interrompi'],
  }
  for (const lang of FULL_LANGUAGES || Object.keys(expected)) {
    assert.deepEqual([CHROME_TEXTS[lang].agentOperating, CHROME_TEXTS[lang].agentStop], expected[lang], lang)
    assert.ok(CHROME_TEXTS[lang].agentStopped, lang + ' agentStopped')
    const nls = JSON.parse(webApp('resources/strings/appBundle/nls/' + (lang === 'en' ? 'root' : lang) + '/appBundle-strings.json'))
    assert.equal(nls.agentStop, expected[lang][1], lang + ' bundle (npm run bridge)')
  }
})

for (const { name, fn } of queue) {
  await fn()
  passed++
  console.log(`  ✓ ${name}`)
}
console.log(`\n${passed} agent-screen tests passed`)
