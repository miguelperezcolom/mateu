import { html, nothing, type LitElement, type TemplateResult } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import type Tab from '@mateu/shared/apiClients/dtos/componentmetadata/Tab'
import type { ComponentState, ComponentData } from '@infra/ui/renderers/types'
import { renderComponent } from '@infra/ui/renderers/renderComponent'
import './mateu-spectra-tabs' // registers <mateu-spectra-tabs>

/**
 * Mateu `TabLayout` → the authentic `oj-c-tab-bar`-based `mateu-spectra-tabs`. Each child is a Tab
 * (its metadata carries the label + active flag; its own children are the panel content). We hand the
 * labels + pre-rendered panels to the stateful tabs element.
 */
export function renderRedwoodTabs(
  container: LitElement,
  component: ClientSideComponent,
  baseUrl: string | undefined,
  state: ComponentState,
  data: ComponentData,
  appState: ComponentState,
  appData: ComponentData,
): TemplateResult {
  const children = (component.children ?? []) as ClientSideComponent[]
  const evalTpl = (s: string) =>
    s.includes('${') ? (container as unknown as { _evalTemplate: (x: string) => string })._evalTemplate(s) : s
  const labels = children.map((c) => evalTpl((c.metadata as Tab).label ?? ''))
  const activeIndex = Math.max(0, children.findIndex((c) => (c.metadata as Tab).active))
  const panels = children.map(
    (c) => html`${c.children?.map((gc) => renderComponent(container, gc, baseUrl, state, data, appState, appData))}`,
  )

  return html`<div
    slot="${component.slot ?? nothing}"
    class="${component.cssClasses ?? nothing}"
    style="${component.style ?? ''}"
  >
    <mateu-spectra-tabs .labels=${labels} .panels=${panels} .initialIndex=${activeIndex}></mateu-spectra-tabs>
  </div>`
}
