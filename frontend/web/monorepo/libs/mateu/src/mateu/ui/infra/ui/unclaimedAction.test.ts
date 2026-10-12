import { describe, expect, it } from 'vitest'
import { unclaimedActionWarning } from './unclaimedAction'

describe('unclaimedActionWarning', () => {
    it('names the lost action id', () => {
        expect(unclaimedActionWarning({ actionId: 'saveDraft' })).toContain('"saveDraft"')
    })
    it('says nothing without an id', () => {
        expect(unclaimedActionWarning({})).toBeNull()
        expect(unclaimedActionWarning(undefined)).toBeNull()
    })
})
