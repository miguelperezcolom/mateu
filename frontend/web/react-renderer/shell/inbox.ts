import { useCallback, useEffect, useState } from 'react'
import type { MateuSession, NavTarget } from '@rn/core/MateuSession'
import { filtered, grouped, inboxItemOf, unreadCount, type InboxAction, type InboxFilter, type InboxItem } from '@rn/core/inbox'
import { markReadVars, notificationsOf, runAppSource } from '@rn/core/appSources'
import { answerData, applyAppAnswer, runAppLevel, type AppTarget } from './appLevel'
import { useNotifyPermission, useOsNotifications } from './osNotifications'
import { tx, type TextKey } from '../i18n/texts'

type Dict = Record<string, unknown>

/** The inbox's filters, in the bell's order. */
export const INBOX_FILTERS: { id: InboxFilter; label: TextKey }[] = [
  { id: 'unread', label: 'notificationFilterUnread' },
  { id: 'all', label: 'notificationFilterAll' },
  { id: 'resolved', label: 'notificationFilterResolved' },
]

/**
 * The notification inbox (App.notificationsEnabled), without the drawing: the entries grouped by
 * category — the app-level `_notifications-*` actions (or the shell's REST sources), the session's
 * own entries and what the live stream pushes, all through the RN core's InboxStore. An entry
 * opens its detail, goes to its route or unfolds (`pressed`); its actions run server-side (`act`).
 */
export function useInbox(session: MateuSession, app: AppTarget & Dict, onNavigate: (t: NavTarget) => void) {
  const osNotifications = app['osNotifications'] === true
  useOsNotifications(session, osNotifications, onNavigate)
  const notify = useNotifyPermission()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<InboxFilter>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [, setRevision] = useState(0)
  const source = (app['notificationsSource'] as Dict | null | undefined) ?? undefined
  const readSource = (app['notificationsReadSource'] as Dict | null | undefined) ?? undefined
  const host = () => ({ api: session.api as never, sources: session.sources, appState: session.appState, rootRoute: app.rootRoute, serverSideType: app.serverSideType ?? null })

  const takeList = useCallback((increment: unknown) => {
    const list = answerData(increment, '_notifications')
    if (Array.isArray(list)) session.inbox.setServer(list.map(inboxItemOf).filter((i): i is InboxItem => !!i))
  }, [session])

  const refresh = useCallback(async () => {
    try {
      if (source) {
        const json = await runAppSource(host(), 'notifications', source, {})
        session.inbox.setServer(notificationsOf(json, source, session.sources).map(inboxItemOf).filter((i): i is InboxItem => !!i))
        return
      }
      takeList(await runAppLevel(session, app, '_notifications-list', {}, 'notification-bell'))
    } catch {
      // inbox unavailable: keep the list we had
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, app, source, takeList])

  useEffect(() => {
    void refresh()
    const off = session.inbox.subscribe((change) => {
      setRevision((r) => r + 1)
      if (change?.kind === 'refetch') void refresh()
    })
    // what arrived while the tab was hidden is only on the server
    const onVisible = () => { if (document.visibilityState === 'visible') void refresh() }
    document.addEventListener('visibilitychange', onVisible)
    return () => { off(); document.removeEventListener('visibilitychange', onVisible) }
  }, [refresh, session])

  const go = (route: string, label = '') => {
    setOpen(false)
    onNavigate({ label, route, consumedRoute: '', serverSideType: '' })
  }

  /** An inbox answer: its list, then what else it brings (a detail overlay, messages, a navigation). */
  const apply = (answer: unknown) => {
    takeList(answer)
    const nav = ((answer as Dict | null)?.['commands'] as Dict[] | undefined)?.find((c) => c['type'] === 'NavigateTo' && typeof c['data'] === 'string')
    if (nav) setOpen(false)
    applyAppAnswer(session, answer)
  }

  const markRead = async (ids: string[] | 'all') => {
    const local = new Set(session.inbox.items().filter((i) => i.local).map((i) => i.id))
    session.inbox.markRead(ids)
    const serverIds = ids === 'all' ? ids : ids.filter((id) => !local.has(id))
    if (serverIds !== 'all' && serverIds.length === 0) return
    try {
      if (source) {
        const all = ids === 'all'
        if (readSource) await runAppSource(host(), 'notificationsRead', readSource, markReadVars(all ? session.inbox.items().map((n) => n.id) : serverIds as string[], all))
        return
      }
      takeList(await runAppLevel(session, app, '_notifications-read', { ids: serverIds }, 'notification-bell'))
    } catch {
      // read here; the server keeps its state
    }
  }

  const dismiss = async (item: InboxItem) => {
    session.inbox.dismiss([item.id])
    if (item.local || source) return
    try {
      takeList(await runAppLevel(session, app, '_notifications-dismiss', { ids: [item.id] }, 'notification-bell'))
    } catch { /* dismissed here */ }
  }

  const act = async (item: InboxItem, action: InboxAction) => {
    if (item.local) {
      if (item.unread) session.inbox.markRead([item.id])
      item.run?.(action)
      return
    }
    if (action.route && !action.actionId) return go(action.route, action.label ?? '')
    try {
      apply(await runAppLevel(session, app, '_notifications-act', { id: item.id, actionId: action.actionId }, 'notification-bell'))
    } catch (e) {
      session.notify(null, `The action failed: ${(e as Error)?.message ?? e}`, 'error')
    }
  }

  const pressed = async (n: InboxItem) => {
    if (n.unread) await markRead([n.id])
    if (n.hasDetail && !n.local) {
      setOpen(false)
      try { apply(await runAppLevel(session, app, '_notifications-open', { id: n.id }, 'notification-bell')) } catch { /* no detail */ }
      return
    }
    if (n.route) return go(n.route, n.title)
    setExpanded((e) => (e === n.id ? null : n.id))
  }

  const items = session.inbox.items()
  const unread = unreadCount(items)
  const groups = grouped(filtered(items, filter))
  const label = unread > 0 ? tx('notificationsUnread', { count: unread }) : tx('notifications')
  const openPanel = () => { setOpen(true); void refresh() }

  return {
    open, setOpen, openPanel, filter, setFilter, expanded, items, unread, groups, label,
    pressed, act, dismiss, markRead, osNotifications, notify,
  }
}
