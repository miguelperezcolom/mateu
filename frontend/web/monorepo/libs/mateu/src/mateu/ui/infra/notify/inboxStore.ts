import type { AppNotification, MessageAction, NotificationsChanged } from '@mateu/shared/apiClients/dtos/Progress.ts'

/**
 * The notification INBOX's state on this page: the server's list (`NotificationsSupplier`, fetched
 * by the bell) merged with the session's own entries — an `inbox` message, an entry pushed live
 * that the server list does not show yet — deduplicated by id (an entry with the same id replaces
 * the previous one). Durable entries are the app's; session entries live as long as the page.
 *
 * Pure helpers (merge, filters, grouping, the live change) plus a tiny subscribable singleton.
 */

/** An inbox entry plus what only the client knows about it. */
export interface InboxEntry extends AppNotification {
    /** an entry the server knows nothing about: made from an `inbox` message of this session */
    local?: boolean
    /** for a session entry made from a message: the element its actions run on */
    initiator?: HTMLElement
}

export type InboxFilter = 'unread' | 'all' | 'resolved'

export interface InboxState {
    server: InboxEntry[]
    session: InboxEntry[]
}

export const emptyInbox = (): InboxState => ({ server: [], session: [] })

/** Pure: the entries the bell shows — server first, then session entries the server lacks. */
export const mergedEntries = (state: InboxState): InboxEntry[] => {
    const byId = new Map<string, InboxEntry>()
    for (const entry of state.server) byId.set(entry.id, entry)
    // a pushed change of an entry the server already listed is NEWER than that fetch
    for (const entry of state.session) {
        const known = byId.get(entry.id)
        byId.set(entry.id, known ? { ...known, ...entry, local: false } : entry)
    }
    const server = state.server.map((e) => byId.get(e.id)!)
    const extra = state.session.filter((e) => !state.server.some((s) => s.id === e.id)).map((e) => byId.get(e.id)!)
    // session entries are newest: they go on top
    return [...extra.reverse(), ...server]
}

/** Pure: a fresh server list — session copies of what it now lists are not needed any more. */
export const withServerList = (state: InboxState, list: AppNotification[]): InboxState => ({
    server: list.map((n) => ({ ...n })),
    session: state.session.filter((e) => !list.some((n) => n.id === e.id)),
})

/** Pure: adds (or replaces, same id) a session entry. */
export const withSessionEntry = (state: InboxState, entry: InboxEntry): InboxState => ({
    server: state.server,
    session: [...state.session.filter((e) => e.id !== entry.id), { ...entry, local: entry.local ?? true }],
})

/** Pure: an entry gone, from both halves. */
export const withoutEntry = (state: InboxState, id: string): InboxState => ({
    server: state.server.filter((e) => e.id !== id),
    session: state.session.filter((e) => e.id !== id),
})

/** Pure: entries marked read locally (the server confirms on its next answer). */
export const withRead = (state: InboxState, ids: string[] | 'all'): InboxState => {
    const read = (e: InboxEntry) => ids === 'all' || ids.includes(e.id) ? { ...e, unread: false } : e
    return { server: state.server.map(read), session: state.session.map(read) }
}

export const matchesFilter = (entry: InboxEntry, filter: InboxFilter): boolean =>
    filter === 'all' ? true
        : filter === 'resolved' ? !!entry.resolved
            : entry.unread && !entry.resolved

export const filtered = (entries: InboxEntry[], filter: InboxFilter): InboxEntry[] =>
    entries.filter((e) => matchesFilter(e, filter))

export interface InboxGroup { category: string | null, entries: InboxEntry[] }

/** Pure: entries grouped by category, in order of first appearance; uncategorised first. */
export const groupedByCategory = (entries: InboxEntry[]): InboxGroup[] => {
    const groups: InboxGroup[] = []
    for (const entry of entries) {
        const category = entry.category?.trim() || null
        let group = groups.find((g) => g.category === category)
        if (!group) {
            group = { category, entries: [] }
            if (category === null) groups.unshift(group)
            else groups.push(group)
        }
        group.entries.push(entry)
    }
    return groups
}

export const unreadCount = (entries: InboxEntry[]): number => entries.filter((e) => e.unread && !e.resolved).length

/** The `NotificationsChanged` commands an increment carries. */
export const notificationChangesOf = (increment: unknown): NotificationsChanged[] => {
    const commands = (increment as { commands?: { type?: string, data?: NotificationsChanged }[] } | null)?.commands ?? []
    return commands.filter((c) => c?.type === 'NotificationsChanged').map((c) => c.data ?? {})
}

export type ChangeOutcome = { state: InboxState, refetch: boolean, added?: AppNotification }

/** Pure: what a live change does: upsert, remove, or ask for the list again. */
export const applyChange = (state: InboxState, change: NotificationsChanged): ChangeOutcome => {
    if (change?.notification?.id) {
        const isNew = !mergedEntries(state).some((e) => e.id === change.notification!.id)
        return {
            // the server's entry, pushed: its read, dismiss, actions and detail go to the server like
            // those of a listed one (only an entry made from a message is the session's alone)
            state: withSessionEntry(state, { ...change.notification, local: false }),
            refetch: false,
            added: isNew && change.notification.unread ? change.notification : undefined,
        }
    }
    if (change?.removedId) return { state: withoutEntry(state, change.removedId), refetch: false }
    return { state, refetch: true }
}

/** The session entry an `inbox` message becomes. */
export const entryOfMessage = (message: {
    key?: string | null, title?: string | null, text?: string | null, variant?: string | null,
    actions?: MessageAction[] | null,
}, now: Date, initiator?: HTMLElement): InboxEntry => ({
    id: message.key || `message-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    title: message.title || message.text || '',
    text: message.title ? message.text : null,
    unread: true,
    when: now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    variant: message.variant ?? null,
    actions: message.actions ?? [],
    local: true,
    initiator,
})

// ── the page's one inbox ─────────────────────────────────────────────────────

type Listener = (state: InboxState) => void
type RefetchListener = () => void
type AddedListener = (entry: AppNotification) => void

let current: InboxState = emptyInbox()
const listeners = new Set<Listener>()
const refetchers = new Set<RefetchListener>()
const addedListeners = new Set<AddedListener>()

const publish = (next: InboxState) => {
    current = next
    for (const listener of listeners) {
        try { listener(current) } catch { /* keep going */ }
    }
}

export const inboxStore = {
    get state(): InboxState { return current },
    entries(): InboxEntry[] { return mergedEntries(current) },
    setServerList(list: AppNotification[]) { publish(withServerList(current, list)) },
    addSessionEntry(entry: InboxEntry) { publish(withSessionEntry(current, entry)) },
    remove(id: string) { publish(withoutEntry(current, id)) },
    markRead(ids: string[] | 'all') { publish(withRead(current, ids)) },
    /** a live change from the server */
    applyChange(change: NotificationsChanged) {
        const outcome = applyChange(current, change)
        if (outcome.state !== current) publish(outcome.state)
        if (outcome.refetch) refetchers.forEach((r) => { try { r() } catch { /* keep going */ } })
        if (outcome.added) addedListeners.forEach((l) => { try { l(outcome.added!) } catch { /* keep going */ } })
    },
    subscribe(listener: Listener): () => void {
        listeners.add(listener)
        return () => listeners.delete(listener)
    },
    /** the bell asks the server again when a change says "refetch" */
    onRefetch(listener: RefetchListener): () => void {
        refetchers.add(listener)
        return () => refetchers.delete(listener)
    },
    /** a new unread entry arrived live (the toast that announces it) */
    onAdded(listener: AddedListener): () => void {
        addedListeners.add(listener)
        return () => addedListeners.delete(listener)
    },
    /** test hook */
    reset() { current = emptyInbox(); listeners.clear(); refetchers.clear(); addedListeners.clear() },
}
