import { html, nothing } from 'lit'
import type { SpectraRenderContext, SpectraTemplate } from '@/oj/types'

/**
 * Minimal Page / Form chrome (NO mateu-page / mateu-form / vaadin). Renders the header (title +
 * subtitle) over the node's children (the actual content / field layout). Toolbar/button/kpi/banner
 * chrome is intentionally not built yet — added when a screen needs it.
 */
interface ChromeMeta {
  title?: string
  subtitle?: string
  noHeader?: boolean
}

function renderChrome(ctx: SpectraRenderContext) {
  const m = ctx.component.metadata as unknown as ChromeMeta
  const showHeader = !m.noHeader && (m.title || m.subtitle)
  return html`<div class="mateu-rw-page">
    ${showHeader
      ? html`<div class="rw-page-header">
          ${m.title ? html`<h1 class="rw-page-title">${m.title}</h1>` : nothing}
          ${m.subtitle ? html`<div class="rw-page-subtitle">${m.subtitle}</div>` : nothing}
        </div>`
      : nothing}
    ${(ctx.component.children ?? []).map((c) => ctx.renderChild(c))}
  </div>`
}

export const pageTemplate: SpectraTemplate = { loaders: [], render: renderChrome }
export const formTemplate: SpectraTemplate = { loaders: [], render: renderChrome }
