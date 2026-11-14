import { describe, expect, it } from 'vitest'
import { headerAccountControl, initialsOf, pictureOf } from './userMenu.ts'

describe('the header user menu', () => {
    it('draws up to two initials, the first and the last word', () => {
        expect(initialsOf('Ana María López')).toBe('AL')
        expect(initialsOf('miguelperezcolom')).toBe('M')
        expect(initialsOf('ana.lopez@example.com')).toBe('AL')
        expect(initialsOf('élodie durand')).toBe('ÉD')
        expect(initialsOf('   ')).toBe('?')
        expect(initialsOf('Иван Петров')).toBe('ИП')
    })

    it('draws only an http(s) picture', () => {
        expect(pictureOf({ name: 'a', picture: 'https://avatars.example/1' })).toBe('https://avatars.example/1')
        expect(pictureOf({ name: 'a', picture: 'javascript:alert(1)' })).toBeUndefined()
        expect(pictureOf({ name: 'a', picture: 'data:image/png;base64,AAAA' })).toBeUndefined()
        expect(pictureOf({ name: 'a' })).toBeUndefined()
    })

    it('shows the menu for a named user, the bare Sign out for an unnamed session, else nothing', () => {
        expect(headerAccountControl({ name: 'Ana' }, true)).toBe('menu')
        expect(headerAccountControl({ name: 'Ana' }, false)).toBe('menu')
        expect(headerAccountControl(undefined, true)).toBe('signOut')
        expect(headerAccountControl(undefined, false)).toBe('none')
    })
})
