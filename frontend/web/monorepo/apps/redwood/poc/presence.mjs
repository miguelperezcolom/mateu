import { chromeText } from './i18n.mjs'
import { announce } from './a11y.mjs'
import { authHeadersOf } from './resilience.mjs'
import { rendererHeaders } from './versionSkew.mjs'
import { underPublicBase, currentRoutePathOf } from './mount.mjs'

// RECORD PRESENCE (`@App(presence = true)`) on the VB shell — "Ana is editing this record". The
// same contract as libs/mateu presence.ts (the web's mateu-presence-chip), so a Vaadin tab and a
// Redwood tab of one app see each other:
//  - a RECORD page (a route of 2+ segments, or one segment when the page asks to confirm leaving
//    with unsaved changes; never …/new, never the root) WATCHES its record: mount-relative route +
//    the screen's class. It reports itself every HEARTBEAT_MS with the app-level `_presence` action
//    — `viewing`, or `editing` while the page holds unsaved changes — once more at once when that
//    flips, and `leave` when the page goes away. The answer is a `PresenceChanged` command with
//    the OTHER people.
//  - changes others make arrive on the app event stream (appExtras.mjs `_live-updates`, which runs
//    for presence too), so the chip follows within a second.
//  - the chip is painted into #mateuPresence (main-start-page.html, under the page header band —
//    a listing has its own band and no chip). Anonymous callers take no part (nothing answered).
// What is pure is tested in Node (test-e2.mjs); the DOM half is wired from loadMateuShell / the
// after-reduce hook.

export const PRESENCE_ACTION = '_presence'
export const PRESENCE_HEARTBEAT_MS = 10000

/** The presence changes an increment carries (a heartbeat's answer, a stream event). */
export function presenceChangesOf(increment) {
  const commands = (increment && increment.commands) || []
  return commands
    .filter((c) => c && c.type === 'PresenceChanged' && c.data && typeof c.data.key === 'string')
    .map((c) => ({ key: c.data.key, entries: Array.isArray(c.data.entries) ? c.data.entries : [] }))
}

/** The route a page reports: no query, no surrounding slashes. */
export function presenceRouteOf(route) {
  return String(route || '').split('?')[0].split('#')[0].replace(/\/{2,}/g, '/').replace(/^\/+|\/+$/g, '')
}

/** Whether a page on `route` is a RECORD page (libs/mateu isRecordRoute, the same rule). */
export function isRecordRoute(route, edits = false) {
  const path = String(route || '').replace(/\/(edit|view)$/, '')
  if (!path.length || path === 'new' || path.endsWith('/new')) return false
  return edits || path.split('/').filter(Boolean).length >= 2
}

/** "Ana", "Ana and Bob", "Ana, Bob and 2 more". */
export function presenceNamesText(names, lang) {
  if (names.length <= 1) return names[0] || ''
  if (names.length === 2) return names[0] + chromeText('presenceAnd', null, lang) + names[1]
  return chromeText('presenceMore', { names: names.slice(0, 2).join(', '), n: names.length - 2 }, lang)
}

/** What the chip says — editors first (a warning: they may overwrite each other), then viewers. */
export function presenceSummaryOf(entries, lang) {
  if (!entries || !entries.length) return null
  const editors = entries.filter((e) => e.editing).map((e) => e.name)
  const viewers = entries.filter((e) => !e.editing).map((e) => e.name)
  const parts = []
  if (editors.length) parts.push(chromeText(editors.length === 1 ? 'presenceEditing' : 'presenceEditingMany', { names: presenceNamesText(editors, lang) }, lang))
  if (viewers.length) parts.push(chromeText(viewers.length === 1 ? 'presenceViewing' : 'presenceViewingMany', { names: presenceNamesText(viewers, lang) }, lang))
  return { text: parts.join(' · '), tone: editors.length ? 'warning' : 'neutral', editors, viewers }
}

/** The people who START editing between two answers (announced once, politely). */
export function presenceNewEditors(before, after) {
  const were = new Set((before || []).filter((e) => e.editing).map((e) => e.name))
  return (after || []).filter((e) => e.editing && !were.has(e.name)).map((e) => e.name)
}

/** Initials for the avatar of a name ("Ana López" → "AL", "ana@x.org" → "A"). */
export function presenceInitialsOf(name) {
  const words = String(name || '?').split('@')[0].split(/[\s._-]+/).filter(Boolean)
  const letters = words.length >= 2 ? words[0][0] + words[1][0] : (words[0] || '?')[0]
  return (letters || '?').toUpperCase()
}

/**
 * What the screen on show watches, from the registry: the host's class and whether it edits; null
 * when there is nothing to watch (no host, an app MEDIATOR still loading its content).
 */
export function presencePageOf(hostCtx) {
  const tree = hostCtx && hostCtx.tree
  if (!tree || tree.type !== 'ServerSide' || !tree.serverSideType) return null
  const first = (tree.children || [])[0]
  if (first && first.metadata && first.metadata.type === 'App') return null
  const walk = (node) => !!node && typeof node === 'object'
    && (node.confirmOnNavigationIfDirty === true || (node.children || []).some(walk))
  return { view: tree.serverSideType, edits: walk(tree) }
}

// ── the singleton ───────────────────────────────────────────────────────────────────────────

const presenceTab = Math.random().toString(36).slice(2) + Date.now().toString(36)
let presenceTarget = null // { base, serverSideType }
let presenceWatch = null // { route, view, edits, key, entries, editing, timer }
let presenceDirtyReader = () => false
let presenceFetch = (...args) => globalThis.fetch(...args)

/** Whether the shell on show asked for presence. */
export const presenceEnabled = () => presenceTarget !== null

/** How the shell's unsaved-changes flag is read ($application.variables.mateuDirty). */
export function setPresenceDirtyReader(fn) { presenceDirtyReader = typeof fn === 'function' ? fn : () => false }

/** Test hook: the fetch the reports go through. */
export function setPresenceFetch(fn) { presenceFetch = fn }

/** The shell on show (syncAppExtras): `presence` on → record pages report themselves; off → stop. */
export function syncPresence(shell, base) {
  const want = !!(shell && shell.presence) && typeof presenceFetch === 'function'
  if (!want) {
    if (presenceTarget) { stopPresenceWatch(true); presenceTarget = null; paintPresence() }
    return
  }
  const next = { base: base || '', serverSideType: shell.serverSideType || '' }
  const changed = !presenceTarget || presenceTarget.base !== next.base || presenceTarget.serverSideType !== next.serverSideType
  if (changed && presenceTarget) stopPresenceWatch(true)
  presenceTarget = next
  if (changed && presenceWatch) startPresenceWatch()
}

/**
 * The screen on show (the after-reduce hook): its record is watched while it is on screen; another
 * record (or none) stops the previous watch with a `leave`.
 */
export function notePresencePage(page, route) {
  const r = presenceRouteOf(route)
  const watchable = !!page && isRecordRoute(r, page.edits)
  const id = watchable ? r + '|' + page.view : null
  const current = presenceWatch ? presenceWatch.route + '|' + presenceWatch.view : null
  if (id === current) {
    if (presenceWatch) { presenceWatch.edits = page.edits; recheckPresenceEditing() }
    schedulePresencePaint()
    return
  }
  if (presenceWatch) stopPresenceWatch(true)
  presenceWatch = watchable ? { route: r, view: page.view, edits: page.edits, entries: [], first: true, editing: !!presenceDirtyReader(), timer: null } : null
  if (presenceWatch) startPresenceWatch()
  schedulePresencePaint()
}

/** A presence change from the event stream: the watch of that record follows. */
export function applyPresenceChange(change) {
  if (presenceWatch && change && presenceWatch.key === change.key) updatePresence(change.entries)
}

/** The page's unsaved-changes flag may have flipped: report it at once, not on the next beat. */
export function recheckPresenceEditing() {
  if (!presenceWatch) return
  const editing = !!presenceDirtyReader()
  if (presenceWatch.editing !== editing) {
    presenceWatch.editing = editing
    presenceBeat()
  }
}

/** The page goes away (pagehide): the server forgets this tab now, not in 30 s. */
export function leavePresence() { if (presenceWatch) sendPresence(presenceWatch, 'leave') }

/** The entries the chip shows (the OTHER people on this record). */
export const presenceEntriesNow = () => (presenceTarget && presenceWatch ? presenceWatch.entries : [])

function startPresenceWatch() {
  if (!presenceTarget || !presenceWatch) return
  presenceBeat()
  clearInterval(presenceWatch.timer)
  presenceWatch.timer = setInterval(presenceBeat, PRESENCE_HEARTBEAT_MS)
}

function stopPresenceWatch(leave) {
  if (!presenceWatch) return
  clearInterval(presenceWatch.timer)
  presenceWatch.timer = null
  if (leave) sendPresence(presenceWatch, 'leave')
  presenceWatch.entries = []
}

function presenceBeat() { if (presenceWatch) sendPresence(presenceWatch, presenceWatch.editing ? 'editing' : 'viewing') }

function updatePresence(entries) {
  const watch = presenceWatch
  if (!watch) return
  // the first answer is the state found on arrival: announce only who STARTS editing later
  if (!watch.first) for (const name of presenceNewEditors(watch.entries, entries)) announce(chromeText('presenceStartedEditing', { name }))
  watch.first = false
  watch.entries = entries || []
  schedulePresencePaint()
}

function sendPresence(watch, state) {
  if (!presenceTarget) return Promise.resolve()
  const { base, serverSideType } = presenceTarget
  const url = underPublicBase(base) + '/mateu/v3/sync/_no_route'
  let request
  try {
    request = presenceFetch(url, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, rendererHeaders(), authHeadersOf()),
      // a leave sent while the page unloads must still go out
      keepalive: state === 'leave',
      body: JSON.stringify({
        serverSideType: serverSideType || undefined, appState: {}, componentState: {},
        parameters: { route: watch.route, view: watch.view, tab: presenceTab, state },
        initiatorComponentId: 'mateu-presence', consumedRoute: '', route: '', actionId: PRESENCE_ACTION,
      }),
    })
  } catch (e) { return Promise.resolve() }
  return Promise.resolve(request).then(async (res) => {
    if (!res || !res.ok || state === 'leave') return
    for (const change of presenceChangesOf(await res.json())) {
      // a late answer for a record we left changes nothing
      if (presenceWatch !== watch) return
      watch.key = change.key
      updatePresence(change.entries)
    }
  }).catch(() => { /* presence is best effort: the next heartbeat tries again */ })
}

// ── DOM ─────────────────────────────────────────────────────────────────────────────────────

/** The chip's markup, as a plain description (painted by paintPresence; tested in Node). */
export function presenceChipOf(entries, lang) {
  const summary = presenceSummaryOf(entries, lang)
  if (!summary) return null
  const shown = entries.slice(0, 3)
  return {
    tone: summary.tone,
    text: summary.text,
    label: chromeText('presenceLabel', null, lang) + ': ' + summary.text,
    avatars: shown.map((e) => ({ initials: presenceInitialsOf(e.name), name: e.name, editing: !!e.editing })),
    more: entries.length > shown.length ? entries.length - shown.length : 0,
  }
}

function paintPresence() {
  const doc = typeof document !== 'undefined' ? document : null
  const host = doc && doc.getElementById('mateuPresence')
  if (!host) return false
  const chip = presenceEnabled() ? presenceChipOf(presenceEntriesNow()) : null
  host.textContent = ''
  host.hidden = !chip
  if (!chip) { host.removeAttribute('aria-label'); return true }
  host.className = 'mateu-presence mateu-presence-' + chip.tone
  host.setAttribute('role', 'status')
  host.setAttribute('aria-label', chip.label)
  const avatars = doc.createElement('span')
  avatars.className = 'mateu-presence-avatars'
  avatars.setAttribute('aria-hidden', 'true')
  for (const a of chip.avatars) {
    const av = doc.createElement('span')
    av.className = 'mateu-presence-avatar' + (a.editing ? ' mateu-presence-editing' : '')
    av.title = a.name
    av.textContent = a.initials
    avatars.appendChild(av)
  }
  if (chip.more) {
    const more = doc.createElement('span')
    more.className = 'mateu-presence-avatar mateu-presence-more'
    more.textContent = '+' + chip.more
    avatars.appendChild(more)
  }
  const text = doc.createElement('span')
  text.className = 'mateu-presence-text'
  text.setAttribute('aria-hidden', 'true')
  text.textContent = chip.text
  host.appendChild(avatars)
  host.appendChild(text)
  return true
}

// VB updates its bindings asynchronously: the band (and #mateuPresence in it) may come a few frames
// after the answer — paint until it is there
let presencePaintTries = 0
function schedulePresencePaint() {
  if (typeof requestAnimationFrame !== 'function') { paintPresence(); return }
  const already = presencePaintTries > 0
  presencePaintTries = 12
  if (already) return
  const tick = () => {
    if (paintPresence() || --presencePaintTries <= 0) { presencePaintTries = 0; return }
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

/** Installs (once) what follows the page: edits flip «editing», the tab leaving says `leave`, a
 *  re-created band gets the chip back. */
export function installPresence(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuPresence) return
  doc.__mateuPresence = true
  const later = () => setTimeout(recheckPresenceEditing, 0)
  doc.addEventListener('input', later, true)
  doc.addEventListener('change', later, true)
  doc.addEventListener('valueChanged', later, true)
  doc.addEventListener('click', () => setTimeout(recheckPresenceEditing, 300), true)
  if (doc.defaultView) doc.defaultView.addEventListener('pagehide', leavePresence)
}

/** The route of the screen on show, mount-relative (the URL; hash routes too). */
export const presenceCurrentRoute = () => currentRoutePathOf(typeof location !== 'undefined' ? location : null)

/** Test hook: forget the watch and the shell. */
export function resetPresence() {
  if (presenceWatch) clearInterval(presenceWatch.timer)
  presenceWatch = null
  presenceTarget = null
  presenceDirtyReader = () => false
}
