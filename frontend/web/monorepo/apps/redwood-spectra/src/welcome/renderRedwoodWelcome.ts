import { html, nothing, type LitElement, type TemplateResult } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import type { ComponentState, ComponentData } from '@infra/ui/renderers/types'
import { renderComponent } from '@infra/ui/renderers/renderComponent'
import { ojElement } from '@/oj/ojDriver'

interface HeroSectionMeta {
  title?: string
  subtitle?: string
  image?: string
}

/**
 * Welcome / HeroSection → Oracle Spectra `<oj-sp-welcome-page>` (adapted from the clean-room
 * template). Title + subtitle bind by PROPERTY (`pageTitle` / `descriptionText` — the latter is what
 * the inner welcome banner renders). Responsive padding is a dotted `display-options.*` attribute.
 * The section's children (CTA buttons) are slotted into the default content region, each rendered by
 * the shared core renderer.
 */
export function renderWelcome(
  container: LitElement,
  component: ClientSideComponent,
  baseUrl: string | undefined,
  state: ComponentState,
  data: ComponentData,
  appState: ComponentState,
  appData: ComponentData,
): TemplateResult {
  const m = component.metadata as unknown as HeroSectionMeta
  const children = (component.children ?? []) as ClientSideComponent[]
  return ojElement('oj-sp-welcome-page', {
    props: {
      pageTitle: m.title ?? '',
      descriptionText: m.subtitle ?? '',
      illustrationBackground: m.image ?? undefined,
    },
    attrs: {
      'display-options.responsive-padding': 'on',
      class: component.cssClasses || undefined,
      style: component.style || undefined,
    },
    children: children.length
      ? html`<div class="oj-flex oj-sm-flex-wrap oj-sm-align-items-center" style="gap: 0.75rem;">
          ${children.map((c) => renderComponent(container, c, baseUrl, state, data, appState, appData))}
        </div>`
      : nothing,
  })
}
