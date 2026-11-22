import { useEffect, useRef, useState } from 'react'
import type { MateuSession, NavTarget } from '@rn/core/MateuSession'
import { setLocalNotifier, wireOsNotifications, type LocalNotifier, type NotificationPermission } from '@rn/core/osNotifications'

/**
 * OS-level notifications on the web (@App(osNotifications)): the RN core's rule — a NEW unread
 * inbox entry or a background task that finished, posted ONLY while the tab is not in front,
 * permission asked only from the user's click — with the browser's Notification API as the
 * LocalNotifier port. Nothing leaves the browser (no push service).
 */
const supported = () => typeof window !== 'undefined' && 'Notification' in window && window.isSecureContext !== false

const mapped = (p: string): NotificationPermission => (p === 'granted' ? 'granted' : p === 'denied' ? 'denied' : 'undetermined')

const opened = new Set<(n: { route?: string | null; scope: string }) => void>()

export const webNotifier: LocalNotifier = {
  permission: async () => (supported() ? mapped(Notification.permission) : 'unavailable'),
  request: async () => (supported() ? mapped(await Notification.requestPermission()) : 'unavailable'),
  show: async (n) => {
    if (!supported() || Notification.permission !== 'granted') return
    const shown = new Notification(n.title, { body: n.body, tag: n.id })
    shown.onclick = () => {
      window.focus()
      shown.close()
      opened.forEach((l) => l({ route: n.route, scope: n.scope }))
    }
  },
  onOpened: (listener) => {
    opened.add(listener)
    return () => { opened.delete(listener) }
  },
}

/** Wires the session's notifications while the app opted in; a click on one opens its route. */
export function useOsNotifications(session: MateuSession, enabled: boolean, onNavigate: (t: NavTarget) => void) {
  const navigate = useRef(onNavigate)
  navigate.current = onNavigate
  useEffect(() => {
    session.osNotifications = enabled
    if (!enabled) return undefined
    setLocalNotifier(webNotifier)
    const off = wireOsNotifications(session, () => document.visibilityState === 'visible' && document.hasFocus())
    const offOpen = webNotifier.onOpened((n) => {
      if (n.scope === session.api.baseUrl && n.route) navigate.current({ label: '', route: n.route, consumedRoute: '', serverSideType: '' })
    })
    return () => { off(); offOpen() }
  }, [session, enabled])
}

/** The permission, and the user's way to grant it ("Notify me on this device"). */
export function useNotifyPermission(): { permission: NotificationPermission; ask: () => void } {
  const [permission, setPermission] = useState<NotificationPermission>(() => (supported() ? mapped(Notification.permission) : 'unavailable'))
  return { permission, ask: () => void webNotifier.request().then(setPermission) }
}
