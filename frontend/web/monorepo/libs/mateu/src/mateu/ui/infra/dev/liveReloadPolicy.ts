/**
 * Live reload — the pure half: what a message of the dev event stream means for the screen.
 *
 * The backend in development mode (`mateu.dev=true`) streams `GET /mateu/dev/events`:
 *
 *  - `{type:"hello", bootId}` on every (re)connection. A boot id DIFFERENT from the one seen before
 *    means the server restarted (Spring DevTools, `quarkus:dev`, a manual restart): the code may
 *    have changed, so the screen is re-rendered. The first hello only records the id.
 *  - `{type:"specs-changed", files, scope}` — spec files changed on disk.
 *  - `{type:"reload", scope}` — someone (the IDE, after a HotSwap) asked for a re-render.
 *  - `{type:"ping"}` — keep-alive, ignored.
 *
 * `scope: "page"` re-requests the route on screen keeping what the user typed; `scope: "app"` (a
 * route file, a mount or an app shell changed) remounts the whole app on the same URL.
 */

export type LiveReloadAction = 'none' | 'page' | 'app'

export interface LiveReloadMessage {
    type?: string
    bootId?: string
    scope?: string
    files?: string[]
}

export interface LiveReloadDecision {
    action: LiveReloadAction
    /** The boot id to remember from now on. */
    bootId: string | undefined
    /** Why — shown by the indicator. */
    reason?: string
}

export const decideLiveReload = (
    message: LiveReloadMessage | undefined,
    knownBootId: string | undefined,
): LiveReloadDecision => {
    if (!message || typeof message !== 'object') {
        return { action: 'none', bootId: knownBootId }
    }
    switch (message.type) {
        case 'hello': {
            const restarted = !!knownBootId && !!message.bootId && message.bootId !== knownBootId
            return {
                action: restarted ? 'page' : 'none',
                bootId: message.bootId ?? knownBootId,
                reason: restarted ? 'server restarted' : undefined,
            }
        }
        case 'specs-changed':
            return {
                action: message.scope === 'app' ? 'app' : 'page',
                bootId: knownBootId,
                reason: describeFiles(message.files),
            }
        case 'reload':
            return {
                action: message.scope === 'app' ? 'app' : 'page',
                bootId: knownBootId,
                reason: 'reload requested',
            }
        default:
            return { action: 'none', bootId: knownBootId }
    }
}

/** The stronger of two pending actions (a burst of events collapses into one reload). */
export const strongest = (a: LiveReloadAction, b: LiveReloadAction): LiveReloadAction => {
    const rank = { none: 0, page: 1, app: 2 }
    return rank[a] >= rank[b] ? a : b
}

const describeFiles = (files: string[] | undefined): string => {
    if (!files || files.length === 0) return 'specs changed'
    const names = files.map(f => f.substring(f.lastIndexOf('/') + 1))
    return names.length <= 2 ? names.join(', ') : `${names[0]} and ${names.length - 1} more`
}

/**
 * Where the dev event stream is, if this page was served by a dev-mode backend: the backend stamps
 * `<meta name="mateu-dev" content="/mateu/dev/events">` on the index page (and nowhere else), and a
 * host (the visual editor's Play) may point at one explicitly with `window.__MATEU_DEV_EVENTS__`.
 */
export const devEventsUrl = (doc: Document | undefined, win: unknown): string | undefined => {
    const explicit = (win as { __MATEU_DEV_EVENTS__?: string } | undefined)?.__MATEU_DEV_EVENTS__
    if (explicit) return explicit
    const meta = doc?.querySelector?.('meta[name="mateu-dev"]') as HTMLMetaElement | null | undefined
    return meta?.content || undefined
}
