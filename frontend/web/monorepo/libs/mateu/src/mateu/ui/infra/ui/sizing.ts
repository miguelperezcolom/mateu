/**
 * The sizing intent (coherence-plan #8): a component declares "hug" (size to content), "fill" (grow
 * to fill the space its parent leaves, scrolling internally) or "fixed:<len>" (a concrete size).
 * The intent travels as data on the wire (portable to native); on the web it maps to flex on the
 * component's host element. Kept pure (a tiny host stub is all a test needs) and the single place
 * the wire string is decoded, so the CSS in mateu-component and this decode never drift.
 */
export interface SizableHost {
    setAttribute(name: string, value: string): void
    removeAttribute(name: string): void
    style: { flexBasis: string }
}

/**
 * Applies a component's sizing intent to its host element. "fill"/"hug" set data-sizing (styled by
 * mateu-component's :host rules); "fixed:<len>" sets data-sizing="fixed" and the flex-basis inline.
 * An absent/blank intent clears both, restoring the element's default flow.
 */
export function applySizing(host: SizableHost, sizing?: string | null): void {
    if (!sizing) {
        host.removeAttribute('data-sizing')
        host.style.flexBasis = ''
        return
    }
    if (sizing.startsWith('fixed:')) {
        host.setAttribute('data-sizing', 'fixed')
        host.style.flexBasis = sizing.slice('fixed:'.length)
        return
    }
    // 'hug' | 'fill' (any other value is passed through as the attribute for forward-compatibility)
    host.setAttribute('data-sizing', sizing)
    host.style.flexBasis = ''
}
