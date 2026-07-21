import { html, nothing } from 'lit'
import type DashboardLayoutMeta from '@mateu/shared/apiClients/dtos/componentmetadata/DashboardLayout'
import type DashboardPanelMeta from '@mateu/shared/apiClients/dtos/componentmetadata/DashboardPanel'
import type MetricCardMeta from '@mateu/shared/apiClients/dtos/componentmetadata/MetricCard'
import type { SpectraTemplate } from '@/oj/types'

/**
 * Dashboard family → Oracle Spectra dashboard leaf components.
 *
 * The Mateu wire carries positional children (no named slots): a DashboardLayout holds a Scoreboard
 * band + DashboardPanel tiles; a Scoreboard holds MetricCards; a DashboardPanel wraps one content
 * component. We render the LAYOUT + BAND as plain CSS (Spectra's dynamic grid/scoreboard need an
 * oj-dynamic layoutProvider + data-bound templates we don't feed), and the TILES with the real
 * Redwood leaf components `oj-sp-dashboard-panel` and `oj-sp-scoreboard-metric-card`.
 */

/** DashboardLayout → a responsive CSS grid of tiles (children route through their own templates). */
export const dashboardLayoutTemplate: SpectraTemplate = {
  loaders: [],
  render(ctx) {
    const m = ctx.component.metadata as DashboardLayoutMeta
    const cols =
      m.columns && m.columns > 0
        ? `repeat(${m.columns}, minmax(0, 1fr))`
        : 'repeat(auto-fit, minmax(20rem, 1fr))'
    return html`
      <div
        style="display:grid; grid-template-columns:${cols}; gap:1rem; padding:1rem; align-items:start; width:100%; box-sizing:border-box;"
      >
        ${(ctx.component.children ?? []).map((c) => ctx.renderChild(c))}
      </div>
    `
  },
}

/** Scoreboard → a KPI band spanning the full grid row; its children are MetricCards. */
export const scoreboardTemplate: SpectraTemplate = {
  loaders: [],
  render(ctx) {
    return html`
      <div style="grid-column:1 / -1; display:flex; flex-wrap:wrap; gap:1rem;">
        ${(ctx.component.children ?? []).map((c) => ctx.renderChild(c))}
      </div>
    `
  },
}

/** DashboardPanel → a titled Redwood panel wrapping its single content component. */
export const dashboardPanelTemplate: SpectraTemplate = {
  loaders: ['oj-sp/dashboard-panel/loader'],
  render(ctx) {
    const m = ctx.component.metadata as DashboardPanelMeta
    const spans: string[] = []
    if (m.colSpan && m.colSpan > 1) spans.push(`grid-column: span ${m.colSpan}`)
    if (m.rowSpan && m.rowSpan > 1) spans.push(`grid-row: span ${m.rowSpan}`)
    return html`<oj-sp-dashboard-panel
      .panelTitle=${m.title ?? ''}
      .panelSubtitle=${m.subtitle ?? ''}
      style=${spans.length ? spans.join('; ') : nothing}
      >${(ctx.component.children ?? []).map((c) => ctx.renderChild(c))}</oj-sp-dashboard-panel
    >`
  },
}

/** MetricCard → a Redwood scoreboard metric card; clickable when it carries an actionId. */
export const metricCardTemplate: SpectraTemplate = {
  loaders: ['oj-sp/scoreboard-metric-card/loader'],
  render(ctx) {
    const m = ctx.component.metadata as MetricCardMeta
    const metricText = `${m.value ?? ''}${m.unit ? ' ' + m.unit : ''}`
    const metaText = m.trendLabel || m.description || ''
    const style = `flex:1 1 12rem; min-width:12rem;${m.actionId ? ' cursor:pointer;' : ''}`
    const onClick = m.actionId
      ? (e: Event) =>
          e.currentTarget?.dispatchEvent(
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
      .trendColor=${trendColorFor(m.trend)}
      @click=${onClick}
    ></oj-sp-scoreboard-metric-card>`
  },
}

/** Map Mateu's trend to the metric card's trendColor enum. */
function trendColorFor(trend: string | undefined): string {
  if (trend === 'up') return 'success'
  if (trend === 'down') return 'danger'
  return 'neutral'
}
