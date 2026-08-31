import { describe, it, expect } from 'vitest'
import { numericCommitValue, isNoOpCommit } from './fieldValue'

describe('numericCommitValue', () => {

    it('commits nothing for an empty field, rather than NaN', () => {
        // The whole point: NaN in state is unrecoverable, because it compares unequal to itself and
        // to the value that produced it, so nothing downstream can ever decide it has settled.
        expect(numericCommitValue('', true)).toBe(null)
        expect(numericCommitValue('   ', true)).toBe(null)
        expect(numericCommitValue(null, true)).toBe(null)
        expect(numericCommitValue(undefined, true)).toBe(null)
    })

    it('commits nothing for input that is not a number', () => {
        expect(numericCommitValue('abc', true)).toBe(null)
        expect(numericCommitValue('abc', false)).toBe(null)
    })

    it('parses as the control that produced it does', () => {
        expect(numericCommitValue('7', true)).toBe(7)
        expect(numericCommitValue('7.5', false)).toBe(7.5)
        expect(numericCommitValue('-3', true)).toBe(-3)
        expect(numericCommitValue('0', true)).toBe(0)
    })

    it('keeps zero, which is a value and not an absence', () => {
        // The distinction the nullable type exists for: unset means "inherit the default", zero
        // means zero. Collapsing them would be the same bug wearing better clothes.
        expect(numericCommitValue(0, true)).toBe(0)
        expect(numericCommitValue('0', false)).toBe(0)
    })
})

describe('isNoOpCommit', () => {

    it('treats blank and absent as the same fact', () => {
        expect(isNoOpCommit('', undefined)).toBe(true)
        expect(isNoOpCommit('', null)).toBe(true)
        expect(isNoOpCommit(null, '')).toBe(true)
    })

    it('still sees a real edit', () => {
        expect(isNoOpCommit('3', null)).toBe(false)
        expect(isNoOpCommit('', 'something')).toBe(false)
        expect(isNoOpCommit('4', 3)).toBe(false)
    })

    it('keeps the loose comparison a control and its state need', () => {
        // The control reports a string; state may hold the number the server sent.
        expect(isNoOpCommit('5', 5)).toBe(true)
    })
})
