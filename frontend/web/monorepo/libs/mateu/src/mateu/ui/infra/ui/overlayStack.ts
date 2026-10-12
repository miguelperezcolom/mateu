/**
 * Whether an OPEN dialog or drawer sits anywhere inside `host`, crossing open shadow roots — an
 * overlay opened from another one (a dialog a drawer's form returned) lives in a shadow root inside
 * it, where a query on the outer overlay's own root does not reach. Esc must close that inner one,
 * never the overlay underneath.
 */
export function hasOverlayInside(host: Element): boolean {
    const roots: (Element | ShadowRoot)[] = [host]
    if (host.shadowRoot) roots.push(host.shadowRoot)
    while (roots.length) {
        const root = roots.pop()!
        for (const el of Array.from(root.querySelectorAll('*'))) {
            if (el !== host && (el.localName === 'mateu-dialog' || el.localName === 'mateu-drawer')
                // a closed one lingers a moment for its fade-out: it no longer counts
                && (el as unknown as { opened?: boolean }).opened !== false) return true
            if (el.shadowRoot) roots.push(el.shadowRoot)
        }
    }
    return false
}
