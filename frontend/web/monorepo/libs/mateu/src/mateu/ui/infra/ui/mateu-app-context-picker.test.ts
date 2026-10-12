// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import './mateu-app-context-picker'
import type { MateuAppContextPicker } from './mateu-app-context-picker'

// The @AppContext picker on the app header. Its options used to be plain <div>s with a click
// handler: a keyboard or screen-reader user could open the picker and never pick anything. They
// are a listbox now — reachable, announced, and picked with Enter/Space.
describe('mateu-app-context-picker', () => {
    const mount = async () => {
        localStorage.removeItem('mateu-app-context')
        const el = document.createElement('mateu-app-context-picker') as MateuAppContextPicker
        el.selector = {
            fieldName: 'region',
            label: 'Region',
            options: [{ value: 'North', label: 'North' }, { value: 'South', label: 'South' }],
        } as never
        document.body.appendChild(el)
        await el.updateComplete
        return el
    }

    it('names its button after the label and the current value, and says it opens a listbox', async () => {
        const el = await mount()
        const button = el.shadowRoot!.querySelector('button.picker-button')!
        expect(button.getAttribute('aria-label')).toBe('Region: —')
        expect(button.getAttribute('aria-haspopup')).toBe('listbox')
        expect(button.getAttribute('aria-expanded')).toBe('false')
        el.remove()
    })

    it('opens a listbox of focusable options, picked with the keyboard', async () => {
        const el = await mount()
        const pick = vi.fn()
        ;(el as unknown as { pick: typeof pick }).pick = pick
        ;(el.shadowRoot!.querySelector('button.picker-button') as HTMLButtonElement).click()
        await el.updateComplete
        expect(el.shadowRoot!.querySelector('button.picker-button')!.getAttribute('aria-expanded')).toBe('true')
        const listbox = el.shadowRoot!.querySelector('[role="listbox"]')!
        expect(listbox.getAttribute('aria-label')).toBe('Region')
        const options = Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>('[role="option"]'))
        expect(options.map((o) => o.textContent)).toEqual(['North', 'South'])
        expect(options.every((o) => o.tabIndex === 0)).toBe(true)

        options[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
        expect(el.shadowRoot!.activeElement).toBe(options[1])
        options[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        expect(pick).toHaveBeenCalledWith('South', 'South')
        el.remove()
    })
})
