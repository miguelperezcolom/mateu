// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

// vaadin-form-layout's responsive-steps layout cannot run in jsdom (no layout: it rejects every
// step set and recurses resetting them). These tests assert the attributes/styles the renderer
// puts on it, so a plain element stands in for it — defined before the real one registers.
vi.hoisted(() => {
    if (!customElements.get('vaadin-form-layout')) {
        customElements.define('vaadin-form-layout', class extends HTMLElement {})
    }
    // its disconnect cancels animations jsdom does not implement
    if (!customElements.get('vaadin-master-detail-layout')) {
        customElements.define('vaadin-master-detail-layout', class extends HTMLElement {})
    }
})

// Children are painted by the component registry; a marker carrying the child's text stands in.
vi.mock('@infra/ui/renderers/renderComponent.ts', async () => {
    const { html } = await import('lit')
    return {
        renderComponent: (_c: unknown, comp: { id?: string, metadata?: { text?: string } }) =>
            html`<i data-child="${comp?.id}">${comp?.metadata?.text ?? ''}</i>`,
    }
})

import { render } from 'lit'
import type { LitElement } from 'lit'
import { renderAccordionLayout, renderFormLayout, renderFullWidth, renderMasterDetailLayout, renderTabLayout } from './renderLayouts'

/**
 * The Vaadin layouts' wire-driven details a user notices: labels beside the fields when the server
 * infers a dense single-column form (labelsAside), the tab that opens first (@Tab(open = true)),
 * per-tab keyboard shortcuts (data-shortcut, read by mateu-component), and the adaptable tabs that
 * may degrade to an accordion.
 */
const container = { _evalTemplate: (s: string) => s.replace('${state.name}', 'Ada') } as unknown as LitElement

const mountTemplate = (tpl: unknown) => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    render(tpl, host)
    return host
}

const tab = (label: string, extra: Record<string, unknown> = {}) => ({
    type: 'ClientSide', id: 't-' + label, children: [],
    metadata: { type: 'Tab', label, ...extra },
})
const tabLayout = (tabs: unknown[], extra: Record<string, unknown> = {}) => ({
    type: 'ClientSide', id: 'tabs1', children: tabs, metadata: { type: 'TabLayout', ...extra },
})

afterEach(() => { document.body.innerHTML = '' })

describe('renderFormLayout', () => {
    const form = (metadata: Record<string, unknown>) => ({ type: 'ClientSide', id: 'fl', children: [], metadata: { type: 'FormLayout', ...metadata } })

    it('labels aside: a 10rem label column, labels-aside on, fields NOT stretched', () => {
        const host = mountTemplate(renderFormLayout(container, form({ labelsAside: true }) as never, '', {}, {}, {}, {}))
        const fl = host.querySelector('vaadin-form-layout')!
        expect(fl.getAttribute('style')).toContain('--vaadin-form-item-label-width: 10rem;')
        expect(fl.hasAttribute('labels-aside')).toBe(true)
        expect(fl.hasAttribute('expand-fields')).toBe(false)
    })

    it('labels on top: the fields fill their column', () => {
        const host = mountTemplate(renderFormLayout(container, form({}) as never, '', {}, {}, {}, {}))
        const fl = host.querySelector('vaadin-form-layout')!
        expect(fl.hasAttribute('expand-fields')).toBe(true)
        expect(fl.hasAttribute('labels-aside')).toBe(false)
        expect(fl.getAttribute('style')).not.toContain('label-width')
    })

    it('a zero row spacing from the wire falls back to a comfortable default; a real one is kept', () => {
        const zero = mountTemplate(renderFormLayout(container, form({ itemRowSpacing: '0' }) as never, '', {}, {}, {}, {}))
        expect(zero.querySelector('vaadin-form-layout')!.getAttribute('style')).toContain('--vaadin-form-layout-row-spacing: var(--lumo-space-m);')
        const real = mountTemplate(renderFormLayout(container, form({ itemRowSpacing: '2rem', columnSpacing: '1rem', fullWidth: true }) as never, '', {}, {}, {}, {}))
        const style = real.querySelector('vaadin-form-layout')!.getAttribute('style')!
        expect(style).toContain('--vaadin-form-layout-row-spacing: 2rem;')
        expect(style).toContain('--vaadin-form-layout-column-spacing: 1rem;')
        expect(style).toContain('width: 100%;')
    })

    it('maxColumns is only set when positive', () => {
        const host = mountTemplate(renderFormLayout(container, form({ maxColumns: 0 }) as never, '', {}, {}, {}, {}))
        expect(host.querySelector('vaadin-form-layout')!.hasAttribute('max-columns')).toBe(false)
        const three = mountTemplate(renderFormLayout(container, form({ maxColumns: 3 }) as never, '', {}, {}, {}, {}))
        expect(three.querySelector('vaadin-form-layout')!.getAttribute('max-columns')).toBe('3')
    })
})

describe('renderTabLayout', () => {
    it('one tab per child, each carrying its keyboard shortcut', () => {
        const host = mountTemplate(renderTabLayout(container, tabLayout([
            tab('General', { shortcut: 'alt+1' }), tab('Billing', { shortcut: 'alt+2' }), tab('Notes'),
        ]) as never, '', {}, {}, {}, {}))
        const tabs = Array.from(host.querySelectorAll('vaadin-tab'))
        expect(tabs.map(t => t.textContent!.trim())).toEqual(['General', 'Billing', 'Notes'])
        expect(tabs.map(t => t.getAttribute('data-shortcut'))).toEqual(['alt+1', 'alt+2', null])
        // ids come from the strip and the index, never from the label
        expect(new Set(tabs.map(t => t.id)).size).toBe(3)
    })

    it('the tab marked open is the one selected when the strip settles; otherwise the first', () => {
        const host = mountTemplate(renderTabLayout(container, tabLayout([
            tab('General'), tab('Cardex', { active: true }), tab('Notes'),
        ]) as never, '', {}, {}, {}, {}))
        const strip = host.querySelector('vaadin-tabs') as HTMLElement & { selected?: number }
        strip.dispatchEvent(new CustomEvent('items-changed'))
        expect(strip.selected).toBe(1)

        const plain = mountTemplate(renderTabLayout(container, tabLayout([tab('A'), tab('B')]) as never, '', {}, {}, {}, {}))
        const strip2 = plain.querySelector('vaadin-tabs') as HTMLElement & { selected?: number }
        strip2.dispatchEvent(new CustomEvent('items-changed'))
        expect(strip2.selected).toBe(0)
    })

    it('a single tab is not a choice: no strip at all', () => {
        const host = mountTemplate(renderTabLayout(container, tabLayout([tab('Only')]) as never, '', {}, {}, {}, {}))
        expect(host.querySelector('vaadin-tabs')).toBeNull()
    })

    it('labels are interpolated', () => {
        const host = mountTemplate(renderTabLayout(container, tabLayout([tab('${state.name} — details'), tab('B')]) as never, '', {}, {}, {}, {}))
        expect(host.querySelector('vaadin-tab')!.textContent!.trim()).toBe('Ada — details')
    })

    it('adaptable (inferred) tabs go into mateu-adaptive-tabs, keeping the shortcut-bearing strip', () => {
        const host = mountTemplate(renderTabLayout(container, tabLayout([
            tab('A', { shortcut: 'alt+1' }), tab('B'),
        ], { adaptable: true }) as never, '', {}, {}, {}, {}))
        const adaptive = host.querySelector('mateu-adaptive-tabs') as HTMLElement & { tabLabels?: string[] }
        expect(adaptive).not.toBeNull()
        expect(adaptive.tabLabels).toEqual(['A', 'B'])
        expect(adaptive.querySelector('vaadin-tab[data-shortcut="alt+1"]')).not.toBeNull()
        expect(host.querySelector('vaadin-tabsheet')).toBeNull()
    })

    it('a tab badge (an eager @Subresource count) is shown next to its label', () => {
        const host = mountTemplate(renderTabLayout(container, tabLayout([tab('Subnets', { badge: '12' }), tab('B')]) as never, '', {}, {}, {}, {}))
        expect(host.querySelector('vaadin-tab [theme~="badge"]')!.textContent).toBe('12')
    })
})

describe('renderAccordionLayout', () => {
    const panel = (label: string, active: boolean) => ({
        type: 'ClientSide', id: 'p-' + label, children: [],
        metadata: { type: 'AccordionPanel', label, active },
    })
    const accordion = (panels: unknown[]) => ({
        type: 'ClientSide', id: 'acc', children: panels, metadata: { type: 'AccordionLayout' },
    })
    const openedOf = (panels: unknown[]) => {
        const host = mountTemplate(renderAccordionLayout(container, accordion(panels) as never, '', {}, {}, {}, {}))
        return (host.querySelector('vaadin-accordion') as unknown as { opened: number | null }).opened
    }

    it('opens the panel the wire marks active', () => {
        expect(openedOf([panel('A', false), panel('B', true)])).toBe(1)
    })

    it('with no panel active, every panel starts closed (a folded "More options" stays folded)', () => {
        // vaadin-accordion's own default opened the first panel, so the optional fields the
        // layout inference folded away were shown expanded
        expect(openedOf([panel('More options', false)])).toBeNull()
    })
})

describe('explorer findings: form rows, form items, master/detail, full width', () => {
    const text = (id: string, t: string) => ({ type: 'ClientSide', id, children: [], metadata: { type: 'Text', text: t, container: 'span' } })
    const formWith = (metadata: Record<string, unknown>, children: unknown[]) =>
        ({ type: 'ClientSide', id: 'fl', children, metadata: { type: 'FormLayout', ...metadata } })

    it('a FormItem in a form layout is drawn, not "Unknown metadata type FormItem"', () => {
        const host = mountTemplate(renderFormLayout(container, formWith({ maxColumns: 2 }, [
            { type: 'ClientSide', id: 'item', children: [text('a', 'Invoice to')], metadata: { type: 'FormItem' } },
        ]) as never, '', {}, {}, {}, {}))
        expect(host.textContent).not.toContain('Unknown metadata type')
        expect(host.textContent).toContain('Invoice to')
    })

    it('a FormRow keeps its fields on one line in a form layout with responsive steps', () => {
        const host = mountTemplate(renderFormLayout(container, formWith({ maxColumns: 2 }, [
            { type: 'ClientSide', id: 'row', children: [text('a', 'Deposit'), text('b', 'Paid on')], metadata: { type: 'FormRow' } },
        ]) as never, '', {}, {}, {}, {}))
        // vaadin-form-row is ignored outside auto-responsive mode: a full-span flex band instead
        expect(host.querySelector('vaadin-form-row')).toBeNull()
        const band = host.querySelector('vaadin-form-layout > div') as HTMLElement
        expect(band.getAttribute('data-colspan')).toBe('2')
        expect(band.getAttribute('style')).toContain('display: flex')
        expect(band.textContent).toContain('Deposit')
        expect(band.textContent).toContain('Paid on')
    })

    it('an auto-responsive layout keeps vaadin-form-row', () => {
        const host = mountTemplate(renderFormLayout(container, formWith({ autoResponsive: true }, [
            { type: 'ClientSide', id: 'row', children: [text('a', 'x')], metadata: { type: 'FormRow' } },
        ]) as never, '', {}, {}, {}, {}))
        expect(host.querySelector('vaadin-form-row')).not.toBeNull()
    })

    it('a vertical MasterDetailLayout stacks the detail below the master, stretched, never as an overlay', () => {
        const host = mountTemplate(renderMasterDetailLayout(container, {
            type: 'ClientSide', id: 'md', metadata: { type: 'MasterDetailLayout', orientation: 'vertical' },
            children: [text('m', 'master'), text('d', 'detail')], style: 'height: 14rem;',
        } as never, '', {}, {}, {}, {}))
        // vaadin-master-detail-layout's vertical mode needs 30em for the master and overlays the
        // detail in a shorter box
        expect(host.querySelector('vaadin-master-detail-layout')).toBeNull()
        const box = host.firstElementChild as HTMLElement
        expect(box.getAttribute('style')).toContain('flex-direction: column')
        expect(box.getAttribute('style')).toContain('align-self: stretch')
        expect(box.getAttribute('style')).toContain('height: 14rem')
        expect(box.textContent).toContain('master')
        expect(box.textContent).toContain('detail')
    })

    it('a horizontal MasterDetailLayout stays a vaadin-master-detail-layout', () => {
        const host = mountTemplate(renderMasterDetailLayout(container, {
            type: 'ClientSide', id: 'md', metadata: { type: 'MasterDetailLayout' },
            children: [text('m', 'master'), text('d', 'detail')],
        } as never, '', {}, {}, {}, {}))
        expect(host.querySelector('vaadin-master-detail-layout')).not.toBeNull()
    })

    it('FullWidth stretches its content', () => {
        const host = mountTemplate(renderFullWidth(container, {
            type: 'ClientSide', id: 'fw', metadata: { type: 'FullWidth' }, children: [text('b', 'Confirm')],
        } as never, '', {}, {}, {}, {}))
        expect((host.firstElementChild as HTMLElement).getAttribute('style')).toContain('align-items: stretch')
    })
})
