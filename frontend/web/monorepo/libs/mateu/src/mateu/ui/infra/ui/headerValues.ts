import type { HeaderValue } from '@mateu/shared/apiClients/dtos/componentmetadata/AppShellExtras.ts'
import { safeLocalStorage } from '@infra/safeStorage.ts'
import { announce } from '@infra/a11y/announcer.ts'
import { chromeTextf } from '@infra/ui/chromeTexts.ts'

/**
 * LIVE HEADER VALUES — the store every shell paints from ("Business date: 12 Oct").
 *
 * Seeded from the app metadata when a shell renders; changed by the `UpdateHeaderValue` command
 * (an action's answer, or the app event stream — liveUpdates.ts). A change made here is BROADCAST to
 * the other tabs of the browser through localStorage (the `storage` event only fires in the tabs
 * that did not write), so one tab learning the new business date is enough. A change is announced
 * politely to screen readers; the first paint is not.
 */
export const STORAGE_KEY = 'mateu-header-values'
export const CHANGED_EVENT = 'mateu-header-values-changed'

/** Where a change is broadcast; null = this tab alone. Scoped by {@link scopeHeaderValues}. */
let broadcastKey: string | null = STORAGE_KEY

/**
 * The app these values belong to: two apps on one origin must not paint each other's header. `null`
 * (each tab has its own identity, see tabsShareIdentity) = no broadcast at all.
 */
export const scopeHeaderValues = (scope: string | null) => {
    broadcastKey = scope === null ? null : `${STORAGE_KEY}:${scope}`
}

const values = new Map<string, HeaderValue>()
const listeners = new Set<() => void>()

const notify = () => {
    listeners.forEach((l) => { try { l() } catch { /* a broken painter must not stop the others */ } })
    if (typeof document !== 'undefined') document.dispatchEvent(new CustomEvent(CHANGED_EVENT))
}

/** The values to paint, in the order the app declared them. */
export const headerValuesList = (): HeaderValue[] => [...values.values()]

/** Repaint when a value changes; returns the unsubscribe. */
export const onHeaderValuesChanged = (listener: () => void): (() => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

/** The ids each shell seeded (a top shell and the apps embedded under it each declare their own). */
const seededBy = new Map<unknown, Set<string>>()

/**
 * What a shell declared — authoritative for THAT shell when it is (re)built: its previous values it
 * no longer declares go, another shell's stay. An app embedded under another shell (a MicroFrontend
 * of a whole app) seeds its own values next to the top shell's; with one store owned by the top
 * shell its seed was skipped and it drew none.
 */
export const seedHeaderValues = (declared: HeaderValue[] | undefined, scope: unknown = 'default') => {
    const next = declared ?? []
    const before = seededBy.get(scope) ?? new Set<string>()
    const nextIds = new Set(next.map((v) => v.id))
    const othersDeclare = (id: string) => [...seededBy.entries()].some(([s, ids]) => s !== scope && ids.has(id))
    let changed = false
    for (const id of before) {
        if (!nextIds.has(id) && !othersDeclare(id) && values.delete(id)) changed = true
    }
    for (const v of next) {
        const c = values.get(v.id)
        if (!c || c.value !== v.value || c.label !== v.label) {
            values.set(v.id, { ...v })
            changed = true
        }
    }
    if (nextIds.size) seededBy.set(scope, nextIds)
    else seededBy.delete(scope)
    if (changed) notify()
}

/**
 * Changes one value. Unknown ids are kept too (the server may publish before the shell declares).
 * `broadcast` = tell the other tabs (false when the change came FROM another tab).
 */
export const updateHeaderValue = (id: string, value: string | null | undefined,
                                  options: { broadcast?: boolean, quiet?: boolean } = {}) => {
    if (!id) return
    const current = values.get(id)
    const text = value ?? ''
    if (current && (current.value ?? '') === text) return
    values.set(id, { id, label: current?.label ?? null, value: text })
    notify()
    if (!options.quiet) {
        announce(chromeTextf('headerValueChanged', { label: current?.label || id, value: text }))
    }
    if (options.broadcast !== false && broadcastKey) {
        safeLocalStorage.setJson(broadcastKey, { id, value: text, at: Date.now() })
    }
}

let watching = false

/** Follows the changes other tabs make. Idempotent. */
export const installHeaderValuesWatcher = () => {
    if (watching || typeof window === 'undefined') return
    watching = true
    window.addEventListener('storage', (event) => {
        if (!broadcastKey || event.key !== broadcastKey || !event.newValue) return
        try {
            const change = JSON.parse(event.newValue) as { id?: string, value?: string }
            if (change.id) updateHeaderValue(change.id, change.value, { broadcast: false })
        } catch { /* not ours */ }
    })
}

/** Drops the values of shells no longer on screen (an embedded app navigated away from). */
export const forgetDetachedHeaderScopes = () => {
    for (const scope of [...seededBy.keys()]) {
        if (typeof Node !== 'undefined' && scope instanceof Node && !scope.isConnected) seedHeaderValues([], scope)
    }
}

/** Tests only. */
export const resetHeaderValues = () => { values.clear(); listeners.clear(); seededBy.clear(); broadcastKey = STORAGE_KEY }
