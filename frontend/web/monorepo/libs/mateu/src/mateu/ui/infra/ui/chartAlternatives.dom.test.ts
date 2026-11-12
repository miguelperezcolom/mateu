// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import './mateu-chart'
import './mateu-trend-chart'
import type { MateuChart } from './mateu-chart'
import type { MateuTrendChart } from './mateu-trend-chart'

// WCAG 1.1.1: the drawn chart is an image with a name, and its numbers are text next to it.
describe('chart text alternatives (DOM)', () => {
    it('mateu-chart: the canvas is a named image and the data is a hidden table', async () => {
        const el = document.createElement('mateu-chart') as MateuChart
        // keep chart.js out of jsdom (no canvas): only the markup is under test
        ;(el as unknown as { createChart: () => void }).createChart = () => {}
        el.type = 'bar'
        el.options = { plugins: { title: { display: true, text: 'Revenue' } } } as never
        el.data = { labels: ['Jan', 'Feb'], datasets: [{ label: 'Sales', data: [10, 20] }] } as never
        document.body.appendChild(el)
        await el.updateComplete
        const canvas = el.shadowRoot!.querySelector('canvas')!
        expect(canvas.getAttribute('role')).toBe('img')
        expect(canvas.getAttribute('aria-label')).toBe('Revenue')
        const cells = Array.from(el.shadowRoot!.querySelectorAll('table.sr-only tbody tr')).map((r) => Array.from(r.children).map((c) => c.textContent!.trim()).join(' '))
        expect(cells).toEqual(['Jan 10', 'Feb 20'])
        el.remove()
    })

    it('mateu-trend-chart: the svg is a named image summarising the line', async () => {
        const el = document.createElement('mateu-trend-chart') as MateuTrendChart
        el.heading = 'Load'
        el.values = [3, 9, 1]
        el.labels = ['Mon', 'Tue', 'Wed']
        document.body.appendChild(el)
        await el.updateComplete
        const svg = el.shadowRoot!.querySelector('svg')!
        expect(svg.getAttribute('role')).toBe('img')
        expect(svg.getAttribute('aria-label')).toMatch(/^Load: 3 /)
        el.remove()
    })
})
