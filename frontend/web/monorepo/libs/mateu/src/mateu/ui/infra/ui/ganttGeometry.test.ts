import { describe, expect, it } from 'vitest'
import { DAY, dayMs, ganttGeometry, ganttScale, ganttTicks } from './ganttGeometry'

describe('gantt geometry (as Redwood and React Native)', () => {
    it('positions bars as percentages of the padded range', () => {
        const g = ganttGeometry([{ id: 'a', start: '2026-10-01', end: '2026-10-10' }])!
        expect(g.span).toBe(g.max - g.min)
        expect(g.bars[0].leftPct).toBeCloseTo(DAY / g.span * 100)
        expect(g.bars[0].widthPct).toBeCloseTo((dayMs('2026-10-11')! - dayMs('2026-10-01')!) / g.span * 100)
    })

    it('draws an end before the start as one day at the start, never a negative width', () => {
        const g = ganttGeometry([
            { id: 'a', start: '2026-10-01', end: '2026-10-02' },
            { id: 'b', start: '2026-10-12', end: '2026-10-03' },
        ])!
        const b = g.bars.find(x => x.task.id === 'b')!
        expect(b.end).toBe(b.start)
        expect(b.widthPct).toBeGreaterThan(0)
        expect(b.leftPct + b.widthPct).toBeLessThanOrEqual(100)
        expect(g.bars.every(x => x.widthPct > 0 && x.leftPct >= 0)).toBe(true)
    })

    it('leaves out tasks without both dates, and returns null when nothing is drawable', () => {
        const g = ganttGeometry([
            { id: 'a', start: '2026-10-01' },
            { id: 'b', end: '2026-10-01' },
            { id: 'c', start: 'soon', end: '2026-10-02' },
            { id: 'd', start: '2026-10-05', end: '2026-10-05' },
        ])!
        expect(g.bars.map(x => x.task.id)).toEqual(['d'])
        expect(g.bars[0].widthPct).toBeGreaterThan(0)
        expect(ganttGeometry([])).toBeNull()
        expect(ganttGeometry([{ id: 'x' }])).toBeNull()
    })

    it('reads a date-time by its day', () => {
        expect(dayMs('2026-10-01T10:00:00Z')).toBe(dayMs('2026-10-01'))
        expect(dayMs(undefined)).toBeNull()
    })
})

describe('gantt axis scale (by span)', () => {
    const range = (from: string, to: string) => [dayMs(from)!, dayMs(to)!] as const

    it('months for a project, quarters for a few years, years, then decades for a programme', () => {
        expect(ganttScale(...range('2026-01-01', '2026-12-31'))).toBe('month')
        expect(ganttScale(...range('2024-01-01', '2026-12-31'))).toBe('quarter')
        expect(ganttScale(...range('2000-01-01', '2026-12-31'))).toBe('year')
        expect(ganttScale(...range('1961-04-12', '2026-11-02'))).toBe('decade')
    })

    it('1961–2026 is seven decade cells, not ~780 month cells (crawl: /timeline scrolled sideways)', () => {
        const ticks = ganttTicks(...range('1961-04-12', '2026-11-02'))
        expect(ticks.map(t => t.label)).toEqual(['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'])
    })

    it('cells tile the range exactly and none is empty or negative', () => {
        for (const [a, b] of [['2026-03-15', '2026-05-02'], ['2023-02-10', '2026-08-20'], ['1961-04-12', '2026-11-02']]) {
            const [min, max] = range(a, b)
            const ticks = ganttTicks(min, max)
            expect(ticks[0].from).toBe(min)
            expect(ticks.at(-1)!.to).toBe(max)
            ticks.forEach((t, i) => {
                expect(t.to).toBeGreaterThan(t.from)
                if (i) expect(t.from).toBe(ticks[i - 1].to)
            })
        }
        expect(ganttTicks(...range('2023-02-10', '2026-08-20'))[0].label).toBe("Q1 '23")
        expect(ganttTicks(5, 5)).toEqual([])
    })
})
