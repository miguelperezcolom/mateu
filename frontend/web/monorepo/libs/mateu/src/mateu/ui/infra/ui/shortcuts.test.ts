import { describe, expect, it } from 'vitest'
import { formatShortcut, modifiersMatch, shortcutMatchesEvent } from './shortcuts'

const keyEvent = (overrides: Partial<KeyboardEvent> = {}): KeyboardEvent =>
    ({
        key: '',
        code: '',
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        ...overrides,
    }) as KeyboardEvent

describe('modifiersMatch', () => {
    it('matches when exactly the declared modifiers are pressed', () => {
        expect(modifiersMatch('ctrl+shift', keyEvent({ ctrlKey: true, shiftKey: true }))).toBe(true)
        expect(modifiersMatch('ctrl+alt+s', keyEvent({ ctrlKey: true, altKey: true }))).toBe(true)
    })

    it('rejects missing or extra modifiers', () => {
        expect(modifiersMatch('ctrl+shift', keyEvent({ ctrlKey: true }))).toBe(false)
        expect(modifiersMatch('ctrl', keyEvent({ ctrlKey: true, metaKey: true }))).toBe(false)
        expect(modifiersMatch('enter', keyEvent({ ctrlKey: true }))).toBe(false)
    })

    it('is case insensitive', () => {
        expect(modifiersMatch('Ctrl+Alt', keyEvent({ ctrlKey: true, altKey: true }))).toBe(true)
    })
})

describe('shortcutMatchesEvent', () => {
    it('matches by logical key', () => {
        expect(shortcutMatchesEvent('ctrl+s', keyEvent({ ctrlKey: true, key: 's' }))).toBe(true)
        expect(shortcutMatchesEvent('enter', keyEvent({ key: 'Enter' }))).toBe(true)
    })

    it('rejects when modifiers differ even if the key matches', () => {
        expect(shortcutMatchesEvent('ctrl+s', keyEvent({ key: 's' }))).toBe(false)
        expect(shortcutMatchesEvent('s', keyEvent({ ctrlKey: true, key: 's' }))).toBe(false)
    })

    it('matches letters by physical code so shortcuts survive layout remaps (e.g. AltGr)', () => {
        // Spanish layout: Ctrl+Alt+E produces key '€', but code stays 'KeyE'
        expect(shortcutMatchesEvent('ctrl+alt+e', keyEvent({ ctrlKey: true, altKey: true, key: '€', code: 'KeyE' }))).toBe(true)
    })

    it('matches digits by Digit and Numpad codes', () => {
        expect(shortcutMatchesEvent('ctrl+alt+1', keyEvent({ ctrlKey: true, altKey: true, key: '¡', code: 'Digit1' }))).toBe(true)
        expect(shortcutMatchesEvent('ctrl+alt+1', keyEvent({ ctrlKey: true, altKey: true, key: '1', code: 'Numpad1' }))).toBe(true)
        expect(shortcutMatchesEvent('ctrl+alt+1', keyEvent({ ctrlKey: true, altKey: true, key: 'x', code: 'Digit2' }))).toBe(false)
    })

    it('does not match a different key', () => {
        expect(shortcutMatchesEvent('ctrl+s', keyEvent({ ctrlKey: true, key: 'a', code: 'KeyA' }))).toBe(false)
    })
})

describe('formatShortcut', () => {
    it('capitalises each part for tooltips', () => {
        expect(formatShortcut('ctrl+alt+s')).toBe('Ctrl+Alt+S')
        expect(formatShortcut('enter')).toBe('Enter')
    })

    it('returns undefined for no shortcut', () => {
        expect(formatShortcut(undefined)).toBeUndefined()
        expect(formatShortcut('')).toBeUndefined()
    })
})
