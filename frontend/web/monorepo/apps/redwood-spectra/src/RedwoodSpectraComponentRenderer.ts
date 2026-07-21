import { type LitElement, type TemplateResult } from 'lit'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { ComponentState, ComponentData } from '@infra/ui/renderers/types.ts'
import { renderComponent } from '@infra/ui/renderers/renderComponent.ts'
import { resolveSpectraTemplate } from '@/oj/spectraTemplates'

/**
 * The Redwood Spectra renderer. It defers to the shared {@link BasicComponentRenderer} for any wire
 * type not yet ported; for a type that has a Spectra page template (see src/oj/), it delegates to
 * that template — a PURE mapping from the Mateu wire component to an Oracle JET/Spectra element's
 * props/attrs/slots. So porting a screen is a data entry in the template registry, not bespoke
 * markup here: we describe the JSON we feed oj-sp, the oj-sp component does the painting.
 */
export class RedwoodSpectraComponentRenderer extends BasicComponentRenderer {

  renderClientSideComponent(
    container: LitElement,
    component: ClientSideComponent | undefined,
    baseUrl: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData,
    labelAlreadyRendered: boolean | undefined,
  ): TemplateResult {
    const template = resolveSpectraTemplate((component?.metadata as { type?: string } | undefined)?.type)
    if (template && component) {
      return template.render({
        container,
        component,
        baseUrl,
        state,
        data,
        appState,
        appData,
        renderChild: (child) => renderComponent(container, child, baseUrl, state, data, appState, appData),
      })
    }
    return super.renderClientSideComponent(
      container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered,
    )
  }
}
