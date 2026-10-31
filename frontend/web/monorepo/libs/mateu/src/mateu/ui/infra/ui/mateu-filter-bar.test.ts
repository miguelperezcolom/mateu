// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import './mateu-filter-bar'
import type { MateuFilterBar } from './mateu-filter-bar'
import { saveView, setDefaultView, listSavedViews } from '../savedViewsStore.ts'

/**
 * The smart search bar every listing renders (Vaadin and the other web shells share it). Its wire
 * contract with mateu-table-crud: `value-changed` {fieldId, value} per condition, `search-requested`
 * to run the search, `filter-reset-requested` {fieldIds} on «Clear filters». These tests drive it
 * the way a user does — type + Enter, open the panel, pick, remove a chip — and assert the events.
 */
describe('mateu-filter-bar (smart search)', () => {
    type Ev = { type: string, detail: any }
    let events: Ev[]

    const FILTERS = [
        { fieldId: 'status', label: 'Status', dataType: 'string', options: [{ value: 'OPEN', label: 'Open' }, { value: 'CLOSED', label: 'Closed' }] },
        { fieldId: 'vip', label: 'VIP', dataType: 'bool' },
        { fieldId: 'paid', label: 'Paid', dataType: 'boolean' },
        { fieldId: 'arrival', label: 'Arrival', dataType: 'date', stereotype: 'dateRange' },
        { fieldId: 'rooms', label: 'Rooms', dataType: 'integer' },
        { fieldId: 'name', label: 'Name', dataType: 'string' },
        { fieldId: 'kind', label: 'Kind', dataType: 'string', stereotype: 'multiSelect', options: [{ value: 'A', label: 'Alpha' }, { value: 'B', label: 'Beta' }] },
        { fieldId: 'hotel', label: 'Hotel', dataType: 'string', readOnly: true },
    ]

    const mount = async (state: Record<string, unknown> = {}, metadata: Record<string, unknown> = {}) => {
        const bar = document.createElement('mateu-filter-bar') as MateuFilterBar
        bar.metadata = { type: 'Crud', filters: FILTERS, ...metadata } as never
        bar.state = state
        for (const type of ['value-changed', 'search-requested', 'filter-reset-requested']) {
            bar.addEventListener(type, (e) => events.push({ type, detail: (e as CustomEvent).detail }))
        }
        document.body.appendChild(bar)
        await bar.updateComplete
        return bar
    }
    const $ = (bar: MateuFilterBar, sel: string) => bar.shadowRoot!.querySelector(sel) as HTMLElement
    const $$ = (bar: MateuFilterBar, sel: string) => Array.from(bar.shadowRoot!.querySelectorAll(sel)) as HTMLElement[]
    const openPanel = async (bar: MateuFilterBar) => { $(bar, '.bar').click(); await bar.updateComplete }
    const pickFilter = async (bar: MateuFilterBar, label: string) => {
        await openPanel(bar)
        $$(bar, '.panel-row').find(r => r.textContent!.trim().startsWith(label))!.click()
        await bar.updateComplete
    }
    const pickRow = async (bar: MateuFilterBar, text: string) => {
        $$(bar, '.panel-row').find(r => r.textContent!.replace(/\s+/g, ' ').trim() === text)!.click()
        await bar.updateComplete
    }
    const chips = (bar: MateuFilterBar) => $$(bar, '.chip:not(.chip-scope)').map(c => c.textContent!.replace(/\s+/g, ' ').replace('✕', '').trim())

    beforeEach(() => { events = []; localStorage.clear() })
    afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers() })

    it('Enter commits the typed text as a keyword chip and searches', async () => {
        const bar = await mount()
        const input = $(bar, 'input.free-text') as HTMLInputElement
        input.value = 'ocean'
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
        await bar.updateComplete
        expect(events).toEqual([
            { type: 'value-changed', detail: { fieldId: 'searchText', value: 'ocean' } },
            { type: 'search-requested', detail: {} },
        ])
        expect(chips(bar)).toEqual(['Text: ocean'])
        expect(input.value).toBe('')
    })

    it('removing the keyword chip clears it to "" and searches again', async () => {
        const bar = await mount({ searchText: 'ocean' })
        $(bar, '.chip-remove').click()
        expect(events).toEqual([
            { type: 'value-changed', detail: { fieldId: 'searchText', value: '' } },
            { type: 'search-requested', detail: {} },
        ])
    })

    it('the panel lists only the user-settable filters; a read-only one is the listing scope, shown but not removable', async () => {
        const bar = await mount({ hotel: 'H1' })
        await openPanel(bar)
        const rows = $$(bar, '.panel-row').map(r => r.textContent!.trim())
        expect(rows).not.toContain('Hotel')
        expect(rows).toContain('Status')
        const scope = $(bar, '.chip-scope')
        expect(scope.textContent).toContain('H1')
        expect(scope.querySelector('.chip-remove')).toBeNull()
    })

    it('a select filter applies the picked option and shows its label on the chip', async () => {
        const bar = await mount()
        await pickFilter(bar, 'Status')
        await pickRow(bar, 'Closed')
        expect(events).toEqual([
            { type: 'value-changed', detail: { fieldId: 'status', value: 'CLOSED' } },
            { type: 'search-requested', detail: {} },
        ])
        expect(chips(bar)).toEqual(['Status: Closed'])
    })

    it('a boolean filter offers Yes/No for BOTH the Java "bool" and the .NET "boolean" dataType', async () => {
        for (const label of ['VIP', 'Paid']) {
            events = []
            document.body.innerHTML = ''
            const bar = await mount()
            await pickFilter(bar, label)
            expect($$(bar, '.panel-row').map(r => r.textContent!.trim())).toEqual(expect.arrayContaining(['Yes', 'No']))
            expect($(bar, '.panel-input-row')).toBeNull() // not a text input
            await pickRow(bar, 'No')
            expect(events[0].detail.value).toBe(false)
        }
    })

    it('a numeric filter applies a NUMBER, a text one a string; an empty input applies nothing', async () => {
        const bar = await mount()
        await pickFilter(bar, 'Rooms')
        const input = $(bar, '.panel-input-row input') as HTMLInputElement
        expect(input.type).toBe('number')
        input.value = ''
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
        expect(events).toEqual([])
        input.value = '3'
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
        expect(events[0]).toEqual({ type: 'value-changed', detail: { fieldId: 'rooms', value: 3 } })

        events = []
        await pickFilter(bar, 'Name')
        const text = $(bar, '.panel-input-row input') as HTMLInputElement
        text.value = 'Ada'
        ;($(bar, '.apply-button') as HTMLButtonElement).click()
        expect(events[0]).toEqual({ type: 'value-changed', detail: { fieldId: 'name', value: 'Ada' } })
    })

    it('a range filter commits both bounds to <id>_from / <id>_to', async () => {
        const bar = await mount()
        await pickFilter(bar, 'Arrival')
        ;($(bar, 'input.range-from') as HTMLInputElement).value = '2026-01-01'
        ;($(bar, 'input.range-to') as HTMLInputElement).value = ''
        ;($(bar, '.apply-button') as HTMLButtonElement).click()
        await bar.updateComplete
        expect(events).toEqual([
            { type: 'value-changed', detail: { fieldId: 'arrival_from', value: '2026-01-01' } },
            { type: 'value-changed', detail: { fieldId: 'arrival_to', value: undefined } },
            { type: 'search-requested', detail: {} },
        ])
        expect(chips(bar)).toEqual(['Arrival: ≥ 2026-01-01'])
    })

    it('removing a range chip clears BOTH keys', async () => {
        const bar = await mount({ arrival_from: '2026-01-01', arrival_to: '2026-02-01' })
        expect(chips(bar)).toEqual(['Arrival: 2026-01-01 – 2026-02-01'])
        $(bar, '.chip-remove').click()
        expect(events).toEqual([
            { type: 'value-changed', detail: { fieldId: 'arrival_from', value: undefined } },
            { type: 'value-changed', detail: { fieldId: 'arrival_to', value: undefined } },
            { type: 'search-requested', detail: {} },
        ])
    })

    it('a multi-select toggles values, searches each time and keeps the panel open', async () => {
        const bar = await mount()
        await pickFilter(bar, 'Kind')
        await pickRow(bar, 'Alpha')
        await pickRow(bar, 'Beta')
        expect(events.filter(e => e.type === 'value-changed').map(e => e.detail.value)).toEqual([['A'], ['A', 'B']])
        expect(events.filter(e => e.type === 'search-requested')).toHaveLength(2)
        expect($(bar, '.panel')).not.toBeNull()
        await pickRow(bar, '✓ Alpha')
        expect(events.at(-2)!.detail.value).toEqual(['B'])
    })

    it('a boolean restored from the URL (the text "true") reads as Yes, not "true"', async () => {
        const bar = await mount({ vip: 'true', paid: 'false' })
        expect(chips(bar)).toEqual(['VIP: Yes', 'Paid: No'])
    })

    it('a multi-select restored from the URL as a comma-joined string reads as its values', async () => {
        const bar = await mount({ kind: 'A,B' })
        expect(chips(bar)).toEqual(['Kind: Alpha, Beta'])
    })

    it('«Clear filters» resets every key (range bounds and the id set included) and searches', async () => {
        const bar = await mount({ status: 'OPEN' })
        await openPanel(bar)
        await pickRow(bar, 'Clear filters')
        const reset = events.find(e => e.type === 'filter-reset-requested')!
        expect(reset.detail.fieldIds).toEqual(expect.arrayContaining(['status', 'vip', 'arrival_from', 'arrival_to', 'ids']))
        expect(reset.detail.fieldIds).not.toContain('arrival')
        expect(events.at(-1)!.type).toBe('search-requested')
        expect(chips(bar)).toEqual([])
    })

    it('a listing that is not searchable has no free-text field', async () => {
        const bar = await mount({}, { searchable: false })
        expect($(bar, 'input.free-text')).toBeNull()
    })

    it('saved views: a named snapshot is saved for this path and applying it replaces the conditions', async () => {
        const bar = await mount({ status: 'OPEN', arrival_from: '2026-01-01' })
        ;($(bar, '.views-button') as HTMLButtonElement).click()
        await bar.updateComplete
        const name = $(bar, 'input.view-name-input') as HTMLInputElement
        name.value = 'Open from Jan'
        name.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
        expect(listSavedViews(window.location.pathname)).toEqual([
            { name: 'Open from Jan', values: { status: 'OPEN', arrival_from: '2026-01-01' } },
        ])
        await bar.updateComplete
        events = []
        ;(bar.shadowRoot!.querySelector('.view-name') as HTMLElement).click()
        expect(events[0].type).toBe('filter-reset-requested')
        expect(events.filter(e => e.type === 'value-changed').map(e => e.detail))
            .toEqual([{ fieldId: 'status', value: 'OPEN' }, { fieldId: 'arrival_from', value: '2026-01-01' }])
        expect(events.at(-1)!.type).toBe('search-requested')
    })

    it('the default saved view is applied on open when the URL carries no params', async () => {
        vi.useFakeTimers()
        saveView(window.location.pathname, { name: 'mine', values: { status: 'CLOSED' } })
        setDefaultView(window.location.pathname, 'mine')
        await mount()
        vi.advanceTimersByTime(1)
        expect(events.filter(e => e.type === 'value-changed').map(e => e.detail)).toEqual([{ fieldId: 'status', value: 'CLOSED' }])
    })

    it('the default view does NOT override conditions that are already set', async () => {
        vi.useFakeTimers()
        saveView(window.location.pathname, { name: 'mine', values: { status: 'CLOSED' } })
        setDefaultView(window.location.pathname, 'mine')
        await mount({ status: 'OPEN' })
        vi.advanceTimersByTime(1)
        expect(events).toEqual([])
    })

    it('its own words follow the page language (they used to be hard-coded English)', async () => {
        document.documentElement.lang = 'es'
        try {
            const bar = await mount({ status: 'OPEN' })
            expect($(bar, '.chip-remove').getAttribute('aria-label')).toBe('Quitar el filtro Status')
            document.body.innerHTML = ''
            const empty = await mount()
            ;($(empty, '.views-button') as HTMLButtonElement).click()
            await empty.updateComplete
            expect($$(empty, '.views-empty').map(e => e.textContent!.trim()))
                .toContain('Aplica algún filtro para guardar una vista')
        } finally {
            document.documentElement.lang = ''
        }
    })

    it('a click outside closes the panel', async () => {
        const bar = await mount()
        await openPanel(bar)
        expect($(bar, '.panel')).not.toBeNull()
        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }))
        await bar.updateComplete
        expect($(bar, '.panel')).toBeNull()
    })

    it('draws no search box for a listing with nothing to search and no filters', async () => {
        // a nested listing over a source that takes no text: a box nobody can type in is a trap
        const bar = await mount({}, { searchable: false, filters: [] })
        expect($(bar, '.smart-search')).toBeNull()
        expect($(bar, 'input.free-text')).toBeNull()
        bar.remove()
    })

    it('still draws the bar when only the free text is off but there are filters', async () => {
        const bar = await mount({}, { searchable: false })
        expect($(bar, '.smart-search')).not.toBeNull()
        expect($(bar, 'input.free-text')).toBeNull()
        bar.remove()
    })
})

