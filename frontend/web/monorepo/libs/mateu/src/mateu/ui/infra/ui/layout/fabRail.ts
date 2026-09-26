import { css, unsafeCSS } from "lit";
import type { ResolvedPageWidth } from "@infra/ui/layout/pageWidth.ts";

/**
 * The floating action buttons' rail: where every FAB of a shell sits and what it looks like.
 *
 * <p>The look is a Lumo button, not a Material disc: a square of `--lumo-size-l` with Lumo's
 * medium radius and the primary colour, close to the corner. Where the corner is follows the page
 * width, as in the Redwood shell (oj-sp-simple-ui-shell anchors its chat FAB the same way): an
 * edge-to-edge or full-width page puts it in the viewport's bottom-right corner; a fixed-width page
 * puts it just right of the content column, so it belongs to the page rather than floating in the
 * margin of a wide screen.
 *
 * <p>The anchor is a custom property on the document root, `--mateu-fab-inset-end`, published by
 * the content view that knows its width (`trackFabAnchor`) — custom properties inherit through
 * shadow roots, so every FAB, in whichever shadow tree it is rendered, reads the same value.
 * FABs of one column stack upwards by slot (`fabBottom`); page FABs take a second column to the
 * left of the shell's (`FAB_PAGE_COLUMN`).
 */

/** Distance from the bottom edge, and the default distance from the end edge. */
const INSET = 'var(--mateu-fab-inset-block, var(--lumo-space-m, 1rem))'
const SIZE = 'var(--mateu-fab-size, var(--lumo-size-l, 2.75rem))'
const GAP = 'var(--mateu-fab-gap, var(--lumo-space-s, 0.5rem))'

/** The end inset every FAB reads: published on the document root, the corner until then. */
export const FAB_INSET_END = 'var(--mateu-fab-inset-end, var(--lumo-space-m, 1rem))'

/** The column of page FABs: one FAB to the left of the shell's rail. */
export const FAB_PAGE_COLUMN = 1

/** `bottom` of the FAB in the given slot of a column (0 = the lowest). */
export const fabBottom = (slot: number): string => `calc(${INSET} + ${slot} * (${SIZE} + ${GAP}))`

/** `right` of a FAB in the given column (0 = the shell's rail, against the anchor). */
export const fabRight = (column: number): string =>
    column === 0 ? FAB_INSET_END : `calc(${FAB_INSET_END} + ${column} * (${SIZE} + ${GAP}))`

/** Inline position of a FAB: its slot in a column. The look comes from `fabStyles`. */
export const fabPosition = (slot: number, column = 0): string =>
    `bottom: ${fabBottom(slot)}; right: ${fabRight(column)};`

/**
 * The look of a FAB (the class goes on a plain <button>, so the core stays free of any design
 * system's elements): Lumo's primary button, square, with a small lift so it reads as floating.
 */
export const fabStyles = (selector: string) => css`
    ${unsafeSelector(selector)} {
        position: fixed;
        box-sizing: border-box;
        width: ${unsafe(SIZE)};
        height: ${unsafe(SIZE)};
        padding: 0;
        border: none;
        border-radius: var(--lumo-border-radius-m, 0.25rem);
        background-color: var(--lumo-primary-color, #1676f3);
        color: var(--lumo-primary-contrast-color, #fff);
        box-shadow: var(--lumo-box-shadow-s, 0 2px 4px rgba(0, 0, 0, 0.2));
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--lumo-icon-size-m, 1.5rem);
        z-index: 900;
        transition: background-color 0.15s, bottom 0.2s ease, right 0.2s ease;
    }
    ${unsafeSelector(selector)}:hover {
        background-image: linear-gradient(var(--lumo-tint-10pct, rgba(255, 255, 255, 0.1)), var(--lumo-tint-10pct, rgba(255, 255, 255, 0.1)));
    }
    ${unsafeSelector(selector)}:active {
        background-image: linear-gradient(var(--lumo-shade-10pct, rgba(0, 0, 0, 0.1)), var(--lumo-shade-10pct, rgba(0, 0, 0, 0.1)));
    }
    ${unsafeSelector(selector)}:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px var(--lumo-base-color, #fff), 0 0 0 4px var(--lumo-primary-color-50pct, rgba(22, 118, 243, 0.5));
    }
`

/**
 * How far from the viewport's end edge the rail sits, in px. For a fixed-width page, in the margin
 * just right of the content column — the FAB's start edge one gap past the column's end edge — when
 * the margin has room for it; otherwise, and for full-width and edge-to-edge pages, the minimum: the
 * corner. `fabSpan` is a FAB's width plus the gap.
 */
export const fabInsetEnd = (mode: ResolvedPageWidth, contentEnd: number, viewportWidth: number, minimum: number, fabSpan: number): number => {
    if (mode !== 'fixed') return minimum
    return Math.max(minimum, Math.round(viewportWidth - contentEnd - fabSpan))
}

let owner: HTMLElement | undefined

/**
 * Publishes the rail's anchor for a content view of the given width mode, and keeps it in step as
 * the view or the viewport resize. The last view to call it owns the anchor; the returned function
 * lets it go (restoring the corner) if it still owns it.
 */
export const trackFabAnchor = (element: HTMLElement, mode: ResolvedPageWidth): (() => void) => {
    owner = element
    const root = document.documentElement
    const publish = () => {
        if (owner !== element || !element.isConnected) return
        // Lumo's sizes in rem: the minimum inset is --lumo-space-m (1rem), a FAB --lumo-size-l
        // (2.75rem) and the gap --lumo-space-s (0.5rem).
        const rem = parseFloat(getComputedStyle(root).fontSize || '16') || 16
        const value = fabInsetEnd(mode, element.getBoundingClientRect().right, window.innerWidth, rem, 3.25 * rem)
        root.style.setProperty('--mateu-fab-inset-end', `${value}px`)
    }
    publish()
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(publish) : undefined
    observer?.observe(element)
    window.addEventListener('resize', publish)
    return () => {
        observer?.disconnect()
        window.removeEventListener('resize', publish)
        if (owner === element) {
            owner = undefined
            root.style.removeProperty('--mateu-fab-inset-end')
        }
    }
}

// css`` only interpolates CSSResults; the selector and the size are trusted constants of this file.
const unsafe = (value: string) => unsafeCSS(value)
const unsafeSelector = (selector: string) => unsafeCSS(selector)
