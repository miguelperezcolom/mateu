/**
 * Smaller mappings: Badge → oj-c-badge, ProgressBar → oj-c-progress-bar,
 * Chart → oj-chart (the legacy JET charting engine — oj-c only ships line/area charts, while
 * Mateu charts arrive in chart.js shape and include doughnut/bar).
 */
import { html, nothing, TemplateResult } from 'lit'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import Badge from '@mateu/shared/apiClients/dtos/componentmetadata/Badge'
import ProgressBar from '@mateu/shared/apiClients/dtos/componentmetadata/ProgressBar'
import Chart from '@mateu/shared/apiClients/dtos/componentmetadata/Chart'
import { ComponentState } from '@infra/ui/renderers/types.ts'

export const renderBadge = (component: ClientSideComponent): TemplateResult => {
  const m = component.metadata as Badge
  return html`<oj-c-badge
    style="${component.style ?? nothing}" class="${component.cssClasses ?? nothing}"
    slot="${component.slot ?? nothing}">${m.text ?? ''}</oj-c-badge>`
}

export const renderProgressBar = (component: ClientSideComponent, state: ComponentState = {}): TemplateResult => {
  const m = component.metadata as ProgressBar
  const value = m.valueKey ? (state[m.valueKey] as number) : m.value
  return html`
    <div style="${component.style ?? nothing}" class="${component.cssClasses ?? nothing}" slot="${component.slot ?? nothing}">
      <oj-c-progress-bar
        .value=${m.indeterminate ? -1 : (value ?? 0)}
        .max=${m.max && m.max !== 0 ? m.max : 100}></oj-c-progress-bar>
      ${m.text ? html`<div class="mateu-oj-field-help">${m.text}</div>` : nothing}
    </div>`
}

type ChartJsDataset = { label?: string; data?: number[]; backgroundColor?: unknown }
type ChartJsData = { labels?: string[]; datasets?: ChartJsDataset[] }

/** chart.js-shaped data → oj-chart groups/series. Pie/doughnut: one series per label with a
 * single value; bar/line/area: one series per dataset. */
const toOjChart = (metadata: Chart): { type: string; series: { name: string; items: number[] }[]; groups: string[] } => {
  const chartJsType = (metadata.chartType ?? 'bar').toLowerCase()
  const data = (metadata.chartData ?? {}) as ChartJsData
  const labels = data.labels ?? []
  const datasets = data.datasets ?? []
  if (chartJsType === 'doughnut' || chartJsType === 'pie') {
    const ds = datasets[0] ?? { data: [] }
    return {
      type: 'pie',
      series: labels.map((label, i) => ({ name: label, items: [Number(ds.data?.[i] ?? 0)] })),
      groups: [''],
    }
  }
  const type = chartJsType === 'line' ? 'line' : chartJsType === 'area' ? 'area' : 'bar'
  return {
    type,
    series: datasets.map(ds => ({ name: ds.label ?? '', items: (ds.data ?? []).map(Number) })),
    groups: labels,
  }
}

export const renderChart = (component: ClientSideComponent): TemplateResult => {
  const metadata = component.metadata as Chart
  const { type, series, groups } = toOjChart(metadata)
  return html`
    <div class="mateu-oj-chart" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}">
      <oj-chart
        type="${type}"
        .series=${series}
        .groups=${groups}
        style="width: 100%; max-width: 640px; height: 320px;"></oj-chart>
    </div>`
}
