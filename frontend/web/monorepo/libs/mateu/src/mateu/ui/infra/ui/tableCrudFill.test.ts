import { describe, expect, it, vi } from 'vitest'
import { MateuTableCrud } from './mateu-table-crud'

/**
 * The listing box's fill height across a navigation from one listing to another.
 *
 * <p>The rule the component is built on: measure the box's NATURAL layout, apply the height, and
 * do not look again until something outside changes. A measurement taken while a fill is applied
 * reads the layout the fill produced, so the fill has to be out of the way for the read.
 *
 * <p>Two things have gone wrong here, and the tests below keep both from coming back. First,
 * arriving at a second listing set {@code pendingMeasure} but left {@code fillHeightPx} alone, so
 * the new listing inherited the height the previous one had been given. Then the cure had its own
 * symptom: the fill was dropped through a RENDER, which made the unfilled layout a painted frame —
 * the listing visibly collapsed to its natural height on the way into a detail view, shrinking a
 * table that was about to be replaced anyway.
 *
 * <p>So the fill is now lifted and put back inside {@code measureFill}, in one task. The rule is
 * unchanged; where it is enforced moved. These assertions are about the RULE — a new listing is
 * re-measured, and nothing is measured through an applied fill — rather than about which line
 * clears which field.
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
    measureBottomInset: () => 0,
    closest: () => null,
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

    it('marks the box for a fresh measurement when a different listing arrives', () => {
        const element = crud({ fillHeightPx: 412 })

        ;(MateuTableCrud.prototype as any).scheduleMeasure.call(element)

        expect(element.pendingMeasure).toBe(true)
        // The height deliberately survives this call. Clearing it here is what used to put the
        // unfilled layout on screen for a frame; measureFill lifts it for the read instead.
        expect(element.fillHeightPx).toBe(412)
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

    it('always asks for a render', () => {
        const element = crud({ fillHeightPx: 412 })

        ;(MateuTableCrud.prototype as any).scheduleMeasure.call(element)

        // Nothing here changes a reactive property any more, so without this the box is never
        // laid out again and never measured.
        expect(element.requestUpdate).toHaveBeenCalled()
    })

    /**
     * The one that bites: arriving at a new listing has to ask for a measurement. Without it the
     * new listing keeps whatever height the previous one was given — a short listing's box staying
     * short on a page with room for twice as much.
     */
    it('a new listing is measured afresh rather than inheriting the previous height', () => {
        const element = crud({ fillHeightPx: 412 })

        ;(MateuTableCrud.prototype as any).updated.call(element, changed(['component']))

        expect(element.pendingMeasure).toBe(true)
    })

    /**
     * And nothing is measured on that pass: the incoming component has not rendered yet, so the
     * box still in the DOM is the outgoing one.
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

    /**
     * The rule itself, at the one place that now enforces it: the read must not see the fill.
     *
     * <p>Deleting the lift leaves every other test here green — the height still gets replaced,
     * the counters still reset — and quietly reintroduces the feedback loop, where a box measures
     * the layout its own previous measurement produced. So the box is handed a stub that records
     * what its inline height was AT THE MOMENT it was measured.
     */
    it('lifts the applied fill for the read, and puts it back', () => {
        let heightWhenMeasured: string | null = null
        const box = {
            style: { height: '412px' },
            getBoundingClientRect() {
                heightWhenMeasured = box.style.height
                return { top: 100 } as DOMRect
            },
        }
        const element = crud({
            fillHeightPx: 412,
            pendingMeasure: true,
            renderRoot: { querySelector: () => box },
        })
        // This suite runs without a DOM; measureFill only needs the viewport height off window.
        const priorWindow = (globalThis as any).window
        ;(globalThis as any).window = { innerHeight: 900 }
        try {
            ;(MateuTableCrud.prototype as any).measureFill.call(element)
        } finally {
            ;(globalThis as any).window = priorWindow
        }

        expect(heightWhenMeasured).toBe('')
        // And restored, so nothing is painted unfilled between the read and the next render.
        expect(box.style.height).toBe('412px')
        expect(element.fillHeightPx).toBe(900 - 100 - 16)
        expect(element.pendingMeasure).toBe(false)
    })
})
