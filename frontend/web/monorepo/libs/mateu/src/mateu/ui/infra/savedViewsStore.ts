// Client-side persistence of SAVED VIEWS on listings: a named snapshot of the smart search bar's
// conditions (free-text keyword + every applied filter value, range bounds included). One
// localStorage entry per origin holding {scope: SavedView[]}, where the scope is the listing's
// pathname — the same per-route granularity the URL-filter sync uses. Marking a view as default
// makes the listing open with it applied when the URL carries no explicit filter params.

export interface SavedView {
    name: string
    /** filter values by state key (searchText + <fieldId> / <fieldId>_from / <fieldId>_to …) */
    values: Record<string, unknown>
    isDefault?: boolean
}

const KEY = 'mateu-saved-views'

const readAll = (): Record<string, SavedView[]> => {
    try {
        return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, SavedView[]>
    } catch {
        return {}
    }
}

const writeAll = (views: Record<string, SavedView[]>) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(views))
    } catch {
        // storage unavailable (private mode…): views just won't survive a reload
    }
}

export const listSavedViews = (scope: string): SavedView[] => readAll()[scope] ?? []

/** Saves (or replaces, matching by name) a view. Empty names or empty snapshots are ignored. */
export const saveView = (scope: string, view: SavedView) => {
    const name = view.name?.trim()
    if (!name || Object.keys(view.values ?? {}).length === 0) return
    const all = readAll()
    const views = (all[scope] ?? []).filter(existing => existing.name !== name)
    views.push({ ...view, name })
    all[scope] = views
    writeAll(all)
}

export const deleteView = (scope: string, name: string) => {
    const all = readAll()
    const views = (all[scope] ?? []).filter(existing => existing.name !== name)
    if (views.length === 0) {
        delete all[scope]
    } else {
        all[scope] = views
    }
    writeAll(all)
}

/** Marks one view as the scope's default (or clears the default when name is undefined). */
export const setDefaultView = (scope: string, name: string | undefined) => {
    const all = readAll()
    all[scope] = (all[scope] ?? []).map(view => ({
        ...view,
        isDefault: view.name === name ? !view.isDefault : false,
    }))
    writeAll(all)
}

export const defaultView = (scope: string): SavedView | undefined =>
    listSavedViews(scope).find(view => view.isDefault)
