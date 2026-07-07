// Client-side persistence of the application-level context (the @AppContext selectors on the app
// header): one localStorage entry per origin holding {fieldName: value}. The API client merges it
// into the appState of EVERY outgoing action request, so any screen or server-side action can read
// the fixed values (HttpRequest.appContext(fieldName)) without any propagation wiring.

const KEY = 'mateu-app-context'

export const readAppContext = (): Record<string, unknown> => {
    try {
        return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, unknown>
    } catch {
        return {}
    }
}

export const writeAppContext = (fieldName: string, value: unknown) => {
    const context = readAppContext()
    if (value === undefined || value === null || value === '') {
        delete context[fieldName]
    } else {
        context[fieldName] = value
    }
    try {
        localStorage.setItem(KEY, JSON.stringify(context))
    } catch {
        // storage unavailable (private mode…): the selection just won't survive a reload
    }
}
