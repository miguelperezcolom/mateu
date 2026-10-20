import { describe, expect, it } from 'vitest'
import { isConflictDialogAnswer, isLeaveAction, isWizardStepAction } from './leaveActions'

describe('isLeaveAction', () => {
    it('is the set the server styles as leave actions (FormMapper) and the crud/editable view ids', () => {
        for (const id of ['cancel', 'cancel-new', 'cancel-create', 'cancel-edit', 'cancel-view', 'back', 'backToList']) {
            expect(isLeaveAction(id), id).toBe(true)
        }
    })

    it('leaves out business actions that only share the prefix, and empty ids', () => {
        for (const id of ['cancelBooking', 'save', 'backup', 'back-office', '', undefined, null]) {
            expect(isLeaveAction(id as string), String(id)).toBe(false)
        }
    })

    it('a wizard\'s step actions are not leave actions: the owner advertises next', () => {
        const wizard = ['next', 'skip', '*']
        expect(isLeaveAction('back', wizard)).toBe(false)
        expect(isWizardStepAction('goToStep', wizard)).toBe(true)
        expect(isLeaveAction('cancel', wizard)).toBe(true)
        expect(isLeaveAction('back', ['save', 'back'])).toBe(true)
        expect(isWizardStepAction('back', ['save'])).toBe(false)
    })
})

describe('isConflictDialogAnswer', () => {
    it('is true only for the buttons of the optimistic-lock conflict dialog (_conflictDialog)', () => {
        expect(isConflictDialogAnswer({ _conflictDialog: true, initiatorState: {} })).toBe(true)
        expect(isConflictDialogAnswer({ _conflictDialog: 'true' })).toBe(false)
        expect(isConflictDialogAnswer({})).toBe(false)
        expect(isConflictDialogAnswer(undefined)).toBe(false)
        expect(isConflictDialogAnswer(null)).toBe(false)
    })
})
