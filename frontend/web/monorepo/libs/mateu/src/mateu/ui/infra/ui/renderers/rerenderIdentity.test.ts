// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render } from 'lit'
import { resolvedComponent } from './renderClientSideComponent'
import { renderComponent } from './renderComponent'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'

/**
 * A parent re-rendering for a reason of its own (a content mateu-ux whose route just changed, the
 * top ux re-pointed at the next screen) must not hand its children anything new, or they react as
 * if the server had sent it — which is the flash of the previous page on navigation (Vaadin,
 * 2026-10-30).
 */
describe('a client-side component re-rendered', () => {
    const app = () => ({ id: 'app', type: 'ClientSide', metadata: { type: ComponentMetadataType.App, homeRoute: '/a' } } as any)

    it('is handed out as the same object while nothing about it changes', () => {
        const component = app()
        const first = resolvedComponent(component, {})
        expect(resolvedComponent(component, {})).toBe(first)
        expect(first.metadata).toBe(component.metadata)
    })

    it('is a new one when a rule or the component itself changes', () => {
        const component = app()
        const first = resolvedComponent(component, {})
        expect(resolvedComponent(component, { 'app.hidden': true }).style).toContain('display: none')
        const again = resolvedComponent(component, {})
        component.slot = 'detail'
        expect(resolvedComponent(component, {})).not.toBe(again)
        expect(resolvedComponent(component, {}).slot).toBe('detail')
        expect(first.slot).toBeUndefined()
        expect(resolvedComponent(app(), {})).not.toBe(first)
    })
})

describe('a server-side child re-rendered by its parent', () => {
    const host = () => {
        const el = document.createElement('div')
        document.body.appendChild(el)
        return el
    }
    const container = { route: '/people/26', consumedRoute: '' } as any
    const paint = (el: HTMLElement, component: any, state: any, data: any) =>
        render(renderComponent(container, component, '', state, data, {}, {}), el)
    const child = (el: HTMLElement) => el.querySelector('mateu-component') as any

    it('keeps the state and data it loaded itself when nothing it is made of changed', () => {
        const el = host()
        const component = { id: 'c', type: 'ServerSide', initialData: { id: '26' } } as any
        const state = { id: '26' }
        paint(el, component, state, {})
        expect(child(el).state).toEqual({ id: '26' })
        // the record page fetched its record into its own state
        const loaded = { id: '26', name: 'Ackbar' }
        child(el).state = loaded
        child(el).data = { rows: 1 }
        // the parent re-renders (its route changed), with a fresh empty data map
        paint(el, component, state, {})
        expect(child(el).state).toBe(loaded)
        expect(child(el).data).toEqual({ rows: 1 })
    })

    it('is bound again when the parent state, the data or the component change', () => {
        const el = host()
        const component = { id: 'c', type: 'ServerSide', initialData: { id: '26' } } as any
        paint(el, component, { id: '26' }, {})
        child(el).state = { id: '26', name: 'Ackbar' }
        paint(el, component, { id: '26', name: 'Typed' }, {})
        expect(child(el).state).toEqual({ id: '26', name: 'Typed' })
        paint(el, component, { id: '26', name: 'Typed' }, { rows: 2 })
        expect(child(el).data).toEqual({ rows: 2 })
        const next = { id: 'd', type: 'ServerSide', initialData: { id: '2' } } as any
        paint(el, next, {}, {})
        expect(child(el).state).toEqual({ id: '2' })
    })
})
