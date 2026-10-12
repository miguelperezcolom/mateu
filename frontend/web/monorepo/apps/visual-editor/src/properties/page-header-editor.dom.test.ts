// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import type { PageHeaderEditor } from './page-header-editor'
import type { PageNode } from '../model/pageModel'
import type { ProjectIndex } from '../model/projectIndex'

beforeAll(async () => {
    window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as any
    await import('./page-header-editor')
})
afterEach(() => { document.body.innerHTML = '' })

const settle = async (el: { updateComplete: Promise<unknown> }) => { await new Promise((r) => setTimeout(r, 0)); await el.updateComplete }

const PROJECT = { sources: [{ name: 'customers' }, { name: 'inbox' }], routes: [], actions: [] } as unknown as ProjectIndex

/** The editor over `node`, applying each `prop-changed` to the node like the pane's host does. */
async function mount(node: PageNode) {
    const el = document.createElement('page-header-editor') as PageHeaderEditor
    el.node = node
    el.project = PROJECT
    el.actionOptions = [{ value: 'newOrder', hint: 'this page' }]
    el.routeOptions = [{ value: 'customers' }]
    const events: { key: string; value: unknown }[] = []
    el.addEventListener('prop-changed', (e) => {
        const { key, value } = (e as CustomEvent).detail
        events.push({ key, value })
        const next = { ...el.node! }
        if (value === '' || value === undefined) delete next[key]
        else next[key] = value
        el.node = next
    })
    document.body.appendChild(el)
    await settle(el)
    return { el, events, $: (s: string) => el.shadowRoot!.querySelector(s) as any, $$: (s: string) => [...el.shadowRoot!.querySelectorAll(s)] as any[] }
}

const change = (input: HTMLInputElement, value: string) => {
    input.value = value
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
}
const pick = (select: any, value: string) => {
    select.value = value
    select.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
}

describe('<page-header-editor> — the page header of a Form', () => {
    it('edits overline, titlePlaceholder and timestamp as text; clearing removes the key', async () => {
        const { el, events, $ } = await mount({ type: 'Form', title: 'x', overline: 'Customers' })
        expect($('input.overline').value).toBe('Customers')
        change($('input.titlePlaceholder'), 'New customer…')
        change($('input.timestamp'), 'Updated ${state.at}')
        change($('input.overline'), '')
        await settle(el)
        expect(events).toEqual([
            { key: 'titlePlaceholder', value: 'New customer…' },
            { key: 'timestamp', value: 'Updated ${state.at}' },
            { key: 'overline', value: '' },
        ])
        expect(el.node!.overline).toBeUndefined()
    })

    it('badges: add, edit label + colour (a select), keep unknown keys, remove the last → key gone', async () => {
        const { el, $, $$ } = await mount({ type: 'Form', badges: [{ label: 'VIP', color: 'success', description: 'kept' }] })
        expect($('details[data-key=badges]').open).toBe(true)
        $('button[data-add=badges]').click()
        await settle(el)
        expect((el.node!.badges as unknown[]).length).toBe(2)
        const colour = $$('details[data-key=badges] .item')[0].querySelector('ve-select')
        expect([...colour.querySelectorAll('option')].map((o: HTMLOptionElement) => o.value)).toEqual(['', 'normal', 'success', 'error', 'warning', 'contrast'])
        pick(colour, 'error')
        await settle(el)
        expect((el.node!.badges as unknown[])[0]).toEqual({ label: 'VIP', color: 'error', description: 'kept' })
        for (let i = 0; i < 2; i++) {
            $('details[data-key=badges] .item button.del').click()
            await settle(el)
        }
        expect(el.node!.badges).toBeUndefined()
    })

    it('kpis: label + value rows, reorderable', async () => {
        const { el, $$ } = await mount({ type: 'Form', kpis: [{ label: 'A', value: '1' }, { label: 'B', value: '2' }] })
        change($$('details[data-key=kpis] .item')[1].querySelector('input[aria-label="KPI value"]'), '${state.b}')
        await settle(el)
        $$('details[data-key=kpis] .item')[1].querySelector('button[title="Move up"]').click()
        await settle(el)
        expect(el.node!.kpis).toEqual([{ label: 'B', value: '${state.b}' }, { label: 'A', value: '1' }])
    })

    it('banners: theme select (INFO…DANGER), title, description, closeable, timeoutSeconds as a number', async () => {
        const { el, $ } = await mount({ type: 'Form' })
        $('button[data-add=banners]').click()
        await settle(el)
        const item = $('details[data-key=banners] .item')
        const theme = item.querySelector('ve-select')
        expect([...theme.querySelectorAll('option')].map((o: HTMLOptionElement) => o.value)).toEqual(['INFO', 'SUCCESS', 'WARNING', 'DANGER'])
        pick(theme, 'DANGER')
        change(item.querySelector('input[aria-label="Banner description"]'), 'Two invoices are overdue')
        const closeable = item.querySelector('input[type=checkbox]') as HTMLInputElement
        closeable.checked = true
        closeable.dispatchEvent(new Event('change'))
        change(item.querySelector('input[aria-label="Banner timeout seconds"]'), '8')
        await settle(el)
        expect(el.node!.banners).toEqual([{ theme: 'DANGER', title: 'Title', description: 'Two invoices are overdue', closeable: true, timeoutSeconds: 8 }])
    })

    it('fabs: the icon picker, the action picker (page + catalogue actions), order and buttonStyle', async () => {
        const { el, $ } = await mount({ type: 'Form' })
        $('button[data-add=fabs]').click()
        await settle(el)
        const item = $('details[data-key=fabs] .item')
        const icon = item.querySelector('ve-icon-picker')
        expect(icon.value).toBe('vaadin:plus')
        const action = item.querySelector('ve-combo')
        expect(action.options).toEqual([{ value: 'newOrder', hint: 'this page' }])
        expect(action.value).toBe('newOrder')
        change(item.querySelector('input[aria-label="FAB order"]'), '2')
        pick(item.querySelector('ve-select'), 'secondary')
        await settle(el)
        expect(el.node!.fabs).toEqual([{ icon: 'vaadin:plus', label: 'New', actionId: 'newOrder', order: 2, buttonStyle: 'secondary' }])
    })

    it('peerNav: label + route (route picker) for each side; emptied → removed', async () => {
        const { el, $$ } = await mount({ type: 'Form' })
        const combos = $$('ve-combo').filter((c) => String(c.placeholder).startsWith('route'))
        expect(combos.length).toBe(2)
        expect(combos[0].options).toEqual([{ value: 'customers' }])
        combos[0].value = 'customers/${state.prevId}'
        combos[0].dispatchEvent(new Event('change'))
        await settle(el)
        expect(el.node!.peerNav).toEqual({ prevRoute: 'customers/${state.prevId}' })
        const again = $$('ve-combo').filter((c) => String(c.placeholder).startsWith('route'))[0]
        again.value = ''
        again.dispatchEvent(new Event('change'))
        await settle(el)
        expect(el.node!.peerNav).toBeUndefined()
    })

    it('recordSwitcher: listed options OR a source picker, and a route OR an action on pick', async () => {
        const { el, $ } = await mount({ type: 'Form', recordSwitcher: { label: 'Customer', options: [{ value: 'c1', label: 'Acme' }] } })
        expect($('input.switcher-options').value).toBe('c1=Acme')
        pick($('ve-select[aria-label="Switcher entries"]'), 'source')
        await settle(el)
        expect(el.node!.recordSwitcher).toEqual({ label: 'Customer', optionsSource: { ref: 'customers' } })
        expect($('ve-source-picker.switcher-source').value).toEqual({ ref: 'customers' })
        const route = $('ve-combo.switcher-route')
        route.value = 'customers/${state._record}'
        route.dispatchEvent(new Event('change'))
        await settle(el)
        pick($('ve-select[aria-label="Switcher on pick"]'), 'action')
        await settle(el)
        // the route goes; the action starts from the runtime's default id
        expect(el.node!.recordSwitcher).toEqual({ label: 'Customer', optionsSource: { ref: 'customers' }, actionId: '_switchRecord' })
        const action = $('ve-combo.switcher-action')
        action.value = 'newOrder'
        action.dispatchEvent(new Event('change'))
        await settle(el)
        const searchable = [...el.shadowRoot!.querySelectorAll('.check input')][0] as HTMLInputElement
        searchable.checked = true
        searchable.dispatchEvent(new Event('change'))
        await settle(el)
        expect(el.node!.recordSwitcher).toEqual({ label: 'Customer', optionsSource: { ref: 'customers' }, actionId: 'newOrder', searchable: true })
    })

    it('two switcher edits in the same tick (a typed label left for the route picker) both survive', async () => {
        const { el, $ } = await mount({ type: 'Form', recordSwitcher: { label: 'Customer' } })
        const label = [...el.shadowRoot!.querySelectorAll('details')].at(-1)!.querySelector('input') as HTMLInputElement
        label.focus()
        label.value = ''
        for (const ch of 'Client') { label.value += ch; label.dispatchEvent(new InputEvent('input', { data: ch, bubbles: true, composed: true })) }
        label.dispatchEvent(new Event('change', { bubbles: true }))
        const route = $('ve-combo.switcher-route')
        route.value = 'customers/${state._record}'
        route.dispatchEvent(new Event('change'))
        await settle(el)
        expect(el.node!.recordSwitcher).toEqual({ label: 'Client', route: 'customers/${state._record}' })
    })
})
