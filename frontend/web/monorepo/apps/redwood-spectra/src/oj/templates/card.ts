import { html, nothing } from 'lit'
import type CardMeta from '@mateu/shared/apiClients/dtos/componentmetadata/Card'
import type Component from '@mateu/shared/apiClients/dtos/Component'
import type { SpectraTemplate } from '@/oj/types'

/**
 * Card → a Redwood card surface (NO vaadin-card). The card's parts (title/subtitle/media/header/
 * content/footer) are nested `Component`s inside the metadata, each rendered via the shared
 * renderer; the surface comes from index.css tokens. `component.style` is passed through so a Card
 * laid out with `flex:1; min-width:…` inside a HorizontalLayout keeps sizing.
 */
export const cardTemplate: SpectraTemplate = {
  loaders: [],
  render(ctx) {
    const m = ctx.component.metadata as CardMeta
    const r = (c: Component | undefined | null) => (c ? ctx.renderChild(c) : nothing)
    return html`<div
      class="mateu-rw-card ${ctx.component.cssClasses || ''}"
      style=${ctx.component.style || nothing}
    >
      ${m.header ? html`<div class="rw-card-header">${r(m.header)}</div>` : nothing}
      ${m.title ? html`<div class="rw-card-title">${r(m.title)}</div>` : nothing}
      ${m.subtitle ? html`<div class="rw-card-subtitle">${r(m.subtitle)}</div>` : nothing}
      ${r(m.media)}
      ${m.content ? html`<div class="rw-card-content">${r(m.content)}</div>` : nothing}
      ${m.footer ? html`<div class="rw-card-footer">${r(m.footer)}</div>` : nothing}
    </div>`
  },
}
