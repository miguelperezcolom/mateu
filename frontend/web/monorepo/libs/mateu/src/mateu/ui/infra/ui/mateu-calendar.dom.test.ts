// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import './mateu-calendar'
import type { MateuCalendar } from './mateu-calendar'

/**
 * The calendar's four views as a user sees them: month grid, week, day and list; the switcher
 * changes the view in place; events with an action and (with dayActionId) day cells are clickable.
 */
describe('mateu-calendar (DOM)', () => {
    const EVENTS = [
        { id: 'e1', title: 'Conference', date: '2026-03-04', endDate: '2026-03-05', actionId: 'openEvent', color: '#f00' },
        { id: 'e2', title: 'Standup', date: '2026-03-04', startTime: '09:00', endTime: '09:15' },
        { id: 'e3', title: 'Audit', date: '2026-03-20' },
    ]
    const DAYS = [{ date: '2026-03-04', label: '90%', tone: 'danger' }]
    let events: { actionId: string, parameters: Record<string, unknown> }[]
    const listener = (e: Event) => events.push((e as CustomEvent).detail)
    const mount = async (props: Partial<MateuCalendar> = {}) => {
        const el = document.createElement('mateu-calendar') as MateuCalendar
        Object.assign(el, { month: '2026-03-04', events: EVENTS, days: DAYS }, props)
        document.body.appendChild(el)
        await el.updateComplete
        return el
    }
    const $ = (el: MateuCalendar, sel: string) => el.shadowRoot!.querySelector(sel) as HTMLElement
    const $$ = (el: MateuCalendar, sel: string) => Array.from(el.shadowRoot!.querySelectorAll(sel)) as HTMLElement[]
    const cellOf = (el: MateuCalendar, day: number) => $$(el, '.cell:not(.blank)').find(c => c.querySelector('.num')?.textContent === String(day))!

    beforeEach(() => { events = []; document.addEventListener('action-requested', listener) })
    afterEach(() => { document.removeEventListener('action-requested', listener); document.body.innerHTML = '' })

    it('the month view is a Mon–Sun grid with the events and day labels in their cells', async () => {
        const el = await mount()
        expect($$(el, '.dow').map(d => d.textContent)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
        // March 2026 starts on a Sunday: six blanks before the 1st
        expect($$(el, '.month > .cell').slice(0, 7).map(c => c.classList.contains('blank'))).toEqual([true, true, true, true, true, true, false])
        expect($$(el, '.cell:not(.blank)')).toHaveLength(31)
        const fourth = cellOf(el, 4)
        expect(fourth.classList.contains('tone-danger')).toBe(true)
        expect(fourth.querySelector('.label')!.textContent).toBe('90%')
        // all-day first, then by start time; no times in the month grid
        expect(Array.from(fourth.querySelectorAll('.chip')).map(c => c.textContent)).toEqual(['Conference', 'Standup'])
        // a multi-day event is on every day of its span
        expect(cellOf(el, 5).textContent).toContain('Conference')
        const conf = fourth.querySelectorAll('.chip')[0] as HTMLElement
        expect(conf.getAttribute('role')).toBe('button')
        expect(conf.getAttribute('style')).toContain('--mateu-cal-accent: #f00')
        expect((fourth.querySelectorAll('.chip')[1] as HTMLElement).hasAttribute('role')).toBe(false)
        // no dayActionId: the cells are not buttons
        expect(fourth.hasAttribute('role')).toBe(false)
        expect($(el, '.switcher')).toBeNull()
    })

    it('an event with an action dispatches it; a click on a plain event reaches the day cell', async () => {
        const el = await mount({ dayActionId: 'openDay' })
        const fourth = cellOf(el, 4)
        expect(fourth.getAttribute('role')).toBe('button')
        expect(fourth.getAttribute('aria-label')).toContain('90%, 2 events')
        ;(fourth.querySelectorAll('.chip')[0] as HTMLElement).click()
        expect(events).toEqual([{ actionId: 'openEvent', parameters: { _clickedEvent: EVENTS[0] } }])
        ;(fourth.querySelectorAll('.chip')[1] as HTMLElement).click()
        expect(events.at(-1)).toEqual({ actionId: 'openDay', parameters: { _date: '2026-03-04' } })
        cellOf(el, 20).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        expect(events.at(-1)).toEqual({ actionId: 'openDay', parameters: { _date: '2026-03-20' } })
        ;(fourth.querySelectorAll('.chip')[0] as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }))
        expect(events.filter(e => e.actionId === 'openEvent')).toHaveLength(2)
        // Enter on the event runs the EVENT only — like a click, it does not also open its day
        expect(events.at(-1)!.actionId).toBe('openEvent')
        expect(events.filter(e => e.actionId === 'openDay')).toHaveLength(2)
    })

    it('the switcher changes the view in place; a new view from the server wins', async () => {
        const el = await mount({ views: ['month', 'week', 'day', 'list'] })
        const buttons = () => $$(el, '.switcher button')
        expect(buttons().map(b => b.textContent)).toEqual(['Month', 'Week', 'Day', 'List'])
        expect(buttons()[0].getAttribute('aria-pressed')).toBe('true')

        buttons()[1].click()
        await el.updateComplete
        expect(buttons()[1].getAttribute('aria-pressed')).toBe('true')
        // the week of the 4th: Mon 2 .. Sun 8, timed events show their time
        expect($$(el, '.week > .cell')).toHaveLength(7)
        const wed = $$(el, '.week > .cell')[2]
        expect(wed.querySelector('.time')!.textContent).toBe('09:00–09:15')
        expect(wed.querySelector('.num')).toBeNull()

        buttons()[2].click()
        await el.updateComplete
        expect($$(el, '.day > .cell')).toHaveLength(1)
        expect($(el, '.day > .cell').textContent).toContain('Standup')

        buttons()[3].click()
        await el.updateComplete
        expect($$(el, '.agenda .date')).toHaveLength(3) // 4th, 5th, 20th
        expect($$(el, '.agenda .date')[0].classList.contains('tone-danger')).toBe(true)
        expect($$(el, '.agenda .date')[0].querySelector('.label')!.textContent).toBe('90%')
        expect($$(el, '.agenda .entries')[0].textContent).toContain('09:00–09:15')

        el.view = 'month'
        await el.updateComplete
        expect($$(el, '.month')).toHaveLength(1)
    })

    it('an empty list says so', async () => {
        const el = await mount({ view: 'list', events: [] })
        expect($(el, '.agenda .empty').textContent).toBe('No events')
    })

    it('the title names the period of the view', async () => {
        const month = await mount()
        expect($(month, '.head .title').textContent).toContain('2026')
        const day = await mount({ view: 'day' })
        expect($(day, '.head .title').textContent).toContain('4')
        const week = await mount({ view: 'week' })
        expect($(week, '.head .title').textContent).toContain('–')
    })
})
