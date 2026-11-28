import React, { useRef } from 'react'
import { AnchoredOverlay, Button, IconButton, SegmentedControl, Text } from '@kit'
import { BellIcon, XIcon } from '@kit/icons'
import type { MateuSession, NavTarget } from '@rn/core/MateuSession'
import type { AppTarget } from '@mr/shell/appLevel'
import { INBOX_FILTERS, useInbox } from '@mr/shell/inbox'
import { tx } from '@mr/i18n/texts'
import { BellButton } from './BellButton'

type Dict = Record<string, unknown>

/** The notification inbox as a Primer bell with the unread count, opening a panel (the inbox itself is shared: useInbox). */
export function NotificationBell({ session, app, onNavigate }: { session: MateuSession; app: AppTarget & Dict; onNavigate: (t: NavTarget) => void }) {
  const inbox = useInbox(session, app, onNavigate)
  const { open, setOpen, filter, setFilter, expanded, items, unread, groups, label, pressed, act, dismiss, markRead, osNotifications, notify } = inbox
  const anchor = useRef<HTMLButtonElement>(null)

  return (
    <AnchoredOverlay
      open={open}
      onOpen={inbox.openPanel}
      onClose={() => setOpen(false)}
      anchorRef={anchor}
      renderAnchor={(props) => (
        <BellButton props={props} anchor={anchor} label={label} unread={unread} />
      )}
      overlayProps={{ role: 'dialog', 'aria-label': tx('notifications'), width: 'large' } as never}
      focusZoneSettings={{ disabled: true }}
    >
      <div className="mateu-inbox">
        <div className="mateu-inbox-head">
          <Text weight="semibold">{tx('notifications')}</Text>
          <SegmentedControl aria-label={tx('notificationFilters')} size="small" onChange={(i) => setFilter(INBOX_FILTERS[i].id)}>
            {INBOX_FILTERS.map((f) => <SegmentedControl.Button key={f.id} selected={filter === f.id}>{tx(f.label)}</SegmentedControl.Button>)}
          </SegmentedControl>
        </div>
        <div className="mateu-inbox-list">
          {groups.length === 0 && <Text as="p" className="mateu-inbox-empty">{tx('noNotifications')}</Text>}
          {groups.map((g) => (
            <section key={g.category || '_'} aria-label={g.category || tx('notifications')}>
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
                    <IconButton icon={XIcon} size="small" variant="invisible" aria-label={tx('notificationDismissOf', { title: n.title })} onClick={() => void dismiss(n)} />
                    {!n.resolved && (n.actions ?? []).length > 0 && (
                      <div className="mateu-inbox-actions">
                        {(n.actions ?? []).map((a, i) => (
                          <Button key={`${a.actionId ?? a.route ?? ''}#${i}`} size="small"
                            variant={a.style === 'primary' ? 'primary' : a.style === 'danger' ? 'danger' : 'default'}
                            onClick={() => void act(n, a)}>{a.label || (a.style === 'undo' ? tx('undo') : '')}</Button>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        {(items.length > 0 || (osNotifications && notify.permission === 'undetermined')) && (
          <div className="mateu-inbox-foot">
            {osNotifications && notify.permission === 'undetermined' && (
              <Button size="small" variant="invisible" leadingVisual={BellIcon} onClick={notify.ask}>{tx('osNotificationsEnable')}</Button>
            )}
            {items.length > 0 && <Button size="small" variant="invisible" disabled={unread === 0} onClick={() => void markRead('all')}>{tx('markAllRead')}</Button>}
          </div>
        )}
      </div>
    </AnchoredOverlay>
  )
}
