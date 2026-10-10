/**
 * Web Storage that never throws.
 *
 * `localStorage`/`sessionStorage` can be missing (SSR, a worker), or throw on ACCESS — not only on
 * write — in a sandboxed iframe without `allow-same-origin`, with cookies blocked, or in some
 * private modes; and `setItem` throws when the quota is full. Everything the client keeps there is
 * a convenience (theme, column prefs, the session id, the token the bootstrap left), so a storage
 * failure must degrade to "not remembered", never to a broken request or a dead page.
 */

export interface SafeStorage {
    get(key: string): string | null
    set(key: string, value: string): boolean
    remove(key: string): void
    /** Parsed JSON, or `fallback` when missing/unparseable. */
    getJson<T>(key: string, fallback: T): T
    setJson(key: string, value: unknown): boolean
}

type Area = 'localStorage' | 'sessionStorage'

const area = (name: Area): Storage | undefined => {
    try {
        const s = (globalThis as Record<string, unknown>)[name] as Storage | undefined
        return s ?? undefined
    } catch {
        return undefined // the getter itself throws (blocked storage)
    }
}

const make = (name: Area): SafeStorage => {
    const api: SafeStorage = {
        get(key) {
            try {
                return area(name)?.getItem(key) ?? null
            } catch {
                return null
            }
        },
        set(key, value) {
            try {
                const s = area(name)
                if (!s) return false
                s.setItem(key, value)
                return true
            } catch {
                return false // quota exceeded / blocked: just not remembered
            }
        },
        remove(key) {
            try {
                area(name)?.removeItem(key)
            } catch {
                // nothing to do
            }
        },
        getJson<T>(key: string, fallback: T): T {
            const raw = api.get(key)
            if (raw == null) return fallback
            try {
                return JSON.parse(raw) as T
            } catch {
                return fallback
            }
        },
        setJson(key, value) {
            try {
                return api.set(key, JSON.stringify(value))
            } catch {
                return false // not serialisable
            }
        },
    }
    return api
}

export const safeLocalStorage: SafeStorage = make('localStorage')
export const safeSessionStorage: SafeStorage = make('sessionStorage')
