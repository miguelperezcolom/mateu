// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import './mateu-foldout'
import type { MateuFoldout } from './mateu-foldout'

/**
 * The Redwood-style foldout as a user drives it: an overview plus lateral panels that fold out
 * from strips, are bookmarked in the URL (without a history entry), can be expanded to an
 * extended view (with one, so Back returns), and a navigation header with parent/prev/next.
 */
describe('mateu-foldout (DOM)', () => {
    const PANELS = [
        { id: 'p0', title: 'Guests', subtitle: '3 pax', open: true, width: '30rem' },
        { id: 'p1', title: 'Billing & Folio' },
        { title: '' },
    ]
    let events: { actionId: string, parameters: Record<string, unknown> }[]
    const listener = (e: Event) => events.push((e as CustomEvent).detail)
    const mount = async (props: Partial<MateuFoldout> = {}) => {
        const el = document.createElement('mateu-foldout') as MateuFoldout
        el.panels = PANELS as never
        Object.assign(el, props)
        document.body.appendChild(el)
        await el.updateComplete
        return el
    }
    const $ = (el: MateuFoldout, sel: string) => el.shadowRoot!.querySelector(sel) as HTMLElement
    const $$ = (el: MateuFoldout, sel: string) => Array.from(el.shadowRoot!.querySelectorAll(sel)) as HTMLElement[]
    const hash = () => decodeURIComponent(location.hash.replace(/^#/, ''))
    const popstate = async (el: MateuFoldout) => { window.dispatchEvent(new PopStateEvent('popstate')); await el.updateComplete }

    beforeEach(() => { events = []; history.replaceState(null, '', '/booking/7'); document.addEventListener('action-requested', listener) })
    afterEach(() => { document.removeEventListener('action-requested', listener); document.body.innerHTML = ''; history.replaceState(null, '', '/') })

    it('shows the overview, the declared-open panels and strips for the folded ones', async () => {
        const el = await mount({ headerTitle: 'Booking 7', badges: ['VIP', 'Paid'] })
        expect($(el, 'slot[name=overview]')).not.toBeNull()
        expect($(el, '.header-title').textContent).toBe('Booking 7')
        expect($$(el, '.header-badge').map(b => b.textContent)).toEqual(['VIP', 'Paid'])
        const open = $$(el, '.panel')
        expect(open).toHaveLength(1)
        expect(open[0].querySelector('h3')!.textContent).toBe('Guests')
        expect(open[0].querySelector('.subtitle')!.textContent).toBe('3 pax')
        expect(open[0].getAttribute('style')).toContain('flex-basis: 30rem')
        expect(open[0].dataset.anchor).toBe('guests')
        const strips = $$(el, '.strip')
        expect(strips.map(s => s.dataset.anchor)).toEqual(['billing-folio', 'panel-2'])
        expect(strips[0].getAttribute('aria-expanded')).toBe('false')
        expect(strips[0].querySelector('slot[name=summary-1]')).not.toBeNull()
        expect($(el, '.nav-header')).toBeNull()
        expect($(el, '.overview-edit')).toBeNull()
    })

    it('a strip folds out on click (or Enter) and bookmarks the panel; folding clears the bookmark', async () => {
        const el = await mount()
        const before = history.length
        $$(el, '.strip')[0].click()
        await el.updateComplete
        expect($$(el, '.panel').map(p => p.dataset.anchor)).toEqual(['guests', 'billing-folio'])
        expect(hash()).toBe('billing-folio')
        expect(history.length).toBe(before)
        // folding the bookmarked panel clears the anchor
        ;($$(el, '.panel')[1].querySelector('button.fold') as HTMLElement).click()
        await el.updateComplete
        expect($$(el, '.panel')).toHaveLength(1)
        expect(location.hash).toBe('')
        expect(location.pathname).toBe('/booking/7')
        // folding another one leaves an unrelated bookmark alone
        $$(el, '.strip')[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        await el.updateComplete
        expect(hash()).toBe('panel-2')
        ;($$(el, '.panel')[0].querySelector('button.fold') as HTMLElement).click()
        await el.updateComplete
        expect(hash()).toBe('panel-2')
        // a click inside an open panel bookmarks it
        $$(el, '.panel')[0].click()
        expect(hash()).toBe('panel-2')
    })

    it('a bookmarked URL opens its panel on load', async () => {
        history.replaceState(null, '', '/booking/7#billing-folio')
        const el = await mount()
        expect($$(el, '.panel').map(p => p.dataset.anchor)).toEqual(['guests', 'billing-folio'])
    })

    it('expanding a panel replaces the layout with its detail and pushes a history entry; Back returns', async () => {
        const el = await mount()
        const before = history.length
        ;($(el, '.panel button.panel-expand')).click()
        await el.updateComplete
        expect(history.length).toBe(before + 1)
        expect(hash()).toBe('expand=guests')
        expect($(el, '.columns')).toBeNull()
        expect($(el, '.expanded-view .nav-title').textContent).toBe('Guests')
        expect($(el, '.expanded-view .subtitle').textContent).toBe('3 pax')
        expect($(el, '.expanded-body slot[name=panel-0]')).not.toBeNull()
        // the browser goes back: the default view returns
        history.replaceState(null, '', '/booking/7')
        await popstate(el)
        expect($(el, '.expanded-view')).toBeNull()
        expect($(el, '.columns')).not.toBeNull()
        // forward again: the extended view is restored from the URL
        history.replaceState(null, '', '/booking/7#expand=billing-folio')
        await popstate(el)
        expect($(el, '.expanded-view .nav-title').textContent).toBe('Billing & Folio')
        history.replaceState(null, '', '/booking/7#expand=unknown')
        await popstate(el)
        expect($(el, '.expanded-view')).toBeNull()
    })

    it('the in-view Back pops the pushed entry', async () => {
        const el = await mount()
        ;($(el, '.panel button.panel-expand')).click()
        await el.updateComplete
        $(el, '.expanded-view .nav-parent').click()
        // the traversal is asynchronous: wait for the popstate it fires
        for (let i = 0; i < 100 && el.shadowRoot!.querySelector('.expanded-view'); i++) {
            await new Promise(r => setTimeout(r, 10))
            await el.updateComplete
        }
        expect(location.hash).toBe('')
        expect($(el, '.expanded-view')).toBeNull()
    })

    it('a deep link to an extended view restores it on load', async () => {
        history.replaceState(null, '', '/booking/7#expand=billing-folio')
        const el = await mount()
        expect($(el, '.expanded-view .nav-title').textContent).toBe('Billing & Folio')
        expect($(el, '.expanded-view .subtitle')).toBeNull()
    })

    it('the navigation header and the overview Edit dispatch their actions', async () => {
        const el = await mount({
            navigation: { parentActionId: 'toList', parentLabel: 'Bookings', title: 'Booking 7', previousActionId: 'prev', nextActionId: 'next' } as never,
            overviewEditActionId: 'editOverview',
        })
        expect($(el, '.nav-header .nav-title').textContent).toBe('Booking 7')
        const parent = $(el, '.nav-header .nav-parent')
        expect(parent.textContent).toContain('Bookings')
        parent.click()
        $$(el, '.nav-move').forEach(b => b.click())
        $(el, '.overview-edit').click()
        expect(events.map(e => e.actionId)).toEqual(['toList', 'prev', 'next', 'editOverview'])
        expect(events[0].parameters).toEqual({})
    })

    it('a navigation without actions shows only its title; the parent label defaults to Back', async () => {
        const el = await mount({ navigation: { title: 'Only title' } as never })
        expect($(el, '.nav-header .nav-parent')).toBeNull()
        expect($$(el, '.nav-move')).toHaveLength(0)
        const withParent = await mount({ navigation: { parentActionId: 'up' } as never })
        expect($(withParent, '.nav-header .nav-parent').textContent).toContain('Back')
    })
})
