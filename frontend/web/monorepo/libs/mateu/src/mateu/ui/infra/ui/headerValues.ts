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

/** What the shell declared — authoritative when the shell is (re)built. */
export const seedHeaderValues = (declared: HeaderValue[] | undefined) => {
    const next = declared ?? []
    const same = next.length === values.size
        && next.every((v) => { const c = values.get(v.id); return c && c.value === v.value && c.label === v.label })
    if (same) return
    values.clear()
    next.forEach((v) => values.set(v.id, { ...v }))
    notify()
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
    if (options.broadcast !== false) {
        safeLocalStorage.setJson(STORAGE_KEY, { id, value: text, at: Date.now() })
    }
}

let watching = false

/** Follows the changes other tabs make. Idempotent. */
export const installHeaderValuesWatcher = () => {
    if (watching || typeof window === 'undefined') return
    watching = true
    window.addEventListener('storage', (event) => {
        if (event.key !== STORAGE_KEY || !event.newValue) return
        try {
            const change = JSON.parse(event.newValue) as { id?: string, value?: string }
            if (change.id) updateHeaderValue(change.id, change.value, { broadcast: false })
        } catch { /* not ours */ }
    })
}

/** Tests only. */
export const resetHeaderValues = () => { values.clear(); listeners.clear() }
