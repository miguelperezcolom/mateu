import React from 'react'
import { AnchoredOverlay, IconButton } from '@kit'
import { BellIcon } from '@kit/icons'

/**
 * SLDS override of views/shell/header/BellButton.tsx: the bell is a global action of the Global
 * Header (`slds-global-actions__notifications`) with SLDS's notification badge.
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
    <span className="mateu-bell slds-dropdown-trigger slds-dropdown-trigger_click">
      <IconButton {...props} ref={anchor} icon={BellIcon} aria-label={label} size="small" variant="invisible"
        className={'slds-button_icon-container slds-global-actions__notifications slds-global-actions__item-action' + (unread > 0 ? ' slds-incoming-notification' : '')} />
      {unread > 0 && <span aria-hidden="true" className="slds-notification-badge slds-incoming-notification slds-show-notification">{unread > 99 ? '99+' : unread}</span>}
    </span>
  )
}
