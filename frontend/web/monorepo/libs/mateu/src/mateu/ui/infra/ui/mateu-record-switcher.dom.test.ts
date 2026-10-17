// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const fetchExternalJson = vi.fn()
vi.mock('@infra/http/externalOptions.ts', async (importOriginal) => ({
    ...(await importOriginal<object>()),
    fetchExternalJson: (...a: unknown[]) => fetchExternalJson(...a),
}))

import './mateu-record-switcher'
import type { MateuRecordSwitcher } from './mateu-record-switcher'
import { dirtyGuard } from './dirtyGuard'

/**
 * The page header's record/context switcher: a native select for a short list, a filtering
 * combobox when searchable; a pick dispatches the page's action with `_record`, or navigates when
 * the switcher declares a route.
 */
describe('mateu-record-switcher (DOM)', () => {
    const OPTIONS = [
        { value: '1', label: 'Booking 1001', description: 'Smith' },
        { value: '2', label: 'Booking 1002', description: 'Jones' },
        { value: '3', label: 'Booking 1003', description: 'García' },
    ]
    let events: { type: string, detail: unknown }[]
    let listening: AbortController
    const mount = async (switcher: Record<string, unknown>, state: Record<string, unknown> = {}) => {
        const el = document.createElement('mateu-record-switcher') as MateuRecordSwitcher
        el.switcher = { actionId: 'switchRecord', options: OPTIONS, value: '1', ...switcher } as never
        el.state = state
        document.body.appendChild(el)
        await el.updateComplete
        return el
    }
    const $ = (el: MateuRecordSwitcher, sel: string) => el.shadowRoot!.querySelector(sel) as HTMLElement
    const $$ = (el: MateuRecordSwitcher, sel: string) => Array.from(el.shadowRoot!.querySelectorAll(sel)) as HTMLElement[]
    const key = async (el: MateuRecordSwitcher, k: string) => {
        $(el, 'input').dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))
        await el.updateComplete
    }

    beforeEach(() => {
        events = []
        listening = new AbortController()
        for (const type of ['action-requested', 'route-changed', 'navigate-to-requested']) {
            document.addEventListener(type, (e) => events.push({ type, detail: (e as CustomEvent).detail }), { signal: listening.signal })
        }
        fetchExternalJson.mockReset()
    })
    afterEach(() => { listening.abort(); document.body.innerHTML = ''; dirtyGuard.markClean(); vi.restoreAllMocks(); vi.useRealTimers() })

    it('renders nothing without a switcher', async () => {
        const el = document.createElement('mateu-record-switcher') as MateuRecordSwitcher
        document.body.appendChild(el)
        await el.updateComplete
        expect(el.shadowRoot!.querySelector('.switcher')).toBeNull()
    })

    it('a short list is a native select; picking another record dispatches the action with _record', async () => {
        const el = await mount({ label: 'Booking' })
        expect($(el, '.hint').textContent).toBe('Booking')
        const select = $(el, 'select') as HTMLSelectElement
        expect(select.getAttribute('aria-label')).toBe('Booking')
        expect(select.value).toBe('1')
        select.value = '2'
        select.dispatchEvent(new Event('change'))
        expect(events).toEqual([{ type: 'action-requested', detail: { actionId: 'switchRecord', parameters: { _record: '2' } } }])
        // the same value changes nothing
        select.value = '1'
        select.dispatchEvent(new Event('change'))
        expect(events).toHaveLength(1)
    })

    it('a context switcher is labelled "Context" by default; a disabled one cannot be used', async () => {
        const el = await mount({ type: 'context', disabled: true })
        expect($(el, '.switcher').classList.contains('context')).toBe(true)
        expect($(el, '.hint').textContent).toBe('Context')
        expect(($(el, 'select') as HTMLSelectElement).disabled).toBe(true)
        const plain = await mount({})
        expect(plain.shadowRoot!.querySelector('.hint')).toBeNull()
        expect(plain.shadowRoot!.querySelector('select')!.getAttribute('aria-label')).toBe('Switch record')
    })

    it('a searchable switcher filters a listbox as the user types and picks with the mouse', async () => {
        const el = await mount({ searchable: true })
        const input = $(el, 'input') as HTMLInputElement
        expect(input.placeholder).toBe('Booking 1001')
        input.dispatchEvent(new Event('focus'))
        await el.updateComplete
        expect(input.getAttribute('aria-expanded')).toBe('true')
        expect($$(el, '[role=option]')).toHaveLength(3)
        expect($$(el, '[role=option]')[0].getAttribute('aria-selected')).toBe('true')
        input.value = 'garcia'
        input.dispatchEvent(new Event('input'))
        await el.updateComplete
        const opts = $$(el, '[role=option]')
        expect(opts.map(o => o.querySelector('span')!.textContent)).toEqual(['Booking 1003'])
        expect(opts[0].querySelector('small')!.textContent).toBe('García')
        opts[0].dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
        await el.updateComplete
        expect(events).toEqual([{ type: 'action-requested', detail: { actionId: 'switchRecord', parameters: { _record: '3' } } }])
        expect($(el, '[role=listbox]')).toBeNull()
    })

    it('says so when nothing matches; Escape closes and clears; blur closes', async () => {
        vi.useFakeTimers()
        const el = await mount({ searchable: true })
        const input = $(el, 'input') as HTMLInputElement
        input.value = 'zzz'
        input.dispatchEvent(new Event('input'))
        await el.updateComplete
        expect($(el, '.none').textContent).toBe('No matches')
        await key(el, 'Escape')
        expect($(el, '[role=listbox]')).toBeNull()
        expect(input.value).toBe('')
        input.dispatchEvent(new Event('focus'))
        await el.updateComplete
        expect($(el, '[role=listbox]')).not.toBeNull()
        input.dispatchEvent(new Event('blur'))
        vi.advanceTimersByTime(200)
        await el.updateComplete
        expect($(el, '[role=listbox]')).toBeNull()
    })

    it('the keyboard moves through the options and Enter picks the active one', async () => {
        const el = await mount({ searchable: true })
        await key(el, 'ArrowDown') // opens, active = 1
        await key(el, 'ArrowDown') // 2
        await key(el, 'ArrowDown') // stays at the last
        expect($$(el, '[role=option]').findIndex(o => o.classList.contains('active'))).toBe(2)
        await key(el, 'ArrowUp')
        expect($$(el, '[role=option]').findIndex(o => o.classList.contains('active'))).toBe(1)
        await key(el, 'Enter')
        expect(events).toEqual([{ type: 'action-requested', detail: { actionId: 'switchRecord', parameters: { _record: '2' } } }])
        // Enter on a closed list does nothing
        await key(el, 'Enter')
        expect(events).toHaveLength(1)
    })

    it('a switcher with a route NAVIGATES there, the pick in ${state._record}, unless the user stays', async () => {
        const el = await mount({ route: 'bookings/${state._record}' })
        const select = $(el, 'select') as HTMLSelectElement
        select.value = '3'
        select.dispatchEvent(new Event('change'))
        expect(events).toEqual([
            { type: 'route-changed', detail: { route: 'bookings/3' } },
            { type: 'navigate-to-requested', detail: { route: 'bookings/3' } },
        ])
        events = []
        dirtyGuard.markDirty()
        vi.spyOn(window, 'confirm').mockReturnValue(false)
        select.value = '2'
        select.dispatchEvent(new Event('change'))
        expect(events).toEqual([])
    })

    it('fetches the entries from its optionsSource once', async () => {
        fetchExternalJson.mockResolvedValue({ items: [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Beta' }] })
        const source = { url: '/api/things', itemsPath: 'items', valuePath: 'id', labelPath: 'name' }
        const el = await mount({ options: [], value: 'a', optionsSource: source })
        await new Promise(r => setTimeout(r, 0))
        await el.updateComplete
        expect(fetchExternalJson).toHaveBeenCalledTimes(1)
        expect(fetchExternalJson.mock.calls[0][0]).toBe(source)
        expect($$(el, 'option').map(o => o.textContent)).toEqual(['Alpha', 'Beta'])
        el.requestUpdate()
        await el.updateComplete
        expect(fetchExternalJson).toHaveBeenCalledTimes(1)
    })

    it('a failed fetch leaves an empty switcher', async () => {
        fetchExternalJson.mockRejectedValue(new Error('down'))
        const el = await mount({ options: [], optionsSource: { url: '/api/x' } })
        await new Promise(r => setTimeout(r, 0))
        await el.updateComplete
        expect($$(el, 'option')).toHaveLength(0)
    })
})
