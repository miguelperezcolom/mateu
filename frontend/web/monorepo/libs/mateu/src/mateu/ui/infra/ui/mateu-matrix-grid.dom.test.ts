// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import './mateu-matrix-grid'
import type { MateuMatrixGrid } from './mateu-matrix-grid'

/**
 * The matrix grid as a user drives it: month headers spanning their columns, collapsible sections,
 * link cells running cellActionId, editable cells edited in place committing through editActionId.
 */
describe('mateu-matrix-grid (DOM)', () => {
    const GRID = {
        rowHeaderLabel: 'Type',
        columns: [
            { id: 'd1', label: 'Sat 31', group: 'Oct', tone: 'warning' },
            { id: 'd2', label: 'Sun 1', group: 'Nov' },
        ],
        sections: [
            { id: 'house', title: 'House', rows: [
                { id: 'avail', label: 'Available', emphasis: true, cells: [{ value: '12', link: true }, { value: '9', tone: 'danger' }] },
            ] },
            { id: 'controls', title: 'Controls', collapsed: true, rows: [
                { id: 'ob', label: 'Overbooking', editable: true, cells: [{ value: '2' }, { value: '3' }] },
            ] },
            { id: 'loose', rows: [{ id: 'note', label: 'Note', cells: [{ value: 'x' }] }] },
        ],
        cellActionId: 'openCell',
        editActionId: 'editCell',
    }
    let events: { actionId: string, parameters: Record<string, unknown> }[]
    const listener = (e: Event) => events.push((e as CustomEvent).detail)
    const mount = async (grid: unknown = GRID) => {
        const el = document.createElement('mateu-matrix-grid') as MateuMatrixGrid
        el.grid = grid as never
        document.body.appendChild(el)
        await el.updateComplete
        return el
    }
    const $ = (el: MateuMatrixGrid, sel: string) => el.shadowRoot!.querySelector(sel) as HTMLElement
    const $$ = (el: MateuMatrixGrid, sel: string) => Array.from(el.shadowRoot!.querySelectorAll(sel)) as HTMLElement[]
    const rowHeads = (el: MateuMatrixGrid) => $$(el, 'tbody tr').map(r => r.querySelector('th')!.textContent!.replace(/[▸▾]/g, '').trim())
    const toggle = async (el: MateuMatrixGrid, title: string) => {
        $$(el, 'button.toggle').find(b => b.textContent!.includes(title))!.click()
        await el.updateComplete
    }
    const cellsOf = (el: MateuMatrixGrid, label: string) =>
        Array.from($$(el, 'tbody tr').find(r => r.querySelector('th')!.textContent!.trim() === label)!.querySelectorAll('td')) as HTMLElement[]

    beforeEach(() => { events = []; document.addEventListener('action-requested', listener) })
    afterEach(() => { document.removeEventListener('action-requested', listener); document.body.innerHTML = '' })

    it('paints month groups over their columns, tones, and starts with declared sections folded', async () => {
        const el = await mount()
        expect($$(el, 'th.group').map(g => [g.textContent, g.getAttribute('colspan')])).toEqual([['Oct', '1'], ['Nov', '1']])
        expect($(el, 'th.corner').getAttribute('rowspan')).toBe('2')
        expect($(el, 'th.corner').textContent).toBe('Type')
        expect($$(el, 'th.col').map(c => c.textContent)).toEqual(['Sat 31', 'Sun 1'])
        expect($$(el, 'th.col')[0].classList.contains('warning')).toBe(true)
        expect(rowHeads(el)).toEqual(['House', 'Available', 'Controls', 'Note'])
        expect($$(el, 'button.toggle').map(b => b.getAttribute('aria-expanded'))).toEqual(['true', 'false'])
        expect($$(el, 'tbody tr')[1].classList.contains('emphasis')).toBe(true)
        expect(cellsOf(el, 'Available')[1].classList.contains('danger')).toBe(true)
    })

    it('without column groups the corner sits in the single header row', async () => {
        const el = await mount({ ...GRID, columns: [{ id: 'd1' }] })
        expect($$(el, 'thead tr')).toHaveLength(1)
        expect($(el, 'th.corner').hasAttribute('rowspan')).toBe(false)
        expect($(el, 'th.col').textContent).toBe('d1')
    })

    it('folding is client-side and survives a new grid from the server', async () => {
        const el = await mount()
        await toggle(el, 'Controls')
        expect(rowHeads(el)).toContain('Overbooking')
        await toggle(el, 'House')
        expect(rowHeads(el)).not.toContain('Available')
        el.grid = { ...GRID } as never
        await el.updateComplete
        expect(rowHeads(el)).toEqual(['House', 'Controls', 'Overbooking', 'Note'])
    })

    it('a link cell runs cellActionId with the row, column and value', async () => {
        const el = await mount()
        const link = cellsOf(el, 'Available')[0].querySelector('button.link') as HTMLElement
        expect(link.getAttribute('aria-label')).toBe('Available, Sat 31: 12')
        link.click()
        expect(events).toEqual([{ actionId: 'openCell', parameters: { _rowId: 'avail', _columnId: 'd1', _value: '12' } }])
    })

    it('an editable cell edits in place: Enter commits a change, Escape cancels, an unchanged value sends nothing', async () => {
        const el = await mount()
        await toggle(el, 'Controls')
        let cell = cellsOf(el, 'Overbooking')[0]
        expect(cell.getAttribute('tabindex')).toBe('0')
        cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
        await el.updateComplete
        let input = cellsOf(el, 'Overbooking')[0].querySelector('input') as HTMLInputElement
        expect(input.value).toBe('2')
        expect(el.shadowRoot!.activeElement).toBe(input)
        input.value = '5'
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        await el.updateComplete
        expect(events).toEqual([{ actionId: 'editCell', parameters: { _rowId: 'ob', _columnId: 'd1', _value: '5' } }])
        expect(cellsOf(el, 'Overbooking')[0].querySelector('input')).toBeNull()
        // the browser drops the focus of the removed editor; jsdom keeps it until something else
        // takes the focus, and only then blurs it — after the edit ended, so it commits nothing
        cellsOf(el, 'Overbooking')[1].focus()
        expect(events).toHaveLength(1)

        cell = cellsOf(el, 'Overbooking')[1]
        cell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
        await el.updateComplete
        input = cellsOf(el, 'Overbooking')[1].querySelector('input') as HTMLInputElement
        input.value = '7'
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await el.updateComplete
        expect(cellsOf(el, 'Overbooking')[1].textContent).toBe('3')
        cellsOf(el, 'Overbooking')[0].focus() // the cancelled editor loses the focus: nothing is committed
        expect(events).toHaveLength(1)

        cellsOf(el, 'Overbooking')[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'F2', bubbles: true, cancelable: true }))
        await el.updateComplete
        input = cellsOf(el, 'Overbooking')[1].querySelector('input') as HTMLInputElement
        input.dispatchEvent(new Event('blur'))
        await el.updateComplete
        expect(events).toHaveLength(1)
    })

    it('a blur commits a changed value; rows without editActionId are not editable', async () => {
        const el = await mount()
        await toggle(el, 'Controls')
        cellsOf(el, 'Overbooking')[1].dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
        await el.updateComplete
        const input = cellsOf(el, 'Overbooking')[1].querySelector('input') as HTMLInputElement
        input.value = '4'
        input.dispatchEvent(new Event('blur'))
        expect(events).toEqual([{ actionId: 'editCell', parameters: { _rowId: 'ob', _columnId: 'd2', _value: '4' } }])

        const ro = await mount({ ...GRID, editActionId: undefined, cellActionId: undefined, sections: [GRID.sections[1]].map(s => ({ ...s, collapsed: false })) })
        const c = Array.from(ro.shadowRoot!.querySelectorAll('tbody tr'))[1].querySelector('td') as HTMLElement
        expect(c.hasAttribute('tabindex')).toBe(false)
        c.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
        await ro.updateComplete
        expect(ro.shadowRoot!.querySelector('td.editing')).toBeNull()
    })

    it('renders nothing without a grid', async () => {
        const el = await mount(null)
        expect($(el, 'table')).toBeNull()
    })
})
