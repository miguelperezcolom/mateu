import React, { useEffect, useImperativeHandle } from 'react'
import {
  Bar, Button, NotificationList, NotificationListGroupItem, NotificationListItem, ResponsivePopover, SegmentedButton, SegmentedButtonItem, Title,
} from '@ui5/webcomponents-react'
import { INBOX_FILTERS, useInbox } from '@mr/shell/inbox'
import type { MateuSession, NavTarget } from '@rn/core/MateuSession'
import type { AppTarget } from '@mr/shell/appLevel'
import { tx } from '@mr/i18n/texts'

type Inbox = ReturnType<typeof useInbox>

export interface InboxHandle { open: () => void }

/**
 * The inbox of an app with notifications (`notificationsEnabled`): mounted only then, so an app
 * without them never asks for its list. Its unread count goes to the shell bar's button; the shell
 * opens it from that button (`open`).
 */
export const NotificationInbox = React.forwardRef<InboxHandle, { session: MateuSession; app: AppTarget & Record<string, unknown>; onNavigate: (t: NavTarget) => void; opener: HTMLElement | null; onUnread: (n: number) => void }>(
  function NotificationInbox({ session, app, onNavigate, opener, onUnread }, ref) {
    const inbox = useInbox(session, app, onNavigate)
    useImperativeHandle(ref, () => ({ open: inbox.openPanel }), [inbox.openPanel])
    useEffect(() => onUnread(inbox.unread), [inbox.unread, onUnread])
    return <NotificationPanel inbox={inbox} opener={opener} />
  },
)

/**
 * The notification inbox in Fiori's grammar: the shell bar's own notifications button (its count is
 * the unread count, AppShell) opens a popover with Fiori's notification list — grouped by category,
 * read/unread, each entry closable and carrying its actions. The inbox itself is shared (useInbox).
 */
export function NotificationPanel({ inbox, opener }: { inbox: Inbox; opener: HTMLElement | null }) {
  const { open, setOpen, filter, setFilter, items, unread, groups, pressed, act, dismiss, markRead, osNotifications, notify } = inbox
  const byId = new Map(items.map((n) => [n.id, n]))
  const entry = (n: (typeof items)[number]) => (
    <NotificationListItem key={n.id} data-id={n.id} titleText={n.title} read={!n.unread || undefined} showClose wrappingType="Normal"
      state={n.variant === 'error' ? 'Negative' : n.variant === 'warning' ? 'Critical' : n.variant === 'success' ? 'Positive' : 'None'}
      footnotes={n.when ? <span slot="footnotes">{n.when}</span> : undefined}>
      {n.text}
      {!n.resolved && (n.actions ?? []).length > 0 && (
        <div className="mateu-inbox-actions">
          {(n.actions ?? []).map((a, i) => (
            <Button key={`${a.actionId ?? a.route ?? ''}#${i}`} design={a.style === 'primary' ? 'Emphasized' : a.style === 'danger' ? 'Negative' : 'Default'}
              onClick={(e: Event) => { e.stopPropagation(); void act(n, a) }}>{a.label || (a.style === 'undo' ? tx('undo') : '')}</Button>
          ))}
        </div>
      )}
    </NotificationListItem>
  )
  return (
    <ResponsivePopover opener={opener ?? undefined} open={open && !!opener} placement="Bottom" horizontalAlign="End" accessibleName={tx('notifications')}
      onClose={() => setOpen(false)} style={{ width: 'min(28rem, 100vw)' }}
      header={(
        <Bar slot="header" startContent={<Title level="H2" size="H5">{tx('notifications')}</Title>}
          endContent={(
            <SegmentedButton accessibleName={tx('notificationFilters')}
              onSelectionChange={(e: CustomEvent<{ selectedItems?: HTMLElement[] }>) => {
                const id = e.detail.selectedItems?.[0]?.getAttribute('data-filter')
                const f = INBOX_FILTERS.find((x) => x.id === id)
                if (f) setFilter(f.id)
              }}>
              {INBOX_FILTERS.map((f) => <SegmentedButtonItem key={f.id} data-filter={f.id} selected={filter === f.id || undefined}>{tx(f.label)}</SegmentedButtonItem>)}
            </SegmentedButton>
          )} />
      )}
      footer={(items.length > 0 || (osNotifications && notify.permission === 'undetermined')) ? (
        <Bar slot="footer" design="Footer" endContent={(
          <>
            {osNotifications && notify.permission === 'undetermined' && <Button design="Transparent" icon="bell" onClick={notify.ask}>{tx('osNotificationsEnable')}</Button>}
            {items.length > 0 && <Button design="Transparent" disabled={unread === 0 || undefined} onClick={() => void markRead('all')}>{tx('markAllRead')}</Button>}
          </>
        )} />
      ) : undefined}>
      <NotificationList noDataText={tx('noNotifications')}
        onItemClick={(e: CustomEvent<{ item: HTMLElement }>) => { const n = byId.get(e.detail.item.getAttribute('data-id') ?? ''); if (n) void pressed(n) }}
        onItemClose={(e: CustomEvent<{ item: HTMLElement }>) => { const n = byId.get(e.detail.item.getAttribute('data-id') ?? ''); if (n) void dismiss(n) }}>
        {groups.map((g) => (g.category
          ? <NotificationListGroupItem key={g.category} titleText={g.category}>{g.items.map(entry)}</NotificationListGroupItem>
          : <React.Fragment key="_">{g.items.map(entry)}</React.Fragment>))}
      </NotificationList>
    </ResponsivePopover>
  )
}
