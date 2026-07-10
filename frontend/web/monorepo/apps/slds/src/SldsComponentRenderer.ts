import { LitElement, html, type TemplateResult } from 'lit';
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType.ts'
import { MateuComponent } from '@infra/ui/mateu-component.ts'
import { renderApp } from './renderers/renderApp.ts'
import {
    renderSldsButton, renderSldsText, renderSldsFormLayout, renderSldsForm, renderSldsFormSection,
    renderSldsTable, renderSldsHorizontalLayout, renderSldsVerticalLayout, renderSldsSplitLayout,
    renderSldsCard, renderSldsBadge, renderSldsProgressBar, renderSldsAnchor,
    renderSldsDialog, renderSldsConfirmDialog, renderSldsPagination,
} from './renderers/sldsRenderers.ts'
import './components/mateu-slds-field.ts'
import './components/mateu-slds-tabs.ts'
import './components/mateu-slds-accordion.ts'

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

        if (ComponentMetadataType.Form == type) {
            return renderSldsForm(container, component!, baseUrl, state, data, appState, appData)
        }

        if (ComponentMetadataType.FormSection == type) {
            return renderSldsFormSection(container, component!, baseUrl, state, data, appState, appData)
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

        if (ComponentMetadataType.TabLayout == type) {
            return html`<mateu-slds-tabs
                    .component="${component}" .container="${container}" baseUrl="${baseUrl}"
                    .compState="${state}" .compData="${data}" .appState="${appState}" .appData="${appData}"
            ></mateu-slds-tabs>`
        }

        if (ComponentMetadataType.AccordionLayout == type) {
            return html`<mateu-slds-accordion
                    .component="${component}" .container="${container}" baseUrl="${baseUrl}"
                    .compState="${state}" .compData="${data}" .appState="${appState}" .appData="${appData}"
            ></mateu-slds-accordion>`
        }

        if (ComponentMetadataType.HorizontalLayout == type) {
            return renderSldsHorizontalLayout(container, component!, baseUrl, state, data, appState, appData)
        }

        if (ComponentMetadataType.VerticalLayout == type) {
            return renderSldsVerticalLayout(container, component!, baseUrl, state, data, appState, appData)
        }

        if (ComponentMetadataType.SplitLayout == type) {
            return renderSldsSplitLayout(container, component!, baseUrl, state, data, appState, appData)
        }

        if (ComponentMetadataType.Card == type) {
            return renderSldsCard(container, component!, baseUrl, state, data, appState, appData)
        }

        if (ComponentMetadataType.Badge == type) {
            return renderSldsBadge(component!)
        }

        if (ComponentMetadataType.ProgressBar == type) {
            return renderSldsProgressBar(component!, state)
        }

        if (ComponentMetadataType.Anchor == type) {
            return renderSldsAnchor(component!)
        }

        if (ComponentMetadataType.Dialog == type) {
            return renderSldsDialog(container, component!, baseUrl, state, data, appState, appData)
        }

        if (ComponentMetadataType.ConfirmDialog == type) {
            return renderSldsConfirmDialog(container, component!, baseUrl, state, data, appState, appData)
        }

        return super.renderClientSideComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
    }

    // CRUD surface: render the listing as an SLDS data table.
    renderTableComponent(container: any, component: ClientSideComponent | undefined, _baseUrl: string | undefined, _state: any, _data: any, _appState: any, _appData: any): TemplateResult {
        return renderSldsTable(container, component!)
    }

    renderFilterBar(container: any, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any, searchOnly?: boolean): TemplateResult {
        // Use the shared design-system-neutral <mateu-filter-bar> (full smart-search UI) instead of
        // the SLDS-local one, which rendered each filter as a bare text input.
        return super.renderFilterBar(container, component, baseUrl, state, data, appState, appData, searchOnly)
    }

    renderPagination(container: any, component: ClientSideComponent | undefined): TemplateResult {
        return renderSldsPagination(container, component)
    }

}
