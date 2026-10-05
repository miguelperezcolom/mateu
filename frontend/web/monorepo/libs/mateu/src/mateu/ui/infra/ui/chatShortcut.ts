import {chatText} from './chatTexts'

/**
 * The chat's keyboard shortcut for the microphone (dictation): Ctrl+Shift+M on every platform. On
 * macOS it is Ctrl too, not Cmd — Cmd+Shift+M switches Chrome profiles and Option+M types «µ». It
 * works while the chat panel is open, also with the focus in the message field, and does what a
 * click on the mic button does.
 */
export const CHAT_MIC_SHORTCUT = 'Ctrl+Shift+M'

/** The same shortcut for aria-keyshortcuts. */
export const CHAT_MIC_ARIA_KEYSHORTCUTS = 'Control+Shift+M'

type KeyLike = Pick<KeyboardEvent, 'key' | 'code' | 'ctrlKey' | 'shiftKey' | 'altKey' | 'metaKey'> & { repeat?: boolean }

/** Whether a keydown is the mic shortcut: Ctrl+Shift+M exactly (no Alt, no Cmd), not auto-repeated.
 *  The key is matched by its character, or by its position (KeyM) on a layout whose M key types
 *  something that is not a latin letter. */
export const isChatMicShortcut = (e: KeyLike | null | undefined): boolean => {
    if (!e || !e.ctrlKey || !e.shiftKey || e.altKey || e.metaKey || e.repeat) return false
    const key = typeof e.key === 'string' ? e.key : ''
    if (/^[a-z]$/i.test(key)) return key.toLowerCase() === 'm'
    return e.code === 'KeyM'
}

/** The mic button's tooltip/label, with the shortcut: «Dictar (Ctrl+Shift+M)» / «Detener dictado (…)». */
export const chatMicTitle = (listening: boolean, lang?: string): string =>
    `${chatText(listening ? 'stopDictation' : 'dictate', lang)} (${CHAT_MIC_SHORTCUT})`
