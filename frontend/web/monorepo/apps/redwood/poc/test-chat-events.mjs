// The AI chat's UI events on the Redwood/VB renderer (poc/chat.mjs): what the shell does with the
// `{"event": …, "detail": …}` an agent streams — navigation-requested, close-requested,
// render-screen (a subscriber on screen, or the built-in render target through `__preview__`) and
// any other — and that it does it AS THE EVENT ARRIVES, while the answer keeps streaming.
// Run: node test-chat-events.mjs (npm test runs it with the other suites).
import './test-locale.mjs' // first: off English the suite reruns in English (see the module)
import assert from 'node:assert/strict'
import { reduceContexts, HOST_ID, overlayOf } from './reduceContexts.mjs'
import {
  renderScreenRequestOf, chatNavigationOf, navigationLoadExtraOf, chatEventPlanOf, chatPreviewBodyOf,
  chatPreviewIncrementOf, dispatchChatEvent, streamChat, resolveChatUrl, chatConfigOf, chatUsageTextOf,
  CHAT_PREVIEW_ACTION, CHAT_AGENT_BUILT_IN_EVENTS, CHAT_RESERVED_EVENT_NAMES, CHAT_RESERVED_EVENT_PREFIXES,
  agentMayDispatchEvent,
} from './chat.mjs'
import { readFileSync } from 'node:fs'
import { setChromeLanguage } from './i18n.mjs'

setChromeLanguage('en')
let passed = 0
const queue = []
const test = (name, fn) => queue.push({ name, fn })

// a registry whose host listens to `eventName` (an OnCustomEvent trigger, what @SubscribeTo emits)
const regWith = (triggers = [], islands = {}) => ({
  shell: null, stack: [],
  contexts: {
    [HOST_ID]: { id: HOST_ID, kind: 'host', state: { a: 1 }, data: {}, tree: { type: 'ServerSide', id: 'h', serverSideType: 'x.Host', triggers, children: [] } },
    ...islands,
  },
})
const preview = (component) => ({ commands: [], messages: [], fragments: [{ targetComponentId: '', action: 'Replace', component, state: { name: 'Ada' } }] })
const redText = { type: 'ClientSide', id: 't1', metadata: { type: 'Text', text: 'Invalid or empty YAML', style: 'color: red;' }, children: [] }
const formPage = { type: 'ServerSide', id: 'p1', serverSideType: undefined, children: [
  { type: 'ClientSide', metadata: { type: 'Page', title: 'Check-in' }, children: [
    { type: 'ClientSide', metadata: { type: 'FormField', fieldId: 'name', label: 'Name', dataType: 'string' }, children: [] }] }] }

// ── render-screen ────────────────────────────────────────────────────────────────────────────

test('render-screen: yaml wins over uidl; uidl as an object travels as JSON; nothing → no request', () => {
  assert.deepEqual(renderScreenRequestOf({ yaml: 'type: Page', uidl: { a: 1 } }), { yaml: 'type: Page', target: 'content' })
  assert.deepEqual(renderScreenRequestOf({ uidl: { type: 'Page' }, target: 'drawer', title: 'New' }),
    { yaml: '{"type":"Page"}', target: 'drawer', title: 'New' })
  assert.deepEqual(renderScreenRequestOf({ uidl: 'type: Text', target: 'dialog' }), { yaml: 'type: Text', target: 'dialog' })
  assert.equal(renderScreenRequestOf({ yaml: 'x', target: 'sidebar' }).target, 'content', 'an unknown target is the content')
  assert.equal(renderScreenRequestOf({}), null)
  assert.equal(renderScreenRequestOf({ yaml: '   ' }), null)
  assert.equal(renderScreenRequestOf(null), null)
})

test('render-screen with a subscriber on screen: THAT action runs with the detail — no hard-coded action, no preview', () => {
  const reg = regWith([{ type: 'OnCustomEvent', eventName: 'render-screen', actionId: 'paintIt' }])
  const plan = chatEventPlanOf({ event: 'render-screen', detail: { yaml: 'type: Page' } }, reg)
  assert.equal(plan.kind, 'subscribers')
  assert.deepEqual(plan.subscribers, [{ ctxId: HOST_ID, actionId: 'paintIt', parameters: { yaml: 'type: Page' } }])
})

test('render-screen: an ISLAND subscribed (DOCUMENT scope) is reached on its own surface', () => {
  const reg = regWith([], { isl: { id: 'isl', kind: 'island', state: {}, data: {}, tree: { type: 'ServerSide', id: 'isl', triggers: [{ type: 'OnCustomEvent', eventName: 'render-screen', actionId: 'show' }], children: [] } } })
  const plan = chatEventPlanOf({ event: 'render-screen', detail: { yaml: 'y' } }, reg)
  assert.deepEqual(plan.subscribers.map((s) => [s.ctxId, s.actionId]), [['isl', 'show']])
})

test('render-screen with NO subscriber: the built-in render target (preview); without a definition: ignored', () => {
  const plan = chatEventPlanOf({ event: 'render-screen', detail: { yaml: 'type: Page', target: 'dialog', title: 'T' } }, regWith())
  assert.equal(plan.kind, 'preview')
  assert.deepEqual(plan.request, { yaml: 'type: Page', target: 'dialog', title: 'T' })
  // another event's subscriber does not take it
  const other = regWith([{ type: 'OnCustomEvent', eventName: 'saved', actionId: 'search' }])
  assert.equal(chatEventPlanOf({ event: 'render-screen', detail: { yaml: 'x' } }, other).kind, 'preview')
  assert.equal(chatEventPlanOf({ event: 'render-screen', detail: {} }, regWith()).kind, 'ignore')
  assert.equal(chatEventPlanOf({ event: 'render-screen' }, null).kind, 'ignore')
})

test('the __preview__ call: current route, consumed as is, NO serverSideType, empty state, the YAML as _yaml', () => {
  const body = chatPreviewBodyOf('/orders', { yaml: 'type: Page', target: 'content' })
  assert.equal(body.actionId, CHAT_PREVIEW_ACTION)
  assert.equal(body.actionId, '__preview__')
  assert.equal(body.route, '/orders')
  assert.equal(body.consumedRoute, '/orders')
  assert.equal(body.serverSideType, undefined)
  assert.deepEqual(body.componentState, {})
  assert.deepEqual(body.parameters, { _yaml: 'type: Page', _untrusted: true })
})

test('NB1: a preview answer is painted UNTRUSTED — no handler, import or markup survives, the rest does', () => {
  const evil = { type: 'ClientSide', id: 'e', children: [], metadata: { type: 'Element', name: 'img',
    attributes: { src: 'x.png', onerror: "fetch('https://evil/')", import: 'https://attacker/x.js' }, on: {}, content: '<b>x</b>', html: true } }
  const answer = { ...preview(evil), commands: [{ type: 'AddContentToHead', data: '<script>1</script>' }, { type: 'SetWindowTitle', data: 'T' }] }
  for (const target of ['content', 'drawer']) {
    const inc = chatPreviewIncrementOf(answer, { yaml: 'x', target }, '/r')
    const text = JSON.stringify(inc)
    assert.ok(!/onerror|attacker|AddContentToHead/.test(text), target + ': ' + text)
    assert.ok(text.includes('x.png') && text.includes('SetWindowTitle'), target)
    assert.ok(text.includes('"html":false'), target)
  }
})

test('preview into the CONTENT: the answer replaces the host — painted like any page re-render', () => {
  const inc = chatPreviewIncrementOf(preview(formPage), { target: 'content' })
  const reg = reduceContexts(regWith(), inc)
  assert.deepEqual(reg.contexts[HOST_ID].tree, formPage)
  assert.equal(reg.contexts[HOST_ID].state.name, 'Ada')
  assert.equal(reg.stack.length, 0, 'no overlay')
})

test('preview of an invalid YAML: the backend\'s red Text is painted as is', () => {
  const reg = reduceContexts(regWith(), chatPreviewIncrementOf(preview(redText), { target: 'content' }, '/hello'))
  const tree = reg.contexts[HOST_ID].tree
  // a ClientSide answer is wrapped as a page (a ServerSide boundary, no class of the app)
  assert.equal(tree.type, 'ServerSide')
  assert.equal(tree.serverSideType, undefined)
  assert.equal(tree.route, '/hello')
  assert.equal(tree.children[0].metadata.text, 'Invalid or empty YAML')
})

test('preview into a DRAWER / DIALOG: an overlay Add the usual overlay projection paints, title in its header', () => {
  const drawer = reduceContexts(regWith(), chatPreviewIncrementOf(preview(formPage), { target: 'drawer', title: 'Generated' }))
  assert.equal(drawer.stack.length, 1)
  assert.equal(drawer.contexts[HOST_ID].tree.serverSideType, 'x.Host', 'the page under it stays')
  const o = overlayOf(drawer)
  assert.ok(o && !o.isDialog)
  assert.equal(o.title, 'Generated')
  const dialog = reduceContexts(regWith(), chatPreviewIncrementOf(preview(redText), { target: 'dialog' }))
  assert.ok(overlayOf(dialog).isDialog)
  assert.equal(chatPreviewIncrementOf({ fragments: [] }, { target: 'content' }), null, 'no component → nothing to paint')
})

test('a subscriber answering a bare component (ChatGenerate.renderScreen returns the parsed Form) re-renders INSIDE its envelope', () => {
  const form = { type: 'ClientSide', metadata: { type: 'Form', title: 'Generated' }, children: [] }
  const reg = reduceContexts(regWith([{ type: 'OnCustomEvent', eventName: 'render-screen', actionId: 'renderScreen' }]),
    { commands: [], messages: [], fragments: [{ targetComponentId: 'h', action: 'Replace', component: form }] })
  const tree = reg.contexts[HOST_ID].tree
  assert.equal(tree.type, 'ServerSide')
  assert.equal(tree.serverSideType, 'x.Host', 'later actions still reach the class')
  assert.equal(tree.triggers.length, 1)
  assert.deepEqual(tree.children, [form])
})

// ── navigation-requested / close-requested / others ────────────────────────────────────────────

test('navigation-requested: every menu-click field travels, not only the route', () => {
  const detail = { route: '/orders', consumedRoute: '', actionId: 'open', baseUrl: '/_pod', serverSideType: 'a.B', uriPrefix: '/p', junk: 1 }
  assert.deepEqual(chatNavigationOf(detail), { route: '/orders', actionId: 'open', baseUrl: '/_pod', serverSideType: 'a.B', uriPrefix: '/p' })
  assert.deepEqual(chatEventPlanOf({ event: 'navigation-requested', detail }, regWith()),
    { kind: 'navigate', navigation: chatNavigationOf(detail) })
  assert.equal(chatEventPlanOf({ event: 'navigation-requested', detail: {} }, null).kind, 'ignore')
  // what the load adds: the menu-click fields (baseUrl is where it goes, registered apart)
  assert.deepEqual(navigationLoadExtraOf(chatNavigationOf(detail)), { serverSideType: 'a.B', actionId: 'open' })
  assert.deepEqual(navigationLoadExtraOf({ route: '/x', consumedRoute: '/x' }), { consumedRoute: '/x' })
  assert.deepEqual(navigationLoadExtraOf(undefined), {})
})

test('close-requested closes; any other event goes to the document AND to its subscribers on screen', () => {
  assert.equal(chatEventPlanOf({ event: 'close-requested' }, null).kind, 'close')
  const reg = regWith([{ type: 'OnCustomEvent', eventName: 'booking-made', actionId: 'refresh' }])
  const plan = chatEventPlanOf({ event: 'booking-made', detail: { id: 7 } }, reg)
  assert.equal(plan.kind, 'custom')
  assert.equal(plan.dispatch, true)
  assert.deepEqual(plan.subscribers, [{ ctxId: HOST_ID, actionId: 'refresh', parameters: { id: 7 } }])
})

test('NM9: an event nobody on screen declares, or one of the framework\'s own, goes nowhere', async () => {
  const corpus = JSON.parse(readFileSync(new URL('../../../../../../conformance/client/agent-events.json', import.meta.url), 'utf8'))
  assert.deepEqual([...CHAT_AGENT_BUILT_IN_EVENTS], corpus.builtIn)
  assert.deepEqual([...CHAT_RESERVED_EVENT_NAMES], corpus.reserved)
  assert.deepEqual(CHAT_RESERVED_EVENT_PREFIXES, corpus.reservedPrefixes)
  for (const c of corpus.cases) assert.equal(agentMayDispatchEvent(c.name, c.subscribed.includes(c.name)), c.allowed, c.name)
  assert.equal(chatEventPlanOf({ event: 'booking-made', detail: {} }, regWith()).kind, 'ignore', 'undeclared')
  const reserved = regWith([{ type: 'OnCustomEvent', eventName: 'mateu-session-expired', actionId: 'x' }])
  assert.equal(chatEventPlanOf({ event: 'mateu-session-expired', detail: {} }, reserved).kind, 'ignore', 'framework event, even subscribed')
  // and nothing reaches the document
  const heard = []
  const doc = { dispatchEvent: (e) => heard.push(e.type) }
  await dispatchChatEvent({ event: 'mateu-session-expired', detail: {} }, null, doc)
  await dispatchChatEvent({ event: 'booking-made', detail: {} }, null, doc)
  assert.deepEqual(heard, [])
})

// ── the dispatcher, against a fake host ──────────────────────────────────────────────────────

const fakeHost = (reg, answer) => {
  const log = []
  return {
    log,
    registry: () => reg,
    currentRoute: () => '/hello',
    base: () => 'http://b',
    navigate: async (n) => log.push(['navigate', n]),
    closeChat: async () => log.push(['close']),
    runAction: async (actionId, parameters, ctxId) => log.push(['run', actionId, parameters, ctxId]),
    call: async (base, body) => { log.push(['call', base, body]); return answer },
    paintPreview: async (inc, request) => log.push(['paint', inc, request]),
    onError: (e) => log.push(['error', e.message]),
  }
}
const fakeDoc = () => { const seen = []; return { seen, dispatchEvent: (e) => seen.push([e.type, e.detail]) } }

test('dispatch: render-screen with no subscriber POSTs __preview__ to the screen\'s backend and paints the answer', async () => {
  const host = fakeHost(regWith(), preview(formPage))
  const doc = fakeDoc()
  await dispatchChatEvent({ event: 'render-screen', detail: { yaml: 'type: Page' } }, host, doc)
  const call = host.log.find((l) => l[0] === 'call')
  assert.equal(call[1], 'http://b')
  assert.equal(call[2].route, '/hello')
  assert.deepEqual(call[2].parameters, { _yaml: 'type: Page', _untrusted: true })
  const paint = host.log.find((l) => l[0] === 'paint')
  assert.deepEqual(paint[1].fragments[0].component, formPage)
  assert.equal(paint[2].target, 'content')
  assert.ok(!host.log.some((l) => l[0] === 'run'), 'no hard-coded renderScreen action')
  assert.deepEqual(doc.seen.map((s) => s[0]), ['render-screen'])
})

test('dispatch: render-screen WITH a subscriber runs its action and does not preview', async () => {
  const host = fakeHost(regWith([{ type: 'OnCustomEvent', eventName: 'render-screen', actionId: 'renderScreen' }]), preview(formPage))
  await dispatchChatEvent({ event: 'render-screen', detail: { yaml: 'y' } }, host, fakeDoc())
  assert.deepEqual(host.log, [['run', 'renderScreen', { yaml: 'y' }, HOST_ID]])
})

test('dispatch: navigation and close reach the shell; navigation is not re-dispatched to the document', async () => {
  const host = fakeHost(regWith(), null)
  const doc = fakeDoc()
  await dispatchChatEvent({ event: 'navigation-requested', detail: { route: '/products', serverSideType: 'a.B' } }, host, doc)
  await dispatchChatEvent({ event: 'close-requested' }, host, doc)
  assert.deepEqual(host.log, [['navigate', { route: '/products', serverSideType: 'a.B' }], ['close']])
  assert.equal(doc.seen.length, 0)
})

test('dispatch: a failing preview is reported, never thrown into the stream', async () => {
  const host = fakeHost(regWith(), null)
  host.call = async () => { throw new Error('down') }
  const plan = await dispatchChatEvent({ event: 'render-screen', detail: { yaml: 'y' } }, host, fakeDoc())
  assert.equal(plan.kind, 'preview')
  assert.deepEqual(host.log, [['error', 'down']])
})

// ── MID-STREAM: the event is handled while the answer is still arriving ────────────────────────

test('mid-stream: render-screen is painted BEFORE the stream ends', async () => {
  const enc = new TextEncoder()
  let release
  const gate = new Promise((r) => { release = r })
  const chunks = ['data: {"event":"render-screen","detail":{"yaml":"type: Page"}}\n\n', 'data: done\n\n']
  let i = 0
  const response = { ok: true, body: { getReader: () => ({ read: async () => {
    if (i === 1) await gate // the rest of the answer waits until the screen is painted
    return i < chunks.length ? { done: false, value: enc.encode(chunks[i++]) } : { done: true }
  } }) } }
  const host = fakeHost(regWith(), preview(formPage))
  const paintedBeforeEnd = new Promise((resolve) => {
    host.paintPreview = async () => { resolve(true); release() }
  })
  let ended = false
  const done = streamChat({
    url: '/sse', body: {}, fetchImpl: async () => response,
    onEvent: (ev) => { void dispatchChatEvent(ev, host, fakeDoc()) },
  }).then((t) => { ended = true; return t })
  assert.equal(await paintedBeforeEnd, true)
  assert.equal(await done, 'done')
  assert.ok(ended)
})

// ── URLs and the token line ──────────────────────────────────────────────────────────────────

test('a relative chat URL resolves against the backend base with URL semantics', () => {
  assert.equal(resolveChatUrl('/agent/stream', 'http://b:9005'), 'http://b:9005/agent/stream')
  assert.equal(resolveChatUrl('/agent/stream', 'http://b:9005/app'), 'http://b:9005/agent/stream', '"/x" is the backend origin + /x')
  assert.equal(resolveChatUrl('api/chat', 'http://b:9005'), 'http://b:9005/api/chat')
  assert.equal(resolveChatUrl('api/chat', 'http://b:9005/app'), 'http://b:9005/app/api/chat')
  assert.equal(resolveChatUrl('https://agent.example/s', 'http://b'), 'https://agent.example/s')
  assert.equal(resolveChatUrl('/agent/stream', ''), '/agent/stream')
  assert.equal(resolveChatUrl('api/chat', ''), '/api/chat')
  assert.equal(resolveChatUrl('', 'http://b'), '')
  assert.equal(chatConfigOf({ sseUrl: 'api/chat' }, 'http://b').sseUrl, 'http://b/api/chat')
})

test('the token line of the inline chat', () => {
  assert.equal(chatUsageTextOf({ inputTokens: 12, outputTokens: 30 }), 'Tokens: input 12 · output 30')
  assert.equal(chatUsageTextOf(null), '')
})

for (const { name, fn } of queue) {
  await fn()
  passed++
  console.log(`  ✓ ${name}`)
}
console.log(`\n${passed} chat-event tests passed`)
