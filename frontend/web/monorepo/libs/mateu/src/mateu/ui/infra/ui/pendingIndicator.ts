/**
 * Pending indicator — busy feedback ON the control the user actually pressed.
 *
 * The framework already had a loading affordance: a full-subtree veil (`mateu-api-caller`). That
 * answers "is the app busy?" but never "did my click register?", which is the question a user on
 * a slow link is actually asking. They press Save, nothing changes for a third of a second, and
 * they press it again.
 *
 * So the busy state is put where the eye already is — the pressed control — and it must work on
 * EVERY renderer without knowing any of them: the control may be a native `<button>`, a
 * `vaadin-button`, an `oj-c-button` or a table cell, living in any shadow root. Two mechanisms
 * that need no cooperation from the widget:
 *
 *   1. `data-mateu-pending` + `aria-busy` on the element — a styling and accessibility hook any
 *      renderer can target, and screen readers announce.
 *   2. A stylesheet adopted into the element's OWN root node (document or shadow root, once per
 *      root), pulsing the control. Document-level CSS cannot cross a shadow boundary, so the
 *      sheet goes wherever the element lives.
 *
 * The busy state is drawn by animating the HOST's own properties, not by a `::after` spinner.
 * That is not a stylistic choice: a `::before`/`::after` on a shadow host is not painted, and the
 * controls that matter — `vaadin-button`, `ui5-button`, `oj-c-button` — are all shadow hosts, so
 * a pseudo-element spinner renders on a plain `<button>` and silently vanishes everywhere else.
 * (Verified against a live Vaadin app: an `inset: 0; background: red` `::after` on a
 * `vaadin-button` paints nothing at all.) Opacity animates on the host, so it always shows.
 *
 * `pointer-events: none` on the busy control is the visible half of the double-submit guard whose
 * authoritative half is {@link ./pendingActions} — the guard refuses duplicates even when the
 * press arrives by keyboard, where there is no pointer to block.
 */

const STYLE_MARKER = 'data-mateu-pending-styles'

const CSS = `
[data-mateu-pending] {
    pointer-events: none;
    cursor: progress;
    animation: mateu-pending-pulse 1.1s ease-in-out infinite;
}
/* Respect the user's motion preference: keep the affordance, drop the movement. */
@media (prefers-reduced-motion: reduce) {
    [data-mateu-pending] { animation: none; opacity: .55; }
}
@keyframes mateu-pending-pulse {
    0%, 100% { opacity: .45; }
    50% { opacity: .85; }
}
`

/** Roots already carrying the stylesheet, so it is injected once each. */
const styledRoots = new WeakSet<Document | ShadowRoot>()

const ensureStyles = (root: Document | ShadowRoot): void => {
    if (styledRoots.has(root)) return
    styledRoots.add(root)
    // Constructable stylesheets where available (no extra DOM node, shared parse).
    const adoptable = root as unknown as { adoptedStyleSheets?: CSSStyleSheet[] }
    if (typeof CSSStyleSheet !== 'undefined' && Array.isArray(adoptable.adoptedStyleSheets)) {
        try {
            const sheet = new CSSStyleSheet()
            sheet.replaceSync(CSS)
            adoptable.adoptedStyleSheets = [...adoptable.adoptedStyleSheets, sheet]
            return
        } catch {
            // fall through to the <style> element
        }
    }
    const container = root instanceof Document ? root.head : root
    if (!container) return
    const style = document.createElement('style')
    style.setAttribute(STYLE_MARKER, '')
    style.textContent = CSS
    container.appendChild(style)
}

/** The document or shadow root the element lives in, or undefined if it is detached. */
const rootOf = (element: Element): Document | ShadowRoot | undefined => {
    const root = element.getRootNode()
    if (root instanceof ShadowRoot) return root
    if (root instanceof Document) return root
    return undefined
}

/**
 * Marks `element` busy. Idempotent — marking an already-busy element changes nothing, so the
 * repeat presses the guard rejects do not disturb the indicator.
 */
export const markPending = (element: Element | null | undefined): void => {
    if (!element || element.hasAttribute('data-mateu-pending')) return
    const root = rootOf(element)
    if (root) ensureStyles(root)
    element.setAttribute('data-mateu-pending', '')
    element.setAttribute('aria-busy', 'true')
}

/** Clears the busy state. Safe on an element that was never marked. */
export const clearPending = (element: Element | null | undefined): void => {
    if (!element) return
    element.removeAttribute('data-mateu-pending')
    element.removeAttribute('aria-busy')
}

/**
 * The control the user actually interacted with, for an event that may have crossed shadow
 * boundaries on its way up. `composedPath()[0]` is the real origin; `target` is retargeted to the
 * host once the event leaves a shadow root, which would decorate the whole component instead of
 * the button inside it.
 */
export const originOf = (event: Event): Element | undefined => {
    const path = typeof event.composedPath === 'function' ? event.composedPath() : []
    const origin = path[0] ?? event.target
    return origin instanceof Element ? origin : undefined
}

/**
 * Controls worth decorating. Deliberately a closed list of button-like things across the
 * design systems in play: dimming a container (a whole form, a table, a `mateu-component`)
 * would be worse than showing nothing, and an action can be dispatched from anywhere — a
 * trigger, a shortcut, a row click. When nothing matches, the action still runs and is still
 * guarded against double submission; it just gets no local affordance.
 */
const INTERACTIVE = [
    'button',
    'a[href]',
    '[role="button"]',
    '[role="menuitem"]',
    'input[type="button"]',
    'input[type="submit"]',
    'vaadin-button',
    'vaadin-menu-bar-button',
    'ui5-button',
    'oj-c-button',
    'oj-button',
].join(', ')

/**
 * The nearest button-like element at or above `element`, or undefined when the origin is not an
 * interactive control. Shadow boundaries are not crossed: the pressed control and the icon inside
 * it live in the same root, which is exactly the hop this needs to make.
 */
export const decorable = (element: Element | null | undefined): Element | undefined => {
    if (!element || typeof element.closest !== 'function') return undefined
    return element.closest(INTERACTIVE) ?? undefined
}
