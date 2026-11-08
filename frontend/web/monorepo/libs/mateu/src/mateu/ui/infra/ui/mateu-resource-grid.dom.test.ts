// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import './mateu-resource-grid'

/**
 * UX review W-V-DISABLED-CELL: a disabled cell was drawn at 50 % opacity but stayed a tab stop and
 * said nothing to a screen reader. It is now `aria-disabled` and out of the tab order; the selected
 * cell says it is pressed.
 */
describe('mateu-resource-grid (DOM)', () => {
    afterEach(() => { document.body.innerHTML = '' })

    const mount = async () => {
        const grid = document.createElement('mateu-resource-grid') as HTMLElement & { items: unknown[], updateComplete: Promise<unknown> }
        grid.items = [
            { id: 'a', title: 'Room 101', selected: true },
            { id: 'b', title: 'Room 102', disabled: true },
            { id: 'c', title: 'Room 103' },
        ]
        document.body.appendChild(grid)
        await grid.updateComplete
        return Array.from(grid.shadowRoot!.querySelectorAll<HTMLElement>('.cell'))
    }

    it('a disabled cell is aria-disabled and not a tab stop', async () => {
        const [, disabled, plain] = await mount()
        expect(disabled.getAttribute('aria-disabled')).toBe('true')
        expect(disabled.getAttribute('tabindex')).toBe('-1')
        expect(plain.hasAttribute('aria-disabled')).toBe(false)
        expect(plain.getAttribute('tabindex')).toBe('0')
    })

    it('the selected cell is announced as pressed', async () => {
        const [selected, , plain] = await mount()
        expect(selected.getAttribute('aria-pressed')).toBe('true')
        expect(plain.getAttribute('aria-pressed')).toBe('false')
    })
})
