// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { MateuComposedHeading, needsComposedHeading, windowTitleChanged } from './composedHeading'

/**
 * A composed archetype (Dashboard, SmartSearchPage, ItemOverview) has no Page in its tree, so the
 * web drew no heading for it; it shows its window title, as the Redwood shell does (owner,
 * 2026-10-12).
 */
describe('composed page heading', () => {
    const text = (id: string) => ({ type: 'ClientSide', id, metadata: { type: 'Text' } })
    const grid = { type: 'ClientSide', metadata: { type: 'ResponsiveGrid' }, children: [text('kpi')] }

    it('a dashboard / smart search / item overview with nothing naming it gets one', () => {
        expect(needsComposedHeading({ type: 'ServerSide', pageType: 'dashboard', children: [grid] })).toBe(true)
        expect(needsComposedHeading({ type: 'ServerSide', pageType: 'collection',
            children: [{ type: 'ClientSide', metadata: { type: 'Crud' } }] })).toBe(true)
        expect(needsComposedHeading({ type: 'ServerSide', pageType: 'detail', children: [grid] })).toBe(true)
    })

    it('a page that names itself does not', () => {
        expect(needsComposedHeading({ type: 'ServerSide', pageType: 'dashboard',
            children: [{ type: 'ClientSide', metadata: { type: 'Page' } }] })).toBe(false)
        expect(needsComposedHeading({ type: 'ServerSide', pageType: 'detail',
            children: [text('gantt-page-title')] })).toBe(false)
        expect(needsComposedHeading({ type: 'ServerSide', pageType: 'collection',
            children: [{ type: 'ClientSide', metadata: { type: 'Crud', title: 'Orders' } }] })).toBe(false)
    })

    it('a page that opens with its own h1/h2 Text does not (no title drawn twice)', () => {
        const heading = (container: string, value = 'Dashboard') =>
            ({ type: 'ClientSide', metadata: { type: 'Text', container, text: value } })
        const layout = (child: ReturnType<typeof heading>) => ({ type: 'ServerSide', pageType: 'dashboard',
            children: [{ type: 'ClientSide', metadata: { type: 'VerticalLayout' }, children: [child, grid] }] })
        expect(needsComposedHeading(layout(heading('h2')))).toBe(false)
        expect(needsComposedHeading(layout(heading('h1')))).toBe(false)
        // a sub-heading or an empty one names nothing
        expect(needsComposedHeading(layout(heading('h3')))).toBe(true)
        expect(needsComposedHeading(layout(heading('h2', ' ')))).toBe(true)
    })

    it('neither does a form, a process, an embedded island nor a client-side component', () => {
        expect(needsComposedHeading({ type: 'ServerSide', pageType: 'form', children: [grid] })).toBe(false)
        expect(needsComposedHeading({ type: 'ServerSide', pageType: 'process', children: [grid] })).toBe(false)
        expect(needsComposedHeading({ type: 'ServerSide', pageType: 'dashboard', route: '/x?_embeddedMediator=1',
            children: [grid] })).toBe(false)
        expect(needsComposedHeading({ type: 'ClientSide', pageType: 'dashboard' })).toBe(false)
    })

    it('the heading shows the window title and follows it', async () => {
        windowTitleChanged('Sales')
        const el = document.createElement('mateu-composed-heading') as MateuComposedHeading
        document.body.appendChild(el)
        await el.updateComplete
        expect(el.shadowRoot!.querySelector('h2')!.textContent).toBe('Sales')
        windowTitleChanged('Operations')
        await el.updateComplete
        expect(el.shadowRoot!.querySelector('h2')!.textContent).toBe('Operations')
        el.remove()
    })
})
