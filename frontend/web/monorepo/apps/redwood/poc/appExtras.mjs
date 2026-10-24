import { chromeText } from './i18n.mjs'
import { announce } from './a11y.mjs'
import { authHeadersOf } from './resilience.mjs'
import { rendererHeaders } from './versionSkew.mjs'
import { keyHint, isFunctionKeyShortcut, currentShortcutActions } from './keys.mjs'
import { shortcutMatches } from './actionPanels.mjs'
import { safeHref } from './core/display.mjs'

// The APP-LEVEL extras of the E2 patterns on the VB shell — the same contract (and the same
// localStorage keys, so a Vaadin tab and a Redwood tab of one origin cooperate) as the web
// renderer's libs/mateu appShortcuts.ts / headerValues.ts / liveUpdates.ts / idleSession.ts:
//  - APP SHORTCUTS (@AppShortcut): active on every page; a screen shortcut on the same key WINS
//    (keys.mjs takes it first in the capture phase and stops it; this listener is on the window,
//    bubble phase, and also stands down when the screen declares that key); «?» opens the
//    «Keyboard shortcuts» oj-dialog; QUICK LAUNCH: an exact code + Enter in the Ask palette.
//  - LIVE HEADER VALUES: painted in the header (#mateuHeaderValues), changed by UpdateHeaderValue
//    (broadcast to the other tabs through storage) and, with liveUpdates, by the app event stream —
//    ONE per browser (leader election through localStorage), POST /mateu/v3/sse/… '_live-updates'.
//  - IDLE SESSION: activity shared by every tab; an oj-dialog (role alertdialog) counts down; Stay
//    runs the keep-alive action, Sign out (or zero) → cancelable 'mateu-idle-sign-out' + assign.
// What is pure is tested in Node (test-e2.mjs); the DOM half is wired from loadMateuShell.

// ── app shortcuts (pure) ─────────────────────────────────────────────────────────────────────

const SC_FUNCTION_OR_MOD = (shortcut) =>
  /(^|\+)(ctrl|control|alt|meta|cmd)(\+|$)/i.test(String(shortcut || '')) || isFunctionKeyShortcut(shortcut)

/** The app shortcut a keystroke presses: never a plain key while typing, never a key the screen owns. */
export function appShortcutFor(shortcuts, e, typing, screenKeys = []) {
  return (shortcuts || []).find((s) => !!s.key
    && (!typing || SC_FUNCTION_OR_MOD(s.key))
    && !screenKeys.includes(String(s.key).toLowerCase())
    && shortcutMatches(s.key, e))
}

/** «?» opens the list — never while typing. */
export const isShortcutsHelpKey = (e, typing) => !typing && e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey

/** QUICK LAUNCH: the shortcut whose code is exactly what was typed (trimmed, case-insensitive). */
export function quickLaunchMatch(shortcuts, query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return undefined
  return (shortcuts || []).find((s) => s.code && String(s.code).trim().toLowerCase() === q)
}

/** The Ask palette rows of the shortcuts matching the query (code matches first), before the
 *  destinations: {label, route?, actionId?, icon, kind} — `kind` shows the code and the key. */
export function appShortcutRowsOf(shortcuts, query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return []
  const all = (shortcuts || []).filter((s) => s.route || s.actionId)
  const byCode = all.filter((s) => s.code && s.code.toLowerCase().startsWith(q))
  const byLabel = all.filter((s) => !byCode.includes(s) && String(s.label || '').toLowerCase().includes(q))
  return [...byCode, ...byLabel].slice(0, 5).map((s) => ({
    label: s.label,
    route: s.route || '',
    actionId: s.actionId || '',
    icon: 'oj-ux-ico-keyboard',
    kind: [s.code, s.key ? keyHint(s.key) : ''].filter(Boolean).join(' · '),
    isShortcut: true,
  }))
}

/** Whether the focus is in something the user types into. */
export function isTypingElement(el) {
  if (!el) return false
  const tag = String(el.localName || el.tagName || '').toLowerCase()
  if (tag === 'textarea' || tag === 'select') return true
  if (tag === 'input') {
    return !['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file'].includes(String(el.type || 'text'))
  }
  return el.isContentEditable === true
}

// ── live header values (pure + store) ────────────────────────────────────────────────────────

export const HEADER_VALUES_KEY = 'mateu-header-values'
export const LIVE_LEADER_KEY = 'mateu-live-leader'
export const LIVE_HEARTBEAT_MS = 5000
export const LIVE_STALE_MS = 15000

const extrasStorage = () => { try { return globalThis.localStorage || null } catch (e) { return null } }
const storeGet = (k) => { try { const s = extrasStorage(); return s ? s.getItem(k) : null } catch (e) { return null } }
const storeSet = (k, v) => { try { const s = extrasStorage(); if (s) s.setItem(k, v) } catch (e) { /* not remembered */ } }
const storeRemove = (k) => { try { const s = extrasStorage(); if (s) s.removeItem(k) } catch (e) { /* nothing */ } }

const headerValues = new Map()
let headerPainter = null

/** The values to paint, in the order the app declared them. */
export const headerValuesList = () => [...headerValues.values()]

/** What the shell declared — authoritative when it is (re)built. */
export function seedHeaderValues(declared) {
  headerValues.clear()
  for (const v of declared || []) if (v && v.id) headerValues.set(v.id, { id: v.id, label: v.label || null, value: v.value == null ? '' : String(v.value) })
  if (headerPainter) headerPainter()
}

/** Changes one value (this tab; `broadcast` also tells the other tabs). Returns whether it changed. */
export function updateHeaderValue(id, value, options = {}) {
  if (!id) return false
  const current = headerValues.get(id)
  const text = value == null ? '' : String(value)
  if (current && current.value === text) return false
  headerValues.set(id, { id, label: current ? current.label : null, value: text })
  if (headerPainter) headerPainter([id])
  if (!options.quiet) announce(chromeText('headerValueChanged', { label: (current && current.label) || id, value: text }))
  if (options.broadcast !== false) storeSet(HEADER_VALUES_KEY, JSON.stringify({ id, value: text, at: Date.now() }))
  return true
}

/** The header-value changes an increment carries. */
export function headerChangesOf(increment) {
  return ((increment && increment.commands) || [])
    .filter((c) => c && c.type === 'UpdateHeaderValue' && c.data && c.data.id)
    .map((c) => ({ id: c.data.id, value: c.data.value == null ? '' : c.data.value }))
}

/** Should `tab` take (or keep) the lead of the live stream? */
export const shouldLeadLive = (record, tab, now) => !record || record.tab === tab || now - record.at > LIVE_STALE_MS

/** The wait before reconnecting after `failures` consecutive errors (0 = a clean end). */
export const liveReconnectDelay = (failures) => (failures <= 0 ? 1000 : Math.min(60000, 2000 * 2 ** (failures - 1)))

// ── idle session (pure) ──────────────────────────────────────────────────────────────────────

export const IDLE_ACTIVITY_KEY = 'mateu-last-activity'
export const IDLE_SIGN_OUT_KEY = 'mateu-idle-sign-out'
export const IDLE_WRITE_EVERY_MS = 5000

/** active | warning (with the seconds left) | expired. */
export function idlePhaseOf(now, lastActivity, idle) {
  const timeoutMs = Math.max(1, idle.timeoutSeconds) * 1000
  const warningMs = Math.min(timeoutMs, Math.max(1, idle.warningSeconds) * 1000)
  const elapsed = Math.max(0, now - lastActivity)
  const secondsLeft = Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000))
  if (elapsed >= timeoutMs) return { phase: 'expired', secondsLeft: 0 }
  if (elapsed >= timeoutMs - warningMs) return { phase: 'warning', secondsLeft }
  return { phase: 'active', secondsLeft }
}

/** The latest activity of any tab. */
export function latestActivityOf(own) {
  const shared = Number(storeGet(IDLE_ACTIVITY_KEY) || 0)
  return Math.max(own, Number.isFinite(shared) ? shared : 0)
}

/** Records activity: always in memory, in storage at most every few seconds (or forced). */
export function recordActivityOf(state, now, force = false) {
  state.own = now
  if (force || now - state.written >= IDLE_WRITE_EVERY_MS) {
    state.written = now
    storeSet(IDLE_ACTIVITY_KEY, String(now))
  }
}

// ── DOM ──────────────────────────────────────────────────────────────────────────────────────

let extrasShell = null
let extrasSinks = {}
const tabId = Math.random().toString(36).slice(2) + Date.now().toString(36)

const docOf = () => (typeof document !== 'undefined' ? document : null)

function paintHeaderValues(changed = []) {
  const doc = docOf()
  const host = doc && doc.getElementById('mateuHeaderValues')
  if (!host) return
  host.textContent = ''
  for (const v of headerValuesList()) {
    const item = doc.createElement('span')
    item.className = 'mateu-header-value' + (changed.includes(v.id) ? ' mateu-header-value-changed' : '')
    item.setAttribute('data-header-value', v.id)
    if (v.label) {
      const label = doc.createElement('span')
      label.className = 'mateu-header-value-label'
      label.textContent = v.label
      item.appendChild(label)
    }
    const value = doc.createElement('strong')
    value.textContent = v.value
    item.appendChild(value)
    host.appendChild(item)
  }
}

// the live stream: only the leader tab holds it
let liveTarget = null
let liveHeartbeat = null
let liveController = null
let liveFailures = 0
let liveTimer = null
const readLeader = () => { try { return JSON.parse(storeGet(LIVE_LEADER_KEY) || 'null') } catch (e) { return null } }

function liveTick() {
  if (!liveTarget) return
  const now = Date.now()
  if (shouldLeadLive(readLeader(), tabId, now)) {
    storeSet(LIVE_LEADER_KEY, JSON.stringify({ tab: tabId, at: now }))
    const again = readLeader()
    if (again && again.tab === tabId) { if (!liveController) liveConnect(); return }
  }
  liveStop()
}

function liveStop() {
  if (liveTimer) clearTimeout(liveTimer)
  liveTimer = null
  if (liveController) liveController.abort()
  liveController = null
}

function liveConnect() {
  if (!liveTarget || liveController || typeof fetch !== 'function') return
  const own = new AbortController()
  liveController = own
  const { base, serverSideType } = liveTarget
  fetch(base + '/mateu/v3/sse/_no_route', {
    method: 'POST',
    signal: own.signal,
    headers: Object.assign({ 'Content-Type': 'application/json', Accept: 'text/event-stream' }, rendererHeaders(), authHeadersOf()),
    body: JSON.stringify({ appState: {}, componentState: {}, parameters: {}, initiatorComponentId: 'mateu-live-updates',
      consumedRoute: '', serverSideType: serverSideType || undefined, route: '', actionId: '_live-updates' }),
  }).then(async (res) => {
    if (!res.ok || !res.body) throw new Error('live updates: ' + res.status)
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
    let buffer = ''
    liveFailures = 0
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += value
      const events = buffer.split('\n\n')
      buffer = events.pop() || ''
      for (const event of events) {
        const line = event.trim()
        if (!line.startsWith('data:')) continue
        try { for (const c of headerChangesOf(JSON.parse(line.slice(5).trim()))) updateHeaderValue(c.id, c.value) } catch (e) { /* heartbeat */ }
      }
    }
  }).catch(() => { if (!own.signal.aborted) liveFailures++ })
    .finally(() => {
      if (liveController !== own) return
      liveController = null
      if (liveTarget) liveTimer = setTimeout(() => { if (liveTarget && !liveController) liveTick() }, liveReconnectDelay(liveFailures))
    })
}

function syncLive(shell, base) {
  if (!(shell && shell.liveUpdates)) {
    if (liveTarget) {
      liveTarget = null
      clearInterval(liveHeartbeat); liveHeartbeat = null
      liveStop()
      const r = readLeader(); if (r && r.tab === tabId) storeRemove(LIVE_LEADER_KEY)
    }
    return
  }
  const next = { base, serverSideType: shell.serverSideType || '' }
  if (liveTarget && (liveTarget.base !== next.base || liveTarget.serverSideType !== next.serverSideType)) liveStop()
  liveTarget = next
  if (!liveHeartbeat) liveHeartbeat = setInterval(liveTick, LIVE_HEARTBEAT_MS)
  liveTick()
}

// the «Keyboard shortcuts» dialog
function screenShortcutsOf(doc) {
  const out = []
  const seen = new Set()
  const add = (key, label) => {
    const k = String(key || '').trim().toLowerCase()
    if (!k || seen.has(k)) return
    seen.add(k); out.push({ key: k, label: label || k })
  }
  for (const a of currentShortcutActions()) {
    const el = doc.querySelector('[data-action-id="' + a.id + '"]')
    add(a.shortcut, el ? (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim() : a.id)
  }
  for (const el of doc.querySelectorAll('[data-shortcut]')) {
    if (el.getClientRects && el.getClientRects().length) add(el.getAttribute('data-shortcut'), (el.textContent || '').replace(/\s+/g, ' ').trim())
  }
  return out
}

function openShortcutsHelp(doc) {
  const dialog = doc.getElementById('mateuShortcutsHelp')
  const body = doc.getElementById('mateuShortcutsHelpBody')
  if (!dialog || !body) return
  body.textContent = ''
  const section = (title, rows) => {
    if (!rows.length) return
    if (title) {
      const h = doc.createElement('h3')
      h.className = 'oj-typography-subheading-xs oj-sm-margin-4x-top oj-sm-margin-2x-bottom'
      h.textContent = title
      body.appendChild(h)
    }
    const ul = doc.createElement('ul')
    ul.className = 'mateu-sc-list'
    for (const r of rows) ul.appendChild(r)
    body.appendChild(ul)
  }
  const kbd = (text) => { const k = doc.createElement('kbd'); k.className = 'mateu-sc-key'; k.textContent = text; return k }
  const row = (label, key, code, onClick) => {
    const li = doc.createElement('li')
    const target = onClick ? doc.createElement('button') : doc.createElement('span')
    target.className = 'mateu-sc-row'
    if (onClick) { target.type = 'button'; target.addEventListener('click', onClick) }
    const l = doc.createElement('span'); l.className = 'mateu-sc-label'; l.textContent = label; target.appendChild(l)
    if (code) { const c = doc.createElement('span'); c.className = 'mateu-sc-code'; c.textContent = code; target.appendChild(c) }
    if (key) target.appendChild(kbd(key))
    li.appendChild(target)
    return li
  }
  const shortcuts = (extrasShell && extrasShell.shortcuts) || []
  section(chromeText('shortcutsApp'), shortcuts.map((s) => row(s.label, s.key ? keyHint(s.key) : '', s.code || '', () => {
    if (typeof dialog.close === 'function') dialog.close()
    runAppShortcut(s)
  })))
  section(chromeText('shortcutsScreen'), screenShortcutsOf(doc).map((s) => row(s.label, keyHint(s.key), '', null)))
  section('', [row(chromeText('shortcutsHelpKey'), '?', '', null)])
  if (typeof dialog.open === 'function') dialog.open()
}

/** Runs an app shortcut: navigate to its route, or the app-level action. */
export function runAppShortcut(s) {
  if (!s) return
  if (s.route && extrasSinks.navigate) extrasSinks.navigate(s.route)
  else if (s.actionId && extrasSinks.runAppAction) extrasSinks.runAppAction(s.actionId)
}

// the idle warning
const idleState = { own: Date.now(), written: 0, phase: 'active', signingOut: false, tenSaid: false, timer: null }

function idleDialog(doc) { return doc.getElementById('mateuIdleWarning') }

function idleCheck(doc) {
  const idle = extrasShell && extrasShell.idleSession
  if (!idle || idleState.signingOut) return
  const { phase, secondsLeft } = idlePhaseOf(Date.now(), latestActivityOf(idleState.own), idle)
  if (phase === 'expired') { idleSignOut(doc, true); return }
  const dialog = idleDialog(doc)
  const message = doc.getElementById('mateuIdleMessage')
  if (phase === 'warning') {
    if (message) message.textContent = chromeText('idleMessage', { seconds: secondsLeft })
    if (idleState.phase !== 'warning') {
      idleState.tenSaid = false
      if (dialog && typeof dialog.open === 'function') dialog.open()
      announce(chromeText('idleTitle') + ' ' + chromeText('idleMessage', { seconds: secondsLeft }), { politeness: 'assertive' })
      setTimeout(() => {
        const stay = doc.querySelector('#mateuIdleStay button') || doc.getElementById('mateuIdleStay')
        if (stay && stay.focus) stay.focus()
      }, 100)
    }
    if (secondsLeft <= 10 && !idleState.tenSaid) {
      idleState.tenSaid = true
      announce(chromeText('idleMessage', { seconds: secondsLeft }), { politeness: 'assertive' })
    }
  } else if (idleState.phase === 'warning' && dialog && typeof dialog.close === 'function') {
    dialog.close()
  }
  idleState.phase = phase
}

function idleStay(doc) {
  recordActivityOf(idleState, Date.now(), true)
  idleState.phase = 'active'
  const dialog = idleDialog(doc)
  if (dialog && typeof dialog.close === 'function') dialog.close()
  const id = extrasShell && extrasShell.idleSession && extrasShell.idleSession.keepAliveActionId
  if (id && extrasSinks.keepAlive) extrasSinks.keepAlive(id)
}

/** Where the idle sign-out goes: the shell's url — never a javascript:/data: one (safeHref);
 *  an unsafe or missing one signs out to '/'. */
export function idleSignOutUrlOf(shell) {
  return safeHref((shell && shell.idleSession && shell.idleSession.signOutUrl) || '/') || '/'
}

function idleSignOut(doc, propagate) {
  if (idleState.signingOut) return
  idleState.signingOut = true
  if (propagate) storeSet(IDLE_SIGN_OUT_KEY, String(Date.now()))
  const message = doc.getElementById('mateuIdleMessage')
  if (message) message.textContent = chromeText('idleSigningOut')
  const url = idleSignOutUrlOf(extrasShell)
  const event = new CustomEvent('mateu-idle-sign-out', { detail: { url }, cancelable: true })
  if (!doc.dispatchEvent(event)) return
  doc.defaultView.location.assign(url)
}

/** The shell on show + where navigation and app actions go. Called on every shell (re)build. */
export function syncAppExtras(shell, sinks = {}) {
  extrasShell = shell || null
  extrasSinks = sinks || {}
  seedHeaderValues((shell && shell.headerValues) || [])
  syncLive(shell, sinks.base || '')
  const doc = docOf()
  if (doc) {
    const values = doc.getElementById('mateuHeaderValues')
    if (values) values.hidden = !headerValuesList().length
    if (shell && shell.idleSession && !idleState.timer) {
      recordActivityOf(idleState, Date.now(), true)
      idleState.timer = setInterval(() => idleCheck(doc), 1000)
    } else if (!(shell && shell.idleSession) && idleState.timer) {
      clearInterval(idleState.timer); idleState.timer = null
    }
  }
}

/** Installs (once) the document listeners of the app extras. */
export function installAppExtras(doc = docOf()) {
  if (!doc || doc.__mateuAppExtras) return
  doc.__mateuAppExtras = true
  const win = doc.defaultView
  headerPainter = paintHeaderValues
  // the other tabs: header values, activity, sign-out
  win.addEventListener('storage', (e) => {
    if (e.key === HEADER_VALUES_KEY && e.newValue) {
      try { const c = JSON.parse(e.newValue); if (c.id) updateHeaderValue(c.id, c.value, { broadcast: false }) } catch (err) { /* not ours */ }
    }
    if (e.key === IDLE_SIGN_OUT_KEY && e.newValue && extrasShell && extrasShell.idleSession) idleSignOut(doc, false)
    if (e.key === IDLE_ACTIVITY_KEY) idleCheck(doc)
  })
  win.addEventListener('pagehide', () => {
    liveStop()
    const r = readLeader(); if (r && r.tab === tabId) storeRemove(LIVE_LEADER_KEY)
  })
  // activity (ignored while the warning is up: only «Stay» keeps the session). Not 'scroll': the
  // shell scrolls by itself (sticky headers, focus), and that is not the user being there
  for (const type of ['keydown', 'pointerdown', 'wheel', 'touchstart']) {
    win.addEventListener(type, () => { if (idleState.phase === 'active') recordActivityOf(idleState, Date.now()) }, { capture: true, passive: true })
  }
  // idle dialog buttons + Escape = stay
  doc.addEventListener('ojAction', (e) => {
    const t = e.target
    if (!t || !t.closest) return
    if (t.closest('#mateuIdleStay')) idleStay(doc)
    else if (t.closest('#mateuIdleSignOut')) idleSignOut(doc, true)
  }, true)
  doc.addEventListener('keydown', (e) => {
    if (idleState.phase === 'warning' && e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); idleStay(doc); return }
    // quick launch: an exact code + Enter in the Ask palette
    if (e.key === 'Enter' && e.target && e.target.closest && e.target.closest('#mateuAskInput')) {
      const hit = quickLaunchMatch(extrasShell && extrasShell.shortcuts, e.target.value)
      if (hit) {
        e.preventDefault(); e.stopPropagation()
        const ask = doc.getElementById('mateuAskOracle')
        if (ask && typeof ask.close === 'function') ask.close()
        runAppShortcut(hit)
      }
    }
  }, true)
  // app shortcuts: bubble phase on the window, after the screen's (keys.mjs, capture, stops them)
  win.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || !extrasShell) return
    const shortcuts = extrasShell.shortcuts || []
    if (!shortcuts.length) return
    const typing = isTypingElement(doc.activeElement)
    if (isShortcutsHelpKey(e, typing)) { e.preventDefault(); openShortcutsHelp(doc); return }
    const screenKeys = currentShortcutActions().map((a) => a.shortcut)
    const hit = appShortcutFor(shortcuts, e, typing, screenKeys)
    if (!hit) return
    e.preventDefault()
    runAppShortcut(hit)
  })
}
