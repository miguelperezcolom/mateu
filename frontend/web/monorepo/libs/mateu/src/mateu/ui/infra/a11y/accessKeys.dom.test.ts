// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { syncAccessKeys } from './accessKeys'

/**
 * The access-keys MODE (`@App(accessKeys = true)`) end to end over a DOM: holding Alt paints a badge
 * next to every visible button, a declared `alt+x` shortcut keeps its letter (nobody else gets it),
 * and Alt+letter — matched by the physical key, so a Mac's Alt-remapped e.key does not matter —
 * clicks the control. Buttons inside shadow roots count; hidden or disabled ones do not.
 */
describe('access keys mode', () => {
    const shown = (el: HTMLElement) => {
        el.getClientRects = () => [{}] as unknown as DOMRectList
        el.getBoundingClientRect = () => ({ left: 10, top: 10, right: 60, bottom: 30, width: 50, height: 20, x: 10, y: 10, toJSON() {} }) as DOMRect
        return el
    }
    const button = (label: string, attrs: Record<string, string> = {}, parent: ParentNode = document.body) => {
        const b = document.createElement('vaadin-button')
        b.textContent = label
        Object.entries(attrs).forEach(([k, v]) => b.setAttribute(k, v))
        parent.appendChild(b)
        return shown(b)
    }
    const key = (init: KeyboardEventInit, type = 'keydown') =>
        document.dispatchEvent(new KeyboardEvent(type, { bubbles: true, cancelable: true, ...init }))
    const badges = () => Array.from(document.querySelectorAll('.mateu-access-keys span')).map(s => s.textContent)

    beforeAll(() => syncAccessKeys(true))
    afterEach(() => { key({ key: 'Alt' }, 'keyup'); document.body.innerHTML = ''; vi.useRealTimers() })

    it('holding Alt shows a badge per visible button; letting go hides them', () => {
        vi.useFakeTimers()
        button('Save')
        button('Cancel')
        const hidden = document.createElement('vaadin-button')
        hidden.textContent = 'Invisible'
        document.body.appendChild(hidden) // no layout → not shown
        button('Disabled', { disabled: '' })
        key({ key: 'Alt', altKey: true })
        vi.advanceTimersByTime(300)
        expect(badges()).toEqual(['S', 'C'])
        expect(document.querySelector('.mateu-access-keys')!.getAttribute('aria-hidden')).toBe('true')
        key({ key: 'Alt' }, 'keyup')
        expect(document.querySelector('.mateu-access-keys')).toBeNull()
    })

    it('Alt+letter (by physical key) clicks the control with that letter', () => {
        const save = button('Save')
        const clicked = vi.fn()
        save.addEventListener('click', clicked)
        key({ key: 'ß', code: 'KeyS', altKey: true })
        expect(clicked).toHaveBeenCalledTimes(1)
        expect(document.querySelector('.mateu-access-keys')).toBeNull()
    })

    it('a declared alt+x shortcut is shown as written and its letter is reserved', () => {
        vi.useFakeTimers()
        button('Search', { 'data-shortcut': 'alt+s' })
        button('Save')
        key({ key: 'Alt', altKey: true })
        vi.advanceTimersByTime(300)
        expect(badges()).toEqual(['Alt+S', 'A'])
    })

    it('finds buttons inside shadow roots', () => {
        const host = document.createElement('div')
        document.body.appendChild(host)
        const inner = button('Export', {}, host.attachShadow({ mode: 'open' }))
        const clicked = vi.fn()
        inner.addEventListener('click', clicked)
        key({ key: 'e', code: 'KeyE', altKey: true })
        expect(clicked).toHaveBeenCalled()
    })

    it('Ctrl/Meta combos are left alone; turning the mode off silences it', () => {
        const save = button('Save')
        const clicked = vi.fn()
        save.addEventListener('click', clicked)
        key({ key: 's', code: 'KeyS', altKey: true, ctrlKey: true })
        expect(clicked).not.toHaveBeenCalled()
        syncAccessKeys(false)
        key({ key: 's', code: 'KeyS', altKey: true })
        expect(clicked).not.toHaveBeenCalled()
        syncAccessKeys(true)
        key({ key: 's', code: 'KeyS', altKey: true })
        expect(clicked).toHaveBeenCalledTimes(1)
    })

    it('a button whose action declares an @Action(shortcut) on the owning mateu-component shows it', () => {
        vi.useFakeTimers()
        const component = document.createElement('mateu-component') as HTMLElement & { component?: unknown }
        component.component = { actions: [{ id: 'save', shortcut: 'ctrl+s' }] }
        document.body.appendChild(component)
        button('Save', { 'data-action-id': 'save' }, component)
        key({ key: 'Alt', altKey: true })
        vi.advanceTimersByTime(300)
        expect(badges()).toEqual(['Ctrl+S'])
    })
})
