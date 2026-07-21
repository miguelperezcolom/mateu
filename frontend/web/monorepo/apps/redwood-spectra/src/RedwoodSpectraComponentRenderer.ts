import { type LitElement, type TemplateResult } from 'lit'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { ComponentState, ComponentData } from '@infra/ui/renderers/types.ts'
import { renderComponent } from '@infra/ui/renderers/renderComponent.ts'
import { resolveSpectraTemplate } from '@/oj/spectraTemplates'

/**
 * The Redwood Spectra renderer.
 *
 * NORM — NO VAADIN. This renderer must render everything with what VisualBuilder gives us: Oracle
 * JET / Spectra components (oj-sp-* / oj-c-*) or plain HTML + Redwood tokens. It must NEVER emit a
 * `vaadin-*` element. The shared {@link BasicComponentRenderer} is Vaadin-based, so falling through
 * to `super` VIOLATES the norm — every wire type a screen uses must have a Spectra template in the
 * registry (see src/oj/). The `super` fallback is only a transitional safety net while we cover the
 * remaining types; in dev it logs each type that falls through so the gaps are visible and get
 * closed. Each template is a PURE mapping from the Mateu wire component to Spectra/HTML — porting a
 * screen is a data entry in the registry, not bespoke markup here.
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
    const type = (component?.metadata as { type?: string } | undefined)?.type
    const template = resolveSpectraTemplate(type)
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
    warnVaadinFallthrough(type)
    return super.renderClientSideComponent(
      container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered,
    )
  }
}

/** Dev-only: flag each wire type that still falls through to the Vaadin base renderer (once each),
 *  so the no-Vaadin norm is enforced by making the gaps visible. */
const warnedTypes = new Set<string>()
function warnVaadinFallthrough(type: string | undefined): void {
  if (!(import.meta as { env?: { DEV?: boolean } }).env?.DEV) return
  const key = type ?? '(no type)'
  if (warnedTypes.has(key)) return
  warnedTypes.add(key)
  // eslint-disable-next-line no-console
  console.warn(
    `[redwood-spectra] NO-VAADIN norm: wire type "${key}" has no Spectra template and fell back to ` +
      `the Vaadin base renderer. Add a template in src/oj/ to cover it.`,
  )
}
