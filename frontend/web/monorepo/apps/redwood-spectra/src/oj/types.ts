import type { TemplateResult } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import type Component from '@mateu/shared/apiClients/dtos/Component'

/** Local, framework-neutral aliases (no dependency on the shared Vaadin-coupled ui layer). */
export type ComponentState = Record<string, unknown>
export type ComponentData = Record<string, unknown>

/** Everything a Spectra template needs to map the Mateu wire component to an oj-sp element. */
export interface SpectraRenderContext {
  /** The nearest stateful host element (an <rw-host>/<rw-root>) rendering this component. */
  host: HTMLElement
  component: ClientSideComponent
  baseUrl: string | undefined
  state: ComponentState
  data: ComponentData
  appState: ComponentState
  appData: ComponentData
  /** Render a Mateu child component (recurses through the native render tree — never Vaadin). */
  renderChild: (child: Component) => TemplateResult
}

/**
 * A Redwood page template = the oj-sp loader(s) its element(s) need + a PURE mapping from the Mateu
 * wire component to that element's props/attrs/slots. The oj-sp component (or plain HTML + Redwood
 * tokens) does the painting; porting a screen is a data entry, not renderer code.
 */
export interface SpectraTemplate {
  loaders: string[]
  render: (ctx: SpectraRenderContext) => TemplateResult
}
