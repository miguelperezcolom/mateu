import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent"
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import { renderButton } from "@/renderers/renderButton.ts";
import { renderField } from "@/renderers/renderField.ts";
import { renderApp } from "@/renderers/renderApp.ts";
import { MateuApp } from "@infra/ui/mateu-app.ts";
import { renderForm } from "@/renderers/renderForm.ts";
import { renderPage } from "@/renderers/renderPage.ts";
import {
    renderFormLayout, renderFormRow, renderFormSection, renderFormSubSection,
    renderHorizontalLayout, renderVerticalLayout, renderSplitLayout, renderCard,
    renderText, renderBadge, renderAnchor, renderDialog, renderConfirmDialog,
} from "@/renderers/renderLayouts.ts";
import './components/mateu-redwood-tabs'
import './components/mateu-redwood-accordion'
import { MateuTableCrud } from "@infra/ui/mateu-table-crud.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud.ts";
import './components/mateu-redwood-table'
import './components/mateu-redwood-pagination'
import './components/mateu-redwood-action-menu'

export const changed = (event: Event, fieldId: string) => {
    const element = event.target as HTMLInputElement
    event.target?.dispatchEvent(new CustomEvent('value-changed', {
        detail: {
            value: element.value,
            fieldId
        },
        bubbles: true,
        composed: true
    }))
}

export const handleButtonClick = (event: Event) => {
    const actionId = (event.target as HTMLElement).dataset.actionId
    event.target?.dispatchEvent(new CustomEvent('action-requested', {
        detail: {
            actionId,
        },
        bubbles: true,
        composed: true
    }))
}

export class RedwoodOjComponentRenderer extends BasicComponentRenderer implements ComponentRenderer {

    renderFilterBar(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult {
        const metadata = component?.metadata as Crud
        const doSearch = () => {
            const root = (container as any).renderRoot as (ShadowRoot | HTMLElement) ?? container
            const input = root.querySelector('oj-c-input-text') as any
            if (input) state['searchText'] = input.rawValue ?? input.value ?? state['searchText'] ?? ''
            container.search()
        }
        return html`
            <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; padding: 0.25rem 0;">
                ${metadata?.searchable ? html`
                    <oj-c-input-text
                        data-oj-binding-provider="preact"
                        label-hint="Search"
                        label-edge="none"
                        .value="${state.searchText ?? ''}"
                        @ojValueAction="${(e: CustomEvent) => { state['searchText'] = e.detail.value ?? '' }}"
                        style="min-width: 220px;"
                    ></oj-c-input-text>
                    <oj-c-button
                        data-oj-binding-provider="preact"
                        label="Search"
                        chroming="callToAction"
                        @ojAction="${doSearch}"
                    ></oj-c-button>
                ` : nothing}
                ${metadata?.toolbar?.map(btn => btn.children?.length > 0 ? html`
                    ${btn.separatorBefore ? html`<span style="border-left: 1px solid var(--oj-core-text-color-secondary, #888); height: 1.5rem; display: inline-block; align-self: center;"></span>` : nothing}
                    <oj-c-menu-button
                        data-oj-binding-provider="preact"
                        label="${btn.label}"
                        .items="${btn.children.map((child: any) => ({ key: child.actionId, label: child.label, disabled: child.disabled ?? false }))}"
                        @ojMenuAction="${(e: CustomEvent) => container.dispatchEvent(new CustomEvent('action-requested', {
                            detail: { actionId: e.detail.key },
                            bubbles: true, composed: true
                        }))}"
                    ></oj-c-menu-button>
                ` : html`
                    ${btn.separatorBefore ? html`<span style="border-left: 1px solid var(--oj-core-text-color-secondary, #888); height: 1.5rem; display: inline-block; align-self: center;"></span>` : nothing}
                    <oj-c-button
                        data-oj-binding-provider="preact"
                        label="${btn.label}"
                        chroming="outlined"
                        ?disabled="${btn.disabled}"
                        @ojAction="${() => container.dispatchEvent(new CustomEvent('action-requested', {
                            detail: { actionId: btn.actionId },
                            bubbles: true, composed: true
                        }))}"
                    ></oj-c-button>
                `)}
                ${metadata?.header?.map(comp => renderComponent(container, comp, baseUrl, state, data, appState, appData))}
            </div>
        `
    }

    renderPagination(container: MateuTableCrud, _component: ClientSideComponent | undefined): TemplateResult {
        const id = container.id
        return html`
            <mateu-redwood-pagination
                data-oj-binding-provider="preact"
                @page-changed="${container.pageChanged}"
                @fetch-more-elements="${container.fetchMoreElements}"
                totalElements="${(container.data[id]?.page?.totalElements) ?? 0}"
                pageSize="${(container.data[id]?.page?.pageSize) ?? 100}"
                pageNumber="${(container.data[id]?.page?.pageNumber) ?? 0}"
            ></mateu-redwood-pagination>
        `
    }

    renderTableComponent(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, _data: any, _appState: any, _appData: any): TemplateResult {
        return html`
        <mateu-redwood-table id="${container.id}"
                     .metadata="${component?.metadata}"
                     .data="${container.data}"
                     .emptyStateMessage="${state[component?.id!]?.emptyStateMessage}"
                     @sort-direction-changed="${container.directionChanged}"
                     @fetch-more-elements="${container.fetchMoreElements}"
                     .state="${state}"
                     baseUrl="${baseUrl}"
        ></mateu-redwood-table>
        `
    }

    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any, labelAlreadyRendered: boolean | undefined): TemplateResult {
        if (ComponentMetadataType.Page == component?.metadata?.type) {
            return renderPage(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Form == component?.metadata?.type) {
            return renderForm(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Button == component?.metadata?.type) {
            return renderButton(component, baseUrl, state, data)
        }
        if (ComponentMetadataType.FormField == component?.metadata?.type) {
            return renderField(component, baseUrl, state, data)
        }
        if (ComponentMetadataType.FormLayout == component?.metadata?.type) {
            return renderFormLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.FormRow == component?.metadata?.type) {
            return renderFormRow(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.FormSection == component?.metadata?.type) {
            return renderFormSection(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.FormSubSection == component?.metadata?.type) {
            return renderFormSubSection(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.HorizontalLayout == component?.metadata?.type) {
            return renderHorizontalLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.VerticalLayout == component?.metadata?.type) {
            return renderVerticalLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.SplitLayout == component?.metadata?.type) {
            return renderSplitLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Card == component?.metadata?.type) {
            return renderCard(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Text == component?.metadata?.type) {
            return renderText(container, component)
        }
        if (ComponentMetadataType.Badge == component?.metadata?.type) {
            return renderBadge(component)
        }
        if (ComponentMetadataType.Anchor == component?.metadata?.type) {
            return renderAnchor(component)
        }
        if (ComponentMetadataType.TabLayout == component?.metadata?.type) {
            return html`<mateu-redwood-tabs
                    .component="${component}" .container="${container}" baseUrl="${baseUrl}"
                    .compState="${state}" .compData="${data}" .appState="${appState}" .appData="${appData}"
            ></mateu-redwood-tabs>`
        }
        if (ComponentMetadataType.AccordionLayout == component?.metadata?.type) {
            return html`<mateu-redwood-accordion
                    .component="${component}" .container="${container}" baseUrl="${baseUrl}"
                    .compState="${state}" .compData="${data}" .appState="${appState}" .appData="${appData}"
            ></mateu-redwood-accordion>`
        }
        if (ComponentMetadataType.Dialog == component?.metadata?.type) {
            return renderDialog(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.ConfirmDialog == component?.metadata?.type) {
            return renderConfirmDialog(container, component, baseUrl, state, data, appState, appData)
        }
        return super.renderClientSideComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
    }

    renderAppComponent(container: MateuApp, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult {
        return renderApp(container, component!, baseUrl, state, data, appState, appData)
    }
}
