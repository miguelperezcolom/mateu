import { useEffect, useState } from 'react'
import type { MateuSession } from '@rn/core/MateuSession'
import { connectivity } from '@rn/core/connectivity'
import { delayedBusyOf } from '@rn/core/serverActivity'
import { announceLive } from '@rn/a11y/a11y'
import { trackPressedControls } from './pressedControl'
import { tx } from '../i18n/texts'

/**
 * What a slow or broken connection does, without the drawing (the web renderer's
 * mateu-connectivity-banner, its delayed busy bar and the pressed control marked busy). The
 * decisions are the React Native core's: connectivity (the browser's offline is a hard negative,
 * our own traffic the positive), the session's activity counter with its one delay decision.
 */

/** Marks the pressed control busy while its request runs (call once, at the root). */
export function usePressedControls(session: MateuSession): void {
  useEffect(() => trackPressedControls(session.activity), [session])
}

/** Whether the "waiting for the server" indicator shows (after the shared delay); announced once per wait. */
export function useBusyIndicator(session: MateuSession): boolean {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const busy = delayedBusyOf(session.activity, () => announceLive(tx('loading'), false))
    return busy.subscribe(setVisible)
  }, [session])
  return visible
}

export interface ConnectivityStatus {
  /** 'offline' while the backend cannot be reached, 'restored' for a moment after, else null (nothing to show). */
  shown: 'offline' | 'restored' | null
  text: string
}

/**
 * The connectivity strip's state, announced to the screen reader. While shown, `<body>` carries
 * `mateu-has-connectivity-banner`, so the strip can push the page down instead of covering its title.
 */
export function useConnectivityStatus(): ConnectivityStatus {
  const [online, setOnline] = useState(connectivity.isOnline)
  const [restored, setRestored] = useState(false)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const off = connectivity.subscribe((now: boolean) => {
      setOnline(now)
      if (timer) clearTimeout(timer)
      if (now) {
        announceLive(tx('connectionRestored'), false)
        setRestored(true)
        timer = setTimeout(() => setRestored(false), 4000)
      } else {
        announceLive(tx('offlineBanner'), true)
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
  const shown = !online ? 'offline' : restored ? 'restored' : null
  useEffect(() => {
    document.body.classList.toggle('mateu-has-connectivity-banner', shown !== null)
    return () => document.body.classList.remove('mateu-has-connectivity-banner')
  }, [shown])
  return { shown, text: shown === 'offline' ? tx('offlineBanner') : shown === 'restored' ? tx('connectionRestored') : '' }
}
