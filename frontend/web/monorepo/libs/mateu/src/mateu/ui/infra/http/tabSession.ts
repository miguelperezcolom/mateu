import { nanoid } from 'nanoid'
import { safeSessionStorage } from '@infra/safeStorage.ts'
import { SESSION_ID_KEY } from '@infra/http/authToken.ts'

/**
 * One UI session per TAB, even for a DUPLICATED tab.
 *
 * The per-tab UI session id ({@link sessionId}: the X-Session-Id, the chat's `sessionId`, the live
 * UI push channel's session) and the push channel's secret live in sessionStorage — and duplicating
 * a tab COPIES sessionStorage. Both tabs would then be the same session: they would keep replacing
 * each other's `_agent-channel` stream, and a push meant for one would land in the other.
 *
 * So, on start, a tab that already has a session id asks the other tabs of the origin (a
 * BroadcastChannel) whether one of them holds it. If one answers, this tab is the duplicate and
 * takes a FRESH id and secret. A reload keeps its own: the page that held it is gone by then, so
 * nobody answers. A tab with no id yet asks nothing (nobody can hold an id it has not made). Every
 * tab keeps answering for its CURRENT id for as long as the page lives.
 *
 * The same protocol as the Redwood renderer (apps/redwood/poc/agentPush.mjs `claimTabSession`).
 *
 * Fallback: with no BroadcastChannel (or one that cannot be opened) the tab keeps what it has —
 * exactly the behaviour before this existed. With no sessionStorage there is nothing to copy, so a
 * duplicate cannot share anything in the first place (the ids live in memory, per page).
 *
 * Ordering: `mateu-ui` starts the claim at boot (module load, before any request); the axios
 * interceptor (every X-Session-Id of an ordinary request), the agent channel and its pair/unpair
 * actions wait for it ({@link tabSessionReady}) before they first read the id, so a duplicate never
 * sends its original's. The bare-fetch streams (SSE actions, live updates, the chat) read the id when
 * they start, which is after the first route load — itself an axios request that waited — and the
 * chat reads it per message. The wait is at most `waitMs`, only for a tab that already had an id,
 * skipped on a reload (the navigation type says nobody else can hold it) and gone once settled.
 */

/** The live UI push channel's secret, kept next to the session id (sent only on the agent actions). */
export const AGENT_SECRET_KEY = 'mateu-agent-channel-secret'
/** The BroadcastChannel the tabs of an origin (it is origin-scoped by the platform) answer on. */
export const TAB_SESSION_CHANNEL = 'mateu-tab-sessions'
export const TAB_SESSION_WAIT_MS = 250

type Message = { type?: unknown, id?: unknown }

export interface ClaimOptions {
    /** Where the id and secret live (sessionStorage by default). */
    storage?: Pick<typeof safeSessionStorage, 'get' | 'set' | 'remove'>
    /** The BroadcastChannel constructor (the platform's by default); null = unavailable. */
    Channel?: (new (name: string) => BroadcastChannel) | null
    /** How long to wait for an answer. */
    waitMs?: number
    /** The navigation type ('reload' skips the question); the platform's by default. */
    navigationType?: string
}

const platformNavigationType = (): string | undefined => {
    try {
        const entry = globalThis.performance?.getEntriesByType?.('navigation')?.[0] as { type?: string } | undefined
        return entry?.type
    } catch {
        return undefined
    }
}

let pending: Promise<void> | null = null
let settled = false

/**
 * Makes sure no OTHER open tab holds this tab's session id; rotates id + secret when one does.
 * Resolves with whether it rotated. Keeps answering the other tabs afterwards. Never rejects.
 */
export const claimTabSession = (options: ClaimOptions = {}): Promise<boolean> => {
    const storage = options.storage ?? safeSessionStorage
    const Channel = options.Channel === undefined
        ? (globalThis as { BroadcastChannel?: new (name: string) => BroadcastChannel }).BroadcastChannel
        : options.Channel
    const waitMs = options.waitMs ?? TAB_SESSION_WAIT_MS
    const known = storage.get(SESSION_ID_KEY)
    if (typeof Channel !== 'function') return Promise.resolve(false)
    let channel: BroadcastChannel
    try {
        channel = new Channel(TAB_SESSION_CHANNEL)
    } catch {
        return Promise.resolve(false)
    }
    // Node (tests, SSR) keeps the process alive for an open channel; a browser has no unref
    ;(channel as unknown as { unref?: () => void }).unref?.()
    let taken = false
    channel.onmessage = (e: MessageEvent) => {
        const m = (e?.data ?? {}) as Message
        const mine = storage.get(SESSION_ID_KEY)
        if (!mine || m.id !== mine) return
        if (m.type === 'who') channel.postMessage({ type: 'mine', id: m.id })
        else if (m.type === 'mine') taken = true
    }
    const navigationType = options.navigationType ?? platformNavigationType()
    if (!known || navigationType === 'reload') return Promise.resolve(false)
    try {
        channel.postMessage({ type: 'who', id: known })
    } catch {
        return Promise.resolve(false)
    }
    return new Promise((resolve) => setTimeout(() => {
        if (!taken) {
            resolve(false)
            return
        }
        // the duplicate: a new session — the id now, the secret lazily (agentChannel.channelSecret)
        storage.set(SESSION_ID_KEY, nanoid())  // the same shape as authToken.sessionId's
        storage.remove(AGENT_SECRET_KEY)
        resolve(true)
    }, waitMs))
}

/** Starts the claim once (at boot). Later calls return the same promise. */
export const startTabSessionClaim = (options: ClaimOptions = {}): Promise<void> => {
    if (!pending) pending = claimTabSession(options).then(() => { settled = true }, () => { settled = true })
    return pending
}

/** What to wait for before the session id is first used; null when there is nothing to wait for
 *  (no claim started, or it is over — so requests after boot take no extra tick). */
export const tabSessionReady = (): Promise<void> | null => (settled ? null : pending)

/** For tests. */
export const resetTabSession = () => {
    pending = null
    settled = false
}
