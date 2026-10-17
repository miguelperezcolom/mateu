// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const runAction = vi.fn()
vi.mock('@infra/http/AxiosMateuApiClient.ts', () => ({ mateuApiClient: { runAction: (...a: unknown[]) => runAction(...a) } }))
const runAppSource = vi.fn()
vi.mock('@infra/ui/appSources.ts', () => ({
    runAppSource: (...a: unknown[]) => runAppSource(...a),
    contextOptionsOf: (json: any) => json.items.map((i: any) => ({ value: i.code, label: i.name })),
}))

import './mateu-app-context-picker'
import type { MateuAppContextPicker } from './mateu-app-context-picker'

const hotels = Array.from({ length: 9 }, (_, i) => ({ value: `H${i}`, label: `Hotel ${i}` }))
const app = { serverSideType: 'com.example.Home', rootRoute: '/home' } as any

beforeEach(() => {
    localStorage.clear()
    runAction.mockReset(); runAppSource.mockReset()
    runAction.mockResolvedValue({ fragments: [{ data: {} }] })
})
afterEach(() => { document.body.innerHTML = ''; localStorage.clear(); vi.useRealTimers() })

async function mount(selector: Record<string, unknown>, withApp = true) {
    const el = document.createElement('mateu-app-context-picker') as MateuAppContextPicker
    el.selector = { fieldName: 'hotel', label: 'Hotel', options: hotels, ...selector } as never
    if (withApp) el.app = app
    el.baseUrl = '/b'
    const picks: unknown[][] = []
    ;(el as any).pick = (...a: unknown[]) => picks.push(a)
    document.body.appendChild(el)
    await el.updateComplete
    const root = el.shadowRoot!
    const button = () => root.querySelector('button.picker-button') as HTMLButtonElement
    const options = () => [...root.querySelectorAll('[role=option]')] as HTMLElement[]
    const open = async () => { button().click(); await el.updateComplete; await new Promise(r => setTimeout(r)) ; await el.updateComplete }
    return { el, root, button, options, open, picks }
}

describe('app context picker — searching', () => {
    it('shows the stored label for a value not among the loaded options', async () => {
        localStorage.setItem('mateu-app-context', JSON.stringify({ hotel: 'H99' }))
        localStorage.setItem('mateu-app-context-labels', JSON.stringify({ hotel: 'Grand' }))
        const { button } = await mount({})
        expect(button().getAttribute('aria-label')).toBe('Hotel: Grand')
        localStorage.setItem('mateu-app-context-labels', '{}')
        const bare = await mount({})
        expect(bare.button().textContent).toContain('H99')
    })

    it('asks the server for fresh options when opened, and shows them', async () => {
        runAction.mockResolvedValue({ fragments: [{ data: { _appcontext_hotel: { content: [{ value: 'N', label: 'New hotel' }, { value: 'X' }] } } }] })
        const { open, options } = await mount({})
        await open()
        const call = runAction.mock.calls[0]
        expect(call.slice(0, 7)).toEqual(['/b', '/home', '', '_appcontext-search-hotel', 'appcontext-hotel', undefined, 'com.example.Home'])
        expect(call[8]).toEqual({ searchText: '' })
        expect(options().map(o => o.textContent)).toEqual(['New hotel', 'X'])
    })

    it('with many options shows a search box that filters locally and asks the server, debounced', async () => {
        const { el, root, open, options } = await mount({})
        await open()
        const input = root.querySelector('input.picker-search') as HTMLInputElement
        expect(input).toBeTruthy()
        expect(root.activeElement).toBe(input)
        expect(options()).toHaveLength(9)
        vi.useFakeTimers()
        input.value = 'hotel 3'
        input.dispatchEvent(new Event('input'))
        await el.updateComplete
        expect(options().map(o => o.textContent)).toEqual(['Hotel 3'])
        expect(runAction).toHaveBeenCalledTimes(1)
        vi.advanceTimersByTime(300)
        expect(runAction).toHaveBeenCalledTimes(2)
        expect(runAction.mock.calls[1][8]).toEqual({ searchText: 'hotel 3' })
        vi.useRealTimers()
        // ArrowDown from the search box goes to the first option; Escape closes
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }))
        expect(root.activeElement).toBe(options()[0])
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        await el.updateComplete
        expect(root.querySelector('.panel')).toBeNull()
    })

    it('with a value, offers to clear it and marks the current option; a click picks', async () => {
        localStorage.setItem('mateu-app-context', JSON.stringify({ hotel: 'H2' }))
        const { root, open, options, picks } = await mount({ options: hotels.slice(0, 3) }, false)
        await open()
        expect(runAction).not.toHaveBeenCalled() // no app: nothing to ask
        const all = options()
        expect(all[0].classList.contains('option--clear')).toBe(true)
        expect(all[3].getAttribute('aria-selected')).toBe('true')
        // with no search box the keyboard lands on the current option
        expect(root.activeElement).toBe(all[3])
        all[0].click()
        all[1].click()
        expect(picks).toEqual([[''], ['H0', 'Hotel 0']])
    })

    it('Escape on an option closes and gives the focus back to the button; an outside click closes', async () => {
        const { el, root, open, options, button } = await mount({ options: hotels.slice(0, 3) })
        await open()
        options()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await el.updateComplete
        expect(root.querySelector('.panel')).toBeNull()
        expect(root.activeElement).toBe(button())
        await open()
        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }))
        await el.updateComplete
        expect(root.querySelector('.panel')).toBeNull()
        // toggling the button closes an open panel
        await open()
        button().click()
        await el.updateComplete
        expect(root.querySelector('.panel')).toBeNull()
    })

    it('a REST-sourced picker fetches its options from the source with the search text', async () => {
        runAppSource.mockResolvedValue({ items: [{ code: 'S1', name: 'Sourced' }] })
        const source = { url: '/hotels' }
        const { open, options } = await mount({ options: [], optionsSource: source })
        await open()
        expect(runAppSource).toHaveBeenCalledWith(app, '/b', 'contextOptions', source, { searchText: '' }, expect.anything(), 'hotel')
        expect(options().map(o => o.textContent)).toEqual(['Sourced'])
        expect(runAction).not.toHaveBeenCalled()
    })
})
