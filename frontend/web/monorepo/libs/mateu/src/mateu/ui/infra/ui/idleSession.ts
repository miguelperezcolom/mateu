import type { IdleSession } from '@mateu/shared/apiClients/dtos/componentmetadata/AppShellExtras.ts'
import { safeLocalStorage } from '@infra/safeStorage.ts'

/**
 * The IDLE-SESSION WARNING's clock (`@App(idleTimeoutMinutes)`) — pure, tested without a browser.
 *
 * Activity is shared by every tab of the app: each tab writes the time of its last activity to
 * localStorage (throttled), and each tab measures idleness from the LATEST activity of any tab —
 * so working in one tab keeps the others from warning, and "Stay signed in" pressed in one tab
 * dismisses the warning everywhere. A "Sign out" in one tab signs out the others too.
 */
export const ACTIVITY_KEY = 'mateu-last-activity'
export const SIGN_OUT_KEY = 'mateu-idle-sign-out'
/** How often a tab writes its activity (the storage event fires in every other tab). */
export const WRITE_EVERY_MS = 5_000

export type IdlePhase = 'active' | 'warning' | 'expired'

/** Where the session stands: still active, warning (with the seconds left), or expired. */
export const idlePhase = (now: number, lastActivity: number, idle: Pick<IdleSession, 'timeoutSeconds' | 'warningSeconds'>):
    { phase: IdlePhase, secondsLeft: number } => {
    const timeoutMs = Math.max(1, idle.timeoutSeconds) * 1000
    const warningMs = Math.min(timeoutMs, Math.max(1, idle.warningSeconds) * 1000)
    const elapsed = Math.max(0, now - lastActivity)
    const secondsLeft = Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000))
    if (elapsed >= timeoutMs) return { phase: 'expired', secondsLeft: 0 }
    if (elapsed >= timeoutMs - warningMs) return { phase: 'warning', secondsLeft }
    return { phase: 'active', secondsLeft }
}

/** The latest activity of any tab: this tab's, or what another one wrote. */
export const latestActivity = (own: number): number => {
    const shared = Number(safeLocalStorage.get(ACTIVITY_KEY) ?? 0)
    return Math.max(own, Number.isFinite(shared) ? shared : 0)
}

/** Records activity: in memory always, in storage at most every WRITE_EVERY_MS (or when forced). */
export const recordActivity = (state: { own: number, written: number }, now: number, force = false) => {
    state.own = now
    if (force || now - state.written >= WRITE_EVERY_MS) {
        state.written = now
        safeLocalStorage.set(ACTIVITY_KEY, String(now))
    }
}

/** The events that count as the user being there. */
export const ACTIVITY_EVENTS = ['keydown', 'pointerdown', 'wheel', 'touchstart', 'scroll'] as const
