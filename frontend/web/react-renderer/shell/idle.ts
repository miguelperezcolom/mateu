import { useEffect, useRef, useState } from 'react'
import type { MateuSession } from '@rn/core/MateuSession'
import { ACTIVITY_EVENTS, ACTIVITY_KEY, idlePhase, latestActivity, recordActivity, SIGN_OUT_KEY } from '@infra/ui/idleSession.ts'
import { resolveSafeUrl } from '@infra/ui/safeNavigate.ts'
import { safeLocalStorage } from '@infra/safeStorage.ts'
import { AccessibilityInfo } from '../shims/react-native'
import { runAppLevel, type AppMetaLike } from './appActions'

interface IdleSessionLike {
  timeoutSeconds: number
  warningSeconds: number
  signOutUrl?: string | null
  keepAliveActionId?: string | null
}

/**
 * The idle-session clock (`@App(idleTimeoutMinutes)` → AppDto.idleSession), the web renderer's
 * rules: activity is shared by every tab (localStorage `mateu-last-activity`, throttled), the
 * warning counts down (the renderer draws an alertdialog whose safe choice — Stay signed in — has
 * the focus, Esc too), Stay reaches the server (`keepAliveActionId`), and expiring or Sign out in one tab signs
 * out the others (`mateu-idle-sign-out`). A cancelable `mateu-idle-sign-out` event goes first.
 */
export interface IdleState {
  /** Whether the app declares an idle session at all. */
  enabled: boolean
  phase: 'active' | 'warning' | 'expired'
  secondsLeft: number
  signingOut: boolean
  stay: () => void
  signOut: () => void
}

export function useIdleSession(session: MateuSession, app: AppMetaLike): IdleState {
  const idle = app['idleSession'] as IdleSessionLike | null | undefined
  const [phase, setPhase] = useState<'active' | 'warning' | 'expired'>('active')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [signingOut, setSigningOut] = useState(false)
  const activity = useRef({ own: Date.now(), written: 0 })
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const announcedTen = useRef(false)

  const signOut = (propagate: boolean) => {
    if (signingOut) return
    setSigningOut(true)
    if (propagate) safeLocalStorage.set(SIGN_OUT_KEY, String(Date.now()))
    const declared = idle?.signOutUrl || '/'
    const url = resolveSafeUrl(declared) ? declared : '/'
    const event = new CustomEvent('mateu-idle-sign-out', { detail: { url }, cancelable: true })
    if (!document.dispatchEvent(event)) return
    window.location.assign(url)
  }
  const signOutRef = useRef(signOut)
  signOutRef.current = signOut

  const stay = () => {
    recordActivity(activity.current, Date.now(), true)
    setPhase('active')
    const actionId = idle?.keepAliveActionId
    if (actionId) void runAppLevel(session, app, actionId, {}, 'idle-warning').catch(() => undefined)
  }
  const stayFn = useRef(stay)
  stayFn.current = stay

  useEffect(() => {
    if (!idle) return undefined
    recordActivity(activity.current, Date.now(), true)
    const onActivity = () => { if (phaseRef.current === 'active') recordActivity(activity.current, Date.now()) }
    const check = () => {
      const { phase: next, secondsLeft: left } = idlePhase(Date.now(), latestActivity(activity.current.own), idle)
      if (next === 'expired') { signOutRef.current(true); return }
      if (next === 'warning' && phaseRef.current !== 'warning') announcedTen.current = false
      if (next === 'warning' && left <= 10 && !announcedTen.current) {
        announcedTen.current = true
        AccessibilityInfo.announceForAccessibilityWithOptions(`Your session ends in ${left} seconds.`, { queue: false })
      }
      setPhase(next)
      setSecondsLeft(left)
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === SIGN_OUT_KEY && e.newValue) signOutRef.current(false)
      if (e.key === ACTIVITY_KEY) check()
    }
    ACTIVITY_EVENTS.forEach((t) => window.addEventListener(t, onActivity, { capture: true, passive: true }))
    window.addEventListener('storage', onStorage)
    const timer = setInterval(check, 1000)
    return () => {
      ACTIVITY_EVENTS.forEach((t) => window.removeEventListener(t, onActivity, { capture: true }))
      window.removeEventListener('storage', onStorage)
      clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idle?.timeoutSeconds, idle?.warningSeconds])

  return { enabled: !!idle, phase, secondsLeft, signingOut, stay: () => stayFn.current(), signOut: () => signOutRef.current(true) }
}
