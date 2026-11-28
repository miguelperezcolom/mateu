import React from 'react'
import { BusyIndicator } from '@ui5/webcomponents-react'
import type { MateuSession } from '@rn/core/MateuSession'
import { useBusyIndicator, useConnectivityStatus, usePressedControls } from '@mr/resilience/useResilience'
import { BUTTONISH } from '@mr/resilience/pressedControl'
import '@mr/views/shell/resilience/resilience.css'
import { tx } from '@mr/i18n/texts'

/** A slow or broken connection in the SAP renderer: a thin progress bar on top, the connectivity strip, the pressed control pulsing. */
export function Resilience({ session }: { session: MateuSession }) {
  // UI5's buttons are custom elements: the button role lives in their shadow root
  usePressedControls(session, `${BUTTONISH}, ui5-button, ui5-toolbar-button, ui5-shellbar-item, ui5-menu-item, ui5-li, ui5-link`)
  return (
    <>
      <BusyBar session={session} />
      <ConnectivityBanner />
    </>
  )
}

function BusyBar({ session }: { session: MateuSession }) {
  if (!useBusyIndicator(session)) return null
  return (
    <div className="mateu-busy-bar" role="progressbar" aria-label={tx('waitingForServer')} aria-busy="true">
      <BusyIndicator active size="S" delay={0} />
    </div>
  )
}

function ConnectivityBanner() {
  const { shown, text } = useConnectivityStatus()
  if (!shown) return null
  return (
    <div className={'mateu-connectivity-banner ' + (shown === 'restored' ? 'is-restored' : 'is-offline')} data-mateu-connectivity={shown}>
      {text}
    </div>
  )
}
