import React from 'react'
import { AnchoredOverlay, CounterLabel, IconButton } from '@kit'
import { BellIcon } from '@kit/icons'

/**
 * The bell's trigger: an icon button with the unread count. The design system's header markup
 * (SLDS: the global action with its notification badge) is what a renderer overrides here; the
 * inbox panel stays shared.
 */
/** What the overlay hands its anchor (ids, aria, handlers). */
type AnchorProps = Parameters<NonNullable<React.ComponentProps<typeof AnchoredOverlay>['renderAnchor']>>[0]

export function BellButton({ props, anchor, label, unread }: {
  props: AnchorProps
  anchor: React.Ref<HTMLButtonElement>
  label: string
  unread: number
}) {
  return (
    <span className="mateu-bell">
      <IconButton {...props} ref={anchor} icon={BellIcon} aria-label={label} size="small" variant="invisible" />
      {unread > 0 && <CounterLabel scheme="primary" className="mateu-bell-count" aria-hidden="true">{unread > 99 ? '99+' : unread}</CounterLabel>}
    </span>
  )
}
