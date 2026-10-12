/**
 * Where a dropdown's panel goes: below its anchor when it fits there, ABOVE it when there is more room
 * on that side, never past the viewport. Pure — every popup of the editor (the selects, the combos,
 * the image and icon pickers) asks it, so none of them opens off-screen or gets cut by the edge of the
 * view or of a scrolling pane.
 *
 * Why the editor draws its own panels at all: the IDE hosts the editor in an embedded browser (JCEF,
 * off-screen rendering) where the browser's NATIVE dropdown — a `<select>`'s popup — is painted by the
 * embedding, not by the page: it ignored the editor's dark theme (light options on a dark IDE) and
 * placed itself wrong (opening upward, clipped by the top edge). A panel the page draws itself follows
 * the design tokens and this placement in every host.
 */

export interface AnchorRect {
    top: number
    bottom: number
    left: number
    right: number
}

export interface Viewport {
    width: number
    height: number
}

export interface PlacementOptions {
    /** The height the panel would like (its content's), in px. */
    preferredHeight: number
    /** The width the panel would like; defaults to the anchor's. */
    preferredWidth?: number
    /** Space between the anchor and the panel. */
    gap?: number
    /** Space kept between the panel and the viewport's edges. */
    margin?: number
    /** Below this much room under the anchor, the side with more room wins. */
    minHeight?: number
}

export interface Placement {
    /** Which side of the anchor the panel opens on. */
    side: 'below' | 'above'
    /** CSS `top` (when below) or `bottom` (when above), in px from the viewport's edge. */
    top?: number
    bottom?: number
    left: number
    width: number
    /** The panel scrolls past this. */
    maxHeight: number
}

/** Place a panel next to `anchor` inside `viewport` (see the module comment). */
export function placePanel(anchor: AnchorRect, viewport: Viewport, opts: PlacementOptions): Placement {
    const gap = opts.gap ?? 2
    const margin = opts.margin ?? 8
    const minHeight = Math.min(opts.minHeight ?? 160, opts.preferredHeight)
    const below = Math.max(0, viewport.height - anchor.bottom - gap - margin)
    const above = Math.max(0, anchor.top - gap - margin)
    const side: Placement['side'] = below >= minHeight || below >= above ? 'below' : 'above'
    const room = side === 'below' ? below : above
    const maxHeight = Math.max(0, Math.min(opts.preferredHeight, room))

    const anchorWidth = Math.max(0, anchor.right - anchor.left)
    const width = Math.max(0, Math.min(Math.max(opts.preferredWidth ?? anchorWidth, anchorWidth), viewport.width - 2 * margin))
    const left = Math.max(margin, Math.min(anchor.left, viewport.width - margin - width))

    return side === 'below'
        ? { side, top: anchor.bottom + gap, left, width, maxHeight }
        : { side, bottom: viewport.height - anchor.top + gap, left, width, maxHeight }
}

/** The placement as inline CSS for a `position: fixed` panel. */
export function placementStyle(p: Placement): string {
    const v = p.side === 'below' ? `top:${Math.round(p.top ?? 0)}px` : `bottom:${Math.round(p.bottom ?? 0)}px`
    return `position:fixed;${v};left:${Math.round(p.left)}px;width:${Math.round(p.width)}px;max-height:${Math.round(p.maxHeight)}px`
}

/** The viewport, as the browser reports it. */
export function currentViewport(): Viewport {
    return { width: window.innerWidth || document.documentElement.clientWidth, height: window.innerHeight || document.documentElement.clientHeight }
}

/**
 * Keep an open panel placed: re-run `place` on any scroll (a scrolling pane moves the anchor) and on
 * resize, and call `close` on a press outside `inside`. Returns the function that stops it all.
 */
export function trackOpenPanel(inside: HTMLElement, place: () => void, close: () => void): () => void {
    const onScroll = () => place()
    const onDown = (e: Event) => { if (!e.composedPath().includes(inside)) close() }
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    // capture: a pane that stops the event (the canvas does) must not keep a panel open
    document.addEventListener('pointerdown', onDown, true)
    return () => {
        window.removeEventListener('scroll', onScroll, true)
        window.removeEventListener('resize', onScroll)
        document.removeEventListener('pointerdown', onDown, true)
    }
}
