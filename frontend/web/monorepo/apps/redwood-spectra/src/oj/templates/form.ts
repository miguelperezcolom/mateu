import { html, nothing } from 'lit'
import type { SpectraTemplate } from '@/oj/types'

/**
 * Form field layout → plain flex `<div>`s (NO vaadin-form-layout / vaadin-form-row). The field grid
 * semantics (responsive columns, colspans) are simplified to a stacked/wrapping flex layout — the
 * screens we render (overview switchers, etc.) don't rely on the multi-column grid. Fields inside
 * still render via their own FormField templates.
 */
export const formLayoutTemplate: SpectraTemplate = {
  loaders: [],
  render(ctx) {
    return html`<div
      class="mateu-rw-form-layout ${ctx.component.cssClasses || ''}"
      style=${ctx.component.style || nothing}
    >
      ${(ctx.component.children ?? []).map((c) => ctx.renderChild(c))}
    </div>`
  },
}

export const formRowTemplate: SpectraTemplate = {
  loaders: [],
  render(ctx) {
    return html`<div class="mateu-rw-form-row">
      ${(ctx.component.children ?? []).map((c) => ctx.renderChild(c))}
    </div>`
  },
}
