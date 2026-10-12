// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import type { AppHeaderExtras } from './app-header-extras'

beforeAll(async () => {
    window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as any
    await import('./app-header-extras')
})
afterEach(() => { document.body.innerHTML = '' })

const settle = async (el: { updateComplete: Promise<unknown> }) => { await new Promise((r) => setTimeout(r, 0)); await el.updateComplete }

/** The extras over `value`, applying each `extras-changed` like the app-shell editor does. */
async function mount(value: Record<string, unknown> = {}) {
    const el = document.createElement('app-header-extras') as AppHeaderExtras
    el.value = value
    el.sources = [{ name: 'companies' }, { name: 'inbox' }, { name: 'search' }]
    el.routeOptions = [{ value: 'reports' }, { value: 'help' }]
    el.actionOptions = [{ value: 'newBooking', hint: 'flow' }]
    el.addEventListener('extras-changed', (e) => {
        const { key, value: v } = (e as CustomEvent).detail
        const next = { ...el.value }
        if (v === '' || (Array.isArray(v) && !v.length)) delete next[key]
        else next[key] = v
        el.value = next
    })
    document.body.appendChild(el)
    await settle(el)
    return { el, $: (s: string) => el.shadowRoot!.querySelector(s) as any, $$: (s: string) => [...el.shadowRoot!.querySelectorAll(s)] as any[] }
}

const fire = (target: any, value: unknown) => {
    target.value = value
    target.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
}

describe('<app-header-extras> — the app shell\'s header extras', () => {
    it('context selectors: fieldName + label, listed options OR a source picker', async () => {
        const { el, $ } = await mount()
        $('button[data-add=contextSelectors]').click()
        await settle(el)
        fire($('.item input[aria-label="Field name"]'), 'hotel')
        await settle(el)
        fire($('.item input.options'), 'H1=Palma, H2=Ibiza')
        await settle(el)
        expect(el.value.contextSelectors).toEqual([{ fieldName: 'hotel', label: 'Label',
            options: [{ value: 'H1', label: 'Palma' }, { value: 'H2', label: 'Ibiza' }] }])
        fire($('.item ve-select[aria-label="Selector entries"]'), 'source')
        await settle(el)
        // the listed options go, the first named source is picked
        expect(el.value.contextSelectors).toEqual([{ fieldName: 'hotel', label: 'Label', optionsSource: { ref: 'companies' } }])
        expect($('.item ve-source-picker').value).toEqual({ ref: 'companies' })
        $('.item button.del').click()
        await settle(el)
        expect(el.value.contextSelectors).toBeUndefined()
    })

    it('header actions: label + icon picker, navigate (route picker) OR run an action, dropdown of children', async () => {
        const { el, $, $$ } = await mount({ headerActions: [{ label: 'Reports', route: 'reports' }] })
        expect($('.item ve-combo.route').options).toEqual([{ value: 'reports' }, { value: 'help' }])
        expect($('.item ve-icon-picker')).toBeTruthy()
        fire($('.item ve-select[aria-label="Action kind"]'), 'action')
        await settle(el)
        expect(el.value.headerActions).toEqual([{ label: 'Reports', actionId: 'newBooking' }])
        expect($('.item ve-combo.action').value).toBe('newBooking')
        fire($('.item ve-select[aria-label="Action kind"]'), 'menu')
        await settle(el)
        expect(el.value.headerActions).toEqual([{ label: 'Reports', children: [{ label: 'Item' }] }])
        // the child is a header action of its own: route it
        const child = $$('.item .sub .item')[0]
        fire(child.querySelector('ve-combo.route'), 'help')
        await settle(el)
        expect(el.value.headerActions).toEqual([{ label: 'Reports', children: [{ label: 'Item', route: 'help' }] }])
        // removing the only child leaves a plain (navigating) action
        $$('.item .sub .item')[0].querySelector('button.del').click()
        await settle(el)
        expect(el.value.headerActions).toEqual([{ label: 'Reports' }])
    })

    it('notifications (source + mark-read) and global search are source pickers', async () => {
        const { el, $ } = await mount({ notifications: { source: { ref: 'inbox' }, pollSeconds: 30 } })
        expect($('ve-source-picker.notifications-source').value).toEqual({ ref: 'inbox' })
        fire($('ve-source-picker.notifications-read'), { ref: 'inbox' })
        fire($('ve-source-picker.global-search'), { ref: 'search' })
        await settle(el)
        expect(el.value.notifications).toEqual({ source: { ref: 'inbox' }, pollSeconds: 30, markRead: { ref: 'inbox' } })
        expect(el.value.globalSearch).toEqual({ source: { ref: 'search' } })
        fire($('ve-source-picker.global-search'), '')
        await settle(el)
        expect(el.value.globalSearch).toBeUndefined()
    })
})
