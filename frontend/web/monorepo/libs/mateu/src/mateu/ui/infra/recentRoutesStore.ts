// Recently-visited screens for the command center (the Ask-Oracle pattern), persisted client-side
// so the palette can offer "Recent" shortcuts before the user types. Mirrors the localStorage shape
// of savedViewsStore.ts / columnPrefsStore.ts: one JSON object per origin, keyed by a "scope" string
// (the app's serverSideType, so several apps on the same origin don't share recents), holding a
// capped, most-recent-first list. No server round-trip — purely a UX convenience.

const KEY = 'mateu-recent-routes'
const MAX = 8

export interface RecentRoute {
    route: string
    label: string
}

type Store = Record<string, RecentRoute[]>

function readAll(): Store {
    try {
        return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Store
    } catch {
        return {}
    }
}

function writeAll(store: Store): void {
    try {
        localStorage.setItem(KEY, JSON.stringify(store))
    } catch {
        // storage full / unavailable — recents are best-effort, ignore
    }
}

/** Most-recent-first list of screens visited in this app (empty when none). */
export function listRecentRoutes(scope: string): RecentRoute[] {
    return readAll()[scope || '_'] ?? []
}

/** Record a visited screen; dedupes by route and keeps the list capped and most-recent-first. */
export function pushRecentRoute(scope: string, entry: RecentRoute): void {
    if (!entry?.route || !entry.label) return
    const key = scope || '_'
    const store = readAll()
    const current = store[key] ?? []
    const deduped = current.filter(e => e.route !== entry.route)
    deduped.unshift({ route: entry.route, label: entry.label })
    store[key] = deduped.slice(0, MAX)
    writeAll(store)
}
