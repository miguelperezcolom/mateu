import { describe, expect, it } from 'vitest'
import { chatMicTitle, isChatMicShortcut } from './chatShortcut'

const key = (over: Partial<KeyboardEvent & { repeat: boolean }>) =>
    ({ key: 'M', code: 'KeyM', ctrlKey: true, shiftKey: true, altKey: false, metaKey: false, repeat: false, ...over })

describe('isChatMicShortcut', () => {
    it('is Ctrl+Shift+M', () => {
        expect(isChatMicShortcut(key({}))).toBe(true)
        expect(isChatMicShortcut(key({ key: 'm' }))).toBe(true)
    })
    it('needs exactly Ctrl and Shift', () => {
        expect(isChatMicShortcut(key({ ctrlKey: false }))).toBe(false)
        expect(isChatMicShortcut(key({ shiftKey: false }))).toBe(false)
        expect(isChatMicShortcut(key({ altKey: true }))).toBe(false)
        expect(isChatMicShortcut(key({ metaKey: true }))).toBe(false)
        expect(isChatMicShortcut(key({ ctrlKey: false, metaKey: true }))).toBe(false)
    })
    it('ignores other keys and auto-repeat', () => {
        expect(isChatMicShortcut(key({ key: 'N', code: 'KeyN' }))).toBe(false)
        expect(isChatMicShortcut(key({ repeat: true }))).toBe(false)
        expect(isChatMicShortcut(null)).toBe(false)
    })
    it('goes by the character on latin layouts and by position on the rest', () => {
        // AZERTY: the M key is where QWERTY has «;» — the character decides
        expect(isChatMicShortcut(key({ key: 'M', code: 'Semicolon' }))).toBe(true)
        expect(isChatMicShortcut(key({ key: '?', code: 'KeyM' }))).toBe(true)
        expect(isChatMicShortcut(key({ key: 'Ь', code: 'KeyM' }))).toBe(true)
        expect(isChatMicShortcut(key({ key: 'Q', code: 'KeyM' }))).toBe(false)
    })
})

describe('chatMicTitle', () => {
    it('names the action and the shortcut', () => {
        expect(chatMicTitle(false, 'es')).toBe('Dictar (Ctrl+Shift+M)')
        expect(chatMicTitle(true, 'es')).toBe('Detener dictado (Ctrl+Shift+M)')
        expect(chatMicTitle(false, 'en')).toBe('Dictate (Ctrl+Shift+M)')
        expect(chatMicTitle(true, 'en')).toBe('Stop dictation (Ctrl+Shift+M)')
    })
})
