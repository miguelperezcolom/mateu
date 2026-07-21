import { html, nothing, type TemplateResult } from 'lit'
import type EntityHeaderMeta from '@mateu/shared/apiClients/dtos/componentmetadata/EntityHeader'
import type Chip from '@mateu/shared/apiClients/dtos/componentmetadata/Chip'
import type { SpectraTemplate } from '@/oj/types'

/**
 * EntityHeader → the Redwood object/record header used by the General Overview template.
 *
 * All content is in `metadata` (title/subtitle/badges/facts/metric — no children), so this renders
 * it directly as a Redwood header card: title + subtitle + badge chips on the left, the metric on
 * the right, and the facts as a key/value band below. Styled with the Redwood tokens (see
 * index.css), the same CSS-surface approach used for the dashboard cards.
 */
export const entityHeaderTemplate: SpectraTemplate = {
  loaders: [],
  render(ctx) {
    const m = ctx.component.metadata as EntityHeaderMeta
    const badges = m.badges ?? []
    const facts = m.facts ?? []
    return html`
      <div class="mateu-rw-entity-header">
        <div class="rw-eh-top">
          <div class="rw-eh-titles">
            <h1 class="rw-eh-title">${m.title ?? ''}</h1>
            ${m.subtitle ? html`<div class="rw-eh-subtitle">${m.subtitle}</div>` : nothing}
            ${badges.length
              ? html`<div class="rw-eh-badges">${badges.map((b) => chip(b))}</div>`
              : nothing}
          </div>
          ${m.metricValue
            ? html`<div class="rw-eh-metric">
                <div class="rw-eh-metric-value">${m.metricValue}</div>
                ${m.metricLabel ? html`<div class="rw-eh-metric-label">${m.metricLabel}</div>` : nothing}
                ${m.metricCaption
                  ? html`<div class="rw-eh-metric-caption">${m.metricCaption}</div>`
                  : nothing}
              </div>`
            : nothing}
        </div>
        ${facts.length
          ? html`<div class="rw-eh-facts">
              ${facts.map(
                (f) => html`<div class="rw-eh-fact">
                  <div class="rw-eh-fact-label">${f.label ?? ''}</div>
                  <div class="rw-eh-fact-value">${f.value ?? ''}</div>
                </div>`,
              )}
            </div>`
          : nothing}
      </div>
    `
  },
}

/** A status chip; color maps to a Redwood-tinted pill (see .rw-eh-chip--* in index.css). */
function chip(b: Chip): TemplateResult {
  const color = b.color || 'neutral'
  return html`<span class="rw-eh-chip rw-eh-chip--${color}">${b.label ?? ''}</span>`
}
