/**
 * Keyboard-shortcut helpers shared by mateu-component (action / tab shortcuts)
 * and mateu-grid (row-selection shortcuts).
 *
 * A shortcut string is `+`-separated modifiers plus a key, e.g. "ctrl+alt+s".
 * Recognised modifiers: ctrl, alt, shift, meta.
 */

/** True when the event's modifier keys exactly match the ones declared in the shortcut. */
export const modifiersMatch = (shortcut: string, e: KeyboardEvent): boolean => {
    const parts = shortcut.toLowerCase().split('+')
    return e.ctrlKey === parts.includes('ctrl')
        && e.altKey === parts.includes('alt')
        && e.shiftKey === parts.includes('shift')
        && e.metaKey === parts.includes('meta')
}

/**
 * True when the keyboard event matches the shortcut (modifiers AND key).
 * Matches by logical key, or by physical code (KeyX / DigitX / NumpadX) so modifier
 * shortcuts work across keyboard layouts (e.g. Spanish AltGr remaps Ctrl+Alt+<letter>
 * to a symbol) and on the numeric keypad.
 */
export const shortcutMatchesEvent = (shortcut: string, e: KeyboardEvent): boolean => {
    if (!modifiersMatch(shortcut, e)) return false
    const parts = shortcut.toLowerCase().split('+')
    const key = parts[parts.length - 1]
    if (e.key.toLowerCase() === key) return true
    if (/^[a-z]$/.test(key) && e.code === 'Key' + key.toUpperCase()) return true
    if (/^[0-9]$/.test(key) && (e.code === 'Digit' + key || e.code === 'Numpad' + key)) return true
    return false
}

/** Formats a shortcut for display in a tooltip: "ctrl+alt+s" → "Ctrl+Alt+S". */
export const formatShortcut = (shortcut?: string): string | undefined =>
    shortcut
        ? shortcut.split('+').map(p => p.length <= 1 ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1)).join('+')
        : undefined
