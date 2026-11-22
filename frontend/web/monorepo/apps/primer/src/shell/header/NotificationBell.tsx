import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnchoredOverlay, Button, CounterLabel, IconButton, SegmentedControl, Text } from '@primer/react'
import { BellIcon, XIcon } from '@primer/octicons-react'
import type { MateuSession, NavTarget } from '@rn/core/MateuSession'
import { filtered, grouped, inboxItemOf, unreadCount, type InboxAction, type InboxFilter, type InboxItem } from '@rn/core/inbox'
import { markReadVars, notificationsOf, runAppSource } from '@rn/core/appSources'
import { answerData, applyAppAnswer, runAppLevel, type AppTarget } from './appLevel'

type Dict = Record<string, unknown>

const FILTERS: { id: InboxFilter; label: string }[] = [
  { id: 'unread', label: 'Unread' },
  { id: 'all', label: 'All' },
  { id: 'resolved', label: 'Resolved' },
]

/**
 * The notification inbox (App.notificationsEnabled): a bell with the unread count opening a panel of
 * the entries grouped by category — the app-level `_notifications-*` actions (or the shell's REST
 * sources), the session's own entries and what the live stream pushes, all through the RN core's
 * InboxStore. An entry opens its detail, goes to its route or unfolds; its actions run server-side.
 */
export function NotificationBell({ session, app, onNavigate }: { session: MateuSession; app: AppTarget & Dict; onNavigate: (t: NavTarget) => void }) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<InboxFilter>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [, setRevision] = useState(0)
  const anchor = useRef<HTMLButtonElement>(null)
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
  const label = unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'

  return (
    <AnchoredOverlay
      open={open}
      onOpen={() => { setOpen(true); void refresh() }}
      onClose={() => setOpen(false)}
      anchorRef={anchor}
      renderAnchor={(props) => (
        <span className="mateu-bell">
          <IconButton {...props} ref={anchor} icon={BellIcon} aria-label={label} size="small" variant="invisible" />
          {unread > 0 && <CounterLabel scheme="primary" className="mateu-bell-count" aria-hidden="true">{unread > 99 ? '99+' : unread}</CounterLabel>}
        </span>
      )}
      overlayProps={{ role: 'dialog', 'aria-label': 'Notifications', width: 'large' } as never}
      focusZoneSettings={{ disabled: true }}
    >
      <div className="mateu-inbox">
        <div className="mateu-inbox-head">
          <Text weight="semibold">Notifications</Text>
          <SegmentedControl aria-label="Show" size="small" onChange={(i) => setFilter(FILTERS[i].id)}>
            {FILTERS.map((f) => <SegmentedControl.Button key={f.id} selected={filter === f.id}>{f.label}</SegmentedControl.Button>)}
          </SegmentedControl>
        </div>
        <div className="mateu-inbox-list">
          {groups.length === 0 && <Text as="p" className="mateu-inbox-empty">No notifications</Text>}
          {groups.map((g) => (
            <section key={g.category || '_'} aria-label={g.category || 'Notifications'}>
              {!!g.category && <h3 className="mateu-inbox-category">{g.category}</h3>}
              <ul className="mateu-inbox-items">
                {g.items.map((n) => (
                  <li key={n.id} className={'mateu-inbox-item' + (n.unread ? ' is-unread' : '')}>
                    <button type="button" className="mateu-inbox-entry" onClick={() => void pressed(n)}
                      aria-label={`${n.title}${n.unread ? ', unread' : ''}${n.resolved ? ', resolved' : ''}${n.when ? `, ${n.when}` : ''}`}>
                      <span className={'mateu-inbox-dot' + (n.unread ? ' on' : '') + (n.variant === 'error' ? ' error' : '')} aria-hidden="true" />
                      <span className="mateu-inbox-body">
                        <span className="mateu-inbox-top">
                          <span className="mateu-inbox-title">{n.title}</span>
                          {!!n.when && <span className="mateu-inbox-when">{n.when}</span>}
                        </span>
                        {!!n.text && <span className={'mateu-inbox-text' + (expanded === n.id ? ' expanded' : '')}>{n.text}</span>}
                      </span>
                    </button>
                    <IconButton icon={XIcon} size="small" variant="invisible" aria-label={`Dismiss ${n.title}`} onClick={() => void dismiss(n)} />
                    {!n.resolved && (n.actions ?? []).length > 0 && (
                      <div className="mateu-inbox-actions">
                        {(n.actions ?? []).map((a, i) => (
                          <Button key={`${a.actionId ?? a.route ?? ''}#${i}`} size="small"
                            variant={a.style === 'primary' ? 'primary' : a.style === 'danger' ? 'danger' : 'default'}
                            onClick={() => void act(n, a)}>{a.label || (a.style === 'undo' ? 'Undo' : '')}</Button>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        {items.length > 0 && (
          <div className="mateu-inbox-foot">
            <Button size="small" variant="invisible" disabled={unread === 0} onClick={() => void markRead('all')}>Mark all read</Button>
          </div>
        )}
      </div>
    </AnchoredOverlay>
  )
}
