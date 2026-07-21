import type { LitElement, TemplateResult } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import type Component from '@mateu/shared/apiClients/dtos/Component'
import type { ComponentState, ComponentData } from '@infra/ui/renderers/types.ts'

/** Everything a Spectra page template needs to map the Mateu wire component to an oj-sp element. */
export interface SpectraRenderContext {
  container: LitElement
  component: ClientSideComponent
  baseUrl: string | undefined
  state: ComponentState
  data: ComponentData
  appState: ComponentState
  appData: ComponentData
  /** Render a Mateu child component with the shared base renderer (for slot content). */
  renderChild: (child: Component) => TemplateResult
}

/**
 * A Redwood page template = the oj-sp loader(s) its element(s) need + a PURE mapping from the Mateu
 * wire component to that element's props/attrs/slots. There is no bespoke markup beyond the mapping:
 * the oj-sp component does the painting, exactly like a VisualBuilder page just feeds its variables
 * to `<oj-sp-…>`. Porting a screen therefore means adding one data entry, not new renderer code.
 */
export interface SpectraTemplate {
  loaders: string[]
  render: (ctx: SpectraRenderContext) => TemplateResult
}
