import { describe, expect, it } from 'vitest'
import { builtInButtonLabel } from './builtInButtonLabels'

describe('builtInButtonLabel', () => {
    it("CalendarPage's untranslated toolbar labels are drawn in the UI language", () => {
        expect(builtInButtonLabel({ actionId: 'goCalendarToday', label: 'Today' }, 'Today', 'es')).toBe('Hoy')
        expect(builtInButtonLabel({ actionId: 'createCalendarEvent', label: '+ Create' }, '+ Create', 'es')).toBe('+ Crear')
        const views = ['month', 'week', 'day', 'list'].map((v, i) =>
            builtInButtonLabel({ actionId: 'switchCalendarView', parameters: { _view: v } }, ['Month', 'Week', 'Day', 'List'][i], 'es'))
        expect(views).toEqual(['Mes', 'Semana', 'Día', 'Lista'])
        expect(builtInButtonLabel({ actionId: 'goCalendarToday' }, 'Today', 'en')).toBe('Today')
    })

    it("a label the app's Translator translated, or any other button, is left alone", () => {
        expect(builtInButtonLabel({ actionId: 'goCalendarToday' }, 'Avui', 'es')).toBe('Avui')
        expect(builtInButtonLabel({ actionId: 'switchCalendarView', parameters: { _view: 'week' } }, 'Month', 'es')).toBe('Month')
        expect(builtInButtonLabel({ actionId: 'save' }, 'Today', 'es')).toBe('Today')
        expect(builtInButtonLabel({ actionId: 'toString' }, 'Today', 'es')).toBe('Today')
        expect(builtInButtonLabel({ actionId: 'goCalendarToday', label: 'Today' })).toBeDefined()
    })
})
