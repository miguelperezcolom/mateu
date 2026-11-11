// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { renderButton } from './renderButton'

/**
 * CalendarPage's toolbar (‹ Today › Month Week …) comes from the server in English, through the
 * app's Translator. When the Translator leaves those words as they are, the Vaadin button draws
 * them in the UI's language (`<html lang>`) from the chrome catalogue; a translated label stays.
 */
const button = (label: string, actionId: string, parameters: Record<string, unknown> = {}) =>
    ({ type: 'ClientSide', id: actionId, metadata: { type: 'Button', label, actionId, parameters }, children: [] }) as unknown as ClientSideComponent

const draw = (component: ClientSideComponent) => {
    const host = document.createElement('div')
    render(renderButton(component, {}, {}), host)
    return host.querySelector('vaadin-button')!.textContent!.trim()
}

afterEach(() => { document.documentElement.lang = '' })

describe("the Vaadin button and CalendarPage's built-in labels", () => {
    it('are drawn in Spanish in a Spanish UI', () => {
        document.documentElement.lang = 'es'
        expect(draw(button('Today', 'goCalendarToday'))).toBe('Hoy')
        expect(draw(button('Week', 'switchCalendarView', { _view: 'week' }))).toBe('Semana')
        expect(draw(button('List', 'switchCalendarView', { _view: 'list' }))).toBe('Lista')
        expect(draw(button('+ Create', 'createCalendarEvent'))).toBe('+ Crear')
    })

    it("keep the app's own translation and any other button's label", () => {
        document.documentElement.lang = 'es'
        expect(draw(button('Avui', 'goCalendarToday'))).toBe('Avui')
        expect(draw(button('Today', 'somethingElse'))).toBe('Today')
        document.documentElement.lang = 'en'
        expect(draw(button('Today', 'goCalendarToday'))).toBe('Today')
    })
})

describe('a ButtonGroup in content (a Button with children)', () => {
    const group = {
        type: 'ClientSide', id: 'more', children: [],
        metadata: { type: 'Button', label: 'More', children: [
            { type: 'Button', label: 'Export', actionId: 'export' },
            { type: 'Button', label: 'Archive', actionId: 'archive', parameters: { all: true } },
        ] },
    } as unknown as ClientSideComponent

    it('is a menu bar whose one item opens the group buttons, each running its own action', () => {
        const host = document.createElement('div')
        render(renderButton(group, {}, {}), host)
        const bar = host.querySelector('vaadin-menu-bar') as HTMLElement & { items: any[] }
        expect(bar).not.toBeNull()
        expect(bar.items[0].text).toBe('More')
        expect(bar.items[0].children.map((c: any) => c.text)).toEqual(['Export', 'Archive'])
        const seen: unknown[] = []
        host.addEventListener('action-requested', e => seen.push((e as CustomEvent).detail))
        bar.dispatchEvent(new CustomEvent('item-selected', { detail: { value: bar.items[0].children[1] } }))
        expect(seen).toEqual([{ actionId: 'archive', parameters: { all: true } }])
    })
})

describe('a split button (a ButtonGroup with a primary)', () => {
    const split = {
        type: 'ClientSide', id: 'save', children: [],
        metadata: { type: 'Button', label: 'Save', actionId: 'save', buttonStyle: 'primary', split: true, children: [
            { type: 'Button', label: 'Save as draft', actionId: 'saveDraft' },
        ] },
    } as unknown as ClientSideComponent

    it('is ONE menu bar: the primary runs its action, the named ▾ opens the rest', () => {
        const host = document.createElement('div')
        render(renderButton(split, {}, {}), host)
        const bar = host.querySelector('vaadin-menu-bar') as HTMLElement & { items: any[] }
        expect(bar.getAttribute('theme')).toBe('primary')
        expect(bar.items).toHaveLength(2)
        expect(bar.items[0].text).toBe('Save')
        expect(bar.items[0].children).toBeUndefined()
        expect(bar.items[1].tooltip).toBe('More actions')
        expect(bar.items[1].theme).toEqual(['primary', 'icon'])
        expect((bar.items[1].component as HTMLElement).textContent).toContain('More actions')
        expect(bar.items[1].children.map((c: any) => c.text)).toEqual(['Save as draft'])
        expect(bar.querySelector('vaadin-tooltip[slot="tooltip"]')).not.toBeNull()
        const seen: unknown[] = []
        host.addEventListener('action-requested', e => seen.push((e as CustomEvent).detail))
        bar.dispatchEvent(new CustomEvent('item-selected', { detail: { value: bar.items[0] } }))
        bar.dispatchEvent(new CustomEvent('item-selected', { detail: { value: bar.items[1].children[0] } }))
        expect(seen.map((d: any) => d.actionId)).toEqual(['save', 'saveDraft'])
    })
})
