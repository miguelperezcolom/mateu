import { html, nothing, type LitElement, type TemplateResult } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import type { ComponentState, ComponentData } from '@infra/ui/renderers/types'
import { renderComponent } from '@infra/ui/renderers/renderComponent'

/**
 * Dashboard family → Oracle Spectra dashboard leaf components (adapted from the clean-room templates
 * to the ComponentRenderer widget-map signature). The wire carries positional children: a
 * DashboardLayout holds a Scoreboard band + DashboardPanel tiles; a Scoreboard holds MetricCards; a
 * DashboardPanel wraps content. Layout + band are plain CSS grid (Spectra's dynamic grid/scoreboard
 * need an oj-dynamic layoutProvider we don't feed); the TILES are the real Redwood leaf components.
 */

const kids = (
  container: LitElement,
  component: ClientSideComponent,
  baseUrl: string | undefined,
  state: ComponentState,
  data: ComponentData,
  appState: ComponentState,
  appData: ComponentData,
): TemplateResult[] =>
  ((component.children ?? []) as ClientSideComponent[]).map((c) =>
    renderComponent(container, c, baseUrl, state, data, appState, appData),
  )

/** DashboardLayout → a responsive CSS grid of tiles. */
export function renderDashboardLayout(
  container: LitElement,
  component: ClientSideComponent,
  baseUrl: string | undefined,
  state: ComponentState,
  data: ComponentData,
  appState: ComponentState,
  appData: ComponentData,
): TemplateResult {
  const m = component.metadata as unknown as { columns?: number }
  const cols =
    m.columns && m.columns > 0
      ? `repeat(${m.columns}, minmax(0, 1fr))`
      : 'repeat(auto-fit, minmax(20rem, 1fr))'
  return html`<div
    style="display:grid; grid-template-columns:${cols}; gap:1rem; padding:1rem; align-items:start; width:100%; box-sizing:border-box;"
  >
    ${kids(container, component, baseUrl, state, data, appState, appData)}
  </div>`
}

/** Scoreboard → a KPI band spanning the full grid row; its children are MetricCards. */
export function renderScoreboard(
  container: LitElement,
  component: ClientSideComponent,
  baseUrl: string | undefined,
  state: ComponentState,
  data: ComponentData,
  appState: ComponentState,
  appData: ComponentData,
): TemplateResult {
  return html`<div class="mateu-rw-scoreboard" style="grid-column:1 / -1;">
    ${kids(container, component, baseUrl, state, data, appState, appData)}
  </div>`
}

/** DashboardPanel → a titled Redwood panel wrapping its content. */
export function renderDashboardPanel(
  container: LitElement,
  component: ClientSideComponent,
  baseUrl: string | undefined,
  state: ComponentState,
  data: ComponentData,
  appState: ComponentState,
  appData: ComponentData,
): TemplateResult {
  const m = component.metadata as unknown as { title?: string; subtitle?: string; colSpan?: number; rowSpan?: number }
  const spans: string[] = []
  if (m.colSpan && m.colSpan > 1) spans.push(`grid-column: span ${m.colSpan}`)
  if (m.rowSpan && m.rowSpan > 1) spans.push(`grid-row: span ${m.rowSpan}`)
  return html`<oj-sp-dashboard-panel
    class="mateu-rw-panel"
    .panelTitle=${m.title ?? ''}
    .panelSubtitle=${m.subtitle ?? ''}
    style=${spans.length ? spans.join('; ') : nothing}
    >${kids(container, component, baseUrl, state, data, appState, appData)}</oj-sp-dashboard-panel
  >`
}

/** MetricCard → a Redwood scoreboard metric card; clickable when it carries an actionId. */
export function renderMetricCard(
  _container: LitElement,
  component: ClientSideComponent,
): TemplateResult {
  const m = component.metadata as unknown as {
    title?: string
    value?: string
    unit?: string
    trend?: string
    trendLabel?: string
    description?: string
    actionId?: string
  }
  const metricText = `${m.value ?? ''}${m.unit ? ' ' + m.unit : ''}`
  const metaText = m.trendLabel || m.description || ''
  const trendColor = m.trend === 'up' ? 'success' : m.trend === 'down' ? 'danger' : 'neutral'
  const style = `flex:1 1 12rem; min-width:12rem;${m.actionId ? ' cursor:pointer;' : ''}`
  const onClick = m.actionId
    ? (e: Event) =>
        (e.currentTarget as HTMLElement)?.dispatchEvent(
          new CustomEvent('action-requested', {
            detail: { actionId: m.actionId, parameters: {} },
            bubbles: true,
            composed: true,
          }),
        )
    : undefined
  return html`<oj-sp-scoreboard-metric-card
    style=${style}
    .cardTitle=${m.title ?? ''}
    .metricText=${metricText}
    .metaText=${metaText}
    .trendColor=${trendColor}
    @click=${onClick}
  ></oj-sp-scoreboard-metric-card>`
}
