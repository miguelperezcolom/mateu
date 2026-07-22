import { html, nothing, type LitElement, type TemplateResult } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import type Component from '@mateu/shared/apiClients/dtos/Component'
import type { ComponentState, ComponentData } from '@infra/ui/renderers/types'
import { renderComponent } from '@infra/ui/renderers/renderComponent'

/**
 * General Overview surfaces → Redwood-styled header + card (adapted from the clean-room templates to
 * the widget-map signature). There is no simple oj-sp LEAF for an entity header / card, so these are
 * rendered as Redwood token-styled surfaces (see the .mateu-rw-* / .rw-eh-* / .rw-card-* rules in
 * index.css) — the same CSS-surface approach the dashboard band uses.
 */

interface ChipMeta { label?: string; color?: string }
interface FactMeta { label?: string; value?: string }
interface EntityHeaderMeta {
  title?: string
  subtitle?: string
  badges?: ChipMeta[]
  facts?: FactMeta[]
  metricValue?: string
  metricLabel?: string
  metricCaption?: string
}

/** EntityHeader → the Redwood object/record header (all content in metadata, no children). */
export function renderEntityHeader(_container: LitElement, component: ClientSideComponent): TemplateResult {
  const m = component.metadata as unknown as EntityHeaderMeta
  const badges = m.badges ?? []
  const facts = m.facts ?? []
  return html`<div class="mateu-rw-entity-header">
    <div class="rw-eh-top">
      <div class="rw-eh-titles">
        <h1 class="rw-eh-title">${m.title ?? ''}</h1>
        ${m.subtitle ? html`<div class="rw-eh-subtitle">${m.subtitle}</div>` : nothing}
        ${badges.length
          ? html`<div class="rw-eh-badges">
              ${badges.map((b) => html`<span class="rw-eh-chip rw-eh-chip--${b.color || 'neutral'}">${b.label ?? ''}</span>`)}
            </div>`
          : nothing}
      </div>
      ${m.metricValue
        ? html`<div class="rw-eh-metric">
            <div class="rw-eh-metric-value">${m.metricValue}</div>
            ${m.metricLabel ? html`<div class="rw-eh-metric-label">${m.metricLabel}</div>` : nothing}
            ${m.metricCaption ? html`<div class="rw-eh-metric-caption">${m.metricCaption}</div>` : nothing}
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
  </div>`
}

interface CardMeta {
  header?: Component
  title?: Component
  subtitle?: Component
  media?: Component
  content?: Component
  footer?: Component
}

/** Card → a Redwood card surface; its parts are nested Components rendered via the shared renderer. */
export function renderCard(
  container: LitElement,
  component: ClientSideComponent,
  baseUrl: string | undefined,
  state: ComponentState,
  data: ComponentData,
  appState: ComponentState,
  appData: ComponentData,
): TemplateResult {
  const m = component.metadata as unknown as CardMeta
  const r = (c: Component | undefined | null) =>
    c ? renderComponent(container, c as unknown as ClientSideComponent, baseUrl, state, data, appState, appData) : nothing
  return html`<div class="mateu-rw-card ${component.cssClasses || ''}" style=${component.style || nothing}>
    ${m.header ? html`<div class="rw-card-header">${r(m.header)}</div>` : nothing}
    ${m.title ? html`<div class="rw-card-title">${r(m.title)}</div>` : nothing}
    ${m.subtitle ? html`<div class="rw-card-subtitle">${r(m.subtitle)}</div>` : nothing}
    ${r(m.media)}
    ${m.content ? html`<div class="rw-card-content">${r(m.content)}</div>` : nothing}
    ${m.footer ? html`<div class="rw-card-footer">${r(m.footer)}</div>` : nothing}
  </div>`
}
