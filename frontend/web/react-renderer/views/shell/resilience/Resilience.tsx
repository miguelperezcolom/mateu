import React from 'react'
import { ProgressBar } from '@kit'
import type { MateuSession } from '@rn/core/MateuSession'
import { useBusyIndicator, useConnectivityStatus, usePressedControls } from '@mr/resilience/useResilience'
import './resilience.css'
import { tx } from '@mr/i18n/texts'

/** A slow or broken connection in Primer: a thin progress bar on top, the connectivity strip, the pressed control pulsing. */
export function Resilience({ session }: { session: MateuSession }) {
  usePressedControls(session)
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
      <ProgressBar animated progress={100} barSize="small" aria-hidden="true" />
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
