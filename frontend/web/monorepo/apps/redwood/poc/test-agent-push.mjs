// Live UI push on the Redwood/VB renderer (poc/agentPush.mjs) — the UI half of phase C
// (conformance/mcp/README.md "Live UI push"): the tab's UI session and secret, the `_agent-channel`
// stream (one per tab, reconnect at once after the server's cut, back-off after failures, stop on
// "not enabled"), what each AgentPush message does (the chat's dispatcher for render / navigate /
// event, the control for status), the pairing (`_agent-pair` / `_agent-unpair`) and the "Connect AI"
// control's view and DOM.
// Run: node test-agent-push.mjs (npm test runs it with the other suites). The async tests run ONE
// AT A TIME (a queue): run together they would share the fake fetch and timers.
import './test-locale.mjs' // first: off English the suite reruns in English (see the module)
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  AGENT_CHANNEL_ACTION, AGENT_PAIR_ACTION, AGENT_UNPAIR_ACTION, AGENT_PUSH_DISABLED, UI_SESSION_KEY, AGENT_SECRET_KEY,
  agentRandomToken, uiSessionId, agentChannelSecret, rotateUiSession, resetAgentSessionMemory, claimTabSession,
  agentActionBodyOf, agentPushesOf, agentRefusalOf, agentStatusOf, agentPushPlanOf, agentPairingOf, agentReconnectDelay,
  agentClockOf, agentSpokenCode, agentControlViewOf, agentStatusAnnouncementOf, createAgentChannel,
  applyAgentPush, syncAgentPush, installAgentPush, requestAgentPairing, unpairAgents, agentControlState, resetAgentPush,
  paintAgentControl,
} from './agentPush.mjs'
import { reduceContexts, HOST_ID } from './reduceContexts.mjs'
import { setChromeLanguage, CHROME_TEXTS } from './i18n.mjs'
import { NOT_IN_EMBEDDED } from './embedded.mjs'
import { makeDom, sleep } from './test-harness-dom.mjs'

setChromeLanguage('en')
const here = dirname(fileURLToPath(import.meta.url))
const webApp = (rel) => readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', rel), 'utf8')
let passed = 0
const queue = []
const test = (name, fn) => queue.push({ name, fn })

const memoryStorage = (init = {}) => {
  const m = new Map(Object.entries(init))
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m }
}
const push = (kind, event, detail) => ({ type: 'AgentPush', data: { kind, event, detail } })
const inc = (...commands) => ({ commands, messages: [], fragments: [] })
const sse = (...increments) => increments.map((i) => 'data: ' + JSON.stringify(i) + '\n\n')
const encoder = new TextEncoder()
/** A response whose body sends `chunks`, then ends — or stays open until aborted (`hold`). */
const responseOf = (chunks, { hold = false, signal, status = 200 } = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  body: new ReadableStream({
    start(c) {
      for (const ch of chunks) c.enqueue(encoder.encode(ch))
      if (!hold) c.close()
      else if (signal) signal.addEventListener('abort', () => { try { c.error(new Error('aborted')) } catch (e) { /* closed */ } })
    },
  }),
})
const flush = async (n = 6) => { for (let i = 0; i < n; i++) await sleep(0) }

// ── the tab's UI session ─────────────────────────────────────────────────────────────────────

test('the UI session id: created once per tab under the web renderer\'s key; the secret kept with it', () => {
  const s = memoryStorage()
  const id = uiSessionId(s)
  assert.ok(id.length >= 20 && /^[A-Za-z0-9_-]+$/.test(id), 'URL-safe, ≥128 bits')
  assert.equal(uiSessionId(s), id)
  assert.equal(s.m.get(UI_SESSION_KEY), id)
  assert.equal(UI_SESSION_KEY, '__mateu_sesion_id', 'the same key as libs/mateu authToken.ts')
  const secret = agentChannelSecret(s)
  assert.ok(secret.length >= 40)
  assert.equal(agentChannelSecret(s), secret)
  assert.equal(s.m.get(AGENT_SECRET_KEY), secret)
  const rotated = rotateUiSession(s)
  assert.notEqual(rotated.sessionId, id)
  assert.notEqual(rotated.secret, secret)
  assert.notEqual(agentRandomToken(), agentRandomToken())
})

test('blocked storage: the id lives in memory for the page', () => {
  resetAgentSessionMemory()
  const blocked = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } }
  const id = uiSessionId(blocked)
  assert.equal(uiSessionId(blocked), id)
  assert.equal(uiSessionId(null), id)
  resetAgentSessionMemory()
})

/** A BroadcastChannel stand-in: every instance named alike hears the others (async, like the real one). */
const busOf = () => {
  const all = []
  return class FakeChannel {
    constructor(name) { this.name = name; this.onmessage = null; all.push(this) }
    postMessage(data) { for (const c of all) if (c !== this && c.name === this.name) setTimeout(() => c.onmessage && c.onmessage({ data }), 0) }
  }
}

test('a duplicated tab (copied sessionStorage) takes a fresh session; a reload keeps its own', async () => {
  resetAgentSessionMemory()
  const Channel = busOf()
  const original = memoryStorage()
  const first = await claimTabSession({ storage: original, Channel, waitMs: 20 })
  assert.equal(first.sessionId, uiSessionId(original), 'a fresh tab asks nobody')
  resetAgentSessionMemory()
  // the duplicate: the same storage contents, another page
  const duplicate = memoryStorage(Object.fromEntries(original.m))
  const second = await claimTabSession({ storage: duplicate, Channel, waitMs: 20 })
  assert.notEqual(second.sessionId, first.sessionId, 'the original answered: the duplicate rotates')
  assert.notEqual(second.secret, agentChannelSecret(original))
  resetAgentSessionMemory()
  // a reload: the page that held it is gone, nobody answers
  const reloaded = memoryStorage(Object.fromEntries(original.m))
  const third = await claimTabSession({ storage: reloaded, Channel: busOf(), waitMs: 20 })
  assert.equal(third.sessionId, first.sessionId)
  resetAgentSessionMemory()
  // no BroadcastChannel at all, or one that throws: the stored session as is
  assert.equal((await claimTabSession({ storage: reloaded, Channel: null })).sessionId, first.sessionId)
  assert.equal((await claimTabSession({ storage: reloaded, Channel: function () { throw new Error('x') } })).sessionId, first.sessionId)
  resetAgentSessionMemory()
})

// ── the wire ─────────────────────────────────────────────────────────────────────────────────

test('the agent actions are app-level, with the session credentials (+ route and renderer on the channel)', () => {
  const creds = { sessionId: 's1', secret: 'k1', serverSideType: 'x.App', route: '/orders' }
  const channel = agentActionBodyOf(AGENT_CHANNEL_ACTION, creds)
  assert.deepEqual(channel, {
    route: '', consumedRoute: '', actionId: '_agent-channel', serverSideType: 'x.App', appState: {}, componentState: {},
    parameters: { sessionId: 's1', secret: 'k1', route: '/orders', renderer: 'redwood' }, initiatorComponentId: 'mateu-agent-channel',
  })
  assert.deepEqual(agentActionBodyOf(AGENT_PAIR_ACTION, creds).parameters, { sessionId: 's1', secret: 'k1' })
  assert.deepEqual(agentActionBodyOf(AGENT_UNPAIR_ACTION, { sessionId: 's1', secret: 'k1' }).parameters, { sessionId: 's1', secret: 'k1' })
  assert.equal(agentActionBodyOf(AGENT_UNPAIR_ACTION, { sessionId: 's1', secret: 'k1' }).serverSideType, undefined)
  assert.equal(agentActionBodyOf(AGENT_CHANNEL_ACTION, { sessionId: 's', secret: 'k' }).parameters.route, '')
})

test('the messages of an increment: AgentPush commands only, a known kind, detail {} when none', () => {
  const pushes = agentPushesOf({ commands: [
    push('render', 'render-screen', { yaml: 'type: Text\ntext: Hi\n', target: 'drawer', title: 'Greeting' }),
    { type: 'SetWindowTitle', data: { title: 'x' } },
    push('event', 'highlight-row', null),
    push('nope', 'x', {}),
    push('event', 'list', [1, 2]),
    { type: 'AgentPush' },
    null,
  ] })
  assert.deepEqual(pushes, [
    { kind: 'render', event: 'render-screen', detail: { yaml: 'type: Text\ntext: Hi\n', target: 'drawer', title: 'Greeting' } },
    { kind: 'event', event: 'highlight-row', detail: {} },
    { kind: 'event', event: 'list', detail: {} },
  ])
  assert.deepEqual(agentPushesOf(null), [])
  assert.deepEqual(agentPushesOf({ commands: [{ type: 'AgentPush', data: { kind: 'status', event: 7 } }] }), [{ kind: 'status', event: '', detail: {} }])
})

test('a refusal: an error message and no push (the heartbeat is no refusal)', () => {
  assert.equal(agentRefusalOf({ commands: [], messages: [{ variant: 'error', text: AGENT_PUSH_DISABLED }] }), AGENT_PUSH_DISABLED)
  assert.equal(agentRefusalOf({ messages: [{ variant: 'ERROR', title: 'Nope' }] }), 'Nope')
  assert.equal(agentRefusalOf({ messages: [{ variant: 'error' }] }), 'Error')
  assert.equal(agentRefusalOf({ commands: [], messages: [], fragments: [] }), null)
  assert.equal(agentRefusalOf({ messages: [{ variant: 'success', text: 'ok' }] }), null)
  assert.equal(agentRefusalOf(inc(push('status', 'mateu-agent-status', { paired: false, agents: [] }))), null)
  assert.equal(agentRefusalOf(null), null)
})

test('what a message means: status for the control, the chat event of its KIND for the rest', () => {
  assert.deepEqual(agentPushPlanOf({ kind: 'status', event: 'mateu-agent-status', detail: { paired: true, agents: ['alice', 7, ''] } }),
    { kind: 'status', status: { paired: true, agents: ['alice'] } })
  assert.deepEqual(agentStatusOf(null), { paired: false, agents: [] })
  const detail = { yaml: 'type: Text', target: 'dialog' }
  assert.deepEqual(agentPushPlanOf({ kind: 'render', event: 'whatever', detail }), { kind: 'chat', event: { event: 'render-screen', detail } })
  assert.deepEqual(agentPushPlanOf({ kind: 'navigate', event: 'navigation-requested', detail: { route: '/orders/42', consumedRoute: '' } }),
    { kind: 'chat', event: { event: 'navigation-requested', detail: { route: '/orders/42', consumedRoute: '' } } })
  assert.deepEqual(agentPushPlanOf({ kind: 'event', event: 'highlight-row', detail: { id: 7 } }),
    { kind: 'chat', event: { event: 'highlight-row', detail: { id: 7 } } })
  for (const reserved of ['close-requested', 'render-screen', 'navigation-requested', 'mateu-agent-status', 'bad name!', '']) {
    assert.deepEqual(agentPushPlanOf({ kind: 'event', event: reserved, detail: {} }), { kind: 'ignore' }, reserved)
  }
  assert.deepEqual(agentPushPlanOf({ kind: 'other' }), { kind: 'ignore' })
  assert.deepEqual(agentPushPlanOf(null), { kind: 'ignore' })
})

test('the pairing of a `_agent-pair` answer (Data{_agentPairing}); `_agent-unpair` answers null', () => {
  const data = (d) => ({ fragments: [{ data: { other: 1 } }, { data: d }] })
  assert.deepEqual(agentPairingOf(data({ _agentPairing: { code: 'K7QF-4MZP', expiresInSeconds: 300 } })), { code: 'K7QF-4MZP', expiresInSeconds: 300 })
  assert.deepEqual(agentPairingOf(data({ _agentPairing: { code: 'AB', expiresInSeconds: 'x' } })), { code: 'AB', expiresInSeconds: 300 })
  assert.equal(agentPairingOf(data({ _agentPairing: null })), null)
  assert.equal(agentPairingOf(data({ _agentPairing: { code: '' } })), null)
  assert.equal(agentPairingOf({ fragments: [null, {}] }), null)
  assert.equal(agentPairingOf(null), null)
})

test('reconnect at once after a healthy stream, back off after failures; the clock and the spoken code', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 10].map(agentReconnectDelay), [0, 1000, 2000, 4000, 8000, 60000])
  assert.equal(agentClockOf(300), '5:00')
  assert.equal(agentClockOf(247), '4:07')
  assert.equal(agentClockOf(0.2), '0:01')
  assert.equal(agentClockOf(-5), '0:00')
  assert.equal(agentSpokenCode('K7QF-4MZP'), 'K 7 Q F, 4 M Z P')
  assert.equal(agentSpokenCode(null), '')
})

// ── the control's view ───────────────────────────────────────────────────────────────────────

test('the control: code + countdown, expired, paired, loading, error, off, channel down', () => {
  const now = 1_000_000
  const unpaired = { paired: false, agents: [] }
  const code = agentControlViewOf({ channel: 'open', status: unpaired, pairing: { code: 'K7QF-4MZP', expiresAt: now + 247_000 } }, now)
  assert.equal(code.mode, 'code')
  assert.equal(code.code, 'K7QF-4MZP')
  assert.equal(code.spokenCode, 'K 7 Q F, 4 M Z P')
  assert.equal(code.countdown, 'Expires in 4:07')
  assert.equal(code.secondsLeft, 247)
  assert.equal(code.showNewCode, true)
  assert.equal(code.showDisconnect, false)
  assert.equal(code.connected, false)
  assert.equal(code.note, '')
  assert.match(agentControlViewOf({ channel: 'retrying', status: unpaired, pairing: { code: 'A', expiresAt: now + 5000 } }, now).note, /Connecting/)
  const expired = agentControlViewOf({ channel: 'open', status: unpaired, pairing: { code: 'A', expiresAt: now - 1 } }, now)
  assert.equal(expired.mode, 'expired')
  assert.match(expired.note, /expired/)
  const paired = agentControlViewOf({ channel: 'open', status: { paired: true, agents: ['alice', 'an agent'] } }, now)
  assert.equal(paired.mode, 'paired')
  assert.equal(paired.connected, true)
  assert.equal(paired.showDisconnect, true)
  assert.equal(paired.indicatorLabel, 'AI agent connected: alice, an agent')
  assert.deepEqual(paired.agents, ['alice', 'an agent'])
  assert.equal(agentControlViewOf({ status: { paired: true, agents: [] } }, now).indicatorLabel, 'AI agent connected: an agent')
  assert.equal(agentControlViewOf({ channel: 'open', status: unpaired, loading: true }).mode, 'loading')
  const error = agentControlViewOf({ channel: 'open', status: unpaired, error: 'boom' })
  assert.equal(error.mode, 'error')
  assert.equal(error.note, 'Could not reach the agent service: boom')
  const off = agentControlViewOf({ channel: 'off', status: { paired: true, agents: ['a'] } })
  assert.equal(off.mode, 'off')
  assert.equal(off.showDisconnect, false)
  assert.equal(agentControlViewOf({ channel: 'open', status: unpaired }).mode, 'none')
  assert.match(agentControlViewOf(null).note, /Connecting/)
})

test('what a status change says to a screen reader', () => {
  const none = { paired: false, agents: [] }
  assert.equal(agentStatusAnnouncementOf(none, { paired: true, agents: ['alice'] }), 'AI agent connected: alice')
  assert.equal(agentStatusAnnouncementOf(null, { paired: true, agents: [] }), 'AI agent connected: an agent')
  assert.equal(agentStatusAnnouncementOf({ paired: true, agents: ['alice'] }, none), 'AI agent disconnected')
  assert.equal(agentStatusAnnouncementOf({ paired: true, agents: ['alice'] }, { paired: true, agents: ['alice', 'bob'] }), 'AI agent connected: alice, bob')
  assert.equal(agentStatusAnnouncementOf({ paired: true, agents: ['alice'] }, { paired: true, agents: ['alice'] }), null)
  assert.equal(agentStatusAnnouncementOf(none, none), null)
})

// ── the channel ──────────────────────────────────────────────────────────────────────────────

/** A channel over a scripted fetch: `script` answers each call (url, init, n). */
const channelOver = (script, extra = {}) => {
  const calls = []
  const timers = []
  const states = []
  const pushes = []
  const refusals = []
  let clock = 0
  const channel = createAgentChannel({
    fetchImpl: async (url, init) => { calls.push({ url, init, body: JSON.parse(init.body) }); return script(url, init, calls.length) },
    headers: () => ({ Authorization: 'Bearer t' }),
    now: () => (clock += extra.step == null ? 3000 : extra.step),
    setTimer: (fn, ms) => { const t = { fn, ms }; timers.push(t); return t },
    clearTimer: (t) => { t.cleared = true },
    onPush: (p) => pushes.push(p),
    onState: (s) => states.push(s),
    onRefusal: (r) => refusals.push(r),
  })
  return { channel, calls, timers, states, pushes, refusals }
}
const target = { base: 'http://b:9005', serverSideType: 'x.App', sessionId: 'ui-2', secret: 'secret-2', route: () => '/orders' }

test('the channel: one POST to the SSE endpoint, the messages in order, reconnect AT ONCE after the server\'s cut', async () => {
  const { channel, calls, timers, states, pushes } = channelOver(() => responseOf(sse(
    inc(push('status', 'mateu-agent-status', { paired: false, agents: [] })),
    { commands: [], messages: [], fragments: [] }, // the 20 s heartbeat
    inc(push('render', 'render-screen', { yaml: 'type: Text\ntext: Hello\n', target: 'drawer', title: 'Greeting' }),
      push('navigate', 'navigation-requested', { route: '/orders/42', consumedRoute: '' })),
  ).concat([': comment\n\n', 'data: not json\n\n', 'data: ' + JSON.stringify(inc(push('event', 'highlight-row', { id: 7 })))])))
  channel.start(target)
  await flush()
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'http://b:9005/mateu/v3/sse/_no_route')
  assert.equal(calls[0].init.headers.Accept, 'text/event-stream')
  assert.equal(calls[0].init.headers.Authorization, 'Bearer t')
  assert.deepEqual(calls[0].body.parameters, { sessionId: 'ui-2', secret: 'secret-2', route: '/orders', renderer: 'redwood' })
  assert.equal(calls[0].body.actionId, '_agent-channel')
  assert.deepEqual(pushes.map((p) => p.kind), ['status', 'render', 'navigate', 'event'], 'in order, the last frame without its blank line too')
  assert.deepEqual(states, ['connecting', 'open', 'connecting'], 'reconnecting right after the cut')
  assert.equal(timers.length, 1)
  assert.equal(timers[0].ms, 0, 'the 5-minute cut: back at once')
  assert.equal(channel.failures, 0)
  timers[0].fn()
  await flush()
  assert.equal(calls.length, 2)
  channel.stop()
  assert.equal(channel.state, 'idle')
})

test('the channel: failures back off (HTTP error, early end, network), a refusal is reported', async () => {
  let n = 0
  const { channel, calls, timers, states, refusals } = channelOver(() => {
    n++
    if (n === 1) return responseOf([], { status: 500 })
    if (n === 2) throw new TypeError('Failed to fetch')
    if (n === 3) return responseOf(sse({ messages: [{ variant: 'error', text: 'This UI session belongs to another channel.' }] }))
    return responseOf(sse(inc(push('status', 'mateu-agent-status', { paired: false, agents: [] }))))
  }, { step: 10 })
  channel.start(target)
  await flush()
  assert.equal(timers.at(-1).ms, 1000)
  assert.equal(states.at(-1), 'retrying')
  timers.at(-1).fn(); await flush()
  assert.equal(timers.at(-1).ms, 2000)
  timers.at(-1).fn(); await flush()
  assert.deepEqual(refusals, ['This UI session belongs to another channel.'])
  assert.equal(timers.at(-1).ms, 4000)
  timers.at(-1).fn(); await flush()
  assert.equal(timers.at(-1).ms, 8000, 'a stream that ended within 2 s is no healthy stream')
  assert.equal(calls.length, 4)
  // start() again with another target: the pending timer is cleared and it connects at once
  const pending = timers.at(-1)
  channel.start({ ...target, sessionId: 'ui-3' })
  assert.equal(pending.cleared, true)
  await flush()
  assert.equal(calls.at(-1).body.parameters.sessionId, 'ui-3')
  channel.stop()
})

test('the channel: "push not enabled" stops it for good; stop() aborts an open stream; the same target is kept', async () => {
  const off = channelOver(() => responseOf(sse({ messages: [{ variant: 'error', text: AGENT_PUSH_DISABLED }] })))
  off.channel.start(target)
  await flush()
  assert.equal(off.channel.state, 'off')
  assert.equal(off.timers.length, 0, 'no reconnect')
  let signal
  const open = channelOver((url, init) => { signal = init.signal; return responseOf(sse(inc(push('status', 'mateu-agent-status', { paired: true, agents: ['bob'] }))), { hold: true, signal }) })
  open.channel.start(target)
  await flush()
  assert.equal(open.channel.state, 'open')
  open.channel.start({ ...target, route: () => '/other' })
  await flush()
  assert.equal(open.calls.length, 1, 'the same session on the same app: the stream stays')
  open.channel.stop()
  await flush()
  assert.equal(signal.aborted, true)
  assert.equal(open.timers.length, 0, 'a stopped channel does not come back')
  open.channel.start(null)
  assert.equal(open.channel.state, 'idle')
})

test('the channel with its defaults: the page\'s fetch, the stored token, real timers', async () => {
  const before = globalThis.fetch
  const sent = []
  globalThis.fetch = async (url, init) => { sent.push([url, init.headers]); return responseOf([]) }
  try {
    const channel = createAgentChannel()
    channel.start(target)
    await flush()
    assert.equal(sent.length, 1)
    assert.equal(sent[0][0], 'http://b:9005/mateu/v3/sse/_no_route')
    assert.equal(channel.state, 'retrying', 'an empty stream is a failure: a real 1 s timer is pending')
    channel.stop()
    assert.equal(channel.state, 'idle')
  } finally { globalThis.fetch = before }
})

// ── what a message does ──────────────────────────────────────────────────────────────────────

const hostOf = (reg) => {
  const did = []
  return {
    did,
    host: {
      registry: () => reg,
      currentRoute: () => '/orders',
      base: () => 'http://b',
      navigate: async (navigation) => did.push(['navigate', navigation]),
      closeChat: async () => did.push(['close']),
      runAction: async (actionId, parameters, ctxId) => did.push(['run', actionId, parameters, ctxId]),
      call: async (base, body) => { did.push(['call', base, body.actionId, body.parameters]); return { commands: [], messages: [], fragments: [{ component: { type: 'ClientSide', metadata: { type: 'Text', text: 'Hello' }, children: [] }, state: {} }] } },
      paintPreview: async (increment, request) => did.push(['paint', request.target, increment.fragments[0].component.metadata.type]),
    },
  }
}
const regWith = (triggers = []) => reduceContexts({ contexts: {}, stack: [], shell: null }, {
  fragments: [{ targetComponentId: '', action: 'Replace', state: {}, component: { type: 'ServerSide', id: 'h', serverSideType: 'x.Orders', triggers, children: [] } }],
})

// ONE document for the suite: the live regions (a11y.mjs) are created once and stay where they were
// created, so every test reads its announcements from the same document
const suiteDom = makeDom()
const withDocument = async (doc, fn) => {
  const before = globalThis.document
  globalThis.document = doc
  try { await fn() } finally { if (before === undefined) delete globalThis.document; else globalThis.document = before }
}

test('a pushed render is the chat\'s render-screen: nobody subscribed → __preview__ into the drawer', async () => {
  const { doc } = suiteDom
  const heard = []
  doc.addEventListener('render-screen', (e) => heard.push(e.detail))
  await withDocument(doc, async () => {
    const { host, did } = hostOf(regWith())
    const plan = await applyAgentPush({ kind: 'render', event: 'render-screen', detail: { yaml: 'type: Text\ntext: Hello\n', target: 'drawer', title: 'Greeting' } }, host)
    assert.equal(plan.kind, 'chat')
    assert.deepEqual(did, [
      ['call', 'http://b', '__preview__', { _yaml: 'type: Text\ntext: Hello\n' }],
      ['paint', 'drawer', 'Drawer'],
    ])
    assert.equal(heard.length, 1, 'it also goes out as a document CustomEvent')
    assert.match(doc.querySelector('[data-mateu-live-region="polite"]').textContent, /An AI agent sent a screen/)
  })
})

test('a pushed render with a subscriber on screen runs ITS action; navigate is a menu click; event reaches @SubscribeTo', async () => {
  const { doc } = suiteDom
  await withDocument(doc, async () => {
    const reg = regWith([
      { type: 'OnCustomEvent', eventName: 'render-screen', actionId: 'paintIt' },
      { type: 'OnCustomEvent', eventName: 'highlight-row', actionId: 'highlight' },
    ])
    const { host, did } = hostOf(reg)
    await applyAgentPush({ kind: 'render', event: 'render-screen', detail: { yaml: 'type: Page' } }, host)
    await applyAgentPush({ kind: 'navigate', event: 'navigation-requested', detail: { route: '/orders/42', consumedRoute: '' } }, host)
    await applyAgentPush({ kind: 'event', event: 'highlight-row', detail: { id: 7 } }, host)
    await applyAgentPush({ kind: 'event', event: 'close-requested', detail: {} }, host)
    assert.deepEqual(did, [
      ['run', 'paintIt', { yaml: 'type: Page' }, HOST_ID],
      ['navigate', { route: '/orders/42' }],
      ['run', 'highlight', { id: 7 }, HOST_ID],
    ], 'an agent cannot close the chat')
  })
})

// ── the control in the page ──────────────────────────────────────────────────────────────────

/** The header control + the dialog, as shell-page.html declares them. */
const pageOf = () => {
  const dom = suiteDom
  const { doc, el } = dom
  for (const old of doc.querySelectorAll('[data-test-page]')) old.remove()
  const dialog = el('oj-dialog', { id: 'mateuAgentDialog' }, el('div', { id: 'mateuAgentBody' }),
    el('oj-button', { id: 'mateuAgentDisconnect', hidden: true }), el('oj-button', { id: 'mateuAgentNewCode', hidden: true }))
  dialog.opened = 0
  dialog.open = () => { dialog.opened++ }
  const button = el('oj-button', { id: 'mateuAgentConnect' }, el('span', { id: 'inner' }))
  doc.body.appendChild(el('div', { 'data-test-page': true }, el('header', {}, button, el('span', { id: 'mateuAgentIndicator', hidden: true })), dialog))
  return { ...dom, dialog, button }
}

test('Connect AI: the dialog opens with a fresh code and its countdown; pairing turns the dot on; Disconnect unpairs', async () => {
  await sleep(80) // a repeated announcement of the previous test lands 60 ms later (a11y.mjs)
  resetAgentPush()
  const { doc, fire, dialog } = pageOf()
  await withDocument(doc, async () => {
    installAgentPush(doc)
    installAgentPush(doc) // once
    const actions = []
    let channelInit
    let streamCtl
    const shell = { agentPush: true, serverSideType: 'x.App' }
    const sinks = {
      base: 'http://b',
      route: () => '/orders',
      claim: { Channel: null, storage: memoryStorage({ [UI_SESSION_KEY]: 'ui-2', [AGENT_SECRET_KEY]: 'secret-2' }) },
      host: null, // the pushes below are status only
      fetchImpl: async (url, init) => {
        channelInit = init
        return { ok: true, status: 200, body: new ReadableStream({ start(c) { streamCtl = c; c.enqueue(encoder.encode(sse(inc(push('status', 'mateu-agent-status', { paired: false, agents: [] })))[0])) } }) }
      },
      call: async (base, body) => {
        actions.push([base, body.actionId, body.parameters, body.serverSideType])
        if (body.actionId === '_agent-pair') return { fragments: [{ data: { _agentPairing: { code: 'K7QF-4MZP', expiresInSeconds: 300 } } }] }
        return { fragments: [{ data: { _agentPairing: null } }] }
      },
    }
    const t = await syncAgentPush(shell, sinks)
    assert.equal(t.sessionId, 'ui-2')
    await flush()
    assert.equal(JSON.parse(channelInit.body).parameters.secret, 'secret-2')
    assert.equal(agentControlState().channel, 'open')
    assert.equal(doc.getElementById('mateuAgentIndicator').hasAttribute('hidden'), true, 'nobody paired yet')

    fire(doc.getElementById('inner'), 'ojAction')
    assert.equal(dialog.opened, 1)
    await flush()
    assert.deepEqual(actions[0], ['http://b', '_agent-pair', { sessionId: 'ui-2', secret: 'secret-2' }, 'x.App'])
    const body = doc.getElementById('mateuAgentBody')
    assert.equal(body.getAttribute('data-mode'), 'code')
    assert.match(body.textContent, /Ask your agent to pair with this code \(mateu_pair_session\)/)
    assert.match(body.textContent, /K7QF-4MZP/)
    assert.match(body.textContent, /Pairing code: K 7 Q F, 4 M Z P/)
    assert.match(doc.getElementById('mateuAgentCountdown').textContent, /^Expires in [45]:\d\d$/)
    assert.equal(doc.getElementById('mateuAgentNewCode').hasAttribute('hidden'), false)
    assert.equal(doc.getElementById('mateuAgentDisconnect').hasAttribute('hidden'), true)
    assert.match(doc.querySelector('[data-mateu-live-region="polite"]').textContent, /Pairing code K 7 Q F, 4 M Z P\. It expires in 5 minutes\./)

    // the agent called mateu_pair_session: the channel says so
    streamCtl.enqueue(encoder.encode(sse(inc(push('status', 'mateu-agent-status', { paired: true, agents: ['an agent'] })))[0]))
    await flush()
    const dot = doc.getElementById('mateuAgentIndicator')
    assert.equal(dot.hasAttribute('hidden'), false)
    assert.equal(dot.getAttribute('aria-label'), 'AI agent connected: an agent')
    assert.equal(doc.getElementById('mateuAgentConnect').classList.contains('mateu-agent-on'), true)
    assert.equal(body.getAttribute('data-mode'), 'paired', 'the spent code is gone')
    assert.match(body.textContent, /Connected to:an agent/)
    assert.equal(doc.getElementById('mateuAgentDisconnect').hasAttribute('hidden'), false)
    assert.equal(doc.querySelector('[data-mateu-live-region="polite"]').textContent, 'AI agent connected: an agent')

    // re-opening a paired control asks for no code
    fire(doc.getElementById('mateuAgentConnect'), 'ojAction')
    await flush()
    assert.equal(actions.length, 1)

    // a second code while paired: the status a reconnection repeats keeps it; a second agent spends it
    fire(doc.getElementById('mateuAgentNewCode'), 'ojAction')
    await flush()
    assert.equal(actions[1][1], '_agent-pair')
    streamCtl.enqueue(encoder.encode(sse(inc(push('status', 'mateu-agent-status', { paired: true, agents: ['an agent'] })))[0]))
    await flush()
    assert.equal(body.getAttribute('data-mode'), 'code', 'the same status: the new code stays on show')
    streamCtl.enqueue(encoder.encode(sse(inc(push('status', 'mateu-agent-status', { paired: true, agents: ['an agent', 'alice'] })))[0]))
    await flush()
    assert.equal(body.getAttribute('data-mode'), 'paired')
    assert.equal(doc.querySelector('[data-mateu-live-region="polite"]').textContent, 'AI agent connected: an agent, alice')
    actions.splice(1, 1)

    fire(doc.getElementById('mateuAgentDisconnect'), 'ojAction')
    await flush()
    assert.equal(actions[1][1], '_agent-unpair')
    assert.equal(agentControlState().status.paired, false)
    assert.equal(dot.hasAttribute('hidden'), true)
    assert.equal(doc.querySelector('[data-mateu-live-region="polite"]').textContent, 'AI agent disconnected')

    // a second code on demand
    fire(doc.getElementById('mateuAgentNewCode'), 'ojAction')
    await flush()
    assert.equal(actions[2][1], '_agent-pair')

    // the shell without agentPush: channel closed, dot hidden
    await syncAgentPush({ agentPush: false }, {})
    assert.equal(agentControlState().target, null)
    assert.equal(agentControlState().channel, 'idle')
  })
  resetAgentPush()
})

test('the pairing fails or the server refuses: the dialog says why (assertive), New code stays', async () => {
  resetAgentPush()
  const { doc } = pageOf()
  await withDocument(doc, async () => {
    installAgentPush(doc)
    let answer = () => ({ messages: [{ variant: 'error', text: 'This UI session belongs to another channel.' }] })
    await syncAgentPush({ agentPush: true }, {
      base: '', claim: { Channel: null, storage: memoryStorage() },
      fetchImpl: async () => new Promise(() => {}), // the channel never answers here
      call: async () => answer(),
    })
    assert.equal(await requestAgentPairing(), null)
    assert.equal(doc.getElementById('mateuAgentBody').getAttribute('data-mode'), 'error')
    assert.match(doc.getElementById('mateuAgentBody').textContent, /another channel/)
    assert.match(doc.querySelector('[data-mateu-live-region="assertive"]').textContent, /another channel/)
    assert.equal(doc.getElementById('mateuAgentNewCode').hasAttribute('hidden'), false)
    answer = () => ({ fragments: [] })
    assert.equal(await requestAgentPairing(), null)
    assert.match(agentControlState().error, /no code/)
    answer = () => { throw new Error('offline') }
    assert.equal(await unpairAgents(), false)
    assert.equal(agentControlState().error, 'offline')
    answer = () => ({ messages: [{ variant: 'error', text: 'nope' }] })
    assert.equal(await unpairAgents(), false)
    // an expiring code: the countdown turns into "expired" (and says so once)
    answer = () => ({ fragments: [{ data: { _agentPairing: { code: 'AB12-CD34', expiresInSeconds: 1 } } }] })
    const pairing = await requestAgentPairing()
    assert.equal(pairing.code, 'AB12-CD34')
    await sleep(2100)
    assert.equal(doc.getElementById('mateuAgentBody').getAttribute('data-mode'), 'expired')
    assert.match(doc.querySelector('[data-mateu-live-region="polite"]').textContent, /expired/)
  })
  resetAgentPush()
  assert.equal(await requestAgentPairing(), null, 'no session, no pairing')
  assert.equal(await unpairAgents(), false)
  assert.equal(paintAgentControl(null), null)
})

test('the shell\'s channel: a refusal is logged; without a call sink the pairing goes through the sync endpoint', async () => {
  resetAgentPush()
  const { doc } = pageOf()
  const warned = []
  const warn = console.warn
  console.warn = (...a) => warned.push(a.join(' '))
  const before = globalThis.fetch
  const posted = []
  globalThis.fetch = async (url, init) => {
    posted.push([url, JSON.parse(init.body)])
    return { ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => ({ fragments: [{ data: { _agentPairing: { code: 'ZZ99-YY88', expiresInSeconds: 120 } } }] }) }
  }
  try {
    await withDocument(doc, async () => {
      installAgentPush(doc)
      await syncAgentPush({ agentPush: true, serverSideType: 'x.App' }, {
        base: 'http://b', claim: { Channel: null, storage: memoryStorage() },
        fetchImpl: async () => responseOf(sse({ messages: [{ variant: 'error', text: 'This UI session belongs to another channel.' }] })),
      })
      await flush()
      assert.ok(warned.some((w) => /another channel/.test(w)), warned.join('|'))
      const pairing = await requestAgentPairing()
      assert.equal(pairing && pairing.code, 'ZZ99-YY88')
      assert.equal(posted[0][0], 'http://b/mateu/v3/sync/_no_route')
      assert.equal(posted[0][1].actionId, '_agent-pair')
      assert.equal(posted[0][1].serverSideType, 'x.App')
      // a push that cannot be applied (a host whose registry throws) is logged, not thrown
      const bad = { registry: () => { throw new Error('gone') } }
      await assert.rejects(applyAgentPush({ kind: 'event', event: 'x', detail: {} }, bad))
    })
  } finally {
    globalThis.fetch = before
    console.warn = warn
    resetAgentPush()
  }
})

// ── the wiring (static) ──────────────────────────────────────────────────────────────────────

test('wiring: the bridge carries agentPush.mjs; the shell declares the control; the chat sends the tab session', () => {
  const amd = readFileSync(join(here, 'make-amd.mjs'), 'utf8')
  assert.ok(amd.indexOf("'agentPush.mjs'") > amd.indexOf("'chat.mjs'"), 'make-amd packs it into the bridge')
  assert.ok(NOT_IN_EMBEDDED.installAgentPush, 'the embedded component has no app header')
  const reg = reduceContexts({ contexts: {}, stack: [], shell: null }, { fragments: [{ component: { type: 'ClientSide', metadata: { type: 'App', agentPush: true, menu: [] }, children: [] } }] })
  assert.equal(reg.shell.agentPush, true)
  const html = webApp('pages/shell-page.html')
  assert.match(html, /<oj-bind-if test="\[\[ \$application\.variables\.mateuAgentPush \]\]">\s*<oj-button id="mateuAgentConnect"/)
  assert.match(html, /appBundle\.agentConnect/)
  assert.match(html, /<oj-dialog id="mateuAgentDialog"[^>]*\n?[^>]*aria-describedby="mateuAgentBody"/)
  assert.match(html, /id="mateuAgentNewCode"/)
  assert.match(html, /id="mateuAgentDisconnect"/)
  const flow = JSON.parse(webApp('app-flow.json'))
  assert.equal(flow.variables.mateuAgentPush.type, 'boolean')
  const load = webApp('pages/shell-page-chains/loadMateuShell.js')
  assert.ok(load.indexOf('bridge.syncAgentPush(') > load.indexOf('bridge.setChatEventHost('), 'after the chat event host exists')
  assert.match(load, /bridge\.installAgentPush\(\)/)
  assert.match(webApp('pages/shell-page-chains/chatSend.js'), /bridge\.uiSessionId\(\)/)
  assert.match(webApp('pages/shell-page-chains/chatAttach.js'), /bridge\.uiSessionId\(\)/)
  for (const lang of ['en', 'es']) for (const k of ['agentConnect', 'agentPairInstruction', 'agentDisconnect', 'agentNewCode']) assert.ok(CHROME_TEXTS[lang][k], lang + ' ' + k)
  assert.match(CHROME_TEXTS.en.agentPairInstruction, /mateu_pair_session/)
  assert.match(CHROME_TEXTS.es.agentPairInstruction, /mateu_pair_session/)
})

for (const { name, fn } of queue) {
  await fn()
  passed++
  console.log(`  ✓ ${name}`)
}
console.log(`\n${passed} agent-push tests passed`)
