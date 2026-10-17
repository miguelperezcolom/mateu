// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import './mateu-shortcuts-help'
import type { MateuShortcutsHelp } from './mateu-shortcuts-help'

afterEach(() => { document.body.innerHTML = '' })

async function mount(shortcuts: any[] = []) {
    const el = document.createElement('mateu-shortcuts-help') as MateuShortcutsHelp
    el.shortcuts = shortcuts
    el.run = vi.fn()
    document.body.appendChild(el)
    await el.updateComplete
    return el
}

describe('keyboard shortcuts help', () => {
    it('renders nothing until shown', async () => {
        const el = await mount()
        expect(el.shadowRoot!.querySelector('[role=dialog]')).toBeNull()
    })

    it('lists app shortcuts with their codes, the screen shortcuts and the shell keys', async () => {
        // a screen action with a shortcut, read from the DOM when the overlay opens
        const button = document.createElement('button')
        button.setAttribute('data-shortcut', 'ctrl+s')
        button.textContent = 'Save'
        button.getClientRects = () => [{}] as any
        document.body.appendChild(button)
        const el = await mount([
            { key: 'f9', label: 'Arrivals', route: '/arrivals', code: 'ARR' },
            { label: 'No key nor code' },
        ])
        el.show()
        await el.updateComplete
        const dialog = el.shadowRoot!.querySelector('[role=dialog]')!
        expect(dialog.getAttribute('aria-modal')).toBe('true')
        const rows = [...dialog.querySelectorAll('button.row')]
        expect(rows).toHaveLength(1)
        expect(rows[0].querySelector('.label')!.textContent).toBe('Arrivals')
        expect(rows[0].querySelector('.code')!.textContent).toBe('ARR')
        expect(rows[0].querySelector('kbd')).toBeTruthy()
        const statics = [...dialog.querySelectorAll('li.static .label')].map(l => l.textContent)
        expect(statics).toEqual(['Save', 'Show this list', 'Command palette'])
    })

    it('picking an app shortcut closes the overlay and runs it', async () => {
        const shortcut = { key: 'f9', label: 'Arrivals', route: '/arrivals' }
        const el = await mount([shortcut])
        el.show()
        await el.updateComplete
        ;(el.shadowRoot!.querySelector('button.row') as HTMLButtonElement).click()
        await el.updateComplete
        expect(el.run).toHaveBeenCalledWith(shortcut)
        expect(el.shadowRoot!.querySelector('[role=dialog]')).toBeNull()
    })

    it('closes on Escape, on ✕ and on the backdrop', async () => {
        const el = await mount([{ key: 'f9', label: 'A' }])
        el.show(); await el.updateComplete
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await el.updateComplete
        expect(el.open).toBe(false)
        el.show(); await el.updateComplete
        ;(el.shadowRoot!.querySelector('.close') as HTMLButtonElement).click()
        expect(el.open).toBe(false)
        el.show(); await el.updateComplete
        ;(el.shadowRoot!.querySelector('.backdrop') as HTMLElement).click()
        expect(el.open).toBe(false)
        // Escape while closed is not ours
        const e = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
        document.dispatchEvent(e)
        expect(e.defaultPrevented).toBe(false)
    })
})
