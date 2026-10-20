import { describe, expect, it } from 'vitest'
import { isLeaveAction } from './leaveActions'

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
})
