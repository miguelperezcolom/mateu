/**
 * The UI events an agent sends in the chat stream (`{"event": …, "detail": …}`) and what the shell
 * does with the ones it owns. Pure and DOM-free (the DOM half is builtInRenderTarget.ts), so the
 * same decisions are tested on their own; the native renderers and the Redwood core port this.
 *
 * The catalogue:
 *  - `navigation-requested` {route, consumedRoute, actionId, baseUrl, serverSideType, uriPrefix} — the
 *    shell navigates there, exactly like a click on the menu entry carrying those fields;
 *  - `close-requested` — the shell closes the chat panel;
 *  - `render-screen` {yaml? | uidl?, target?, title?} — a screen the agent authored. A component on
 *    screen that subscribes to it (`@SubscribeTo("render-screen")`) takes it; when none does, the
 *    shell renders it itself through the reserved `__preview__` action (the BUILT-IN render target):
 *    in the content area (default), a drawer or a dialog;
 *  - anything else — dispatched as is, for whoever subscribes to it.
 */

export const NAVIGATION_REQUESTED = 'navigation-requested'
export const CLOSE_REQUESTED = 'close-requested'
export const RENDER_SCREEN = 'render-screen'

/** Where a generated screen goes when no component on screen takes it. */
export type RenderTarget = 'content' | 'drawer' | 'dialog'

/** A render-screen event, read: the definition as text (YAML, or JSON — YAML's subset) and where. */
export interface RenderScreenRequest {
    yaml: string
    target: RenderTarget
    title?: string
}

/** The reserved sync action that turns a definition into a normal UI increment. */
export const PREVIEW_ACTION = '__preview__'
export const PREVIEW_YAML_KEY = '_yaml'

const TARGETS: RenderTarget[] = ['content', 'drawer', 'dialog']

/**
 * What a render-screen detail asks for, or null when it carries no definition. `yaml` (text) wins
 * over `uidl` (a component tree as an object, or as JSON text); an unknown target is the content.
 */
export function renderScreenRequestOf(detail: unknown): RenderScreenRequest | null {
    if (!detail || typeof detail !== 'object') return null
    const d = detail as Record<string, unknown>
    let yaml: string | undefined
    if (typeof d.yaml === 'string' && d.yaml.trim()) {
        yaml = d.yaml
    } else if (typeof d.uidl === 'string' && d.uidl.trim()) {
        yaml = d.uidl
    } else if (d.uidl && typeof d.uidl === 'object') {
        try {
            yaml = JSON.stringify(d.uidl)
        } catch {
            yaml = undefined // a cyclic object is not a definition
        }
    }
    if (!yaml) return null
    const target = TARGETS.includes(d.target as RenderTarget) ? (d.target as RenderTarget) : 'content'
    const title = typeof d.title === 'string' && d.title.trim() ? d.title : undefined
    return { yaml, target, ...(title && { title }) }
}

/** The parameters of the `__preview__` call that renders the request. */
export const previewParametersOf = (request: RenderScreenRequest): Record<string, unknown> =>
    ({ [PREVIEW_YAML_KEY]: request.yaml })

/**
 * A definition the browser can expand by itself when there is no backend to preview it (a static
 * bundle): only JSON, since the YAML parser is not part of the runtime. Null when it is not JSON.
 */
export function jsonDefinitionOf(request: RenderScreenRequest): Record<string, unknown> | null {
    const text = request.yaml.trim()
    if (!text.startsWith('{')) return null
    try {
        const parsed = JSON.parse(text)
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
    } catch {
        return null
    }
}

// ── Claiming ─────────────────────────────────────────────────────────────────────────────────
// A component that subscribes to an event the chat dispatches marks it as TAKEN, so the shell
// knows whether to fall back to its own handling. dispatchEvent is synchronous: once it returns,
// every listener (document-level subscriptions included) has run.

const claimed = new WeakSet<Event>()

/** Marks an event as handled by a subscriber. */
export const claimEvent = (event: Event): void => {
    claimed.add(event)
}

/** Whether a subscriber took the event. */
export const isEventClaimed = (event: Event): boolean => claimed.has(event)
