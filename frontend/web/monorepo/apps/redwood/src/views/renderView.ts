import { html, nothing, type TemplateResult } from 'lit'
import type { MateuViewController, RenderedView } from '../core/MateuViewController'
import type { OjRuntime } from '../oj/runtime'

/** Everything a content renderer needs: the view's controller (state writes / action dispatch) and
 *  the OJET runtime (constructors for data providers), or null when the CDN was unreachable. */
export interface RenderContext {
  controller: MateuViewController
  runtime: OjRuntime | null
}

type Json = Record<string, any>

function metaOf(component: unknown): Json {
  return ((component as Json)?.['metadata'] as Json) ?? {}
}

function typeOf(component: unknown): string {
  return String(metaOf(component)['type'] ?? (component as Json)?.['type'] ?? 'unknown')
}

/**
 * Content render entry point. Dispatches a wire component (the RenderedView.component) to a widget.
 *
 * Phase 0 renders a minimal, honest placeholder for every type so the boot + round-trip is visible;
 * later phases replace the branches with the real oj-dynamic-form / oj-dynamic-table / oj-c widgets.
 */
export function renderView(view: RenderedView, ctx: RenderContext): TemplateResult | typeof nothing {
  if (view.loading && !view.component) {
    return html`<div class="mateu-content-loading oj-typography-body-md oj-text-color-secondary">Loading…</div>`
  }
  if (view.error && !view.component) {
    return html`<div class="mateu-content-error">${view.error}</div>`
  }
  if (!view.component) return nothing
  return renderComponent(view.component, view.state, view.data, ctx)
}

export function renderComponent(
  component: unknown,
  state: Json,
  _data: unknown,
  _ctx: RenderContext,
): TemplateResult {
  const type = typeOf(component)
  const meta = metaOf(component)
  const title = String(meta['title'] ?? meta['label'] ?? '')

  // Phase 0 placeholder: prove the round-trip renders authentic Redwood chrome + reaches content.
  return html`
    <div class="mateu-page">
      ${title
        ? html`<h1 class="oj-typography-heading-lg mateu-page-title">${title}</h1>`
        : nothing}
      <div class="mateu-placeholder-card">
        <span class="oj-typography-body-sm oj-text-color-secondary"
          >Redwood renderer — <strong>${type}</strong> received.</span
        >
        <pre class="mateu-placeholder-json">${safePreview(state)}</pre>
      </div>
    </div>
  `
}

function safePreview(state: Json): string {
  try {
    const keys = Object.keys(state ?? {}).slice(0, 12)
    if (keys.length === 0) return '(no state)'
    return keys.map((k) => `${k}: ${previewValue(state[k])}`).join('\n')
  } catch {
    return ''
  }
}

function previewValue(v: unknown): string {
  if (v === null || v === undefined) return String(v)
  if (Array.isArray(v)) return `[${v.length} items]`
  if (typeof v === 'object') return '{…}'
  return String(v).slice(0, 60)
}
