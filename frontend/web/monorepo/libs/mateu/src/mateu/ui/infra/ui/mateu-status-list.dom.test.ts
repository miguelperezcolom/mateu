// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import './mateu-status-list'
import type { MateuStatusList } from './mateu-status-list'

/** The status list: classic rows (avatar/icon, title, description, chip) or stacked cards with actions. */
describe('mateu-status-list (DOM)', () => {
    let events: { actionId: string, parameters: Record<string, unknown> }[]
    const listener = (e: Event) => events.push((e as CustomEvent).detail)
    const mount = async (props: Partial<MateuStatusList>) => {
        const el = document.createElement('mateu-status-list') as MateuStatusList
        Object.assign(el, props)
        document.body.appendChild(el)
        await el.updateComplete
        return el
    }
    const $ = (el: MateuStatusList, sel: string) => el.shadowRoot!.querySelector(sel) as HTMLElement
    const $$ = (el: MateuStatusList, sel: string) => Array.from(el.shadowRoot!.querySelectorAll(sel)) as HTMLElement[]

    beforeEach(() => { events = []; document.addEventListener('action-requested', listener) })
    afterEach(() => { document.removeEventListener('action-requested', listener); document.body.innerHTML = '' })

    const PLAIN = [
        { id: 'i1', title: 'Leaking tap', description: 'Room 204', status: 'Open', statusColor: 'error', avatar: 'JS' },
        { id: 'i2', title: 'Broken TV', icon: '📺' },
    ]

    it('plain items are classic rows; not clickable without rowActionId', async () => {
        const el = await mount({ items: PLAIN as never, compact: true, frameless: true })
        expect($(el, '.list').classList.contains('compact')).toBe(true)
        expect($(el, '.list').classList.contains('frameless')).toBe(true)
        const rows = $$(el, '.row')
        expect(rows).toHaveLength(2)
        expect(rows[0].querySelector('.avatar')!.textContent).toBe('JS')
        expect(rows[0].querySelector('.title')!.textContent).toBe('Leaking tap')
        expect(rows[0].querySelector('.description')!.textContent).toBe('Room 204')
        expect(rows[0].querySelector('.chip.error')!.textContent).toBe('Open')
        expect(rows[1].querySelector('.icon')!.textContent).toBe('📺')
        expect(rows[1].querySelector('.chip')).toBeNull()
        expect(rows[0].hasAttribute('role')).toBe(false)
        rows[0].click()
        expect(events).toEqual([])
    })

    it('with rowActionId every row is a button dispatching it with the item', async () => {
        const el = await mount({ items: PLAIN as never, rowActionId: 'openIncident' })
        const rows = $$(el, '.row')
        expect(rows[0].getAttribute('role')).toBe('button')
        expect(rows[0].getAttribute('tabindex')).toBe('0')
        rows[0].click()
        rows[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        expect(events).toEqual([
            { actionId: 'openIncident', parameters: { _item: 'i1' } },
            { actionId: 'openIncident', parameters: { _item: 'i2' } },
        ])
    })

    it('items with actions or lines stack as cards with their actions (icon or text) under them', async () => {
        const el = await mount({ items: [
            { id: 'g1', title: 'Ann', status: 'Done', statusColor: 'success', description: 'Passport', lines: ['Line A', 'Line B'],
              actionLabel: 'Edit', actionId: 'edit', actionIcon: 'vaadin:pencil', actionLabel2: 'Remove', actionId2: 'remove' },
            { id: 'g2', title: 'Bob', actionLabel3: 'Scan', actionId3: 'scan' },
        ] as never, itemHeadingLevel: 4, rowActionId: 'openGuest' })
        expect($(el, '.list').classList.contains('stacked')).toBe(true)
        const cells = $$(el, '.cell')
        expect(cells[0].classList.contains('with-lines')).toBe(true)
        expect(cells[0].querySelector('h4.cell-title')!.textContent).toBe('Ann')
        expect(cells[0].querySelector('.chip.success')!.textContent).toBe('Done')
        expect(Array.from(cells[0].querySelectorAll('.cell-line')).map(l => l.textContent)).toEqual(['Line A', 'Line B'])
        const icon = cells[0].querySelector('button.icon-action') as HTMLElement
        expect(icon.getAttribute('aria-label')).toBe('Edit')
        icon.click()
        ;(cells[0].querySelector('button.row-action') as HTMLElement).click()
        ;(cells[1].querySelector('button.row-action') as HTMLElement).click()
        // the action buttons do not also open the row
        expect(events).toEqual([
            { actionId: 'edit', parameters: { _item: 'g1' } },
            { actionId: 'remove', parameters: { _item: 'g1' } },
            { actionId: 'scan', parameters: { _item: 'g2' } },
        ])
        cells[1].click()
        expect(events.at(-1)).toEqual({ actionId: 'openGuest', parameters: { _item: 'g2' } })
        // Enter on an action button (which the browser turns into its click) does not also open the row
        const before = events.length
        cells[0].querySelector('button.icon-action')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }))
        expect(events).toHaveLength(before)
    })

    it('columns > 1 lays the stacked cards on a responsive grid with h3 titles by default', async () => {
        const el = await mount({ items: PLAIN as never, columns: 3 })
        const list = $(el, '.list')
        expect(list.classList.contains('grid')).toBe(true)
        expect(list.getAttribute('style')).toContain('100% / 3')
        expect($$(el, 'h3.cell-title').map(h => h.textContent)).toEqual(['Leaking tap', 'Broken TV'])
        expect($(el, '.cell-actions')).toBeNull()
    })
})
