import { chromeText } from './i18n.mjs'
import { announce } from './a11y.mjs'
import { callMateu } from './transport.mjs'
// NOTIFICATION INBOX as a pattern (design/progress-and-notifications.md), in Redwood.
//
// What the bell lists = the app's list (NotificationsSupplier, `_notifications-list`) ∪ the
// SESSION's own entries (a message with persistence `inbox`, one a task posted when done, a pushed
// entry the server list does not carry yet), deduplicated by id. Each entry may say its `category`
// (the panel groups by it), `variant`, whether it is `resolved`, what can be done from it
// (`actions`, run server-side with `_notifications-act {id, actionId}`) and whether it has a
// `detail` the server answers (`_notifications-open {id}`, e.g. a Drawer) — else its `route`.
// The panel filters unread / all / resolved, marks all read, dismisses an entry
// (`_notifications-dismiss {ids}`). Live: `NotificationsChanged` on the `_live-updates` stream
// (appExtras.mjs) upserts / removes an entry or asks for the list again.
//
// The panel is painted by the bridge (JET components outside Knockout, in #mateuBellPanel inside the
// shell's oj-popup); the bell's badge stays bound to $application.variables.mateuNotifications.

export const INBOX_FILTERS = ['unread', 'all', 'resolved']

/** An action as the panel and the toasts draw it ({label, actionId, parameters, route, style}). */
export function messageActionOf(a) {
  if (!a || typeof a !== 'object') return null
  if (!a.actionId && !a.route) return null
  return {
    label: a.label == null ? '' : String(a.label),
    actionId: a.actionId || '',
    parameters: a.parameters && typeof a.parameters === 'object' ? a.parameters : {},
    route: a.route || '',
    style: a.style || '',
  }
}

/** One entry of the inbox, normalised (a server AppNotification, or a session one). */
export function inboxEntryOf(n, session = false) {
  const unread = n.unread !== false
  const resolved = !!n.resolved
  return {
    id: String(n.id),
    title: n.title || '',
    text: n.text || '',
    when: n.when || '',
    route: n.route || '',
    unread,
    resolved,
    category: n.category || '',
    variant: n.variant || '',
    actions: (n.actions || []).map(messageActionOf).filter(Boolean),
    hasDetail: !!n.hasDetail,
    session: !!session,
    titleClass: 'oj-typography-body-md' + (unread ? ' oj-typography-bold' : ''),
  }
}

let inboxSessionCounter = 0
const inboxClock = () => {
  const d = new Date()
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}

/** The session entry a message with persistence `inbox` becomes (its key is its id: the same key
 *  replaces it). */
export function sessionEntryOfMessage(m) {
  const id = m.key ? String(m.key) : 'message-' + (++inboxSessionCounter)
  const hasBoth = m.title && m.text
  return inboxEntryOf({
    id,
    title: hasBoth ? m.title : (m.text || m.title || ''),
    text: hasBoth ? m.text : '',
    when: inboxClock(),
    unread: true,
    variant: m.variant || '',
    actions: m.actions || [],
  }, true)
}

/** The NotificationsChanged data an increment carries, in order. */
export function notificationsChangedOf(increment) {
  return ((increment && increment.commands) || [])
    .filter((c) => c && c.type === 'NotificationsChanged')
    .map((c) => (c.data && typeof c.data === 'object' ? c.data : {}))
}

/** The inbox's state (pure: every operation answers a new one). */
export function createInbox() {
  return { server: [], session: [], filter: 'all' }
}

export function withServerList(inboxState, list) {
  const server = (list || []).map((n) => inboxEntryOf(n))
  // a session entry the server now lists is the server's
  const ids = new Set(server.map((e) => e.id))
  return { ...inboxState, server, session: inboxState.session.filter((e) => !ids.has(e.id)) }
}

export function withSessionEntry(inboxState, entry) {
  const inServer = inboxState.server.some((e) => e.id === entry.id)
  if (inServer) return { ...inboxState, server: inboxState.server.map((e) => (e.id === entry.id ? { ...entry, session: false } : e)) }
  return { ...inboxState, session: [entry].concat(inboxState.session.filter((e) => e.id !== entry.id)) }
}

/** A pushed change: an entry upserted (the app's: it goes to the server half), one removed, or —
 *  `refetch: true` — the list has to be asked for again. */
export function withChange(inboxState, change) {
  if (change && change.notification) {
    const entry = inboxEntryOf(change.notification)
    const exists = inboxState.server.some((e) => e.id === entry.id)
    return {
      inbox: {
        ...inboxState,
        server: exists ? inboxState.server.map((e) => (e.id === entry.id ? entry : e)) : [entry].concat(inboxState.server),
        session: inboxState.session.filter((e) => e.id !== entry.id),
      },
      added: exists ? null : entry,
      refetch: false,
    }
  }
  if (change && change.removedId != null) {
    const id = String(change.removedId)
    return { inbox: { ...inboxState, server: inboxState.server.filter((e) => e.id !== id), session: inboxState.session.filter((e) => e.id !== id) }, added: null, refetch: false }
  }
  return { inbox: inboxState, added: null, refetch: true }
}

/** Marks entries read locally (`'all'` = every unread one). */
export function withRead(inboxState, ids) {
  const which = ids === 'all' ? null : new Set([].concat(ids || []).map(String))
  const read = (e) => (!which || which.has(e.id) ? { ...e, unread: false, titleClass: 'oj-typography-body-md' } : e)
  return { ...inboxState, server: inboxState.server.map(read), session: inboxState.session.map(read) }
}

export function withoutEntries(inboxState, ids) {
  const which = new Set([].concat(ids || []).map(String))
  return { ...inboxState, server: inboxState.server.filter((e) => !which.has(e.id)), session: inboxState.session.filter((e) => !which.has(e.id)) }
}

export function withFilter(inboxState, filter) {
  return INBOX_FILTERS.includes(filter) ? { ...inboxState, filter } : inboxState
}

/** Every entry: the session's (newest first) over the server's. */
export function entriesOf(inboxState) {
  return inboxState.session.concat(inboxState.server)
}

export function filteredEntries(entries, filter) {
  if (filter === 'unread') return entries.filter((e) => e.unread && !e.resolved)
  if (filter === 'resolved') return entries.filter((e) => e.resolved)
  return entries
}

/** The entries grouped by category, in first-appearance order (no category → «Other», last,
 *  and no heading at all when nothing declares a category). */
export function groupsOf(entries) {
  const named = new Map()
  const other = []
  for (const e of entries) {
    if (!e.category) { other.push(e); continue }
    if (!named.has(e.category)) named.set(e.category, [])
    named.get(e.category).push(e)
  }
  const groups = [...named.entries()].map(([label, items]) => ({ label, items }))
  if (other.length) groups.push({ label: groups.length ? chromeText('inboxOther') : '', items: other })
  return groups
}

let notificationsProviderFactory = null
export function setInboxProviderFactory(f) { notificationsProviderFactory = f }

/** The bell's model (what $application.variables.mateuNotifications holds): the unread count of
 *  EVERY entry (the badge does not depend on the filter), and the entries the filter shows. */
export function inboxModelOf(inboxState) {
  const all = entriesOf(inboxState)
  const shown = filteredEntries(all, inboxState.filter)
  const unread = all.filter((e) => e.unread && !e.resolved).length
  const items = shown.map((e, i) => ({ ...e, _rowNumber: i }))
  return {
    enabled: true,
    unread,
    badge: unread > 9 ? '9+' : String(unread),
    hasUnread: unread > 0,
    label: unread ? chromeText('notificationsUnread', { n: unread }) : chromeText('notifications'),
    empty: items.length === 0,
    items,
    groups: groupsOf(items),
    filter: inboxState.filter,
    filters: INBOX_FILTERS.map((f) => ({ id: f, label: chromeText({ unread: 'inboxUnread', all: 'inboxAll', resolved: 'inboxResolved' }[f]), selected: f === inboxState.filter })),
    provider: notificationsProviderFactory ? notificationsProviderFactory(items) : null,
  }
}

// ── the inbox of this tab ─────────────────────────────────────────────────────────────────────

let inboxState = createInbox()
let inboxEnabled = false
let inboxContext = null // { base, serverSideType, appState }
const inboxSinks = { model: null, increment: null, navigate: null, sessionAction: null }

/** Where the inbox talks to (the app's backend and App type) — set by the shell at boot. */
export function setInboxContext(ctx) { inboxContext = ctx || null; inboxEnabled = !!ctx }
/** The bell's model goes here (the VB variable). */
export function setInboxModelSink(fn) { inboxSinks.model = typeof fn === 'function' ? fn : null }
/** An answer to paint on the content page (a detail Drawer, an action's Message / commands). */
export function setInboxIncrementSink(fn) { inboxSinks.increment = typeof fn === 'function' ? fn : null }
/** A route to navigate to. */
export function setInboxNavigateSink(fn) { inboxSinks.navigate = typeof fn === 'function' ? fn : null }
/** A session entry's action (it came from a message: it runs on the screen, like the toast's). */
export function setInboxSessionActionSink(fn) { inboxSinks.sessionAction = typeof fn === 'function' ? fn : null }

export function currentInbox() { return inboxState }
export function currentInboxModel() { return inboxModelOf(inboxState) }

function commitInbox(next) {
  inboxState = next
  const model = inboxModelOf(inboxState)
  if (inboxSinks.model) inboxSinks.model(model)
  repaintInboxPanel()
  return model
}

/** The server's list arrived (notify.fetchNotifications): merged with the session's entries. */
export function adoptServerList(list) { inboxState = withServerList(inboxState, list); repaintInboxPanel(); return inboxModelOf(inboxState) }
export function markReadLocally(ids) { inboxState = withRead(inboxState, ids); repaintInboxPanel(); return inboxModelOf(inboxState) }
export function sessionIdsOf(ids) {
  const session = new Set(inboxState.session.map((e) => e.id))
  return ids === 'all' ? [...session] : [].concat(ids || []).map(String).filter((id) => session.has(id))
}

/** A message with persistence `inbox` lands in the session's inbox (its toast is shown apart). */
export function noteInboxMessage(m) {
  if (!m) return null
  return commitInbox(withSessionEntry(inboxState, sessionEntryOfMessage(m)))
}

/** Messages of a stream whose screen is gone: only the `inbox` ones are kept (in the inbox). */
export function noteDetachedMessages(messages) {
  for (const m of messages || []) if (m && m.persistence === 'inbox') noteInboxMessage(m)
}

/** A NotificationsChanged (live updates): upsert / remove, or ask for the list again. */
export async function applyNotificationsChanged(change) {
  const { inbox: next, added, refetch } = withChange(inboxState, change)
  if (refetch) return refreshInbox()
  commitInbox(next)
  if (added && added.unread) announce(chromeText('inboxNew', { title: added.title }))
  return inboxModelOf(inboxState)
}

function strippedOfInboxData(increment) {
  return { ...increment, fragments: (increment.fragments || []).filter((f) => !(f && f.data && Array.isArray(f.data._notifications))) }
}

async function inboxAppLevel(actionId, parameters) {
  if (!inboxContext) return null
  const increment = await callMateu(inboxContext.base || '', {
    route: '', actionId, componentState: {}, parameters: parameters || {},
    serverSideType: inboxContext.serverSideType || undefined, appState: inboxContext.appState || {},
  }, { isolated: true })
  const list = ((increment && increment.fragments) || []).find((f) => f && f.data && Array.isArray(f.data._notifications))
  if (list) inboxState = withServerList(inboxState, list.data._notifications)
  return increment
}

/** Asks for the list again (a NotificationsChanged with nothing in it, or the popup opening). */
export async function refreshInbox() {
  if (!inboxEnabled) return inboxModelOf(inboxState)
  try { await inboxAppLevel('_notifications-list') } catch (e) { /* keep what we had */ }
  return commitInbox(inboxState)
}

/** Runs one of an entry's actions. A session entry's runs on the screen (or navigates); a
 *  server entry's goes to `_notifications-act`, whose answer (a Message, a command, an overlay)
 *  is painted on the content page and whose refreshed list replaces the panel's. */
export async function actOnEntry(id, index) {
  const entry = entriesOf(inboxState).find((e) => e.id === String(id))
  const action = entry && entry.actions[index]
  if (!action) return false
  if (action.route && (entry.session || !action.actionId)) {
    if (inboxSinks.navigate) inboxSinks.navigate(action.route)
    commitInbox(withRead(inboxState, [entry.id]))
    return true
  }
  if (entry.session) {
    if (inboxSinks.sessionAction) inboxSinks.sessionAction(action.actionId, action.parameters, {})
    commitInbox(withRead(inboxState, [entry.id]))
    return true
  }
  try {
    const answer = await inboxAppLevel('_notifications-act', { id: entry.id, actionId: action.actionId })
    if (answer && inboxSinks.increment) inboxSinks.increment(strippedOfInboxData(answer))
  } catch (e) { /* the server refused: the entry stays as it was */ }
  commitInbox(inboxState)
  return true
}

/** Opens an entry: its detail (the server answers it) or its route; it is read from then on. */
export async function openEntry(id) {
  const entry = entriesOf(inboxState).find((e) => e.id === String(id))
  if (!entry) return false
  if (entry.session) {
    commitInbox(withRead(inboxState, [entry.id]))
    if (entry.route && inboxSinks.navigate) inboxSinks.navigate(entry.route)
    return true
  }
  try {
    await inboxAppLevel('_notifications-read', { ids: [entry.id] })
    if (entry.hasDetail) {
      const answer = await inboxAppLevel('_notifications-open', { id: entry.id })
      if (answer && inboxSinks.increment) inboxSinks.increment(strippedOfInboxData(answer))
    } else if (entry.route && inboxSinks.navigate) {
      inboxSinks.navigate(entry.route)
    }
  } catch (e) { inboxState = withRead(inboxState, [entry.id]) }
  commitInbox(inboxState)
  return true
}

/** Dismisses an entry (gone from the list; the server's through `_notifications-dismiss`). */
export async function dismissEntry(id) {
  const key = String(id)
  const entry = entriesOf(inboxState).find((e) => e.id === key)
  if (!entry) return false
  inboxState = withoutEntries(inboxState, [key])
  if (!entry.session) { try { await inboxAppLevel('_notifications-dismiss', { ids: [key] }) } catch (e) { /* the next listing tells */ } }
  commitInbox(inboxState)
  return true
}

export function chooseFilter(filter) { return commitInbox(withFilter(inboxState, filter)) }

/** Test hook. */
export function resetInboxForTests() { inboxState = createInbox(); inboxEnabled = false; inboxContext = null; inboxPanel = null }

// ── the panel (DOM) ───────────────────────────────────────────────────────────────────────────

let inboxPanel = null // { doc, host }

/** Paints the panel in `host` (#mateuBellPanel) now and after every change. */
export function mountInboxPanel(host, doc = typeof document !== 'undefined' ? document : null) {
  if (!host || !doc) return
  inboxPanel = { doc, host }
  repaintInboxPanel()
}

function repaintInboxPanel() {
  if (!inboxPanel) return
  const { doc, host } = inboxPanel
  if (!host.isConnected && host.isConnected !== undefined) { inboxPanel = null; return }
  const model = inboxModelOf(inboxState)
  const e = (tag, attrs = {}, text) => {
    const n = doc.createElement(tag)
    for (const [k, v] of Object.entries(attrs)) if (v != null && v !== false) n.setAttribute(k, v === true ? '' : String(v))
    if (text != null) n.textContent = text
    return n
  }
  const btn = (label, onAction, attrs = {}) => {
    const b = e('oj-button', { chroming: 'borderless', ...attrs })
    b.textContent = label
    b.addEventListener('ojAction', onAction)
    return b
  }
  host.textContent = ''
  const filters = e('div', { class: 'mateu-inbox-filters oj-flex oj-sm-margin-2x-bottom', role: 'group', 'aria-label': chromeText('notifications') })
  for (const f of model.filters) {
    filters.appendChild(btn(f.label, () => chooseFilter(f.id), {
      chroming: f.selected ? 'solid' : 'borderless', 'aria-pressed': f.selected ? 'true' : 'false', 'data-filter': f.id,
    }))
  }
  host.appendChild(filters)
  if (model.empty) host.appendChild(e('div', { class: 'oj-text-color-secondary oj-sm-padding-4x-vertical' }, chromeText('allCaughtUp')))
  for (const group of model.groups) {
    if (group.label) host.appendChild(e('div', { class: 'mateu-inbox-group oj-typography-subheading-xs oj-sm-margin-2x-top' }, group.label))
    const list = e('ul', { class: 'mateu-inbox-list', role: 'list' })
    for (const item of group.items) {
      const li = e('li', { class: 'mateu-inbox-item' + (item.unread ? ' mateu-inbox-unread' : '') + (item.resolved ? ' mateu-inbox-resolved' : ''), 'data-id': item.id })
      if (item.variant) li.setAttribute('data-variant', item.variant)
      const head = e('div', { class: 'oj-flex oj-sm-justify-content-space-between oj-sm-align-items-center' })
      const opens = item.hasDetail || !!item.route
      const title = e(opens ? 'a' : 'span', { class: item.titleClass + ' mateu-inbox-title', href: opens ? '#' : null }, item.title)
      if (opens) title.addEventListener('click', (ev) => { if (ev.preventDefault) ev.preventDefault(); openEntry(item.id) })
      head.appendChild(title)
      const dismiss = btn(chromeText('inboxDismiss'), () => dismissEntry(item.id), { display: 'icons', 'aria-label': chromeText('inboxDismiss') + ': ' + item.title, class: 'mateu-inbox-dismiss' })
      dismiss.appendChild(e('span', { slot: 'startIcon', class: 'oj-ux-ico-close' }))
      head.appendChild(dismiss)
      li.appendChild(head)
      if (item.text) li.appendChild(e('div', { class: 'oj-typography-body-sm' }, item.text))
      if (item.when) li.appendChild(e('div', { class: 'oj-typography-body-xs oj-text-color-secondary' }, item.when))
      if (item.actions.length && !item.resolved) {
        const row = e('div', { class: 'mateu-inbox-actions oj-flex oj-sm-flex-wrap' })
        item.actions.forEach((a, i) => row.appendChild(btn(a.label || (a.style === 'undo' ? chromeText('undo') : a.actionId || a.route),
          () => actOnEntry(item.id, i), { chroming: a.style === 'primary' || a.style === 'danger' ? 'callToAction' : 'outlined' })))
        li.appendChild(row)
      }
      list.appendChild(li)
    }
    host.appendChild(list)
  }
}
