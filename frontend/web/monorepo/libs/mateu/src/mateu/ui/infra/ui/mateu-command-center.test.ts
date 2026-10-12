// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const runAction = vi.fn()
vi.mock('@infra/http/AxiosMateuApiClient.ts', () => ({ mateuApiClient: { runAction: (...a: unknown[]) => runAction(...a) } }))

import './mateu-command-center'
import type { MateuCommandCenter } from './mateu-command-center'
import { listRecentRoutes, pushRecentRoute } from '@infra/recentRoutesStore.ts'

/**
 * The command center (`@App(commandCenter = true)`): a FAB and ⌘K open a palette over the whole
 * menu, global search hits and recents. It navigates with the `route-changed` + `navigate-to-requested`
 * pair every shell honours, records recents per app, and hands a query to the AI assistant.
 */
describe('mateu-command-center', () => {
    const MENU = [
        { label: 'Bookings', route: 'bookings' },
        { label: 'Setup', submenus: [
            { label: 'Hotels', route: 'setup/hotels' },
            { separator: true, label: '' },
            { label: 'Rooms', route: 'setup/rooms' },
        ] },
    ]
    let events: { type: string, detail: unknown }[]
    let listening: AbortController

    const mount = async (app: Record<string, unknown> = {}) => {
        const cc = document.createElement('mateu-command-center') as MateuCommandCenter
        cc.app = { serverSideType: 'my.App', menu: MENU, ...app } as never
        for (const type of ['route-changed', 'navigate-to-requested', 'mateu-open-ai']) {
            document.body.addEventListener(type, (e) => events.push({ type, detail: (e as CustomEvent).detail }), { signal: listening.signal })
        }
        document.body.appendChild(cc)
        await cc.updateComplete
        return cc
    }
    const $ = (cc: MateuCommandCenter, sel: string) => cc.shadowRoot!.querySelector(sel) as HTMLElement
    const $$ = (cc: MateuCommandCenter, sel: string) => Array.from(cc.shadowRoot!.querySelectorAll(sel)) as HTMLElement[]
    const openIt = async (cc: MateuCommandCenter) => { $(cc, '.cc-fab').click(); await cc.updateComplete }
    const type = async (cc: MateuCommandCenter, text: string) => {
        const input = $(cc, '.cc-input') as HTMLInputElement
        input.value = text
        input.dispatchEvent(new InputEvent('input'))
        await cc.updateComplete
    }
    const labels = (els: HTMLElement[]) => els.map(e => e.querySelector('.cc-tile-label')!.textContent!.trim())

    beforeEach(() => { events = []; listening = new AbortController(); localStorage.clear(); runAction.mockReset() })
    afterEach(() => { listening.abort(); document.body.innerHTML = ''; vi.useRealTimers() })

    it('the FAB is named and opens the palette over the WHOLE menu, flattened with breadcrumbs', async () => {
        const cc = await mount()
        expect($(cc, '.cc-fab').getAttribute('aria-label')).toBeTruthy()
        expect($(cc, '.cc-panel')).toBeNull()
        await openIt(cc)
        expect(labels($$(cc, '.cc-tile'))).toEqual(['Bookings', 'Hotels', 'Rooms'])
        expect($$(cc, '.cc-tile .cc-sub').map(s => s.textContent)).toEqual(['Setup', 'Setup'])
    })

    it('its search field owns the focus as soon as it opens — no frame for typed keys to get lost in', async () => {
        const cc = await mount()
        await openIt(cc)
        // no await of a frame: the keys a quick typist sends right after opening must land here
        expect(cc.shadowRoot!.activeElement).toBe($(cc, '.cc-input'))
    })

    it('Ctrl/⌘+K toggles it, Esc closes it', async () => {
        const cc = await mount()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
        await cc.updateComplete
        expect($(cc, '.cc-panel')).not.toBeNull()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        await cc.updateComplete
        expect($(cc, '.cc-panel')).toBeNull()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'K', metaKey: true }))
        await cc.updateComplete
        expect($(cc, '.cc-panel')).not.toBeNull()
    })

    it('picking a screen navigates with the shared event pair, closes and records it as recent', async () => {
        const cc = await mount()
        await openIt(cc)
        $$(cc, '.cc-tile')[1].click()
        await cc.updateComplete
        expect(events).toEqual([
            { type: 'route-changed', detail: { route: 'setup/hotels' } },
            { type: 'navigate-to-requested', detail: { route: 'setup/hotels' } },
        ])
        expect($(cc, '.cc-panel')).toBeNull()
        expect(listRecentRoutes('my.App')).toEqual([{ route: 'setup/hotels', label: 'Hotels' }])
    })

    it('recents are scoped to the app', async () => {
        pushRecentRoute('other.App', { route: 'x', label: 'Not mine' })
        pushRecentRoute('my.App', { route: 'bookings', label: 'Bookings' })
        const cc = await mount()
        await openIt(cc)
        expect(labels($$(cc, '.cc-col--recent .cc-row'))).toEqual(['Bookings'])
    })

    it('typing filters the menu by label or breadcrumb; Enter opens the selected match; arrows move', async () => {
        const cc = await mount()
        await openIt(cc)
        await type(cc, 'setup')
        expect(labels($$(cc, '.cc-row'))).toEqual(['Hotels', 'Rooms'])
        const input = $(cc, '.cc-input')
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
        await cc.updateComplete
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' })) // clamped at the end
        await cc.updateComplete
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
        expect(events[0]).toEqual({ type: 'route-changed', detail: { route: 'setup/rooms' } })
    })

    it('no match says so', async () => {
        const cc = await mount()
        await openIt(cc)
        await type(cc, 'zzz')
        expect($(cc, '.cc-empty').textContent).toContain('zzz')
    })

    it('with global search enabled, the query is sent (debounced) as _globalsearch and hits are grouped by category', async () => {
        vi.useFakeTimers()
        runAction.mockResolvedValue({ fragments: [{ data: { _globalsearch: [
            { label: 'Ada', route: 'customers/1', category: 'Customers' },
            { label: 'Alan', route: 'customers/2', category: 'Customers', description: 'VIP' },
        ] } }] })
        const cc = await mount({ globalSearchEnabled: true, rootRoute: '' })
        await openIt(cc)
        await type(cc, 'a')
        await type(cc, 'ad')
        vi.advanceTimersByTime(260)
        await vi.runAllTimersAsync()
        await cc.updateComplete
        expect(runAction).toHaveBeenCalledTimes(1)
        const args = runAction.mock.calls[0]
        expect(args[3]).toBe('_globalsearch')
        expect(args[6]).toBe('my.App')
        expect(args[8]).toEqual({ searchText: 'ad' })
        expect($$(cc, '.cc-section-title').map(t => t.textContent)).toContain('Customers')
        expect(labels($$(cc, '.cc-row'))).toEqual(['Ada', 'Alan'])
    })

    it('without global search, typing never calls the server', async () => {
        const cc = await mount()
        await openIt(cc)
        await type(cc, 'ad')
        expect(runAction).not.toHaveBeenCalled()
    })

    it('a failing global search shows no hits instead of breaking the palette', async () => {
        vi.useFakeTimers()
        runAction.mockRejectedValue(new Error('down'))
        const cc = await mount({ globalSearchEnabled: true })
        await openIt(cc)
        await type(cc, 'book')
        await vi.runAllTimersAsync()
        await cc.updateComplete
        expect(labels($$(cc, '.cc-row'))).toEqual(['Bookings'])
    })

    it('"Ask AI" (when the app has an assistant) hands the query over with mateu-open-ai', async () => {
        const cc = await mount({ sseUrl: '/sse' })
        await openIt(cc)
        await type(cc, 'how do I check in?')
        $(cc, '.cc-ask-ai').click()
        expect(events).toEqual([{ type: 'mateu-open-ai', detail: { query: 'how do I check in?' } }])
    })

    it('no assistant, no Ask AI row', async () => {
        const cc = await mount()
        await openIt(cc)
        await type(cc, 'x')
        expect($(cc, '.cc-ask-ai')).toBeNull()
    })

    it('stacks its FAB above the app FABs it finds next to it', async () => {
        const fab = document.createElement('button')
        fab.className = 'app-fab'
        document.body.appendChild(fab)
        const cc = await mount()
        expect((cc as unknown as { fabOffset: number }).fabOffset).toBe(1)
    })
})
