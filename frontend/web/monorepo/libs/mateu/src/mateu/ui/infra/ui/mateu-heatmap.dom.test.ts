// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import './mateu-heatmap'
import type { MateuHeatmap } from './mateu-heatmap'

/**
 * The calendar heatmap: one square per day from the Monday before the first date, each in its
 * weekday row, coloured by intensity, its tooltip the day's label or "date: value".
 */
describe('mateu-heatmap (DOM)', () => {
    const mount = async (cells: unknown[]) => {
        const el = document.createElement('mateu-heatmap') as MateuHeatmap
        el.cells = cells as never
        document.body.appendChild(el)
        await el.updateComplete
        return el
    }
    const squares = (el: MateuHeatmap) => Array.from(el.shadowRoot!.querySelectorAll('.grid .cell')) as HTMLElement[]
    afterEach(() => { document.body.innerHTML = '' })

    it('renders nothing without dated cells', async () => {
        const el = await mount([{ value: 3 }])
        expect(el.shadowRoot!.querySelector('.wrap')).toBeNull()
    })

    it('puts each value on ITS day: the square, the weekday row and the tooltip agree', async () => {
        // 2026-03-04 is a Wednesday, 2026-03-08 a Sunday
        const el = await mount([
            { date: '2026-03-04', value: 4, label: 'Wed: 4 check-ins' },
            { date: '2026-03-08', value: 1 },
        ])
        const all = squares(el)
        // Monday 03-02 .. Sunday 03-08
        expect(all).toHaveLength(7)
        expect(all.map(s => s.title)).toEqual([
            '2026-03-02: 0', '2026-03-03: 0', 'Wed: 4 check-ins', '2026-03-05: 0', '2026-03-06: 0', '2026-03-07: 0', '2026-03-08: 1',
        ])
        expect(all.map(s => s.style.gridRow)).toEqual(['1', '2', '3', '4', '5', '6', '7'])
        // the busiest day is full intensity, an empty one is the neutral tint
        expect(all[2].getAttribute('style')).toContain('100%')
        expect(all[0].getAttribute('style')).toContain('--lumo-contrast-10pct')
        expect(all[6].getAttribute('style')).toContain('30%')
    })

    it('keeps the days straight across a daylight-saving change', async () => {
        // Europe moves the clocks on 2026-03-29 (a Sunday); the week after it must not drift
        const el = await mount([{ date: '2026-03-23', value: 2 }, { date: '2026-04-01', value: 2 }])
        const all = squares(el)
        expect(all).toHaveLength(10)
        expect(all.at(-1)!.title).toBe('2026-04-01: 2')
        expect(all.at(-1)!.style.gridRow).toBe('3')
    })

    it('shows the intensity legend', async () => {
        const el = await mount([{ date: '2026-03-04', value: 1 }])
        const legend = el.shadowRoot!.querySelector('.legend')!
        expect(legend.textContent!.replace(/\s+/g, ' ').trim()).toBe('Less More')
        expect(legend.querySelectorAll('.cell')).toHaveLength(5)
    })
})
