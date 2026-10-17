import { callMateu } from './transport.mjs'
import { chromeText } from './i18n.mjs'
import { markReadVars, runShellSource, shellSourcesOf, sourcedNotificationsOf } from './globalSearch.mjs'
// NOTIFICATION INBOX and TOASTS WITH UNDO in the VB shell.
//
// Inbox (the App's NotificationsSupplier): the header bell with the unread count
// opens an oj-popup with an oj-list-view; activating an entry marks it read and navigates to its route, and
// «Mark all read» marks them all. It talks to the usual app-level actions
// (_notifications-list / _notifications-read, route '' + the App's serverSideType).
//
// Undo (Message.undoable → MessageDto.undo*): oj-sp-messages-toast does not support actions, so
// those messages go out through JET's oj-messages (display="notification") with an oj-message whose
// «detail» slot — the one JET reserves for links and buttons — carries the «Undo» oj-button. It is mounted
// from applyDomEffects (outside Knockout: data-oj-binding-provider="none") and removed from the
// list of normal toasts, so no chain paints it twice.

/** The response's _notifications list (the server's Data), or null. */
export function notificationListOf(increment) {
  for (const fr of (increment && increment.fragments) || []) {
    if (fr && fr.data && Array.isArray(fr.data._notifications)) return fr.data._notifications
  }
  return null
}

let notificationsProviderFactory = null
export function setNotificationsProviderFactory(f) { notificationsProviderFactory = f }

/** The bell's model: unread ones (and their badge), and the entries ready for the list. */
export function notificationsOf(list) {
  const items = (list || []).map((n, i) => ({
    _rowNumber: i,
    id: String(n.id),
    title: n.title || '',
    text: n.text || '',
    when: n.when || '',
    route: n.route || '',
    unread: n.unread !== false,
    titleClass: 'oj-typography-body-md' + (n.unread !== false ? ' oj-typography-bold' : ''),
  }))
  const unread = items.filter((n) => n.unread).length
  return {
    enabled: true,
    unread,
    badge: unread > 9 ? '9+' : String(unread),
    hasUnread: unread > 0,
    label: unread ? chromeText('notificationsUnread', { n: unread }) : chromeText('notifications'),
    empty: items.length === 0,
    items,
    provider: notificationsProviderFactory ? notificationsProviderFactory(items) : null,
  }
}

// the inbox last listed from a shell SOURCE: "mark as read" acts on it locally (a source may have
// no markRead call, and the list a source answers is not re-asked for every click)
let sourcedInbox = []

/** Requests the list (or marks `ids` read — a list, or 'all' — and requests the list).
 *  A data-authored shell's `notifications.source` answers instead of the app-level actions
 *  (globalSearch.mjs shellSources): listed from the source, marked read LOCALLY at once and then
 *  through `markRead` when the shell declares it (re-listing after it; a failed call keeps the
 *  local read state until the next listing says otherwise). */
export async function fetchNotifications(base, serverSideType, appState, ids, opts = {}) {
  const sources = shellSourcesOf()
  if (sources.notifications) {
    const list = async () => {
      sourcedInbox = sourcedNotificationsOf(
        await runShellSource(base, serverSideType, appState, 'notifications', sources.notifications, {}, opts),
        sources.notifications)
    }
    if (!ids) {
      try { await list() } catch (e) { /* inbox unavailable: keep whatever list we had */ }
      return notificationsOf(sourcedInbox)
    }
    const all = ids === 'all'
    const which = all ? sourcedInbox.filter((n) => n.unread).map((n) => n.id) : [].concat(ids).map(String)
    sourcedInbox = sourcedInbox.map((n) => (which.includes(n.id) ? { ...n, unread: false } : n))
    if (sources.notificationsRead && which.length) {
      try {
        await runShellSource(base, serverSideType, appState, 'notificationsRead', sources.notificationsRead, markReadVars(which, all), opts)
        const local = sourcedInbox
        await list()
        // a source that does not persist the read state must not undo what the user just read
        sourcedInbox = sourcedInbox.map((n) => (local.some((l) => l.id === n.id && !l.unread) ? { ...n, unread: false } : n))
      } catch (e) { /* the server keeps them unread; the next listing says so */ }
    }
    return notificationsOf(sourcedInbox)
  }
  const increment = await callMateu(base, {
    route: '',
    actionId: ids ? '_notifications-read' : '_notifications-list',
    componentState: {},
    parameters: ids ? { ids } : {},
    serverSideType: serverSideType || undefined,
    appState: appState || {},
  })
  return notificationsOf(notificationListOf(increment) || [])
}

// ── toasts with «Undo» ─────────────────────────────────────────────────────────────────────────
let undoSink = null
export function setUndoSink(fn) { undoSink = typeof fn === 'function' ? fn : null }

/** Separates from the toasts those that can be undone (in place: the chains read the same list). */
export function takeUndoToasts(effects) {
  if (!effects || !Array.isArray(effects.toasts)) return []
  const undo = effects.toasts.filter((t) => t && t.undoActionId)
  if (undo.length) {
    const rest = effects.toasts.filter((t) => !(t && t.undoActionId))
    effects.toasts.splice(0, effects.toasts.length, ...rest)
  }
  return undo
}

/** An error or warning Message is NOT a toast in Redwood: oj-sp-messages-toast only supports
 *  type="acknowledgement" (confirmations). It goes to the shell's oj-sp-messages-banner as a
 *  VB notification (Actions.fireNotificationEvent → vbNotification → showNotificationMessage),
 *  persistent until closed. null for the rest, which remain toasts. */
export function bannerNotificationOf(toast) {
  // a PageBanner an action returned (the reducer turns it into a toast marked `banner`): always
  // the shell's message band, with its title AND description, until the user closes it
  if (toast && toast.banner) {
    return { summary: toast.text || '', message: toast.description || '', type: toast.variant || 'info', displayMode: 'persist' }
  }
  if (!toast || (toast.variant !== 'error' && toast.variant !== 'warning')) return null
  return { summary: toast.text || '', type: toast.variant, displayMode: 'persist' }
}

/** The oj-message message object for a toast with undo. */
export function undoMessageOf(toast) {
  return {
    severity: toast.variant === 'error' ? 'error' : toast.variant === 'warning' ? 'warning' : 'confirmation',
    summary: toast.text || '',
    // an ERROR stays until dismissed, in every renderer (owner, 2026-10-12)
    autoTimeout: toast.variant === 'error' ? 'off' : 10000,
    closeAffordance: 'defaults',
  }
}

export function showUndoToasts(toasts, doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || !toasts || !toasts.length) return
  let host = doc.getElementById('mateuUndoMessages')
  if (!host) {
    const wrap = doc.createElement('div')
    wrap.setAttribute('data-oj-binding-provider', 'none')
    host = doc.createElement('oj-messages')
    host.id = 'mateuUndoMessages'
    host.setAttribute('display', 'notification')
    host.setAttribute('position', '{"my": {"vertical": "bottom", "horizontal": "center"}, "at": {"vertical": "bottom", "horizontal": "center"}, "of": "window"}')
    wrap.appendChild(host)
    doc.body.appendChild(wrap)
  }
  for (const toast of toasts) {
    const msg = doc.createElement('oj-message')
    msg.message = undoMessageOf(toast)
    const detail = doc.createElement('div')
    detail.setAttribute('slot', 'detail')
    const button = doc.createElement('oj-button')
    button.setAttribute('chroming', 'borderless')
    button.className = 'mateu-undo-button'
    button.textContent = toast.undoLabel || chromeText('undo')
    button.addEventListener('ojAction', () => {
      if (undoSink) undoSink(toast.undoActionId, toast.undoParameters || {}, {})
      if (typeof msg.close === 'function') msg.close()
    })
    detail.appendChild(button)
    msg.appendChild(detail)
    // closed (by the user or by time), out of the DOM
    msg.addEventListener('ojClose', () => { if (msg.parentNode) msg.parentNode.removeChild(msg) })
    host.appendChild(msg)
  }
}
