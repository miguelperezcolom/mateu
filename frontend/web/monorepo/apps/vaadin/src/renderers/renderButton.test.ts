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
