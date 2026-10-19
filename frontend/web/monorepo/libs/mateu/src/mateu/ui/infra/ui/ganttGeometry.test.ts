import { describe, expect, it } from 'vitest'
import { DAY, dayMs, ganttGeometry } from './ganttGeometry'

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
