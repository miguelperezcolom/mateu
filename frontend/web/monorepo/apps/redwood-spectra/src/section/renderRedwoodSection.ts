import { html, nothing, type LitElement, type TemplateResult } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import type FormSection from '@mateu/shared/apiClients/dtos/componentmetadata/FormSection'
import type { ComponentState, ComponentData } from '@infra/ui/renderers/types'
import { renderComponent } from '@infra/ui/renderers/renderComponent'
import { ojElement } from '../oj/ojDriver'

/**
 * Mateu `FormSection` → the authentic Oracle Spectra `oj-sp-section`.
 *
 * Wire (FormSection DTO): title, subtitle, icon, status, badges, banners, toolbar[] — plus the
 * section BODY as `component.children`. oj-sp-section props (CDN): sectionTitle, level
 * (section|subsection), displayOptions/primaryAction/navigationActions; default (unnamed) slot holds
 * the body. We map sectionTitle + the body children (matching the neutral renderer, which likewise
 * renders only title + children). The toolbar/badges/banners map to oj-sp-section's
 * primaryAction/navigationActions — deferred until the VB docs pin those shapes (no guessing).
 */
export function renderRedwoodSection(
  container: LitElement,
  component: ClientSideComponent,
  baseUrl: string | undefined,
  state: ComponentState,
  data: ComponentData,
  appState: ComponentState,
  appData: ComponentData,
): TemplateResult {
  const m = component.metadata as FormSection
  const rawTitle = m.title ?? ''
  const title = rawTitle.includes('${')
    ? (container as unknown as { _evalTemplate: (s: string) => string })._evalTemplate(rawTitle)
    : rawTitle

  const body = component.children?.length
    ? html`${component.children.map((child) => renderComponent(container, child, baseUrl, state, data, appState, appData))}`
    : nothing

  return ojElement('oj-sp-section', {
    props: {
      sectionTitle: title,
      level: 'section',
    },
    attrs: {
      slot: component.slot || undefined,
      class: component.cssClasses || undefined,
      style: component.style || undefined,
    },
    children: body,
  })
}
