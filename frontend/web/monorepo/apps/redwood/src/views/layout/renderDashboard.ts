import { html, nothing, type TemplateResult } from 'lit'
import { interpolate } from '../../core/expressions'
import type { Json, RenderCtx } from '../renderComponent'
import { ctxScope, renderChildren, renderComponent } from '../renderComponent'

/** DashboardLayout → responsive CSS grid of tiles (panels / cards / whatever the model declares). */
export function renderDashboardLayout(node: unknown, m: Json, ctx: RenderCtx): TemplateResult {
  const cols = Number(m['columns']) || 0
  const style = cols > 0 ? `grid-template-columns: repeat(${cols}, minmax(0,1fr));` : ''
  return html`<div class="mateu-dashboard" style=${style}>${renderChildren(node, ctx)}</div>`
}

/** DashboardPanel → a titled tile spanning colSpan × rowSpan. */
export function renderDashboardPanel(node: unknown, m: Json, ctx: RenderCtx): TemplateResult {
  const colSpan = Number(m['colSpan']) || 1
  const rowSpan = Number(m['rowSpan']) || 1
  const title = m['title'] ? interpolate(String(m['title']), ctxScope(ctx)) : ''
  const subtitle = m['subtitle'] ? interpolate(String(m['subtitle']), ctxScope(ctx)) : ''
  return html`<div class="mateu-panel" style="grid-column: span ${colSpan}; grid-row: span ${rowSpan};">
    ${title ? html`<div class="mateu-panel-title oj-typography-heading-xs">${title}</div>` : nothing}
    ${subtitle ? html`<div class="mateu-panel-subtitle oj-typography-body-xs oj-text-color-secondary">${subtitle}</div>` : nothing}
    <div class="mateu-panel-body">${renderChildren(node, ctx)}</div>
  </div>`
}

/** Scoreboard → a KPI band of MetricCards. */
export function renderScoreboard(node: unknown, _m: Json, ctx: RenderCtx): TemplateResult {
  return html`<div class="mateu-scoreboard">${renderChildren(node, ctx)}</div>`
}

/** MetricCard → a Redwood KPI tile (title, big value+unit, trend chip). */
export function renderMetricCard(node: unknown, m: Json, ctx: RenderCtx): TemplateResult {
  const title = interpolate(String(m['title'] ?? ''), ctxScope(ctx))
  const value = interpolate(String(m['value'] ?? ''), ctxScope(ctx))
  const unit = String(m['unit'] ?? '')
  const trend = String(m['trend'] ?? '')
  const trendLabel = String(m['trendLabel'] ?? '')
  const description = String(m['description'] ?? '')
  const actionId = String(m['actionId'] ?? '')
  const trendClass = trend === 'up' ? 'up' : trend === 'down' ? 'down' : ''
  const trendGlyph = trend === 'up' ? '▲' : trend === 'down' ? '▼' : ''

  const clickable = !!actionId
  return html`<div
    class="mateu-metric ${clickable ? 'clickable' : ''}"
    @click=${clickable ? () => void ctx.controller.runAction(actionId, (m['parameters'] as Json) ?? {}) : nothing}
  >
    <div class="mateu-metric-title oj-typography-body-sm oj-text-color-secondary">${title}</div>
    <div class="mateu-metric-value">
      <span class="mateu-metric-number">${value}</span>${unit ? html`<span class="mateu-metric-unit">${unit}</span>` : nothing}
    </div>
    ${trendLabel
      ? html`<div class="mateu-metric-trend ${trendClass}">${trendGlyph ? html`<span>${trendGlyph}</span>` : nothing}${trendLabel}</div>`
      : nothing}
    ${description ? html`<div class="mateu-metric-desc oj-typography-body-xs oj-text-color-secondary">${description}</div>` : nothing}
    ${renderComponent2Children(node, ctx)}
  </div>`
}

function renderComponent2Children(node: unknown, ctx: RenderCtx): TemplateResult | typeof nothing {
  const kids = ((node as Json)['children'] as Json[]) ?? []
  return kids.length ? html`${kids.map((c) => renderComponent(c, ctx))}` : nothing
}
