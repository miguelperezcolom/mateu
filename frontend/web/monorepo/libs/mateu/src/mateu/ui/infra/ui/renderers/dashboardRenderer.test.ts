// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import type MetricCard from '@mateu/shared/apiClients/dtos/componentmetadata/MetricCard'
import { metricCardAccessibleText, renderMetricCard } from './dashboardRenderer'

/** A KPI tile states the period its number covers, under the value, and reads it out with it. */
describe('the metric card timeframe', () => {
    const draw = (metadata: Partial<MetricCard>) => {
        const host = document.createElement('div')
        const component = { type: 'ClientSide', id: 'kpi', metadata: { type: 'MetricCard', ...metadata }, children: [] } as unknown as ClientSideComponent
        render(renderMetricCard(component), host)
        return host.querySelector('.mateu-metric-card') as HTMLElement
    }

    it('shows the timeframe under the value, small and muted', () => {
        const card = draw({ title: 'Revenue', value: '12.4k', unit: '€', timeframe: 'Last 7 days', trend: 'up', trendLabel: '+8%' })
        const timeframe = card.querySelector('.mateu-metric-timeframe') as HTMLElement
        expect(timeframe.textContent).toBe('Last 7 days')
        expect(timeframe.getAttribute('style')).toContain('--lumo-secondary-text-color')
        expect(timeframe.getAttribute('style')).toContain('--lumo-font-size-xs')
        // it comes right after the value row, before the trend
        expect(timeframe.previousElementSibling!.textContent).toContain('12.4k')
    })

    it('draws nothing for a missing or blank timeframe', () => {
        expect(draw({ title: 'Revenue', value: '12.4k' }).querySelector('.mateu-metric-timeframe')).toBeNull()
        expect(draw({ title: 'Revenue', value: '12.4k', timeframe: '  ' }).querySelector('.mateu-metric-timeframe')).toBeNull()
    })

    it('is part of the accessible text, after the value', () => {
        const card = draw({ title: 'Revenue', value: '12.4k', unit: '€', timeframe: 'Last 7 days', trendLabel: '+8%', description: 'Gross' })
        expect(card.getAttribute('aria-label')).toBe('Revenue, 12.4k €, Last 7 days, +8%, Gross')
        expect(card.getAttribute('role')).toBe('group')
        expect(draw({ title: 'Revenue', value: '1', actionId: 'open' }).getAttribute('role')).toBe('button')
    })

    it('skips blank parts of the accessible text', () => {
        expect(metricCardAccessibleText({ title: 'Occupancy', value: '82', unit: '%', timeframe: ' ' } as MetricCard))
            .toBe('Occupancy, 82 %')
    })
})
