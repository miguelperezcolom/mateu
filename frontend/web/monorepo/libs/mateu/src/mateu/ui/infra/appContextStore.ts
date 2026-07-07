// Client-side persistence of the application-level context (the @AppContext selectors on the app
// header): one localStorage entry per origin holding {fieldName: value}. The API client merges it
// into the appState of EVERY outgoing action request, so any screen or server-side action can read
// the fixed values (HttpRequest.appContext(fieldName)) without any propagation wiring. A parallel
// entry keeps the labels so the picker can show the current selection even when it isn't among
// the currently loaded options (e.g. it was found through a remote search).

const KEY = 'mateu-app-context'
const LABELS_KEY = 'mateu-app-context-labels'

const read = (key: string): Record<string, unknown> => {
    try {
        return JSON.parse(localStorage.getItem(key) ?? '{}') as Record<string, unknown>
    } catch {
        return {}
    }
}

const write = (key: string, value: Record<string, unknown>) => {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch {
        // storage unavailable (private mode…): the selection just won't survive a reload
    }
}

export const readAppContext = (): Record<string, unknown> => read(KEY)

export const readAppContextLabels = (): Record<string, unknown> => read(LABELS_KEY)

export const writeAppContext = (fieldName: string, value: unknown, label?: string) => {
    const context = readAppContext()
    const labels = readAppContextLabels()
    if (value === undefined || value === null || value === '') {
        delete context[fieldName]
        delete labels[fieldName]
    } else {
        context[fieldName] = value
        if (label !== undefined) labels[fieldName] = label
    }
    write(KEY, context)
    write(LABELS_KEY, labels)
}

// Cross-tab sync: when ANOTHER tab of the same origin changes the context, reload so this tab
// rebuilds against the new value too ('storage' only fires in the tabs that did NOT write).
let watcherInstalled = false
export const installAppContextWatcher = () => {
    if (watcherInstalled) return
    watcherInstalled = true
    window.addEventListener('storage', event => {
        if (event.key === KEY && event.newValue !== event.oldValue) {
            window.location.reload()
        }
    })
}
