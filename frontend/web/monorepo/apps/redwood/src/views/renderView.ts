import { html, nothing, type TemplateResult } from 'lit'
import type { MateuViewController, RenderedView } from '../core/MateuViewController'
import type { OjRuntime } from '../oj/runtime'
import { renderComponent, type RenderCtx } from './renderComponent'

/** Everything a content renderer needs: the view's controller (state writes / action dispatch) and
 *  the OJET runtime (constructors for data providers), or null when the CDN was unreachable. */
export interface RenderContext {
  controller: MateuViewController
  runtime: OjRuntime | null
}

/**
 * Content render entry point. Handles the loading / error / empty states, then dispatches the wire
 * component tree to the widget renderers. The state the widgets bind to is the controller's LIVE
 * component-state bag (not the published snapshot) so uncontrolled oj-c edits survive an incidental
 * re-render (e.g. toggling the nav rail) without a server round-trip.
 */
export function renderView(view: RenderedView, ctx: RenderContext): TemplateResult | typeof nothing {
  if (view.loading && !view.component) {
    return html`<div class="mateu-content-loading oj-typography-body-md oj-text-color-secondary">Loading…</div>`
  }
  if (view.error && !view.component) {
    return html`<div class="mateu-content-error">${view.error}</div>`
  }
  if (!view.component) return nothing

  const renderCtx: RenderCtx = {
    controller: ctx.controller,
    runtime: ctx.runtime,
    state: ctx.controller.currentComponentState,
    data: view.data,
  }
  return renderComponent(view.component, renderCtx)
}
