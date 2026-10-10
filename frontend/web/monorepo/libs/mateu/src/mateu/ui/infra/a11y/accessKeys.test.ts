import { describe, expect, it } from 'vitest'
import { assignAccessKeys, keyHint } from './accessKeys'

describe('access keys', () => {
    it('word initials first, no repeats, reserved letters skipped', () => {
        expect(assignAccessKeys(['Reservations', 'Room diary', 'Property availability', 'New reservation'], ['n']))
            .toEqual(['r', 'd', 'p', 'e'])
    })
    it('then any letter of the label, then digits; nothing left → empty', () => {
        expect(assignAccessKeys(['aa', 'a', 'a'])).toEqual(['a', '1', '2'])
        const many = assignAccessKeys(Array.from({ length: 40 }, () => 'x'))
        expect(many.filter(Boolean).length).toBe(11)
    })
    it('a declared shortcut reads as written', () => {
        expect(keyHint('ctrl+alt+7')).toBe('Ctrl+Alt+7')
    })
})
