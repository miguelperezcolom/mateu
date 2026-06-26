import { LitElement, html, type TemplateResult } from 'lit';
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType.ts'
import { MateuComponent } from '@infra/ui/mateu-component.ts'
import { renderApp } from './renderers/renderApp.ts'
import { renderSldsButton, renderSldsText, renderSldsFormLayout } from './renderers/sldsRenderers.ts'
import './components/mateu-slds-field.ts'

/**
 * Mateu renderer for the Salesforce Lightning Design System 2 (SLDS 2).
 *
 * SLDS 2 ships as a global CSS framework (slds-* BEM classes + --slds styling hooks, Cosmos theme),
 * not as web components, so this renderer emits its own markup carrying SLDS classes and runs in the
 * light DOM (see index.ts setUseShadowRoot(false)) so the global stylesheet reaches it.
 *
 * Component types are migrated to SLDS markup incrementally; anything not yet overridden falls back
 * to the shared BasicComponentRenderer.
 */
export class SldsComponentRenderer extends BasicComponentRenderer implements ComponentRenderer {

    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any, labelAlreadyRendered: boolean | undefined): TemplateResult {
        const type = component?.metadata?.type

        if (ComponentMetadataType.App == type) {
            return renderApp(container as MateuComponent, component!, baseUrl, state, data)
        }

        if (ComponentMetadataType.FormField == type) {
            return html`
                <mateu-slds-field
                        id="${component!.id}"
                        .component="${component}"
                        .field="${component!.metadata}"
                        .state="${state}"
                        .data="${data}"
                        .labelAlreadyRendered="${labelAlreadyRendered}"
                        data-colspan="${(component!.metadata as any).colspan}"
                ></mateu-slds-field>`
        }

        if (ComponentMetadataType.FormLayout == type) {
            return renderSldsFormLayout(container, component!, baseUrl, state, data, appState, appData)
        }

        if (ComponentMetadataType.Button == type) {
            return renderSldsButton(component!, state, data)
        }

        if (ComponentMetadataType.Text == type) {
            return renderSldsText(component!, state, data)
        }

        return super.renderClientSideComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
    }

}
