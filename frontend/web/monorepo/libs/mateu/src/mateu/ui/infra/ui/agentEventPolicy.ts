/**
 * Which event names an AGENT may dispatch onto this tab — the chat's stream and the live push
 * channel both end in {@link applyAgentEvent}, which used to dispatch ANY name as a bubbling,
 * composed DOM event. The framework itself listens to many such names: `server-side-action-requested`
 * is a direct server call with an action id and state of the sender's choosing (past the
 * advertised-actions gate and the confirmations), `page-banners-received` paints arbitrary banner
 * text (phishing), `route-changed`/`url-update-requested` move the user, `dirty`/`clean` silence the
 * unsaved-changes guard.
 *
 * So an agent event goes out only when it is:
 *  - a built-in agent event (`navigation-requested`, `close-requested`, `render-screen`), or
 *  - DECLARED by a component on screen — an OnCustomEvent trigger (`@SubscribeTo`), registered here
 *    while that component is connected — and not one of the framework's own event names.
 * Anything else is dropped. The lists are pinned by conformance/client/agent-events.json (shared with
 * the Redwood renderer); React Native and IntelliJ deliver agent events to their session bus, which
 * only `@SubscribeTo` subscriptions are on.
 */

export const AGENT_BUILT_IN_EVENTS: ReadonlySet<string> = new Set([
    'navigation-requested', 'close-requested', 'render-screen',
])

/** Event names the framework listens to itself (and DOM ones): never an agent's to dispatch. */
export const RESERVED_EVENT_NAMES: ReadonlySet<string> = new Set([
    'action-requested', 'server-side-action-requested', 'url-update-requested', 'route-changed',
    'navigate-to-requested', 'page-banners-received', 'dirty', 'clean', 'value-changed', 'data-changed',
    'app-data-updated', 'close-modal-requested', 'column-prefs-changed', 'compact-changed', 'history-pushed',
    'selected-changed', 'search-requested', 'filter-reset-requested', 'picked', 'pinged', 'click',
    'dblclick', 'input', 'change', 'submit', 'keydown', 'keyup', 'keypress', 'focus', 'blur', 'focusin',
    'focusout', 'load', 'error', 'abort', 'message', 'storage', 'popstate', 'hashchange', 'beforeunload',
    'pagehide', 'online', 'offline', 'resize', 'scroll', 'wheel', 'contextmenu', 'pointerdown', 'pointerup',
    'mousedown', 'mouseup', 'touchstart', 'drop', 'dragstart', 'dragend', 'unhandledrejection',
    'DOMContentLoaded',
    // a design-system widget's own events (vaadin `*-changed`, a dialog's confirm/cancel): none is
    // reachable today — they are listened on descendants and an event bubbles UP — it is insurance.
    // An author's own `booking-changed` stays dispatchable, hence the names and not a `-changed` rule.
    'opened-changed', 'checked-changed', 'active-item-changed', 'selected-items-changed', 'items-changed',
    'expanded-items-changed', 'detail-opened-items-changed', 'invalid-changed', 'has-value-changed',
    'filter-changed', 'size-changed', 'loading-changed', 'opened', 'closed', 'close', 'confirm', 'cancel',
    'reject', 'toggle', 'select', 'validated', 'unparsable-change', 'cell-activate', 'item-click',
    'grid-dragstart', 'grid-dragend', 'grid-drop',
])

export const RESERVED_EVENT_PREFIXES: readonly string[] = ['mateu-', 'backend-', 'vaadin-']

/** Oracle JET's own events (`ojAction`, `oj-…`), for a renderer that hosts JET components. */
export const RESERVED_EVENT_PATTERNS: readonly RegExp[] = [/^oj[A-Z-]/]

const declared = new Map<string, number>()

/** A component on screen subscribes to `name` (an OnCustomEvent trigger). Returns its release. */
export function declareAgentEvent(name: string): () => void {
    declared.set(name, (declared.get(name) ?? 0) + 1)
    let released = false
    return () => {
        if (released) return
        released = true
        const left = (declared.get(name) ?? 1) - 1
        if (left > 0) declared.set(name, left)
        else declared.delete(name)
    }
}

/** True for one of the framework's own event names. */
export const isReservedEventName = (name: string): boolean =>
    RESERVED_EVENT_NAMES.has(name) || RESERVED_EVENT_PREFIXES.some((p) => name.startsWith(p))
    || RESERVED_EVENT_PATTERNS.some((p) => p.test(name))

/**
 * Whether an agent may dispatch `name` here. `subscribed` defaults to what the components on screen
 * declare (a test passes its own).
 */
export function agentMayDispatch(name: string, subscribed: (n: string) => boolean = (n) => declared.has(n)): boolean {
    if (typeof name !== 'string' || !name) return false
    if (AGENT_BUILT_IN_EVENTS.has(name)) return true
    return subscribed(name) && !isReservedEventName(name)
}
