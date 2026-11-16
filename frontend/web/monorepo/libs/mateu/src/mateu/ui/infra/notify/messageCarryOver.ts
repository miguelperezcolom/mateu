import type Message from '@mateu/shared/apiClients/dtos/Message.ts'
import type { ToastMessage } from '@application/Notifier.ts'
import { safeSessionStorage } from '@infra/safeStorage.ts'

/**
 * Messages that survive the page load a server `NavigateTo` causes.
 *
 * A server `NavigateTo` is a full page load (safeNavigate — the target may be another mount of the
 * origin, which the client cannot tell from one of its own on a root mount). An answer that says
 * "Ticket created" AND navigates showed the toast for a few milliseconds and then the browser threw
 * the page away with it: the user never saw it. So, right before that load, the messages the answer
 * just showed are kept in sessionStorage (this tab only) and the next page's top `mateu-ui` shows
 * them once it booted.
 *
 * Only the TEXT travels (title, text, severity, position, duration, persistence, key): an action of
 * the message runs on the component that answered, which the load destroys — offered on a screen it
 * does not belong to, it would run against the wrong thing. An `inbox` message already left its
 * session entry behind; carried, it is a plain toast (no second entry).
 */

const KEY = 'mateu-carried-messages'
/** what "the messages this answer just showed" means: shown within this window before the NavigateTo */
export const RECENT_WINDOW_MS = 3000
/** a carried message older than this when the next page boots is stale (a refused or slow load) */
export const CARRY_TTL_MS = 30000
const MAX = 10

export interface CarriedMessage {
    title?: string
    text: string
    variant?: string
    position?: string
    duration?: number
    persistence?: string | null
    key?: string | null
    /** when it was carried, epoch ms */
    at: number
}

let recent: { message: Message, at: number }[] = []

/** Remembers a server message just shown (messageToast.showServerMessage). */
export const noteShownMessage = (message: Message, now: number = Date.now()): void => {
    if (!message || (!message.text && !message.title)) return
    recent = recent.filter((r) => now - r.at <= RECENT_WINDOW_MS)
    recent.push({ message, at: now })
    if (recent.length > MAX) recent = recent.slice(-MAX)
}

/** Pure: what of a message travels across the load. */
export const carriedOf = (message: Message, at: number): CarriedMessage => ({
    ...(message.title ? { title: message.title } : {}),
    text: message.text ?? '',
    ...(message.variant ? { variant: message.variant } : {}),
    ...(message.position ? { position: message.position } : {}),
    ...(typeof message.duration === 'number' ? { duration: message.duration } : {}),
    persistence: message.persistence === 'inbox' ? null : (message.persistence ?? null),
    key: message.key ?? null,
    at,
})

/**
 * Called right before a same-tab page load the server asked for: keeps the messages shown in the
 * last {@link RECENT_WINDOW_MS} for the next page. Returns how many were kept.
 */
export const carryOverRecentMessages = (now: number = Date.now()): number => {
    const toKeep = recent.filter((r) => now - r.at <= RECENT_WINDOW_MS).map((r) => carriedOf(r.message, now))
    recent = []
    if (toKeep.length === 0) return 0
    const already = safeSessionStorage.getJson<CarriedMessage[]>(KEY, [])
    const all = [...(Array.isArray(already) ? already : []), ...toKeep].slice(-MAX)
    return safeSessionStorage.setJson(KEY, all) ? toKeep.length : 0
}

/** Takes (and forgets) the messages a previous page carried over, minus the stale ones. */
export const takeCarriedMessages = (now: number = Date.now()): CarriedMessage[] => {
    const stored = safeSessionStorage.getJson<unknown>(KEY, [])
    safeSessionStorage.remove(KEY)
    if (!Array.isArray(stored)) return []
    return stored.filter((m): m is CarriedMessage =>
        !!m && typeof m === 'object'
        && typeof (m as CarriedMessage).text === 'string'
        && typeof (m as CarriedMessage).at === 'number'
        && now - (m as CarriedMessage).at >= 0
        && now - (m as CarriedMessage).at <= CARRY_TTL_MS)
}

/** Pure: the toast a carried message becomes (no actions). */
export const toastOfCarried = (m: CarriedMessage): ToastMessage => ({
    text: m.text,
    title: m.title || undefined,
    variant: m.variant,
    position: m.position,
    duration: m.duration,
    persistence: m.persistence ?? null,
    key: m.key ?? null,
})

/**
 * Pure: whether following `target` from `current` loads a new page — a fragment move on the same
 * document (`#section`) does not, and a message carried for it would pop up on some later load.
 */
export const reloadsThePage = (target: string, current: string): boolean => {
    try {
        const t = new URL(target, current)
        const c = new URL(current)
        const sameDocument = t.origin === c.origin && t.pathname === c.pathname && t.search === c.search
        return !(sameDocument && t.hash !== '')
    } catch {
        return false
    }
}

/** test hook */
export const resetCarryOver = (): void => {
    recent = []
}
