// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'lit'
import { isButtonGroup, isSplitButton, renderButton, toolbarGroupComponent } from './buttonRenderer'

/**
 * A ButtonGroup with a primary reaches the wire as the PRIMARY Button with `split: true` and the
 * other buttons as `children`. The neutral renderer draws the primary as a button of its own and a
 * ▾ toggle named "More actions" opening a menu of the rest, each dispatching its own action.
 */
const split = {
    type: 'ClientSide', id: 'save', children: [],
    metadata: {
        type: 'Button', label: 'Save', actionId: 'save', buttonStyle: 'primary', split: true, children: [
            { type: 'Button', label: 'Save as draft', actionId: 'saveDraft' },
            { type: 'Button', label: 'Save and close', actionId: 'saveAndClose', parameters: { close: true } },
        ],
    },
} as any

afterEach(() => { document.body.innerHTML = '' })

const mount = () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    render(renderButton(split, {}, {}), host)
    const seen: unknown[] = []
    host.addEventListener('action-requested', (e) => seen.push((e as CustomEvent).detail))
    return { host, seen }
}

describe('a split button', () => {
    it('is told apart from a dropdown group', () => {
        expect(isSplitButton(split.metadata)).toBe(true)
        expect(isButtonGroup(split.metadata)).toBe(true)
        expect(isSplitButton({ ...split.metadata, split: false })).toBe(false)
        expect(isSplitButton({ ...split.metadata, children: [] })).toBe(false)
    })

    it('runs the primary from the button itself', () => {
        const { host, seen } = mount()
        const primary = host.querySelector('.mateu-split-button > button') as HTMLButtonElement
        expect(primary.textContent!.trim()).toBe('Save')
        primary.click()
        expect(seen).toEqual([{ actionId: 'save', parameters: undefined }])
    })

    it('names its toggle and lists the other buttons as menu items', () => {
        const { host } = mount()
        const summary = host.querySelector('summary')!
        expect(summary.getAttribute('aria-label')).toBe('More actions')
        expect(summary.getAttribute('aria-haspopup')).toBe('menu')
        const items = [...host.querySelectorAll('[role="menu"] [role="menuitem"]')]
        expect(items.map(i => i.textContent!.trim())).toEqual(['Save as draft', 'Save and close'])
    })

    it('a menu item dispatches its own action and closes the menu', () => {
        const { host, seen } = mount()
        const details = host.querySelector('details')!
        details.setAttribute('open', '')
        ;(host.querySelectorAll('[role="menuitem"]')[1] as HTMLButtonElement).click()
        expect(seen).toEqual([{ actionId: 'saveAndClose', parameters: { close: true } }])
        expect(details.hasAttribute('open')).toBe(false)
    })

    it('moves with the arrows and closes on Escape, giving the focus back to the toggle', () => {
        const { host } = mount()
        const details = host.querySelector('details')!
        details.setAttribute('open', '')
        const menu = host.querySelector('[role="menu"]') as HTMLElement
        const items = [...host.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')]
        items[0].focus()
        menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
        expect(document.activeElement).toBe(items[1])
        menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
        expect(document.activeElement).toBe(items[0])
        menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        expect(details.hasAttribute('open')).toBe(false)
        expect(document.activeElement).toBe(host.querySelector('summary'))
    })

    it('a toolbar group becomes a content component of its own', () => {
        const c = toolbarGroupComponent(split.metadata, 'header') as any
        expect(c.type).toBe('ClientSide')
        expect(c.metadata.split).toBe(true)
        expect(c.metadata.type).toBe('Button')
        expect(c.id).toContain('save')
    })
})
