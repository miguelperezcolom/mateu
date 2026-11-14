/**
 * May a component move the focus on its own (an "autofocus") right now?
 *
 * On a page the user has just loaded, NO. The document starts at the top and the first Tab must
 * reach the skip link (`mateu-skip-link`, WCAG 2.4.1): a listing that grabbed the focus for its
 * search box on load left the skip link behind the starting point, so a keyboard user could
 * never reach it without Shift+Tab-ing backwards. Nor while the user is typing somewhere else.
 *
 * Once the user has acted on the page (a key, a click, a tap) — typically the menu entry that
 * took them to a listing — the screen they asked for may put the focus where they will type.
 *
 * Note: the HTML `autofocus` attribute is the wrong tool for this in both directions: browsers
 * honour it on the first load only (exactly when it hurts) and never again once anything had the
 * focus (exactly when it would help, after an in-app navigation). Components focus by code
 * behind this check instead.
 */

let interacted = false
let watching = false

const markInteracted = (e: Event) => {
    // a lone Tab is the user looking for the skip link / walking the page, not acting on it
    if (e instanceof KeyboardEvent && (e.key === 'Tab' || e.key === 'Shift')) return
    interacted = true
}

/** Starts listening for the user's first action on the page (idempotent). */
export function watchForInteraction(doc: Document | undefined = typeof document !== 'undefined' ? document : undefined) {
    if (watching || !doc) return
    watching = true
    for (const type of ['pointerdown', 'keydown', 'touchstart']) {
        doc.addEventListener(type, markInteracted, { capture: true, passive: true })
    }
}

/** The element that really has the focus, through open shadow roots. */
function deepActiveElement(doc: Document): Element | null {
    let el: Element | null = doc.activeElement
    while (el && (el as HTMLElement).shadowRoot?.activeElement) el = (el as HTMLElement).shadowRoot!.activeElement
    return el
}

function isTextEntry(el: Element | null): boolean {
    if (!el) return false
    const tag = el.tagName.toLowerCase()
    if (tag === 'textarea' || tag === 'select') return true
    if (tag === 'input') {
        const type = ((el as HTMLInputElement).type || 'text').toLowerCase()
        return !['button', 'submit', 'reset', 'checkbox', 'radio', 'image', 'range', 'color', 'file'].includes(type)
    }
    return (el as HTMLElement).isContentEditable === true
}

/**
 * True when a component may take the focus on its own: the user has acted on the page already,
 * and is not typing in (or standing on) a field or the skip link.
 */
export function mayTakeFocusOnItsOwn(doc: Document | undefined = typeof document !== 'undefined' ? document : undefined): boolean {
    if (!doc || !interacted) return false
    const active = deepActiveElement(doc)
    if (isTextEntry(active)) return false
    // the skip link host or anything inside it
    let node: Node | null = active
    while (node) {
        if ((node as Element).tagName?.toLowerCase() === 'mateu-skip-link') return false
        node = node.parentNode ?? (node as unknown as ShadowRoot).host ?? null
    }
    return true
}

/** Test seam: forget the user's actions. */
export function resetInteractionForTests() {
    interacted = false
}

watchForInteraction()
