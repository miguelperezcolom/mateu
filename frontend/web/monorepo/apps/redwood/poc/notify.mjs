import { callMateu } from './transport.mjs'
import { chromeText } from './i18n.mjs'
import { dismissBanner } from './reduceContexts.mjs'
import { markReadVars, runShellSource, shellSourcesOf, sourcedNotificationsOf } from './globalSearch.mjs'
import { adoptServerList, markReadLocally, sessionIdsOf, inboxModelOf, withServerList, createInbox, setInboxProviderFactory } from './inbox.mjs'
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

export function setNotificationsProviderFactory(f) { setInboxProviderFactory(f) }

/** The bell's model for a list (inbox.mjs inboxModelOf): unread ones (and their badge), the entries
 *  ready for the panel, grouped by category, with the filters. */
export function notificationsOf(list) {
  return inboxModelOf(withServerList(createInbox(), list))
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
      return adoptServerList(sourcedInbox)
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
    return adoptServerList(sourcedInbox)
  }
  // the session's own entries (an `inbox` message…) are read here: the server does not know them
  const sessionIds = ids ? sessionIdsOf(ids) : []
  if (sessionIds.length) markReadLocally(sessionIds)
  const serverIds = ids === 'all' ? 'all' : ids ? [].concat(ids).map(String).filter((id) => !sessionIds.includes(id)) : null
  if (ids && serverIds !== 'all' && !serverIds.length) return markReadLocally([])
  const increment = await callMateu(base, {
    route: '',
    actionId: serverIds ? '_notifications-read' : '_notifications-list',
    componentState: {},
    parameters: serverIds ? { ids: serverIds } : {},
    serverSideType: serverSideType || undefined,
    appState: appState || {},
  })
  const listed = notificationListOf(increment)
  return listed ? adoptServerList(listed) : markReadLocally([])
}

// ── toasts with actions («Undo», «Open»…), sticky ones, deduplicated ones ───────────────────────
let undoSink = null
export function setUndoSink(fn) { undoSink = typeof fn === 'function' ? fn : null }
let toastNavigateSink = null
/** Where a toast action with a `route` navigates. */
export function setToastNavigateSink(fn) { toastNavigateSink = typeof fn === 'function' ? fn : null }

/** A toast that needs JET's oj-message (which can hold buttons and stay): it offers actions, it is
 *  sticky, or it carries a key (the same key replaces the one on screen). An error or a warning
 *  with nothing to act on goes to the shell's message band, which already stays until closed. */
export function isActionToast(t) {
  if (!t || t.banner) return false
  if ((t.actions && t.actions.length) || t.undoActionId) return true
  if (t.variant === 'error' || t.variant === 'warning') return false
  return !!t.key || t.persistence === 'sticky'
}

/** Separates from the toasts those that need oj-message (in place: the chains read the same list). */
export function takeUndoToasts(effects) {
  if (!effects || !Array.isArray(effects.toasts)) return []
  const undo = effects.toasts.filter(isActionToast)
  if (undo.length) {
    const rest = effects.toasts.filter((t) => !isActionToast(t))
    effects.toasts.splice(0, effects.toasts.length, ...rest)
  }
  return undo
}
export const takeActionToasts = takeUndoToasts

/** The toasts with persistence `inbox`: they also land in the session's inbox (inbox.mjs). */
export function inboxToastsOf(effects) {
  return ((effects && effects.toasts) || []).filter((t) => t && t.persistence === 'inbox')
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

/** The shortest time a toast with an action stays, in ms (WCAG 2.2.1 — libs/mateu ACTIONABLE_TOAST_MIN_MS). */
export const ACTION_TOAST_MIN_MS = 10000
/** The least time a resumed toast gets before it closes (libs/mateu dismissTimer RESUME_MIN_MS). */
export const TOAST_RESUME_MIN_MS = 2000

/** How long a toast with actions stays, in ms; 0 = until the user closes it. An ERROR stays until
 *  dismissed, in every renderer (owner, 2026-10-12); so does a sticky one. A declared duration
 *  shorter than ACTION_TOAST_MIN_MS is raised to it: the action must stay reachable. */
export function toastLifetimeOf(toast) {
  if (toast.variant === 'error' || toast.persistence === 'sticky') return 0
  return Math.max(toast.duration > 0 ? toast.duration : 0, ACTION_TOAST_MIN_MS)
}

/** The oj-message message object for a toast with actions. JET's own autoTimeout cannot pause, so
 *  it is always 'off' and the toast closes on pausableToastClose's clock (showUndoToasts). */
export function undoMessageOf(toast) {
  return {
    severity: toast.variant === 'error' ? 'error' : toast.variant === 'warning' ? 'warning' : 'confirmation',
    summary: toast.title || toast.text || '',
    ...(toast.title && toast.text ? { detail: toast.text } : {}),
    autoTimeout: 'off',
    closeAffordance: 'defaults',
  }
}

/**
 * Closes a toast after `ms` of it being on screen and NOT hovered, focused or in a hidden page
 * (WCAG 2.2.1 Timing Adjustable — the twin of libs/mateu infra/notify/dismissTimer.ts): the clock
 * stops while the user is with the toast and resumes with what was left, never less than
 * TOAST_RESUME_MIN_MS. `ms <= 0` never closes. Returns a cancel function.
 */
export function pausableToastClose(el, ms, close, doc = el && el.ownerDocument) {
  if (!el || !(ms > 0)) return () => {}
  let remaining = ms
  let startedAt = 0
  let timer = null
  let hovered = false
  let focused = false
  let done = false
  const hidden = () => !!doc && doc.visibilityState === 'hidden'
  const stop = () => {
    if (timer === null) return
    clearTimeout(timer)
    timer = null
    remaining -= Date.now() - startedAt
  }
  const start = (atLeast) => {
    if (done || timer !== null || hovered || focused || hidden()) return
    remaining = Math.max(remaining, atLeast || 0)
    startedAt = Date.now()
    timer = setTimeout(() => { timer = null; cancel(); close() }, Math.max(0, remaining))
  }
  const resume = () => start(TOAST_RESUME_MIN_MS)
  const onEnter = () => { hovered = true; stop() }
  const onLeave = () => { hovered = false; resume() }
  const onFocusIn = () => { focused = true; stop() }
  const onFocusOut = (e) => {
    if (e && e.relatedTarget && el.contains(e.relatedTarget)) return
    focused = false
    resume()
  }
  const onVisibility = () => { if (hidden()) stop(); else resume() }
  el.addEventListener('mouseenter', onEnter)
  el.addEventListener('mouseleave', onLeave)
  el.addEventListener('focusin', onFocusIn)
  el.addEventListener('focusout', onFocusOut)
  if (doc) doc.addEventListener('visibilitychange', onVisibility)
  function cancel() {
    done = true
    if (timer !== null) clearTimeout(timer)
    timer = null
    el.removeEventListener('mouseenter', onEnter)
    el.removeEventListener('mouseleave', onLeave)
    el.removeEventListener('focusin', onFocusIn)
    el.removeEventListener('focusout', onFocusOut)
    if (doc) doc.removeEventListener('visibilitychange', onVisibility)
  }
  start(0)
  return cancel
}

/** The actions a toast offers (its `actions`, else its legacy undo). */
export function toastActionsOf(toast) {
  if (toast.actions && toast.actions.length) return toast.actions
  return toast.undoActionId ? [{ label: toast.undoLabel || '', actionId: toast.undoActionId, parameters: toast.undoParameters || {}, route: '', style: 'undo' }] : []
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
    // the same key replaces the message on screen instead of stacking another one
    if (toast.key) {
      for (const old of host.querySelectorAll('oj-message')) {
        if (old.getAttribute('data-key') === toast.key) old.remove()
      }
    }
    const msg = doc.createElement('oj-message')
    if (toast.key) msg.setAttribute('data-key', toast.key)
    msg.message = undoMessageOf(toast)
    const actions = toastActionsOf(toast)
    if (actions.length) {
      const detail = doc.createElement('div')
      detail.setAttribute('slot', 'detail')
      if (toast.title && toast.text) {
        const text = doc.createElement('div')
        text.className = 'oj-typography-body-sm'
        text.textContent = toast.text
        detail.appendChild(text)
      }
      for (const action of actions) {
        const button = doc.createElement('oj-button')
        button.setAttribute('chroming', 'borderless')
        button.className = action.style === 'undo' ? 'mateu-undo-button' : 'mateu-toast-action'
        button.textContent = action.label || (action.style === 'undo' ? chromeText('undo') : action.actionId || action.route)
        button.addEventListener('ojAction', () => {
          if (action.route) { if (toastNavigateSink) toastNavigateSink(action.route) } else if (undoSink) undoSink(action.actionId, action.parameters || {}, {})
          if (typeof msg.close === 'function') msg.close()
        })
        detail.appendChild(button)
      }
      msg.appendChild(detail)
    }
    // closed by time on a clock that stops while hovered or focused (pausableToastClose)
    const stopClock = pausableToastClose(msg, toastLifetimeOf(toast), () => {
      if (typeof msg.close === 'function') msg.close()
      else if (msg.parentNode && typeof msg.parentNode.removeChild === 'function') msg.parentNode.removeChild(msg)
    }, doc)
    // closed (by the user or by time), out of the DOM
    msg.addEventListener('ojClose', () => { stopClock(); if (msg.parentNode) msg.parentNode.removeChild(msg) })
    host.appendChild(msg)
  }
}

/**
 * An island page's banners (content.mjs, isIslandBanner): a click on a closeable one's ✕ dismisses
 * it, and one with a timeout dismisses itself after it — both remembered (dismissBanner), so a
 * re-projection does not bring it back. Listened at document level (the banner is drawn by a
 * template, in any surface's hole).
 */
export function installBannerDismissal(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuBannerDismissal) return
  doc.__mateuBannerDismissal = true
  const hide = (el) => {
    if (!el) return
    dismissBanner(el.getAttribute('data-mateu-banner'))
    el.hidden = true
    el.style.display = 'none'
  }
  doc.addEventListener('click', (e) => {
    const close = e.target && e.target.closest ? e.target.closest('[data-mateu-banner-close]') : null
    if (close) hide(close.closest('[data-mateu-banner]'))
  }, true)
  const timed = new WeakSet()
  const arm = () => {
    for (const el of doc.querySelectorAll('[data-mateu-banner-timeout]')) {
      const ms = Number(el.getAttribute('data-mateu-banner-timeout'))
      if (!(ms > 0) || timed.has(el)) continue
      timed.add(el)
      setTimeout(() => hide(el), ms)
    }
  }
  const View = doc.defaultView
  if (View && View.MutationObserver && doc.body) new View.MutationObserver(arm).observe(doc.body, { childList: true, subtree: true })
  arm()
}
