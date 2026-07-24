import { html, nothing, type TemplateResult } from 'lit'
import type { MateuViewController } from '../core/MateuViewController'
import type { OjRuntime } from '../oj/runtime'
import { interpolate } from '../core/expressions'
import { renderField } from './fields/renderField'
import { renderButton } from './leaves/renderButton'

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
      return html`
        <div class="mateu-page">
          ${m['title'] ? html`<h1 class="oj-typography-heading-lg mateu-page-title">${interpolate(String(m['title']), ctxScope(ctx))}</h1>` : nothing}
          ${m['subtitle'] ? html`<p class="oj-typography-body-md oj-text-color-secondary mateu-page-subtitle">${interpolate(String(m['subtitle']), ctxScope(ctx))}</p>` : nothing}
          ${renderChildren(node, ctx)}
        </div>
      `

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

    // ── leaves ──────────────────────────────────────────────────────────────────────
    case 'FormField':
      return renderField(node, m, ctx)

    case 'Button':
      return renderButton(node, m, ctx)

    case 'Text':
      return renderText(m, ctx)

    default:
      // Unknown / not-yet-ported: render children so containers still show their content.
      return renderChildren(node, ctx)
  }
}

export function renderChildren(node: unknown, ctx: RenderCtx): TemplateResult {
  return html`${childrenOf(node).map((c) => renderComponent(c, ctx))}`
}

// ── container helpers ─────────────────────────────────────────────────────────────────

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
