/**
 * WCAG 2.4.11 Focus Not Obscured (Minimum): the pinned page header, the sticky sections and the
 * floating buttons stay on screen while the page scrolls, so a control reached with Tab can land
 * BEHIND them — the browser scrolls it into view, but "in view" counts the area they cover. This
 * computes how far to scroll so the focused control clears them. Pure: no DOM.
 */

export interface Box { top: number, bottom: number }

/** The gap left between the control and what covers the page. */
export const FOCUS_CLEARANCE_PX = 8

/**
 * How much to scroll the page (positive = down) so `target` sits between `topLimit` (the bottom
 * of the pinned region) and `bottomLimit` (the top of a floating button over it, else the
 * viewport's bottom). 0 when it already does — or when it is taller than the room left, where
 * its top wins (the start of what is focused is what must show).
 */
export function obscuredScrollDelta(target: Box, topLimit: number, bottomLimit: number,
                                    clearance = FOCUS_CLEARANCE_PX): number {
    const top = topLimit + clearance
    const bottom = bottomLimit - clearance
    if (target.top < top) return target.top - top
    if (target.bottom > bottom) {
        const down = target.bottom - bottom
        // never push its top under the pinned region
        return Math.min(down, Math.max(0, target.top - top))
    }
    return 0
}

/** The element at a point, looking inside open shadow roots (a fixed FAB lives in one). */
export function deepElementFromPoint(root: Document | ShadowRoot, x: number, y: number): Element | null {
    const hit = (root as Document).elementFromPoint?.(x, y) ?? null
    if (hit && hit.shadowRoot && hit.shadowRoot !== root) {
        return deepElementFromPoint(hit.shadowRoot, x, y) ?? hit
    }
    return hit
}

/** Is `node` the element or inside it, across shadow boundaries? */
export function composedContains(container: Element, node: Node | null): boolean {
    let n: Node | null = node
    while (n) {
        if (n === container) return true
        n = (n as Element).assignedSlot ?? n.parentNode ?? ((n as ShadowRoot).host ?? null)
    }
    return false
}

/** Is this element (or an ancestor) fixed to the viewport — a floating button, a strip? */
export function isFixed(el: Element | null): boolean {
    let n: Element | null = el
    while (n) {
        if (typeof getComputedStyle === 'function' && getComputedStyle(n).position === 'fixed') return true
        const parent: Node | null = n.assignedSlot ?? n.parentNode
        n = parent instanceof ShadowRoot ? parent.host : (parent as Element | null)
        if (n && n.nodeType !== 1) n = null
    }
    return false
}

/**
 * The top of a fixed element covering the bottom of `rect` (a FAB), else `viewportBottom`. Probed at
 * the rect's bottom corners and middle.
 */
export function bottomObstruction(target: Element, rect: DOMRect, viewportBottom: number,
                                  doc: Document = document): number {
    let limit = viewportBottom
    const y = Math.min(rect.bottom, viewportBottom) - 2
    for (const x of [rect.left + 2, (rect.left + rect.right) / 2, rect.right - 2]) {
        const hit = deepElementFromPoint(doc, x, y)
        if (!hit || composedContains(target, hit) || composedContains(hit, target)) continue
        if (isFixed(hit)) limit = Math.min(limit, hit.getBoundingClientRect().top)
    }
    return limit
}
