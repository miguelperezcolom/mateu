import React, { useEffect, useState } from 'react'
import { ProgressBar } from '@primer/react'
import type { MateuSession } from '@rn/core/MateuSession'
import { connectivity } from '@rn/core/connectivity'
import { delayedBusyOf } from '@rn/core/serverActivity'
import { announceLive } from '@rn/a11y/a11y'
import { trackPressedControls } from './pressedControl'
import './resilience.css'

export const OFFLINE_TEXT = 'No connection — changes you make now will not be saved.'
export const RESTORED_TEXT = 'Connection restored.'

/**
 * What a slow or broken connection looks like on this renderer (the web renderer's
 * mateu-connectivity-banner, its delayed busy bar and the pressed control marked busy). The
 * decisions are the React Native core's: connectivity (the browser's offline is a hard negative,
 * our own traffic the positive), the session's activity counter with its one delay decision.
 */
export function Resilience({ session }: { session: MateuSession }) {
  useEffect(() => trackPressedControls(session.activity), [session])
  return (
    <>
      <BusyBar session={session} />
      <ConnectivityBanner />
    </>
  )
}

function BusyBar({ session }: { session: MateuSession }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const busy = delayedBusyOf(session.activity, () => announceLive('Loading…', false))
    return busy.subscribe(setVisible)
  }, [session])
  if (!visible) return null
  return (
    <div className="mateu-busy-bar" role="progressbar" aria-label="Waiting for the server" aria-busy="true">
      <ProgressBar animated progress={100} barSize="small" aria-hidden="true" />
    </div>
  )
}

function ConnectivityBanner() {
  const [online, setOnline] = useState(connectivity.isOnline)
  const [restored, setRestored] = useState(false)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const off = connectivity.subscribe((now: boolean) => {
      setOnline(now)
      if (timer) clearTimeout(timer)
      if (now) {
        announceLive(RESTORED_TEXT, false)
        setRestored(true)
        timer = setTimeout(() => setRestored(false), 4000)
      } else {
        announceLive(OFFLINE_TEXT, true)
        setRestored(false)
      }
    })
    const onOffline = () => connectivity.notePlatform(false)
    const onOnline = () => connectivity.notePlatform(true)
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    return () => {
      off()
      if (timer) clearTimeout(timer)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  // the strip pushes the page down instead of covering its title
  useEffect(() => {
    const shown = !online || restored
    document.body.classList.toggle('mateu-has-connectivity-banner', shown)
    return () => document.body.classList.remove('mateu-has-connectivity-banner')
  }, [online, restored])

  if (online && !restored) return null
  return (
    <div className={'mateu-connectivity-banner ' + (online ? 'is-restored' : 'is-offline')} data-mateu-connectivity={online ? 'restored' : 'offline'}>
      {online ? RESTORED_TEXT : OFFLINE_TEXT}
    </div>
  )
}
