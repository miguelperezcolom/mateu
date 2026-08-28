import { describe, expect, it, vi } from 'vitest'
import { MateuTableCrud } from './mateu-table-crud'

/**
 * The listing box's fill height across a navigation from one listing to another.
 *
 * <p>The rule the component is built on: measure the box's NATURAL layout, apply the height, and
 * do not look again until something outside changes. Everything here is about the "drop it first"
 * half of that — a measurement taken while a fill is applied reads the layout the fill produced.
 *
 * <p>What was wrong: arriving at a second listing set {@code pendingMeasure} but left
 * {@code fillHeightPx} alone, and {@code measureFill} returns immediately while that is set. The
 * new listing inherited the height the previous one had been given.
 */
const crud = (over: Record<string, any> = {}) => ({
    fillHeightPx: undefined as number | undefined,
    pendingMeasure: false,
    corrections: 0,
    measureFill: vi.fn(),
    trimOverflow: vi.fn(),
    requestUpdate: vi.fn(),
    endLoading: vi.fn(),
    beginLoading: vi.fn(),
    scheduleMeasure: (MateuTableCrud.prototype as any).scheduleMeasure,
    updated: (MateuTableCrud.prototype as any).updated,
    data: {},
    id: 'listing',
    loadingSince: undefined,
    awaitingRows: false,
    // Enough of a listing for updated() to walk its component-changed branch; none of it is
    // what these assertions are about.
    component: { id: 'c2', metadata: { initialPage: 0, pageSize: 10 } },
    _initializedForComponentId: 'c2',
    state: {},
    _initStateFromUrl: (_metadata: unknown, state: any) => state,
    _filterIds: () => [] as string[],
    handleSearchRequested: vi.fn(),
    ...over,
})

// super.updated() and the rest of the base class are not part of what is being asserted.
const changed = (keys: string[]) => new Map(keys.map(key => [key, undefined])) as any

describe('the listing fill height', () => {

    it('is dropped when a different listing arrives, so the box can be measured afresh', () => {
        const element = crud({ fillHeightPx: 412 })

        ;(MateuTableCrud.prototype as any).scheduleMeasure.call(element)

        expect(element.fillHeightPx).toBeUndefined()
        expect(element.pendingMeasure).toBe(true)
    })

    /**
     * The correction counter belongs to the box that was measured, not to the next one: carrying
     * it over would spend the new listing's allowance on the previous one's overflow.
     */
    it('starts the overflow corrections over', () => {
        const element = crud({ fillHeightPx: 412, corrections: 2 })

        ;(MateuTableCrud.prototype as any).scheduleMeasure.call(element)

        expect(element.corrections).toBe(0)
    })

    it('asks for a render when there was no height to drop', () => {
        const element = crud({ fillHeightPx: undefined })

        ;(MateuTableCrud.prototype as any).scheduleMeasure.call(element)

        // Nothing changed that Lit would notice on its own, so the re-render has to be requested
        // or the natural layout is never laid out and never measured.
        expect(element.requestUpdate).toHaveBeenCalled()
    })

    /**
     * The one that bites. The three above describe scheduleMeasure, which was always right; what
     * was wrong is that arriving at a new listing did not call it.
     */
    it('a new listing drops the previous one\'s height instead of inheriting it', () => {
        const element = crud({ fillHeightPx: 412 })

        ;(MateuTableCrud.prototype as any).updated.call(element, changed(['component']))

        expect(element.fillHeightPx)
            .toBeUndefined()
        expect(element.pendingMeasure).toBe(true)
    })

    /**
     * And nothing is measured on that pass: dropping the height only takes effect on the next
     * render, so measuring now would read the layout the PREVIOUS fill produced — the feedback
     * loop this component was written to avoid.
     */
    it('does not measure on the pass that dropped the height', () => {
        const element = crud({ fillHeightPx: 412 })

        ;(MateuTableCrud.prototype as any).updated.call(element, changed(['component']))

        expect(element.measureFill).not.toHaveBeenCalled()
        expect(element.trimOverflow).not.toHaveBeenCalled()
    })

    it('still measures on an ordinary re-render', () => {
        const element = crud({ fillHeightPx: 412 })

        ;(MateuTableCrud.prototype as any).updated.call(element, changed(['data']))

        expect(element.fillHeightPx).toBe(412)
        expect(element.measureFill).toHaveBeenCalled()
        expect(element.trimOverflow).toHaveBeenCalled()
    })
})
