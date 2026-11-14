/**
 * Where "Sign out" is offered. An app shell's header draws it (appRenderer.renderSignOutButton);
 * a UI with NO header — no app shell at all, or a chromeless one — had no way to sign out. So the
 * shells report whether they draw a header, and while the built-in sign-in holds a session and no
 * header is on screen, the page offers its own button (mateu-sign-out-corner).
 *
 * Pure bookkeeping, no DOM: shells are tracked by identity and listeners hear every change.
 */

const shellsWithHeader = new Set<object>()
const listeners = new Set<() => void>()

const changed = () => listeners.forEach((listener) => listener())

/**
 * A shell (re)rendered: it draws a header with the sign-out button, or it does not (a MEDIATOR
 * shell nested in content, a chromeless app). Called from the shell's `updated()`.
 */
export const noteShell = (shell: object, drawsHeader: boolean): void => {
    const had = shellsWithHeader.has(shell)
    if (drawsHeader === had) return
    if (drawsHeader) shellsWithHeader.add(shell)
    else shellsWithHeader.delete(shell)
    changed()
}

/** A shell left the page. */
export const forgetShell = (shell: object): void => {
    if (shellsWithHeader.delete(shell)) changed()
}

export const headerOnScreen = (): boolean => shellsWithHeader.size > 0

export const onPlacementChange = (listener: () => void): (() => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

/** Whether a shell's variant draws the header that carries "Sign out". */
export const drawsHeader = (app: { variant?: string; chromeless?: boolean } | undefined): boolean =>
    !!app && app.variant !== 'MEDIATOR' && !app.chromeless

/** The page's own button: a session to end, and no header on screen to offer it. */
export const signOutCornerShown = (signOutAvailable: boolean, headerShown: boolean): boolean =>
    signOutAvailable && !headerShown

/** For tests. */
export const resetSignOutPlacement = (): void => {
    shellsWithHeader.clear()
    listeners.clear()
}
