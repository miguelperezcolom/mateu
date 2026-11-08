import { chromeText } from './i18n.mjs'
// OS-LEVEL NOTIFICATIONS (design/progress-and-notifications.md, "OS-level notifications"): an app
// that declares @App(osNotifications = true) (AppDto.osNotifications) may tell the user through the
// operating system — the Web Notifications API — about the two events worth leaving the app for:
// a NEW unread inbox entry and a task that finished (done / failed) in the background. Only while
// the tab is hidden; the permission is asked for ONLY from a user gesture (the "Notify me on this
// device" control of the bell's panel and of the task list), never on load.

let osNotificationsOn = false
let osNotificationNavigate = null

/** The app opted in (the shell sets it from the bootstrap App). */
export function setOsNotificationsEnabled(on) { osNotificationsOn = !!on }
export function osNotificationsEnabled() { return osNotificationsOn }
/** Where a click on a notification goes (the shell's safe in-app navigation). */
export function setOsNotificationNavigateSink(fn) { osNotificationNavigate = typeof fn === 'function' ? fn : null }

const osWindow = () => (typeof window !== 'undefined' ? window : globalThis)

/** 'unsupported' | 'default' | 'granted' | 'denied'. */
export function osNotificationPermission(win = osWindow()) {
  const N = win && win.Notification
  if (typeof N !== 'function') return 'unsupported'
  return N.permission || 'default'
}

/** Whether the "Notify me on this device" control shows: the app opted in and nothing was asked yet. */
export function offersOsNotifications(win = osWindow()) {
  return osNotificationsOn && osNotificationPermission(win) === 'default'
}

/** Asks for the permission (call it from a click only). Answers the resulting permission. */
export async function requestOsNotifications(win = osWindow()) {
  const N = win && win.Notification
  if (typeof N !== 'function' || typeof N.requestPermission !== 'function') return 'unsupported'
  try {
    const answer = await N.requestPermission()
    return answer || N.permission || 'default'
  } catch (e) {
    return N.permission || 'default'
  }
}

/** Shows `{ title, body, tag, route }` through the OS when the app opted in, the user granted it and
 *  the tab is hidden. Answers the Notification (or null). A click focuses the tab and opens the
 *  route through the shell's navigation. */
export function osNotify(note, { win = osWindow(), doc = typeof document !== 'undefined' ? document : null } = {}) {
  if (!note || !note.title || !osNotificationsOn) return null
  if (osNotificationPermission(win) !== 'granted') return null
  if (!doc || doc.visibilityState !== 'hidden') return null
  try {
    const n = new win.Notification(String(note.title), { body: note.body ? String(note.body) : '', tag: note.tag ? String(note.tag) : undefined })
    n.onclick = () => {
      try { if (win.focus) win.focus() } catch (e) { /* a focus refused by the browser */ }
      if (note.route && osNotificationNavigate) osNotificationNavigate(note.route)
      try { if (n.close) n.close() } catch (e) { /* already gone */ }
    }
    return n
  } catch (e) {
    return null
  }
}

/** The OS notification a task-center event deserves: a task that finished done/failed while it was
 *  in the background (non-blocking, or moved there). Pure. */
export function taskOsNotificationOf(event) {
  const t = event && event.task
  if (!t || event.kind !== 'finished' || !t.backgrounded) return null
  if (t.state !== 'done' && t.state !== 'failed') return null
  const route = t.state === 'done' ? ((t.resultActions || []).find((a) => a && a.route) || {}).route || null : null
  return {
    title: t.title || chromeText('tasks'),
    body: t.state === 'failed' ? (t.error || t.text || chromeText('taskFailed')) : (t.text || chromeText('taskDone')),
    tag: 'task-' + t.taskId,
    route,
  }
}

/** The OS notification a new inbox entry deserves (unread only). Pure. */
export function inboxOsNotificationOf(entry) {
  if (!entry || !entry.unread || !entry.title) return null
  return { title: entry.title, body: entry.text || '', tag: 'inbox-' + entry.id, route: entry.route || null }
}

/** The "Notify me on this device" control (an oj-button), or null when it has no business showing.
 *  `onChange` runs once the user answered (to repaint the panel without it). */
export function osNotifyControl(doc, onChange, win = osWindow()) {
  if (!doc || !offersOsNotifications(win)) return null
  const b = doc.createElement('oj-button')
  b.setAttribute('chroming', 'borderless')
  b.setAttribute('class', 'mateu-os-notify')
  b.textContent = chromeText('osNotifyEnable')
  b.addEventListener('ojAction', () => { requestOsNotifications(win).then(() => { if (onChange) onChange() }) })
  return b
}
