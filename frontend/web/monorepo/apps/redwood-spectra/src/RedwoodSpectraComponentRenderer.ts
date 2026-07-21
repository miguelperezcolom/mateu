import { html, LitElement, nothing, type TemplateResult } from 'lit'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import HeroSection from '@mateu/shared/apiClients/dtos/componentmetadata/HeroSection'
import { ComponentState, ComponentData } from '@infra/ui/renderers/types.ts'
import { renderComponent } from '@infra/ui/renderers/renderComponent.ts'

/**
 * The Redwood Spectra renderer. Defers to the shared {@link BasicComponentRenderer} for anything
 * not yet ported, and overrides one wire type at a time to draw it with the Oracle JET / Spectra
 * components (oj-c-* / oj-sp-*) loaded from Oracle's CDN — building the Redwood look up incrementally.
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
    if ((component?.metadata as { type?: string } | undefined)?.type === ComponentMetadataType.HeroSection) {
      return this.renderWelcomePage(container, component!, baseUrl, state, data, appState, appData)
    }
    return super.renderClientSideComponent(
      container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered,
    )
  }

  /**
   * A HeroSection rendered as the Oracle Spectra Welcome page template: page-title / description /
   * illustration on the component, with any CTAs slotted into the default (main) slot.
   */
  private renderWelcomePage(
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData,
  ): TemplateResult {
    const m = component.metadata as HeroSection
    // Bind by PROPERTY (Lit `.prop`), not attribute: an Oracle JET custom element resolves its
    // props off the JS property after upgrade, and a Lit-set attribute can land before that and be
    // missed (page-title happened to reflect, description did not). Property bindings are assigned
    // straight to the upgraded element, so they always take.
    return html`
      <oj-sp-welcome-page
          .pageTitle="${m.title ?? ''}"
          .descriptionText="${m.subtitle ?? ''}"
          .illustrationBackground="${m.image ?? nothing}"
          display-options.responsive-padding="on"
          class="${component.cssClasses ?? ''}"
          style="${component.style ?? ''}"
      >
        ${component.children?.length ? html`
          <div class="oj-flex oj-sm-flex-wrap oj-sm-align-items-center" style="gap: .75rem;">
            ${component.children.map(child =>
              renderComponent(container, child, baseUrl, state, data, appState, appData))}
          </div>
        ` : nothing}
      </oj-sp-welcome-page>
    `
  }
}
