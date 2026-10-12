import { describe, expect, it } from 'vitest'
import { hasSelection, requiresSelection, withSelectionGate } from './selectionGate'

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
})
