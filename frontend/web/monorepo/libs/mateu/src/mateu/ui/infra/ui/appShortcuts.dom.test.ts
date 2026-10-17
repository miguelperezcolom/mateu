// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { isTypingTarget, screenShortcuts } from './appShortcuts'

/**
 * The DOM half of the app shortcuts: whether the focus is somewhere the user types (so a plain-key
 * shortcut stands down), and the screen's own shortcuts the "?" list shows next to the app's.
 */

afterEach(() => { document.body.innerHTML = '' })

const visible = (el: HTMLElement) => {
    // jsdom does no layout: a rendered control is one with client rects
    el.getClientRects = () => [{}] as unknown as DOMRectList
    return el
}

describe('isTypingTarget', () => {
    it('text inputs, textareas, selects and contenteditable are typing; buttons and checkboxes are not', () => {
        const make = (html: string) => {
            document.body.innerHTML = html
            return document.body.firstElementChild
        }
        expect(isTypingTarget(make('<input type="text">'))).toBe(true)
        expect(isTypingTarget(make('<input>'))).toBe(true)
        expect(isTypingTarget(make('<textarea></textarea>'))).toBe(true)
        expect(isTypingTarget(make('<select></select>'))).toBe(true)
        expect(isTypingTarget(make('<input type="checkbox">'))).toBe(false)
        expect(isTypingTarget(make('<button>Go</button>'))).toBe(false)
        const editable = make('<div contenteditable="true"></div>') as HTMLElement
        Object.defineProperty(editable, 'isContentEditable', { value: true })
        expect(isTypingTarget(editable)).toBe(true)
        expect(isTypingTarget(null)).toBe(false)
    })

    it('follows the focus into shadow roots (every Mateu field lives in one)', () => {
        const host = document.createElement('mateu-field-like')
        const root = host.attachShadow({ mode: 'open' })
        const input = document.createElement('input')
        root.appendChild(input)
        document.body.appendChild(host)
        input.focus()
        expect(isTypingTarget(document.activeElement)).toBe(true)
    })
})

describe('screenShortcuts', () => {
    it('lists visible controls that declare a shortcut and the @Action shortcuts of the components, once per key', () => {
        const save = visible(document.createElement('button'))
        save.setAttribute('data-shortcut', 'Ctrl+S')
        save.textContent = '  Save   draft '
        const hidden = document.createElement('button')
        hidden.setAttribute('data-shortcut', 'ctrl+h')
        hidden.textContent = 'Hidden'
        const tab = visible(document.createElement('vaadin-tab'))
        tab.setAttribute('data-shortcut', 'alt+1')
        tab.setAttribute('aria-label', 'General')

        const comp = document.createElement('mateu-component') as HTMLElement & { component: unknown }
        comp.component = {
            actions: [
                { id: 'nested-form-action-guestList-reloadPax', shortcut: 'ctrl+alt+r' },
                { id: 'sendInvoice', shortcut: 'ctrl+i' },
                { id: 'withLabel', shortcut: 'ctrl+l', label: 'Lookup' },
                { id: 'duplicate', shortcut: 'ctrl+s' },
                { id: 'noShortcut' },
            ],
        }
        // a control inside a component's shadow root is found too
        const shadowHost = document.createElement('div')
        const root = shadowHost.attachShadow({ mode: 'open' })
        const inner = visible(document.createElement('button'))
        inner.setAttribute('data-shortcut', 'f2')
        inner.textContent = 'Rename'
        root.appendChild(inner)

        document.body.append(save, hidden, tab, comp, shadowHost)

        expect(screenShortcuts(document)).toEqual([
            { key: 'ctrl+s', label: 'Save draft' },
            { key: 'alt+1', label: 'General' },
            { key: 'ctrl+alt+r', label: 'Reload pax' },
            { key: 'ctrl+i', label: 'Send invoice' },
            { key: 'ctrl+l', label: 'Lookup' },
            { key: 'f2', label: 'Rename' },
        ])
    })
})
