import { LitElement, type TemplateResult } from 'lit';
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'

/**
 * Mateu renderer for the Salesforce Lightning Design System 2 (SLDS 2).
 *
 * SLDS 2 ships as a global CSS framework (slds-* BEM classes + --slds styling hooks, Cosmos theme),
 * not as web components, so this renderer emits its own markup carrying SLDS classes and runs in the
 * light DOM (see index.ts setUseShadowRoot(false)) so the global stylesheet reaches it.
 *
 * Work in progress: component types are being migrated to SLDS markup incrementally; anything not
 * yet overridden falls back to the shared BasicComponentRenderer.
 */
export class SldsComponentRenderer extends BasicComponentRenderer implements ComponentRenderer {

    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any, labelAlreadyRendered: boolean | undefined): TemplateResult {
        return super.renderClientSideComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
    }

}
