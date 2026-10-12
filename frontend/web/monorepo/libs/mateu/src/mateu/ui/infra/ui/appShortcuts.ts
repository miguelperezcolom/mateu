import type { AppShortcut } from '@mateu/shared/apiClients/dtos/componentmetadata/AppShellExtras.ts'
import { formatShortcut, shortcutMatchesEvent } from '@infra/ui/shortcuts.ts'

/**
 * APP-WIDE SHORTCUTS (`@AppShortcut`, `shortcuts:` on a YAML shell) and QUICK LAUNCH — the pure
 * part, tested without a browser.
 *
 * Precedence: a screen's own `@Action(shortcut)` / `@Tab(shortcut)` WINS. The screen's listeners
 * (mateu-component) are on `document` and call `preventDefault()` when they take a key; the app's
 * listener is on `window`, which the event reaches AFTER document in the bubble phase, and it stands
 * down on a prevented event. No registry, no ordering by mount time.
 */

type KeyLike = Pick<KeyboardEvent, 'key' | 'code' | 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'>

/** A plain key (a letter, a digit) would be eaten while the user types; a function key or a
 *  combination with Ctrl/Alt/Meta is safe in a text field. */
export const worksWhileTyping = (shortcut: string): boolean => {
    const parts = shortcut.toLowerCase().split('+').map((p) => p.trim())
    const key = parts[parts.length - 1]
    return parts.includes('ctrl') || parts.includes('alt') || parts.includes('meta') || /^f([1-9]|1[0-2])$/.test(key)
}

/** The app shortcut a keystroke presses, if any. */
export const appShortcutFor = (shortcuts: AppShortcut[] | undefined, e: KeyLike, typing: boolean): AppShortcut | undefined =>
    (shortcuts ?? []).find((s) => !!s.key
        && (!typing || worksWhileTyping(s.key))
        && shortcutMatchesEvent(s.key, e as KeyboardEvent))

/** `?` opens the shortcuts list — never while typing (it is a character). */
export const isHelpKey = (e: KeyLike, typing: boolean): boolean =>
    !typing && e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey

/** QUICK LAUNCH: the shortcut whose code is exactly what was typed (case-insensitive, trimmed). */
export const quickLaunchMatch = (shortcuts: AppShortcut[] | undefined, query: string): AppShortcut | undefined => {
    const q = query.trim().toLowerCase()
    if (!q) return undefined
    return (shortcuts ?? []).find((s) => !!s.code && s.code.trim().toLowerCase() === q)
}

/** Shortcuts whose code or label starts with / contains the query, code matches first — the rows a
 *  palette lists for the query. */
export const shortcutsMatching = (shortcuts: AppShortcut[] | undefined, query: string): AppShortcut[] => {
    const q = query.trim().toLowerCase()
    const all = (shortcuts ?? []).filter((s) => s.route || s.actionId)
    if (!q) return all
    const byCode = all.filter((s) => s.code && s.code.toLowerCase().startsWith(q))
    const byLabel = all.filter((s) => !byCode.includes(s) && s.label.toLowerCase().includes(q))
    return [...byCode, ...byLabel]
}

/** "f9" → "F9", "ctrl+alt+r" → "Ctrl+Alt+R". */
export const keyLabel = (shortcut: string | null | undefined): string => formatShortcut(shortcut ?? undefined) ?? ''

/** Whether the focus is in something the user types into (across shadow roots). */
export const isTypingTarget = (el: Element | null): boolean => {
    let node: Element | null = el
    while (node && (node as HTMLElement).shadowRoot?.activeElement) node = (node as HTMLElement).shadowRoot!.activeElement
    if (!node) return false
    const tag = node.localName
    if (tag === 'textarea' || tag === 'select') return true
    if (tag === 'input') {
        const type = (node as HTMLInputElement).type
        return !['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file'].includes(type)
    }
    return (node as HTMLElement).isContentEditable === true
}

export interface ListedShortcut { key: string, label: string }

/** The shortcuts of the screen on show, for the help list: every visible control that declares one
 *  (`data-shortcut` — buttons, tabs) and every `@Action(shortcut)` of the mateu-components on the
 *  page (an action without a visible button still answers to its key). */
export const screenShortcuts = (root: ParentNode = document): ListedShortcut[] => {
    const out: ListedShortcut[] = []
    const seen = new Set<string>()
    const add = (key: string | null | undefined, label: string) => {
        const k = (key ?? '').trim().toLowerCase()
        if (!k || seen.has(k)) return
        seen.add(k)
        out.push({ key: k, label: label || k })
    }
    const walk = (node: ParentNode) => {
        node.querySelectorAll<HTMLElement>('*').forEach((el) => {
            const declared = el.getAttribute('data-shortcut')
            if (declared && el.getClientRects().length) {
                add(declared, (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim())
            }
            if (el.localName === 'mateu-component') {
                const actions = ((el as unknown as { component?: { actions?: { id?: string, shortcut?: string, label?: string }[] } })
                    .component?.actions) ?? []
                for (const action of actions) {
                    if (action.shortcut) add(action.shortcut, action.label || humanizeId(action.id ?? ''))
                }
            }
            if (el.shadowRoot) walk(el.shadowRoot)
        })
    }
    walk(root)
    return out
}

const humanizeId = (raw: string): string => {
    // a nested form's action travels as nested-form-action-<field>-<method>: the method names it
    const id = raw.startsWith('nested-form-action-') ? raw.substring(raw.lastIndexOf('-') + 1) : raw
    const words = id.replace(/[-_]+/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2').trim().toLowerCase()
    return words ? words.charAt(0).toUpperCase() + words.slice(1) : id
}
