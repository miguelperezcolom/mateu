import { beforeAll, describe, expect, it, vi } from 'vitest'
import { chartAlternativeOf, chartTitleOf, trendSummaryOf } from './chartAlternative'

describe('chart text alternative (WCAG 1.1.1)', () => {
    beforeAll(() => { vi.stubGlobal('navigator', { language: 'en' }) })
    it('names the chart by its title and lays its numbers out as a table', () => {
        const alt = chartAlternativeOf(
            { labels: ['Jan', 'Feb'], datasets: [{ label: 'Sales', data: [10, 20] }, { label: 'Costs', data: [5, 7] }] },
            { plugins: { title: { display: true, text: 'Revenue' } } })
        expect(alt.name).toBe('Revenue')
        expect(alt.table.headers).toEqual(['', 'Sales', 'Costs'])
        expect(alt.table.rows).toEqual([['Jan', '10', '5'], ['Feb', '20', '7']])
    })

    it('without a title, the series name it; without series, a generic name', () => {
        expect(chartAlternativeOf({ datasets: [{ label: 'Visits', data: [{ x: '2026-01-01', y: 3 }] }] }).name).toBe('Visits')
        expect(chartAlternativeOf({ datasets: [{ label: 'Visits', data: [{ x: '2026-01-01', y: 3 }] }] }).table.rows)
            .toEqual([['2026-01-01', '3']])
        expect(chartAlternativeOf(undefined).name).toBe('Chart')
        expect(chartTitleOf({ plugins: { title: { text: ['A', 'B'] } } })).toBe('A B')
    })

    it('a trend says how many values, where it starts and ends and its extremes', () => {
        expect(trendSummaryOf('Load', [3, 9, 1], ['Mon', 'Tue', 'Wed']))
            .toBe('Load: 3 values from Mon (3) to Wed (1); lowest Wed (1), highest Tue (9)')
    })
})
