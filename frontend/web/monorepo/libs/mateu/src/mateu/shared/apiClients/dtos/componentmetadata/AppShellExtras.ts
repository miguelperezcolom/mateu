/** An app-wide keyboard shortcut / quick-launch code (`@AppShortcut`). */
export interface AppShortcut {
    /** in the `@Action(shortcut)` syntax: "f9", "ctrl+alt+r" */
    key?: string | null
    label: string
    /** absolute route it goes to */
    route?: string | null
    /** or: the app-level action it runs */
    actionId?: string | null
    /** quick-launch code typed in the command palette */
    code?: string | null
}

/** A live value on the app header ("Business date: 12 Oct"). */
export interface HeaderValue {
    id: string
    label?: string | null
    value?: string | null
}

/** The idle-session warning (`@App(idleTimeoutMinutes)`). */
export interface IdleSession {
    timeoutSeconds: number
    warningSeconds: number
    signOutUrl?: string | null
    keepAliveActionId?: string | null
}
