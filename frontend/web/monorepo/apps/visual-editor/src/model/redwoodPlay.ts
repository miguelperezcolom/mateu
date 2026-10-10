/**
 * Play in Redwood: the editor acts as the BACKEND of the Redwood app running in Play's iframe.
 *
 * The Redwood renderer shares no runtime with libs/mateu (its core is apps/redwood/poc), and it has
 * no client-side expander — it can only paint wire increments. The editor has both the files as
 * edited and the expander (the same specs-mode bundle store Vaadin's Play runs on), so the frame
 * forwards every `/mateu/v3/…` call to the editor (postMessage, see play/redwood-play.ts and the
 * frame side in redwood/previewPage.ts) and the editor answers it exactly as a Mateu backend would:
 *
 *  - the shell's bootstrap (`components/_/action`) → the mount root, a fresh load (the app shell);
 *  - a route LOAD (`sync/<route>`, actionId '') → the route, as the shell's content load (consumed
 *    route '') or a fresh load (`_empty`, a mount with no app shell) — never a shell inside a shell;
 *  - anything else (a button, a search, the notifications bell) → the preview backend, when there
 *    is one; with none, an empty answer carrying a toast that says so.
 *
 * Pure: the resolver (bundleStore.resolveBundledLoad) is a parameter, so tests feed it a table.
 */
import type UIIncrement from '@mateu/shared/apiClients/dtos/UIIncrement'

export type BundledLoadResolver = (syncPath: string, consumedRoute?: string) => UIIncrement | undefined

export type PlayAnswer =
    /** Answer it here, with this increment. */
    | { kind: 'answer'; json: unknown }
    /** Send it to the preview backend, at `path` (from `/mateu/v3/` on) under its base URL. */
    | { kind: 'forward'; path: string }

const EMPTY = (): UIIncrement => ({ commands: [], messages: [], fragments: [] } as unknown as UIIncrement)

/** The `/mateu/v3/…` part of a URL the app called (its own base dropped), or null when it is not one. */
export function mateuPathOf(url: string): string | null {
    const at = (url ?? '').indexOf('/mateu/v3/')
    return at < 0 ? null : url.slice(at)
}

/** The route a sync path names (`/mateu/v3/sync/orders%2F7?x` → `orders/7`; `_no_route` → `_no_route`). */
export function syncPathOf(path: string): string {
    const rest = path.slice('/mateu/v3/sync/'.length).split('?')[0]
    try { return decodeURIComponent(rest) || '_no_route' } catch { return rest || '_no_route' }
}

/** The increment aimed at the surface that loads it — what a backend echoes on a live load. */
export function aimedAtInitiator(increment: UIIncrement, initiator: string): UIIncrement {
    return {
        ...increment,
        fragments: (increment.fragments ?? []).map((f) => (f.targetComponentId ? f : { ...f, targetComponentId: initiator })),
    }
}

/** A toast-only increment: the call needs what Play does not have. */
export function needsBackend(what: string): UIIncrement {
    return {
        ...EMPTY(),
        messages: [{
            title: 'Needs a backend', variant: 'warning', position: 'bottom-end', duration: 5000,
            text: `${what} runs on a Mateu backend, and this Play has none — pick a preview source with a backend to try it.`,
        }],
    } as unknown as UIIncrement
}

/** How the editor answers one call of the Redwood app. */
export function answerPlayCall(url: string, body: Record<string, unknown> | undefined, resolve: BundledLoadResolver,
                               hasBackend: boolean): PlayAnswer {
    const path = mateuPathOf(url)
    if (!path) return { kind: 'answer', json: EMPTY() }
    const b = body ?? {}
    const initiator = typeof b.initiatorComponentId === 'string' && b.initiatorComponentId ? b.initiatorComponentId : ''
    if (path.startsWith('/mateu/v3/components/')) {
        // the shell's bootstrap: the mount root, as a fresh load (an app shell when the root is one)
        const root = resolve('_no_route', '_empty')
        if (root) return { kind: 'answer', json: aimedAtInitiator(root, initiator || 'shell') }
        return hasBackend ? { kind: 'forward', path } : { kind: 'answer', json: EMPTY() }
    }
    if (path.startsWith('/mateu/v3/sync/')) {
        const isLoad = b.actionId === '' || b.actionId == null
        if (isLoad) {
            const consumed = typeof b.consumedRoute === 'string' ? b.consumedRoute : ''
            const loaded = resolve(syncPathOf(path), consumed)
            if (loaded) return { kind: 'answer', json: aimedAtInitiator(loaded, initiator) }
            return hasBackend ? { kind: 'forward', path } : { kind: 'answer', json: EMPTY() }
        }
        if (hasBackend) return { kind: 'forward', path }
        return { kind: 'answer', json: needsBackend(`“${String(b.actionId)}”`) }
    }
    // client-log, notifications, chat…: the backend's, if there is one; nobody is listening otherwise
    return hasBackend ? { kind: 'forward', path } : { kind: 'answer', json: EMPTY() }
}

/** A route as Play's address bar shows it, from the frame's location hash (`#/orders?x` → `orders?x`). */
export function routeOfHash(hash: string): string {
    return (hash ?? '').replace(/^#/, '').replace(/^\/+/, '')
}
