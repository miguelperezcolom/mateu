import { html, nothing, type TemplateResult } from 'lit'
import type { MateuViewController } from '../core/MateuViewController'
import type { OjRuntime } from '../oj/runtime'
import { interpolate } from '../core/expressions'
import { renderField } from './fields/renderField'
import { renderButton } from './leaves/renderButton'
import { renderCrud } from './table/renderCrud'
import { renderTabs } from './layout/renderTabs'
import { renderDashboardLayout, renderDashboardPanel, renderScoreboard, renderMetricCard } from './layout/renderDashboard'
import {
  renderMarkdown,
  renderNotice,
  renderBadge,
  renderProgressBar,
  renderMeter,
  renderAvatar,
  renderHero,
  renderEmptyState,
  renderSeparator,
  renderEntityHeader,
  renderStatusList,
  renderBulletedList,
} from './leaves/renderDisplay'

export type Json = Record<string, any>

/** Everything a widget needs to render + talk back to its controller. */
export interface RenderCtx {
  controller: MateuViewController
  runtime: OjRuntime | null
  state: Json
  data: unknown
}

function meta(node: unknown): Json {
  return ((node as Json)?.['metadata'] as Json) ?? {}
}
function childrenOf(node: unknown): Json[] {
  const c = (node as Json)?.['children']
  return Array.isArray(c) ? c : []
}
function typeOf(node: unknown): string {
  return String(meta(node)['type'] ?? (node as Json)?.['type'] ?? '')
}

/**
 * Renders a wire component (and its subtree) to a Lit template. The single content dispatch the
 * whole renderer grows: containers recurse, leaves map to authentic oj-c / oj-sp components.
 *
 * Descent follows both `children` AND the nested-metadata components the wire nests inside records
 * (Card.content) — the "walkers must descend reflectively" rule.
 */
export function renderComponent(node: unknown, ctx: RenderCtx): TemplateResult | typeof nothing {
  if (!node || typeof node !== 'object') return nothing
  const m = meta(node)
  const t = typeOf(node)

  switch (t) {
    // ── containers ──────────────────────────────────────────────────────────────────
    case 'ServerSide':
      return renderChildren(node, ctx)

    case 'Page':
      return renderPage(node, m, ctx)

    case 'VerticalLayout':
      return html`<div class="mateu-vlayout ${m['fullWidth'] ? 'full' : ''}" style=${styleFor(node, m['spacing'] ? 'gap:1rem;' : 'gap:0;')}>
        ${renderChildren(node, ctx)}
      </div>`

    case 'HorizontalLayout':
      return html`<div class="mateu-hlayout" style=${styleFor(node, `gap:${m['spacing'] ? '1rem' : '0'};${m['wrap'] ? 'flex-wrap:wrap;' : ''}`)}>
        ${renderChildren(node, ctx)}
      </div>`

    case 'Div':
      return html`<div style=${styleFor(node, '')}>${renderChildren(node, ctx)}</div>`

    case 'Card':
      return renderCard(node, m, ctx)

    case 'FormLayout':
      return renderFormLayout(node, m, ctx)

    case 'FormRow':
      return html`<div class="mateu-form-row">${renderChildren(node, ctx)}</div>`

    case 'Crud':
    case 'Crudl':
    case 'Listing':
      return renderCrud(node, m, ctx)

    // ── layouts / archetypes ────────────────────────────────────────────────────────
    case 'TabLayout':
      return renderTabs(node, m, ctx)

    case 'DashboardLayout':
      return renderDashboardLayout(node, m, ctx)
    case 'DashboardPanel':
      return renderDashboardPanel(node, m, ctx)
    case 'Scoreboard':
      return renderScoreboard(node, m, ctx)
    case 'MetricCard':
      return renderMetricCard(node, m, ctx)

    case 'FoldoutLayout':
      // Overview + panels arrive as slotted children; render stacked (fold interaction TBD).
      return html`<div class="mateu-foldout">${renderChildren(node, ctx)}</div>`

    // ── leaves ──────────────────────────────────────────────────────────────────────
    case 'FormField':
      return renderField(node, m, ctx)

    case 'Button':
      return renderButton(node, m, ctx)

    case 'Text':
      return renderText(m, ctx)

    case 'Markdown':
      return renderMarkdown(m, ctx)
    case 'Notice':
      return renderNotice(m, ctx)
    case 'Badge':
      return renderBadge(m, ctx)
    case 'ProgressBar':
      return renderProgressBar(m, ctx)
    case 'Meter':
      return renderMeter(m, ctx)
    case 'Avatar':
      return renderAvatar(m, ctx)
    case 'HeroSection':
      return renderHero(node, m, ctx)
    case 'EmptyState':
      return renderEmptyState(m, ctx)
    case 'Separator':
      return renderSeparator(m)
    case 'EntityHeader':
      return renderEntityHeader(node, m, ctx)
    case 'StatusList':
      return renderStatusList(m, ctx)
    case 'BulletedList':
      return renderBulletedList(m, ctx)

    default:
      // Unknown / not-yet-ported: render children so containers still show their content.
      return renderChildren(node, ctx)
  }
}

export function renderChildren(node: unknown, ctx: RenderCtx): TemplateResult {
  return html`${childrenOf(node).map((c) => renderComponent(c, ctx))}`
}

// ── container helpers ─────────────────────────────────────────────────────────────────

/** Normalise a toolbar/buttons item to its metadata (wire nests some as ClientSide, some raw). */
function metaItems(arr: unknown): Json[] {
  return (Array.isArray(arr) ? arr : []).map((i) => ((i as Json)['metadata'] as Json) ?? (i as Json))
}

function renderPage(node: unknown, m: Json, ctx: RenderCtx): TemplateResult {
  const title = m['title'] ? interpolate(String(m['title']), ctxScope(ctx)) : ''
  const subtitle = m['subtitle'] ? interpolate(String(m['subtitle']), ctxScope(ctx)) : ''
  const toolbar = metaItems(m['toolbar'])
  const buttons = metaItems(m['buttons'])
  return html`
    <div class="mateu-page">
      ${title || toolbar.length
        ? html`<div class="mateu-page-header">
            <div class="mateu-page-header-titles">
              ${title ? html`<h1 class="oj-typography-heading-lg mateu-page-title">${title}</h1>` : nothing}
              ${subtitle ? html`<p class="oj-typography-body-md oj-text-color-secondary mateu-page-subtitle">${subtitle}</p>` : nothing}
            </div>
            ${toolbar.length ? html`<div class="mateu-page-toolbar">${toolbar.map((b) => renderButton({}, b, ctx))}</div>` : nothing}
          </div>`
        : nothing}
      ${renderChildren(node, ctx)}
      ${buttons.length ? html`<div class="mateu-page-buttons">${buttons.map((b) => renderButton({}, b, ctx))}</div>` : nothing}
    </div>
  `
}

function renderCard(node: unknown, m: Json, ctx: RenderCtx): TemplateResult {
  const title = m['title'] ? interpolate(String(m['title']), ctxScope(ctx)) : ''
  const subtitle = m['subtitle'] ? interpolate(String(m['subtitle']), ctxScope(ctx)) : ''
  const content = m['content'] as unknown
  return html`
    <div class="mateu-card oj-panel">
      ${title ? html`<div class="mateu-card-title oj-typography-heading-sm">${title}</div>` : nothing}
      ${subtitle ? html`<div class="mateu-card-subtitle oj-typography-body-sm oj-text-color-secondary">${subtitle}</div>` : nothing}
      ${content ? renderComponent(content, ctx) : nothing}
      ${renderChildren(node, ctx)}
      ${m['footer'] ? renderComponent(m['footer'], ctx) : nothing}
    </div>
  `
}

function renderFormLayout(node: unknown, m: Json, ctx: RenderCtx): TemplateResult {
  const cols = Number(m['maxColumns']) || 1
  const labelsAside = m['labelsAside'] === true
  return html`<div
    class="mateu-form-layout ${labelsAside ? 'labels-aside' : ''}"
    style="--mateu-form-cols:${cols};"
  >
    ${renderChildren(node, ctx)}
  </div>`
}

function renderText(m: Json, ctx: RenderCtx): TemplateResult {
  const text = interpolate(String(m['text'] ?? m['content'] ?? ''), ctxScope(ctx))
  const size = String(m['size'] ?? 'm')
  const sizeClass =
    size === 'xl' ? 'oj-typography-heading-lg'
    : size === 'l' ? 'oj-typography-heading-sm'
    : size === 's' ? 'oj-typography-body-sm'
    : size === 'xs' ? 'oj-typography-body-xs'
    : 'oj-typography-body-md'
  return html`<div class="mateu-text ${sizeClass}">${text}</div>`
}

// ── shared helpers ────────────────────────────────────────────────────────────────────

export function ctxScope(ctx: RenderCtx): Json {
  return { state: ctx.state, data: ctx.data }
}

function styleFor(node: unknown, extra: string): string {
  const s = String((node as Json)?.['style'] ?? '')
  return (extra + (s ? ' ' + s : '')).trim()
}
