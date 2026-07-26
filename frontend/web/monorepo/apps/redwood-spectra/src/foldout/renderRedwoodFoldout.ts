import { html, nothing, type LitElement, type TemplateResult } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import type { ComponentState, ComponentData } from '@infra/ui/renderers/types'
import { renderComponent } from '@infra/ui/renderers/renderComponent'
import { ojElement } from '@/oj/ojDriver'

interface FoldoutPanelInfo {
  title?: string
  subtitle?: string
  open?: boolean
}
interface FoldoutLayoutMeta {
  orientation?: string
  panels?: FoldoutPanelInfo[]
}

/**
 * Foldout page → Oracle Spectra `<oj-sp-foldout-layout>` (adapted from the clean-room template).
 * The wire carries the chrome in metadata (panels title/subtitle/open + orientation); the content
 * travels as `component.children`, each tagged with a `slot` ("overview" and "panel-i" per index i).
 * We drop the overview into the layout's overview slot and each panel-i child into the i-th
 * `<oj-sp-foldout-panel-summarizing>` (its subtitle = the fold summary). Wrapping each child in a
 * plain <div slot=…> neutralises the child's own `mateu-foldout` slot tag so the div places it.
 */
export function renderFoldout(
  container: LitElement,
  component: ClientSideComponent,
  baseUrl: string | undefined,
  state: ComponentState,
  data: ComponentData,
  appState: ComponentState,
  appData: ComponentData,
): TemplateResult {
  const m = component.metadata as unknown as FoldoutLayoutMeta
  const children = (component.children ?? []) as ClientSideComponent[]
  const overview = children.find((c) => c.slot === 'overview')
  const panels = m.panels ?? []
  const child = (c: ClientSideComponent | undefined) =>
    c ? renderComponent(container, c, baseUrl, state, data, appState, appData) : nothing

  // Spectra's foldout shows the overview + all panels (no per-panel collapsed strip); the faithful
  // mapping of `open` is the initially active panel = the first one left open.
  const firstOpen = panels.findIndex((p) => p.open !== false)

  return ojElement('oj-sp-foldout-layout', {
    props: {
      orientation: m.orientation === 'horizontal' ? 'horizontal' : 'vertical',
      selectedPanel: firstOpen >= 0 ? firstOpen : 0,
    },
    attrs: {
      class: component.cssClasses || undefined,
      // The Spectra foldout lays its lateral panels out within its own height, so it needs a defined
      // one — without it (inside our flow-height page container) the panels collapse to nothing.
      style: `min-height: 32rem; ${component.style || ''}`,
    },
    children: html`
      ${overview ? html`<div slot="overview">${child(overview)}</div>` : nothing}
      ${panels.map((panel, i) =>
        ojElement('oj-sp-foldout-panel-summarizing', {
          props: { panelTitle: panel.title ?? '' },
          children: html`
            <div>${child(children.find((c) => c.slot === `panel-${i}`))}</div>
            ${panel.subtitle ? html`<div slot="summary">${panel.subtitle}</div>` : nothing}
          `,
        }),
      )}
    `,
  })
}
