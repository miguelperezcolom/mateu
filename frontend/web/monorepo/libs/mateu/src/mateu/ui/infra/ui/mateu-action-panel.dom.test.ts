// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import './mateu-action-panel'
import type { MateuActionPanel } from './mateu-action-panel'

/**
 * The "I want to…" action panel: a trigger (or its shortcut) opens a modal layer with the actions
 * in category columns; picking one closes it and dispatches it; Escape / ✕ / the backdrop close it.
 */
describe('mateu-action-panel (DOM)', () => {
    const PANEL = {
        shortcut: 'ctrl+i',
        maxPerCategory: 2,
        hideUnpopulatedToggle: true,
        categories: [
            { title: 'Billing', actions: [
                { label: 'Folio', actionId: 'folio', count: 30 },
                { label: 'Deposits', actionId: 'deposits', populated: true, parameters: { id: 1 } },
                { label: 'Refund', actionId: 'refund', disabled: true },
            ] },
            { title: 'Guest', actions: [{ label: 'Profile', actionId: 'profile' }] },
        ],
    }
    let events: { actionId: string, parameters: Record<string, unknown> }[]
    const listener = (e: Event) => events.push((e as CustomEvent).detail)
    const mount = async (panel: unknown = PANEL) => {
        const el = document.createElement('mateu-action-panel') as MateuActionPanel
        el.panel = panel as never
        el.getClientRects = () => [{}] as unknown as DOMRectList
        document.body.appendChild(el)
        await el.updateComplete
        return el
    }
    const $ = (el: MateuActionPanel, sel: string) => el.shadowRoot!.querySelector(sel) as HTMLElement
    const $$ = (el: MateuActionPanel, sel: string) => Array.from(el.shadowRoot!.querySelectorAll(sel)) as HTMLElement[]
    const open = async (el: MateuActionPanel) => { $(el, 'button.trigger').click(); await el.updateComplete }
    const keydown = (init: KeyboardEventInit) => document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }))

    beforeEach(() => { events = []; document.addEventListener('action-requested', listener) })
    afterEach(() => { document.removeEventListener('action-requested', listener); document.body.innerHTML = '' })

    it('the trigger names the panel and its shortcut and opens a modal layer of category columns', async () => {
        const el = await mount()
        const trigger = $(el, 'button.trigger')
        expect(trigger.textContent).toBe('I want to…')
        expect(trigger.title).toBe('I want to… (ctrl+i)')
        expect(trigger.getAttribute('aria-expanded')).toBe('false')
        expect($(el, '[role=dialog]')).toBeNull()
        await open(el)
        expect(trigger.getAttribute('aria-expanded')).toBe('true')
        const dialog = $(el, '[role=dialog]')
        expect(dialog.getAttribute('aria-modal')).toBe('true')
        expect($$(el, 'section.column').map(s => s.getAttribute('aria-label'))).toEqual(['Billing', 'Guest'])
        const billing = $$(el, 'section.column')[0]
        // populated first, bold; the count is shown, capped at 25+; cut at 2 with "Show more (1)"
        expect(Array.from(billing.querySelectorAll('button')).map(b => b.textContent!.trim())).toEqual(['Deposits', 'Folio (25+)', 'Show more (1)'])
        expect(billing.querySelector('button.populated')!.textContent).toBe('Deposits')
    })

    it('"Show more" lists the rest; a disabled action does nothing; picking one closes and dispatches it', async () => {
        const el = await mount()
        await open(el)
        ;($(el, 'button.more')).click()
        await el.updateComplete
        const refund = $$(el, 'button.action').find(b => b.textContent === 'Refund') as HTMLButtonElement
        expect(refund.disabled).toBe(true)
        refund.disabled = false // even forced, a disabled action is refused
        refund.click()
        expect(events).toEqual([])
        $$(el, 'button.action').find(b => b.textContent === 'Deposits')!.click()
        await el.updateComplete
        expect(events).toEqual([{ actionId: 'deposits', parameters: { id: 1 } }])
        expect($(el, '[role=dialog]')).toBeNull()
        // reopening starts folded again
        await open(el)
        expect($(el, 'button.more')).not.toBeNull()
    })

    it('"Hide unpopulated" hides the empty actions and the columns they leave empty', async () => {
        const el = await mount()
        await open(el)
        const toggle = $(el, 'input[role=switch]') as HTMLInputElement
        toggle.checked = true
        toggle.dispatchEvent(new Event('change'))
        await el.updateComplete
        expect($$(el, 'section.column')).toHaveLength(1)
        expect($$(el, 'button.action').map(b => b.textContent)).toEqual(['Deposits'])
    })

    it('Escape, ✕ and the backdrop close it', async () => {
        const el = await mount()
        await open(el)
        keydown({ key: 'Escape' })
        await el.updateComplete
        expect($(el, '[role=dialog]')).toBeNull()
        await open(el)
        $(el, 'button.close').click()
        await el.updateComplete
        expect($(el, '[role=dialog]')).toBeNull()
        await open(el)
        $(el, '.backdrop').click()
        await el.updateComplete
        expect($(el, '[role=dialog]')).toBeNull()
    })

    it('the shortcut opens it (by key code too); other keys and hidden panels do not', async () => {
        const el = await mount({ ...PANEL, label: 'Actions', hideUnpopulatedToggle: false })
        keydown({ key: 'i' })
        await el.updateComplete
        expect($(el, '[role=dialog]')).toBeNull()
        keydown({ key: '⁄', code: 'KeyI', ctrlKey: true })
        await el.updateComplete
        expect($(el, '[role=dialog]').getAttribute('aria-label')).toBe('Actions')
        expect($(el, 'input[role=switch]')).toBeNull()
        el.remove()
        const hidden = await mount()
        hidden.getClientRects = () => [] as unknown as DOMRectList
        keydown({ key: 'i', ctrlKey: true })
        await hidden.updateComplete
        expect($(hidden, '[role=dialog]')).toBeNull()
    })

    it('renders nothing without a panel', async () => {
        const el = await mount(null)
        expect($(el, 'button')).toBeNull()
    })
})
