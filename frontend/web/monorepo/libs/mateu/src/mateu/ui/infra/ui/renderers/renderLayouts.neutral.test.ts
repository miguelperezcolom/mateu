// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { html, LitElement, render } from 'lit'

// Children are painted by the component registry; stand in a marker so the test sees WHERE each child lands.
vi.mock('@infra/ui/renderers/renderComponent.ts', () => ({
    renderComponent: (_c: unknown, comp: { id?: string }, _b: unknown, _s: unknown, _d: unknown, _as: unknown, _ad: unknown, labelAlreadyRendered?: boolean) =>
        html`<i data-child="${comp?.id}" data-label-rendered="${labelAlreadyRendered ? 'yes' : 'no'}"></i>`,
}))

import {
    renderAccordionLayout, renderBoardLayout, renderBoardLayoutItem, renderBoardLayoutRow, renderContainer,
    renderFormLayout, renderFullWidth, renderHorizontalLayout, renderMasterDetailLayout, renderScroller,
    renderSplitLayout, renderTab, renderTabLayout, renderVerticalLayout,
} from './renderLayouts'

const container = { _evalTemplate: (s: string) => s.replace('${state.name}', 'Ana') } as unknown as LitElement
const cs = (id: string, metadata: Record<string, unknown>, children: unknown[] = [], extra: Record<string, unknown> = {}) =>
    ({ type: 'ClientSide', id, metadata, children, ...extra }) as any
const field = (id: string, md: Record<string, unknown> = {}) => cs(id, { type: 'FormField', fieldId: id, ...md })

let host: HTMLElement
const draw = (tpl: unknown) => {
    host = document.createElement('div')
    document.body.appendChild(host)
    render(tpl as any, host)
    return host
}
afterEach(() => { document.body.innerHTML = '' })

describe('neutral form layout', () => {
    it('uses a fixed column count when maxColumns is set, auto-fill otherwise', () => {
        const fixed = draw(renderFormLayout(container, cs('f', { type: 'FormLayout', maxColumns: 3 }, [field('a')]), undefined, {}, {}, {}, {}))
        expect(fixed.firstElementChild!.getAttribute('style')).toContain('repeat(3, minmax(0, 1fr))')
        const auto = draw(renderFormLayout(container, cs('f', { type: 'FormLayout', columnWidth: '20rem', fullWidth: true }, [field('a')]), undefined, {}, {}, {}, {}))
        const style = auto.firstElementChild!.getAttribute('style')!
        expect(style).toContain('auto-fill, minmax(min(100%, 20rem), 1fr)')
        expect(style).toContain('width: 100%')
        expect(style).not.toContain('--mateu-label-width')
    })

    it('spans a field over its declared colspan', () => {
        const el = draw(renderFormLayout(container, cs('f', { type: 'FormLayout' }, [field('a', { colspan: 2 }), field('b')]), undefined, {}, {}, {}, {}))
        const a = el.querySelector('[data-child="a"]')!.parentElement!
        expect(a.getAttribute('style')).toContain('span 2')
        expect(el.querySelectorAll('[data-child]')).toHaveLength(2)
    })

    it('puts labels aside in a 10rem column and tells the field its label is already drawn', () => {
        const el = draw(renderFormLayout(container, cs('f', { type: 'FormLayout', labelsAside: true },
            [field('name', { label: 'Hello ${state.name}' }), field('nolabel'), cs('t', { type: 'Text' })]), undefined, {}, {}, {}, {}))
        expect(el.firstElementChild!.getAttribute('style')).toContain('--mateu-label-width: 10rem')
        const label = el.querySelector('label')!
        expect(label.textContent).toBe('Hello Ana')
        expect(el.querySelector('[data-child="name"]')!.getAttribute('data-label-rendered')).toBe('yes')
        // a field without label, and a non-field, render plainly
        expect(el.querySelectorAll('label')).toHaveLength(1)
        expect(el.querySelector('[data-child="nolabel"]')!.getAttribute('data-label-rendered')).toBe('no')
    })

    it('lays a form row out as a full-width flex band sharing the width', () => {
        const el = draw(renderFormLayout(container, cs('f', { type: 'FormLayout' }, [cs('row', { type: 'FormRow' }, [field('a'), field('b')])]), undefined, {}, {}, {}, {}))
        const band = el.querySelector('[data-child="a"]')!.closest('div[style*="grid-column: 1 / -1"]')!
        expect(band).toBeTruthy()
        expect(band.querySelectorAll('[data-child]')).toHaveLength(2)
        expect(band.innerHTML).toContain('flex: 1 1 50%')
    })
})

describe('neutral flex layouts', () => {
    it('horizontal layout carries spacing, padding, wrap, justification and vertical alignment', () => {
        const el = draw(renderHorizontalLayout(container, cs('h', { type: 'HorizontalLayout', spacing: true, padding: true, wrap: true, fullWidth: true, justification: 'center', verticalAlignment: 'end' }, [cs('x', {})], { style: 'color: red;' }), undefined, {}, {}, {}, {}))
        const style = el.firstElementChild!.getAttribute('style')!
        expect(style).toContain('flex-direction: row')
        for (const s of ['gap:', 'padding:', 'flex-wrap: wrap', 'width: 100%', 'justify-content: center', 'align-items: end', 'color: red']) expect(style).toContain(s)
        expect(el.querySelector('[data-child="x"]')).toBeTruthy()
    })

    it('vertical layout aligns on the horizontal axis and stays bare when nothing is declared', () => {
        const el = draw(renderVerticalLayout(container, cs('v', { type: 'VerticalLayout', horizontalAlignment: 'stretch' }), undefined, {}, {}, {}, {}))
        const style = el.firstElementChild!.getAttribute('style')!
        expect(style).toContain('flex-direction: column')
        expect(style).toContain('align-items: stretch')
        expect(style).not.toContain('gap:')
    })

    it('split layout puts its two children side by side, or stacked when vertical', () => {
        const row = draw(renderSplitLayout(container, cs('s', { type: 'SplitLayout', fullWidth: true }, [cs('l', {}), cs('r', {})]), undefined, {}, {}, {}, {}))
        expect(row.firstElementChild!.getAttribute('style')).toContain('flex-direction: row')
        expect(row.querySelectorAll('[data-child]')).toHaveLength(2)
        const col = draw(renderSplitLayout(container, cs('s', { type: 'SplitLayout', orientation: 'vertical' }, [cs('l', {}), cs('r', {})]), undefined, {}, {}, {}, {}))
        expect(col.firstElementChild!.getAttribute('style')).toContain('flex-direction: column')
    })
})

describe('master/detail', () => {
    it('shows a hint until there is a detail, then the detail', () => {
        const empty = draw(renderMasterDetailLayout(container, cs('m', {}, [cs('master', {})]), undefined, {}, {}, {}, {}))
        expect(empty.querySelectorAll('[data-child]')).toHaveLength(1)
        expect(empty.textContent!.trim().length).toBeGreaterThan(0)
        const staticDetail = draw(renderMasterDetailLayout(container, cs('m', {}, [cs('master', {}), cs('detail', {})]), undefined, {}, {}, {}, {}))
        expect(staticDetail.querySelector('[data-child="detail"]')).toBeTruthy()
        const dynamic = draw(renderMasterDetailLayout(container, cs('m', {}, [cs('master', {})]), undefined, {}, { hasDetail: true, detailComponent: cs('dyn', {}) }, {}, {}))
        expect(dynamic.querySelector('[data-child="dyn"]')).toBeTruthy()
    })
})

describe('neutral tabs', () => {
    const tabs = (activeIndex?: number) => cs('tabs', { type: 'TabLayout', fullWidth: true }, [0, 1, 2].map(i =>
        cs(`tab${i}`, { type: 'Tab', label: i === 0 ? 'For ${state.name}' : `Tab ${i}`, active: i === activeIndex }, [cs(`content${i}`, {})])))

    it('opens the first tab by default', () => {
        const el = draw(renderTabLayout(container, tabs(), undefined, {}, {}, {}, {}))
        const details = [...el.querySelectorAll('details')]
        expect(details.map(d => d.open)).toEqual([true, false, false])
        expect(details[0].querySelector('summary')!.textContent).toBe('For Ana')
        expect(el.firstElementChild!.getAttribute('style')).toContain('width: 100%')
        expect(details[2].querySelector('[data-child="content2"]')).toBeTruthy()
    })

    it('opens the tab marked active instead', () => {
        const el = draw(renderTabLayout(container, tabs(2), undefined, {}, {}, {}, {}))
        expect([...el.querySelectorAll('details')].map(d => d.open)).toEqual([false, false, true])
    })

    it('a single tab renders its label and content', () => {
        const el = draw(renderTab(container, cs('t', { type: 'Tab', label: 'Hi ${state.name}' }, [cs('c', {})]), undefined, {}, {}, {}, {}))
        expect(el.firstElementChild!.getAttribute('tab')).toBe('Hi Ana')
        expect(el.querySelector('[data-child="c"]')).toBeTruthy()
    })
})

describe('neutral accordion', () => {
    it('renders one disclosure per panel, opening the active one and dimming disabled ones', () => {
        const el = draw(renderAccordionLayout(container, cs('acc', { type: 'AccordionLayout', fullWidth: true }, [
            cs('p1', { type: 'AccordionPanel', label: 'One ${state.name}', active: true }, [cs('c1', {})]),
            cs('p2', { type: 'AccordionPanel', label: 'Two', disabled: true }, [cs('c2', {})]),
        ]), undefined, {}, {}, {}, {}))
        const details = [...el.querySelectorAll('details')]
        expect(details.map(d => d.open)).toEqual([true, false])
        expect(details[0].querySelector('summary')!.textContent).toBe('One Ana')
        expect(details[1].querySelector('summary')!.getAttribute('style')).toContain('pointer-events: none')
        expect(el.firstElementChild!.getAttribute('style')).toContain('width: 100%')
    })
})

describe('simple wrappers', () => {
    it.each([
        ['scroller', renderScroller, 'overflow: auto'],
        ['full width', renderFullWidth, 'width: 100%'],
        ['container', renderContainer, 'max-width: min(100%, 1200px)'],
        ['board', renderBoardLayout, 'display: grid'],
        ['board row', renderBoardLayoutRow, 'flex-wrap: wrap'],
    ])('%s wraps its children', (_n, fn, expected) => {
        const el = draw((fn as any)(container, cs('w', {}, [cs('a', {}), cs('b', {})]), undefined, {}, {}, {}, {}))
        expect(el.firstElementChild!.getAttribute('style')).toContain(expected)
        expect(el.querySelectorAll('[data-child]')).toHaveLength(2)
    })

    it('a board item grows by its declared columns', () => {
        const el = draw(renderBoardLayoutItem(container, cs('i', { boardCols: 2 }, [cs('a', {})]), undefined, {}, {}, {}, {}))
        expect(el.firstElementChild!.getAttribute('style')).toContain('flex: 2 1 0')
        const def = draw(renderBoardLayoutItem(container, cs('i', {}, []), undefined, {}, {}, {}, {}))
        expect(def.firstElementChild!.getAttribute('style')).toContain('flex: 1 1 0')
    })
})
