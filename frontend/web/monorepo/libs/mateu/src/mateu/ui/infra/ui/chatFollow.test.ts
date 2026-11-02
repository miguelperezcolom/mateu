import { describe, expect, it } from 'vitest'
import { deferAgentEvent, deferredActionLabel, isViewMovingAgentEvent } from './chatFollow'

describe('follow mode, which agent events it holds back', () => {
    it('holds back only the events that move the view', () => {
        expect(isViewMovingAgentEvent('navigation-requested')).toBe(true)
        expect(isViewMovingAgentEvent('render-screen')).toBe(true)
        expect(isViewMovingAgentEvent('close-requested')).toBe(false)
        expect(isViewMovingAgentEvent('highlight-row')).toBe(false)
    })

    it('labels a held-back event in the page language', () => {
        expect(deferredActionLabel('navigation-requested', { route: '/bookings' }, 'en')).toBe('Open /bookings')
        expect(deferredActionLabel('navigation-requested', { route: '/bookings' }, 'es')).toBe('Abrir /bookings')
        expect(deferredActionLabel('navigation-requested', { route: '  ' }, 'en')).toBe('Open the screen')
        expect(deferredActionLabel('navigation-requested', null, 'en')).toBe('Open the screen')
        expect(deferredActionLabel('render-screen', { yaml: 'type: Text' }, 'en')).toBe('Show the generated screen')
        expect(deferredActionLabel('render-screen', { yaml: 'type: Text' }, 'es')).toBe('Ver la pantalla generada')
    })

    it('keeps the event as it came, to apply it on a click', () => {
        const detail = { route: '/orders' }
        expect(deferAgentEvent('navigation-requested', detail, 'en')).toEqual({ name: 'navigation-requested', detail, label: 'Open /orders' })
    })
})
