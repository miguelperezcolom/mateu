import React, { useRef } from 'react'
import { Dialog, Text } from '@kit'
import type { MateuSession } from '@rn/core/MateuSession'
import type { AppMetaLike } from '@mr/shell/appActions'
import { useIdleSession } from '@mr/shell/idle'
import { tx } from '@mr/i18n/texts'

/** The idle-session warning as Primer's alertdialog (the clock and its rules are shared: useIdleSession). */
export function IdleWarning({ session, app }: { session: MateuSession; app: AppMetaLike }) {
  const idle = useIdleSession(session, app)
  const stayRef = useRef<HTMLButtonElement>(null)
  if (!idle.enabled || (idle.phase !== 'warning' && !idle.signingOut)) return null
  return (
    <Dialog
      role="alertdialog"
      title={tx('idleTitle')}
      onClose={idle.stay}
      footerButtons={idle.signingOut ? [] : [
        { content: tx('idleSignOut'), onClick: idle.signOut },
        { content: tx('idleStay'), buttonType: 'primary', onClick: idle.stay, autoFocus: true, ref: stayRef },
      ]}
    >
      <Text as="p" aria-live="off">
        {idle.signingOut ? tx('idleSigningOut') : tx('idleMessage', { seconds: idle.secondsLeft })}
      </Text>
    </Dialog>
  )
}
