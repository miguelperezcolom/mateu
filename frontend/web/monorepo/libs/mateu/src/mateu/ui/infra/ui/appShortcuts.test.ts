import { describe, expect, it } from 'vitest'
import { appShortcutFor, isHelpKey, keyLabel, quickLaunchMatch, shortcutsMatching, worksWhileTyping } from './appShortcuts'

const shortcuts = [
    { key: 'f9', label: 'Reservations', route: '/reservations', code: 'RES' },
    { key: 'alt+g', label: 'Guests', route: '/guests', code: 'GST' },
    { key: 'g', label: 'Plain letter', route: '/plain' },
    { code: 'SYNC', label: 'Sync now', actionId: 'syncNow' },
]

const key = (k: string, extra: Partial<KeyboardEvent> = {}) =>
    ({ key: k, code: '', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, ...extra }) as KeyboardEvent

describe('app shortcuts', () => {
    it('matches a function key and a combination', () => {
        expect(appShortcutFor(shortcuts, key('F9'), false)?.route).toBe('/reservations')
        expect(appShortcutFor(shortcuts, key('©', { altKey: true, code: 'KeyG' }), false)?.route).toBe('/guests')
        expect(appShortcutFor(shortcuts, key('F8'), false)).toBeUndefined()
    })

    it('does not take a plain letter while the user types, but does take F-keys and combinations', () => {
        expect(appShortcutFor(shortcuts, key('g'), true)).toBeUndefined()
        expect(appShortcutFor(shortcuts, key('g'), false)?.route).toBe('/plain')
        expect(appShortcutFor(shortcuts, key('F9'), true)?.route).toBe('/reservations')
        expect(worksWhileTyping('ctrl+s')).toBe(true)
        expect(worksWhileTyping('f12')).toBe(true)
        expect(worksWhileTyping('x')).toBe(false)
    })

    it('opens the list on "?" only when not typing', () => {
        expect(isHelpKey(key('?', { shiftKey: true }), false)).toBe(true)
        expect(isHelpKey(key('?', { shiftKey: true }), true)).toBe(false)
        expect(isHelpKey(key('?', { ctrlKey: true }), false)).toBe(false)
    })

    it('quick-launches by exact code, case-insensitive', () => {
        expect(quickLaunchMatch(shortcuts, ' res ')?.route).toBe('/reservations')
        expect(quickLaunchMatch(shortcuts, 're')).toBeUndefined()
        expect(quickLaunchMatch(shortcuts, '')).toBeUndefined()
    })

    it('lists code matches before label matches', () => {
        expect(shortcutsMatching(shortcuts, 'gu').map((s) => s.label)).toEqual(['Guests'])
        expect(shortcutsMatching(shortcuts, 's').map((s) => s.label)).toEqual(['Sync now', 'Reservations', 'Guests'])
    })

    it('formats keys for display', () => {
        expect(keyLabel('f9')).toBe('F9')
        expect(keyLabel('ctrl+alt+r')).toBe('Ctrl+Alt+R')
        expect(keyLabel(undefined)).toBe('')
    })
})
