import { describe, expect, it } from 'vitest'
import { hasSelection, requiresSelection, sameSelection, selectionStillOnScreen, withSelectionGate } from './selectionGate'

describe('selectionGate', () => {
    it('reads the guard off the button itself', () => {
        expect(requiresSelection({ actionId: 'cancel', rowsSelectedRequired: true })).toBe(true)
        expect(requiresSelection({ actionId: 'purge' })).toBe(false)
    })

    it('does not need the advertised action to share the button id', () => {
        // the regression: the button dispatches action-on-row-cancel while the @Action method is
        // ALSO advertised under its nested-form id — a lookup by id found nothing, the button stayed
        // enabled. The flag on the button makes the id irrelevant.
        const advertised = [{ id: 'nested-form-action-target-cancel', rowsSelectedRequired: true }]
        expect(requiresSelection({ actionId: 'action-on-row-cancel', rowsSelectedRequired: true }, advertised))
            .toBe(true)
    })

    it('falls back to the advertised action for a button without the flag (older servers)', () => {
        expect(requiresSelection({ actionId: 'delete' }, [{ id: 'delete', rowsSelectedRequired: true }])).toBe(true)
        expect(requiresSelection({ actionId: 'delete' }, [{ id: 'other', rowsSelectedRequired: true }])).toBe(false)
        expect(requiresSelection({ actionId: 'delete' }, [null, undefined])).toBe(false)
    })

    it('a selection is a non-empty array', () => {
        expect(hasSelection([{ id: 1 }])).toBe(true)
        expect(hasSelection([])).toBe(false)
        expect(hasSelection(undefined)).toBe(false)
        expect(hasSelection('x')).toBe(false)
    })

    it('disables a gated button only while nothing is selected', () => {
        const button = { actionId: 'cancel', rowsSelectedRequired: true, disabled: false }
        expect(withSelectionGate(button, []).disabled).toBe(true)
        expect(withSelectionGate(button, [{ id: 1 }])).toBe(button)
        const free = { actionId: 'purge', disabled: false }
        expect(withSelectionGate(free, [])).toBe(free)
    })

    it('never re-enables a button the server disabled', () => {
        const button = { actionId: 'cancel', rowsSelectedRequired: true, disabled: true }
        expect(withSelectionGate(button, [{ id: 1 }]).disabled).toBe(true)
    })

    describe('selectionStillOnScreen (a listing refreshed in place)', () => {
        const a = { id: 'A', _rowNumber: 0 }
        const b = { id: 'B', _rowNumber: 1 }
        const c = { id: 'C', _rowNumber: 2 }

        it('drops a deleted row, so the row that takes its place is not selected', () => {
            // B deleted: C is now row 1 — a selection kept by position would select it
            const after = [a, { id: 'C', _rowNumber: 1 }]
            expect(selectionStillOnScreen([b], after, 'id')).toEqual([])
        })

        it('keeps a row that is still there, as the row object now on screen', () => {
            const fresh = { id: 'B', _rowNumber: 0 }
            const kept = selectionStillOnScreen([b], [fresh, c], 'id')
            expect(kept).toHaveLength(1)
            expect(kept[0]).toBe(fresh)
        })

        it('keeps a selected row object that is itself on screen, even without an id', () => {
            const row = { name: 'no id' }
            expect(selectionStillOnScreen([row], [row], 'id')).toEqual([row])
        })

        it('drops what it cannot match, and an empty selection stays empty', () => {
            expect(selectionStillOnScreen([{ name: 'x' }], [{ name: 'x' }], 'id')).toEqual([])
            expect(selectionStillOnScreen([b], [a, b], undefined)).toEqual([b])
            expect(selectionStillOnScreen([{ id: 'B' }], [a, b], undefined)).toEqual([])
            expect(selectionStillOnScreen([], [a], 'id')).toEqual([])
            expect(selectionStillOnScreen(undefined, [a], 'id')).toEqual([])
        })

        it('matches ids across JSON types (7 and "7")', () => {
            const row = { id: 7 }
            expect(selectionStillOnScreen([{ id: '7' }], [row], 'id')).toEqual([row])
        })

        it('sameSelection compares the row objects', () => {
            expect(sameSelection([a, b], [a, b])).toBe(true)
            expect(sameSelection([a], [{ ...a }])).toBe(false)
            expect(sameSelection(undefined, [])).toBe(true)
        })
    })
})
