/**
 * Focus trap for overlays.
 *
 * A modal that does not own the focus is a modal only for people using a mouse. Open a drawer
 * with the keyboard and, without this, the focus stays on the page underneath: Tab walks through
 * controls the user cannot see, behind a scrim, while the panel they just opened is unreachable.
 * Closing it then leaves the focus wherever it drifted to, so the place they were working is lost.
 *
 * Three obligations, which this module discharges together because they share the same lifetime:
 *   1. move the focus INTO the overlay when it opens,
 *   2. keep Tab and Shift+Tab cycling inside it while it is open,
 *   3. put the focus BACK where it came from when it closes.
 *
 * Shadow DOM makes step 2 non-obvious: `querySelectorAll` does not cross a shadow boundary, and
 * every Mateu overlay renders its content through nested custom elements. So the tabbable list is
 * gathered by walking into open shadow roots and through slots, and the "is the focus still
 * inside?" question is answered with `composedPath()`, not with `contains()`.
 */

const FOCUSABLE = [
    'a[href]',
    'button',
    'input',
    'select',
    'textarea',
    '[tabindex]',
    // Design-system controls are custom elements with their own delegated focus; they are
    // focusable without matching any of the native selectors above.
    'vaadin-button',
    'vaadin-text-field',
    'vaadin-combo-box',
    'vaadin-select',
    'vaadin-checkbox',
    'vaadin-date-picker',
    'ui5-button',
    'oj-c-button',
].join(',')

const isVisible = (el: Element): boolean => {
    const html = el as HTMLElement
    if (html.hidden) return false
    if (html.hasAttribute('disabled') || html.getAttribute('aria-hidden') === 'true') return false
    if (html.getAttribute('tabindex') === '-1') return false
    // offsetParent is null for display:none subtrees; a fixed-position element legitimately has
    // none, so fall back to the box size.
    return !!(html.offsetParent || html.getClientRects().length)
}

/** Every tabbable element inside `root`, crossing open shadow roots and slots. */
export const tabbablesWithin = (root: ParentNode): HTMLElement[] => {
    const found: HTMLElement[] = []
    const visit = (node: ParentNode) => {
        node.querySelectorAll<HTMLElement>('*').forEach((el) => {
            if (el.matches(FOCUSABLE) && isVisible(el)) found.push(el)
            if (el.shadowRoot) visit(el.shadowRoot)
            if (el instanceof HTMLSlotElement) {
                el.assignedElements().forEach((assigned) => {
                    if (assigned.matches(FOCUSABLE) && isVisible(assigned)) found.push(assigned as HTMLElement)
                    visit(assigned)
                })
            }
        })
    }
    visit(root)
    // De-duplicate: a slotted element is reachable both through its slot and through its own
    // light-DOM parent, and would otherwise be visited twice.
    return found.filter((el, i) => found.indexOf(el) === i)
}

export interface FocusTrap {
    /** Re-reads the tabbable list — call after the overlay's content changes. */
    refresh(): void
    /** Stops trapping and returns the focus to where it was. */
    release(): void
}

/**
 * Traps the focus inside `container` until the returned handle is released.
 *
 * `initialFocus` picks what receives the focus on open; by default the first tabbable element,
 * falling back to the container itself (made programmatically focusable) so a content-less
 * overlay still takes the focus off the page behind it.
 */
export const trapFocus = (
    container: HTMLElement,
    options: { initialFocus?: () => HTMLElement | null | undefined } = {},
): FocusTrap => {
    // The element to hand the focus back to. Resolved through composedPath so a focused element
    // inside a shadow root is remembered as itself, not as its host.
    const previouslyFocused = deepActiveElement()
    let tabbables: HTMLElement[] = []

    const refresh = () => { tabbables = tabbablesWithin(container) }

    const onKeydown = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return
        refresh()
        if (tabbables.length === 0) {
            // Nothing to move to: keep the focus on the container rather than letting it escape.
            e.preventDefault()
            container.focus()
            return
        }
        const first = tabbables[0]
        const last = tabbables[tabbables.length - 1]
        const active = deepActiveElement()
        if (e.shiftKey && (active === first || !active || !isInside(active, container))) {
            e.preventDefault()
            last.focus()
        } else if (!e.shiftKey && active === last) {
            e.preventDefault()
            first.focus()
        }
    }

    container.addEventListener('keydown', onKeydown)

    // The content is rendered asynchronously by Lit, so the first tabbable may not exist yet.
    requestAnimationFrame(() => {
        refresh()
        const target = options.initialFocus?.() ?? tabbables[0]
        if (target) {
            target.focus()
        } else {
            if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '-1')
            container.focus()
        }
    })

    return {
        refresh,
        release() {
            container.removeEventListener('keydown', onKeydown)
            // Only restore if the focus is still ours to give back — if something else took it
            // deliberately (a toast action, a navigation), stealing it would be worse.
            const active = deepActiveElement()
            if (!active || active === document.body || isInside(active, container)) {
                previouslyFocused?.focus?.()
            }
        },
    }
}

/** The really-focused element, descending through shadow roots. */
export const deepActiveElement = (): HTMLElement | null => {
    let active = document.activeElement as HTMLElement | null
    while (active?.shadowRoot?.activeElement) {
        active = active.shadowRoot.activeElement as HTMLElement
    }
    return active
}

/** Whether `el` sits inside `container`, crossing shadow boundaries. */
export const isInside = (el: Element | null, container: Element): boolean => {
    let node: Node | null = el
    while (node) {
        if (node === container) return true
        node = node.parentNode ?? (node as ShadowRoot).host ?? null
    }
    return false
}
