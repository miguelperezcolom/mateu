import { describe, it, expect } from 'vitest'
import { confirmationDialogTexts } from './confirmationTexts.ts'
import Action from "@mateu/shared/apiClients/dtos/componentmetadata/Action"

const action = (confirmationTexts: unknown): Action =>
    ({ id: 'action-on-row-cancel', confirmationRequired: true, confirmationTexts } as unknown as Action)

describe('confirmationDialogTexts', () => {

    it('falls back to the generic wording when the action declares no texts', () => {
        expect(confirmationDialogTexts(action(null), 'en')).toEqual({
            header: 'One moment, please',
            message: 'Are you sure?',
            confirmationText: 'Yes',
            denialText: 'No',
        })
    })

    it('uses every declared text', () => {
        expect(confirmationDialogTexts(action({
            title: 'Cancel processes',
            message: 'Cancelling stops every selected process.',
            confirmationText: 'Cancel them',
            denialText: 'Keep running',
        }))).toEqual({
            header: 'Cancel processes',
            message: 'Cancelling stops every selected process.',
            confirmationText: 'Cancel them',
            denialText: 'Keep running',
        })
    })

    // The four texts travel in one record, so declaring just the message — the common case —
    // used to blank the header and leave both buttons with no label at all.
    it('keeps the generic wording for the texts left undeclared next to a message', () => {
        expect(confirmationDialogTexts(action({
            title: '',
            message: 'Cancelling stops every selected process.',
            confirmationText: '',
            denialText: '',
        }), 'en')).toEqual({
            header: 'One moment, please',
            message: 'Cancelling stops every selected process.',
            confirmationText: 'Yes',
            denialText: 'No',
        })
    })

    it('treats a blank text as undeclared', () => {
        expect(confirmationDialogTexts(action({ title: '   ', message: '  ' }), 'en').header)
            .toEqual('One moment, please')
    })

    it('survives an action with no confirmation block at all', () => {
        expect(confirmationDialogTexts(undefined, 'en').message).toEqual('Are you sure?')
    })

    // The generic wording follows the page's language: a Spanish UI said «Yes» / «No».
    it('speaks Spanish on a Spanish page', () => {
        expect(confirmationDialogTexts(action(null), 'es-ES')).toEqual({
            header: 'Un momento',
            message: '¿Seguro?',
            confirmationText: 'Sí',
            denialText: 'No',
        })
    })

    it('keeps a declared text on a Spanish page and fills only the rest', () => {
        expect(confirmationDialogTexts(action({ message: 'Se cancelará la reserva.' }), 'es')).toEqual({
            header: 'Un momento',
            message: 'Se cancelará la reserva.',
            confirmationText: 'Sí',
            denialText: 'No',
        })
    })

    it('falls back to English for any other language', () => {
        expect(confirmationDialogTexts(action(null), 'fr').confirmationText).toEqual('Yes')
    })
})
