import { announce } from '../a11y/announcer'
import { windowTitleChanged } from './composedHeading'

/**
 * The browser tab's title, and the one announcement of it.
 *
 * <p>The server names the window (SetWindowTitle) when it builds the screen. A record page defined
 * in YAML (`title: ${state.name}`, its record loaded by the route's `data:` source) is named before
 * its record exists: the server can only fall back to the route ("28"), and the record lands a
 * moment later from the browser. The page header then shows "Voyager 1" — the tab, the history
 * entry, a bookmark and the screen-reader announcement kept saying "28" (Redwood re-derives it).
 *
 * <p>So the window title FOLLOWS the routed page's own title when that title is a template that
 * resolves once the record is in ({@link notePageTitle}, called by the page header), and the
 * announcement waits a beat ({@link ANNOUNCE_DELAY_MS}) so it is made ONCE, with the name rather
 * than the fallback. A title resolved after the announcement went out updates the tab silently:
 * announcing it again would read the page's name twice.
 */
export const ANNOUNCE_DELAY_MS = 350

let pendingTimer: ReturnType<typeof setTimeout> | undefined
let pendingText: string | undefined

const apply = (text: string) => {
    if (typeof document !== 'undefined') document.title = text
    windowTitleChanged(text)
}

const flush = () => {
    pendingTimer = undefined
    const text = pendingText
    pendingText = undefined
    if (text) announce(text)
}

/** The server named the window (SetWindowTitle): show it now, announce it in a beat. */
export const setServerWindowTitle = (text: string): void => {
    apply(text)
    pendingText = text
    if (pendingTimer !== undefined) clearTimeout(pendingTimer)
    pendingTimer = setTimeout(flush, ANNOUNCE_DELAY_MS)
}

/**
 * The routed page's own title, now that its template resolved (non-empty, nothing left
 * unresolved). Replaces the window title when it differs; replaces the pending announcement, if
 * the announcement has not gone out yet.
 */
export const notePageTitle = (text: string | undefined): void => {
    const title = (text ?? '').trim()
    if (!title || title.includes('${')) return
    if (typeof document !== 'undefined' && document.title === title) return
    apply(title)
    if (pendingTimer !== undefined) pendingText = title
}

/** Tests only: forget a pending announcement. */
export const resetWindowTitleForTests = (): void => {
    if (pendingTimer !== undefined) clearTimeout(pendingTimer)
    pendingTimer = undefined
    pendingText = undefined
}
