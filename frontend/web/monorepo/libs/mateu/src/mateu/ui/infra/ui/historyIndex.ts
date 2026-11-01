/**
 * Where in the session history each entry this app wrote sits, so a back/forward the user then
 * refuses ("you have unsaved changes" → stay) can be UNDONE instead of papered over.
 *
 * <p>The guard used to answer a refused popstate with `pushState(<the URL we were on>)`. After a
 * Back that is close enough, but after a FORWARD it builds a wrong history: [A, B*, C] → forward
 * to C → stay → [A, B, C, B*] — the user is "on B" with C behind them and the next Back goes to C.
 * Every entry pushed or replaced through `history` carries an index (`__mateuIdx`); a popstate
 * moved by `to - from`, and staying is `history.go(from - to)`, which lands exactly where the user
 * was and keeps the forward entries. The popstate that `go` itself fires is swallowed.
 *
 * <p>Entries this app did not write (or a synthetic popstate) carry no index: the guard then falls
 * back to pushing the URL it was on, as before.
 */

const KEY = '__mateuIdx'

type Win = Pick<Window, 'history' | 'location'>

let installedOn: Win | undefined
let current = { idx: 0, href: '' }
let swallow = 0

const indexOf = (state: unknown): number | undefined => {
    const v = state && typeof state === 'object' ? (state as Record<string, unknown>)[KEY] : undefined
    return typeof v === 'number' ? v : undefined
}

const withIndex = (state: unknown, idx: number) =>
    ({ ...(state && typeof state === 'object' ? (state as object) : {}), [KEY]: idx })

/** Stamps every history entry this window writes from now on. Idempotent. */
export const installHistoryIndex = (win: Win = window): void => {
    if (installedOn === win) return
    installedOn = win
    const h = win.history
    const push = h.pushState.bind(h)
    const replace = h.replaceState.bind(h)
    const existing = indexOf(h.state)
    current = { idx: existing ?? 0, href: win.location.href }
    if (existing === undefined) replace(withIndex(h.state, 0), '')
    h.pushState = (state: unknown, unused: string, url?: string | URL | null) => {
        const idx = current.idx + 1
        push(withIndex(state, idx), unused, url)
        current = { idx, href: win.location.href }
    }
    h.replaceState = (state: unknown, unused: string, url?: string | URL | null) => {
        replace(withIndex(state, current.idx), unused, url)
        current = { idx: current.idx, href: win.location.href }
    }
}

/**
 * A popstate happened: where the user came FROM (index + URL) and where they are now. `null` when
 * this popstate is the echo of our own {@link stay} and must be ignored.
 */
export const notePopState = (state: unknown, win: Win = window): { from: { idx: number, href: string }, to?: number } | null => {
    const from = current
    const to = indexOf(state)
    current = { idx: to ?? current.idx, href: win.location.href }
    if (swallow > 0) {
        swallow--
        return null
    }
    return { from, to }
}

/** Undo a back/forward the user refused: go back to `from`; without indexes, push its URL. */
export const stay = (moved: { from: { idx: number, href: string }, to?: number }, win: Win = window): void => {
    if (moved.to !== undefined && moved.to !== moved.from.idx) {
        swallow++
        win.history.go(moved.from.idx - moved.to)
        return
    }
    win.history.pushState({}, '', moved.from.href)
}

/** Tests only. */
export const resetHistoryIndexForTests = (): void => {
    installedOn = undefined
    current = { idx: 0, href: '' }
    swallow = 0
}
