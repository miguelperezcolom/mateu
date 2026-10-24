import { chromeText } from './i18n.mjs'
import { announce } from './a11y.mjs'
import { authHeadersOf } from './resilience.mjs'
import { rendererHeaders } from './versionSkew.mjs'
import { dispatchChatEvent } from './chat.mjs'
import { callMateu } from './transport.mjs'

// LIVE UI PUSH (phase C, conformance/mcp/README.md "Live UI push"): an agent speaking MCP sends UI
// to THIS browser tab — a screen (render), a navigation or a custom event — once the user paired the
// tab with it ("Connect AI" → a one-time code the agent passes to mateu_pair_session).
//
// The tab is a UI SESSION: its per-tab id (sessionStorage, the same key the web renderer uses for
// X-Session-Id, and what the shell's chat panel sends as its sessionId) plus a random channel SECRET
// kept with it. Only when the App says `agentPush: true` does the tab open its CHANNEL — the
// app-level `_agent-channel` action on the SSE endpoint, ONE PER TAB (unlike `_live-updates`, there
// is no leader election: each tab is its own session) — and show the "Connect AI" control.
//
// Every message of the channel is an increment carrying ONE command
// `{type: 'AgentPush', data: {kind, event, detail}}`, applied EXACTLY like the chat's event of the
// same name (chat.mjs dispatchChatEvent): render → `render-screen` (a subscriber on screen first,
// else the built-in render target via `__preview__` into the content / a drawer / a dialog);
// navigate → `navigation-requested` (a menu click with those fields); event → a document CustomEvent
// + the @SubscribeTo views on screen. `status` ({paired, agents}) only updates the control.
//
// The stream ends after 5 minutes by design: the tab reconnects at once; a failure backs off.
// A duplicated tab (the browser copies sessionStorage) would share the id and the two tabs would
// keep replacing each other's channel: on start, the tab asks the others (BroadcastChannel) whether
// one already holds its id, and takes a fresh id + secret when one does.
//
// The pure half (parsing, decisions, the control's view) is tested in Node (test-agent-push.mjs);
// the DOM half paints the header control and the pairing oj-dialog declared in shell-page.html.

export const AGENT_CHANNEL_ACTION = '_agent-channel'
export const AGENT_PAIR_ACTION = '_agent-pair'
export const AGENT_UNPAIR_ACTION = '_agent-unpair'
export const AGENT_RENDERER = 'redwood'
/** The per-tab UI session id — the SAME key as libs/mateu authToken.ts SESSION_ID_KEY. */
export const UI_SESSION_KEY = '__mateu_sesion_id'
export const AGENT_SECRET_KEY = '__mateu_agent_secret'
export const AGENT_STATUS_EVENT = 'mateu-agent-status'
const AGENT_TAB_CHANNEL = 'mateu-agent-sessions'
/** A stream shorter than this that ended "cleanly" is a failure (no hot reconnect loop). */
export const AGENT_MIN_HEALTHY_MS = 2000
export const AGENT_PUSH_DISABLED = 'Live UI push is not enabled.'

// ── the tab's UI session (pure, storage injected) ────────────────────────────────────────────

const sessionStore = () => { try { return globalThis.sessionStorage || null } catch (e) { return null } }
const agentMemory = new Map()
const agentRead = (storage, key) => {
  try { const v = storage ? storage.getItem(key) : null; if (v) return v } catch (e) { /* blocked */ }
  return agentMemory.get(key) || null
}
const agentWrite = (storage, key, value) => {
  agentMemory.set(key, value)
  try { if (storage) storage.setItem(key, value) } catch (e) { /* blocked: kept in memory */ }
}

/** `bytes` random bytes as URL-safe base64 (the platform CSPRNG). */
export function agentRandomToken(bytes = 16) {
  const raw = new Uint8Array(bytes)
  globalThis.crypto.getRandomValues(raw)
  let s = ''
  for (const b of raw) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** The tab's UI session id (created on first use; in memory when storage is blocked). */
export function uiSessionId(storage = sessionStore()) {
  const known = agentRead(storage, UI_SESSION_KEY)
  if (known) return known
  const id = agentRandomToken(16)
  agentWrite(storage, UI_SESSION_KEY, id)
  return id
}

/** The channel secret kept with the session (sent only on the three agent actions). */
export function agentChannelSecret(storage = sessionStore()) {
  const known = agentRead(storage, AGENT_SECRET_KEY)
  if (known) return known
  const secret = agentRandomToken(32)
  agentWrite(storage, AGENT_SECRET_KEY, secret)
  return secret
}

/** A fresh id + secret (a duplicated tab must not share its original's session). */
export function rotateUiSession(storage = sessionStore()) {
  agentWrite(storage, UI_SESSION_KEY, agentRandomToken(16))
  agentWrite(storage, AGENT_SECRET_KEY, agentRandomToken(32))
  return { sessionId: uiSessionId(storage), secret: agentChannelSecret(storage) }
}

/** For the tests: forget the in-memory fallback. */
export function resetAgentSessionMemory() { agentMemory.clear() }

/**
 * Makes sure no OTHER open tab holds this tab's session id (a duplicated tab copies
 * sessionStorage): asks on a BroadcastChannel and, when one answers within `waitMs`, rotates.
 * Keeps answering the others for as long as the page lives. Resolves the session to use.
 */
export function claimTabSession({ storage = sessionStore(), Channel = globalThis.BroadcastChannel, waitMs = 250 } = {}) {
  const fresh = !agentRead(storage, UI_SESSION_KEY)
  const current = () => ({ sessionId: uiSessionId(storage), secret: agentChannelSecret(storage) })
  if (typeof Channel !== 'function') return Promise.resolve(current())
  let channel
  try { channel = new Channel(AGENT_TAB_CHANNEL) } catch (e) { return Promise.resolve(current()) }
  const mine = current()
  let taken = false
  channel.onmessage = (e) => {
    const m = e && e.data
    if (!m || m.id !== uiSessionId(storage)) return
    if (m.type === 'who') channel.postMessage({ type: 'mine', id: m.id })
    else if (m.type === 'mine') taken = true
  }
  if (fresh) return Promise.resolve(mine)
  channel.postMessage({ type: 'who', id: mine.sessionId })
  return new Promise((resolve) => setTimeout(() => resolve(taken ? rotateUiSession(storage) : current()), waitMs))
}

// ── the wire (pure) ──────────────────────────────────────────────────────────────────────────

/** The body of an agent action: app-level (route '', the app's serverSideType), the session's
 *  credentials in the parameters (+ the channel's route and renderer). */
export function agentActionBodyOf(actionId, { sessionId, secret, serverSideType, route }) {
  const parameters = { sessionId, secret }
  if (actionId === AGENT_CHANNEL_ACTION) Object.assign(parameters, { route: route || '', renderer: AGENT_RENDERER })
  return {
    route: '',
    consumedRoute: '',
    actionId,
    serverSideType: serverSideType || undefined,
    appState: {},
    componentState: {},
    parameters,
    initiatorComponentId: 'mateu-agent-channel',
  }
}

const AGENT_KINDS = ['status', 'render', 'navigate', 'event']

/** The AgentPush messages an increment carries ({kind, event, detail}, detail {} when none). */
export function agentPushesOf(increment) {
  return ((increment && increment.commands) || [])
    .filter((c) => c && c.type === 'AgentPush' && c.data && AGENT_KINDS.includes(c.data.kind))
    .map((c) => ({
      kind: c.data.kind,
      event: typeof c.data.event === 'string' ? c.data.event : '',
      detail: c.data.detail && typeof c.data.detail === 'object' && !Array.isArray(c.data.detail) ? c.data.detail : {},
    }))
}

/** The server's refusal an increment carries instead of a message (an error toast), or null. */
export function agentRefusalOf(increment) {
  if (!increment || agentPushesOf(increment).length) return null
  const error = ((increment.messages) || []).find((m) => m && String(m.variant || '').toLowerCase() === 'error')
  return error ? String(error.text || error.title || 'Error') : null
}

/** {paired, agents} of a status detail, normalised. */
export function agentStatusOf(detail) {
  const agents = Array.isArray(detail && detail.agents) ? detail.agents.filter((a) => typeof a === 'string' && a) : []
  return { paired: !!(detail && detail.paired), agents }
}

// the events an agent may not raise through `event` (the server refuses them too; defence in depth:
// close-requested would close the user's chat, the status event is ours)
const AGENT_RESERVED = ['render-screen', 'navigation-requested', 'close-requested', AGENT_STATUS_EVENT]

/**
 * What a pushed message means here:
 *   {kind:'status', status} | {kind:'chat', event:{event, detail}} | {kind:'ignore'}
 * The chat event name comes from the KIND, not from what the message says it is.
 */
export function agentPushPlanOf(push) {
  if (!push) return { kind: 'ignore' }
  if (push.kind === 'status') return { kind: 'status', status: agentStatusOf(push.detail) }
  if (push.kind === 'render') return { kind: 'chat', event: { event: 'render-screen', detail: push.detail } }
  if (push.kind === 'navigate') return { kind: 'chat', event: { event: 'navigation-requested', detail: push.detail } }
  if (push.kind === 'event' && /^[A-Za-z][A-Za-z0-9_.:-]{0,63}$/.test(push.event) && !AGENT_RESERVED.includes(push.event)) {
    return { kind: 'chat', event: { event: push.event, detail: push.detail } }
  }
  return { kind: 'ignore' }
}

/** The pairing a `_agent-pair` answer carries: {code, expiresInSeconds}; null when unpaired/none. */
export function agentPairingOf(increment) {
  for (const f of (increment && increment.fragments) || []) {
    if (!f || !f.data || !('_agentPairing' in f.data)) continue
    const p = f.data._agentPairing
    if (p && typeof p.code === 'string' && p.code) {
      const secs = Number(p.expiresInSeconds)
      return { code: p.code, expiresInSeconds: Number.isFinite(secs) && secs > 0 ? secs : 300 }
    }
    return null
  }
  return null
}

/** The wait before reconnecting: 0 after a healthy stream ended (the server's 5-minute cut), else
 *  1 s, 2 s, 4 s… capped at 60 s. */
export const agentReconnectDelay = (failures) => (failures <= 0 ? 0 : Math.min(60000, 1000 * 2 ** (failures - 1)))

/** "4:07" for 247 seconds. */
export function agentClockOf(seconds) {
  const s = Math.max(0, Math.ceil(seconds))
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')
}

/** The code as a screen reader should spell it: "K 7 Q F, 4 M Z P". */
export function agentSpokenCode(code) {
  return String(code || '').split('-').map((part) => part.split('').join(' ')).join(', ')
}

/**
 * The control's view (the header indicator + the dialog), from the control's state:
 *   {channel: 'idle'|'connecting'|'open'|'retrying'|'off', status: {paired, agents},
 *    pairing: {code, expiresAt} | null, loading, error}
 */
export function agentControlViewOf(state, now = Date.now()) {
  const s = state || {}
  const status = s.status || { paired: false, agents: [] }
  const agents = status.agents.length ? status.agents.join(', ') : ''
  const view = {
    connected: !!status.paired,
    indicatorLabel: status.paired ? chromeText('agentConnected', { agents: agents || chromeText('agentAnAgent') }) : '',
    agents: status.agents.slice(),
    showNewCode: false,
    showDisconnect: !!status.paired,
    code: '', spokenCode: '', countdown: '', secondsLeft: 0,
    note: '',
  }
  if (s.channel === 'off') return { ...view, mode: 'off', note: chromeText('agentPushOff'), showDisconnect: false }
  if (s.loading) return { ...view, mode: 'loading', note: chromeText('agentGettingCode') }
  if (s.error) return { ...view, mode: 'error', note: chromeText('agentError', { message: s.error }), showNewCode: true }
  const pairing = s.pairing
  const secondsLeft = pairing ? Math.ceil((pairing.expiresAt - now) / 1000) : 0
  if (pairing && secondsLeft > 0) {
    return {
      ...view,
      mode: 'code',
      code: pairing.code,
      spokenCode: agentSpokenCode(pairing.code),
      secondsLeft,
      countdown: chromeText('agentExpiresIn', { time: agentClockOf(secondsLeft) }),
      showNewCode: true,
      note: s.channel === 'open' ? '' : chromeText('agentChannelDown'),
    }
  }
  if (status.paired) return { ...view, mode: 'paired', showNewCode: true }
  if (pairing) return { ...view, mode: 'expired', note: chromeText('agentCodeExpired'), showNewCode: true }
  return { ...view, mode: 'none', showNewCode: true, note: s.channel === 'open' ? '' : chromeText('agentChannelDown') }
}

/** What a status change should say to a screen reader (null when nothing changed). */
export function agentStatusAnnouncementOf(before, after) {
  const was = !!(before && before.paired)
  const is = !!(after && after.paired)
  if (!was && is) return chromeText('agentConnected', { agents: (after.agents || []).join(', ') || chromeText('agentAnAgent') })
  if (was && !is) return chromeText('agentDisconnected')
  if (was && is && (before.agents || []).join('\n') !== (after.agents || []).join('\n')) {
    return chromeText('agentConnected', { agents: (after.agents || []).join(', ') || chromeText('agentAnAgent') })
  }
  return null
}

// ── the channel (imperative, dependencies injected) ──────────────────────────────────────────

/** Reads an SSE response body, calling `onIncrement` per `data:` frame. */
async function readAgentFrames(res, onIncrement) {
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  const frame = (raw) => {
    const line = raw.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).join('\n')
    if (!line) return
    let inc
    try { inc = JSON.parse(line) } catch (e) { return } // a heartbeat / a comment
    onIncrement(inc)
  }
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let cut
    while ((cut = buffer.indexOf('\n\n')) >= 0) {
      frame(buffer.slice(0, cut))
      buffer = buffer.slice(cut + 2)
    }
  }
  if (buffer.trim()) frame(buffer)
}

/**
 * The tab's channel: start(target) opens it (target = {base, serverSideType, sessionId, secret,
 * route()}), keeps it open (reconnecting at once after the server's cut, backing off after
 * failures) and stops for good on "push not enabled". stop() closes it.
 *   onPush(push)          every AgentPush message, in order
 *   onState(channelState) 'connecting' | 'open' | 'retrying' | 'off' | 'idle'
 *   onRefusal(text)       a refusal from the server
 */
export function createAgentChannel({ fetchImpl, headers, now, setTimer, clearTimer, onPush, onState, onRefusal } = {}) {
  const clock = now || Date.now
  const later = setTimer || setTimeout
  const cancel = clearTimer || clearTimeout
  let target = null
  let controller = null
  let timer = null
  let failures = 0
  let state = 'idle'
  const setState = (s) => { if (s !== state) { state = s; if (onState) onState(s) } }

  const schedule = () => {
    if (!target || state === 'off') return
    setState(failures ? 'retrying' : 'connecting')
    timer = later(() => { timer = null; connect() }, agentReconnectDelay(failures))
  }

  const connect = () => {
    if (!target || controller) return
    const own = new AbortController()
    controller = own
    const t = target
    const started = clock()
    let received = 0
    let refused = null
    setState('connecting')
    Promise.resolve().then(() => (fetchImpl || globalThis.fetch)(t.base + '/mateu/v3/sse/_no_route', {
      method: 'POST',
      signal: own.signal,
      headers: Object.assign({ 'Content-Type': 'application/json', Accept: 'text/event-stream' }, rendererHeaders(), headers ? headers() : authHeadersOf()),
      body: JSON.stringify(agentActionBodyOf(AGENT_CHANNEL_ACTION, {
        sessionId: t.sessionId, secret: t.secret, serverSideType: t.serverSideType, route: t.route ? t.route() : '',
      })),
    })).then(async (res) => {
      if (!res || !res.ok || !res.body) throw new Error('agent channel: ' + (res && res.status))
      await readAgentFrames(res, (inc) => {
        if (own.signal.aborted) return
        const pushes = agentPushesOf(inc)
        if (!pushes.length) {
          const refusal = agentRefusalOf(inc)
          if (refusal) { refused = refusal; if (onRefusal) onRefusal(refusal) }
          return
        }
        received += pushes.length
        setState('open')
        if (onPush) for (const p of pushes) onPush(p)
      })
      if (refused) throw new Error(refused)
      if (!received || clock() - started < AGENT_MIN_HEALTHY_MS) throw new Error('agent channel: ended early')
      failures = 0
    }).catch(() => { if (!own.signal.aborted) failures++ })
      .finally(() => {
        if (controller !== own) return
        controller = null
        if (refused === AGENT_PUSH_DISABLED) { setState('off'); return }
        if (target === t) schedule()
      })
  }

  return {
    start(next) {
      if (target && controller && next && target.base === next.base && target.serverSideType === next.serverSideType
        && target.sessionId === next.sessionId) { target = next; return }
      this.stop()
      target = next || null
      failures = 0
      state = 'idle'
      if (target) connect()
    },
    stop() {
      target = null
      if (timer) cancel(timer)
      timer = null
      if (controller) controller.abort()
      controller = null
      setState('idle')
    },
    get state() { return state },
    get failures() { return failures },
  }
}

// ── the control (DOM) ────────────────────────────────────────────────────────────────────────

const AGENT_SR_ONLY = 'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0'

const agentUi = {
  channel: 'idle', status: { paired: false, agents: [] }, pairing: null, loading: false, error: null,
  target: null, sinks: {}, doc: null, ticker: null, expiredSaid: false,
}
let agentChannel = null
let agentClaim = null

const agentDocOf = () => (typeof document !== 'undefined' ? document : null)
const agentSetHidden = (el, hidden) => { if (!el) return; if (hidden) el.setAttribute('hidden', ''); else el.removeAttribute('hidden') }

/** Paints the header indicator and, when it is there, the dialog body. */
export function paintAgentControl(doc = agentUi.doc || agentDocOf(), now = Date.now()) {
  if (!doc) return null
  const view = agentControlViewOf(agentUi, now)
  const indicator = doc.getElementById('mateuAgentIndicator')
  if (indicator) {
    agentSetHidden(indicator, !(agentUi.target && view.connected))
    indicator.setAttribute('aria-label', view.indicatorLabel || chromeText('agentConnect'))
    indicator.setAttribute('title', view.indicatorLabel || '')
  }
  const button = doc.getElementById('mateuAgentConnect')
  if (button) button.classList.toggle('mateu-agent-on', view.connected)
  const body = doc.getElementById('mateuAgentBody')
  if (!body) return view
  body.setAttribute('data-mode', view.mode)
  body.textContent = ''
  const p = (cls, text) => { const e = doc.createElement('p'); e.className = cls; e.textContent = text; body.appendChild(e); return e }
  if (view.mode === 'code') {
    p('oj-typography-body-md', chromeText('agentPairInstruction'))
    const code = doc.createElement('p')
    code.className = 'mateu-agent-code'
    const shown = doc.createElement('span')
    shown.setAttribute('aria-hidden', 'true')
    shown.textContent = view.code
    const spoken = doc.createElement('span')
    spoken.style.cssText = AGENT_SR_ONLY
    spoken.textContent = chromeText('agentCodeLabel') + ': ' + view.spokenCode
    code.appendChild(shown)
    code.appendChild(spoken)
    body.appendChild(code)
    const countdown = p('mateu-agent-countdown oj-typography-body-sm oj-text-color-secondary', view.countdown)
    countdown.id = 'mateuAgentCountdown'
    countdown.setAttribute('aria-live', 'off')
  }
  if (view.connected) {
    p('oj-typography-body-md oj-sm-margin-2x-top', chromeText('agentConnectedTo'))
    const ul = doc.createElement('ul')
    ul.className = 'mateu-agent-list'
    for (const a of view.agents.length ? view.agents : [chromeText('agentAnAgent')]) {
      const li = doc.createElement('li'); li.textContent = a; ul.appendChild(li)
    }
    body.appendChild(ul)
  }
  if (view.note) p('mateu-agent-note oj-typography-body-sm oj-sm-margin-2x-top', view.note)
  agentSetHidden(doc.getElementById('mateuAgentNewCode'), !view.showNewCode)
  agentSetHidden(doc.getElementById('mateuAgentDisconnect'), !view.showDisconnect)
  return view
}

function agentTick() {
  const doc = agentUi.doc || agentDocOf()
  if (!doc) return
  const view = agentControlViewOf(agentUi)
  const countdown = doc.getElementById('mateuAgentCountdown')
  if (view.mode === 'code' && countdown) { countdown.textContent = view.countdown; return }
  if (view.mode === 'expired' && !agentUi.expiredSaid) {
    agentUi.expiredSaid = true
    announce(chromeText('agentCodeExpired'))
  }
  if (view.mode !== 'code') stopAgentTicker()
  paintAgentControl(doc)
}

function startAgentTicker() { if (!agentUi.ticker) agentUi.ticker = setInterval(agentTick, 1000) }
function stopAgentTicker() { if (agentUi.ticker) clearInterval(agentUi.ticker); agentUi.ticker = null }

/** What the control's state becomes with a status message. */
function adoptAgentStatus(status) {
  const said = agentStatusAnnouncementOf(agentUi.status, status)
  // a code is spent when an agent JOINS (paired now, or one more agent): the status every
  // reconnection repeats must not throw away a second code the user asked for meanwhile
  const joined = status.paired && (!agentUi.status.paired || status.agents.length > agentUi.status.agents.length)
  agentUi.status = status
  if (joined && agentUi.pairing) { agentUi.pairing = null; stopAgentTicker() }
  if (said) announce(said)
  paintAgentControl()
}

/** Applies one pushed message (the chat's dispatcher for everything but the status). */
export async function applyAgentPush(push, host) {
  const plan = agentPushPlanOf(push)
  if (plan.kind === 'status') { adoptAgentStatus(plan.status); return plan }
  if (plan.kind !== 'chat') return plan
  if (plan.event.event === 'render-screen') announce(chromeText('agentPushedScreen'))
  if (host === undefined) await dispatchChatEvent(plan.event)
  else await dispatchChatEvent(plan.event, host)
  return plan
}

const agentAppAction = (actionId) => {
  const t = agentUi.target
  const body = agentActionBodyOf(actionId, t)
  // quiet: the dialog shows what went wrong (no second error band), and no screen staleness —
  // the pairing belongs to the tab, not to the screen on show
  const call = agentUi.sinks && agentUi.sinks.call
  return call ? call(t.base, body) : callMateu(t.base, body, { quiet: true })
}

/** "Connect AI": asks the server for a fresh one-time code (the previous unused one dies). */
export async function requestAgentPairing(now = () => Date.now()) {
  if (!agentUi.target) return null
  agentUi.loading = true
  agentUi.error = null
  paintAgentControl()
  try {
    const answer = await agentAppAction(AGENT_PAIR_ACTION)
    const refusal = agentRefusalOf(answer)
    const pairing = agentPairingOf(answer)
    if (refusal || !pairing) throw new Error(refusal || chromeText('agentNoCode'))
    agentUi.pairing = { code: pairing.code, expiresAt: now() + pairing.expiresInSeconds * 1000 }
    agentUi.expiredSaid = false
    agentUi.loading = false
    paintAgentControl()
    startAgentTicker()
    announce(chromeText('agentCodeAnnounce', { code: agentSpokenCode(pairing.code), minutes: Math.round(pairing.expiresInSeconds / 60) }))
    return agentUi.pairing
  } catch (e) {
    agentUi.loading = false
    agentUi.error = (e && e.message) || String(e)
    paintAgentControl()
    announce(chromeText('agentError', { message: agentUi.error }), { politeness: 'assertive' })
    return null
  }
}

/** "Disconnect": every pairing of this session removed (the channel is told, the status follows). */
export async function unpairAgents() {
  if (!agentUi.target) return false
  try {
    const answer = await agentAppAction(AGENT_UNPAIR_ACTION)
    const refusal = agentRefusalOf(answer)
    if (refusal) throw new Error(refusal)
    agentUi.pairing = null
    adoptAgentStatus({ paired: false, agents: [] })
    const doc = agentUi.doc || agentDocOf()
    const again = doc && doc.getElementById('mateuAgentNewCode')
    if (again && again.focus) setTimeout(() => again.focus(), 50)
    return true
  } catch (e) {
    agentUi.error = (e && e.message) || String(e)
    paintAgentControl()
    announce(chromeText('agentError', { message: agentUi.error }), { politeness: 'assertive' })
    return false
  }
}

function openAgentDialog(doc) {
  const dialog = doc.getElementById('mateuAgentDialog')
  if (dialog && typeof dialog.open === 'function') dialog.open()
  const live = agentUi.pairing && agentUi.pairing.expiresAt > Date.now()
  agentUi.error = null
  paintAgentControl(doc)
  if (!agentUi.status.paired && !live) requestAgentPairing()
  else if (live) startAgentTicker()
}

/**
 * The shell (re)built: with `agentPush` the tab opens its channel and shows the control; without,
 * it closes it. `sinks`: {base, route(), call?(base, sst, actionId, parameters), host?, fetchImpl?}.
 */
export async function syncAgentPush(shell, sinks = {}) {
  const on = !!(shell && shell.agentPush)
  agentUi.sinks = sinks || {}
  if (!on) {
    if (agentChannel) agentChannel.stop()
    agentUi.target = null
    stopAgentTicker()
    paintAgentControl()
    return null
  }
  if (!agentClaim) agentClaim = claimTabSession(sinks.claim || {})
  const session = await agentClaim
  agentUi.target = { base: sinks.base || '', serverSideType: (shell && shell.serverSideType) || '', route: sinks.route, ...session }
  if (!agentChannel) {
    agentChannel = createAgentChannel({
      ...(sinks.fetchImpl ? { fetchImpl: sinks.fetchImpl } : {}),
      onPush: (push) => { applyAgentPush(push, agentUi.sinks.host).catch(agentWarn) },
      onState: (s) => { agentUi.channel = s; paintAgentControl() },
      onRefusal: agentWarn,
    })
  }
  agentChannel.start(agentUi.target)
  paintAgentControl()
  return agentUi.target
}

function agentWarn(what) { if (typeof console !== 'undefined' && console.warn) console.warn('[mateu] live UI push:', what) }

/** The control's state (tests, probes). */
export function agentControlState() {
  return { channel: agentUi.channel, status: agentUi.status, pairing: agentUi.pairing, loading: agentUi.loading, error: agentUi.error, target: agentUi.target }
}

/** For the tests: back to a page that never saw an agent. */
export function resetAgentPush() {
  if (agentChannel) agentChannel.stop()
  agentChannel = null
  agentClaim = null
  stopAgentTicker()
  Object.assign(agentUi, { channel: 'idle', status: { paired: false, agents: [] }, pairing: null, loading: false, error: null, target: null, sinks: {}, expiredSaid: false })
}

/** Installs (once) the control's document listeners: the header button, the dialog's buttons. */
export function installAgentPush(doc = agentDocOf()) {
  if (!doc || doc.__mateuAgentPush) return
  doc.__mateuAgentPush = true
  agentUi.doc = doc
  doc.addEventListener('ojAction', (e) => {
    const t = e.target
    if (!t || !t.closest) return
    if (t.closest('#mateuAgentConnect')) openAgentDialog(doc)
    else if (t.closest('#mateuAgentNewCode')) requestAgentPairing()
    else if (t.closest('#mateuAgentDisconnect')) unpairAgents()
  }, true)
  const win = doc.defaultView
  if (win && win.addEventListener) win.addEventListener('pagehide', () => { if (agentChannel) agentChannel.stop() })
}
